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
function ChitraguptaIntroScreen({ players, chosenLang, muted, onBegin, onSkip }) {
  const canvasRef   = useRef(null);
  const stateRef    = useRef({
    t: 0, explode: false,
    // Each box: how many frames it stays lit after key digit hits apex
    box: [0, 0, 0],
    grandFlash: 0,   // frames remaining for grand alignment flash
    grandDone: false,
  });
  const rafRef      = useRef(null);
  const [done,        setDone]        = useState(false);
  const [exploding,   setExploding]   = useState(false);
  const [grandSeen,   setGrandSeen]   = useState(false);
  const [boxDisplay,  setBoxDisplay]  = useState(['?','?','?']); // what each box shows

  useEffect(()=>{ const t=setTimeout(()=>setDone(true),30000); return()=>clearTimeout(t); },[]);
  useEffect(()=>{
    if(!muted) setTimeout(()=>VoiceEngine.speakChitragupta('open',chosenLang),900);
    return()=>VoiceEngine.stop();
  },[]);

  // ── KEY DIGITS — the three tumblers ──────────────────────────────────────
  // Each has a period (in frames) and a phase so key starts at apex (top)
  const KEY = [
    { digit:'१', period:108, color:'#f0d050', glow:'rgba(240,200,80,',  ring:1 },
    { digit:'०', period:216, color:'#80c8f0', glow:'rgba(100,180,240,', ring:2 },
    { digit:'८', period:324, color:'#f090c0', glow:'rgba(240,120,180,', ring:3 },
  ];
  // Period of grand alignment = LCM(108,216,324) = 648
  const GRAND_PERIOD = 648;

  // ── PARTICLE FIGURE (scale 3.2, CY shifted down) ─────────────────────────
  const buildFigure = () => {
    const pts=[], S=3.2;
    const add=(x,y,z,type,col)=>pts.push({
      tx:x*S, ty:y*S, tz:z*S,
      x:(Math.random()-.5)*10, y:(Math.random()-.5)*10, z:(Math.random()-.5)*10,
      color:col, type, size:1.2+Math.random()*2.2,
      baseOpacity:.5+Math.random()*.5, phase:Math.random()*Math.PI*2,
    });
    const r=()=>(Math.random()-.5);
    for(let i=0;i<160;i++){const phi=Math.acos(2*Math.random()-1),th=Math.random()*Math.PI*2,rv=27+r()*5; add(rv*Math.sin(phi)*Math.cos(th),-154+rv*Math.cos(phi),rv*Math.sin(phi)*Math.sin(th),'head','#f0d880');}
    for(let i=0;i<55;i++) add(r()*17,-150+r()*21,25+r()*9,'face','#fffce0');
    for(let s2=0;s2<5;s2++){const a=(s2/5)*Math.PI*2,cx=22*Math.cos(a),cz=22*Math.sin(a); for(let j=0;j<14;j++) add(cx*(1-j*.04),-182-j*9+r()*4,cz*(1-j*.04),'crown','#ffe040');}
    for(let i=0;i<70;i++){const a=(i/70)*Math.PI*2; add(27*Math.cos(a)+r()*3,-187+r()*4,27*Math.sin(a)+r()*3,'crown','#f0c820');}
    for(let i=0;i<150;i++){const a=(i/150)*Math.PI*2,rv=72+r()*10; add(rv*Math.cos(a)+r()*4,-154+r()*8,-4+rv*Math.sin(a)*.2,'halo','#f0d050');}
    for(let i=0;i<55;i++){const a=(i/55)*Math.PI*2,rv=50+r()*10; add(rv*Math.cos(a),-154+r()*5,rv*Math.sin(a)*.16,'halo','rgba(240,208,80,0.5)');}
    for(let i=0;i<230;i++){const t=Math.random(),a=Math.random()*Math.PI*2,y=-120+t*100,rx=31*(1-Math.pow((t-.5)*2,2)*.45); add(rx*Math.cos(a)+r()*6,y+r()*8,rx*.55*Math.sin(a)+r()*5,'body','#ddb84a');}
    for(let i=0;i<40;i++){const t=i/40,a=t*Math.PI; add(31*Math.cos(a)-6,-120+t*62+r()*4,31*Math.cos(a)*.3+r()*3,'thread','#f0d060');}
    for(let i=0;i<115;i++){const t=i/115; add(28+t*84+r()*8,-110-t*74+r()*8,t*25+r()*8,'arm','#c8a840');}
    for(let i=0;i<115;i++){const t=i/115; add(26+t*77+r()*8,-96+t*67+r()*8,t*18+r()*8,'arm','#c8a840');}
    for(let i=0;i<115;i++){const t=i/115; add(-28-t*77+r()*8,-110-t*62+r()*8,t*18+r()*8,'arm','#c8a840');}
    for(let i=0;i<115;i++){const t=i/115; add(-26-t*71+r()*8,-94+t*61+r()*8,t*12+r()*8,'arm','#c8a840');}
    for(let i=0;i<50;i++){const t=i/50; add(114+t*38+r()*5,-186-t*50+r()*5,25+t*7+r()*4,'quill','#ffffff');}
    for(let i=0;i<34;i++) add(119+i*1.4+r()*5,-194-i*1.9+r()*5,27+r()*4,'quill','#f0e888');
    for(let i=0;i<52;i++){const a=(i/52)*Math.PI; add(102+18*Math.cos(a)+r()*4,-31+10*Math.sin(a)+r()*4,18+r()*4,'scroll','#e8d070');}
    for(let i=0;i<62;i++) add(-99+r()*26,-36+r()*27,15+r()*7,'ledger','#c8aa50');
    for(let i=0;i<90;i++){const t=i/90; add(13+t*54+r()*10,-16+t*35+r()*10,-7+t*7+r()*10,'leg','#c0a030');}
    for(let i=0;i<90;i++){const t=i/90; add(-13-t*50+r()*10,-16+t*33+r()*10,-7+t*7+r()*10,'leg','#c0a030');}
    for(let p=0;p<16;p++){const pa=(p/16)*Math.PI*2; for(let j=0;j<24;j++){const t=j/24,rv=52+t*32; add(rv*Math.cos(pa)+r()*7,26+t*26+r()*6,rv*Math.sin(pa)*.55+r()*6,'lotus',p%3===0?'#ff90c0':p%3===1?'#e070a8':'#ff80b8');}}
    for(let i=0;i<55;i++){const a=Math.random()*Math.PI*2,rv=Math.random()*38; add(rv*Math.cos(a)+r()*4,26+r()*8,rv*Math.sin(a)*.5+r()*4,'lotus','#ffb0d0');}
    for(let i=0;i<160;i++){const a=Math.random()*Math.PI*2,rv=92+Math.random()*85; add(rv*Math.cos(a)+r()*22,-62+r()*225,rv*Math.sin(a)*.65+r()*22,'aura','#f0d050');}
    return pts;
  };

  // ── DRAW PLANET ───────────────────────────────────────────────────────────
  const drawPlanet=(ctx,x,y,sc,p)=>{
    const rv=p.pr*sc; if(rv<1.2) return;
    if(p.rings){
      ctx.save(); ctx.translate(x,y); ctx.scale(1,.28);
      ctx.beginPath(); ctx.arc(0,0,rv*2.6,0,Math.PI*2); ctx.strokeStyle='rgba(210,185,115,.5)'; ctx.lineWidth=rv*.85/.28; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,rv*1.75,0,Math.PI*2); ctx.strokeStyle='rgba(185,160,90,.38)'; ctx.lineWidth=rv*.42/.28; ctx.stroke();
      ctx.restore();
    }
    const g=ctx.createRadialGradient(x-rv*.38,y-rv*.38,0,x,y,rv);
    g.addColorStop(0,p.hi); g.addColorStop(.65,p.col); g.addColorStop(1,p.sh);
    ctx.beginPath(); ctx.arc(x,y,rv,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    if(p.corona){for(let ray=0;ray<8;ray++){const ra=(ray/8)*Math.PI*2;ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle='#f8d840';ctx.lineWidth=rv*.22;ctx.beginPath();ctx.moveTo(x+Math.cos(ra)*rv,y+Math.sin(ra)*rv);ctx.lineTo(x+Math.cos(ra)*rv*1.9,y+Math.sin(ra)*rv*1.9);ctx.stroke();ctx.restore();}}
    if(p.crescent){ctx.save();ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.clip();ctx.beginPath();ctx.arc(x+rv*.45,y,rv*.98,0,Math.PI*2);ctx.fillStyle='rgba(20,30,55,.78)';ctx.fill();ctx.restore();}
    if(p.polar){ctx.save();ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(x,y-rv*.62,rv*.3,0,Math.PI*2);ctx.fillStyle='#fff8f0';ctx.fill();ctx.beginPath();ctx.arc(x,y+rv*.62,rv*.2,0,Math.PI*2);ctx.fillStyle='#fff8f0';ctx.fill();ctx.restore();}
    if(p.bands){ctx.save();ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.clip();for(let b=0;b<5;b++){ctx.fillStyle=b%2===0?'rgba(160,75,15,.32)':'rgba(80,38,8,.22)';ctx.fillRect(x-rv,y-rv+b*rv*.4,rv*2,rv*.35);}ctx.beginPath();ctx.ellipse(x-rv*.08,y+rv*.17,rv*.32,rv*.16,0,0,Math.PI*2);ctx.fillStyle='rgba(190,55,35,.48)';ctx.fill();ctx.restore();}
    if(p.rings){const g2=ctx.createRadialGradient(x-rv*.38,y-rv*.38,0,x,y,rv);g2.addColorStop(0,p.hi);g2.addColorStop(.65,p.col);g2.addColorStop(1,p.sh);ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.fillStyle=g2;ctx.fill();}
    if(p.shadow){const sg=ctx.createRadialGradient(x,y,rv*.25,x,y,rv*2);sg.addColorStop(0,'transparent');sg.addColorStop(.55,'rgba(40,8,70,.14)');sg.addColorStop(1,'rgba(70,18,110,.28)');ctx.beginPath();ctx.arc(x,y,rv*2,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();}
    if(p.comet){ctx.save();ctx.globalAlpha=.38;const tg=ctx.createLinearGradient(x,y,x-rv*5,y);tg.addColorStop(0,'rgba(200,130,160,.7)');tg.addColorStop(1,'transparent');ctx.beginPath();ctx.moveTo(x,y-rv*.65);ctx.lineTo(x-rv*5,y);ctx.lineTo(x,y+rv*.65);ctx.fillStyle=tg;ctx.fill();ctx.restore();}
    ctx.save();ctx.globalAlpha=Math.min(sc*.85,.75);ctx.font=`${Math.max(6,8*sc)}px 'Noto Serif Devanagari',serif`;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle='rgba(200,175,90,.6)';ctx.fillText(p.skt,x,y+rv*(p.rings?2.2:1.55));ctx.restore();
  };

  const NAVAGRAHA=[
    {name:'Surya',   skt:'☀ सूर्य',   pr:14,col:'#f0b020',hi:'#fff880',sh:'#b05800',corona:true,  speed:.0026,phase:0    },
    {name:'Chandra', skt:'☽ चन्द्र',  pr:9, col:'#c8d4e0',hi:'#f0f4ff',sh:'#506878',crescent:true,speed:.0020,phase:.70  },
    {name:'Mangal',  skt:'♂ मंगल',    pr:8, col:'#c83020',hi:'#ff7060',sh:'#601010',polar:true,   speed:.0017,phase:1.40 },
    {name:'Budh',    skt:'☿ बुध',     pr:6, col:'#7090a0',hi:'#a0c8d8',sh:'#304050',              speed:.0030,phase:2.10 },
    {name:'Brihaspati',skt:'♃ बृहस्पति',pr:19,col:'#d08020',hi:'#f0c060',sh:'#804810',bands:true,speed:.0015,phase:2.80},
    {name:'Shukra',  skt:'♀ शुक्र',   pr:10,col:'#e8e098',hi:'#fffff8',sh:'#a09038',              speed:.0023,phase:3.50 },
    {name:'Shani',   skt:'♄ शनि',     pr:13,col:'#c0a860',hi:'#e8d890',sh:'#7a6428',rings:true,   speed:.0011,phase:4.20 },
    {name:'Rahu',    skt:'☊ राहु',    pr:10,col:'#302840',hi:'#604880',sh:'#100a18',shadow:true,  speed:.0009,phase:4.90 },
    {name:'Ketu',    skt:'☋ केतु',    pr:8, col:'#805060',hi:'#c08090',sh:'#401020',comet:true,   speed:.0007,phase:5.60 },
  ];

  // ── RING II — science symbols (excluding key digit positions) ─────────────
  const buildRing2=(keyPhase)=>{
    const symbols=['∞','DNA','π','⚛','tat','tvam','asi','ħ','Δ','∇','Ψ','∅','E=mc²','∫','☯','ॐ','◎','Ω','∴','∵','lim','∑'];
    return symbols.map((ch,i,a)=>({
      ch, radius:310, inclination:.32, speed:(Math.PI*2)/216,
      phase:keyPhase+(i+1)*(Math.PI*2/a.length),  // never at apex at frame 0
      sz:ch.length>3?7:11, col:'rgba(140,190,215,0.6)', isKey:false,
    }));
  };

  // ── CANVAS LOOP ───────────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize(); window.addEventListener('resize',resize);

    const particles=buildFigure();
    const stars=Array.from({length:320},()=>({x:Math.random()*2400,y:Math.random()*1500,z:200+Math.random()*900,r:.3+Math.random()*1.8,op:.12+Math.random()*.6}));
    const FOV=680, ROTY=.0022, SPAWN=100;
    const s=stateRef.current; s.t=0;

    // Build ring chars — key digits phase=0 (start at apex)
    // Ring I  key = १  at phase 0,  speed = 2π/108
    // Ring II key = ०  at phase 0,  speed = 2π/216
    // Ring III key = ८  at phase 0,  speed = 2π/324
    const RING_SPEED = [
      (Math.PI*2)/108,   // Ring I  — period 108 frames
      (Math.PI*2)/216,   // Ring II — period 216 frames
      (Math.PI*2)/324,   // Ring III — period 324 frames
    ];

    // Ring I characters — planets serve as backdrop, key digit १ orbits independently
    const keyChars=[
      { ch:'१', radius:190, inclination:.18, speed:RING_SPEED[0], phase:Math.PI/2, sz:16, isKey:true, keyIdx:0, color:'#f0d050' },
      { ch:'०', radius:310, inclination:.32, speed:RING_SPEED[1], phase:Math.PI/2, sz:16, isKey:true, keyIdx:1, color:'#80c8f0' },
      { ch:'८', radius:430, inclination:.50, speed:RING_SPEED[2], phase:Math.PI/2, sz:16, isKey:true, keyIdx:2, color:'#f090c0' },
    ];
    // Ring II filler symbols (slow drift, not keys)
    const ring2fill=['∞','DNA','π','⚛','tat','tvam','asi','ħ','Δ','∇','Ψ','∅','E=mc²','∫','☯','ॐ','◎','Ω','∴','∵'].map((ch,i,a)=>({
      ch, radius:310, inclination:.32, speed:.0014,
      phase:(i/a.length)*Math.PI*2+1.2,  // offset so ० has space
      sz:ch.length>3?7:10, col:'rgba(140,190,215,0.55)', isKey:false,
    }));
    // Ring III filler
    const ring3fill=['अ','ग्र','स','ध','नी','ॐ','✦','❊','◈','⬡'].map((ch,i,a)=>({
      ch, radius:430, inclination:.50, speed:.0008,
      phase:(i/a.length)*Math.PI*2+1.8,
      sz:ch==='ॐ'?14:9, col:'rgba(200,175,90,0.28)', isKey:false,
    }));

    const project=(x,y,z,ry,cx,cy)=>{
      const rx=x*Math.cos(ry)-z*Math.sin(ry), rz=x*Math.sin(ry)+z*Math.cos(ry);
      const sc=FOV/(FOV+rz+420);
      return {sx:cx+rx*sc, sy:cy+y*sc, scale:sc, rz};
    };

    // Check if key char is near apex (12-o'clock = angle π/2 in our system)
    // apex when sin(angle) = 1 → angle ≈ π/2 + 2πn
    const isAtApex=(t,speed,phase)=>{
      const angle=phase+t*speed;
      const norm=((angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
      // apex is at π/2 (sin = 1 → top of orbit in our y-projection)
      const diff=Math.abs(norm-Math.PI/2);
      return Math.min(diff, Math.PI*2-diff) < 0.08;
    };

    const draw=()=>{
      const W=canvas.width, H=canvas.height;
      const CX=W*.5, CY=H*.60; // shifted down — crown stays visible
      s.t++;
      const rotY=s.t*ROTY;

      // ── Check each key digit ──
      const atApex=[false,false,false];
      keyChars.forEach((kc,i)=>{
        if(isAtApex(s.t, kc.speed, kc.phase)){
          atApex[i]=true;
          s.box[i]=28; // light box for 28 frames
        }
        if(s.box[i]>0) s.box[i]--;
      });

      // ── Grand Alignment: all three at apex ──
      if(s.t>120 && atApex[0]&&atApex[1]&&atApex[2]){
        s.grandFlash=120;
        if(!s.grandDone){ s.grandDone=true; setGrandSeen(true); }
      }
      if(s.grandFlash>0) s.grandFlash--;
      const gf=s.grandFlash/120; // 0→1

      // Update React box display
      const disp=s.box.map((b,i)=>b>0?KEY[i].digit:'?');
      setBoxDisplay([...disp]);

      // BG
      ctx.fillStyle='rgba(4,2,1,1)'; ctx.fillRect(0,0,W,H);
      const bg=ctx.createRadialGradient(CX,CY,50,CX,CY,Math.min(W,H)*.7);
      bg.addColorStop(0,`rgba(200,175,90,${.04+gf*.12})`);
      bg.addColorStop(.7,'rgba(120,95,40,.01)'); bg.addColorStop(1,'transparent');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      // Stars
      stars.forEach(st=>{const sc=FOV/(FOV+st.z);const sx=W*.5+(st.x-W*.5)*sc,sy=H*.5+(st.y-H*.5)*sc;ctx.beginPath();ctx.arc(sx,sy,st.r*sc,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,220,${st.op*sc})`;ctx.fill();});

      // Grand alignment: expanding rings + screen flash
      if(gf>0){
        for(let ring=0;ring<5;ring++){
          const rAge=((1-gf)*150+ring*30)%150;
          const rAlpha=Math.max(0,(1-rAge/150))*.5*gf;
          ctx.beginPath(); ctx.arc(CX,CY,rAge*Math.max(W,H)*.006,0,Math.PI*2);
          ctx.strokeStyle=`rgba(240,200,80,${rAlpha})`; ctx.lineWidth=2.5; ctx.stroke();
        }
      }

      // Particles
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
        ctx.beginPath(); ctx.arc(sx,sy,rv*pulse,0,Math.PI*2);
        const hex=p.color.startsWith('#')?p.color:'#d0b050';
        const rv2=parseInt(hex.slice(1,3),16),gv=parseInt(hex.slice(3,5),16),bv=parseInt(hex.slice(5,7),16);
        ctx.fillStyle=`rgba(${rv2},${gv},${bv},${al})`; ctx.fill();
      });

      // ── Ring I: Navagraha planets ──
      if(s.t>30){
        const ral=Math.min((s.t-30)/50,1);
        NAVAGRAHA.forEach(pl=>{
          const angle=pl.phase+s.t*pl.speed;
          const ox=190*Math.cos(angle), oy=-80+190*Math.sin(angle)*Math.sin(.18), oz=190*Math.sin(angle)*Math.cos(.18);
          const pr=project(ox,oy,oz,rotY,CX,CY);
          if(pr.scale<.15) return;
          ctx.save(); ctx.globalAlpha=ral*Math.min(pr.scale*1.8,1);
          drawPlanet(ctx,pr.sx,pr.sy,pr.scale,pl);
          ctx.restore();
        });
      }

      // ── Ring II filler ──
      if(s.t>55){
        const ral=Math.min((s.t-55)/50,1);
        ring2fill.forEach(orb=>{
          const angle=orb.phase+s.t*orb.speed;
          const ox=orb.radius*Math.cos(angle), oy=-30+orb.radius*Math.sin(angle)*Math.sin(orb.inclination), oz=orb.radius*Math.sin(angle)*Math.cos(orb.inclination);
          const pr=project(ox,oy,oz,rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.6,.7); if(al<.04) return;
          ctx.save(); ctx.globalAlpha=al;
          ctx.font=`${orb.sz*pr.scale}px 'Cinzel',serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.shadowBlur=6; ctx.shadowColor='rgba(140,190,215,.4)'; ctx.fillStyle='rgba(140,190,215,0.65)';
          ctx.fillText(orb.ch,pr.sx,pr.sy); ctx.restore();
        });
      }

      // ── Ring III filler ──
      if(s.t>80){
        const ral=Math.min((s.t-80)/60,1);
        ring3fill.forEach(orb=>{
          const angle=orb.phase+s.t*orb.speed;
          const ox=orb.radius*Math.cos(angle), oy=orb.radius*Math.sin(angle)*Math.sin(orb.inclination), oz=orb.radius*Math.sin(angle)*Math.cos(orb.inclination);
          const pr=project(ox,oy,oz,rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.8,.85); if(al<.04) return;
          ctx.save(); ctx.globalAlpha=al;
          ctx.font=`${orb.sz*pr.scale}px 'Noto Serif Devanagari',serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillStyle='rgba(200,175,90,0.32)'; ctx.fillText(orb.ch,pr.sx,pr.sy); ctx.restore();
        });
      }

      // ── KEY DIGITS — the three cipher tumblers ──
      keyChars.forEach((kc,i)=>{
        if(s.t<40+i*20) return;
        const angle=kc.phase+s.t*kc.speed;
        const radius=kc.radius;
        const inclination=kc.keyIdx===0?.18:kc.keyIdx===1?.32:.50;
        const ox=radius*Math.cos(angle);
        const oy=(kc.keyIdx===0?-80:kc.keyIdx===1?-30:0)+radius*Math.sin(angle)*Math.sin(inclination);
        const oz=radius*Math.sin(angle)*Math.cos(inclination);
        const pr=project(ox,oy,oz,rotY,CX,CY);
        const isLit=s.box[i]>0;
        const litPct=isLit?s.box[i]/28:0;
        const al=Math.min((s.t-(40+i*20))/50,1)*Math.min(pr.scale*2,1)*(isLit?1:0.5);
        if(al<.04) return;
        ctx.save(); ctx.globalAlpha=al;
        const sz=kc.sz*(isLit?1.5:0.9)*Math.max(pr.scale,.35);
        ctx.font=`bold ${sz}px 'Noto Serif Devanagari',serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        if(isLit){
          // Lit — glow in key colour + grand flash bonus
          ctx.shadowBlur=25+litPct*20+gf*40; ctx.shadowColor=kc.color;
          ctx.fillStyle=kc.color;
          // Draw orbit position circle indicator
          ctx.beginPath(); ctx.arc(pr.sx,pr.sy,sz*.75,0,Math.PI*2);
          ctx.strokeStyle=kc.color+'99'; ctx.lineWidth=1.5; ctx.stroke();
        } else {
          ctx.shadowBlur=4; ctx.shadowColor=kc.color+'60';
          ctx.fillStyle=kc.color+'80';
        }
        ctx.fillText(kc.ch,pr.sx,pr.sy); ctx.restore();

        // Apex flash beam — vertical line from key to bottom of screen when lit
        if(isLit&&litPct>0.5){
          ctx.save(); ctx.globalAlpha=litPct*.25;
          const lineGrad=ctx.createLinearGradient(pr.sx,pr.sy,pr.sx,H);
          lineGrad.addColorStop(0,kc.color); lineGrad.addColorStop(1,'transparent');
          ctx.strokeStyle=lineGrad; ctx.lineWidth=1; ctx.setLineDash([3,8]);
          ctx.beginPath(); ctx.moveTo(pr.sx,pr.sy); ctx.lineTo(pr.sx,H); ctx.stroke();
          ctx.setLineDash([]); ctx.restore();
        }
      });

      // Ink drips
      if(s.t>90&&!s.explode){const ia=Math.min((s.t-90)/40,1);for(let i=0;i<2;i++){const pr=project(115+Math.random()*18,-190+Math.random()*10,24,rotY,CX,CY);ctx.beginPath();ctx.arc(pr.sx,pr.sy,1.8*pr.scale,0,Math.PI*2);ctx.fillStyle=`rgba(240,210,80,${ia*.4*Math.random()})`;ctx.fill();}}
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>{ cancelAnimationFrame(rafRef.current); window.removeEventListener('resize',resize); };
  },[]);

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

      {/* Ring legend */}
      <div style={{position:'fixed',top:22,left:22,zIndex:10,display:'flex',flexDirection:'column',gap:5}}>
        {[
          {col:'rgba(240,190,60,.65)',label:'Navagraha · Nine Planets'},
          {col:'rgba(140,190,215,.6)',label:'Science · Vedic · Hidden'},
          {col:'rgba(200,175,90,.5)', label:'The Outer Reaches'},
        ].map((r,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:7,opacity:.4}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:r.col,boxShadow:`0 0 5px ${r.col}`,flexShrink:0}}/>
            <span style={{fontSize:7.5,color:'rgba(200,175,90,.4)',fontFamily:"'Cinzel',serif",letterSpacing:1.5}}>{r.label}</span>
          </div>
        ))}
      </div>

      {/* ══ THE THREE-RING CIPHER — indicator boxes ══ */}
      <div style={{
        position:'fixed', bottom:96, left:'50%', transform:'translateX(-50%)',
        zIndex:15, display:'flex', flexDirection:'column', alignItems:'center', gap:8,
        transition:'bottom .5s ease',
      }}>
        {/* Cipher boxes */}
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          {KEY.map((k,i)=>{
            const lit=boxDisplay[i]!=='?';
            return(
              <div key={i} style={{
                width:42, height:48, borderRadius:6,
                border:`1.5px solid ${lit?k.color+'80':'rgba(200,175,90,.12)'}`,
                background:lit?`${k.color}10`:'rgba(8,5,2,.8)',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                transition:'all .2s',
                boxShadow:lit?`0 0 18px ${k.color}40, inset 0 0 10px ${k.color}10`:'none',
              }}>
                <div style={{
                  fontSize:lit?20:12,
                  color:lit?k.color:'rgba(200,175,90,.18)',
                  fontFamily:"'Noto Serif Devanagari',serif",
                  fontWeight:700,lineHeight:1,
                  textShadow:lit?`0 0 15px ${k.color}`:'none',
                  transition:'all .15s',
                }}>
                  {boxDisplay[i]}
                </div>
                {/* Ring label */}
                <div style={{fontSize:6,color:`${k.color}50`,letterSpacing:1,marginTop:2,fontFamily:"'Cinzel',serif"}}>
                  {i===0?'I':i===1?'II':'III'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand alignment message */}
      </div>

      {/* Bottom: players + begin */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'10px 24px 18px',background:'linear-gradient(0deg,rgba(4,2,1,.95) 60%,transparent)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,zIndex:10}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {players.filter(p=>!p.cpu).map((p,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',background:'rgba(200,175,90,.04)',border:'1px solid rgba(200,175,90,.1)',borderRadius:16}}>
              <span style={{fontSize:15}}>{p.char.icon}</span>
              <span style={{fontSize:9,color:'rgba(200,175,90,.38)',fontFamily:"'Cinzel',serif",letterSpacing:1}}>{p.name}</span>
            </div>
          ))}
        </div>
        {done?(
          <button onClick={handleBegin} disabled={exploding} style={{background:exploding?'transparent':'linear-gradient(180deg,rgba(200,175,90,.2),rgba(200,175,90,.07))',border:'1.5px solid rgba(200,175,90,.45)',color:'#f0d050',padding:'11px 32px',fontSize:12,fontFamily:"'Cinzel',serif",cursor:exploding?'default':'pointer',borderRadius:4,letterSpacing:4,animation:exploding?'none':'pulse 2.5s ease infinite'}}>
            {exploding?'✦':'▸ '+(isHi?'खेल आरंभ':'BEGIN')}
          </button>
        ):(
          <div style={{fontSize:8,color:'rgba(200,175,90,.18)',letterSpacing:3,fontFamily:"'Cinzel',serif",animation:'pulse 3s ease infinite'}}>
            {isHi?'अग्रसंधानी खुल रही है...':'AGRASANDHANI OPENS...'}
          </div>
        )}
      </div>
    </div>
  );
}
