// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Router only
//
// Picks which game tier to load based on user selection.
// All actual game logic lives in:
//   tiers/moksha/MokshaGame.jsx   (Moksha Marg — adults 20+)
//   tiers/kishore/KishoreGame.jsx (Kishore Marg — ages 10-20)  [coming soon]
//   tiers/bala/BalaGame.jsx       (Bala Marg — ages 5-10)      [coming soon]
//
// Shared utilities:
//   shared/constants.js  — all game data
//   shared/audio.js      — VoiceEngine, AudioCache, CG voices
//   shared/useAuth.js    — Supabase auth
//   shared/useAmbient.js — background music
//   shared/useSound.js   — sound effects
//   shared/utils.js      — sqP(), rlm() helpers
//   shared/styles.js     — global CSS
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import MokshaGame from './tiers/moksha/MokshaGame.jsx';
import BalaGame   from './tiers/bala/BalaGame.jsx';

// import KishoreGame from './tiers/kishore/KishoreGame.jsx'; // coming soon

export default function App() {
  const [tier, setTier] = useState(null); // null = show selector

  if (tier === 'moksha')  return <MokshaGame />;
  if (tier === 'bala')    return <BalaGame onExit={() => setTier(null)} />;

  return (
    <div style={{
      minHeight:'100vh', background:'#0c0a07',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:20,
    }}>
      <div style={{fontSize:24, color:'#f0d050', fontFamily:"'Yatra One',serif", letterSpacing:4}}>
        मोक्ष पटम्
      </div>
      <div style={{fontSize:11, color:'rgba(200,160,60,.4)', letterSpacing:4, fontFamily:"'Cinzel',serif"}}>
        CHOOSE YOUR PATH
      </div>
      {[
        { id:'bala',    label:'🌸 Bala Marg',    sub:'Ages 5–10',  ready:true  },
        { id:'kishore', label:'⚡ Kishore Marg',  sub:'Ages 10–20', ready:false },
        { id:'moksha',  label:'ॐ Moksha Marg',   sub:'Ages 20+',   ready:true  },
      ].map(t=>(
        <button key={t.id} onClick={()=>t.ready&&setTier(t.id)} style={{
          background:'transparent',
          border:`1px solid ${t.ready?'rgba(200,160,60,.35)':'rgba(200,160,60,.15)'}`,
          color:t.ready?'#e8c850':'rgba(200,160,60,.35)',
          padding:'12px 40px', fontSize:14, cursor:t.ready?'pointer':'default',
          fontFamily:"'Cinzel',serif", letterSpacing:3, borderRadius:3,
          minWidth:240, display:'flex', justifyContent:'space-between', alignItems:'center',
          transition:'all .2s',
        }}>
          <span>{t.label}</span>
          <span style={{fontSize:10, opacity:.5}}>{t.ready?t.sub:'Coming soon'}</span>
        </button>
      ))}
    </div>
  );
}

  // Tier selector — shown when other tiers are available
  return (
    <div style={{
      minHeight:'100vh', background:'#0c0a07',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:20,
    }}>
      <div style={{fontSize:24, color:'#f0d050', fontFamily:"'Yatra One',serif", letterSpacing:4}}>
        मोक्ष पटम्
      </div>
      <div style={{fontSize:11, color:'rgba(200,160,60,.4)', letterSpacing:4, fontFamily:"'Cinzel',serif"}}>
        CHOOSE YOUR PATH
      </div>
      {[
        { id:'bala',    label:'🌸 Bala Marg',    sub:'Ages 5–10',  soon:true  },
        { id:'kishore', label:'⚡ Kishore Marg',  sub:'Ages 10–20', soon:true  },
        { id:'moksha',  label:'ॐ Moksha Marg',   sub:'Ages 20+',   soon:false },
      ].map(t=>(
        <button key={t.id} onClick={()=>!t.soon&&setTier(t.id)} style={{
          background:'transparent',
          border:`1px solid ${t.soon?'rgba(200,160,60,.15)':'rgba(200,160,60,.35)'}`,
          color:t.soon?'rgba(200,160,60,.35)':'#e8c850',
          padding:'12px 40px', fontSize:14, cursor:t.soon?'default':'pointer',
          fontFamily:"'Cinzel',serif", letterSpacing:3, borderRadius:3,
          minWidth:240, display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span>{t.label}</span>
          <span style={{fontSize:10, opacity:.5}}>{t.soon?'Coming soon':t.sub}</span>
        </button>
      ))}
    </div>
  );
}
