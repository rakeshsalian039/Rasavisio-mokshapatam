// ───────────────────────────────────────────────────────────────────────────
// src/components/ChitraguptaPanel.jsx
// ───────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CG_ENTRY_TYPES } from '../shared/audio.js';

export default function ChitraguptaPanel({ entries, players, punya, papa, cur, win }) {
  const nP = players.length;
  // Compute aggregate punya/papa for balance scale
  const totalPunya = punya.reduce((a,b)=>a+b,0);
  const totalPapa  = papa.reduce((a,b)=>a+b,0);
  const total      = Math.max(totalPunya+totalPapa, 1);
  const balance    = (totalPunya-totalPapa); // positive = purer, negative = more sin
  // Scale tilt angle: max ±28deg
  const tiltDeg    = Math.max(-28, Math.min(28, -(balance/Math.max(total*.5,1))*28));
  const isShaking  = Math.abs(balance) < 3 && total > 4;
  const recent     = entries.slice(-6);

  const et = CG_ENTRY_TYPES;

  return (
    <div style={{
      background:'linear-gradient(160deg,rgba(26,18,8,.98),rgba(14,10,4,.99))',
      border:'1px solid rgba(200,175,90,.18)',borderRadius:8,
      overflow:'hidden',position:'relative',
    }}>
      {/* Parchment ruled lines */}
      <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(200,175,90,.022) 20px,rgba(200,175,90,.022) 21px)',pointerEvents:'none'}}/>

      {/* ── Header ── */}
      <div style={{padding:'8px 12px 6px',borderBottom:'1px solid rgba(200,175,90,.1)',display:'flex',alignItems:'center',gap:8,position:'relative'}}>
        {/* Quill SVG */}
        <svg width={16} height={20} viewBox="0 0 16 20" style={{flexShrink:0,filter:'drop-shadow(0 0 4px rgba(200,175,90,.6))'}}>
          <path d="M8 1 Q13 0 14 4 Q16 9 11 13 Q9 15 8 18 Q7 15 8 13 Q3 9 2 5 Q3 1 8 1Z" fill="rgba(200,175,90,.2)" stroke="rgba(200,175,90,.55)" strokeWidth=".6"/>
          <path d="M8 18 L8 13 Q11 10 12 7" fill="none" stroke="rgba(200,175,90,.6)" strokeWidth=".6"/>
          <circle cx={8} cy={18.5} r={1.3} fill="rgba(200,175,90,.7)">
            <animate attributeName="opacity" values=".4;1;.4" dur="2.2s" repeatCount="indefinite"/>
          </circle>
        </svg>
        <div style={{flex:1}}>
          <div style={{fontSize:8,letterSpacing:3,color:'rgba(200,175,90,.6)',fontFamily:"'Cinzel',serif",fontWeight:700}}>CHITRAGUPTA</div>
          <div style={{fontSize:6,color:'rgba(200,175,90,.3)',letterSpacing:2}}>अग्रसंधानी · AGRASANDHANI</div>
        </div>
        {entries.length>0&&<div style={{fontSize:7,color:'rgba(200,175,90,.2)',fontFamily:"'Cinzel',serif"}}>{entries.length} entries</div>}
      </div>

      {/* ── Balance Scale ── */}
      <div style={{padding:'10px 12px 6px',borderBottom:'1px solid rgba(200,175,90,.06)'}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:10}}>
          {/* Scale SVG */}
          <div style={{flexShrink:0,animation:isShaking?'cgScaleShake 0.3s ease infinite':'none'}}>
            <svg width={80} height={60} viewBox="0 0 80 60" style={{overflow:'visible'}}>
              {/* Fulcrum post */}
              <line x1={40} y1={10} x2={40} y2={52} stroke="rgba(200,175,90,.4)" strokeWidth={1.5}/>
              <polygon points="33,52 47,52 40,56" fill="rgba(200,175,90,.3)"/>
              {/* Top pivot circle */}
              <circle cx={40} cy={10} r={3} fill="rgba(200,175,90,.35)" stroke="rgba(200,175,90,.5)" strokeWidth=".8"/>
              {/* Beam — tilts dynamically */}
              <g style={{transformOrigin:'40px 10px',transform:`rotate(${tiltDeg}deg)`,transition:'transform 1.2s cubic-bezier(.34,1.56,.64,1)'}}>
                <line x1={4} y1={10} x2={76} y2={10} stroke={balance>=0?'rgba(80,200,80,.7)':'rgba(200,80,60,.7)'} strokeWidth={2} style={{transition:'stroke 0.8s'}}/>
                {/* Left string */}
                <line x1={4} y1={10} x2={4} y2={24} stroke="rgba(200,175,90,.35)" strokeWidth={.8}/>
                {/* Right string */}
                <line x1={76} y1={10} x2={76} y2={24} stroke="rgba(200,175,90,.35)" strokeWidth={.8}/>
                {/* Left pan (Punya) */}
                <ellipse cx={4} cy={26} rx={10} ry={3} fill="rgba(80,200,80,.15)" stroke="rgba(80,200,80,.5)" strokeWidth={.8}/>
                <text x={4} y={29.5} textAnchor="middle" fontSize={5} fill="rgba(80,200,80,.7)" fontFamily="Cinzel">पुण्य</text>
                {/* Right pan (Papa) */}
                <ellipse cx={76} cy={26} rx={10} ry={3} fill="rgba(200,80,60,.12)" stroke="rgba(200,80,60,.5)" strokeWidth={.8}/>
                <text x={76} y={29.5} textAnchor="middle" fontSize={5} fill="rgba(200,80,60,.7)" fontFamily="Cinzel">पाप</text>
              </g>
              {/* Punya weight stack */}
              {[...Array(Math.min(totalPunya,8))].map((_,i)=>(
                <rect key={i} x={-6+40-36} y={36+i*-3} width={16} height={2.5} rx={1}
                  fill={`rgba(240,200,80,${0.3+i*0.08})`}
                  style={{transformOrigin:'40px 10px',transform:`rotate(${tiltDeg}deg)`,transition:'transform 1.2s cubic-bezier(.34,1.56,.64,1)'}}/>
              ))}
              {/* Papa weight stack */}
              {[...Array(Math.min(totalPapa,8))].map((_,i)=>(
                <rect key={i} x={70} y={36+i*-3} width={16} height={2.5} rx={1}
                  fill={`rgba(200,80,60,${0.25+i*0.08})`}
                  style={{transformOrigin:'40px 10px',transform:`rotate(${tiltDeg}deg)`,transition:'transform 1.2s cubic-bezier(.34,1.56,.64,1)'}}/>
              ))}
            </svg>
          </div>
          {/* Balance readout */}
          <div style={{flex:1,paddingBottom:4}}>
            <div style={{display:'flex',gap:10,marginBottom:4}}>
              <div style={{flex:1}}>
                <div style={{fontSize:7,color:'rgba(80,200,80,.5)',letterSpacing:1,marginBottom:2}}>पुण्य</div>
                <div style={{height:4,background:'rgba(80,200,80,.08)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(totalPunya/Math.max(totalPunya+totalPapa,1))*100}%`,background:'linear-gradient(90deg,rgba(80,200,80,.4),rgba(80,200,80,.7))',borderRadius:2,transition:'width 1s cubic-bezier(.4,0,.2,1)'}}/>
                </div>
                <div style={{fontSize:9,color:'rgba(80,200,80,.7)',fontWeight:700,marginTop:1}}>{totalPunya}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:7,color:'rgba(200,80,60,.5)',letterSpacing:1,marginBottom:2}}>पाप</div>
                <div style={{height:4,background:'rgba(200,80,60,.08)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(totalPapa/Math.max(totalPunya+totalPapa,1))*100}%`,background:'linear-gradient(90deg,rgba(200,80,60,.4),rgba(200,80,60,.7))',borderRadius:2,transition:'width 1s cubic-bezier(.4,0,.2,1)'}}/>
                </div>
                <div style={{fontSize:9,color:'rgba(200,80,60,.7)',fontWeight:700,marginTop:1}}>{totalPapa}</div>
              </div>
            </div>
            <div style={{fontSize:8,color:balance>=0?'rgba(80,200,80,.5)':'rgba(200,80,60,.5)',letterSpacing:1,textAlign:'center',transition:'color 0.8s'}}>
              {isShaking?'⚖ तुला — The scales are even':balance>0?`✦ +${balance} Punya favoured`:`✦ ${Math.abs(balance)} Papa favoured`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Ledger Entries (last 5, most recent at bottom) ── */}
      <div style={{padding:'6px 10px',minHeight:40}}>
        {entries.length===0?(
          <div style={{fontSize:8,color:'rgba(200,175,90,.18)',fontStyle:'italic',letterSpacing:1,padding:'4px 2px'}}>
            The page is open. The ink waits...
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:3}}>
            {recent.map((e,i)=>{
              const t=et[e.type]||{icon:'·',color:'#a09060',bg:'rgba(200,160,60,.05)',label:'—'};
              const isNewest=i===recent.length-1;
              return(
                <div key={e.id} style={{
                  display:'flex',alignItems:'center',gap:6,
                  padding:'3px 6px',borderRadius:4,
                  background:isNewest?t.bg:'transparent',
                  border:isNewest?`1px solid ${t.color}18`:'1px solid transparent',
                  opacity:isNewest?1:0.3+(i/recent.length)*0.5,
                  animation:isNewest?'cgEntry .4s ease both':'none',
                  transition:'opacity .6s',
                }}>
                  <span style={{fontSize:9,color:t.color,flexShrink:0,filter:isNewest?`drop-shadow(0 0 3px ${t.color})`:'none'}}>{t.icon}</span>
                  <div style={{flex:1,minWidth:0,display:'flex',alignItems:'center',justifyContent:'space-between',gap:4}}>
                    <span style={{fontSize:8,color:t.color,fontFamily:"'Cinzel',serif",letterSpacing:.5,fontWeight:isNewest?700:400}}>{t.label}</span>
                    <span style={{fontSize:7,color:'rgba(200,175,90,.3)',whiteSpace:'nowrap'}}>sq {e.sq}</span>
                    <span style={{fontSize:7,color:'rgba(200,160,90,.4)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:70,fontStyle:'italic'}}>{e.detail}</span>
                  </div>
                  {/* Ink-weight bar */}
                  <div style={{width:2,height:12,borderRadius:1,background:t.color,opacity:isNewest?.6:.2,flexShrink:0}}/>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ✨ MOKSHA SCREEN — Full-screen canvas ascension cinematic
//    Winner's soul ascends through all three realms to Swarga.
//    2000 golden particles, lotus bloom, Chitragupta seals the ledger.
// ══════════════════════════════════════════════════════════════════════
