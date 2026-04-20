import { useState, useEffect } from 'react';
import LandingPage from './LandingPage.jsx';
import MokshaGame  from './tiers/moksha/MokshaGame.jsx';
import BalaGame    from './tiers/bala/BalaGame.jsx';
import AppSplash   from './components/AppSplash.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
// import KishoreGame from './tiers/kishore/KishoreGame.jsx'; // coming soon

// Check if returning from OAuth redirect or has a saved session
const isOAuthReturn = window.location.hash.includes('access_token');
const savedTier = localStorage.getItem('mp108_lastTier');

// Detect Capacitor native runtime as early as possible (synchronously)
const IS_CAPACITOR = typeof window !== 'undefined'
  && window.Capacitor?.isNativePlatform?.() === true;

// ─── Native platform integrations (Capacitor) ───────────────────────────────
// These imports are tree-shaken out on web builds because Capacitor.isNativePlatform()
// returns false and plugins aren't called.
const isNative = typeof window !== 'undefined'
  && (window.Capacitor?.isNativePlatform?.() === true);

async function initNativeBridges() {
  if (!isNative) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    const { App: CapApp } = await import('@capacitor/app');
    const { Browser } = await import('@capacitor/browser');
    const { ScreenOrientation } = await import('@capacitor/screen-orientation');
    const { supabase } = await import('./auth/supabaseClient');

    // Style the status bar to match our dark theme
    try { await StatusBar.setStyle({ style: Style.Light }); } catch(e) {}
    try { await StatusBar.setBackgroundColor({ color: '#0c0a07' }); } catch(e) {}
    // Android 15+ forces edge-to-edge so the WebView draws under the status
    // bar. CSS env(safe-area-inset-*) on #root pushes content in.
    try { await StatusBar.setOverlaysWebView({ overlay: true }); } catch(e) {}

    // ═══ Lock orientation to portrait ═══
    // Game UI is designed portrait-only. Accidental rotation mid-game
    // was causing layout breakage and bad UX (board stretched wide).
    try { await ScreenOrientation.lock({ orientation: 'portrait' }); } catch(e) {}

    // ═══ Keep screen awake during gameplay ═══
    // Long voice narrations (Yama monologue, temple lore, shlokas) can
    // run 15-30s without user interaction. Without this the screen dims
    // / sleeps mid-narration. Uses the standard Web Wake Lock API which
    // Android WebView supports — no extra native plugin needed.
    let wakeLock = null;
    window.__mpAcquireWake = async () => {
      if (wakeLock || !('wakeLock' in navigator)) return;
      try { wakeLock = await navigator.wakeLock.request('screen'); } catch(e) {}
    };
    window.__mpReleaseWake = () => {
      if (wakeLock) { try { wakeLock.release(); } catch(e) {} wakeLock = null; }
    };
    // Re-acquire if lost (e.g. when returning from background)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !wakeLock) {
        window.__mpAcquireWake?.();
      }
    });
    // Acquire immediately — game screens request it; non-game flows
    // don't mind extra minutes of screen-on time for now.
    window.__mpAcquireWake();

    // Hide Capacitor native splash on next animation frame (React has rendered by then).
    requestAnimationFrame(() => {
      SplashScreen.hide({ fadeOutDuration: 150 }).catch(() => {});
    });

    // ═══ Smart hardware back button ═══
    // Priority order, highest first:
    //   1. If an in-app popup is open → close it (fire an escape event
    //      that popups listen for) instead of unwinding history.
    //   2. If in the game proper → confirm before exiting.
    //   3. If at title screen → minimize app (normal Android behavior).
    // The haptic tap confirms the press was received (vs. silent ignore).
    CapApp.addListener('backButton', async () => {
      try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      } catch(e) {}
      // Let components that listen intercept first (e.g. close a popup)
      const handled = window.dispatchEvent(new CustomEvent('mp-back-pressed', { cancelable: true }));
      // If no listener called preventDefault, fall through to history/minimize
      if (handled) {
        if (window.history.length > 1) window.history.back();
        else CapApp.minimizeApp();
      }
    });

    // Pause/resume ambient audio when app moves to background
    CapApp.addListener('appStateChange', ({ isActive }) => {
      try {
        const ambientEl = document.querySelector('audio[src*="ambient"]');
        if (ambientEl) {
          if (isActive) ambientEl.play?.().catch(() => {});
          else ambientEl.pause?.();
        }
      } catch(e) {}
    });

    // ─── OAuth deep-link handler ──────────────────────────────────
    // When Google sign-in completes, the system redirects back to
    // com.rasavisio.mokshapatam://auth/callback#access_token=…
    // Android routes this to us via the intent-filter in AndroidManifest.
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      console.log('[Native] appUrlOpen:', url);
      if (!url || !url.startsWith('com.rasavisio.mokshapatam://')) return;

      // Close the in-app browser tab
      try { await Browser.close(); } catch(e) {}

      // Parse tokens. Supabase returns them in the URL fragment (#...)
      const hashIdx = url.indexOf('#');
      if (hashIdx < 0) return;
      const hashParams = new URLSearchParams(url.substring(hashIdx + 1));
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');

      if (access_token && refresh_token) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token, refresh_token,
          });
          if (error) console.error('[Native OAuth] setSession error:', error);
          else console.log('[Native OAuth] Session restored from deep link ✓');
        } catch (e) {
          console.error('[Native OAuth] Exception:', e);
        }
      } else {
        // PKCE flow: ?code=...
        const code = new URL(url.replace('com.rasavisio.mokshapatam://', 'https://dummy/')).searchParams.get('code');
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
            console.log('[Native OAuth] PKCE session restored ✓');
          } catch (e) { console.error('[Native OAuth PKCE] Exception:', e); }
        }
      }
    });
  } catch (e) {
    console.warn('Capacitor bridge init failed:', e.message);
  }
}
initNativeBridges();

