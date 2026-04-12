// ═══════════════════════════════════════════════════════════════════════════════
// CINEMATIC ONBOARDING — "The Journey Begins"
// 12-scene auto-advancing cinematic experience. Feels like a movie trailer.
// Each scene SHOWS a game mechanic in action with typewriter narration.
// Auto-advances with tap-to-skip. ~3.5 minutes total.
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import TempleIcon from './TempleIcon';
import SacredPathIcon from './SacredPathIcon';

// Temple bell (inline)
const bellRef={current:null};
function bell(){try{if(bellRef.current){bellRef.current.pause();bellRef.current.currentTime=0}const a=new Audio('/temple-bell.mp3');a.volume=0.4;bellRef.current=a;a.play().catch(()=>{});setTimeout(()=>{try{a.pause()}catch(e){}},2500)}catch(e){}}

// ── Typewriter hook ──
function useTypewriter(text, speed = 30, active = true) {
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (!active) { setChars(0); return; }
    setChars(0);
    const iv = setInterval(() => setChars(c => {
      if (c >= text.length) { clearInterval(iv); return c; }
      return c + 1;
    }), speed);
    return () => clearInterval(iv);
  }, [text, speed, active]);
  return text.slice(0, chars);
}

// ── Scene data ──
const SCENES = [
  // 1. OPENING
  {
    id: 'opening', duration: 18000,
    text: 'Five thousand years ago, before the Mahabharata was written, before temples were carved in stone... a game was born. It mapped the soul\'s journey from ignorance to enlightenment. The British stole it. Stripped its meaning. Called it "Snakes & Ladders." We brought it all back.',
    shloka: 'कर्मण्येवाधिकारस्ते',
    shlokaEn: 'You have the right to work — Gita 2.47',
    color: '#f0d050',
  },
  // 2. THE BOARD
  {
    id: 'board', duration: 16000,
    text: '108 squares across three cosmic realms. Bhuloka — the earthly chaos. Antarloka — the mind\'s battlefield. Svargaloka — the celestial heights where one mistake destroys lifetimes. And above them all — the Sacred Crown, Patanjali\'s eight-fold path to liberation.',
    color: '#c0a060',
  },
  // 3. DICE
  {
    id: 'dice', duration: 16000,
    text: 'Two dice shape your destiny. The Karma Die determines how far you move. The Navagraha Die summons one of nine cosmic planetary forces — Surya grants extra steps, Chandra purifies your soul, Shani punishes with karma. The planets are not random. They are fate.',
    color: '#f0d050',
  },
  // 4. SERPENTS
  {
    id: 'serpents', duration: 14000,
    text: 'Ten serpents of vice lurk on the board — Wrath, Greed, Ego, Desire. Land on one and you are dragged down, branded with Papa. Each serpent carries a tale from the Mahabharata. Each fall is a lesson the ancients encoded into play.',
    color: '#e06030',
  },
  // 5. LADDERS
  {
    id: 'ladders', duration: 12000,
    text: 'Ten ladders of virtue lift your soul — Compassion, Truth, Devotion, Detachment. Named after the greatest exemplars of dharma. Karna\'s generosity. Hanuman\'s service. Prahlada\'s unshakeable faith. Each rise is grace earned.',
    color: '#f0d050',
  },
  // 6. DILEMMAS
  {
    id: 'dilemma', duration: 16000,
    text: 'At twenty-one crossroads, the universe presents a moral choice. Should Arjuna fight his family? Should you report your friend? Each path carries Punya or Papa. There are no right answers — only consequences. The character you forge here determines your destiny.',
    color: '#d0b870',
  },
  // 7. TEMPLES
  {
    id: 'temples', duration: 18000,
    text: 'Nine sacred temples are embedded in the board — Ayurveda, Engineering, Mathematics, Language, Astronomy, Statecraft, Agriculture, Arts, Philosophy. Land on one and face a quiz. Correct: advance with Punya. Wrong: Papa weighs on your soul. The curriculum of Nalanda, reborn.',
    color: '#c09040',
  },
  // 8. GURUS
  {
    id: 'gurus', duration: 20000,
    text: 'Every eight turns, an ancient genius materializes from history itself. Aryabhata, who moved the Earth. Sushruta, who invented surgery. Chanakya, who built empires with intellect. Answer their question and receive a blessing — a real power that changes your game.',
    color: '#4080c0',
  },
  // 9. SACRED PATH
  {
    id: 'sacred', duration: 18000,
    text: 'After square 100, the rules change completely. The eight-fold path of Patanjali. One step per turn. Each step tests your knowledge with a riddle. No shortcuts. No planets. No one can touch you. Just your soul and the path. Only the pure reach Moksha.',
    shloka: 'योगश्चित्तवृत्तिनिरोधः',
    shlokaEn: 'Yoga is stilling the mind — Sutra 1.2',
    color: '#f0d050',
  },
  // 10. COSMIC
  {
    id: 'cosmic', duration: 14000,
    text: 'Every twelve turns, the cosmos whispers a secret. Aryabhata calculated the Earth\'s circumference to 99.8% accuracy. Wootz steel contained carbon nanotubes. Baudhayana proved the Pythagorean theorem 300 years before Pythagoras. You don\'t just play. You learn what the world forgot.',
    color: '#f0d050',
  },
  // 11. VICTORY
  {
    id: 'victory', duration: 16000,
    text: 'Two paths to liberation. Reach Square 108 with your Punya equal to or greater than your Papa — the Gates of Moksha open. Or accumulate 50 Punya from any square — the board dissolves. Instant Moksha through accumulated virtue.',
    shloka: 'तत् त्वम् असि',
    shlokaEn: 'You are That — Chandogya Upanishad',
    color: '#f0d050',
  },
  // 12. BEGIN
  {
    id: 'begin', duration: 999999, // waits for tap
    text: 'The board awaits. The serpents stir. The gurus watch. Your karma is yours to shape.',
    color: '#f0d050',
  },
];

