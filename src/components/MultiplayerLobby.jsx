/**
 * MultiplayerLobby.jsx — The Sacred Temple Gate
 *
 * You are standing at the entrance of an ancient Vedic temple at night.
 * Three stone archways glow before you. The OM drone hums at 136Hz.
 * When you touch a door — it opens.
 *
 * ✦ CinematicCanvas: starfield + Sri Yantra + incense smoke
 * ✦ AudioEngine: Web Audio API — OM drone, temple bells, hover tones, portal sweep
 * ✦ TempleGate: 3D perspective stone arch, Sanskrit carvings, light-leak on hover
 * ✦ PortalFlash: cinematic white-light view transition
 * ✦ Fully mobile-responsive
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { createRoom, joinRoom, quickMatch, getActiveSeekerCount } from '../services/roomService';
import WaitingRoom from './WaitingRoom';
import { CHARS } from '../tiers/moksha/constants';

// ═══════════════════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@700;900&family=Noto+Serif+Devanagari:wght@300;400;700&family=IM+Fell+English:ital@0;1&display=swap');
:root {
  --gold: #f0d050; --gold2: #c8a028; --saffron: #e07820;
  --cosmos: #08060400; --stone: #1a1408; --stone2: #231b0c;
  --text: #d0b870; --text2: #8a7050;
  --glow: rgba(240,208,80,.18); --glowB: rgba(240,208,80,.06);
}
* { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Page ── */
.ml-page {
  position: fixed; inset: 0;
  background: radial-gradient(ellipse at 50% 35%, #1e180a 0%, #0c0a07 55%, #050403 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow-x: hidden; overflow-y: auto;
  font-family: 'Cinzel', serif; color: var(--gold);
  padding: env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0);
  -webkit-overflow-scrolling: touch;
}
.ml-canvas { position: absolute; inset: 0; pointer-events: none; }

/* ── Portal flash overlay ── */
.ml-flash {
  position: fixed; inset: 0; z-index: 1000; pointer-events: none;
  background: radial-gradient(ellipse at 50% 50%, rgba(255,245,200,1) 0%, rgba(240,200,80,.9) 40%, transparent 100%);
  animation: ml-flash-anim .65s ease forwards;
}
@keyframes ml-flash-anim {
  0%   { opacity: 0; transform: scale(.1); }
  35%  { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(3); }
}

/* ── Entrance reveal ── */
.ml-reveal { opacity: 0; animation: ml-in .9s ease forwards; }
@keyframes ml-in {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ml-reveal-fast { opacity: 0; animation: ml-in .5s ease forwards; }

/* ── Header ── */
.ml-header { text-align: center; position: relative; z-index: 5; }
.ml-trident {
  font-size: clamp(36px, 5vw, 52px);
  filter: drop-shadow(0 0 20px rgba(240,208,80,.5));
  animation: ml-breathe 4s ease infinite;
  display: block; margin-bottom: 8px;
}
@keyframes ml-breathe {
  0%,100% { filter: drop-shadow(0 0 16px rgba(240,208,80,.35)); transform: scale(1); }
  50%      { filter: drop-shadow(0 0 32px rgba(240,208,80,.7));  transform: scale(1.06); }
}
.ml-title-skt {
  font-family: 'Noto Serif Devanagari', serif;
  font-size: clamp(26px, 5vw, 42px);
  color: var(--gold);
  text-shadow: 0 0 40px rgba(240,208,80,.25), 0 2px 20px rgba(0,0,0,.8);
  letter-spacing: 4px; line-height: 1.2;
  margin-bottom: 6px;
}
.ml-title-en {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(8px, 1.4vw, 12px);
  letter-spacing: clamp(6px, 2vw, 12px);
  color: rgba(240,208,80,.4);
  margin-bottom: 4px;
}
.ml-tagline {
  font-family: 'IM Fell English', serif;
  font-style: italic;
  font-size: clamp(12px, 1.8vw, 15px);
  color: rgba(200,170,100,.55);
  letter-spacing: 1px;
}

/* ── Divider ── */
.ml-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 16px auto; width: min(280px, 60vw);
}
.ml-divider::before, .ml-divider::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(240,208,80,.28));
}
.ml-divider::after { background: linear-gradient(90deg, rgba(240,208,80,.28), transparent); }
.ml-divider-dot { width: 6px; height: 6px; border-radius: 50%;
  background: rgba(240,208,80,.5); flex-shrink: 0; }

/* ── Three gates layout ── */
.ml-gates {
  display: flex; gap: clamp(10px, 2vw, 20px);
  justify-content: center; align-items: flex-end;
  flex-wrap: nowrap; position: relative; z-index: 5;
  padding: 0 12px;
}
@media (max-width: 680px) {
  .ml-gates { flex-direction: column; align-items: center; gap: 8px; }
}

