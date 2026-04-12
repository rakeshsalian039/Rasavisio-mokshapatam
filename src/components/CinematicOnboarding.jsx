// ═══════════════════════════════════════════════════════════════════════════════
// CINEMATIC ONBOARDING — Canvas-based AAA game trailer experience
// 3 proof-of-concept scenes: Opening (particles), Board (realms), Serpent (demo)
// Full 60fps canvas rendering with particle systems, camera movements, text reveals
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';

// Temple bell
const bellRef={current:null};
function bell(){try{if(bellRef.current){bellRef.current.pause();bellRef.current.currentTime=0}const a=new Audio('/temple-bell.mp3');a.volume=0.5;bellRef.current=a;a.play().catch(()=>{});setTimeout(()=>{try{a.pause()}catch(e){}},3000)}catch(e){}}

// ── Scene durations (ms) ──
const SCENE_DUR = [20000, 18000, 18000, 16000, 16000, 18000, 18000, 20000, 18000, 14000, 16000, 999999];
const TOTAL_SCENES = 12;

export default function CinematicOnboarding({ onComplete, muted = false }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    scene: 0, t: 0, sceneT: 0, transitioning: false,
    particles: [], boardCells: [], realmPhase: 0,
    tokenPos: { x: 0, y: 0 }, tokenTarget: null,
    textChars: 0, textSpeed: 1.2,
  });
  const rafRef = useRef(null);
  const [scene, setScene] = useState(0);
  const [, forceUpdate] = useState(0);

  // ── Scene narration texts ──
  const TEXTS = [
    "Five thousand years ago, a game was born in the land of the rishis. It mapped the soul's journey from darkness to light, from ignorance to enlightenment. The British stole it. Called it Snakes and Ladders. Stripped its Sanskrit, its karma, its meaning. We brought it all back.",
    "108 squares span three cosmic realms. Bhuloka, the earthly chaos. Antarloka, the mind's battlefield. Svargaloka, the celestial heights. And above them, the Sacred Crown — Patanjali's eight-fold path to liberation.",
    "Ten serpents of vice lurk across the board. Each named after a sin from the Mahabharata — Wrath, Greed, Ego, Desire. Land on one... and you fall. Your soul branded with Papa. Every fall teaches what the ancients encoded into play.",
    "Ten ladders of virtue lift your soul. Compassion, Truth, Devotion, Detachment. Named after the greatest souls of dharma. Each rise is grace earned through righteous action.",
    "Two dice shape your destiny. The Karma Die moves you forward. The Navagraha Die summons cosmic planetary forces. Surya grants extra steps. Chandra purifies. Shani punishes. The planets are karma.",
    "Twenty-one moral crossroads test your dharma. Should Arjuna fight his family? Should you report your friend? Punya or Papa. No right answers. Only consequences.",
    "Nine sacred temples of ancient Indian knowledge. Ayurveda, Engineering, Mathematics, Language, Astronomy. Land on one and face a quiz. The curriculum of Nalanda University, reborn.",
    "Every eight turns, an ancient genius materializes. Aryabhata. Sushruta. Chanakya. Patanjali. Answer correctly and receive their blessing — a power that changes your game.",
    "After square 100, Patanjali's eight-fold path. One step per turn. Each step tests your soul. No shortcuts. Only the pure reach Moksha.",
    "Every twelve turns, the cosmos whispers. Facts so extraordinary they sound impossible — but every one is documented history. You learn what the world forgot.",
    "Two paths to liberation. Reach Square 108 with pure karma. Or accumulate fifty Punya from any square. The board dissolves. Instant Moksha.",
    "The board awaits. The serpents stir. The gurus watch. Your karma is yours to shape.",
  ];

  // ── Snake/Ladder data for demo ──
  const SNAKES_DEMO = [
    { from: 95, to: 68, skt: 'अहंकार', en: 'EGO' },
    { from: 47, to: 29, skt: 'काम', en: 'DESIRE' },
    { from: 16, to: 4, skt: 'क्रोध', en: 'WRATH' },
  ];
  const LADDERS_DEMO = [
    { from: 3, to: 18, skt: 'दया', en: 'COMPASSION' },
    { from: 71, to: 89, skt: 'भक्ति', en: 'DEVOTION' },
  ];

  // ── Initialize particles for opening scene ──
  const initParticles = useCallback(() => {
    const pts = [];
    // Create 200 golden particles that will form OM symbol
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 400;
      pts.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        // Target positions form a circle (placeholder — OM is complex)
        tx: (Math.random() - 0.5) * 120,
        ty: (Math.random() - 0.5) * 120,
        vx: 0, vy: 0,
        size: 1 + Math.random() * 3,
        opacity: Math.random(),
        color: Math.random() > 0.3 ? '#f0d050' : Math.random() > 0.5 ? '#ffa030' : '#ffffff',
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
      });
    }
    return pts;
  }, []);

  // ── Board cell positions ──
  const getBoardCell = (num) => {
    const row = Math.floor((num - 1) / 10);
    const col = row % 2 === 0 ? (num - 1) % 10 : 9 - (num - 1) % 10;
    return { row: 9 - row, col };
  };

  // ── Main render loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const S = stateRef.current;
    S.particles = initParticles();

    // Bell on start
    if (!muted) bell();

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width / window.devicePixelRatio;
    const H = () => canvas.height / window.devicePixelRatio;

    let lastTime = Date.now();

    const draw = () => {
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      S.t += dt;
      S.sceneT += dt;
      S.textChars += S.textSpeed;

      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // ═══ BACKGROUND — always dark with subtle radial glow ═══
      ctx.fillStyle = '#050403';
      ctx.fillRect(0, 0, w, h);

      // Ambient glow based on scene
      const colors = ['#f0d050', '#c0a060', '#e06030', '#f0d050', '#f0d050', '#d0b870', '#c09040', '#4080c0', '#f0d050', '#f0d050', '#f0d050', '#f0d050'];
      const sceneColor = colors[S.scene] || '#f0d050';
      const grad = ctx.createRadialGradient(w/2, h*0.35, 0, w/2, h*0.35, h*0.7);
      grad.addColorStop(0, sceneColor + '12');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // ═══ SCENE-SPECIFIC RENDERING ═══
      if (S.scene === 0) drawScene0_Opening(ctx, w, h, S);
      else if (S.scene === 1) drawScene1_Board(ctx, w, h, S);
      else if (S.scene === 2) drawScene2_Serpent(ctx, w, h, S);
      else drawSceneGeneric(ctx, w, h, S);

      // ═══ NARRATION TEXT — typewriter at bottom ═══
      const text = TEXTS[S.scene] || '';
      const visChars = Math.min(Math.floor(S.textChars), text.length);
      const visText = text.slice(0, visChars);
      if (visText) {
        // Text background
        const textY = h - 120;
        const tGrad = ctx.createLinearGradient(0, textY - 20, 0, h);
        tGrad.addColorStop(0, 'transparent');
        tGrad.addColorStop(0.15, 'rgba(5,4,3,.85)');
        tGrad.addColorStop(1, 'rgba(5,4,3,.95)');
        ctx.fillStyle = tGrad;
        ctx.fillRect(0, textY - 20, w, h - textY + 20);

        // Text
        ctx.font = `italic ${Math.min(15, w * 0.035)}px 'Georgia', serif`;
        ctx.fillStyle = 'rgba(200,180,140,.7)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Word wrap
        const maxW = Math.min(w - 40, 560);
        const words = visText.split(' ');
        let line = '', ly = textY + 10;
        const lineH = Math.min(28, w * 0.06);
        for (const word of words) {
          const test = line + word + ' ';
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line.trim(), w / 2, ly);
            line = word + ' ';
            ly += lineH;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line.trim(), w / 2, ly);

        // Cursor blink
        if (visChars < text.length && Math.floor(S.t / 500) % 2 === 0) {
          const cursorX = w / 2 + ctx.measureText(line.trim()).width / 2 + 4;
          ctx.fillStyle = sceneColor + '80';
          ctx.fillRect(cursorX, ly, 2, lineH - 4);
        }
      }

      // ═══ UI OVERLAY — progress bar + scene counter ═══
      // Progress bar
      const prog = (S.scene + Math.min(1, S.sceneT / (SCENE_DUR[S.scene] || 20000))) / TOTAL_SCENES;
      ctx.fillStyle = sceneColor + '15';
      ctx.fillRect(0, h - 3, w, 3);
      ctx.fillStyle = sceneColor;
      ctx.fillRect(0, h - 3, w * prog, 3);

      // Scene counter
      ctx.font = `${Math.min(10, w * 0.025)}px 'Georgia', serif`;
      ctx.fillStyle = sceneColor + '40';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`${S.scene + 1} / ${TOTAL_SCENES}`, 14, 14);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [initParticles, muted]);

  // ── Auto-advance timer ──
  useEffect(() => {
    const dur = SCENE_DUR[scene];
    if (dur >= 999999) return; // last scene waits for tap
    const t = setTimeout(() => advanceScene(), dur);
    return () => clearTimeout(t);
  }, [scene]);

  const advanceScene = useCallback(() => {
    if (scene >= TOTAL_SCENES - 1) {
      onComplete();
      return;
    }
    const S = stateRef.current;
    S.scene += 1;
    S.sceneT = 0;
    S.textChars = 0;
    setScene(S.scene);
    if (!muted && [0, 6, 7, 8, 11].includes(S.scene)) bell();
  }, [scene, onComplete, muted]);

  const handleTap = (e) => {
    // Don't advance if clicking skip button
    if (e.target.tagName === 'BUTTON') return;
    advanceScene();
  };

  // ═══ SCENE RENDERERS ═══

  function drawScene0_Opening(ctx, w, h, S) {
    const progress = Math.min(1, S.sceneT / 8000); // 8s to form
    const cx = w / 2, cy = h * 0.35;

    // Particles converging to center
    S.particles.forEach((p, i) => {
      const t = Math.min(1, S.sceneT / (4000 + i * 15));
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      // Current position — lerp from scattered to target
      const px = cx + p.x * (1 - ease) + p.tx * ease;
      const py = cy + p.y * (1 - ease) + p.ty * ease;

      // Twinkle
      const twinkle = 0.4 + 0.6 * Math.sin(S.t * 0.003 + p.phase);
      const alpha = p.opacity * twinkle * (0.3 + ease * 0.7);

      // Draw particle
      ctx.beginPath();
      ctx.arc(px, py, p.size * (0.5 + ease * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Glow for larger particles
      if (p.size > 2 && ease > 0.5) {
        ctx.beginPath();
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.15;
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;

    // OM symbol appears after particles converge
    if (progress > 0.5) {
      const omAlpha = Math.min(1, (progress - 0.5) * 3);
      ctx.save();
      ctx.globalAlpha = omAlpha;
      ctx.font = `bold ${Math.min(120, w * 0.25)}px serif`;
      ctx.fillStyle = '#f0d050';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#f0d050';
      ctx.shadowBlur = 40 + Math.sin(S.t * 0.003) * 20;
      ctx.fillText('ॐ', cx, cy);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Title appears after OM
    if (progress > 0.7) {
      const titleAlpha = Math.min(1, (progress - 0.7) * 4);
      ctx.save();
      ctx.globalAlpha = titleAlpha;

      // Sanskrit title
      ctx.font = `bold ${Math.min(36, w * 0.08)}px 'Georgia', serif`;
      ctx.fillStyle = '#f0d050';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#f0d050';
      ctx.shadowBlur = 20;
      ctx.fillText('मोक्ष पटम् १०८', cx, cy + Math.min(80, h * 0.12));
      ctx.shadowBlur = 0;

      // English subtitle
      ctx.font = `${Math.min(12, w * 0.025)}px 'Georgia', serif`;
      ctx.fillStyle = '#f0d05060';
      ctx.letterSpacing = '4px';
      ctx.fillText('MOKSHA PATAM 108', cx, cy + Math.min(110, h * 0.16));
      ctx.fillText('THE ANCIENT GAME OF KARMA', cx, cy + Math.min(128, h * 0.19));

      ctx.restore();
    }
  }

  function drawScene1_Board(ctx, w, h, S) {
    const cx = w / 2, boardSize = Math.min(w * 0.7, h * 0.5, 360);
    const cellSize = boardSize / 10;
    const boardX = cx - boardSize / 2, boardY = h * 0.15;

    // Board grid
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const num = (9 - r) * 10 + (r % 2 === 0 ? c + 1 : 10 - c);
        const x = boardX + c * cellSize, y = boardY + r * cellSize;

        // Realm colors — illuminate sequentially
        let alpha = 0.06;
        const realmPhase = S.sceneT / 3000; // cycle through realms
        if (num <= 33 && realmPhase > 0.5) alpha = 0.15 + 0.1 * Math.sin(S.t * 0.004); // Bhuloka amber
        if (num >= 34 && num <= 66 && realmPhase > 1.5) alpha = 0.15 + 0.1 * Math.sin(S.t * 0.004 + 1);
        if (num >= 67 && num <= 99 && realmPhase > 2.5) alpha = 0.15 + 0.1 * Math.sin(S.t * 0.004 + 2);

        const realmColor = num <= 33 ? '#8a6030' : num <= 66 ? '#5a80a0' : '#9070c0';
        ctx.fillStyle = realmColor;
        ctx.globalAlpha = alpha;
        ctx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);

        // Cell number
        ctx.globalAlpha = 0.25;
        ctx.font = `${Math.max(7, cellSize * 0.25)}px 'Georgia', serif`;
        ctx.fillStyle = '#f0d050';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(num, x + 2, y + 1);
      }
    }
    ctx.globalAlpha = 1;

    // Board border
    ctx.strokeStyle = '#f0d05030';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boardX, boardY, boardSize, boardSize);

    // Realm dividers
    ctx.strokeStyle = '#f0d05020';
    ctx.lineWidth = 1;
    [3.3, 6.6].forEach(r => {
      ctx.beginPath();
      ctx.moveTo(boardX, boardY + (r / 10) * boardSize);
      ctx.lineTo(boardX + boardSize, boardY + (r / 10) * boardSize);
      ctx.stroke();
    });

    // Realm labels — fade in with phase
    const realmPhase = S.sceneT / 3000;
    const labels = [
      { text: 'भूलोक · BHULOKA', y: boardY + boardSize * 0.83, color: '#8a6030', threshold: 0.5 },
      { text: 'अन्तर्लोक · ANTARLOKA', y: boardY + boardSize * 0.5, color: '#5a80a0', threshold: 1.5 },
      { text: 'स्वर्गलोक · SVARGALOKA', y: boardY + boardSize * 0.17, color: '#9070c0', threshold: 2.5 },
    ];
    labels.forEach(l => {
      const a = Math.min(1, Math.max(0, (realmPhase - l.threshold) * 2));
      if (a > 0) {
        ctx.globalAlpha = a * 0.6;
        ctx.font = `bold ${Math.min(14, w * 0.03)}px 'Georgia', serif`;
        ctx.fillStyle = l.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 15;
        ctx.fillText(l.text, cx, l.y);
        ctx.shadowBlur = 0;
      }
    });
    ctx.globalAlpha = 1;

    // Sacred Crown (101-108) above board
    if (realmPhase > 3.5) {
      const crownAlpha = Math.min(1, (realmPhase - 3.5) * 2);
      ctx.globalAlpha = crownAlpha;
      const crownY = boardY - cellSize * 1.5;
      ctx.fillStyle = '#f0d050';
      ctx.font = `bold ${Math.min(11, w * 0.025)}px 'Georgia', serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#f0d050';
      ctx.shadowBlur = 10 + Math.sin(S.t * 0.003) * 5;
      ctx.fillText('🪷 अष्टांग मार्ग · THE SACRED CROWN', cx, crownY);
      ctx.shadowBlur = 0;

      // 8 cells for sacred path
      for (let i = 0; i < 8; i++) {
        const sx = boardX + i * (boardSize / 8);
        ctx.strokeStyle = '#f0d05040';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx, crownY + 14, boardSize / 8 - 2, cellSize * 0.8);
        ctx.font = `${Math.max(8, cellSize * 0.3)}px 'Georgia', serif`;
        ctx.fillStyle = '#f0d05060';
        ctx.textAlign = 'center';
        ctx.fillText(101 + i, sx + boardSize / 16, crownY + 14 + cellSize * 0.45);
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawScene2_Serpent(ctx, w, h, S) {
    const cx = w / 2, boardSize = Math.min(w * 0.55, h * 0.4, 280);
    const cellSize = boardSize / 10;
    const boardX = cx - boardSize / 2, boardY = h * 0.12;

    // Draw mini board
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const num = (9 - r) * 10 + (r % 2 === 0 ? c + 1 : 10 - c);
        const x = boardX + c * cellSize, y = boardY + r * cellSize;
        ctx.fillStyle = '#f0d050';
        ctx.globalAlpha = 0.04;
        ctx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#f0d05020';
    ctx.strokeRect(boardX, boardY, boardSize, boardSize);

    // Animated snake demo
    const phase = (S.sceneT % 12000) / 12000; // 12s cycle
    const snake = SNAKES_DEMO[Math.floor(S.sceneT / 12000) % SNAKES_DEMO.length];
    const fromCell = getBoardCell(snake.from);
    const toCell = getBoardCell(snake.to);

    const fromX = boardX + fromCell.col * cellSize + cellSize / 2;
    const fromY = boardY + fromCell.row * cellSize + cellSize / 2;
    const toX = boardX + toCell.col * cellSize + cellSize / 2;
    const toY = boardY + toCell.row * cellSize + cellSize / 2;

    // Draw snake line
    ctx.beginPath();
    const cp1x = (fromX + toX) / 2 + (Math.sin(S.t * 0.002) * 30);
    const cp1y = (fromY + toY) / 2;
    ctx.moveTo(fromX, fromY);
    ctx.quadraticCurveTo(cp1x, cp1y, toX, toY);
    ctx.strokeStyle = '#e0603080';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Snake head
    ctx.beginPath();
    ctx.arc(fromX, fromY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#e06030';
    ctx.fill();

    // Token animation
    let tokenX, tokenY;
    if (phase < 0.3) {
      // Moving toward snake square
      const t = phase / 0.3;
      const startCell = getBoardCell(Math.max(1, snake.from - 4));
      const sx = boardX + startCell.col * cellSize + cellSize / 2;
      const sy = boardY + startCell.row * cellSize + cellSize / 2;
      tokenX = sx + (fromX - sx) * t;
      tokenY = sy + (fromY - sy) * t;
    } else if (phase < 0.5) {
      // Pause on snake — flash!
      tokenX = fromX;
      tokenY = fromY;

      // Red flash
      const flash = Math.sin((phase - 0.3) / 0.2 * Math.PI * 4);
      ctx.globalAlpha = Math.abs(flash) * 0.3;
      ctx.fillStyle = '#e06030';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    } else if (phase < 0.7) {
      // Falling down snake
      const t = (phase - 0.5) / 0.2;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      tokenX = fromX + (toX - fromX) * ease;
      tokenY = fromY + (toY - fromY) * ease;

      // Red trail
      for (let i = 0; i < 8; i++) {
        const tt = Math.max(0, t - i * 0.05);
        const te = tt < 0.5 ? 2 * tt * tt : 1 - Math.pow(-2 * tt + 2, 2) / 2;
        const tx = fromX + (toX - fromX) * te;
        const ty = fromY + (toY - fromY) * te;
        ctx.beginPath();
        ctx.arc(tx, ty, 4 - i * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#e06030';
        ctx.globalAlpha = 0.3 - i * 0.03;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      // Rest at bottom
      tokenX = toX;
      tokenY = toY;
    }

    // Draw token
    ctx.beginPath();
    ctx.arc(tokenX, tokenY, 8, 0, Math.PI * 2);
    const tokGrad = ctx.createRadialGradient(tokenX - 2, tokenY - 2, 0, tokenX, tokenY, 8);
    tokGrad.addColorStop(0, '#fffef0');
    tokGrad.addColorStop(1, '#f0d050');
    ctx.fillStyle = tokGrad;
    ctx.fill();
    ctx.strokeStyle = '#f0d050';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Token glow
    ctx.beginPath();
    ctx.arc(tokenX, tokenY, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#f0d05020';
    ctx.fill();

    // Snake label
    if (phase > 0.35 && phase < 0.85) {
      const labelAlpha = phase < 0.5 ? (phase - 0.35) / 0.15 : phase > 0.7 ? 1 - (phase - 0.7) / 0.15 : 1;
      ctx.globalAlpha = labelAlpha;

      // Papa indicator
      const labelY = Math.min(fromY, toY) - 30;
      ctx.font = `bold ${Math.min(20, w * 0.045)}px 'Georgia', serif`;
      ctx.fillStyle = '#e06030';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#e06030';
      ctx.shadowBlur = 15;
      ctx.fillText(`𓆙 ${snake.skt} — ${snake.en}`, cx, boardY + boardSize + 30);
      ctx.shadowBlur = 0;

      ctx.font = `${Math.min(13, w * 0.03)}px 'Georgia', serif`;
      ctx.fillStyle = '#e0603090';
      ctx.fillText(`Square ${snake.from} → ${snake.to} · +2 PAPA`, cx, boardY + boardSize + 52);

      ctx.globalAlpha = 1;
    }
  }

  function drawSceneGeneric(ctx, w, h, S) {
    const cx = w / 2, cy = h * 0.35;

    // Scene-specific icons
    const icons = {
      3: { emoji: '🪔', label: 'VIRTUE', sub: '+1 PUNYA' },
      4: { emoji: '🎲', label: 'KARMA DIE + NAVAGRAHA', sub: 'Two Dice of Destiny' },
      5: { emoji: '⚖', label: 'DHARMA DILEMMA', sub: 'Punya or Papa?' },
      6: { emoji: '🏛', label: 'KNOWLEDGE TEMPLES', sub: '9 Sacred Sciences' },
      7: { emoji: '🧘', label: 'GURU ENCOUNTERS', sub: '8 Ancient Masters' },
      8: { emoji: '🪷', label: 'SACRED CROWN', sub: 'The 8-Fold Path' },
      9: { emoji: '✨', label: 'DID YOU KNOW?', sub: 'Cosmic Knowledge' },
      10: { emoji: 'ॐ', label: 'LIBERATION', sub: 'Two Paths to Moksha' },
      11: { emoji: 'ॐ', label: 'YOUR JOURNEY', sub: 'Begins Now' },
    };

    const icon = icons[S.scene] || { emoji: '🔱', label: '', sub: '' };
    const appear = Math.min(1, S.sceneT / 1500);

    // Large emoji
    ctx.globalAlpha = appear;
    ctx.font = `${Math.min(80, w * 0.18)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const scale = 0.5 + appear * 0.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.shadowColor = (icons[S.scene]?.emoji === '🪔' ? '#f0d050' : '#f0d05060');
    ctx.shadowBlur = 30 + Math.sin(S.t * 0.003) * 15;
    ctx.fillText(icon.emoji, 0, 0);
    ctx.restore();
    ctx.shadowBlur = 0;

    // Label
    if (appear > 0.5) {
      const la = (appear - 0.5) * 2;
      ctx.globalAlpha = la;
      ctx.font = `bold ${Math.min(18, w * 0.04)}px 'Georgia', serif`;
      ctx.fillStyle = '#f0d050';
      ctx.textAlign = 'center';
      ctx.fillText(icon.label, cx, cy + Math.min(60, h * 0.1));

      ctx.font = `${Math.min(12, w * 0.025)}px 'Georgia', serif`;
      ctx.fillStyle = '#f0d05060';
      ctx.fillText(icon.sub, cx, cy + Math.min(80, h * 0.13));
    }

    // Guru portraits for scene 7
    if (S.scene === 7 && appear > 0.7) {
      const ga = (appear - 0.7) * 3.3;
      ctx.globalAlpha = Math.min(1, ga);
      const guruIds = ['aryabhata','sushruta','chanakya','panini','charaka','bhaskara','varahamihira','patanjali'];
      // Note: can't render <img> in canvas — show names instead
      const guruNames = ['आर्यभट','सुश्रुत','चाणक्य','पाणिनि','चरक','भास्कर','वराहमिहिर','पतञ्जलि'];
      const spacing = Math.min(60, w / 10);
      const startX = cx - spacing * 3.5;
      guruNames.forEach((name, i) => {
        const gx = startX + i * spacing;
        const gy = cy + Math.min(110, h * 0.17);
        ctx.beginPath();
        ctx.arc(gx, gy, Math.min(18, w * 0.035), 0, Math.PI * 2);
        ctx.fillStyle = ['#4080c0','#c04040','#c0a040','#a080c0','#40a060','#60a0c0','#6080a0','#c08060'][i] + '30';
        ctx.fill();
        ctx.strokeStyle = ['#4080c0','#c04040','#c0a040','#a080c0','#40a060','#60a0c0','#6080a0','#c08060'][i] + '60';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = `${Math.max(8, Math.min(10, w * 0.02))}px 'Georgia', serif`;
        ctx.fillStyle = '#c0b080';
        ctx.textAlign = 'center';
        ctx.fillText(name, gx, gy + Math.min(28, w * 0.05));
      });
    }

    ctx.globalAlpha = 1;

    // BEGIN button for last scene
    if (S.scene === 11 && appear > 0.8) {
      const ba = Math.min(1, (appear - 0.8) * 5);
      ctx.globalAlpha = ba * (0.7 + 0.3 * Math.sin(S.t * 0.003));
      const btnW = Math.min(260, w * 0.6), btnH = 48;
      const bx = cx - btnW / 2, by = cy + Math.min(130, h * 0.2);

      // Button glow
      ctx.shadowColor = '#f0d050';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#f0d05080';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, btnW, btnH, 8);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = `bold ${Math.min(14, w * 0.03)}px 'Georgia', serif`;
      ctx.fillStyle = '#f0d050';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BEGIN YOUR JOURNEY', cx, by + btnH / 2);
      ctx.globalAlpha = 1;
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 290 }} onClick={handleTap}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {/* Skip button (HTML overlay — always accessible) */}
      <button onClick={(e) => { e.stopPropagation(); onComplete(); }} style={{
        position: 'absolute', top: 12, right: 14, zIndex: 5,
        background: 'rgba(5,4,3,.6)', border: '1px solid rgba(240,200,80,.2)',
        color: 'rgba(240,200,80,.4)', padding: '5px 14px', fontSize: 10,
        cursor: 'pointer', borderRadius: 4, fontFamily: "'Cinzel',serif",
        letterSpacing: 2, backdropFilter: 'blur(4px)',
      }}>SKIP →</button>
    </div>
  );
}
