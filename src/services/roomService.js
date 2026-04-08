/**
 * roomService.js — Moksha Patam Online Multiplayer
 *
 * BUGS FIXED:
 * 🔴 createRoom: added expires_at (+2h) — without it quickMatch's
 *    .gt('expires_at', now) filtered ALL rooms (null > date = false in Postgres)
 * 🔴 writeTurnState + startGame: added onConflict:'room_id' to upsert
 * 🟡 joinRoom: switched .single() → .maybeSingle() with clearer error messages
 * 🟡 joinRoom: added duplicate-entry guard (already in room check)
 */
import { createClient } from '@supabase/supabase-js';

const sbUrl = process.env.REACT_APP_SUPABASE_URL || '';
const sbKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
export const supabase = (sbUrl && sbKey) ? createClient(sbUrl, sbKey) : null;

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

async function generateRoomCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = Array.from({ length: 6 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('');
    const { data } = await supabase.from('game_rooms').select('id').eq('code', code).maybeSingle();
    if (!data) return code;
  }
  throw new Error('Could not generate unique room code');
}

export async function createRoom({ userId, maxPlayers = 2, isPublic = true, playerName, charIdx, char }) {
  if (!supabase) throw new Error('Supabase not configured');
  const code = await generateRoomCode();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // +2h

  const { data: room, error: roomErr } = await supabase
    .from('game_rooms')
    .insert({ code, host_user_id: userId, max_players: maxPlayers, is_public: isPublic, expires_at: expiresAt })
    .select().single();
  if (roomErr) throw roomErr;

  await addPlayerToRoom({ roomId: room.id, userId, seatIndex: 0, playerName, charIdx, char });
  return { room, code };
}

export async function joinRoom({ roomCode, userId, playerName, charIdx, char }) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: room, error: roomErr } = await supabase
    .from('game_rooms').select('*, room_players(*)')
    .eq('code', roomCode.toUpperCase()).eq('status', 'waiting').maybeSingle();

  if (roomErr) throw new Error('Could not reach the server. Please try again.');
  if (!room)   throw new Error('Room not found or already started. Check the code and try again.');

  const alreadyIn = room.room_players.find(p => p.user_id === userId);
  if (alreadyIn) throw new Error('You are already seated in this sanctuary.');

  const takenSeats = room.room_players.map(p => p.seat_index);
  const nextSeat   = [0,1,2,3].find(s => !takenSeats.includes(s));
  if (nextSeat === undefined) throw new Error('This sanctuary is full.');

  await addPlayerToRoom({ roomId: room.id, userId, seatIndex: nextSeat, playerName, charIdx, char });
  return { room, seat_index: nextSeat };
}

export async function quickMatch({ userId, playerName, charIdx, char }) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: rooms } = await supabase
    .from('game_rooms').select('*, room_players(count)')
    .eq('status', 'waiting').eq('is_public', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true }).limit(10);

  if (rooms) {
    for (const room of rooms) {
      const playerCount = room.room_players[0]?.count || 0;
      if (playerCount >= room.max_players) continue;

      const { data: existing } = await supabase.from('room_players').select('id')
        .eq('room_id', room.id).eq('user_id', userId).maybeSingle();
      if (existing) continue;

      const takenSeats = await getSeats(room.id);
      const nextSeat   = [0,1,2,3].find(s => !takenSeats.includes(s));
      if (nextSeat !== undefined) {
        await addPlayerToRoom({ roomId: room.id, userId, seatIndex: nextSeat, playerName, charIdx, char });
        return { room, seat_index: nextSeat, isHost: false };
      }
    }
  }

  const { room, code } = await createRoom({ userId, maxPlayers: 2, isPublic: true, playerName, charIdx, char });
  return { room, seat_index: 0, isHost: true, code };
}

async function getSeats(roomId) {
  const { data } = await supabase.from('room_players').select('seat_index').eq('room_id', roomId);
  return (data || []).map(p => p.seat_index);
}

async function addPlayerToRoom({ roomId, userId, seatIndex, playerName, charIdx, char }) {
  const { error } = await supabase.from('room_players').insert({
    room_id: roomId, user_id: userId, seat_index: seatIndex,
    player_name: playerName, char_idx: charIdx,
    char_name: char.name, char_icon: char.icon, char_color: char.color,
    is_ready: false, is_connected: true,
  });
  if (error) throw error;
}

