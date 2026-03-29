// ───────────────────────────────────────────────────────────────────────────
// onboarding/DharmaStage.jsx
// ───────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { DILEMMAS } from '../shared/constants.js';

export default function DharmaStage() {
  const CARDS=[
    {skt:"कर्णकवच",en:"Karna's Armour",era:"Mahabharata",
     story:"The god Indra disguises as a beggar. He begs Karna for his divine armour — the one that makes him invincible. Karna knew it was Indra. Knew it meant death. He gave it away with a smile.",
     punya:{l:"🙏 Give the armour",sub:"Honour above survival",karma:4,sq:-5,color:"#80c080"},
     papa:{l:"💀 Keep the armour",sub:"Survival above honour",karma:3,sq:8,color:"#e06030"}},
    {skt:"द्रौपदीवस्त्र",en:"Draupadi's Shame",era:"Mahabharata",
     story:"In the royal court, Dushasana drags Draupadi by her hair. Bhishma, Drona, every elder — silent. Speaking costs you exile. Silence costs your soul.",
     punya:{l:"🙏 Speak against the king",sub:"Exile for righteousness",karma:4,sq:-8,color:"#80c080"},
     papa:{l:"💀 Stay silent",sub:"Complicit in adharma",karma:3,sq:6,color:"#e06030"}},
    {skt:"कर्मचारी",en:"The Whistleblower",era:"Modern Life",
     story:"Your company dumps toxins in a river. Children are sick. You have proof. If you leak it — you lose your job, your parents lose support. If you stay silent — the poisoning continues.",
     punya:{l:"🙏 Blow the whistle",sub:"Truth at personal cost",karma:5,sq:0,color:"#80c080"},
     papa:{l:"💀 Stay silent",sub:"Protect your family",karma:4,sq:10,color:"#e06030"}},
    {skt:"एकलव्य",en:"Eklavya's Thumb",era:"Mahabharata",
     story:"Dronacharya demands your right thumb as payment for the archery you taught yourself. Giving it destroys your greatest skill. But to refuse is to deny your guru.",
     punya:{l:"🙏 Give the thumb",sub:"Devotion above all",karma:4,sq:-5,color:"#80c080"},
     papa:{l:"💀 Refuse the guru",sub:"Keep your power",karma:3,sq:7,color:"#e06030"}},
  ];

  const [cardIdx,setCardIdx]=useState(0);
  const [phase,setPhase]=useState('reveal'); // reveal → question → chosen → consequence → next
  const [chosen,setChosen]=useState(null);
  const [tokenSq,setTokenSq]=useState(28);
  const [punya,setPunya]=useState(8);
  const [papa,setPapa]=useState(4);
  const [shake,setShake]=useState(false);
  const [glowSide,setGlowSide]=useState(null); // 'punya'|'papa'
  const timerRef=useRef(null);

  const card=CARDS[cardIdx];

  // Auto-reveal on mount and card change
  useEffect(()=>{
    setPhase('reveal');
    const t=setTimeout(()=>setPhase('question'),1200);
    return()=>clearTimeout(t);
  },[cardIdx]);

  const choose=(side)=>{
    if(phase!=='question')return;
    const c=card[side];
    setChosen(side);
    setGlowSide(side);
    setPhase('chosen');

    // Animate consequence
    setTimeout(()=>{
      setPhase('consequence');
      setShake(true);
      setTimeout(()=>setShake(false),600);
      setTokenSq(sq=>Math.max(1,Math.min(99,sq+c.sq)));
      if(side==='punya') setPunya(p=>Math.min(30,p+c.karma));
      else setPapa(p=>Math.min(30,p+c.karma));
    },800);

    // Auto-advance to next card
    setTimeout(()=>{
      setChosen(null);setGlowSide(null);
      setCardIdx(i=>(i+1)%CARDS.length);
    },3800);

    return()=>clearTimeout(timerRef.current);
  };

  const total=Math.max(punya+papa,1);
  const punyaPct=(punya/total)*100;
  const isPure=punya>=papa;
  const realmOf=n=>n<=33?{name:'भूलोक',c:'#8a6030'}:n<=66?{name:'अन्तर्लोक',c:'#5a80a0'}:{name:'स्वर्गलोक',c:'#9070c0'};
  const realm=realmOf(tokenSq);

  return(
    <div style={{display:'flex',flexDirection:'column',gap:14,width:'100%'}}>

      {/* ── TOP: Karma scale + token position ── */}
      <div style={{
        display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:10,
        background:'rgba(8,6,3,.7)',border:'1px solid rgba(200,160,60,.1)',
        borderRadius:12,padding:'14px 16px',alignItems:'center',
      }}>
        {/* Punya side */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:9,letterSpacing:3,color:'#f0d050',marginBottom:6,fontFamily:"'Cinzel',serif"}}>पुण्य</div>
          <div style={{fontSize:28,fontWeight:900,color:'#f0d050',fontFamily:"'Cinzel',serif",
            transition:'all .8s cubic-bezier(.34,1.56,.64,1)',
            textShadow:glowSide==='punya'?'0 0 20px #f0d050,0 0 40px rgba(240,200,80,.6)':'none'}}>{punya}</div>
          <div style={{height:4,background:'rgba(200,160,60,.1)',borderRadius:2,overflow:'hidden',marginTop:6}}>
            <div style={{height:'100%',background:'linear-gradient(90deg,#f0d050,#80c080)',borderRadius:2,width:`${punyaPct}%`,transition:'width .8s cubic-bezier(.4,0,.2,1)'}}/>
          </div>
        </div>

        {/* Balance scale SVG */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
          <svg width={48} height={56} viewBox="0 0 48 56">
            {/* Fulcrum */}
            <line x1={24} y1={8} x2={24} y2={48} stroke="rgba(200,160,60,.4)" strokeWidth={1.5}/>
            <polygon points="18,48 30,48 24,52" fill="rgba(200,160,60,.35)"/>
            {/* Beam — tilts based on balance */}
            <line
              x1={4} y1={isPure?12:16} x2={44} y2={isPure?16:12}
              stroke={isPure?"#80c080":"#e06030"} strokeWidth={2}
              style={{transition:'all .8s cubic-bezier(.4,0,.2,1)'}}/>
            {/* Left pan (punya) */}
            <ellipse cx={4} cy={isPure?16:20} rx={6} ry={2} fill="rgba(80,200,80,.25)" stroke="#80c080" strokeWidth={.8}
              style={{transition:'all .8s'}}/>
            {/* Right pan (papa) */}
            <ellipse cx={44} cy={isPure?20:16} rx={6} ry={2} fill="rgba(200,80,60,.2)" stroke="#e06030" strokeWidth={.8}
              style={{transition:'all .8s'}}/>
          </svg>
          <div style={{fontSize:8,letterSpacing:2,color:isPure?'#80c080':'#e06030',textAlign:'center',transition:'color .5s'}}>
            {isPure?'PURE':'IMPURE'}
          </div>
        </div>

        {/* Papa side */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:9,letterSpacing:3,color:'#e06030',marginBottom:6,fontFamily:"'Cinzel',serif"}}>पाप</div>
          <div style={{fontSize:28,fontWeight:900,color:'#e06030',fontFamily:"'Cinzel',serif",
            transition:'all .8s cubic-bezier(.34,1.56,.64,1)',
            textShadow:glowSide==='papa'?'0 0 20px #e06030,0 0 40px rgba(200,80,40,.6)':'none'}}>{papa}</div>
          <div style={{height:4,background:'rgba(200,80,60,.1)',borderRadius:2,overflow:'hidden',marginTop:6}}>
            <div style={{height:'100%',background:'linear-gradient(90deg,#e06030,#a03020)',borderRadius:2,width:`${100-punyaPct}%`,transition:'width .8s cubic-bezier(.4,0,.2,1)'}}/>
          </div>
        </div>
      </div>

      {/* Token position strip */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 14px',background:'rgba(8,6,3,.5)',border:'1px solid rgba(200,160,60,.08)',borderRadius:8}}>
        {/* Mini progress bar */}
        <div style={{flex:1,height:6,background:'rgba(200,160,60,.08)',borderRadius:3,overflow:'visible',position:'relative'}}>
          <div style={{
            position:'absolute',left:0,top:0,height:'100%',
            width:`${(tokenSq/100)*100}%`,
            background:`linear-gradient(90deg,${realm.c}60,${realm.c})`,
            borderRadius:3,transition:'width 1s cubic-bezier(.34,1.56,.64,1)',
          }}/>
          {/* Token dot */}
          <div style={{
            position:'absolute',top:'50%',transform:'translate(-50%,-50%)',
            left:`${(tokenSq/100)*100}%`,
            width:14,height:14,borderRadius:'50%',
            background:`radial-gradient(circle at 35% 30%,${realm.c},${realm.c}50)`,
            border:`2px solid ${realm.c}`,
            boxShadow:`0 0 8px ${realm.c}80`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:7,transition:'left 1s cubic-bezier(.34,1.56,.64,1)',
            animation:shake?'diceRoll .5s ease':'none',
          }}>🔱</div>
        </div>
        <div style={{fontSize:9,color:realm.c,letterSpacing:2,whiteSpace:'nowrap',minWidth:80,textAlign:'right',transition:'color .5s'}}>
          Sq {tokenSq} · {realm.name}
        </div>
      </div>

      {/* ── DILEMMA CARD ── */}
      <div style={{
        background:'rgba(160,200,224,.04)',
        border:`1.5px solid ${phase==='reveal'?'rgba(160,200,224,.1)':'rgba(160,200,224,.22)'}`,
        borderRadius:12,overflow:'hidden',
        transition:'all .5s',
        boxShadow:phase==='question'?'0 0 40px rgba(160,200,224,.06)':'none',
      }}>
        {/* Card header */}
        <div style={{padding:'14px 16px 10px',borderBottom:'1px solid rgba(160,200,224,.08)',
          background:'rgba(160,200,224,.03)'}}>
          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:6}}>
            <span style={{fontSize:20}}>⚖</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontFamily:"'Noto Serif Devanagari',serif",color:'#a0c8e0',fontWeight:700}}>{card.skt}</div>
              <div style={{fontSize:10,color:'#5a7080',letterSpacing:2}}>{card.en} · {card.era}</div>
            </div>
            <div style={{fontSize:8,padding:'2px 8px',borderRadius:10,background:'rgba(160,200,224,.06)',
              border:'1px solid rgba(160,200,224,.12)',color:'#5a7080',letterSpacing:2}}>
              {cardIdx+1}/{CARDS.length}
            </div>
          </div>
          <div style={{
            fontSize:11,color:'#c0b080',lineHeight:1.8,fontStyle:'italic',
            opacity:phase==='reveal'?0:1,transition:'opacity .6s',
          }}>
            {card.story}
          </div>
        </div>

        {/* Choices */}
        <div style={{padding:'12px 14px',display:'flex',gap:10,flexWrap:'wrap'}}>
          {/* Punya choice */}
          <button
            disabled={phase!=='question'}
            onClick={()=>choose('punya')}
            style={{
              flex:'1 1 140px',
              background:chosen==='punya'?'rgba(80,200,80,.15)':phase==='consequence'&&chosen!=='punya'?'rgba(10,8,5,.3)':'rgba(80,200,80,.05)',
              border:`1.5px solid ${chosen==='punya'?'rgba(80,200,80,.5)':'rgba(80,200,80,.18)'}`,
              borderRadius:10,padding:'12px 12px',cursor:phase==='question'?'pointer':'default',
              textAlign:'center',transition:'all .4s cubic-bezier(.34,1.56,.64,1)',
              transform:chosen==='punya'?'scale(1.03)':'scale(1)',
              opacity:phase==='consequence'&&chosen!=='punya'?0.35:1,
              boxShadow:chosen==='punya'?'0 0 20px rgba(80,200,80,.15)':'none',
            }}
            onMouseEnter={e=>{if(phase==='question'){e.currentTarget.style.background='rgba(80,200,80,.12)';e.currentTarget.style.transform='translateY(-2px) scale(1.01)'}}}
            onMouseLeave={e=>{if(phase==='question'){e.currentTarget.style.background='rgba(80,200,80,.05)';e.currentTarget.style.transform='scale(1)'}}}
          >
            <div style={{fontSize:11,color:'#80c080',fontWeight:700,fontFamily:"'Cinzel',serif",marginBottom:4}}>{card.punya.l}</div>
            <div style={{fontSize:9,color:'#5a8060',letterSpacing:1}}>{card.punya.sub}</div>
            <div style={{fontSize:9,color:'rgba(80,200,80,.6)',marginTop:6,letterSpacing:1}}>+{card.punya.karma} Punya · {card.punya.sq<0?`Back ${Math.abs(card.punya.sq)}`:'Skip'} sq</div>
          </button>

          {/* Papa choice */}
          <button
            disabled={phase!=='question'}
            onClick={()=>choose('papa')}
            style={{
              flex:'1 1 140px',
              background:chosen==='papa'?'rgba(200,80,40,.15)':phase==='consequence'&&chosen!=='papa'?'rgba(10,8,5,.3)':'rgba(200,80,40,.05)',
              border:`1.5px solid ${chosen==='papa'?'rgba(200,80,40,.5)':'rgba(200,80,40,.18)'}`,
              borderRadius:10,padding:'12px 12px',cursor:phase==='question'?'pointer':'default',
              textAlign:'center',transition:'all .4s cubic-bezier(.34,1.56,.64,1)',
              transform:chosen==='papa'?'scale(1.03)':'scale(1)',
              opacity:phase==='consequence'&&chosen!=='papa'?0.35:1,
              boxShadow:chosen==='papa'?'0 0 20px rgba(200,80,40,.15)':'none',
            }}
            onMouseEnter={e=>{if(phase==='question'){e.currentTarget.style.background='rgba(200,80,40,.12)';e.currentTarget.style.transform='translateY(-2px) scale(1.01)'}}}
            onMouseLeave={e=>{if(phase==='question'){e.currentTarget.style.background='rgba(200,80,40,.05)';e.currentTarget.style.transform='scale(1)'}}}
          >
            <div style={{fontSize:11,color:'#e06030',fontWeight:700,fontFamily:"'Cinzel',serif",marginBottom:4}}>{card.papa.l}</div>
            <div style={{fontSize:9,color:'#80503a',letterSpacing:1}}>{card.papa.sub}</div>
            <div style={{fontSize:9,color:'rgba(200,80,40,.6)',marginTop:6,letterSpacing:1}}>+{card.papa.karma} Papa · Advance {card.papa.sq} sq</div>
          </button>
        </div>

        {/* Consequence reveal */}
        {phase==='consequence'&&chosen&&(
          <div style={{
            margin:'0 14px 14px',padding:'12px',
            background:chosen==='punya'?'rgba(80,200,80,.06)':'rgba(200,80,40,.06)',
            border:`1px solid ${chosen==='punya'?'rgba(80,200,80,.2)':'rgba(200,80,40,.2)'}`,
            borderRadius:8,animation:'fadeIn .4s ease',textAlign:'center',
          }}>
            <div style={{fontSize:16,marginBottom:4}}>{chosen==='punya'?'🙏':'💀'}</div>
            <div style={{fontSize:12,color:chosen==='punya'?'#80c080':'#e06030',fontWeight:700,letterSpacing:1}}>
              {chosen==='punya'?`+${card.punya.karma} Punya · ${card.punya.sq<0?`Back ${Math.abs(card.punya.sq)} squares`:'Turn skipped'}`:`+${card.papa.karma} Papa · Advance ${card.papa.sq} squares`}
            </div>
            <div style={{fontSize:9,color:'#5a4a30',marginTop:4,letterSpacing:2}}>
              {chosen==='punya'?'DHARMIC PATH CHOSEN':'ADHARMIC PATH CHOSEN'}
            </div>
          </div>
        )}
      </div>

      {/* Moksha gate status */}
      <div style={{
        textAlign:'center',padding:'8px',
        background:isPure?'rgba(80,200,80,.04)':'rgba(200,80,40,.04)',
        border:`1px solid ${isPure?'rgba(80,200,80,.12)':'rgba(200,80,40,.12)'}`,
        borderRadius:8,transition:'all .5s',
      }}>
        <div style={{fontSize:10,color:isPure?'#80c080':'#e06030',letterSpacing:2,fontFamily:"'Cinzel',serif"}}>
          {isPure?`✓ Moksha Gate OPEN — Punya (${punya}) ≥ Papa (${papa})`:`✗ Moksha Gate CLOSED — Papa (${papa}) > Punya (${punya})`}
        </div>
        {!isPure&&<div style={{fontSize:9,color:'#5a4a30',marginTop:3,letterSpacing:1}}>If you reach sq 108 like this, Yama casts you back to square 67</div>}
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SACRED PATH STAGE — cinematic Ashtanga gate ascension
// ═══════════════════════════════════════════════════════════════════════
