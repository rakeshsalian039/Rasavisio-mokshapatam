// ═══════════════════════════════════════════════════════════════════════════════
// HOW TO PLAY — Cinematic Time-Travel to Vedic India
// 10-page scroll experience. Each page: shloka → title → body → visual grid.
// Feels like unrolling an ancient scroll in a Nalanda library.
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useRef } from 'react';
import TempleIcon from './TempleIcon';
import SacredPathIcon from './SacredPathIcon';
import { t } from '../i18n';

// ── Temple bell (inline — no import dependency) ──
const bellRef = { current: null };
function bell() {
  try {
    if (bellRef.current) { bellRef.current.pause(); bellRef.current.currentTime = 0; }
    const a = new Audio('/temple-bell.mp3'); a.volume = 0.4; bellRef.current = a;
    a.play().catch(() => {}); setTimeout(() => { try { a.pause() } catch (e) {} }, 2500);
  } catch (e) {}
}

// ── Per-popup language toggle button ──
function LangToggle({ popupLang, setPopupLang, chosenLang, color }) {
  const current = popupLang || chosenLang || 'en';
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <button onClick={(e) => { e.stopPropagation(); setPopupLang('en'); }} style={{
        padding: '3px 10px', fontSize: 10, fontFamily: "'Cinzel',serif",
        background: current === 'en' ? `${color}12` : 'transparent',
        border: `1px solid ${current === 'en' ? color + '40' : color + '15'}`,
        color: current === 'en' ? color : `${color}50`,
        borderRadius: 12, cursor: 'pointer', letterSpacing: 1,
      }}>EN</button>
      <button onClick={(e) => { e.stopPropagation(); setPopupLang('hi'); }} style={{
        padding: '3px 10px', fontSize: 10, fontFamily: "'Noto Serif Devanagari',serif",
        background: current === 'hi' ? `${color}12` : 'transparent',
        border: `1px solid ${current === 'hi' ? color + '40' : color + '15'}`,
        color: current === 'hi' ? color : `${color}50`,
        borderRadius: 12, cursor: 'pointer',
      }}>हिन्दी</button>
    </div>
  );
}

