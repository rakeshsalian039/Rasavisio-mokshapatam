// ───────────────────────────────────────────────────────────────────────────
// onboarding/SacredPathStage.jsx
// ───────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { SACRED_PATH } from '../shared/constants.js';

export default function SacredPathStage({SACRED_PATH}) {
  const [active,setActive]=useState(0);
  const [entering,setEntering]=useState(false);
  const timerRef=useRef(null);

  useEffect(()=>{
    timerRef.current=setInterval(()=>{
      setEntering(true);
      setTimeout(()=>{
        setActive(a=>(a+1)%8);
        setEntering(false);
      },300);
    },2600);
    return()=>clearInterval(timerRef.current);
  },[]);

  const sq=SACRED_PATH[active];
  const isMoksha=sq.num===108;
  const STEP_COLORS=['#a0c8e0','#f0b840','#80c0a0','#c0a0e0','#e0c080','#d0a0c0','#90c0b0','#f0d050'];
  const sc=STEP_COLORS[active];

  const RIDGE_DESCS=[
    "The first gate. Restrain the senses. Still the mind. Without Yama, no gate opens.",
    "Daily practice. Sacred rituals. Without Niyama, discipline dissolves.",
    "The body as temple. Perfect stillness. Without Asana, the mind cannot settle.",
    "Breath is the bridge. Expand the life-force. Pranayama opens every other gate.",
    "Withdraw the senses. Turn the gaze inward. Without Pratyahara, distractions rule.",
    "Single-pointed focus. The laser of consciousness. Dharana burns through illusion.",
    "The stream flows unbroken. Thought dissolves into awareness. Dhyana is the door.",
    "The wheel of Samsara stops. You are free. Moksha — the only goal.",
  ];

  return(
    <div style={{display:'flex',flexDirection:'column',gap:12,width:'100%'}}>

      {/* Gate path — horizontal scroll of 8 gates */}
      <div style={{position:'relative',padding:'8px 4px 4px'}}>
        {/* Connecting path line */}
        <div style={{
          position:'absolute',top:'50%',left:16,right:16,height:2,
          background:'linear-gradient(90deg,rgba(200,160,60,.08),rgba(200,160,60,.15),rgba(200,160,60,.08))',
          zIndex:0,
        }}/>
        <div style={{display:'flex',gap:4,position:'relative',zIndex:1}}>
          {SACRED_PATH.slice(0,8).map((s,i)=>{
            const isAct=i===active;
            const isDone=i<active;
            const c=STEP_COLORS[i];
            return(
              <div key={i}
                onClick={()=>{clearInterval(timerRef.current);setActive(i)}}
                style={{
                  flex:isAct?'0 0 auto':'1',
                  display:'flex',flexDirection:'column',alignItems:'center',gap:2,
                  cursor:'pointer',
                  padding:isAct?'8px 10px':'6px 4px',
                  background:isAct?`${c}15`:isDone?'rgba(200,160,60,.04)':'transparent',
                  border:`1px solid ${isAct?`${c}50`:isDone?`${c}18`:'transparent'}`,
                  borderRadius:10,
                  transition:'all .4s cubic-bezier(.34,1.56,.64,1)',
                  boxShadow:isAct?`0 0 16px ${c}20`:'none',
                }}>
                <div style={{
                  fontSize:isAct?22:14,
                  filter:isAct?`drop-shadow(0 0 6px ${c})`:'none',
                  opacity:isAct?1:isDone?0.7:0.3,
                  transition:'all .4s',
                }}>{s.icon}</div>
                {isAct&&<div style={{fontSize:7,color:c,fontFamily:"'Cinzel',serif",letterSpacing:1,whiteSpace:'nowrap',fontWeight:700}}>
                  {s.en}
                </div>}
                {isDone&&!isAct&&<div style={{width:6,height:2,borderRadius:1,background:`${c}50`}}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main gate card */}
      <div style={{
        background:`radial-gradient(ellipse at 50% 0%,${sc}10,rgba(8,6,3,.7) 60%)`,
        border:`2px solid ${sc}30`,borderRadius:16,
        padding:'24px 20px',textAlign:'center',
        transition:'border-color .5s,box-shadow .5s',
        boxShadow:`0 0 40px ${sc}10,inset 0 0 40px rgba(0,0,0,.3)`,
        position:'relative',overflow:'hidden',
        opacity:entering?0:1,
        transform:entering?'translateY(8px)':'translateY(0)',
        transition:'opacity .3s ease,transform .3s ease,border-color .5s,box-shadow .5s',
      }}>
        {/* Background mandala */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:.04}} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          <circle cx={100} cy={60} r={50} fill="none" stroke={sc} strokeWidth={.8}/>
          <circle cx={100} cy={60} r={35} fill="none" stroke={sc} strokeWidth={.6}/>
          <circle cx={100} cy={60} r={20} fill="none" stroke={sc} strokeWidth={.5}/>
          {[0,45,90,135,180,225,270,315].map(a=>(
            <line key={a}
              x1={100+50*Math.cos(a*Math.PI/180)} y1={60+50*Math.sin(a*Math.PI/180)}
              x2={100+20*Math.cos(a*Math.PI/180)} y2={60+20*Math.sin(a*Math.PI/180)}
              stroke={sc} strokeWidth={.4}/>
          ))}
        </svg>

        {/* Gate number */}
        <div style={{fontSize:8,letterSpacing:5,color:sc,opacity:.5,marginBottom:8,fontFamily:"'Cinzel',serif"}}>
          GATE {active+1} OF 8 &nbsp;·&nbsp; SQUARE {sq.num}
        </div>

        {/* Icon */}
        <div style={{
          fontSize:48,marginBottom:12,
          filter:`drop-shadow(0 0 16px ${sc}) drop-shadow(0 0 32px ${sc}50)`,
          animation:'pulse 2.5s ease infinite',
        }}>{sq.icon}</div>

        {/* Names */}
        <div style={{fontSize:24,fontFamily:"'Noto Serif Devanagari',serif",color:sc,fontWeight:700,marginBottom:4,
          textShadow:`0 0 20px ${sc}50`}}>{sq.skt}</div>
        <div style={{fontSize:16,color:'#e8c850',fontFamily:"'Cinzel',serif",letterSpacing:4,marginBottom:12}}>{sq.en}</div>
        <div style={{fontSize:11,color:'#8a7a50',letterSpacing:1,fontStyle:'italic',lineHeight:1.7,maxWidth:360,margin:'0 auto'}}>
          {RIDGE_DESCS[active]}
        </div>

        {/* Special badges */}
        {sq.num===107&&(
          <div style={{
            marginTop:14,display:'inline-flex',alignItems:'center',gap:8,
            padding:'6px 14px',borderRadius:20,
            background:'rgba(240,180,60,.08)',border:'1px solid rgba(240,180,60,.25)',
          }}>
            <span style={{fontSize:14}}>🚪</span>
            <span style={{fontSize:9,color:'#f0b840',letterSpacing:2}}>ROLL EXACT 1 TO ENTER MOKSHA</span>
          </div>
        )}
        {isMoksha&&(
          <div style={{marginTop:14}}>
            <div style={{fontSize:36,animation:'mp 3s ease infinite',color:'#f0d050',
              filter:'drop-shadow(0 0 20px rgba(240,200,80,.8))'}}>ॐ</div>
            <div style={{fontSize:10,letterSpacing:4,color:'rgba(240,200,80,.5)',marginTop:4}}>LIBERATION · MOKSHA · मोक्ष</div>
          </div>
        )}
      </div>

      {/* Step progress dots */}
      <div style={{display:'flex',gap:6,justifyContent:'center',alignItems:'center'}}>
        {SACRED_PATH.slice(0,8).map((_,i)=>(
          <div key={i}
            onClick={()=>{clearInterval(timerRef.current);setActive(i)}}
            style={{
              width:i===active?28:8,height:8,borderRadius:4,cursor:'pointer',
              background:i===active?STEP_COLORS[i]:i<active?`${STEP_COLORS[i]}50`:'rgba(200,160,60,.08)',
              boxShadow:i===active?`0 0 8px ${STEP_COLORS[i]}80`:'none',
              transition:'all .4s cubic-bezier(.34,1.56,.64,1)',
          }}/>
        ))}
      </div>

      {/* Navagraha reminder */}
      <div style={{
        textAlign:'center',padding:'8px 14px',
        background:'rgba(240,200,80,.03)',border:'1px solid rgba(240,200,80,.08)',borderRadius:8,
      }}>
        <div style={{fontSize:9,color:'rgba(240,200,80,.4)',letterSpacing:2}}>
          🌌 On the Sacred Path — no Navagraha effects · no swaps · no pushes · beyond the material world
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA'S AGRASANDHANI — The Living Cosmic Ledger
//    Real-time balance scale + quill-written entries + soul purity ring
// ══════════════════════════════════════════════════════════════════════
