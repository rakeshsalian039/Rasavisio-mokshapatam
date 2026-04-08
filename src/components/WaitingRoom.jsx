/**
 * WaitingRoom.jsx — Sacred Sabha
 * ✦ Canvas sacred fire grows with each joining seeker
 * ✦ Ghost bot avatars (translucent, floating, dashed orbit, rune particles)
 * ✦ Human avatars: join burst, ready glow, online dot
 * ✦ Responsive orbit radius (phone + desktop)
 * ✦ Character picker bottom sheet
 * ✦ Staggered entrance animations
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { setReady, startGame, promoteBotForSlot, updateCharacter } from '../services/roomService';
import { CHARS } from '../tiers/moksha/constants';

const CSS = `
@keyframes wr-appear{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}70%{transform:translate(-50%,-50%) scale(1.06)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes wr-burst{0%{box-shadow:0 0 0 0 rgba(240,200,80,.8)}70%{box-shadow:0 0 0 32px rgba(240,200,80,0)}100%{box-shadow:none}}
@keyframes wr-ghost-float{0%,100%{transform:translate(-50%,-50%) translateY(0) scale(1)}50%{transform:translate(-50%,-50%) translateY(-7px) scale(1.03)}}
@keyframes wr-ghost-dim{0%,100%{opacity:.38}50%{opacity:.62}}
@keyframes wr-ghost-orbit{0%{transform:rotate(0deg) translateX(24px) rotate(0deg)}100%{transform:rotate(360deg) translateX(24px) rotate(-360deg)}}
@keyframes wr-dash{to{stroke-dashoffset:-283}}
@keyframes wr-ready{0%,100%{box-shadow:0 0 10px rgba(80,200,80,.2)}50%{box-shadow:0 0 28px rgba(80,200,80,.6),0 0 60px rgba(80,200,80,.1)}}
@keyframes wr-pulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:1;transform:scale(1.35)}}
@keyframes wr-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes wr-code{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes wr-sheet{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes wr-slowspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes wr-cspin{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
`;

// ── Canvas Sacred Fire ──────────────────────────────────────────────────────
function SacredFire({ intensity=1 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    c.width = 120; c.height = 140;
    let raf, frame = 0;
    const pts = Array.from({length:30}, () => ({
      x:60, y:108, vx:(Math.random()-.5)*1.6, vy:-(1.4+Math.random()*2.4),
      life:Math.random(), maxLife:.5+Math.random()*.55, size:2.5+Math.random()*5.5,
    }));
    const embers = Array.from({length:10}, () => ({
      x:60, y:108, vx:(Math.random()-.5)*3.5, vy:-(2.2+Math.random()*3.2),
      life:Math.random(), maxLife:.2+Math.random()*.35, size:1+Math.random()*2,
    }));
    const reset = (p, ember=false) => {
      p.x=60+(Math.random()-.5)*16; p.y=108+(Math.random()-.5)*4;
      p.vx=(Math.random()-.5)*(ember?4:2); p.vy=-(ember?3:1.8)-Math.random()*(ember?2.5:2.8);
      p.life=0; p.maxLife=ember?.22+Math.random()*.3:.45+Math.random()*.6;
      p.size=ember?1+Math.random()*1.8:2.5+Math.random()*6;
    };
    const draw = () => {
      frame++; ctx.clearRect(0,0,120,140);
      const fl = 0.86+0.14*Math.sin(frame*.19)+0.05*Math.sin(frame*.33);
      // base glow
      const bg = ctx.createRadialGradient(60,114,0,60,114,30);
      bg.addColorStop(0,`rgba(255,155,15,${.26*fl*intensity})`);
      bg.addColorStop(.6,`rgba(255,70,5,${.12*fl*intensity})`);
      bg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=bg; ctx.fillRect(0,50,120,90);
      // particles
      pts.forEach(p=>{
        p.life+=.02; if(p.life>p.maxLife){reset(p);return;}
        const t=p.life/p.maxLife;
        p.x+=p.vx*(1-t*.45); p.y+=p.vy+.28; p.vx*=.988;
        const g=Math.round(t<.3?230:t<.6?140-140*(t-.3)/.3:0);
        const b=Math.round(t<.18?160*(1-t/.18):0);
        const a=(1-t)*(1-t)*fl*intensity*.92;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*(1-t*.5),0,Math.PI*2);
        ctx.fillStyle=`rgba(255,${g},${b},${a})`; ctx.fill();
      });
      // embers
      embers.forEach(p=>{
        p.life+=.032; if(p.life>p.maxLife){reset(p,true);return;}
        const t=p.life/p.maxLife;
        p.x+=p.vx; p.y+=p.vy; p.vx*=.972; p.vy+=.09;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,220,100,${(1-t)*(1-t)*fl*.75})`; ctx.fill();
      });
      // flame body
      const flame=ctx.createRadialGradient(60,88,0,60,105,32);
      flame.addColorStop(0,`rgba(255,245,190,${.72*fl*intensity})`);
      flame.addColorStop(.3,`rgba(255,155,18,${.52*fl*intensity})`);
      flame.addColorStop(.75,`rgba(255,55,8,${.22*fl*intensity})`);
      flame.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=flame;
      ctx.beginPath(); ctx.ellipse(60,100,15*intensity,28*intensity,0,0,Math.PI*2); ctx.fill();
      // diya
      ctx.fillStyle=`rgba(175,138,55,${.58*intensity})`;
      ctx.beginPath(); ctx.ellipse(60,112,17,5,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=`rgba(220,178,75,${.45*intensity})`; ctx.lineWidth=1; ctx.stroke();
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(raf);
  },[intensity]);
  return <canvas ref={ref} style={{width:120,height:140,display:'block'}}/>;
}

// ── Ghost Bot ───────────────────────────────────────────────────────────────
function GhostBot({ char }) {
  return (
    <div style={{position:'relative',width:62,height:62}}>
      {/* Dashed spinning orbit */}
      <svg style={{position:'absolute',inset:-7,width:76,height:76,pointerEvents:'none'}} viewBox="0 0 76 76">
        <circle cx={38} cy={38} r={32} fill="none"
          stroke="rgba(190,170,255,.38)" strokeWidth={1.5}
          strokeDasharray="5 4" strokeLinecap="round"
          style={{animation:'wr-dash 4s linear infinite'}}/>
        <circle cx={38} cy={38} r={26} fill="none"
          stroke="rgba(190,170,255,.15)" strokeWidth={.6}
          strokeDasharray="2 6"
          style={{animation:'wr-dash 6s linear infinite reverse'}}/>
      </svg>
      {/* Ghost orb */}
      <div style={{
        width:62,height:62,borderRadius:'50%',
        background:'radial-gradient(circle at 38% 32%, rgba(210,195,255,.16), rgba(120,100,220,.06) 55%, rgba(50,30,140,.03))',
        border:'1.5px solid rgba(180,165,255,.32)',
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:27,
        animation:'wr-ghost-float 3.2s ease infinite, wr-ghost-dim 4s ease infinite',
        boxShadow:'0 0 20px rgba(170,155,255,.14), inset 0 0 16px rgba(160,140,255,.07)',
        position:'relative',overflow:'hidden',
      }}>
        {char?.icon||'🌀'}
        {/* Shimmer */}
        <div style={{position:'absolute',top:'-20%',left:'-60%',width:'40%',height:'140%',
          background:'linear-gradient(105deg,transparent,rgba(255,255,255,.055),transparent)',
          pointerEvents:'none'}}/>
      </div>
      {/* Orbiting rune particles */}
      {[0,1,2].map(i=>(
        <div key={i} style={{
          position:'absolute',top:'50%',left:'50%',
          width:3.5,height:3.5,borderRadius:'50%',marginTop:-1.75,marginLeft:-1.75,
          background:`rgba(${200+i*10},${180+i*8},255,.55)`,
          animation:`wr-ghost-orbit ${2.8+i*.9}s linear infinite`,
          animationDelay:`${i*0.85}s`,
          pointerEvents:'none',
          boxShadow:`0 0 4px rgba(200,180,255,.6)`,
        }}/>
      ))}
    </div>
  );
}

