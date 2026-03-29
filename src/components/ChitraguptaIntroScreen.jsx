import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceEngine } from '../shared/audio.js';

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
export default function ChitraguptaIntroScreen({ players, chosenLang, muted, onBegin, onSkip }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef({ t:0, explode:false });
  const rafRef     = useRef(null);
  const morseAudio = useRef(null);
  const [done,      setDone]      = useState(false);
  const [exploding, setExploding] = useState(false);

  useEffect(()=>{ const t=setTimeout(()=>setDone(true),5000); return()=>clearTimeout(t); },[]);

  // Voice + morse audio init
  useEffect(()=>{
    if(!muted){
      setTimeout(()=>VoiceEngine.speakChitragupta('open',chosenLang),900);
      // Morse 108 audio — quiet, loops with gap
      try{
        const audio=new Audio('/morse-108.wav');
        audio.volume=0.18; // subtle — beneath the voice
        morseAudio.current=audio;
        // Play once after 8s, then every 35s
        const play=()=>{ try{ audio.currentTime=0; audio.play().catch(()=>{}); }catch(e){} };
        const t1=setTimeout(play,3000);
        const iv=setInterval(play,12000);
        return()=>{ clearTimeout(t1); clearInterval(iv); audio.pause(); };
      }catch(e){}
    }
    return()=>VoiceEngine.stop();
  },[]);

  // ─── HYDROGEN SPECTRUM ────────────────────────────────────────────────
  const H_LINES=[
    {nm:656,col:'#ff3520',glow:'rgba(255,53,32,',  phase:0           }, // Hα red
    {nm:486,col:'#30c8e0',glow:'rgba(48,200,224,', phase:Math.PI/2   }, // Hβ cyan
    {nm:434,col:'#8840e8',glow:'rgba(136,64,232,', phase:Math.PI     }, // Hγ violet
    {nm:410,col:'#5018c0',glow:'rgba(80,24,192,',  phase:3*Math.PI/2 }, // Hδ deep violet
  ];
  const H_PERIOD=260, H_FLASH=38;

  // ─── GW CHIRP — returns [amplitude 0-1, isChirping, isMerger] ────────
  const gwState=(t)=>{
    const phase=t%520;
    // INSPIRAL 0-310: 8 pulses, spacing 55→18 frames, each brighter
    if(phase<310){
      let cum=0;
      for(let i=0;i<8;i++){
        const sp=Math.round(55-i*4.6);
        if(phase>=cum&&phase<cum+18){
          const frac=(phase-cum)/18;
          const amp=Math.sin(frac*Math.PI)*(0.25+i*0.09);
          return {amp,chirp:false,merger:false};
        }
        cum+=sp; if(cum>310) break;
      }
      return {amp:0,chirp:false,merger:false};
    }
    // CHIRP 310-400: rapid pulses, 6-frame period
    if(phase<400){
      const cp=phase-310;
      const amp=cp%6<3?0.55+cp/90*0.4:0;
      return {amp,chirp:true,merger:false};
    }
    // MERGER 400-422: peak flash
    if(phase<422){
      const mp=phase-400;
      const amp=mp<10?0.9+mp*.01:Math.max(0,1-(mp-10)/12);
      return {amp,chirp:true,merger:true};
    }
    // RINGDOWN 422-520: 4 fading echoes
    if(phase<520){
      const rd=phase-422;
      const echo=Math.floor(rd/24);
      const w=rd%24;
      if(echo<4&&w<14) return {amp:Math.max(0,(1-w/14)*(0.45-echo*.1)),chirp:false,merger:false};
    }
    return {amp:0,chirp:false,merger:false};
  };

  // ─── MORSE: OM = O(— — —) M(— —) ────────────────────────────────────
  // DAH=30f  GAP=10f  LETTER=30f  WORD=60f  Total=270f
  const MORSE_PERIOD=270;
  const morseState=(t)=>{
    const p=t%MORSE_PERIOD;
    // O: dah dah dah
    if(p<30)  return {on:true,pct:p/30};
    if(p<40)  return {on:false,pct:0};
    if(p<70)  return {on:true,pct:(p-40)/30};
    if(p<80)  return {on:false,pct:0};
    if(p<110) return {on:true,pct:(p-80)/30};
    // letter gap
    if(p<140) return {on:false,pct:0};
    // M: dah dah
    if(p<170) return {on:true,pct:(p-140)/30};
    if(p<180) return {on:false,pct:0};
    if(p<210) return {on:true,pct:(p-180)/30};
    // word silence
    return {on:false,pct:0};
  };

  // ─── PARTICLE FIGURE (S=3.2, CY=0.60) ───────────────────────────────
  const buildFigure=useCallback(()=>{
    const pts=[], S=3.2;
    const add=(x,y,z,type,col)=>pts.push({tx:x*S,ty:y*S,tz:z*S,x:(Math.random()-.5)*10,y:(Math.random()-.5)*10,z:(Math.random()-.5)*10,color:col,type,size:1.2+Math.random()*2.2,baseOpacity:.5+Math.random()*.5,phase:Math.random()*Math.PI*2});
    const r=()=>(Math.random()-.5);
    for(let i=0;i<160;i++){const ph=Math.acos(2*Math.random()-1),th=Math.random()*Math.PI*2,rv=27+r()*5;add(rv*Math.sin(ph)*Math.cos(th),-154+rv*Math.cos(ph),rv*Math.sin(ph)*Math.sin(th),'head','#f0d880');}
    for(let i=0;i<55;i++)add(r()*17,-150+r()*21,25+r()*9,'face','#fffce0');
    for(let s=0;s<5;s++){const a=(s/5)*Math.PI*2,cx=22*Math.cos(a),cz=22*Math.sin(a);for(let j=0;j<14;j++)add(cx*(1-j*.04),-182-j*9+r()*4,cz*(1-j*.04),'crown','#ffe040');}
    for(let i=0;i<70;i++){const a=(i/70)*Math.PI*2;add(27*Math.cos(a)+r()*3,-187+r()*4,27*Math.sin(a)+r()*3,'crown','#f0c820');}
    for(let i=0;i<150;i++){const a=(i/150)*Math.PI*2,rv=72+r()*10;add(rv*Math.cos(a)+r()*4,-154+r()*8,-4+rv*Math.sin(a)*.2,'halo','#f0d050');}
    for(let i=0;i<55;i++){const a=(i/55)*Math.PI*2,rv=50+r()*10;add(rv*Math.cos(a),-154+r()*5,rv*Math.sin(a)*.16,'halo','#f0d050');}
    for(let i=0;i<230;i++){const t=Math.random(),a=Math.random()*Math.PI*2,y=-120+t*100,rx=31*(1-Math.pow((t-.5)*2,2)*.45);add(rx*Math.cos(a)+r()*6,y+r()*8,rx*.55*Math.sin(a)+r()*5,'body','#ddb84a');}
    for(let i=0;i<40;i++){const t=i/40,a=t*Math.PI;add(31*Math.cos(a)-6,-120+t*62+r()*4,31*Math.cos(a)*.3+r()*3,'thread','#f0d060');}
    for(let i=0;i<115;i++){const t=i/115;add(28+t*84+r()*8,-110-t*74+r()*8,t*25+r()*8,'arm','#c8a840');}
    for(let i=0;i<115;i++){const t=i/115;add(26+t*77+r()*8,-96+t*67+r()*8,t*18+r()*8,'arm','#c8a840');}
    for(let i=0;i<115;i++){const t=i/115;add(-28-t*77+r()*8,-110-t*62+r()*8,t*18+r()*8,'arm','#c8a840');}
    for(let i=0;i<115;i++){const t=i/115;add(-26-t*71+r()*8,-94+t*61+r()*8,t*12+r()*8,'arm','#c8a840');}
    for(let i=0;i<50;i++){const t=i/50;add(114+t*38+r()*5,-186-t*50+r()*5,25+t*7+r()*4,'quill','#ffffff');}
    for(let i=0;i<34;i++)add(119+i*1.4+r()*5,-194-i*1.9+r()*5,27+r()*4,'quill','#f0e888');
    for(let i=0;i<52;i++){const a=(i/52)*Math.PI;add(102+18*Math.cos(a)+r()*4,-31+10*Math.sin(a)+r()*4,18+r()*4,'scroll','#e8d070');}
    for(let i=0;i<62;i++)add(-99+r()*26,-36+r()*27,15+r()*7,'ledger','#c8aa50');
    for(let i=0;i<90;i++){const t=i/90;add(13+t*54+r()*10,-16+t*35+r()*10,-7+t*7+r()*10,'leg','#c0a030');}
    for(let i=0;i<90;i++){const t=i/90;add(-13-t*50+r()*10,-16+t*33+r()*10,-7+t*7+r()*10,'leg','#c0a030');}
    for(let p=0;p<16;p++){const pa=(p/16)*Math.PI*2;for(let j=0;j<24;j++){const t=j/24,rv=52+t*32;add(rv*Math.cos(pa)+r()*7,26+t*26+r()*6,rv*Math.sin(pa)*.55+r()*6,'lotus',p%3===0?'#ff90c0':p%3===1?'#e070a8':'#ff80b8');}}
    for(let i=0;i<55;i++){const a=Math.random()*Math.PI*2,rv=Math.random()*38;add(rv*Math.cos(a)+r()*4,26+r()*8,rv*Math.sin(a)*.5+r()*4,'lotus','#ffb0d0');}
    for(let i=0;i<160;i++){const a=Math.random()*Math.PI*2,rv=92+Math.random()*85;add(rv*Math.cos(a)+r()*22,-62+r()*225,rv*Math.sin(a)*.65+r()*22,'aura','#f0d050');}
    return pts;
  },[]);

  // ─── DRAW PLANET ──────────────────────────────────────────────────────
  const drawPlanet=useCallback((ctx,x,y,sc,p)=>{
    const rv=p.pr*sc; if(rv<1.2) return;
    if(p.rings){ctx.save();ctx.translate(x,y);ctx.scale(1,.28);ctx.beginPath();ctx.arc(0,0,rv*2.6,0,Math.PI*2);ctx.strokeStyle='rgba(210,185,115,.5)';ctx.lineWidth=rv*.85/.28;ctx.stroke();ctx.beginPath();ctx.arc(0,0,rv*1.75,0,Math.PI*2);ctx.strokeStyle='rgba(185,160,90,.38)';ctx.lineWidth=rv*.42/.28;ctx.stroke();ctx.restore();}
    const g=ctx.createRadialGradient(x-rv*.38,y-rv*.38,0,x,y,rv);g.addColorStop(0,p.hi);g.addColorStop(.65,p.col);g.addColorStop(1,p.sh);
    ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    if(p.corona){for(let ray=0;ray<8;ray++){const ra=(ray/8)*Math.PI*2;ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle='#f8d840';ctx.lineWidth=rv*.22;ctx.beginPath();ctx.moveTo(x+Math.cos(ra)*rv,y+Math.sin(ra)*rv);ctx.lineTo(x+Math.cos(ra)*rv*1.9,y+Math.sin(ra)*rv*1.9);ctx.stroke();ctx.restore();}}
    if(p.crescent){ctx.save();ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.clip();ctx.beginPath();ctx.arc(x+rv*.45,y,rv*.98,0,Math.PI*2);ctx.fillStyle='rgba(20,30,55,.78)';ctx.fill();ctx.restore();}
    if(p.polar){ctx.save();ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(x,y-rv*.62,rv*.3,0,Math.PI*2);ctx.fillStyle='#fff8f0';ctx.fill();ctx.beginPath();ctx.arc(x,y+rv*.62,rv*.2,0,Math.PI*2);ctx.fillStyle='#fff8f0';ctx.fill();ctx.restore();}
    if(p.bands){ctx.save();ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.clip();for(let b=0;b<5;b++){ctx.fillStyle=b%2===0?'rgba(160,75,15,.32)':'rgba(80,38,8,.22)';ctx.fillRect(x-rv,y-rv+b*rv*.4,rv*2,rv*.35);}ctx.beginPath();ctx.ellipse(x-rv*.08,y+rv*.17,rv*.32,rv*.16,0,0,Math.PI*2);ctx.fillStyle='rgba(190,55,35,.48)';ctx.fill();ctx.restore();}
    if(p.rings){const g2=ctx.createRadialGradient(x-rv*.38,y-rv*.38,0,x,y,rv);g2.addColorStop(0,p.hi);g2.addColorStop(.65,p.col);g2.addColorStop(1,p.sh);ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.fillStyle=g2;ctx.fill();}
    if(p.shadow){const sg=ctx.createRadialGradient(x,y,rv*.25,x,y,rv*2);sg.addColorStop(0,'transparent');sg.addColorStop(.55,'rgba(40,8,70,.14)');sg.addColorStop(1,'rgba(70,18,110,.28)');ctx.beginPath();ctx.arc(x,y,rv*2,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();}
    if(p.comet){ctx.save();ctx.globalAlpha=.38;const tg=ctx.createLinearGradient(x,y,x-rv*5,y);tg.addColorStop(0,'rgba(200,130,160,.7)');tg.addColorStop(1,'transparent');ctx.beginPath();ctx.moveTo(x,y-rv*.65);ctx.lineTo(x-rv*5,y);ctx.lineTo(x,y+rv*.65);ctx.fillStyle=tg;ctx.fill();ctx.restore();}
    ctx.save();ctx.globalAlpha=Math.min(sc*.85,.75);ctx.font=`${Math.max(6,8*sc)}px 'Noto Serif Devanagari',serif`;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle='rgba(200,175,90,.6)';ctx.fillText(p.skt,x,y+rv*(p.rings?2.2:1.55));ctx.restore();
  },[]);

  const NAVAGRAHA=[
    {skt:'☀ सूर्य',   pr:14,col:'#f0b020',hi:'#fff880',sh:'#b05800',corona:true,  speed:.0018,phase:.20},
    {skt:'☽ चन्द्र',  pr:9, col:'#c8d4e0',hi:'#f0f4ff',sh:'#506878',crescent:true,speed:.0014,phase:1.10},
    {skt:'♂ मंगल',    pr:8, col:'#c83020',hi:'#ff7060',sh:'#601010',polar:true,   speed:.0012,phase:1.85},
    {skt:'☿ बुध',     pr:6, col:'#7090a0',hi:'#a0c8d8',sh:'#304050',              speed:.0022,phase:2.60},
    {skt:'♃ बृहस्पति',pr:19,col:'#d08020',hi:'#f0c060',sh:'#804810',bands:true,  speed:.0010,phase:3.30},
    {skt:'♀ शुक्र',   pr:10,col:'#e8e098',hi:'#fffff8',sh:'#a09038',              speed:.0016,phase:4.05},
    {skt:'♄ शनि',     pr:13,col:'#c0a860',hi:'#e8d890',sh:'#7a6428',rings:true,   speed:.0008,phase:4.80},
    {skt:'☊ राहु',    pr:10,col:'#302840',hi:'#604880',sh:'#100a18',shadow:true,  speed:.0006,phase:5.50},
    {skt:'☋ केतु',    pr:8, col:'#805060',hi:'#c08090',sh:'#401020',comet:true,   speed:.0005,phase:6.00},
  ];

  // ─── CANVAS LOOP ──────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize(); window.addEventListener('resize',resize);

    const particles=buildFigure();
    const stars=Array.from({length:320},()=>({x:Math.random()*2400,y:Math.random()*1500,z:200+Math.random()*900,r:.3+Math.random()*1.8,op:.12+Math.random()*.6}));

    const FOV=680, ROTY=.0018, SPAWN=100;
    const s=stateRef.current; s.t=0;

    // Ring II symbols — 22 characters, slow
    const ring2syms=['∞','π','⚛','tat','tvam','asi','ħ','Δ','∇','Ψ','∅','E=mc²','∫','☯','ॐ','Ω','∴','∵','∑','DNA','◎','✦'].map((ch,i,a)=>({
      ch, phase:(i/a.length)*Math.PI*2, speed:.00085, idx:i, total:a.length,
    }));

    // Ring III filler (dim, non-blinking)
    const ring3syms=['✦','❊','⬡','∞','◯','△','▽','◇'].map((ch,i,a)=>({
      ch, phase:(i/a.length)*Math.PI*2+1.1, speed:.00035,
    }));

    const project=(x,y,z,ry,cx,cy)=>{
      const rx=x*Math.cos(ry)-z*Math.sin(ry),rz=x*Math.sin(ry)+z*Math.cos(ry);
      const sc=FOV/(FOV+rz+420);
      return {sx:cx+rx*sc,sy:cy+y*sc,scale:sc,rz};
    };
    const hA=(hex,a)=>{const rv=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgba(${rv},${g},${b},${a})`;};

    // ── GW: Draw chirp as pulsing light that travels around Ring II ──────
    // No flat line — the wave IS the ring. Pulses sweep around the orbit.
    // During inspiral: slow pulses, dim. Chirp: rapid bright sweep. Merger: full ring flash.
    const drawGWRing=(t,rotY,CX,CY,ral)=>{
      const phase=t%520;
      const gws=gwState(t);
      if(gws.amp<0.02&&!gws.merger) return;

      // Draw subtle orbit guide circle
      ctx.save();ctx.globalAlpha=ral*.06;ctx.strokeStyle='rgba(140,190,255,1)';ctx.lineWidth=.6;
      ctx.setLineDash([2,14]);
      ctx.beginPath();
      for(let i=0;i<=64;i++){
        const a2=(i/64)*Math.PI*2;
        const pr2=project(310*Math.cos(a2),-30+310*Math.sin(a2)*Math.sin(.32),310*Math.sin(a2)*Math.cos(.32),rotY,CX,CY);
        i===0?ctx.moveTo(pr2.sx,pr2.sy):ctx.lineTo(pr2.sx,pr2.sy);
      }
      ctx.stroke();ctx.setLineDash([]);ctx.restore();

      // During merger — flash the whole ring
      if(gws.merger){
        const mp=(phase-400)/22;
        const mAl=(1-mp)*.65;
        ctx.save();ctx.globalAlpha=ral*mAl;
        ctx.beginPath();
        for(let i=0;i<=64;i++){
          const a2=(i/64)*Math.PI*2;
          const pr2=project(310*Math.cos(a2),-30+310*Math.sin(a2)*Math.sin(.32),310*Math.sin(a2)*Math.cos(.32),rotY,CX,CY);
          i===0?ctx.moveTo(pr2.sx,pr2.sy):ctx.lineTo(pr2.sx,pr2.sy);
        }
        ctx.strokeStyle='rgba(200,220,255,.9)';ctx.lineWidth=3;ctx.shadowBlur=20;ctx.shadowColor='rgba(180,210,255,.8)';ctx.stroke();ctx.shadowBlur=0;
        ctx.restore();
        // Label
        ctx.save();ctx.globalAlpha=ral*mAl*.8;ctx.font=`${Math.max(8,10*Math.min(CX/700,1))}px 'Cinzel',serif`;ctx.textAlign='center';ctx.fillStyle='rgba(200,220,255,.85)';ctx.fillText('GW150914 · MERGER',CX,CY-CY*.52);ctx.restore();
        return;
      }

      // Inspiral / chirp — a bright arc sweeps around the ring
      // Arc width narrows as chirp accelerates (inspiral = wide slow arc, chirp = tight fast arc)
      const arcFrac=gws.chirp?0.08:0.25; // how much of ring is lit
      const sweepAngle=(t*.018)%(Math.PI*2); // sweep position

      ctx.save();ctx.globalAlpha=ral*Math.min(gws.amp*1.8,.75);
      ctx.beginPath();
      const arcSteps=32;
      for(let i=0;i<=arcSteps;i++){
        const a2=sweepAngle+(i/arcSteps)*arcFrac*Math.PI*2;
        const pr2=project(310*Math.cos(a2),-30+310*Math.sin(a2)*Math.sin(.32),310*Math.sin(a2)*Math.cos(.32),rotY,CX,CY);
        i===0?ctx.moveTo(pr2.sx,pr2.sy):ctx.lineTo(pr2.sx,pr2.sy);
      }
      ctx.strokeStyle=gws.chirp?'rgba(160,200,255,.85)':'rgba(120,170,240,.65)';
      ctx.lineWidth=gws.chirp?2.2:1.5;ctx.shadowBlur=gws.chirp?14:8;ctx.shadowColor='rgba(140,180,255,.6)';ctx.stroke();ctx.shadowBlur=0;ctx.restore();

      // Subtle GW label
      if(gws.amp>0.3){
        ctx.save();ctx.globalAlpha=ral*gws.amp*.3;ctx.font=`${Math.max(7,8*Math.min(CX/700,1))}px 'Cinzel',serif`;ctx.textAlign='center';ctx.fillStyle='rgba(140,190,255,.6)';ctx.fillText('GW150914',CX,CY-CY*.49);ctx.restore();
      }
    };

    const draw=()=>{
      const W=canvas.width, H=canvas.height;
      const CX=W*.5, CY=H*.60;
      s.t++;
      const rotY=s.t*ROTY;

      // BG
      ctx.fillStyle='rgba(4,2,1,1)';ctx.fillRect(0,0,W,H);
      const bg=ctx.createRadialGradient(CX,CY,50,CX,CY,Math.min(W,H)*.72);
      bg.addColorStop(0,'rgba(200,175,90,.036)');bg.addColorStop(.7,'rgba(0,0,0,0)');
      ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

      stars.forEach(st=>{const sc=FOV/(FOV+st.z);ctx.beginPath();ctx.arc(W*.5+(st.x-W*.5)*sc,H*.5+(st.y-H*.5)*sc,st.r*sc,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,220,${st.op*sc})`;ctx.fill();});

      // Particles
      const proj=particles.map(p=>{
        if(s.explode){p.x+=(p.x-CX%W)*.05+(Math.random()-.5)*5;p.y+=(p.y-H*.5)*.05+(Math.random()-.5)*5;p.z+=(Math.random()-.5)*7;}
        else if(s.t<SPAWN){p.x+=(p.tx-p.x)*.065;p.y+=(p.ty-p.y)*.065;p.z+=(p.tz-p.z)*.065;}
        else{const d=Math.sin(s.t*.016+p.phase)*2.4;p.x=p.tx+d*Math.cos(p.phase);p.y=p.ty+d*Math.sin(p.phase)*.5;p.z=p.tz+Math.sin(s.t*.013+p.phase*1.3)*3.8;}
        return {...project(p.x,p.y,p.z,rotY,CX,CY),p};
      });
      proj.sort((a,b)=>a.rz-b.rz);
      proj.forEach(({sx,sy,scale,p})=>{
        if(sx<-100||sx>W+100||sy<-100||sy>H+100)return;
        const rv=p.size*scale,al=p.baseOpacity*Math.min(1,s.t/55)*scale*1.5;
        const pulse=1+Math.sin(s.t*.033+p.phase)*.1;
        if(['quill','face','crown','halo'].includes(p.type)){ctx.beginPath();ctx.arc(sx,sy,rv*4*pulse,0,Math.PI*2);ctx.fillStyle=`rgba(240,210,80,${al*.13})`;ctx.fill();}
        ctx.beginPath();ctx.arc(sx,sy,rv*pulse,0,Math.PI*2);
        ctx.fillStyle=hA(p.color.startsWith('#')?p.color:'#d0b050',al);ctx.fill();
      });

      // ── RING I: Planets + Hydrogen Spectrum ──
      if(s.t>30){
        const ral=Math.min((s.t-30)/50,1);
        NAVAGRAHA.forEach(pl=>{
          const a=pl.phase+s.t*pl.speed;
          const pr=project(190*Math.cos(a),-80+190*Math.sin(a)*Math.sin(.18),190*Math.sin(a)*Math.cos(.18),rotY,CX,CY);
          if(pr.scale<.15)return;
          ctx.save();ctx.globalAlpha=ral*Math.min(pr.scale*1.8,1);drawPlanet(ctx,pr.sx,pr.sy,pr.scale,pl);ctx.restore();
        });
        H_LINES.forEach((hl,i)=>{
          const a=hl.phase+s.t*.0009;
          const pr=project(190*Math.cos(a),-80+190*Math.sin(a)*Math.sin(.18),190*Math.sin(a)*Math.cos(.18),rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.8,1);if(al<.04)return;
          const slotStart=i*(H_PERIOD/4);
          const phase=s.t%H_PERIOD;
          const w=phase-slotStart;
          const isFlashing=w>=0&&w<H_FLASH;
          const fb=isFlashing?Math.sin((w/H_FLASH)*Math.PI):0;
          ctx.save();ctx.globalAlpha=al*(isFlashing?1:.15);
          const sz=Math.max(8,11*pr.scale);
          ctx.font=`bold ${sz}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
          if(isFlashing){
            const gr=ctx.createRadialGradient(pr.sx,pr.sy,0,pr.sx,pr.sy,sz*2.2);
            gr.addColorStop(0,hl.glow+fb*.4+')');gr.addColorStop(1,hl.glow+'0)');
            ctx.beginPath();ctx.arc(pr.sx,pr.sy,sz*2.2,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();
            ctx.shadowBlur=18+fb*22;ctx.shadowColor=hl.col;ctx.fillStyle=hl.col;
            ctx.fillText('✦',pr.sx,pr.sy);
            if(fb>0.45){ctx.save();ctx.globalAlpha=fb*.65;ctx.font=`${Math.max(6,7*pr.scale)}px 'Cinzel',serif`;ctx.fillStyle=hl.col;ctx.fillText(hl.nm+'nm',pr.sx,pr.sy+sz*1.6);ctx.restore();}
          } else {
            ctx.fillStyle='rgba(200,175,90,.18)';ctx.fillText('✦',pr.sx,pr.sy);
          }
          ctx.restore();
        });
      }

      // ── RING II: GW waveform + orbiting symbols ──
      if(s.t>55){
        const ral=Math.min((s.t-55)/50,1);
        // GW ring chirp
        drawGWRing(s.t,rotY,CX,CY,ral);

        // Orbiting symbols
        ring2syms.forEach(orb=>{
          const a=orb.phase+s.t*orb.speed;
          const pr=project(310*Math.cos(a),-30+310*Math.sin(a)*Math.sin(.32),310*Math.sin(a)*Math.cos(.32),rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.5,.7);if(al<.04)return;
          const gws=gwState(s.t);
          const bright=gws.amp*(0.4+orb.idx/orb.total*.3);
          ctx.save();ctx.globalAlpha=al*(bright>0.05?Math.min(1,.12+bright):.12);
          ctx.font=`${(orb.ch.length>3?7:10)*pr.scale}px 'Cinzel',serif`;
          ctx.textAlign='center';ctx.textBaseline='middle';
          if(gws.merger){ctx.shadowBlur=16;ctx.shadowColor='rgba(180,200,255,.8)';ctx.fillStyle='rgba(200,220,255,.9)';}
          else if(bright>0.1){ctx.fillStyle='rgba(140,190,215,0.7)';}
          else{ctx.fillStyle='rgba(140,190,215,0.2)';}
          ctx.fillText(orb.ch,pr.sx,pr.sy);ctx.restore();
        });
      }

      // ── RING III: Morse blinker (◈) + filler ──
      if(s.t>80){
        const ral=Math.min((s.t-80)/60,1);
        ring3syms.forEach(orb=>{
          const a=orb.phase+s.t*orb.speed;
          const pr=project(430*Math.cos(a),430*Math.sin(a)*Math.sin(.5),430*Math.sin(a)*Math.cos(.5),rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.8,.6);if(al<.04)return;
          ctx.save();ctx.globalAlpha=al*.3;ctx.font=`${9*pr.scale}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(200,175,90,.3)';ctx.fillText(orb.ch,pr.sx,pr.sy);ctx.restore();
        });

        // ◈ — the Morse blinker (no label, no hint)
        const morseAngle=Math.PI/2+s.t*.00035;
        const mPr=project(430*Math.cos(morseAngle),430*Math.sin(morseAngle)*Math.sin(.5),430*Math.sin(morseAngle)*Math.cos(.5),rotY,CX,CY);
        const mAl=ral*Math.min(mPr.scale*1.8,.95);
        if(mAl>0.04){
          const ms=morseState(s.t);
          ctx.save();ctx.globalAlpha=mAl*(ms.on?1:.15);
          const sz=Math.max(10,17*mPr.scale);
          ctx.font=`bold ${sz}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
          if(ms.on){
            const og=ctx.createRadialGradient(mPr.sx,mPr.sy,0,mPr.sx,mPr.sy,sz*2.5);
            og.addColorStop(0,'rgba(240,200,80,.3)');og.addColorStop(1,'rgba(240,200,80,0)');
            ctx.beginPath();ctx.arc(mPr.sx,mPr.sy,sz*2.5,0,Math.PI*2);ctx.fillStyle=og;ctx.fill();
            ctx.shadowBlur=22+ms.pct*18;ctx.shadowColor='rgba(240,200,80,.95)';ctx.fillStyle='rgba(255,225,60,1)';
          } else {
            ctx.fillStyle='rgba(200,175,90,.22)';
          }
          ctx.fillText('◈',mPr.sx,mPr.sy);ctx.restore();
        }
      }

      // Ink drips
      if(s.t>90&&!s.explode){const ia=Math.min((s.t-90)/40,1);for(let i=0;i<2;i++){const pr=project(115+Math.random()*18,-190+Math.random()*10,24,rotY,CX,CY);ctx.beginPath();ctx.arc(pr.sx,pr.sy,1.8*pr.scale,0,Math.PI*2);ctx.fillStyle=`rgba(240,210,80,${ia*.4*Math.random()})`;ctx.fill();}}

      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>{ cancelAnimationFrame(rafRef.current); window.removeEventListener('resize',resize); };
  },[buildFigure,drawPlanet]);

  const handleBegin=()=>{ stateRef.current.explode=true; setExploding(true); setTimeout(onBegin,900); };
  const isHi=chosenLang==='hi';

  return(
    <div style={{position:'fixed',inset:0,zIndex:100,overflow:'hidden',background:'#040201'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>

      {/* Skip */}
      <button onClick={onSkip} style={{position:'fixed',top:20,right:20,zIndex:20,background:'transparent',border:'1px solid rgba(200,175,90,.15)',color:'rgba(200,175,90,.28)',padding:'5px 16px',fontSize:10,fontFamily:"'Cinzel',serif",cursor:'pointer',borderRadius:3,letterSpacing:2,transition:'all .25s'}}
        onMouseEnter={e=>{e.currentTarget.style.color='rgba(200,175,90,.65)';e.currentTarget.style.borderColor='rgba(200,175,90,.5)'}}
        onMouseLeave={e=>{e.currentTarget.style.color='rgba(200,175,90,.28)';e.currentTarget.style.borderColor='rgba(200,175,90,.15)'}}>
        SKIP ▸
      </button>

      {/* THE RIDDLE — fades in after 5s, stays subtle */}
      <div style={{
        position:'fixed',bottom:62,left:'50%',transform:'translateX(-50%)',
        zIndex:15,textAlign:'center',whiteSpace:'nowrap',
      }}>
        <div style={{
          fontSize:'clamp(9px,1.2vw,11px)',
          color:'rgba(200,175,90,.28)',
          fontFamily:"'Cinzel',serif",
          letterSpacing:'clamp(2px,.4vw,4px)',
          lineHeight:2,
        }}>
          {isHi
            ?<>जो सुनेंगे — सुनेंगे<br/>जो देखेंगे — देखेंगे</>
            :<>Those who know will hear.&nbsp;&nbsp;&nbsp;Those who know will see.</>
          }
        </div>
      </div>

      {/* Bottom */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'10px 24px 16px',background:'linear-gradient(0deg,rgba(4,2,1,.95) 60%,transparent)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,zIndex:10}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {players.filter(p=>!p.cpu).map((p,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',background:'rgba(200,175,90,.04)',border:'1px solid rgba(200,175,90,.1)',borderRadius:16}}>
              <span style={{fontSize:15}}>{p.char.icon}</span>
              <span style={{fontSize:9,color:'rgba(200,175,90,.38)',fontFamily:"'Cinzel',serif",letterSpacing:1}}>{p.name}</span>
            </div>
          ))}
        </div>
        {done
          ?<button onClick={handleBegin} disabled={exploding} style={{background:exploding?'transparent':'linear-gradient(180deg,rgba(200,175,90,.2),rgba(200,175,90,.07))',border:'1.5px solid rgba(200,175,90,.45)',color:'#f0d050',padding:'11px 32px',fontSize:12,fontFamily:"'Cinzel',serif",cursor:exploding?'default':'pointer',borderRadius:4,letterSpacing:4,animation:exploding?'none':'pulse 2.5s ease infinite'}}>
              {exploding?'✦':'▸ '+(isHi?'खेल आरंभ':'BEGIN')}
            </button>
          :<div style={{fontSize:8,color:'rgba(200,175,90,.18)',letterSpacing:3,fontFamily:"'Cinzel',serif",animation:'pulse 3s ease infinite'}}>
              {isHi?'अग्रसंधानी खुल रही है...':'AGRASANDHANI OPENS...'}
            </div>
        }
      </div>
    </div>
  );
}


