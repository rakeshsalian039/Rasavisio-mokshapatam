// ─────────────────────────────────────────────────────────────────────────────
// tiers/bala/BalaGame.jsx — Bala Marg: The Panchatantra Forest
// Same flow as Moksha: title → story → pickcount → mayavi → setup → game
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  CHARS_BALA, SNAKES_BALA, LADDERS_BALA, DLM_SQ_BALA, DILEMMAS_BALA,
  DISCOVERY_SQUARES, STAR_MESSAGES, PANDITJI, BALA_STORY_PAGES,
  MAYAVI_TAUNTS_SNAKE, MAYAVI_TAUNTS_WRONG, MAYAVI_TAUNTS_LADDER,
  BALA_WIN_STARS, getBalaRealm, CROWN_RIDDLES, CROWN_RIDDLE_SQ,
} from './bala.constants.js';
import { LottieOverlay, LottieInline, CHAR_LOTTIES } from './BalaLottie.jsx';

// ── sqP + sqCenter: same layout as Moksha, SVG viewBox 0 0 100 110 ────────
function sqP(n) {
  if (n > 100) { const ci = n - 101; return { r:-1, c:ci+1 }; }
  const r = Math.floor((n-1)/10);
  return { r:9-r, c:r%2===0?(n-1)%10:9-((n-1)%10) };
}
function sqCenter(n) {
  // ViewBox is "0 0 100 110" — 10 cols × 11 rows, each cell = 10×10 units
  const {r,c} = sqP(n);
  const cw = 10, rh = 10; // cell width / height in viewBox units
  if (r === -1) return { x:(c+0.5)*cw, y:rh*0.5 };      // crown row
  return { x:(c+0.5)*cw, y:(r+1.5)*rh };                 // main rows
}

// ── useAmbient ────────────────────────────────────────────────────────────────
function useAmbient(){
  const ref=useRef(null),playing=useRef(false);
  const start=()=>{if(playing.current)return;try{const a=new Audio('/ambient.mp3');a.loop=true;a.volume=0.5;ref.current=a;a.play().then(()=>{playing.current=true}).catch(()=>{})}catch(e){}};
  const stop=()=>{if(!playing.current||!ref.current)return;try{ref.current.pause();ref.current.currentTime=0;playing.current=false;ref.current=null}catch(e){}};
  return{start,stop};
}

