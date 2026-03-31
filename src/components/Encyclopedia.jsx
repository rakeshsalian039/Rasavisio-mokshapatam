// ─────────────────────────────────────────────────────────────────────────────
// src/components/Encyclopedia.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';

const SNAKES = {
  16:{to:4, skt:'क्रोध', en:'WRATH',    tale:"As Duryodhana's rage consumed the Kuru dynasty, so anger consumes the one who holds it. The fire of wrath burns the vessel first."},
  23:{to:7, skt:'लोभ',  en:'GREED',    tale:"Like Shakuni who gambled away an empire for the pleasure of seeing others fall, greed mistakes the shadow for the substance."},
  33:{to:12,skt:'मोह',  en:'DELUSION', tale:"Dhritarashtra's blind love for his son veiled all judgment. Delusion is not ignorance — it is the choice not to see."},
  38:{to:21,skt:'मात्सर्य',en:'ENVY',  tale:"Duryodhana burned with jealousy at the sight of Indraprastha's beauty. Envy is a fire that gives no warmth — only ash."},
  47:{to:29,skt:'काम',  en:'DESIRE',   tale:"Keechaka's uncontrolled desire for Draupadi brought his annihilation. Desire unchained by dharma destroys what it seeks to possess."},
  56:{to:41,skt:'मद',   en:'PRIDE',    tale:"Ravana's arrogance toppled golden Lanka. Pride whispers that you are the exception — until the exception becomes the rule."},
  62:{to:44,skt:'भय',   en:'TERROR',   tale:"Arjuna was paralysed before the great war. Fear without discernment is not caution — it is the surrender of the soul before the battle begins."},
  74:{to:51,skt:'द्वेष',en:'HATRED',   tale:"The ancient enmity between Drona and Drupada rippled through three generations. Hatred believes it punishes the other — it punishes only the one who carries it."},
  85:{to:59,skt:'आलस्य',en:'SLOTH',   tale:"Kumbhakarna slept while dharma crumbled. Inaction in the face of injustice is not neutrality — it is complicity."},
  95:{to:68,skt:'अहंकार',en:'EGO',    tale:"Parashurama's ego led him to challenge even Rama, his own divine superior. The ego survives by convincing you that you are the exception to every rule."},
};

const LADDERS = {
  3: {to:18, skt:'दया',    en:'COMPASSION',  tale:"Yudhishthira who wept for his enemies even in victory. True compassion makes no distinction between friend and foe."},
  9: {to:31, skt:'दान',    en:'GENEROSITY',  tale:"Karna gave his divine armour to Indra in disguise without hesitation, knowing it would cost him his life. Generosity that costs nothing teaches nothing."},
  22:{to:42, skt:'सत्य',   en:'TRUTH',       tale:"Harishchandra sacrificed his kingdom, his wife, and his son rather than speak one untruth. Truth is not a policy — it is a being."},
  28:{to:52, skt:'सेवा',   en:'SERVICE',     tale:"Hanuman whose every act was service — not to be seen, not to be rewarded, but because devotion leaves no other option."},
  37:{to:58, skt:'तपस्',   en:'AUSTERITY',   tale:"Vishwamitra whose tapas shook Indra's throne and transformed a king into a Brahmarishi. Discipline is not suffering — it is sovereignty."},
  44:{to:65, skt:'श्रद्धा', en:'FAITH',       tale:"Shabari waited a lifetime for Rama's arrival, tasting berries to find the sweetest ones. Faith that calculates is not faith — it is strategy."},
  53:{to:72, skt:'विद्या',  en:'WISDOM',      tale:"Vidura whose counsel was dharma incarnate — who spoke truth to Dhritarashtra even knowing it would be ignored. Wisdom is not intelligence. It is the willingness to act on what you know."},
  61:{to:80, skt:'विवेक',  en:'DISCERNMENT', tale:"Bhishma on his bed of arrows, seeing clearly what pride had cost the Kuru dynasty. Discernment is the capacity to see what is true even when truth is inconvenient."},
  71:{to:89, skt:'भक्ति',  en:'DEVOTION',    tale:"Prahlada whose devotion survived fire, serpents, and his own father's hatred. Devotion is not weakness — it is the strongest force in the cosmos."},
  82:{to:97, skt:'वैराग्य', en:'DETACHMENT',  tale:"Siddhartha leaving the palace at midnight, knowing that what he was walking away from could never give him what he was walking towards."},
};

