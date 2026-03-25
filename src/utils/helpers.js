// ═══ HELPER FUNCTIONS ═══
//
// sqP(n) — Convert square number to {row, column} on 10x10 board
// rlm(n) — Get realm name for a square number
// board — Pre-computed array of 100 squares with positions

export function sqP(n){
  if(n>100){
    // Sacred crown row: squares 101-108 are in a special row above the board
    // Positioned across 8 columns centered in the 10-col grid
    const ci=n-101; // 0-7
    return{r:-1,c:ci+1}; // row -1 = above board, columns 1-8 (centered)
  }
  const r=Math.floor((n-1)/10);return{r:9-r,c:r%2===0?(n-1)%10:9-((n-1)%10)}
}
export function rlm(n){return n<=33?"bhuloka":n<=66?"antarloka":n<=100?"svargaloka":"moksha_path"}

// The 8-fold Sacred Path (Ashtanga Marga) — squares 101-108

