// ─────────────────────────────────────────────────────────────────────────────
// src/components/HowToPlay.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';

const SECTIONS = [
  {
    icon: '🎯', title: 'The Goal',
    body: `Reach Square 108 — Moksha — through the Sacred 8-fold Path of Patanjali, with your Punya (virtue) equal to or greater than your Papa (sin). Alternatively, collect 30 Punya from any square for instant Karma Victory.`,
  },
  {
    icon: '🎲', title: 'Your Turn',
    body: `Each turn you roll TWO dice: the Karma Die (1–6) which determines how many squares you move forward, and the Graha Die (9 Navagraha) which triggers a cosmic planetary effect. Popups explain exactly what happened after every roll.`,
  },
  {
    icon: '𓆙', title: 'The 10 Nāga Serpents',
    body: `Ten serpents are hidden across the board, each named after a Sanskrit vice from the Mahābhārata. Landing on a serpent's head sends you sliding DOWN to its tail, and costs +2 Papa. The further you fall, the deeper the vice. A Shukra Shield will block one serpent entirely.`,
  },
  {
    icon: '🪔', title: 'The 10 Virtue Ladders',
    body: `Ten divine ladders of virtue rise through the board. Landing on the base of a ladder lifts you UP to its top, and earns you +1 Punya. The virtues are drawn from the lives of the Mahābhārata's greatest souls — Karna, Hanuman, Harishchandra, Prahlada, and others.`,
  },
  {
    icon: '⚖', title: 'Dharma Dilemmas',
    body: `Twenty-one moral dilemmas drawn from the Mahābhārata and real life appear at marked squares. You choose between two paths — each has karmic consequence. No dilemma repeats within the same game. Choose wisely: the soul you shape is your own.`,
  },
  {
    icon: '🛡', title: 'The Shukra Shield',
    body: `When the Shukra (Venus) Graha appears, you receive a celestial shield — a one-time protection that neutralises the next serpent you land on. The shield is lost if Ketu appears, which strips all shields from all players simultaneously.`,
  },
  {
    icon: '🌌', title: 'The 9 Navagraha',
    body: `Nine planetary forces govern the cosmos and your game. Surya grants +2 steps. Chandra grants +1 Punya. Mangal sends the nearest rival back 3 squares (+1 Papa to you). Budh swaps your position with the nearest seeker. Brihaspati grants ALL players +1 Punya. Shukra grants a Shield. Shani sends you back 3 squares (+1 Papa). Rahu steals Punya from the leader and gives it to the last-placed. Ketu strips all shields and grants +1 Punya to the seeker nearest Moksha. The Navagraha have NO effect on the Sacred Crown Path (Squares 101–108).`,
  },
  {
    icon: '🪷', title: 'The Ashtanga Marga — Sacred Crown (101–108)',
    body: `After Square 100, you transcend the material world and enter the Ashtanga Marga — Patanjali's 8-fold sacred path. Here the rules change completely. You move only ONE step per turn, regardless of your dice roll. Each square (101–107) presents a riddle about that path's teaching. Answer correctly and gain +2 Punya and advance. Answer wrongly and gain Papa, and are sent backwards. At Square 107 (Dhyana), you must roll an EXACT 1 to reach Square 108 (Moksha). Only perfect surrender opens the final gate. No Navagraha can touch you here. No seeker can swap or push you. You are beyond the material world.`,
  },
  {
    icon: '⚡', title: 'Karma Victory',
    body: `If at any point your total Punya reaches 30, you achieve instant Karma Victory — Moksha is yours regardless of your position on the board. This is the alternative path to liberation: not through position, but through accumulated virtue.`,
  },
  {
    icon: '☠️', title: 'Playing vs Yama',
    body: `In solo mode, you face Yama — the God of Death — as a CPU opponent. Yama plays every turn automatically, with a slight bias towards Papa-generating outcomes (60%). He is cold, karmic, and inevitable. Defeat Death by reaching Moksha before he does.`,
  },
  {
    icon: '🕉', title: 'Why 108?',
    body: `108 is the most sacred number in Vedic tradition. The Sun's diameter is 108 times the Earth's diameter. The distance from Earth to Moon is 108 times the Moon's diameter. There are 108 Upanishads, 108 beads on a mala. 108 energy channels converge at the heart chakra in yogic anatomy. In this game, 100 squares test your karma across three realms — the final 8 test your soul on Patanjali's sacred path.`,
  },
];