// ── Human Avatar ────────────────────────────────────────────────────────────
function HumanAvatar({ player, isMe, isOnline, justJoined }) {
  const col = player?.char_color||'#c0a030';
  return (
    <div style={{
      width:62,height:62,borderRadius:'50%',position:'relative',
      background:`radial-gradient(circle at 36% 32%, ${col}24, ${col}08 58%, rgba(12,10,7,.65))`,
      border:`2px solid ${player?.is_ready?'rgba(80,200,80,.7)':isMe?`${col}80`:`${col}38`}`,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:27,transition:'all .4s',
      boxShadow: player?.is_ready
        ? '0 0 22px rgba(80,200,80,.28), 0 0 0 4px rgba(80,200,80,.1)'
        : isMe ? `0 0 18px ${col}44` : 'none',
      animation: justJoined ? 'wr-burst .9s ease, wr-appear .5s cubic-bezier(.34,1.56,.64,1) both'
                            : player?.is_ready ? 'wr-ready 2s ease infinite' : 'none',
    }}>
      {player?.char_icon||'🔱'}
      {/* Online dot */}
      <div style={{
        position:'absolute',bottom:3,right:3,width:10,height:10,borderRadius:'50%',
        background:isOnline?'#60c060':'#804040',
        border:'2px solid #0c0a07',
        boxShadow:isOnline?'0 0 7px rgba(96,192,96,.65)':'none',
        transition:'background .3s',
      }}/>
      {/* Ready crown */}
      {player?.is_ready&&(
        <div style={{position:'absolute',top:-15,fontSize:13,
          filter:'drop-shadow(0 0 6px rgba(240,200,80,.7))'}}>✦</div>
      )}
    </div>
  );
}

