// ─────────────────────────────────────────────────────────────────────────────
// src/LandingPage.jsx — RasaVisio · Moksha Patam 108
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, useCallback } from 'react';

// ── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@700;900&family=Noto+Serif+Devanagari:wght@300;400;700&family=IM+Fell+English:ital@0;1&display=swap');
:root{
  --gold:#f5dc64;--gold2:#d4a820;--saffron:#e87830;
  --cosmos:#0a0805;--cosmos2:#120f08;--cosmos3:#1c1710;
  --text:#dccb88;--text2:#a89050;
  --green:#7fffd4;--purple:#b8a8ff;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--cosmos);color:var(--text);font-family:'IM Fell English',Georgia,serif;overflow-x:hidden}
::selection{background:rgba(245,220,100,.18);color:var(--gold)}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--cosmos)}
::-webkit-scrollbar-thumb{background:rgba(245,220,100,.25)}

.reveal{opacity:0;transform:translateY(26px);transition:opacity 1s ease,transform 1s ease}
.reveal.vis{opacity:1;transform:translateY(0)}
.reveal-l{opacity:0;transform:translateX(-26px);transition:opacity 1s ease,transform 1s ease}
.reveal-l.vis{opacity:1;transform:translateX(0)}
.reveal-r{opacity:0;transform:translateX(26px);transition:opacity 1s ease,transform 1s ease}
.reveal-r.vis{opacity:1;transform:translateX(0)}

/* ── NAV ── */
nav{position:fixed;top:0;left:0;right:0;z-index:200;padding:16px 6%;
  display:flex;justify-content:space-between;align-items:center;transition:all .4s}
nav.sc{background:rgba(10,8,5,.96);backdrop-filter:blur(16px);
  border-bottom:1px solid rgba(245,220,100,.07)}
.logo{font-family:'Cinzel Decorative',serif;font-size:clamp(13px,1.8vw,17px);
  color:var(--gold);letter-spacing:4px;cursor:pointer;text-shadow:0 0 20px rgba(245,220,100,.2)}
.logo em{color:var(--saffron);font-style:normal}
.nav-ul{display:flex;gap:36px;list-style:none}
.nav-ul a{font-family:'Cinzel',serif;font-size:10px;letter-spacing:4px;
  color:rgba(220,203,136,.45);text-decoration:none;transition:color .3s;text-transform:uppercase;cursor:pointer}
.nav-ul a:hover{color:var(--gold)}
.nav-btn{font-family:'Cinzel',serif;font-size:10px;letter-spacing:3px;padding:8px 20px;
  border:1px solid rgba(245,220,100,.3);color:var(--gold);cursor:pointer;
  background:transparent;transition:all .3s;text-transform:uppercase}
.nav-btn:hover{background:rgba(245,220,100,.07)}
@media(max-width:700px){.nav-ul{display:none}}

/* ── HERO ── */
.hero{position:relative;width:100%;height:100vh;min-height:640px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  overflow:hidden;text-align:center;padding:0 5%}
.hcan{position:absolute;inset:0;width:100%;height:100%}
.hov{position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% 50%,rgba(10,8,5,.2) 0%,rgba(10,8,5,.78) 60%,rgba(10,8,5,.97) 100%)}
.hc{position:relative;z-index:3}
.h-pre{font-family:'Noto Serif Devanagari',serif;font-size:clamp(22px,5vw,44px);
  color:rgba(245,220,100,.18);letter-spacing:10px;margin-bottom:6px;
  animation:dn 1.4s ease forwards .3s;opacity:0}
.h-title{font-family:'Cinzel Decorative',serif;
  font-size:clamp(30px,6.5vw,68px);color:var(--gold);letter-spacing:3px;line-height:1.1;
  text-shadow:0 0 50px rgba(245,220,100,.25),0 0 100px rgba(245,220,100,.08);
  animation:dn 1.4s ease forwards .6s;opacity:0}
.h-108{font-size:clamp(20px,4.5vw,50px);color:var(--saffron);letter-spacing:6px;
  text-shadow:0 0 40px rgba(232,120,48,.4)}
.h-sub{font-family:'Cinzel',serif;font-size:clamp(9px,1.3vw,12px);letter-spacing:7px;
  color:rgba(220,203,136,.45);margin:12px 0;text-transform:uppercase;
  animation:dn 1.4s ease forwards .9s;opacity:0}
.h-tag{font-family:'IM Fell English',serif;font-style:italic;
  font-size:clamp(15px,2.2vw,21px);color:rgba(220,203,136,.75);
  margin:16px auto 44px;line-height:1.9;max-width:560px;
  animation:dn 1.4s ease forwards 1.2s;opacity:0}
.h-portals{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;
  animation:up 1.4s ease forwards 1.6s;opacity:0}

/* Portal buttons */
.pb{display:flex;flex-direction:column;align-items:center;gap:5px;
  padding:18px 24px;border:1px solid;cursor:pointer;background:rgba(10,8,5,.6);
  transition:all .4s;min-width:150px;font-family:'Cinzel',serif;
  backdrop-filter:blur(8px);position:relative;overflow:hidden}
.pb::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:1px;
  transition:left .5s}
.pb:hover::before{left:100%}
.pb-g{border-color:rgba(127,255,212,.25);color:var(--green)}
.pb-g::before{background:linear-gradient(90deg,transparent,var(--green),transparent)}
.pb-g:hover{border-color:var(--green);box-shadow:0 0 30px rgba(127,255,212,.08),inset 0 0 20px rgba(127,255,212,.03)}
.pb-p{border-color:rgba(184,168,255,.25);color:var(--purple)}
.pb-p::before{background:linear-gradient(90deg,transparent,var(--purple),transparent)}
.pb-p:hover{border-color:var(--purple);box-shadow:0 0 30px rgba(184,168,255,.08)}
.pb-go{border-color:rgba(245,220,100,.4);color:var(--gold)}
.pb-go::before{background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.pb-go:hover{border-color:var(--gold);box-shadow:0 0 35px rgba(245,220,100,.12),inset 0 0 20px rgba(245,220,100,.04)}
.pb-age{font-size:9px;letter-spacing:4px;opacity:.45;text-transform:uppercase}
.pb-name{font-size:13px;letter-spacing:4px;font-weight:700;text-transform:uppercase}
.pb-sk{font-family:'Noto Serif Devanagari',serif;font-size:14px;opacity:.55}
.pb-badge{position:absolute;top:7px;right:7px;font-family:'Cinzel',serif;
  font-size:8px;letter-spacing:2px;padding:2px 6px;
  background:rgba(245,220,100,.12);border:1px solid rgba(245,220,100,.3);
  color:var(--gold);text-transform:uppercase}
.scroll-ind{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);
  display:flex;flex-direction:column;align-items:center;gap:6px;z-index:3;
  animation:up 1s ease forwards 2.8s;opacity:0}
