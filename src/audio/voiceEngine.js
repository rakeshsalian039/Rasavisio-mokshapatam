// ═══ VOICE & AUDIO ENGINE ═══
//
// Contains:
// - AudioCache: Preloads and caches TTS audio from OpenAI API
// - STATIC_VOICES: Map of pre-recorded MP3 files (zero API cost)
// - VoiceEngine: Main voice system with methods:
//     .speak(text, lang) — General narration (API → browser fallback)
//     .speakYama(text, lang) — Yama's voice with Web Audio processing
//     .speakNarrator(text, lang) — Vedic narrator with Om drone
//     .playStatic(url) — Play a static MP3 file
//     .stop() — Stop all audio
//
// TO CHANGE VOICES: Edit the 'voice' parameter in fetch calls (ash, onyx, etc.)
// TO ADD STATIC FILES: Add new entries to STATIC_VOICES map + put MP3 in /public/

/* ═══ VOICEOVER — Puter.js Neural AI → Browser Fallback ═══ */
/* ═══ AUDIO CACHE — Preloads all narration, plays instantly ═══ */
import { supabase } from '../auth/supabaseClient';

async function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (!supabase) return headers;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (e) { /* guest user — TTS will fall back to browser speech */ }
  return headers;
}

export const AudioCache = {
  cache: {},
  loading: {},

  _key(text) { return text.slice(0, 80); },

  async fetchTTS(text, lang, voiceOverride, instructionOverride) {
    const key = this._key(text);
    if (this.cache[key]) return this.cache[key];
    if (this.loading[key]) return this.loading[key];

    const promise = (async () => {
      const headers = await getAuthHeaders();
      const r = await fetch('/api/tts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: text.slice(0, 1000),
          voice: voiceOverride || 'ash',
        }),
      });
      if (!r.ok) throw new Error('TTS failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      this.cache[key] = url;
      delete this.loading[key];
      return url;
    })().catch(e => {
      delete this.loading[key];
      return null;
    });

    this.loading[key] = promise;
    return promise;
  },

  get(text) { return this.cache[this._key(text)] || null; },

  preloadAll(lang) {
    const texts = [];
    STORY_PAGES.forEach(p => texts.push({ text: p[lang], lang }));
    CHARS.forEach(c => texts.push({ text: lang === 'hi' ? c.voiceHi : c.voiceEn, lang }));
    let done = 0;
    const total = texts.length;
    const progress = () => Math.round((done / total) * 100);
    return {
      promise: Promise.all(texts.map(t => this.fetchTTS(t.text, t.lang).then(() => { done++; }))),
      progress, total,
    };
  },

  // Preload Yama intro + all character voices for instant playback
  preloadGameVoices(lang) {
    const yamaEn='So, you dare to challenge me? I am Yama. The God of Death. I ride the great buffalo through the realm of the dead. Every soul that walks this board eventually comes to me. You think you can outwit Death? I have watched a million souls fall. Brave warriors. Wise sages. They all fell. And I devoured their karma. Play your little game, mortal. I will be watching every single move. And when your karma falters, I will be there. Now tell me, little soul. Who are you?';
    const yamaHi='तो, तुम मुझसे खेलना चाहते हो? मैं यमराज हूँ। मृत्यु का देवता। मैं महान भैंसे पर सवार होकर मृतकों के लोक से गुज़रता हूँ। हर आत्मा जो इस पट पर चलती है, अंत में मेरे पास आती है। मैंने लाखों आत्माओं को गिरते देखा है। वीर योद्धा। ज्ञानी ऋषि। सब गिरे। और मैंने उनका कर्म निगल लिया। खेलो अपना छोटा सा खेल, नश्वर प्राणी। मैं देख रहा हूँ। हर एक कदम। अब बताओ, छोटी सी आत्मा। तुम कौन हो?';
    const yamaVoice='onyx';
    const yamaInstructions='Speak like Thanos — an impossibly deep, heavy, rumbling bass voice that vibrates through the chest. Extremely slow and deliberate. Each word lands like a boulder. Long pauses between sentences. Absolute calm confidence of someone who has already won. No emotion, no anger — just cold, inevitable, cosmic authority. The voice of someone who has existed for billions of years and knows exactly how this ends. Whisper certain words for emphasis. This is not a villain — this is a force of nature speaking.';
    const texts = [];
    // Yama gets onyx voice with scary instructions
    texts.push({ text: lang === 'hi' ? yamaHi : yamaEn, lang, voice: yamaVoice, instructions: yamaInstructions });
    // Characters get normal ash voice
    CHARS.forEach(c => texts.push({ text: lang === 'hi' ? c.voiceHi : c.voiceEn, lang }));
    let done = 0;
    const total = texts.length;
    const progress = () => Math.round((done / total) * 100);
    return {
      promise: Promise.all(texts.map(t => this.fetchTTS(t.text, t.lang, t.voice, t.instructions).then(() => { done++; }))),
      progress, total,
    };
  },

  clear() {
    Object.values(this.cache).forEach(url => { try { URL.revokeObjectURL(url); } catch(e){} });
    this.cache = {};
    this.loading = {};
  },

  count() { return Object.keys(this.cache).length; },
};

