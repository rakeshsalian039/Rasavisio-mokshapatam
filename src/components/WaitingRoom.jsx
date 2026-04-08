/**
 * WaitingRoom.jsx — Sacred Sabha (assembly hall) pre-game waiting room.
 * Shows player slots in a circle around a central sacred fire.
 * Host can start when ≥2 players are ready. Unfilled slots become bots after 30s.
 */
import { useState, useEffect, useRef } from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { setReady, startGame, promoteBotForSlot, updateCharacter } from '../services/roomService';
import { CHARS } from '../tiers/moksha/constants';

const PG = {
  minHeight: '100vh',
  background: 'linear-gradient(170deg,#0c0a07,#1a1408,#0c0a07)',
  fontFamily: "'Cinzel',serif",
  color: '#e8c850',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 16px',
  position: 'relative',
  overflow: 'hidden',
};

// Sanskrit-style section label
const Label = ({ children, style }) => (
  <div style={{ fontSize: 9, letterSpacing: 4, color: '#5a4a30', textTransform: 'uppercase', ...style }}>
    {children}
  </div>
);

export default function WaitingRoom({
  roomId,
  roomCode,
  userId,
  myPlayerIndex,
  maxPlayers = 2,
  onGameStart,
  onLeave,
}) {
  const [isReady, setIsReadyLocal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [botTimer, setBotTimer] = useState(30); // countdown to auto-fill bots
  const [selectedCharIdx, setSelectedCharIdx] = useState(myPlayerIndex % CHARS.length);
  const [charPickOpen, setCharPickOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  const botTimerRef = useRef(null);

  const { roomStatus, roomPlayers, presenceMap } = useMultiplayer({
    roomId, userId, myPlayerIndex, enabled: true,
  });

  const isHost = roomPlayers[0]?.user_id === userId;
  const filledCount = roomPlayers.filter(p => !p.is_bot || p.user_id).length;
  const allReady    = roomPlayers.length >= 2 && roomPlayers.every(p => p.is_ready);
  const mySlot      = roomPlayers.find(p => p.user_id === userId);

  // Auto-start if room goes active (another client started it)
  useEffect(() => {
    if (roomStatus === 'active') {
      const players = roomPlayers.map(p => ({
        name: p.player_name,
        char: { name: p.char_name, icon: p.char_icon, color: p.char_color },
        charIdx: p.char_idx,
        cpu: p.is_bot,
      }));
      onGameStart?.(players, roomId, myPlayerIndex);
    }
  }, [roomStatus]);

  // Bot-fill countdown (host only)
  useEffect(() => {
    if (!isHost || roomPlayers.length >= maxPlayers) return;

    botTimerRef.current = setInterval(() => {
      setBotTimer(t => {
        if (t <= 1) {
          clearInterval(botTimerRef.current);
          fillBotsAndStart();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(botTimerRef.current);
  }, [isHost, roomPlayers.length, maxPlayers]);

  async function fillBotsAndStart() {
    if (!isHost) return;
    const takenSeats = roomPlayers.map(p => p.seat_index);
    for (let i = 0; i < maxPlayers; i++) {
      if (!takenSeats.includes(i)) {
        const botChar = CHARS[i % CHARS.length];
        await promoteBotForSlot({ roomId, seatIndex: i, char: { ...botChar, idx: i % CHARS.length }, botName: 'Spirit Guide' });
      }
    }
    await handleStart();
  }

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    try {
      await startGame({ roomId, playerCount: roomPlayers.length });
    } catch (e) {
      console.error('Start game failed:', e);
      setStarting(false);
    }
  }

  async function toggleReady() {
    const next = !isReady;
    setIsReadyLocal(next);
    await setReady({ roomId, userId, isReady: next });
  }

  async function handleCharSelect(idx) {
    setSelectedCharIdx(idx);
    setCharPickOpen(false);
    await updateCharacter({ roomId, userId, charIdx: idx, char: CHARS[idx] });
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ─── seat positions for circle layout ─────────────────────────────────────
  // 2p: top + bottom. 3p: top + BL + BR. 4p: top + R + bottom + L
  const seatAngles = {
    2: [-90, 90],
    3: [-90, 150, 30],
    4: [-90, 0, 90, 180],
  };
  const angles = seatAngles[maxPlayers] || seatAngles[2];
  const R = 110; // orbit radius in px

  return (
    <div style={PG}>
      {/* BG cymatics */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }} viewBox="0 0 400 400">
        {[40, 80, 120, 160].map(r => (
          <circle key={r} cx={200} cy={200} r={r} fill="none" stroke="#c0a040" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Room code */}
      <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <Label style={{ marginBottom: 6 }}>Sabha Code</Label>
        <button onClick={copyCode} style={{
          background: 'transparent', border: '1px solid rgba(200,160,60,.3)',
          borderRadius: 6, padding: '8px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto',
          transition: 'all .2s',
        }}>
          <span style={{ fontSize: 22, fontFamily: 'monospace', letterSpacing: 6, color: '#f0d050', fontWeight: 700 }}>
            {roomCode}
          </span>
          <span style={{ fontSize: 9, color: copied ? '#80c080' : '#5a4a30', letterSpacing: 1 }}>
            {copied ? '✓ COPIED' : '📋'}
          </span>
        </button>
        <div style={{ fontSize: 9, color: '#3a2a18', marginTop: 4 }}>Share this code with friends</div>
      </div>

      {/* Circle of seats */}
      <div style={{ position: 'relative', width: R * 2 + 80, height: R * 2 + 80, margin: '0 auto 24px' }}>
        {/* Central sacred fire */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: 28 + (filledCount * 6),
          transition: 'font-size .5s ease',
          animation: 'pulse 2s ease infinite',
          filter: `drop-shadow(0 0 ${6 + filledCount * 3}px rgba(240,160,40,.5))`,
        }}>
          🪔
        </div>

        {/* Player slots */}
        {Array.from({ length: maxPlayers }).map((_, i) => {
          const angle = (angles[i] * Math.PI) / 180;
          const cx = R + R * Math.cos(angle);
          const cy = R + R * Math.sin(angle);
          const player = roomPlayers.find(p => p.seat_index === i);
          const isMe = player?.user_id === userId;
          const online = player ? (presenceMap[player.user_id]?.online !== false) : false;

          return (
            <div key={i} style={{
              position: 'absolute',
              left: cx + 14,
              top: cy + 14,
              transform: 'translate(-50%,-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              width: 80,
            }}>
              {/* Avatar ring */}
              <div style={{
                width: 52, height: 52,
                borderRadius: '50%',
                border: player
                  ? `2px solid ${isMe ? 'rgba(240,200,80,.7)' : 'rgba(200,160,60,.35)'}`
                  : '1.5px dashed rgba(200,160,60,.2)',
                background: player
                  ? `radial-gradient(circle at 35% 35%, ${player.char_color}22, rgba(12,10,7,.9))`
                  : 'rgba(12,10,7,.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: player ? 24 : 16,
                transition: 'all .4s',
                animation: player ? 'tokenPop .4s ease' : 'pulse 3s ease infinite',
                boxShadow: isMe && isReady ? '0 0 14px rgba(240,200,80,.35)' : 'none',
                position: 'relative',
                cursor: isMe ? 'pointer' : 'default',
              }} onClick={() => isMe && setCharPickOpen(true)}>
                {player ? player.char_icon : '·'}

                {/* Ready dot */}
                {player?.is_ready && (
                  <div style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#60c060',
                    border: '1.5px solid #0c0a07',
                  }} />
                )}

                {/* Online indicator */}
                {player && !player.is_bot && (
                  <div style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 8, height: 8, borderRadius: '50%',
                    background: online ? '#50a050' : '#804030',
                    border: '1.5px solid #0c0a07',
                  }} />
                )}
              </div>

              {/* Name */}
              <div style={{ fontSize: 10, color: isMe ? '#f0d050' : '#8a7a50', textAlign: 'center', letterSpacing: 1, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {player ? (isMe ? `${player.player_name} (You)` : player.player_name) : (
                  <span style={{ animation: 'pulse 2s ease infinite', opacity: 0.4 }}>Awaiting Seeker...</span>
                )}
              </div>

              {/* Bot badge */}
              {player?.is_bot && (
                <div style={{ fontSize: 8, color: '#5a4a28', letterSpacing: 1, opacity: 0.6 }}>SPIRIT GUIDE</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>

        {/* Ready toggle (non-host) */}
        {mySlot && (
          <button onClick={toggleReady} style={{
            background: isReady ? 'rgba(80,160,80,.15)' : 'transparent',
            border: `1px solid ${isReady ? 'rgba(80,200,80,.4)' : 'rgba(200,160,60,.25)'}`,
            borderRadius: 4, padding: '9px 28px',
            color: isReady ? '#80d080' : '#c0a040',
            fontSize: 12, fontFamily: "'Cinzel',serif", letterSpacing: 2,
            cursor: 'pointer', transition: 'all .3s',
          }}>
            {isReady ? '✓ READY' : 'MARK READY'}
          </button>
        )}

        {/* Start button (host only) */}
        {isHost && (
          <button
            onClick={handleStart}
            disabled={!allReady || starting}
            style={{
              background: allReady ? 'linear-gradient(180deg,rgba(200,160,60,.25),rgba(200,160,60,.1))' : 'rgba(200,160,60,.04)',
              border: `1px solid ${allReady ? 'rgba(240,200,80,.6)' : 'rgba(200,160,60,.1)'}`,
              borderRadius: 4, padding: '11px 36px',
              color: allReady ? '#f0d050' : '#5a4a28',
              fontSize: 13, fontFamily: "'Cinzel',serif", letterSpacing: 3,
              cursor: allReady ? 'pointer' : 'not-allowed',
              transition: 'all .3s',
              boxShadow: allReady ? '0 0 20px rgba(240,200,80,.1)' : 'none',
            }}>
            {starting ? 'Starting...' : '🔔 प्रारम्भ — BEGIN'}
          </button>
        )}

        {/* Bot timer */}
        {isHost && roomPlayers.length < maxPlayers && botTimer > 0 && (
          <div style={{ fontSize: 9, color: '#3a2a18', letterSpacing: 2, textAlign: 'center' }}>
            Spirit Guides fill in {botTimer}s if seats remain empty
          </div>
        )}

        {/* Leave */}
        <button onClick={onLeave} style={{
          background: 'transparent', border: 'none',
          color: '#4a3a20', fontSize: 9, cursor: 'pointer',
          fontFamily: "'Cinzel',serif", letterSpacing: 2, marginTop: 4,
        }}>
          ← Leave Sabha
        </button>
      </div>

      {/* Character picker sheet */}
      {charPickOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 300,
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setCharPickOpen(false)}>
          <div style={{
            width: '100%', background: 'linear-gradient(0deg,#1a1408,#0f0c05)',
            border: '1px solid rgba(200,160,60,.25)', borderRadius: '16px 16px 0 0',
            padding: '20px 16px 32px', animation: 'sheetUp .25s ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', fontSize: 10, color: '#5a4a30', letterSpacing: 4, marginBottom: 16 }}>
              CHOOSE YOUR SEEKER
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {CHARS.map((c, idx) => (
                <button key={idx} onClick={() => handleCharSelect(idx)} style={{
                  flexShrink: 0, width: 64, height: 72,
                  background: selectedCharIdx === idx ? 'rgba(200,160,60,.15)' : 'rgba(200,160,60,.04)',
                  border: `1px solid ${selectedCharIdx === idx ? 'rgba(240,200,80,.5)' : 'rgba(200,160,60,.12)'}`,
                  borderRadius: 8, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  transition: 'all .2s',
                }}>
                  <span style={{ fontSize: 24 }}>{c.icon}</span>
                  <span style={{ fontSize: 7, color: '#8a7a50', letterSpacing: 1 }}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
