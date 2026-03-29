// ─────────────────────────────────────────────────────────────────────────────
// shared/useAuth.js
// Supabase authentication hook + Google/Apple icons + Zodiac/Rashi helpers
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const sbUrl = process.env.REACT_APP_SUPABASE_URL || '';
const sbKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
export const supabase = (sbUrl && sbKey) ? createClient(sbUrl, sbKey) : null;

export function useAuth(){
  const[user,setUser]=useState(null);
  const[profile,setProfile]=useState(null);
  const[loading,setLoading]=useState(true);
  const loadProfile=async(uid)=>{
    if(!sbUrl||!sbKey||!uid)return;
    try{
      console.log("Auth: Loading profile via REST for",uid);
      const res=await fetch(`${sbUrl}/rest/v1/profiles?id=eq.${uid}&select=*`,{headers:{"apikey":sbKey,"Authorization":`Bearer ${sbKey}`}});
      if(res.ok){
        const data=await res.json();
        if(data&&data.length>0){
          setProfile(data[0]);
          console.log("Auth: Profile loaded ✓",data[0].display_name);
          // Sync birth_date from DB
          if(data[0].birth_date){
            localStorage.setItem("mp108_birth",data[0].birth_date);
          }
        }else{console.log("Auth: No profile found for",uid)}
      }else{console.error("Auth: Profile load failed:",res.status)}
    }catch(e){console.error("Auth: Profile load error:",e)}
  };
  useEffect(()=>{
    if(!supabase){setLoading(false);return}

    let resolved=false;
    const done=(u)=>{if(resolved)return;resolved=true;setLoading(false);if(u){setUser(u);loadProfile(u.id)}};

    // Timeout: if nothing works in 3s, proceed without auth
    const timeout=setTimeout(()=>{
      if(!resolved){
        console.warn("Auth: Timeout — trying to recover session from storage...");
        // Try to recover user from supabase's localStorage
        try{
          const storageKey=Object.keys(localStorage).find(k=>k.includes("supabase")&&k.includes("auth"));
          if(storageKey){
            const stored=JSON.parse(localStorage.getItem(storageKey));
            const u=stored?.user||stored?.currentSession?.user;
            if(u&&u.id){
              console.log("Auth: Recovered user from localStorage:",u.email);
              done(u);
              return;
            }
          }
        }catch(e){}
        console.warn("Auth: No session found, proceeding as guest");
        done(null);
      }
    },3000);

    // Primary: try getSession
    supabase.auth.getSession()
      .then(({data:{session}})=>{
        clearTimeout(timeout);
        console.log("Auth: getSession",session?"✓ found user":"— no session");
        done(session?.user||null);
      })
      .catch(e=>{
        clearTimeout(timeout);
        console.error("Auth: getSession error:",e);
        done(null);
      });

    // Also listen for auth changes (fires on OAuth redirect)
    const{data:{subscription}}=supabase.auth.onAuthStateChange(async(event,session)=>{
      console.log("Auth: onAuthStateChange",event,session?.user?.email||"no user");
      clearTimeout(timeout);
      if(session?.user){
        setUser(session.user);
        setLoading(false);
        await loadProfile(session.user.id);
      }else if(event==="SIGNED_OUT"){
        setUser(null);setProfile(null);setLoading(false);
      }
    });

    return()=>{clearTimeout(timeout);subscription.unsubscribe()};
  },[]);
  const signInGoogle=useCallback(async()=>{
    if(!supabase){alert("Supabase not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel env vars.");return}
    try{const{error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}});if(error){console.error("Google sign-in error:",error);alert("Google sign-in failed: "+error.message)}}catch(e){console.error("Sign-in error:",e);alert("Sign-in error: "+e.message)}
  },[]);
  const signOut=useCallback(async()=>{if(!supabase)return;await supabase.auth.signOut();setUser(null);setProfile(null)},[]);
  const refresh=useCallback(async()=>{
    if(!user)return;
    console.log("Auth: Refreshing profile via REST...");
    await loadProfile(user.id);
  },[user]);
  return{user,profile,signInGoogle,signOut,loading,refresh};
}