.scroll-ind span{font-family:'Cinzel',serif;font-size:8px;letter-spacing:5px;color:rgba(245,220,100,.3)}
.sa{width:1px;height:36px;background:linear-gradient(180deg,var(--gold),transparent);
  animation:sp 2s ease infinite}

/* ── DIVIDER ── */
.divider{display:flex;align-items:center;gap:14px;margin:0 auto 64px;
  max-width:380px;opacity:.28}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--gold)}
.divider span{color:var(--gold);font-family:'Noto Serif Devanagari',serif;font-size:20px}

/* ── SECTIONS ── */
section{padding:110px 6%}
.sec-label{font-family:'Cinzel',serif;font-size:10px;letter-spacing:7px;
  color:rgba(245,220,100,.45);text-transform:uppercase;margin-bottom:18px;display:block}
.sec-h{font-family:'Cinzel Decorative',serif;font-size:clamp(22px,4vw,40px);
  color:var(--gold);line-height:1.25;margin-bottom:24px;letter-spacing:2px;
  text-shadow:0 0 30px rgba(245,220,100,.12)}
.sec-p{font-family:'IM Fell English',serif;font-style:italic;
  font-size:clamp(15px,1.8vw,18px);color:rgba(220,203,136,.78);line-height:2;
  margin-bottom:18px;max-width:640px}

/* ── SECRET ── */
.secret-sec{background:var(--cosmos);text-align:center;position:relative;overflow:hidden}
.secret-yr{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  font-family:'Cinzel Decorative',serif;font-size:clamp(100px,20vw,220px);
  color:rgba(245,220,100,.025);letter-spacing:-8px;pointer-events:none;white-space:nowrap}
.sq{font-family:'Cinzel',serif;font-size:12px;letter-spacing:4px;
  color:rgba(245,220,100,.5);border:1px solid rgba(245,220,100,.15);
  padding:18px 40px;display:inline-block;margin-top:30px;
  background:rgba(245,220,100,.03);line-height:1.9;max-width:560px}

/* ── THREE PATHS ── */
.paths-sec{background:linear-gradient(180deg,var(--cosmos),var(--cosmos2))}
.paths-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;
  max-width:1140px;margin:0 auto}
@media(max-width:900px){.paths-grid{grid-template-columns:1fr;max-width:480px}}
.pc{position:relative;padding:48px 36px;border:1px solid;overflow:hidden;
  cursor:pointer;transition:all .45s;display:flex;flex-direction:column}
.pc::after{content:'';position:absolute;bottom:0;left:0;right:0;height:200px;
  opacity:0;transition:opacity .4s}
.pc:hover::after{opacity:1}
.pc:hover{transform:translateY(-6px)}

/* Bala */
.pc-bala{border-color:rgba(127,255,212,.18);background:rgba(4,18,14,.65)}
.pc-bala::after{background:linear-gradient(0deg,rgba(127,255,212,.05),transparent)}
.pc-bala:hover{border-color:rgba(127,255,212,.45);box-shadow:0 0 50px rgba(127,255,212,.05),0 20px 40px rgba(0,0,0,.4)}
/* Kishore */
.pc-kish{border-color:rgba(184,168,255,.18);background:rgba(8,6,18,.65)}
.pc-kish::after{background:linear-gradient(0deg,rgba(184,168,255,.05),transparent)}
.pc-kish:hover{border-color:rgba(184,168,255,.45);box-shadow:0 0 50px rgba(184,168,255,.05),0 20px 40px rgba(0,0,0,.4)}
/* Moksha — FEATURED */
.pc-mok{border-color:rgba(245,220,100,.35);background:rgba(18,14,4,.8);
  box-shadow:0 0 0 1px rgba(245,220,100,.08),inset 0 0 60px rgba(245,220,100,.02)}
.pc-mok::after{background:linear-gradient(0deg,rgba(245,220,100,.06),transparent)}
.pc-mok:hover{border-color:rgba(245,220,100,.7);
  box-shadow:0 0 60px rgba(245,220,100,.1),0 20px 50px rgba(0,0,0,.5)}

.pc-feat{position:absolute;top:16px;right:16px;font-family:'Cinzel',serif;
  font-size:8px;letter-spacing:3px;padding:3px 8px;text-transform:uppercase;
  background:rgba(245,220,100,.12);border:1px solid rgba(245,220,100,.35);color:var(--gold)}
.pc-icon{font-size:48px;margin-bottom:18px;line-height:1;
  filter:drop-shadow(0 0 12px currentColor);display:block}
.pc-age{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;
  opacity:.4;text-transform:uppercase;margin-bottom:8px}
.pc-name{font-family:'Cinzel Decorative',serif;font-size:clamp(18px,2.5vw,24px);
  letter-spacing:1px;margin-bottom:4px}
.pc-sk{font-family:'Noto Serif Devanagari',serif;font-size:17px;opacity:.45;margin-bottom:18px}
.pc-desc{font-family:'IM Fell English',serif;font-style:italic;
  font-size:clamp(13px,1.5vw,15px);line-height:1.95;opacity:.62;flex:1}
.pc-link{margin-top:24px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:4px;
  text-transform:uppercase;opacity:.4;transition:opacity .3s}
.pc:hover .pc-link{opacity:1}

/* Moksha features list */
.mok-feats{margin-top:18px;display:flex;flex-direction:column;gap:7px}
.mok-feat{font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;
  color:rgba(245,220,100,.55);text-transform:uppercase;display:flex;align-items:center;gap:8px}
.mok-feat::before{content:'';width:20px;height:1px;background:rgba(245,220,100,.35);flex-shrink:0}

/* ── 108 ── */
.s108-sec{background:var(--cosmos2);position:relative;overflow:hidden;text-align:center}
.s108-bg-n{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  font-family:'Cinzel Decorative',serif;font-size:clamp(180px,32vw,360px);
  color:rgba(245,220,100,.022);letter-spacing:-12px;pointer-events:none;line-height:1}
.s3{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;
  max-width:400px;margin:36px auto;font-family:'Cinzel',serif;border:1px solid rgba(245,220,100,.08)}
