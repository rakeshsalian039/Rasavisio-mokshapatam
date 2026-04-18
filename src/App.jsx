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

// ── Android performance optimizations ──
// Android browsers struggle with backdrop-filter, heavy drop-shadows, and
// complex compositing. Tag the root so CSS can disable these selectively.
// iOS Safari handles all of these well, so we only target Android.
if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) {
  document.documentElement.classList.add('is-android');
  // Inject global perf CSS — runs once at app load
  const perfStyle = document.createElement('style');
  perfStyle.textContent = `
    /* Kill backdrop-filter + drop-shadow everywhere on Android (GPU-expensive) */
    .is-android *,
    .is-android *::before,
    .is-android *::after {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    /* drop-shadow / blur filter is ~3-4x slower than box-shadow on Android Chrome.
       Glows from drop-shadow disappear but box/text-shadow still work. */
    .is-android * {
      filter: none !important;
    }
    /* Kill expensive INFINITE animations that paint (text-shadow/box-shadow/
       filter) or layout (height) every frame on Android. These animations
       run 24/7 on multiple elements and destroy scroll perf on flagships
       just as much as on low-end devices. iOS handles them fine. */
    .is-android [style*="yamaBreath"],
    .is-android [style*="activeGlow"],
    .is-android [style*="sacredGlow"],
    .is-android [style*="diceGlow"],
    .is-android [style*="rollPulse"],
    .is-android [style*="mp 3s"],
    .is-android [style*="waveBar"],
    .is-android [style*="cgGoldPulse"],
    .is-android [style*="ladderShine"],
    .is-android [style*="snakePulse"],
    .is-android [style*="shimmer"],
    .is-android [style*="shlokaGlow"],
    .is-android [style*="nebulaBreath"] {
      animation: none !important;
    }
    /* Promote the composited layers we DO want animated */
    .is-android { -webkit-tap-highlight-color: transparent; }
    /* Respect reduced-motion users */
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