/* ═══ STATIC VOICE FILES — zero API cost ═══ */
export const STATIC_VOICES = {
  yama: { en: '/yama-en.mp3', hi: '/yama-hi.mp3' },
  warrior: { en: '/char-warrior-en.mp3', hi: '/char-warrior-hi.mp3' },
  sage: { en: '/char-sage-en.mp3', hi: '/char-sage-hi.mp3' },
  healer: { en: '/char-healer-en.mp3', hi: '/char-healer-hi.mp3' },
  dancer: { en: '/char-dancer-en.mp3', hi: '/char-dancer-hi.mp3' },
  merchant: { en: '/char-merchant-en.mp3', hi: '/char-merchant-hi.mp3' },
  ascetic: { en: '/char-ascetic-en.mp3', hi: '/char-ascetic-hi.mp3' },
};

export const VoiceEngine = {
  audio: null,
  speaking: false,

  // Play a static MP3 file — instant, zero API cost
  playStatic(url) {
    this.stop();
    const audio = new Audio(url);
    audio.volume = 1.0;
    this.audio = audio;
    this.speaking = true;
    audio.onended = () => { this.speaking = false; };
    audio.play().catch(()=>{});
  },

  _pickBestVoice(voices, lang) {
    if (lang === 'hi') {
      return voices.find(v => v.name.includes('Google') && v.lang === 'hi-IN')
        || voices.find(v => v.lang === 'hi-IN')
        || voices.find(v => v.lang.startsWith('hi'))
        || voices[0];
    }
    const preferred = ['Google UK English Male','Daniel','Rishi','Google US English','Aaron','Samantha'];
    for (const name of preferred) { const v = voices.find(v => v.name.includes(name)); if (v) return v; }
    return voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en')) || voices[0];
  },

  _browserSpeak(text, lang) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.75; u.pitch = 0.8; u.volume = 1.0;
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-GB';
      const voices = window.speechSynthesis.getVoices();
      const best = this._pickBestVoice(voices, lang);
      if (best) u.voice = best;
      this.speaking = true;
      u.onend = () => { this.speaking = false; };
      window.speechSynthesis.speak(u);
    } catch (e) {}
  },

  async speak(text, lang) {
    // Force stop any existing voice first — prevents overlap
    this.stop();
    if (!text) return;

    const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);

    if (!isLocal) {
      const cached = AudioCache.get(text);
      if (cached) {
        const audio = new Audio(cached);
        audio.volume=1.0;
        this.audio = audio;
        this.speaking = true;
        audio.onended = () => { this.speaking = false; };
        await audio.play().catch(()=>{});
        return;
      }

      // Not cached — fetch now (will cache for next time)
      try {
        const url = await AudioCache.fetchTTS(text, lang);
        if (url) {
          const audio = new Audio(url);
          audio.volume=1.0;
          this.audio = audio;
          this.speaking = true;
          audio.onended = () => { this.speaking = false; };
          audio.play();
          return;
        }
      } catch (e) {}
    }

    // Fallback: browser speech
    this._browserSpeak(text, lang);
  },

  stop() {
    if (this.audio) { try { this.audio.pause(); this.audio.currentTime = 0; } catch (e) {} this.audio = null; }
    if (this._yamaCtx) { try { this._yamaCtx.close(); } catch(e){} this._yamaCtx = null; }
    if (this._yamaSource) { try { this._yamaSource.stop(); } catch(e){} this._yamaSource = null; }
    if (this._yamaSource2) { try { this._yamaSource2.stop(); } catch(e){} this._yamaSource2 = null; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    this.speaking = false;
  },

  // ═══ YAMA VOICE — Full audio processing for Thanos-like sound ═══
  async speakYama(text, lang) {
    this.stop();
    if (!text) return;

    // Use static MP3 file — zero API cost
    const staticUrl = STATIC_VOICES.yama[lang==='hi'?'hi':'en'];

    try {
      const resp = await fetch(staticUrl);
      const blob = await resp.blob();
      const arrayBuf = await blob.arrayBuffer();

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      this._yamaCtx = ctx;

      const buffer = await ctx.decodeAudioData(arrayBuf);

      // ═══ LAYER 1: Main voice (pitch 0.82) ═══
      const source1 = ctx.createBufferSource();
      source1.buffer = buffer;
      source1.playbackRate.value = 0.82;
      this._yamaSource = source1;

      // ═══ LAYER 2: Deep shadow (pitch 0.65, quiet) ═══
      const source2 = ctx.createBufferSource();
      source2.buffer = buffer;
      source2.playbackRate.value = 0.55;
      this._yamaSource2 = source2;

      const layer2Gain = ctx.createGain();
      layer2Gain.gain.value = 0.12;

      // ═══ SUB-BASS BOOST ═══
      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = 'lowshelf';
      bassBoost.frequency.value = 120;
      bassBoost.gain.value = 8;

      // ═══ HIGH CUT ═══
      const highCut = ctx.createBiquadFilter();
      highCut.type = 'lowpass';
      highCut.frequency.value = 5000;

      // ═══ MID CLARITY ═══
      const midBoost = ctx.createBiquadFilter();
      midBoost.type = 'peaking';
      midBoost.frequency.value = 1500;
      midBoost.gain.value = 3;
      midBoost.Q.value = 1;

      // ═══ DISTORTION ═══
      const distortion = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = (Math.PI + 10) * x / (Math.PI + 10 * Math.abs(x));
      }
      distortion.curve = curve;
      distortion.oversample = '4x';

      // ═══ DELAY ═══
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.3;
      const delayFb = ctx.createGain();
      delayFb.gain.value = 0.15;
      const delayMix = ctx.createGain();
      delayMix.gain.value = 0.25;
      delay.connect(delayFb);
      delayFb.connect(delay);
      delay.connect(delayMix);

      // ═══ REVERB ═══
      const rvLen = 2.5 * ctx.sampleRate;
      const rvBuf = ctx.createBuffer(2, rvLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = rvBuf.getChannelData(ch);
        for (let i = 0; i < rvLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rvLen, 2.5);
      }
      const conv = ctx.createConvolver();
      conv.buffer = rvBuf;
      const rvMix = ctx.createGain();
      rvMix.gain.value = 0.25;

      // ═══ COMPRESSOR ═══
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.ratio.value = 4;
      comp.attack.value = 0.005;
      comp.release.value = 0.1;

      // ═══ MASTER ═══
      const master = ctx.createGain();
      master.gain.value = 1.3;

      // ═══ ROUTING ═══
      source1.connect(bassBoost);
      source2.connect(layer2Gain);
      layer2Gain.connect(bassBoost);
      bassBoost.connect(highCut);
      highCut.connect(midBoost);
      midBoost.connect(distortion);
      distortion.connect(comp);
      comp.connect(master);
      comp.connect(delay);
      comp.connect(conv);
      delayMix.connect(master);
      conv.connect(rvMix);
      rvMix.connect(master);
      master.connect(ctx.destination);

      this.speaking = true;
      source1.onended = () => { this.speaking = false; try{ctx.close()}catch(e){} this._yamaCtx=null; };
      source1.start(0);
      source2.start(0);
      return; // Success!
    } catch(e) {
      console.warn('Yama Web Audio failed:', e.message);
    }

    // Fallback: play static file without processing
    try {
      this.playStatic(staticUrl);
    } catch(e) {
      this._browserSpeak(text, lang);
    }
  },

  // ═══ NARRATOR VOICE — Vedic temple processing for story onboarding ═══
  async speakNarrator(text, lang) {
    this.stop();
    if (!text) return;

    const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);
    let audioUrl = null;

    if (!isLocal) {
      audioUrl = AudioCache.get(text);
      if (!audioUrl) {
        try { audioUrl = await AudioCache.fetchTTS(text, lang); } catch(e){}
      }
    }
    if (!audioUrl) { this._browserSpeak(text, lang); return; }

    try {
      const resp = await fetch(audioUrl);
      const blob = await resp.blob();
      const arrayBuf = await blob.arrayBuffer();

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      this._yamaCtx = ctx; // reuse cleanup ref

      const buffer = await ctx.decodeAudioData(arrayBuf);

      // ═══ NARRATOR SOURCE (pitch 0.88 — slow gravitas) ═══
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.92;
      this._yamaSource = source;

      // ═══ BASS WARMTH (120Hz, +4dB) ═══
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 120;
      bass.gain.value = 4;

      // ═══ MID CLARITY (2kHz, +3dB) ═══
      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 2000;
      mid.gain.value = 3;
      mid.Q.value = 1;

      // ═══ HIGH CUT (gentle warmth) ═══
      const highCut = ctx.createBiquadFilter();
      highCut.type = 'lowpass';
      highCut.frequency.value = 7000;

      // ═══ DELAY (250ms, 15% feedback — words linger) ═══
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.25;
      const delayFb = ctx.createGain();
      delayFb.gain.value = 0.15;
      const delayMix = ctx.createGain();
      delayMix.gain.value = 0.18;
      delay.connect(delayFb);
      delayFb.connect(delay);
      delay.connect(delayMix);

      // ═══ TEMPLE REVERB (hall, 2s decay, 20% mix) ═══
      const rvLen = 2.0 * ctx.sampleRate;
      const rvBuf = ctx.createBuffer(2, rvLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = rvBuf.getChannelData(ch);
        for (let i = 0; i < rvLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rvLen, 2.0);
      }
      const conv = ctx.createConvolver();
      conv.buffer = rvBuf;
      const rvMix = ctx.createGain();
      rvMix.gain.value = 0.20;

      // ═══ OM DRONE (tanpura-like background hum) ═══
      // Layer 3 oscillators: fundamental + fifth + octave for rich drone
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.04; // Very subtle — felt not heard

      const droneBass = ctx.createBiquadFilter();
      droneBass.type = 'lowpass';
      droneBass.frequency.value = 200; // Keep only low frequencies

      // Sa (fundamental) — ~130 Hz (C3)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 130.81;

      // Pa (perfect fifth) — ~196 Hz (G3)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 196.00;
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.value = 0.6;

      // Low Sa (octave below) — ~65 Hz
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.value = 65.41;
      const osc3Gain = ctx.createGain();
      osc3Gain.gain.value = 0.8;

      osc1.connect(droneBass);
      osc2.connect(osc2Gain);
      osc2Gain.connect(droneBass);
      osc3.connect(osc3Gain);
      osc3Gain.connect(droneBass);
      droneBass.connect(droneGain);

      // ═══ MASTER ═══
      const master = ctx.createGain();
      master.gain.value = 1.1;

      // ═══ ROUTING ═══
      source.connect(bass);
      bass.connect(mid);
      mid.connect(highCut);
      highCut.connect(master);
      highCut.connect(delay);
      highCut.connect(conv);
      delayMix.connect(master);
      conv.connect(rvMix);
      rvMix.connect(master);
      droneGain.connect(master);
      master.connect(ctx.destination);

      // ═══ PLAY ═══
      this.speaking = true;
      source.onended = () => {
        this.speaking = false;
        // Fade out drone gracefully
        droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(()=>{try{osc1.stop();osc2.stop();osc3.stop();ctx.close()}catch(e){}this._yamaCtx=null},2000);
      };
      source.start(0);
      osc1.start(0);
      osc2.start(0);
      osc3.start(0);
      return;
    } catch(e) {
      console.warn('Narrator processing failed:', e.message);
    }

    // Fallback: play without effects
    try {
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      this.audio = audio;
      this.speaking = true;
      audio.onended = () => { this.speaking = false; };
      await audio.play().catch(()=>{});
    } catch(e) {
      this._browserSpeak(text, lang);
    }
  }
};

/* Yama Image — put yama.png in /public folder */

