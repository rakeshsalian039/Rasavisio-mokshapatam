// ─────────────────────────────────────────────────────────────────────────────
// tiers/bala/BalaGame.jsx — Bala Marg: The Panchatantra Forest
// Same flow as Moksha: title → story → pickcount → mayavi → setup → game
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  CHARS_BALA, SNAKES_BALA, LADDERS_BALA, DLM_SQ_BALA, DILEMMAS_BALA,
  DISCOVERY_SQUARES, STAR_MESSAGES, PANDITJI, BALA_STORY_PAGES,
  MAYAVI_TAUNTS_SNAKE, MAYAVI_TAUNTS_WRONG, MAYAVI_TAUNTS_LADDER,
  BALA_WIN_STARS, getBalaRealm,
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
body{margin:0;background:#0d2818}
@keyframes snakePulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.15)}}
@keyframes ladderShine{0%,100%{opacity:.88}50%{opacity:1}}
@keyframes bFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes bPop{0%{transform:scale(.15);opacity:0}65%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes bBounce{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-7px) scale(1.12)}100%{transform:translateY(0) scale(1)}}
@keyframes bPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,193,7,.6)}70%{box-shadow:0 0 0 10px rgba(255,193,7,0)}}
@keyframes bSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes bWiggle{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes bSlide{0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:translateY(0)}}
@keyframes bGlow{0%,100%{text-shadow:0 0 10px rgba(255,215,0,.3)}50%{text-shadow:0 0 30px rgba(255,215,0,.8)}}
@keyframes bRainbow{0%{color:#ff6b6b}17%{color:#ffa500}34%{color:#ffd700}51%{color:#51cf66}68%{color:#339af0}85%{color:#845ef7}100%{color:#ff6b6b}}
@keyframes mayaviIn{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.1) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes snakePulse{0%,100%{stroke-opacity:.55;stroke-width:3}50%{stroke-opacity:1;stroke-width:4.5}}
@keyframes ladderShine{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes breathe{0%,100%{opacity:.4;transform:scale(.97)}50%{opacity:.8;transform:scale(1.03)}}
.bb{background:linear-gradient(135deg,#ff8c00,#ff6b00);border:none;color:#fff;padding:14px 32px;font-size:clamp(15px,2.5vw,19px);font-family:'Baloo 2',sans-serif;font-weight:800;cursor:pointer;border-radius:50px;box-shadow:0 6px 20px rgba(255,100,0,.4);transition:all .2s;letter-spacing:.5px}
.bb:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 8px 24px rgba(255,100,0,.5)}
.bb:active{transform:scale(.97)}
.bb:disabled{background:linear-gradient(135deg,#bbb,#999);box-shadow:none;cursor:default;transform:none}
.bb-green{background:linear-gradient(135deg,#43a047,#2e7d32);box-shadow:0 6px 20px rgba(46,125,50,.4)}
.bb-dark{background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);color:white;box-shadow:none}
.bc{width:100%;background:#fff;border:3px solid transparent;border-radius:14px;padding:14px 16px;font-size:clamp(12px,2vw,14px);font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;text-align:left;transition:all .18s;box-shadow:0 3px 10px rgba(0,0,0,.07);display:flex;align-items:flex-start;gap:10px;line-height:1.6}
.bc:hover{transform:translateX(5px) scale(1.01)}
.bc-wise{border-color:#43a047;background:#f8fff8}.bc-wise:hover{background:#e8f5e9}
.bc-oops{border-color:#ff9800;background:#fffaf5}.bc-oops:hover{background:#fff3e0}
.gb{background:transparent;border:1px solid rgba(255,180,50,.3);color:#f0d050;padding:10px 28px;font-size:13px;font-family:'Baloo 2',sans-serif;cursor:pointer;transition:all .3s;letter-spacing:2px;border-radius:2px}
.gb:hover{background:rgba(255,180,50,.08);border-color:rgba(255,180,50,.6)}
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
function BalaBoard({ players, pos, cur }) {
  const playersSq = players.map((_,pi)=>pos[pi]||1);
  const gridRow = (r) => r === -1 ? 1 : r + 2;
  const squares = Array.from({length:108},(_,i)=>i+1).map(n=>({n,...sqP(n)}));

  // ── Square background: realm gradient + type highlight ───────────────────
  const sqStyle = (n) => {
    const sn = SNAKES_BALA[n], ld = LADDERS_BALA[n];
    const disc = DISCOVERY_SQUARES[n], dlm = DLM_SQ_BALA.includes(n);
    const isWin = n===108, isCrown = n>100;
    if (isWin) return {
      bg:'linear-gradient(135deg,#ffd700 0%,#ffab00 50%,#ff8c00 100%)',
      border:'#ff8c00', shadow:'0 0 12px rgba(255,200,0,.7),inset 0 2px 0 rgba(255,255,255,.6)',
    };
    if (sn) return {
      bg:`linear-gradient(160deg,${sn.color}35 0%,${sn.color}18 100%)`,
      border:sn.color+'cc',
      shadow:`0 0 6px ${sn.color}40,inset 0 2px 0 rgba(255,255,255,.5),inset 0 -1px 0 rgba(0,0,0,.15)`,
    };
    if (ld) return {
      bg:'linear-gradient(160deg,rgba(100,220,100,.35) 0%,rgba(67,160,71,.18) 100%)',
      border:'#43a047cc',
      shadow:'0 0 6px rgba(67,160,71,.35),inset 0 2px 0 rgba(255,255,255,.5),inset 0 -1px 0 rgba(0,0,0,.12)',
    };
    if (disc) return {
      bg:'linear-gradient(160deg,rgba(150,100,255,.3) 0%,rgba(103,58,183,.15) 100%)',
      border:'#7c4dffcc',
      shadow:'0 0 8px rgba(124,77,255,.4),inset 0 2px 0 rgba(255,255,255,.5)',
    };
    if (dlm) return {
      bg:'linear-gradient(160deg,rgba(255,200,50,.3) 0%,rgba(255,152,0,.15) 100%)',
      border:'#ff8f00cc',
      shadow:'inset 0 2px 0 rgba(255,255,255,.5)',
    };
    if (isCrown) return {
      bg:'linear-gradient(160deg,rgba(255,240,100,.6),rgba(255,215,0,.3))',
      border:'#ffd600cc',
      shadow:'inset 0 2px 0 rgba(255,255,255,.6)',
    };
    const r=getBalaRealm(n);
    return { bg:'rgba(255,255,255,.28)', border:r.border+'88',
      shadow:'inset 0 2px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.1)' };
  };

  // ── Curved S-body snake path ─────────────────────────────────────────────
  const snakePath = (f,t) => {
    const fc=sqCenter(f), tc=sqCenter(t);
    const dx=tc.x-fc.x, dy=tc.y-fc.y;
    const len=Math.sqrt(dx*dx+dy*dy);
    const px=-dy/len, py=dx/len;
    const wave=Math.min(len*0.38,14);
    const cp1x=fc.x+dx*.28+px*wave, cp1y=fc.y+dy*.28+py*wave;
    const cp2x=fc.x+dx*.72-px*wave, cp2y=fc.y+dy*.72-py*wave;
    return { fc, tc, d:`M${fc.x.toFixed(1)},${fc.y.toFixed(1)} C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${tc.x.toFixed(1)},${tc.y.toFixed(1)}` };
  };

  // ── Ladder with perspective-angled rungs ─────────────────────────────────
  const ladderParts = (f,t) => {
    const fc=sqCenter(f), tc=sqCenter(t);
    const dx=tc.x-fc.x, dy=tc.y-fc.y;
    const len=Math.sqrt(dx*dx+dy*dy);
    const ux=dx/len,uy=dy/len, px=-uy*1.6,py=ux*1.6;
    const n=Math.max(3,Math.floor(len/6.5));
    const rungs=[];
    for(let i=0;i<=n;i++){
      const t2=i/n;
      rungs.push({x1:fc.x+t2*dx+px,y1:fc.y+t2*dy+py,x2:fc.x+t2*dx-px,y2:fc.y+t2*dy-py,t:t2});
    }
    return {fc,tc,rungs,
      r1:{x1:fc.x+px,y1:fc.y+py,x2:tc.x+px,y2:tc.y+py},
      r2:{x1:fc.x-px,y1:fc.y-py,x2:tc.x-px,y2:tc.y-py}};
  };

  return (
    <div style={{position:'relative',width:'100%',maxWidth:580,margin:'0 auto',
      // Floating board effect
      filter:'drop-shadow(0 18px 40px rgba(0,0,0,.35)) drop-shadow(0 4px 8px rgba(0,0,0,.2))',
    }}>
      {/* Board outer glow ring */}
      <div style={{position:'absolute',inset:-3,borderRadius:20,
        background:'linear-gradient(135deg,rgba(255,220,80,.6),rgba(105,240,174,.4),rgba(255,220,80,.6))',
        animation:'bGlow 3s ease infinite',filter:'blur(4px)',zIndex:0}}/>

      {/* Board with realm-gradient background */}
      <div style={{position:'relative',zIndex:1,borderRadius:18,overflow:'hidden',
        // Thick board base (3D thickness illusion)
        boxShadow:'0 2px 0 rgba(200,160,40,.8),0 4px 0 rgba(160,120,30,.6),0 6px 0 rgba(120,90,20,.4)',
      }}>
        {/* Realm background painted as gradient behind the grid */}
        <div style={{position:'absolute',inset:0,
          background:`linear-gradient(to bottom,
            #fff9c4 0%,#fffde7 8%,
            #fff9c4 9%,#fffde7 10%,
            #fffde7 11%,#fce4ec 30%,
            #e8d5f5 45%,#e1f5fe 65%,
            #e8f5e9 82%,#c8e6c9 100%)`,
          zIndex:0}}/>
        {/* Subtle grid lines */}
        <div style={{position:'absolute',inset:0,
          backgroundImage:'linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px)',
          backgroundSize:'10% 9.09%',zIndex:1,pointerEvents:'none'}}/>

        {/* CSS Grid for squares */}
        <div style={{
          position:'relative',zIndex:2,
          display:'grid',gridTemplateColumns:'repeat(10,1fr)',gridTemplateRows:'repeat(11,1fr)',
          gap:1.5,padding:5,
          background:'transparent',
          borderRadius:17,border:'3px solid rgba(255,213,79,.9)',
          aspectRatio:'10/11',
        }}>
          {squares.map(({n,r,c})=>{
            const gr=gridRow(r);
            const {bg,border,shadow}=sqStyle(n);
            const here=players.map((_,pi)=>playersSq[pi]===n?pi:-1).filter(x=>x>=0);
            const realm=getBalaRealm(n);
            const isWin=n===108, isSn=!!SNAKES_BALA[n], isLd=!!LADDERS_BALA[n];
            const isDisc=!!DISCOVERY_SQUARES[n], isDlm=DLM_SQ_BALA.includes(n);
            return (
              <div key={n} style={{
                gridColumn:c+1,gridRow:gr,
                background:bg,border:`1.5px solid ${border}`,
                borderRadius:4,position:'relative',
                display:'flex',alignItems:'center',justifyContent:'center',
                overflow:'visible',minHeight:0,
                boxShadow:shadow,
              }}>
                {/* Square number */}
                <span style={{position:'absolute',top:1,left:2,
                  fontSize:'clamp(3.5px,.65vw,6px)',color:realm.text,opacity:.7,
                  fontWeight:900,fontFamily:"'Nunito',sans-serif",lineHeight:1,
                  textShadow:'0 1px 0 rgba(255,255,255,.6)'}}>{n}</span>

                {/* Icons */}
                {isWin&&<span style={{fontSize:'clamp(9px,1.7vw,15px)',
                  filter:'drop-shadow(0 2px 4px rgba(255,150,0,.8))',
                  animation:'bFloat 1.5s ease infinite'}}>⭐</span>}
                {isSn&&!here.length&&<span style={{fontSize:'clamp(8px,1.4vw,12px)',
                  filter:`drop-shadow(0 1px 3px ${SNAKES_BALA[n].color})`}}>{SNAKES_BALA[n].emoji}</span>}
                {isLd&&!here.length&&<span style={{fontSize:'clamp(8px,1.4vw,12px)',
                  filter:'drop-shadow(0 1px 3px rgba(67,160,71,.7))'}}>{LADDERS_BALA[n].emoji}</span>}
                {isDisc&&!isSn&&!isLd&&!here.length&&(
                  <span style={{fontSize:'clamp(7px,1.2vw,11px)',opacity:.9,
                    animation:'bFloat 2s ease infinite',animationDelay:`${(n%5)*.2}s`}}>
                    {DISCOVERY_SQUARES[n].icon}</span>
                )}
                {isDlm&&!isSn&&!isLd&&!isDisc&&!here.length&&<span style={{fontSize:'clamp(6px,1vw,10px)',opacity:.55}}>🤔</span>}

                {/* Player tokens — 3D spheres */}
                {here.length>0&&(
                  <div style={{display:'flex',flexWrap:'wrap',gap:1,position:'absolute',
                    inset:0,alignItems:'center',justifyContent:'center',zIndex:8}}>
                    {here.map(pi=>(
                      <div key={pi} style={{
                        width:'clamp(11px,2vw,21px)',height:'clamp(11px,2vw,21px)',
                        borderRadius:'50%',
                        background:`radial-gradient(circle at 35% 30%,${lighten(players[pi].char?.color||'#ff8c00')},${players[pi].char?.color||'#ff8c00'} 60%,${darken(players[pi].char?.color||'#ff8c00')} 100%)`,
                        border:'2px solid rgba(255,255,255,.9)',
                        boxShadow:`0 3px 8px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.4) inset,0 0 0 1px ${players[pi].char?.color||'#ff8c00'}`,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:'clamp(5px,.95vw,9px)',fontWeight:900,
                        animation:pi===cur?'bPulse .9s ease infinite':'none',
                      }}>{players[pi].char?.icon||'●'}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Snakes + Ladders overlay */}
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',
        pointerEvents:'none',overflow:'visible',zIndex:10}}
        viewBox="0 0 100 110" preserveAspectRatio="none">
        <defs>
          {/* Neon glow filter for snakes */}
          <filter id="snakeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Soft glow for ladders */}
          <filter id="ladderGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation=".8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Ladder gradient defs */}
          {Object.entries(LADDERS_BALA).map(([f,ld])=>{
            const fc=sqCenter(Number(f)), tc=sqCenter(ld.to);
            return (<linearGradient key={`lg${f}`} id={`lg${f}`}
              x1={fc.x} y1={fc.y} x2={tc.x} y2={tc.y} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={ld.color1}/>
              <stop offset="40%" stopColor="white" stopOpacity="0.5"/>
              <stop offset="100%" stopColor={ld.color2}/>
            </linearGradient>);
          })}
        </defs>

        {/* ── LADDERS — golden rope-light structures ── */}
        {Object.entries(LADDERS_BALA).map(([f,ld])=>{
          const from=Number(f);
          const {fc,tc,r1,r2,rungs}=ladderParts(from,ld.to);
          return (
            <g key={f} filter="url(#ladderGlow)" style={{animation:'ladderShine 3s ease infinite'}}>
              {/* Rail shadows */}
              <line {...r1} stroke="rgba(0,0,0,.25)" strokeWidth="3.2" strokeLinecap="round"/>
              <line {...r2} stroke="rgba(0,0,0,.25)" strokeWidth="3.2" strokeLinecap="round"/>
              {/* Rails — gradient */}
              <line {...r1} stroke={`url(#lg${f})`} strokeWidth="2.2" strokeLinecap="round"/>
              <line {...r2} stroke={`url(#lg${f})`} strokeWidth="2.2" strokeLinecap="round"/>
              {/* Rail highlight */}
              <line {...r1} stroke="rgba(255,255,255,.45)" strokeWidth=".7" strokeLinecap="round"/>
              <line {...r2} stroke="rgba(255,255,255,.45)" strokeWidth=".7" strokeLinecap="round"/>
              {/* Rungs */}
              {rungs.map((rg,i)=>(
                <g key={i}>
                  <line {...rg} stroke="rgba(0,0,0,.2)" strokeWidth="2.2" strokeLinecap="round"/>
                  <line {...rg} stroke={i%2===0?ld.color1:ld.color2} strokeWidth="1.8" strokeLinecap="round"/>
                  <line {...rg} stroke="rgba(255,255,255,.5)" strokeWidth=".5" strokeLinecap="round"/>
                </g>
              ))}
              {/* Glow circles at ends */}
              <circle cx={fc.x} cy={fc.y} r="2.5" fill={ld.color1} opacity=".9"/>
              <circle cx={fc.x} cy={fc.y} r="1.2" fill="white" opacity=".8"/>
              <circle cx={tc.x} cy={tc.y} r="3" fill={ld.color2} opacity=".9"/>
              <circle cx={tc.x} cy={tc.y} r="1.4" fill="white" opacity=".7"/>
            </g>
          );
        })}

        {/* ── SNAKES — neon 3D tubes ── */}
        {Object.entries(SNAKES_BALA).map(([f,sn])=>{
          const from=Number(f);
          const {fc,tc,d}=snakePath(from,sn.to);
          return (
            <g key={f} filter="url(#snakeGlow)" style={{animation:'snakePulse 2.5s ease infinite'}}>
              {/* Outer glow */}
              <path d={d} stroke={sn.color} strokeWidth="8" fill="none" strokeLinecap="round" opacity=".15"/>
              {/* Deep shadow tube */}
              <path d={d} stroke="rgba(0,0,0,.3)" strokeWidth="6.5" fill="none" strokeLinecap="round"/>
              {/* Mid shadow */}
              <path d={d} stroke={sn.headColor} strokeWidth="5.5" fill="none" strokeLinecap="round" opacity=".5"/>
              {/* Main body */}
              <path d={d} stroke={sn.color} strokeWidth="4.5" fill="none" strokeLinecap="round"/>
              {/* Scale pattern */}
              <path d={d} stroke="rgba(255,255,255,.2)" strokeWidth="1.5" fill="none"
                strokeDasharray="3,4" strokeLinecap="round"/>
              {/* Top highlight — gives 3D cylinder look */}
              <path d={d} stroke="rgba(255,255,255,.5)" strokeWidth=".8" fill="none" strokeLinecap="round"
                strokeDasharray="none"/>

              {/* ── Snake HEAD at "from" square ── */}
              {/* Head shadow */}
              <circle cx={fc.x} cy={fc.y+.4} r="4.5" fill="rgba(0,0,0,.3)"/>
              {/* Head body */}
              <ellipse cx={fc.x} cy={fc.y} rx="4.2" ry="3.8" fill={sn.headColor}/>
              {/* Head highlight */}
              <ellipse cx={fc.x-.8} cy={fc.y-.8} rx="1.5" ry="1" fill="rgba(255,255,255,.4)" transform={`rotate(-30,${fc.x-.8},${fc.y-.8})`}/>
              {/* Eyes */}
              <circle cx={fc.x-1.5} cy={fc.y-.6} r="1.1" fill="white"/>
              <circle cx={fc.x+1.5} cy={fc.y-.6} r="1.1" fill="white"/>
              <circle cx={fc.x-1.5} cy={fc.y-.5} r=".65" fill="#111"/>
              <circle cx={fc.x+1.5} cy={fc.y-.5} r=".65" fill="#111"/>
              <circle cx={fc.x-1.2} cy={fc.y-.7} r=".28" fill="white"/>
              <circle cx={fc.x+1.8} cy={fc.y-.7} r=".28" fill="white"/>
              {/* Forked tongue */}
              <path d={`M${fc.x},${fc.y+2.8} L${fc.x-.9},${fc.y+4.5} M${fc.x},${fc.y+2.8} L${fc.x+.9},${fc.y+4.5}`}
                stroke="#ff1744" strokeWidth=".8" strokeLinecap="round"/>

              {/* Tail marker */}
              <circle cx={tc.x} cy={tc.y} r="2.2" fill={sn.color} opacity=".7"/>
              <circle cx={tc.x} cy={tc.y} r="1" fill={sn.headColor} opacity=".9"/>
            </g>
          );
        })}

        {/* Win square sparkles */}
        {[0,60,120,180,240,300].map((deg,i)=>(
          <text key={i} x={sqCenter(108).x} y={sqCenter(108).y}
            textAnchor="middle" fontSize="3.5" fill="#ffd700"
            transform={`rotate(${deg+Date.now()*.01},${sqCenter(108).x},${sqCenter(108).y}) translate(0,-5)`}
            style={{animation:`bSpin ${4+i*.3}s linear infinite`}}
            opacity=".8">✦</text>
        ))}
      </svg>

      {/* Legend */}
      <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:10,flexWrap:'wrap'}}>
        {[['🐍 Snake','rgba(255,100,100,.15)'],['🌈 Ladder','rgba(100,200,100,.15)'],
          ['🔭 Discovery','rgba(124,77,255,.15)'],['🤔 Choice','rgba(255,152,0,.15)']].map(([l,bg])=>(
          <div key={l} style={{fontSize:'clamp(9px,1.5vw,11px)',background:bg,
            padding:'3px 10px',borderRadius:12,color:'#555',
            fontFamily:"'Nunito',sans-serif",fontWeight:700,
            border:'1px solid rgba(0,0,0,.08)',backdropFilter:'blur(4px)'}}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

// Colour helpers for 3D token look
function lighten(hex){
  try{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgb(${Math.min(255,r+60)},${Math.min(255,g+60)},${Math.min(255,b+60)})`}catch{return '#fff'}
}
function darken(hex){
  try{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgb(${Math.max(0,r-60)},${Math.max(0,g-60)},${Math.max(0,b-60)})`}catch{return '#000'}
}
// ── Popup components ──────────────────────────────────────────────────────────
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
  const [storyPop,  setStoryPop]  = useState(null);
  const [discPop,   setDiscPop]   = useState(null);
  const [dilemma,   setDilemma]   = useState(null);
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
    if(!hasCPU||!players.length||win!==null||busy||dilemma||storyPop||discPop) return;
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
      // Wise choice = +2 Gyan
      setGyan(g=>{ const ng=[...g]; ng[pi]=Math.min(ng[pi]+2,12); return ng; });
    } else {
      // Unwise choice = +1 Agyan
      setAgyan(a=>{ const na=[...a]; na[pi]=Math.min(na[pi]+1,12); return na; });
    }
    if(ch.fx.move){ np[pi]=Math.max(1,Math.min((np[pi]||1)+ch.fx.move,108)); setPos([...np]); }
    setDilemma(null);
    if(!checkWin(pi,np,ns,totalP)) nextTurn(np,ns,totalP);
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

  // ── GAME ──────────────────────────────────────────────────────────────────
  const cp=players[cur], realm=getBalaRealm(pos[cur]||1);
  const isCpuTurn = hasCPU && cur===players.length-1;
  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(160deg,${realm.bg},${realm.bg}dd,#fff9f0)`,padding:'8px 8px 100px',fontFamily:"'Nunito',sans-serif",transition:'background .8s ease',position:'relative',overflow:'hidden'}}>
      {/* Forest atmosphere particles */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        {['🌿','🍃','🌸','⭐','🌺','🦋'].map((em,i)=>(
          <div key={i} style={{position:'absolute',fontSize:14,opacity:.12,
            left:`${15+i*14}%`,top:`${10+i*12}%`,
            animation:`bFloat ${2.5+i*.4}s ease infinite`,animationDelay:`${i*.35}s`}}>
            {em}
          </div>
        ))}
      </div>
      <style>{CSS}</style>
      {/* Top bar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:6}}>
        <button onClick={()=>{ambient.stop();onExit();}} style={{background:'transparent',border:`2px solid ${realm.border}`,color:realm.text,padding:'4px 12px',borderRadius:20,fontSize:12,cursor:'pointer',fontWeight:700}}>← {isHi?'घर':'Home'}</button>
        <div style={{fontSize:12,color:realm.text,fontWeight:700,opacity:.7,textAlign:'center'}}>
          {realm.icon} {realm.name}
        </div>
        <div style={{fontSize:11,color:realm.text,opacity:.4}}>{isHi?`वर्ग ${pos[cur]||1}/108`:`Sq ${pos[cur]||1}/108`}</div>
      </div>

      {/* Player bar with Gyan/Agyan balance */}
      <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap',overflowX:'auto',paddingBottom:2}}>
        {players.map((p,i)=>{
          const g=gyan[i]||0, a=agyan[i]||0, total=g+a;
          const gPct=total>0?Math.round(g/total*100):50;
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',
              borderRadius:20,
              background:i===cur?realm.bg:'rgba(255,255,255,.75)',
              border:`2px solid ${i===cur?realm.border:'rgba(0,0,0,.07)'}`,
              boxShadow:i===cur?'0 4px 16px rgba(0,0,0,.12)':'none',
              transition:'all .3s',flexShrink:0}}>
              {p.isCPU?<MayaviSVG size={26}/>:<AnimalSVG id={p.char.id} size={26} animate={i===cur}/>}
              <div>
                <div style={{fontSize:12,fontWeight:800,color:i===cur?realm.text:'#666',marginBottom:2}}>{p.name}</div>
                {/* Gyan/Agyan balance bar */}
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{fontSize:9,color:'#ffd700',fontWeight:700}}>✨{g}</span>
                  <div style={{width:48,height:5,background:'rgba(0,0,0,.12)',borderRadius:3,overflow:'hidden'}}>
                    <div style={{width:`${gPct}%`,height:'100%',
                      background:'linear-gradient(90deg,#ffd700,#69f0ae)',
                      borderRadius:3,transition:'width .5s ease'}}/>
                  </div>
                  <span style={{fontSize:9,color:'#78909c',fontWeight:700}}>{a}🌑</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Star flash */}
      {starFlash&&<div style={{textAlign:'center',fontSize:'clamp(12px,2.2vw,15px)',color:'#ff8c00',fontWeight:900,animation:'bSlide .3s ease',marginBottom:6,padding:'5px 12px',background:'rgba(255,200,50,.1)',borderRadius:12}}>{starFlash}</div>}

      {/* Mayavi taunt */}
      {mayaviTxt&&<div style={{background:'rgba(40,53,147,.12)',border:'1px solid rgba(121,134,203,.3)',borderRadius:12,padding:'8px 14px',marginBottom:8,fontSize:'clamp(11px,1.8vw,13px)',color:'#7986cb',fontStyle:'italic',textAlign:'center',animation:'bSlide .3s ease'}}>
        🦊 Mayavi: "{mayaviTxt}"
      </div>}

      {/* Board */}
      <BalaBoard players={players} pos={pos} cur={cur}/>

      {/* Panditji */}
      <div style={{display:'flex',alignItems:'flex-start',gap:12,maxWidth:560,margin:'10px auto 0',padding:'12px 16px',background:'rgba(255,255,255,.85)',borderRadius:20,border:`2px solid ${realm.border}`,boxShadow:'0 4px 16px rgba(0,0,0,.06)',backdropFilter:'blur(8px)'}}>
        <PanditjiSVG size={50}/>
        <div>
          <div style={{fontSize:10,color:realm.text,fontWeight:900,letterSpacing:1,marginBottom:3,fontFamily:"'Noto Sans Devanagari',sans-serif"}}>🧙 PANDITJI VISHNU SHARMA</div>
          <div style={{fontSize:'clamp(11px,1.9vw,13px)',color:'#444',lineHeight:1.8,fontWeight:600}}>{pm(naniKey)}</div>
        </div>
      </div>

      {/* Dice + Roll */}
      {!dilemma&&!isCpuTurn&&(
        <div style={{display:'flex',justifyContent:'center',marginTop:16}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:52,marginBottom:8,animation:diceAnim?'bSpin .55s ease':'none',filter:'drop-shadow(0 4px 8px rgba(0,0,0,.18))'}}>
              {diceVal?['','⚀','⚁','⚂','⚃','⚄','⚅'][diceVal]:'🎲'}
            </div>
            <button className="bb" onClick={()=>doRoll(false)} disabled={busy} style={{fontSize:'clamp(14px,2.6vw,18px)',padding:'13px 34px'}}>
              {busy?(isHi?'जा रहे हैं...':'Moving...'):`🎲 ${cp?.name} — ${isHi?'पासा फेंको!':'Roll!'}`}
            </button>
          </div>
        </div>
      )}
      {isCpuTurn&&!busy&&<div style={{textAlign:'center',marginTop:16,fontSize:'clamp(12px,2vw,14px)',color:'#7986cb',fontStyle:'italic',animation:'breathe 1.5s ease infinite'}}>🦊 Mayavi is thinking...</div>}

      {/* Popups */}
      {storyPop&&<StoryPopup data={storyPop.data} type={storyPop.type} onClose={closeStory}/>}
      {discPop&&<DiscoveryPopup sq={discPop} onClose={closeDisc}/>}
      {dilemma&&<DilemmaPopup dilemma={dilemma} onSolve={solveD}/>}
    </div>
  );
}
