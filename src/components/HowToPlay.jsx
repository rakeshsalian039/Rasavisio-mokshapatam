// ═══════════════════════════════════════════════════════════════════════════════
// HOW TO PLAY — Cinematic Time-Travel to Vedic India
// 10-page scroll experience. Each page: shloka → title → body → visual grid.
// Feels like unrolling an ancient scroll in a Nalanda library.
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useRef } from 'react';
import TempleIcon from './TempleIcon';
import SacredPathIcon from './SacredPathIcon';

// ── Temple bell (inline — no import dependency) ──
const bellRef = { current: null };
function bell() {
  try {
    if (bellRef.current) { bellRef.current.pause(); bellRef.current.currentTime = 0; }
    const a = new Audio('/temple-bell.mp3'); a.volume = 0.4; bellRef.current = a;
    a.play().catch(() => {}); setTimeout(() => { try { a.pause() } catch (e) {} }, 2500);
  } catch (e) {}
}

// ═══ THE 10 PAGES ═══════════════════════════════════════════════════════════
const PAGES = [
  // ─── 1. THE INVITATION ───
  {
    shloka: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
    shlokaEn: 'You have the right to work, but never to its fruits — Bhagavad Gita 2.47',
    title: 'Welcome, Seeker',
    sub: 'THE ANCIENT GAME OF KARMA',
    body: 'Five thousand years ago, before the Mahabharata was written, before temples were carved in stone — this game existed. It was called Moksha Patam, the path to liberation. The British stole it, stripped its soul, and renamed it "Snakes & Ladders." They removed the Sanskrit. They removed the karma. They removed the meaning.\n\nWe brought it all back.',
    color: '#f0d050',
  },
  // ─── 2. THE BOARD ───
  {
    shloka: 'असतो मा सद्गमय · तमसो मा ज्योतिर्गमय',
    shlokaEn: 'From unreal lead me to real, from darkness to light — Brihadaranyaka Upanishad',
    title: 'The Sacred Board',
    sub: 'THREE REALMS · 108 SQUARES',
    body: 'The board is a map of existence itself. Three cosmic realms, each more treacherous than the last. And above them all — the Sacred Crown, where only the purest souls walk.',
    items: [
      { icon: '🌍', label: 'भूलोक · Bhuloka', desc: 'Squares 1-33\nThe Earthly Realm — chaos, raw desire, the beginning', color: '#8a6030' },
      { icon: '🧠', label: 'अन्तर्लोक · Antarloka', desc: 'Squares 34-66\nThe Inner World — mind battles itself', color: '#5a80a0' },
      { icon: '✨', label: 'स्वर्गलोक · Svargaloka', desc: 'Squares 67-99\nThe Celestial Realm — one slip destroys lifetimes', color: '#9070c0' },
      { icon: '🪷', label: 'अष्टांग मार्ग', desc: 'Squares 101-108\nThe 8-Fold Sacred Path of Patanjali', color: '#f0d050' },
    ],
    color: '#c0a060',
  },
  // ─── 3. DICE ───
  {
    title: 'Two Dice of Destiny',
    sub: 'KARMA DIE + NAVAGRAHA',
    body: 'Each turn you roll two dice. The Karma Die (1-6) determines how many squares you move. The Navagraha Die summons one of 9 cosmic planetary forces — each with a unique power over your destiny. The planets are not random. They are karma.',
    items: [
      { icon: '☀', label: 'सूर्य · Surya', desc: '+2 extra steps', color: '#f0b840' },
      { icon: '☾', label: 'चन्द्र · Chandra', desc: '+1 Punya', color: '#a0c8e0' },
      { icon: '♂', label: 'मंगल · Mars', desc: 'Rival retreats 3', color: '#e07050' },
      { icon: '♀', label: 'शुक्र · Venus', desc: 'Celestial Shield', color: '#d0a0c0' },
      { icon: '♄', label: 'शनि · Saturn', desc: 'You retreat 3 · +1 Papa', color: '#8080a0' },
    ],
    color: '#f0d050',
  },
  // ─── 4. SNAKES & LADDERS ───
  {
    shloka: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत',
    shlokaEn: 'Whenever dharma declines... I manifest — Bhagavad Gita 4.7',
    title: 'Serpents & Virtues',
    sub: '10 VICES DRAG YOU DOWN · 10 VIRTUES LIFT YOU UP',
    body: '10 Naga serpents — each named after a Sanskrit vice from the Mahabharata — drag you down and brand your soul with +2 Papa. 10 divine ladders — each named after a virtue embodied by legendary souls — lift you toward the light and grant +1 Punya. Every fall is a lesson. Every rise is grace.',
    items: [
      { icon: '𓆙', label: 'क्रोध · Wrath', desc: 'Duryodhana\'s consuming rage', color: '#e06030' },
      { icon: '𓆙', label: 'अहंकार · Ego', desc: 'Parashurama\'s blind pride', color: '#e06030' },
      { icon: '🪔', label: 'दया · Compassion', desc: 'Yudhishthira wept for enemies', color: '#f0d050' },
      { icon: '🪔', label: 'भक्ति · Devotion', desc: 'Prahlada survived fire', color: '#f0d050' },
    ],
    color: '#e08040',
  },
  // ─── 5. DHARMA DILEMMAS ───
  {
    title: 'Dharma Dilemmas',
    sub: '21 MORAL CROSSROADS',
    body: 'At 21 marked squares, the universe presents a choice. Should Arjuna fight his own family? Should you report your friend\'s cheating? Each path carries karmic weight — Punya or Papa. There are no "right" answers. Only consequences. The character you build in these moments determines whether Moksha\'s gate opens or rejects you.',
    items: [
      { icon: '⚖', label: 'Draupadi\'s Disrobing', desc: 'Speak truth or protect yourself?', color: '#d0b870' },
      { icon: '⚖', label: 'Karna\'s Divine Armour', desc: 'Keep power or sacrifice it?', color: '#d0b870' },
      { icon: '⚖', label: 'The Honest Tax Return', desc: 'Modern dharma — truth or advantage?', color: '#d0b870' },
    ],
    color: '#d0b870',
  },
  // ─── 6. KNOWLEDGE TEMPLES ───
  {
    shloka: 'विद्या ददाति विनयम् · विनयाद् याति पात्रताम्',
    shlokaEn: 'Knowledge gives humility. From humility comes worthiness. — Subhashita',
    title: 'Knowledge Temples',
    sub: '9 TEMPLES OF ANCIENT INDIAN SCIENCE',
    body: 'Nine sacred temples are embedded in the board — each dedicated to a branch of knowledge that India gave the world. Land on one and face a quiz. Correct: +1 Punya and advance 3 squares. Wrong: +1 Papa. The complete curriculum of Nalanda University, reborn in a game.',
    temples: [
      { name: 'वैद्यशाला', en: 'Hall of Healing', desc: 'Sushruta\'s 121 surgical instruments. Rhinoplasty in 600 BCE.', templeKey: 'vaidya', color: '#40a060' },
      { name: 'शिल्पशाला', en: 'Forge of Wonders', desc: 'Iron Pillar: 1,600 years without rust. Carbon nanotubes in Wootz steel.', templeKey: 'shilpa', color: '#c09040' },
      { name: 'गणितपीठ', en: 'Throne of Numbers', desc: 'Zero, pi, calculus — all invented here. 500 years before Newton.', templeKey: 'ganita', color: '#6080c0' },
      { name: 'शब्दमन्दिर', en: 'Temple of Sound', desc: 'Panini\'s 3,959 rules = world\'s first programming language.', templeKey: 'shabda', color: '#a080c0' },
      { name: 'ज्योतिषपीठ', en: 'Observatory of Stars', desc: 'Aryabhata knew Earth rotates — 1,000 years before Copernicus.', templeKey: 'jyotish', color: '#4080c0' },
      { name: 'राजनीतिपीठ', en: 'Hall of Strategy', desc: 'Chanakya\'s Arthashastra — 5,000 pages. Machiavelli was a pamphlet.', templeKey: 'rajniti', color: '#c0a040' },
      { name: 'कृषिपीठ', en: 'Garden of Earth', desc: 'India domesticated rice, cotton, sugarcane. Drew Columbus west.', templeKey: 'krishi', color: '#80a040' },
      { name: 'कलापीठ', en: 'Temple of Arts', desc: '108 dance poses. 22 micro-tones. Kailasa carved from one cliff.', templeKey: 'kala', color: '#c060a0' },
      { name: 'दर्शनपीठ', en: 'Hall of Wisdom', desc: 'Atoms in 600 BCE. Fuzzy logic in 6th century. Quantum parallels.', templeKey: 'darshan', color: '#8060c0' },
    ],
    color: '#c09040',
  },
  // ─── 7. GURU ENCOUNTERS ───
  {
    shloka: 'गुरुर्ब्रह्मा गुरुर्विष्णुर्गुरुर्देवो महेश्वरः',
    shlokaEn: 'The Guru is Brahma, Vishnu, and Shiva themselves — Guru Stotram',
    title: 'Guru Encounters',
    sub: '8 ANCIENT MASTERS WHO SHAPED CIVILIZATION',
    body: 'Every 8 turns, an ancient Indian genius materializes from history itself. Answer their question correctly: +2 Punya and a unique blessing — a real gameplay power that changes your fortune. Answer wrongly: +1 Papa.',
    gurus: [
      { id: 'aryabhata', name: 'आर्यभट', en: 'Aryabhata', era: '476 CE', title: 'The Man Who Moved the Earth', blessing: '+2 extra squares', color: '#4080c0' },
      { id: 'sushruta', name: 'सुश्रुत', en: 'Sushruta', era: '600 BCE', title: 'The Father of Surgery', blessing: 'Heal 1 Papa', color: '#c04040' },
      { id: 'chanakya', name: 'चाणक्य', en: 'Chanakya', era: '375 BCE', title: 'The Kingmaker', blessing: '+3 Punya', color: '#c0a040' },
      { id: 'panini', name: 'पाणिनि', en: 'Panini', era: '400 BCE', title: 'The First Programmer', blessing: 'Auto-correct dilemma', color: '#a080c0' },
      { id: 'charaka', name: 'चरक', en: 'Charaka', era: '300 BCE', title: 'The Wandering Healer', blessing: 'Snake shield', color: '#40a060' },
      { id: 'bhaskara', name: 'भास्कर', en: 'Bhaskara II', era: '1114 CE', title: 'Infinity\'s Poet', blessing: 'Double dice roll', color: '#60a0c0' },
      { id: 'varahamihira', name: 'वराहमिहिर', en: 'Varahamihira', era: '505 CE', title: 'The Prophet', blessing: '+3 Punya', color: '#6080a0' },
      { id: 'patanjali', name: 'पतञ्जलि', en: 'Patanjali', era: '200 BCE', title: 'Architect of Consciousness', blessing: 'Skip next Papa', color: '#c08060' },
    ],
    color: '#4080c0',
  },
  // ─── 8. COSMIC CARDS ───
  {
    title: 'Did You Know?',
    sub: 'COSMIC KNOWLEDGE CARDS',
    body: 'Every 12 turns, the cosmos whispers a secret — a fact about ancient India so extraordinary it sounds impossible. But every fact is documented history.\n\nAryabhata calculated the Earth\'s circumference to 99.8% accuracy in 499 CE. Wootz steel contained carbon nanotubes. Baudhayana wrote the Pythagorean theorem 300 years before Pythagoras.\n\nYou don\'t just play this game. You learn what the world forgot.',
    color: '#f0d050',
  },
  // ─── 9. SACRED PATH ───
  {
    shloka: 'योगश्चित्तवृत्तिनिरोधः',
    shlokaEn: 'Yoga is the cessation of the fluctuations of the mind — Yoga Sutra 1.2',
    title: 'The Sacred Crown',
    sub: 'ASHTANGA MARGA · THE 8-FOLD PATH',
    body: 'After Square 100, the rules change completely. You enter Patanjali\'s 8-fold path — the final ascent to Moksha. Move only 1 step per turn. Each step tests your knowledge with a riddle. No dice shortcuts. No planetary effects. No one can push you or swap with you. It is just your soul and the path.',
    items: [
      { label: 'यम · Yama', desc: 'Self-restraint', stepIdx: 0 },
      { label: 'नियम · Niyama', desc: 'Discipline', stepIdx: 1 },
      { label: 'आसन · Asana', desc: 'Steadiness', stepIdx: 2 },
      { label: 'प्राणायाम', desc: 'Life-force', stepIdx: 3 },
      { label: 'प्रत्याहार', desc: 'Withdrawal', stepIdx: 4 },
      { label: 'धारणा · Dharana', desc: 'Concentration', stepIdx: 5 },
      { label: 'ध्यान · Dhyana', desc: 'Meditation', stepIdx: 6 },
      { label: 'मोक्ष · MOKSHA', desc: 'Liberation', stepIdx: 7 },
    ],
    color: '#f0d050',
  },
  // ─── 10. VICTORY ───
  {
    shloka: 'तत् त्वम् असि',
    shlokaEn: 'You are That — Chandogya Upanishad',
    title: 'Two Paths to Liberation',
    sub: 'HOW YOU WIN',
    victory: [
      {
        icon: 'ॐ', label: 'Moksha Victory', color: '#f0d050',
        desc: 'Reach Square 108 with your Punya equal to or greater than your Papa. If your soul is impure — Papa exceeds Punya — the gates of Moksha reject you, and you are cast back to Square 67. Purify yourself. Try again. Only the pure transcend.',
      },
      {
        icon: '⚡', label: 'Karma Victory', color: '#80c080',
        desc: 'Accumulate 50 Punya from any square on the board. The board itself dissolves beneath you. Instant liberation through accumulated virtue. Not through position, but through the weight of your righteous actions. The rarer, harder, more beautiful path.',
      },
    ],
    color: '#f0d050',
  },
];

