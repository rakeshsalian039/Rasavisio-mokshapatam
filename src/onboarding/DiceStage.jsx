// ───────────────────────────────────────────────────────────────────────────
// onboarding/DiceStage.jsx
// ───────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { GRAHA, GRAHA_NARRATE_TIMING } from '../shared/constants.js';

export default function DiceStage({ GRAHA_INFO, chosenLang, isNarrating, narrateStartedAt }) {
  const [karmaDie, setKarmaDie] = useState(4);
  const [grahaIdx, setGrahaIdx] = useState(-1); // -1 = intro (no planet)
  const [showEffect, setShowEffect] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [narrateStep, setNarrateStep] = useState(0);
  const narrateRef = useRef(null);
  const idleRef = useRef(null);

  // ── Narration-sync mode ──────────────────────────────────────────────
  const startNarrateSequence = () => {
    let step = 0;
    setGrahaIdx(GRAHA_NARRATE_TIMING[0][0]);
    setShowEffect(GRAHA_NARRATE_TIMING[0][0] >= 0);
    setNarrateStep(0);

    const advance = () => {
      step++;
      if (step >= GRAHA_NARRATE_TIMING.length) {
        // Loop from Surya again
        step = 1;
      }
      const [gi, dur] = GRAHA_NARRATE_TIMING[step];
      setGrahaIdx(gi);
      setShowEffect(gi >= 0);
      setNarrateStep(step);
      // Roll karma die on each new planet
      if (gi >= 0) setKarmaDie(Math.floor(Math.random() * 6) + 1);
      narrateRef.current = setTimeout(advance, dur);
    };

    narrateRef.current = setTimeout(advance, GRAHA_NARRATE_TIMING[0][1]);
  };

  // ── Idle / manual mode ───────────────────────────────────────────────
  const handleRoll = () => {
    if (isNarrating) return; // don't let manual roll interrupt narration sync
    clearTimeout(idleRef.current);
    setRolling(true);
    setShowEffect(false);
    setTimeout(() => {
      setKarmaDie(Math.floor(Math.random() * 6) + 1);
      setGrahaIdx(g => (g + 1) % 9);
      setRolling(false);
      setTimeout(() => setShowEffect(true), 150);
    }, 440);
    // Resume idle after 6s
    idleRef.current = setTimeout(() => {
      idleRef.current = setInterval(() => {
        setKarmaDie(Math.floor(Math.random() * 6) + 1);
        setGrahaIdx(g => (g + 1) % 9);
        setShowEffect(true);
      }, 3500);
    }, 6000);
  };

  useEffect(() => {
    clearTimeout(narrateRef.current);
    clearInterval(narrateRef.current);
    clearTimeout(idleRef.current);
    clearInterval(idleRef.current);

    if (isNarrating && narrateStartedAt) {
      // Audio just started — begin graha sync sequence NOW
      startNarrateSequence();
    } else if (!isNarrating) {
      // Idle auto-cycle every 3.5s
      setGrahaIdx(0); setShowEffect(true);
      idleRef.current = setInterval(() => {
        setKarmaDie(Math.floor(Math.random() * 6) + 1);
        setGrahaIdx(g => (g + 1) % 9);
        setShowEffect(true);
      }, 3500);
    }
    // if isNarrating but narrateStartedAt is null → loading, don't start yet

    return () => {
      clearTimeout(narrateRef.current);
      clearInterval(narrateRef.current);
      clearTimeout(idleRef.current);
      clearInterval(idleRef.current);
    };
  }, [isNarrating, narrateStartedAt]);

  const DIE_DOTS = {
    1: [[50,50]],
    2: [[28,28],[72,72]],
    3: [[28,28],[50,50],[72,72]],
    4: [[28,28],[72,28],[28,72],[72,72]],
    5: [[28,28],[72,28],[50,50],[28,72],[72,72]],
    6: [[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]],
  };

  const g = grahaIdx >= 0 ? GRAHA_INFO[grahaIdx] : null;
  const typeColor = !g ? '#8a7a50' : g.type==='blessing'?'#80c080':g.type==='curse'?'#e06030':'#b0a0d0';
  const typeBg    = !g ? 'transparent' : g.type==='blessing'?'rgba(80,200,80,.1)':g.type==='curse'?'rgba(200,80,40,.1)':'rgba(160,120,200,.1)';
  const typeLabel = !g ? '' : g.type==='blessing'?'✦ Blessing':g.type==='curse'?'✦ Curse':'✦ Chaos';
  const grahaColor = g ? g.color : 'rgba(200,160,60,.2)';

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,userSelect:'none'}}>
      {/* Tap hint */}
      <div style={{fontSize:9,letterSpacing:4,color:'#5a4a30',cursor:isNarrating?'default':'pointer'}}
        onClick={handleRoll}>
        {isNarrating ? 'NARRATION SYNC ACTIVE' : 'TAP TO ROLL'}
      </div>

      {/* Dice row */}
      <div style={{display:'flex',gap:24,alignItems:'center',justifyContent:'center'}}>

        {/* ── Karma Die ── */}
        <div onClick={handleRoll} style={{cursor:isNarrating?'default':'pointer',
          transition:'transform .2s',transform:rolling?'scale(.88) rotate(18deg)':'scale(1)'}}>
          <svg width={72} height={72} viewBox="0 0 100 100"
            style={{filter:'drop-shadow(0 4px 16px rgba(240,200,80,.2))'}}>
            <defs>
              <linearGradient id="df2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(42,34,16,.97)"/>
                <stop offset="100%" stopColor="rgba(22,16,6,.99)"/>
              </linearGradient>
            </defs>
            <rect x={3} y={3} width={94} height={94} rx={18} fill="url(#df2)"
              stroke="rgba(240,200,80,.35)" strokeWidth={2}/>
            <rect x={9} y={5} width={82} height={18} rx={8} fill="rgba(255,255,255,.04)"/>
            {(DIE_DOTS[karmaDie]||[]).map(([cx,cy],i)=>(
              <circle key={i} cx={cx} cy={cy} r={7.5} fill="#f0d050"
                style={{filter:'drop-shadow(0 0 5px rgba(240,200,80,.7))'}}/>
            ))}
          </svg>
          <div style={{textAlign:'center',fontSize:8,color:'rgba(240,200,80,.45)',letterSpacing:2,marginTop:4}}>KARMA</div>
        </div>

        {/* Plus */}
        <div style={{fontSize:20,color:'rgba(200,160,60,.18)',fontWeight:700}}>+</div>

        {/* ── Graha Die ── */}
        <div onClick={handleRoll} style={{cursor:isNarrating?'default':'pointer',
          transition:'transform .2s',transform:rolling?'scale(.88) rotate(-18deg)':'scale(1)'}}>
          <div style={{
            width:72,height:72,
            background: g
              ? `radial-gradient(circle at 35% 35%,${g.color}35,rgba(10,8,5,.96))`
              : 'radial-gradient(circle at 35% 35%,rgba(200,160,60,.08),rgba(10,8,5,.96))',
            border:`2.5px solid ${grahaColor}60`,
            borderRadius:16,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:34,
            boxShadow: g
              ? `0 0 28px ${g.color}35,inset 0 0 24px rgba(0,0,0,.5),0 0 0 1px ${g.color}20`
              : 'inset 0 0 20px rgba(0,0,0,.4)',
            transition:'all .5s cubic-bezier(.4,0,.2,1)',
            position:'relative',overflow:'hidden',
          }}>
            {/* Spinning orbit ring — only when a planet is active */}
            {g && <div style={{
              position:'absolute',inset:-6,
              border:`1.5px solid ${g.color}30`,
              borderRadius:'50%',
              animation:'cymaticRotate 3s linear infinite',
            }}/>}
            {/* Planet icon with entrance anim */}
            <span key={grahaIdx} style={{
              position:'relative',zIndex:1,
              animation: g ? 'fadeIn .4s ease' : 'none',
              fontSize: g ? 34 : 20,
            }}>
              {g ? g.icon : '🌌'}
            </span>
          </div>
          <div style={{textAlign:'center',fontSize:8,color:`${grahaColor}80`,letterSpacing:2,marginTop:4,transition:'color .5s'}}>
            {g ? g.skt : 'GRAHA'}
          </div>
        </div>
      </div>

      {/* ── Planet 9-dot selector (only in idle) ── */}
      {!isNarrating && (
        <div style={{display:'flex',justifyContent:'center',gap:5,flexWrap:'wrap',maxWidth:280}}>
          {GRAHA_INFO.map((gi,i)=>(
            <div key={i}
              onClick={()=>{setGrahaIdx(i);setShowEffect(true);setKarmaDie(Math.floor(Math.random()*6)+1)}}
              title={gi.name}
              style={{
                width:i===grahaIdx?28:18,height:18,borderRadius:9,
                background:i===grahaIdx?gi.color:`${gi.color}28`,
                cursor:'pointer',transition:'all .3s',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:9,
              }}>
              {i===grahaIdx?gi.icon:''}
            </div>
          ))}
        </div>
      )}

      {/* ── Effect card ── */}
      <div style={{
        width:'100%',maxWidth:300,
        background: showEffect && g ? `${g.color}0e` : 'transparent',
        border: showEffect && g ? `1px solid ${g.color}40` : '1px solid transparent',
        borderRadius:12,
        padding: showEffect && g ? '14px 16px' : '0 16px',
        transition:'all .55s cubic-bezier(.34,1.56,.64,1)',
        opacity: showEffect && g ? 1 : 0,
        transform: showEffect && g ? 'translateY(0) scale(1)' : 'translateY(10px) scale(.97)',
        textAlign:'center',
        boxShadow: showEffect && g ? `0 0 32px ${g.color}15` : 'none',
        overflow:'hidden',
        maxHeight: showEffect && g ? 140 : 0,
      }}>
        {g && <>
          <div style={{fontSize:13,fontFamily:"'Noto Serif Devanagari',serif",color:g.color,fontWeight:700}}>
            {g.skt} &nbsp;·&nbsp;
            <span style={{fontFamily:"'Cinzel',serif",fontSize:11,opacity:.85}}>
              {g.name.replace(' — ','').replace(g.skt,'').trim()}
            </span>
          </div>
          <div style={{fontSize:11,color:'#c0b080',marginTop:6,lineHeight:1.7}}>{g.effect}</div>
          <div style={{marginTop:8}}>
            <span style={{fontSize:9,padding:'2px 10px',borderRadius:10,background:typeBg,color:typeColor,border:`1px solid ${typeColor}30`}}>
              {typeLabel}
            </span>
          </div>
        </>}
      </div>

      {/* Move summary */}
      {showEffect && g && (
        <div style={{fontSize:10,color:'rgba(240,200,80,.35)',letterSpacing:1,animation:'fadeIn .5s ease',textAlign:'center'}}>
          Roll <strong style={{color:'#f0d050'}}>{karmaDie}</strong> square{karmaDie!==1?'s':''} &nbsp;+&nbsp; {g.icon} {g.name.split('—')[0].trim()} effect
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DHARMA STAGE — cinematic moral choice experience
// Shows: the dilemma → player chooses → consequence plays out visually
// The balance scale animates, token moves, karma shifts in real time
// ═══════════════════════════════════════════════════════════════════════