const GRAHA = [
  {n:'सूर्य',  en:'Surya — The Sun',     icon:'☀', color:'#f0b840', fx:'sun',     effect:'+2 extra steps forward. The Sun sees all — nothing hides from his gaze.'},
  {n:'चन्द्र', en:'Chandra — The Moon',  icon:'☾', color:'#a0c8e0', fx:'moon',    effect:'+1 Punya. Chandra purifies and soothes — lunar grace blesses your soul.'},
  {n:'मंगल',   en:'Mangal — Mars',       icon:'♂', color:'#e07050', fx:'mars',    effect:'Nearest rival retreats 3 squares · +1 Papa. Even righteous war leaves karmic scars.'},
  {n:'बुध',    en:'Budh — Mercury',      icon:'☿', color:'#80c080', fx:'mercury', effect:'Swap positions with the nearest seeker, then move forward. Fortune is never permanent.'},
  {n:'बृहस्पति',en:'Brihaspati — Jupiter',icon:'♃',color:'#f0d060', fx:'jupiter', effect:'ALL seekers gain +1 Punya. Jupiter\'s grace is universal — even enemies benefit from a great teacher.'},
  {n:'शुक्र',  en:'Shukra — Venus',      icon:'♀', color:'#d0a0c0', fx:'venus',   effect:'Grants a celestial Shield — blocks the next serpent you land on. Works once only.'},
  {n:'शनि',    en:'Shani — Saturn',      icon:'♄', color:'#8080a0', fx:'saturn',  effect:'Pushed back 3 squares · +1 Papa. No one escapes Saturn\'s slow, grinding justice.'},
  {n:'राहु',   en:'Rahu — The Shadow',   icon:'☊', color:'#6050a0', fx:'rahu',    effect:'Steals +1 Punya from the leader, gives it to the trailer. Chaos. Inversion.'},
  {n:'केतु',   en:'Ketu — The Tail',     icon:'☋', color:'#a06060', fx:'ketu',    effect:'All Shields stripped. Seeker nearest Square 108 gains +1 Punya. In loss, liberation.'},
];

const ASHTANGA = [
  {num:101, skt:'यम',      en:'Yama',       desc:'Self-restraint. The five ethical disciplines: non-violence, truth, non-stealing, celibacy, non-possessiveness.'},
  {num:102, skt:'नियम',    en:'Niyama',     desc:'Personal observances. Purity, contentment, self-discipline, self-study, surrender to the divine.'},
  {num:103, skt:'आसन',    en:'Asana',       desc:'Steady, comfortable posture. The gateway of the body to meditation.'},
  {num:104, skt:'प्राणायाम',en:'Pranayama', desc:'Expansion of life-force through breath. The bridge between body and mind.'},
  {num:105, skt:'प्रत्याहार',en:'Pratyahara',desc:'Withdrawal of the senses from their objects. The turning of attention inward.'},
  {num:106, skt:'धारणा',   en:'Dharana',    desc:'Single-pointed concentration. The mind focused on one object without wavering.'},
  {num:107, skt:'ध्यान',   en:'Dhyana',     desc:'Deep, unbroken meditation. The final gate. You must roll an exact 1 to proceed.'},
  {num:108, skt:'मोक्ष',   en:'Moksha',     desc:'Liberation. The cycle of birth and death ends. The soul returns to its source.'},
];

const TABS = ['Serpents','Virtues','Navagraha','Sacred Crown','History'];