// ═══ THE 10 PAGES (dynamic — generated from i18n keys) ════════════════════
function getPages(lang) {
  const h = (key) => t(`howtoplay.${key}`, lang);
  return [
    // ─── 1. THE INVITATION ───
    {
      shloka: h('p0_shloka'), shlokaEn: h('p0_shlokaEn'),
      title: h('p0_title'), sub: h('p0_sub'), body: h('p0_body'),
      color: '#f0d050',
    },
    // ─── 2. THE BOARD ───
    {
      shloka: h('p1_shloka'), shlokaEn: h('p1_shlokaEn'),
      title: h('p1_title'), sub: h('p1_sub'), body: h('p1_body'),
      items: [
        { icon: '🌍', label: h('p1_item0_label'), desc: h('p1_item0_desc'), color: '#8a6030' },
        { icon: '🧠', label: h('p1_item1_label'), desc: h('p1_item1_desc'), color: '#5a80a0' },
        { icon: '✨', label: h('p1_item2_label'), desc: h('p1_item2_desc'), color: '#9070c0' },
        { icon: '🪷', label: h('p1_item3_label'), desc: h('p1_item3_desc'), color: '#f0d050' },
      ],
      color: '#c0a060',
    },
    // ─── 3. DICE ───
    {
      title: h('p2_title'), sub: h('p2_sub'), body: h('p2_body'),
      items: [
        { icon: '☀', label: h('p2_item0_label'), desc: h('p2_item0_desc'), color: '#f0b840' },
        { icon: '☾', label: h('p2_item1_label'), desc: h('p2_item1_desc'), color: '#a0c8e0' },
        { icon: '♂', label: h('p2_item2_label'), desc: h('p2_item2_desc'), color: '#e07050' },
        { icon: '♀', label: h('p2_item3_label'), desc: h('p2_item3_desc'), color: '#d0a0c0' },
        { icon: '♄', label: h('p2_item4_label'), desc: h('p2_item4_desc'), color: '#8080a0' },
      ],
      color: '#f0d050',
    },
    // ─── 4. SNAKES & LADDERS ───
    {
      shloka: h('p3_shloka'), shlokaEn: h('p3_shlokaEn'),
      title: h('p3_title'), sub: h('p3_sub'), body: h('p3_body'),
      items: [
        { icon: '𓆙', label: h('p3_item0_label'), desc: h('p3_item0_desc'), color: '#e06030' },
        { icon: '𓆙', label: h('p3_item1_label'), desc: h('p3_item1_desc'), color: '#e06030' },
        { icon: '🪔', label: h('p3_item2_label'), desc: h('p3_item2_desc'), color: '#f0d050' },
        { icon: '🪔', label: h('p3_item3_label'), desc: h('p3_item3_desc'), color: '#f0d050' },
      ],
      color: '#e08040',
    },
    // ─── 5. DHARMA DILEMMAS ───
    {
      title: h('p4_title'), sub: h('p4_sub'), body: h('p4_body'),
      items: [
        { icon: '⚖', label: h('p4_item0_label'), desc: h('p4_item0_desc'), color: '#d0b870' },
        { icon: '⚖', label: h('p4_item1_label'), desc: h('p4_item1_desc'), color: '#d0b870' },
        { icon: '⚖', label: h('p4_item2_label'), desc: h('p4_item2_desc'), color: '#d0b870' },
      ],
      color: '#d0b870',
    },
    // ─── 6. KNOWLEDGE TEMPLES ───
    {
      shloka: h('p5_shloka'), shlokaEn: h('p5_shlokaEn'),
      title: h('p5_title'), sub: h('p5_sub'), body: h('p5_body'),
      temples: [
        { name: 'वैद्यशाला', en: 'Hall of Healing', desc: h('p5_temple0_desc'), templeKey: 'vaidya', color: '#40a060' },
        { name: 'शिल्पशाला', en: 'Forge of Wonders', desc: h('p5_temple1_desc'), templeKey: 'shilpa', color: '#c09040' },
        { name: 'गणितपीठ', en: 'Throne of Numbers', desc: h('p5_temple2_desc'), templeKey: 'ganita', color: '#6080c0' },
        { name: 'शब्दमन्दिर', en: 'Temple of Sound', desc: h('p5_temple3_desc'), templeKey: 'shabda', color: '#a080c0' },
        { name: 'ज्योतिषपीठ', en: 'Observatory of Stars', desc: h('p5_temple4_desc'), templeKey: 'jyotish', color: '#4080c0' },
        { name: 'राजनीतिपीठ', en: 'Hall of Strategy', desc: h('p5_temple5_desc'), templeKey: 'rajniti', color: '#c0a040' },
        { name: 'कृषिपीठ', en: 'Garden of Earth', desc: h('p5_temple6_desc'), templeKey: 'krishi', color: '#80a040' },
        { name: 'कलापीठ', en: 'Temple of Arts', desc: h('p5_temple7_desc'), templeKey: 'kala', color: '#c060a0' },
        { name: 'दर्शनपीठ', en: 'Hall of Wisdom', desc: h('p5_temple8_desc'), templeKey: 'darshan', color: '#8060c0' },
      ],
      color: '#c09040',
    },
    // ─── 7. GURU ENCOUNTERS ───
    {
      shloka: h('p6_shloka'), shlokaEn: h('p6_shlokaEn'),
      title: h('p6_title'), sub: h('p6_sub'), body: h('p6_body'),
      gurus: [
        { id: 'aryabhata', name: 'आर्यभट', en: 'Aryabhata', era: '476 CE', title: h('p6_guru0_title'), blessing: h('p6_guru0_blessing'), color: '#4080c0' },
        { id: 'sushruta', name: 'सुश्रुत', en: 'Sushruta', era: '600 BCE', title: h('p6_guru1_title'), blessing: h('p6_guru1_blessing'), color: '#c04040' },
        { id: 'chanakya', name: 'चाणक्य', en: 'Chanakya', era: '375 BCE', title: h('p6_guru2_title'), blessing: h('p6_guru2_blessing'), color: '#c0a040' },
        { id: 'panini', name: 'पाणिनि', en: 'Panini', era: '400 BCE', title: h('p6_guru3_title'), blessing: h('p6_guru3_blessing'), color: '#a080c0' },
        { id: 'charaka', name: 'चरक', en: 'Charaka', era: '300 BCE', title: h('p6_guru4_title'), blessing: h('p6_guru4_blessing'), color: '#40a060' },
        { id: 'bhaskara', name: 'भास्कर', en: 'Bhaskara II', era: '1114 CE', title: h('p6_guru5_title'), blessing: h('p6_guru5_blessing'), color: '#60a0c0' },
        { id: 'varahamihira', name: 'वराहमिहिर', en: 'Varahamihira', era: '505 CE', title: h('p6_guru6_title'), blessing: h('p6_guru6_blessing'), color: '#6080a0' },
        { id: 'patanjali', name: 'पतञ्जलि', en: 'Patanjali', era: '200 BCE', title: h('p6_guru7_title'), blessing: h('p6_guru7_blessing'), color: '#c08060' },
      ],
      color: '#4080c0',
    },
    // ─── 8. COSMIC CARDS ───
    {
      title: h('p7_title'), sub: h('p7_sub'), body: h('p7_body'),
      color: '#f0d050',
    },
    // ─── 9. SACRED PATH ───
    {
      shloka: h('p8_shloka'), shlokaEn: h('p8_shlokaEn'),
      title: h('p8_title'), sub: h('p8_sub'), body: h('p8_body'),
      items: [
        { label: h('p8_item0_label'), desc: h('p8_item0_desc'), stepIdx: 0 },
        { label: h('p8_item1_label'), desc: h('p8_item1_desc'), stepIdx: 1 },
        { label: h('p8_item2_label'), desc: h('p8_item2_desc'), stepIdx: 2 },
        { label: h('p8_item3_label'), desc: h('p8_item3_desc'), stepIdx: 3 },
        { label: h('p8_item4_label'), desc: h('p8_item4_desc'), stepIdx: 4 },
        { label: h('p8_item5_label'), desc: h('p8_item5_desc'), stepIdx: 5 },
        { label: h('p8_item6_label'), desc: h('p8_item6_desc'), stepIdx: 6 },
        { label: h('p8_item7_label'), desc: h('p8_item7_desc'), stepIdx: 7 },
      ],
      color: '#f0d050',
    },
    // ─── 10. VICTORY ───
    {
      shloka: h('p9_shloka'), shlokaEn: h('p9_shlokaEn'),
      title: h('p9_title'), sub: h('p9_sub'),
      victory: [
        {
          icon: 'ॐ', label: h('p9_victory0_label'), color: '#f0d050',
          desc: h('p9_victory0_desc'),
        },
        {
          icon: '⚡', label: h('p9_victory1_label'), color: '#80c080',
          desc: h('p9_victory1_desc'),
        },
      ],
      color: '#f0d050',
    },
  ];
}

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

