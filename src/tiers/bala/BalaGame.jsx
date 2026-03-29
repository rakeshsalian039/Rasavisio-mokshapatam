// ─────────────────────────────────────────────────────────────────────────────
// tiers/bala/BalaGame.jsx
// Bala Marg — The Children's Journey (Ages 5-10)
//
// KEY DIFFERENCES from MokshaGame:
//   · Characters: 6 animals (elephant, tiger, monkey, panda, peacock, lion)
//   · Currency: Stars ⭐ instead of Punya/Papa
//   · Win: reach square 72 OR collect 8 stars
//   · Snakes: animals who made bad choices (max drop 15 squares)
//   · Ladders: animals who were kind (max +20 squares)
//   · Dilemmas: simple yes/no moral choices
//   · No Graha dice — one friendly dice (1-6)
//   · Nani the Owl gives gentle guidance
//   · Lottie animations for celebrations
//   · Language: English + Hindi
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, useRef } from 'react';

import BalaBoard from './BalaBoard.jsx';
import {
  CHARS_BALA, SNAKES_BALA, LADDERS_BALA, DLM_SQ_BALA,

// ── Inline ambient (no external dep needed) ──────────────────────────────
function useAmbient(){
  const ref=useRef(null),playing=useRef(false);
  const start=()=>{if(playing.current)return;try{const a=new Audio('/ambient.mp3');a.loop=true;a.volume=0.6;ref.current=a;a.play().then(()=>{playing.current=true}).catch(()=>{})}catch(e){}};
  const stop=()=>{if(!playing.current||!ref.current)return;try{ref.current.pause();ref.current.currentTime=0;playing.current=false;ref.current=null}catch(e){}};
  return{start,stop,duck:()=>{},unduck:()=>{}};
}

  DILEMMAS_BALA, STAR_MESSAGES, NANI_MESSAGES,
  BALA_WIN_SQUARE, BALA_WIN_STARS,
} from './bala.constants.js';


