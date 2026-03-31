// ───────────────────────────────────────────────────────────────────────────
// src/components/YamaJudgment.jsx
// ───────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export default function YamaJudgment({ loser, papa, punya, isYama }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const W=canvas.width=360, H=canvas.height=280;
    const ctx=canvas.getContext('2d');
    let t=0;

    // Flame particles
    const flames=[];
    for(let i=0;i<120;i++){
      flames.push({
        x:W/2+(Math.random()-.5)*W*.7,
        y:H*.85+Math.random()*H*.2,
        vx:(Math.random()-.5)*.8,
        vy:-(0.5+Math.random()*2),
        size:4+Math.random()*14,
        life:0, maxLife:30+Math.random()*50,
        hue:Math.random()<.7?10+Math.random()*20:30+Math.random()*20,
        delay:Math.random()*30,
      });
    }

    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      t++;
      // Dark background
      ctx.fillStyle='rgba(8,3,2,.92)';
      ctx.fillRect(0,0,W,H);

      // Glow from bottom
      const grd=ctx.createRadialGradient(W/2,H,10,W/2,H,W*.6);
      grd.addColorStop(0,'rgba(200,40,10,.25)');
      grd.addColorStop(.5,'rgba(150,20,5,.08)');
      grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);

      // Flames
      flames.forEach(f=>{
        if(t<f.delay) return;
        f.life++;
        if(f.life>f.maxLife){f.life=0;f.y=H*.85+Math.random()*H*.2;f.x=W/2+(Math.random()-.5)*W*.65;f.vy=-(0.5+Math.random()*2);}
        f.x+=f.vx+Math.sin(t*.05+f.x*.01)*.5;
        f.y+=f.vy;
        f.vy*=0.995;
        const lr=f.life/f.maxLife;
        const alpha=(1-lr)*(0.5+Math.random()*.3);
        ctx.beginPath();
        ctx.arc(f.x,f.y,f.size*(1-lr*.6),0,Math.PI*2);
        ctx.fillStyle=`hsla(${f.hue+lr*20},90%,${35+lr*25}%,${alpha})`;
        ctx.fill();
      });

      // Smoke particles
      if(t%3===0){
        ctx.beginPath();
        const sx=W/2+(Math.random()-.5)*W*.5;
        const sy=H*.55;
        ctx.arc(sx,sy,3+Math.random()*8,0,Math.PI*2);
        ctx.fillStyle=`rgba(40,20,10,${0.1+Math.random()*.1})`;
        ctx.fill();
      }

      // SVG-like Yama silhouette (buffalo + figure)
      const yamaY=H*.55-Math.min(t*1.5,H*.25); // rises from flames
      const yamaAlpha=Math.min(t/40,1);
      ctx.save();
      ctx.globalAlpha=yamaAlpha;
      ctx.fillStyle='rgba(60,10,10,.9)';
      // Body
      ctx.beginPath(); ctx.ellipse(W/2,yamaY,20,28,0,0,Math.PI*2); ctx.fill();
      // Head
      ctx.beginPath(); ctx.arc(W/2,yamaY-32,14,0,Math.PI*2); ctx.fill();
      // Crown (trident-like)
      ctx.strokeStyle='rgba(200,40,10,.8)'; ctx.lineWidth=3; ctx.lineCap='round';
      for(let spike=-1;spike<=1;spike++){
        ctx.beginPath();
        ctx.moveTo(W/2+spike*8,yamaY-44);
        ctx.lineTo(W/2+spike*8,yamaY-64-Math.abs(spike)*6);
        ctx.stroke();
      }
      // Arms raised
      ctx.strokeStyle='rgba(60,10,10,.9)'; ctx.lineWidth=8;
      ctx.beginPath(); ctx.moveTo(W/2-18,yamaY-10); ctx.lineTo(W/2-50,yamaY-35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W/2+18,yamaY-10); ctx.lineTo(W/2+50,yamaY-35); ctx.stroke();
      ctx.restore();

      // Animated chains
      if(t>30){
        const chainAlpha=Math.min((t-30)/40,1);
        ctx.save();
        ctx.globalAlpha=chainAlpha;
        ctx.strokeStyle='rgba(180,140,60,.6)';
        ctx.lineWidth=2.5;
        ctx.setLineDash([4,3]);
        ctx.lineDashOffset=-t*.5;
        // Left chain
        ctx.beginPath();
        ctx.moveTo(30,H*.3);
        ctx.bezierCurveTo(W*.2,H*.35+Math.sin(t*.04)*8,W*.35,H*.5,W*.38,H*.7);
        ctx.stroke();
        // Right chain
        ctx.beginPath();
        ctx.moveTo(W-30,H*.3);
        ctx.bezierCurveTo(W*.8,H*.35+Math.sin(t*.04+1)*8,W*.65,H*.5,W*.62,H*.7);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>{ cancelAnimationFrame(rafRef.current); };
  },[]);

  return(
    <div style={{
      position:'fixed',bottom:20,right:20,
      background:'rgba(8,3,2,.95)',
      border:'1.5px solid rgba(180,40,20,.35)',
      borderRadius:10,overflow:'hidden',
      animation:'yamaRise .8s cubic-bezier(.34,1.56,.64,1)',
      boxShadow:'0 0 40px rgba(180,40,20,.2)',
      width:'min(360px,90vw)',
    }}>
      <canvas ref={canvasRef} width={360} height={280} style={{display:'block',width:'100%'}}/>
      <div style={{padding:'10px 14px',background:'linear-gradient(0deg,rgba(8,3,2,.98),rgba(8,3,2,.85))'}}>
        <div style={{fontSize:10,color:'rgba(200,60,30,.7)',letterSpacing:2,fontFamily:"'Cinzel',serif",fontWeight:700,marginBottom:4}}>
          {isYama ? '💀 YAMA FALLS — THE GOD OF DEATH IS JUDGED' : '☠️ YAMA\'S JUDGMENT'}
        </div>
        <div style={{fontSize:9,color:'rgba(200,80,60,.6)',marginBottom:6,lineHeight:1.6}}>
          {isYama
            ? <><span style={{fontSize:13}}>☠️</span> <strong style={{color:'#e06060'}}>यमराज · YAMA</strong> — God of Death. Defeated.</>
            : <>{loser.char.icon} <strong style={{color:loser.char.color}}>{loser.name}</strong> — {papa} Papa, {punya} Punya</>
          }
        </div>
        <div style={{fontSize:8,color:'rgba(180,60,40,.45)',fontStyle:'italic',lineHeight:1.7}}>
          {isYama
            ? '"Even the God of Death carries karma. He who judges all souls — has now been judged himself. The ledger does not exempt even Yama. He will return. He always returns."'
            : `"The ledger has spoken. ${papa} Papa cannot be hidden from Yama's gaze. The soul must return — to learn, to suffer, to try again."`
          }
        </div>
        <div style={{fontSize:7,color:'rgba(160,40,20,.4)',marginTop:4,letterSpacing:2}}>— CHITRAGUPTA'S FINAL ENTRY</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO SCREEN
//    A cameo page introducing the divine scribe before the game begins.
//    Story lines reveal themselves one by one. Quill draws across the top.
//    Skippable at any time.
// ══════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO — 3D Particle Deity + Cinematic Story
//
// A full-screen 3D canvas scene:
//   · Chitragupta built from ~1400 glowing gold particles
//   · 4-armed deity silhouette: head, body, arms, halo, lotus throne
//   · Particles spawn from center and fly to their positions (2s burst)
//   · Figure rotates slowly on Y-axis (real 3D perspective projection)
//   · Sanskrit characters orbit him in 3D ellipses at varying inclinations
//   · Stars parallax in the background
//   · Story lines appear ONE AT A TIME (cinematic, not a list)
//   · "BEGIN" triggers particle explosion outward
// ══════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO — 3D Particle Deity + 3 Orbital Rings + Hidden Riddle
//
// THE SCIENCE:
//   Every atom in your body was forged inside a dying star.
//   You are 99.9% empty space — and the universe is 99.9% empty space.
//   Information cannot be destroyed (Landauer's Principle, 1961).
//   Every deed you commit is written into the fabric of spacetime.
//   Chitragupta is that fabric.
//
// THE 3D SCENE:
//   · ~1,600 gold particles form a 4-armed deity, 1.6× larger than before
//   · Ring 1 (r=130): 9 Sanskrit numerals — the 9 Navagraha planets
//   · Ring 2 (r=210): Science/philosophy words — hidden in plain sight
//   · Ring 3 (r=310): The SECRET RING — one symbol returns to apex every 108×π frames
//
// THE HIDDEN RIDDLE:
//   108 — solar diameters from Earth to Sun.
//   108 — beads in a mala.
//   108 — squares on the Moksha Patam.
//   108 — Upanishads.
//   One character in the outer ring orbits at a speed of exactly 2π/(108×3) rad/frame.
//   Every 324 frames (~5.4s), it returns to the apex.
//   At that moment, the ring glows.
//   The character is ॐ — the answer was always there.
//   The riddle: "Which symbol in this universe knows the number 108?"
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO — Full canvas. No text. Only his voice.
//
// THREE ORBITAL RINGS:
//   Ring I   r=190  9 Navagraha drawn as real planets (Saturn has rings, etc)
//   Ring II  r=310  Science + Vedic symbols, slow drift
//   Ring III r=430  SECRET — OM orbits at 2π/(108×3). Returns to apex every 324 frames.
//
// THE HIDDEN RIDDLE:
//   Ring III orbits at exactly 2π/(108×3) rad/frame.
//   OM (ॐ) starts at the 12-o-clock apex.
//   Every 324 frames it returns. The ring pulses gold.
//   A single Sanskrit whisper appears bottom-left — no explanation.
//   Those who watch understand. Those who understand, know why 108 matters.
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA — Three-Ring Cipher
//
// THE RIDDLE:
//   Each ring has one "key digit" that orbits independently.
//   Three clocks. Three periods. One secret.
//
//   Ring I   (r=190, fast)    key: १  period = 108 frames
//   Ring II  (r=310, medium)  key: ०  period = 216 frames (108×2)
//   Ring III (r=430, slow)    key: ८  period = 324 frames (108×3)
//
//   At the bottom: three dim indicator boxes  [ ? ] [ ? ] [ ? ]
//   When a key digit hits the 12-o'clock apex → its box briefly lights up.
//   Most of the time: one box lit. Sometimes two. Rarely none.
//   At frame 648 (= LCM of 108, 216, 324 = 108×6):
//     ALL THREE align simultaneously → [ १ ] [ ० ] [ ८ ] = 108
//
//   The screen flashes gold. A message appears.
//   No explanation. Those who were watching, understand.
//
// THE SCIENCE:
//   This is exactly how the Antikythera Mechanism worked —
//   a 2,000-year-old Greek astronomical computer made of gears.
//   When independent gear cycles aligned, they revealed a date.
//   Three clocks with coprime periods. One alignment reveals everything.
//   Also: DNA uses 3-base codons. Three nucleotides → one amino acid.
//   Three rings → one number.
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO — Three Hidden Riddles
//
// RING I  — HYDROGEN SPECTRUM (4 colors, always same order)
// RING II — GRAVITATIONAL WAVE GW150914 (drawn as actual chirp waveform)
// RING III— DUAL RIDDLE:
//             EYES: Symbol ◈ blinks OM in Morse  — — — · — —
//             EARS: morse-108.wav plays quietly  (1=.———— 0=————— 8=———..)
//           Two hidden messages. Same ring. Same symbol.
//           "Those who know will hear. Those who know will see."
//
// DEPLOY: put /public/morse-108.wav  in your Vercel public folder
// ══════════════════════════════════════════════════════════════════════════════
