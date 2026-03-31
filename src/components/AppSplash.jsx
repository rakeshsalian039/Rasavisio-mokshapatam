import { useEffect, useState } from "react";

const CSS = `
@keyframes splashFadeIn{0%{opacity:1}100%{opacity:1}}
@keyframes splashFadeOut{0%{opacity:1}100%{opacity:0}}
@keyframes omPulse{0%,100%{text-shadow:0 0 30px rgba(240,200,80,.4),0 0 60px rgba(240,200,80,.2);transform:scale(1)}50%{text-shadow:0 0 60px rgba(240,200,80,.8),0 0 120px rgba(240,200,80,.4),0 0 200px rgba(240,200,80,.15);transform:scale(1.06)}}
@keyframes omReveal{0%{opacity:0;transform:scale(.3) rotate(-30deg);filter:blur(20px)}60%{opacity:1;transform:scale(1.08) rotate(2deg);filter:blur(0)}100%{opacity:1;transform:scale(1) rotate(0deg)}}
@keyframes titleReveal{0%{opacity:0;transform:translateY(24px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes subtitleReveal{0%{opacity:0;letter-spacing:12px}100%{opacity:.55;letter-spacing:6px}}
@keyframes soulFloat{0%{opacity:0;transform:translateY(0) scale(1)}15%{opacity:.9}85%{opacity:.4}100%{opacity:0;transform:translateY(-110vh) scale(.4)}}
@keyframes gridReveal{0%{opacity:0;transform:perspective(600px) rotateX(55deg) scale(.7);filter:blur(4px)}100%{opacity:1;transform:perspective(600px) rotateX(55deg) scale(1);filter:blur(0)}}
@keyframes snakeWave{0%{stroke-dashoffset:500}100%{stroke-dashoffset:0}}
@keyframes ringPulse{0%,100%{opacity:.12;transform:scale(1)}50%{opacity:.22;transform:scale(1.04)}}
@keyframes logoFade{0%{opacity:0}100%{opacity:.18}}
@keyframes outerGlow{0%,100%{opacity:.06}50%{opacity:.14}}
`;

const SOULS = [
  { left:"8%",  delay:0,    dur:3.8, size:3 },
  { left:"18%", delay:0.4,  dur:4.2, size:2 },
  { left:"28%", delay:0.8,  dur:3.5, size:4 },
  { left:"38%", delay:0.2,  dur:4.6, size:2 },
  { left:"48%", delay:1.1,  dur:3.9, size:3 },
  { left:"58%", delay:0.6,  dur:4.1, size:2 },
  { left:"68%", delay:0.9,  dur:3.6, size:4 },
  { left:"78%", delay:0.3,  dur:4.3, size:3 },
  { left:"88%", delay:1.3,  dur:3.7, size:2 },
  { left:"13%", delay:1.6,  dur:4.0, size:3 },
  { left:"63%", delay:1.8,  dur:3.8, size:2 },
  { left:"93%", delay:0.7,  dur:4.4, size:3 },
];

// 8x8 micro grid squares for the perspective board
const GRID = Array.from({ length: 64 }, (_, i) => i);

export default function AppSplash({ onDone }) {
  const [phase, setPhase] = useState("in"); // "in" | "hold" | "out"

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 3000);
    const t2 = setTimeout(() => onDone && onDone(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "radial-gradient(ellipse at 50% 40%, #1e180a 0%, #0c0a07 65%, #060504 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      animation: phase === "out" ? "splashFadeOut .6s ease forwards" : undefined,
    }}>
      <style>{CSS}</style>

      {/* Perspective board grid — atmospheric background */}
      <div style={{
        position: "absolute", bottom: "-8%", left: "50%", transform: "translateX(-50%)",
        width: "110vw", height: "55vw",
        animation: "gridReveal 1.2s ease .1s both",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "repeat(8, 1fr)",
          width: "100%", height: "100%",
          transform: "perspective(500px) rotateX(55deg)",
        }}>
          {GRID.map(i => (
            <div key={i} style={{
              border: "1px solid rgba(200,160,60,.08)",
              background: i % 7 === 0 ? "rgba(240,200,80,.03)" : "transparent",
            }}/>
          ))}
        </div>
      </div>

      {/* Outer ambient glow rings */}
      {[160, 220, 290].map((r, i) => (
        <div key={i} style={{
          position: "absolute", width: r * 2, height: r * 2, borderRadius: "50%",
          border: `1px solid rgba(200,160,60,${.15 - i * .04})`,
          animation: `ringPulse ${2.5 + i * .5}s ease ${i * .3}s infinite`,
        }}/>
      ))}

      {/* Snake SVG — coils around the Om */}
      <svg style={{
        position: "absolute", width: 220, height: 220, opacity: .35,
        animation: "splashFadeIn .8s ease .6s both",
      }} viewBox="0 0 220 220">
        <path
          d="M 110,30 C 160,30 185,70 185,110 C 185,155 155,180 110,180 C 65,180 35,155 35,110 C 35,70 60,45 100,42 C 130,40 150,55 150,80 C 150,105 130,120 110,120 C 90,120 78,108 80,90"
          fill="none"
          stroke="rgba(200,100,40,.7)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="500"
          strokeDashoffset="0"
          style={{ animation: "snakeWave 2s ease .4s both" }}
        />
        {/* Snake head */}
        <ellipse cx="80" cy="84" rx="5" ry="3.5" fill="rgba(200,100,40,.7)" transform="rotate(-30 80 84)"/>
        <circle cx="78" cy="82" r="1" fill="rgba(255,200,100,.9)"/>
      </svg>

      {/* Central OM symbol */}
      <div style={{
        fontSize: 96, lineHeight: 1,
        fontFamily: "'Noto Serif Devanagari', serif",
        color: "#f0d050",
        animation: "omReveal .9s cubic-bezier(.34,1.56,.64,1) .2s both, omPulse 2.4s ease 1.2s infinite",
        position: "relative", zIndex: 2,
        filter: "drop-shadow(0 0 2px rgba(240,200,80,.6))",
        marginBottom: 24,
      }}>ॐ</div>

      {/* Sanskrit title */}
      <div style={{
        fontFamily: "'Yatra One', serif",
        fontSize: 28, color: "#f0d050",
        letterSpacing: 3, textAlign: "center",
        animation: "titleReveal .7s ease .9s both",
        lineHeight: 1.2, marginBottom: 8,
        filter: "drop-shadow(0 2px 12px rgba(240,200,80,.3))",
      }}>मोक्षपटम्</div>

      {/* English subtitle */}
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 10, color: "#c0a060",
        letterSpacing: 6, textAlign: "center",
        textTransform: "uppercase",
        animation: "subtitleReveal .8s ease 1.3s both",
      }}>The Ancient Game of Karma</div>

      {/* Ascending souls */}
      {SOULS.map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          left: s.left, bottom: "5%",
          width: s.size, height: s.size,
          borderRadius: "50%",
          background: "radial-gradient(circle, #f0d050, rgba(240,200,80,.3))",
          animation: `soulFloat ${s.dur}s ease ${s.delay + 0.8}s infinite`,
          boxShadow: `0 0 ${s.size * 3}px rgba(240,200,80,.6)`,
        }}/>
      ))}

      {/* RASAVISIO watermark */}
      <div style={{
        position: "absolute", bottom: "max(28px, env(safe-area-inset-bottom, 28px))",
        fontFamily: "'Cinzel', serif", fontSize: 9,
        color: "#c0a060", letterSpacing: 5,
        animation: "logoFade .6s ease 1.8s both",
      }}>RASAVISIO</div>
    </div>
  );
}