// ── Empty Seat ──────────────────────────────────────────────────────────────
function EmptySeat() {
  return (
    <div style={{
      width:62,height:62,borderRadius:'50%',
      border:'1.5px dashed rgba(200,160,60,.16)',
      display:'flex',alignItems:'center',justifyContent:'center',
      background:'rgba(12,10,7,.28)',opacity:.5,
    }}>
      <svg viewBox="0 0 40 40" width={22} height={22} style={{opacity:.3}}>
        <circle cx={20} cy={20} r={15} fill="none" stroke="#f0d050" strokeWidth={.8}/>
        {[0,60,120,180,240,300].map((d,i)=>{
          const a=d*Math.PI/180;
          return <line key={i} x1={20} y1={20} x2={20+13*Math.cos(a)} y2={20+13*Math.sin(a)} stroke="#f0d050" strokeWidth={.5}/>;
        })}
        <circle cx={20} cy={20} r={3} fill="none" stroke="#f0d050" strokeWidth={.6}/>
      </svg>
    </div>
  );
}

// ── Room Code Card ───────────────────────────────────────────────────────────
function CodeCard({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };
  return (
    <div style={{
      textAlign:'center',padding:'14px 22px',
      background:'linear-gradient(135deg,rgba(240,200,80,.055),rgba(200,160,50,.025))',
      border:'1px solid rgba(240,200,80,.13)',borderRadius:8,position:'relative',overflow:'hidden',
      animation:'wr-code .6s ease .15s both',
    }}>
      {/* Corners */}
      {[{t:-1,l:-1},{t:-1,r:-1,fx:-1},{b:-1,l:-1,fy:-1},{b:-1,r:-1,fx:-1,fy:-1}].map((p,i)=>(
        <svg key={i} viewBox="0 0 14 14" width={12} height={12} style={{
          position:'absolute',opacity:.28,
          top:p.t,left:p.l,right:p.r,bottom:p.b,
          transform:`scale(${p.fx||1},${p.fy||1})`,
        }}>
          <path d="M1,13 L1,1 L13,1" fill="none" stroke="#f0d050" strokeWidth={.9}/>
          <circle cx={1} cy={1} r={1.2} fill="#f0d050"/>
        </svg>
      ))}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:7,letterSpacing:6,
        color:'rgba(240,200,80,.38)',textTransform:'uppercase',marginBottom:7}}>
        Sabha Code
      </div>
      <div style={{
        fontFamily:"'Cinzel Decorative',serif",
        fontSize:'clamp(22px,5.5vw,34px)',
        color:'#f0d050',letterSpacing:'clamp(6px,1.8vw,12px)',
        textShadow:'0 0 22px rgba(240,200,80,.28)',marginBottom:9,
      }}>{code}</div>
      <button onClick={copy} style={{
        background:copied?'rgba(80,180,80,.1)':'transparent',
        border:`1px solid ${copied?'rgba(80,200,80,.28)':'rgba(240,200,80,.14)'}`,
        color:copied?'#70d070':'rgba(240,200,80,.45)',
        padding:'4px 14px',cursor:'pointer',
        fontFamily:"'Cinzel',serif",fontSize:7,letterSpacing:3,
        transition:'all .25s',textTransform:'uppercase',borderRadius:2,
      }}>
        {copied?'✦ Copied!':'Copy Code'}
      </button>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function WaitingRoom({ roomId, roomCode, userId, myPlayerIndex, maxPlayers=2, onGameStart, onLeave }) {
  const [isReady,    setIsReadyLocal]  = useState(false);
  const [charIdx,    setCharIdx]       = useState(myPlayerIndex%CHARS.length);
  const [charOpen,   setCharOpen]      = useState(false);
  const [starting,   setStarting]      = useState(false);
  const [botTimer,   setBotTimer]      = useState(30);
  const [prevCount,  setPrevCount]     = useState(0);
  const [newSeat,    setNewSeat]       = useState(null);
  const botRef       = useRef(null);
  const rpRef        = useRef([]);

  const { roomStatus, roomPlayers, presenceMap } = useMultiplayer({
    roomId, userId, myPlayerIndex,
    playerName: rpRef.current.find?.(p=>p.user_id===userId)?.player_name||'',
    enabled: true,
  });
  rpRef.current = roomPlayers;

  const isHost   = roomPlayers[0]?.user_id===userId;
  const allReady = roomPlayers.length>=2 && roomPlayers.every(p=>p.is_ready);
  const mySlot   = roomPlayers.find(p=>p.user_id===userId);
  const fireIntensity = 0.5 + (roomPlayers.length/maxPlayers)*0.85;

  useEffect(()=>{
    if(roomPlayers.length>prevCount){
      const newest=roomPlayers[roomPlayers.length-1];
      if(newest){ setNewSeat(newest.seat_index); setTimeout(()=>setNewSeat(null),1400); }
    }
    setPrevCount(roomPlayers.length);
  },[roomPlayers.length]);

  useEffect(()=>{
    if(roomStatus==='active'){
      const players=rpRef.current.map(p=>({
        name:p.player_name,
        char:{name:p.char_name,icon:p.char_icon,color:p.char_color},
        charIdx:p.char_idx, cpu:p.is_bot,
      }));
      onGameStart?.(players,roomId,myPlayerIndex);
    }
  },[roomStatus,onGameStart,myPlayerIndex,roomId]);

  useEffect(()=>{
    if(!isHost||rpRef.current.length>=maxPlayers){ clearInterval(botRef.current); return; }
    clearInterval(botRef.current); setBotTimer(30);
    botRef.current=setInterval(()=>{
      setBotTimer(t=>{ if(t<=1){ clearInterval(botRef.current); fillBots(); return 0; } return t-1; });
    },1000);
    return()=>clearInterval(botRef.current);
  },[isHost,roomPlayers.length,maxPlayers]);

  const fillBots = useCallback(async()=>{
    const taken=rpRef.current.map(p=>p.seat_index);
    for(let i=0;i<maxPlayers;i++){
      if(!taken.includes(i)){
        const ch=CHARS[i%CHARS.length];
        await promoteBotForSlot({roomId,seatIndex:i,char:{...ch,idx:i%CHARS.length},botName:'Spirit Guide'}).catch(()=>{});
      }
    }
    try{ await startGame({roomId,playerCount:maxPlayers}); }catch(e){console.error(e);}
  },[roomId,maxPlayers]);

  const handleStart=async()=>{
    if(starting)return; setStarting(true);
    try{ await startGame({roomId,playerCount:roomPlayers.length}); }catch(e){console.error(e);setStarting(false);}
  };
  const toggleReady=async()=>{
    const n=!isReady; setIsReadyLocal(n);
    await setReady({roomId,userId,isReady:n}).catch(()=>{});
  };
  const pickChar=async(idx)=>{
    setCharIdx(idx); setCharOpen(false);
    await updateCharacter({roomId,userId,charIdx:idx,char:CHARS[idx]}).catch(()=>{});
  };

  // Responsive orbit
  const orbitR = typeof window!=='undefined' ? Math.min(120,Math.max(74,window.innerWidth*.27)) : 105;
  const ANGLES = {2:[-90,90],3:[-90,150,30],4:[-90,0,90,180]};
  const angles = ANGLES[maxPlayers]||ANGLES[2];
  const dim = orbitR*2+110;

  return (
    <div style={{
      minHeight:'100vh',
      background:'radial-gradient(ellipse at 50% 28%,#1c1608 0%,#0c0a07 55%,#060504 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      padding:'20px 14px',fontFamily:"'Cinzel',serif",color:'#e8c850',
      position:'relative',overflow:'hidden',
    }}>
      <style>{CSS}</style>

      {/* Sacred geometry BG */}
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.055,pointerEvents:'none'}} viewBox="0 0 600 600">
        <g style={{transformOrigin:'300px 300px',animation:'wr-slowspin 90s linear infinite'}}>
          {[55,95,140,190,248].map(r=>(
            <circle key={r} cx={300} cy={300} r={r} fill="none" stroke="#c0a030" strokeWidth={.55}/>
          ))}
        </g>
        <g style={{transformOrigin:'300px 300px',animation:'wr-cspin 60s linear infinite'}}>
          <polygon points="300,175,425,365,175,365" fill="none" stroke="#c0a030" strokeWidth={.45}/>
          <polygon points="300,425,175,235,425,235" fill="none" stroke="#c0a030" strokeWidth={.45}/>
        </g>
        {Array.from({length:108},(_,i)=>{
          const a=i/108*Math.PI*2,r=268;
          return <circle key={i} cx={300+r*Math.cos(a)} cy={300+r*Math.sin(a)} r={i%9===0?2.2:.85}
            fill="#c0a030" opacity={i%9===0?.48:.14}/>;
        })}
      </svg>

      {/* Code card */}
      <div style={{width:'100%',maxWidth:380,marginBottom:18,position:'relative',zIndex:2}}>
        <CodeCard code={roomCode}/>
      </div>

      {/* Circle of seats */}
      <div style={{
        position:'relative',width:Math.min(dim,window?.innerWidth||400-20),height:dim,
        maxWidth:'100vw',marginBottom:22,flexShrink:0,
      }}>
        {/* Orbit ring */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:.16}}
          viewBox={`0 0 ${dim} ${dim}`}>
          <circle cx={dim/2} cy={dim/2} r={orbitR} fill="none" stroke="#c0a030" strokeWidth={.8} strokeDasharray="4 7"/>
        </svg>

        {/* Sacred fire */}
        <div style={{
          position:'absolute',left:'50%',top:'50%',
          transform:'translate(-50%,-50%)',zIndex:3,
          filter:`drop-shadow(0 0 ${10+roomPlayers.length*7}px rgba(255,160,40,.${2+roomPlayers.length}))`,
          transition:'filter .6s',
        }}>
          <SacredFire intensity={fireIntensity}/>
        </div>

        {/* Seats */}
        {Array.from({length:maxPlayers}).map((_,i)=>{
          const a=angles[i]*Math.PI/180;
          const cx=dim/2+orbitR*Math.cos(a);
          const cy=dim/2+orbitR*Math.sin(a);
          const p=roomPlayers.find(rp=>rp.seat_index===i);
          const isMe=p?.user_id===userId;
          const isBot=p?.is_bot;
          const online=p?(presenceMap[p.user_id]?.online!==false):false;
          const ch=p?(CHARS[p.char_idx]||CHARS[0]):null;
          const justJoined=newSeat===i;

          return (
            <div key={i} style={{
              position:'absolute',left:cx,top:cy,
              transform:'translate(-50%,-50%)',
              display:'flex',flexDirection:'column',alignItems:'center',gap:4,
              width:92,zIndex:4,
              animation:p?'wr-appear .55s cubic-bezier(.34,1.56,.64,1) both':'none',
            }}>
              <div style={{
                fontFamily:"'Cinzel',serif",fontSize:7,letterSpacing:3,textTransform:'uppercase',
                color:isBot?'rgba(190,170,255,.48)':p?'rgba(240,200,80,.38)':'rgba(200,160,60,.18)',
                marginBottom:2,
              }}>
                {isBot?'Spirit':`Soul ${i+1}`}
              </div>

              {!p ? (
                <div style={{opacity:.45}}><EmptySeat/></div>
              ) : isBot ? (
                <GhostBot char={ch}/>
              ) : (
                <div onClick={()=>isMe&&setCharOpen(true)} style={{cursor:isMe?'pointer':'default'}}>
                  <HumanAvatar player={p} isMe={isMe} isOnline={online} justJoined={justJoined}/>
                </div>
              )}

              <div style={{
                fontSize:'clamp(8px,2vw,10px)',
                color:isBot?'rgba(190,170,255,.5)':isMe?'#f0d050':'#8a7a50',
                textAlign:'center',letterSpacing:.8,maxWidth:90,
                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                fontStyle:isBot?'italic':'normal',
              }}>
                {p ? (isBot?'Spirit Guide':(isMe?`${p.player_name} ✦`:p.player_name))
                   : <span style={{opacity:.3,animation:'wr-pulse 2.5s ease infinite'}}>Awaiting...</span>}
              </div>

              {p&&!isBot&&(
                <div style={{
                  fontSize:6.5,letterSpacing:2,padding:'1.5px 6px',textTransform:'uppercase',
                  background:p.is_ready?'rgba(50,160,50,.1)':'rgba(200,160,60,.04)',
                  border:`1px solid ${p.is_ready?'rgba(80,200,80,.28)':'rgba(200,160,60,.1)'}`,
                  color:p.is_ready?'#68d068':'rgba(200,160,60,.38)',
                  transition:'all .3s',
                }}>
                  {p.is_ready?'✦ Ready':'Waiting'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{
        display:'flex',flexDirection:'column',alignItems:'center',gap:9,
        position:'relative',zIndex:5,width:'100%',maxWidth:320,
        animation:'wr-up .65s ease .25s both',
      }}>
        {mySlot&&!mySlot.is_bot&&(
          <button onClick={toggleReady} style={{
            width:'100%',padding:'11px',
            background:isReady?'rgba(50,160,50,.14)':'transparent',
            border:`1px solid ${isReady?'rgba(80,200,80,.42)':'rgba(200,160,60,.18)'}`,
            color:isReady?'#78d078':'rgba(200,160,60,.6)',
            fontSize:10,fontFamily:"'Cinzel',serif",letterSpacing:4,
            cursor:'pointer',transition:'all .3s',textTransform:'uppercase',
            boxShadow:isReady?'0 0 16px rgba(80,180,80,.1)':'none',
          }}>
            {isReady?'✦ Ready':'Mark Ready'}
          </button>
        )}

        {isHost&&(
          <button onClick={handleStart} disabled={!allReady||starting} style={{
            width:'100%',padding:'13px',
            background:allReady?'linear-gradient(180deg,rgba(240,200,80,.18),rgba(200,160,60,.07))':'rgba(200,160,60,.03)',
            border:`1px solid ${allReady?'rgba(240,200,80,.52)':'rgba(200,160,60,.1)'}`,
            color:allReady?'#f0d050':'rgba(200,160,60,.22)',
            fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:4,
            cursor:allReady?'pointer':'not-allowed',transition:'all .3s',textTransform:'uppercase',
            boxShadow:allReady?'0 0 22px rgba(240,200,80,.1)':'none',
          }}>
            {starting?'◌ Beginning...':'🔔 प्रारम्भ — Begin'}
          </button>
        )}

        {isHost&&roomPlayers.length<maxPlayers&&botTimer>0&&(
          <div style={{fontSize:8,color:'rgba(190,170,255,.38)',letterSpacing:2,textAlign:'center',fontStyle:'italic'}}>
            Spirit Guides enter in {botTimer}s if seats remain empty
          </div>
        )}
        {!isHost&&allReady&&(
          <div style={{fontSize:9,color:'rgba(240,200,80,.38)',letterSpacing:2,textAlign:'center',fontStyle:'italic'}}>
            Waiting for the host to begin...
          </div>
        )}
        {roomPlayers.length>=2&&!allReady&&(
          <div style={{fontSize:8,color:'rgba(200,160,60,.28)',letterSpacing:2,textAlign:'center'}}>
            {roomPlayers.filter(p=>!p.is_ready).length} seeker{roomPlayers.filter(p=>!p.is_ready).length!==1?'s':''} still preparing...
          </div>
        )}

        <div style={{height:1,width:'55%',background:'linear-gradient(90deg,transparent,rgba(200,160,60,.12),transparent)',margin:'2px 0'}}/>

        <button onClick={onLeave} style={{
          background:'transparent',border:'none',
          color:'rgba(200,160,60,.22)',fontSize:8,cursor:'pointer',
          fontFamily:"'Cinzel',serif",letterSpacing:3,transition:'color .2s',textTransform:'uppercase',
        }}
        onMouseEnter={e=>e.target.style.color='rgba(200,160,60,.55)'}
        onMouseLeave={e=>e.target.style.color='rgba(200,160,60,.22)'}>
          ← Leave Sabha
        </button>
      </div>

      {/* Char picker sheet */}
      {charOpen&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.76)',zIndex:300,
          display:'flex',alignItems:'flex-end'}} onClick={()=>setCharOpen(false)}>
          <div style={{
            width:'100%',
            background:'linear-gradient(0deg,#1c1608,#100d05)',
            border:'1px solid rgba(200,160,60,.18)',borderRadius:'14px 14px 0 0',
            padding:'18px 14px 36px',
            animation:'wr-sheet .32s cubic-bezier(.34,1.08,.64,1)',
          }} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',fontSize:8,color:'rgba(200,160,60,.38)',
              letterSpacing:5,textTransform:'uppercase',marginBottom:16}}>
              Choose Your Soul
            </div>
            <div style={{
              display:'grid',gridTemplateColumns:`repeat(${Math.min(CHARS.length,3)},1fr)`,
              gap:9,maxWidth:340,margin:'0 auto',
            }}>
              {CHARS.map((ch,idx)=>(
                <button key={idx} onClick={()=>pickChar(idx)} style={{
                  padding:'13px 6px',
                  background:charIdx===idx?'rgba(240,200,80,.11)':'rgba(200,160,60,.035)',
                  border:`1px solid ${charIdx===idx?'rgba(240,200,80,.48)':'rgba(200,160,60,.09)'}`,
                  borderRadius:7,cursor:'pointer',
                  display:'flex',flexDirection:'column',alignItems:'center',gap:5,
                  transition:'all .2s',
                }}>
                  <span style={{fontSize:27,lineHeight:1,
                    filter:`drop-shadow(0 0 6px ${ch.color}55)`}}>{ch.icon}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:7.5,letterSpacing:2,
                    color:charIdx===idx?'#f0d050':'rgba(200,160,60,.42)',textTransform:'uppercase'}}>
                    {ch.name}
                  </span>
                </button>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:14}}>
              <button onClick={()=>setCharOpen(false)} style={{
                background:'transparent',border:'1px solid rgba(200,160,60,.1)',
                color:'rgba(200,160,60,.32)',padding:'6px 18px',cursor:'pointer',
                fontFamily:"'Cinzel',serif",fontSize:7,letterSpacing:3,textTransform:'uppercase',
              }}>Close ✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
