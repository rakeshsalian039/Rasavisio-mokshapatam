/**
 * OnlineTurnBanner.jsx — Floating sacred tablet turn indicator for online games.
 * Enhanced Vedic aesthetic with mandala countdown, breathing animations, rich glows.
 */
import { useEffect, useState } from 'react';

const CSS_INJECT = `
@keyframes otb-slide-down{0%{opacity:0;transform:translateX(-50%) translateY(-24px)}100%{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes otb-banner-glow{0%,100%{box-shadow:0 0 14px rgba(240,200,80,.18),0 4px 24px rgba(0,0,0,.6)}50%{box-shadow:0 0 36px rgba(240,200,80,.45),0 4px 32px rgba(0,0,0,.7),0 0 60px rgba(240,200,80,.1)}}
@keyframes otb-dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
@keyframes otb-warning-pulse{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes otb-opponent-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  styleInjected = true;
  const el = document.createElement('style');
  el.textContent = CSS_INJECT;
  document.head.appendChild(el);
}

export default function OnlineTurnBanner({
  myPlayerIndex,
  currentPlayerIndex,
  players = [],
  secondsLeft = 30,
  broadcastState = null,
  disconnectedSeats = [],
  totalTimeout = 30,
}) {
  injectStyle();

  const isMyTurn      = currentPlayerIndex === myPlayerIndex;
  const currentPlayer = players[currentPlayerIndex];
  const isWarning     = secondsLeft <= 10 && secondsLeft > 0 && isMyTurn;
  const isCritical    = secondsLeft <= 5  && secondsLeft > 0 && isMyTurn;

  // Mandala ring: circumference for r=20 ≈ 126
  const CIRC = 126;
  const dashOffset = CIRC - (CIRC * (secondsLeft / totalTimeout));

  // Disconnect notice
  const [disconnectMsg, setDisconnectMsg] = useState('');
  useEffect(() => {
    if (disconnectedSeats.length > 0) {
      const p = players[disconnectedSeats[0]];
      if (p) {
        setDisconnectMsg(`${p.name || p.player_name} has left the path — a Spirit Guide takes their place`);
        const t = setTimeout(() => setDisconnectMsg(''), 5000);
        return () => clearTimeout(t);
      }
    }
  }, [disconnectedSeats.join(',')]);

  // ── Base banner style ─────────────────────────────────────────────────────
  const bannerBase = {
    position: 'fixed',
    top: 14,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 200,
    background: 'linear-gradient(180deg, rgba(28,22,10,0.97) 0%, rgba(18,14,6,0.97) 100%)',
    border: `1.5px solid ${isCritical ? 'rgba(220,60,40,.75)' : isWarning ? 'rgba(220,120,40,.6)' : 'rgba(200,160,60,.30)'}`,
    borderRadius: 10,
    padding: '10px 20px 10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 220,
    maxWidth: 'min(92vw, 400px)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    pointerEvents: 'none',
    userSelect: 'none',
    transition: 'border-color .4s',
  };

  // ── Disconnect notice ─────────────────────────────────────────────────────
  if (disconnectMsg) {
    return (
      <div style={{
        ...bannerBase,
        border: '1.5px solid rgba(180,80,40,.5)',
        animation: 'otb-slide-down .25s ease, otb-banner-glow 3s ease infinite',
      }}>
        <span style={{ fontSize: 20, filter: 'drop-shadow(0 0 6px rgba(180,80,40,.4))' }}>👻</span>
        <div>
          <div style={{
            fontSize: 11, color: '#c08060', fontFamily: "'Cinzel',serif",
            letterSpacing: 1, fontStyle: 'italic', lineHeight: 1.5,
          }}>
            {disconnectMsg}
          </div>
        </div>
      </div>
    );
  }

  // ── Rolling state (from broadcast) ────────────────────────────────────────
  if (broadcastState?.type === 'rolling') {
    const rollingPlayer = players[broadcastState.playerIndex];
    return (
      <div style={{ ...bannerBase, animation: 'otb-slide-down .25s ease, otb-banner-glow 3s ease infinite' }}>
        <span style={{ fontSize: 24, animation: 'dt 1s ease infinite', filter: 'drop-shadow(0 0 8px rgba(240,200,80,.3))' }}>🎲</span>
        <div>
          <div style={{ fontSize: 11, color: '#c0a040', fontFamily: "'Cinzel',serif", letterSpacing: 2 }}>
            {rollingPlayer?.char_icon || rollingPlayer?.char?.icon || '🪷'}
            {' '}{broadcastState.playerName || rollingPlayer?.name || rollingPlayer?.player_name || 'Seeker'} is rolling
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 5, height: 5, borderRadius: '50%', background: '#c0a040', display: 'inline-block',
                animation: `otb-dot 1.2s ease infinite`, animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Your Turn ─────────────────────────────────────────────────────────────
  if (isMyTurn) {
    return (
      <div style={{
        ...bannerBase,
        border: `1.5px solid ${isCritical ? 'rgba(220,60,40,.8)' : isWarning ? 'rgba(220,120,40,.65)' : 'rgba(240,200,80,.5)'}`,
        paddingLeft: 10,
        animation: 'otb-slide-down .25s ease, otb-banner-glow 2.5s ease infinite',
      }}>
        {/* Mandala countdown ring */}
        <svg width={48} height={48} style={{ flexShrink: 0 }}>
          {/* Outer decorative ring */}
          <circle cx={24} cy={24} r={22} fill="none" stroke="rgba(200,160,60,.06)" strokeWidth={0.5} />
          {/* Track */}
          <circle cx={24} cy={24} r={20} fill="none" stroke="rgba(200,160,60,.12)" strokeWidth={2.5} />
          {/* Progress */}
          <circle
            cx={24} cy={24} r={20}
            fill="none"
            stroke={isCritical ? '#e04030' : isWarning ? '#e08030' : '#c0a030'}
            strokeWidth={2.5}
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 24 24)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke .5s' }}
          />
          {/* Inner decorative ring */}
          <circle cx={24} cy={24} r={10} fill="none" stroke="rgba(200,160,60,.08)" strokeWidth={0.5} />
          {/* Center: seconds or OM */}
          {isWarning ? (
            <text x={24} y={29} textAnchor="middle"
              style={{
                fontSize: 15, fontFamily: "'Cinzel',serif",
                fill: isCritical ? '#e04030' : '#e08030', fontWeight: 700,
                animation: 'otb-warning-pulse 1s ease infinite',
              }}>
              {secondsLeft}
            </text>
          ) : (
            <text x={24} y={30} textAnchor="middle"
              style={{ fontSize: 20, fontFamily: "'Noto Serif Devanagari',serif", fill: '#c0a030' }}>
              ॐ
            </text>
          )}
        </svg>

        <div>
          <div style={{
            fontSize: 10, color: '#c0a040', fontFamily: "'Noto Serif Devanagari',serif",
            letterSpacing: 3, marginBottom: 3,
          }}>
            आपकी बारी
          </div>
          <div style={{
            fontSize: 14, color: isCritical ? '#f08060' : '#f0d050',
            fontFamily: "'Cinzel',serif", letterSpacing: 2, fontWeight: 700,
            textShadow: '0 0 10px rgba(240,200,80,.3)',
            animation: isWarning ? 'otb-warning-pulse 1s ease infinite' : undefined,
          }}>
            YOUR TURN
          </div>
          {isWarning && (
            <div style={{ fontSize: 9, color: '#b07040', marginTop: 3, letterSpacing: 1 }}>
              Auto-rolling in {secondsLeft}s...
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Waiting for opponent ──────────────────────────────────────────────────
  return (
    <div style={{
      ...bannerBase,
      opacity: 0.85,
      animation: 'otb-slide-down .25s ease, otb-banner-glow 4s ease infinite',
    }}>
      <span style={{
        fontSize: 24, opacity: 0.8,
        animation: 'otb-opponent-breathe 2.5s ease infinite',
        filter: 'drop-shadow(0 0 6px rgba(240,200,80,.15))',
      }}>
        {currentPlayer?.char_icon || currentPlayer?.char?.icon || '🪷'}
      </span>
      <div>
        <div style={{ fontSize: 11, color: '#c0a040', fontFamily: "'Cinzel',serif", letterSpacing: 2 }}>
          Waiting for
        </div>
        <div style={{
          fontSize: 13, color: '#f0d050', fontFamily: "'Cinzel',serif", letterSpacing: 1,
          textShadow: '0 0 8px rgba(240,200,80,.2)',
        }}>
          {currentPlayer?.name || currentPlayer?.player_name || 'Seeker'}
        </div>
      </div>
      {/* Breathing dots */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: '50%', background: '#8a7a50', display: 'inline-block',
            animation: `otb-dot 1.8s ease infinite`, animationDelay: `${i * 0.3}s`,
          }} />
        ))}
      </div>
    </div>
  );
}
