import { useEffect, useRef } from 'react';

export default function SineWaveBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const WAVES = [
      { amp: 38, freq: 0.012, speed: 0.018, phase: 0,    color: 'rgba(200,160,60,.10)',  width: 1.5, yOff: 0.35 },
      { amp: 22, freq: 0.018, speed: 0.026, phase: 1.2,  color: 'rgba(200,160,60,.07)',  width: 1.0, yOff: 0.45 },
      { amp: 50, freq: 0.008, speed: 0.012, phase: 2.4,  color: 'rgba(160,120,60,.06)',  width: 2.0, yOff: 0.55 },
      { amp: 28, freq: 0.022, speed: 0.032, phase: 3.6,  color: 'rgba(240,200,80,.05)',  width: 0.8, yOff: 0.65 },
      { amp: 60, freq: 0.006, speed: 0.008, phase: 4.8,  color: 'rgba(180,140,60,.04)',  width: 2.5, yOff: 0.50 },
      // Subtle Om-like circular resonance wave
      { amp: 15, freq: 0.030, speed: 0.045, phase: 0.8,  color: 'rgba(240,200,80,.06)',  width: 0.6, yOff: 0.38 },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 1;

      WAVES.forEach(w => {
        const y0 = canvas.height * w.yOff;
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.width;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(200,160,60,.12)';

        for (let x = 0; x <= canvas.width; x += 2) {
          // Layered sine: primary + harmonic for organic feel
          const y = y0
            + Math.sin(x * w.freq + t * w.speed + w.phase) * w.amp
            + Math.sin(x * w.freq * 2.1 + t * w.speed * 1.4 + w.phase) * (w.amp * 0.3);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0, opacity: 0.8,
    }}/>
  );
}
