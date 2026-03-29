// ─────────────────────────────────────────────────────────────────────────────
// tiers/bala/BalaGame.jsx  —  Bala Marg: The Panchatantra Forest
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useRef } from 'react';
import {
  CHARS_BALA, SNAKES_BALA, LADDERS_BALA,
  DLM_SQ_BALA, DILEMMAS_BALA, DISCOVERY_SQUARES,
  STAR_MESSAGES, PANDITJI, BALA_WIN_SQUARE, BALA_WIN_STARS,
  getBalaRealm,
} from './bala.constants.js';

function useAmbient() {
  const ref = useRef(null), playing = useRef(false);
  const start = () => { if (playing.current) return; try { const a = new Audio('/ambient.mp3'); a.loop = true; a.volume = 0.5; ref.current = a; a.play().then(() => { playing.current = true; }).catch(() => {}); } catch (e) {} };
  const stop  = () => { if (!playing.current || !ref.current) return; try { ref.current.pause(); ref.current.currentTime = 0; playing.current = false; ref.current = null; } catch (e) {} };
  return { start, stop };
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;700&display=swap');
*{box-sizing:border-box}
@keyframes bFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes bPop{0%{transform:scale(.2);opacity:0}65%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes bBounce{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.1)}100%{transform:translateY(0) scale(1)}}
@keyframes bPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,193,7,.5)}50%{box-shadow:0 0 0 10px rgba(255,193,7,0)}}
@keyframes bSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes bWiggle{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes bRainbow{0%{color:#ff6b6b}16%{color:#ffa500}33%{color:#ffd700}50%{color:#51cf66}66%{color:#339af0}83%{color:#845ef7}100%{color:#ff6b6b}}
@keyframes bSlideUp{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
.bb{background:linear-gradient(135deg,#ff8c00,#ff6b00);border:none;color:#fff;padding:14px 32px;font-size:clamp(15px,2.5vw,19px);font-family:'Baloo 2',sans-serif;font-weight:800;cursor:pointer;border-radius:50px;box-shadow:0 6px 20px rgba(255,100,0,.35);transition:all .2s;letter-spacing:.5px}
.bb:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 8px 24px rgba(255,100,0,.45)}
.bb:active{transform:scale(.97)}
.bb:disabled{background:linear-gradient(135deg,#bbb,#999);box-shadow:none;cursor:default;transform:none}
.bb-green{background:linear-gradient(135deg,#43a047,#2e7d32);box-shadow:0 6px 20px rgba(46,125,50,.35)}
.bb-green:hover{box-shadow:0 8px 24px rgba(46,125,50,.45)}
.bb-ghost{background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.3);color:white}
.bc{width:100%;background:#fff;border:3px solid transparent;border-radius:14px;padding:14px 16px;font-size:clamp(12px,2vw,14px);font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;text-align:left;transition:all .18s;box-shadow:0 3px 10px rgba(0,0,0,.07);display:flex;align-items:flex-start;gap:10px;line-height:1.6}
.bc:hover{transform:translateX(4px)}
.bc-wise{border-color:#43a047;background:#f8fff8}
.bc-wise:hover{background:#e8f5e9}
.bc-oops{border-color:#ff9800;background:#fffaf5}
.bc-oops:hover{background:#fff3e0}
`;

// ── SVG Animals ───────────────────────────────────────────────────────────
function AnimalSVG({ id, size = 60, animate = true }) {
  const anim = animate ? 'bFloat 2.5s ease infinite' : 'none';
  const bounce = 'bBounce 1.2s ease infinite';
  const s = size;
  if (id === 'elephant') return (
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
      <circle cx="44" cy="33" r="1" fill="white"/><circle cx="60" cy="33" r="1" fill="white"/>
      <path d="M43 44 Q50 49 57 44" stroke="#757575" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id === 'tiger') return (
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
      <ellipse cx="50" cy="60" rx="9" ry="6" fill="#ffca28"/>
      <ellipse cx="43" cy="60" rx="3" ry="2.5" fill="#ffa000"/>
      <ellipse cx="57" cy="60" rx="3" ry="2.5" fill="#ffa000"/>
      <path d="M43 67 Q50 72 57 67" stroke="#e65100" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id === 'rabbit') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:anim}}>
      <ellipse cx="34" cy="20" rx="9" ry="22" fill="#f5f5f5"/>
      <ellipse cx="66" cy="20" rx="9" ry="22" fill="#f5f5f5"/>
      <ellipse cx="34" cy="20" rx="6" ry="18" fill="#f8bbd0"/>
      <ellipse cx="66" cy="20" rx="6" ry="18" fill="#f8bbd0"/>
      <circle cx="50" cy="55" r="28" fill="#f5f5f5"/>
      <circle cx="50" cy="45" r="20" fill="#f5f5f5"/>
      <circle cx="41" cy="42" r="5" fill="white"/><circle cx="42" cy="42" r="3.5" fill="#ec407a"/>
      <circle cx="59" cy="42" r="5" fill="white"/><circle cx="60" cy="42" r="3.5" fill="#ec407a"/>
      <ellipse cx="50" cy="53" rx="7" ry="4.5" fill="#f8bbd0"/>
      <path d="M44 60 Q50 64 56 60" stroke="#e91e63" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id === 'deer') return (
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
  if (id === 'monkey') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:bounce}}>
      <ellipse cx="26" cy="38" rx="14" ry="18" fill="#8d6e63"/>
      <ellipse cx="74" cy="38" rx="14" ry="18" fill="#8d6e63"/>
      <ellipse cx="26" cy="38" rx="9" ry="12" fill="#f8bbd0"/>
      <ellipse cx="74" cy="38" rx="9" ry="12" fill="#f8bbd0"/>
      <circle cx="50" cy="50" r="28" fill="#8d6e63"/>
      <circle cx="50" cy="56" r="20" fill="#d7ccc8"/>
      <circle cx="41" cy="46" r="5" fill="white"/><circle cx="42" cy="46" r="3.5" fill="#3e2723"/>
      <circle cx="59" cy="46" r="5" fill="white"/><circle cx="60" cy="46" r="3.5" fill="#3e2723"/>
      <ellipse cx="50" cy="58" rx="8" ry="5.5" fill="#bcaaa4"/>
      <path d="M43 65 Q50 70 57 65" stroke="#6d4c41" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M78 55 Q90 48 92 62 Q90 72 80 69" stroke="#8d6e63" strokeWidth="5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (id === 'peacock') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:'bSpin 6s linear infinite'}}>
      {[0,40,80,120,160,200,240,280,320].map((d,i)=>(
        <ellipse key={i} cx="50" cy="50" rx="5" ry="22"
          fill={i%3===0?'#00acc1':i%3===1?'#7b1fa2':'#2e7d32'}
          transform={`rotate(${d},50,50) translate(0,-16)`} opacity=".8"/>
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

// ── Panditji SVG ──────────────────────────────────────────────────────────
function PanditjiSVG({ size = 64 }) {
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

// ── Board ─────────────────────────────────────────────────────────────────
function BalaBoard({ players, pos, cur }) {
  const SQ = 72, COLS = 9;
  const sqPos = (n) => {
    const row = Math.floor((n - 1) / COLS);
    const col = row % 2 === 0 ? (n - 1) % COLS : (COLS - 1) - ((n - 1) % COLS);
    return { r: Math.floor(SQ / COLS) - row - 1, c: col };
  };
  return (
    <div style={{ position:'relative', width:'100%', maxWidth:600, margin:'0 auto' }}>
      <div style={{
        display:'grid', gridTemplateColumns:`repeat(${COLS},1fr)`, gridTemplateRows:`repeat(${Math.ceil(SQ/COLS)},1fr)`,
        gap:2, padding:6, background:'white', borderRadius:16,
        border:'3px solid #ffd54f', boxShadow:'0 8px 32px rgba(0,0,0,.09)',
        aspectRatio:`${COLS}/${Math.ceil(SQ/COLS)}`,
      }}>
        {Array.from({length:SQ},(_,i)=>{
          const n=i+1, {r,c}=sqPos(n);
          const realm=getBalaRealm(n);
          const isSnake=!!SNAKES_BALA[n], isLadder=!!LADDERS_BALA[n];
          const isDisc=!!DISCOVERY_SQUARES[n], isDlm=DLM_SQ_BALA.includes(n);
          const isWin=n===BALA_WIN_SQUARE;
          const here=players.map((_,pi)=>(pos[pi]||1)===n?pi:-1).filter(x=>x>=0);
          return (
            <div key={n} style={{
              gridColumn:c+1, gridRow:r+1,
              background:isWin?'linear-gradient(135deg,#ffd700,#ff8c00)':isDisc?'linear-gradient(135deg,#e8eaf6,#c5cae9)':realm.bg,
              border:`1.5px solid ${isWin?'#ff8c00':isSnake?'#ef5350':isLadder?'#43a047':isDisc?'#7986cb':realm.border}`,
              borderRadius:5, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
            }}>
              <span style={{position:'absolute',top:1,left:2,fontSize:'clamp(4px,.75vw,7px)',color:realm.text,opacity:.55,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>{n}</span>
              {isWin&&<span style={{fontSize:'clamp(10px,2vw,17px)'}}>⭐</span>}
              {isSnake&&!here.length&&<span style={{fontSize:'clamp(8px,1.4vw,13px)',opacity:.8}}>{SNAKES_BALA[n].animal}</span>}
              {isLadder&&!here.length&&<span style={{fontSize:'clamp(8px,1.4vw,13px)',opacity:.8}}>{LADDERS_BALA[n].animal}</span>}
              {isDisc&&!isSnake&&!isLadder&&!here.length&&<span style={{fontSize:'clamp(7px,1.2vw,11px)',opacity:.7}}>{DISCOVERY_SQUARES[n].icon}</span>}
              {isDlm&&!isSnake&&!isLadder&&!isDisc&&!here.length&&<span style={{fontSize:'clamp(6px,1.1vw,10px)',opacity:.45}}>🤔</span>}
              {here.length>0&&(
                <div style={{display:'flex',flexWrap:'wrap',gap:1,position:'absolute',inset:1,alignItems:'center',justifyContent:'center',zIndex:3}}>
                  {here.map(pi=>(
                    <div key={pi} style={{
                      width:'clamp(11px,2vw,20px)',height:'clamp(11px,2vw,20px)',borderRadius:'50%',
                      background:players[pi].char.color,border:'2px solid white',
                      boxShadow:'0 2px 6px rgba(0,0,0,.25)',display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:'clamp(6px,1.1vw,10px)',
                      animation:pi===cur?'bPulse .9s ease infinite':'none',
                    }}>{players[pi].char.icon}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:6,flexWrap:'wrap'}}>
        {[['🐍 Snake','#fde0dc'],['🪜 Ladder','#e0f2e9'],['🔭 Discovery','#e8eaf6'],['🤔 Choice','#fff9c4']].map(([l,bg])=>(
          <div key={l} style={{fontSize:10,background:bg,padding:'3px 9px',borderRadius:10,color:'#555',fontFamily:"'Nunito',sans-serif",fontWeight:600}}>{l}</div>
        ))}
      </div>
    </div>
  );
}

// ── Discovery Popup ───────────────────────────────────────────────────────
function DiscoveryPopup({ sq, onClose }) {
  const d = DISCOVERY_SQUARES[sq]; if (!d) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(10,10,40,.88)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:300}}>
      <div style={{background:'linear-gradient(135deg,#1a1a4e,#2d2d7a)',color:'white',borderRadius:28,padding:'clamp(18px,4vw,34px)',maxWidth:500,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,.5)',border:'2px solid rgba(255,220,80,.3)',animation:'bPop .3s ease'}}>
        <div style={{textAlign:'center',fontSize:56,marginBottom:6,animation:'bFloat 2s ease infinite'}}>{d.icon}</div>
        <div style={{fontSize:'clamp(10px,1.7vw,12px)',color:'rgba(255,220,80,.65)',textAlign:'center',fontFamily:"'Noto Sans Devanagari',sans-serif",marginBottom:14,letterSpacing:1}}>
          {d.skt} · {d.sktMeaning}
        </div>
        <div style={{background:'rgba(255,220,80,.1)',borderRadius:16,padding:'12px 16px',marginBottom:12,border:'1px solid rgba(255,220,80,.2)'}}>
          <div style={{fontSize:10,color:'rgba(255,220,80,.55)',marginBottom:4,letterSpacing:1,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>VEDIC WISDOM</div>
          <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(255,220,80,.85)',lineHeight:1.8,fontStyle:'italic',fontFamily:"'Nunito',sans-serif"}}>{d.vedic}</div>
        </div>
        <div style={{background:'rgba(100,180,255,.1)',borderRadius:16,padding:'12px 16px',marginBottom:12,border:'1px solid rgba(100,180,255,.2)'}}>
          <div style={{fontSize:10,color:'rgba(100,200,255,.55)',marginBottom:4,letterSpacing:1,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>WHAT SCIENCE FOUND</div>
          <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(200,230,255,.85)',lineHeight:1.8,fontFamily:"'Nunito',sans-serif"}}>{d.science}</div>
        </div>
        <div style={{textAlign:'center',fontSize:'clamp(11px,1.8vw,13px)',color:'rgba(200,160,255,.7)',fontStyle:'italic',marginBottom:18,lineHeight:1.8,fontFamily:"'Nunito',sans-serif"}}>✦ {d.wonder}</div>
        <div style={{textAlign:'center'}}>
          <button className="bb" onClick={onClose} style={{background:'linear-gradient(135deg,#7c4dff,#651fff)'}}>✨ I will tell someone tonight!</button>
        </div>
      </div>
    </div>
  );
}

// ── Story Popup ───────────────────────────────────────────────────────────
function StoryPopup({ data, type, onClose }) {
  if (!data) return null;
  const isL = type === 'ladder';
  const accent = isL ? '#43a047' : '#ef5350';
  const bg = isL ? 'linear-gradient(135deg,#f1f8e9,#dcedc8)' : 'linear-gradient(135deg,#fce4ec,#f8bbd0)';
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:250}}>
      <div style={{background:bg,borderRadius:24,padding:'clamp(18px,3.5vw,30px)',maxWidth:480,width:'100%',boxShadow:'0 16px 48px rgba(0,0,0,.25)',border:`3px solid ${accent}`,animation:'bPop .3s ease',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{textAlign:'center',fontSize:52,marginBottom:6,animation:'bFloat 2s ease infinite'}}>{data.animal}</div>
        <div style={{textAlign:'center',fontSize:'clamp(14px,2.5vw,18px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:accent,marginBottom:3}}>{data.storyTitle}</div>
        <div style={{textAlign:'center',fontSize:'clamp(9px,1.4vw,11px)',color:'rgba(0,0,0,.4)',marginBottom:12,letterSpacing:1,fontFamily:"'Noto Sans Devanagari',sans-serif"}}>
          {data.skt} · {data.en}
        </div>
        {data.from&&<div style={{textAlign:'center',marginBottom:10}}>
          <span style={{fontSize:12,background:accent+'22',borderRadius:20,padding:'3px 12px',color:accent,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>
            {isL?'↑ ':'↓ '}Square {data.from} → {data.to}
          </span>
        </div>}
        <div style={{background:'rgba(255,255,255,.75)',borderRadius:16,padding:14,marginBottom:12,fontSize:'clamp(12px,2vw,14px)',color:'#333',lineHeight:1.9,fontFamily:"'Nunito',sans-serif"}}>{data.story}</div>
        <div style={{background:accent+'18',borderRadius:12,padding:'10px 14px',marginBottom:16,display:'flex',alignItems:'flex-start',gap:8}}>
          <span style={{fontSize:18,flexShrink:0}}>{isL?'💡':'⚠️'}</span>
          <div style={{fontSize:'clamp(11px,1.8vw,13px)',color:'#333',lineHeight:1.7,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>{data.lesson}</div>
        </div>
        <div style={{textAlign:'center'}}>
          <button className={`bb ${isL?'bb-green':''}`} onClick={onClose}>
            {isL?'⭐ I understand!':'🙏 I will remember this'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dilemma Popup ─────────────────────────────────────────────────────────
function DilemmaPopup({ dilemma, onSolve }) {
  if (!dilemma) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:260}}>
      <div style={{background:'white',borderRadius:24,padding:'clamp(18px,3.5vw,28px)',maxWidth:480,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,.3)',border:'3px solid #ffd54f',animation:'bPop .3s ease',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{textAlign:'center',fontSize:36,marginBottom:6}}>🤔</div>
        <div style={{textAlign:'center',fontSize:'clamp(14px,2.5vw,18px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#e65100',marginBottom:8}}>{dilemma.t}</div>
        <div style={{background:'#fff3e0',borderRadius:14,padding:'10px 14px',marginBottom:12,fontSize:'clamp(11px,1.8vw,13px)',color:'#5d4037',lineHeight:1.9,fontStyle:'italic',fontFamily:"'Nunito',sans-serif"}}>
          📖 {dilemma.storySetup}
        </div>
        <div style={{fontSize:'clamp(12px,2vw,14px)',color:'#444',lineHeight:1.9,marginBottom:14,fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{dilemma.txt}</div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:12}}>
          {dilemma.c.map((ch,ci)=>(
            <button key={ci} className={`bc ${ch.k==='star'?'bc-wise':'bc-oops'}`} onClick={()=>onSolve(ci)}>
              <span style={{fontSize:20,flexShrink:0}}>{ch.k==='star'?'💚':'🟠'}</span>
              <span>{ch.l}</span>
            </button>
          ))}
        </div>
        <div style={{fontSize:'clamp(10px,1.5vw,12px)',color:'#999',textAlign:'center',fontStyle:'italic',fontFamily:"'Noto Sans Devanagari',sans-serif"}}>
          — {dilemma.skt} · {dilemma.sktMeaning}
        </div>
      </div>
    </div>
  );
}

// ── Win Screen ────────────────────────────────────────────────────────────
function WinScreen({ players, pos, stars, win, isHi, onExit, onPlayAgain }) {
  const w = players[win];
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#1a237e,#4a148c,#880e4f)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:"'Nunito',sans-serif",textAlign:'center'}}>
      <div style={{fontSize:72,animation:'bFloat 1.5s ease infinite',marginBottom:8}}>🌟</div>
      <div style={{fontSize:'clamp(22px,5vw,36px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#ffd700',marginBottom:4,animation:'bRainbow 3s ease infinite'}}>
        {isHi?`${w?.name} जीत गया!`:`${w?.name} Wins!`}
      </div>
      <div style={{fontSize:'clamp(12px,2vw,14px)',color:'rgba(255,220,80,.65)',marginBottom:24,maxWidth:380,lineHeight:1.9,fontStyle:'italic'}}>
        {isHi?PANDITJI.messages.win.hi:PANDITJI.messages.win.en}
      </div>
      <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:28}}>
        {players.map((p,i)=>(
          <div key={i} style={{background:i===win?'rgba(255,215,0,.18)':'rgba(255,255,255,.07)',border:`2px solid ${i===win?'#ffd700':'rgba(255,255,255,.15)'}`,borderRadius:18,padding:'14px 20px',minWidth:100}}>
            <AnimalSVG id={p.char.id} size={52} animate={i===win}/>
            <div style={{fontSize:13,color:i===win?'#ffd700':'rgba(255,255,255,.55)',fontWeight:800,marginTop:4}}>{p.name}</div>
            <div style={{fontSize:12,color:'rgba(255,200,50,.6)',letterSpacing:'-1px'}}>{'⭐'.repeat(Math.min(stars[i],8))}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
        <button className="bb" onClick={onPlayAgain} style={{background:'linear-gradient(135deg,#ffd700,#ff8c00)'}}>🎲 {isHi?'फिर खेलो':'Play Again'}</button>
        <button className="bb bb-ghost" onClick={onExit}>🏠 {isHi?'घर जाओ':'Home'}</button>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function BalaGame({ onExit }) {
  const ambient = useAmbient();
  const [screen,   setScreen]   = useState('select');
  const [players,  setPlayers]  = useState([]);
  const [nP,       setNP]       = useState(2);
  const [pos,      setPos]      = useState([1,1,1,1]);
  const [stars,    setStars]    = useState([0,0,0,0]);
  const [cur,      setCur]      = useState(0);
  const [win,      setWin]      = useState(null);
  const [busy,     setBusy]     = useState(false);
  const [diceVal,  setDiceVal]  = useState(null);
  const [diceAnim, setDiceAnim] = useState(false);
  const [storyPop, setStoryPop] = useState(null);
  const [discPop,  setDiscPop]  = useState(null);
  const [dilemma,  setDilemma]  = useState(null);
  const [starFlash,setStarFlash]= useState('');
  const [naniKey,  setNaniKey]  = useState('start');
  const [tempChar, setTempChar] = useState(-1);
  const [tempName, setTempName] = useState('');
  const [pidx,     setPidx]     = useState(0);
  const [lang,     setLang]     = useState('en');
  const cbRef = useRef(null);
  const isHi = lang === 'hi';
  const pm = (k) => isHi ? PANDITJI.messages[k].hi : PANDITJI.messages[k].en;

  const nextTurn = useCallback((nPos, nStars) => {
    setBusy(false); setCur(c => (c+1)%nP); setNaniKey('waiting');
  }, [nP]);

  const checkWin = (pi, nPos, nStars) => {
    if (nPos[pi] >= BALA_WIN_SQUARE || nStars[pi] >= BALA_WIN_STARS) { setWin(pi); return true; }
    return false;
  };

  const showStory = (data, type, cb) => { setStoryPop({data,type}); cbRef.current = cb; };
  const closeStory = () => { setStoryPop(null); if (cbRef.current) { const f=cbRef.current; cbRef.current=null; setTimeout(f,200); } };
  const closeDisc = () => { setDiscPop(null); if (cbRef.current) { const f=cbRef.current; cbRef.current=null; setTimeout(f,200); } };

  const landAfterDisc = (n, pi, nPos, nStars) => {
    if (SNAKES_BALA[n]) {
      const sn = SNAKES_BALA[n]; setNaniKey('snake');
      showStory({...sn,from:n},'snake',()=>{ nPos[pi]=sn.to; setPos([...nPos]); nextTurn(nPos,nStars); });
      return;
    }
    if (LADDERS_BALA[n]) {
      const ld = LADDERS_BALA[n];
      nStars[pi] = Math.min(nStars[pi]+1, BALA_WIN_STARS); setStars([...nStars]);
      setStarFlash(STAR_MESSAGES[Math.floor(Math.random()*STAR_MESSAGES.length)]);
      setTimeout(()=>setStarFlash(''),2500); setNaniKey('ladder');
      showStory({...ld,from:n},'ladder',()=>{ nPos[pi]=ld.to; setPos([...nPos]); if(!checkWin(pi,nPos,nStars)) nextTurn(nPos,nStars); });
      return;
    }
    if (DLM_SQ_BALA.includes(n)) {
      setNaniKey('dilemma');
      const d = DILEMMAS_BALA[Math.floor(Math.random()*DILEMMAS_BALA.length)];
      setBusy(false); setDilemma({...d,pi,nPos:[...nPos],nStars:[...nStars]}); return;
    }
    if (!checkWin(pi,nPos,nStars)) nextTurn(nPos,nStars);
  };

  const checkLanding = useCallback((n, pi, nPos, nStars) => {
    if (DISCOVERY_SQUARES[n]) {
      setNaniKey('discovery'); setDiscPop(n);
      cbRef.current = () => landAfterDisc(n, pi, nPos, nStars); return;
    }
    landAfterDisc(n, pi, nPos, nStars);
  }, []);

  const solveD = (ci) => {
    if (!dilemma) return;
    const ch=dilemma.c[ci], np=[...dilemma.nPos], ns=[...dilemma.nStars], pi=dilemma.pi;
    if (ch.k==='star'&&ch.fx.star) { ns[pi]=Math.min(ns[pi]+ch.fx.star,BALA_WIN_STARS); setStars([...ns]); setStarFlash(STAR_MESSAGES[Math.floor(Math.random()*STAR_MESSAGES.length)]); setTimeout(()=>setStarFlash(''),2500); }
    if (ch.fx.move) { np[pi]=Math.max(1,Math.min((np[pi]||1)+ch.fx.move,BALA_WIN_SQUARE)); setPos([...np]); }
    setDilemma(null);
    if (!checkWin(pi,np,ns)) nextTurn(np,ns);
  };

  const doRoll = useCallback(() => {
    if (busy||dilemma||win!==null) return;
    setBusy(true); setDiceAnim(true);
    setTimeout(()=>{
      setDiceAnim(false);
      const r=Math.floor(Math.random()*6)+1; setDiceVal(r);
      const pi=cur, nPos=[...pos], nStars=[...stars];
      const oldP=nPos[pi]||1, newP=Math.min(oldP+r,BALA_WIN_SQUARE);
      const total=newP-oldP;
      if(total===0){checkLanding(newP,pi,nPos,nStars);return;}
      let step=0;
      const iv=setInterval(()=>{
        step++; nPos[pi]=oldP+step; setPos([...nPos]);
        if(step>=total){clearInterval(iv);checkLanding(newP,pi,nPos,nStars);}
      },Math.max(70,200-total*8));
    },550);
  },[busy,dilemma,win,cur,pos,stars,checkLanding]);

  const addPlayer = () => {
    if (!tempName.trim()||tempChar<0) return;
    const np=[...players,{name:tempName.trim(),char:CHARS_BALA[tempChar]}];
    setPlayers(np);
    if(np.length>=nP){setPos(Array(nP).fill(1));setStars(Array(nP).fill(0));setCur(0);setWin(null);ambient.start();setScreen('game');}
    else{setPidx(p=>p+1);setTempName('');setTempChar(-1);}
  };

  const restart=()=>{ setPlayers([]);setPidx(0);setTempName('');setTempChar(-1);setPos(Array(nP).fill(1));setStars(Array(nP).fill(0));setCur(0);setWin(null);setDiceVal(null);setNaniKey('start');setScreen('setup'); };

  // SELECT
  if(screen==='select') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f9fbe7,#e8f5e9,#e3f2fd)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,padding:24,fontFamily:"'Nunito',sans-serif"}}>
      <style>{CSS}</style>
      <PanditjiSVG size={80}/>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'clamp(24px,6vw,38px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#2e7d32'}}>🌿 Bala Marg</div>
        <div style={{fontSize:'clamp(11px,2vw,14px)',color:'#5d4037',marginTop:4,lineHeight:1.9,maxWidth:320}}>The Panchatantra Forest — 2,300 years of wisdom, alive today</div>
      </div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
        {[{id:'en',l:'🇬🇧 English'},{id:'hi',l:'🇮🇳 हिंदी'}].map(x=>(
          <button key={x.id} className="bb" onClick={()=>setLang(x.id)} style={{background:lang===x.id?'linear-gradient(135deg,#43a047,#2e7d32)':undefined,minWidth:130}}>{x.l}</button>
        ))}
      </div>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        {[1,2,3,4].map(n=>(
          <button key={n} onClick={()=>setNP(n)} style={{width:44,height:44,borderRadius:'50%',border:`3px solid ${nP===n?'#43a047':'#ddd'}`,background:nP===n?'#e8f5e9':'white',fontSize:17,fontWeight:900,cursor:'pointer',fontFamily:"'Nunito',sans-serif",color:nP===n?'#2e7d32':'#aaa',transition:'all .15s'}}>{n}</button>
        ))}
        <span style={{fontSize:13,color:'#999'}}>{isHi?'खिलाड़ी':'players'}</span>
      </div>
      <button className="bb bb-green" onClick={()=>setScreen('setup')}>🌿 {isHi?'वन में प्रवेश करो!':'Enter the Forest!'}</button>
      <button onClick={onExit} style={{background:'transparent',border:'none',color:'#aaa',fontSize:13,cursor:'pointer',fontFamily:"'Nunito',sans-serif"}}>← {isHi?'वापस':'Back'}</button>
    </div>
  );

  // SETUP
  if(screen==='setup') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f9fbe7,#e8f5e9)',display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 16px 40px',fontFamily:"'Nunito',sans-serif",gap:14}}>
      <style>{CSS}</style>
      <div style={{fontSize:'clamp(16px,3.5vw,22px)',fontWeight:900,fontFamily:"'Baloo 2',sans-serif",color:'#2e7d32',textAlign:'center'}}>
        {isHi?`${pidx+1}वें साधक — अपना साथी चुनो!`:`Seeker ${pidx+1} — Choose your companion!`}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,width:'100%',maxWidth:500}}>
        {CHARS_BALA.map((ch,i)=>(
          <div key={ch.id} onClick={()=>setTempChar(i)} style={{background:tempChar===i?'#e8f5e9':'white',border:`3px solid ${tempChar===i?'#43a047':'#eee'}`,borderRadius:18,padding:12,textAlign:'center',cursor:'pointer',transition:'all .15s',transform:tempChar===i?'scale(1.05)':'scale(1)',boxShadow:tempChar===i?'0 6px 20px rgba(67,160,71,.22)':'0 2px 8px rgba(0,0,0,.05)'}}>
            <AnimalSVG id={ch.id} size={54} animate={tempChar===i}/>
            <div style={{fontSize:12,fontWeight:900,color:'#333',marginTop:5}}>{ch.name}</div>
            <div style={{fontSize:'clamp(8px,1.4vw,10px)',color:'rgba(0,0,0,.4)',fontFamily:"'Noto Sans Devanagari',sans-serif"}}>{ch.skt}</div>
            <div style={{fontSize:10,color:'#66bb6a',marginTop:2}}>{ch.gift}</div>
          </div>
        ))}
      </div>
      {tempChar>=0&&<div style={{background:'#e8f5e9',borderRadius:16,padding:'10px 16px',maxWidth:380,width:'100%',fontSize:'clamp(11px,1.8vw,13px)',color:'#2e7d32',lineHeight:1.8,textAlign:'center',fontStyle:'italic',fontFamily:"'Nunito',sans-serif"}}>
        {CHARS_BALA[tempChar].story}
      </div>}
      <input value={tempName} onChange={e=>setTempName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPlayer()}
        placeholder={isHi?'अपना नाम लिखो...':'Your name...'} style={{width:'100%',maxWidth:300,padding:'12px 18px',fontSize:16,borderRadius:50,border:'3px solid #aed581',outline:'none',fontFamily:"'Nunito',sans-serif",fontWeight:700,textAlign:'center'}}/>
      <button className="bb bb-green" onClick={addPlayer} style={{opacity:(!tempName.trim()||tempChar<0)?.5:1}}>
        {pidx<nP-1?(isHi?'अगला साधक →':'Next Seeker →'):(isHi?'वन में चलो! 🌿':'Enter the Forest! 🌿')}
      </button>
    </div>
  );

  // WIN
  if(screen==='game'&&win!==null) return (<><style>{CSS}</style><WinScreen players={players} pos={pos} stars={stars} win={win} isHi={isHi} onExit={()=>{ambient.stop();onExit();}} onPlayAgain={restart}/></>);

  // GAME
  const cp=players[cur], realm=getBalaRealm(pos[cur]||1);
  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(160deg,${realm.bg},#ffffff)`,padding:'8px 8px 100px',fontFamily:"'Nunito',sans-serif",transition:'background .8s ease'}}>
      <style>{CSS}</style>
      {/* Top */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:6}}>
        <button onClick={()=>{ambient.stop();onExit();}} style={{background:'transparent',border:`2px solid ${realm.border}`,color:realm.text,padding:'4px 12px',borderRadius:20,fontSize:12,cursor:'pointer',fontWeight:700}}>← {isHi?'घर':'Home'}</button>
        <div style={{fontSize:12,color:realm.text,fontWeight:700,opacity:.7,textAlign:'center'}}>
          {realm.icon} {realm.name} · <span style={{fontFamily:"'Noto Sans Devanagari',sans-serif"}}>{realm.skt}</span>
        </div>
        <div style={{fontSize:11,color:realm.text,opacity:.45}}>{isHi?`वर्ग ${pos[cur]||1}/72`:`Sq ${pos[cur]||1}/72`}</div>
      </div>
      {/* Player bar */}
      <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
        {players.map((p,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',borderRadius:20,background:i===cur?realm.bg:'rgba(255,255,255,.7)',border:`2px solid ${i===cur?realm.border:'rgba(0,0,0,.07)'}`,boxShadow:i===cur?'0 3px 12px rgba(0,0,0,.09)':'none',transition:'all .3s',flexShrink:0}}>
            <AnimalSVG id={p.char.id} size={26} animate={i===cur}/>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:i===cur?realm.text:'#777'}}>{p.name}</div>
              <div style={{fontSize:11,color:'#ffb300',letterSpacing:'-1px'}}>{'⭐'.repeat(Math.min(stars[i],8))}{stars[i]===0&&<span style={{color:'#ccc',fontSize:9}}> —</span>}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Star flash */}
      {starFlash&&<div style={{textAlign:'center',fontSize:'clamp(12px,2.2vw,15px)',color:'#ff8c00',fontWeight:900,animation:'bSlideUp .3s ease',marginBottom:6,padding:'5px 12px',background:'rgba(255,200,50,.1)',borderRadius:12}}>{starFlash}</div>}
      {/* Board */}
      <BalaBoard players={players} pos={pos} cur={cur}/>
      {/* Panditji */}
      <div style={{display:'flex',alignItems:'flex-start',gap:12,maxWidth:600,margin:'10px auto 0',padding:'12px 16px',background:'rgba(255,255,255,.85)',borderRadius:20,border:`2px solid ${realm.border}`,boxShadow:'0 4px 16px rgba(0,0,0,.06)',backdropFilter:'blur(8px)'}}>
        <PanditjiSVG size={50}/>
        <div>
          <div style={{fontSize:10,color:realm.text,fontWeight:900,letterSpacing:1,marginBottom:3,fontFamily:"'Noto Sans Devanagari',sans-serif"}}>🧙 PANDITJI</div>
          <div style={{fontSize:'clamp(11px,1.9vw,13px)',color:'#444',lineHeight:1.8,fontWeight:600}}>{pm(naniKey)}</div>
        </div>
      </div>
      {/* Dice */}
      {!dilemma&&win===null&&(
        <div style={{display:'flex',justifyContent:'center',marginTop:16}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:52,marginBottom:8,animation:diceAnim?'bSpin .55s ease':'none',filter:'drop-shadow(0 4px 8px rgba(0,0,0,.18))'}}>
              {diceVal?['','⚀','⚁','⚂','⚃','⚄','⚅'][diceVal]:'🎲'}
            </div>
            <button className="bb" onClick={doRoll} disabled={busy} style={{fontSize:'clamp(14px,2.6vw,18px)',padding:'13px 34px'}}>
              {busy?(isHi?'जा रहे हैं...':'Moving...'):`🎲 ${cp?.name} — ${isHi?'पासा फेंको!':'Roll!'}`}
            </button>
          </div>
        </div>
      )}
      {storyPop&&<StoryPopup data={storyPop.data} type={storyPop.type} onClose={closeStory}/>}
      {discPop&&<DiscoveryPopup sq={discPop} onClose={closeDisc}/>}
      {dilemma&&<DilemmaPopup dilemma={dilemma} onSolve={solveD}/>}
    </div>
  );
}