// ── Guru data for scene 8 ──
const GURUS_PREVIEW = [
  { id: 'aryabhata', name: 'आर्यभट', en: 'Aryabhata', era: '476 CE', color: '#4080c0' },
  { id: 'sushruta', name: 'सुश्रुत', en: 'Sushruta', era: '600 BCE', color: '#c04040' },
  { id: 'chanakya', name: 'चाणक्य', en: 'Chanakya', era: '375 BCE', color: '#c0a040' },
  { id: 'panini', name: 'पाणिनि', en: 'Panini', era: '400 BCE', color: '#a080c0' },
  { id: 'charaka', name: 'चरक', en: 'Charaka', era: '300 BCE', color: '#40a060' },
  { id: 'bhaskara', name: 'भास्कर', en: 'Bhaskara II', era: '1114 CE', color: '#60a0c0' },
  { id: 'varahamihira', name: 'वराहमिहिर', en: 'Varahamihira', era: '505 CE', color: '#6080a0' },
  { id: 'patanjali', name: 'पतञ्जलि', en: 'Patanjali', era: '200 BCE', color: '#c08060' },
];

// ── Temple keys for scene 7 ──
const TEMPLE_KEYS = ['vaidya','shilpa','ganita','shabda','jyotish','rajniti','krishi','kala','darshan'];
const TEMPLE_COLORS = ['#40a060','#c09040','#6080c0','#a080c0','#4080c0','#c0a040','#80a040','#c060a0','#8060c0'];

// ── CSS ──
const CSS = `
@keyframes coFadeIn{0%{opacity:0}100%{opacity:1}}
@keyframes coSlideUp{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}
@keyframes coZoomIn{0%{opacity:0;transform:scale(.5)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
@keyframes coPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
@keyframes coGlow{0%,100%{text-shadow:0 0 20px var(--c)40}50%{text-shadow:0 0 60px var(--c)90,0 0 120px var(--c)30}}
@keyframes coFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes coOrbit{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes coSnakeSlide{0%{transform:translateY(0)}100%{transform:translateY(60px)}}
@keyframes coLadderRise{0%{transform:translateY(0)}100%{transform:translateY(-60px)}}
@keyframes coTypeGlow{0%,100%{border-right-color:var(--c)}50%{border-right-color:transparent}}
@keyframes coProgressFill{0%{width:0}100%{width:var(--w)}}
@keyframes coParticle{0%{opacity:0;transform:translateY(20px) scale(0)}50%{opacity:1;transform:translateY(-10px) scale(1)}100%{opacity:0;transform:translateY(-40px) scale(.5)}}
`;