export async function setReady({ roomId, userId, isReady }) {
  const { error } = await supabase.from('room_players')
    .update({ is_ready: isReady }).eq('room_id', roomId).eq('user_id', userId);
  if (error) throw error;
}

export async function updateCharacter({ roomId, userId, charIdx, char }) {
  const { error } = await supabase.from('room_players')
    .update({ char_idx: charIdx, char_name: char.name, char_icon: char.icon, char_color: char.color })
    .eq('room_id', roomId).eq('user_id', userId);
  if (error) throw error;
}

export async function startGame({ roomId, playerCount }) {
  if (!supabase) throw new Error('Supabase not configured');
  const pos=Array(playerCount).fill(1), zeros=Array(playerCount).fill(0), falses=Array(playerCount).fill(false);

  const { error: stateErr } = await supabase.from('game_state').upsert({
    room_id: roomId, cur: 0, pos, punya: zeros, papa: zeros,
    shield_a: falses, skip_a: falses, win: null, dil: null,
    used_dharma: [], turn_seq: 0, updated_at: new Date().toISOString(),
  }, { onConflict: 'room_id' });                     // ← FIXED
  if (stateErr) throw stateErr;

  const { error: roomErr } = await supabase.from('game_rooms')
    .update({ status: 'active', started_at: new Date().toISOString() }).eq('id', roomId);
  if (roomErr) throw roomErr;
}

export async function promoteBotForSlot({ roomId, seatIndex, char, botName = 'Spirit Guide' }) {
  const { error } = await supabase.from('room_players').upsert({
    room_id: roomId, seat_index: seatIndex, user_id: null,
    player_name: botName, char_idx: char?.idx??0,
    char_name: char?.name??'Ganesha', char_icon: char?.icon??'🐘', char_color: char?.color??'#c0a030',
    is_bot: true, is_ready: true, is_connected: true,
  }, { onConflict: 'room_id,seat_index' });
  if (error) throw error;
}

export async function writeTurnState({ roomId, turnSeq, gameState }) {
  const { error } = await supabase.from('game_state').upsert({
    room_id: roomId, cur: gameState.cur, pos: gameState.pos,
    punya: gameState.punya, papa: gameState.papa,
    shield_a: gameState.shieldA, skip_a: gameState.skipA,
    win: gameState.win??null, dil: gameState.dil??null,
    used_dharma: gameState.usedDharma??[], turn_seq: turnSeq,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'room_id' });                     // ← FIXED
  if (error) throw error;
}

export async function writeMoveLog({ roomId, turnSeq, playerIndex, moveType, diceVal, grahaIdx, dilemmaPick, snapshot }) {
  const { error } = await supabase.from('game_moves').insert({
    room_id: roomId, turn_seq: turnSeq, player_index: playerIndex,
    move_type: moveType, dice_val: diceVal, graha_idx: grahaIdx,
    dilemma_pick: dilemmaPick??null, snapshot: snapshot??null,
  });
  if (error) console.warn('Move log write failed (non-critical):', error);
}

export async function loadLatestSnapshot(roomId) {
  const { data } = await supabase.from('game_moves').select('snapshot, turn_seq')
    .eq('room_id', roomId).not('snapshot', 'is', null)
    .order('turn_seq', { ascending: false }).limit(1).maybeSingle();
  return data;
}

export async function markDisconnected({ roomId, userId }) {
  await supabase.from('room_players')
    .update({ is_connected: false, disconnected_at: new Date().toISOString() })
    .eq('room_id', roomId).eq('user_id', userId);
}

export async function markReconnected({ roomId, userId }) {
  await supabase.from('room_players')
    .update({ is_connected: true, disconnected_at: null, is_bot: false })
    .eq('room_id', roomId).eq('user_id', userId);
}

export async function finishGame({ roomId }) {
  await supabase.from('game_rooms')
    .update({ status: 'finished', finished_at: new Date().toISOString() }).eq('id', roomId);
}

export async function getActiveSeekerCount() {
  const { count } = await supabase.from('room_players')
    .select('*', { count: 'exact', head: true })
    .eq('is_connected', true).eq('is_bot', false);
  return count || 0;
}
