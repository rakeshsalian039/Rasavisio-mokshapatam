/**
 * MultiplayerLobby.jsx — Three Sacred Doors: Quick Match | Create Hall | Join Room
 * Extraordinary Vedic visuals with sacred geometry, Sri Yantra, and gold particle effects.
 */
import { useState, useEffect, useRef } from 'react';
import { createRoom, joinRoom, quickMatch, getActiveSeekerCount } from '../services/roomService';
import WaitingRoom from './WaitingRoom';
import { CHARS } from '../tiers/moksha/constants';
import SineWaveBackground from './SineWaveBackground';

/* ─── Seeded random for particles (deterministic) ─────────────────────────── */
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

/* ─── Injected keyframes ──────────────────────────────────────────────────── */
const LOBBY_KEYFRAMES = `
@keyframes lobbyReveal{0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:translateY(0)}}
@keyframes doorGlow{0%,100%{box-shadow:0 0 8px rgba(240,200,80,.05)}50%{box-shadow:0 0 24px rgba(240,200,80,.12),0 0 48px rgba(240,200,80,.04)}}
@keyframes floatParticle{0%{transform:translateY(0) scale(1);opacity:.5}50%{opacity:.9}100%{transform:translateY(-100vh) scale(.3);opacity:0}}
@keyframes codeSlotGlow{0%,100%{border-color:rgba(240,200,80,.3)}50%{border-color:rgba(240,200,80,.7);box-shadow:0 0 12px rgba(240,200,80,.3)}}
@keyframes cymaticPulse{0%,100%{opacity:var(--base-op);transform:scale(1)}50%{opacity:calc(var(--base-op) + 0.06);transform:scale(1.02)}}
@keyframes cymaticRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes pulseDot{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.4);opacity:1}}
`;

/* ─── Page background ─────────────────────────────────────────────────────── */
const PG = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at 50% 40%, #1e180a 0%, #0c0a07 65%, #060504 100%)',
  fontFamily: "'Cinzel',serif",
  color: '#e8c850',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 20px',
  position: 'relative',
  overflow: 'hidden',
};

/* ─── Sacred Geometry Background ──────────────────────────────────────────── */
function SacredGeometrySVG() {
  const rings = [60, 100, 150, 210, 280, 360];
  const opacities = [0.08, 0.10, 0.12, 0.14, 0.16, 0.18];
  const hexNodes = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60) * Math.PI / 180;
    return { cx: 400 + 105 * Math.cos(a), cy: 400 + 105 * Math.sin(a) };
  });
  const outerNodes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30) * Math.PI / 180;
    return { cx: 400 + 220 * Math.cos(a), cy: 400 + 220 * Math.sin(a) };
  });

  return (
    <svg
      viewBox="0 0 800 800"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
    >
      {/* Concentric rings */}
      {rings.map((r, i) => (
        <circle
          key={`ring-${i}`}
          cx={400} cy={400} r={r}
          fill="none" stroke="#a08030" strokeWidth={0.5}
          style={{
            '--base-op': opacities[i],
            opacity: opacities[i],
            animation: `cymaticPulse ${3.5 + i * 0.5}s ease infinite ${i * 0.3}s`,
          }}
        />
      ))}

      {/* 6 hexagonal nodes */}
      {hexNodes.map((n, i) => (
        <circle key={`hex-${i}`} cx={n.cx} cy={n.cy} r={4} fill="#a08030" opacity={0.12} />
      ))}

      {/* 12 outer nodes */}
      {outerNodes.map((n, i) => (
        <circle key={`out-${i}`} cx={n.cx} cy={n.cy} r={3} fill="#a08030" opacity={0.10} />
      ))}

      {/* Sri Yantra triangles */}
      <polygon points="400,290 325,440 475,440" fill="none" stroke="#a08030" strokeWidth={0.4} opacity={0.08} />
      <polygon points="400,510 325,360 475,360" fill="none" stroke="#a08030" strokeWidth={0.4} opacity={0.08} />
      <polygon points="400,330 355,420 445,420" fill="none" stroke="#a08030" strokeWidth={0.4} opacity={0.08} />

      {/* Rotating triangle groups */}
      <g style={{ transformOrigin: '400px 400px', animation: 'cymaticRotate 50s linear infinite' }}>
        <polygon points="400,250 300,480 500,480" fill="none" stroke="#a08030" strokeWidth={0.3} opacity={0.06} />
        <polygon points="400,550 300,320 500,320" fill="none" stroke="#a08030" strokeWidth={0.3} opacity={0.06} />
      </g>
      <g style={{ transformOrigin: '400px 400px', animation: 'cymaticRotate 70s linear infinite reverse' }}>
        <polygon points="400,270 310,460 490,460" fill="none" stroke="#a08030" strokeWidth={0.3} opacity={0.05} />
        <polygon points="400,530 310,340 490,340" fill="none" stroke="#a08030" strokeWidth={0.3} opacity={0.05} />
      </g>
    </svg>
  );
}

