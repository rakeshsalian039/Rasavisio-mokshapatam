// ═══════════════════════════════════════════════════════════════════════
// TEMPLE ICONS — 3D animated SVG temples for the game board
// Each temple has a unique architecture matching its knowledge domain
// They float, glow, and pulse above the board squares
// ═══════════════════════════════════════════════════════════════════════

const TEMPLE_STYLES = {
  // ── Vaidyashala (Healing) — Mortar & pestle shape with healing cross ──
  vaidya: ({ size, color }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="tv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gv"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Base platform */}
      <rect x="6" y="32" width="28" height="3" rx="1" fill={color} opacity="0.4"/>
      {/* Temple body — dome shape */}
      <path d="M10 32 L10 22 Q10 14 20 10 Q30 14 30 22 L30 32 Z" fill="url(#tv)" filter="url(#gv)"/>
      {/* Pillars */}
      <rect x="12" y="22" width="2" height="10" fill={color} opacity="0.6"/>
      <rect x="26" y="22" width="2" height="10" fill={color} opacity="0.6"/>
      {/* Cross/healing symbol */}
      <rect x="18" y="16" width="4" height="10" rx="0.5" fill="#fff" opacity="0.7"/>
      <rect x="15" y="19" width="10" height="4" rx="0.5" fill="#fff" opacity="0.7"/>
      {/* Top finial */}
      <circle cx="20" cy="9" r="2.5" fill={color} opacity="0.8"/>
      <line x1="20" y1="6" x2="20" y2="4" stroke={color} strokeWidth="1" opacity="0.6"/>
    </svg>
  ),

  // ── Shilpashala (Engineering) — Anvil/forge with flame ──
  shilpa: ({ size, color }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="ts" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gs"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Base */}
      <rect x="5" y="33" width="30" height="2.5" rx="1" fill={color} opacity="0.4"/>
      {/* Stepped pyramid */}
      <rect x="8" y="28" width="24" height="5" rx="0.5" fill="url(#ts)" filter="url(#gs)"/>
      <rect x="11" y="23" width="18" height="5" rx="0.5" fill="url(#ts)" filter="url(#gs)"/>
      <rect x="14" y="18" width="12" height="5" rx="0.5" fill="url(#ts)" filter="url(#gs)"/>
      {/* Flame on top */}
      <path d="M20 17 Q17 12 20 6 Q23 12 20 17 Z" fill="#ff8030" opacity="0.8">
        <animate attributeName="d" values="M20 17 Q17 12 20 6 Q23 12 20 17 Z;M20 17 Q16 11 20 5 Q24 11 20 17 Z;M20 17 Q17 12 20 6 Q23 12 20 17 Z" dur="1.5s" repeatCount="indefinite"/>
      </path>
      <path d="M20 17 Q18.5 13 20 9 Q21.5 13 20 17 Z" fill="#ffd040" opacity="0.9">
        <animate attributeName="d" values="M20 17 Q18.5 13 20 9 Q21.5 13 20 17 Z;M20 17 Q18 12 20 8 Q22 12 20 17 Z;M20 17 Q18.5 13 20 9 Q21.5 13 20 17 Z" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  ),

  // ── Ganitapeetha (Mathematics) — Pyramid with glowing zero ──
  ganita: ({ size, color }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gg"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Base */}
      <rect x="5" y="33" width="30" height="2.5" rx="1" fill={color} opacity="0.4"/>
      {/* Pyramid */}
      <polygon points="20,6 33,33 7,33" fill="url(#tg)" filter="url(#gg)"/>
      {/* Inner lines — grid */}
      <line x1="20" y1="6" x2="13.5" y2="33" stroke={color} strokeWidth="0.5" opacity="0.3"/>
      <line x1="20" y1="6" x2="26.5" y2="33" stroke={color} strokeWidth="0.5" opacity="0.3"/>
      <line x1="11" y1="26" x2="29" y2="26" stroke={color} strokeWidth="0.5" opacity="0.3"/>
      <line x1="14" y1="19" x2="26" y2="19" stroke={color} strokeWidth="0.5" opacity="0.3"/>
      {/* Zero symbol — glowing */}
      <ellipse cx="20" cy="22" rx="4" ry="5" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.8">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
      </ellipse>
    </svg>
  ),

  // ── Shabdamandir (Sound/Language) — Temple with Om vibrations ──
  shabda: ({ size, color }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="tsh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gsh"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Base */}
      <rect x="5" y="33" width="30" height="2.5" rx="1" fill={color} opacity="0.4"/>
      {/* Temple columns */}
      <rect x="9" y="16" width="2.5" height="17" fill="url(#tsh)" filter="url(#gsh)"/>
      <rect x="28.5" y="16" width="2.5" height="17" fill="url(#tsh)" filter="url(#gsh)"/>
      {/* Beam */}
      <rect x="8" y="14" width="24" height="3" rx="1" fill={color} opacity="0.6"/>
      {/* Dome */}
      <path d="M8 14 Q8 6 20 4 Q32 6 32 14 Z" fill="url(#tsh)" filter="url(#gsh)"/>
      {/* Sound waves radiating */}
      <circle cx="20" cy="24" r="3" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.5">
        <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="24" r="3" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="r" values="3;10;3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      {/* Om symbol */}
      <text x="20" y="27" textAnchor="middle" fontSize="8" fill="#fff" opacity="0.8" fontFamily="serif">ॐ</text>
    </svg>
  ),

  // ── Jyotishapeetha (Astronomy) — Observatory dome with stars ──
  jyotish: ({ size, color }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="tj" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gj"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Base */}
      <rect x="5" y="33" width="30" height="2.5" rx="1" fill={color} opacity="0.4"/>
      {/* Observatory building */}
      <rect x="10" y="22" width="20" height="11" rx="1" fill="url(#tj)" filter="url(#gj)"/>
      {/* Dome */}
      <path d="M10 22 Q10 10 20 7 Q30 10 30 22 Z" fill="url(#tj)" filter="url(#gj)"/>
      {/* Telescope slit */}
      <line x1="20" y1="7" x2="20" y2="22" stroke="#000" strokeWidth="1.5" opacity="0.3"/>
      {/* Stars orbiting */}
      <circle cx="20" cy="14" r="1.2" fill="#fff" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate" values="0 20 20;360 20 20" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="11" r="0.8" fill="#fff" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" values="360 20 20;0 20 20" dur="6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="17" r="0.6" fill="#ffd040" opacity="0.7">
        <animateTransform attributeName="transform" type="rotate" values="0 20 20;360 20 20" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),

  // ── Rajnitipeetha (Statecraft) — Palace/throne with pillars ──
  rajniti: ({ size, color }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="tr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gr"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Base — wide steps */}
      <rect x="4" y="33" width="32" height="2.5" rx="1" fill={color} opacity="0.3"/>
      <rect x="6" y="30.5" width="28" height="2.5" rx="0.5" fill={color} opacity="0.4"/>
      {/* Four pillars */}
      <rect x="8" y="14" width="2" height="16.5" fill="url(#tr)"/>
      <rect x="16" y="14" width="2" height="16.5" fill="url(#tr)"/>
      <rect x="22" y="14" width="2" height="16.5" fill="url(#tr)"/>
      <rect x="30" y="14" width="2" height="16.5" fill="url(#tr)"/>
      {/* Architrave */}
      <rect x="6" y="12" width="28" height="3" rx="0.5" fill={color} opacity="0.7" filter="url(#gr)"/>
      {/* Triangular pediment */}
      <polygon points="20,4 6,12 34,12" fill="url(#tr)" filter="url(#gr)"/>
      {/* Central emblem — scales of justice */}
      <line x1="20" y1="8" x2="20" y2="11" stroke="#fff" strokeWidth="0.8" opacity="0.6"/>
      <line x1="16" y1="10" x2="24" y2="10" stroke="#fff" strokeWidth="0.8" opacity="0.6"/>
      <circle cx="16" cy="11" r="1.2" fill="none" stroke="#fff" strokeWidth="0.6" opacity="0.5"/>
      <circle cx="24" cy="11" r="1.2" fill="none" stroke="#fff" strokeWidth="0.6" opacity="0.5"/>
    </svg>
  ),

  // ── Krshipeetha (Agriculture) — Granary with sprouting plant ──
  krishi: ({ size, color }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="tk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gk"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Earth/base */}
      <ellipse cx="20" cy="34" rx="16" ry="2" fill={color} opacity="0.3"/>
      {/* Granary — rounded barn shape */}
      <path d="M10 33 L10 20 Q10 12 20 10 Q30 12 30 20 L30 33 Z" fill="url(#tk)" filter="url(#gk)"/>
      {/* Door */}
      <rect x="17" y="26" width="6" height="7" rx="3" fill="#000" opacity="0.3"/>
      {/* Growing plant on top */}
      <line x1="20" y1="10" x2="20" y2="4" stroke="#40c040" strokeWidth="1.2" opacity="0.8"/>
      <ellipse cx="17" cy="5" rx="3" ry="2" fill="#40c040" opacity="0.7" transform="rotate(-30 17 5)">
        <animate attributeName="ry" values="2;2.5;2" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="23" cy="6" rx="3" ry="2" fill="#60d060" opacity="0.6" transform="rotate(30 23 6)">
        <animate attributeName="ry" values="2;2.5;2" dur="3s" repeatCount="indefinite" begin="1s"/>
      </ellipse>
      <ellipse cx="20" cy="3.5" rx="2.5" ry="1.8" fill="#80e080" opacity="0.8">
        <animate attributeName="ry" values="1.8;2.2;1.8" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
      </ellipse>
    </svg>
  ),

  // ── Kalapeetha (Arts) — Stage with curtain and spotlight ──
  kala: ({ size, color }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="tka" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gka"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Stage base */}
      <rect x="5" y="31" width="30" height="4" rx="1" fill={color} opacity="0.4"/>
      {/* Curtain left */}
      <path d="M6 8 Q8 12 6 16 Q8 20 6 24 Q8 28 6 31 L12 31 L12 8 Z" fill="url(#tka)" filter="url(#gka)"/>
      {/* Curtain right */}
      <path d="M34 8 Q32 12 34 16 Q32 20 34 24 Q32 28 34 31 L28 31 L28 8 Z" fill="url(#tka)" filter="url(#gka)"/>
      {/* Top bar */}
      <rect x="5" y="6" width="30" height="3" rx="1" fill={color} opacity="0.6"/>
      {/* Spotlight cone */}
      <polygon points="20,9 14,31 26,31" fill="#fff" opacity="0.06"/>
      {/* Dancer silhouette */}
      <circle cx="20" cy="20" r="2" fill="#fff" opacity="0.5"/>
      <line x1="20" y1="22" x2="20" y2="28" stroke="#fff" strokeWidth="1" opacity="0.4"/>
      <line x1="20" y1="24" x2="17" y2="22" stroke="#fff" strokeWidth="0.8" opacity="0.3"/>
      <line x1="20" y1="24" x2="23" y2="21" stroke="#fff" strokeWidth="0.8" opacity="0.3"/>
      {/* Sparkle */}
      <circle cx="16" cy="16" r="0.8" fill="#fff" opacity="0.4">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="25" cy="14" r="0.6" fill="#fff" opacity="0.3">
        <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" repeatCount="indefinite" begin="0.7s"/>
      </circle>
    </svg>
  ),

  // ── Darshanapeetha (Philosophy) — Third eye / infinite spiral ──
  darshan: ({ size, color }) => (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="td" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
        </linearGradient>
        <filter id="gd"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Base — lotus petals */}
      <ellipse cx="20" cy="34" rx="14" ry="2.5" fill={color} opacity="0.3"/>
      {/* Temple body — lotus temple shape */}
      <path d="M12 33 Q8 24 14 16 Q17 12 20 10 Q23 12 26 16 Q32 24 28 33 Z" fill="url(#td)" filter="url(#gd)"/>
      {/* Inner arch */}
      <path d="M15 33 Q14 26 20 18 Q26 26 25 33 Z" fill="#000" opacity="0.2"/>
      {/* Third eye — glowing */}
      <ellipse cx="20" cy="20" rx="3.5" ry="2" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <circle cx="20" cy="20" r="1.2" fill="#fff" opacity="0.7">
        <animate attributeName="r" values="1;1.5;1" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* Top — infinite loop */}
      <path d="M17 10 Q14 7 17 4 Q20 2 23 4 Q26 7 23 10 Q20 12 17 10 Z" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" values="0 20 7;360 20 7" dur="8s" repeatCount="indefinite"/>
      </path>
    </svg>
  ),
};

export default function TempleIcon({ templeKey, size = 28, color = '#c0a040' }) {
  const Renderer = TEMPLE_STYLES[templeKey];
  if (!Renderer) return <span style={{ fontSize: size * 0.6 }}>🏛</span>;
  return (
    <div style={{
      width: size, height: size,
      filter: `drop-shadow(0 2px 4px rgba(0,0,0,.6)) drop-shadow(0 0 ${size * 0.3}px ${color}50)`,
      animation: 'templeFloat 3s ease-in-out infinite',
    }}>
      <Renderer size={size} color={color} />
    </div>
  );
}
