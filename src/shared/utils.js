// ─────────────────────────────────────────────────────────────────────────────
// shared/utils.js
// Board layout helpers — shared across all three game tiers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * sqP(n) — returns the {r, c} grid position for square number n
 * Squares 1-100: standard 10×10 board (snake-order, bottom-left = 1)
 * Squares 101-108: sacred crown row above the board
 */
export function sqP(n) {
  if (n > 100) {
    const ci = n - 101; // 0-7
    return { r: -1, c: ci + 1 }; // row -1 = above board, columns 1-8 (centered)
  }
  const r = Math.floor((n - 1) / 10);
  return { r: 9 - r, c: r % 2 === 0 ? (n - 1) % 10 : 9 - ((n - 1) % 10) };
}

/**
 * rlm(n) — returns the cosmic realm name for square n
 * bhuloka (1-33) | antarloka (34-66) | svargaloka (67-100) | moksha_path (101+)
 */
export function rlm(n) {
  return n <= 33 ? 'bhuloka'
       : n <= 66 ? 'antarloka'
       : n <= 100 ? 'svargaloka'
       : 'moksha_path';
}
