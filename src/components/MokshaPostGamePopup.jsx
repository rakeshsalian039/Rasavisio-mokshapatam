import { useState } from 'react';

// ══════════════════════════════════════════════════════════════════════
// ── PostGame Popup — Donate + Feedback (shown after Moksha ceremony) ─────────
const _SB_URL = process.env.REACT_APP_SUPABASE_URL || '';
const _SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
async function _saveFeedback(msg, email, type='moksha-post-game') {
  if (_SB_URL && _SB_KEY) {
    try {
      const r = await fetch(`${_SB_URL}/rest/v1/feedback`, {
        method:'POST',
        headers:{'apikey':_SB_KEY,'Authorization':`Bearer ${_SB_KEY}`,'Content-Type':'application/json','Prefer':'return=minimal'},
        body:JSON.stringify({message:msg,email:email||null,type,source:'moksha'}),
      });
      if(r.ok||r.status===201) return true;
    } catch {}
  }
  const s=encodeURIComponent('Moksha Patam 108 — Feedback');
  const b=encodeURIComponent(`Message:\n${msg}\n\nFrom: ${email||'Anonymous'}`);
  window.open(`mailto:rakesh@rasavisio.com?subject=${s}&body=${b}`);
  return true;
}

export default function MokshaPostGamePopup({ onClose, onNewJourney }) {
  const [tab,     setTab]     = useState('donate');
  const [msg,     setMsg]     = useState('');
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if(!msg.trim()) return;
    setSending(true);
    await _saveFeedback(msg, email);
    setSending(false); setSent(true);
    setMsg(''); setEmail('');
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:600,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16,
      animation:'fadeIn .4s ease'}}>
      <div style={{
        background:'linear-gradient(180deg,#1e1810,#0c0a07)',
        border:'1px solid rgba(240,208,80,.25)',borderRadius:8,
        maxWidth:460,width:'100%',
        boxShadow:'0 0 80px rgba(240,208,80,.08),0 0 200px rgba(0,0,0,.8)',
        overflow:'hidden',maxHeight:'90vh',overflowY:'auto',
      }}>
        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid rgba(240,208,80,.1)'}}>
          {[['donate','🪔 Support'],['feedback','✍️ Feedback']].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1,padding:'14px 10px',background:'transparent',border:'none',
              fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,
              color:tab===t?'#f0d050':'rgba(200,180,100,.3)',
              borderBottom:`2px solid ${tab===t?'#f0d050':'transparent'}`,
              cursor:'pointer',transition:'all .25s',textTransform:'uppercase',
            }}>{l}</button>
          ))}
          <button onClick={onClose} style={{padding:'14px 18px',background:'transparent',
            border:'none',color:'rgba(200,180,100,.25)',cursor:'pointer',fontSize:16,
            transition:'color .2s'}}
            onMouseEnter={e=>e.target.style.color='rgba(200,180,100,.7)'}
            onMouseLeave={e=>e.target.style.color='rgba(200,180,100,.25)'}>
            ✕
          </button>
        </div>

        {/* Donate */}
        {tab==='donate'&&(
          <div style={{padding:'28px 28px 32px',textAlign:'center'}}>
            <div style={{fontSize:42,marginBottom:12,
              filter:'drop-shadow(0 0 20px rgba(240,208,80,.4))',
              animation:'mp 3s ease infinite'}}>🪔</div>
            <div style={{fontFamily:"'Yatra One',serif",fontSize:22,color:'#f0d050',
              marginBottom:8,letterSpacing:2,
              textShadow:'0 0 20px rgba(240,208,80,.3)'}}>
              Keep the Light Burning
            </div>
            <p style={{fontFamily:"'Noto Serif Devanagari',serif",fontSize:14,
              color:'rgba(200,180,100,.65)',lineHeight:2,marginBottom:24}}>
              Moksha Patam 108 is free and will remain free.
              If this game touched your soul — a small offering keeps it alive.
            </p>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:20,flexWrap:'wrap'}}>
              {[['₹108','Sacred'],['₹500','Generous'],['₹1,000','Patron']].map(([a,l])=>(
                <div key={a} style={{padding:'10px 16px',
                  border:'1px solid rgba(240,208,80,.2)',
                  background:'rgba(240,208,80,.04)',minWidth:90}}>
                  <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,
                    color:'#f0d050',textShadow:'0 0 10px rgba(240,208,80,.3)'}}>{a}</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:8,
                    letterSpacing:2,color:'rgba(240,208,80,.45)',
                    textTransform:'uppercase',marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:'inline-block',background:'white',padding:14,
              borderRadius:4,border:'1px solid rgba(240,208,80,.3)',
              boxShadow:'0 0 24px rgba(240,208,80,.1)'}}>
              <img src="/upi-qr.png" alt="UPI QR"
                style={{width:160,height:160,display:'block'}}/>
            </div>
            <div style={{marginTop:10,fontFamily:"'Cinzel',serif",fontSize:9,
              letterSpacing:4,color:'rgba(200,180,100,.35)',textTransform:'uppercase'}}>
              GPay · PhonePe · Paytm · any UPI
            </div>
            <div style={{marginTop:14,fontFamily:"'Noto Serif Devanagari',serif",
              fontSize:12,color:'rgba(200,180,100,.3)'}}>
              Outside India?{' '}
              <a href="https://ko-fi.com/rasavisio" target="_blank" rel="noreferrer"
                style={{color:'#e07820',textDecoration:'none',
                  borderBottom:'1px solid rgba(224,120,32,.3)'}}>
                Ko-fi →
              </a>
            </div>
            <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid rgba(240,208,80,.08)'}}>
              <button onClick={onNewJourney} style={{
                background:'transparent',border:'1px solid rgba(240,208,80,.25)',
                color:'rgba(240,208,80,.6)',padding:'9px 24px',
                fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,
                cursor:'pointer',transition:'all .3s',textTransform:'uppercase',
              }}
              onMouseEnter={e=>{e.target.style.borderColor='rgba(240,208,80,.5)';e.target.style.color='#f0d050'}}
              onMouseLeave={e=>{e.target.style.borderColor='rgba(240,208,80,.25)';e.target.style.color='rgba(240,208,80,.6)'}}>
                नया जन्म · New Journey →
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {tab==='feedback'&&(
          <div style={{padding:'28px 28px 32px'}}>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{fontSize:36,marginBottom:10}}>✍️</div>
              <div style={{fontFamily:"'Yatra One',serif",fontSize:18,
                color:'#f0d050',marginBottom:6,letterSpacing:2}}>Tell Chitragupta</div>
              <p style={{fontFamily:"'Noto Serif Devanagari',serif",fontSize:13,
                color:'rgba(200,180,100,.5)',lineHeight:1.9}}>
                Chitragupta records all. Your words will reach Rakesh.
              </p>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14,justifyContent:'center'}}>
              {['🐛 Found a bug','⭐ Loved it!','💡 Suggestion','📜 Story idea'].map(s=>(
                <button key={s} onClick={()=>setMsg(s+' — ')} style={{
                  fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,
                  padding:'5px 10px',background:'rgba(240,208,80,.06)',
                  border:'1px solid rgba(240,208,80,.15)',color:'rgba(240,208,80,.55)',
                  borderRadius:20,cursor:'pointer',transition:'all .2s',
                }}
                onMouseEnter={e=>{e.target.style.background='rgba(240,208,80,.12)';e.target.style.color='#f0d050'}}
                onMouseLeave={e=>{e.target.style.background='rgba(240,208,80,.06)';e.target.style.color='rgba(240,208,80,.55)'}}>
                  {s}
                </button>
              ))}
            </div>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)}
              placeholder="What's on your mind, seeker..."
              style={{width:'100%',background:'rgba(12,10,7,.8)',
                border:'1px solid rgba(240,208,80,.15)',
                color:'rgba(200,180,100,.85)',padding:'12px 14px',
                fontFamily:"'Noto Serif Devanagari',serif",fontSize:14,
                lineHeight:1.8,resize:'vertical',minHeight:100,outline:'none',
                borderRadius:4,transition:'border-color .3s',marginBottom:10}}
              onFocus={e=>e.target.style.borderColor='rgba(240,208,80,.4)'}
              onBlur={e=>e.target.style.borderColor='rgba(240,208,80,.15)'}/>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Email (optional — if you'd like a reply)"
              style={{width:'100%',background:'rgba(12,10,7,.8)',
                border:'1px solid rgba(240,208,80,.15)',
                color:'rgba(200,180,100,.8)',padding:'10px 14px',
                fontFamily:"'Noto Serif Devanagari',serif",fontSize:13,
                outline:'none',borderRadius:4,marginBottom:14,transition:'border-color .3s'}}
              onFocus={e=>e.target.style.borderColor='rgba(240,208,80,.4)'}
              onBlur={e=>e.target.style.borderColor='rgba(240,208,80,.15)'}/>
            <div style={{textAlign:'center'}}>
              {sent
                ? <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,
                    color:'#80c080',padding:'10px 0'}}>
                    ✦ Received. Chitragupta has recorded it.
                  </div>
                : <button onClick={send} disabled={sending||!msg.trim()} style={{
                    fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:4,
                    padding:'11px 28px',border:'1px solid rgba(240,208,80,.3)',
                    color:'#f0d050',cursor:msg.trim()?'pointer':'default',
                    background:'rgba(240,208,80,.06)',transition:'all .3s',
                    textTransform:'uppercase',opacity:msg.trim()?1:.35}}>
                    {sending?'Recording...':'Send ✦'}
                  </button>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