// ── Global CSS ────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Noto+Serif+Devanagari:wght@400;700;900&family=Baloo+2:wght@400;600;700;800&display=swap');
*{box-sizing:border-box;margin:0}
body{margin:0;background:#130800}

@keyframes bFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes bPop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes bBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.05)}}
@keyframes bPulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
@keyframes bSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes bWiggle{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes bGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(240,165,0,.4))}50%{filter:drop-shadow(0 0 16px rgba(240,165,0,.8))}}
@keyframes bRainbow{0%{color:#f0a500}33%{color:#e8660a}66%{color:#dda44f}100%{color:#f0a500}}
@keyframes bSlide{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
@keyframes bSlideLeft{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
@keyframes mayaviIn{from{opacity:0;transform:translateY(30px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes snakePulse{0%,100%{filter:drop-shadow(0 0 3px rgba(200,60,20,.4))}50%{filter:drop-shadow(0 0 10px rgba(200,60,20,.8))}}
@keyframes ladderShine{0%,100%{filter:drop-shadow(0 0 3px rgba(240,165,0,.3))}50%{filter:drop-shadow(0 0 10px rgba(240,165,0,.7))}}
@keyframes gyaanPulse{0%,100%{text-shadow:0 0 8px rgba(240,165,0,.4)}50%{text-shadow:0 0 20px rgba(240,165,0,.9)}}
@keyframes agyanPulse{0%,100%{text-shadow:0 0 8px rgba(150,100,80,.3)}50%{text-shadow:0 0 15px rgba(150,100,80,.6)}}
@keyframes firefly{0%,100%{opacity:.1;transform:translate(0,0)}25%{opacity:.6;transform:translate(8px,-12px)}50%{opacity:.3;transform:translate(-6px,-20px)}75%{opacity:.7;transform:translate(10px,-8px)}}
@keyframes forestSway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}
@keyframes balaTokenBounce{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-4px) scale(1.1)}}

@keyframes lotusFloat{0%,100%{transform:translateY(0) rotate(-5deg);opacity:.7}50%{transform:translateY(-12px) rotate(5deg);opacity:1}}
@keyframes lanternGlow{0%,100%{box-shadow:0 0 20px rgba(240,165,0,.2),0 0 40px rgba(232,102,10,.1)}50%{box-shadow:0 0 35px rgba(240,165,0,.4),0 0 70px rgba(232,102,10,.2)}}
@keyframes scrollUnroll{0%{opacity:0;transform:scaleY(0.1) translateY(-20px);transform-origin:top}60%{opacity:1;transform:scaleY(1.04) translateY(0)}100%{transform:scaleY(1) translateY(0)}}
@keyframes diyaFlicker{0%,100%{opacity:.85;transform:scaleY(1) skewX(0deg)}25%{opacity:1;transform:scaleY(1.08) skewX(-2deg)}75%{opacity:.9;transform:scaleY(.95) skewX(2deg)}}
@keyframes goldShimmer{0%,100%{text-shadow:0 0 10px rgba(240,165,0,.3),0 2px 4px rgba(0,0,0,.8)}50%{text-shadow:0 0 25px rgba(240,165,0,.7),0 0 50px rgba(232,102,10,.3),0 2px 4px rgba(0,0,0,.8)}}
@keyframes rangoliSpin{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.05)}100%{transform:rotate(360deg) scale(1)}}
@keyframes bellRing{0%,100%{transform:rotate(0deg)}15%{transform:rotate(12deg)}30%{transform:rotate(-10deg)}45%{transform:rotate(8deg)}60%{transform:rotate(-6deg)}}
@keyframes vineSway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}
@keyframes parchmentShimmer{0%{background-position:-200% center}100%{background-position:200% center}}

.bb{background:linear-gradient(135deg,#3d1a00,#6a3000);border:2px solid rgba(240,165,0,.4);color:#f7e8c8;padding:12px 26px;font-size:clamp(14px,2.3vw,17px);font-family:'Baloo 2',sans-serif;font-weight:800;cursor:pointer;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,.5),inset 0 1px 0 rgba(240,165,0,.2);transition:all .2s;letter-spacing:.5px;border:none;outline:none}
.bb:hover{background:linear-gradient(135deg,#5a2500,#8a4000);box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 20px rgba(240,165,0,.15)}
.bb:active{transform:scale(.97)}
.bb:disabled{background:linear-gradient(135deg,#1a1008,#120c05);border-color:rgba(255,255,255,.08);color:rgba(255,255,255,.25);box-shadow:none;cursor:default}
.gb{background:transparent;border:1px solid rgba(240,165,0,.25);color:rgba(240,165,0,.65);padding:8px 20px;font-size:12px;font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;transition:all .3s;letter-spacing:2px;border-radius:3px}
.gb:hover{background:rgba(240,165,0,.06);border-color:rgba(240,165,0,.5)}
.bc{width:100%;background:rgba(20,10,0,.8);border:2px solid transparent;border-radius:6px;padding:12px 14px;font-size:clamp(12px,1.9vw,14px);font-family:'Baloo 2',sans-serif;font-weight:700;cursor:pointer;text-align:left;transition:all .18s;color:rgba(247,232,200,.8);display:flex;align-items:flex-start;gap:10px;line-height:1.6}
.bc-wise{border-color:rgba(80,160,60,.5);background:rgba(20,50,10,.85)}
.bc-wise:hover{background:rgba(30,70,15,.9)}
.bc-oops{border-color:rgba(200,80,20,.4);background:rgba(60,20,5,.85)}
.bc-oops:hover{background:rgba(80,30,8,.9)}
`;

// ── Animal SVGs ───────────────────────────────────────────────────────────────
function AnimalSVG({ id, size=60, animate=true }) {
  const anim = animate ? 'bFloat 2.5s ease infinite' : 'none';
  const s = size;
  if (id==='elephant') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:anim}}>
      <ellipse cx="50" cy="62" rx="32" ry="26" fill="#9e9e9e"/>
      <circle cx="50" cy="38" r="24" fill="#bdbdbd"/>
      <ellipse cx="29" cy="33" rx="11" ry="15" fill="#9e9e9e" transform="rotate(-15,29,33)"/>
      <ellipse cx="71" cy="33" rx="11" ry="15" fill="#9e9e9e" transform="rotate(15,71,33)"/>
      <ellipse cx="29" cy="32" rx="7" ry="10" fill="#f8bbd0" transform="rotate(-15,29,32)"/>
      <ellipse cx="71" cy="32" rx="7" ry="10" fill="#f8bbd0" transform="rotate(15,71,32)"/>
      <path d="M43 57 Q50 72 57 57 Q50 51 43 57Z" fill="#757575"/>
      <circle cx="42" cy="34" r="5" fill="white"/><circle cx="43.5" cy="34" r="3" fill="#212121"/>
      <circle cx="58" cy="34" r="5" fill="white"/><circle cx="59.5" cy="34" r="3" fill="#212121"/>
      <path d="M43 44 Q50 49 57 44" stroke="#757575" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id==='tiger') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:anim}}>
      <circle cx="50" cy="50" r="36" fill="#ff8f00"/>
      <ellipse cx="30" cy="30" rx="13" ry="16" fill="#ff8f00"/>
      <ellipse cx="70" cy="30" rx="13" ry="16" fill="#ff8f00"/>
      <ellipse cx="30" cy="29" rx="8" ry="10" fill="#ffe082"/>
      <ellipse cx="70" cy="29" rx="8" ry="10" fill="#ffe082"/>
      <path d="M24 42 Q28 36 36 40" stroke="#333" strokeWidth="2.5" fill="none"/>
      <path d="M76 42 Q72 36 64 40" stroke="#333" strokeWidth="2.5" fill="none"/>
      <circle cx="50" cy="60" r="18" fill="#ffe082"/>
      <circle cx="42" cy="48" r="5" fill="white"/><circle cx="43.5" cy="48" r="3" fill="#4e342e"/>
      <circle cx="58" cy="48" r="5" fill="white"/><circle cx="59.5" cy="48" r="3" fill="#4e342e"/>
      <path d="M43 67 Q50 72 57 67" stroke="#e65100" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id==='rabbit') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:anim}}>
      <ellipse cx="34" cy="20" rx="9" ry="22" fill="#f5f5f5"/>
      <ellipse cx="66" cy="20" rx="9" ry="22" fill="#f5f5f5"/>
      <ellipse cx="34" cy="20" rx="6" ry="18" fill="#f8bbd0"/>
      <ellipse cx="66" cy="20" rx="6" ry="18" fill="#f8bbd0"/>
      <circle cx="50" cy="52" r="27" fill="#f5f5f5"/>
      <circle cx="50" cy="43" r="20" fill="#f5f5f5"/>
      <circle cx="41" cy="41" r="5" fill="white"/><circle cx="42" cy="41" r="3.5" fill="#ec407a"/>
      <circle cx="59" cy="41" r="5" fill="white"/><circle cx="60" cy="41" r="3.5" fill="#ec407a"/>
      <ellipse cx="50" cy="52" rx="7" ry="4.5" fill="#f8bbd0"/>
      <path d="M44 59 Q50 63 56 59" stroke="#e91e63" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id==='deer') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:anim}}>
      <path d="M28 8 L32 25 M28 8 L20 18 M28 8 L36 18" stroke="#8d6e63" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M72 8 L68 25 M72 8 L80 18 M72 8 L64 18" stroke="#8d6e63" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="50" cy="60" rx="28" ry="24" fill="#a1887f"/>
      <circle cx="50" cy="40" r="22" fill="#bcaaa4"/>
      <circle cx="50" cy="48" r="16" fill="#d7ccc8"/>
      <circle cx="41" cy="38" r="5" fill="white"/><circle cx="42.5" cy="38" r="3.5" fill="#4e342e"/>
      <circle cx="59" cy="38" r="5" fill="white"/><circle cx="60.5" cy="38" r="3.5" fill="#4e342e"/>
      <path d="M44 56 Q50 60 56 56" stroke="#795548" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id==='monkey') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:'bBounce 1.2s ease infinite'}}>
      <ellipse cx="26" cy="38" rx="14" ry="18" fill="#8d6e63"/>
      <ellipse cx="74" cy="38" rx="14" ry="18" fill="#8d6e63"/>
      <ellipse cx="26" cy="38" rx="9" ry="12" fill="#f8bbd0"/>
      <ellipse cx="74" cy="38" rx="9" ry="12" fill="#f8bbd0"/>
      <circle cx="50" cy="50" r="28" fill="#8d6e63"/>
      <circle cx="50" cy="56" r="20" fill="#d7ccc8"/>
      <circle cx="41" cy="46" r="5" fill="white"/><circle cx="42" cy="46" r="3.5" fill="#3e2723"/>
      <circle cx="59" cy="46" r="5" fill="white"/><circle cx="60" cy="46" r="3.5" fill="#3e2723"/>
      <path d="M43 65 Q50 70 57 65" stroke="#6d4c41" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M78 54 Q90 48 92 62 Q90 72 80 69" stroke="#8d6e63" strokeWidth="5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id==='peacock') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:'bSpin 6s linear infinite'}}>
      {[0,40,80,120,160,200,240,280,320].map((d,i)=>(
        <ellipse key={i} cx="50" cy="50" rx="5" ry="22"
          fill={i%3===0?'#00acc1':i%3===1?'#7b1fa2':'#2e7d32'}
          transform={`rotate(${d},50,50) translate(0,-16)`} opacity=".85"/>
      ))}
      <circle cx="50" cy="50" r="17" fill="#1565c0"/>
      <circle cx="50" cy="50" r="12" fill="#42a5f5"/>
      <circle cx="43" cy="47" r="3.5" fill="white"/><circle cx="44" cy="47" r="2.2" fill="#0d47a1"/>
      <circle cx="57" cy="47" r="3.5" fill="white"/><circle cx="58" cy="47" r="2.2" fill="#0d47a1"/>
      <path d="M47 43 L45 37 M50 42 L50 36 M53 43 L55 37" stroke="#ffd54f" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
  return <span style={{fontSize:s*.55}}>{CHARS_BALA.find(c=>c.id===id)?.icon||'🐾'}</span>;
}

// ── Corner Ornament ───────────────────────────────────────────────────────────
function CornerOrnament({ pos }) {
  const styles = {
    tl: { top: 0, left: 0, transform: 'rotate(0deg)' },
    tr: { top: 0, right: 0, transform: 'rotate(90deg)' },
    br: { bottom: 0, right: 0, transform: 'rotate(180deg)' },
    bl: { bottom: 0, left: 0, transform: 'rotate(270deg)' },
  };
  return (
    <svg width="14" height="14" viewBox="0 0 14 14"
      style={{ position: 'absolute', ...styles[pos], opacity: .45, pointerEvents: 'none' }}>
      <path d="M0,0 L14,0 L14,2.5 Q2.5,2.5 2.5,14 L0,14 Z" fill="#f0a500"/>
    </svg>
  );
}

function DharmaScaleSVG({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52">
      <line x1="26" y1="10" x2="26" y2="42" stroke="#f0a500" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="6" y1="20" x2="46" y2="20" stroke="#f0a500" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6,20 Q3,27 6,31 Q9,35 13,31 Q17,27 13,20" fill="none" stroke="#e8660a" strokeWidth="1.8"/>
      <path d="M39,20 Q36,27 39,31 Q42,35 46,31 Q50,27 46,20" fill="none" stroke="#e8660a" strokeWidth="1.8"/>
      <polygon points="22,42 26,32 30,42" fill="#f0a500" opacity=".6"/>
      <text x="26" y="16" textAnchor="middle" fontSize="7" fill="#f0a500" opacity=".5">॥</text>
    </svg>
  );
}

// ── Panditji SVG ──────────────────────────────────────────────────────────────
function PanditjiSVG({ size=64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{animation:'bWiggle 3s ease infinite',flexShrink:0}}>
      <ellipse cx="50" cy="72" rx="26" ry="22" fill="#f5c87a"/>
      <ellipse cx="50" cy="58" rx="20" ry="18" fill="#f5c87a"/>
      <circle cx="50" cy="36" r="20" fill="#f5c87a"/>
      <ellipse cx="50" cy="20" rx="20" ry="10" fill="#ff8f00"/>
      <ellipse cx="50" cy="18" rx="16" ry="7" fill="#ffa000"/>
      <circle cx="50" cy="15" r="4" fill="#ffd54f"/>
      <line x1="50" y1="22" x2="50" y2="28" stroke="#c03010" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="43" cy="35" r="4" fill="white"/><circle cx="44" cy="35" r="2.5" fill="#4e342e"/>
      <circle cx="57" cy="35" r="4" fill="white"/><circle cx="58" cy="35" r="2.5" fill="#4e342e"/>
      <path d="M38 44 Q50 54 62 44 Q58 58 50 60 Q42 58 38 44Z" fill="white"/>
      <rect x="72" y="25" width="4" height="55" rx="2" fill="#8d6e63"/>
      <circle cx="74" cy="22" r="5" fill="#ffd54f"/>
      <rect x="18" y="52" width="16" height="12" rx="3" fill="#fff8e1" stroke="#8a5000" strokeWidth="1.5"/>
      <line x1="21" y1="57" x2="31" y2="57" stroke="#e65100" strokeWidth="1"/>
      <line x1="21" y1="60" x2="28" y2="60" stroke="#e65100" strokeWidth="1"/>
    </svg>
  );
}

// ── Mayavi the Blue Jackal SVG ────────────────────────────────────────────────
function MayaviSVG({ size=120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      {/* Body */}
      <ellipse cx="100" cy="140" rx="55" ry="45" fill="#1a237e"/>
      {/* Head */}
      <circle cx="100" cy="85" r="42" fill="#283593"/>
      {/* Snout */}
      <ellipse cx="100" cy="105" rx="22" ry="16" fill="#1565c0"/>
      {/* Ears */}
      <polygon points="60,58 45,20 80,48" fill="#1a237e"/>
      <polygon points="140,58 155,20 120,48" fill="#1a237e"/>
      <polygon points="62,56 50,30 78,50" fill="#3949ab"/>
      <polygon points="138,56 150,30 122,50" fill="#3949ab"/>
      {/* Eyes — cunning, glowing */}
      <circle cx="84" cy="80" r="9" fill="#ffd700"/>
      <circle cx="116" cy="80" r="9" fill="#ffd700"/>
      <circle cx="86" cy="80" r="5" fill="#212121"/>
      <circle cx="118" cy="80" r="5" fill="#212121"/>
      <circle cx="87" cy="78" r="1.5" fill="white"/>
      <circle cx="119" cy="78" r="1.5" fill="white"/>
      {/* Nose */}
      <ellipse cx="100" cy="107" rx="6" ry="4" fill="#0d47a1"/>
      {/* Cunning smile */}
      <path d="M83 116 Q100 126 117 116" stroke="#7986cb" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M83 116 Q80 122 85 122" stroke="#7986cb" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M117 116 Q120 122 115 122" stroke="#7986cb" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Collar/robe detail */}
      <path d="M55 140 Q100 130 145 140" stroke="#3f51b5" strokeWidth="4" fill="none"/>
      {/* Tail */}
      <path d="M155 155 Q180 140 175 120 Q170 105 160 110" stroke="#283593" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <circle cx="160" cy="110" r="6" fill="#1a237e"/>
      {/* Crown (stolen, tilted) */}
      <polygon points="72,58 80,35 90,52 100,32 110,52 120,35 128,58" fill="#ffd700" opacity=".7"/>
    </svg>
  );
}

// ── Realm-aware square color helpers ─────────────────────────────────────────
function getRealmSqBg(n) {
  if (n <= 27) return 'rgba(30,70,0,.55)';
  if (n <= 54) return 'rgba(8,30,70,.55)';
  if (n <= 81) return 'rgba(70,15,5,.55)';
  return 'rgba(60,35,0,.55)';
}
function getRealmSqBorder(n) {
  if (n <= 27) return 'rgba(80,150,30,.12)';
  if (n <= 54) return 'rgba(40,100,180,.12)';
  if (n <= 81) return 'rgba(150,50,20,.12)';
  return 'rgba(200,140,0,.12)';
}
function getRealmNumColor(n) {
  if (n <= 27) return 'rgba(200,240,150,.4)';
  if (n <= 54) return 'rgba(150,200,255,.4)';
  if (n <= 81) return 'rgba(255,180,150,.4)';
  return 'rgba(255,215,100,.4)';
}

// ── BOARD with snake SVG paths ────────────────────────────────────────────────
function BalaBoard({ players, pos, cur }) {
  const playersSq = players.map((_,pi) => pos[pi]||1);

  // Pre-sort squares into visual order (top-left to bottom-right) like Moksha
  const mainBoard = [];
  for (let r=0; r<10; r++) {
    for (let c=0; c<10; c++) {
      const row = 9 - r;
      const n = row*10 + (row%2===0 ? c : 9-c) + 1;
      mainBoard.push(n);
    }
  }

  // SVG coordinates for snake/ladder overlay: viewBox "0 0 100 100", same as Moksha
  const sq2xy = (n) => {
    if(n<1||n>100) return {x:50,y:50};
    const origRow = Math.floor((n-1)/10);
    const r = 9 - origRow;
    const c = origRow%2===0 ? (n-1)%10 : 9-((n-1)%10);
    return { x: c*10+5, y: r*10+5 };
  };

  const snakePath = (f, t) => {
    const fc=sq2xy(f), tc=sq2xy(t);
    const dx=tc.x-fc.x, dy=tc.y-fc.y, len=Math.sqrt(dx*dx+dy*dy);
    const px=-dy/len, py=dx/len, wave=Math.min(len*.35,13);
    return {
      fc, tc,
      d:`M${fc.x},${fc.y} C${(fc.x+dx*.28+px*wave).toFixed(1)},${(fc.y+dy*.28+py*wave).toFixed(1)} ${(fc.x+dx*.72-px*wave).toFixed(1)},${(fc.y+dy*.72-py*wave).toFixed(1)} ${tc.x},${tc.y}`
    };
  };

  const ladderParts = (f, t) => {
    const fc=sq2xy(f), tc=sq2xy(t);
    const dx=tc.x-fc.x, dy=tc.y-fc.y, len=Math.sqrt(dx*dx+dy*dy);
    const px=-dy/len*1.5, py=dx/len*1.5;
    const nn=Math.max(3,Math.floor(len/8));
    const rungs=[];
    for(let i=0;i<=nn;i++){const t2=i/nn;rungs.push({x1:fc.x+t2*dx+px,y1:fc.y+t2*dy+py,x2:fc.x+t2*dx-px,y2:fc.y+t2*dy-py});}
    return {fc,tc,rungs,r1:{x1:fc.x+px,y1:fc.y+py,x2:tc.x+px,y2:tc.y+py},r2:{x1:fc.x-px,y1:fc.y-py,x2:tc.x-px,y2:tc.y-py}};
  };

  return (
    <div style={{width:'100%',userSelect:'none'}}>

      {/* CROWN ROW 101-108 */}
      <div style={{position:'relative',overflow:'hidden',
        background:'linear-gradient(180deg,rgba(180,130,0,.12),rgba(10,5,0,.9))',
        borderBottom:'2px solid rgba(240,165,0,.12)',
        padding:'5px 3px 3px',borderRadius:'8px 8px 0 0'}}>
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',
          pointerEvents:'none',opacity:.05}} viewBox="0 0 200 50" preserveAspectRatio="none">
          {[0,25,50,75,100,125,150,175].map(x=>(
            <g key={x}>
              <path d={`M${x},50 Q${x+8},28 ${x+16},8 Q${x+20},2 ${x+25},0`}
                fill="none" stroke="#f0a500" strokeWidth="1.2"/>
              <circle cx={x+8} cy={30} r="3.5" fill="none" stroke="#f0a500" strokeWidth=".7"/>
            </g>
          ))}
        </svg>
        <div style={{fontSize:'clamp(5px,.8vw,8px)',textAlign:'center',letterSpacing:3,
          color:'rgba(240,165,0,.5)',opacity:.9,marginBottom:3,fontFamily:"'Cinzel Decorative',serif"}}>
          ✦ PATH TO THE GOLDEN GARDEN ✦
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:2}}>
          {[101,102,103,104,105,106,107,108].map((n,ci)=>{
            const isWin=n===108, riddle=CROWN_RIDDLES[n];
            const here=players.map((_,pi)=>playersSq[pi]===n?pi:-1).filter(x=>x>=0);
            return (
              <div key={n} style={{aspectRatio:'1',position:'relative',
                background:isWin?'radial-gradient(circle,rgba(255,215,0,.22),rgba(255,140,0,.08))':'radial-gradient(circle,rgba(240,165,0,.06),transparent)',
                border:`1px solid ${isWin?'rgba(240,165,0,.4)':'rgba(240,165,0,.14)'}`,
                borderRadius:3,display:'flex',flexDirection:'column',
                alignItems:'center',justifyContent:'center'}}>
                <span style={{position:'absolute',top:1,left:2,fontSize:'clamp(5px,.7vw,7px)',
                  color:isWin?'#f0a500':'rgba(240,165,0,.32)',fontWeight:700,lineHeight:1}}>{n}</span>
                <span style={{fontSize:'clamp(10px,1.9vw,17px)',lineHeight:1,
                  filter:isWin?'drop-shadow(0 0 8px rgba(255,215,0,.7))':'drop-shadow(0 0 4px rgba(240,165,0,.4))',
                  animation:`bFloat ${2+ci*.22}s ease infinite`}}>
                  {isWin?'⭐':riddle?.icon||'❓'}
                </span>
                {!isWin&&riddle&&<span style={{fontSize:'clamp(4px,.55vw,6px)',
                  color:'rgba(240,165,0,.45)',fontFamily:"'Noto Serif Devanagari',serif",
                  lineHeight:1,textShadow:'0 1px 3px rgba(0,0,0,.8)'}}>{riddle.skt}</span>}
                {isWin&&<span style={{fontSize:'clamp(4px,.5vw,6px)',color:'#f0a500',fontWeight:800,
                  fontFamily:"'Cinzel Decorative',serif",lineHeight:1}}>MOKSHA</span>}
                {here.length>0&&(
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',
                    justifyContent:'center',gap:1,zIndex:5}}>
                    {here.map(pi=>{
                      const pc=players[pi].char?.color||'#f0a500';
                      return <div key={pi} style={{width:'clamp(12px,2.2vw,20px)',height:'clamp(12px,2.2vw,20px)',
                        borderRadius:'50%',background:`radial-gradient(circle at 35% 30%,${pc}ee,${pc})`,
                        border:`2px solid ${pc}`,boxShadow:`0 0 8px ${pc}99`,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:'clamp(5px,1vw,10px)',animation:pi===cur?'bPulse .9s ease infinite':'none'}}>
                        {players[pi].char?.icon}
                      </div>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN BOARD 1-100 */}
      <div style={{position:'relative',borderRadius:'0 0 8px 8px',overflow:'hidden',
        border:'1px solid rgba(105,240,174,.1)',borderTop:'none',
        boxShadow:'0 8px 30px rgba(0,0,0,.5)'}}>

        {/* Realm depth background */}
        <div style={{position:'absolute',inset:0,zIndex:0,
          background:`linear-gradient(to bottom,#1b3a00 0%,#122800 25%,#0a1a30 26%,#081428 50%,#2a0c04 51%,#1e0803 74%,#2e1800 75%,#1e1000 100%)`}}/>
        <div style={{position:'absolute',left:'2%',right:'2%',top:'33%',height:1,zIndex:2,pointerEvents:'none',
          background:'linear-gradient(90deg,transparent,rgba(240,165,0,.12),transparent)'}}/>
        <div style={{position:'absolute',left:'2%',right:'2%',top:'67%',height:1,zIndex:2,pointerEvents:'none',
          background:'linear-gradient(90deg,transparent,rgba(240,165,0,.12),transparent)'}}/>

        {/* Grid — squares in visual order (no gridColumn/gridRow needed) */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',
          position:'relative',zIndex:3,aspectRatio:'1'}}>
          {mainBoard.map(n=>{
            const sn=SNAKES_BALA[n], ld=LADDERS_BALA[n];
            const disc=DISCOVERY_SQUARES[n], dlm=DLM_SQ_BALA.includes(n);
            const here=players.map((_,pi)=>playersSq[pi]===n?pi:-1).filter(x=>x>=0);
            let bg=getRealmSqBg(n), border=getRealmSqBorder(n);
            if(sn){bg='radial-gradient(ellipse,rgba(160,20,20,.35),rgba(60,8,8,.22))';border=sn.color+'40';}
            else if(ld){bg='radial-gradient(ellipse,rgba(20,120,40,.28),rgba(8,50,15,.16))';border='rgba(240,165,0,.22)';}
            else if(disc){bg='radial-gradient(ellipse,rgba(100,50,200,.25),rgba(40,15,90,.15))';border='rgba(179,136,255,.22)';}
            else if(dlm){bg='radial-gradient(ellipse,rgba(160,110,0,.2),rgba(70,50,0,.1))';border='rgba(240,165,0,.16)';}
            return (
              <div key={n} style={{aspectRatio:'1',background:bg,border:`0.5px solid ${border}`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                position:'relative',overflow:'hidden'}}>
                <span style={{position:'absolute',top:'4%',left:'5%',
                  fontSize:'clamp(6px,.95vw,11px)',lineHeight:1,
                  color:sn?'#ff8a80':ld?'#f0a500':disc?'#ce93d8':getRealmNumColor(n),
                  fontWeight:900,fontFamily:"'Baloo 2',sans-serif",
                  textShadow:'0 1px 4px rgba(0,0,0,.95)'}}>
                  {n}
                </span>
                {sn&&!here.length&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'6% 2% 2%',width:'100%'}}>
                    <svg width="52%" height="auto" viewBox="0 0 24 24">
                      <path d="M5 18 Q8 12 12 10 Q16 8 19 5" stroke={sn.color} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                      <circle cx="19.5" cy="4" r="2.5" fill={sn.headColor}/>
                      <circle cx="18.4" cy="3.2" r=".7" fill="white"/>
                      <circle cx="20.5" cy="3.2" r=".7" fill="white"/>
                      <path d="M19.5,6.5 L18.6,8.5 M19.5,6.5 L20.4,8.5" stroke="#ff1744" strokeWidth=".7" strokeLinecap="round"/>
                    </svg>
                    <span style={{fontSize:'clamp(5px,.95vw,10px)',color:sn.color,fontWeight:900,
                      fontFamily:"'Noto Serif Devanagari',serif",lineHeight:1.15,
                      textShadow:'0 0 8px rgba(0,0,0,.95)',textAlign:'center',
                      maxWidth:'95%',display:'block',overflow:'hidden'}}>{sn.skt}</span>
                    <span style={{fontSize:'clamp(4px,.65vw,7px)',color:'rgba(255,140,120,.6)',
                      fontWeight:700,fontFamily:"'Baloo 2',sans-serif",lineHeight:1,maxWidth:'95%',
                      overflow:'hidden',whiteSpace:'nowrap',textShadow:'0 0 6px rgba(0,0,0,.9)'}}>
                      {sn.en.split('·')[1]?.trim()||sn.en}
                    </span>
                  </div>
                )}
                {ld&&!here.length&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'6% 2% 2%',width:'100%'}}>
                    <svg width="42%" height="auto" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id={`li${n}`} x1="0" y1="22" x2="0" y2="2" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor={ld.color1}/><stop offset="100%" stopColor={ld.color2}/>
                        </linearGradient>
                      </defs>
                      <line x1="5" y1="22" x2="5" y2="2" stroke={`url(#li${n})`} strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="19" y1="22" x2="19" y2="2" stroke={`url(#li${n})`} strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="5" y1="18" x2="19" y2="18" stroke="rgba(255,255,255,.6)" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="5" y1="12" x2="19" y2="12" stroke="rgba(255,255,255,.6)" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="5" y1="6"  x2="19" y2="6"  stroke="rgba(255,255,255,.6)" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <span style={{fontSize:'clamp(5px,.95vw,10px)',color:'#f0a500',fontWeight:900,
                      fontFamily:"'Noto Serif Devanagari',serif",lineHeight:1.15,
                      textShadow:'0 0 8px rgba(0,0,0,.95)',textAlign:'center',
                      maxWidth:'95%',display:'block',overflow:'hidden'}}>{ld.skt}</span>
                    <span style={{fontSize:'clamp(4px,.65vw,7px)',color:'rgba(240,165,0,.55)',
                      fontWeight:700,fontFamily:"'Baloo 2',sans-serif",lineHeight:1,maxWidth:'95%',
                      overflow:'hidden',whiteSpace:'nowrap',textShadow:'0 0 6px rgba(0,0,0,.9)'}}>
                      {ld.en}
                    </span>
                  </div>
                )}
                {disc&&!sn&&!ld&&!here.length&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                    <span style={{fontSize:'clamp(12px,2.3vw,22px)',lineHeight:1,
                      animation:'bFloat 2s ease infinite',
                      filter:'drop-shadow(0 0 5px rgba(179,136,255,.8))'}}>{disc.icon}</span>
                    <span style={{fontSize:'clamp(4px,.7vw,7px)',color:'#b39ddb',fontWeight:800,
                      fontFamily:"'Baloo 2',sans-serif",letterSpacing:.5,lineHeight:1}}>DISCOVER</span>
                  </div>
                )}
                {dlm&&!sn&&!ld&&!disc&&!here.length&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                    <span style={{fontSize:'clamp(10px,1.9vw,18px)',lineHeight:1}}>⚖</span>
                    <span style={{fontSize:'clamp(4px,.65vw,6.5px)',color:'rgba(240,165,0,.5)',
                      fontWeight:700,fontFamily:"'Baloo 2',sans-serif",letterSpacing:.3}}>CHOOSE</span>
                  </div>
                )}
                {here.length>0&&(
                  <div style={{position:'absolute',inset:0,display:'flex',flexWrap:'wrap',
                    alignItems:'center',justifyContent:'center',gap:1,zIndex:8}}>
                    {here.map(pi=>{
                      const p=players[pi], pc=p.char?.color||'#f0a500', isActive=pi===cur;
                      return (
                        <div key={pi} style={{display:'flex',flexDirection:'column',alignItems:'center',
                          transform:isActive?'scale(1.35) translateY(-3px)':'scale(1)',transition:'transform .3s',
                          position:'relative',zIndex:isActive?10:5}}>
                          {isActive&&<div style={{position:'absolute',inset:-2,borderRadius:3,
                            background:`${pc}15`,border:`1.5px solid ${pc}50`,animation:'bPulse .9s ease infinite'}}/>}
                          <div style={{width:'clamp(14px,2.6vw,28px)',height:'clamp(14px,2.6vw,28px)',
                            borderRadius:'50%',
                            background:`radial-gradient(circle at 35% 30%,${pc}f0,${pc} 55%,${pc}44)`,
                            border:`2px solid ${pc}`,
                            boxShadow:`0 0 ${isActive?14:4}px ${pc}${isActive?'bb':'33'},0 2px 6px rgba(0,0,0,.5)`,
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontSize:'clamp(7px,1.3vw,14px)'}}>
                            {p.char?.icon||'●'}
                          </div>
                          <div style={{fontSize:'clamp(4px,.65vw,7px)',color:pc,fontWeight:900,
                            textShadow:`0 0 4px #000,0 0 8px ${pc}30`,opacity:isActive?1:.5,
                            lineHeight:1,marginTop:1}}>{p.name?.slice(0,5)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SVG overlay — same coord system as Moksha */}
        <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',
          pointerEvents:'none',overflow:'visible',zIndex:10}}
          viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="sGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation=".8" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="lGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation=".55" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {Object.entries(LADDERS_BALA).map(([f,ld])=>{
              const fc=sq2xy(Number(f)), tc=sq2xy(ld.to);
              return <linearGradient key={f} id={`sLD${f}`}
                x1={fc.x} y1={fc.y} x2={tc.x} y2={tc.y} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e8660a"/>
                <stop offset="100%" stopColor="#f0a500"/>
              </linearGradient>;
            })}
          </defs>
          {Object.entries(LADDERS_BALA).map(([f,ld])=>{
            const {r1,r2,rungs,fc,tc}=ladderParts(Number(f),ld.to);
            return (
              <g key={f} filter="url(#lGlow)" style={{animation:'ladderShine 3s ease infinite'}}>
                <line {...r1} stroke="rgba(0,0,0,.4)" strokeWidth="2.2" strokeLinecap="round"/>
                <line {...r2} stroke="rgba(0,0,0,.4)" strokeWidth="2.2" strokeLinecap="round"/>
                <line {...r1} stroke={`url(#sLD${f})`} strokeWidth="1.6" strokeLinecap="round"/>
                <line {...r2} stroke={`url(#sLD${f})`} strokeWidth="1.6" strokeLinecap="round"/>
                <line {...r1} stroke="rgba(255,255,255,.25)" strokeWidth=".35" strokeLinecap="round"/>
                <line {...r2} stroke="rgba(255,255,255,.25)" strokeWidth=".35" strokeLinecap="round"/>
                {rungs.map((rg,i)=>(
                  <g key={i}>
                    <line {...rg} stroke="rgba(0,0,0,.28)" strokeWidth="1.6" strokeLinecap="round"/>
                    <line {...rg} stroke={i%2===0?'#e8660a':'#f0a500'} strokeWidth="1.2" strokeLinecap="round" opacity=".9"/>
                    <line {...rg} stroke="rgba(255,255,255,.28)" strokeWidth=".28" strokeLinecap="round"/>
                  </g>
                ))}
                {rungs.filter((_,i)=>i%3===0).map((rg,i)=>(
                  <circle key={i}
                    cx={(rg.x1+rg.x2)/2}
                    cy={(rg.y1+rg.y2)/2}
                    r=".9" fill="#f0a500" opacity=".65"/>
                ))}
                <circle cx={fc.x} cy={fc.y} r="1.7" fill="#e8660a" opacity=".9"/>
                <circle cx={tc.x} cy={tc.y} r="2" fill="#f0a500" opacity=".9"/>
              </g>
            );
          })}
          {Object.entries(SNAKES_BALA).map(([f,sn])=>{
            const {fc,tc,d}=snakePath(Number(f),sn.to);
            return (
              <g key={f} filter="url(#sGlow)" style={{animation:'snakePulse 2.5s ease infinite'}}>
                <path d={d} stroke={sn.color} strokeWidth="3.8" fill="none" strokeLinecap="round" opacity=".1"/>
                <path d={d} stroke="rgba(0,0,0,.42)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d={d} stroke={sn.headColor} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".4"/>
                <path d={d} stroke={sn.color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeDasharray="1.5,1"/>
                <path d={d} stroke="rgba(255,255,255,.14)" strokeWidth=".6" fill="none" strokeDasharray="2,3" strokeLinecap="round"/>
                <path d={d} stroke="rgba(255,255,255,.28)" strokeWidth=".28" fill="none" strokeLinecap="round"/>
                <circle cx={fc.x} cy={fc.y+.3} r="2.6" fill="rgba(0,0,0,.3)"/>
                <ellipse cx={fc.x} cy={fc.y} rx="2.4" ry="2.1" fill={sn.headColor}/>
                <ellipse cx={fc.x-.45} cy={fc.y-.55} rx=".8" ry=".55" fill="rgba(255,255,255,.28)" transform={`rotate(-30,${fc.x-.45},${fc.y-.55})`}/>
                <circle cx={fc.x-.9} cy={fc.y-.42} r=".62" fill="white"/>
                <circle cx={fc.x+.9} cy={fc.y-.42} r=".62" fill="white"/>
                <circle cx={fc.x-.9} cy={fc.y-.35} r=".35" fill="#111"/>
                <circle cx={fc.x+.9} cy={fc.y-.35} r=".35" fill="#111"/>
                <path d={`M${fc.x},${fc.y+1.5} L${fc.x-.55},${fc.y+2.8} M${fc.x},${fc.y+1.5} L${fc.x+.55},${fc.y+2.8}`}
                  stroke="#ff1744" strokeWidth=".5" strokeLinecap="round"/>
                {/* Naga hood */}
                <path d={`M${fc.x},${fc.y} L${fc.x-2.5},${fc.y-3.5}`} stroke={sn.headColor||sn.color} strokeWidth="1.2" opacity=".7"/>
                <path d={`M${fc.x},${fc.y} L${fc.x},${fc.y-4}`} stroke={sn.headColor||sn.color} strokeWidth="1.2" opacity=".7"/>
                <path d={`M${fc.x},${fc.y} L${fc.x+2.5},${fc.y-3.5}`} stroke={sn.headColor||sn.color} strokeWidth="1.2" opacity=".7"/>
                <path d={`M${fc.x-2.5},${fc.y-3.5} Q${fc.x},${fc.y-5.5} ${fc.x+2.5},${fc.y-3.5}`} stroke={sn.headColor||sn.color} strokeWidth=".8" fill="none" opacity=".5"/>
                {/* Naga mani */}
                <circle cx={fc.x} cy={fc.y} r="1.1" fill="#ffd700" opacity=".8"/>
                <circle cx={tc.x} cy={tc.y} r="1.2" fill={sn.color} opacity=".5"/>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
function DiscoveryPopup({ sq, onClose }) {
  const d = DISCOVERY_SQUARES[sq]; if (!d) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(10,5,0,.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:300}}>
      <div style={{background:'linear-gradient(170deg,#1a0d00,#2a1505)',color:'#f7e8c8',borderRadius:'4px 16px 16px 4px',padding:'clamp(18px,4vw,34px)',maxWidth:480,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,.5)',border:'2px solid rgba(240,165,0,.3)',borderLeft:'5px solid rgba(240,165,0,.5)',animation:'scrollUnroll .4s ease',maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{textAlign:'center',fontSize:56,marginBottom:6,animation:'bFloat 2s ease infinite',display:'inline-block'}}><span style={{display:'inline-block',animation:'rangoliSpin 8s linear infinite'}}>{d.icon}</span></div>
        <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(240,165,0,.65)',textAlign:'center',fontFamily:"'Noto Serif Devanagari',serif",marginBottom:14,letterSpacing:1}}>{d.skt} · {d.sktM}</div>
        <div style={{background:'rgba(240,165,0,.07)',borderRadius:14,padding:'12px 16px',marginBottom:12,border:'1px solid rgba(240,165,0,.2)'}}>
          <div style={{fontSize:10,color:'rgba(240,165,0,.5)',marginBottom:4,letterSpacing:1,fontWeight:700,fontFamily:"'Noto Serif Devanagari',serif"}}>VEDIC WISDOM</div>
          <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(240,165,0,.88)',lineHeight:1.9,fontStyle:'italic',fontFamily:"'Baloo 2',sans-serif"}}>{d.vedic}</div>
        </div>
        <div style={{background:'rgba(100,160,255,.08)',borderRadius:14,padding:'12px 16px',marginBottom:12,border:'1px solid rgba(100,160,255,.2)'}}>
          <div style={{fontSize:10,color:'rgba(100,200,255,.5)',marginBottom:4,letterSpacing:1,fontWeight:700,fontFamily:"'Noto Serif Devanagari',serif"}}>WHAT SCIENCE FOUND</div>
          <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(200,230,255,.88)',lineHeight:1.9,fontFamily:"'Baloo 2',sans-serif"}}>{d.science}</div>
        </div>
        <div style={{textAlign:'center',fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(240,165,0,.7)',fontStyle:'italic',marginBottom:18,lineHeight:1.8,fontFamily:"'Baloo 2',sans-serif"}}>✦ {d.wonder}</div>
        <div style={{textAlign:'center'}}><button className="bb" onClick={onClose}>🪷 I will tell someone tonight!</button></div>
      </div>
    </div>
  );
}

function CrownRiddlePopup({ riddle, sq, onSolve, onSkip }) {
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  if (!riddle) return null;
  const isCorrect = chosen === riddle.correct;

  const handleChoice = (i) => {
    if (revealed) return;
    setChosen(i);
    setRevealed(true);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',
      alignItems:'center',justifyContent:'center',padding:16,zIndex:300}}>
      <div style={{
        background:'linear-gradient(170deg,#130800,#1e0f02)',
        border:'2px solid rgba(240,165,0,.25)',
        borderTop:'4px solid #f0a500',
        borderRadius:16,padding:'clamp(20px,4vw,32px)',
        maxWidth:500,width:'100%',
        boxShadow:'0 0 60px rgba(240,165,0,.1),0 20px 60px rgba(0,0,0,.6)',
        animation:'bPop .35s ease',maxHeight:'90vh',overflowY:'auto',
      }}>
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:'clamp(6px,1vw,9px)',letterSpacing:4,color:'rgba(240,165,0,.4)',
            fontWeight:700,marginBottom:6,fontFamily:"'Baloo 2',sans-serif"}}>
            🪷 CROWN RIDDLE — SQUARE {sq}
          </div>
          <div style={{fontSize:52,marginBottom:6,animation:'bFloat 2s ease infinite',
            filter:'drop-shadow(0 0 12px rgba(240,165,0,.5))'}}>{riddle.icon}</div>
          <div style={{fontSize:'clamp(16px,3vw,22px)',fontWeight:900,
            fontFamily:"'Cinzel Decorative',serif",color:'#f0a500',marginBottom:2}}>
            {riddle.title}
          </div>
          <div style={{fontSize:'clamp(9px,1.4vw,11px)',color:'rgba(240,165,0,.4)',
            fontFamily:"'Noto Serif Devanagari',serif"}}>
            {riddle.skt} · {riddle.sktM}
          </div>
        </div>

        {/* Question */}
        <div style={{background:'rgba(240,165,0,.06)',border:'1px solid rgba(240,165,0,.15)',
          borderRadius:12,padding:'14px 18px',marginBottom:18,
          fontSize:'clamp(13px,2.2vw,16px)',color:'rgba(247,232,200,.85)',
          lineHeight:1.9,fontFamily:"'Baloo 2',sans-serif",fontWeight:700,textAlign:'center'}}>
          {riddle.q}
        </div>

        {/* Choices */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
          {riddle.choices.map((ch,i)=>{
            let bg='rgba(255,255,255,.04)', border='rgba(255,255,255,.12)', color='rgba(247,232,200,.7)';
            if(revealed){
              if(i===riddle.correct){bg='rgba(60,160,40,.2)';border='rgba(74,170,42,.6)';color='#7ade55';}
              else if(i===chosen&&chosen!==riddle.correct){bg='rgba(200,50,20,.2)';border='rgba(200,51,24,.6)';color='#ff7060';}
            }
            if(!revealed&&chosen===null) {/* no override */}
            return (
              <button key={i} onClick={()=>handleChoice(i)}
                disabled={revealed}
                style={{
                  background:bg,border:`2px solid ${border}`,borderRadius:10,
                  padding:'clamp(10px,1.8vw,14px) 10px',
                  color,fontWeight:800,fontFamily:"'Baloo 2',sans-serif",
                  fontSize:'clamp(12px,2vw,15px)',cursor:revealed?'default':'pointer',
                  transition:'all .2s',textAlign:'center',lineHeight:1.4,
                  transform:!revealed?'none':i===riddle.correct?'scale(1.04)':'scale(1)',
                }}>
                {revealed&&i===riddle.correct&&'✓ '}{ch}
                {revealed&&i===chosen&&chosen!==riddle.correct&&' ✗'}
              </button>
            );
          })}
        </div>

        {/* Wisdom reveal */}
        {revealed&&(
          <div style={{background:isCorrect?'rgba(60,160,40,.1)':'rgba(200,80,20,.08)',
            border:`1px solid ${isCorrect?'rgba(74,170,42,.3)':'rgba(200,80,20,.3)'}`,
            borderRadius:12,padding:'12px 16px',marginBottom:16,animation:'bSlide .4s ease'}}>
            <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(247,232,200,.6)',
              lineHeight:1.9,fontFamily:"'Baloo 2',sans-serif",fontStyle:'italic'}}>
              {isCorrect?'🌟 ':'💡 '}{riddle.wisdom}
            </div>
          </div>
        )}

        {/* Actions */}
        {revealed&&(
          <div style={{textAlign:'center',display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            {isCorrect
              ? <button onClick={()=>onSolve(true)} className="bb">
                  🪷 Correct! Move Forward →
                </button>
              : <>
                  <button onClick={()=>{setChosen(null);setRevealed(false);}}
                    style={{background:'rgba(240,165,0,.06)',border:'1px solid rgba(240,165,0,.15)',
                      color:'rgba(247,232,200,.6)',padding:'10px 20px',fontSize:13,fontWeight:700,
                      borderRadius:8,cursor:'pointer',fontFamily:"'Baloo 2',sans-serif"}}>
                    Try Again
                  </button>
                  <button onClick={()=>onSolve(false)}
                    style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.1)',
                      color:'rgba(247,232,200,.35)',padding:'10px 20px',fontSize:12,
                      borderRadius:8,cursor:'pointer',fontFamily:"'Baloo 2',sans-serif"}}>
                    Stay here, try next turn
                  </button>
                </>
            }
          </div>
        )}
        {!revealed&&(
          <div style={{textAlign:'center',fontSize:11,color:'rgba(255,255,255,.25)',fontStyle:'italic'}}>
            Choose wisely — Panditji is watching 🧙
          </div>
        )}
      </div>
    </div>
  );
}

function StoryPopup({ data, type, onClose }) {
  if (!data) return null;
  const isL = type==='ladder';
  const accent = isL?'#4aaa2a':'#c03010';
  const bg = isL?'linear-gradient(160deg,#0c1e08,#162a0a)':'linear-gradient(160deg,#1e0805,#2a0c08)';
  const borderColor = isL?'rgba(80,160,40,.4)':'rgba(200,60,20,.4)';
  const borderLeft = isL?'5px solid #4aaa2a':'5px solid #c03010';
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:250}}>
      <div style={{background:bg,borderRadius:24,padding:'clamp(18px,3.5vw,30px)',maxWidth:480,width:'100%',boxShadow:'0 16px 48px rgba(0,0,0,.5)',border:`3px solid ${borderColor}`,borderLeft,animation:'bPop .3s ease',maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{textAlign:'center',fontSize:52,marginBottom:6,animation:'bFloat 2s ease infinite'}}>{data.emoji}</div>
        <div style={{textAlign:'center',fontSize:'clamp(14px,2.5vw,18px)',fontWeight:900,fontFamily:"'Cinzel Decorative',serif",color:accent,marginBottom:3}}>{data.title}</div>
        <div style={{textAlign:'center',fontSize:'clamp(9px,1.4vw,11px)',color:'rgba(247,232,200,.4)',marginBottom:10,letterSpacing:1,fontFamily:"'Noto Serif Devanagari',serif"}}>{data.skt} · {data.en}</div>
        {data.from&&<div style={{textAlign:'center',marginBottom:10}}><span style={{fontSize:12,background:accent+'22',borderRadius:20,padding:'3px 12px',color:accent,fontWeight:700,fontFamily:"'Baloo 2',sans-serif"}}>{isL?'↑ ':'↓ '}Square {data.from} → {data.to}</span></div>}
        <div style={{background:'rgba(255,255,255,.06)',borderRadius:14,padding:14,marginBottom:12,fontSize:'clamp(12px,2vw,14px)',color:'rgba(247,232,200,.8)',lineHeight:1.95,fontFamily:"'Baloo 2',sans-serif"}}>{data.story}</div>
        <div style={{background:accent+'18',borderRadius:12,padding:'10px 14px',marginBottom:16,display:'flex',alignItems:'flex-start',gap:8}}>
          <span style={{fontSize:18,flexShrink:0}}>{isL?'💡':'⚠️'}</span>
          <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(247,232,200,.7)',lineHeight:1.7,fontWeight:700,fontFamily:"'Baloo 2',sans-serif"}}>{data.lesson}</div>
        </div>
        <div style={{textAlign:'center'}}><button className="bb" onClick={onClose}>{isL?'⭐ I understand!':'🙏 I will remember this'}</button></div>
      </div>
    </div>
  );
}

function DilemmaPopup({ dilemma, onSolve }) {
  if (!dilemma) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(10,5,0,.87)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:260}}>
      <div style={{background:'linear-gradient(170deg,#1a0d00,#2a1505)',borderRadius:'4px 16px 16px 16px',padding:'clamp(18px,3.5vw,28px)',maxWidth:480,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,.5)',border:'3px solid rgba(240,165,0,.35)',animation:'bPop .3s ease',maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{textAlign:'center',marginBottom:8,display:'flex',justifyContent:'center'}}><DharmaScaleSVG size={52}/></div>
        <div style={{textAlign:'center',fontSize:'clamp(14px,2.5vw,18px)',fontWeight:900,fontFamily:"'Cinzel Decorative',serif",color:'#f0a500',marginBottom:8}}>{dilemma.t}</div>
        <div style={{background:'rgba(240,165,0,.06)',border:'1px solid rgba(240,165,0,.15)',borderRadius:14,padding:'10px 14px',marginBottom:12,fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(247,232,200,.65)',lineHeight:1.9,fontStyle:'italic',fontFamily:"'Baloo 2',sans-serif"}}>📖 {dilemma.setup}</div>
        <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(247,232,200,.8)',lineHeight:1.9,marginBottom:14,fontFamily:"'Baloo 2',sans-serif",fontWeight:700}}>{dilemma.q}</div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:12}}>
          {dilemma.c.map((ch,ci)=>(
            <button key={ci} className={`bc ${ch.k==='star'?'bc-wise':'bc-oops'}`} onClick={()=>onSolve(ci)}>
              <span style={{fontSize:20,flexShrink:0}}>{ch.k==='star'?'💚':'🟠'}</span>
              <span>{ch.l}</span>
            </button>
          ))}
        </div>
        <div style={{fontSize:'clamp(10px,1.5vw,12px)',color:'rgba(240,165,0,.4)',textAlign:'center',fontStyle:'italic',fontFamily:"'Noto Serif Devanagari',serif"}}>— {dilemma.skt} · {dilemma.sktM}</div>
        <div style={{fontSize:'clamp(10px,1.5vw,12px)',color:'rgba(247,232,200,.35)',textAlign:'center',marginTop:4,fontStyle:'italic',fontFamily:"'Baloo 2',sans-serif"}}>"{dilemma.wisdom}"</div>
      </div>
    </div>
  );
}

// ── MAIN BalaGame ─────────────────────────────────────────────────────────────
export default function BalaGame({ onExit }) {
  const ambient = useAmbient();
  const [screen,    setScreen]    = useState('title');
  const [storyPage, setStoryPage] = useState(0);
  const [players,   setPlayers]   = useState([]);
  const [nP,        setNP]        = useState(1);
  const [pos,       setPos]       = useState([1,1,1,1,1]);
  const [stars,     setStars]     = useState([0,0,0,0,0]);
  const [gyan,      setGyan]      = useState([0,0,0,0,0]); // ✨ Knowledge (wise choices)
  const [agyan,     setAgyan]     = useState([0,0,0,0,0]); // 🌑 Ignorance (poor choices)
  const [cur,       setCur]       = useState(0);
  const [win,       setWin]       = useState(null);
  const [busy,      setBusy]      = useState(false);
  const [diceVal,   setDiceVal]   = useState(null);
  const [diceAnim,  setDiceAnim]  = useState(false);
  const [storyPop,     setStoryPop]     = useState(null);
  const [discPop,      setDiscPop]      = useState(null);
  const [dilemma,      setDilemma]      = useState(null);
  const [crownRiddle,  setCrownRiddle]  = useState(null); // {sq, pi, nPos, nStars, totalP}
  const [starFlash, setStarFlash] = useState('');
  const [naniKey,   setNaniKey]   = useState('start');
  const [mayaviTxt, setMayaviTxt] = useState('');
  const [tempChar,  setTempChar]  = useState(-1);
  const [tempName,  setTempName]  = useState('');
  const [pidx,      setPidx]      = useState(0);
  const [lang,      setLang]      = useState('en');
  const cbRef   = useRef(null);
  const cpuTimer= useRef(null);
  const isHi = lang==='hi';
  const pm = (k) => isHi ? PANDITJI.messages[k].hi : PANDITJI.messages[k].en;

  const hasCPU = nP === 1;
  const totalPlayers = hasCPU ? 2 : nP; // add Mayavi slot if 1 player

  // ── CPU Mayavi auto-roll ──────────────────────────────────────────────────
  useEffect(()=>{
    if(!hasCPU||!players.length||win!==null||busy||dilemma||storyPop||discPop||crownRiddle) return;
    const mayaviIdx = players.length - 1; // Mayavi is always last
    if(cur !== mayaviIdx) return;
    cpuTimer.current = setTimeout(()=>{
      doRoll(true);
    }, 1800);
    return()=>clearTimeout(cpuTimer.current);
  },[cur, hasCPU, players.length, win, busy, dilemma, storyPop, discPop]);

  // ── Game logic ────────────────────────────────────────────────────────────
  const nextTurn = useCallback((nPos, nStars, totalP) => {
    setBusy(false); setCur(c=>(c+1)%totalP); setNaniKey('waiting');
  },[]);

  const checkWin = (pi, nPos, nStars, totalP) => {
    const didWin = nPos[pi]>=108 || nStars[pi]>=BALA_WIN_STARS;
    if(didWin) { setWin(pi); return true; }
    return false;
  };

  const showStory = (data,type,cb)=>{ setStoryPop({data,type}); cbRef.current=cb; };
  const closeStory = ()=>{ setStoryPop(null); if(cbRef.current){const f=cbRef.current;cbRef.current=null;setTimeout(f,200);} };
  const closeDisc  = ()=>{ setDiscPop(null);  if(cbRef.current){const f=cbRef.current;cbRef.current=null;setTimeout(f,200);} };

  const isMayavi = (pi) => hasCPU && pi === players.length-1;

  const landAfterDisc = (n, pi, nPos, nStars, totalP) => {
    if(SNAKES_BALA[n]){
      const sn=SNAKES_BALA[n]; setNaniKey('snake');
      // Snake = +1 Agyan
      setAgyan(a=>{ const na=[...a]; na[pi]=Math.min(na[pi]+1,12); return na; });
      if(!isMayavi(pi)){
        const tnt = MAYAVI_TAUNTS_SNAKE[Math.floor(Math.random()*MAYAVI_TAUNTS_SNAKE.length)];
        setMayaviTxt(tnt); setTimeout(()=>setMayaviTxt(''),4000);
      }
      showStory({...sn,from:n},'snake',()=>{ nPos[pi]=sn.to; setPos([...nPos]); nextTurn(nPos,nStars,totalP); });
      return;
    }
    if(LADDERS_BALA[n]){
      const ld=LADDERS_BALA[n];
      nStars[pi]=Math.min(nStars[pi]+1,BALA_WIN_STARS); setStars([...nStars]);
      // Ladder = +2 Gyan
      setGyan(g=>{ const ng=[...g]; ng[pi]=Math.min(ng[pi]+2,12); return ng; });
      setStarFlash(STAR_MESSAGES[Math.floor(Math.random()*STAR_MESSAGES.length)]);
      setTimeout(()=>setStarFlash(''),2500); setNaniKey('ladder');
      if(!isMayavi(pi)){
        const tnt=MAYAVI_TAUNTS_LADDER[Math.floor(Math.random()*MAYAVI_TAUNTS_LADDER.length)];
        setMayaviTxt(tnt); setTimeout(()=>setMayaviTxt(''),3500);
      }
      showStory({...ld,from:n},'ladder',()=>{ nPos[pi]=ld.to; setPos([...nPos]); if(!checkWin(pi,nPos,nStars,totalP)) nextTurn(nPos,nStars,totalP); });
      return;
    }
    if(!isMayavi(pi) && DLM_SQ_BALA.includes(n)){
      setNaniKey('dilemma');
      const d=DILEMMAS_BALA[Math.floor(Math.random()*DILEMMAS_BALA.length)];
      setBusy(false); setDilemma({...d,pi,nPos:[...nPos],nStars:[...nStars],totalP}); return;
    }
    if(!checkWin(pi,nPos,nStars,totalP)) nextTurn(nPos,nStars,totalP);
  };

  const checkLanding = useCallback((n,pi,nPos,nStars,totalP)=>{
    // Crown riddle squares (101-107) — player must solve to advance
    if(!isMayavi(pi) && CROWN_RIDDLE_SQ.includes(n)){
      setNaniKey('dilemma');
      setBusy(false);
      setCrownRiddle({sq:n, pi, nPos:[...nPos], nStars:[...nStars], totalP});
      return;
    }
    if(!isMayavi(pi) && DISCOVERY_SQUARES[n]){
      setNaniKey('discovery'); setDiscPop(n);
      // Discovery = +1 Gyan (learning!)
      setGyan(g=>{ const ng=[...g]; ng[pi]=Math.min(ng[pi]+1,12); return ng; });
      cbRef.current=()=>landAfterDisc(n,pi,nPos,nStars,totalP); return;
    }
    landAfterDisc(n,pi,nPos,nStars,totalP);
  },[]);

  const solveD = (ci)=>{
    if(!dilemma) return;
    const ch=dilemma.c[ci],np=[...dilemma.nPos],ns=[...dilemma.nStars],{pi,totalP}=dilemma;
    if(ch.k==='star'&&ch.fx.star){
      ns[pi]=Math.min(ns[pi]+ch.fx.star,BALA_WIN_STARS); setStars([...ns]);
      setStarFlash(STAR_MESSAGES[Math.floor(Math.random()*STAR_MESSAGES.length)]); setTimeout(()=>setStarFlash(''),2500);
      setGyan(g=>{ const ng=[...g]; ng[pi]=Math.min(ng[pi]+2,12); return ng; });
    } else {
      setAgyan(a=>{ const na=[...a]; na[pi]=Math.min(na[pi]+1,12); return na; });
    }
    if(ch.fx.move){ np[pi]=Math.max(1,Math.min((np[pi]||1)+ch.fx.move,108)); setPos([...np]); }
    setDilemma(null);
    if(!checkWin(pi,np,ns,totalP)) nextTurn(np,ns,totalP);
  };

  // Crown riddle: correct = +2 Gyan + move to next square
  //              wrong   = stay on square, try next turn
  const solveCrown = (correct) => {
    if(!crownRiddle) return;
    const {sq, pi, nPos:np, nStars:ns, totalP} = crownRiddle;
    setCrownRiddle(null);
    if(correct){
      // +2 Gyan for solving
      setGyan(g=>{ const ng=[...g]; ng[pi]=Math.min(ng[pi]+2,12); return ng; });
      setStarFlash('⭐ Correct! +2 Gyan — Wisdom grows!');
      setTimeout(()=>setStarFlash(''),2500);
      // Move forward one square (sq+1, capped at 108)
      np[pi] = Math.min(sq+1, 108);
      setPos([...np]);
      if(!checkWin(pi,np,ns,totalP)) nextTurn(np,ns,totalP);
    } else {
      // Stay on square — next turn will trigger riddle again
      nextTurn(np,ns,totalP);
    }
  };

  const doRoll = useCallback((isCpu=false)=>{
    if(busy||win!==null) return;
    if(!isCpu&&dilemma) return;
    setBusy(true); setDiceAnim(true);
    setTimeout(()=>{
      setDiceAnim(false);
      const r=Math.floor(Math.random()*6)+1; if(!isCpu) setDiceVal(r);
      const pi=cur, totalP=players.length;
      const nPos=[...pos], nStars=[...stars];
      const oldP=nPos[pi]||1, newP=Math.min(oldP+r,108);
      const total=newP-oldP;
      if(total===0){checkLanding(newP,pi,nPos,nStars,totalP);return;}
      let step=0;
      const iv=setInterval(()=>{
        step++; nPos[pi]=oldP+step; setPos([...nPos]);
        if(step>=total){clearInterval(iv);checkLanding(newP,pi,nPos,nStars,totalP);}
      },Math.max(70,200-total*8));
    },isCpu?400:550);
  },[busy,win,dilemma,cur,players.length,pos,stars,checkLanding]);

  const addPlayer = ()=>{
    if(!tempName.trim()||tempChar<0) return;
    const newPlayers=[...players,{name:tempName.trim(),char:CHARS_BALA[tempChar]}];
    const humanCount = newPlayers.length;
    if(humanCount >= nP){
      // Add Mayavi if 1-player
      const finalPlayers = hasCPU
        ? [...newPlayers,{name:'Mayavi',char:{id:'mayavi',icon:'🦊',color:'#283593',name:'Mayavi the Blue Jackal'},isCPU:true}]
        : newPlayers;
      setPlayers(finalPlayers);
      setPos(Array(finalPlayers.length).fill(1));
      setStars(Array(finalPlayers.length).fill(0));
      setGyan(Array(finalPlayers.length).fill(0));
      setAgyan(Array(finalPlayers.length).fill(0));
      setCur(0); setWin(null); ambient.start(); setScreen('game');
    } else { setPidx(p=>p+1); setTempName(''); setTempChar(-1); }
  };

  const restart=()=>{ setPlayers([]);setPidx(0);setTempName('');setTempChar(-1);setPos(Array(totalPlayers).fill(1));setStars(Array(totalPlayers).fill(0));setGyan(Array(totalPlayers).fill(0));setAgyan(Array(totalPlayers).fill(0));setCur(0);setWin(null);setDiceVal(null);setNaniKey('start');setScreen('setup'); };

  // ── TITLE ─────────────────────────────────────────────────────────────────
  if(screen==='title') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(170deg,#130800,#1e0f02,#1a0c00)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Baloo 2',sans-serif",textAlign:'center',position:'relative',overflow:'hidden'}}>
      <style>{CSS}</style>
      {/* Warm parchment atmosphere */}
      <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(ellipse at 20% 80%,rgba(240,165,0,.06) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(232,102,10,.04) 0%,transparent 60%)',pointerEvents:'none'}}/>
      <PanditjiSVG size={90}/>
      {['🪷','🌸','🪷','🌸','🪷'].map((f,i)=>(
        <span key={i} style={{
          position:'absolute',
          fontSize:i%2===0?'20px':'16px',
          left:`${[20,75,10,80,50][i]}%`,
          top:`${[30,25,55,60,15][i]}%`,
          animation:`lotusFloat ${2.5+i*0.4}s ease-in-out ${i*0.4}s infinite`,
          pointerEvents:'none',
          userSelect:'none',
          opacity:.7,
        }}>{f}</span>
      ))}
      <div style={{fontSize:'clamp(28px,7vw,48px)',fontWeight:900,fontFamily:"'Cinzel Decorative',serif",color:'#f0a500',marginTop:12,animation:'goldShimmer 3s ease infinite',textShadow:'0 0 40px rgba(240,165,0,.25),0 4px 8px rgba(0,0,0,.8)'}}>
        🌿 Bala Marg
      </div>
      <div style={{fontSize:'clamp(11px,2vw,14px)',color:'rgba(247,232,200,.6)',marginTop:6,letterSpacing:3,fontFamily:"'Noto Serif Devanagari',serif"}}>THE PANCHATANTRA FOREST</div>
      <div style={{fontSize:'clamp(12px,2vw,15px)',color:'rgba(247,232,200,.5)',marginTop:14,maxWidth:340,lineHeight:1.9}}>
        2,300 years of Indian wisdom.<br/>108 squares. Ancient secrets. Animal stories.
      </div>
      <div style={{display:'flex',gap:12,marginTop:28,flexWrap:'wrap',justifyContent:'center'}}>
        {[{id:'en',l:'🇬🇧 English'},{id:'hi',l:'🇮🇳 हिंदी'}].map(x=>(
          <button key={x.id} className="bb" onClick={()=>setLang(x.id)} style={{background:lang===x.id?'linear-gradient(135deg,#3d1a00,#6a3000)':'rgba(20,10,0,.6)',borderColor:lang===x.id?'rgba(240,165,0,.6)':'rgba(240,165,0,.15)',color:lang===x.id?'#f0a500':'rgba(247,232,200,.5)',minWidth:130}}>
            {x.l}
          </button>
        ))}
      </div>
      <button className="bb" style={{marginTop:16,padding:'16px 48px',fontSize:'clamp(16px,3vw,20px)'}} onClick={()=>setScreen('story')}>
        🪷 {isHi?'वन में प्रवेश करो!':'Enter the Forest!'}
      </button>
      <button onClick={onExit} style={{marginTop:12,background:'transparent',border:'none',color:'rgba(247,232,200,.3)',fontSize:13,cursor:'pointer',fontFamily:"'Baloo 2',sans-serif"}}>← {isHi?'वापस':'Back'}</button>
    </div>
  );

  // ── STORY PAGES (like Moksha) ─────────────────────────────────────────────
  if(screen==='story'){
    const pg = BALA_STORY_PAGES[storyPage];
    const total = BALA_STORY_PAGES.length;
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(170deg,#130800,#1e0f02)',display:'flex',flexDirection:'column',padding:'20px 16px 100px',fontFamily:"'Baloo 2',sans-serif",position:'relative'}}>
        <style>{CSS}</style>
        {/* Progress */}
        <div style={{display:'flex',gap:5,justifyContent:'center',marginBottom:20}}>
          {Array.from({length:total}).map((_,i)=>(
            <div key={i} style={{height:3,flex:1,background:i<=storyPage?'#f0a500':'rgba(240,165,0,.15)',borderRadius:2,transition:'background .3s'}}/>
          ))}
        </div>
        {/* Icon + Title */}
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:44,animation:'bFloat 2s ease infinite',marginBottom:8}}>{pg.icon}</div>
          <div style={{fontSize:'clamp(18px,4vw,26px)',fontWeight:900,fontFamily:"'Cinzel Decorative',serif",color:'#f0a500'}}>{pg.title}</div>
        </div>
        {/* Panditji quote */}
        <div style={{background:'rgba(240,165,0,.06)',border:'1px solid rgba(240,165,0,.15)',borderRadius:16,padding:'14px 18px',marginBottom:18,display:'flex',gap:12,alignItems:'flex-start',maxWidth:560,margin:'0 auto 18px'}}>
          <PanditjiSVG size={44}/>
          <div style={{fontSize:'clamp(11px,1.9vw,13px)',color:'rgba(247,232,200,.65)',lineHeight:1.9,fontStyle:'italic',fontFamily:"'Baloo 2',sans-serif"}}>
            "{isHi?pg.hi:pg.en}"
          </div>
        </div>
        {/* Bullets */}
        <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:560,margin:'0 auto',width:'100%'}}>
          {pg.bullets_en.map((b,i)=>(
            <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',background:'rgba(255,255,255,.04)',border:`1px solid ${b.accent}30`,borderLeft:`3px solid ${b.accent||'rgba(240,165,0,.3)'}`,borderRadius:14,padding:'12px 16px',animation:`bSlide .4s ease ${i*.08}s both`}}>
              <span style={{fontSize:24,flexShrink:0,animation:'bFloat 2.5s ease infinite'}}>{b.icon}</span>
              <div>
                <div style={{fontSize:'clamp(12px,2vw,14px)',fontWeight:900,color:b.accent,marginBottom:3,fontFamily:"'Cinzel Decorative',serif"}}>{b.title}</div>
                <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(247,232,200,.6)',lineHeight:1.8}}>{b.text}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Nav */}
        <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'12px 24px 20px',background:'rgba(10,5,0,.98)',borderTop:'1px solid rgba(240,165,0,.1)',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:10}}>
          <button className="gb" onClick={()=>storyPage>0?setStoryPage(p=>p-1):setScreen('title')}>← {isHi?'पीछे':'Back'}</button>
          <button className="bb" onClick={()=>storyPage<total-1?setStoryPage(p=>p+1):setScreen('pickcount')}>
            {storyPage<total-1?(isHi?'आगे →':'Next →'):(isHi?'खेलो! →':'Play! →')}
          </button>
        </div>
      </div>
    );
  }

  // ── PICKCOUNT ─────────────────────────────────────────────────────────────
  if(screen==='pickcount') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(170deg,#130800,#1e0f02)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24,padding:24,fontFamily:"'Baloo 2',sans-serif",textAlign:'center'}}>
      <style>{CSS}</style>
      <PanditjiSVG size={70}/>
      <div style={{fontSize:'clamp(20px,4.5vw,30px)',fontWeight:900,fontFamily:"'Cinzel Decorative',serif",color:'#f0a500'}}>{isHi?'कितने साधक?':'How many seekers?'}</div>
      <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(247,232,200,.5)',maxWidth:300,lineHeight:1.8}}>
        {isHi?'1 खिलाड़ी = Mayavi से लड़ो!':'1 player = face Mayavi the Jackal!'}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14,maxWidth:400,width:'100%'}}>
        {[1,2,3,4].map(n=>(
          <div key={n} onClick={()=>{setNP(n);if(n===1){setScreen('mayavi');}else{setScreen('setup');}}}
            style={{background:nP===n?'rgba(240,165,0,.1)':'rgba(20,10,0,.5)',border:`2px solid ${nP===n?'rgba(240,165,0,.5)':'rgba(240,165,0,.1)'}`,borderRadius:16,padding:'18px 12px',cursor:'pointer',transition:'all .15s',textAlign:'center',transform:nP===n?'scale(1.04)':'scale(1)'}}>
            <div style={{fontSize:36,marginBottom:6}}>{['🌟','🌟🌟','🌟🌟🌟','🌟🌟🌟🌟'][n-1]}</div>
            <div style={{fontSize:'clamp(16px,3vw,20px)',fontWeight:900,color:nP===n?'#f0a500':'rgba(247,232,200,.6)',fontFamily:"'Cinzel Decorative',serif"}}>{n} {n===1?(isHi?'खिलाड़ी':'Player'):(isHi?'खिलाड़ी':'Players')}</div>
            {n===1&&<div style={{fontSize:11,color:'#f0a500',marginTop:4}}>vs Mayavi! 🦊</div>}
          </div>
        ))}
      </div>
      <button className="gb" onClick={()=>setScreen('story')}>← {isHi?'वापस':'Back'}</button>
    </div>
  );

  // ── MAYAVI INTRO (like Yama Awaits) ───────────────────────────────────────
  if(screen==='mayavi') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0a0818,#12062a,#180820)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Baloo 2',sans-serif",textAlign:'center',overflow:'hidden',position:'relative'}}>
      <style>{CSS}</style>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 60%,rgba(50,15,80,.4) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{animation:'mayaviIn .8s ease both',marginBottom:16}}>
        <MayaviSVG size={160}/>
      </div>
      <div style={{fontSize:'clamp(22px,5vw,34px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#bb86fc',animation:'bGlow 2s ease infinite',marginBottom:8}}>
        {isHi?'Mayavi इंतज़ार कर रहा है!':'Mayavi Awaits!'}
      </div>
      <div style={{fontSize:'clamp(11px,2vw,14px)',color:'rgba(187,134,252,.7)',marginBottom:6,fontFamily:"'Noto Serif Devanagari',serif"}}>मायावी · The Blue Jackal</div>
      <div style={{background:'rgba(50,15,80,.3)',border:'1px solid rgba(150,80,200,.3)',borderRadius:16,padding:'16px 20px',maxWidth:400,width:'100%',marginBottom:20}}>
        <div style={{fontSize:'clamp(13px,2.2vw,16px)',color:'rgba(247,232,200,.7)',lineHeight:1.9,fontStyle:'italic',fontFamily:"'Baloo 2',sans-serif"}}>
          "Kaw kaw! I am Mayavi the Blue Jackal! I once fooled an ENTIRE FOREST into thinking I was a magical creature! Can a young seeker like you beat me to the Golden Garden? I think NOT!"
        </div>
      </div>
      <div style={{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap',justifyContent:'center'}}>
        {['Clever 🧠','Cunning 🎭','Tricky 🎲','Fast 🏃','But also... very silly 🤡'].map(t=>(
          <span key={t} style={{fontSize:11,background:'rgba(180,100,220,.12)',color:'rgba(200,150,255,.7)',padding:'4px 10px',borderRadius:20,fontFamily:"'Baloo 2',sans-serif",fontWeight:700}}>{t}</span>
        ))}
      </div>
      <button className="bb" style={{background:'linear-gradient(135deg,#4a0060,#7b1fa2)',marginBottom:10}} onClick={()=>setScreen('setup')}>
        ⚔️ {isHi?'Mayavi को चुनौती दो!':'Challenge Mayavi!'}
      </button>
      <button className="gb" onClick={()=>setScreen('pickcount')}>← {isHi?'वापस':'Back'}</button>
    </div>
  );

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if(screen==='setup') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(170deg,#130800,#1e0f02)',display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 16px 40px',fontFamily:"'Baloo 2',sans-serif",gap:14}}>
      <style>{CSS}</style>
      <div style={{fontSize:'clamp(16px,3.5vw,22px)',fontWeight:900,fontFamily:"'Cinzel Decorative',serif",color:'#f0a500',textAlign:'center'}}>
        {isHi?`${pidx+1}वें साधक — साथी चुनो!`:`Seeker ${pidx+1} — Choose your companion!`}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,width:'100%',maxWidth:500}}>
        {CHARS_BALA.map((ch,i)=>(
          <div key={ch.id} onClick={()=>setTempChar(i)} style={{
            background:'rgba(20,10,0,.85)',
            border:`2px solid ${tempChar===i?'rgba(240,165,0,.6)':'rgba(180,130,60,.2)'}`,
            borderRadius:8,padding:12,textAlign:'center',cursor:'pointer',transition:'all .15s',
            transform:tempChar===i?'scale(1.05)':'scale(1)',
            position:'relative',overflow:'hidden',
            animation:tempChar===i?'lanternGlow 2s ease infinite':'none',
            boxShadow:tempChar===i?'0 0 0 2px rgba(240,165,0,.3),0 8px 20px rgba(0,0,0,.4),inset 0 0 20px rgba(240,165,0,.05)':'none',
          }}>
            <CornerOrnament pos="tl"/>
            <CornerOrnament pos="tr"/>
            <CornerOrnament pos="br"/>
            <CornerOrnament pos="bl"/>
            <AnimalSVG id={ch.id} size={54} animate={tempChar===i}/>
            <div style={{fontSize:12,fontWeight:700,fontFamily:"'Cinzel Decorative',serif",color:tempChar===i?'#f0a500':'rgba(247,232,200,.7)',marginTop:5}}>{ch.name}</div>
            <div style={{fontSize:'clamp(8px,1.4vw,10px)',color:'rgba(240,165,0,.6)',fontFamily:"'Noto Serif Devanagari',serif"}}>{ch.skt}</div>
            <div style={{fontSize:10,color:'#f0a500',marginTop:2,opacity:.7}}>{ch.gift}</div>
          </div>
        ))}
      </div>
      {tempChar>=0&&<div style={{background:'rgba(240,165,0,.06)',border:'1px solid rgba(240,165,0,.15)',borderRadius:14,padding:'10px 16px',maxWidth:380,width:'100%',fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(247,232,200,.55)',lineHeight:1.8,textAlign:'center',fontStyle:'italic',fontFamily:"'Baloo 2',sans-serif"}}>
        {CHARS_BALA[tempChar].story}
      </div>}
      <input value={tempName} onChange={e=>setTempName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPlayer()}
        placeholder={isHi?'अपना नाम लिखो...':'Your name...'} style={{width:'100%',maxWidth:300,padding:'12px 18px',fontSize:16,borderRadius:50,border:'2px solid rgba(240,165,0,.4)',outline:'none',fontFamily:"'Baloo 2',sans-serif",fontWeight:700,textAlign:'center',background:'rgba(20,10,0,.7)',color:'#f7e8c8'}}/>
      <button className="bb" onClick={addPlayer} style={{opacity:(!tempName.trim()||tempChar<0)?.4:1}}>
        {pidx<nP-1?(isHi?'अगला साधक →':'Next Seeker →'):(isHi?'वन में चलो! 🌿':'Enter the Forest! 🌿')}
      </button>
    </div>
  );

  // ── WIN/LOSE ──────────────────────────────────────────────────────────────
  if(win!==null){
    const winner=players[win];
    const mayaviWon=hasCPU&&win===players.length-1;
    // Karma title based on Gyan/Agyan ratio
    const wg=gyan[win]||0, wa=agyan[win]||0;
    const karmaTitle = wg>=8&&wa===0 ? {t:'✨ The Wise Sage',c:'#ffd700',d:'Pure wisdom. The Panchatantra would write a story about you.'}
      : wg>=6&&wg>wa*2  ? {t:'🌟 The Growing Seeker',c:'#69f0ae',d:'Much more light than shadow. Panditji is proud.'}
      : wg>=4&&wg>wa    ? {t:'🌱 The Learning Child',c:'#81c784',d:'More wisdom than ignorance. You are on the right path.'}
      : wg===wa         ? {t:'⚖️ The Balanced Traveller',c:'#ffd54f',d:'Equal light and shadow. The real journey begins now.'}
      : wa>wg           ? {t:'🌑 The One Who Will Try Again',c:'#90a4ae',d:'More shadows than stars — but every wise teacher fell before they soared.'}
      : {t:'🌿 The Forest Wanderer',c:'#aed581',d:'Just beginning the journey of wisdom.'};
    return (
      <div style={{minHeight:'100vh',background:mayaviWon?'linear-gradient(135deg,#0a0818,#12062a)':'radial-gradient(ellipse at 50% 40%,#2a1800,#1a0d00 60%,#130800 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Baloo 2',sans-serif",textAlign:'center',position:'relative'}}>
        <style>{CSS}</style>
        {!mayaviWon && <LottieOverlay src="/lottie/celebrate.json" opacity={0.65}/>}
        {mayaviWon
          ? <><MayaviSVG size={120}/><div style={{fontSize:'clamp(20px,5vw,32px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#bb86fc',margin:'12px 0',animation:'bGlow 2s ease infinite'}}>Kaw! Mayavi Wins!</div><div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(187,134,252,.65)',maxWidth:380,lineHeight:1.9,marginBottom:20}}>{pm('lose')}</div></>
          : <><div style={{position:'relative',zIndex:2}}>
              {winner && CHAR_LOTTIES[winner.char?.id] && (
                <LottieInline src={CHAR_LOTTIES[winner.char.id]} size={100} loop/>
              )}
              <div style={{fontSize:72,animation:'bFloat 1.5s ease infinite',marginBottom:8}}>🌟</div>
              <div style={{fontSize:'clamp(22px,5vw,36px)',fontWeight:900,fontFamily:"'Cinzel Decorative',serif",color:'#f0a500',marginBottom:4,animation:'goldShimmer 3s ease infinite'}}>{winner?.name} {isHi?'जीत गया!':'Wins!'}</div>
              {/* Karma title */}
              <div style={{fontSize:'clamp(16px,3vw,22px)',fontWeight:900,color:karmaTitle.c,marginBottom:4,fontFamily:"'Cinzel Decorative',serif"}}>{karmaTitle.t}</div>
              <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(247,232,200,.5)',marginBottom:4,maxWidth:360,fontStyle:'italic'}}>{karmaTitle.d}</div>
              {/* Gyan/Agyan summary */}
              <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:16,fontSize:'clamp(12px,2vw,14px)'}}>
                <span style={{color:'#f0a500',fontWeight:800}}>🪷 {wg} Gyan</span>
                <span style={{color:'rgba(247,232,200,.3)'}}>·</span>
                <span style={{color:'#90a4ae',fontWeight:800}}>{wa} Agyan 🌑</span>
              </div>
              <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(240,165,0,.55)',marginBottom:16,maxWidth:380,lineHeight:1.9,fontStyle:'italic'}}>{pm('win')}</div>
            </div></>
        }
        {starFlash && (
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(240,165,0,.1)',border:'1px solid rgba(240,165,0,.25)',borderRadius:8,padding:'8px 16px',marginBottom:12,zIndex:2,position:'relative'}}>
            <LottieInline src="/lottie/star-earn.json" size={32} loop={false}/>
            <span style={{color:'#f0a500',fontWeight:700}}>{starFlash}</span>
          </div>
        )}
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:24,position:'relative',zIndex:2}}>
          {players.map((p,i)=>(
            <div key={i} style={{background:i===win?'rgba(240,165,0,.12)':'rgba(20,10,0,.5)',border:`2px solid ${i===win?'rgba(240,165,0,.5)':'rgba(240,165,0,.1)'}`,borderRadius:16,padding:'12px 18px',minWidth:90}}>
              {p.isCPU?<MayaviSVG size={46}/>:<AnimalSVG id={p.char.id} size={46} animate={i===win}/>}
              <div style={{fontSize:12,color:i===win?'#f0a500':'rgba(247,232,200,.45)',fontWeight:800,marginTop:4}}>{p.name}</div>
              <div style={{fontSize:11,color:'#f0a500'}}>{'⭐'.repeat(Math.min(stars[i],8))}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',position:'relative',zIndex:2}}>
          <button className="bb" onClick={restart}>🎲 {isHi?'फिर खेलो':'Play Again'}</button>
          <button className="bb" style={{background:'rgba(20,10,0,.8)',border:'1px solid rgba(240,165,0,.15)',color:'rgba(247,232,200,.6)'}} onClick={()=>{ambient.stop();onExit();}}>🏠 {isHi?'घर जाओ':'Home'}</button>
        </div>
      </div>
    );
  }

  // ── GAME ────────────────────────────────────────────────────────────────────
  const cp=players[cur], realm=getBalaRealm(pos[cur]||1);
  const isCpuTurn = hasCPU && cur===players.length-1;
  return (
    <div style={{minHeight:'100vh',background:'#130800',fontFamily:"'Baloo 2',sans-serif",
      backgroundImage:'radial-gradient(ellipse at 50% 100%,rgba(40,20,0,.8) 0%,transparent 70%)',
      position:'relative'}}>
      <style>{CSS}</style>

      {/* Fixed top bar — like Moksha */}
      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:50,
        background:'rgba(10,5,0,.95)',borderBottom:'1px solid rgba(240,165,0,.15)',
        backdropFilter:'blur(12px)',padding:'6px 12px',
        display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
        <button onClick={()=>{ambient.stop();onExit();}} className="gb" style={{padding:'4px 12px',fontSize:11}}>
          ← {isHi?'घर':'Home'}
        </button>
        {/* Player chips */}
        <div style={{display:'flex',gap:6,flexWrap:'nowrap',flex:1,justifyContent:'center',overflowX:'auto',padding:'0 2px'}}>
          {players.map((p,i)=>{
            const g=gyan[i]||0,a=agyan[i]||0,total=g+a;
            const gPct=total>0?Math.round(g/total*100):50;
            return (
              <div key={i} style={{display:'flex',alignItems:'center',gap:5,padding:'3px 10px',
                borderRadius:16,
                background:i===cur?'rgba(240,165,0,.1)':'rgba(20,10,0,.6)',
                border:`1px solid ${i===cur?'rgba(240,165,0,.35)':'rgba(240,165,0,.08)'}`,
                boxShadow:i===cur?'0 0 12px rgba(240,165,0,.1)':'none',
                transition:'all .3s'}}>
                {p.isCPU?<span style={{fontSize:14}}>🦊</span>:<span style={{fontSize:13}}>{p.char?.icon}</span>}
                <div>
                  <div style={{fontSize:10,fontWeight:800,color:i===cur?'#f0a500':'rgba(247,232,200,.5)',lineHeight:1}}>{p.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:3,marginTop:1}}>
                    <span style={{fontSize:8,color:'#f0a500',fontWeight:700}}>🪷{g}</span>
                    <div style={{width:30,height:3,background:'rgba(255,255,255,.1)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{width:`${gPct}%`,height:'100%',background:'linear-gradient(90deg,#f0a500,#e8660a)',borderRadius:2,transition:'width .5s'}}/>
                    </div>
                    <span style={{fontSize:8,color:'#78909c',fontWeight:700}}>{a}🌑</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:10,color:'rgba(240,165,0,.35)',textAlign:'right'}}>
          {realm.icon} Sq {pos[cur]||1}/108
        </div>
      </div>

      {/* Main content — board + panel side by side (like Moksha), stacks on mobile */}
      <div style={{display:'flex',gap:10,padding:'62px 8px 20px',
        minHeight:'100vh',alignItems:'flex-start',
        flexWrap:'wrap',          // panel wraps below board on mobile
        maxWidth:1100,margin:'0 auto'}}>

        {/* LEFT: Board */}
        <div style={{flex:'1 1 340px', maxWidth:680, minWidth:0}}>
          {/* Star flash */}
          {starFlash&&(
            <div style={{textAlign:'center',fontSize:'clamp(12px,2vw,15px)',color:'#ffd700',
              fontWeight:900,animation:'bSlide .3s ease',marginBottom:6,padding:'5px 12px',
              background:'rgba(255,215,0,.08)',borderRadius:8,border:'1px solid rgba(255,215,0,.2)'}}>
              {starFlash}
            </div>
          )}
          {/* Mayavi taunt */}
          {mayaviTxt&&(
            <div style={{background:'rgba(40,53,147,.15)',border:'1px solid rgba(121,134,203,.2)',
              borderRadius:8,padding:'6px 12px',marginBottom:6,
              fontSize:'clamp(10px,1.7vw,12px)',color:'#7986cb',fontStyle:'italic',
              textAlign:'center',animation:'bSlide .3s ease'}}>
              🦊 "{mayaviTxt}"
            </div>
          )}
          <BalaBoard players={players} pos={pos} cur={cur} crownRiddle={crownRiddle}/>
          {/* Board legend */}
          <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:8,flexWrap:'wrap'}}>
            {[['🐍 Snake — क्रोध','rgba(200,50,50,.15)'],['🌈 Ladder — मैत्री','rgba(240,165,0,.12)'],
              ['🔭 Discovery','rgba(120,80,220,.15)'],['⚖ Choice','rgba(240,165,0,.1)']].map(([l,bg])=>(
              <div key={l} style={{fontSize:'clamp(8px,1.3vw,10px)',background:bg,
                padding:'2px 8px',borderRadius:10,color:'rgba(247,232,200,.45)',
                fontFamily:"'Baloo 2',sans-serif",fontWeight:600,
                border:'1px solid rgba(240,165,0,.08)'}}>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Panel — fixed width on desktop, full width below board on mobile */}
        <div style={{flex:'0 0 clamp(220px,28vw,290px)',minWidth:'min(100%,220px)',display:'flex',flexDirection:'column',gap:8}}>

          {/* Current player card */}
          <div style={{background:'rgba(15,8,0,.9)',border:`1px solid rgba(240,165,0,.1)`,
            borderTop:`3px solid ${cp.char?.color||'#f0a500'}`,
            padding:'clamp(10px,1.8vw,14px)',borderRadius:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,
              padding:'6px 10px',background:`${cp.char?.color||'#f0a500'}10`,borderRadius:4}}>
              {cp.isCPU?<MayaviSVG size={24}/>:<AnimalSVG id={cp.char?.id} size={24} animate={true}/>}
              <span style={{fontSize:13,color:cp.char?.color||'#f0a500',fontWeight:700,letterSpacing:1}}>{cp.name}</span>
              {isCpuTurn&&<span style={{fontSize:9,color:'#bb86fc',marginLeft:'auto',animation:'bFloat 1s ease infinite'}}>thinking...</span>}
            </div>

            {/* Gyan / Agyan balance — like Punya/Papa in Moksha */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:8,letterSpacing:2,color:'rgba(240,165,0,.4)',fontWeight:700,marginBottom:6,textAlign:'center',fontFamily:"'Noto Serif Devanagari',serif"}}>WISDOM BALANCE</div>
              <div style={{display:'flex',justifyContent:'space-around',marginBottom:6}}>
                {/* Gyan */}
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:22,marginBottom:2,filter:'drop-shadow(0 0 6px rgba(240,165,0,.6))',animation:(gyan[cur]||0)>0?'gyaanPulse 1.5s ease':'none'}}>🪷</div>
                  <div style={{fontSize:20,fontWeight:900,color:'#f0a500',lineHeight:1,textShadow:'0 0 10px rgba(240,165,0,.5)'}}>{gyan[cur]||0}</div>
                  <div style={{fontSize:7,color:'rgba(240,165,0,.5)',letterSpacing:1,marginTop:2,fontFamily:"'Noto Serif Devanagari',serif"}}>GYAN</div>
                  <div style={{fontSize:6,color:'rgba(240,165,0,.35)',fontFamily:"'Noto Serif Devanagari',serif"}}>ज्ञान</div>
                </div>
                {/* Balance bar */}
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,margin:'0 10px'}}>
                  <div style={{width:'100%',height:6,background:'rgba(255,255,255,.08)',borderRadius:3,overflow:'hidden',position:'relative'}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,
                      width:`${(gyan[cur]||0)/Math.max(1,(gyan[cur]||0)+(agyan[cur]||0))*100}%`,
                      background:'linear-gradient(90deg,#f0a500,#e8660a)',
                      borderRadius:3,transition:'width .6s ease'}}/>
                  </div>
                  <div style={{fontSize:7,color:'rgba(247,232,200,.2)',marginTop:3,letterSpacing:1}}>
                    {(gyan[cur]||0)>(agyan[cur]||0)?'🪷 Wisdom leads':'🌑 Learn more'}
                  </div>
                </div>
                {/* Agyan */}
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:22,marginBottom:2,filter:'drop-shadow(0 0 4px rgba(120,150,180,.4))',animation:(agyan[cur]||0)>0?'agyanPulse 2s ease':'none'}}>🌫️</div>
                  <div style={{fontSize:20,fontWeight:900,color:'#78909c',lineHeight:1}}>{agyan[cur]||0}</div>
                  <div style={{fontSize:7,color:'rgba(120,150,180,.5)',letterSpacing:1,marginTop:2}}>AGYAN</div>
                  <div style={{fontSize:6,color:'rgba(120,150,180,.35)',fontFamily:"'Noto Serif Devanagari',serif"}}>अज्ञान</div>
                </div>
              </div>
            </div>

            {/* Dice display */}
            <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
              <div style={{width:58,height:58,background:'linear-gradient(135deg,#0d0800,#150c00)',
                border:'2px solid rgba(240,165,0,.25)',borderRadius:8,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:diceVal?36:28,
                animation:diceAnim?'bSpin .5s ease':'none',
                boxShadow:'inset 0 0 15px rgba(0,0,0,.4)',
                filter:'drop-shadow(0 0 8px rgba(240,165,0,.2))'}}>
                {diceVal?['','⚀','⚁','⚂','⚃','⚄','⚅'][diceVal]:'🎲'}
              </div>
            </div>

            {/* Roll button */}
            {!isCpuTurn&&(
              <button onClick={()=>doRoll(false)} disabled={busy||!!dilemma} className="bb"
                style={{width:'100%',padding:'clamp(10px,1.5vw,13px)',
                  fontSize:'clamp(13px,1.8vw,15px)',letterSpacing:3,justifyContent:'center'}}>
                {busy?'Moving...':'Roll Dice'}
              </button>
            )}
            {isCpuTurn&&(
              <div style={{textAlign:'center',padding:'10px',color:'#7986cb',
                fontSize:12,fontStyle:'italic',animation:'bFloat 1.5s ease infinite'}}>
                🦊 Mayavi is thinking...
              </div>
            )}
          </div>

          {/* Panditji message */}
          <div style={{background:'rgba(15,8,0,.8)',border:'1px solid rgba(240,165,0,.1)',
            padding:'10px 12px',borderRadius:6,display:'flex',gap:8,alignItems:'flex-start'}}>
            <PanditjiSVG size={38}/>
            <div>
              <div style={{fontSize:8,color:'rgba(240,165,0,.4)',fontWeight:900,
                letterSpacing:1,marginBottom:3,fontFamily:"'Noto Serif Devanagari',serif"}}>
                PANDITJI
              </div>
              <div style={{fontSize:'clamp(10px,1.5vw,12px)',color:'rgba(247,232,200,.6)',
                lineHeight:1.8,fontStyle:'italic'}}>{pm(naniKey)}</div>
            </div>
          </div>

          {/* Square info on hover — future enhancement placeholder */}

        </div>
      </div>

      {/* Popups */}
      {storyPop&&<StoryPopup data={storyPop.data} type={storyPop.type} onClose={closeStory}/>}
      {discPop&&<DiscoveryPopup sq={discPop} onClose={closeDisc}/>}
      {dilemma&&<DilemmaPopup dilemma={dilemma} onSolve={solveD}/>}
      {crownRiddle&&<CrownRiddlePopup riddle={CROWN_RIDDLES[crownRiddle.sq]} sq={crownRiddle.sq} onSolve={solveCrown} onSkip={()=>solveCrown(false)}/>}
    </div>
  );
}