export default function HowToPlay({ onClose, chosenLang }) {
  const [page, setPage] = useState(0);
  const [vis, setVis] = useState(true);
  const [popupLang, setPopupLang] = useState(null);
  const scrollRef = useRef(null);

  const lang = popupLang || chosenLang || 'en';
  const pages = getPages(lang);

  const go = (p) => {
    if (p < 0 || p >= pages.length) return;
    setVis(false);
    bell();
    setTimeout(() => {
      setPage(p);
      setVis(true);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 350);
  };

  const pg = pages[page];

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
          {page + 1} / {pages.length}
        </span>
        <LangToggle popupLang={popupLang} setPopupLang={setPopupLang}
          chosenLang={chosenLang} color={pg.color} />
        <span style={{ fontSize: 11, letterSpacing: 5, color: pg.color,
          fontFamily: "'Cinzel',serif", fontWeight: 700 }}>
          {t('ui.how_to_play', lang)}
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
              {pg.temples.map((tp, i) => (
                <div key={i} style={{
                  padding: 'clamp(10px,2vw,16px) clamp(4px,1vw,8px)',
                  background: `${tp.color}08`, border: `1px solid ${tp.color}18`,
                  borderRadius: 10, textAlign: 'center',
                  ...ani(0.5 + i * 0.05),
                  animation: `htpReveal .5s cubic-bezier(0.16,1,0.3,1) ${0.5 + i * 0.05}s both`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                    <TempleIcon templeKey={tp.templeKey} size={36} color={tp.color} />
                  </div>
                  <div style={{
                    fontSize: 'clamp(10px,2vw,13px)', color: tp.color,
                    fontFamily: "'Noto Serif Devanagari',serif", fontWeight: 700,
                    lineHeight: 1.3, marginBottom: 2,
                  }}>{tp.name}</div>
                  <div style={{
                    fontSize: 'clamp(7px,1.3vw,9px)', color: 'rgba(255,255,255,.35)',
                    fontFamily: "'Cinzel',serif", letterSpacing: 1, marginBottom: 4,
                  }}>{tp.en}</div>
                  <div style={{
                    fontSize: 'clamp(7px,1.2vw,9px)', color: 'rgba(200,180,140,.4)',
                    lineHeight: 1.5,
                  }}>{tp.desc}</div>
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
          {page === 0 ? `✕ ${t('ui.close', lang)}` : t('ui.back', lang)}
        </button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {pages.map((_, i) => (
            <div key={i} onClick={() => go(i)} style={{
              width: i === page ? 14 : 5, height: 5, borderRadius: 3,
              background: i === page ? pg.color : `${pg.color}25`,
              cursor: 'pointer', transition: 'all .4s ease',
              animation: i === page ? 'htpDotPulse 2s ease infinite' : 'none',
            }} />
          ))}
        </div>

        {/* Next */}
        <button onClick={() => page === pages.length - 1 ? onClose() : go(page + 1)} style={{
          background: page === pages.length - 1 ? `${pg.color}12` : 'transparent',
          border: `1px solid ${page === pages.length - 1 ? pg.color + '45' : pg.color + '20'}`,
          color: page === pages.length - 1 ? pg.color : `${pg.color}80`,
          padding: '7px 14px', fontSize: page === pages.length - 1 ? 11 : 10,
          cursor: 'pointer', borderRadius: 4, fontFamily: "'Cinzel',serif",
          letterSpacing: 2, fontWeight: page === pages.length - 1 ? 700 : 400,
          minWidth: 70,
        }}>
          {page === pages.length - 1 ? t('ui.begin', lang) : t('ui.next', lang)}
        </button>
      </div>

      {/* ── Bottom ornamental line ── */}
      <div style={{ width: '100%', height: 2, flexShrink: 0,
        background: `linear-gradient(90deg,transparent,${pg.color}35,transparent)` }} />
    </div>
  );
}
