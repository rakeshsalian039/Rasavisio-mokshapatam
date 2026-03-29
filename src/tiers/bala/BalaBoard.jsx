// ─────────────────────────────────────────────────────────────────────────────
// tiers/bala/BalaBoard.jsx
// The Bala Marg game board — bright, colorful, illustrated
//
// Realm colors:
//   Squares  1-24  (Bhuloka)   — warm yellow/orange, jungle theme
//   Squares 25-48  (Antarloka) — blue/teal, sky theme
//   Squares 49-72  (Swarga)    — green/gold, garden theme
//
// Snakes = animals with cute faces
// Ladders = rainbow bridges
// Win square = 72 (Garden of Stars)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { sqP } from '../../shared/utils.js';
import { SNAKES_BALA, LADDERS_BALA, BALA_WIN_SQUARE } from './bala.constants.js';

// Square color by realm
const sqColor = (n) => {
  if (n === BALA_WIN_SQUARE) return { bg:'#ffd700', border:'#ff8c00', text:'#8b4513' };
  if (n <= 24) return { bg:'#fff9e6', border:'#ffd54f', text:'#e65100' };
  if (n <= 48) return { bg:'#e3f2fd', border:'#64b5f6', text:'#1565c0' };
  return { bg:'#e8f5e9', border:'#81c784', text:'#2e7d32' };
};

// Small animal emoji for snake squares
const snakeEmoji = (sq) => SNAKES_BALA[sq]?.animal || '🐍';
// Small flower for ladder squares
const ladderEmoji = (sq) => LADDERS_BALA[sq]?.animal || '🌈';

export default function BalaBoard({ players, pos, cur, win }) {
  const [hov, setHov] = useState(null);
  const nP = players.length;
  const COLS = 8, ROWS = 9; // 8×9 = 72 squares
  const sqSize = 'clamp(36px,7vw,64px)';

  // Build 72-square board (8 wide, snake-order from bottom-left = 1)
  const sqPos = (n) => {
    const row = Math.floor((n - 1) / 8);
    const col = row % 2 === 0 ? (n - 1) % 8 : 7 - ((n - 1) % 8);
    return { row: 8 - row, col };
  };

  const squares = [];
  for (let n = 1; n <= BALA_WIN_SQUARE; n++) {
    const { row, col } = sqPos(n);
    squares.push({ n, row, col });
  }

  const cols = Array.from({ length: COLS }, (_, c) => c);
  const rows = Array.from({ length: ROWS }, (_, r) => r);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Board grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, ${sqSize})`,
        gridTemplateRows: `repeat(${ROWS}, ${sqSize})`,
        gap: 3,
        background: 'linear-gradient(135deg, #fff8e1, #e3f2fd)',
        borderRadius: 16,
        padding: 8,
        border: '3px solid rgba(255,200,50,.5)',
        boxShadow: '0 8px 32px rgba(0,0,0,.12)',
        justifyContent: 'center',
      }}>
        {squares.map(({ n, row, col }) => {
          const isSnake   = !!SNAKES_BALA[n];
          const isLadder  = !!LADDERS_BALA[n];
          const isWin     = n === BALA_WIN_SQUARE;
          const colors    = sqColor(n);
          const players_here = [];
          for (let i = 0; i < nP; i++) {
            if ((pos[i] || 1) === n) players_here.push(i);
          }
          const isActive = players.some((_, i) => (pos[i] || 1) === n && i === cur);

          return (
            <div
              key={n}
              onMouseEnter={() => setHov(n)}
              onMouseLeave={() => setHov(null)}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
                background: isWin
                  ? 'radial-gradient(circle, #ffd700, #ff8c00)'
                  : isSnake ? `${colors.bg}`
                  : isLadder ? `${colors.bg}`
                  : colors.bg,
                border: `2px solid ${hov === n ? '#ff8c00' : isWin ? '#ff8c00' : colors.border}`,
                borderRadius: isWin ? 12 : 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform .15s, box-shadow .15s',
                transform: hov === n ? 'scale(1.08)' : 'scale(1)',
                boxShadow: isActive ? `0 0 0 3px #ff8c00, 0 4px 12px rgba(0,0,0,.2)` : isWin ? '0 0 16px #ffd70080' : 'none',
                overflow: 'hidden',
              }}
            >
              {/* Square number */}
              <div style={{
                position: 'absolute',
                top: 2, left: 4,
                fontSize: 'clamp(7px,1vw,10px)',
                color: colors.text,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                opacity: .7,
              }}>{n}</div>

              {/* Special square icon */}
              {isWin && <div style={{ fontSize: 'clamp(16px,3vw,26px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.3))' }}>⭐</div>}
              {isSnake && !players_here.length && <div style={{ fontSize: 'clamp(12px,2.2vw,18px)' }}>{snakeEmoji(n)}</div>}
              {isLadder && !players_here.length && <div style={{ fontSize: 'clamp(12px,2.2vw,18px)' }}>{ladderEmoji(n)}</div>}

              {/* Player tokens */}
              {players_here.length > 0 && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 1,
                  alignItems: 'center', justifyContent: 'center',
                  position: 'absolute', inset: 0,
                  zIndex: 5,
                }}>
                  {players_here.map(pi => (
                    <div
                      key={pi}
                      style={{
                        width: 'clamp(18px,3vw,28px)',
                        height: 'clamp(18px,3vw,28px)',
                        borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 30%, ${players[pi]?.char?.color || '#ff8c00'}, ${players[pi]?.char?.color || '#ff8c00'}80)`,
                        border: `2.5px solid white`,
                        boxShadow: `0 2px 6px rgba(0,0,0,.3)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'clamp(9px,1.6vw,13px)',
                        animation: pi === cur ? 'balaTokenBounce .6s ease infinite alternate' : 'none',
                      }}
                    >
                      {players[pi]?.char?.icon}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Snake paths (SVG overlay) */}
      <BalaNagaSvg players={players} pos={pos} />

      {/* Ladder paths (SVG overlay) */}
      <BalaLadderSvg players={players} pos={pos} />

      {/* Win square label */}
      <div style={{
        position: 'absolute',
        top: 8, left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
        borderRadius: 20, padding: '2px 12px',
        fontSize: 10, fontFamily: "'Nunito', sans-serif",
        fontWeight: 800, color: '#fff',
        boxShadow: '0 2px 8px rgba(255,140,0,.4)',
        letterSpacing: 1, whiteSpace: 'nowrap',
      }}>
        🌟 Garden of Stars — Square 72 🌟
      </div>
    </div>
  );
}