.s3c{padding:26px 18px;border:1px solid rgba(245,220,100,.06);text-align:center}
.s3n{font-size:clamp(32px,5vw,52px);font-weight:900;line-height:1;margin-bottom:8px}
.s3l{font-size:9px;letter-spacing:4px;color:rgba(220,203,136,.4);text-transform:uppercase}
.s3sk{font-family:'Noto Serif Devanagari',serif;font-size:15px;color:rgba(245,220,100,.4);margin-top:3px}
.sfacts{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:2px;
  max-width:940px;margin:50px auto 0}
.sfact{padding:30px 26px;border:1px solid rgba(245,220,100,.06);
  background:rgba(16,13,5,.5);text-align:left;transition:border-color .3s}
.sfact:hover{border-color:rgba(245,220,100,.18)}
.sfact h4{font-family:'Cinzel',serif;font-size:10px;letter-spacing:4px;color:var(--gold);
  text-transform:uppercase;margin-bottom:12px;opacity:.65}
.sfact p{font-family:'IM Fell English',serif;font-style:italic;
  font-size:13px;line-height:2;color:rgba(220,203,136,.6)}

/* ── ABOUT ── */
.about-sec{background:var(--cosmos)}
.about-g{display:grid;grid-template-columns:1fr 1fr;gap:80px;max-width:1100px;margin:0 auto;align-items:center}
@media(max-width:860px){.about-g{grid-template-columns:1fr}.about-vis{display:none}}
.stats{display:flex;gap:30px;flex-wrap:wrap;margin-top:36px}
.stat-n{font-family:'Cinzel Decorative',serif;font-size:30px;color:var(--gold);
  text-shadow:0 0 20px rgba(245,220,100,.2)}
.stat-l{font-family:'Cinzel',serif;font-size:8px;letter-spacing:3px;
  color:rgba(220,203,136,.38);text-transform:uppercase;margin-top:4px}

/* ── FEATURES ── */
.feat-sec{background:var(--cosmos2)}
.feat-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:2px;max-width:1100px;margin:0 auto}
.feat-c{padding:36px 28px;border:1px solid rgba(245,220,100,.055);
  background:rgba(18,15,6,.55);transition:all .35s}
.feat-c:hover{background:rgba(26,21,8,.7);border-color:rgba(245,220,100,.15)}
.fi{font-size:26px;margin-bottom:16px;line-height:1}
.ft{font-family:'Cinzel',serif;font-size:12px;letter-spacing:3px;color:var(--gold);
  font-weight:700;margin-bottom:10px;text-transform:uppercase;opacity:.8}
.fd{font-family:'IM Fell English',serif;font-style:italic;
  font-size:13.5px;line-height:1.95;color:rgba(220,203,136,.55)}

/* ── FOOTER ── */
footer{background:rgba(6,4,2,.99);border-top:1px solid rgba(245,220,100,.08);padding:80px 6% 40px}
.fg{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:50px;max-width:1100px;margin:0 auto 60px}
@media(max-width:860px){.fg{grid-template-columns:1fr 1fr;gap:36px}}
@media(max-width:500px){.fg{grid-template-columns:1fr}}
.flogo{font-family:'Cinzel Decorative',serif;font-size:20px;color:var(--gold);letter-spacing:3px;margin-bottom:14px}
.flogo em{color:var(--saffron);font-style:normal}
.ftag{font-family:'IM Fell English',serif;font-style:italic;font-size:13.5px;
  line-height:1.95;color:rgba(220,203,136,.4);margin-bottom:22px}
.fsoc{display:flex;gap:10px}
.fsoc a{width:32px;height:32px;border:1px solid rgba(245,220,100,.15);
  display:flex;align-items:center;justify-content:center;
  color:rgba(245,220,100,.4);font-size:13px;text-decoration:none;transition:all .3s}
.fsoc a:hover{border-color:var(--gold);color:var(--gold)}
.fcol h4{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:var(--gold);
  text-transform:uppercase;opacity:.5;margin-bottom:16px}
.fcol ul{list-style:none}
.fcol li{margin-bottom:10px}
.fcol a,.fcol button{font-family:'IM Fell English',serif;font-style:italic;font-size:13.5px;
  color:rgba(220,203,136,.4);text-decoration:none;transition:color .3s;
  background:transparent;border:none;cursor:pointer;padding:0;text-align:left}
