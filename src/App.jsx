import { useState } from 'react';
import LandingPage from './LandingPage.jsx';
import MokshaGame  from './tiers/moksha/MokshaGame.jsx';
import BalaGame    from './tiers/bala/BalaGame.jsx';
import AppSplash   from './components/AppSplash.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
// import KishoreGame from './tiers/kishore/KishoreGame.jsx'; // coming soon

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [tier, setTier] = useState(null);

  if (!splashDone) return <AppSplash onDone={() => setSplashDone(true)} />;

  if (tier === 'moksha') return (
    <ErrorBoundary onReset={() => setTier(null)}>
      <MokshaGame />
    </ErrorBoundary>
  );
  if (tier === 'bala') return (
    <ErrorBoundary onReset={() => setTier(null)}>
      <BalaGame onExit={() => setTier(null)} />
    </ErrorBoundary>
  );

  return <LandingPage onSelectTier={setTier} />;
}