// Snake SVG overlay — draws animal-themed snakes
function BalaNagaSvg({ players, pos }) {
  const snakes = Object.entries(SNAKES_BALA).map(([from, data]) => ({
    from: Number(from), to: data.to, animal: data.animal,
  }));
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
      {snakes.map(({ from, to, animal }) => (
        <g key={from}>
          <path
            d={`M ${getGridX(from)} ${getGridY(from)} Q ${(getGridX(from)+getGridX(to))/2+5} ${(getGridY(from)+getGridY(to))/2-8} ${getGridX(to)} ${getGridY(to)}`}
            fill="none"
            stroke="rgba(255,80,50,.4)"
            strokeWidth="1.2"
            strokeDasharray="3,2"
          />
        </g>
      ))}
    </svg>
  );
}

function BalaLadderSvg({ players, pos }) {
  const ladders = Object.entries(LADDERS_BALA).map(([from, data]) => ({
    from: Number(from), to: data.to,
  }));
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
      {ladders.map(({ from, to }) => (
        <line
          key={from}
          x1={getGridX(from)} y1={getGridY(from)}
          x2={getGridX(to)}   y2={getGridY(to)}
          stroke="rgba(50,200,100,.45)"
          strokeWidth="1.5"
          strokeDasharray="4,2"
        />
      ))}
    </svg>
  );
}

// Get approximate % coordinates for square n in the 8-wide grid
function getGridX(n) {
  const row = Math.floor((n - 1) / 8);
  const col = row % 2 === 0 ? (n - 1) % 8 : 7 - ((n - 1) % 8);
  return (col / 8) * 100 + 6.25;
}
function getGridY(n) {
  const row = Math.floor((n - 1) / 8);
  return ((8 - row) / 9) * 100 + 5.5;
}
