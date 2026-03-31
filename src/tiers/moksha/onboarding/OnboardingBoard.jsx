import { useState, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// MINI BOARD — pixel-perfect miniature of the actual game board
// Shares the same sqP() layout, realm zones, SVG snake/ladder paths,
// sacred crown strip, geometry overlays, and animated token.
// ═══════════════════════════════════════════════════════════════════════
export default function OnboardingBoard({ mode, SNAKES, LADDERS, DLM_SQ, SACRED_PATH }) {
  const [tokenPos, setTokenPos]   = useState(1);
  const [highlight, setHighlight] = useState(null); // sq number or null
  const [realmPulse, setRealmPulse] = useState(null); // 'bhuloka'|'antarloka'|'svargaloka'
  const [snakeActive, setSnakeActive] = useState(null); // snake head sq
  const [ladderActive, setLadderActive] = useState(null); // ladder foot sq
  const [snakeFlash, setSnakeFlash] = useState(false);
  const [ladderFlash, setLadderFlash] = useState(false);
  const timerRef = useRef(null);

  // Same cell layout as game board
  function sqP(n) {
    if(n<1)n=1;if(n>100)n=100;
    const r=Math.floor((n-1)/10);
    return{r:9-r,c:r%2===0?(n-1)%10:9-((n-1)%10)};
  }
  function cellCenter(n,cs) {
    const{r,c}=sqP(n);
    return{x:c*cs+cs/2,y:r*cs+cs/2};
  }
  const CS=28; // cell size px
  const W=10*CS;

  const realmOf=n=>n<=33?'bhuloka':n<=66?'antarloka':'svargaloka';
  const RCOL={bhuloka:'#8a6030',antarloka:'#5a80a0',svargaloka:'#9070c0'};

  const SHEAD=Object.keys(SNAKES).map(Number);
  const LFOOT=Object.keys(LADDERS).map(Number);
  const DLM=DLM_SQ;

  useEffect(()=>{
    clearInterval(timerRef.current);
    clearTimeout(timerRef.current);

    if(mode==='intro'){
      const path=[1,3,9,18,22,28,31,37,44,47,53,56,61,65,71,74,82,85,89,95,97];
      let i=0;
      timerRef.current=setInterval(()=>{
        i=(i+1)%path.length;
        setTokenPos(path[i]);
        setHighlight(path[i]);
      },700);
    }
    if(mode==='realms'){
      const seq=['bhuloka','antarloka','svargaloka',null];
      let ri=0;
      setRealmPulse(seq[0]);
      timerRef.current=setInterval(()=>{
        ri=(ri+1)%seq.length;
        setRealmPulse(seq[ri]);
      },2000);
    }
    if(mode==='snakeladder'){
      const steps=[
        ()=>{setTokenPos(9);setHighlight(9);setLadderActive(9);setLadderFlash(true);setSnakeActive(null);setSnakeFlash(false)},
        ()=>{setTokenPos(31);setHighlight(31);setLadderFlash(false);setLadderActive(null)},
        ()=>{setTokenPos(47);setHighlight(47);setSnakeActive(47);setSnakeFlash(true)},
        ()=>{setTokenPos(29);setHighlight(29);setSnakeFlash(false);setSnakeActive(null)},
        ()=>{setHighlight(null)},
      ];
      let si=0; steps[0]();
      timerRef.current=setInterval(()=>{si=(si+1)%steps.length;steps[si]();},1800);
    }
    return()=>{clearInterval(timerRef.current);clearTimeout(timerRef.current)};
  },[mode]);

  const{x:tx,y:ty}=cellCenter(tokenPos,CS);

  // Build snake SVG path (sinuous curve)
  const snakePath=(from,to)=>{
    const f=cellCenter(from,CS),t=cellCenter(to,CS);
    const dx=t.x-f.x,dy=t.y-f.y,len=Math.sqrt(dx*dx+dy*dy),nx=-dy/len,amp=len*.14;
    let d=`M${f.x} ${f.y}`;
    for(let i=1;i<=6;i++){
      const p=i/6,s=i%2===0?1:-1;
      d+=` Q${f.x+dx*((i-.5)/6)+nx*amp*s} ${f.y+dy*((i-.5)/6)+(dx/len)*amp*s} ${f.x+dx*p} ${f.y+dy*p}`;
    }
    return{d,fx:f.x,fy:f.y};
  };
  // Ladder SVG lines
  const ladderLines=(from,to)=>{
    const f=cellCenter(from,CS),t=cellCenter(to,CS);
    return{x1f:f.x-2,y1f:f.y,x1t:t.x-2,y1t:t.y,x2f:f.x+2,y2f:f.y,x2t:t.x+2,y2t:t.y,fx:f.x,fy:f.y};
  };

  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
      {/* Sacred Crown strip — matches actual game */}
      <div style={{
        width:W,background:'linear-gradient(180deg,rgba(240,200,80,.1),rgba(20,16,10,.4))',
        border:'1px solid rgba(240,200,80,.2)',borderBottom:'2px solid rgba(240,200,80,.2)',
        borderRadius:'4px 4px 0 0',padding:'3px 2px 2px',position:'relative',overflow:'hidden',
      }}>
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:.07}} viewBox="0 0 200 36" preserveAspectRatio="none">
          {[0,25,50,75,100,125,150,175].map(x=><g key={x}>
            <polygon points={`${x+12.5},3 ${x+25},33 ${x},33`} fill="none" stroke="#f0d050" strokeWidth=".5"/>
            <polygon points={`${x+12.5},33 ${x+25},3 ${x},3`} fill="none" stroke="#f0d050" strokeWidth=".5"/>
          </g>)}
        </svg>
        <div style={{fontSize:6,textAlign:'center',letterSpacing:3,color:'#f0d050',opacity:.55,marginBottom:2,fontFamily:"'Cinzel',serif"}}>अष्टांग मार्ग</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:1}}>
          {SACRED_PATH.map((sq,si)=>(
            <div key={sq.num} style={{
              aspectRatio:'1',
              background:sq.num===108?'radial-gradient(circle,rgba(240,200,80,.25),rgba(240,200,80,.04))':'radial-gradient(circle,rgba(240,200,80,.08),transparent)',
              border:`0.5px solid ${sq.num===108?'rgba(240,200,80,.5)':'rgba(240,200,80,.15)'}`,
              borderRadius:2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              animation:`sacredGlow ${3+si*.3}s ease infinite`,
            }}>
              <span style={{fontSize:8}}>{sq.icon}</span>
              <span style={{fontSize:5,color:'#f0d050',fontFamily:"'Noto Serif Devanagari',serif",lineHeight:1}}>{sq.skt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main 10×10 board */}
      <div style={{
        width:W,height:W,position:'relative',
        background:"radial-gradient(ellipse at 30% 30%,rgba(60,45,20,.25),transparent 50%),radial-gradient(ellipse at 70% 70%,rgba(60,45,20,.2),transparent 50%),#1e1810",
        border:'1.5px solid rgba(200,160,60,.3)',
        boxShadow:'0 0 30px rgba(0,0,0,.5),inset 0 0 20px rgba(0,0,0,.3)',
      }}>
        {/* Realm divider lines */}
        <div style={{position:'absolute',left:'2%',right:'2%',top:'33.3%',height:1,background:'linear-gradient(90deg,transparent,rgba(200,160,60,.2),transparent)',zIndex:8,pointerEvents:'none'}}/>
        <div style={{position:'absolute',left:'2%',right:'2%',top:'66.6%',height:1,background:'linear-gradient(90deg,transparent,rgba(200,160,60,.2),transparent)',zIndex:8,pointerEvents:'none'}}/>

        {/* Realm labels */}
        {[{top:'5%',t:'स्वर्गलोक',c:'#9070c0'},{top:'38%',t:'अन्तर्लोक',c:'#5a80a0'},{top:'72%',t:'भूलोक',c:'#8a6030'}].map((r,i)=>(
          <div key={i} style={{
            position:'absolute',top:r.top,left:'50%',transform:'translateX(-50%)',
            fontSize:6,letterSpacing:3,color:r.c,opacity:realmPulse?
              (realmPulse===(['svargaloka','antarloka','bhuloka'][i])?0.7:0.15):0.2,
            zIndex:9,pointerEvents:'none',whiteSpace:'nowrap',
            transition:'opacity .5s',fontFamily:"'Cinzel',serif",
          }}>{r.t}</div>
        ))}

        {/* Sacred geometry overlay */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:2,opacity:.1}} viewBox="0 0 100 100" preserveAspectRatio="none">
          {[70,77,84,91].map(y=><line key={'bh'+y} x1="5" y1={y} x2="95" y2={y} stroke="#c0a060" strokeWidth=".4"/>)}
          {[10,20,30,40,50,60,70,80,90].map(x=><line key={'bv'+x} x1={x} y1="67" x2={x} y2="100" stroke="#c0a060" strokeWidth=".3"/>)}
          {[42,53].map(y=><g key={'al'+y}>
            <polygon points={`50,${y-5} 58,${y+5} 42,${y+5}`} fill="none" stroke="#c0a060" strokeWidth=".4"/>
            <polygon points={`50,${y+5} 42,${y-5} 58,${y-5}`} fill="none" stroke="#c0a060" strokeWidth=".4"/>
          </g>)}
          {[10,20].map(y=><g key={'sl'+y}>
            <circle cx="50" cy={y} r="10" fill="none" stroke="#c0a060" strokeWidth=".3"/>
            <circle cx="50" cy={y} r="5" fill="none" stroke="#c0a060" strokeWidth=".25"/>
          </g>)}
        </svg>

        {/* SVG layer: snakes + ladders + token */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:6}} viewBox={`0 0 ${W} ${W}`}>
          <defs>
            <filter id="mbglow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {/* Ladders */}
          {Object.entries(LADDERS).map(([from,{to}])=>{
            const l=ladderLines(+from,+to);
            const isAct=ladderActive===+from;
            return(
              <g key={'l'+from} opacity={isAct?1:0.5} filter={isAct?"url(#mbglow)":""}>
                <line x1={l.x1f} y1={l.y1f} x2={l.x1t} y2={l.y1t} stroke={isAct?"#f0d050":"rgba(200,160,60,.55)"} strokeWidth={isAct?1.4:0.7}/>
                <line x1={l.x2f} y1={l.y2f} x2={l.x2t} y2={l.y2t} stroke={isAct?"#f0d050":"rgba(200,160,60,.55)"} strokeWidth={isAct?1.4:0.7}/>
                {Array.from({length:Math.max(2,Math.floor(Math.sqrt((l.x1t-l.x1f)**2+(l.y1t-l.y1f)**2)/10))}).map((_,i,arr)=>{
                  const tt=(i+1)/(arr.length+1);
                  return<line key={i} x1={l.x1f+(l.x1t-l.x1f)*tt} y1={l.y1f+(l.y1t-l.y1f)*tt} x2={l.x2f+(l.x2t-l.x2f)*tt} y2={l.y2f+(l.y2t-l.y2f)*tt} stroke={isAct?"rgba(240,200,80,.8)":"rgba(200,160,60,.3)"} strokeWidth={0.5}/>;
                })}
                {isAct&&ladderFlash&&[0,1,2].map(i=>(
                  <circle key={i} cx={l.fx+(i-1)*3} r={2} fill="#f0d050" opacity={.7-i*.2}>
                    <animate attributeName="cy" values={`${l.fy};${l.fy-12};${l.fy}`} dur=".8s" begin={`${i*.2}s`} repeatCount="indefinite"/>
                  </circle>
                ))}
              </g>
            );
          })}

          {/* Snakes */}
          {Object.entries(SNAKES).map(([from,{to}])=>{
            const{d,fx,fy}=snakePath(+from,+to);
            const isAct=snakeActive===+from;
            return(
              <g key={'s'+from} opacity={isAct?1:0.45} filter={isAct?"url(#mbglow)":""}>
                <path d={d} fill="none" stroke={isAct?"#ff4020":"rgba(160,60,30,.6)"} strokeWidth={isAct?2:1} strokeLinecap="round"/>
                <circle cx={fx} cy={fy} r={isAct?3:2} fill={isAct?"#ff4020":"rgba(180,60,30,.7)"}/>
                {isAct&&snakeFlash&&(
                  <circle cx={fx} cy={fy} r={10} fill="none" stroke="rgba(255,40,20,.5)" strokeWidth={1.5}>
                    <animate attributeName="r" values="6;16;6" dur=".7s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="1;0;1" dur=".7s" repeatCount="indefinite"/>
                  </circle>
                )}
              </g>
            );
          })}

          {/* Token */}
          <g style={{transition:'transform .5s cubic-bezier(.34,1.56,.64,1)'}}
             transform={`translate(${tx},${ty})`}>
            <circle r={8} fill="rgba(240,200,80,.12)" stroke="none">
              <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle r={5.5} fill="#f0d050" stroke="rgba(240,200,80,.6)" strokeWidth={1}/>
            <text textAnchor="middle" y={2} fontSize="7" fill="#1a1408" fontWeight="bold">🔱</text>
          </g>
        </svg>

        {/* Cell grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',position:'relative',zIndex:5,width:'100%',height:'100%',position:'absolute',inset:0}}>
          {Array.from({length:100},(_,i)=>{
            const num=i+1;
            const sn=SNAKES[num],ld=LADDERS[num],dl=DLM.includes(num),mk=num===100;
            const realm=realmOf(num);
            const rc=RCOL[realm];
            const isPulsed=realmPulse&&realmOf(num)===realmPulse;
            let bg='transparent',bdr=`${rc}22`;
            if(mk){bg='radial-gradient(circle,rgba(240,200,80,.2),transparent)';bdr='rgba(240,200,80,.5)'}
            else if(sn){bg='radial-gradient(circle,rgba(180,60,20,.18),transparent)';bdr='rgba(180,60,20,.35)'}
            else if(ld){bg='radial-gradient(circle,rgba(200,160,60,.14),transparent)';bdr='rgba(200,160,60,.25)'}
            else if(dl){bg='radial-gradient(circle,rgba(120,80,180,.15),transparent)';bdr='rgba(140,100,200,.3)'}
            if(isPulsed)bg=`${rc}30`;
            return(
              <div key={num} style={{
                aspectRatio:'1',background:bg,
                border:`0.5px solid ${bdr}`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                position:'relative',transition:'background .4s',
                boxShadow:highlight===num?`0 0 8px ${rc}80`:'none',
              }}>
                <span style={{position:'absolute',top:1,left:1.5,fontSize:5,color:`${rc}70`,fontFamily:"'Cinzel',serif"}}>{num}</span>
                {mk&&<span style={{fontSize:9,animation:'mp 3s ease infinite',color:'#f0d050'}}>ॐ</span>}
                {sn&&<span style={{fontSize:8,lineHeight:1}}>𓆙</span>}
                {ld&&<span style={{fontSize:8,lineHeight:1}}>🪔</span>}
                {dl&&!sn&&!ld&&<span style={{fontSize:7,lineHeight:1}}>⚖</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:14,fontSize:8,letterSpacing:2,color:'#5a4a30',marginTop:4,flexWrap:'wrap',justifyContent:'center'}}>
        <span style={{color:'#e06030'}}>𓆙 NĀGA</span>
        <span style={{color:'#f0d050'}}>🪔 VIRTUE</span>
        <span style={{color:'#c8a0f0'}}>⚖ DHARMA</span>
        <span style={{color:'#f0d050'}}>ॐ MOKSHA</span>
      </div>

      {/* Event label */}
      {ladderFlash&&<div style={{fontSize:9,color:'#80c080',animation:'fadeIn .3s ease',letterSpacing:2,textAlign:'center'}}>🪔 VIRTUE LIFTS · +22 sq · +1 Punya</div>}
      {snakeFlash&&<div style={{fontSize:9,color:'#e06030',animation:'fadeIn .3s ease',letterSpacing:2,textAlign:'center'}}>𓆙 SERPENT BITES · −18 sq · +2 Papa</div>}
    </div>
  );
}
