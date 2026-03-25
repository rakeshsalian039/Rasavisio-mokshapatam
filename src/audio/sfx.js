import { useRef, useCallback } from "react";
// ═══ SOUND EFFECTS ENGINE ═══
//
// Generates all game sounds using Web Audio API (no files needed).
// Sounds: dice, snake, ladder, dilemma, victory, move, yamaLaugh, chime
//
// TO ADD A SOUND: Add a new `else if(type==="yourSound")` block.
// TO CHANGE A SOUND: Modify oscillator type, frequency, and gain values.

/* ═══ SFX ═══ */
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
      // Deep menacing laugh — descending notes
      o.type="sawtooth";g.gain.setValueAtTime(.06,t);
      o.frequency.setValueAtTime(180,t);o.frequency.setValueAtTime(160,t+.15);o.frequency.setValueAtTime(140,t+.3);o.frequency.setValueAtTime(120,t+.45);o.frequency.setValueAtTime(100,t+.6);
      g.gain.exponentialRampToValueAtTime(.001,t+.8);o.start(t);o.stop(t+.8);
      // Second laugh oscillator
      const o2=c.createOscillator(),g2=c.createGain();o2.connect(g2);g2.connect(c.destination);
      o2.type="triangle";g2.gain.setValueAtTime(.04,t+.1);
      o2.frequency.setValueAtTime(90,t+.1);o2.frequency.setValueAtTime(75,t+.3);o2.frequency.setValueAtTime(60,t+.5);
      g2.gain.exponentialRampToValueAtTime(.001,t+.7);o2.start(t+.1);o2.stop(t+.7);
    }
    else if(type==="chime"){
      // Soft angelic chime — ascending harmonics
      o.type="sine";g.gain.setValueAtTime(.05,t);
      o.frequency.setValueAtTime(523,t);o.frequency.setValueAtTime(659,t+.15);o.frequency.setValueAtTime(784,t+.3);
      g.gain.exponentialRampToValueAtTime(.001,t+.6);o.start(t);o.stop(t+.6);
      const o2=c.createOscillator(),g2=c.createGain();o2.connect(g2);g2.connect(c.destination);
      o2.type="sine";g2.gain.setValueAtTime(.03,t+.05);
      o2.frequency.setValueAtTime(1047,t+.05);o2.frequency.setValueAtTime(1319,t+.2);
      g2.gain.exponentialRampToValueAtTime(.001,t+.5);o2.start(t+.05);o2.stop(t+.5);
    }
    }catch(e){}
  },[gc]);
}


