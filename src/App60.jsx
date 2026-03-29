import { useState } from 'react';
import LandingPage from './LandingPage.jsx';
import MokshaGame  from './tiers/moksha/MokshaGame.jsx';
import BalaGame    from './tiers/bala/BalaGame.jsx';
// import KishoreGame from './tiers/kishore/KishoreGame.jsx'; // coming soon

export default function App() {
  const [tier, setTier] = useState(null);

  if (tier === 'moksha') return <MokshaGame />;
  if (tier === 'bala')   return <BalaGame onExit={() => setTier(null)} />;

  return <LandingPage onSelectTier={setTier} />;
}