// ═══ GAME DATABASE SERVICE — Direct REST API (bypasses supabase-js client issues) ═══
const GameDB={
  // Direct fetch to Supabase REST API
  async _fetch(path,method,body){
    if(!sbUrl||!sbKey)return{data:null,error:{message:"No supabase config"}};
    const url=`${sbUrl}/rest/v1/${path}`;
    const headers={"Content-Type":"application/json","apikey":sbKey,"Authorization":`Bearer ${sbKey}`,"Prefer":method==="POST"?"return=minimal":"",};
    try{
      const res=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined});
      if(!res.ok){const txt=await res.text();return{data:null,error:{message:`${res.status}: ${txt}`}}}
      if(method==="GET"){const data=await res.json();return{data,error:null}}
      return{data:true,error:null};
    }catch(e){return{data:null,error:{message:e.message}}}
  },
  async _get(path){return this._fetch(path,"GET")},
  async _post(path,body){return this._fetch(path,"POST",body)},
  async _patch(path,body){
    if(!sbUrl||!sbKey)return{data:null,error:{message:"No config"}};
    const url=`${sbUrl}/rest/v1/${path}`;
    try{
      const res=await fetch(url,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":sbKey,"Authorization":`Bearer ${sbKey}`,"Prefer":"return=minimal"},body:JSON.stringify(body)});
      if(!res.ok){const txt=await res.text();return{data:null,error:{message:`${res.status}: ${txt}`}}}
      return{data:true,error:null};
    }catch(e){return{data:null,error:{message:e.message}}}
  },

  async saveGame(userId,d){
    if(!sbUrl||!sbKey||!userId){console.log("GameDB: SKIP - no config or userId");return null}
    console.log("GameDB: === SAVING via REST ===");

    // Step 1: Insert game_history
    try{
      console.log("GameDB: Step 1 - Inserting game_history...");
      const res=await this._post("game_history",{
        user_id:userId,duration_seconds:d.duration||0,total_turns:d.turns||0,
        character_name:d.charName||"Seeker",character_icon:d.charIcon||"🔱",
        opponent_type:d.opponent||"yama",result:d.result||"quit",
        final_square:d.square||1,final_punya:d.punya||0,final_papa:d.papa||0,
        snakes_hit:d.snakes||0,ladders_climbed:d.ladders||0,dharma_cards_faced:0,
        riddles_correct:d.riddlesC||0,riddles_wrong:d.riddlesW||0,
        highest_square:d.highest||1,graha_effects:JSON.stringify({players:d.allPlayers||[],grahaHits:d.grahaHits||{}}),
        ashtanga_reached:d.ashtanga||false,moksha_rejected:d.rejected||0
      });
      console.log("GameDB: Step 1",res.error?"ERROR: "+res.error.message:"✓ INSERTED");
    }catch(e){console.error("GameDB: Step 1 FAILED:",e.message)}

    // Step 2: Read current profile
    let cur=null;
    try{
      console.log("GameDB: Step 2 - Reading profile...");
      const res=await this._get(`profiles?id=eq.${userId}&select=*`);
      if(res.data&&res.data.length>0){cur=res.data[0];console.log("GameDB: Step 2 ✓ Profile found")}
      else{
        console.log("GameDB: Step 2b - No profile, creating...");
        await this._post("profiles",{id:userId,display_name:d.charName||"Seeker",email:"",provider:"google"});
        const r2=await this._get(`profiles?id=eq.${userId}&select=*`);
        cur=r2.data?.[0]||null;
        console.log("GameDB: Step 2b",cur?"✓ Created":"FAILED");
      }
    }catch(e){console.error("GameDB: Step 2 FAILED:",e.message)}

    // Step 3: Update profile
    if(cur){
      try{
        console.log("GameDB: Step 3 - Updating profile...");
        const isWin=d.result==="moksha_win"||d.result==="karma_win";
        const res=await this._patch(`profiles?id=eq.${userId}`,{
          total_games:(cur.total_games||0)+1,
          total_wins:(cur.total_wins||0)+(isWin?1:0),
          total_moksha_wins:(cur.total_moksha_wins||0)+(d.result==="moksha_win"?1:0),
          total_karma_wins:(cur.total_karma_wins||0)+(d.result==="karma_win"?1:0),
          total_punya_earned:(cur.total_punya_earned||0)+(d.punya||0),
          total_papa_earned:(cur.total_papa_earned||0)+(d.papa||0),
          highest_square_reached:Math.max(cur.highest_square_reached||1,d.highest||1),
          total_snakes_hit:(cur.total_snakes_hit||0)+(d.snakes||0),
          total_ladders_climbed:(cur.total_ladders_climbed||0)+(d.ladders||0),
          total_riddles_correct:(cur.total_riddles_correct||0)+(d.riddlesC||0),
          total_riddles_wrong:(cur.total_riddles_wrong||0)+(d.riddlesW||0),
          favorite_character:d.charName||cur.favorite_character,
          last_played_at:new Date().toISOString()
        });
        console.log("GameDB: Step 3",res.error?"ERROR: "+res.error.message:"✓ PROFILE UPDATED");
      }catch(e){console.error("GameDB: Step 3 FAILED:",e.message)}
    }else{console.error("GameDB: Step 3 SKIPPED - no profile")}

    console.log("GameDB: === DONE ===");
    return true;
  },
  async getHistory(userId,limit=20){
    if(!sbUrl||!sbKey||!userId)return[];
    try{
      console.log("GameDB: Loading history for",userId);
      const res=await this._get(`game_history?user_id=eq.${userId}&select=*&order=played_at.desc&limit=${limit}`);
      console.log("GameDB: History loaded:",res.data?.length||0,"games",res.error?.message||"");
      return res.data||[];
    }catch(e){console.error("GameDB: History error:",e);return[]}
  },
  async getLeaderboard(limit=50){
    if(!sbUrl||!sbKey)return[];
    try{
      console.log("GameDB: Loading leaderboard...");
      const res=await this._get(`profiles?total_games=gt.0&select=id,display_name,avatar_url,total_games,total_wins,total_punya_earned,total_papa_earned,total_moksha_wins,total_karma_wins,total_riddles_correct,longest_streak,last_played_at&order=total_punya_earned.desc&limit=${limit}`);
      console.log("GameDB: Leaderboard loaded:",res.data?.length||0,"players",res.error?.message||"");
      return(res.data||[]).map(p=>({...p,karma_score:(p.total_punya_earned||0)-(p.total_papa_earned||0)}));
    }catch(e){console.error("GameDB: Leaderboard error:",e);return[]}
  },
  // Read profile directly via REST (for refresh)
  async getProfile(userId){
    if(!sbUrl||!sbKey||!userId)return null;
    try{
      const res=await this._get(`profiles?id=eq.${userId}&select=*`);
      return res.data?.[0]||null;
    }catch(e){return null}
  },
};