/* ─── Ascending Gold Particles ────────────────────────────────────────────── */
function GoldParticles() {
  const rand = seededRand(42);
  const particles = Array.from({ length: 14 }, (_, i) => {
    const size = 2 + rand() * 2;
    const left = rand() * 100;
    const dur = 8 + rand() * 12;
    const delay = rand() * 10;
    return { size, left, dur, delay };
  });
  return (
    <>
      {particles.map((p, i) => (
        <div
          key={`p-${i}`}
          style={{
            position: 'fixed',
            bottom: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: '#f0d050',
            zIndex: 2,
            pointerEvents: 'none',
            animation: `floatParticle ${p.dur}s linear infinite ${p.delay}s`,
            opacity: 0.5,
          }}
        />
      ))}
    </>
  );
}

/* ─── Vignette Overlay ────────────────────────────────────────────────────── */
function Vignette() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(6,5,3,.85) 100%)',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
}

/* ─── Naga Knot Divider ───────────────────────────────────────────────────── */
function NagaDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: 120, margin: '14px 0 22px' }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(240,200,80,.25))' }} />
      <svg viewBox="0 0 20 20" width={12} height={12} style={{ opacity: 0.4 }}>
        <circle cx={10} cy={10} r={4} fill="none" stroke="#f0d050" strokeWidth={1} />
        <circle cx={10} cy={10} r={1.5} fill="#f0d050" />
      </svg>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(240,200,80,.25), transparent)' }} />
    </div>
  );
}

/* ─── SVG Ornament Divider (small, for door buttons) ──────────────────────── */
function DoorOrnament() {
  return (
    <svg viewBox="0 0 40 8" width={40} height={8} style={{ opacity: 0.35, margin: '6px 0' }}>
      <line x1={0} y1={4} x2={14} y2={4} stroke="#f0d050" strokeWidth={0.5} />
      <circle cx={20} cy={4} r={2.5} fill="none" stroke="#f0d050" strokeWidth={0.5} />
      <circle cx={20} cy={4} r={0.8} fill="#f0d050" />
      <line x1={26} y1={4} x2={40} y2={4} stroke="#f0d050" strokeWidth={0.5} />
    </svg>
  );
}

/* ─── Corner Lotus Ornament (for join frame) ──────────────────────────────── */
function CornerLotus({ style }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} style={{ position: 'absolute', opacity: 0.2, ...style }}>
      <circle cx={12} cy={12} r={5} fill="none" stroke="#f0d050" strokeWidth={0.6} />
      <circle cx={12} cy={12} r={2} fill="none" stroke="#f0d050" strokeWidth={0.4} />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const a = deg * Math.PI / 180;
        return <line key={i} x1={12} y1={12} x2={12 + 8 * Math.cos(a)} y2={12 + 8 * Math.sin(a)} stroke="#f0d050" strokeWidth={0.3} />;
      })}
    </svg>
  );
}

/* ─── Mandala behind create-view numbers ──────────────────────────────────── */
function MiniMandala() {
  return (
    <svg viewBox="0 0 80 80" width={80} height={80} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <circle
        cx={40} cy={40} r={32} fill="none" stroke="#a08030" strokeWidth={0.5}
        style={{ '--base-op': 0.08, opacity: 0.08, animation: 'cymaticPulse 4s ease infinite' }}
      />
      <circle
        cx={40} cy={40} r={22} fill="none" stroke="#a08030" strokeWidth={0.4}
        style={{ '--base-op': 0.06, opacity: 0.06, animation: 'cymaticPulse 5s ease infinite 0.5s' }}
      />
    </svg>
  );
}

