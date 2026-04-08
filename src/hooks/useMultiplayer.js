/**
 * useMultiplayer.js — Moksha Patam Online Multiplayer Hook
 *
 * BUGS FIXED:
 * 🔴 Added auto-resubscribe on CLOSED/CHANNEL_ERROR (was permanent disconnect)
 * 🔴 lastTurnSeqRef now resets on roomId change (stale seq dropped all updates)
 * 🟡 channel.track() now includes playerName so presenceMap.name works
 * 🟡 Added playerName prop to hook signature
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, markDisconnected, markReconnected, writeTurnState, writeMoveLog } from '../services/roomService';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useMultiplayer({ roomId, userId, playerName = '', myPlayerIndex, enabled = true }) {
  const [roomStatus,       setRoomStatus]       = useState('waiting');
  const [roomPlayers,      setRoomPlayers]       = useState([]);
  const [remoteGameState,  setRemoteGameState]   = useState(null);
  const [presenceMap,      setPresenceMap]       = useState({});
  const [broadcastState,   setBroadcastState]    = useState(null);
  const [isConnected,      setIsConnected]       = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const channelRef          = useRef(null);
  const lastTurnSeqRef      = useRef(-1);
  const reconnectTimerRef   = useRef(null);
  const reconnectCountRef   = useRef(0);
  const mountedRef          = useRef(true);

  const isMyTurn = remoteGameState != null
    ? remoteGameState.cur === myPlayerIndex
    : false;

  // ── Reset lastTurnSeqRef when roomId changes (FIX: stale seq) ──
  useEffect(() => {
    lastTurnSeqRef.current = -1;
  }, [roomId]);

  // ── Initial data load ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !supabase || !roomId) return;
    mountedRef.current = true;

    const load = async () => {
      const [playersRes, roomRes, stateRes] = await Promise.all([
        supabase.from('room_players').select('*').eq('room_id', roomId).order('seat_index'),
        supabase.from('game_rooms').select('status').eq('id', roomId).single(),
        supabase.from('game_state').select('*').eq('room_id', roomId).maybeSingle(),
      ]);
      if (!mountedRef.current) return;
      if (playersRes.data) setRoomPlayers(playersRes.data);
      if (roomRes.data)    setRoomStatus(roomRes.data.status);
      if (stateRes.data) {
        lastTurnSeqRef.current = stateRes.data.turn_seq;
        setRemoteGameState(normalizeState(stateRes.data));
      }
    };
    load();

    return () => { mountedRef.current = false; };
  }, [enabled, roomId]);

  // ── Subscribe (with auto-reconnect) ───────────────────────────────────────
  const subscribe = useCallback(() => {
    if (!enabled || !supabase || !roomId) return;
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`room:${roomId}`, { config: { broadcast: { self: false } } })

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
          setPresenceMap(prev => ({ ...prev, [p.user_id]: { online: false, name: prev[p.user_id]?.name } }));
        });
      })

      .on('broadcast', { event: 'rolling' }, ({ payload }) => {
        setBroadcastState({ type: 'rolling', ...payload });
        setTimeout(() => setBroadcastState(null), 4000);
      })
      .on('broadcast', { event: 'dilemma_pick' }, ({ payload }) => {
        setBroadcastState({ type: 'dilemma_pick', ...payload });
        setTimeout(() => setBroadcastState(null), 2000);
      })
      .on('broadcast', { event: 'emoji_react' }, ({ payload }) => {
        setBroadcastState({ type: 'emoji_react', ...payload });
        setTimeout(() => setBroadcastState(null), 3000);
      })

      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${roomId}` },
        ({ new: row }) => {
          if (!row || !mountedRef.current) return;
          if (row.turn_seq <= lastTurnSeqRef.current) return; // stale
          lastTurnSeqRef.current = row.turn_seq;
          setRemoteGameState(normalizeState(row));
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => {
          if (!mountedRef.current) return;
          supabase.from('room_players').select('*').eq('room_id', roomId).order('seat_index')
            .then(({ data }) => { if (data && mountedRef.current) setRoomPlayers(data); });
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
        ({ new: row }) => {
          if (row?.status && mountedRef.current) setRoomStatus(row.status);
        }
      )

      .subscribe(async (status) => {
        if (!mountedRef.current) return;

        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          reconnectCountRef.current = 0;
          setReconnectAttempts(0);
          // FIX: include playerName in track so presenceMap.name works
          await channel.track({ user_id: userId, name: playerName, joined_at: Date.now() });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          // FIX: auto-reconnect instead of permanent disconnect
          setIsConnected(false);
          if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectCountRef.current += 1;
            setReconnectAttempts(reconnectCountRef.current);
            reconnectTimerRef.current = setTimeout(() => {
              if (mountedRef.current) subscribe();
            }, RECONNECT_DELAY_MS * reconnectCountRef.current);
          }
        }
      });

    channelRef.current = channel;
  }, [enabled, roomId, userId, playerName]);

  useEffect(() => {
    mountedRef.current = true;
    subscribe();
    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [subscribe]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const broadcastRolling = useCallback((pName) => {
    channelRef.current?.send({ type: 'broadcast', event: 'rolling',
      payload: { playerIndex: myPlayerIndex, playerName: pName } });
  }, [myPlayerIndex]);

  const broadcastDilemmaPick = useCallback((choice) => {
    channelRef.current?.send({ type: 'broadcast', event: 'dilemma_pick',
      payload: { playerIndex: myPlayerIndex, choice } });
  }, [myPlayerIndex]);

  const broadcastEmoji = useCallback((emoji) => {
    channelRef.current?.send({ type: 'broadcast', event: 'emoji_react',
      payload: { playerIndex: myPlayerIndex, emoji } });
  }, [myPlayerIndex]);

  const submitTurn = useCallback(async (gameState, moveLog) => {
    if (!roomId) return;
    const nextSeq = (lastTurnSeqRef.current ?? 0) + 1;
    lastTurnSeqRef.current = nextSeq;
    await writeTurnState({ roomId, turnSeq: nextSeq, gameState });
    await writeMoveLog({
      roomId, turnSeq: nextSeq, playerIndex: myPlayerIndex,
      moveType: moveLog?.moveType ?? 'roll',
      diceVal: moveLog?.diceVal, grahaIdx: moveLog?.grahaIdx,
      dilemmaPick: moveLog?.dilemmaPick, snapshot: gameState,
    });
  }, [roomId, myPlayerIndex]);

  const leaveRoom = useCallback(async () => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (channelRef.current) {
      await channelRef.current.untrack();
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    if (roomId && userId) await markDisconnected({ roomId, userId });
  }, [roomId, userId]);

  const rejoinRoom = useCallback(async () => {
    if (roomId && userId) await markReconnected({ roomId, userId });
    subscribe();
  }, [roomId, userId, subscribe]);

  return {
    roomStatus, roomPlayers, remoteGameState,
    presenceMap, broadcastState,
    isMyTurn, isConnected, reconnectAttempts,
    broadcastRolling, broadcastDilemmaPick, broadcastEmoji,
    submitTurn, leaveRoom, rejoinRoom,
  };
}

function normalizeState(row) {
  return {
    cur: row.cur, pos: row.pos, punya: row.punya, papa: row.papa,
    shieldA: row.shield_a, skipA: row.skip_a,
    win: row.win ?? null, dil: row.dil ?? null,
    usedDharma: row.used_dharma ?? [], turnSeq: row.turn_seq,
  };
}
