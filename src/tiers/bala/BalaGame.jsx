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
import { Player } from '@lottiefiles/react-lottie-player';

import { useAmbient } from '../../shared/useAmbient.js';
import BalaBoard from './BalaBoard.jsx';
import {
  CHARS_BALA, SNAKES_BALA, LADDERS_BALA, DLM_SQ_BALA,
  DILEMMAS_BALA, STAR_MESSAGES, NANI_MESSAGES,
  BALA_WIN_SQUARE, BALA_WIN_STARS,
} from './bala.constants.js';

// ── Lottie file paths (put .json files in /public/lottie/) ───────────────
const LOTTIE = {
  celebrate:  '/lottie/celebrate.json',
  starEarn:   '/lottie/star-earn.json',
  starsBurst: '/lottie/stars-burst.json',
  snakeSlide: '/lottie/snake-slide.json',
  diceRoll:   '/lottie/dice-roll.json',
  owl:        '/lottie/owl.json',
  elephant:   '/lottie/elephant.json',
  tiger:      '/lottie/tiger.json',
  monkey:     '/lottie/monkey.json',
  panda:      '/lottie/panda.json',
  peacock:    '/lottie/peacock.json',
  lion:       '/lottie/lion.json',
};

// Map character id → lottie file
const CHAR_LOTTIE = {
  elephant: LOTTIE.elephant,
  tiger:    LOTTIE.tiger,
  monkey:   LOTTIE.monkey,
  panda:    LOTTIE.panda,
  peacock:  LOTTIE.peacock,
  lion:     LOTTIE.lion,
};

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
              <LottieOrEmoji src={CHAR_LOTTIE[ch.id]} fallback={ch.icon} size={64} />
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
      <LottieOrEmoji src={LOTTIE.celebrate} fallback="🎉" size={200} loop autoplay />
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
          <LottieOrEmoji src={LOTTIE.owl} fallback="🦉" size={48} />
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
              <LottieOrEmoji src={LOTTIE.starsBurst} fallback="🌟" size={100} autoplay loop={false} />
            )}
            {eventPopup.type === 'snake' && (
              <LottieOrEmoji src={LOTTIE.snakeSlide} fallback={eventPopup.icon} size={100} autoplay loop={false} />
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
          <LottieOrEmoji src={LOTTIE.celebrate} fallback="🎉" size={Math.min(window.innerWidth,400)} autoplay loop={false} />
        </div>
      )}
    </div>
  );
}

// ── LottieOrEmoji — plays Lottie if available, falls back to emoji ────────
function LottieOrEmoji({ src, fallback, size=60, loop=true, autoplay=false }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return <span style={{ fontSize:size*.55, lineHeight:1 }}>{fallback}</span>;
  }
  return (
    <Player
      src={src}
      style={{ width:size, height:size }}
      loop={loop}
      autoplay={autoplay || loop}
      onError={() => setFailed(true)}
    />
  );
}