.fcol a:hover,.fcol button:hover{color:var(--gold)}
.fbot{max-width:1100px;margin:0 auto;padding-top:30px;
  border-top:1px solid rgba(245,220,100,.06);
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.fcp{font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;
  color:rgba(220,203,136,.28);text-transform:uppercase}

/* ── MODALS ── */
.moverlay{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:1000;
  display:flex;align-items:center;justify-content:center;padding:20px;
  animation:fi .25s ease}
.mbox{background:var(--cosmos2);border:1px solid rgba(245,220,100,.18);
  max-width:660px;width:100%;max-height:88vh;overflow-y:auto;padding:48px}
.mbox::-webkit-scrollbar{width:2px}
.mbox::-webkit-scrollbar-thumb{background:rgba(245,220,100,.2)}
.mbox h2{font-family:'Cinzel Decorative',serif;font-size:22px;color:var(--gold);
  margin-bottom:6px;letter-spacing:2px}
.mdate{font-family:'Cinzel',serif;font-size:9px;letter-spacing:4px;
  color:rgba(245,220,100,.3);margin-bottom:30px}
.mbox h3{font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;color:rgba(245,220,100,.65);
  text-transform:uppercase;margin:26px 0 10px}
.mbox p{font-family:'IM Fell English',serif;font-style:italic;font-size:14.5px;
  line-height:2;color:rgba(220,203,136,.65);margin-bottom:12px}
.mclose{position:sticky;bottom:0;display:flex;justify-content:center;padding-top:28px;
  background:linear-gradient(0deg,var(--cosmos2) 60%,transparent)}
.mclose button{font-family:'Cinzel',serif;font-size:10px;letter-spacing:4px;
  padding:10px 28px;border:1px solid rgba(245,220,100,.3);color:var(--gold);
  cursor:pointer;background:transparent;transition:all .3s;text-transform:uppercase}
.mclose button:hover{background:rgba(245,220,100,.07)}

/* Coming Soon modal */
.cs-modal{text-align:center;padding:64px 48px}
.cs-icon{font-size:56px;margin-bottom:18px;opacity:.7;animation:pulse 3s ease infinite}
.cs-h{font-family:'Cinzel Decorative',serif;font-size:clamp(20px,3.5vw,28px);color:var(--gold);margin-bottom:10px;letter-spacing:2px}
.cs-sub{font-family:'Cinzel',serif;font-size:11px;letter-spacing:5px;color:rgba(245,220,100,.4);
  text-transform:uppercase;margin-bottom:24px}
.cs-p{font-family:'IM Fell English',serif;font-style:italic;font-size:16px;
  color:rgba(220,203,136,.65);line-height:2;max-width:420px;margin:0 auto 28px}
.cs-date{font-family:'Cinzel',serif;font-size:10px;letter-spacing:4px;
  color:var(--saffron);opacity:.7;margin-bottom:32px;text-transform:uppercase}

/* ── KEYFRAMES ── */
@keyframes dn{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
@keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes sp{0%{opacity:0;transform:scaleY(0);transform-origin:top}
  50%{opacity:1;transform:scaleY(1)}100%{opacity:0;transform:scaleY(1);transform-origin:bottom}}
@keyframes pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.06);opacity:1}}
@keyframes slowrot{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes cslow{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
`;

// ── Sacred Geometry Canvas ────────────────────────────────────────────────────
function SacredCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, frame = 0;
    const resize = () => { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; };
    resize();

    // ── 216 particles tracing 108-petal rose ──
    const particles = Array.from({length:216},(_,i)=>({
      phase:(i/216)*Math.PI*2, t:(i/216)*Math.PI*4,
      speed:0.0016+(i%9)*0.00014, layer:i%3,
    }));

    // ── Pre-compute Flower of Life centers ──
    function flowerCenters(cx,cy,r){
      const c=[{x:cx,y:cy}];
      for(let i=0;i<6;i++) c.push({x:cx+r*Math.cos(i*Math.PI/3),y:cy+r*Math.sin(i*Math.PI/3)});
      for(let i=0;i<6;i++) c.push({x:cx+r*Math.sqrt(3)*Math.cos(i*Math.PI/3+Math.PI/6),y:cy+r*Math.sqrt(3)*Math.sin(i*Math.PI/3+Math.PI/6)});
      for(let i=0;i<6;i++) c.push({x:cx+r*2*Math.cos(i*Math.PI/3),y:cy+r*2*Math.sin(i*Math.PI/3)});
      return c;
    }

    // ── Sri Yantra: 9 interlocking triangles ──
    function drawSriYantra(cx,cy,R,t,alpha){
      // 4 upward (Shiva) + 5 downward (Shakti)
      const tris=[
        {up:true,  s:.95, rot:0},
        {up:false, s:.88, rot:.04},
        {up:true,  s:.78, rot:-.05},
        {up:false, s:.70, rot:.06},
        {up:true,  s:.60, rot:-.04},
        {up:false, s:.52, rot:.05},
        {up:true,  s:.42, rot:-.03},
        {up:false, s:.33, rot:.04},
        {up:true,  s:.22, rot:-.02},
      ];
      tris.forEach(({up,s,rot},i)=>{
        const r=R*s*.62;
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(rot+t*0.003*(i%2?1:-1));
        ctx.globalAlpha=alpha*(0.55+0.45*Math.sin(t*0.3+i*.7));
        ctx.strokeStyle=up?'#f5dc64':'#e87830';
        ctx.lineWidth=0.7;
        ctx.beginPath();
        for(let k=0;k<3;k++){
          const a=k*(2*Math.PI/3)+(up?-Math.PI/2:Math.PI/2);
          k===0?ctx.moveTo(r*Math.cos(a),r*Math.sin(a)):ctx.lineTo(r*Math.cos(a),r*Math.sin(a));
        }
        ctx.closePath(); ctx.stroke();
        ctx.restore();
      });
    }

    function draw(){
      const W=canvas.width,H=canvas.height;
      const cx=W/2,cy=H/2,R=Math.min(W,H)*.44;
      frame++;
      const t=frame*0.008;

      // Trail
      ctx.fillStyle='rgba(10,8,5,0.026)'; ctx.fillRect(0,0,W,H);

      // ── Flower of Life ──
      const flR=R*.19;
      const fc=flowerCenters(cx,cy,flR*2);
      const flAlpha=0.055+0.025*Math.sin(t*.25);
      ctx.save();
      ctx.globalAlpha=flAlpha;
      ctx.strokeStyle='#f5dc64';
      ctx.lineWidth=0.55;
      fc.forEach(c=>{
        ctx.beginPath(); ctx.arc(c.x,c.y,flR*2,0,Math.PI*2); ctx.stroke();
      });
      // Outer boundary circles
      ctx.globalAlpha=flAlpha*.5;
      ctx.lineWidth=0.3;
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3+t*.004;
        const ocx=cx+R*.82*Math.cos(a), ocy=cy+R*.82*Math.sin(a);
        ctx.beginPath(); ctx.arc(ocx,ocy,R*.45,0,Math.PI*2); ctx.stroke();
      }
      ctx.restore();

      // ── Metatron's Cube: connect Flower of Life centers ──
      const mc=flowerCenters(cx,cy,flR*2);
      const mcAlpha=0.035+0.015*Math.sin(t*.2);
      ctx.save();
      ctx.globalAlpha=mcAlpha;
      ctx.strokeStyle='#e87830';
      ctx.lineWidth=0.35;
      for(let i=0;i<mc.length;i++)
        for(let j=i+1;j<mc.length;j++){
          ctx.beginPath();
          ctx.moveTo(mc[i].x,mc[i].y);
          ctx.lineTo(mc[j].x,mc[j].y);
          ctx.stroke();
        }
      ctx.restore();

      // ── Concentric reference rings ──
      for(let i=1;i<=7;i++){
        ctx.beginPath();
        ctx.arc(cx,cy,R*i/7,0,Math.PI*2);
        ctx.strokeStyle=`rgba(245,220,100,${0.02+i*0.012})`;
        ctx.lineWidth=0.4;
        ctx.stroke();
      }

      // ── Vesica Piscis (the two original circles that birth all geometry) ──
      const vpR=R*.38;
      const vpAlpha=0.04+0.02*Math.sin(t*.15);
      ctx.save();
      ctx.globalAlpha=vpAlpha;
      ctx.strokeStyle='#b8a8ff';
      ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.arc(cx-vpR*.5,cy,vpR,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+vpR*.5,cy,vpR,0,Math.PI*2); ctx.stroke();
      ctx.restore();

      // ── Sri Yantra ──
      drawSriYantra(cx,cy,R,t,0.65);

      // ── 12-petal solar disk (Sun-Earth-Moon geometry) ──
      ctx.save();
      ctx.globalAlpha=0.04;
      ctx.strokeStyle='#f5dc64';
      ctx.lineWidth=0.4;
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6+t*.002;
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.lineTo(cx+R*.97*Math.cos(a),cy+R*.97*Math.sin(a));
        ctx.stroke();
      }
      ctx.restore();

      // ── 42° marker (the angle of a rainbow, the answer) ──
      // Hidden very subtly — appears briefly every 108 frames
      if(frame%108<8){
        const a42=42*Math.PI/180;
        const alpha42=Math.sin(frame%108/8*Math.PI)*0.18;
        ctx.save();
        ctx.globalAlpha=alpha42;
        ctx.fillStyle='#f5dc64';
        ctx.font=`bold ${R*.06}px 'Cinzel',serif`;
        ctx.textAlign='center';
        ctx.fillText('42°',cx+R*.68*Math.cos(a42),cy-R*.68*Math.sin(a42));
        ctx.restore();
      }

      // ── Particles: 108-petal rose r = |sin(54θ)| ──
      for(const p of particles){
        p.t+=p.speed;
        const th=p.t+p.phase;
        const rF=Math.abs(Math.sin(54*th));
        const sc=p.layer===0?.36:p.layer===1?.66:1;
        const r=R*rF*sc;
        const x=cx+r*Math.cos(th), y=cy+r*Math.sin(th);
        const cy2=(p.t*.16+p.phase*.4)%(Math.PI*2);
        const br=Math.abs(Math.sin(cy2));
        const h=42+br*12, s=88-br*12, l=56+br*18;
        ctx.beginPath();
        ctx.arc(x,y,p.layer===2?1.5:.95,0,Math.PI*2);
        ctx.fillStyle=`hsla(${h},${s}%,${l}%,${0.3+rF*.55})`;
        ctx.fill();
      }

      // ── OM at centre, very faint ──
      ctx.save();
      ctx.globalAlpha=0.022+0.01*Math.sin(t*.25);
      ctx.fillStyle='#f5dc64';
      ctx.font=`${R*.72}px 'Noto Serif Devanagari',serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('ॐ',cx,cy);
      ctx.restore();

      raf=requestAnimationFrame(draw);
    }
    draw();
    const ro=new ResizeObserver(resize); ro.observe(canvas.parentElement);
    return ()=>{cancelAnimationFrame(raf); ro.disconnect();};
  },[]);
  return <canvas ref={ref} className="hcan"/>;
}