/* ─── Door Button ─────────────────────────────────────────────────────────── */
function DoorButton({ icon, sanskrit, english, subtitle, onClick, disabled, loading, delay }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      style={{
        minWidth: 180,
        minHeight: 140,
        borderRadius: 8,
        padding: '24px 16px 20px',
        background: hover
          ? 'radial-gradient(ellipse at 50% 30%, rgba(200,160,60,.18), rgba(200,160,60,.04) 70%, transparent)'
          : 'radial-gradient(ellipse at 50% 30%, rgba(200,160,60,.10), rgba(200,160,60,.02) 70%, transparent)',
        border: `1.5px solid ${hover ? 'rgba(200,160,60,.55)' : 'rgba(200,160,60,.30)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all .3s ease',
        animation: `sacredGlow 4s ease infinite, lobbyReveal 0.8s ease ${delay || '0.3s'} both`,
        boxShadow: hover
          ? '0 0 24px rgba(240,200,80,.08), inset 0 0 30px rgba(240,200,80,.03)'
          : '0 0 8px rgba(240,200,80,.04), inset 0 0 30px rgba(240,200,80,.02)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        opacity: disabled ? 0.4 : 1,
        fontFamily: "'Cinzel',serif",
        color: '#f0d050',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={disabled ? undefined : onClick}
    >
      <span style={{
        fontSize: 36,
        filter: 'drop-shadow(0 0 10px rgba(240,200,80,.25))',
        transform: hover ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform .3s ease',
      }}>
        {loading ? '\u231B' : icon}
      </span>

      <DoorOrnament />

      <div style={{
        fontSize: 14,
        fontFamily: "'Noto Serif Devanagari',serif",
        color: '#f0d050',
        letterSpacing: 1,
      }}>
        {loading ? '\u0916\u094B\u091C...' : sanskrit}
      </div>
      <div style={{
        fontSize: 10,
        fontFamily: "'Cinzel',serif",
        letterSpacing: 3,
        color: '#c0b080',
        fontWeight: 700,
      }}>
        {english}
      </div>
      <div style={{
        fontSize: 9,
        color: '#8a7a50',
        letterSpacing: 1,
        textAlign: 'center',
        lineHeight: 1.5,
        marginTop: 2,
      }}>
        {subtitle}
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function MultiplayerLobby({ userId, userName, onGameStart, onBack }) {
  const [view, setView] = useState('home'); // home | create | join | waiting
  const [seekerCount, setSeekerCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(''); // 'quick' | 'create' | 'join' | ''
  const [joinCode, setJoinCode] = useState('');
  const [roomData, setRoomData] = useState(null); // { roomId, roomCode, myPlayerIndex, maxPlayers }
  const [selectedCharIdx] = useState(0); // default char — can be picked in WaitingRoom
  const codeInputRef = useRef(null);

  // Seeker count polling
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const c = await getActiveSeekerCount().catch(() => 0);
      if (alive) setSeekerCount(c);
    };
    poll();
    const t = setInterval(poll, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  useEffect(() => {
    if (view === 'join') setTimeout(() => codeInputRef.current?.focus(), 100);
  }, [view]);

  const myChar = CHARS[selectedCharIdx];

  async function handleQuickMatch() {
    setError(''); setLoading('quick');
    try {
      const { room, seat_index, code } = await quickMatch({
        userId, playerName: userName || 'Seeker', charIdx: selectedCharIdx, char: myChar,
      });
      setRoomData({ roomId: room.id, roomCode: code || room.code, myPlayerIndex: seat_index, maxPlayers: room.max_players });
      setView('waiting');
    } catch (e) {
      setError(e.message || 'Could not find a match. Try again.');
    } finally { setLoading(''); }
  }

  async function handleCreateRoom(maxPlayers = 2) {
    setError(''); setLoading('create');
    try {
      const { room, code } = await createRoom({
        userId, maxPlayers, isPublic: false,
        playerName: userName || 'Seeker', charIdx: selectedCharIdx, char: myChar,
      });
      setRoomData({ roomId: room.id, roomCode: code, myPlayerIndex: 0, maxPlayers });
      setView('waiting');
    } catch (e) {
      setError(e.message || 'Could not create room. Try again.');
    } finally { setLoading(''); }
  }

  async function handleJoinRoom() {
    if (joinCode.length !== 6) { setError('Enter the 6-character Sabha code'); return; }
    setError(''); setLoading('join');
    try {
      const { room, seat_index } = await joinRoom({
        roomCode: joinCode.toUpperCase(),
        userId, playerName: userName || 'Seeker', charIdx: selectedCharIdx, char: myChar,
      });
      setRoomData({ roomId: room.id, roomCode: joinCode.toUpperCase(), myPlayerIndex: seat_index, maxPlayers: room.max_players });
      setView('waiting');
    } catch (e) {
      setError(e.message || 'Sabha not found or already started.');
    } finally { setLoading(''); }
  }

  // ─── Background layers (shared across views) ─────────────────────────────
  const bgLayers = (
    <>
      <style>{LOBBY_KEYFRAMES}</style>
      {/* Layer 2: SineWaveBackground */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <SineWaveBackground />
      </div>
      {/* Layer 3: Sacred Geometry SVG */}
      <SacredGeometrySVG />
      {/* Layer 4: Ascending gold particles */}
      <GoldParticles />
      {/* Layer 5: Vignette */}
      <Vignette />
    </>
  );

  // ─── Waiting Room ────────────────────────────────────────────────────────
  if (view === 'waiting' && roomData) {
    return (
      <WaitingRoom
        roomId={roomData.roomId}
        roomCode={roomData.roomCode}
        userId={userId}
        myPlayerIndex={roomData.myPlayerIndex}
        maxPlayers={roomData.maxPlayers}
        onGameStart={onGameStart}
        onLeave={() => { setRoomData(null); setView('home'); }}
      />
    );
  }

  // ─── Join view ───────────────────────────────────────────────────────────
  if (view === 'join') {
    return (
      <div style={PG}>
        {bgLayers}

        <div style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 5,
          animation: 'lobbyReveal 0.8s ease 0.1s both',
        }}>
          {/* Decorative frame */}
          <div style={{
            position: 'relative',
            border: '1px solid rgba(200,160,60,.12)',
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
          }}>
            <CornerLotus style={{ top: -2, left: -2 }} />
            <CornerLotus style={{ top: -2, right: -2, transform: 'scaleX(-1)' }} />
            <CornerLotus style={{ bottom: -2, left: -2, transform: 'scaleY(-1)' }} />
            <CornerLotus style={{ bottom: -2, right: -2, transform: 'scale(-1)' }} />

            <div style={{
              fontSize: 11,
              letterSpacing: 4,
              color: '#c0b080',
              marginBottom: 16,
              fontFamily: "'Cinzel',serif",
            }}>
              ENTER ROOM CODE
            </div>

            {/* 6 carved slots */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => {
                const isFilled = !!joinCode[i];
                const isActive = i === joinCode.length;
                return (
                  <div key={i} style={{
                    width: 48,
                    height: 56,
                    background: isFilled ? 'rgba(200,160,60,.12)' : 'rgba(200,160,60,.03)',
                    border: `1.5px solid ${isFilled ? 'rgba(240,200,80,.55)' : 'rgba(200,160,60,.2)'}`,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontFamily: 'monospace',
                    color: '#f0d050',
                    fontWeight: 700,
                    transition: 'all .2s',
                    boxShadow: isFilled ? '0 0 8px rgba(240,200,80,.08)' : 'none',
                    animation: isActive ? 'codeSlotGlow 1.5s ease infinite' : 'none',
                  }}>
                    {joinCode[i] || ''}
                  </div>
                );
              })}
            </div>

            {/* Hidden input for keyboard */}
            <input
              ref={codeInputRef}
              value={joinCode}
              maxLength={6}
              onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') handleJoinRoom(); }}
              style={{ position: 'absolute', opacity: 0.01, width: 1, height: 1 }}
            />
            <button onClick={() => codeInputRef.current?.focus()} style={{
              background: 'transparent',
              border: '1px solid rgba(200,160,60,.15)',
              borderRadius: 3,
              padding: '6px 16px',
              color: '#8a7a50',
              fontSize: 9,
              cursor: 'pointer',
              letterSpacing: 2,
              fontFamily: "'Cinzel',serif",
            }}>
              TAP TO TYPE
            </button>
          </div>

          {error && <div style={{ color: '#c06040', fontSize: 10, marginBottom: 12, letterSpacing: 1 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={handleJoinRoom} disabled={!!loading} style={{
              background: 'linear-gradient(180deg,rgba(200,160,60,.2),rgba(200,160,60,.08))',
              border: '1.5px solid rgba(240,200,80,.4)',
              borderRadius: 4,
              padding: '11px 32px',
              color: '#f0d050',
              fontSize: 13,
              fontFamily: "'Cinzel',serif",
              letterSpacing: 2,
              cursor: loading ? 'wait' : 'pointer',
              animation: 'sacredGlow 3s ease infinite',
            }}>
              {loading === 'join' ? 'Entering...' : '\uD83D\uDEAA ENTER THE HALL'}
            </button>
            <button onClick={() => { setView('home'); setError(''); setJoinCode(''); }} style={{
              background: 'transparent',
              border: '1px solid rgba(200,160,60,.1)',
              borderRadius: 4,
              padding: '11px 20px',
              color: '#8a7a50',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: "'Cinzel',serif",
            }}>
              \u2190 Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Create view ─────────────────────────────────────────────────────────
  if (view === 'create') {
    return (
      <div style={PG}>
        {bgLayers}

        <div style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 5,
          animation: 'lobbyReveal 0.8s ease 0.1s both',
        }}>
          <div style={{
            fontSize: 11,
            letterSpacing: 4,
            color: '#c0b080',
            marginBottom: 8,
            fontFamily: "'Cinzel',serif",
          }}>
            CREATE A SABHA
          </div>
          <div style={{ fontSize: 11, color: '#8a7a50', marginBottom: 24 }}>How many seekers?</div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
            {[2, 3, 4].map((n, i) => (
              <button
                key={n}
                onClick={() => handleCreateRoom(n)}
                disabled={!!loading}
                style={{
                  width: 80,
                  height: 80,
                  position: 'relative',
                  background: 'radial-gradient(ellipse at 50% 30%, rgba(200,160,60,.10), rgba(200,160,60,.02) 70%, transparent)',
                  border: '1.5px solid rgba(200,160,60,.3)',
                  borderRadius: 8,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  color: '#f0d050',
                  fontFamily: "'Cinzel',serif",
                  fontSize: 24,
                  fontWeight: 700,
                  transition: 'all .25s ease',
                  animation: `lobbyReveal 0.8s ease ${0.2 + i * 0.12}s both`,
                }}
              >
                <MiniMandala />
                <span style={{ position: 'relative', zIndex: 1 }}>{n}</span>
                <span style={{ position: 'relative', zIndex: 1, fontSize: 8, color: '#8a7a50', letterSpacing: 1 }}>seekers</span>
              </button>
            ))}
          </div>

          {error && <div style={{ color: '#c06040', fontSize: 10, marginBottom: 12 }}>{error}</div>}

          <button onClick={() => { setView('home'); setError(''); }} style={{
            background: 'transparent',
            border: 'none',
            color: '#8a7a50',
            fontSize: 9,
            cursor: 'pointer',
            fontFamily: "'Cinzel',serif",
            letterSpacing: 2,
          }}>
            \u2190 Back
          </button>
        </div>
      </div>
    );
  }

  // ─── Home view — Three Sacred Doors ─────────────────────────────────────
  return (
    <div style={PG}>
      {bgLayers}

      <div style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
      }}>
        {/* Trident */}
        <div style={{
          fontSize: 36,
          animation: 'mp 3s ease infinite',
          filter: 'drop-shadow(0 0 16px rgba(240,200,80,.3))',
          opacity: 0,
          animationName: 'lobbyReveal, mp',
          animationDuration: '0.8s, 3s',
          animationDelay: '0.1s, 0s',
          animationFillMode: 'both, none',
          animationTimingFunction: 'ease, ease',
          animationIterationCount: '1, infinite',
        }}>
          \uD83D\uDD31
        </div>

        {/* Sanskrit title */}
        <h2 style={{
          fontSize: 'clamp(24px,6vw,36px)',
          fontFamily: "'Yatra One',serif",
          margin: '6px 0 4px',
          letterSpacing: 3,
          color: '#f0d050',
          textAlign: 'center',
          textShadow: '0 2px 10px rgba(0,0,0,.7)',
          animation: 'lobbyReveal 0.8s ease 0.3s both',
        }}>
          \u0935\u093F\u0936\u094D\u0935 \u0915\u094D\u0930\u0940\u0921
        </h2>

        {/* English subtitle */}
        <div style={{
          fontFamily: "'Cinzel Decorative',serif",
          fontWeight: 700,
          fontSize: 'clamp(10px,2vw,14px)',
          letterSpacing: 8,
          color: '#f0d050',
          opacity: 0.5,
          marginBottom: 4,
          animation: 'lobbyReveal 0.8s ease 0.5s both',
        }}>
          WORLD GAME
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 11,
          color: '#c0b080',
          fontStyle: 'italic',
          letterSpacing: 2,
          marginBottom: 2,
          animation: 'lobbyReveal 0.8s ease 0.6s both',
        }}>
          Challenge seekers across the cosmos
        </div>

        {/* Naga knot divider */}
        <NagaDivider />

        {/* Three doors */}
        <div style={{
          display: 'flex',
          gap: 14,
          justifyContent: 'center',
          flexWrap: 'wrap',
          width: '100%',
          marginBottom: 22,
        }}>
          <DoorButton
            icon="\u26A1"
            sanskrit="\u0915\u094D\u0937\u093F\u092A\u094D\u0930 \u092F\u0941\u0926\u094D\u0927"
            english="QUICK BATTLE"
            subtitle="Find an opponent instantly"
            loading={loading === 'quick'}
            onClick={handleQuickMatch}
            delay="0.3s"
          />
          <DoorButton
            icon="\uD83C\uDFDB"
            sanskrit="\u0927\u0930\u094D\u092E \u0938\u092D\u093E"
            english="CREATE HALL"
            subtitle="Invite friends with a code"
            loading={loading === 'create'}
            onClick={() => setView('create')}
            delay="0.45s"
          />
          <DoorButton
            icon="\uD83D\uDEAA"
            sanskrit="\u092A\u094D\u0930\u0935\u0947\u0936"
            english="ENTER ROOM"
            subtitle="Join with a Sabha code"
            loading={loading === 'join'}
            onClick={() => setView('join')}
            delay="0.6s"
          />
        </div>

        {error && (
          <div style={{
            color: '#c06040',
            fontSize: 10,
            marginBottom: 12,
            letterSpacing: 1,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Seekers online */}
        <div style={{
          fontSize: 10,
          color: '#c0b080',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 20,
          animation: 'lobbyReveal 0.8s ease 0.8s both',
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#60c060',
            display: 'inline-block',
            animation: 'pulseDot 2s ease infinite',
            boxShadow: '0 0 6px rgba(96,192,96,.5)',
          }} />
          {seekerCount > 0
            ? `${seekerCount} seeker${seekerCount !== 1 ? 's' : ''} on the path right now`
            : 'Be the first seeker online'}
        </div>

        {/* Back */}
        <button onClick={onBack} style={{
          background: 'transparent',
          border: 'none',
          color: '#8a7a50',
          fontSize: 10,
          cursor: 'pointer',
          fontFamily: "'Cinzel',serif",
          letterSpacing: 2,
          animation: 'lobbyReveal 0.8s ease 1s both',
        }}>
          \u2190 Return to Temple
        </button>
      </div>
    </div>
  );
}