export default function CinematicOnboarding({ onComplete, chosenLang = 'en', muted = false }) {
  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);

  const sc = SCENES[scene] || SCENES[SCENES.length - 1];
  const typedText = useTypewriter(sc.text, 28, !transitioning);

  // Auto-advance
  useEffect(() => {
    if (scene >= SCENES.length) return;
    setPhase(0);
    const s = SCENES[scene];

    // Phase timers for sub-animations within scenes
    const phaseTimers = [];
    // Phase 1 at 30% duration, Phase 2 at 60%
    phaseTimers.push(setTimeout(() => setPhase(1), s.duration * 0.3));
    phaseTimers.push(setTimeout(() => setPhase(2), s.duration * 0.6));

    // Auto-advance to next scene
    if (s.id !== 'begin') {
      timerRef.current = setTimeout(() => advance(), s.duration);
    }

    // Bell on certain scenes
    if (!muted && ['opening', 'temples', 'gurus', 'sacred', 'begin'].includes(s.id)) {
      bell();
    }

    return () => {
      clearTimeout(timerRef.current);
      phaseTimers.forEach(t => clearTimeout(t));
    };
  }, [scene, muted]);

  const advance = useCallback(() => {
    if (scene >= SCENES.length - 1) {
      onComplete();
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      setScene(s => s + 1);
      setTransitioning(false);
    }, 400);
  }, [scene, onComplete]);

  const handleTap = () => {
    clearTimeout(timerRef.current);
    if (scene >= SCENES.length - 1) {
      onComplete();
    } else {
      advance();
    }
  };

  const progress = ((scene + 1) / SCENES.length) * 100;
  const isLast = scene >= SCENES.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 290,
      background: `radial-gradient(ellipse at 50% 30%, ${sc.color}08, #050403 55%), #050403`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      cursor: 'pointer',
    }} onClick={handleTap}>
      <style>{CSS}</style>

      {/* ── Top border ── */}
      <div style={{ width: '100%', height: 2, flexShrink: 0,
        background: `linear-gradient(90deg,transparent,${sc.color}60,transparent)`,
        transition: 'background 1s' }} />

      {/* ── Skip button ── */}
      <div style={{ position: 'absolute', top: 12, right: 14, zIndex: 5 }}>
        <button onClick={(e) => { e.stopPropagation(); onComplete(); }} style={{
          background: 'transparent', border: `1px solid ${sc.color}20`,
          color: `${sc.color}40`, padding: '4px 14px', fontSize: 10,
          cursor: 'pointer', borderRadius: 4, fontFamily: "'Cinzel',serif",
          letterSpacing: 2,
        }}>SKIP →</button>
      </div>

      {/* ── Scene counter ── */}
      <div style={{ position: 'absolute', top: 14, left: 16, zIndex: 5,
        fontSize: 9, letterSpacing: 3, color: `${sc.color}35`,
        fontFamily: "'Cinzel',serif" }}>
        {scene + 1} / {SCENES.length}
      </div>

      {/* ── Main content ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(16px,4vw,40px)',
        opacity: transitioning ? 0 : 1,
        transition: 'opacity .4s ease',
      }}>
        <div style={{ maxWidth: 620, width: '100%', textAlign: 'center' }}>

          {/* ── Scene-specific visual ── */}
          {sc.id === 'opening' && (
            <div style={{ marginBottom: 'clamp(20px,4vw,36px)' }}>
              <div style={{
                fontSize: 'clamp(60px,16vw,100px)', lineHeight: 1,
                animation: 'coZoomIn 1.5s cubic-bezier(0.16,1,0.3,1) forwards',
                filter: `drop-shadow(0 0 30px ${sc.color}60)`,
              }}>ॐ</div>
              <div style={{
                fontFamily: "'Yatra One',serif",
                fontSize: 'clamp(24px,6vw,42px)', color: sc.color,
                letterSpacing: 4, marginTop: 10,
                '--c': sc.color, animation: 'coGlow 3s ease infinite',
              }}>मोक्ष पटम् १०८</div>
              <div style={{ fontSize: 10, letterSpacing: 6, color: `${sc.color}40`,
                fontFamily: "'Cinzel',serif", marginTop: 6 }}>THE ANCIENT GAME OF KARMA</div>
            </div>
          )}

          {sc.id === 'board' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(6px,2vw,16px)',
              marginBottom: 'clamp(16px,3vw,28px)', flexWrap: 'wrap' }}>
              {[
                { label: 'भूलोक', en: 'Earth', sq: '1-33', color: '#8a6030' },
                { label: 'अन्तर्लोक', en: 'Inner', sq: '34-66', color: '#5a80a0' },
                { label: 'स्वर्गलोक', en: 'Celestial', sq: '67-99', color: '#9070c0' },
                { label: 'अष्टांग', en: 'Sacred', sq: '101-108', color: '#f0d050' },
              ].map((r, i) => (
                <div key={i} style={{
                  padding: 'clamp(8px,2vw,14px) clamp(10px,2.5vw,18px)',
                  background: `${r.color}10`, border: `1px solid ${r.color}30`,
                  borderRadius: 10, textAlign: 'center', minWidth: 70,
                  animation: `coSlideUp .5s ease ${0.3 + i * 0.15}s both`,
                }}>
                  <div style={{ fontSize: 'clamp(14px,3vw,20px)', color: r.color,
                    fontFamily: "'Yatra One',serif" }}>{r.label}</div>
                  <div style={{ fontSize: 8, color: `${r.color}60`, letterSpacing: 1,
                    fontFamily: "'Cinzel',serif" }}>{r.en} · {r.sq}</div>
                </div>
              ))}
            </div>
          )}

          {sc.id === 'dice' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px,5vw,40px)',
              marginBottom: 'clamp(16px,3vw,28px)', alignItems: 'center' }}>
              {/* Karma die */}
              <div style={{ textAlign: 'center', animation: 'coSlideUp .5s ease .2s both' }}>
                <div style={{ fontSize: 8, letterSpacing: 4, color: '#f0d05060',
                  fontFamily: "'Cinzel',serif", marginBottom: 6 }}>KARMA</div>
                <div style={{
                  width: 'clamp(60px,14vw,90px)', height: 'clamp(60px,14vw,90px)',
                  background: 'linear-gradient(148deg,#3e3018,#1e1508)',
                  borderRadius: 12, border: '2px solid rgba(240,200,80,.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'clamp(20px,5vw,32px)', color: '#f0d050',
                  boxShadow: '0 0 20px rgba(240,200,80,.2)',
                  animation: 'coFloat 3s ease infinite',
                }}>⚃</div>
                <div style={{ fontSize: 'clamp(14px,3vw,20px)', color: '#f0d050',
                  fontWeight: 700, marginTop: 6 }}>+4</div>
              </div>
              {/* Divider */}
              <div style={{ fontSize: 14, color: '#c0b06030' }}>✦</div>
              {/* Graha die */}
              <div style={{ textAlign: 'center', animation: 'coSlideUp .5s ease .4s both' }}>
                <div style={{ fontSize: 8, letterSpacing: 4, color: '#a0c8e060',
                  fontFamily: "'Cinzel',serif", marginBottom: 6 }}>NAVAGRAHA</div>
                <div style={{
                  width: 'clamp(60px,14vw,90px)', height: 'clamp(60px,14vw,90px)',
                  background: 'linear-gradient(148deg,#1a2030,#0e1520)',
                  borderRadius: 12, border: '2px solid rgba(160,200,224,.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'clamp(28px,7vw,42px)',
                  boxShadow: '0 0 20px rgba(160,200,224,.15)',
                  animation: 'coFloat 3s ease 1s infinite',
                }}>☾</div>
                <div style={{ fontSize: 'clamp(10px,2vw,13px)', color: '#a0c8e0',
                  fontFamily: "'Yatra One',serif", marginTop: 6 }}>चन्द्र</div>
              </div>
            </div>
          )}

          {sc.id === 'serpents' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(12px,4vw,24px)',
              marginBottom: 'clamp(16px,3vw,28px)' }}>
              {[
                { skt: 'क्रोध', en: 'Wrath', from: 16, to: 4 },
                { skt: 'अहंकार', en: 'Ego', from: 95, to: 68 },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: 'clamp(12px,2.5vw,18px)', background: 'rgba(200,60,30,.08)',
                  border: '1px solid rgba(200,60,30,.25)', borderRadius: 10,
                  textAlign: 'center', minWidth: 'clamp(80px,20vw,130px)',
                  animation: `coSlideUp .5s ease ${0.3 + i * 0.15}s both`,
                }}>
                  <div style={{ fontSize: 'clamp(28px,7vw,40px)', marginBottom: 4 }}>𓆙</div>
                  <div style={{ fontSize: 'clamp(12px,2.5vw,16px)', color: '#e08040',
                    fontFamily: "'Noto Serif Devanagari',serif", fontWeight: 700 }}>{s.skt}</div>
                  <div style={{ fontSize: 9, color: '#e0804080', fontFamily: "'Cinzel',serif" }}>{s.en}</div>
                  <div style={{ fontSize: 10, color: '#e06030', marginTop: 6,
                    fontFamily: "'Cinzel',serif" }}>{s.from} → {s.to}</div>
                  <div style={{ fontSize: 9, color: '#e0603080' }}>+2 PAPA</div>
                </div>
              ))}
            </div>
          )}

          {sc.id === 'ladders' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(12px,4vw,24px)',
              marginBottom: 'clamp(16px,3vw,28px)' }}>
              {[
                { skt: 'दया', en: 'Compassion', from: 3, to: 18 },
                { skt: 'भक्ति', en: 'Devotion', from: 71, to: 89 },
              ].map((l, i) => (
                <div key={i} style={{
                  padding: 'clamp(12px,2.5vw,18px)', background: 'rgba(240,200,80,.05)',
                  border: '1px solid rgba(240,200,80,.2)', borderRadius: 10,
                  textAlign: 'center', minWidth: 'clamp(80px,20vw,130px)',
                  animation: `coSlideUp .5s ease ${0.3 + i * 0.15}s both`,
                }}>
                  <div style={{ fontSize: 'clamp(28px,7vw,40px)', marginBottom: 4 }}>🪔</div>
                  <div style={{ fontSize: 'clamp(12px,2.5vw,16px)', color: '#f0d050',
                    fontFamily: "'Noto Serif Devanagari',serif", fontWeight: 700 }}>{l.skt}</div>
                  <div style={{ fontSize: 9, color: '#f0d05080', fontFamily: "'Cinzel',serif" }}>{l.en}</div>
                  <div style={{ fontSize: 10, color: '#f0d050', marginTop: 6,
                    fontFamily: "'Cinzel',serif" }}>{l.from} → {l.to}</div>
                  <div style={{ fontSize: 9, color: '#80c08090' }}>+1 PUNYA</div>
                </div>
              ))}
            </div>
          )}

          {sc.id === 'dilemma' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(10px,3vw,20px)',
              marginBottom: 'clamp(16px,3vw,28px)' }}>
              <div style={{ padding: 'clamp(12px,2vw,16px)', background: 'rgba(100,200,100,.06)',
                border: '1px solid rgba(100,200,100,.2)', borderRadius: 10,
                flex: 1, maxWidth: 200, animation: 'coSlideUp .5s ease .3s both' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🙏</div>
                <div style={{ fontSize: 11, color: '#80c080', fontFamily: "'Cinzel',serif",
                  fontWeight: 700 }}>PUNYA PATH</div>
                <div style={{ fontSize: 9, color: '#80c08070', marginTop: 4 }}>
                  The harder road. The righteous choice. Advance your soul.</div>
              </div>
              <div style={{ alignSelf: 'center', fontSize: 16, color: '#d0b87040' }}>⚖</div>
              <div style={{ padding: 'clamp(12px,2vw,16px)', background: 'rgba(200,80,60,.06)',
                border: '1px solid rgba(200,80,60,.2)', borderRadius: 10,
                flex: 1, maxWidth: 200, animation: 'coSlideUp .5s ease .45s both' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>💀</div>
                <div style={{ fontSize: 11, color: '#e06030', fontFamily: "'Cinzel',serif",
                  fontWeight: 700 }}>PAPA PATH</div>
                <div style={{ fontSize: 9, color: '#e0603070', marginTop: 4 }}>
                  The easy road. The selfish choice. Advance your position.</div>
              </div>
            </div>
          )}

          {sc.id === 'temples' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(4px,1.5vw,8px)',
              flexWrap: 'wrap', marginBottom: 'clamp(12px,3vw,24px)' }}>
              {TEMPLE_KEYS.map((tk, i) => (
                <div key={tk} style={{
                  animation: `coSlideUp .4s ease ${0.3 + i * 0.06}s both`,
                }}>
                  <TempleIcon templeKey={tk} size={36} color={TEMPLE_COLORS[i]} />
                </div>
              ))}
            </div>
          )}

          {sc.id === 'gurus' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(4px,1.5vw,10px)',
              flexWrap: 'wrap', marginBottom: 'clamp(12px,3vw,24px)' }}>
              {GURUS_PREVIEW.map((g, i) => (
                <div key={g.id} style={{
                  textAlign: 'center', animation: `coSlideUp .4s ease ${0.3 + i * 0.07}s both`,
                }}>
                  <div style={{
                    width: 'clamp(40px,10vw,56px)', height: 'clamp(40px,10vw,56px)',
                    borderRadius: '50%', overflow: 'hidden',
                    border: `2px solid ${g.color}40`, margin: '0 auto 4px',
                    boxShadow: `0 0 12px ${g.color}20`,
                  }}>
                    <img src={`/gurus/${g.id}.png`} alt={g.en}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }} />
                  </div>
                  <div style={{ fontSize: 'clamp(9px,2vw,11px)', color: g.color,
                    fontFamily: "'Yatra One',serif" }}>{g.name}</div>
                  <div style={{ fontSize: 7, color: `${g.color}50`, fontFamily: "'Cinzel',serif" }}>{g.era}</div>
                </div>
              ))}
            </div>
          )}

          {sc.id === 'sacred' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(3px,1vw,8px)',
              marginBottom: 'clamp(12px,3vw,24px)', flexWrap: 'wrap' }}>
              {[0,1,2,3,4,5,6,7].map(i => (
                <div key={i} style={{
                  animation: `coSlideUp .4s ease ${0.3 + i * 0.1}s both`,
                }}>
                  <SacredPathIcon stepIndex={i} size={36} />
                </div>
              ))}
            </div>
          )}

          {sc.id === 'cosmic' && (
            <div style={{
              padding: 'clamp(14px,3vw,22px)', background: 'rgba(240,200,80,.04)',
              border: '1px solid rgba(240,200,80,.15)', borderRadius: 12,
              marginBottom: 'clamp(12px,3vw,24px)',
              animation: 'coZoomIn .6s ease .3s both',
            }}>
              <div style={{ fontSize: 9, letterSpacing: 4, color: '#f0d05040',
                fontFamily: "'Cinzel',serif", marginBottom: 8 }}>DID YOU KNOW?</div>
              <div style={{ fontSize: 'clamp(12px,2.5vw,15px)', color: '#d0c090',
                lineHeight: 1.9, fontStyle: 'italic' }}>
                The Iron Pillar of Delhi has stood for 1,600 years without rusting.
                Scientists discovered it creates a self-healing nano-layer called misawite.
              </div>
              <div style={{ fontSize: 8, color: '#f0d05030', marginTop: 6,
                fontFamily: "'Cinzel',serif" }}>IIT KANPUR RESEARCH</div>
            </div>
          )}

          {sc.id === 'victory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12,
              marginBottom: 'clamp(12px,3vw,24px)' }}>
              <div style={{ padding: 14, background: 'rgba(240,200,80,.06)',
                borderLeft: '3px solid #f0d05060', borderRadius: '0 10px 10px 0',
                animation: 'coSlideUp .5s ease .3s both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 8px #f0d05060)' }}>ॐ</span>
                  <span style={{ fontSize: 14, color: '#f0d050', fontFamily: "'Cinzel',serif",
                    fontWeight: 700 }}>MOKSHA VICTORY</span>
                </div>
                <div style={{ fontSize: 11, color: '#c0b08080', marginTop: 4, lineHeight: 1.7 }}>
                  Reach Square 108 with Punya ≥ Papa</div>
              </div>
              <div style={{ padding: 14, background: 'rgba(100,200,100,.06)',
                borderLeft: '3px solid #80c08060', borderRadius: '0 10px 10px 0',
                animation: 'coSlideUp .5s ease .45s both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 8px #80c08060)' }}>⚡</span>
                  <span style={{ fontSize: 14, color: '#80c080', fontFamily: "'Cinzel',serif",
                    fontWeight: 700 }}>KARMA VICTORY</span>
                </div>
                <div style={{ fontSize: 11, color: '#a0c0a080', marginTop: 4, lineHeight: 1.7 }}>
                  Accumulate 50 Punya from any square</div>
              </div>
            </div>
          )}

          {sc.id === 'begin' && (
            <div style={{ marginBottom: 'clamp(16px,4vw,32px)' }}>
              <div style={{
                fontSize: 'clamp(48px,14vw,80px)', lineHeight: 1, marginBottom: 12,
                animation: 'coPulse 3s ease infinite',
                filter: 'drop-shadow(0 0 30px #f0d05060)',
              }}>ॐ</div>
              <button onClick={(e) => { e.stopPropagation(); onComplete(); }} style={{
                background: '#f0d05015', border: '1px solid #f0d05050',
                color: '#f0d050', padding: '14px 40px', fontSize: 14,
                fontFamily: "'Cinzel',serif", cursor: 'pointer', borderRadius: 8,
                letterSpacing: 4, fontWeight: 700,
                boxShadow: '0 0 30px #f0d05015',
                animation: 'coPulse 2s ease infinite',
              }}>BEGIN YOUR JOURNEY</button>
            </div>
          )}

          {/* ── Shloka ── */}
          {sc.shloka && (
            <div style={{ marginBottom: 'clamp(10px,2vw,18px)',
              animation: 'coFadeIn .8s ease .5s both' }}>
              <div style={{ fontSize: 'clamp(12px,2.5vw,16px)', color: `${sc.color}80`,
                fontFamily: "'Noto Serif Devanagari',serif", fontStyle: 'italic' }}>
                "{sc.shloka}"</div>
              <div style={{ fontSize: 8, color: '#c0b06030', fontFamily: "'Cinzel',serif",
                marginTop: 3 }}>{sc.shlokaEn}</div>
            </div>
          )}

          {/* ── Narration text (typewriter) ── */}
          <div style={{
            fontSize: 'clamp(13px,2.8vw,17px)', color: 'rgba(200,180,140,.65)',
            lineHeight: 2.2, fontFamily: "'Noto Serif Devanagari',serif",
            textAlign: 'center', padding: '0 clamp(4px,2vw,16px)',
            minHeight: 'clamp(60px,15vw,120px)',
          }}>
            {typedText}
            <span style={{
              borderRight: `2px solid ${sc.color}60`,
              marginLeft: 2, animation: 'coTypeGlow 1s step-end infinite',
              '--c': sc.color,
            }}>&nbsp;</span>
          </div>

          {/* ── Tap hint ── */}
          {!isLast && (
            <div style={{
              fontSize: 8, color: `${sc.color}20`, letterSpacing: 4,
              fontFamily: "'Cinzel',serif", marginTop: 'clamp(12px,3vw,20px)',
              animation: 'coFadeIn 1s ease 2s both',
            }}>TAP TO CONTINUE</div>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{
        width: '100%', height: 3, flexShrink: 0,
        background: 'rgba(200,160,60,.08)',
      }}>
        <div style={{
          height: '100%', background: sc.color,
          width: `${progress}%`, transition: 'width .6s ease, background 1s',
          boxShadow: `0 0 8px ${sc.color}40`,
        }} />
      </div>
    </div>
  );
}