/* ── Temple Gate ── */
.ml-gate {
  position: relative;
  width: clamp(150px, 26vw, 215px);
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform .42s cubic-bezier(.34,1.56,.64,1), filter .35s ease;
  user-select: none; -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
@media (max-width: 680px) {
  .ml-gate { width: min(88vw, 340px); }
}
/* ── Mobile gate: horizontal card layout ── */
@media (max-width: 520px) {
  .ml-gate { width: min(92vw, 360px); }
  .ml-gate-arch {
    display: flex !important;
    flex-direction: row !important;
    align-items: center;
    padding: 14px 18px !important;
    min-height: 72px;
  }
  .ml-gate-content {
    flex-direction: row !important;
    padding: 0 !important;
    gap: 14px;
    align-items: center;
    justify-content: flex-start !important;
    width: 100%;
  }
  .ml-gate-icon { font-size: 32px !important; margin-bottom: 0 !important; flex-shrink: 0; }
  .ml-gate-ornament { display: none; }
  .ml-gate-skt { font-size: 16px !important; text-align: left !important; }
  .ml-gate-en  { font-size: 9px  !important; text-align: left !important; margin: 2px 0 !important; }
  .ml-gate-sub { font-size: 10px !important; text-align: left !important; }
  .ml-gate-center .ml-gate-arch { min-height: 80px; }
  .ml-gate-center .ml-gate-icon { font-size: 36px !important; }
  .ml-gate-carving { font-size: 40px !important; }
  /* Hide arch SVG on small mobile — it wastes 38px per door */
  .ml-gate-arch-svg { display: none; }
  /* Left accent bar replaces arch */
  .ml-gate-arch::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px;
    background: currentColor;
    border-radius: 2px 0 0 2px;
    opacity: .5;
  }
}

.ml-gate-arch {
  position: relative; width: 100%;
  padding-bottom: 28px;
  border-left: 1.5px solid; border-right: 1.5px solid; border-bottom: 1.5px solid;
  border-image: none;
  transition: border-color .35s, box-shadow .35s, background .35s;
  overflow: hidden;
}
/* Arch top (pseudo-element rounded) handled by SVG overlay */

.ml-gate-content {
  display: flex; flex-direction: column; align-items: center;
  padding: clamp(16px,3vw,28px) clamp(12px,2vw,20px) 10px;
  position: relative; z-index: 2;
}
.ml-gate-icon {
  font-size: clamp(38px, 6vw, 54px);
  line-height: 1;
  transition: transform .35s, filter .35s;
  margin-bottom: 6px;
}
.ml-gate-ornament { margin: 4px 0 6px; }
.ml-gate-skt {
  font-family: 'Noto Serif Devanagari', serif;
  font-size: clamp(15px, 2.5vw, 20px);
  color: var(--gold);
  letter-spacing: 1px; text-align: center;
  transition: text-shadow .35s;
  line-height: 1.3;
}
.ml-gate-en {
  font-family: 'Cinzel', serif;
  font-size: clamp(9px, 1.4vw, 11px);
  letter-spacing: clamp(3px, 1vw, 5px);
  color: rgba(200,170,80,.6);
  font-weight: 700; text-transform: uppercase;
  margin: 5px 0 3px;
}
.ml-gate-sub {
  font-family: 'IM Fell English', serif;
  font-style: italic;
  font-size: clamp(10px, 1.5vw, 12px);
  color: rgba(180,150,70,.45);
  text-align: center; line-height: 1.5;
}
/* Loading state */
.ml-gate-loading .ml-gate-icon { animation: ml-spin .8s linear infinite; }
@keyframes ml-spin { to { transform: rotate(360deg); } }

/* Inner light glow (revealed on hover) */
.ml-gate-light {
  position: absolute; inset: 0; z-index: 1;
  opacity: 0; transition: opacity .4s;
  pointer-events: none;
}

/* Column variant (center door is taller) */
.ml-gate-center .ml-gate-arch { padding-bottom: 36px; }
.ml-gate-center .ml-gate-icon { font-size: clamp(44px, 7vw, 64px); }

/* ── Carved Sanskrit BG text ── */
.ml-gate-carving {
  position: absolute; inset: 0; z-index: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Noto Serif Devanagari', serif;
  font-size: clamp(52px, 9vw, 80px);
  color: rgba(240,208,80,.03);
  pointer-events: none; overflow: hidden;
  transition: color .4s;
}

/* ── Bottom area ── */
.ml-footer { position: relative; z-index: 5; text-align: center; }
.ml-seekers {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: 'Cinzel', serif; font-size: 10px;
  letter-spacing: 2px; color: rgba(180,150,70,.5);
  text-transform: uppercase; margin-bottom: 12px;
}
.ml-seekers-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #60c060;
  box-shadow: 0 0 8px rgba(96,200,96,.6);
  animation: ml-blink 2.5s ease infinite;
}
@keyframes ml-blink { 0%,100%{ opacity:.7;transform:scale(1) } 50%{ opacity:1;transform:scale(1.4) } }
.ml-back-btn {
  background: transparent; border: none;
  color: rgba(180,140,60,.28); font-size: 9px;
  font-family: 'Cinzel', serif; letter-spacing: 3px;
  cursor: pointer; transition: color .25s; text-transform: uppercase;
  min-height: 44px; min-width: 44px; padding: 10px 16px;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation;
}
.ml-back-btn:hover { color: rgba(180,140,60,.65); }