// ═══ STYLES ═══
const ani = (delay = 0) => ({
  animation: `htpReveal .6s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
});

const CSS = `
@keyframes htpReveal{0%{opacity:0;transform:translateY(20px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes htpGlow{0%,100%{text-shadow:0 0 20px var(--c,#f0d050)40}50%{text-shadow:0 0 50px var(--c,#f0d050)80}}
@keyframes htpDotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
@keyframes htpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
`;

export default function HowToPlay({ onClose }) {
  const [page, setPage] = useState(0);
  const [vis, setVis] = useState(true);
  const scrollRef = useRef(null);

  const go = (p) => {
    if (p < 0 || p >= PAGES.length) return;
    setVis(false);
    bell();
    setTimeout(() => {
      setPage(p);
      setVis(true);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 350);
  };

  const pg = PAGES[page];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: `radial-gradient(ellipse at 50% 20%, ${pg.color}08, #060503 60%), #060503`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <style>{CSS}</style>

      {/* ── Top ornamental line ── */}
      <div style={{ width: '100%', height: 3, flexShrink: 0,
        background: `linear-gradient(90deg,transparent,${pg.color},transparent)`, opacity: 0.5,
        transition: 'background 1s' }} />

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', flexShrink: 0,
        borderBottom: `1px solid ${pg.color}15`,
      }}>
        <span style={{ fontSize: 10, letterSpacing: 4, color: `${pg.color}50`,
          fontFamily: "'Cinzel',serif" }}>
          {page + 1} / {PAGES.length}
        </span>
        <span style={{ fontSize: 11, letterSpacing: 5, color: pg.color,
          fontFamily: "'Cinzel',serif", fontWeight: 700 }}>
          HOW TO PLAY
        </span>
        <button onClick={onClose} style={{
          background: 'transparent', border: `1px solid ${pg.color}25`,
          color: `${pg.color}60`, padding: '4px 12px', fontSize: 10, cursor: 'pointer',
          borderRadius: 4, fontFamily: "'Cinzel',serif", letterSpacing: 1,
        }}>✕</button>
      </div>

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: 'clamp(20px,5vw,48px) clamp(12px,3vw,24px)',
        opacity: vis ? 1 : 0, transition: 'opacity .35s ease',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ maxWidth: 580, width: '100%' }}>

          {/* Shloka */}
          {pg.shloka && (
            <div style={{ textAlign: 'center', marginBottom: 'clamp(18px,4vw,32px)', ...ani(0.1) }}>
              <div style={{
                fontFamily: "'Noto Serif Devanagari',serif",
                fontSize: 'clamp(15px,3.5vw,22px)', color: `${pg.color}bb`,
                fontStyle: 'italic', lineHeight: 1.9,
                textShadow: `0 0 30px ${pg.color}25`,
              }}>"{pg.shloka}"</div>
              <div style={{
                fontSize: 'clamp(9px,1.8vw,11px)', color: 'rgba(200,180,140,.3)',
                fontFamily: "'Cinzel',serif", letterSpacing: 1, marginTop: 6,
              }}>{pg.shlokaEn}</div>
            </div>
          )}

          {/* Title */}
          <div style={{ textAlign: 'center', ...ani(0.2) }}>
            <div style={{
              fontFamily: "'Yatra One',serif",
              fontSize: 'clamp(30px,8vw,52px)', color: pg.color,
              letterSpacing: 3, lineHeight: 1.2,
              textShadow: `0 0 50px ${pg.color}50`,
              '--c': pg.color, animation: 'htpGlow 4s ease infinite',
            }}>{pg.title}</div>
          </div>

          {/* Subtitle */}
          <div style={{ textAlign: 'center', marginBottom: 4, ...ani(0.3) }}>
            <div style={{
              fontSize: 'clamp(9px,2vw,12px)', color: 'rgba(255,255,255,.3)',
              fontFamily: "'Cinzel',serif", letterSpacing: 'clamp(3px,1vw,6px)',
            }}>{pg.sub}</div>
          </div>

          {/* Divider */}
          <div style={{
            width: 'clamp(40px,12vw,80px)', height: 2, margin: '0 auto',
            background: `linear-gradient(90deg,transparent,${pg.color},transparent)`,
            marginBottom: 'clamp(16px,4vw,28px)', ...ani(0.35),
          }} />

          {/* Body */}
          {pg.body && (
            <div style={{ ...ani(0.45) }}>
              <div style={{
                fontSize: 'clamp(13px,2.8vw,16px)', color: 'rgba(200,180,140,.65)',
                lineHeight: 2.2, fontFamily: "'Noto Serif Devanagari',serif",
                padding: 'clamp(14px,3vw,22px)',
                background: `${pg.color}04`, border: `1px solid ${pg.color}12`,
                borderLeft: `3px solid ${pg.color}40`,
                borderRadius: '0 12px 12px 0', textAlign: 'left',
                whiteSpace: 'pre-line',
              }}>
                {pg.body}
              </div>
            </div>
          )}

          {/* ── TEMPLES — large SVG icons with descriptions ── */}
          {pg.temples && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: 'clamp(6px,1.5vw,10px)', width: '100%',
              marginTop: 'clamp(16px,3vw,24px)',
            }}>
              {pg.temples.map((t, i) => (
                <div key={i} style={{
                  padding: 'clamp(10px,2vw,16px) clamp(4px,1vw,8px)',
                  background: `${t.color}08`, border: `1px solid ${t.color}18`,
                  borderRadius: 10, textAlign: 'center',
                  ...ani(0.5 + i * 0.05),
                  animation: `htpReveal .5s cubic-bezier(0.16,1,0.3,1) ${0.5 + i * 0.05}s both`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                    <TempleIcon templeKey={t.templeKey} size={36} color={t.color} />
                  </div>
                  <div style={{
                    fontSize: 'clamp(10px,2vw,13px)', color: t.color,
                    fontFamily: "'Noto Serif Devanagari',serif", fontWeight: 700,
                    lineHeight: 1.3, marginBottom: 2,
                  }}>{t.name}</div>
                  <div style={{
                    fontSize: 'clamp(7px,1.3vw,9px)', color: 'rgba(255,255,255,.35)',
                    fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 4,
                  }}>{t.en}</div>
                  <div style={{
                    fontSize: 'clamp(7px,1.2vw,9px)', color: 'rgba(200,180,140,.4)',
                    lineHeight: 1.5,
                  }}>{t.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── GURUS — portrait images with names and blessings ── */}
          {pg.gurus && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
              gap: 'clamp(6px,1.5vw,10px)', width: '100%',
              marginTop: 'clamp(16px,3vw,24px)',
            }}>
              {pg.gurus.map((g, i) => (
                <div key={i} style={{
                  padding: 'clamp(8px,1.5vw,12px) clamp(4px,1vw,6px)',
                  background: `${g.color}08`, border: `1px solid ${g.color}18`,
                  borderRadius: 10, textAlign: 'center',
                  ...ani(0.5 + i * 0.06),
                  animation: `htpReveal .5s cubic-bezier(0.16,1,0.3,1) ${0.5 + i * 0.06}s both`,
                }}>
                  {/* Guru portrait */}
                  <div style={{
                    width: 'clamp(44px,10vw,64px)', height: 'clamp(44px,10vw,64px)',
                    borderRadius: '50%', overflow: 'hidden', margin: '0 auto 6px',
                    border: `2px solid ${g.color}40`,
                    boxShadow: `0 0 15px ${g.color}20`,
                  }}>
                    <img src={`/gurus/${g.id}.png`} alt={g.en}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                      onError={(e) => { e.target.style.display = 'none' }} />
                  </div>
                  {/* Sanskrit name */}
                  <div style={{
                    fontSize: 'clamp(10px,2vw,13px)', color: g.color,
                    fontFamily: "'Yatra One',serif", lineHeight: 1.2, marginBottom: 1,
                  }}>{g.name}</div>
                  {/* English name + era */}
                  <div style={{
                    fontSize: 'clamp(7px,1.2vw,9px)', color: 'rgba(255,255,255,.35)',
                    fontFamily: "'Cinzel',serif", letterSpacing: 0.5, marginBottom: 2,
                  }}>{g.en} · {g.era}</div>
                  {/* Title */}
                  <div style={{
                    fontSize: 'clamp(6px,1.1vw,8px)', color: `${g.color}60`,
                    fontFamily: "'Cinzel',serif", marginBottom: 4, lineHeight: 1.3,
                  }}>{g.title}</div>
                  {/* Blessing */}
                  <div style={{
                    fontSize: 'clamp(7px,1.2vw,9px)', color: 'rgba(200,180,140,.5)',
                    padding: '3px 6px', background: `${g.color}0a`,
                    borderRadius: 6, border: `1px solid ${g.color}12`,
                  }}>{g.blessing}</div>
                </div>
              ))}
            </div>
          )}

          {/* Items grid */}
          {pg.items && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: pg.items.length > 6
                ? 'repeat(auto-fill,minmax(100px,1fr))'
                : pg.items.length > 4
                  ? 'repeat(auto-fill,minmax(120px,1fr))'
                  : 'repeat(auto-fill,minmax(130px,1fr))',
              gap: 'clamp(6px,1.5vw,10px)', width: '100%',
              marginTop: 'clamp(16px,3vw,24px)',
            }}>
              {pg.items.map((item, i) => (
                <div key={i} style={{
                  padding: 'clamp(10px,2vw,14px) clamp(6px,1.5vw,10px)',
                  background: `${item.color || pg.color}08`,
                  border: `1px solid ${item.color || pg.color}18`,
                  borderRadius: 10, textAlign: 'center',
                  ...ani(0.5 + i * 0.06),
                  animation: `htpReveal .5s cubic-bezier(0.16,1,0.3,1) ${0.5 + i * 0.06}s both, htpFloat 4s ease-in-out ${i * 0.3}s infinite`,
                }}>
                  {item.templeKey ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                      <TempleIcon templeKey={item.templeKey} size={28} color={item.color || pg.color} />
                    </div>
                  ) : item.stepIdx !== undefined ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                      <SacredPathIcon stepIndex={item.stepIdx} size={28} />
                    </div>
                  ) : (
                    <div style={{
                      fontSize: 'clamp(18px,4vw,26px)', marginBottom: 2,
                      filter: `drop-shadow(0 0 5px ${item.color || pg.color}50)`,
                    }}>{item.icon}</div>
                  )}
                  <div style={{
                    fontSize: 'clamp(10px,2vw,12px)', color: item.color || pg.color,
                    fontFamily: "'Noto Serif Devanagari',serif", fontWeight: 700,
                    lineHeight: 1.3, marginBottom: 2,
                  }}>{item.label}</div>
                  <div style={{
                    fontSize: 'clamp(8px,1.5vw,10px)', color: 'rgba(200,180,140,.4)',
                    fontFamily: "'Cinzel',serif", lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                  }}>{item.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Victory page — special large cards */}
          {pg.victory && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 'clamp(12px,3vw,20px)',
              width: '100%', marginTop: 'clamp(16px,3vw,24px)',
            }}>
              {pg.victory.map((v, i) => (
                <div key={i} style={{
                  padding: 'clamp(16px,3vw,24px)',
                  background: `${v.color}06`,
                  border: `1px solid ${v.color}22`,
                  borderLeft: `4px solid ${v.color}60`,
                  borderRadius: '0 14px 14px 0', textAlign: 'left',
                  ...ani(0.5 + i * 0.15),
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 'clamp(28px,6vw,40px)',
                      filter: `drop-shadow(0 0 10px ${v.color}60)`,
                    }}>{v.icon}</span>
                    <span style={{
                      fontSize: 'clamp(18px,4vw,24px)', color: v.color,
                      fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: 2,
                    }}>{v.label}</span>
                  </div>
                  <div style={{
                    fontSize: 'clamp(12px,2.5vw,14px)', color: 'rgba(200,180,140,.6)',
                    lineHeight: 2, fontFamily: "'Noto Serif Devanagari',serif",
                  }}>{v.desc}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── Footer navigation ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', flexShrink: 0,
        borderTop: `1px solid ${pg.color}12`,
        background: 'rgba(6,5,3,.8)',
      }}>
        {/* Back */}
        <button onClick={() => page === 0 ? onClose() : go(page - 1)} style={{
          background: 'transparent', border: `1px solid ${pg.color}20`,
          color: `${pg.color}60`, padding: '7px 14px', fontSize: 10,
          cursor: 'pointer', borderRadius: 4, fontFamily: "'Cinzel',serif",
          letterSpacing: 2, minWidth: 70,
        }}>
          {page === 0 ? '✕ CLOSE' : '← BACK'}
        </button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {PAGES.map((_, i) => (
            <div key={i} onClick={() => go(i)} style={{
              width: i === page ? 14 : 5, height: 5, borderRadius: 3,
              background: i === page ? pg.color : `${pg.color}25`,
              cursor: 'pointer', transition: 'all .4s ease',
              animation: i === page ? 'htpDotPulse 2s ease infinite' : 'none',
            }} />
          ))}
        </div>

        {/* Next */}
        <button onClick={() => page === PAGES.length - 1 ? onClose() : go(page + 1)} style={{
          background: page === PAGES.length - 1 ? `${pg.color}12` : 'transparent',
          border: `1px solid ${page === PAGES.length - 1 ? pg.color + '45' : pg.color + '20'}`,
          color: page === PAGES.length - 1 ? pg.color : `${pg.color}80`,
          padding: '7px 14px', fontSize: page === PAGES.length - 1 ? 11 : 10,
          cursor: 'pointer', borderRadius: 4, fontFamily: "'Cinzel',serif",
          letterSpacing: 2, fontWeight: page === PAGES.length - 1 ? 700 : 400,
          minWidth: 70,
        }}>
          {page === PAGES.length - 1 ? 'BEGIN ▸' : 'NEXT →'}
        </button>
      </div>

      {/* ── Bottom ornamental line ── */}
      <div style={{ width: '100%', height: 2, flexShrink: 0,
        background: `linear-gradient(90deg,transparent,${pg.color}35,transparent)` }} />
    </div>
  );
}
