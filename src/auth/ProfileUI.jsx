// ═══ MOKSHA PATAM 108 — Profile Dashboard + Auth ═══
//
// A beautiful player profile with game history, stats, and leaderboard.
// Uses Supabase for auth (Google + Apple) and database.
//
// INTEGRATION: Import this in App.jsx and render it:
//   import { ProfileDashboard, AuthButtons, UserBadge } from "./auth/ProfileUI";
//   const auth = useAuth();
//   <UserBadge user={auth.user} profile={auth.profile} onClick={()=>setShowProfile(true)} />
//   <ProfileDashboard auth={auth} onClose={()=>setShowProfile(false)} />

import React, { useState, useEffect } from "react";
import { GameDB } from "./useAuth";

// ═══ SIGN-IN BUTTONS (Google + Apple) ═══
export function AuthButtons({ signInGoogle, signInApple, loading }) {
  if (loading) return <div style={{textAlign:"center",padding:20,color:"#c0b080",fontSize:12,opacity:.5}}>Connecting to the cosmos...</div>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center",padding:"8px 0"}}>
      <button onClick={signInGoogle} style={{
        display:"flex",alignItems:"center",gap:10,padding:"10px 24px",
        background:"rgba(255,255,255,.06)",border:"1px solid rgba(200,160,60,.2)",
        borderRadius:6,cursor:"pointer",color:"#e8c850",fontSize:13,
        fontFamily:"'Cinzel',serif",letterSpacing:1,transition:"all .2s",width:260,justifyContent:"center"
      }}>
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Continue with Google
      </button>
      <button onClick={signInApple} style={{
        display:"flex",alignItems:"center",gap:10,padding:"10px 24px",
        background:"rgba(255,255,255,.06)",border:"1px solid rgba(200,160,60,.2)",
        borderRadius:6,cursor:"pointer",color:"#e8c850",fontSize:13,
        fontFamily:"'Cinzel',serif",letterSpacing:1,transition:"all .2s",width:260,justifyContent:"center"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#e8c850"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
        Continue with Apple
      </button>
      <div style={{fontSize:10,opacity:.25,marginTop:4,letterSpacing:2}}>SIGN IN TO SAVE YOUR KARMA</div>
    </div>
  );
}

// ═══ USER BADGE (shows in game header) ═══
export function UserBadge({ user, profile, onClick }) {
  if (!user) return null;
  const name = profile?.display_name || user.email?.split("@")[0] || "Seeker";
  const avatar = profile?.avatar_url;
  const karma = (profile?.total_punya_earned || 0) - (profile?.total_papa_earned || 0);
  return (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:8,padding:"4px 12px 4px 4px",
      background:"rgba(240,200,80,.06)",border:"1px solid rgba(200,160,60,.15)",
      borderRadius:20,cursor:"pointer",color:"#e8c850",fontSize:11,
      fontFamily:"'Cinzel',serif",transition:"all .2s"
    }}>
      {avatar ? (
        <img src={avatar} alt="" style={{width:24,height:24,borderRadius:"50%",border:"1px solid rgba(240,200,80,.3)"}} referrerPolicy="no-referrer"/>
      ) : (
        <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(240,200,80,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,border:"1px solid rgba(240,200,80,.2)"}}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span style={{maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</span>
      {profile?.total_games > 0 && (
        <span style={{fontSize:9,padding:"2px 6px",background:karma>=0?"rgba(100,200,100,.15)":"rgba(200,80,60,.15)",borderRadius:8,color:karma>=0?"#80c080":"#e08060"}}>
          {karma >= 0 ? "+" : ""}{karma} karma
        </span>
      )}
    </button>
  );
}

// ═══ PROFILE DASHBOARD (full-screen overlay) ═══
export function ProfileDashboard({ auth, onClose, onSignOut }) {
  const { user, profile, signInGoogle, signInApple, signOut, loading } = auth;
  const [tab, setTab] = useState("overview");
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => {
    if (user && tab === "history") {
      setHistLoading(true);
      GameDB.getHistory(user.id).then(d => { setHistory(d); setHistLoading(false); });
    }
    if (tab === "leaderboard") {
      GameDB.getLeaderboard().then(d => setLeaderboard(d));
    }
  }, [user, tab]);

  const S = {
    overlay: {position:"fixed",inset:0,background:"rgba(6,5,3,.97)",zIndex:400,overflowY:"auto",animation:"fadeIn .3s ease"},
    container: {maxWidth:600,margin:"0 auto",padding:"clamp(16px,4vw,32px)"},
    close: {position:"fixed",top:16,right:16,background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"6px 16px",fontSize:11,cursor:"pointer",borderRadius:3,zIndex:401,fontFamily:"'Cinzel',serif"},
    heading: {fontSize:"clamp(22px,5vw,32px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:"0 0 4px",textAlign:"center"},
    subhead: {fontSize:11,color:"#8a7a50",letterSpacing:4,textAlign:"center",marginBottom:24},
    card: {background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.1)",borderRadius:8,padding:16,marginBottom:12},
    statGrid: {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:16},
    stat: {background:"rgba(240,200,80,.04)",border:"1px solid rgba(200,160,60,.08)",borderRadius:6,padding:"12px 10px",textAlign:"center"},
    statVal: {fontSize:22,fontWeight:700,color:"#f0d050",fontFamily:"'Cinzel',serif"},
    statLabel: {fontSize:10,color:"#8a7a50",letterSpacing:1,marginTop:4},
    tabs: {display:"flex",gap:6,marginBottom:20,justifyContent:"center",flexWrap:"wrap"},
    tab: (active) => ({padding:"6px 16px",fontSize:11,borderRadius:20,cursor:"pointer",border:`1px solid ${active?"rgba(240,200,80,.4)":"rgba(200,160,60,.15)"}`,background:active?"rgba(240,200,80,.1)":"transparent",color:active?"#f0d050":"#8a7a50",fontFamily:"'Cinzel',serif",letterSpacing:1,transition:"all .2s"}),
    row: {display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(200,160,60,.06)",fontSize:12},
    rowLabel: {color:"#8a7a50"},
    rowVal: {color:"#e8c850",fontWeight:600},
    empty: {textAlign:"center",padding:40,color:"#5a4a30",fontSize:12,fontStyle:"italic"},
  };

  // ═══ NOT SIGNED IN ═══
  if (!user) return (
    <div style={S.overlay}>
      <button onClick={onClose} style={S.close}>✕ Close</button>
      <div style={S.container}>
        <div style={{textAlign:"center",marginTop:"15vh"}}>
          <div style={{fontSize:48,marginBottom:16}}>🪷</div>
          <h2 style={{...S.heading,fontSize:"clamp(24px,6vw,38px)"}}>Your Karma Awaits</h2>
          <p style={{color:"#8a7a50",fontSize:13,lineHeight:1.8,marginBottom:30,maxWidth:400,margin:"0 auto 30px"}}>
            Sign in to save your journey across lifetimes. Track your Punya and Papa, climb the sacred leaderboard, and carry your karma from game to game.
          </p>
          <AuthButtons signInGoogle={signInGoogle} signInApple={signInApple} loading={loading} />
          <div style={{marginTop:40,padding:20,background:"rgba(200,160,60,.04)",borderRadius:8,border:"1px solid rgba(200,160,60,.06)"}}>
            <div style={{fontSize:11,color:"#8a7a50",letterSpacing:2,marginBottom:12}}>WHY SIGN IN?</div>
            {[
              ["🔱","Game history saved across sessions"],
              ["📊","Track Punya, Papa, and karma score"],
              ["🏆","Compete on the global leaderboard"],
              ["🪷","See your Ashtanga riddle accuracy"],
              ["🔄","Continue where you left off"],
            ].map(([icon,text],i) => (
              <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 0",fontSize:12,color:"#c0b080"}}>
                <span style={{fontSize:16}}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ═══ SIGNED IN — DASHBOARD ═══
  const p = profile || {};
  const karmaScore = (p.total_punya_earned || 0) - (p.total_papa_earned || 0);
  const winRate = p.total_games > 0 ? Math.round((p.total_wins / p.total_games) * 100) : 0;
  const riddleAcc = (p.total_riddles_correct + p.total_riddles_wrong) > 0
    ? Math.round((p.total_riddles_correct / (p.total_riddles_correct + p.total_riddles_wrong)) * 100) : 0;

  return (
    <div style={S.overlay}>
      <button onClick={onClose} style={S.close}>✕ Close</button>
      <div style={S.container}>
        {/* ═══ PROFILE HEADER ═══ */}
        <div style={{textAlign:"center",marginBottom:24}}>
          {p.avatar_url ? (
            <img src={p.avatar_url} alt="" referrerPolicy="no-referrer" style={{width:72,height:72,borderRadius:"50%",border:"2px solid rgba(240,200,80,.3)",boxShadow:"0 0 30px rgba(240,200,80,.1)",marginBottom:12}}/>
          ) : (
            <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,rgba(240,200,80,.2),rgba(200,160,60,.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"#f0d050",border:"2px solid rgba(240,200,80,.2)",margin:"0 auto 12px",fontFamily:"'Yatra One',serif"}}>
              {(p.display_name || "S").charAt(0)}
            </div>
          )}
          <h2 style={S.heading}>{p.display_name || "Seeker"}</h2>
          <div style={S.subhead}>{p.email}</div>
          <div style={{display:"inline-flex",gap:8,alignItems:"center",padding:"4px 16px",background:karmaScore>=0?"rgba(100,200,100,.08)":"rgba(200,80,60,.08)",border:`1px solid ${karmaScore>=0?"rgba(100,200,100,.15)":"rgba(200,80,60,.15)"}`,borderRadius:20,fontSize:13,color:karmaScore>=0?"#80c080":"#e08060",fontFamily:"'Cinzel',serif"}}>
            {karmaScore >= 0 ? "☀" : "🌑"} Karma Score: {karmaScore >= 0 ? "+" : ""}{karmaScore}
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div style={S.tabs}>
          {[["overview","🔱 Overview"],["history","📜 History"],["leaderboard","🏆 Leaderboard"]].map(([key,label]) => (
            <button key={key} onClick={()=>setTab(key)} style={S.tab(tab===key)}>{label}</button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {tab === "overview" && <>
          <div style={S.statGrid}>
            <div style={S.stat}><div style={S.statVal}>{p.total_games || 0}</div><div style={S.statLabel}>GAMES PLAYED</div></div>
            <div style={S.stat}><div style={S.statVal}>{p.total_wins || 0}</div><div style={S.statLabel}>VICTORIES</div></div>
            <div style={S.stat}><div style={{...S.statVal,color:"#80c080"}}>{p.total_punya_earned || 0}</div><div style={S.statLabel}>TOTAL PUNYA</div></div>
            <div style={S.stat}><div style={{...S.statVal,color:"#e08060"}}>{p.total_papa_earned || 0}</div><div style={S.statLabel}>TOTAL PAPA</div></div>
          </div>

          <div style={S.card}>
            <div style={{fontSize:12,color:"#f0d050",letterSpacing:2,marginBottom:12,fontWeight:700}}>JOURNEY STATS</div>
            <div style={S.row}><span style={S.rowLabel}>Win Rate</span><span style={S.rowVal}>{winRate}%</span></div>
            <div style={S.row}><span style={S.rowLabel}>Moksha Victories</span><span style={{...S.rowVal,color:"#f0d050"}}>{p.total_moksha_wins || 0}</span></div>
            <div style={S.row}><span style={S.rowLabel}>Karma Victories</span><span style={{...S.rowVal,color:"#80c080"}}>{p.total_karma_wins || 0}</span></div>
            <div style={S.row}><span style={S.rowLabel}>Snakes Bitten</span><span style={{...S.rowVal,color:"#e08060"}}>{p.total_snakes_hit || 0}</span></div>
            <div style={S.row}><span style={S.rowLabel}>Ladders Climbed</span><span style={{...S.rowVal,color:"#f0d050"}}>{p.total_ladders_climbed || 0}</span></div>
            <div style={S.row}><span style={S.rowLabel}>Highest Square</span><span style={S.rowVal}>{p.highest_square_reached || 1}</span></div>
            <div style={S.row}><span style={S.rowLabel}>Riddle Accuracy</span><span style={S.rowVal}>{riddleAcc}% ({p.total_riddles_correct || 0}/{(p.total_riddles_correct||0)+(p.total_riddles_wrong||0)})</span></div>
            <div style={S.row}><span style={S.rowLabel}>Longest Streak</span><span style={{...S.rowVal,color:"#f0d050"}}>{p.longest_streak || 0} days</span></div>
            <div style={S.row}><span style={S.rowLabel}>Favorite Character</span><span style={S.rowVal}>{p.favorite_character || "—"}</span></div>
          </div>

          {/* Karma Bar */}
          <div style={S.card}>
            <div style={{fontSize:12,color:"#f0d050",letterSpacing:2,marginBottom:10,fontWeight:700}}>KARMA BALANCE</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:10,color:"#80c080",width:50,textAlign:"right"}}>Punya</span>
              <div style={{flex:1,height:8,background:"rgba(20,16,10,.4)",borderRadius:4,overflow:"hidden",position:"relative"}}>
                {(p.total_punya_earned || 0) + (p.total_papa_earned || 0) > 0 && <>
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${((p.total_punya_earned||0)/((p.total_punya_earned||0)+(p.total_papa_earned||0)))*100}%`,background:"linear-gradient(90deg,#80c080,#60a060)",borderRadius:4,transition:"width .5s"}}/>
                  <div style={{position:"absolute",right:0,top:0,bottom:0,width:`${((p.total_papa_earned||0)/((p.total_punya_earned||0)+(p.total_papa_earned||0)))*100}%`,background:"linear-gradient(90deg,#c06040,#e08060)",borderRadius:4,transition:"width .5s"}}/>
                </>}
              </div>
              <span style={{fontSize:10,color:"#e08060",width:50}}>Papa</span>
            </div>
            <div style={{textAlign:"center",fontSize:10,color:"#8a7a50",marginTop:6}}>
              {karmaScore > 0 ? "Your soul leans toward liberation ☀" : karmaScore < 0 ? "Darkness clouds your path 🌑" : "Perfectly balanced ⚖"}
            </div>
          </div>
        </>}

        {/* ═══ HISTORY TAB ═══ */}
        {tab === "history" && <>
          {histLoading ? <div style={S.empty}>Loading your past lives...</div> :
           history.length === 0 ? <div style={S.empty}>No games played yet. Your journey begins with the first roll.</div> :
           history.map((g, i) => (
            <div key={g.id} style={{...S.card,display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{fontSize:24,minWidth:36,textAlign:"center"}}>{g.character_icon || "🔱"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:13,color:"#f0d050",fontWeight:700,fontFamily:"'Cinzel',serif"}}>{g.character_name}</span>
                  <span style={{fontSize:10,color:"#8a7a50"}}>{new Date(g.played_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,
                    background: g.result==="moksha_win"?"rgba(240,200,80,.12)":
                                g.result==="karma_win"?"rgba(100,200,100,.12)":
                                g.result==="loss"?"rgba(200,80,60,.12)":"rgba(100,100,100,.12)",
                    color: g.result==="moksha_win"?"#f0d050":
                           g.result==="karma_win"?"#80c080":
                           g.result==="loss"?"#e08060":"#8a7a50",
                    border:`1px solid ${g.result==="moksha_win"?"rgba(240,200,80,.2)":g.result==="karma_win"?"rgba(100,200,100,.2)":g.result==="loss"?"rgba(200,80,60,.2)":"rgba(100,100,100,.2)"}`
                  }}>
                    {g.result==="moksha_win"?"ॐ MOKSHA":g.result==="karma_win"?"☀ KARMA WIN":g.result==="loss"?"🌑 LOSS":"⏸ QUIT"}
                  </span>
                  <span style={{fontSize:10,color:"#8a7a50"}}>Sq {g.final_square} · {g.total_turns} turns</span>
                </div>
                <div style={{display:"flex",gap:12,fontSize:10,color:"#8a7a50"}}>
                  <span style={{color:"#80c080"}}>+{g.final_punya} punya</span>
                  <span style={{color:"#e08060"}}>+{g.final_papa} papa</span>
                  {g.riddles_correct > 0 && <span>🪷 {g.riddles_correct}/{g.riddles_correct+g.riddles_wrong} riddles</span>}
                  {g.ashtanga_reached && <span style={{color:"#f0d050"}}>⚡ Ashtanga</span>}
                </div>
              </div>
            </div>
          ))}
        </>}

        {/* ═══ LEADERBOARD TAB ═══ */}
        {tab === "leaderboard" && <>
          <div style={{...S.card,padding:0,overflow:"hidden"}}>
            {leaderboard.length === 0 ? <div style={{...S.empty,padding:30}}>The sacred ledger is empty. Be the first to inscribe your name.</div> :
            leaderboard.map((p, i) => {
              const isMe = user && p.id === user.id;
              const ks = (p.total_punya_earned||0) - (p.total_papa_earned||0);
              return (
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid rgba(200,160,60,.06)",background:isMe?"rgba(240,200,80,.06)":"transparent"}}>
                  <div style={{width:28,textAlign:"center",fontSize:i<3?16:12,color:i===0?"#f0d050":i===1?"#c0c0c0":i===2?"#cd7f32":"#8a7a50",fontWeight:700}}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                  </div>
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" style={{width:28,height:28,borderRadius:"50%",border:isMe?"2px solid rgba(240,200,80,.4)":"1px solid rgba(200,160,60,.1)"}} referrerPolicy="no-referrer"/>
                  ) : (
                    <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(240,200,80,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#c0b080"}}>
                      {(p.display_name||"S").charAt(0)}
                    </div>
                  )}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:isMe?"#f0d050":"#c0b080",fontWeight:isMe?700:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.display_name}{isMe?" (you)":""}</div>
                    <div style={{fontSize:10,color:"#8a7a50"}}>{p.total_games} games · {p.total_wins} wins</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14,fontWeight:700,color:ks>=0?"#80c080":"#e08060",fontFamily:"'Cinzel',serif"}}>{ks>=0?"+":""}{ks}</div>
                    <div style={{fontSize:9,color:"#8a7a50"}}>karma</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        {/* ═══ SIGN OUT ═══ */}
        <div style={{textAlign:"center",marginTop:24,paddingBottom:20}}>
          <button onClick={async()=>{await signOut();onClose()}} style={{
            background:"transparent",border:"1px solid rgba(200,80,60,.2)",color:"#c08060",
            padding:"8px 24px",fontSize:11,cursor:"pointer",borderRadius:3,
            fontFamily:"'Cinzel',serif",letterSpacing:2,opacity:.6,transition:"all .2s"
          }}>Sign Out</button>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{textAlign:"center",padding:"20px 0 10px",borderTop:"1px solid rgba(200,160,60,.06)",marginTop:20}}>
          <div style={{fontSize:9,color:"#5a4a30",letterSpacing:2}}>MOKSHA PATAM 108 · मोक्ष पटम् १०८</div>
          <div style={{fontSize:8,color:"#3a3020",letterSpacing:1,marginTop:4}}>© {new Date().getFullYear()} RasaVisio · All rights reserved</div>
        </div>
      </div>
    </div>
  );
}
