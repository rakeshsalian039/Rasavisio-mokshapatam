// ═══════════════════════════════════════════════════════════════════════
// SACRED PATH ICONS — Bold 3D animated SVG for the 8-fold Ashtanga Marga
// Maximum visibility, strong glow, unmissable animations
// ═══════════════════════════════════════════════════════════════════════

const G = '#f0d050'; // gold
const W = '#fff';    // white core
const O = '#ffa030'; // warm orange

const SACRED_ICONS = {
  // ── 101: यम (Yama) — Closed lotus bud glowing from within ──
  0: ({ size }) => (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <defs>
        <radialGradient id="yg0" cx="50%" cy="40%"><stop offset="0%" stopColor={W} stopOpacity="0.8"/><stop offset="100%" stopColor={G} stopOpacity="0.2"/></radialGradient>
        <filter id="yf0"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      {/* Big glow behind */}
      <circle cx="24" cy="22" r="14" fill={G} opacity="0.12" filter="url(#yf0)">
        <animate attributeName="r" values="12;16;12" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      {/* Stem */}
      <line x1="24" y1="42" x2="24" y2="26" stroke={G} strokeWidth="2.5" opacity="0.6" strokeLinecap="round"/>
      {/* Petals — thick, layered, 3D */}
      <path d="M24 26 Q16 16 13 20 Q16 24 24 26Z" fill={G} opacity="0.8" stroke={G} strokeWidth="0.5"/>
      <path d="M24 26 Q32 16 35 20 Q32 24 24 26Z" fill={G} opacity="0.8" stroke={G} strokeWidth="0.5"/>
      <path d="M24 26 Q18 10 16 16 Q18 22 24 26Z" fill={G} opacity="0.6" stroke={G} strokeWidth="0.3"/>
      <path d="M24 26 Q30 10 32 16 Q30 22 24 26Z" fill={G} opacity="0.6" stroke={G} strokeWidth="0.3"/>
      <path d="M24 26 Q24 6 24 14 Q24 20 24 26Z" fill={O} opacity="0.7"/>
      {/* Inner glow — BRIGHT pulse */}
      <circle cx="24" cy="20" r="5" fill="url(#yg0)">
        <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),

  // ── 102: नियम (Niyama) — Blazing oil lamp ──
  1: ({ size }) => (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <defs>
        <linearGradient id="yg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={W}/><stop offset="50%" stopColor={O}/><stop offset="100%" stopColor={G} stopOpacity="0.3"/></linearGradient>
        <filter id="yf1"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      {/* Flame glow */}
      <ellipse cx="24" cy="14" rx="10" ry="14" fill={O} opacity="0.15" filter="url(#yf1)">
        <animate attributeName="ry" values="12;16;12" dur="1.5s" repeatCount="indefinite"/>
      </ellipse>
      {/* Lamp base */}
      <ellipse cx="24" cy="38" rx="12" ry="4" fill={G} opacity="0.4"/>
      <path d="M14 36 Q14 32 16 30 L32 30 Q34 32 34 36Z" fill={G} opacity="0.3"/>
      <ellipse cx="24" cy="30" rx="9" ry="3" fill={G} opacity="0.5"/>
      {/* Outer flame */}
      <path d="M24 28 Q17 18 19 10 Q21 4 24 2 Q27 4 29 10 Q31 18 24 28Z" fill="url(#yg1)" opacity="0.9">
        <animate attributeName="d" values="M24 28 Q17 18 19 10 Q21 4 24 2 Q27 4 29 10 Q31 18 24 28Z;M24 28 Q15 16 18 8 Q21 2 24 0 Q27 2 30 8 Q33 16 24 28Z;M24 28 Q17 18 19 10 Q21 4 24 2 Q27 4 29 10 Q31 18 24 28Z" dur="1.2s" repeatCount="indefinite"/>
      </path>
      {/* Inner white flame */}
      <path d="M24 28 Q20 20 22 14 Q23 8 24 6 Q25 8 26 14 Q28 20 24 28Z" fill={W} opacity="0.7">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="0.8s" repeatCount="indefinite"/>
      </path>
    </svg>
  ),

  // ── 103: आसन (Asana) — Bold meditating figure with aura rings ──
  2: ({ size }) => (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <defs>
        <filter id="yf2"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      {/* Aura rings — BIG and visible */}
      <circle cx="24" cy="24" r="20" stroke={G} strokeWidth="1" fill="none" opacity="0.15">
        <animate attributeName="r" values="18;22;18" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="24" cy="24" r="14" stroke={G} strokeWidth="0.8" fill="none" opacity="0.2">
        <animate attributeName="r" values="14;17;14" dur="3s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      {/* Glow behind figure */}
      <circle cx="24" cy="22" r="10" fill={G} opacity="0.1" filter="url(#yf2)"/>
      {/* Head */}
      <circle cx="24" cy="14" r="5" fill={G} opacity="0.7"/>
      <circle cx="24" cy="14" r="3.5" fill={O} opacity="0.5"/>
      {/* Body */}
      <line x1="24" y1="19" x2="24" y2="30" stroke={G} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Legs crossed */}
      <path d="M14 36 Q18 30 24 32 Q30 30 34 36" stroke={G} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Arms in gyan mudra */}
      <path d="M14 28 Q18 24 24 26 Q30 24 34 28" stroke={G} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Mudra dots */}
      <circle cx="14" cy="28" r="1.5" fill={G} opacity="0.6"/>
      <circle cx="34" cy="28" r="1.5" fill={G} opacity="0.6"/>
    </svg>
  ),

  // ── 104: प्राणायाम (Pranayama) — Dramatic breath waves ──
  3: ({ size }) => (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <defs>
        <filter id="yf3"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      {/* Center face hint */}
      <circle cx="24" cy="24" r="4" fill={G} opacity="0.2"/>
      {/* LEFT spiral — inhale — blue-gold */}
      <path d="M20 24 Q12 22 8 16 Q4 8 10 4 Q16 2 20 8 Q22 14 20 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
        <animate attributeName="stroke-dasharray" values="0 80;80 0" dur="2.5s" repeatCount="indefinite"/>
      </path>
      {/* RIGHT spiral — exhale — warm */}
      <path d="M28 24 Q36 22 40 16 Q44 8 38 4 Q32 2 28 8 Q26 14 28 24" fill="none" stroke={O} strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
        <animate attributeName="stroke-dasharray" values="80 0;0 80" dur="2.5s" repeatCount="indefinite"/>
      </path>
      {/* Prana particles — BIG and visible */}
      <circle r="2.5" fill={G} opacity="0.8">
        <animate attributeName="cx" values="20;8;14;20" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="24;10;4;24" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0.5;0" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle r="2.5" fill={O} opacity="0.8">
        <animate attributeName="cx" values="28;40;34;28" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="24;10;4;24" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0;0.5;1" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      {/* Center bindu */}
      <circle cx="24" cy="36" r="3" fill={G} opacity="0.5" filter="url(#yf3)">
        <animate attributeName="r" values="2;4;2" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),

  // ── 105: प्रत्याहार (Pratyahara) — Eye dramatically closing ──
  4: ({ size }) => (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <defs>
        <filter id="yf4"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      {/* Eye glow */}
      <ellipse cx="24" cy="24" rx="18" ry="8" fill={G} opacity="0.08" filter="url(#yf4)"/>
      {/* Eye outline — THICK */}
      <ellipse cx="24" cy="24" rx="18" ry="9" stroke={G} strokeWidth="2" fill="none" opacity="0.7"/>
      {/* Iris */}
      <circle cx="24" cy="24" r="6" stroke={G} strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* Pupil — SHRINKS dramatically */}
      <circle cx="24" cy="24" fill={G} opacity="0.8">
        <animate attributeName="r" values="4;1;4" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* Closing eyelid — sweeps down dramatically */}
      <path fill="rgba(12,10,7,.85)" stroke={G} strokeWidth="1" opacity="0.6">
        <animate attributeName="d" values="M6 24 Q15 15 24 15 Q33 15 42 24 L42 24 Q33 15 24 15 Q15 15 6 24Z;M6 24 Q15 23 24 24 Q33 23 42 24 L42 24 Q33 23 24 24 Q15 23 6 24Z;M6 24 Q15 15 24 15 Q33 15 42 24 L42 24 Q33 15 24 15 Q15 15 6 24Z" dur="3s" repeatCount="indefinite"/>
      </path>
    </svg>
  ),

  // ── 106: धारणा (Dharana) — Pulsing Sri Yantra with laser focus ──
  5: ({ size }) => (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <defs>
        <filter id="yf5"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      {/* Background glow */}
      <circle cx="24" cy="24" r="16" fill={G} opacity="0.06" filter="url(#yf5)">
        <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Outer upward triangle */}
      <polygon points="24,2 44,38 4,38" fill="none" stroke={G} strokeWidth="1.5" opacity="0.5"/>
      {/* Outer downward triangle */}
      <polygon points="24,44 4,10 44,10" fill="none" stroke={G} strokeWidth="1.5" opacity="0.5"/>
      {/* Inner upward */}
      <polygon points="24,10 36,32 12,32" fill="none" stroke={G} strokeWidth="1" opacity="0.4"/>
      {/* Inner downward */}
      <polygon points="24,36 12,16 36,16" fill="none" stroke={G} strokeWidth="1" opacity="0.4"/>
      {/* CENTER BINDU — massive pulse */}
      <circle cx="24" cy="24" r="3" fill={G} filter="url(#yf5)">
        <animate attributeName="r" values="2;5;2" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="24" cy="24" r="1.5" fill={W} opacity="0.9"/>
    </svg>
  ),

  // ── 107: ध्यान (Dhyana) — Massive rippling consciousness waves ──
  6: ({ size }) => (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <defs>
        <filter id="yf6"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      {/* Ring 1 — biggest */}
      <circle cx="24" cy="24" r="6" stroke={G} strokeWidth="2" fill="none">
        <animate attributeName="r" values="6;20;6" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="stroke-width" values="2;0.5;2" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* Ring 2 — staggered */}
      <circle cx="24" cy="24" r="6" stroke={O} strokeWidth="1.5" fill="none">
        <animate attributeName="r" values="6;20;6" dur="3s" repeatCount="indefinite" begin="1s"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" begin="1s"/>
      </circle>
      {/* Ring 3 */}
      <circle cx="24" cy="24" r="6" stroke={G} strokeWidth="1" fill="none">
        <animate attributeName="r" values="6;20;6" dur="3s" repeatCount="indefinite" begin="2s"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" begin="2s"/>
      </circle>
      {/* Glowing core */}
      <circle cx="24" cy="24" r="5" fill={G} opacity="0.4" filter="url(#yf6)"/>
      <circle cx="24" cy="24" r="3" fill={W} opacity="0.8">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),

  // ── 108: मोक्ष (MOKSHA) — BLAZING Om with cosmic explosion ──
  7: ({ size }) => (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <defs>
        <radialGradient id="yg7" cx="50%" cy="50%"><stop offset="0%" stopColor={W}/><stop offset="60%" stopColor={G}/><stop offset="100%" stopColor={G} stopOpacity="0"/></radialGradient>
        <filter id="yf7"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      {/* Massive glow */}
      <circle cx="24" cy="24" r="20" fill={G} opacity="0.15" filter="url(#yf7)">
        <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Cosmic rays — 12 beams */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(
        <line key={a} x1={24+Math.cos(a*Math.PI/180)*6} y1={24+Math.sin(a*Math.PI/180)*6}
          x2={24+Math.cos(a*Math.PI/180)*22} y2={24+Math.sin(a*Math.PI/180)*22}
          stroke={G} strokeWidth="1.5" strokeLinecap="round" opacity="0.3">
          <animate attributeName="opacity" values="0.15;0.5;0.15" dur="2s" repeatCount="indefinite" begin={`${a/360*2}s`}/>
          <animate attributeName="x2" values={`${24+Math.cos(a*Math.PI/180)*20}`} dur="0s"/>
          <animate attributeName="y2" values={`${24+Math.sin(a*Math.PI/180)*20}`} dur="0s"/>
        </line>
      ))}
      {/* Core glow */}
      <circle cx="24" cy="24" r="10" fill="url(#yg7)" opacity="0.6">
        <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Om symbol — BIG and bright */}
      <text x="24" y="30" textAnchor="middle" fill={W} fontSize="24" fontFamily="serif" fontWeight="bold"
        style={{filter:'drop-shadow(0 0 4px rgba(240,200,80,0.8))'}}>ॐ</text>
    </svg>
  ),
};

export default function SacredPathIcon({ stepIndex, size = 36 }) {
  const Renderer = SACRED_ICONS[stepIndex];
  if (!Renderer) return <span style={{ fontSize: size * 0.7, color: G }}>🪷</span>;
  return (
    <div style={{
      width: size, height: size,
      filter: `drop-shadow(0 0 ${size*0.3}px rgba(240,200,80,.5)) drop-shadow(0 2px 4px rgba(0,0,0,.6))`,
    }}>
      <Renderer size={size} />
    </div>
  );
}