export default function HowToPlay({ onClose }) {
  const [open, setOpen] = useState(null);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(6,5,3,.97)',
      zIndex: 300, overflowY: 'auto',
      padding: 'clamp(12px,3vw,28px)',
      animation: 'fadeIn .3s ease',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,30px)', fontFamily: "'Yatra One',serif", color: '#f0d050', margin: '0 0 4px' }}>
              📜 How to Play
            </h2>
            <div style={{ fontSize: 10, letterSpacing: 4, color: '#5a4a30', fontFamily: "'Cinzel',serif" }}>
              MOKSHA PATAM 108 · मोक्ष पटम्
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(200,160,60,.2)', color: '#8a7a50', padding: '6px 16px', fontSize: 12, cursor: 'pointer', borderRadius: 3, fontFamily: "'Cinzel',serif", letterSpacing: 2 }}>
            ✕ Close
          </button>
        </div>

        {/* Gold divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(240,200,80,.3),transparent)', marginBottom: 24 }} />

        {/* Intro */}
        <div style={{ background: 'rgba(240,200,80,.04)', border: '1px solid rgba(240,200,80,.1)', borderRadius: 6, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#c0b080', lineHeight: 1.9, margin: 0, fontStyle: 'italic', fontFamily: "'IM Fell English',serif" }}>
            Moksha Patam is not just a board game. It is a map of the soul's journey across three cosmic realms — Bhuloka (Earth), Antarloka (Inner World), and Svargaloka (Celestial World) — towards the ultimate liberation. Every square teaches. Every choice carries karmic weight.
          </p>
        </div>

        {/* Accordion sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SECTIONS.map((s, i) => (
            <div key={i}
              style={{
                background: open === i ? 'rgba(20,16,10,.8)' : 'rgba(20,16,10,.5)',
                border: `1px solid ${open === i ? 'rgba(240,200,80,.2)' : 'rgba(200,160,60,.08)'}`,
                borderRadius: 4, overflow: 'hidden', transition: 'all .25s',
              }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', padding: '13px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: open === i ? '#f0d050' : '#c0b080', fontFamily: "'Cinzel',serif", letterSpacing: 1, flex: 1 }}>
                  {s.title}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(240,200,80,.3)', transition: 'transform .25s', transform: open === i ? 'rotate(180deg)' : 'none' }}>▼</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 16px 16px 52px' }}>
                  <p style={{ fontSize: 13, color: '#c0b080', lineHeight: 1.9, margin: 0, fontFamily: "'IM Fell English',serif", fontStyle: 'italic' }}>
                    {s.body}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick reference */}
        <div style={{ marginTop: 28, padding: 20, background: 'rgba(20,16,10,.6)', border: '1px solid rgba(200,160,60,.1)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#f0d050', letterSpacing: 3, marginBottom: 14, fontFamily: "'Cinzel',serif" }}>QUICK REFERENCE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 8 }}>
            {[
              ['𓆙 Snake', 'Slide DOWN · +2 Papa'],
              ['🪔 Ladder', 'Rise UP · +1 Punya'],
              ['⚖ Dilemma', 'Choose wisely · Karma awaits'],
              ['🛡 Shield', 'Blocks one serpent once'],
              ['🎯 Moksha', 'Sq 108 · Punya ≥ Papa'],
              ['⚡ Karma Win', '30 Punya = instant liberation'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                <span style={{ color: '#f0d050', minWidth: 80, fontFamily: "'Cinzel',serif", fontWeight: 700 }}>{k}</span>
                <span style={{ color: '#8a7a50' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(200,160,60,.06)' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(200,160,60,.2)', color: '#8a7a50', padding: '8px 28px', fontSize: 11, cursor: 'pointer', borderRadius: 3, fontFamily: "'Cinzel',serif", letterSpacing: 3 }}>
            Close · Begin Your Journey
          </button>
        </div>
      </div>
    </div>
  );
}
