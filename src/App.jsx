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
    const { supabase } = await import('./auth/supabaseClient');

    // Style the status bar to match our dark theme
    try { await StatusBar.setStyle({ style: Style.Light }); } catch(e) {}
    try { await StatusBar.setBackgroundColor({ color: '#0c0a07' }); } catch(e) {}

    // Hide splash once React has rendered first screen
    setTimeout(() => { SplashScreen.hide().catch(() => {}); }, 300);

    // Hardware back button: go back through app state, minimize at root
    CapApp.addListener('backButton', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        CapApp.minimizeApp();
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
    /* Android Chrome perf overrides — MINIMAL scope.
       After board memoization + rAF-throttled resize + compressed audio,
       the heavy-hitters are gone. We only kill the two things that still
       cost a lot and aren't worth the visual: filter: drop-shadow (cheap
       alternative is box-shadow which we already use) and heavy blur on
       large animated elements. */

    /* Filter: drop-shadow is 3-4× slower than box-shadow on Android Chrome.
       Elements that need a glow still get box-shadow / text-shadow. */
    .is-android * {
      filter: none !important;
    }

    .is-android { -webkit-tap-highlight-color: transparent; }

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
  // Skip splash if returning from login or resuming session
  const [splashDone, setSplashDone] = useState(isOAuthReturn || !!savedTier);
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