// ── Android performance optimizations ──
// Android browsers struggle with backdrop-filter, heavy drop-shadows, and
// complex compositing. Tag the root so CSS can disable these selectively.
// iOS Safari handles all of these well, so we only target Android.
if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) {
  document.documentElement.classList.add('is-android');
  // Inject global perf CSS — runs once at app load
  const perfStyle = document.createElement('style');
  perfStyle.textContent = `
    /* Android Chrome perf overrides.
       Perf audit found continuous text-shadow + box-shadow + SVG stroke
       animations running 20+ simultaneously on game screen. These trigger
       paint every frame which Android WebView handles 3-4× slower than iOS.

       Strategy: redefine expensive paint-triggering @keyframes as no-ops
       (keyframes are global, but the game only runs in .is-android so these
       override the originals by being defined AFTER). Transform/opacity
       animations (pulse, cymaticRotate, grahaOrbit, templeFloat) kept —
       they're GPU-composited and cheap. */

    /* Filter: drop-shadow is 3-4× slower than box-shadow. */
    .is-android * {
      filter: none !important;
    }
    /* Backdrop-filter: blur() — restored on Android so popup backgrounds
       (temple, sacred path, graha, dharma, etc.) match the web look.
       It was previously stripped for perf, but the popup-mount lag that
       motivated that override was fixed upstream by other changes (the
       boardSquares memo deps trim, SacredBackdrop memoization, and the
       showResume localStorage move). With those in place the compositor
       has enough headroom to handle blur on popup open.
       If a specific popup feels laggy on low-end Android, disable blur
       just on THAT component's style rather than globally. */
    .is-android { -webkit-tap-highlight-color: transparent; }

    /* Kill expensive INFINITE paint-triggering animations.
       These are animations that change text-shadow / box-shadow / filter /
       height on visible elements. On Android these saturate the compositor
       and cause continuous jank even when idle. */
    @keyframes mp { from, to { text-shadow: 0 0 15px rgba(240,200,80,.3); } }
    @keyframes activeGlow { from, to { box-shadow: 0 0 8px var(--pc), 0 0 16px var(--pc); } }
    @keyframes sacredGlow { from, to { box-shadow: 0 0 4px rgba(240,200,80,.05); } }
    @keyframes diceGlow { from, to { box-shadow: 0 0 20px rgba(240,200,80,.2); } }
    @keyframes rollPulse { from, to { box-shadow: 0 0 8px rgba(240,200,80,.2), inset 0 0 8px rgba(240,200,80,.05); } }
    @keyframes yamaBreath { from, to { text-shadow: 0 0 20px #a04040, 0 0 40px #a04040; } }
    @keyframes cymaticPulse { from, to { transform: scale(1); opacity: 0.14; } }
    @keyframes cgGoldPulse { from, to { filter: brightness(1); } }
    @keyframes ladderShine { from, to { opacity: 0.55; } }
    @keyframes snakePulse { from, to { stroke-width: 1.2; opacity: 0.45; } }
    @keyframes nebulaBreath { from, to { opacity: 0.2; } }
    @keyframes shimmer { from, to { transform: translateX(0); } }
    @keyframes shlokaGlow { from, to { text-shadow: 0 0 25px rgba(240,200,80,.25); } }
    @keyframes waveBar { from, to { height: 14px; } }

    /* Pulse: used by 20+ icons across landing + pickcount + popups
       (see LandingPage.jsx, MokshaGame.jsx, Chitragupta, SacredPath…).
       Even though pulse is opacity-only (GPU-cheap) having 10+ running
       concurrently was the source of the 4-second dropped-frame window
       after clicking "Play Solo" in DevTools trace. Freezing pulse on
       Android recovers ~60 frames of budget across transitions. */
    @keyframes pulse { 0%, 50%, 100% { opacity: 1; transform: none; } }

    /* Pawn aura pulse: kept on Android (GPU-composited scale+opacity,
       only runs on the active player — max 1 at a time). If this ever
       shows up in traces, override here as no-op. pawnShadowBreath
       also kept — same reasoning, only nP pawns animate and transforms
       are free on the compositor. templeFloat already kept above. */

    /* ── Board-specific paint reduction ──
       The 108 squares each have static box-shadow on temple squares.
       Even static shadows require per-element paint work every scroll/repaint.
       Strip them on Android — glow/depth still comes from gradients + borders. */
    .is-android [style*="aspect-ratio"] {
      box-shadow: none !important;
    }

    @media (prefers-reduced-motion: reduce) {
      .is-android *, .is-android *::before, .is-android *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(perfStyle);
}

export default function App() {
  // Skip the heavy React splash animation on:
  //   - OAuth redirect return (quicker resume)
  //   - Returning user with savedTier
  //   - Native Capacitor builds (Android/iOS) — native splash already handles launch;
  //     showing a 3-second React splash with 12 particle animations on top causes
  //     the flickerish double-splash the user reported.
  const [splashDone, setSplashDone] = useState(isOAuthReturn || !!savedTier || IS_CAPACITOR);
  const [tier, setTier] = useState(isOAuthReturn && savedTier ? savedTier : null);

  // Save tier choice to localStorage
  const handleSetTier = (t) => {
    setTier(t);
    if (t) localStorage.setItem('mp108_lastTier', t);
  };

  // Clear saved tier when user exits to landing
  const handleExit = () => {
    setTier(null);
    localStorage.removeItem('mp108_lastTier');
  };

  if (!splashDone) return <AppSplash onDone={() => setSplashDone(true)} />;

  if (tier === 'moksha') return (
    <ErrorBoundary onReset={handleExit}>
      <MokshaGame />
    </ErrorBoundary>
  );
  if (tier === 'bala') return (
    <ErrorBoundary onReset={handleExit}>
      <BalaGame onExit={handleExit} />
    </ErrorBoundary>
  );

  return <LandingPage onSelectTier={handleSetTier} />;
}
