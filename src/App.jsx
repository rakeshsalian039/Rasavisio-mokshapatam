import { useState } from 'react';
import MokshaGame from './tiers/moksha/MokshaGame.jsx';
import BalaGame   from './tiers/bala/BalaGame.jsx';
// import KishoreGame from './tiers/kishore/KishoreGame.jsx'; // coming soon

export default function App() {
  const [tier, setTier] = useState(null);

  if (tier === 'moksha') return <MokshaGame />;
  if (tier === 'bala')   return <BalaGame onExit={() => setTier(null)} />;

  return (
    <div style={{
      minHeight:'100vh', background:'#0c0a07',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:20,
    }}>
      <div style={{fontSize:24, color:'#f0d050', fontFamily:"'Yatra One',serif", letterSpacing:4}}>
        मोक्ष पटम्
      </div>
      <div style={{fontSize:11, color:'rgba(200,160,60,.4)', letterSpacing:4, fontFamily:"'Cinzel',serif", marginBottom:8}}>
        CHOOSE YOUR PATH
      </div>
      {[
        { id:'bala',    label:'🌸 Bala Marg',   sub:'Ages 5–10',  ready:true  },
        { id:'kishore', label:'⚡ Kishore Marg', sub:'Ages 10–20', ready:false },
        { id:'moksha',  label:'ॐ Moksha Marg',  sub:'Ages 20+',   ready:true  },
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
