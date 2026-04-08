/**
 * useMultiplayer.js — Moksha Patam Online Multiplayer Hook
 * Manages Supabase Realtime subscriptions, presence, and state sync.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, markDisconnected, markReconnected, writeTurnState, writeMoveLog } from '../services/roomService';

export function useMultiplayer({ roomId, userId, myPlayerIndex, enabled = true }) {
  const [roomStatus, setRoomStatus]       = useState('waiting');
  const [roomPlayers, setRoomPlayers]     = useState([]);
  const [remoteGameState, setRemoteGameState] = useState(null);
  const [presenceMap, setPresenceMap]     = useState({});
  const [broadcastState, setBroadcastState] = useState(null); // ephemeral UI signals
  const [isConnected, setIsConnected]     = useState(true);

  const channelRef    = useRef(null);
  const lastTurnSeqRef = useRef(-1);

  // ─── computed ────────────────────────────────────────────────────────────
  const isMyTurn = remoteGameState != null
    ? remoteGameState.cur === myPlayerIndex
    : false;

  // ─── load initial room players ───────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !supabase || !roomId) return;

    supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('seat_index')
      .then(({ data }) => { if (data) setRoomPlayers(data); });

    supabase
      .from('game_rooms')
      .select('status')
      .eq('id', roomId)
      .single()
      .then(({ data }) => { if (data) setRoomStatus(data.status); });

    supabase
      .from('game_state')
      .select('*')
      .eq('room_id', roomId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          lastTurnSeqRef.current = data.turn_seq;
          setRemoteGameState(normalizeState(data));
        }
      });
  }, [enabled, roomId]);

  // ─── realtime subscriptions ──────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !supabase || !roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`, { config: { broadcast: { self: false } } })

      // ── Presence (who is online) ─────────────────────────────────────────
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const map = {};
        Object.values(state).flat().forEach(p => {
          map[p.user_id] = { online: true, name: p.name };
        });
        setPresenceMap(map);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach(p => {
          setPresenceMap(prev => ({ ...prev, [p.user_id]: { online: false } }));
        });
      })

      // ── Broadcast (ephemeral UI signals) ─────────────────────────────────
      .on('broadcast', { event: 'rolling' }, ({ payload }) => {
        setBroadcastState({ type: 'rolling', ...payload });
        setTimeout(() => setBroadcastState(null), 4000);
      })
      .on('broadcast', { event: 'dilemma_pick' }, ({ payload }) => {
        setBroadcastState({ type: 'dilemma_pick', ...payload });
        setTimeout(() => setBroadcastState(null), 2000);
      })

      // ── Postgres Changes: game_state ─────────────────────────────────────
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${roomId}` },
        ({ new: row }) => {
          if (!row) return;
          if (row.turn_seq <= lastTurnSeqRef.current) return; // stale update
          lastTurnSeqRef.current = row.turn_seq;
          setRemoteGameState(normalizeState(row));
        }
      )

      // ── Postgres Changes: room_players ───────────────────────────────────
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => {
          // Reload full player list on any change
          supabase
            .from('room_players')
            .select('*')
            .eq('room_id', roomId)
            .order('seat_index')
            .then(({ data }) => { if (data) setRoomPlayers(data); });
        }
      )

      // ── Postgres Changes: game_rooms (status) ────────────────────────────
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
        ({ new: row }) => {
          if (row?.status) setRoomStatus(row.status);
        }
      )

      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track presence
          await channel.track({ user_id: userId, joined_at: Date.now() });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [enabled, roomId, userId]);

  // ─── actions ─────────────────────────────────────────────────────────────

  const broadcastRolling = useCallback((playerName) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'rolling',
      payload: { playerIndex: myPlayerIndex, playerName },
    });
  }, [myPlayerIndex]);

  const broadcastDilemmaPick = useCallback((choice) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'dilemma_pick',
      payload: { playerIndex: myPlayerIndex, choice },
    });
  }, [myPlayerIndex]);

  /**
   * Submit the completed turn state to Supabase.
   * Called by the active player after all animations settle.
   */
  const submitTurn = useCallback(async (gameState, moveLog) => {
    if (!roomId) return;
    const nextSeq = (lastTurnSeqRef.current ?? 0) + 1;
    lastTurnSeqRef.current = nextSeq;

    await writeTurnState({ roomId, turnSeq: nextSeq, gameState });
    await writeMoveLog({
      roomId,
      turnSeq: nextSeq,
      playerIndex: myPlayerIndex,
      moveType: moveLog?.moveType ?? 'roll',
      diceVal: moveLog?.diceVal,
      grahaIdx: moveLog?.grahaIdx,
      dilemmaPick: moveLog?.dilemmaPick,
      snapshot: gameState,
    });
  }, [roomId, myPlayerIndex]);

  const leaveRoom = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.untrack();
      channelRef.current.unsubscribe();
    }
    if (roomId && userId) {
      await markDisconnected({ roomId, userId });
    }
  }, [roomId, userId]);

  const rejoinRoom = useCallback(async () => {
    if (roomId && userId) {
      await markReconnected({ roomId, userId });
    }
  }, [roomId, userId]);

  return {
    roomStatus,
    roomPlayers,
    remoteGameState,
    presenceMap,
    broadcastState,
    isMyTurn,
    isConnected,
    broadcastRolling,
    broadcastDilemmaPick,
    submitTurn,
    leaveRoom,
    rejoinRoom,
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Normalize DB column names (snake_case) to camelCase game state shape */
function normalizeState(row) {
  return {
    cur:        row.cur,
    pos:        row.pos,
    punya:      row.punya,
    papa:       row.papa,
    shieldA:    row.shield_a,
    skipA:      row.skip_a,
    win:        row.win ?? null,
    dil:        row.dil ?? null,
    usedDharma: row.used_dharma ?? [],
    turnSeq:    row.turn_seq,
  };
}
