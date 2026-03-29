// ─────────────────────────────────────────────────────────────────────────────
// shared/styles.js
// Global CSS injected via <style>{CSS}</style> in App.jsx
// Fonts, keyframe animations, button classes
// ─────────────────────────────────────────────────────────────────────────────

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;700;900&family=Yatra+One&family=Cinzel:wght@400;700;900&family=Cinzel+Decorative:wght@700;900&display=swap');
*{box-sizing:border-box;margin:0}body{margin:0;background:#0c0a07}
@keyframes dt{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}
@keyframes mp{0%,100%{text-shadow:0 0 15px rgba(240,200,80,.3)}50%{text-shadow:0 0 40px rgba(240,200,80,.7)}}
@keyframes reveal{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
@keyframes breathe{0%,100%{border-color:rgba(200,160,60,.15)}50%{border-color:rgba(200,160,60,.35)}}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes slideUp{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
@keyframes popIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}60%{transform:translate(-50%,-50%) scale(1.05)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes dharmaIn{0%{opacity:0;transform:scale(.3)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
@keyframes turnFlash{0%{opacity:0;transform:scale(.5)}20%{opacity:1;transform:scale(1.1)}80%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}
@keyframes activeGlow{0%{box-shadow:0 0 8px var(--pc),0 0 16px var(--pc)}50%{box-shadow:0 0 16px var(--pc),0 0 32px var(--pc),0 0 48px var(--pc)}100%{box-shadow:0 0 8px var(--pc),0 0 16px var(--pc)}}
@keyframes sacredGlow{0%,100%{box-shadow:0 0 4px rgba(240,200,80,.05)}50%{box-shadow:0 0 12px rgba(240,200,80,.12),0 0 24px rgba(240,200,80,.06)}}
@keyframes yamaBreath{0%{text-shadow:0 0 20px #a04040,0 0 40px #a04040}50%{text-shadow:0 0 40px #e04040,0 0 80px #a04040,0 0 120px #60202060}100%{text-shadow:0 0 20px #a04040,0 0 40px #a04040}}
@keyframes yamaReveal{0%{opacity:0;transform:scale(2);filter:blur(20px)}100%{opacity:1;transform:scale(1);filter:blur(0)}}
@keyframes yamaTextReveal{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
@keyframes waveBar{0%,100%{height:8px}50%{height:28px}}
@keyframes cymaticPulse{0%{transform:scale(.97);opacity:.08}50%{transform:scale(1.03);opacity:.2}100%{transform:scale(.97);opacity:.08}}
@keyframes cymaticRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes diceRoll{0%{transform:rotate(0deg) scale(1)}25%{transform:rotate(90deg) scale(1.2)}50%{transform:rotate(180deg) scale(.9)}75%{transform:rotate(270deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}
@keyframes cymaticFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes tokenPop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
@keyframes realmGlow{0%,100%{opacity:.18}50%{opacity:.38}}
@keyframes snakePulse{0%,100%{stroke-width:1.2;opacity:.45}50%{stroke-width:2.2;opacity:1}}
@keyframes ladderShine{0%,100%{opacity:.55}50%{opacity:1;filter:brightness(1.4)}}
@keyframes bulletReveal{0%{opacity:0;transform:translateX(-12px)}100%{opacity:1;transform:translateX(0)}}
@keyframes dieAppear{0%{transform:rotateY(90deg);opacity:0}100%{transform:rotateY(0deg);opacity:1}}
@keyframes effectSlide{0%{opacity:0;transform:translateY(8px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes orbitSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes mokshaAscend{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-120vh) scale(0.1);opacity:0}}
@keyframes mokshaLotus{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.15) rotate(10deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes yamaRise{0%{transform:translateY(100%) scale(0.5);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes yamaFlame{0%,100%{transform:scaleY(1) skewX(0deg)}33%{transform:scaleY(1.1) skewX(-3deg)}66%{transform:scaleY(.95) skewX(2deg)}}
.gb{background:transparent;border:1px solid rgba(200,160,60,.3);color:#e8c850;padding:12px 32px;font-size:14px;font-family:'Cinzel',serif;cursor:pointer;transition:all .4s;letter-spacing:3px;border-radius:2px}
.gb:hover{background:rgba(200,160,60,.08);border-color:rgba(240,200,80,.6)}
.gp{background:linear-gradient(180deg,rgba(200,160,60,.2),rgba(200,160,60,.08));border-color:rgba(200,160,60,.5)}
.gp:hover{box-shadow:0 0 25px rgba(240,200,80,.12)}
`;
