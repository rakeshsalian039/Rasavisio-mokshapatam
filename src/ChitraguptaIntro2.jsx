// ══════════════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO — Three Scientific Riddles Hidden in Plain Sight
//
// RING I  (r=190) — THE HYDROGEN SPECTRUM
//   Hydrogen emits light at exactly 4 visible wavelengths. Always.
//   4 symbols orbit Ring I. They flash in STRICT sequence, always same colors:
//     Hα 656nm → deep red   (#ff3520)
//     Hβ 486nm → cyan       (#30c8e0)
//     Hγ 434nm → violet     (#8840e8)
//     Hδ 410nm → deep violet (#5018c0)
//   The Navagraha planets also orbit Ring I — they do not flash.
//   The color sequence is the fingerprint of every star in the universe.
//   You are made of hydrogen. This pattern was in you before you were born.
//
// RING II (r=310) — GRAVITATIONAL WAVE CHIRP (GW150914)
//   On 14 September 2015, LIGO detected spacetime itself rippling.
//   Two black holes merged 1.3 billion light years away.
//   The signal: slow pulses → faster → faster → PEAK (merger) → silence → fade
//   Ring II symbols pulse in this exact chirp pattern, cycling every ~480 frames.
//   The merger flash illuminates ALL Ring II symbols simultaneously.
//   We are sitting on the fabric of spacetime that made this wave.
//
// RING III (r=430) — OM IN MORSE CODE
//   One symbol (ॐ) orbits Ring III very slowly.
//   As it travels, it blinks Morse code. Silently. Patiently.
//   O = — — —   (3 long blinks)
//   M = — —     (2 long blinks)
//   Full cycle: 270 frames ≈ 4.5 seconds at 60fps
//   It has been blinking since the screen opened.
//   Only those who watch long enough — and know Morse — understand.
// ══════════════════════════════════════════════════════════════════════════════
function ChitraguptaIntroScreen({ players, chosenLang, muted, onBegin, onSkip }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ t:0, explode:false });
  const rafRef    = useRef(null);
  const [done,      setDone]      = useState(false);
  const [exploding, setExploding] = useState(false);

  useEffect(()=>{ const t=setTimeout(()=>setDone(true),32000); return()=>clearTimeout(t); },[]);
  useEffect(()=>{
    if(!muted) setTimeout(()=>VoiceEngine.speakChitragupta('open',chosenLang),900);
    return()=>VoiceEngine.stop();
  },[]);

  // ─── HYDROGEN SPECTRUM — 4 wavelengths, always in this exact order ─────
  const H_LINES = [
    { name:'Hα', nm:656, col:'#ff3520', glow:'rgba(255,53,32,',   phase:0             }, // red
    { name:'Hβ', nm:486, col:'#30c8e0', glow:'rgba(48,200,224,',  phase:Math.PI/2     }, // cyan
    { name:'Hγ', nm:434, col:'#8840e8', glow:'rgba(136,64,232,',  phase:Math.PI       }, // violet
    { name:'Hδ', nm:410, col:'#5018c0', glow:'rgba(80,24,192,',   phase:3*Math.PI/2   }, // deep violet
  ];
  // Each H symbol flashes for 35 frames, gap of 25 before next one lights
  // So cycle = 4 × 60 = 240 frames. They flash in strict order.
  const H_PERIOD = 240;
  const H_FLASH  = 35;

  // ─── GRAVITATIONAL WAVE CHIRP (GW150914) ──────────────────────────────
  // Real shape: slow inspiral → chirp → merger peak → ringdown
  // Encoded as brightness multiplier over 480-frame cycle
  const GW_PERIOD = 480;
  const getChirpBrightness = (t) => {
    const phase = t % GW_PERIOD;
    // INSPIRAL (0-320): 8 slow pulses, spacing decreasing
    if(phase < 320) {
      // Pulse spacing shrinks from 55 to 18 across 8 pulses
      let cumulative = 0;
      for(let i=0;i<8;i++){
        const spacing = Math.round(55 - i*4.6);
        const prev = cumulative;
        cumulative += spacing;
        if(phase >= prev && phase < prev+16){
          const brightness=(phase-prev)/16;
          return brightness*(0.3+i*0.08); // each pulse brighter
        }
        if(cumulative > 320) break;
      }
      return 0;
    }
    // CHIRP (320-390): rapid bright pulses
    if(phase < 390) {
      const chirpPhase = phase - 320;
      if(chirpPhase % 10 < 5) return 0.7+(chirpPhase/70)*0.3;
      return 0;
    }
    // MERGER (390-410): ALL symbols flash simultaneously
    if(phase < 410) {
      const mergerPhase = phase - 390;
      return mergerPhase < 10 ? 1.0 : Math.max(0, 1-(mergerPhase-10)/10);
    }
    // RINGDOWN (410-480): 3 fading echoes
    if(phase < 480) {
      const rdPhase = phase - 410;
      const echo = Math.floor(rdPhase / 23);
      const withinEcho = rdPhase % 23;
      if(echo < 3 && withinEcho < 14)
        return Math.max(0, (1-withinEcho/14) * (0.5 - echo*0.14));
      return 0;
    }
    return 0;
  };
  // Each Ring II symbol has a slight phase offset based on position
  // so the wave "sweeps" around the ring visually during chirp

  // ─── MORSE OM in Ring III ──────────────────────────────────────────────
  // O = — — —   M = — —
  // DAH=28f  DIT_GAP=9f  LETTER_GAP=28f  WORD_GAP=55f
  // O: 28+9+28+9+28 = 102f   LETTER_GAP: 28f   M: 28+9+28 = 65f   WORD_GAP: 55f
  // Total: 102+28+65+55 = 250 frames
  const MORSE_PERIOD = 250;
  const isMorseOn = (t) => {
    const phase = t % MORSE_PERIOD;
    // O: three DAH
    if(phase < 28) return true;           // dah 1
    if(phase < 37) return false;          // gap
    if(phase < 65) return true;           // dah 2
    if(phase < 74) return false;          // gap
    if(phase < 102) return true;          // dah 3
    // letter gap
    if(phase < 130) return false;
    // M: two DAH
    if(phase < 158) return true;          // dah 1
    if(phase < 167) return false;         // gap
    if(phase < 195) return true;          // dah 2
    // word gap — silence
    return false;
  };

  // ─── PARTICLE FIGURE (scale 3.2, CY=0.60) ────────────────────────────
  const buildFigure = useCallback(()=>{
    const pts=[], S=3.2;
    const add=(x,y,z,type,col)=>pts.push({
      tx:x*S,ty:y*S,tz:z*S,
      x:(Math.random()-.5)*10,y:(Math.random()-.5)*10,z:(Math.random()-.5)*10,
      color:col,type,size:1.2+Math.random()*2.2,
      baseOpacity:.5+Math.random()*.5,phase:Math.random()*Math.PI*2,
    });
    const r=()=>(Math.random()-.5);
    for(let i=0;i<160;i++){const phi=Math.acos(2*Math.random()-1),th=Math.random()*Math.PI*2,rv=27+r()*5;add(rv*Math.sin(phi)*Math.cos(th),-154+rv*Math.cos(phi),rv*Math.sin(phi)*Math.sin(th),'head','#f0d880');}
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
  const drawPlanet = useCallback((ctx,x,y,sc,p)=>{
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

  // ─── NAVAGRAHA ────────────────────────────────────────────────────────
  const NAVAGRAHA=[
    {name:'Surya',   skt:'☀ सूर्य',   pr:14,col:'#f0b020',hi:'#fff880',sh:'#b05800',corona:true,  speed:.0018,phase:0.20 },
    {name:'Chandra', skt:'☽ चन्द्र',  pr:9, col:'#c8d4e0',hi:'#f0f4ff',sh:'#506878',crescent:true,speed:.0014,phase:1.10 },
    {name:'Mangal',  skt:'♂ मंगल',    pr:8, col:'#c83020',hi:'#ff7060',sh:'#601010',polar:true,   speed:.0012,phase:1.85 },
    {name:'Budh',    skt:'☿ बुध',     pr:6, col:'#7090a0',hi:'#a0c8d8',sh:'#304050',              speed:.0022,phase:2.60 },
    {name:'Brihaspati',skt:'♃ बृहस्पति',pr:19,col:'#d08020',hi:'#f0c060',sh:'#804810',bands:true,speed:.0010,phase:3.30},
    {name:'Shukra',  skt:'♀ शुक्र',   pr:10,col:'#e8e098',hi:'#fffff8',sh:'#a09038',              speed:.0016,phase:4.05 },
    {name:'Shani',   skt:'♄ शनि',     pr:13,col:'#c0a860',hi:'#e8d890',sh:'#7a6428',rings:true,   speed:.0008,phase:4.80 },
    {name:'Rahu',    skt:'☊ राहु',    pr:10,col:'#302840',hi:'#604880',sh:'#100a18',shadow:true,  speed:.0006,phase:5.50 },
    {name:'Ketu',    skt:'☋ केतु',    pr:8, col:'#805060',hi:'#c08090',sh:'#401020',comet:true,   speed:.0005,phase:6.00 },
  ];

  // ─── CANVAS LOOP ──────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize(); window.addEventListener('resize',resize);

    const particles=buildFigure();
    const stars=Array.from({length:320},()=>({x:Math.random()*2400,y:Math.random()*1500,z:200+Math.random()*900,r:.3+Math.random()*1.8,op:.12+Math.random()*.6}));

    const FOV=680, ROTY=.0018, SPAWN=100; // slower rotation
    const s=stateRef.current; s.t=0;

    // Ring II filler symbols — 24 chars, each with a fixed phase offset
    const ring2fill=['∞','DNA','π','⚛','tat','tvam','asi','ħ','Δ','∇','Ψ','∅','E=mc²','∫','☯','ॐ','◎','Ω','∴','∵','lim','∑','☽','✦'].map((ch,i,a)=>({
      ch, phase:(i/a.length)*Math.PI*2,
      speed:.0009,  // slow — ring II is slow
      phaseOffset:i/a.length, // 0→1, used for chirp sweep delay
    }));

    // Ring III — OM symbol + dim filler
    const ring3fill=['अ','ग्र','स','ध','नी','✦','❊','◈','⬡','∞'].map((ch,i,a)=>({
      ch, phase:(i/a.length)*Math.PI*2+0.8, speed:.0004,
    }));
    // OM symbol — orbits very slowly, blinks Morse
    const omOrbit={ phase:Math.PI/2, speed:.0004 };

    const project=(x,y,z,ry,cx,cy)=>{
      const rx=x*Math.cos(ry)-z*Math.sin(ry),rz=x*Math.sin(ry)+z*Math.cos(ry);
      const sc=FOV/(FOV+rz+420);
      return {sx:cx+rx*sc,sy:cy+y*sc,scale:sc,rz};
    };
    const hexA=(hex,a)=>{const rv=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgba(${rv},${g},${b},${a})`;};

    const draw=()=>{
      const W=canvas.width, H=canvas.height;
      const CX=W*.5, CY=H*.60;
      s.t++;
      const rotY=s.t*ROTY;

      // BG
      ctx.fillStyle='rgba(4,2,1,1)'; ctx.fillRect(0,0,W,H);
      const bg=ctx.createRadialGradient(CX,CY,50,CX,CY,Math.min(W,H)*.72);
      bg.addColorStop(0,'rgba(200,175,90,.038)');bg.addColorStop(.7,'rgba(0,0,0,0)');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      // Stars
      stars.forEach(st=>{const sc=FOV/(FOV+st.z);ctx.beginPath();ctx.arc(W*.5+(st.x-W*.5)*sc,H*.5+(st.y-H*.5)*sc,st.r*sc,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,220,${st.op*sc})`;ctx.fill();});

      // ── Particles ──
      const proj=particles.map(p=>{
        if(s.explode){p.x+=(p.x-CX%W)*.05+(Math.random()-.5)*5;p.y+=(p.y-H*.5)*.05+(Math.random()-.5)*5;p.z+=(Math.random()-.5)*7;}
        else if(s.t<SPAWN){p.x+=(p.tx-p.x)*.065;p.y+=(p.ty-p.y)*.065;p.z+=(p.tz-p.z)*.065;}
        else{const d=Math.sin(s.t*.016+p.phase)*2.4;p.x=p.tx+d*Math.cos(p.phase);p.y=p.ty+d*Math.sin(p.phase)*.5;p.z=p.tz+Math.sin(s.t*.013+p.phase*1.3)*3.8;}
        return {...project(p.x,p.y,p.z,rotY,CX,CY),p};
      });
      proj.sort((a,b)=>a.rz-b.rz);
      proj.forEach(({sx,sy,scale,p})=>{
        if(sx<-100||sx>W+100||sy<-100||sy>H+100) return;
        const rv=p.size*scale, al=p.baseOpacity*Math.min(1,s.t/55)*scale*1.5;
        const pulse=1+Math.sin(s.t*.033+p.phase)*.1;
        if(['quill','face','crown','halo'].includes(p.type)){ctx.beginPath();ctx.arc(sx,sy,rv*4*pulse,0,Math.PI*2);ctx.fillStyle=`rgba(240,210,80,${al*.13})`;ctx.fill();}
        ctx.beginPath();ctx.arc(sx,sy,rv*pulse,0,Math.PI*2);
        ctx.fillStyle=hexA(p.color.startsWith('#')?p.color:'#d0b050',al);ctx.fill();
      });

      // ── RING I: Navagraha + Hydrogen Spectrum ──
      if(s.t>30){
        const ral=Math.min((s.t-30)/50,1);
        // Planets
        NAVAGRAHA.forEach(pl=>{
          const a=pl.phase+s.t*pl.speed;
          const pr=project(190*Math.cos(a),-80+190*Math.sin(a)*Math.sin(.18),190*Math.sin(a)*Math.cos(.18),rotY,CX,CY);
          if(pr.scale<.15) return;
          ctx.save();ctx.globalAlpha=ral*Math.min(pr.scale*1.8,1);
          drawPlanet(ctx,pr.sx,pr.sy,pr.scale,pl);
          ctx.restore();
        });

        // 4 Hydrogen emission lines — flash in strict color sequence
        H_LINES.forEach((hl,i)=>{
          const a=hl.phase+s.t*.0009; // slow orbit
          const pr=project(190*Math.cos(a),-80+190*Math.sin(a)*Math.sin(.18),190*Math.sin(a)*Math.cos(.18),rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.8,1);
          if(al<.04) return;

          // Flash on: this symbol lights when its slot in the 240-frame cycle is active
          const slotStart = i * (H_PERIOD/4); // each gets 60 frames
          const phase = s.t % H_PERIOD;
          const withinSlot = phase - slotStart;
          const isFlashing = withinSlot >= 0 && withinSlot < H_FLASH;
          const flashBright = isFlashing ? Math.sin((withinSlot/H_FLASH)*Math.PI) : 0;

          ctx.save();ctx.globalAlpha=al*(isFlashing?1:.18);
          const sz=Math.max(8,11*pr.scale);
          ctx.font=`bold ${sz}px serif`;
          ctx.textAlign='center';ctx.textBaseline='middle';

          if(isFlashing){
            // Glow in the hydrogen wavelength color
            ctx.shadowBlur=20+flashBright*25;
            ctx.shadowColor=hl.col;
            ctx.fillStyle=hl.col;
            // Outer glow circle
            const gr=ctx.createRadialGradient(pr.sx,pr.sy,0,pr.sx,pr.sy,sz*2);
            gr.addColorStop(0,hl.glow+flashBright*.35+')');
            gr.addColorStop(1,hl.glow+'0)');
            ctx.beginPath();ctx.arc(pr.sx,pr.sy,sz*2,0,Math.PI*2);
            ctx.fillStyle=gr;ctx.fill();
            // Re-set for text
            ctx.shadowBlur=20+flashBright*25;ctx.shadowColor=hl.col;ctx.fillStyle=hl.col;
          } else {
            ctx.fillStyle='rgba(200,175,90,.2)';
          }
          ctx.fillText('✦',pr.sx,pr.sy);
          // Wavelength label when flashing
          if(isFlashing&&flashBright>0.4){
            ctx.save();ctx.globalAlpha=flashBright*.7;ctx.font=`${Math.max(6,7*pr.scale)}px 'Cinzel',serif`;
            ctx.fillStyle=hl.col;ctx.fillText(hl.nm+'nm',pr.sx,pr.sy+(sz*1.5));ctx.restore();
          }
          ctx.restore();
        });
      }

      // ── RING II: Gravitational Wave Chirp ──
      if(s.t>55){
        const ral=Math.min((s.t-55)/50,1);
        // Thin orbit guide line (barely visible)
        ctx.save();ctx.globalAlpha=ral*.04;ctx.strokeStyle='rgba(200,175,90,1)';ctx.lineWidth=.5;
        ctx.setLineDash([2,12]);
        ctx.beginPath();
        for(let i=0;i<64;i++){
          const a2=(i/64)*Math.PI*2;
          const pr2=project(310*Math.cos(a2),-30+310*Math.sin(a2)*Math.sin(.32),310*Math.sin(a2)*Math.cos(.32),rotY,CX,CY);
          i===0?ctx.moveTo(pr2.sx,pr2.sy):ctx.lineTo(pr2.sx,pr2.sy);
        }
        ctx.stroke();ctx.setLineDash([]);ctx.restore();

        ring2fill.forEach((orb,i)=>{
          const a=orb.phase+s.t*orb.speed;
          const pr=project(310*Math.cos(a),-30+310*Math.sin(a)*Math.sin(.32),310*Math.sin(a)*Math.cos(.32),rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.5,.75);if(al<.04) return;

          // Chirp brightness — each symbol gets a slightly different phase offset
          // so the wave "sweeps" around the ring (inspiral sweep effect)
          const sweepOffset=Math.floor(orb.phaseOffset*60); // 0-60 frame offset
          const chirpBright=getChirpBrightness(s.t-sweepOffset);
          const isMerger=(s.t-sweepOffset)%GW_PERIOD>=390&&(s.t-sweepOffset)%GW_PERIOD<410;

          const finalAlpha=al*(chirpBright>0?Math.min(1,.15+chirpBright):.15);
          ctx.save();ctx.globalAlpha=finalAlpha;
          ctx.font=`${(orb.ch.length>3?7:10)*pr.scale}px 'Cinzel',serif`;
          ctx.textAlign='center';ctx.textBaseline='middle';
          if(chirpBright>0.3){
            ctx.shadowBlur=isMerger?30:8;
            ctx.shadowColor=isMerger?'rgba(200,200,255,.9)':'rgba(180,200,255,.6)';
            ctx.fillStyle=isMerger?'rgba(220,220,255,1)':'rgba(160,195,240,0.85)';
          } else {
            ctx.fillStyle='rgba(140,190,215,0.22)';
          }
          ctx.fillText(orb.ch,pr.sx,pr.sy);
          ctx.restore();
        });
      }

      // ── RING III: OM in Morse + filler ──
      if(s.t>80){
        const ral=Math.min((s.t-80)/60,1);

        // Filler symbols — dim, slow
        ring3fill.forEach(orb=>{
          const a=orb.phase+s.t*orb.speed;
          const pr=project(430*Math.cos(a),430*Math.sin(a)*Math.sin(.50),430*Math.sin(a)*Math.cos(.50),rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.8,.6);if(al<.04) return;
          ctx.save();ctx.globalAlpha=al*.4;
          ctx.font=`${9*pr.scale}px 'Noto Serif Devanagari',serif`;
          ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillStyle='rgba(200,175,90,0.35)';ctx.fillText(orb.ch,pr.sx,pr.sy);
          ctx.restore();
        });

        // OM — the Morse blinker
        const omAngle=omOrbit.phase+s.t*omOrbit.speed;
        const omPr=project(430*Math.cos(omAngle),430*Math.sin(omAngle)*Math.sin(.50),430*Math.sin(omAngle)*Math.cos(.50),rotY,CX,CY);
        const omAl=ral*Math.min(omPr.scale*1.8,.95);
        if(omAl>0.04){
          const morseOn=isMorseOn(s.t);
          const morsePhase=s.t%MORSE_PERIOD;
          // How far into current blink (for smooth fade-in/out)
          const blinkSmooth=morseOn?Math.min(morsePhase%40/8,1):0;

          ctx.save();ctx.globalAlpha=omAl*(morseOn?1:.2);
          const omSz=Math.max(10,18*omPr.scale);
          ctx.font=`bold ${omSz}px 'Noto Serif Devanagari',serif`;
          ctx.textAlign='center';ctx.textBaseline='middle';
          if(morseOn){
            ctx.shadowBlur=20+blinkSmooth*20;ctx.shadowColor='rgba(240,200,80,.95)';
            ctx.fillStyle='rgba(255,225,60,1)';
            // Outer halo
            const og=ctx.createRadialGradient(omPr.sx,omPr.sy,0,omPr.sx,omPr.sy,omSz*2.2);
            og.addColorStop(0,'rgba(240,200,80,.25)');og.addColorStop(1,'rgba(240,200,80,0)');
            ctx.beginPath();ctx.arc(omPr.sx,omPr.sy,omSz*2.2,0,Math.PI*2);ctx.fillStyle=og;ctx.fill();
            ctx.shadowBlur=20+blinkSmooth*20;ctx.shadowColor='rgba(240,200,80,.95)';ctx.fillStyle='rgba(255,225,60,1)';
          } else {
            ctx.fillStyle='rgba(200,175,90,0.28)';
          }
          ctx.fillText('ॐ',omPr.sx,omPr.sy);
          ctx.restore();
        }
      }

      // Ink drips from quill
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

      {/* Ring legend — minimal, top left */}
      <div style={{position:'fixed',top:22,left:22,zIndex:10,display:'flex',flexDirection:'column',gap:6,opacity:0,animation:'fadeIn 1s ease 2s both'}}>
        {[
          {col:'rgba(240,190,60,.7)',  label:'Navagraha · Nine Planets'},
          {col:'rgba(255,53,32,.8)',   label:'Ring I — four lights, always same order'},
          {col:'rgba(160,195,240,.7)', label:'Ring II — a wave from 1.3 billion light years'},
          {col:'rgba(240,200,80,.9)',  label:'Ring III — ॐ speaks, if you listen'},
        ].map((row,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:7}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:row.col,boxShadow:`0 0 5px ${row.col}`,flexShrink:0}}/>
            <span style={{fontSize:8,color:'rgba(200,175,90,.4)',fontFamily:"'Cinzel',serif",letterSpacing:1.2}}>{row.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'10px 24px 18px',background:'linear-gradient(0deg,rgba(4,2,1,.95) 60%,transparent)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,zIndex:10}}>
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
