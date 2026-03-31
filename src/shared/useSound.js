// ─────────────────────────────────────────────────────────────────────────────
// shared/useSound.js
// Game sound effects hook — dice roll, snake bite, ladder chime, victory
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useCallback } from 'react';

export function useSound(){
  const ctx=useRef(null);
  const gc=useCallback(()=>{if(!ctx.current)try{ctx.current=new(window.AudioContext||window.webkitAudioContext)()}catch(e){};return ctx.current},[]);
  return useCallback((type)=>{
    try{const c=gc();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);const t=c.currentTime;
    if(type==="dice"){o.type="square";o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(600,t+.05);o.frequency.exponentialRampToValueAtTime(150,t+.15);g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.01,t+.2);o.start(t);o.stop(t+.2)}
    else if(type==="snake"){o.type="sawtooth";o.frequency.setValueAtTime(800,t);o.frequency.exponentialRampToValueAtTime(80,t+.6);g.gain.setValueAtTime(.07,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);o.start(t);o.stop(t+.7)}
    else if(type==="ladder"){o.type="sine";o.frequency.setValueAtTime(400,t);g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.start(t);o.stop(t+.3)}
    else if(type==="dilemma"){o.type="sine";o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(80,t+.8);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+1);o.start(t);o.stop(t+1)}
    else if(type==="victory"){o.type="sine";o.frequency.setValueAtTime(523,t);g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.8);o.start(t);o.stop(t+.8)}
    else if(type==="move"){o.type="sine";o.frequency.setValueAtTime(350,t);g.gain.setValueAtTime(.03,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);o.start(t);o.stop(t+.08)}
    else if(type==="yamaLaugh"){
      // Terrifying evil laugh — Thanos-like, 6 staccato HA pulses with sub-bass
      // Layer 1: Main laugh pulses (pitched voice-like)
      o.type="sawtooth";
      const pulses=[[0,.22,180],[.15,.03,0],[.22,.20,160],[.37,.03,0],[.42,.18,145],[.55,.03,0],[.60,.15,135],[.72,.03,0],[.77,.12,125],[.90,.03,0],[.95,.08,110]];
      pulses.forEach(([time,vol,freq])=>{g.gain.setValueAtTime(vol,t+time);if(freq)o.frequency.setValueAtTime(freq,t+time)});
      g.gain.exponentialRampToValueAtTime(.001,t+1.5);o.start(t);o.stop(t+1.6);
      // Layer 2: Low growl undertone
      const o2=c.createOscillator(),g2=c.createGain();o2.connect(g2);g2.connect(c.destination);
      o2.type="triangle";g2.gain.setValueAtTime(.12,t);
      o2.frequency.setValueAtTime(85,t);o2.frequency.setValueAtTime(55,t+.8);o2.frequency.setValueAtTime(35,t+1.4);
      g2.gain.exponentialRampToValueAtTime(.001,t+1.5);o2.start(t);o2.stop(t+1.6);
      // Layer 3: High sinister wheeze between pulses
      const o3=c.createOscillator(),g3=c.createGain();o3.connect(g3);g3.connect(c.destination);
      o3.type="sine";o3.frequency.setValueAtTime(600,t);o3.frequency.setValueAtTime(400,t+1.4);
      g3.gain.setValueAtTime(.02,t);g3.gain.setValueAtTime(.04,t+.3);g3.gain.setValueAtTime(.02,t+.6);g3.gain.setValueAtTime(.03,t+.9);
      g3.gain.exponentialRampToValueAtTime(.001,t+1.5);o3.start(t);o3.stop(t+1.6);
    }
    else if(type==="chime"){
      // Soft angelic chime — ascending harmonics, louder
      o.type="sine";g.gain.setValueAtTime(.12,t);
      o.frequency.setValueAtTime(523,t);o.frequency.setValueAtTime(659,t+.2);o.frequency.setValueAtTime(784,t+.4);o.frequency.setValueAtTime(1047,t+.6);
      g.gain.exponentialRampToValueAtTime(.001,t+1);o.start(t);o.stop(t+1);
      const o2=c.createOscillator(),g2=c.createGain();o2.connect(g2);g2.connect(c.destination);
      o2.type="sine";g2.gain.setValueAtTime(.08,t+.1);
      o2.frequency.setValueAtTime(1047,t+.1);o2.frequency.setValueAtTime(1319,t+.3);o2.frequency.setValueAtTime(1568,t+.5);
      g2.gain.exponentialRampToValueAtTime(.001,t+.5);o2.start(t+.05);o2.stop(t+.5);
    }
    }catch(e){}
  },[gc]);
}