/* ── Mobile header compact ── */
@media (max-width: 520px) {
  .ml-trident { font-size: 32px !important; margin-bottom: 4px; }
  .ml-title-skt { font-size: 24px !important; letter-spacing: 2px !important; }
  .ml-title-en  { font-size: 8px  !important; letter-spacing: 4px !important; }
  .ml-tagline   { font-size: 11px !important; }
  .ml-divider   { margin: 10px auto !important; }
  .ml-footer    { margin-top: 10px !important; }
}
@media (max-width: 380px) {
  .ml-title-skt { font-size: 20px !important; }
}
/* ── Mute button ── */
.ml-mute {
  position: fixed; top: 16px; right: 16px; z-index: 20;
  background: rgba(12,10,7,.6); border: 1px solid rgba(240,208,80,.12);
  color: rgba(240,208,80,.4); width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 14px; transition: all .25s; border-radius: 2px;
  backdrop-filter: blur(8px);
}
.ml-mute:hover { border-color: rgba(240,208,80,.3); color: rgba(240,208,80,.8); }

/* ── Create view ── */
.ml-create { text-align: center; position: relative; z-index: 5;
  animation: ml-in .5s ease both; }
.ml-create-label {
  font-family: 'Cinzel', serif; font-size: 9px;
  letter-spacing: 6px; color: rgba(240,208,80,.4);
  text-transform: uppercase; margin-bottom: 6px;
}
.ml-create-sub {
  font-family: 'IM Fell English', serif; font-style: italic;
  font-size: 14px; color: rgba(200,170,80,.45); margin-bottom: 24px;
}
.ml-seeker-btns { display: flex; gap: 14px; justify-content: center; margin-bottom: 20px; }
.ml-seeker-btn {
  width: clamp(80px, 22vw, 100px); height: clamp(80px, 22vw, 100px);
  background: radial-gradient(ellipse at 50% 30%, rgba(200,160,60,.12), rgba(200,160,60,.02) 70%);
  border: 1.5px solid rgba(200,160,60,.3); cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  color: var(--gold); font-family: 'Cinzel Decorative', serif; font-size: 26px; font-weight: 700;
  transition: all .3s; position: relative; overflow: hidden; border-radius: 2px;
}
.ml-seeker-btn:hover {
  background: radial-gradient(ellipse at 50% 30%, rgba(200,160,60,.22), rgba(200,160,60,.06) 70%);
  border-color: rgba(240,200,80,.6);
  box-shadow: 0 0 24px rgba(240,200,80,.1);
  transform: translateY(-3px);
}
.ml-seeker-lbl { font-family: 'Cinzel', serif; font-size: 8px;
  color: rgba(200,160,60,.45); letter-spacing: 2px; }

/* ── Join view ── */
.ml-join { text-align: center; position: relative; z-index: 5;
  animation: ml-in .5s ease both; }
.ml-join-frame {
  position: relative; border: 1px solid rgba(200,160,60,.14);
  padding: 22px 22px 18px; margin-bottom: 16px; border-radius: 2px;
  background: rgba(12,10,7,.4);
}
.ml-code-slots { display: flex; gap: 7px; justify-content: center; margin-bottom: 14px; }
.ml-code-slot {
  width: clamp(40px, 11vw, 52px); height: clamp(48px, 12vw, 60px);
  background: rgba(200,160,60,.04); border: 1.5px solid rgba(200,160,60,.2);
  border-radius: 3px; display: flex; align-items: center; justify-content: center;
  font-family: 'Cinzel', serif; font-size: clamp(18px, 4vw, 24px);
  font-weight: 700; color: var(--gold);
  transition: all .2s;
}
.ml-code-slot.filled {
  background: rgba(200,160,60,.1); border-color: rgba(240,200,80,.5);
  box-shadow: 0 0 10px rgba(240,200,80,.08);
}
.ml-code-slot.active { animation: ml-slot-pulse 1.4s ease infinite; }
@keyframes ml-slot-pulse {
  0%,100%{ border-color: rgba(240,200,80,.35) }
  50%    { border-color: rgba(240,200,80,.8); box-shadow: 0 0 14px rgba(240,200,80,.2) }
}
.ml-code-hint {
  font-family: 'Cinzel', serif; font-size: 8px;
  color: rgba(200,160,60,.3); letter-spacing: 2px;
  margin-bottom: 4px; text-transform: uppercase;
}

