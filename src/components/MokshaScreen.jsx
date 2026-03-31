import { useState, useMemo, useEffect, useRef } from 'react';
import YamaJudgment from './YamaJudgment.jsx';

// ══════════════════════════════════════════════════════════════════════
// ✨ MOKSHA SCREEN — Full-screen canvas ascension cinematic
//    Winner's soul ascends through all three realms to Swarga.
//    2000 golden particles, lotus bloom, Chitragupta seals the ledger.
// ══════════════════════════════════════════════════════════════════════
export default function MokshaScreen({ winner, players, punya, papa, onClose, muted }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const [phase, setPhase] = useState(0); // 0=ascend 1=swarga 2=judgment
  const [showJudge, setShowJudge] = useState(false);
  // Find loser with most papa (for judgment)
  const loserIdx = useMemo(()=>{
    let mi=-1;
    players.forEach((_,i)=>{
      if(i!==winner&&(mi<0||papa[i]>papa[mi])) mi=i;
    });
    return mi;
  },[players, winner, papa]);
  const wPunya = punya[winner]||0;
  const wPapa  = papa[winner]||0;
  const wp = players[winner];
  const lp = loserIdx>=0 ? players[loserIdx] : null;

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    let t=0;
    const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize(); window.addEventListener('resize',resize);

    // ── Particle system ──
    const PARTICLE_COUNT=1800;
    const particles=[];
    for(let i=0;i<PARTICLE_COUNT;i++){
      const angle=(Math.random()*Math.PI*2);
      const radius=Math.random()*canvas.width*0.3;
      particles.push({
        x: canvas.width/2 + Math.cos(angle)*radius*Math.random(),
        y: canvas.height*0.8 + Math.random()*canvas.height*0.3,
        vx: (Math.random()-0.5)*1.2,
        vy: -(0.8+Math.random()*3.5),
        size: 0.8+Math.random()*3.5,
        opacity: 0.4+Math.random()*0.6,
        hue: 30+Math.random()*30, // gold range
        life: 0,
        maxLife: 120+Math.random()*180,
        delay: Math.random()*60,
        spiral: (Math.random()-0.5)*0.04,
      });
    }
    // Realm labels
    const REALMS=[
      {y:0.75,label:'भूलोक',color:'rgba(160,120,60,.4)'},
      {y:0.45,label:'अन्तर्लोक',color:'rgba(80,120,160,.4)'},
      {y:0.18,label:'स्वर्गलोक',color:'rgba(160,120,220,.4)'},
      {y:0.02,label:'परमधाम',color:'rgba(240,200,80,.5)'},
    ];

    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      t++;

      // Background gradient
      const grad=ctx.createLinearGradient(0,canvas.height,0,0);
      grad.addColorStop(0,'rgba(8,5,2,.95)');
      grad.addColorStop(0.4,'rgba(10,8,20,.9)');
      grad.addColorStop(0.75,'rgba(15,10,35,.85)');
      grad.addColorStop(1,'rgba(30,20,60,.8)');
      ctx.fillStyle=grad;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      // Realm boundary lines
      REALMS.forEach(r=>{
        const y=r.y*canvas.height;
        ctx.strokeStyle=r.color;
        ctx.lineWidth=.8;
        ctx.setLineDash([4,8]);
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle=r.color;
        ctx.font=`${Math.max(10,canvas.width*0.018)}px Cinzel,serif`;
        ctx.textAlign='right';
        ctx.fillText(r.label, canvas.width-16, y-6);
      });

      // Light beam from center bottom
      const beamCx=canvas.width/2;
      if(t>20){
        const beamGrad=ctx.createLinearGradient(beamCx,canvas.height,beamCx,0);
        beamGrad.addColorStop(0,'rgba(240,200,80,0)');
        beamGrad.addColorStop(0.3,'rgba(240,200,80,.06)');
        beamGrad.addColorStop(0.7,'rgba(200,180,240,.08)');
        beamGrad.addColorStop(1,'rgba(255,255,255,.12)');
        const bw=Math.min(t*3,canvas.width*0.4);
        ctx.fillStyle=beamGrad;
        ctx.beginPath();
        ctx.moveTo(beamCx-20,canvas.height);
        ctx.lineTo(beamCx-bw,0);
        ctx.lineTo(beamCx+bw,0);
        ctx.lineTo(beamCx+20,canvas.height);
        ctx.fill();
      }

      // Particles
      particles.forEach(p=>{
        if(t<p.delay) return;
        p.life++;
        if(p.life>p.maxLife){ p.life=0; p.y=canvas.height*0.9+Math.random()*canvas.height*.2; p.x=canvas.width/2+(Math.random()-0.5)*canvas.width*.4; p.vy=-(0.8+Math.random()*3.5); }
        p.x+=p.vx+Math.sin(t*0.02+p.spiral*100)*p.spiral*60;
        p.y+=p.vy;
        p.vy*=0.998;
        const lifeRatio=p.life/p.maxLife;
        const alpha=p.opacity*(1-Math.pow(lifeRatio,2));
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size*(1-lifeRatio*.5),0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},80%,${50+lifeRatio*30}%,${alpha})`;
        ctx.fill();
        // Sparkle cross
        if(p.size>2.5){
          ctx.strokeStyle=`hsla(${p.hue},90%,80%,${alpha*.4})`;
          ctx.lineWidth=.5;
          ctx.beginPath(); ctx.moveTo(p.x-p.size*1.5,p.y); ctx.lineTo(p.x+p.size*1.5,p.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(p.x,p.y-p.size*1.5); ctx.lineTo(p.x,p.y+p.size*1.5); ctx.stroke();
        }
      });

      // Pulsing OM at top
      if(t>40){
        const omAlpha=Math.min((t-40)/60, 1);
        const omScale=1+Math.sin(t*.02)*.06;
        ctx.save();
        ctx.globalAlpha=omAlpha;
        ctx.translate(canvas.width/2, canvas.height*0.08);
        ctx.scale(omScale,omScale);
        ctx.font=`${Math.max(48,canvas.width*0.08)}px serif`;
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillStyle='rgba(240,200,80,.9)';
        ctx.shadowBlur=30; ctx.shadowColor='rgba(240,200,80,.6)';
        ctx.fillText('ॐ',0,0);
        ctx.restore();
      }

      // Expanding light rings from top
      if(t>60){
        for(let ring=0;ring<4;ring++){
          const rAge=((t-60)+ring*40)%160;
          const rAlpha=Math.max(0,(1-rAge/160)*.15);
          ctx.strokeStyle=`rgba(240,200,80,${rAlpha})`;
          ctx.lineWidth=1.5;
          ctx.beginPath();
          ctx.arc(canvas.width/2,canvas.height*.08,rAge*3,0,Math.PI*2);
          ctx.stroke();
        }
      }

      rafRef.current=requestAnimationFrame(draw);
    };
    draw();

    // Phase progression
    const t1=setTimeout(()=>setPhase(1),3500);
    const t2=setTimeout(()=>setPhase(2),5500);
    const t3=setTimeout(()=>setShowJudge(true),7000);

    return()=>{
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',resize);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  },[]);

  const isYamaMode = players.length===2 && players.find(p=>p.cpu);
  // Show judgment whenever there is a loser — especially Yama in solo mode

  return(
    <div style={{position:'fixed',inset:0,zIndex:600,overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>

      {/* Winner card — ascends over time */}
      <div style={{
        position:'absolute',left:'50%',bottom:'15%',transform:'translateX(-50%)',
        textAlign:'center',
        animation:'mokshaAscend 8s ease 1.5s both',
        filter:'drop-shadow(0 0 40px rgba(240,200,80,.6))',
      }}>
        <div style={{fontSize:'clamp(52px,10vw,80px)',marginBottom:8,animation:'cgGoldPulse 2s ease infinite'}}>{wp?.char?.icon}</div>
        <div style={{fontSize:'clamp(18px,4vw,28px)',fontFamily:"'Yatra One',serif",color:'#f0d050',letterSpacing:3,textShadow:'0 0 30px rgba(240,200,80,.6)'}}>{wp?.name}</div>
        <div style={{fontSize:'clamp(10px,2vw,13px)',color:'rgba(240,200,80,.6)',letterSpacing:4,fontFamily:"'Cinzel',serif",marginTop:4}}>मोक्ष प्राप्त · LIBERATED</div>
      </div>

      {/* Chitragupta seal — appears after ascension */}
      {phase>=1&&(
        <div style={{
          position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',
          textAlign:'center',animation:'fadeIn 1.5s ease',
          background:'linear-gradient(135deg,rgba(14,10,4,.95),rgba(20,14,6,.98))',
          border:'1px solid rgba(200,175,90,.25)',borderRadius:12,
          padding:'clamp(16px,3vw,28px) clamp(20px,4vw,40px)',
          maxWidth:'min(420px,90vw)',backdropFilter:'blur(10px)',
        }}>
          {/* Quill SVG above text */}
          <div style={{fontSize:20,marginBottom:8,animation:'pulse 2s ease infinite',opacity:.6}}>🪶</div>
          <div style={{fontSize:8,letterSpacing:4,color:'rgba(200,175,90,.5)',fontFamily:"'Cinzel',serif",marginBottom:10}}>CHITRAGUPTA SEALS THE LEDGER</div>
          <div style={{width:80,height:1,background:'linear-gradient(90deg,transparent,rgba(200,175,90,.4),transparent)',margin:'0 auto 16px'}}/>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
            <div style={{padding:'8px',background:'rgba(80,200,80,.06)',border:'1px solid rgba(80,200,80,.12)',borderRadius:6,textAlign:'center'}}>
              <div style={{fontSize:7,color:'rgba(80,200,80,.5)',letterSpacing:2,marginBottom:4}}>पुण्य EARNED</div>
              <div style={{fontSize:22,fontWeight:900,color:'#80c080',fontFamily:"'Cinzel',serif"}}>{wPunya}</div>
            </div>
            <div style={{padding:'8px',background:'rgba(200,80,60,.05)',border:'1px solid rgba(200,80,60,.1)',borderRadius:6,textAlign:'center'}}>
              <div style={{fontSize:7,color:'rgba(200,80,60,.45)',letterSpacing:2,marginBottom:4}}>पाप CARRIED</div>
              <div style={{fontSize:22,fontWeight:900,color:'#e08060',fontFamily:"'Cinzel',serif"}}>{wPapa}</div>
            </div>
          </div>

          {/* CG quote */}
          <div style={{fontSize:'clamp(10px,1.8vw,13px)',color:'rgba(200,175,120,.55)',fontStyle:'italic',lineHeight:1.8,marginBottom:16,letterSpacing:.5}}>
            "The page is complete. I seal it. In all the ages I have kept this record, few pages end this way."
          </div>
          <div style={{fontSize:8,color:'rgba(200,175,90,.3)',letterSpacing:3,marginBottom:16}}>— चित्रगुप्त</div>
        </div>
      )}

      {/* Yama judgment for losers — appears last */}
      {showJudge&&lp&&(
        <YamaJudgment loser={lp} papa={papa[loserIdx]} punya={punya[loserIdx]} isYama={!!lp.cpu}/>
      )}

      {/* Close button */}
      {phase>=2&&(
        <div style={{position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',display:'flex',gap:12,animation:'fadeIn 1s ease'}}>
          <button onClick={onClose} style={{
            background:'linear-gradient(180deg,rgba(200,160,60,.2),rgba(200,160,60,.08))',
            border:'1px solid rgba(200,160,60,.4)',color:'#e8c850',
            padding:'10px 28px',fontSize:11,fontFamily:"'Cinzel',serif",
            cursor:'pointer',borderRadius:4,letterSpacing:3,
          }}>नया जन्म · NEW JOURNEY</button>
        </div>
      )}
    </div>
  );
}