export default function Encyclopedia({ onClose }) {
  const [tab, setTab] = useState('Serpents');

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(6,5,3,.97)',
      zIndex: 300, overflowY: 'auto',
      padding: 'clamp(12px,3vw,28px)',
      animation: 'fadeIn .3s ease',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,30px)', fontFamily: "'Yatra One',serif", color: '#f0d050', margin: '0 0 4px' }}>
              📖 Encyclopaedia
            </h2>
            <div style={{ fontSize: 10, letterSpacing: 4, color: '#5a4a30', fontFamily: "'Cinzel',serif" }}>
              MOKSHA PATAM 108 · COMPLETE REFERENCE
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(200,160,60,.2)', color: '#8a7a50', padding: '6px 16px', fontSize: 12, cursor: 'pointer', borderRadius: 3, fontFamily: "'Cinzel',serif", letterSpacing: 2 }}>
            ✕ Close
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', fontSize: 11, borderRadius: 20, cursor: 'pointer',
              border: `1px solid ${tab===t?'rgba(240,200,80,.4)':'rgba(200,160,60,.12)'}`,
              background: tab===t ? 'rgba(240,200,80,.1)' : 'transparent',
              color: tab===t ? '#f0d050' : '#6a5a38',
              fontFamily: "'Cinzel',serif", letterSpacing: 1, transition: 'all .2s',
            }}>{t}</button>
          ))}
        </div>

        {/* ── SERPENTS ── */}
        {tab==='Serpents' && (
          <div>
            <p style={{ fontSize: 12, color: '#8a7a50', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic', fontFamily: "'IM Fell English',serif" }}>
              Ten Nāga serpents named after the great vices of the Mahābhārata. Landing on a serpent's head costs +2 Papa and sends you sliding down to its tail.
            </p>
            {Object.entries(SNAKES).map(([sq, sn]) => (
              <div key={sq} style={{ background: 'rgba(20,10,10,.7)', border: '1px solid rgba(180,50,30,.15)', borderLeft: '3px solid rgba(180,50,30,.5)', borderRadius: 4, padding: '14px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                  <div style={{ textAlign: 'center', minWidth: 52 }}>
                    <div style={{ fontSize: 9, color: '#e08040', letterSpacing: 2, fontFamily: "'Cinzel',serif", marginBottom: 2 }}>SQ {sq}</div>
                    <div style={{ fontSize: 9, color: '#8a7a50', fontFamily: "'Cinzel',serif" }}>→ {sn.to}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Noto Serif Devanagari',serif", fontSize: 18, color: '#ffc050' }}>{sn.skt}</span>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: '#e08040', letterSpacing: 2, fontWeight: 700 }}>{sn.en}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#a08060', lineHeight: 1.8, margin: 0, fontStyle: 'italic', fontFamily: "'IM Fell English',serif" }}>{sn.tale}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── VIRTUES ── */}
        {tab==='Virtues' && (
          <div>
            <p style={{ fontSize: 12, color: '#8a7a50', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic', fontFamily: "'IM Fell English',serif" }}>
              Ten divine ladders of virtue, each embodied by one of the Mahābhārata's greatest souls. Landing on the base of a ladder earns +1 Punya and lifts you upward.
            </p>
            {Object.entries(LADDERS).map(([sq, ld]) => (
              <div key={sq} style={{ background: 'rgba(10,20,10,.7)', border: '1px solid rgba(50,160,50,.15)', borderLeft: '3px solid rgba(100,180,80,.4)', borderRadius: 4, padding: '14px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ textAlign: 'center', minWidth: 52 }}>
                    <div style={{ fontSize: 9, color: '#f0d050', letterSpacing: 2, fontFamily: "'Cinzel',serif", marginBottom: 2 }}>SQ {sq}</div>
                    <div style={{ fontSize: 9, color: '#8a7a50', fontFamily: "'Cinzel',serif" }}>→ {ld.to}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Noto Serif Devanagari',serif", fontSize: 18, color: '#ffe070' }}>{ld.skt}</span>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: '#c0d060', letterSpacing: 2, fontWeight: 700 }}>{ld.en}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#a0b070', lineHeight: 1.8, margin: 0, fontStyle: 'italic', fontFamily: "'IM Fell English',serif" }}>{ld.tale}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── NAVAGRAHA ── */}
        {tab==='Navagraha' && (
          <div>
            <p style={{ fontSize: 12, color: '#8a7a50', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic', fontFamily: "'IM Fell English',serif" }}>
              Nine cosmic forces govern the universe and your journey. The Navagraha have NO effect on the Sacred Crown Path (Squares 101–108).
            </p>
            {GRAHA.map((g, i) => (
              <div key={i} style={{ background: 'rgba(10,10,20,.7)', border: `1px solid ${g.color}22`, borderLeft: `3px solid ${g.color}55`, borderRadius: 4, padding: '14px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{ fontSize: 28, color: g.color, minWidth: 32, filter: `drop-shadow(0 0 8px ${g.color}60)` }}>{g.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Noto Serif Devanagari',serif", fontSize: 15, color: g.color }}>{g.n}</span>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: `${g.color}cc`, letterSpacing: 1 }}>{g.en}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#c0b080', lineHeight: 1.8, margin: '0 0 4px', fontFamily: "'IM Fell English',serif", fontStyle: 'italic' }}>{g.effect}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SACRED CROWN ── */}
        {tab==='Sacred Crown' && (
          <div>
            <p style={{ fontSize: 12, color: '#8a7a50', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic', fontFamily: "'IM Fell English',serif" }}>
              Patanjali's 8-fold path — the Ashtanga Marga. After Square 100 you enter the crown. Move only 1 step per turn. Each gate demands knowledge. Square 107 requires an exact roll of 1.
            </p>
            {ASHTANGA.map((a, i) => (
              <div key={i} style={{
                background: a.num===108 ? 'radial-gradient(ellipse at 30% 50%,rgba(240,200,80,.12),rgba(20,16,10,.8))' : 'rgba(20,16,10,.6)',
                border: `1px solid ${a.num===108?'rgba(240,200,80,.4)':'rgba(200,160,60,.12)'}`,
                borderRadius: 4, padding: '14px 16px', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ textAlign: 'center', minWidth: 44 }}>
                    <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 18, color: '#f0d050', lineHeight: 1 }}>{a.num}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Noto Serif Devanagari',serif", fontSize: 16, color: '#f0d050' }}>{a.skt}</span>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: '#c0b080', letterSpacing: 2 }}>{a.en.toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#a09060', lineHeight: 1.8, margin: 0, fontStyle: 'italic', fontFamily: "'IM Fell English',serif" }}>{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab==='History' && (
          <div>
            {[
              { title: 'The Origin', body: 'Moksha Patam was created in ancient India — scholars place its origins between 2nd and 13th centuries CE, with some attributing it to the 13th-century saint poet Jnandev of Maharashtra. It was designed as a teaching tool to explain the concepts of karma, dharma, and liberation to children and the uninitiated.' },
              { title: 'The Philosophy', body: 'Every element of the original game was intentional. The serpents represented the vices that drag the soul downward — Krodha (Anger), Lobha (Greed), Kama (Desire). The ladders represented the virtues that elevate — Daya (Compassion), Dana (Generosity), Satya (Truth). The number 108 was not arbitrary: it is the most sacred number in Vedic tradition, encoding the mathematics of the solar system and the structure of the Sanskrit alphabet.' },
              { title: 'The Theft', body: 'When British colonial administrators encountered Moksha Patam, they took the game structure and systematically removed every philosophical element. Every Sanskrit name was stripped. Every moral framework was erased. Every spiritual reference was deleted. They renamed it "Snakes and Ladders" — a children\'s game with dice, no more. The soul of the game was murdered. What remained was the skeleton.' },
              { title: 'The Restoration', body: 'Moksha Patam 108 by RasaVisio is the first complete digital restoration of the original game. Every snake carries its Sanskrit vice name and its story from the Mahābhārata. Every ladder carries its virtue and the soul who embodied it. The Navagraha dice restore the cosmic dimension the British removed. The Ashtanga Crown restores Patanjali\'s 8-fold path as the final gate to liberation. The game is played as the ancient rishis intended.' },
              { title: 'The Number 108', body: 'The Sun\'s diameter is 108 times the Earth\'s diameter. The distance from Earth to the Moon is 108 times the Moon\'s diameter. There are 108 Upanishads. A mala has 108 beads. The Sanskrit alphabet has 54 letters, each with Shiva (masculine) and Shakti (feminine) form — 54 × 2 = 108. The number encodes the structure of sacred sound. 108 energy channels converge at the heart chakra. 1 represents Brahma (Creator), 0 represents Shunya (The Void), 8 represents Ananta (Infinity). The number you are trying to reach is the universe itself.' },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 3, color: '#f0d050', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(200,160,60,.1)' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#c0b080', lineHeight: 2, margin: 0, fontStyle: 'italic', fontFamily: "'IM Fell English',serif" }}>{s.body}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(200,160,60,.06)' }}>
          <div style={{ fontSize: 10, color: '#3a3020', letterSpacing: 3, fontFamily: "'Cinzel',serif", marginBottom: 8 }}>
            © 2024–2026 RASAVISIO · MOKSHA PATAM 108
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(200,160,60,.2)', color: '#8a7a50', padding: '8px 28px', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: "'Cinzel',serif", letterSpacing: 3 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