/* ── Shared controls ── */
.ml-btn {
  padding: clamp(10px,2vw,13px) clamp(24px,4vw,36px);
  font-family: 'Cinzel', serif; font-size: clamp(10px,1.6vw,12px);
  letter-spacing: 4px; text-transform: uppercase; cursor: pointer;
  transition: all .3s; border: 1px solid;
  min-height: 44px; touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.ml-btn-gold {
  background: linear-gradient(180deg, rgba(240,200,80,.18), rgba(200,160,50,.07));
  border-color: rgba(240,200,80,.45); color: var(--gold);
}
.ml-btn-gold:hover:not(:disabled) {
  background: linear-gradient(180deg, rgba(240,200,80,.26), rgba(200,160,50,.12));
  border-color: var(--gold); box-shadow: 0 0 24px rgba(240,200,80,.12);
}
.ml-btn-ghost { background: transparent; border-color: rgba(200,160,60,.12); color: rgba(200,160,60,.4); }
.ml-btn-ghost:hover { border-color: rgba(200,160,60,.28); color: rgba(200,160,60,.7); }
.ml-btn:disabled { opacity: .3; cursor: not-allowed; }
.ml-btn-row { display: flex; gap: 10px; justify-content: center; }

.ml-error {
  font-family: 'IM Fell English', serif; font-style: italic;
  font-size: 12px; color: #c06040;
  margin-bottom: 12px; text-align: center; letter-spacing: .5px;
  padding: 8px 14px; background: rgba(160,40,40,.1);
  border: 1px solid rgba(200,60,60,.18);
}

.ml-spin { display: inline-block; animation: ml-spin .7s linear infinite; }
`;

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO ENGINE — Web Audio API
// ═══════════════════════════════════════════════════════════════════════════
const Audio = {
  ctx: null, master: null, ambient: null, muted: false,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.45;
      this.master.connect(this.ctx.destination);
    } catch(e) { console.warn('AudioContext unavailable'); }
  },

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.45, this.ctx.currentTime, 0.3);
  },

  _tone(freq, type, gainVal, duration, fadeTime) {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const g   = this.ctx.createGain();
    osc.connect(g); g.connect(this.master);
    osc.frequency.value = freq; osc.type = type;
    g.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.start(); osc.stop(this.ctx.currentTime + duration + 0.05);
  },

  bells() {
    // 3 ascending temple bells
    [528, 639, 741].forEach((f, i) => {
      setTimeout(() => this._tone(f, 'sine', 0.22, 2.5), i * 380);
    });
  },

  hover() { this._tone(741, 'sine', 0.045, 0.35); },

  click() {
    this._tone(528, 'sine', 0.18, 1.8);
    this._tone(264, 'sine', 0.1,  1.2);
  },

  portal() {
    if (!this.ctx || this.muted) return;
    // Upward freq sweep
    const osc = this.ctx.createOscillator();
    const g   = this.ctx.createGain();
    osc.connect(g); g.connect(this.master);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220,  this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.7);
    g.gain.setValueAtTime(0.18, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.9);
    osc.start(); osc.stop(this.ctx.currentTime + 1);
    // Low resonance
    this._tone(136.1, 'sine', 0.12, 2);
  },

  startAmbient() {
    if (!this.ctx || this.ambient) return;
    // OM fundamental 136.1Hz (sacred cosmic frequency, C# in 432Hz tuning)
    const nodes = [];
    [[136.1, 0.07], [136.1 * 1.0045, 0.05], [272.2, 0.025], [408.3, 0.015]].forEach(([f, v]) => {
      const osc = this.ctx.createOscillator();
      const g   = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.value = v;
      osc.connect(g); g.connect(this.master);
      osc.start();
      nodes.push(osc, g);
    });
    this.ambient = nodes;
  },

  stopAmbient() {
    if (!this.ambient) return;
    this.ambient.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch(e){} });
    this.ambient = null;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CINEMATIC CANVAS — Starfield + Sacred Geometry + Incense Smoke
// ═══════════════════════════════════════════════════════════════════════════
function CinematicCanvas({ mouseRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let raf, frame = 0;

    const resize = () => {
      c.width  = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Stars
    const stars = Array.from({length: 340}, () => ({
      x: Math.random(), y: Math.random(),
      r: .4 + Math.random() * 1.4,
      twinkle: Math.random() * Math.PI * 2,
      speed:   .0008 + Math.random() * .0016,
    }));

    // Smoke particles (incense)
    const smoke = Array.from({length: 22}, (_, i) => ({
      x: .5 + (Math.random() - .5) * .04,
      y: .5 + Math.random() * .15,
      vx: (Math.random() - .5) * .00015,
      vy: -.0004 - Math.random() * .0006,
      life: Math.random(),
      maxLife: .6 + Math.random() * .5,
      r: 2 + Math.random() * 4,
    }));

    function resetSmoke(p) {
      p.x = .5 + (Math.random() - .5) * .03;
      p.y = .62 + Math.random() * .04;
      p.vx = (Math.random() - .5) * .00014;
      p.vy = -.00038 - Math.random() * .0005;
      p.life = 0;
      p.maxLife = .55 + Math.random() * .5;
      p.r = 2 + Math.random() * 5;
    }

    function draw() {
      frame++;
      const W = c.width, H = c.height;
      const cx = W / 2, cy = H / 2;
      const mx = mouseRef?.current?.x ?? .5;
      const my = mouseRef?.current?.y ?? .5;
      const px = (mx - .5) * 28; // parallax offset
      const py = (my - .5) * 14;

      ctx.fillStyle = 'rgba(8,6,4,.88)';
      ctx.fillRect(0, 0, W, H);

      const t = frame * .005;

      // ── Stars ──
      stars.forEach(s => {
        const tw = Math.sin(s.twinkle + frame * s.speed);
        const a = .15 + .18 * (tw * .5 + .5);
        ctx.beginPath();
        ctx.arc(s.x * W + px * .3, s.y * H + py * .15, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,245,210,${a})`;
        ctx.fill();
      });

      // ── Central radial glow ──
      const cg = ctx.createRadialGradient(cx + px*.1, cy + py*.1, 0, cx + px*.1, cy + py*.1, Math.min(W,H)*.52);
      cg.addColorStop(0,   'rgba(200,160,50,.055)');
      cg.addColorStop(.45, 'rgba(200,140,30,.022)');
      cg.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);

      const R = Math.min(W, H) * .42;

      // ── Concentric rings (breathing) ──
      for (let i = 1; i <= 6; i++) {
        const r = R * i / 6;
        const a = .03 + .025 * Math.sin(t * .4 + i * .7);
        ctx.beginPath();
        ctx.arc(cx + px * .2, cy + py * .1, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,160,50,${a})`;
        ctx.lineWidth = .7;
        ctx.stroke();
      }

      // ── Sri Yantra (9 triangles, 2 groups rotating opposite) ──
      const drawTri = (scale, up, alpha, lw, rotOff) => {
        const r = R * scale;
        ctx.save();
        ctx.translate(cx + px * .15, cy + py * .08);
        ctx.rotate(rotOff);
        ctx.strokeStyle = up
          ? `rgba(200,160,50,${alpha})`
          : `rgba(220,120,50,${alpha * .85})`;
        ctx.lineWidth = lw;
        ctx.beginPath();
        for (let k = 0; k < 3; k++) {
          const a = k * 2 * Math.PI / 3 + (up ? -Math.PI / 2 : Math.PI / 2);
          k === 0 ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a))
                  : ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
        }
        ctx.closePath(); ctx.stroke();
        ctx.restore();
      };

      const rot1 =  t * .008;
      const rot2 = -t * .006;
      [
        [.88, true,  .1,  .8, rot1], [.78, false, .09, .7, rot2],
        [.66, true,  .1,  .7, rot1], [.56, false, .09, .65, rot2],
        [.45, true,  .11, .65, rot1], [.36, false, .1,  .6, rot2],
        [.26, true,  .12, .6, rot1], [.18, false, .11, .55, rot2],
      ].forEach(args => drawTri(...args));

      // ── Metatron's cube lines (dim) ──
      const mHex = Array.from({length:6}, (_,i) => {
        const a = i * Math.PI / 3 + t * .004;
        return { x: cx + R * .38 * Math.cos(a) + px * .12, y: cy + R * .38 * Math.sin(a) + py * .06 };
      });
      ctx.strokeStyle = 'rgba(180,140,40,.038)';
      ctx.lineWidth = .5;
      for (let i = 0; i < mHex.length; i++) {
        for (let j = i + 1; j < mHex.length; j++) {
          ctx.beginPath();
          ctx.moveTo(mHex[i].x, mHex[i].y);
          ctx.lineTo(mHex[j].x, mHex[j].y);
          ctx.stroke();
        }
      }

      // ── 108-dot outer ring ──
      const dotR = R * .96;
      ctx.fillStyle = 'rgba(200,160,50,.3)';
      for (let i = 0; i < 108; i++) {
        const a = (i / 108) * Math.PI * 2 + t * .002;
        const major = i % 9 === 0;
        const x = cx + dotR * Math.cos(a) + px * .22;
        const y = cy + dotR * Math.sin(a) + py * .12;
        ctx.globalAlpha = major ? .55 : .14;
        ctx.beginPath();
        ctx.arc(x, y, major ? 2.2 : 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── Incense smoke ──
      smoke.forEach(p => {
        p.life += .012;
        if (p.life > p.maxLife) { resetSmoke(p); return; }
        const lt = p.life / p.maxLife;
        p.x += p.vx + Math.sin(t * 1.4 + p.r) * .0001;
        p.y += p.vy;
        p.vx *= .995;
        const a = (1 - lt) * (1 - lt) * .12;
        const x = p.x * W + px * .3;
        const y = p.y * H + py * .2;
        const sg = ctx.createRadialGradient(x, y, 0, x, y, p.r * 4 * (1 + lt));
        sg.addColorStop(0,   `rgba(220,190,140,${a})`);
        sg.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(x, y, p.r * 4 * (1 + lt), 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className="ml-canvas"/>;
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCH SVG — top of temple door
// ═══════════════════════════════════════════════════════════════════════════
function ArchTop({ color = 'rgba(200,160,60,.5)', glowColor = 'transparent', w = 215 }) {
  const h = 38;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}
      style={{display:'block', marginBottom:-1}}>
      <defs>
        <filter id="arch-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Stone arch shape */}
      <path d={`M0,${h} L0,${h*.5} Q${w/2},0 ${w},${h*.5} L${w},${h}`}
        fill="none" stroke={color} strokeWidth={1.5} filter="url(#arch-glow)"/>
      {/* Inner arch */}
      <path d={`M8,${h} L8,${h*.56} Q${w/2},8 ${w-8},${h*.56} L${w-8},${h}`}
        fill="none" stroke={color} strokeWidth={.6} opacity=".5"/>
      {/* Keystone dots */}
      <circle cx={w/2} cy={4} r={2.5} fill={color} opacity=".7"/>
      <circle cx={w/2} cy={4} r={1} fill={glowColor}/>
      {/* Corner lotus marks */}
      <circle cx={10} cy={h-6} r={2} fill="none" stroke={color} strokeWidth={.8} opacity=".5"/>
      <circle cx={w-10} cy={h-6} r={2} fill="none" stroke={color} strokeWidth={.8} opacity=".5"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORNAMENT — door divider
// ═══════════════════════════════════════════════════════════════════════════
function GateOrnament({ col }) {
  return (
    <svg viewBox="0 0 60 10" width={60} height={10} className="ml-gate-ornament" style={{opacity:.4}}>
      <line x1={0} y1={5} x2={20} y2={5} stroke={col} strokeWidth={.6}/>
      <circle cx={30} cy={5} r={3} fill="none" stroke={col} strokeWidth={.7}/>
      <circle cx={30} cy={5} r={1} fill={col}/>
      <line x1={40} y1={5} x2={60} y2={5} stroke={col} strokeWidth={.6}/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLE GATE — the door button
// ═══════════════════════════════════════════════════════════════════════════
function TempleGate({ icon, sanskrit, english, subtitle, carving,
                      borderCol, glowCol, lightCol, hoverRotate,
                      onClick, loading, variant = '' }) {
  const [hov, setHov] = useState(false);

  const onEnter = () => { setHov(true); Audio.hover(); };
  const onLeave = () => setHov(false);
  const onPress = () => { Audio.click(); onClick(); };

  const archCol   = hov ? glowCol : borderCol;
  const innerGlow = `radial-gradient(ellipse at 50% 30%, ${lightCol}, transparent 70%)`;

  return (
    <div
      className={`ml-gate ${variant} ${loading ? 'ml-gate-loading' : ''}`}
      style={{
        transform: hov
          ? `perspective(1100px) ${hoverRotate} translateY(-8px) scale(1.02)`
          : 'perspective(1100px) rotateX(0) rotateY(0)',
        filter: hov
          ? `drop-shadow(0 16px 32px rgba(0,0,0,.7)) drop-shadow(0 0 24px ${glowCol})`
          : `drop-shadow(0 6px 14px rgba(0,0,0,.5))`,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onPress}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onPress()}
    >
      {/* Arch top — hidden on mobile via CSS */}
      <div className="ml-gate-arch-svg"><ArchTop color={archCol} glowColor={hov ? glowCol : 'transparent'}/></div>

      {/* Main body */}
      <div className="ml-gate-arch" style={{
        borderColor: archCol,
        background: hov
          ? `linear-gradient(180deg, ${lightCol.replace(')', ',.12)')} 0%, rgba(12,10,7,.92) 100%)`
          : 'linear-gradient(180deg, rgba(22,18,8,.88), rgba(12,10,7,.95))',
        transition: 'all .35s',
      }}>
        {/* Inner light leak */}
        <div className="ml-gate-light" style={{ background: innerGlow, opacity: hov ? 1 : 0 }}/>

        {/* Carved background text */}
        <div className="ml-gate-carving" style={{ color: hov ? 'rgba(240,208,80,.055)' : 'rgba(240,208,80,.025)' }}>
          {carving}
        </div>

        {/* Content */}
        <div className="ml-gate-content">
          <div className="ml-gate-icon" style={{
            filter: hov
              ? `drop-shadow(0 0 16px ${glowCol}) drop-shadow(0 0 32px ${glowCol})`
              : `drop-shadow(0 0 8px ${glowCol})`,
            transform: hov ? 'scale(1.1) translateY(-3px)' : 'scale(1)',
            transition: 'transform .35s, filter .35s',
          }}>
            {loading ? <span className="ml-spin">◌</span> : icon}
          </div>

          <GateOrnament col={hov ? glowCol : borderCol}/>

          <div className="ml-gate-skt" style={{
            textShadow: hov ? `0 0 14px ${glowCol}` : 'none',
          }}>
            {loading ? 'खोज...' : sanskrit}
          </div>
          <div className="ml-gate-en">{english}</div>
          <div className="ml-gate-sub">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTAL FLASH
// ═══════════════════════════════════════════════════════════════════════════
function PortalFlash({ active }) {
  if (!active) return null;
  return <div className="ml-flash"/>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
export default function MultiplayerLobby({ userId, userName, onGameStart, onBack }) {
  const [view,      setView]      = useState('home');
  const [seekers,   setSeekers]   = useState(0);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState('');
  const [joinCode,  setJoinCode]  = useState('');
  const [roomData,  setRoomData]  = useState(null);
  const [flash,     setFlash]     = useState(false);
  const [muted,     setMuted]     = useState(false);
  const [audioOn,   setAudioOn]   = useState(false);

  const codeRef  = useRef(null);
  const mouseRef = useRef({ x: .5, y: .5 });

  const myChar = CHARS[0];

  // Mouse parallax
  useEffect(() => {
    const fn = e => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', fn, { passive: true });
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  // Seeker count poll
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const n = await getActiveSeekerCount().catch(() => 0);
      if (alive) setSeekers(n);
    };
    poll();
    const t = setInterval(poll, 14000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  // Audio init on first interaction
  const initAudio = useCallback(() => {
    if (audioOn) return;
    Audio.init();
    Audio.bells();
    setTimeout(() => Audio.startAmbient(), 800);
    setAudioOn(true);
  }, [audioOn]);

  useEffect(() => {
    const fn = () => initAudio();
    window.addEventListener('click', fn, { once: true });
    window.addEventListener('keydown', fn, { once: true });
    return () => { window.removeEventListener('click', fn); window.removeEventListener('keydown', fn); };
  }, [initAudio]);

  // Stop ambient on unmount
  useEffect(() => () => Audio.stopAmbient(), []);

  // Focus code input
  useEffect(() => {
    if (view === 'join') setTimeout(() => codeRef.current?.focus(), 120);
  }, [view]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    Audio.setMuted(next);
  };

  const goTo = (v, delay = 0) => {
    setFlash(true);
    Audio.portal();
    setTimeout(() => { setFlash(false); setView(v); setError(''); }, delay || 500);
  };

  const handle = async (key, fn) => {
    setError(''); setLoading(key);
    try { await fn(); }
    catch(e) { setError(e.message || 'The path is blocked. Try again.'); }
    finally { setLoading(''); }
  };

  const doQuick = () => handle('quick', async () => {
    const res = await quickMatch({ userId, playerName: userName || 'Seeker', charIdx: 0, char: myChar });
    setRoomData({ roomId: res.room.id, roomCode: res.code || res.room.code, myPlayerIndex: res.seat_index, maxPlayers: res.room.max_players });
    goTo('waiting');
  });

  const doCreate = (max) => handle('create', async () => {
    const { room, code } = await createRoom({ userId, maxPlayers: max, isPublic: false, playerName: userName || 'Seeker', charIdx: 0, char: myChar });
    setRoomData({ roomId: room.id, roomCode: code, myPlayerIndex: 0, maxPlayers: max, isPrivate: true });
    goTo('waiting');
  });

  const doJoin = () => {
    if (joinCode.length !== 6) { setError('Enter all 6 characters of the Sabha code.'); return; }
    handle('join', async () => {
      const { room, seat_index } = await joinRoom({ roomCode: joinCode, userId, playerName: userName || 'Seeker', charIdx: 0, char: myChar });
      setRoomData({ roomId: room.id, roomCode: joinCode.toUpperCase(), myPlayerIndex: seat_index, maxPlayers: room.max_players });
      goTo('waiting');
    });
  };

  // ── Waiting room ──
  if (view === 'waiting' && roomData) {
    return (
      <WaitingRoom
        roomId={roomData.roomId}
        roomCode={roomData.roomCode}
        userId={userId}
        myPlayerIndex={roomData.myPlayerIndex}
        isPrivate={roomData.isPrivate}
        maxPlayers={roomData.maxPlayers}
        onGameStart={onGameStart}
        onLeave={() => { setRoomData(null); setView('home'); Audio.bells(); }}
      />
    );
  }

  return (
    <div className="ml-page" onClick={initAudio}>
      <style>{CSS}</style>
      <PortalFlash active={flash}/>
      <CinematicCanvas mouseRef={mouseRef}/>

      {/* Mute button */}
      <button className="ml-mute" onClick={e => { e.stopPropagation(); toggleMute(); }} title={muted ? 'Unmute' : 'Mute'}>
        {muted ? '🔇' : '🔉'}
      </button>

      {/* ── CREATE view ── */}
      {view === 'create' && (
        <div className="ml-create" style={{maxWidth:380}}>
          <div className="ml-create-label">Create a Sacred Hall</div>
          <div className="ml-create-sub">How many seekers shall gather?</div>
          <div className="ml-seeker-btns">
            {[2,3,4].map((n,i) => (
              <button key={n} className="ml-seeker-btn"
                style={{animationDelay:`${.1+i*.1}s`}}
                onClick={() => doCreate(n)}
                disabled={!!loading}>
                {loading === 'create' ? <span className="ml-spin">◌</span> : n}
                <span className="ml-seeker-lbl">Seekers</span>
              </button>
            ))}
          </div>
          {error && <div className="ml-error">{error}</div>}
          <button className="ml-btn ml-btn-ghost" onClick={() => setView('home')}>← Back to Gates</button>
        </div>
      )}

      {/* ── JOIN view ── */}
      {view === 'join' && (
        <div className="ml-join" style={{maxWidth:360}}>
          <div className="ml-create-label" style={{marginBottom:16}}>Enter the Sabha</div>
          <div className="ml-join-frame">
            <div className="ml-code-hint">Sabha Code</div>
            <div className="ml-code-slots" onClick={() => codeRef.current?.focus()} style={{cursor:'pointer'}}>
              {Array.from({length:6}).map((_,i) => (
                <div key={i} className={`ml-code-slot ${joinCode[i] ? 'filled' : ''} ${i === joinCode.length ? 'active' : ''}`}>
                  {joinCode[i] || ''}
                </div>
              ))}
            </div>
            {/* Hidden real input */}
            <input ref={codeRef} value={joinCode} maxLength={6}
              onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''))} inputMode="text" autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false}
              onKeyDown={e => e.key === 'Enter' && doJoin()}
              style={{position:'absolute',opacity:.01,width:1,height:1,pointerEvents:'none'}}
            />
            <button onClick={() => codeRef.current?.focus()} style={{
              background:'transparent',border:'1px solid rgba(200,160,60,.12)',
              color:'rgba(200,160,60,.35)',padding:'5px 14px',cursor:'pointer',
              fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:3,textTransform:'uppercase',
            }}>
              Tap to type
            </button>
          </div>
          {error && <div className="ml-error">{error}</div>}
          <div className="ml-btn-row">
            <button className="ml-btn ml-btn-gold" onClick={doJoin} disabled={!!loading || joinCode.length < 6}>
              {loading === 'join' ? <span className="ml-spin">◌</span> : '🚪 Enter the Hall'}
            </button>
            <button className="ml-btn ml-btn-ghost" onClick={() => { setView('home'); setJoinCode(''); }}>← Back</button>
          </div>
        </div>
      )}

      {/* ── HOME view ── */}
      {view === 'home' && (
        <div style={{
          position:'relative',zIndex:5,display:'flex',flexDirection:'column',
          alignItems:'center',width:'100%',maxWidth:780,
          padding:'0 12px',gap:0,
        }}>
          {/* Header */}
          <div className="ml-header">
            <span className="ml-trident ml-reveal" style={{animationDelay:'.1s'}}>🔱</span>
            <div className="ml-title-skt ml-reveal" style={{animationDelay:'.3s'}}>
              विश्व क्रीड
            </div>
            <div className="ml-title-en ml-reveal" style={{animationDelay:'.5s'}}>
              World Game
            </div>
            <div className="ml-tagline ml-reveal" style={{animationDelay:'.65s'}}>
              Challenge seekers across the cosmos
            </div>
            <div className="ml-divider ml-reveal" style={{animationDelay:'.75s'}}>
              <div className="ml-divider-dot"/>
            </div>
          </div>

          {/* Three Gates */}
          <div className="ml-gates ml-reveal" style={{animationDelay:'.85s'}}>
            <TempleGate
              icon="⚡"
              sanskrit="क्षिप्र युद्ध"
              english="Quick Battle"
              subtitle="Find an opponent instantly"
              carving="युद्ध"
              borderCol="rgba(180,140,50,.35)"
              glowCol="rgba(240,200,80,.55)"
              lightCol="rgba(240,200,80"
              hoverRotate="rotateY(6deg) rotateX(-4deg)"
              onClick={doQuick}
              loading={loading === 'quick'}
            />
            <TempleGate
              icon="🏛"
              sanskrit="धर्म सभा"
              english="Create Hall"
              subtitle="Invite friends with a sacred code"
              carving="सभा"
              borderCol="rgba(190,145,45,.4)"
              glowCol="rgba(255,210,90,.6)"
              lightCol="rgba(255,210,90"
              hoverRotate="rotateX(-6deg)"
              onClick={() => goTo('create', 480)}
              loading={loading === 'create'}
              variant="ml-gate-center"
            />
            <TempleGate
              icon="🚪"
              sanskrit="प्रवेश"
              english="Enter Room"
              subtitle="Join with a Sabha code"
              carving="प्रवेश"
              borderCol="rgba(180,140,50,.35)"
              glowCol="rgba(240,200,80,.55)"
              lightCol="rgba(240,200,80"
              hoverRotate="rotateY(-6deg) rotateX(-4deg)"
              onClick={() => goTo('join', 480)}
              loading={loading === 'join'}
            />
          </div>

          {error && <div className="ml-error ml-reveal" style={{animationDelay:'.1s',maxWidth:380,marginTop:14}}>{error}</div>}

          {/* Footer */}
          <div className="ml-footer ml-reveal" style={{animationDelay:'1.1s',marginTop:20}}>
            <div className="ml-seekers">
              <span className="ml-seekers-dot"/>
              {seekers > 0
                ? `${seekers} seeker${seekers !== 1 ? 's' : ''} on the path right now`
                : 'Be the first seeker online'}
            </div>
            <br/>
            <button className="ml-back-btn" onClick={onBack}>← Return to Temple</button>
          </div>
        </div>
      )}
    </div>
  );
}
