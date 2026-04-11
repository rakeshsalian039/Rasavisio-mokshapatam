// ═══════════════════════════════════════════════════════════════════════
// SACRED PATH ICONS — 3D animated SVG for the 8-fold Ashtanga Marga
// Each step has unique symbolism from Patanjali's Yoga Sutras
// They glow, float, and pulse on the sacred crown of the board
// ═══════════════════════════════════════════════════════════════════════

const c = '#f0d050'; // sacred gold
const c2 = '#ffa040'; // warm accent

const SACRED_ICONS = {
  // ── 101: यम (Yama) — Self-restraint: Closed lotus with inner light ──
  0: ({ size }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="sy0" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={c} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gy0"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Stem */}
      <line x1="20" y1="36" x2="20" y2="22" stroke={c} strokeWidth="1.5" opacity="0.5"/>
      {/* Closed petals — restraint */}
      <path d="M20 22 Q14 14 12 18 Q14 20 20 22Z" fill="url(#sy0)" filter="url(#gy0)" opacity="0.7"/>
      <path d="M20 22 Q26 14 28 18 Q26 20 20 22Z" fill="url(#sy0)" filter="url(#gy0)" opacity="0.7"/>
      <path d="M20 22 Q17 10 15 15 Q17 18 20 22Z" fill="url(#sy0)" filter="url(#gy0)" opacity="0.6"/>
      <path d="M20 22 Q23 10 25 15 Q23 18 20 22Z" fill="url(#sy0)" filter="url(#gy0)" opacity="0.6"/>
      <path d="M20 22 Q20 8 20 12 Q20 16 20 22Z" fill={c} opacity="0.5"/>
      {/* Inner glow — restraint holds light within */}
      <circle cx="20" cy="18" r="3" fill={c} opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),

  // ── 102: नियम (Niyama) — Discipline: Sacred flame in a lamp ──
  1: ({ size }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="sy1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c2} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={c} stopOpacity="0.4"/>
        </linearGradient>
        <filter id="gy1"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Oil lamp base */}
      <ellipse cx="20" cy="32" rx="10" ry="3" fill={c} opacity="0.3"/>
      <path d="M12 30 Q12 26 14 24 L26 24 Q28 26 28 30Z" fill={c} opacity="0.25"/>
      {/* Lamp body */}
      <ellipse cx="20" cy="24" rx="7" ry="2.5" fill={c} opacity="0.4"/>
      {/* Flame — discipline burns steady */}
      <path d="M20 23 Q16 16 18 10 Q19 6 20 4 Q21 6 22 10 Q24 16 20 23Z" fill="url(#sy1)" filter="url(#gy1)">
        <animate attributeName="d" values="M20 23 Q16 16 18 10 Q19 6 20 4 Q21 6 22 10 Q24 16 20 23Z;M20 23 Q15 15 17 9 Q19 5 20 3 Q21 5 23 9 Q25 15 20 23Z;M20 23 Q16 16 18 10 Q19 6 20 4 Q21 6 22 10 Q24 16 20 23Z" dur="2s" repeatCount="indefinite"/>
      </path>
      {/* Inner white flame */}
      <path d="M20 23 Q18 18 19 13 Q20 9 20 8 Q20 9 21 13 Q22 18 20 23Z" fill="#fff" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" repeatCount="indefinite"/>
      </path>
    </svg>
  ),

  // ── 103: आसन (Asana) — Steadiness: Meditating figure on mountain ──
  2: ({ size }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="sy2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={c} stopOpacity="0.2"/>
        </linearGradient>
        <filter id="gy2"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Mountain */}
      <polygon points="20,14 34,36 6,36" fill={c} opacity="0.12"/>
      <polygon points="20,14 28,36 12,36" fill={c} opacity="0.08"/>
      {/* Figure in padmasana */}
      <circle cx="20" cy="18" r="3" stroke={c} strokeWidth="1.2" fill="none" filter="url(#gy2)"/>
      {/* Body */}
      <path d="M20 21 L20 28" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      {/* Crossed legs */}
      <path d="M14 30 Q17 27 20 28 Q23 27 26 30" stroke={c} strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Arms in mudra */}
      <path d="M15 25 Q17 23 20 24 Q23 23 25 25" stroke={c} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Aura */}
      <circle cx="20" cy="22" r="10" stroke={c} strokeWidth="0.5" fill="none" opacity="0.15">
        <animate attributeName="r" values="10;12;10" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="4s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),

  // ── 104: प्राणायाम (Pranayama) — Life-force: Breath spirals ──
  3: ({ size }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <filter id="gy3"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Nose/face silhouette */}
      <path d="M18 22 Q18 18 20 16 Q22 18 22 22" stroke={c} strokeWidth="1" fill="none" opacity="0.4"/>
      {/* Left breath spiral — inhale */}
      <path d="M16 22 Q10 20 8 16 Q6 12 10 10 Q14 8 16 12" fill="none" stroke={c} strokeWidth="1.2" strokeLinecap="round" filter="url(#gy3)" opacity="0.7">
        <animate attributeName="stroke-dasharray" values="0 60;60 0" dur="3s" repeatCount="indefinite"/>
      </path>
      {/* Right breath spiral — exhale */}
      <path d="M24 22 Q30 20 32 16 Q34 12 30 10 Q26 8 24 12" fill="none" stroke={c2} strokeWidth="1.2" strokeLinecap="round" filter="url(#gy3)" opacity="0.7">
        <animate attributeName="stroke-dasharray" values="60 0;0 60" dur="3s" repeatCount="indefinite"/>
      </path>
      {/* Prana dots flowing */}
      <circle cx="12" cy="14" r="1" fill={c} opacity="0.5">
        <animate attributeName="cy" values="22;10;22" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="28" cy="14" r="1" fill={c2} opacity="0.5">
        <animate attributeName="cy" values="10;22;10" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* Center bindu */}
      <circle cx="20" cy="28" r="2" fill={c} opacity="0.3">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),

  // ── 105: प्रत्याहार (Pratyahara) — Withdrawal: Eye closing with veil ──
  4: ({ size }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <filter id="gy4"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Eye shape */}
      <ellipse cx="20" cy="20" rx="12" ry="6" stroke={c} strokeWidth="1" fill="none" filter="url(#gy4)" opacity="0.6"/>
      {/* Iris */}
      <circle cx="20" cy="20" r="4" stroke={c} strokeWidth="0.8" fill="none" opacity="0.5"/>
      {/* Pupil — shrinking (withdrawing) */}
      <circle cx="20" cy="20" r="2" fill={c} opacity="0.6">
        <animate attributeName="r" values="2;0.5;2" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="4s" repeatCount="indefinite"/>
      </circle>
      {/* Closing eyelid — veil descending */}
      <path d="M8 20 Q14 14 20 14 Q26 14 32 20" fill="rgba(12,10,7,.7)" stroke={c} strokeWidth="0.5" opacity="0.4">
        <animate attributeName="d" values="M8 20 Q14 14 20 14 Q26 14 32 20;M8 20 Q14 20 20 20 Q26 20 32 20;M8 20 Q14 14 20 14 Q26 14 32 20" dur="4s" repeatCount="indefinite"/>
      </path>
    </svg>
  ),

  // ── 106: धारणा (Dharana) — Concentration: Sri Yantra focused ──
  5: ({ size }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <filter id="gy5"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Outer triangle up */}
      <polygon points="20,4 34,32 6,32" fill="none" stroke={c} strokeWidth="0.8" opacity="0.35" filter="url(#gy5)"/>
      {/* Inner triangle down */}
      <polygon points="20,32 6,10 34,10" fill="none" stroke={c} strokeWidth="0.8" opacity="0.35"/>
      {/* Middle triangle up */}
      <polygon points="20,10 28,26 12,26" fill="none" stroke={c} strokeWidth="0.6" opacity="0.4"/>
      {/* Middle triangle down */}
      <polygon points="20,26 12,14 28,14" fill="none" stroke={c} strokeWidth="0.6" opacity="0.4"/>
      {/* Center — bindu of concentration */}
      <circle cx="20" cy="19" r="2.5" fill={c} opacity="0.5" filter="url(#gy5)">
        <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Focus rays */}
      {[0,45,90,135,180,225,270,315].map(angle=>(
        <line key={angle} x1="20" y1="19" x2={20+Math.cos(angle*Math.PI/180)*14} y2={19+Math.sin(angle*Math.PI/180)*14}
          stroke={c} strokeWidth="0.3" opacity="0.15"/>
      ))}
    </svg>
  ),

  // ── 107: ध्यान (Dhyana) — Meditation: Rippling consciousness ──
  6: ({ size }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <filter id="gy6"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Expanding consciousness rings */}
      <circle cx="20" cy="20" r="4" stroke={c} strokeWidth="0.8" fill="none" opacity="0.6">
        <animate attributeName="r" values="4;14;4" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="20" r="4" stroke={c} strokeWidth="0.6" fill="none" opacity="0.4">
        <animate attributeName="r" values="4;14;4" dur="4s" repeatCount="indefinite" begin="1.3s"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="4s" repeatCount="indefinite" begin="1.3s"/>
      </circle>
      <circle cx="20" cy="20" r="4" stroke={c} strokeWidth="0.4" fill="none" opacity="0.3">
        <animate attributeName="r" values="4;14;4" dur="4s" repeatCount="indefinite" begin="2.6s"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite" begin="2.6s"/>
      </circle>
      {/* Core — still point */}
      <circle cx="20" cy="20" r="3" fill={c} opacity="0.4" filter="url(#gy6)"/>
      <circle cx="20" cy="20" r="1.5" fill="#fff" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),

  // ── 108: मोक्ष (MOKSHA) — Liberation: Blazing Om with cosmic burst ──
  7: ({ size }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="sy7" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor={c} stopOpacity="0.6"/>
        </linearGradient>
        <filter id="gy7"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Cosmic burst rays */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(angle=>(
        <line key={angle} x1="20" y1="20"
          x2={20+Math.cos(angle*Math.PI/180)*18} y2={20+Math.sin(angle*Math.PI/180)*18}
          stroke={c} strokeWidth="0.6" opacity="0.2">
          <animate attributeName="opacity" values="0.1;0.35;0.1" dur="3s" repeatCount="indefinite"
            begin={`${angle/360*3}s`}/>
        </line>
      ))}
      {/* Outer glow */}
      <circle cx="20" cy="20" r="12" fill={c} opacity="0.06" filter="url(#gy7)">
        <animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* Om symbol */}
      <text x="20" y="25" textAnchor="middle" fill="url(#sy7)" fontSize="20" fontFamily="serif" fontWeight="bold" filter="url(#gy7)">ॐ</text>
    </svg>
  ),
};

export default function SacredPathIcon({ stepIndex, size = 28 }) {
  const Renderer = SACRED_ICONS[stepIndex];
  if (!Renderer) return <span style={{ fontSize: size * 0.6 }}>🪷</span>;
  return (
    <div style={{
      width: size, height: size,
      filter: `drop-shadow(0 0 ${size * 0.25}px rgba(240,200,80,.4))`,
    }}>
      <Renderer size={size} />
    </div>
  );
}
