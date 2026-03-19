/* ═══════════════════════════════════════
   AUDIO ENGINE
   Voice: Puter.js AI (OpenAI/ElevenLabs/Polly) → Browser fallback
   Ambient: Tanpura drone via Web Audio
   SFX: Dice, snake, ladder, dilemma, victory, move
   ═══════════════════════════════════════ */
import { useCallback, useRef } from 'react';

// Global voice language selection
let voiceLang = 'en';
export function setVoiceLang(lang) { voiceLang = lang; }
export function getVoiceLang() { return voiceLang; }

/* ═══ PUTER.JS AI VOICE ═══ */
export const Voice = {
  audio: null,
  muted: false,
  engine: 'detecting',

  init() {
    if (window.__puterOk && typeof window.puter !== 'undefined') {
      this.engine = 'puter';
    } else if ('speechSynthesis' in window) {
      this.engine = 'browser';
      window.speechSynthesis.getVoices();
    } else {
      this.engine = 'none';
    }
  },

  async speak(text) {
    if (this.muted || !text) return;
    this.stop();

    if (this.engine === 'puter') {
      // Try OpenAI first (best quality)
      try {
        const isHi = voiceLang === 'hi';
        const audio = await window.puter.ai.txt2speech(text, {
          provider: "openai",
          voice: isHi ? "nova" : "onyx",
          model: "gpt-4o-mini-tts",
          instructions: isHi
            ? "You are an ancient Indian storyteller narrating in Hindi. Speak slowly, mysteriously, with deep emotion."
            : "You are an ancient sage narrating an epic tale. Speak slowly and dramatically with gravitas."
        });
        this.audio = audio;
        audio.play();
        return;
      } catch (e) { /* fall through */ }

      // Try ElevenLabs
      try {
        const audio = await window.puter.ai.txt2speech(text, {
          provider: "elevenlabs",
          voice: "21m00Tcm4TlvDq8ikWAM",
          model: "eleven_multilingual_v2"
        });
        this.audio = audio;
        audio.play();
        return;
      } catch (e) { /* fall through */ }

      // Try AWS Polly
      try {
        const isHi = voiceLang === 'hi';
        const audio = await window.puter.ai.txt2speech(text, {
          voice: isHi ? "Kajal" : "Joanna",
          engine: "neural",
          language: isHi ? "hi-IN" : "en-US"
        });
        this.audio = audio;
        audio.play();
        return;
      } catch (e) { /* fall through */ }

      // Simplest Puter call
      try {
        const audio = await window.puter.ai.txt2speech(text);
        this.audio = audio;
        audio.play();
        return;
      } catch (e) { /* fall through */ }
    }

    // Browser speech fallback
    this._browserSpeak(text);
  },

  _browserSpeak(text) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.72; u.pitch = 0.85; u.volume = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const isHi = voiceLang === 'hi';
      const v = isHi
        ? (voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang.startsWith('hi')) || voices[0])
        : (voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en')) || voices[0]);
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* silent fail */ }
  },

  stop() {
    if (this.audio) { try { this.audio.pause(); this.audio.currentTime = 0; } catch (e) {} this.audio = null; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) { this.stop(); Ambient.stop(); }
  }
};

/* ═══ AMBIENT TANPURA DRONE ═══ */
export const Ambient = {
  ctx: null, nodes: [], on: false,
  start() {
    if (this.on || Voice.muted) return;
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      this.ctx = c;
      [130.81, 196, 261.63].forEach(f => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(0.015, c.currentTime + 2);
        o.connect(g); g.connect(c.destination); o.start();
        this.nodes.push({ o, g });
      });
      this.on = true;
    } catch (e) {}
  },
  stop() {
    if (!this.on) return;
    this.nodes.forEach(({ o, g }) => {
      try { g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5); o.stop(this.ctx.currentTime + 0.6); } catch (e) {}
    });
    this.nodes = []; this.on = false;
    setTimeout(() => { try { this.ctx?.close(); } catch (e) {} this.ctx = null; }, 800);
  }
};

/* ═══ SFX HOOK ═══ */
export function useSound() {
  const ctx = useRef(null);
  const gc = useCallback(() => {
    if (!ctx.current) try { ctx.current = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    return ctx.current;
  }, []);

  return useCallback((type) => {
    if (Voice.muted) return;
    try {
      const c = gc(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      const t = c.currentTime;
      if (type === "dice") { o.type = "square"; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(600, t + .05); o.frequency.exponentialRampToValueAtTime(150, t + .15); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.01, t + .2); o.start(t); o.stop(t + .2); }
      else if (type === "snake") { o.type = "sawtooth"; o.frequency.setValueAtTime(800, t); o.frequency.exponentialRampToValueAtTime(80, t + .6); g.gain.setValueAtTime(.07, t); g.gain.exponentialRampToValueAtTime(.001, t + .7); o.start(t); o.stop(t + .7); }
      else if (type === "ladder") { o.type = "sine"; o.frequency.setValueAtTime(400, t); g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.start(t); o.stop(t + .3); }
      else if (type === "dilemma") { o.type = "sine"; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(80, t + .8); g.gain.setValueAtTime(.1, t); g.gain.exponentialRampToValueAtTime(.001, t + 1); o.start(t); o.stop(t + 1); }
      else if (type === "victory") { o.type = "sine"; o.frequency.setValueAtTime(523, t); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.001, t + .8); o.start(t); o.stop(t + .8); }
      else if (type === "move") { o.type = "sine"; o.frequency.setValueAtTime(350, t); g.gain.setValueAtTime(.03, t); g.gain.exponentialRampToValueAtTime(.001, t + .08); o.start(t); o.stop(t + .08); }
    } catch (e) {}
  }, [gc]);
}