// ── About SVG (slow-rotating sacred geometry) ─────────────────────────────────
function AboutSVG(){
  return(
    <svg style={{width:'clamp(240px,32vw,400px)',height:'clamp(240px,32vw,400px)',opacity:.5}} viewBox="0 0 400 400">
      {/* Outer 108-dot ring */}
      <g style={{animation:'slowrot 120s linear infinite',transformOrigin:'200px 200px'}}>
        {Array.from({length:108},(_,i)=>{
          const a=i/108*Math.PI*2, r=188;
          return <circle key={i} cx={200+r*Math.cos(a)} cy={200+r*Math.sin(a)} r={i%9===0?2.2:1}
            fill="#f5dc64" fillOpacity={i%9===0?.65:.18}/>;
        })}
      </g>
      {/* Counter-rotating Sri Yantra */}
      <g style={{animation:'cslow 80s linear infinite',transformOrigin:'200px 200px'}}>
        {[{up:true,s:1},{up:false,s:.86},{up:true,s:.72},{up:false,s:.58},{up:true,s:.44},{up:false,s:.30}].map(({up,s},i)=>{
          const r=160*s; const pts=Array.from({length:3},(_,k)=>{
            const a=k*(2*Math.PI/3)+(up?-Math.PI/2:Math.PI/2);
            return `${200+r*Math.cos(a)},${200+r*Math.sin(a)}`;
          }).join(' ');
          return <polygon key={i} points={pts} fill="none" stroke={up?'#f5dc64':'#e87830'}
            strokeWidth={i===0?1:.6} strokeOpacity={.15+i*.06}/>;
        })}
      </g>
      {/* Flower of Life (static) */}
      <g strokeOpacity=".12" stroke="#f5dc64" strokeWidth=".5" fill="none">
        {[{x:200,y:200},...Array.from({length:6},(_,i)=>({x:200+70*Math.cos(i*Math.PI/3),y:200+70*Math.sin(i*Math.PI/3)}))].map((c,i)=>(
          <circle key={i} cx={c.x} cy={c.y} r="70"/>
        ))}
      </g>
      <circle cx="200" cy="200" r="6" fill="#f5dc64" fillOpacity=".5"/>
      <circle cx="200" cy="200" r="2" fill="#e87830"/>
    </svg>
  );
}

// ── Scroll reveal hook ─────────────────────────────────────────────────────────
function useReveal(){
  useEffect(()=>{
    const els=document.querySelectorAll('.reveal,.reveal-l,.reveal-r');
    const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vis')}),{threshold:.1});
    els.forEach(el=>obs.observe(el));
    return()=>obs.disconnect();
  },[]);
}

// ── Legal content ──────────────────────────────────────────────────────────────
const PRIVACY={title:'Privacy Policy',date:'Last updated: March 2026',sections:[
  {h:'Information We Collect',b:'We collect your name, email address, and profile picture via Google OAuth when you create an account. We store your game history, Punya/Papa scores, and session preferences. We do not collect your location, phone number, or any financial information.'},
  {h:'How We Use Your Information',b:'Your information personalises your game experience — displaying karma history, maintaining progress, generating leaderboard rankings. We do not use your data for advertising. We do not sell or share your information with any third party.'},
  {h:'Data Storage',b:'Your data is stored securely on Supabase infrastructure with row-level security. Authentication is handled entirely through Google OAuth. We do not store passwords.'},
  {h:'Cookies & Local Storage',b:'We use browser localStorage to maintain your session and game preferences. We do not use tracking cookies or third-party analytics.'},
  {h:"Children's Privacy",b:'The Bala Marg tier is designed for children ages 5-10 and requires no account creation. We do not knowingly collect personal information from children under 13.'},
  {h:'Your Rights',b:'You may request deletion of your account and all associated data at any time by emailing hello@rasavisio.in. We will permanently delete all your data within 7 days of your request.'},
  {h:'Contact',b:'Privacy enquiries: hello@rasavisio.in — We respond within 48 hours.'},
]};
const TERMS={title:'Terms of Service',date:'Effective: March 2026',sections:[
  {h:'Acceptance',b:'By accessing Moksha Patam 108 on rasavisio.in, you agree to these terms. If you do not agree, please do not use the service.'},
  {h:'The Service',b:'RasaVisio provides Moksha Patam 108 as a digital cultural experience, free of charge. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.'},
  {h:'Intellectual Property',b:"All content on rasavisio.in — game design, artwork, audio, written content, Sanskrit translations, and the RasaVisio brand — is RasaVisio's intellectual property. The underlying concept of Moksha Patam is ancient Indian cultural heritage in the public domain. Our creative expression of it is protected."},
  {h:'Prohibited Conduct',b:'You may not reverse-engineer or copy the game for commercial use. You may not use automated bots to manipulate the leaderboard. You may not use the platform to distribute harmful content.'},
  {h:'Limitation of Liability',b:'The service is provided "as is" without warranty. RasaVisio is not liable for any indirect or consequential damages arising from use of the service.'},
  {h:'Governing Law',b:'These terms are governed by the laws of India. Disputes shall be subject to the jurisdiction of courts in Maharashtra, India.'},
]};
const COPYRIGHT={title:'Copyright Notice',date:'© 2024–2026 RasaVisio',sections:[
  {h:'Original Creative Work',b:'All content on rasavisio.in — including game design, visual artwork, audio recordings, written content, Sanskrit translations, educational content, and the RasaVisio and Moksha Patam 108 brands — is the intellectual property of RasaVisio and protected under applicable copyright law.'},
  {h:'Cultural Heritage',b:'The concept of Moksha Patam is ancient Indian cultural heritage in the public domain. Our specific creative expression — mechanics, artwork, narrative, and educational design — is original work protected by copyright.'},
  {h:'Permitted Use',b:'Personal, non-commercial sharing of screenshots or game clips is permitted and encouraged. Commercial reproduction, modification, or distribution of any content from rasavisio.in is prohibited without prior written consent.'},
  {h:'Contact',b:'Licensing enquiries: hello@rasavisio.in'},
]};

