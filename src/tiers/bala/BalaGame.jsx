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
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;700&display=swap');
*{box-sizing:border-box}
body{margin:0;background:#040d06}
@keyframes bFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes bPop{0%{transform:scale(.15);opacity:0}65%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes bBounce{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.1)}100%{transform:translateY(0) scale(1)}}
@keyframes bPulse{0%,100%{box-shadow:0 0 0 0 rgba(105,240,174,.5)}70%{box-shadow:0 0 0 8px rgba(105,240,174,0)}}
@keyframes bSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes bWiggle{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes bGlow{0%,100%{opacity:.7;filter:blur(3px)}50%{opacity:1;filter:blur(5px)}}
@keyframes bRainbow{0%{color:#69f0ae}20%{color:#ffd700}40%{color:#ff6b9d}60%{color:#64b5f6}80%{color:#ce93d8}100%{color:#69f0ae}}
@keyframes bSlide{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
@keyframes bSlideLeft{0%{opacity:0;transform:translateX(-14px)}100%{opacity:1;transform:translateX(0)}}
@keyframes mayaviIn{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.1) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes snakePulse{0%,100%{filter:brightness(1) saturate(1)}50%{filter:brightness(1.2) saturate(1.3)}}
@keyframes ladderShine{0%,100%{opacity:.85}50%{opacity:1}}
@keyframes gyaanPulse{0%{box-shadow:0 0 0 0 rgba(255,215,0,.6)}70%{box-shadow:0 0 0 10px rgba(255,215,0,0)}100%{box-shadow:0 0 0 0 rgba(255,215,0,0)}}
@keyframes agyanPulse{0%{box-shadow:0 0 0 0 rgba(120,150,180,.5)}70%{box-shadow:0 0 0 8px rgba(120,150,180,0)}100%{box-shadow:0 0 0 0 rgba(120,150,180,0)}}
@keyframes firefly{0%,100%{opacity:0;transform:translateY(0) scale(1)}50%{opacity:.7;transform:translateY(-20px) scale(1.2)}}
@keyframes forestSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
.bb{background:linear-gradient(135deg,#1b5e20,#2e7d32);border:1px solid #69f0ae40;color:#69f0ae;padding:13px 28px;font-size:clamp(14px,2.3vw,17px);font-family:'Baloo 2',sans-serif;font-weight:800;cursor:pointer;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.4),inset 0 1px 0 rgba(105,240,174,.2);transition:all .2s;letter-spacing:.5px}
.bb:hover{background:linear-gradient(135deg,#2e7d32,#388e3c);box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 20px rgba(105,240,174,.1)}
.bb:active{transform:scale(.97)}
.bb:disabled{background:linear-gradient(135deg,#1a2a1a,#111);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.3);box-shadow:none;cursor:default;transform:none}
.bb-gold{background:linear-gradient(135deg,#4a3000,#6d4c00);border-color:#ffd70040;color:#ffd700;box-shadow:0 4px 16px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,215,0,.15)}
.bb-gold:hover{background:linear-gradient(135deg,#6d4c00,#8d6200);box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 20px rgba(255,215,0,.1)}
.bb-dark{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6)}
.bc{width:100%;background:rgba(20,40,20,.8);border:2px solid transparent;border-radius:8px;padding:12px 14px;font-size:clamp(12px,1.9vw,14px);font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;text-align:left;transition:all .18s;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:flex-start;gap:10px;line-height:1.6;color:rgba(255,255,255,.8)}
.bc:hover{transform:translateX(4px)}
.bc-wise{border-color:#43a047;background:rgba(20,60,20,.85)}.bc-wise:hover{background:rgba(30,80,30,.9)}
.bc-oops{border-color:#ff8f0060;background:rgba(40,20,10,.85)}.bc-oops:hover{background:rgba(60,30,10,.9)}
.gb{background:transparent;border:1px solid rgba(105,240,174,.2);color:#69f0ae;padding:8px 20px;font-size:12px;font-family:'Baloo 2',sans-serif;cursor:pointer;transition:all .3s;letter-spacing:2px;border-radius:4px}
.gb:hover{background:rgba(105,240,174,.06);border-color:rgba(105,240,174,.5)}
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

// ── Panditji SVG ──────────────────────────────────────────────────────────────
function PanditjiSVG({ size=64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{animation:'bWiggle 3s ease infinite',flexShrink:0}}>
      <ellipse cx="50" cy="72" rx="26" ry="22" fill="#fff9c4"/>
      <ellipse cx="50" cy="58" rx="20" ry="18" fill="#fff9c4"/>
      <circle cx="50" cy="36" r="20" fill="#ffcc80"/>
      <ellipse cx="50" cy="20" rx="20" ry="10" fill="#ff8f00"/>
      <ellipse cx="50" cy="18" rx="16" ry="7" fill="#ffa000"/>
      <circle cx="50" cy="15" r="4" fill="#ffd54f"/>
      <circle cx="43" cy="35" r="4" fill="white"/><circle cx="44" cy="35" r="2.5" fill="#4e342e"/>
      <circle cx="57" cy="35" r="4" fill="white"/><circle cx="58" cy="35" r="2.5" fill="#4e342e"/>
      <path d="M38 44 Q50 54 62 44 Q58 58 50 60 Q42 58 38 44Z" fill="white"/>
      <rect x="72" y="25" width="4" height="55" rx="2" fill="#8d6e63"/>
      <circle cx="74" cy="22" r="5" fill="#ffd54f"/>
      <rect x="18" y="52" width="16" height="12" rx="3" fill="#fff8e1" stroke="#ffa000" strokeWidth="1.5"/>
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

// ── BOARD with snake SVG paths ────────────────────────────────────────────────
function BalaBoard({ players, pos, cur, crownRiddle }) {
  const playersSq = players.map((_,pi)=>pos[pi]||1);

  // S-curve snake path (viewBox 0 0 100 100 for the 10x10 main grid)
  const snakePath = (f, t) => {
    const fc=sqMain(f), tc=sqMain(t);
    const dx=tc.x-fc.x, dy=tc.y-fc.y, len=Math.sqrt(dx*dx+dy*dy);
    const px=-dy/len, py=dx/len, wave=Math.min(len*.38,14);
    const cp1x=fc.x+dx*.28+px*wave, cp1y=fc.y+dy*.28+py*wave;
    const cp2x=fc.x+dx*.72-px*wave, cp2y=fc.y+dy*.72-py*wave;
    return {fc,tc,d:`M${fc.x.toFixed(1)},${fc.y.toFixed(1)} C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${tc.x.toFixed(1)},${tc.y.toFixed(1)}`};
  };

  const ladderParts = (f, t) => {
    const fc=sqMain(f), tc=sqMain(t);
    const dx=tc.x-fc.x, dy=tc.y-fc.y, len=Math.sqrt(dx*dx+dy*dy);
    const ux=dx/len, uy=dy/len, px=-uy*1.5, py=ux*1.5;
    const n=Math.max(3,Math.floor(len/8));
    const rungs=[];
    for(let i=0;i<=n;i++){const t2=i/n;rungs.push({x1:fc.x+t2*dx+px,y1:fc.y+t2*dy+py,x2:fc.x+t2*dx-px,y2:fc.y+t2*dy-py});}
    return {fc,tc,rungs,r1:{x1:fc.x+px,y1:fc.y+py,x2:tc.x+px,y2:tc.y+py},r2:{x1:fc.x-px,y1:fc.y-py,x2:tc.x-px,y2:tc.y-py}};
  };

  // Main board squares (1-100) — for SVG overlay coordinate in viewBox "0 0 100 100"
  function sqMain(n) {
    const {r,c} = sqP(n);
    return { x:(c+0.5)*10, y:(r+0.5)*10 };
  }

  const mainSquares = Array.from({length:100},(_,i)=>i+1).map(n=>({n,...sqP(n)}));
  const crownSquares = Array.from({length:8},(_,i)=>({n:101+i,ci:i}));

  return (
    <div style={{position:'relative',width:'100%'}}>

      {/* ── CROWN ROW (101-108) — like Moksha's Ashtanga Marga ── */}
      <div style={{
        position:'relative',
        background:'linear-gradient(180deg,rgba(100,200,120,.08),rgba(10,25,12,.5))',
        borderBottom:'2px solid rgba(105,240,174,.2)',
        padding:'6px 4px 4px',
        overflow:'hidden',
        borderRadius:'10px 10px 0 0',
      }}>
        {/* Jungle vine pattern overlay */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:.06}} viewBox="0 0 200 50" preserveAspectRatio="none">
          {[0,25,50,75,100,125,150,175].map(x=>(
            <g key={x}>
              <path d={`M${x},50 Q${x+12},25 ${x+25},0`} fill="none" stroke="#69f0ae" strokeWidth="1"/>
              <circle cx={x+6} cy={35} r="4" fill="none" stroke="#69f0ae" strokeWidth=".5"/>
              <circle cx={x+18} cy={15} r="3" fill="none" stroke="#69f0ae" strokeWidth=".5"/>
            </g>
          ))}
        </svg>
        <div style={{fontSize:'clamp(6px,1vw,9px)',textAlign:'center',letterSpacing:4,
          color:'#69f0ae',opacity:.5,marginBottom:4,fontFamily:"'Baloo 2',sans-serif",
          textShadow:'0 0 10px rgba(105,240,174,.3)'}}>
          ✨ PATH TO THE GOLDEN GARDEN · क्राउन मार्ग ✨
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:3}}>
          {crownSquares.map(({n,ci})=>{
            const isWin = n===108;
            const isRiddle = n>=101 && n<=107;
            const here = players.map((_,pi)=>playersSq[pi]===n?pi:-1).filter(x=>x>=0);
            const riddle = CROWN_RIDDLES[n];
            return (
              <div key={n} style={{
                aspectRatio:'1',
                background:isWin
                  ?'radial-gradient(circle,rgba(255,215,0,.25),rgba(255,140,0,.1))'
                  :'radial-gradient(circle,rgba(105,240,174,.08),transparent)',
                border:`1px solid ${isWin?'rgba(255,215,0,.5)':'rgba(105,240,174,.18)'}`,
                borderRadius:4,
                display:'flex',flexDirection:'column',
                alignItems:'center',justifyContent:'center',
                cursor:'pointer',position:'relative',
                transition:'all .3s',
                animation:isWin?'bFloat 3s ease infinite':'none',
                boxShadow:isWin?'0 0 16px rgba(255,215,0,.15)':'none',
              }}>
                <span style={{position:'absolute',top:1,left:2,
                  fontSize:'clamp(5px,.8vw,8px)',
                  color:isWin?'#ffd700':'rgba(105,240,174,.4)',fontWeight:700}}>
                  {n}
                </span>
                {/* Icon */}
                {isWin
                  ?<span style={{fontSize:'clamp(12px,2.2vw,20px)',filter:'drop-shadow(0 0 8px rgba(255,215,0,.8))',animation:'bFloat 1.5s ease infinite'}}>⭐</span>
                  :<span style={{fontSize:'clamp(11px,2vw,18px)',filter:'drop-shadow(0 0 5px rgba(105,240,174,.5))',animation:`bFloat ${2+ci*.3}s ease infinite`}}>{riddle?.icon||'❓'}</span>
                }
                {/* Sanskrit */}
                {isRiddle&&<span style={{fontSize:'clamp(4px,.6vw,7px)',color:'rgba(105,240,174,.55)',fontFamily:"'Noto Sans Devanagari',sans-serif",fontWeight:700,lineHeight:1}}>{riddle?.skt}</span>}
                {isWin&&<span style={{fontSize:'clamp(4px,.6vw,7px)',color:'#ffd700',fontWeight:700,fontFamily:"'Baloo 2',sans-serif",lineHeight:1}}>MOKSHA</span>}
                {/* Player tokens */}
                {here.length>0&&(
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:1,zIndex:5}}>
                    {here.map(pi=>{
                      const pc=players[pi].char?.color||'#69f0ae';
                      return(
                        <div key={pi} style={{width:'clamp(14px,2.5vw,22px)',height:'clamp(14px,2.5vw,22px)',borderRadius:'50%',
                          background:`radial-gradient(circle at 35% 30%,${pc}ee,${pc})`,
                          border:`2px solid ${pc}`,boxShadow:`0 0 10px ${pc}99`,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:'clamp(7px,1.2vw,12px)',
                          animation:pi===cur?'bPulse .9s ease infinite':'none'}}>
                          {players[pi].char?.icon}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN BOARD (1-100) ── */}
      <div style={{position:'relative',
        background:'#0a1a0d',
        border:'1px solid rgba(105,240,174,.1)',
        borderTop:'none',
        borderRadius:'0 0 10px 10px',
        overflow:'hidden',
        boxShadow:'0 10px 40px rgba(0,0,0,.6)',
      }}>
        {/* Jungle background gradient */}
        <div style={{position:'absolute',inset:0,
          background:`linear-gradient(to bottom,
            #0a1f0d 0%,#0d2510 22%,
            #060f18 23%,#08131f 45%,
            #1a0a0e 46%,#220c10 68%,
            #040d06 69%,#061508 100%)`,
          zIndex:0}}/>
        {/* Realm dividers */}
        <div style={{position:'absolute',left:'2%',right:'2%',top:'33.5%',height:1,
          background:'linear-gradient(90deg,transparent,rgba(105,240,174,.12),transparent)',zIndex:2,pointerEvents:'none'}}/>
        <div style={{position:'absolute',left:'2%',right:'2%',top:'67%',height:1,
          background:'linear-gradient(90deg,transparent,rgba(105,240,174,.12),transparent)',zIndex:2,pointerEvents:'none'}}/>

        {/* CSS Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',
          position:'relative',zIndex:3,aspectRatio:'10/10'}}>
          {mainSquares.map(({n,r,c})=>{
            const sn=SNAKES_BALA[n], ld=LADDERS_BALA[n];
            const disc=DISCOVERY_SQUARES[n], dlm=DLM_SQ_BALA.includes(n);
            const here=players.map((_,pi)=>playersSq[pi]===n?pi:-1).filter(x=>x>=0);
            let bg='rgba(10,25,12,.7)', border='rgba(105,240,174,.07)';
            if(sn){bg='radial-gradient(ellipse at 50% 30%,rgba(180,30,30,.4),rgba(80,10,10,.25))';border=sn.color+'55';}
            else if(ld){bg='radial-gradient(ellipse at 50% 70%,rgba(30,140,50,.3),rgba(10,60,20,.18))';border='rgba(105,240,174,.3)';}
            else if(disc){bg='radial-gradient(ellipse at 50% 30%,rgba(120,60,220,.3),rgba(50,20,100,.18))';border='rgba(179,136,255,.3)';}
            else if(dlm){bg='radial-gradient(ellipse,rgba(180,130,0,.2),rgba(80,60,0,.12))';border='rgba(255,193,7,.2)';}
            return (
              <div key={n} style={{
                aspectRatio:'1',background:bg,
                border:`0.5px solid ${border}`,
                display:'flex',flexDirection:'column',
                alignItems:'center',justifyContent:'center',
                cursor:'pointer',position:'relative',
                transition:'background .2s',overflow:'hidden',
              }}>
                {/* Number */}
                <span style={{
                  position:'absolute',top:1,left:2,
                  fontSize:'clamp(6px,.9vw,9px)',
                  color:sn?'#ff8a80':ld?'#69f0ae':disc?'#ce93d8':'rgba(105,240,174,.4)',
                  fontWeight:900,fontFamily:"'Nunito',sans-serif",
                  textShadow:'0 1px 4px rgba(0,0,0,.9)',lineHeight:1,
                }}>{n}</span>

                {/* SNAKE SQUARE — icon + text */}
                {sn&&!here.length&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',padding:'1px'}}>
                    {/* SVG snake icon */}
                    <svg width="clamp(14px,2.5vw,22px)" height="clamp(14px,2.5vw,22px)" viewBox="0 0 24 24">
                      <path d="M6 18 Q8 12 12 10 Q16 8 18 4" stroke={sn.color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                      <circle cx="18" cy="3.5" r="2.8" fill={sn.headColor}/>
                      <circle cx="16.8" cy="2.8" r=".8" fill="white"/>
                      <circle cx="19.2" cy="2.8" r=".8" fill="white"/>
                      <path d="M18,6 L17,8 M18,6 L19,8" stroke="#ff1744" strokeWidth=".8" strokeLinecap="round"/>
                    </svg>
                    <span style={{fontSize:'clamp(5px,.85vw,9px)',color:sn.color,fontWeight:900,
                      fontFamily:"'Noto Sans Devanagari',sans-serif",lineHeight:1.1,
                      textShadow:'0 0 8px rgba(0,0,0,.9)',textAlign:'center',
                      whiteSpace:'nowrap',overflow:'hidden',maxWidth:'100%'}}>
                      {sn.skt}
                    </span>
                    <span style={{fontSize:'clamp(4px,.65vw,7px)',color:'rgba(255,130,100,.7)',
                      fontWeight:700,fontFamily:"'Nunito',sans-serif",lineHeight:1,
                      textShadow:'0 0 6px rgba(0,0,0,.9)'}}>
                      {sn.en.split('·')[1]?.trim()||sn.en}
                    </span>
                  </div>
                )}

                {/* LADDER SQUARE — icon + text */}
                {ld&&!here.length&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',padding:'1px'}}>
                    {/* SVG ladder icon */}
                    <svg width="clamp(14px,2.5vw,22px)" height="clamp(14px,2.5vw,22px)" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id={`ladIco${n}`} x1="0" y1="22" x2="0" y2="2" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor={ld.color1}/>
                          <stop offset="100%" stopColor={ld.color2}/>
                        </linearGradient>
                      </defs>
                      <line x1="6" y1="22" x2="6" y2="2" stroke={`url(#ladIco${n})`} strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="18" y1="22" x2="18" y2="2" stroke={`url(#ladIco${n})`} strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="6" y1="19" x2="18" y2="19" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="6" y1="13" x2="18" y2="13" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="6" y1="7" x2="18" y2="7" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span style={{fontSize:'clamp(5px,.85vw,9px)',color:'#69f0ae',fontWeight:900,
                      fontFamily:"'Noto Sans Devanagari',sans-serif",lineHeight:1.1,
                      textShadow:'0 0 8px rgba(0,0,0,.9)',textAlign:'center',
                      whiteSpace:'nowrap',overflow:'hidden',maxWidth:'100%'}}>
                      {ld.skt}
                    </span>
                    <span style={{fontSize:'clamp(4px,.65vw,7px)',color:'rgba(130,220,130,.6)',
                      fontWeight:700,fontFamily:"'Nunito',sans-serif",lineHeight:1}}>
                      {ld.en}
                    </span>
                  </div>
                )}

                {/* DISCOVERY SQUARE */}
                {disc&&!sn&&!ld&&!here.length&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                    <span style={{fontSize:'clamp(12px,2.2vw,20px)',lineHeight:1,
                      animation:'bFloat 2s ease infinite',
                      filter:'drop-shadow(0 0 6px rgba(179,136,255,.8))'}}>{disc.icon}</span>
                    <span style={{fontSize:'clamp(4px,.7vw,7px)',color:'#ce93d8',fontWeight:800,
                      fontFamily:"'Nunito',sans-serif",letterSpacing:.5,lineHeight:1,marginTop:1}}>DISCOVER</span>
                    <span style={{fontSize:'clamp(4px,.6vw,6px)',color:'rgba(179,136,255,.5)',
                      fontFamily:"'Noto Sans Devanagari',sans-serif",lineHeight:1}}>{disc.skt}</span>
                  </div>
                )}

                {/* DILEMMA SQUARE */}
                {dlm&&!sn&&!ld&&!disc&&!here.length&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                    <span style={{fontSize:'clamp(10px,1.9vw,16px)',lineHeight:1}}>⚖</span>
                    <span style={{fontSize:'clamp(4px,.65vw,6px)',color:'rgba(255,193,7,.5)',
                      fontWeight:700,fontFamily:"'Nunito',sans-serif",letterSpacing:.3}}>CHOOSE</span>
                  </div>
                )}

                {/* PLAYER TOKENS */}
                {here.length>0&&(
                  <div style={{display:'flex',flexWrap:'wrap',gap:1,position:'absolute',
                    inset:0,alignItems:'center',justifyContent:'center',zIndex:8}}>
                    {here.map(pi=>{
                      const p=players[pi];
                      const pc=p.char?.color||'#69f0ae';
                      const isActive=pi===cur;
                      return(
                        <div key={pi} style={{display:'flex',flexDirection:'column',alignItems:'center',
                          transition:'all .3s',transform:isActive?'scale(1.4) translateY(-3px)':'scale(1)',
                          zIndex:isActive?10:5,position:'relative'}}>
                          {isActive&&<div style={{position:'absolute',inset:-3,borderRadius:4,
                            background:`${pc}15`,border:`1.5px solid ${pc}60`,
                            animation:'bPulse .9s ease infinite'}}/>}
                          <div style={{
                            width:'clamp(14px,2.4vw,26px)',height:'clamp(14px,2.4vw,26px)',
                            borderRadius:'50%',
                            background:`radial-gradient(circle at 35% 30%,${pc}ee,${pc} 60%,${pc}44)`,
                            border:`2px solid ${pc}`,
                            boxShadow:`0 0 ${isActive?14:5}px ${pc}${isActive?'cc':'44'},0 2px 6px rgba(0,0,0,.5)`,
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontSize:'clamp(7px,1.2vw,13px)',
                          }}>{p.char?.icon||'●'}</div>
                          <div style={{fontSize:'clamp(4px,.65vw,7px)',color:pc,fontWeight:900,
                            textShadow:`0 0 4px #000,0 0 8px ${pc}40`,
                            opacity:isActive?1:.6,lineHeight:1,marginTop:1}}>{p.name?.slice(0,5)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SVG Snake + Ladder overlay (100% × 100% over the 10×10 grid) */}
        <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',
          pointerEvents:'none',overflow:'visible',zIndex:10}}
          viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="snakeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation=".8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ladderGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation=".6" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {Object.entries(LADDERS_BALA).map(([f,ld])=>{
              const fc=sqMain(Number(f)), tc=sqMain(ld.to);
              return (<linearGradient key={f} id={`svgLG${f}`}
                x1={fc.x} y1={fc.y} x2={tc.x} y2={tc.y} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={ld.color1}/>
                <stop offset="50%" stopColor="white" stopOpacity="0.3"/>
                <stop offset="100%" stopColor={ld.color2}/>
              </linearGradient>);
            })}
          </defs>
          {/* Ladders */}
          {Object.entries(LADDERS_BALA).map(([f,ld])=>{
            const from=Number(f);
            const {r1,r2,rungs,fc,tc}=ladderParts(from,ld.to);
            return (
              <g key={f} filter="url(#ladderGlow)" style={{animation:'ladderShine 3s ease infinite'}}>
                <line {...r1} stroke="rgba(0,0,0,.4)" strokeWidth="2.5" strokeLinecap="round"/>
                <line {...r2} stroke="rgba(0,0,0,.4)" strokeWidth="2.5" strokeLinecap="round"/>
                <line {...r1} stroke={`url(#svgLG${f})`} strokeWidth="1.8" strokeLinecap="round"/>
                <line {...r2} stroke={`url(#svgLG${f})`} strokeWidth="1.8" strokeLinecap="round"/>
                <line {...r1} stroke="rgba(255,255,255,.3)" strokeWidth=".4" strokeLinecap="round"/>
                <line {...r2} stroke="rgba(255,255,255,.3)" strokeWidth=".4" strokeLinecap="round"/>
                {rungs.map((rg,i)=>(
                  <g key={i}>
                    <line {...rg} stroke="rgba(0,0,0,.3)" strokeWidth="1.8" strokeLinecap="round"/>
                    <line {...rg} stroke={i%2===0?ld.color1:ld.color2} strokeWidth="1.3" strokeLinecap="round" opacity=".9"/>
                    <line {...rg} stroke="rgba(255,255,255,.35)" strokeWidth=".35" strokeLinecap="round"/>
                  </g>
                ))}
                <circle cx={fc.x} cy={fc.y} r="2" fill={ld.color1} opacity=".9"/>
                <circle cx={tc.x} cy={tc.y} r="2.3" fill={ld.color2} opacity=".9"/>
              </g>
            );
          })}
          {/* Snakes */}
          {Object.entries(SNAKES_BALA).map(([f,sn])=>{
            const from=Number(f);
            const {fc,tc,d}=snakePath(from,sn.to);
            return (
              <g key={f} filter="url(#snakeGlow)" style={{animation:'snakePulse 2.5s ease infinite'}}>
                <path d={d} stroke={sn.color} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity=".1"/>
                <path d={d} stroke="rgba(0,0,0,.45)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
                <path d={d} stroke={sn.headColor} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".5"/>
                <path d={d} stroke={sn.color} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <path d={d} stroke="rgba(255,255,255,.18)" strokeWidth=".7" fill="none" strokeDasharray="2,3" strokeLinecap="round"/>
                <path d={d} stroke="rgba(255,255,255,.35)" strokeWidth=".35" fill="none" strokeLinecap="round"/>
                {/* Head */}
                <circle cx={fc.x} cy={fc.y+.3} r="3" fill="rgba(0,0,0,.3)"/>
                <ellipse cx={fc.x} cy={fc.y} rx="2.8" ry="2.5" fill={sn.headColor}/>
                <circle cx={fc.x-1.1} cy={fc.y-.5} r=".75" fill="white"/>
                <circle cx={fc.x+1.1} cy={fc.y-.5} r=".75" fill="white"/>
                <circle cx={fc.x-1.1} cy={fc.y-.4} r=".42" fill="#111"/>
                <circle cx={fc.x+1.1} cy={fc.y-.4} r=".42" fill="#111"/>
                <path d={`M${fc.x},${fc.y+1.8} L${fc.x-.7},${fc.y+3.2} M${fc.x},${fc.y+1.8} L${fc.x+.7},${fc.y+3.2}`}
                  stroke="#ff1744" strokeWidth=".65" strokeLinecap="round"/>
                <circle cx={tc.x} cy={tc.y} r="1.5" fill={sn.color} opacity=".6"/>
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
    <div style={{position:'fixed',inset:0,background:'rgba(10,10,40,.9)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:300}}>
      <div style={{background:'linear-gradient(135deg,#1a1a4e,#2d2d7a)',color:'white',borderRadius:28,padding:'clamp(18px,4vw,34px)',maxWidth:480,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,.5)',border:'2px solid rgba(255,220,80,.3)',animation:'bPop .3s ease',maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{textAlign:'center',fontSize:56,marginBottom:6,animation:'bFloat 2s ease infinite'}}>{d.icon}</div>
        <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(255,220,80,.65)',textAlign:'center',fontFamily:"'Noto Sans Devanagari',sans-serif",marginBottom:14,letterSpacing:1}}>{d.skt} · {d.sktM}</div>
        <div style={{background:'rgba(255,220,80,.1)',borderRadius:14,padding:'12px 16px',marginBottom:12,border:'1px solid rgba(255,220,80,.2)'}}>
          <div style={{fontSize:10,color:'rgba(255,220,80,.5)',marginBottom:4,letterSpacing:1,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>VEDIC WISDOM</div>
          <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(255,220,80,.88)',lineHeight:1.9,fontStyle:'italic',fontFamily:"'Nunito',sans-serif"}}>{d.vedic}</div>
        </div>
        <div style={{background:'rgba(100,180,255,.1)',borderRadius:14,padding:'12px 16px',marginBottom:12,border:'1px solid rgba(100,180,255,.2)'}}>
          <div style={{fontSize:10,color:'rgba(100,200,255,.5)',marginBottom:4,letterSpacing:1,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>WHAT SCIENCE FOUND</div>
          <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(200,230,255,.88)',lineHeight:1.9,fontFamily:"'Nunito',sans-serif"}}>{d.science}</div>
        </div>
        <div style={{textAlign:'center',fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(200,160,255,.7)',fontStyle:'italic',marginBottom:18,lineHeight:1.8,fontFamily:"'Nunito',sans-serif"}}>✦ {d.wonder}</div>
        <div style={{textAlign:'center'}}><button className="bb" onClick={onClose} style={{background:'linear-gradient(135deg,#7c4dff,#651fff)'}}>✨ I will tell someone tonight!</button></div>
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
        background:'linear-gradient(180deg,#0a1f0d,#061408)',
        border:'2px solid rgba(105,240,174,.3)',
        borderTop:'4px solid #69f0ae',
        borderRadius:16,padding:'clamp(20px,4vw,32px)',
        maxWidth:500,width:'100%',
        boxShadow:'0 0 60px rgba(105,240,174,.1),0 20px 60px rgba(0,0,0,.6)',
        animation:'bPop .35s ease',maxHeight:'90vh',overflowY:'auto',
      }}>
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:'clamp(6px,1vw,9px)',letterSpacing:4,color:'rgba(105,240,174,.4)',
            fontWeight:700,marginBottom:6,fontFamily:"'Baloo 2',sans-serif"}}>
            ✨ CROWN RIDDLE — SQUARE {sq}
          </div>
          <div style={{fontSize:52,marginBottom:6,animation:'bFloat 2s ease infinite',
            filter:'drop-shadow(0 0 12px rgba(105,240,174,.5))'}}>{riddle.icon}</div>
          <div style={{fontSize:'clamp(16px,3vw,22px)',fontWeight:900,
            fontFamily:"'Baloo 2',sans-serif",color:'#69f0ae',marginBottom:2}}>
            {riddle.title}
          </div>
          <div style={{fontSize:'clamp(9px,1.4vw,11px)',color:'rgba(105,240,174,.4)',
            fontFamily:"'Noto Sans Devanagari',sans-serif"}}>
            {riddle.skt} · {riddle.sktM}
          </div>
        </div>

        {/* Question */}
        <div style={{background:'rgba(105,240,174,.06)',border:'1px solid rgba(105,240,174,.15)',
          borderRadius:12,padding:'14px 18px',marginBottom:18,
          fontSize:'clamp(13px,2.2vw,16px)',color:'rgba(255,255,255,.85)',
          lineHeight:1.9,fontFamily:"'Nunito',sans-serif",fontWeight:700,textAlign:'center'}}>
          {riddle.q}
        </div>

        {/* Choices */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
          {riddle.choices.map((ch,i)=>{
            let bg='rgba(255,255,255,.04)', border='rgba(255,255,255,.12)', color='rgba(255,255,255,.7)';
            if(revealed){
              if(i===riddle.correct){bg='rgba(105,240,174,.2)';border='#69f0ae';color='#69f0ae';}
              else if(i===chosen&&chosen!==riddle.correct){bg='rgba(200,50,50,.2)';border='#ef5350';color='#ef5350';}
            }
            if(!revealed&&chosen===null) {/* no override */}
            return (
              <button key={i} onClick={()=>handleChoice(i)}
                disabled={revealed}
                style={{
                  background:bg,border:`2px solid ${border}`,borderRadius:10,
                  padding:'clamp(10px,1.8vw,14px) 10px',
                  color,fontWeight:800,fontFamily:"'Nunito',sans-serif",
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
          <div style={{background:isCorrect?'rgba(105,240,174,.1)':'rgba(255,152,0,.08)',
            border:`1px solid ${isCorrect?'rgba(105,240,174,.3)':'rgba(255,152,0,.3)'}`,
            borderRadius:12,padding:'12px 16px',marginBottom:16,animation:'bSlide .4s ease'}}>
            <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(255,255,255,.6)',
              lineHeight:1.9,fontFamily:"'Nunito',sans-serif",fontStyle:'italic'}}>
              {isCorrect?'🌟 ':'💡 '}{riddle.wisdom}
            </div>
          </div>
        )}

        {/* Actions */}
        {revealed&&(
          <div style={{textAlign:'center',display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            {isCorrect
              ? <button onClick={()=>onSolve(true)}
                  style={{background:'linear-gradient(135deg,#1b5e20,#2e7d32)',
                    border:'1px solid #69f0ae40',color:'#69f0ae',
                    padding:'12px 28px',fontSize:'clamp(13px,2vw,16px)',fontWeight:800,
                    borderRadius:8,cursor:'pointer',fontFamily:"'Baloo 2',sans-serif",letterSpacing:1}}>
                  ✨ Correct! Move Forward →
                </button>
              : <>
                  <button onClick={()=>{setChosen(null);setRevealed(false);}}
                    style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.15)',
                      color:'rgba(255,255,255,.6)',padding:'10px 20px',fontSize:13,fontWeight:700,
                      borderRadius:8,cursor:'pointer',fontFamily:"'Baloo 2',sans-serif"}}>
                    Try Again
                  </button>
                  <button onClick={()=>onSolve(false)}
                    style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.1)',
                      color:'rgba(255,255,255,.35)',padding:'10px 20px',fontSize:12,
                      borderRadius:8,cursor:'pointer',fontFamily:"'Nunito',sans-serif"}}>
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
  const accent = isL?'#43a047':'#ef5350';
  const bg = isL?'linear-gradient(135deg,#f1f8e9,#dcedc8)':'linear-gradient(135deg,#fce4ec,#f8bbd0)';
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:250}}>
      <div style={{background:bg,borderRadius:24,padding:'clamp(18px,3.5vw,30px)',maxWidth:480,width:'100%',boxShadow:'0 16px 48px rgba(0,0,0,.28)',border:`3px solid ${accent}`,animation:'bPop .3s ease',maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{textAlign:'center',fontSize:52,marginBottom:6,animation:'bFloat 2s ease infinite'}}>{data.emoji}</div>
        <div style={{textAlign:'center',fontSize:'clamp(14px,2.5vw,18px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:accent,marginBottom:3}}>{data.title}</div>
        <div style={{textAlign:'center',fontSize:'clamp(9px,1.4vw,11px)',color:'rgba(0,0,0,.4)',marginBottom:10,letterSpacing:1,fontFamily:"'Noto Sans Devanagari',sans-serif"}}>{data.skt} · {data.en}</div>
        {data.from&&<div style={{textAlign:'center',marginBottom:10}}><span style={{fontSize:12,background:accent+'22',borderRadius:20,padding:'3px 12px',color:accent,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>{isL?'↑ ':'↓ '}Square {data.from} → {data.to}</span></div>}
        <div style={{background:'rgba(255,255,255,.75)',borderRadius:14,padding:14,marginBottom:12,fontSize:'clamp(12px,2vw,14px)',color:'#333',lineHeight:1.95,fontFamily:"'Nunito',sans-serif"}}>{data.story}</div>
        <div style={{background:accent+'18',borderRadius:12,padding:'10px 14px',marginBottom:16,display:'flex',alignItems:'flex-start',gap:8}}>
          <span style={{fontSize:18,flexShrink:0}}>{isL?'💡':'⚠️'}</span>
          <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'#333',lineHeight:1.7,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>{data.lesson}</div>
        </div>
        <div style={{textAlign:'center'}}><button className={`bb ${isL?'bb-green':''}`} onClick={onClose}>{isL?'⭐ I understand!':'🙏 I will remember this'}</button></div>
      </div>
    </div>
  );
}

function DilemmaPopup({ dilemma, onSolve }) {
  if (!dilemma) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:260}}>
      <div style={{background:'white',borderRadius:24,padding:'clamp(18px,3.5vw,28px)',maxWidth:480,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,.3)',border:'3px solid #ffd54f',animation:'bPop .3s ease',maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{textAlign:'center',fontSize:36,marginBottom:6}}>🤔</div>
        <div style={{textAlign:'center',fontSize:'clamp(14px,2.5vw,18px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#e65100',marginBottom:8}}>{dilemma.t}</div>
        <div style={{background:'#fff3e0',borderRadius:14,padding:'10px 14px',marginBottom:12,fontSize:'clamp(11px,1.8vw,13px)',color:'#5d4037',lineHeight:1.9,fontStyle:'italic',fontFamily:"'Nunito',sans-serif"}}>📖 {dilemma.setup}</div>
        <div style={{fontSize:'clamp(12px,2vw,14px)',color:'#444',lineHeight:1.9,marginBottom:14,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{dilemma.q}</div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:12}}>
          {dilemma.c.map((ch,ci)=>(
            <button key={ci} className={`bc ${ch.k==='star'?'bc-wise':'bc-oops'}`} onClick={()=>onSolve(ci)}>
              <span style={{fontSize:20,flexShrink:0}}>{ch.k==='star'?'💚':'🟠'}</span>
              <span>{ch.l}</span>
            </button>
          ))}
        </div>
        <div style={{fontSize:'clamp(10px,1.5vw,12px)',color:'#999',textAlign:'center',fontStyle:'italic',fontFamily:"'Noto Sans Devanagari',sans-serif"}}>— {dilemma.skt} · {dilemma.sktM}</div>
        <div style={{fontSize:'clamp(10px,1.5vw,12px)',color:'#bbb',textAlign:'center',marginTop:4,fontStyle:'italic',fontFamily:"'Nunito',sans-serif"}}>"{dilemma.wisdom}"</div>
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
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0d2818,#1a4a30,#0d3a22)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Nunito',sans-serif",textAlign:'center',position:'relative',overflow:'hidden'}}>
      <style>{CSS}</style>
      {/* Forest atmosphere */}
      <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(ellipse at 20% 80%,rgba(67,160,71,.08) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(129,212,250,.06) 0%,transparent 60%)',pointerEvents:'none'}}/>
      <PanditjiSVG size={90}/>
      <div style={{fontSize:'clamp(28px,7vw,48px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#69f0ae',marginTop:12,textShadow:'0 0 30px rgba(105,240,174,.3)'}}>
        🌿 Bala Marg
      </div>
      <div style={{fontSize:'clamp(11px,2vw,14px)',color:'rgba(105,240,174,.55)',marginTop:6,letterSpacing:3,fontFamily:"'Nunito',sans-serif"}}>THE PANCHATANTRA FOREST</div>
      <div style={{fontSize:'clamp(12px,2vw,15px)',color:'rgba(255,255,255,.5)',marginTop:14,maxWidth:340,lineHeight:1.9}}>
        2,300 years of Indian wisdom.<br/>108 squares. Ancient secrets. Animal stories.
      </div>
      <div style={{display:'flex',gap:12,marginTop:28,flexWrap:'wrap',justifyContent:'center'}}>
        {[{id:'en',l:'🇬🇧 English'},{id:'hi',l:'🇮🇳 हिंदी'}].map(x=>(
          <button key={x.id} className="bb" onClick={()=>setLang(x.id)} style={{background:lang===x.id?'linear-gradient(135deg,#43a047,#2e7d32)':'rgba(255,255,255,.12)',border:lang===x.id?'none':'2px solid rgba(255,255,255,.2)',color:lang===x.id?'white':'rgba(255,255,255,.7)',minWidth:130}}>
            {x.l}
          </button>
        ))}
      </div>
      <button className="bb bb-green" style={{marginTop:16,padding:'16px 48px',fontSize:'clamp(16px,3vw,20px)'}} onClick={()=>setScreen('story')}>
        🌿 {isHi?'वन में प्रवेश करो!':'Enter the Forest!'}
      </button>
      <button onClick={onExit} style={{marginTop:12,background:'transparent',border:'none',color:'rgba(255,255,255,.3)',fontSize:13,cursor:'pointer',fontFamily:"'Nunito',sans-serif"}}>← {isHi?'वापस':'Back'}</button>
    </div>
  );

  // ── STORY PAGES (like Moksha) ─────────────────────────────────────────────
  if(screen==='story'){
    const pg = BALA_STORY_PAGES[storyPage];
    const total = BALA_STORY_PAGES.length;
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0d2818,#1b3a28)',display:'flex',flexDirection:'column',padding:'20px 16px 100px',fontFamily:"'Nunito',sans-serif",position:'relative'}}>
        <style>{CSS}</style>
        {/* Progress */}
        <div style={{display:'flex',gap:5,justifyContent:'center',marginBottom:20}}>
          {Array.from({length:total}).map((_,i)=>(
            <div key={i} style={{height:3,flex:1,background:i<=storyPage?'#69f0ae':'rgba(255,255,255,.15)',borderRadius:2,transition:'background .3s'}}/>
          ))}
        </div>
        {/* Icon + Title */}
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:44,animation:'bFloat 2s ease infinite',marginBottom:8}}>{pg.icon}</div>
          <div style={{fontSize:'clamp(18px,4vw,26px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#69f0ae'}}>{pg.title}</div>
        </div>
        {/* Panditji quote */}
        <div style={{background:'rgba(105,240,174,.06)',border:'1px solid rgba(105,240,174,.15)',borderRadius:16,padding:'14px 18px',marginBottom:18,display:'flex',gap:12,alignItems:'flex-start',maxWidth:560,margin:'0 auto 18px'}}>
          <PanditjiSVG size={44}/>
          <div style={{fontSize:'clamp(11px,1.9vw,13px)',color:'rgba(255,255,255,.65)',lineHeight:1.9,fontStyle:'italic',fontFamily:"'Nunito',sans-serif"}}>
            "{isHi?pg.hi:pg.en}"
          </div>
        </div>
        {/* Bullets */}
        <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:560,margin:'0 auto',width:'100%'}}>
          {pg.bullets_en.map((b,i)=>(
            <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',background:'rgba(255,255,255,.04)',border:`1px solid ${b.accent}30`,borderRadius:14,padding:'12px 16px',animation:`bSlide .4s ease ${i*.08}s both`}}>
              <span style={{fontSize:24,flexShrink:0,animation:'bFloat 2.5s ease infinite'}}>{b.icon}</span>
              <div>
                <div style={{fontSize:'clamp(12px,2vw,14px)',fontWeight:900,color:b.accent,marginBottom:3,fontFamily:"'Baloo 2',sans-serif"}}>{b.title}</div>
                <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(255,255,255,.6)',lineHeight:1.8}}>{b.text}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Nav */}
        <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'12px 24px 20px',background:'linear-gradient(0deg,rgba(13,40,24,.98) 50%,transparent)',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:10}}>
          <button className="gb" onClick={()=>storyPage>0?setStoryPage(p=>p-1):setScreen('title')}>← {isHi?'पीछे':'Back'}</button>
          <button className="bb bb-green" onClick={()=>storyPage<total-1?setStoryPage(p=>p+1):setScreen('pickcount')}>
            {storyPage<total-1?(isHi?'आगे →':'Next →'):(isHi?'खेलो! →':'Play! →')}
          </button>
        </div>
      </div>
    );
  }

  // ── PICKCOUNT ─────────────────────────────────────────────────────────────
  if(screen==='pickcount') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0d2818,#1b3a28)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24,padding:24,fontFamily:"'Nunito',sans-serif",textAlign:'center'}}>
      <style>{CSS}</style>
      <PanditjiSVG size={70}/>
      <div style={{fontSize:'clamp(20px,4.5vw,30px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#69f0ae'}}>{isHi?'कितने साधक?':'How many seekers?'}</div>
      <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(255,255,255,.5)',maxWidth:300,lineHeight:1.8}}>
        {isHi?'1 खिलाड़ी = Mayavi से लड़ो!':'1 player = face Mayavi the Jackal!'}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14,maxWidth:400,width:'100%'}}>
        {[1,2,3,4].map(n=>(
          <div key={n} onClick={()=>{setNP(n);if(n===1){setScreen('mayavi');}else{setScreen('setup');}}}
            style={{background:nP===n?'rgba(105,240,174,.15)':'rgba(255,255,255,.04)',border:`2px solid ${nP===n?'#69f0ae':'rgba(255,255,255,.12)'}`,borderRadius:16,padding:'18px 12px',cursor:'pointer',transition:'all .15s',textAlign:'center',transform:nP===n?'scale(1.04)':'scale(1)'}}>
            <div style={{fontSize:36,marginBottom:6}}>{['🌟','🌟🌟','🌟🌟🌟','🌟🌟🌟🌟'][n-1]}</div>
            <div style={{fontSize:'clamp(16px,3vw,20px)',fontWeight:900,color:nP===n?'#69f0ae':'rgba(255,255,255,.6)',fontFamily:"'Baloo 2',sans-serif"}}>{n} {n===1?(isHi?'खिलाड़ी':'Player'):(isHi?'खिलाड़ी':'Players')}</div>
            {n===1&&<div style={{fontSize:11,color:'#ffd700',marginTop:4}}>vs Mayavi! 🦊</div>}
          </div>
        ))}
      </div>
      <button className="gb" onClick={()=>setScreen('story')}>← {isHi?'वापस':'Back'}</button>
    </div>
  );

  // ── MAYAVI INTRO (like Yama Awaits) ───────────────────────────────────────
  if(screen==='mayavi') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0d0d2b,#1a1a4e,#0d0d2b)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Nunito',sans-serif",textAlign:'center',overflow:'hidden',position:'relative'}}>
      <style>{CSS}</style>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 60%,rgba(40,53,147,.3) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{animation:'mayaviIn .8s ease both',marginBottom:16}}>
        <MayaviSVG size={160}/>
      </div>
      <div style={{fontSize:'clamp(22px,5vw,34px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#7986cb',animation:'bGlow 2s ease infinite',marginBottom:8}}>
        {isHi?'Mayavi इंतज़ार कर रहा है!':'Mayavi Awaits!'}
      </div>
      <div style={{fontSize:'clamp(11px,2vw,14px)',color:'rgba(121,134,203,.7)',marginBottom:6,fontFamily:"'Noto Sans Devanagari',sans-serif"}}>मायावी · The Blue Jackal</div>
      <div style={{background:'rgba(40,53,147,.2)',border:'1px solid rgba(121,134,203,.3)',borderRadius:16,padding:'16px 20px',maxWidth:400,width:'100%',marginBottom:20}}>
        <div style={{fontSize:'clamp(13px,2.2vw,16px)',color:'rgba(255,255,255,.7)',lineHeight:1.9,fontStyle:'italic',fontFamily:"'Nunito',sans-serif"}}>
          "Kaw kaw! I am Mayavi the Blue Jackal! I once fooled an ENTIRE FOREST into thinking I was a magical creature! Can a young seeker like you beat me to the Golden Garden? I think NOT!"
        </div>
      </div>
      <div style={{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap',justifyContent:'center'}}>
        {['Clever 🧠','Cunning 🎭','Tricky 🎲','Fast 🏃','But also... very silly 🤡'].map(t=>(
          <span key={t} style={{fontSize:11,background:'rgba(121,134,203,.15)',color:'rgba(121,134,203,.8)',padding:'4px 10px',borderRadius:20,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{t}</span>
        ))}
      </div>
      <button className="bb" style={{background:'linear-gradient(135deg,#3949ab,#283593)',marginBottom:10}} onClick={()=>setScreen('setup')}>
        ⚔️ {isHi?'Mayavi को चुनौती दो!':'Challenge Mayavi!'}
      </button>
      <button className="gb" onClick={()=>setScreen('pickcount')}>← {isHi?'वापस':'Back'}</button>
    </div>
  );

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if(screen==='setup') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0d2818,#1b3a28)',display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 16px 40px',fontFamily:"'Nunito',sans-serif",gap:14}}>
      <style>{CSS}</style>
      <div style={{fontSize:'clamp(16px,3.5vw,22px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#69f0ae',textAlign:'center'}}>
        {isHi?`${pidx+1}वें साधक — साथी चुनो!`:`Seeker ${pidx+1} — Choose your companion!`}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,width:'100%',maxWidth:500}}>
        {CHARS_BALA.map((ch,i)=>(
          <div key={ch.id} onClick={()=>setTempChar(i)} style={{background:tempChar===i?'rgba(105,240,174,.12)':'rgba(255,255,255,.05)',border:`2px solid ${tempChar===i?'#69f0ae':'rgba(255,255,255,.1)'}`,borderRadius:18,padding:12,textAlign:'center',cursor:'pointer',transition:'all .15s',transform:tempChar===i?'scale(1.05)':'scale(1)'}}>
            <AnimalSVG id={ch.id} size={54} animate={tempChar===i}/>
            <div style={{fontSize:12,fontWeight:900,color:tempChar===i?'#69f0ae':'rgba(255,255,255,.6)',marginTop:5}}>{ch.name}</div>
            <div style={{fontSize:'clamp(8px,1.4vw,10px)',color:'rgba(255,255,255,.35)',fontFamily:"'Noto Sans Devanagari',sans-serif"}}>{ch.skt}</div>
            <div style={{fontSize:10,color:'#69f0ae',marginTop:2,opacity:.7}}>{ch.gift}</div>
          </div>
        ))}
      </div>
      {tempChar>=0&&<div style={{background:'rgba(105,240,174,.08)',border:'1px solid rgba(105,240,174,.15)',borderRadius:14,padding:'10px 16px',maxWidth:380,width:'100%',fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(255,255,255,.55)',lineHeight:1.8,textAlign:'center',fontStyle:'italic',fontFamily:"'Nunito',sans-serif"}}>
        {CHARS_BALA[tempChar].story}
      </div>}
      <input value={tempName} onChange={e=>setTempName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPlayer()}
        placeholder={isHi?'अपना नाम लिखो...':'Your name...'} style={{width:'100%',maxWidth:300,padding:'12px 18px',fontSize:16,borderRadius:50,border:'2px solid #69f0ae',outline:'none',fontFamily:"'Nunito',sans-serif",fontWeight:700,textAlign:'center',background:'rgba(255,255,255,.08)',color:'white'}}/>
      <button className="bb bb-green" onClick={addPlayer} style={{opacity:(!tempName.trim()||tempChar<0)?.4:1}}>
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
      <div style={{minHeight:'100vh',background:mayaviWon?'linear-gradient(135deg,#0d0d2b,#1a1a4e)':'linear-gradient(135deg,#0d2818,#1b4a2a)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Nunito',sans-serif",textAlign:'center'}}>
        <style>{CSS}</style>
        {mayaviWon
          ? <><MayaviSVG size={120}/><div style={{fontSize:'clamp(20px,5vw,32px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#7986cb',margin:'12px 0',animation:'bGlow 2s ease infinite'}}>Kaw! Mayavi Wins!</div><div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(121,134,203,.65)',maxWidth:380,lineHeight:1.9,marginBottom:20}}>{pm('lose')}</div></>
          : <><div style={{fontSize:72,animation:'bFloat 1.5s ease infinite',marginBottom:8}}>🌟</div><div style={{fontSize:'clamp(22px,5vw,36px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#69f0ae',marginBottom:4,animation:'bRainbow 3s ease infinite'}}>{winner?.name} {isHi?'जीत गया!':'Wins!'}</div>
            {/* Karma title */}
            <div style={{fontSize:'clamp(16px,3vw,22px)',fontWeight:900,color:karmaTitle.c,marginBottom:4,fontFamily:"'Baloo 2',sans-serif"}}>{karmaTitle.t}</div>
            <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(255,255,255,.5)',marginBottom:4,maxWidth:360,fontStyle:'italic'}}>{karmaTitle.d}</div>
            {/* Gyan/Agyan summary */}
            <div style={{display:'flex',gap:16,justifyContent:'center',marginBottom:16,fontSize:'clamp(12px,2vw,14px)'}}>
              <span style={{color:'#ffd700',fontWeight:800}}>✨ {wg} Gyan</span>
              <span style={{color:'rgba(255,255,255,.3)'}}>·</span>
              <span style={{color:'#90a4ae',fontWeight:800}}>{wa} Agyan 🌑</span>
            </div>
            <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(105,240,174,.55)',marginBottom:16,maxWidth:380,lineHeight:1.9,fontStyle:'italic'}}>{pm('win')}</div></>
        }
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:24}}>
          {players.map((p,i)=>(
            <div key={i} style={{background:i===win?'rgba(105,240,174,.12)':'rgba(255,255,255,.05)',border:`2px solid ${i===win?'#69f0ae':'rgba(255,255,255,.12)'}`,borderRadius:16,padding:'12px 18px',minWidth:90}}>
              {p.isCPU?<MayaviSVG size={46}/>:<AnimalSVG id={p.char.id} size={46} animate={i===win}/>}
              <div style={{fontSize:12,color:i===win?'#69f0ae':'rgba(255,255,255,.45)',fontWeight:800,marginTop:4}}>{p.name}</div>
              <div style={{fontSize:11,color:'#ffd700'}}>{'⭐'.repeat(Math.min(stars[i],8))}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
          <button className="bb bb-green" onClick={restart}>🎲 {isHi?'फिर खेलो':'Play Again'}</button>
          <button className="bb bb-dark" onClick={()=>{ambient.stop();onExit();}}>🏠 {isHi?'घर जाओ':'Home'}</button>
        </div>
      </div>
    );
  }

  // ── GAME ────────────────────────────────────────────────────────────────────
  const cp=players[cur], realm=getBalaRealm(pos[cur]||1);
  const isCpuTurn = hasCPU && cur===players.length-1;
  return (
    <div style={{minHeight:'100vh',background:'#040d06',fontFamily:"'Nunito',sans-serif",
      backgroundImage:'radial-gradient(ellipse at 50% 100%,rgba(10,40,15,.8) 0%,transparent 70%)',
      position:'relative'}}>
      <style>{CSS}</style>

      {/* Fixed top bar — like Moksha */}
      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:50,
        background:'rgba(4,13,6,.92)',borderBottom:'1px solid rgba(105,240,174,.1)',
        backdropFilter:'blur(12px)',padding:'6px 12px',
        display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
        <button onClick={()=>{ambient.stop();onExit();}} className="gb" style={{padding:'4px 12px',fontSize:11}}>
          ← {isHi?'घर':'Home'}
        </button>
        {/* Player chips */}
        <div style={{display:'flex',gap:6,flexWrap:'wrap',flex:1,justifyContent:'center'}}>
          {players.map((p,i)=>{
            const g=gyan[i]||0,a=agyan[i]||0,total=g+a;
            const gPct=total>0?Math.round(g/total*100):50;
            return (
              <div key={i} style={{display:'flex',alignItems:'center',gap:5,padding:'3px 10px',
                borderRadius:16,
                background:i===cur?'rgba(105,240,174,.12)':'rgba(255,255,255,.04)',
                border:`1px solid ${i===cur?'rgba(105,240,174,.35)':'rgba(255,255,255,.08)'}`,
                boxShadow:i===cur?'0 0 12px rgba(105,240,174,.1)':'none',
                transition:'all .3s'}}>
                {p.isCPU?<span style={{fontSize:14}}>🦊</span>:<span style={{fontSize:13}}>{p.char?.icon}</span>}
                <div>
                  <div style={{fontSize:10,fontWeight:800,color:i===cur?'#69f0ae':'rgba(255,255,255,.5)',lineHeight:1}}>{p.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:3,marginTop:1}}>
                    <span style={{fontSize:8,color:'#ffd700',fontWeight:700}}>✨{g}</span>
                    <div style={{width:30,height:3,background:'rgba(255,255,255,.1)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{width:`${gPct}%`,height:'100%',background:'linear-gradient(90deg,#ffd700,#69f0ae)',borderRadius:2,transition:'width .5s'}}/>
                    </div>
                    <span style={{fontSize:8,color:'#78909c',fontWeight:700}}>{a}🌑</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:10,color:'rgba(105,240,174,.35)',textAlign:'right'}}>
          {realm.icon} Sq {pos[cur]||1}/108
        </div>
      </div>

      {/* Main content — board + panel side by side (like Moksha) */}
      <div style={{display:'flex',gap:10,padding:'62px 10px 20px',
        minHeight:'100vh',alignItems:'flex-start'}}>

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
            {[['🐍 Snake — क्रोध','rgba(200,50,50,.15)'],['🌈 Ladder — मैत्री','rgba(50,200,100,.15)'],
              ['🔭 Discovery','rgba(120,80,220,.15)'],['⚖ Choice','rgba(200,150,0,.15)']].map(([l,bg])=>(
              <div key={l} style={{fontSize:'clamp(8px,1.3vw,10px)',background:bg,
                padding:'2px 8px',borderRadius:10,color:'rgba(255,255,255,.45)',
                fontFamily:"'Nunito',sans-serif",fontWeight:600,
                border:'1px solid rgba(255,255,255,.06)'}}>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Panel (like Moksha sidebar) */}
        <div style={{flex:'0 0 clamp(220px,28vw,290px)',display:'flex',flexDirection:'column',gap:8}}>

          {/* Current player card */}
          <div style={{background:'#0a1a0d',border:`1px solid ${cp.char?.color||'#69f0ae'}30`,
            borderTop:`3px solid ${cp.char?.color||'#69f0ae'}`,
            padding:'clamp(10px,1.8vw,14px)',borderRadius:6}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,
              padding:'6px 10px',background:`${cp.char?.color||'#69f0ae'}10`,borderRadius:4}}>
              {cp.isCPU?<MayaviSVG size={24}/>:<AnimalSVG id={cp.char?.id} size={24} animate={true}/>}
              <span style={{fontSize:13,color:cp.char?.color||'#69f0ae',fontWeight:700,letterSpacing:1}}>{cp.name}</span>
              {isCpuTurn&&<span style={{fontSize:9,color:'#7986cb',marginLeft:'auto',animation:'bFloat 1s ease infinite'}}>thinking...</span>}
            </div>

            {/* Gyan / Agyan balance — like Punya/Papa in Moksha */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:8,letterSpacing:2,color:'rgba(255,255,255,.3)',fontWeight:700,marginBottom:6,textAlign:'center'}}>WISDOM BALANCE</div>
              <div style={{display:'flex',justifyContent:'space-around',marginBottom:6}}>
                {/* Gyan */}
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:22,marginBottom:2,filter:'drop-shadow(0 0 6px rgba(255,215,0,.6))',animation:(gyan[cur]||0)>0?'gyaanPulse 1.5s ease':'none'}}>✨</div>
                  <div style={{fontSize:20,fontWeight:900,color:'#ffd700',lineHeight:1,textShadow:'0 0 10px rgba(255,215,0,.5)'}}>{gyan[cur]||0}</div>
                  <div style={{fontSize:7,color:'rgba(255,215,0,.5)',letterSpacing:1,marginTop:2}}>GYAN</div>
                  <div style={{fontSize:6,color:'rgba(255,215,0,.35)',fontFamily:"'Noto Sans Devanagari',sans-serif"}}>ज्ञान</div>
                </div>
                {/* Balance bar */}
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,margin:'0 10px'}}>
                  <div style={{width:'100%',height:6,background:'rgba(255,255,255,.08)',borderRadius:3,overflow:'hidden',position:'relative'}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,
                      width:`${(gyan[cur]||0)/Math.max(1,(gyan[cur]||0)+(agyan[cur]||0))*100}%`,
                      background:'linear-gradient(90deg,#ffd700,#69f0ae)',
                      borderRadius:3,transition:'width .6s ease'}}/>
                  </div>
                  <div style={{fontSize:7,color:'rgba(255,255,255,.2)',marginTop:3,letterSpacing:1}}>
                    {(gyan[cur]||0)>(agyan[cur]||0)?'✨ Wisdom leads':'🌑 Learn more'}
                  </div>
                </div>
                {/* Agyan */}
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:22,marginBottom:2,filter:'drop-shadow(0 0 4px rgba(120,150,180,.4))',animation:(agyan[cur]||0)>0?'agyanPulse 2s ease':'none'}}>🌑</div>
                  <div style={{fontSize:20,fontWeight:900,color:'#78909c',lineHeight:1}}>{agyan[cur]||0}</div>
                  <div style={{fontSize:7,color:'rgba(120,150,180,.5)',letterSpacing:1,marginTop:2}}>AGYAN</div>
                  <div style={{fontSize:6,color:'rgba(120,150,180,.35)',fontFamily:"'Noto Sans Devanagari',sans-serif"}}>अज्ञान</div>
                </div>
              </div>
            </div>

            {/* Dice display */}
            <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
              <div style={{width:58,height:58,background:'linear-gradient(135deg,#0d1f0f,#0a1a0d)',
                border:'2px solid rgba(105,240,174,.25)',borderRadius:8,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:diceVal?36:28,
                animation:diceAnim?'bSpin .5s ease':'none',
                boxShadow:'inset 0 0 15px rgba(0,0,0,.4)',
                filter:'drop-shadow(0 0 8px rgba(105,240,174,.2))'}}>
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
          <div style={{background:'#0a1a0d',border:'1px solid rgba(105,240,174,.12)',
            padding:'10px 12px',borderRadius:6,display:'flex',gap:8,alignItems:'flex-start'}}>
            <PanditjiSVG size={38}/>
            <div>
              <div style={{fontSize:8,color:'rgba(105,240,174,.4)',fontWeight:900,
                letterSpacing:1,marginBottom:3,fontFamily:"'Noto Sans Devanagari',sans-serif"}}>
                PANDITJI
              </div>
              <div style={{fontSize:'clamp(10px,1.5vw,12px)',color:'rgba(255,255,255,.6)',
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