// ═══ GOOGLE SVG ICON ═══
export function GoogleIcon(){return <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>}
export function AppleIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="#e8c850"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>}

// ═══ VEDIC ASTROLOGY — Rashi (Sun Sign) + Nakshatra data ═══
export const RASHI=[
  {name:"Mesha",en:"Aries",skt:"मेष",icon:"♈",element:"Fire",planet:"Mars",dates:"Mar 21 – Apr 19",
    meaning:"The ram who leaps fearlessly. In Vedic science, Mesha represents the spark of creation — pure kinetic energy. Like the first cell dividing, Aries energy is about initiation. Mars governs adrenal response and iron in blood.",
    advice:"Channel your fire into dharmic action. Practice patience through Pranayama. Your Mars energy heals when directed at service, burns when directed at ego."},
  {name:"Vrishabha",en:"Taurus",skt:"वृषभ",icon:"♉",element:"Earth",planet:"Venus",dates:"Apr 20 – May 20",
    meaning:"The sacred bull — Nandi, Shiva's mount. Vrishabha represents material stability and sensory experience. Venus governs the throat chakra, taste, and aesthetic appreciation. Earth signs ground cosmic energy into form.",
    advice:"Build lasting foundations but avoid attachment. Practice Aparigraha (non-possessiveness). Your Venus gifts shine in art, music, and creating beauty that serves others."},
  {name:"Mithuna",en:"Gemini",skt:"मिथुन",icon:"♊",element:"Air",planet:"Mercury",dates:"May 21 – Jun 20",
    meaning:"The divine twins — duality in unity. Mercury governs the neural pathways, the speed of thought, and the bridge between logic and intuition. Air carries prana — the breath of intelligence.",
    advice:"Use your dual nature to see both sides of every dharma dilemma. Practice Dharana (concentration) to focus your scattered brilliance into a single flame."},
  {name:"Karka",en:"Cancer",skt:"कर्क",icon:"♋",element:"Water",planet:"Moon",dates:"Jun 21 – Jul 22",
    meaning:"The crab carries its home — the shell of emotional memory. The Moon governs tides, menstrual cycles, and the unconscious mind. Water signs process karma through feeling.",
    advice:"Your emotional depth is a superpower, not a weakness. Practice Pratyahara (withdrawal of senses) during full moons. Nurture without drowning in attachment."},
  {name:"Simha",en:"Leo",skt:"सिंह",icon:"♌",element:"Fire",planet:"Sun",dates:"Jul 23 – Aug 22",
    meaning:"The lion — Narasimha, Vishnu's fierce avatar. The Sun is the Atman, the true self. Leo energy is the soul recognizing its own divinity. Solar plexus governs willpower and digestion.",
    advice:"Lead with generosity, not pride. The Sun shines on all equally. Practice Seva (selfless service) — true kings serve their people."},
  {name:"Kanya",en:"Virgo",skt:"कन्या",icon:"♍",element:"Earth",planet:"Mercury",dates:"Aug 23 – Sep 22",
    meaning:"The maiden — Shakti in her analytical form. Mercury here governs discrimination (Viveka), the ability to separate truth from illusion. The digestive fire of the mind.",
    advice:"Your precision is sacred but perfectionism is Maya. Practice Santosha (contentment). Serve through healing, teaching, and bringing order to chaos."},
  {name:"Tula",en:"Libra",skt:"तुला",icon:"♎",element:"Air",planet:"Venus",dates:"Sep 23 – Oct 22",
    meaning:"The scales of Ma'at — cosmic balance. Venus here governs justice, partnership, and the harmony of opposites. The heart chakra seeks equilibrium between giving and receiving.",
    advice:"Your quest for balance IS your dharma. Practice Ahimsa in relationships. Make decisions from wisdom, not people-pleasing."},
  {name:"Vrishchika",en:"Scorpio",skt:"वृश्चिक",icon:"♏",element:"Water",planet:"Mars",dates:"Oct 23 – Nov 21",
    meaning:"The scorpion transforms into the eagle — death and rebirth. Mars here drives transformation at the cellular level. Kundalini energy coils at the base, waiting to rise.",
    advice:"Embrace transformation — you are built for it. Practice Tapas (austerity) to transmute intensity into spiritual power. Your depth sees through all illusion."},
  {name:"Dhanu",en:"Sagittarius",skt:"धनु",icon:"♐",element:"Fire",planet:"Jupiter",dates:"Nov 22 – Dec 21",
    meaning:"The archer — Arjuna's focus on the fish's eye. Jupiter expands consciousness, governs the liver (seat of righteous anger in Ayurveda), and the quest for truth.",
    advice:"Aim your arrow at Moksha, not just knowledge. Practice Svadhyaya (self-study). Travel expands you, but the ultimate journey is inward."},
  {name:"Makara",en:"Capricorn",skt:"मकर",icon:"♑",element:"Earth",planet:"Saturn",dates:"Dec 22 – Jan 19",
    meaning:"The sea-monster — ancient, patient, climbing from ocean depths to mountain peaks. Saturn teaches through time, discipline, and karma. Bones and teeth — the structures that endure.",
    advice:"Your patience is your greatest asset. Shani rewards those who persist through darkness. Practice Niyama (discipline) — slow, steady karma yields the deepest liberation."},
  {name:"Kumbha",en:"Aquarius",skt:"कुम्भ",icon:"♒",element:"Air",planet:"Saturn",dates:"Jan 20 – Feb 18",
    meaning:"The water-bearer — pouring knowledge for humanity. Saturn here governs collective karma, the nervous system, and circulation. The Kumbh Mela is named for this sign.",
    advice:"Your vision sees what others cannot. Practice community dharma. Your detachment is not coldness — it is the ability to love without chains."},
  {name:"Meena",en:"Pisces",skt:"मीन",icon:"♓",element:"Water",planet:"Jupiter",dates:"Feb 19 – Mar 20",
    meaning:"Two fish swimming in opposite directions — the soul between worlds. Jupiter here dissolves boundaries between self and cosmos. The final sign — closest to Moksha.",
    advice:"You feel everything because you ARE everything. Practice Dhyana (meditation) — you are naturally close to the divine. Set boundaries to protect your gift of empathy."}
];
export function getZodiac(month,day){
  const dates=[[1,20,"♑"],[2,19,"♒"],[3,20,"♓"],[4,20,"♈"],[5,21,"♉"],[6,21,"♊"],[7,22,"♋"],[8,23,"♌"],[9,23,"♍"],[10,23,"♎"],[11,22,"♏"],[12,22,"♐"],[12,31,"♑"]];
  for(let i=0;i<dates.length;i++){if(month<dates[i][0]||(month===dates[i][0]&&day<=dates[i][1]))return RASHI.find(r=>r.icon===dates[i][2])}
  return RASHI[9]; // Capricorn default
}

