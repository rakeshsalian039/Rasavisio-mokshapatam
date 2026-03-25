import React from "react";
// ═══ NAGA (SNAKE) SVG COMPONENT ═══
//
// Renders a realistic cobra on the board SVG.
// Props: x1,y1 (head position), x2,y2 (tail position), id (color variant 0-4)
//
// Features: Cobra hood, slit pupils, forked tongue, scale pattern, body glow
// TO MAKE BIGGER/SMALLER: Adjust hood coordinates and head ellipse rx/ry
// TO CHANGE COLORS: Edit the hue[] and glow[] arrays

export default function Naga({x1,y1,x2,y2,id}){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy),nx=-dy/len,amp=len*.16;
  const hue=["#4a3020","#3a2818","#503828","#3a2015","#453020"][id%5];
  const glow=["rgba(180,60,30,.12)","rgba(160,50,20,.1)","rgba(140,40,10,.12)"][id%3];
  // Sinuous body
  let body=`M ${x1} ${y1}`;
  for(let i=1;i<=8;i++){const t=i/8,s=i%2===0?1:-1;const taper=1-t*.4;
    body+=` Q ${x1+dx*((i-.5)/8)+nx*amp*s*taper} ${y1+dy*((i-.5)/8)+(dx/len)*amp*s*taper} ${x1+dx*t} ${y1+dy*t}`}
  const hx=x1,hy=y1;
  // Hood spread
  const hoodL=`M ${hx-2} ${hy} Q ${hx-4} ${hy-3} ${hx-3.5} ${hy-5} Q ${hx-2} ${hy-6.5} ${hx} ${hy-6}`;
  const hoodR=`M ${hx+2} ${hy} Q ${hx+4} ${hy-3} ${hx+3.5} ${hy-5} Q ${hx+2} ${hy-6.5} ${hx} ${hy-6}`;
  return(<g opacity=".5">
    {/* Body glow */}
    <path d={body} fill="none" stroke={glow} strokeWidth="5" strokeLinecap="round" opacity=".4"/>
    {/* Body shadow */}
    <path d={body} fill="none" stroke="rgba(0,0,0,.5)" strokeWidth="4.5" strokeLinecap="round"/>
    {/* Body main */}
    <path d={body} fill="none" stroke={hue} strokeWidth="3.5" strokeLinecap="round"/>
    {/* Scale pattern */}
    <path d={body} fill="none" stroke="rgba(255,200,100,.08)" strokeWidth="2.5" strokeDasharray="1,2.5" strokeLinecap="round"/>
    {/* Belly highlight */}
    <path d={body} fill="none" stroke="rgba(255,220,150,.1)" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Hood */}
    <path d={hoodL} fill={hue} stroke="rgba(200,80,30,.6)" strokeWidth=".4" opacity=".85"/>
    <path d={hoodR} fill={hue} stroke="rgba(200,80,30,.6)" strokeWidth=".4" opacity=".85"/>
    {/* Hood pattern (V shape) */}
    <path d={`M ${hx-2} ${hy-4} L ${hx} ${hy-2} L ${hx+2} ${hy-4}`} fill="none" stroke="rgba(255,200,80,.25)" strokeWidth=".4"/>
    {/* Head */}
    <ellipse cx={hx} cy={hy-1} rx="1.8" ry="1.5" fill={hue} stroke="rgba(200,100,40,.5)" strokeWidth=".3"/>
    {/* Eyes — slit pupils */}
    <ellipse cx={hx-.7} cy={hy-1.3} rx=".6" ry=".5" fill="#0a0000" stroke="rgba(255,120,30,.8)" strokeWidth=".2"/>
    <ellipse cx={hx+.7} cy={hy-1.3} rx=".6" ry=".5" fill="#0a0000" stroke="rgba(255,120,30,.8)" strokeWidth=".2"/>
    <ellipse cx={hx-.7} cy={hy-1.3} rx=".1" ry=".45" fill="rgba(255,180,30,.9)"/>
    <ellipse cx={hx+.7} cy={hy-1.3} rx=".1" ry=".45" fill="rgba(255,180,30,.9)"/>
    {/* Eye glow */}
    <circle cx={hx-.7} cy={hy-1.3} r=".8" fill="rgba(255,60,20,.1)"><animate attributeName="r" values=".6;1;.6" dur="2s" repeatCount="indefinite"/></circle>
    <circle cx={hx+.7} cy={hy-1.3} r=".8" fill="rgba(255,60,20,.1)"><animate attributeName="r" values=".6;1;.6" dur="2s" repeatCount="indefinite"/></circle>
    {/* Forked tongue */}
    <path d={`M ${hx} ${hy+.3} L ${hx} ${hy+1.8} L ${hx-.4} ${hy+2.5} M ${hx} ${hy+1.8} L ${hx+.4} ${hy+2.5}`} fill="none" stroke="#ff6060" strokeWidth=".25" strokeLinecap="round">
      <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite"/>
    </path>
    {/* Tail tip */}
    <circle cx={x2} cy={y2} r="1" fill={hue} opacity=".4"/>
  </g>);
}