function LegalModal({doc,onClose}){
  if(!doc)return null;
  return(
    <div className="moverlay" onClick={onClose}>
      <div className="mbox" onClick={e=>e.stopPropagation()}>
        <h2>{doc.title}</h2><div className="mdate">{doc.date}</div>
        {doc.sections.map((s,i)=><div key={i}><h3>{s.h}</h3><p>{s.b}</p></div>)}
        <div className="mclose"><button onClick={onClose}>Close ✕</button></div>
      </div>
    </div>
  );
}

// ── Coming Soon Modal ─────────────────────────────────────────────────────────
function ComingSoonModal({path,onClose}){
  if(!path)return null;
  const info={
    bala:{icon:'🌿',name:'Bala Marg',sk:'बाल मार्ग',col:'var(--green)',
      desc:'The Panchatantra Forest is being prepared. Ancient stories, Vedic science, and the Blue Jackal await young seekers.',
      date:'Opening Soon'},
    kishore:{icon:'⚡',name:'Kishore Marg',sk:'किशोर मार्ग',col:'var(--purple)',
      desc:'The age of choices. Real dilemmas. Duryodhana awaits. The board of youth is being crafted with great care.',
      date:'Opening Soon'},
  }[path]||{};
  return(
    <div className="moverlay" onClick={onClose}>
      <div className="mbox cs-modal" onClick={e=>e.stopPropagation()}>
        <div className="cs-icon" style={{color:info.col}}>{info.icon}</div>
        <div className="cs-h" style={{color:info.col}}>{info.name}</div>
        <div className="cs-sub" style={{color:info.col,borderColor:info.col}}>
          <span style={{fontFamily:"'Noto Serif Devanagari',serif"}}>{info.sk}</span>
        </div>
        <p className="cs-p">{info.desc}</p>
        <div className="cs-date">⧖ {info.date}</div>
        <button className="mclose" style={{display:'block'}} onClick={onClose}>
          <button style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:4,padding:'10px 28px',
            border:'1px solid rgba(245,220,100,.3)',color:'var(--gold)',cursor:'pointer',
            background:'transparent',textTransform:'uppercase'}}>I Will Return →</button>
        </button>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingPage({onSelectTier}){
  const [scrolled,  setScrolled]  = useState(false);
  const [modal,     setModal]     = useState(null);
  const [csSoon,    setCsSoon]    = useState(null);  // 'bala' | 'kishore'
  const keyBuf = useRef('');

  useReveal();

  // ── Scroll listener ──
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>50);
    window.addEventListener('scroll',fn,{passive:true});
    return()=>window.removeEventListener('scroll',fn);
  },[]);

  // ── Secret: type "42" to open Bala Marg ──
  // Also: type "108" to open Moksha Marg
  useEffect(()=>{
    const fn=(e)=>{
      keyBuf.current=(keyBuf.current+e.key).slice(-3);
      if(keyBuf.current.endsWith('42'))  onSelectTier('bala');
      if(keyBuf.current.endsWith('108')) onSelectTier('moksha');
    };
    window.addEventListener('keydown',fn);
    return()=>window.removeEventListener('keydown',fn);
  },[onSelectTier]);

  const go=id=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'});

  const handlePath=(tier)=>{
    if(tier==='moksha') onSelectTier('moksha');
    else setCsSoon(tier);
  };

  return(
    <>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className={scrolled?'sc':''}>
        <div className="logo" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>
          Rasa<em>Visio</em>
        </div>
        <ul className="nav-ul">
          <li><a onClick={()=>go('games')}>Games</a></li>
          <li><a onClick={()=>go('s108')}>The 108</a></li>
          <li><a onClick={()=>go('about')}>About</a></li>
          <li><a onClick={()=>go('footer')}>Contact</a></li>
        </ul>
        <button className="nav-btn" onClick={()=>onSelectTier('moksha')}>Play Now →</button>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <SacredCanvas/>
        <div className="hov"/>
        <div className="hc">
          <div className="h-pre">मोक्षपटम्</div>
          <h1 className="h-title">
            Moksha Patam&nbsp;
            <span className="h-108">108</span>
          </h1>
          <div className="h-sub">RasaVisio · Sacred Games of India</div>
          <p className="h-tag">
            Before Snakes &amp; Ladders, there was this —<br/>
            the ancient Indian game of the soul.
          </p>
          <div className="h-portals">
            {[
              {tier:'bala',    cls:'pb-g',  icon:'🌿', age:'Ages 5–10',  name:'Bala Marg',   sk:'बाल मार्ग'},
              {tier:'kishore', cls:'pb-p',  icon:'⚡', age:'Ages 10–20', name:'Kishore Marg', sk:'किशोर मार्ग'},
              {tier:'moksha',  cls:'pb-go', icon:'ॐ',  age:'Ages 20+',   name:'Moksha Marg',  sk:'मोक्ष मार्ग', badge:'LIVE'},
            ].map(p=>(
              <button key={p.tier} className={`pb ${p.cls}`} onClick={()=>handlePath(p.tier)}>
                {p.badge&&<div className="pb-badge">{p.badge}</div>}
                <span className="pb-age">{p.age}</span>
                <span className="pb-name">{p.name}</span>
                <span className="pb-sk">{p.sk}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="scroll-ind">
          <span>Scroll</span><div className="sa"/>
        </div>
      </section>

      {/* ── THE SECRET ── */}
      <section className="secret-sec" style={{padding:'110px 6%',position:'relative'}}>
        <div className="secret-yr">1,000 BCE</div>
        <div style={{position:'relative',maxWidth:760,margin:'0 auto',textAlign:'center'}}>
          <span className="sec-label reveal">The Story That Was Erased</span>
          <h2 className="sec-h reveal">Colonisers renamed it.<br/>We are restoring it.</h2>
          <p className="sec-p reveal" style={{margin:'0 auto 18px'}}>
            In ancient India, a sage created a game called <em>Moksha Patam</em> — the Board of Liberation.
            For millennia, kings played it in marble palaces, sages by firelight, gurus to disciples.
            Each snake had a Sanskrit name for a vice. Each ladder bore a virtue.
            The game was a living philosophy.
          </p>
          <p className="sec-p reveal" style={{margin:'0 auto 18px'}}>
            When foreign rulers arrived, they stripped every Sanskrit name, every sacred reference,
            and renamed it "Snakes and Ladders" — a children's game with no philosophy at all.
            The soul of the game was erased.
          </p>
          <p className="sec-p reveal" style={{margin:'0 auto 24px',color:'var(--gold)',fontStyle:'normal'}}>
            Tonight, you play the original.
          </p>
          <div className="reveal">
            <div className="sq">
              "नीतिशास्त्रे धर्मशास्त्रे मोक्षशास्त्रे च नित्यशः" —
              Always in pursuit of wisdom, dharma, and liberation.
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE PATHS ── */}
      <section id="games" style={{padding:'100px 6%',background:'linear-gradient(180deg,var(--cosmos),var(--cosmos2))'}}>
        <span className="sec-label reveal" style={{textAlign:'center',display:'block'}}>Choose Your Path</span>
        <h2 className="sec-h reveal" style={{textAlign:'center',maxWidth:500,margin:'0 auto 60px'}}>Three Journeys.<br/>One Destination.</h2>
        <div className="paths-grid reveal">

          {/* BALA MARG */}
          <div className="pc pc-bala" onClick={()=>handlePath('bala')}>
            <span className="pc-icon" style={{color:'var(--green)'}}>🌿</span>
            <div className="pc-age" style={{color:'var(--green)'}}>Ages 5–10</div>
            <div className="pc-name" style={{color:'var(--green)'}}>Bala Marg</div>
            <div className="pc-sk">बाल मार्ग</div>
            <p className="pc-desc">
              The Panchatantra Forest — 2,300 years of animal wisdom made playable.
              Real Panchatantra stories. Vedic science secrets. A deep jungle board.
              Cymatics, stardust, the Wood Wide Web. The wisdom the ancient sages hid
              in plain sight for children to discover.
            </p>
            <div className="pc-link" style={{color:'var(--green)'}}>Enter the Forest →</div>
          </div>

          {/* MOKSHA MARG — FEATURED */}
          <div className="pc pc-mok" onClick={()=>handlePath('moksha')} style={{zIndex:1}}>
            <div className="pc-feat">✦ Live Now</div>
            <span className="pc-icon" style={{color:'var(--gold)',fontSize:56}}>ॐ</span>
            <div className="pc-age" style={{color:'var(--gold)',opacity:.6}}>Ages 20+</div>
            <div className="pc-name" style={{color:'var(--gold)',fontSize:'clamp(20px,2.8vw,28px)'}}>Moksha Marg</div>
            <div className="pc-sk" style={{fontSize:20}}>मोक्ष मार्ग</div>
            <p className="pc-desc" style={{color:'rgba(220,203,136,.72)',fontSize:'clamp(13px,1.6vw,16px)'}}>
              The complete original game. The game that was stolen, stripped, and
              renamed Snakes and Ladders. Restored to its full sacred form. 108 squares.
              Three cosmic realms. Punya and Papa. Navagraha cosmic dice. Yama, the God
              of Death, awaits. Chitragupta records every choice.
            </p>
            <div className="mok-feats">
              {['10 Nāga Serpents with Sanskrit vice names','10 Virtue Ladders from Mahābhārata','15 Dharma Dilemmas','Navagraha cosmic dice — 9 planetary forces','Chitragupta — AI voice narration','Punya & Papa karma tracking'].map(f=>(
                <div key={f} className="mok-feat" style={{fontSize:'clamp(8px,1vw,10px)'}}>{f}</div>
              ))}
            </div>
            <div className="pc-link" style={{color:'var(--gold)',opacity:.9,marginTop:28}}>Play the Original → →</div>
          </div>

          {/* KISHORE MARG */}
          <div className="pc pc-kish" onClick={()=>handlePath('kishore')}>
            <span className="pc-icon" style={{color:'var(--purple)'}}>⚡</span>
            <div className="pc-age" style={{color:'var(--purple)'}}>Ages 10–20</div>
            <div className="pc-name" style={{color:'var(--purple)'}}>Kishore Marg</div>
            <div className="pc-sk">किशोर मार्ग</div>
            <p className="pc-desc">
              The age of choices. Real moral dilemmas from the Mahabharata. Face
              Duryodhana — brilliant, powerful, undone by his own pride. The board
              of youth tests what you are made of before the world does. Courage,
              discernment, and the weight of consequence.
            </p>
            <div className="pc-link" style={{color:'var(--purple)'}}>Coming Soon →</div>
          </div>

        </div>
      </section>

      {/* ── THE 108 ── */}
      <section className="s108-sec" id="s108">
        <div className="s108-bg-n">108</div>
        <div style={{position:'relative',maxWidth:940,margin:'0 auto',textAlign:'center'}}>
          <span className="sec-label reveal">The Sacred Number</span>
          <h2 className="sec-h reveal">Why 108?</h2>
          <p className="sec-p reveal" style={{margin:'0 auto 8px',color:'rgba(220,203,136,.75)'}}>
            Not a random number. The most mathematically and cosmically significant number
            in all of Indian tradition. And in the animation above — there are exactly 108 petals.
          </p>
          <div className="s3 reveal">
            <div className="s3c">
              <div className="s3n" style={{color:'var(--gold)'}}>1</div>
              <div className="s3l">Brahma</div>
              <div className="s3sk">ब्रह्म · Creator</div>
            </div>
            <div className="s3c">
              <div className="s3n" style={{color:'var(--purple)'}}>0</div>
              <div className="s3l">Shunya</div>
              <div className="s3sk">शून्य · The Void</div>
            </div>
            <div className="s3c">
              <div className="s3n" style={{color:'var(--saffron)'}}>8</div>
              <div className="s3l">Ananta</div>
              <div className="s3sk">अनन्त · Infinity ∞</div>
            </div>
          </div>
          <div className="sfacts">
            {[
              {h:'In the Solar System',b:'The diameter of the Sun is 108 times the diameter of the Earth. The distance from Earth to the Moon is 108 times the Moon\'s diameter. 108 is encoded into the very proportions of our solar system.'},
              {h:'In Sanskrit',b:'The Sanskrit alphabet has 54 letters. Each letter has two forms — Shiva (masculine) and Shakti (feminine). 54 × 2 = 108. The number encodes the structure of sacred sound itself.'},
              {h:'In Sacred Geometry',b:'The interior angle of a regular pentagon is 108°. The pentagon appears in the geometry of DNA molecules, flowers (petals), and the human face. 108 is woven into the fabric of life.'},
              {h:'The 42° Secret',b:'A rainbow forms at exactly 42 degrees — the precise angle at which light bends inside a water droplet to create colour. 42 is hidden in this very animation. Watch for it.'},
            ].map((f,i)=>(
              <div key={i} className="sfact reveal" style={{animationDelay:`${i*.1}s`}}>
                <h4>{f.h}</h4><p>{f.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="about-sec" id="about">
        <div className="about-g">
          <div className="reveal-l">
            <span className="sec-label">About RasaVisio</span>
            <h2 className="sec-h">Ancient Wisdom,<br/>Living Technology</h2>
            <p className="sec-p">
              RasaVisio is a cultural technology company building at the intersection
              of India's wisdom traditions and immersive digital experience.
            </p>
            <p className="sec-p">
              We believe the knowledge encoded in India's stories, games, and mathematical
              traditions is not historical — it is urgent. The Panchatantra teaches children
              what no curriculum does. Moksha Patam teaches adults what no philosophy
              course does. Our work is to make this wisdom playable.
            </p>
            <p className="sec-p" style={{fontSize:'clamp(13px,1.6vw,16px)'}}>
              "Rasa" is the Sanskrit word for essence — the irreducible flavour of pure
              experience. "Visio" is seeing. We make the invisible visible.
            </p>
            <div className="stats">
              {[['108','Squares of karma'],['2,300','Years of Panchatantra'],['9','Navagraha forces'],['3','Tiers of wisdom']].map(([n,l])=>(
                <div key={n}>
                  <div className="stat-n">{n}</div>
                  <div className="stat-l">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-vis reveal-r" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
            <AboutSVG/>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="feat-sec" style={{padding:'100px 6%'}}>
        <span className="sec-label reveal" style={{display:'block',textAlign:'center'}}>What Lives Inside</span>
        <h2 className="sec-h reveal" style={{textAlign:'center',margin:'0 auto 60px',maxWidth:480}}>Every Square Teaches.<br/>Nothing is Decorative.</h2>
        <div className="feat-g">
          {[
            {i:'𓆙',t:'Real Nāga Serpents',d:'Each snake has a Sanskrit vice name — Krodha (Anger), Lobha (Greed), Ahankara (Pride). The Panchatantra story behind each fall.'},
            {i:'🪔',t:'Virtue Ladders',d:"Each ladder bears a Sanskrit virtue. The Panchatantra story of wisdom rewarded. Every climb is a lesson earned, not just a position gained."},
            {i:'⚖',t:'Dharma Dilemmas',d:'Moral crossroads drawn from the Mahābhārata. Two paths. Real consequences. No correct answer — only your answer.'},
            {i:'🎲',t:'Navagraha Dice',d:'Nine cosmic forces — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu — each affecting your journey in distinct ways.'},
            {i:'🔭',t:'Vedic Discoveries',d:'Hidden in the board: secrets the rishis knew and modern science has confirmed. OM creates geometry. Stars made you. Water is eternal.'},
            {i:'🌿',t:'Three Tiers of Wisdom',d:'Bala Marg for children. Kishore Marg for youth. Moksha Marg for seekers. The same eternal game at every stage of life.'},
          ].map((f,i)=>(
            <div key={i} className="feat-c reveal" style={{animationDelay:`${i*.07}s`}}>
              <div className="fi">{f.i}</div>
              <div className="ft">{f.t}</div>
              <p className="fd">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="footer">
        <div className="fg">
          <div>
            <div className="flogo">Rasa<em>Visio</em></div>
            <p className="ftag">Cultural technology restoring India's wisdom traditions through immersive digital experience. Made in India with devotion.</p>
            <div className="fsoc">
              <a href="mailto:hello@rasavisio.in" title="Email">✉</a>
              <a href="https://instagram.com/rasavisio" target="_blank" rel="noreferrer" title="Instagram">◎</a>
            </div>
          </div>
          <div className="fcol">
            <h4>Games</h4>
            <ul>
              <li><button onClick={()=>handlePath('bala')}>Bala Marg</button></li>
              <li><button onClick={()=>onSelectTier('moksha')}>Moksha Marg</button></li>
              <li><button onClick={()=>handlePath('kishore')}>Kishore Marg</button></li>
            </ul>
          </div>
          <div className="fcol">
            <h4>Company</h4>
            <ul>
              <li><a onClick={()=>go('about')}>About RasaVisio</a></li>
              <li><a onClick={()=>go('s108')}>The Science of 108</a></li>
              <li><a href="mailto:hello@rasavisio.in">Contact Us</a></li>
              <li><a href="https://rasavisio.in">rasavisio.in</a></li>
            </ul>
          </div>
          <div className="fcol">
            <h4>Legal</h4>
            <ul>
              <li><button onClick={()=>setModal(PRIVACY)}>Privacy Policy</button></li>
              <li><button onClick={()=>setModal(TERMS)}>Terms of Service</button></li>
              <li><button onClick={()=>setModal(COPYRIGHT)}>Copyright</button></li>
            </ul>
          </div>
        </div>
        <div className="fbot">
          <div className="fcp">© 2024–2026 RasaVisio · All rights reserved</div>
          <div className="fcp" style={{opacity:.18}}>Made in India 🇮🇳 with devotion for Bharat</div>
          <div className="fcp">Moksha Patam 108</div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      {modal     && <LegalModal      doc={modal}  onClose={()=>setModal(null)}/>}
      {csSoon    && <ComingSoonModal path={csSoon} onClose={()=>setCsSoon(null)}/>}
    </>
  );
}