// ── CSS for Bala Marg ─────────────────────────────────────────────────────
const BALA_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Baloo+2:wght@400;700;800&display=swap');
@keyframes balaTokenBounce{0%{transform:scale(1) translateY(0)}100%{transform:scale(1.15) translateY(-3px)}}
@keyframes balaPop{0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
@keyframes balaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes balaShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@keyframes balaStarSpin{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.3)}100%{transform:rotate(360deg) scale(1)}}
@keyframes balaGlow{0%,100%{box-shadow:0 0 0 rgba(255,200,50,0)}50%{box-shadow:0 0 20px rgba(255,200,50,.6)}}
@keyframes naniWiggle{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes diceRollAnim{0%{transform:rotate(0deg) scale(1.2)}100%{transform:rotate(720deg) scale(1)}}
.bala-btn{background:linear-gradient(135deg,#ff8c00,#ff6b00);border:none;color:white;padding:14px 32px;font-size:clamp(16px,3vw,20px);font-family:'Baloo 2',sans-serif;font-weight:800;cursor:pointer;border-radius:50px;box-shadow:0 6px 20px rgba(255,100,0,.4);transition:all .2s;letter-spacing:1px}
.bala-btn:hover{transform:scale(1.05);box-shadow:0 8px 24px rgba(255,100,0,.5)}
.bala-btn:active{transform:scale(0.97)}
.bala-btn:disabled{background:linear-gradient(135deg,#ccc,#aaa);box-shadow:none;cursor:default;transform:none}
.bala-choice{width:100%;background:white;border:3px solid transparent;border-radius:16px;padding:14px 18px;font-size:clamp(13px,2.2vw,16px);font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;text-align:left;transition:all .2s;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.bala-choice.punya{border-color:#4caf50;color:#2e7d32}
.bala-choice.punya:hover{background:#e8f5e9;transform:scale(1.02)}
.bala-choice.oops{border-color:#ff9800;color:#e65100}
.bala-choice.oops:hover{background:#fff3e0;transform:scale(1.02)}
`;

export default function BalaGame({ onExit }) {
  const ambient = useAmbient();

  // ── Game state ───────────────────────────────────────────────────────
  const [screen,    setScreen]    = useState('select');   // select | game | win
  const [players,   setPlayers]   = useState([]);
  const [nP,        setNP]        = useState(1);
  const [pos,       setPos]       = useState([1, 1, 1, 1]);
  const [stars,     setStars]     = useState([0, 0, 0, 0]);
  const [cur,       setCur]       = useState(0);
  const [win,       setWin]       = useState(null);
  const [busy,      setBusy]      = useState(false);
  const [diceVal,   setDiceVal]   = useState(null);
  const [diceAnim,  setDiceAnim]  = useState(false);
  const [eventPopup,setEventPopup]= useState(null);
  const [dilemma,   setDilemma]   = useState(null);
  const [msg,       setMsg]       = useState('');
  const [celebrating,setCelebrating]=useState(false);
  const [tempChar,  setTempChar]  = useState(-1);
  const [tempName,  setTempName]  = useState('');
  const [pidx,      setPidx]      = useState(0);
  const [chosenLang,setChosenLang]= useState('en');
  const [starMsg,   setStarMsg]   = useState('');
  const [naniMsg,   setNaniMsg]   = useState(NANI_MESSAGES.start);
  const eventCb     = useRef(null);

  const isHi = chosenLang === 'hi';

  // ── Dice roll ─────────────────────────────────────────────────────────
  const doRoll = useCallback(() => {
    if (busy || dilemma || win !== null) return;
    setBusy(true);
    setDiceAnim(true);
    setTimeout(() => {
      setDiceAnim(false);
      const r = Math.floor(Math.random() * 6) + 1;
      setDiceVal(r);
      const pName    = players[cur]?.name || 'Friend';
      const oldP     = pos[cur] || 1;
      let   newP     = Math.min(oldP + r, BALA_WIN_SQUARE);
      const nPos     = [...pos];
      const nStars   = [...stars];

      const animate = () => {
        let step = 0;
        const total = Math.abs(newP - oldP);
        const iv = setInterval(() => {
          step++;
          nPos[cur] = oldP + step;
          setPos([...nPos]);
          if (step >= total) {
            clearInterval(iv);
            checkLanding(newP, nPos, nStars, pName);
          }
        }, 220);
      };
      animate();
    }, 600);
  }, [busy, dilemma, win, cur, pos, stars, players]);

  // ── Check landing square ──────────────────────────────────────────────
  const checkLanding = (p, nPos, nStars, pName) => {
    // Snake?
    if (SNAKES_BALA[p]) {
      const sn = SNAKES_BALA[p];
      const dest = sn.to;
      setNaniMsg(NANI_MESSAGES.snake);
      showEvent({
        icon: sn.animal, type: 'snake',
        title: isHi ? `${sn.name}!` : sn.name,
        body: sn.tale,
        from: p, to: dest,
        color: '#ff5722',
      }, () => {
        nPos[cur] = dest;
        setPos([...nPos]);
        setMsg(isHi ? `${pName} को सांप ने पकड़ा! ${p} से ${dest} पर!` : `${pName} was caught! ${p} → ${dest}`);
        nextTurn(nPos, nStars);
      });
      return;
    }

    // Ladder?
    if (LADDERS_BALA[p]) {
      const ld = LADDERS_BALA[p];
      const dest = ld.to;
      nStars[cur] = Math.min(nStars[cur] + 1, BALA_WIN_STARS);
      setNaniMsg(NANI_MESSAGES.ladder);
      showEvent({
        icon: ld.animal, type: 'ladder',
        title: isHi ? ld.name : ld.name,
        body: ld.tale,
        from: p, to: dest,
        color: '#4caf50',
        star: true,
      }, () => {
        nPos[cur] = dest;
        setPos([...nPos]);
        setStars([...nStars]);
        setStarMsg(STAR_MESSAGES[Math.floor(Math.random() * STAR_MESSAGES.length)]);
        setTimeout(() => setStarMsg(''), 2500);
        setMsg(isHi ? `${pName} ऊपर चला! ${p} से ${dest} तक! ⭐` : `${pName} climbed up! ${p} → ${dest}! ⭐`);
        checkWin(nPos, nStars, p);
        nextTurn(nPos, nStars);
      });
      return;
    }

    // Dilemma?
    if (DLM_SQ_BALA.includes(p)) {
      const pool = DILEMMAS_BALA;
      const d = pool[Math.floor(Math.random() * pool.length)];
      setNaniMsg(NANI_MESSAGES.dilemma);
      setMsg(isHi ? `${pName} को एक सवाल मिला!` : `${pName} faces a question!`);
      nPos[cur] = p;
      setPos([...nPos]);
      setBusy(false);
      setDilemma({ ...d, pi: cur, pName, nPos, nStars });
      return;
    }

    // Win?
    if (p >= BALA_WIN_SQUARE) {
      nPos[cur] = BALA_WIN_SQUARE;
      setPos([...nPos]);
      setCelebrating(true);
      setWin(cur);
      setMsg('');
      setNaniMsg(NANI_MESSAGES.win);
      setTimeout(() => setScreen('win'), 1000);
      return;
    }

    nPos[cur] = p;
    setPos([...nPos]);
    setMsg(isHi ? `${pName} आगे बढ़ा! वर्ग ${p} पर!` : `${pName} moved to square ${p}!`);
    checkWin(nPos, nStars, p);
    nextTurn(nPos, nStars);
  };

  const checkWin = (nPos, nStars, p) => {
    if (nStars[cur] >= BALA_WIN_STARS || p >= BALA_WIN_SQUARE) {
      setCelebrating(true);
      setWin(cur);
      setTimeout(() => setScreen('win'), 1500);
    }
  };

  const nextTurn = (nPos, nStars) => {
    setBusy(false);
    setCur(c => (c + 1) % nP);
    setNaniMsg(NANI_MESSAGES.waiting);
  };

  // ── Dilemma resolution ────────────────────────────────────────────────
  const solveD = (choiceIdx) => {
    if (!dilemma) return;
    const ch = dilemma.c[choiceIdx];
    const { nPos, nStars, pi, pName } = dilemma;
    const isStar = ch.k === 'star';
    if (isStar && ch.fx.star) {
      nStars[pi] = Math.min(nStars[pi] + ch.fx.star, BALA_WIN_STARS);
      setStars([...nStars]);
      setStarMsg(STAR_MESSAGES[Math.floor(Math.random() * STAR_MESSAGES.length)]);
      setTimeout(() => setStarMsg(''), 2500);
    }
    if (ch.fx.move) {
      nPos[pi] = Math.max(1, Math.min((nPos[pi] || 1) + ch.fx.move, BALA_WIN_SQUARE));
      setPos([...nPos]);
    }
    setMsg(isHi ? `${pName} ने ${isStar ? 'सही' : 'अपना'} रास्ता चुना!` : `${pName} chose ${isStar ? 'kindly' : 'their own way'}!`);
    setDilemma(null);
    checkWin(nPos, nStars, nPos[pi]);
    nextTurn(nPos, nStars);
  };

  // ── Event popup ───────────────────────────────────────────────────────
  const showEvent = (popup, onDismiss) => {
    setEventPopup(popup);
    eventCb.current = onDismiss;
  };
  const dismissEvent = () => {
    setEventPopup(null);
    if (eventCb.current) { const cb = eventCb.current; eventCb.current = null; setTimeout(cb, 200); }
  };

  // ── Player setup ──────────────────────────────────────────────────────
  const addPlayer = () => {
    if (!tempName.trim() || tempChar < 0) return;
    const np = [...players, { name: tempName.trim(), char: CHARS_BALA[tempChar], charIdx: tempChar }];
    setPlayers(np);
    setTempName('');
    setTempChar(-1);
    if (np.length >= nP) {
      setPos(Array(nP).fill(1));
      setStars(Array(nP).fill(0));
      setCur(0); setWin(null); setMsg('');
      setNaniMsg(NANI_MESSAGES.start);
      ambient.start();
      setScreen('game');
    } else {
      setPidx(p => p + 1);
    }
  };

  // ── SCREEN: Language select ───────────────────────────────────────────
  if (screen === 'select') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#fff9e6,#e3f2fd)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24, padding:20, fontFamily:"'Nunito',sans-serif" }}>
      <style>{BALA_CSS}</style>
      <div style={{ fontSize:'clamp(32px,8vw,52px)', fontFamily:"'Baloo 2',sans-serif", fontWeight:900, color:'#ff6b00', textShadow:'0 4px 12px rgba(255,100,0,.2)' }}>
        🌸 Bala Marg
      </div>
      <div style={{ fontSize:'clamp(14px,3vw,18px)', color:'#666', textAlign:'center', maxWidth:360, lineHeight:1.8 }}>
        {isHi ? 'भाषा चुनो' : 'Choose your language'}
      </div>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
        {[{ id:'en', label:'🇬🇧 English' }, { id:'hi', label:'🇮🇳 हिंदी' }].map(l => (
          <button key={l.id} onClick={() => setChosenLang(l.id)} className="bala-btn" style={{
            background: chosenLang === l.id ? 'linear-gradient(135deg,#4caf50,#2e7d32)' : undefined,
            minWidth: 140,
          }}>
            {l.label}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        {[1, 2, 3, 4].map(n => (
          <button key={n} onClick={() => setNP(n)} style={{
            width:50, height:50, borderRadius:'50%', border:'3px solid',
            borderColor: nP===n?'#ff6b00':'#ddd',
            background: nP===n?'#fff3e0':'white',
            fontSize:18, fontWeight:900, cursor:'pointer', fontFamily:"'Nunito',sans-serif",
            color: nP===n?'#ff6b00':'#999',
          }}>{n}</button>
        ))}
        <span style={{ fontSize:14, color:'#888' }}>{isHi ? 'खिलाड़ी' : 'players'}</span>
      </div>
      <button className="bala-btn" onClick={() => setScreen('setup')}>
        {isHi ? 'आगे बढ़ो! →' : 'Let\'s Play! →'}
      </button>
      <button onClick={onExit} style={{ background:'transparent', border:'none', color:'#aaa', fontSize:13, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
        ← {isHi ? 'वापस जाओ' : 'Back'}
      </button>
    </div>
  );

  // ── SCREEN: Character select ──────────────────────────────────────────
  if (screen === 'setup') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#fff9e6,#e3f2fd)', display:'flex', flexDirection:'column', alignItems:'center', padding:'20px 16px', fontFamily:"'Nunito',sans-serif", gap:16 }}>
      <style>{BALA_CSS}</style>
      <div style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:900, color:'#ff6b00', fontFamily:"'Baloo 2',sans-serif" }}>
        {isHi ? `साधक ${pidx+1} — अपना दोस्त चुनो!` : `Player ${pidx+1} — Choose your friend!`}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, width:'100%', maxWidth:480 }}>
        {CHARS_BALA.map((ch, i) => (
          <div key={ch.id} onClick={() => setTempChar(i)} style={{
            background: tempChar===i ? '#fff3e0' : 'white',
            border: `3px solid ${tempChar===i?'#ff6b00':'#eee'}`,
            borderRadius: 16, padding:12, textAlign:'center', cursor:'pointer',
            transition:'all .15s', transform: tempChar===i?'scale(1.05)':'scale(1)',
            boxShadow: tempChar===i?'0 4px 16px rgba(255,100,0,.2)':'0 2px 8px rgba(0,0,0,.06)',
          }}>
            {/* Lottie or emoji fallback */}
            <div style={{ height:70, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <BalaChar id={ch.id} size={64} />
            </div>
            <div style={{ fontSize:13, fontWeight:800, color:'#444', marginBottom:2 }}>{ch.name}</div>
            <div style={{ fontSize:10, color:'#888', lineHeight:1.4 }}>{ch.trait}</div>
          </div>
        ))}
      </div>
      <input
        value={tempName}
        onChange={e => setTempName(e.target.value)}
        onKeyDown={e => e.key==='Enter'&&addPlayer()}
        placeholder={isHi ? 'अपना नाम लिखो...' : 'Enter your name...'}
        style={{
          width:'100%', maxWidth:320, padding:'12px 18px', fontSize:16,
          borderRadius:50, border:'3px solid #ffd54f', outline:'none',
          fontFamily:"'Nunito',sans-serif", fontWeight:700, textAlign:'center',
          boxShadow:'0 3px 12px rgba(255,200,50,.2)',
        }}
      />
      <button className="bala-btn" onClick={addPlayer} style={{ opacity:(!tempName.trim()||tempChar<0)?0.5:1 }}>
        {pidx < nP-1 ? (isHi?'अगला खिलाड़ी →':'Next Player →') : (isHi?'खेल शुरू! 🎉':'Start Game! 🎉')}
      </button>
    </div>
  );

  // ── SCREEN: Win ───────────────────────────────────────────────────────
  if (screen === 'win') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#fff9e6,#fffde7)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:24, fontFamily:"'Nunito',sans-serif" }}>
      <style>{BALA_CSS}</style>
      <BalaConfetti size={200} />
      <div style={{ fontSize:'clamp(28px,7vw,42px)', fontWeight:900, color:'#ff6b00', fontFamily:"'Baloo 2',sans-serif", textAlign:'center' }}>
        🌟 {players[win]?.name} {isHi?'ने जीता!':'Wins!'} 🌟
      </div>
      <div style={{ fontSize:'clamp(14px,3vw,18px)', color:'#666', textAlign:'center', lineHeight:1.8 }}>
        {isHi ? `${players[win]?.char?.icon} ${players[win]?.char?.name} ने Garden of Stars जीत लिया!` : `${players[win]?.char?.icon} ${players[win]?.char?.name} reached the Garden of Stars!`}
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
        {players.map((p,i)=>(
          <div key={i} style={{ background:'white', borderRadius:16, padding:'10px 16px', textAlign:'center', boxShadow:'0 4px 16px rgba(0,0,0,.08)', border:`3px solid ${i===win?'#ffd700':'#eee'}` }}>
            <div style={{ fontSize:24 }}>{p.char.icon}</div>
            <div style={{ fontSize:13, fontWeight:800, color:'#444' }}>{p.name}</div>
            <div style={{ fontSize:12, color:'#ff8c00' }}>{'⭐'.repeat(Math.min(stars[i],8))}</div>
          </div>
        ))}
      </div>
      <button className="bala-btn" onClick={() => { ambient.stop(); onExit(); }}>
        🏠 {isHi?'वापस जाओ':'Go Home'}
      </button>
      <button className="bala-btn" style={{ background:'linear-gradient(135deg,#4caf50,#2e7d32)' }}
        onClick={() => {
          setScreen('setup'); setPlayers([]); setPidx(0); setWin(null);
          setPos(Array(nP).fill(1)); setStars(Array(nP).fill(0));
          setCur(0); setMsg(''); setCelebrating(false);
        }}>
        🎲 {isHi?'फिर खेलो!':'Play Again!'}
      </button>
    </div>
  );

  // ── SCREEN: Game ──────────────────────────────────────────────────────
  const cp = players[cur];
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#fff9e6,#e3f2fd)', padding:'8px 8px 80px', fontFamily:"'Nunito',sans-serif" }}>
      <style>{BALA_CSS}</style>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:6 }}>
        <button onClick={() => { ambient.stop(); onExit(); }} style={{ background:'transparent', border:'2px solid #ffd54f', color:'#ff6b00', padding:'4px 12px', borderRadius:20, fontSize:12, cursor:'pointer', fontWeight:700 }}>
          ← {isHi?'घर':'Home'}
        </button>
        {/* Star counters */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {players.map((p,i)=>(
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:4,
              background: i===cur?'#fff3e0':'white',
              border: `2px solid ${i===cur?'#ff8c00':'#eee'}`,
              borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:700,
              boxShadow: i===cur?'0 2px 8px rgba(255,100,0,.2)':'none',
            }}>
              <span style={{ fontSize:16 }}>{p.char.icon}</span>
              <span style={{ color:'#ff6b00' }}>{p.name}</span>
              <span style={{ color:'#ffb300', letterSpacing:'-1px' }}>{'⭐'.repeat(Math.min(stars[i],8))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Star flash message */}
      {starMsg && (
        <div style={{ textAlign:'center', fontSize:'clamp(14px,3vw,18px)', color:'#ff8c00', fontWeight:900, animation:'balaPop .3s ease', marginBottom:4 }}>
          {starMsg}
        </div>
      )}

      {/* Board */}
      <div style={{ maxWidth:640, margin:'0 auto' }}>
        <BalaBoard players={players} pos={pos} cur={cur} win={win} />
      </div>

      {/* Nani the Owl guide */}
      <div style={{
        display:'flex', alignItems:'flex-start', gap:10,
        maxWidth:640, margin:'10px auto 0', padding:'10px 14px',
        background:'white', borderRadius:20, border:'2px solid #ffd54f',
        boxShadow:'0 3px 12px rgba(255,200,50,.15)',
      }}>
        <div style={{ flexShrink:0, animation:'naniWiggle 2s ease infinite' }}>
          <BalaOwl size={48} />
        </div>
        <div style={{ fontSize:'clamp(12px,2.2vw,14px)', color:'#555', lineHeight:1.7, fontWeight:600 }}>
          {naniMsg}
        </div>
      </div>

      {/* Status message */}
      {msg && (
        <div style={{ textAlign:'center', fontSize:'clamp(11px,2vw,13px)', color:'#888', margin:'6px auto', maxWidth:540 }}>
          {msg}
        </div>
      )}

      {/* Roll button */}
      {!dilemma && win===null && (
        <div style={{ display:'flex', justifyContent:'center', marginTop:12 }}>
          <div style={{ textAlign:'center' }}>
            {/* Dice display */}
            <div style={{
              fontSize:48, marginBottom:8,
              animation: diceAnim ? 'diceRollAnim .6s ease' : 'none',
              filter:'drop-shadow(0 4px 8px rgba(0,0,0,.2))',
            }}>
              {diceVal ? ['🎲','⚀','⚁','⚂','⚃','⚄','⚅'][diceVal] : '🎲'}
            </div>
            <button
              className="bala-btn"
              onClick={doRoll}
              disabled={busy}
              style={{ fontSize:'clamp(16px,3vw,22px)', padding:'14px 36px' }}
            >
              {busy
                ? (isHi?'रुको...':'Rolling...')
                : `🎲 ${cp?.name || ''}${isHi?' का पासा!':' — Roll!'}`
              }
            </button>
          </div>
        </div>
      )}

      {/* Event popup */}
      {eventPopup && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.5)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:16, zIndex:200,
        }} onClick={dismissEvent}>
          <div style={{
            background:'white', borderRadius:24, padding:'clamp(20px,4vw,32px)',
            maxWidth:400, width:'100%', textAlign:'center',
            boxShadow:'0 20px 60px rgba(0,0,0,.25)',
            border:`4px solid ${eventPopup.color}`,
            animation:'balaPop .3s ease',
          }} onClick={e => e.stopPropagation()}>
            {eventPopup.type === 'ladder' && (
              <BalaStarBurst size={100} />
            )}
            {eventPopup.type === 'snake' && (
              <span style={{fontSize:72,display:"block",textAlign:"center",animation:"balaFloat 1s ease infinite"}}>{eventPopup.icon}</span>
            )}
            <div style={{ fontSize:'clamp(16px,4vw,22px)', fontWeight:900, fontFamily:"'Baloo 2',sans-serif", color:eventPopup.color, marginBottom:8, marginTop:4 }}>
              {eventPopup.title}
            </div>
            {eventPopup.from && (
              <div style={{ fontSize:'clamp(11px,2vw,13px)', color:'#999', marginBottom:8 }}>
                {eventPopup.from} → {eventPopup.to}
              </div>
            )}
            <div style={{ fontSize:'clamp(12px,2.2vw,15px)', color:'#555', lineHeight:1.8, marginBottom:16 }}>
              {eventPopup.body}
            </div>
            <button className="bala-btn" onClick={dismissEvent} style={{ fontSize:14, padding:'10px 28px' }}>
              {isHi?'ठीक है! 👍':'Got it! 👍'}
            </button>
          </div>
        </div>
      )}

      {/* Dilemma popup */}
      {dilemma && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.55)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:16, zIndex:200,
        }}>
          <div style={{
            background:'white', borderRadius:24, padding:'clamp(20px,4vw,28px)',
            maxWidth:440, width:'100%',
            boxShadow:'0 20px 60px rgba(0,0,0,.25)',
            border:'4px solid #ffd54f',
            animation:'balaPop .3s ease',
          }}>
            <div style={{ textAlign:'center', marginBottom:14 }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🤔</div>
              <div style={{ fontSize:'clamp(15px,3.5vw,20px)', fontWeight:900, fontFamily:"'Baloo 2',sans-serif", color:'#ff6b00' }}>
                {dilemma.t}
              </div>
            </div>
            <div style={{ fontSize:'clamp(12px,2.2vw,15px)', color:'#555', lineHeight:1.8, marginBottom:20, padding:'0 4px' }}>
              {dilemma.txt}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {dilemma.c.map((ch, ci) => (
                <button
                  key={ci}
                  className={`bala-choice ${ch.k}`}
                  onClick={() => solveD(ci)}
                >
                  {ch.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Celebration overlay */}
      {celebrating && (
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <BalaConfetti size={300} />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 🎨 BALA SVG ANIMATED COMPONENTS
// Hand-drawn SVG characters — no external dependencies needed.
// When Lottie files are ready, swap these out per character.
// To swap: replace the <svg> inside BalaChar with:
//   <Player src="/lottie/elephant.json" style={{width:size,height:size}} loop autoplay />
// ════════════════════════════════════════════════════════════════

// Animal faces — SVG drawn, CSS animated
const ANIMAL_SVG = {
  elephant: (s) => (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:'balaFloat 2s ease infinite'}}>
      <ellipse cx="50" cy="58" rx="34" ry="28" fill="#9e9e9e"/>
      <circle cx="50" cy="36" r="22" fill="#bdbdbd"/>
      <ellipse cx="50" cy="36" rx="22" ry="22" fill="#bdbdbd"/>
      <ellipse cx="28" cy="34" rx="10" ry="14" fill="#9e9e9e" transform="rotate(-20,28,34)"/>
      <ellipse cx="72" cy="34" rx="10" ry="14" fill="#9e9e9e" transform="rotate(20,72,34)"/>
      <ellipse cx="28" cy="33" rx="7" ry="10" fill="#f8bbd0" transform="rotate(-20,28,33)"/>
      <ellipse cx="72" cy="33" rx="7" ry="10" fill="#f8bbd0" transform="rotate(20,72,33)"/>
      <path d="M42 54 Q50 70 58 54 Q50 48 42 54Z" fill="#7a7a7a"/>
      <circle cx="43" cy="32" r="4" fill="white"/><circle cx="44" cy="32" r="2.5" fill="#333"/>
      <circle cx="57" cy="32" r="4" fill="white"/><circle cx="58" cy="32" r="2.5" fill="#333"/>
      <circle cx="44.5" cy="31" r=".8" fill="white"/><circle cx="58.5" cy="31" r=".8" fill="white"/>
      <path d="M44 42 Q50 46 56 42" stroke="#777" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  tiger: (s) => (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:'balaFloat 2.2s ease infinite .2s'}}>
      <circle cx="50" cy="50" r="38" fill="#ff8f00"/>
      <circle cx="50" cy="50" r="38" fill="url(#tigerStripes)"/>
      <defs><pattern id="tigerStripes" x="0" y="0" width="14" height="100" patternUnits="userSpaceOnUse">
        <rect width="6" height="100" fill="rgba(0,0,0,.18)"/>
      </pattern></defs>
      <circle cx="50" cy="57" r="20" fill="#ffe082"/>
      <ellipse cx="32" cy="28" rx="12" ry="14" fill="#ff8f00"/>
      <ellipse cx="68" cy="28" rx="12" ry="14" fill="#ff8f00"/>
      <ellipse cx="32" cy="28" rx="7" ry="9" fill="#fff9c4"/>
      <ellipse cx="68" cy="28" rx="7" ry="9" fill="#fff9c4"/>
      <circle cx="43" cy="45" r="5" fill="white"/><circle cx="44" cy="45" r="3" fill="#333"/>
      <circle cx="57" cy="45" r="5" fill="white"/><circle cx="58" cy="45" r="3" fill="#333"/>
      <ellipse cx="50" cy="57" rx="8" ry="5" fill="#ffb74d"/>
      <circle cx="44" cy="57" r="3" fill="#ffb74d"/>
      <circle cx="56" cy="57" r="3" fill="#ffb74d"/>
      <path d="M43 63 Q50 68 57 63" stroke="#e65100" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  monkey: (s) => (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:'balaTokenBounce .8s ease infinite alternate'}}>
      <circle cx="50" cy="50" r="36" fill="#8d6e63"/>
      <circle cx="50" cy="56" r="22" fill="#d7ccc8"/>
      <ellipse cx="26" cy="36" rx="14" ry="18" fill="#8d6e63"/>
      <ellipse cx="74" cy="36" rx="14" ry="18" fill="#8d6e63"/>
      <ellipse cx="26" cy="36" rx="9" ry="12" fill="#f8bbd0"/>
      <ellipse cx="74" cy="36" rx="9" ry="12" fill="#f8bbd0"/>
      <circle cx="43" cy="44" r="5" fill="white"/><circle cx="44" cy="44" r="3" fill="#4e342e"/>
      <circle cx="57" cy="44" r="5" fill="white"/><circle cx="58" cy="44" r="3" fill="#4e342e"/>
      <ellipse cx="50" cy="55" rx="9" ry="6" fill="#bcaaa4"/>
      <ellipse cx="44" cy="55" rx="3" ry="2.5" fill="#a1887f"/>
      <ellipse cx="56" cy="55" rx="3" ry="2.5" fill="#a1887f"/>
      <path d="M43 62 Q50 68 57 62" stroke="#6d4c41" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M75 45 Q90 40 92 55 Q90 65 80 62" stroke="#8d6e63" strokeWidth="6" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  panda: (s) => (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:'balaFloat 2.4s ease infinite .1s'}}>
      <circle cx="50" cy="50" r="38" fill="white"/>
      <circle cx="36" cy="36" r="14" fill="#212121"/>
      <circle cx="64" cy="36" r="14" fill="#212121"/>
      <circle cx="50" cy="57" r="20" fill="white"/>
      <circle cx="38" cy="42" r="6" fill="white"/><circle cx="39" cy="42" r="3.5" fill="#212121"/>
      <circle cx="62" cy="42" r="6" fill="white"/><circle cx="63" cy="42" r="3.5" fill="#212121"/>
      <circle cx="39.5" cy="41" r="1" fill="white"/><circle cx="63.5" cy="41" r="1" fill="white"/>
      <ellipse cx="50" cy="57" rx="9" ry="6" fill="#e0e0e0"/>
      <ellipse cx="44" cy="57" rx="3" ry="2.5" fill="#bdbdbd"/>
      <ellipse cx="56" cy="57" rx="3" ry="2.5" fill="#bdbdbd"/>
      <path d="M43 64 Q50 70 57 64" stroke="#757575" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="22" cy="58" rx="8" ry="10" fill="#212121"/>
      <ellipse cx="78" cy="58" rx="8" ry="10" fill="#212121"/>
    </svg>
  ),
  peacock: (s) => (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:'balaStarSpin 4s ease infinite'}}>
      {[0,45,90,135,180,225,270,315].map((deg,i)=>(
        <ellipse key={i} cx="50" cy="50" rx="6" ry="20" fill={i%2===0?"#26c6da":"#ab47bc"}
          transform={`rotate(${deg},50,50) translate(0,-18)`} opacity=".85"/>
      ))}
      <circle cx="50" cy="50" r="16" fill="#1565c0"/>
      <circle cx="50" cy="50" r="12" fill="#42a5f5"/>
      <circle cx="44" cy="47" r="3" fill="white"/><circle cx="45" cy="47" r="2" fill="#1a237e"/>
      <circle cx="56" cy="47" r="3" fill="white"/><circle cx="57" cy="47" r="2" fill="#1a237e"/>
      <path d="M46 53 Q50 56 54 53" stroke="#0d47a1" strokeWidth="1.5" fill="none"/>
      <path d="M50 37 L48 31 M50 37 L52 31 M50 37 L50 30" stroke="#ffca28" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  lion: (s) => (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{animation:'balaFloat 2s ease infinite .3s'}}>
      <circle cx="50" cy="50" r="40" fill="#ff8f00" opacity=".5"/>
      <circle cx="50" cy="50" r="32" fill="#ff8f00" opacity=".6"/>
      <circle cx="50" cy="50" r="24" fill="#ffb300" opacity=".8"/>
      <circle cx="50" cy="50" r="26" fill="#ffd54f"/>
      <circle cx="50" cy="53" r="18" fill="#ffe082"/>
      <circle cx="43" cy="46" r="5" fill="white"/><circle cx="44" cy="46" r="3" fill="#5d4037"/>
      <circle cx="57" cy="46" r="5" fill="white"/><circle cx="58" cy="46" r="3" fill="#5d4037"/>
      <ellipse cx="50" cy="56" rx="9" ry="6" fill="#ffca28"/>
      <ellipse cx="44" cy="56" rx="3" ry="2.5" fill="#ffb300"/>
      <ellipse cx="56" cy="56" rx="3" ry="2.5" fill="#ffb300"/>
      <path d="M43 62 Q50 68 57 62" stroke="#e65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M50 28 Q46 22 42 26" stroke="#e65100" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M50 28 Q54 22 58 26" stroke="#e65100" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  ),
};

function BalaChar({ id, size=64 }) {
  const draw = ANIMAL_SVG[id];
  if (!draw) return <span style={{fontSize:size*.55}}>{
    {elephant:'🐘',tiger:'🐯',monkey:'🐒',panda:'🐼',peacock:'🦚',lion:'🦁'}[id]||'🐾'
  }</span>;
  return draw(size);
}

// Confetti burst — pure CSS/SVG animation
function BalaConfetti({ size=200 }) {
  const pieces = Array.from({length:20},(_,i)=>({
    x:50+Math.cos(i/20*Math.PI*2)*35,
    y:50+Math.sin(i/20*Math.PI*2)*35,
    col:['#ff8c00','#4caf50','#2196f3','#e91e63','#ffd700','#9c27b0'][i%6],
    delay:i*0.05,
  }));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {pieces.map((p,i)=>(
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={p.col}
          style={{animation:`balaFloat ${0.6+p.delay}s ease infinite alternate`,animationDelay:`${p.delay}s`}}/>
      ))}
      <text x="50" y="55" textAnchor="middle" fontSize="32" style={{animation:'balaStarSpin 1s ease infinite'}}>🎉</text>
    </svg>
  );
}

// Owl character
function BalaOwl({ size=48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{animation:'naniWiggle 2s ease infinite'}}>
      <ellipse cx="50" cy="62" rx="28" ry="30" fill="#8d6e63"/>
      <circle cx="50" cy="40" r="26" fill="#6d4c41"/>
      <circle cx="38" cy="36" r="12" fill="white"/>
      <circle cx="62" cy="36" r="12" fill="white"/>
      <circle cx="38" cy="36" r="8" fill="#ffd54f"/>
      <circle cx="62" cy="36" r="8" fill="#ffd54f"/>
      <circle cx="38" cy="36" r="5" fill="#333"/>
      <circle cx="62" cy="36" r="5" fill="#333"/>
      <circle cx="39.5" cy="34.5" r="1.5" fill="white"/>
      <circle cx="63.5" cy="34.5" r="1.5" fill="white"/>
      <polygon points="50,48 46,56 54,56" fill="#ff8f00"/>
      <path d="M30,25 Q28,15 34,18" stroke="#6d4c41" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M70,25 Q72,15 66,18" stroke="#6d4c41" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// Stars burst
function BalaStarBurst({ size=80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {[0,60,120,180,240,300].map((deg,i)=>(
        <text key={i} x="50" y="50" textAnchor="middle" fontSize="18"
          transform={`rotate(${deg},50,50) translate(0,-28)`}
          style={{animation:`balaStarSpin ${1+i*.1}s ease infinite`,animationDelay:`${i*.08}s`}}>⭐</text>
      ))}
      <text x="50" y="58" textAnchor="middle" fontSize="32">⭐</text>
    </svg>
  );
}

