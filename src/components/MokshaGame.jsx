// ─────────────────────────────────────────────────────────────────────────────
// tiers/moksha/MokshaGame.jsx
// The full adult game (Moksha Marg, 20+)
// All game logic: doRoll, solvD, CPU turns, state management
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// Shared
import { sqP, rlm } from '../../shared/utils.js';
import {
  SNAKES, LADDERS, DLM_SQ, SHLOKAS, YAMA_TAUNTS_SNAKE, YAMA_TAUNTS_WRONG,
  DILEMMAS, GRAHA, CHARS, SACRED_PATH, ASHTANGA_RIDDLES,
} from '../../shared/constants.js';
import {
  VoiceEngine, AudioCache, STATIC_VOICES, GRAHA_STATIC_KEY,
  CG_LINES, CG_STATIC, CG_ENTRY_TYPES,
} from '../../shared/audio.js';
import { useAuth, supabase, RASHI, getZodiac, GoogleIcon, AppleIcon } from '../../shared/useAuth.js';
import { useAmbient } from '../../shared/useAmbient.js';
import { useSound } from '../../shared/useSound.js';

// Components
import ChitraguptaPanel from '../../components/ChitraguptaPanel.jsx';
import MokshaScreen from '../../components/MokshaScreen.jsx';
import YamaJudgment from '../../components/YamaJudgment.jsx';
import YamaIcon from '../../components/YamaIcon.jsx';
import SineWaveBackground from '../../components/SineWaveBackground.jsx';
import InstaBadge from '../../components/InstaBadge.jsx';
import Naga from '../../components/Naga.jsx';
import Ldr from '../../components/Ldr.jsx';
import ChitraguptaIntroScreen from '../../components/ChitraguptaIntroScreen.jsx';

export default function MokshaGame(){
  const auth=useAuth();
  const[showProfile,setShowProfile]=useState(false);
  const[devMode,setDevMode]=useState(false);
  const[profileTab,setProfileTab]=useState("overview");
  const[gameHistory,setGameHistory]=useState([]);
  const[leaderboard,setLeaderboard]=useState([]);
  const[histLoading,setHistLoading]=useState(false);
  const[birthDate,setBirthDate]=useState(localStorage.getItem("mp108_birth")||"");
  const[editingBirth,setEditingBirth]=useState(false);

  // Sync birth_date from DB profile when it loads
  useEffect(()=>{
    if(auth.profile?.birth_date&&!birthDate){
      setBirthDate(auth.profile.birth_date);
      localStorage.setItem("mp108_birth",auth.profile.birth_date);
    }
  },[auth.profile]);

  // Save birth_date to database
  const saveBirthDate=(dateStr)=>{
    setBirthDate(dateStr);
    setEditingBirth(false);
    localStorage.setItem("mp108_birth",dateStr);
    // Save to Supabase via REST
    if(auth.user&&sbUrl&&sbKey){
      GameDB._patch(`profiles?id=eq.${auth.user.id}`,{birth_date:dateStr})
        .then(r=>console.log("Birth date saved to DB:",r.error?"ERROR "+r.error.message:"✓"))
        .catch(e=>console.error("Birth date save failed:",e));
    }
  };
  // Game tracking stats (reset each game)
  const gameStats=useRef({startTime:0,turns:0,snakes:0,ladders:0,dharma:0,riddlesC:0,riddlesW:0,highest:1,ashtanga:false,rejected:0,grahaHits:{sun:0,moon:0,mars:0,mercury:0,jupiter:0,venus:0,saturn:0,rahu:0,ketu:0}});

  // Auto-load profile data when profile panel opens
  useEffect(()=>{
    if(!showProfile||!auth.user)return;
    console.log("Profile: Auto-loading data...");
    // Refresh profile stats from DB
    auth.refresh();
    // Load history
    setHistLoading(true);
    GameDB.getHistory(auth.user.id).then(d=>{setGameHistory(d);setHistLoading(false)});
    // Load leaderboard
    GameDB.getLeaderboard().then(d=>setLeaderboard(d));
  },[showProfile]);

  const[screen,setScreen]=useState("title"); // title|story|pickcount|setup|chitragupta|game

  // ── Browser back button ──────────────────────────────────────────────
  // Push a history entry on every screen change so back button works
  // instead of exiting the app entirely
  const navigateTo=useCallback((newScreen)=>{
    setScreen(newScreen);
    // Push state so browser back button fires popstate
    window.history.pushState({screen:newScreen},'',window.location.pathname);
  },[]);

  useEffect(()=>{
    // On mount, replace current history entry with title screen
    window.history.replaceState({screen:'title'},'',window.location.pathname);

    const onPop=(e)=>{
      const prev=e.state?.screen;
      if(!prev){setScreen('title');return;}
      // Map back: where should each screen go?
      const backMap={
        game:'title', chitragupta:'setup', setup:'pickcount',
        pickcount:'story', story:'title', yama:'pickcount',
      };
      navigateTo(backMap[prev]||'title');
      // Also stop voices and audio on back
      VoiceEngine.stop();
      try{window.speechSynthesis.cancel()}catch(e){}
    };
    window.addEventListener('popstate',onPop);
    return()=>window.removeEventListener('popstate',onPop);
  },[]);

  const[nP,setNP]=useState(2);
  const[players,setPlayers]=useState([]);
  const[tempName,setTempName]=useState("");
  const[tempChar,setTempChar]=useState(-1);
  const[usedChars,setUsedChars]=useState([]);
  const[storyPage,setStoryPage]=useState(0);
  const[activeGraha,setActiveGraha]=useState(0);
  const[diceAnim,setDiceAnim]=useState(false);
  const[diceVal,setDiceVal]=useState(4);

  // Auto-cycle graha slideshow on story page 2
  useEffect(()=>{if(screen!=="story"||storyPage!==2)return;const iv=setInterval(()=>setActiveGraha(g=>(g+1)%9),2500);return()=>clearInterval(iv)},[screen,storyPage]);

  const GRAHA_INFO=[
    {icon:"☀",skt:"सूर्य",name:"Surya — The Sun",effect:"You get +2 extra steps forward",color:"#f0b840",type:"blessing"},
    {icon:"☾",skt:"चन्द्र",name:"Chandra — The Moon",effect:"Purifies your soul: +1 Punya",color:"#a0c8e0",type:"blessing"},
    {icon:"♂",skt:"मंगल",name:"Mangal — Mars",effect:"Nearest rival pushed back 3 squares, you get +1 Papa",color:"#e07050",type:"mixed"},
    {icon:"☿",skt:"बुध",name:"Budh — Mercury",effect:"Your position swaps with the nearest seeker",color:"#80c080",type:"chaos"},
    {icon:"♃",skt:"बृहस्पति",name:"Brihaspati — Jupiter",effect:"All seekers on the board gain +1 Punya",color:"#f0d060",type:"blessing"},
    {icon:"♀",skt:"शुक्र",name:"Shukra — Venus",effect:"Grants a divine Shield — blocks the next snake bite",color:"#d0a0c0",type:"blessing"},
    {icon:"♄",skt:"शनि",name:"Shani — Saturn",effect:"Pushed back 3 squares + 1 Papa. No one escapes Saturn.",color:"#8080a0",type:"curse"},
    {icon:"☊",skt:"राहु",name:"Rahu — The Shadow",effect:"Steals 1 Punya from leader, gives to trailing seeker",color:"#6050a0",type:"chaos"},
    {icon:"☋",skt:"केतु",name:"Ketu — The Tail",effect:"All shields destroyed. Closest to 108 gets +1 Punya.",color:"#a06060",type:"mixed"},
  ];

  const[pos,setPos]=useState([]);
  const[cur,setCur]=useState(0);
  const[punya,setPunya]=useState([]);
  const[papa,setPapa]=useState([]);
  const[shieldA,setShieldA]=useState([]);
  const[skipA,setSkipA]=useState([]);
  const[hov,setHov]=useState(null);
  const[rv,setRv]=useState(null);
  const[gv,setGv]=useState(null);
  const[msg,setMsg]=useState("");
  const[dil,setDil]=useState(null);
  const[win,setWin]=useState(null);
  const[pendingPlayers,setPendingPlayers]=useState(null); // held during CG intro
  // ── Chitragupta state ──
  const[cgEntries,setCgEntries]=useState([]);
  const[showMoksha,setShowMoksha]=useState(false);
  const cgEntryId=useRef(0);
  const[busy,setBusy]=useState(false);
  const[hist,setHist]=useState([]);
  const[shI,setShI]=useState(0);
  const[shF,setShF]=useState(true);
  const[muted,setMuted]=useState(false);
  const[showInfo,setShowInfo]=useState(false);
  const[showGuide,setShowGuide]=useState(false);
  const[showRiddles,setShowRiddles]=useState(false);
  const[chosenLang,setChosenLang]=useState("en");
  const[preloading,setPreloading]=useState(false);
  const[preloadPct,setPreloadPct]=useState(0);
  const[cacheCount,setCacheCount]=useState(0);
  const[eventPopup,setEventPopup]=useState(null);
  const[turnBanner,setTurnBanner]=useState(null);
  const[isCPU,setIsCPU]=useState([]);
  const[usedDharma,setUsedDharma]=useState([]);
  const[gameVoicesLoading,setGameVoicesLoading]=useState(false);
  const[gameVoicesPct,setGameVoicesPct]=useState(0);
  const[gameVoicesReady,setGameVoicesReady]=useState(false);
  const[yamaPhase,setYamaPhase]=useState(0); // 0=intro speaking, 1=who are you?, 2=go to setup // tracks which players are CPU
  const[narrateStartedAt,setNarrateStartedAt]=useState(null); // timestamp when narrator audio actually begins — used for DiceStage graha sync

  const sfx=useSound();
  const ambient=useAmbient();
  const play=useCallback((t)=>{if(!muted)sfx(t)},[muted,sfx]);

  // Toggle mute
  const toggleMute=useCallback(()=>{
    setMuted(m=>{
      if(!m){ambient.stop();VoiceEngine.stop()}
      return !m;
    });
  },[ambient]);

  // ── Chitragupta helpers ──
  const addCGEntry=useCallback((type,sq,detail)=>{
    const id=++cgEntryId.current;
    setCgEntries(e=>[...e.slice(-29),{id,type,sq,detail,ts:Date.now()}]);
  },[]);

  const speakCG=useCallback((key,delayMs=600)=>{
    if(muted)return;
    setTimeout(()=>{
      if(!VoiceEngine.speaking) VoiceEngine.speakChitragupta(key,chosenLang);
    },delayMs);
  },[muted,chosenLang]);

  const eventCallback=useRef(null);
  const voiceTimerRef=useRef(null);
  const showEvent = useCallback((popup, onDismiss) => {
    // Kill ANY pending or playing voice
    if(voiceTimerRef.current){clearTimeout(voiceTimerRef.current);voiceTimerRef.current=null}
    VoiceEngine.stop();
    try{window.speechSynthesis.cancel()}catch(e){}
    setEventPopup(popup);
    eventCallback.current=onDismiss||null;
    if(!muted&&popup.subtitle){
      ambient.duck();
      const lang=chosenLang==='hi'?'hi':'en';
      const tryStatic=()=>{
        if(popup.staticKey){
          const sv=STATIC_VOICES[popup.staticKey];
          if(sv&&sv[lang]){
            // Use speakNarrator with the static URL — same bass+reverb+drone processing as onboarding
            VoiceEngine.speakNarrator(popup.subtitle,chosenLang,sv[lang]);
            return true;
          }
        }
        return false;
      };
      voiceTimerRef.current=setTimeout(()=>{
        voiceTimerRef.current=null;
        if(!tryStatic()){
          // Fall back to dynamic TTS (cached in IndexedDB after first play)
          VoiceEngine.speakNarrator(popup.subtitle,chosenLang,null);
        }
      },200);
    }
  }, [muted,chosenLang,ambient]);
  const dismissEvent = useCallback(() => {
    // Cancel any pending voice timeout + stop any playing voice
    if(voiceTimerRef.current){clearTimeout(voiceTimerRef.current);voiceTimerRef.current=null}
    VoiceEngine.stop();
    try{window.speechSynthesis.cancel()}catch(e){}
    setEventPopup(null);
    if(eventCallback.current){
      const cb=eventCallback.current;eventCallback.current=null;
      setTimeout(()=>{cb()},300);
    }else{
      ambient.unduck();
    }
  }, [ambient]);

  useEffect(()=>{try{window.speechSynthesis.getVoices();window.speechSynthesis.onvoiceschanged=()=>window.speechSynthesis.getVoices()}catch(e){}},[]);
  useEffect(()=>{const iv=setInterval(()=>{setShF(false);setTimeout(()=>{setShI(i=>(i+1)%SHLOKAS.length);setShF(true)},700)},6e3);return()=>clearInterval(iv)},[]);

  // Yama intro screen — speak with full audio processing then transition
  useEffect(()=>{
    if(screen!=="yama")return;
    setYamaPhase(0);
    const yamaEn='So, you dare to challenge me? I am Yama. The God of Death. I ride the great buffalo through the realm of the dead. Every soul that walks this board eventually comes to me. You think you can outwit Death? I have watched a million souls fall. Brave warriors. Wise sages. They all fell. And I devoured their karma. Play your little game, mortal. I will be watching every single move. And when your karma falters, I will be there. Now tell me, little soul. Who are you?';
    const yamaHi='तो, तुम मुझसे खेलना चाहते हो? मैं यमराज हूँ। मृत्यु का देवता। मैं महान भैंसे पर सवार होकर मृतकों के लोक से गुज़रता हूँ। हर आत्मा जो इस पट पर चलती है, अंत में मेरे पास आती है। मैंने लाखों आत्माओं को गिरते देखा है। वीर योद्धा। ज्ञानी ऋषि। सब गिरे। और मैंने उनका कर्म निगल लिया। खेलो अपना छोटा सा खेल, नश्वर प्राणी। मैं देख रहा हूँ। हर एक कदम। अब बताओ, छोटी सी आत्मा। तुम कौन हो?';
    const yamaText=chosenLang==='hi'?yamaHi:yamaEn;
    if(!muted){
      setTimeout(()=>VoiceEngine.speakYama(yamaText,chosenLang),1500);
    }
    const timer=setTimeout(()=>setYamaPhase(1),muted?4000:28000);
    return()=>{clearTimeout(timer);VoiceEngine.stop()};
  },[screen,muted,chosenLang]);

  // Speak story page on change
  useEffect(()=>{
    if(screen==="story"&&!muted){
      VoiceEngine.stop();
      // Small delay so browser is ready
      setTimeout(()=>{
        if(!muted){
          setNarrateStartedAt(null); // reset before new narration
          const staticUrl=`/onboarding/story-${storyPage}-${chosenLang}.mp3`;
          VoiceEngine.speakNarrator(
            STORY_PAGES[storyPage][chosenLang],
            chosenLang,
            staticUrl,
            ()=>setNarrateStartedAt(Date.now()) // fires when audio ACTUALLY starts
          );
        }
      },300);
    }
    return()=>VoiceEngine.stop();
  },[screen,storyPage,muted]);

  const startGame=(pList)=>{
    const n=pList.length;
    setPos(Array(n).fill(1));setPunya(Array(n).fill(0));setPapa(Array(n).fill(0));
    setShieldA(Array(n).fill(false));setSkipA(Array(n).fill(false));
    setCur(0);setWin(null);setHist([]);setRv(null);setGv(null);setBusy(false);setDil(null);setUsedDharma([]);
    setCgEntries([]);setShowMoksha(false);
    setMsg(`${pList[0].name} the ${pList[0].char.name} — your journey begins.`);
    gameStats.current={startTime:Date.now(),turns:0,snakes:0,ladders:0,dharma:0,riddlesC:0,riddlesW:0,highest:1,ashtanga:false,rejected:0,grahaHits:{sun:0,moon:0,mars:0,mercury:0,jupiter:0,venus:0,saturn:0,rahu:0,ketu:0}};
    navigateTo("game");
    setTimeout(()=>{ if(!muted) VoiceEngine.speakChitragupta('open',chosenLang); },2800);
  };

  const addPlayer=()=>{
    if(!tempName.trim()||tempChar<0)return;
    const ch=CHARS[tempChar];
    let np=[...players,{name:tempName.trim(),char:ch,charIdx:tempChar}];
    let uc=[...usedChars,tempChar];
    // If 1vsCPU, auto-add CPU player after human
    if(isCPU[1]&&np.length===1){
      const cpuIdx=CHARS.findIndex((_,i)=>!uc.includes(i));
      if(cpuIdx>=0){
        np.push({name:"Yama",char:{...CHARS[cpuIdx],icon:"💀",name:"God of Death",skt:"यम",color:"#a04040"},charIdx:cpuIdx,cpu:true});
        uc.push(cpuIdx);
      }
    }
    setPlayers(np);setUsedChars(uc);setTempName("");setTempChar(-1);
    if(np.length>=nP){
      setPendingPlayers(np); // store for after CG intro
      setTimeout(()=>navigateTo("chitragupta"),100);
    }
  };

  const nearest=(positions,ci,count)=>{let m=Infinity,idx=-1;for(let i=0;i<count;i++){if(i!==ci&&positions[i]<101){const d=Math.abs(positions[i]-positions[ci]);if(d>0&&d<m){m=d;idx=i}}}return idx};

  const doRoll=useCallback(()=>{
    if(dil||win||busy||players.length===0)return;
    if(skipA[cur]){const ns=[...skipA];ns[cur]=false;setSkipA(ns);setMsg(`${players[cur].name}'s turn is skipped.`);setCur(c=>(c+1)%nP);return}
    // Kill ALL audio before rolling
    if(voiceTimerRef.current){clearTimeout(voiceTimerRef.current);voiceTimerRef.current=null}
    VoiceEngine.stop();
    try{window.speechSynthesis.cancel()}catch(e){}
    ambient.duck();
    setBusy(true);play("dice");
    gameStats.current.turns=(gameStats.current.turns||0)+1;
    const r=Math.floor(Math.random()*6)+1,gi=Math.floor(Math.random()*9),g=GRAHA[gi];
    setRv(r);setGv(g);
    const pName=players[cur]?.name||"Seeker";

    // Compute graha effects first
    let tot=r;
    const oldP=pos[cur];let newP=oldP+tot;
    const extras=[];const nPunya=[...punya];const nPapa=[...papa];const nShield=[...shieldA];const nPos=[...pos];const nSkip=[...skipA];
    let grahaStory="";
    const onSacredPath=oldP>=101;
    // Track graha hit
    if(g.fx&&gameStats.current.grahaHits){gameStats.current.grahaHits[g.fx]=(gameStats.current.grahaHits[g.fx]||0)+1}
    if(onSacredPath){
      grahaStory=`${pName}, the Navagraha have no power on the Sacred Path. Only your dharma matters here.`;
      setGv(null); // Don't show graha die result
    }
    if(!onSacredPath&&g.fx==="sun"){tot+=2;newP=oldP+tot;extras.push("+2 extra steps");
      grahaStory=`${pName}, you rolled Surya, the Sun! The king of planets blazes your path. You get 2 EXTRA STEPS — move ${tot} squares instead of ${r}.`}
    if(!onSacredPath&&g.fx==="moon"){nPunya[cur]+=1;extras.push("+1 Punya");
      grahaStory=`${pName}, you rolled Chandra, the Moon! Lunar grace purifies your soul. You receive +1 PUNYA. Your karma grows lighter.`}
    if(!onSacredPath&&g.fx==="jupiter"){for(let i=0;i<nP;i++){if(nPos[i]<101)nPunya[i]+=1};extras.push("ALL +1 Punya (below sacred path)");
      grahaStory=`${pName}, you rolled Brihaspati, Jupiter! The divine guru blesses seekers on the board. +1 PUNYA for all below the sacred path.`}
    if(!onSacredPath&&g.fx==="venus"){nShield[cur]=true;extras.push("Shield granted");
      grahaStory=`${pName}, you rolled Shukra, Venus! The guru of Asuras grants you a CELESTIAL SHIELD. The next serpent that bites you will find its venom neutralized. This shield works only ONCE.`}
    if(!onSacredPath&&g.fx==="mars"){const ni=nearest(pos,cur,nP);if(ni>=0&&nPos[ni]<101){nPos[ni]=Math.max(1,nPos[ni]-3);nPapa[cur]+=1;
      extras.push(`${players[ni]?.name} -3`);
      grahaStory=`${pName}, you rolled Mangal, Mars! The warrior planet fills you with rage. ${players[ni]?.name} is PUSHED BACK 3 squares! But violence has a karmic price — you gain +1 PAPA.`}
      else{grahaStory=`${pName}, you rolled Mangal, Mars! But there's no valid target. ${ni>=0&&nPos[ni]>=101?players[ni]?.name+" is on the Sacred Path — untouchable.":"The warrior energy fades."}`}}
    if(!onSacredPath&&g.fx==="mercury"){const ni=nearest(pos,cur,nP);
      if(ni>=0&&nPos[ni]<101){const yourOldPos=oldP;const theirPos=nPos[ni];nPos[ni]=yourOldPos;newP=theirPos+tot;
        extras.push(`Swapped with ${players[ni]?.name}`);
        grahaStory=`${pName}, you rolled Budh, Mercury! The trickster planet reverses fortune. You SWAP PLACES with ${players[ni]?.name}! You were at square ${yourOldPos} — now you jump to their square ${theirPos}, then move ${tot} forward.`}
      else{grahaStory=`${pName}, you rolled Budh, Mercury! But there's no one to swap with.${ni>=0&&nPos[ni]>=101?" Seekers on the Sacred Path cannot be swapped.":""}`}}
    if(!onSacredPath&&g.fx==="saturn"){newP=Math.max(1,oldP-3)+tot;nPapa[cur]+=1;extras.push("Back 3, +1 Papa");
      grahaStory=`${pName}, you rolled Shani, Saturn! The lord of karma turns his fearsome gaze upon you. You are PUSHED BACK 3 squares and gain +1 PAPA. No one escapes Shani's justice.`}
    if(!onSacredPath&&g.fx==="rahu"){let maxI=-1,minI=-1;
      for(let i=0;i<nP;i++){if(nPos[i]<101){if(maxI<0||nPos[i]>nPos[maxI])maxI=i;if(minI<0||nPos[i]<nPos[minI])minI=i}}
      if(maxI>=0&&minI>=0&&maxI!==minI&&nPunya[maxI]>0){nPunya[maxI]-=1;nPunya[minI]+=1;
        extras.push(`${players[maxI]?.name}→${players[minI]?.name}`);
        grahaStory=`${pName}, you rolled Rahu, the Shadow! STEALS 1 Punya from ${players[maxI]?.name} and gives to ${players[minI]?.name}!`}
      else{extras.push("No effect");grahaStory=`${pName}, you rolled Rahu, the Shadow! But Rahu finds no karma to steal.`}}
    if(!onSacredPath&&g.fx==="ketu"){for(let i=0;i<nP;i++){if(nPos[i]<101)nShield[i]=false}
      let closest=-1;for(let i=0;i<nP;i++){if(nPos[i]<101&&(closest<0||nPos[i]>nPos[closest]))closest=i}
      if(closest>=0){nPunya[closest]+=1;extras.push(`${players[closest]?.name} +1 Punya`);
      grahaStory=`${pName}, you rolled Ketu, the Tail! Strips shields from seekers below the Sacred Path. ${players[closest]?.name} gains +1 Punya.`}
      else{grahaStory=`${pName}, you rolled Ketu, the Tail! All seekers are on the Sacred Path — Ketu has no effect.`}}

    // ═══ STEP 1: Show graha popup, wait for user dismiss ═══
    const startMovement=()=>{
      // ═══ ASHTANGA STEPWISE: On sacred path, move exactly 1 step per turn ═══
      if(oldP>=101&&oldP<107){newP=oldP+1;extras.push("Sacred Path: 1 step")}
      else if(oldP===107){
        // At the final gate — need EXACT roll of 1
        if(r===1){newP=108;extras.push("ॐ Exact 1! Moksha gate opens!")}
        else{newP=107;extras.push(`Rolled ${r} — need exact 1 for Moksha`);
          setMsg(`${pName} rolled ${r} at the final gate. Only a roll of 1 opens Moksha!`);setPunya(nPunya);setPapa(nPapa);setShieldA(nShield);setPos(nPos);setSkipA(nSkip);setBusy(false);setCur(c=>(c+1)%nP);
          showEvent({icon:"🚪",title:"The Gate of Moksha",subtitle:`${pName}, you stand at the final gate — ध्यान Dhyana, Square 107. You rolled ${r}. But Moksha demands EXACT 1. Only absolute surrender opens this gate. Roll again next turn.`,color:"#f0d050"});
          return}
      }
      else if(newP>100&&oldP<=100){newP=101;extras.push("Entered Sacred Path!")}
      if(newP>108){setMsg(`Overshot Moksha. ${extras.join(" · ")}`);setPunya(nPunya);setPapa(nPapa);setShieldA(nShield);setPos(nPos);setSkipA(nSkip);setBusy(false);setCur(c=>(c+1)%nP);return}
      if(newP<1)newP=1;
      let step=0;const steps=Math.abs(newP-oldP);const dir=newP>oldP?1:-1;
      if(steps===0){setBusy(false);setCur(c=>(c+1)%nP);setMsg(extras.join(" · ")||"No movement.");setPunya(nPunya);setPapa(nPapa);setShieldA(nShield);setPos(nPos);return}
      // ═══ STEP 2: Animate movement ═══
      const iv=setInterval(()=>{
        step++;nPos[cur]=oldP+dir*step;setPos([...nPos]);play("move");
        if(step>=steps){
          clearInterval(iv);
          let p=newP,eMsg="";
          // ═══ STEP 3: Check landing — show popup, wait for dismiss ═══
          const finishTurn=(skipDharmaCheck)=>{
            nPos[cur]=p;setPos([...nPos]);setPunya(nPunya);setPapa(nPapa);setShieldA(nShield);setSkipA(nSkip);
            if(p>(gameStats.current.highest||1))gameStats.current.highest=p;
            setMsg([eMsg,...extras].filter(Boolean).join(" · ")||`Moved to ${p}.`);
            setHist(h=>[...h.slice(-12),`${pName}→${p}`]);
            if(nPunya[cur]>=30&&!win){setWin(cur);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory");
              addCGEntry('moksha',p,`30 पुण्य · कर्म विजय`);
              showEvent({icon:"ॐ",title:"KARMA VICTORY!",subtitle:`${pName} has accumulated 30 Punya! The board dissolves. Instant Moksha!`,color:"#f0d050"},()=>{speakCG('moksha',300);setTimeout(()=>setShowMoksha(true),1200);});
            }
            // Balance warning — Chitragupta watches when it's knife-edge
            const pu=nPunya[cur],pa=nPapa[cur];
            if(pu>0&&pa>0&&Math.abs(pu-pa)<=2&&p<100&&!win){
              addCGEntry('balance',p,`${pu}P·${pa}X तुला`);
              speakCG('balance',5500);
            }
            if(skipDharmaCheck||(!DLM_SQ.includes(p)&&!(p>100&&p<108)))setCur(c=>(c+1)%nP);
            setBusy(false);
          };

          if(SNAKES[p]){const sn=SNAKES[p];if(nShield[cur]){nShield[cur]=false;eMsg=`𓆙 ${sn.skt} — Shield!`;play("ladder");
            showEvent({icon:"🛡",title:`Shield Saved ${pName}!`,subtitle:`The serpent ${sn.skt} (${sn.en}) struck — but Shukra's shield absorbed the venom! Shield is now gone.`,color:"#d0a0c0",staticKey:"shield_save"},()=>{addCGEntry('punya',p,`${sn.skt} — shield`);speakCG('punya',500);finishTurn(true)});
          }else{const o=p;p=sn.to;eMsg=`𓆙 ${o}→${p}`;nPapa[cur]+=2;gameStats.current.snakes++;play("snake");play("yamaLaugh");
            // Yama taunts the player with voice
            if(!muted){setTimeout(()=>VoiceEngine.playYamaTaunt("snake",chosenLang),800)}
            showEvent({icon:"𓆙",title:`${sn.skt} — ${sn.en}`,subtitle:`${pName}, the serpent of ${sn.en} caught you! ${sn.tale} Dragged from ${o} to ${p}. +2 PAPA.`,color:"#e06030",extra:`${o} → ${p}`,staticKey:"snake_hit"},()=>{addCGEntry('snake',p,`${sn.skt} · ${o}→${p}`);speakCG('snake',4000);finishTurn(true)});
          }}
          else if(LADDERS[p]){const ld=LADDERS[p];const o=p;p=ld.to;eMsg=`🪔 ${o}→${p}`;nPunya[cur]+=1;gameStats.current.ladders++;play("ladder");
            showEvent({icon:"🪔",title:`${ld.skt} — ${ld.en}`,subtitle:`${pName}, the virtue of ${ld.en} lifts you! ${ld.tale} Rise from ${o} to ${p}. +1 PUNYA.`,color:"#f0d050",extra:`${o} → ${p}`,staticKey:"ladder_rise"},()=>{addCGEntry('ladder',p,`${ld.skt} · ${o}→${p}`);speakCG('ladder',500);finishTurn(true)});
          }
          else if(DLM_SQ.includes(p)){
            // No-repeat dharma: pick from unused pool, reset if all used
            let pool=DILEMMAS.map((_,i)=>i).filter(i=>!usedDharma.includes(i));
            if(pool.length===0){pool=DILEMMAS.map((_,i)=>i);setUsedDharma([]);}
            const dIdx=pool[Math.floor(Math.random()*pool.length)];
            const d=DILEMMAS[dIdx];
            setUsedDharma(u=>[...u,dIdx]);
            eMsg=`⚖ ${d.en}`;play("dilemma");
            showEvent({icon:"⚖",title:`${d.t} — ${d.en}`,subtitle:`${pName} faces a Dharma Dilemma! Dismiss to read the story and choose your path.`,color:"#d0b870"},()=>{
              setDil({...d,pi:cur});finishTurn();
            });
          }
          else if(p>100&&p<108){
            const sq=SACRED_PATH[p-101];
            const stepNum=p-100;
            const isFirstStep=p===101;
            // Static text per step (no player name — pre-cacheable as MP3)
            const introText=isFirstStep
              ?`You have entered the Ashtanga Marga — the 8-fold sacred path of Patanjali. From here, you move only one step per turn. Each step tests your soul. There are no dice shortcuts. Only dharma. Step one of seven: ${sq.en}. ${sq.desc}.`
              :p===107
              ?`You have reached the final step — Dhyana, Meditation. After this test, you must roll exact one to enter Moksha. Only absolute surrender opens the final gate. Step seven of seven.`
              :`Step ${stepNum} of 7 on the Sacred Path: ${sq.skt} — ${sq.en}. ${sq.desc}. A test of your soul awaits.`;
            const ashtangaStaticKey=`ashtanga_step_${stepNum}`;
            eMsg=`${sq.icon} ${sq.skt} — Step ${stepNum}/7`;play("dilemma");
            showEvent({icon:sq.icon,title:`अष्टांग मार्ग · Step ${stepNum}`,subtitle:introText,color:"#f0d050",staticKey:ashtangaStaticKey},()=>{
              addCGEntry('sacred',p,`${sq.skt} · ${sq.en}`);
              if(stepNum===1) speakCG('sacred',500);
              // Pick random riddle for this step
              const pool=ASHTANGA_RIDDLES[p]||ASHTANGA_RIDDLES[101];
              const riddle=pool[Math.floor(Math.random()*pool.length)];
              // Shuffle options so correct isn't always first
              const shuffle=Math.random()<0.5;
              const opts=shuffle?[riddle.a[1],riddle.a[0]]:[riddle.a[0],riddle.a[1]];
              const correctIdx=shuffle?(1-riddle.correct):riddle.correct;
              // Build dharma-like dilemma with same-color options
              setDil({
                t:sq.skt,en:`Riddle of ${sq.en}`,
                txt:riddle.q,
                c:[
                  {l:`${opts[0]}`,k:correctIdx===0?"punya":"papa",fx:correctIdx===0?{punya:2}:{papa:1}},
                  {l:`${opts[1]}`,k:correctIdx===1?"punya":"papa",fx:correctIdx===1?{punya:2}:{papa:1}},
                ],
                pi:cur,ashtanga:true
              });finishTurn();
            });
          }
          else if(p===108){if(nPunya[cur]>=nPapa[cur]){setWin(cur);eMsg=`ॐ MOKSHA!`;play("victory");
            showEvent({icon:"ॐ",title:"मोक्ष प्राप्त — MOKSHA!",subtitle:`${pName} reached Square 108 — Moksha! Punya (${nPunya[cur]}) ≥ Papa (${nPapa[cur]}). Liberation! The cycle of Samsara ends.`,color:"#f0d050",staticKey:"moksha_gate"},()=>{addCGEntry('moksha',108,`${nPunya[cur]} पुण्य · मुक्ति`);speakCG('moksha',600);setTimeout(()=>setShowMoksha(true),1200);finishTurn()});
          }else{p=67;eMsg="Impure → 67";play("snake");play("yamaLaugh");
            if(!muted)setTimeout(()=>VoiceEngine.playYamaTaunt("reject",chosenLang),800);
            showEvent({icon:"⚠",title:"Gates of Moksha REJECT You!",subtitle:`${pName}, your soul is impure! Punya (${nPunya[cur]}) < Papa (${nPapa[cur]}). Cast back to 67.`,color:"#e06030"},()=>{addCGEntry('reject',67,`${nPunya[cur]}P < ${nPapa[cur]}X`);speakCG('reject',600);finishTurn()});
          }}
          else{finishTurn()}
        }
      },280);
    };

    // Show graha popup — user dismisses, then movement begins
    // On sacred path: skip graha popup entirely
    if(onSacredPath){startMovement()}
    else{showEvent({icon:g.icon,title:`${g.n} · ${g.en}`,subtitle:grahaStory,color:g.color,type:"graha",staticKey:GRAHA_STATIC_KEY[g.fx]},startMovement)}
  },[cur,nP,dil,win,busy,punya,papa,pos,shieldA,skipA,play,players,showEvent,chosenLang,muted]);

  const solvD=(ci)=>{
    if(!dil)return;const ch=dil.c[ci],fx=ch.fx||{};
    const np=[...punya],npa=[...papa],nsk=[...skipA],npos=[...pos],nsh=[...shieldA];
    const pName=players[dil.pi]?.name||"Seeker";

    if(dil.ashtanga){
      // ═══ ASHTANGA RIDDLE RESULT ═══
      if(ch.k==="punya"){
        np[dil.pi]+=(fx.punya||2);
        setPunya(np);setPapa(npa);setSkipA(nsk);setPos(npos);setShieldA(nsh);
        setMsg(`✓ Correct! ${pName} gains +${fx.punya||2} Punya`);
        gameStats.current.riddlesC++;
        // Play chime + speak appreciation with delay so voice isn't killed
        play("chime");
        if(!muted){
          ambient.duck();
          setTimeout(()=>VoiceEngine.speakNarrator(`Well done ${pName}! You answered correctly. Your soul grows purer.`,chosenLang,null),300);
          setTimeout(()=>ambient.unduck(),4000);
        }
      }else{
        npa[dil.pi]+=(fx.papa||1);
        const curPos=npos[dil.pi];
        const backTo=Math.max(1,curPos-1);
        npos[dil.pi]=backTo;
        setPunya(np);setPapa(npa);setSkipA(nsk);setPos(npos);setShieldA(nsh);
        setMsg(`✗ Wrong! ${pName} falls back to square ${backTo}. +${fx.papa||1} Papa`);
        gameStats.current.riddlesW++;
        // Play Yama laugh with delay
        play("yamaLaugh");
        if(!muted){
          ambient.duck();
          setTimeout(()=>VoiceEngine.playYamaTaunt("wrong",chosenLang),300);
          setTimeout(()=>ambient.unduck(),4000);
        }
      }
      if(np[dil.pi]>=30&&!win){setWin(dil.pi);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory")}
      // Clear dil FIRST so useEffect cleanup doesn't kill the voice we just started
      const dilRef=dil;
      setDil(null);setCur(c=>(c+1)%nP);
      return;
    }

    // ═══ NORMAL DHARMA ═══
    if(fx.punya)np[dil.pi]+=(fx.punya);if(fx.papa)npa[dil.pi]+=(fx.papa);if(fx.skip)nsk[dil.pi]=true;
    if(fx.move){
      let newDPos=npos[dil.pi]+(fx.move);
      if(npos[dil.pi]<=100&&newDPos>100)newDPos=101;
      npos[dil.pi]=Math.max(1,Math.min(108,newDPos));
    }
    if(fx.loseShield)nsh[dil.pi]=false;
    if(fx.giveShield)nsh[dil.pi]=true;
    setPunya(np);setPapa(npa);setSkipA(nsk);setPos(npos);setShieldA(nsh);
    const parts=[];if(fx.punya)parts.push(`+${fx.punya} Punya`);if(fx.papa)parts.push(`+${fx.papa} Papa`);if(fx.move)parts.push(fx.move>0?`advance ${fx.move}`:`back ${Math.abs(fx.move)}`);if(fx.skip)parts.push("skip next");if(fx.loseShield)parts.push("lost Shield");if(fx.giveShield)parts.push("gained Shield");
    setMsg(parts.join(", ")||"Balanced.");
    if(ch.k==="punya"){play("chime");gameStats.current.riddlesC++;addCGEntry('dharma_p',npos[dil.pi]||1,dil.en||'');speakCG('dharma_p',600);}
    else if(ch.k==="papa"){play("yamaLaugh");gameStats.current.riddlesW++;addCGEntry('dharma_x',npos[dil.pi]||1,dil.en||'');speakCG('dharma_x',4000);}
    if(np[dil.pi]>=30&&!win){setWin(dil.pi);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory")}
    setDil(null);setCur(c=>(c+1)%nP);
  };

  // ═══ AUTO-SAVE GAME ON WIN ═══
  useEffect(()=>{
    if(win===null)return;
    if(!auth.user){console.log("Auto-save: No auth user, skipping");return}
    if(!players[win]){console.log("Auto-save: No player at win index",win);return}
    const timer=setTimeout(()=>{
      console.log("Auto-save: TRIGGERED for player",win,"punya:",punya[win],"papa:",papa[win],"pos:",pos[win]);
      const gs=gameStats.current;
      const p=punya[win]||0;
      const pa=papa[win]||0;
      const sq=pos[win]||1;
      const isKarma=p>=30;

      // Collect ALL players' data for history
      const allPlayers=players.map((pl,i)=>({
        name:pl.name,
        icon:pl.char?.icon||"🔱",
        character:pl.char?.name||"Seeker",
        color:pl.char?.color||"#e8c850",
        cpu:!!pl.cpu,
        punya:punya[i]||0,
        papa:papa[i]||0,
        square:pos[i]||1,
        isWinner:i===win
      }));

      GameDB.saveGame(auth.user.id,{
        duration:Math.floor((Date.now()-(gs.startTime||Date.now()))/1000),
        turns:gs.turns||0,
        charName:players[win]?.char?.name||"Seeker",
        charIcon:players[win]?.char?.icon||"🔱",
        opponent:players.some(pl=>pl.cpu)?"yama":"multiplayer",
        result:isKarma?"karma_win":"moksha_win",
        square:sq,
        punya:p,papa:pa,
        snakes:gs.snakes||0,ladders:gs.ladders||0,
        dharma:gs.dharma||0,riddlesC:gs.riddlesC||0,riddlesW:gs.riddlesW||0,
        highest:Math.max(gs.highest||1,sq),ashtanga:gs.ashtanga||(sq>=101),rejected:gs.rejected||0,
        allPlayers:allPlayers,
        grahaHits:gs.grahaHits||{}
      }).then(()=>{
        console.log("Auto-save: ✓ Complete! Refreshing profile...");
        auth.refresh();
      }).catch(e=>console.error("Auto-save: FAILED",e));
    },500);
    return()=>clearTimeout(timer);
  },[win]);

  // ═══ TURN ANNOUNCEMENT + CPU AUTO-PLAY ═══
  useEffect(()=>{
    if(screen!=="game"||win!==null||players.length===0)return;
    const p=players[cur];
    if(!p)return;
    // Show turn banner
    setTurnBanner({name:p.name,icon:p.char.icon,color:p.char.color,cpu:!!p.cpu});
    const bannerTimer=setTimeout(()=>setTurnBanner(null),2000);
    // CPU auto-play after a delay
    if(p.cpu&&!dil&&!busy){
      const cpuTimer=setTimeout(()=>{doRoll()},2500);
      return()=>{clearTimeout(bannerTimer);clearTimeout(cpuTimer)};
    }
    return()=>clearTimeout(bannerTimer);
  },[cur,screen,win,players,dil,busy]);

  // CPU auto-solve dharma dilemmas (picks randomly, leans papa for difficulty)
  useEffect(()=>{
    if(!dil||!players[dil.pi]?.cpu)return;
    const cpuTimer=setTimeout(()=>{
      // CPU picks papa choice 60% of time (it's the god of death after all)
      const pick=Math.random()<0.6?1:0;
      solvD(pick);
    },2500);
    return()=>clearTimeout(cpuTimer);
  },[dil]);

  // ═══ DHARMA VOICE — read aloud when card appears (skip CPU) ═══
  useEffect(()=>{
    if(!dil||muted||players[dil.pi]?.cpu)return;
    // Stop any lingering audio first, then duck ambient, then speak with delay
    VoiceEngine.stop();
    try{window.speechSynthesis.cancel()}catch(e){}
    ambient.duck();
    const timer=setTimeout(()=>{
      const voiceText=dil.ashtanga
        ?`Riddle of ${dil.en}. ${dil.txt}. Option one: ${dil.c[0].l}. Option two: ${dil.c[1].l}.`
        :`Dharma Dilemma. ${dil.en}. ${dil.txt}. Your choices are: ${dil.c.map((c,i)=>c.l).join('. Or. ')}`;
      VoiceEngine.speakNarrator(voiceText,chosenLang,null);
    },500);
    // Only clear timer on cleanup, DON'T stop voice - let it finish naturally after card closes
    return()=>{clearTimeout(timer)};
  },[dil,muted]);

  const board=useMemo(()=>{const s=[];for(let r=0;r<10;r++)for(let c=0;c<10;c++){const a=9-r;s.push({num:a*10+(a%2===0?c:9-c)+1})}return s},[]);
  const conns=useMemo(()=>{const l=[];Object.entries(SNAKES).forEach(([f,{to}])=>{const a=sqP(+f),b=sqP(to);l.push({f:a,t:b,type:"s",id:+f})});Object.entries(LADDERS).forEach(([f,{to}])=>{const a=sqP(+f),b=sqP(to);l.push({f:a,t:b,type:"l",id:+f})});return l},[]);
  const shl=SHLOKAS[shI];

  // ═══ GLOBAL OVERLAYS — rendered on every screen ═══
  const globalOverlays=<>
    <style>{CSS}</style>
    {/* ═══ MOKSHA CINEMATIC — appears full-screen when win triggers ═══ */}
    {showMoksha&&win!==null&&(
      <MokshaScreen
        winner={win}
        players={players}
        punya={punya}
        papa={papa}
        muted={muted}
        onClose={()=>{setShowMoksha(false);navigateTo("title");setWin(null);setPlayers([]);ambient.stop();}}
      />
    )}
    {/* ═══ SACRED BACKGROUND — visible on ALL screens ═══ */}
    <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center,transparent 40%,rgba(6,5,3,.85) 100%)"}}/>
      <svg style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"130%",height:"130%"}} viewBox="0 0 800 800">
        {/* Cymatics rings */}
        <circle cx="400" cy="400" r="60" fill="none" stroke="#a08030" strokeWidth="1" opacity=".15" style={{animation:"cymaticPulse 3.5s ease infinite"}}/>
        <circle cx="400" cy="400" r="100" fill="none" stroke="#a08030" strokeWidth=".8" opacity=".18" style={{animation:"cymaticPulse 4s ease infinite .3s"}}/>
        <circle cx="400" cy="400" r="150" fill="none" stroke="#a08030" strokeWidth=".7" opacity=".2" style={{animation:"cymaticPulse 5s ease infinite .6s"}}/>
        <circle cx="400" cy="400" r="210" fill="none" stroke="#a08030" strokeWidth=".6" opacity=".16" style={{animation:"cymaticPulse 6s ease infinite 1s"}}/>
        <circle cx="400" cy="400" r="280" fill="none" stroke="#a08030" strokeWidth=".5" opacity=".12" style={{animation:"cymaticPulse 7s ease infinite 1.4s"}}/>
        <circle cx="400" cy="400" r="360" fill="none" stroke="#a08030" strokeWidth=".4" opacity=".08" style={{animation:"cymaticPulse 8s ease infinite 1.8s"}}/>
        {/* Flower of Life */}
        {[0,60,120,180,240,300].map(a=><circle key={"fl"+a} cx={400+60*Math.cos(a*Math.PI/180)} cy={400+60*Math.sin(a*Math.PI/180)} r="60" fill="none" stroke="#a08030" strokeWidth=".5" opacity=".1" style={{animation:`cymaticPulse ${5+a/100}s ease infinite ${a/400}s`}}/>)}
        {/* Hexagonal nodes */}
        {[0,60,120,180,240,300].map(a=><g key={"n1"+a}><circle cx={400+105*Math.cos(a*Math.PI/180)} cy={400+105*Math.sin(a*Math.PI/180)} r="4" fill="#a08030" opacity=".18" style={{animation:`cymaticPulse ${3+a/100}s ease infinite ${a/200}s`}}/><line x1={400+95*Math.cos(a*Math.PI/180)} y1={400+95*Math.sin(a*Math.PI/180)} x2={400+115*Math.cos(a*Math.PI/180)} y2={400+115*Math.sin(a*Math.PI/180)} stroke="#a08030" strokeWidth=".5" opacity=".12"/></g>)}
        {/* Outer ring dots */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=><circle key={"n2"+a} cx={400+220*Math.cos(a*Math.PI/180)} cy={400+220*Math.sin(a*Math.PI/180)} r="3" fill="#a08030" opacity=".12" style={{animation:`cymaticPulse ${4+a/120}s ease infinite ${a/300}s`}}/>)}
        {/* Naga serpent knots */}
        <g style={{animation:"cymaticRotate 50s linear infinite"}} opacity=".15">
          <path d="M300,400 C300,340 350,300 400,300 C450,300 500,340 500,400 C500,460 450,500 400,500 C350,500 300,460 300,400 Z" fill="none" stroke="#a08030" strokeWidth="1"/>
          <path d="M320,400 C320,355 355,320 400,320 C445,320 480,355 480,400 C480,445 445,480 400,480 C355,480 320,445 320,400 Z" fill="none" stroke="#a08030" strokeWidth=".7"/>
        </g>
        <g style={{animation:"cymaticRotate 70s linear infinite reverse"}} opacity=".12">
          <path d="M230,400 Q315,280 400,400 T570,400" fill="none" stroke="#a08030" strokeWidth=".7"/>
          <path d="M230,400 Q315,520 400,400 T570,400" fill="none" stroke="#a08030" strokeWidth=".7"/>
        </g>
        {/* Sri Yantra */}
        <polygon points="400,290 325,440 475,440" fill="none" stroke="#a08030" strokeWidth=".6" opacity=".1" style={{animation:"cymaticPulse 10s ease infinite"}}/>
        <polygon points="400,510 325,360 475,360" fill="none" stroke="#a08030" strokeWidth=".6" opacity=".1" style={{animation:"cymaticPulse 10s ease infinite 5s"}}/>
        <polygon points="400,330 355,420 445,420" fill="none" stroke="#a08030" strokeWidth=".5" opacity=".07" style={{animation:"cymaticPulse 12s ease infinite 2s"}}/>
        <polygon points="400,470 355,380 445,380" fill="none" stroke="#a08030" strokeWidth=".5" opacity=".07" style={{animation:"cymaticPulse 12s ease infinite 7s"}}/>
        {/* Radial spokes */}
        {[0,45,90,135,180,225,270,315].map(a=><line key={"sp"+a} x1={400+70*Math.cos(a*Math.PI/180)} y1={400+70*Math.sin(a*Math.PI/180)} x2={400+350*Math.cos(a*Math.PI/180)} y2={400+350*Math.sin(a*Math.PI/180)} stroke="#a08030" strokeWidth=".25" opacity=".06"/>)}
      </svg>
    </div>
    {/* ═══ PROFILE BUTTON — visible on ALL screens (top-right) ═══ */}
    <div style={{position:"fixed",top:10,right:10,zIndex:250,pointerEvents:"auto"}}>
      {auth.user?<button onClick={()=>{setShowProfile(true);setProfileTab("overview")}} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px 6px 6px",background:"rgba(12,10,7,.9)",border:"1.5px solid rgba(200,160,60,.25)",borderRadius:22,cursor:"pointer",color:"#e8c850",fontSize:12,fontFamily:"'Cinzel',serif",backdropFilter:"blur(8px)",boxShadow:"0 2px 12px rgba(0,0,0,.4), 0 0 20px rgba(200,160,60,.05)",transition:"all .2s"}}>
        {auth.profile?.avatar_url?<img src={auth.profile.avatar_url} alt="" style={{width:32,height:32,borderRadius:"50%",border:"2px solid rgba(240,200,80,.3)",boxShadow:"0 0 8px rgba(240,200,80,.15)"}} referrerPolicy="no-referrer"/>:<div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,rgba(240,200,80,.2),rgba(200,160,60,.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#f0d050",border:"2px solid rgba(240,200,80,.2)"}}>🪷</div>}
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start"}}>
          <span style={{fontSize:12,fontWeight:700,lineHeight:1.2,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{(auth.profile?.display_name||auth.user?.user_metadata?.full_name||"").split(" ")[0]||"Profile"}</span>
          {auth.profile?.total_games>0&&<span style={{fontSize:9,color:(auth.profile.total_punya_earned-auth.profile.total_papa_earned)>=0?"#80c080":"#e08060",lineHeight:1}}>{(auth.profile.total_punya_earned-auth.profile.total_papa_earned)>=0?"+":""}{(auth.profile.total_punya_earned||0)-(auth.profile.total_papa_earned||0)} karma</span>}
        </div>
      </button>:<button onClick={auth.signInGoogle} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",background:"rgba(12,10,7,.9)",border:"1.5px solid rgba(200,160,60,.2)",borderRadius:22,cursor:"pointer",color:"#c0b080",fontSize:12,fontFamily:"'Cinzel',serif",backdropFilter:"blur(8px)",boxShadow:"0 2px 12px rgba(0,0,0,.4)",transition:"all .2s"}}><GoogleIcon/><span>Sign In</span></button>}
    </div>
    {showInfo&&<div key="info-panel" style={{position:"fixed",inset:0,background:"rgba(6,5,3,.95)",zIndex:300,overflowY:"auto",padding:"clamp(12px,3vw,24px)",animation:"fadeIn .3s ease"}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontSize:"clamp(18px,4vw,28px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:0}}>Game Encyclopaedia</h2>
          <button className="gb" onClick={()=>setShowInfo(false)} style={{padding:"6px 16px",fontSize:12}}>✕ Close</button>
        </div>
        <h3 style={{fontSize:15,color:"#f0d050",letterSpacing:3,borderBottom:"1px solid rgba(200,160,60,.15)",paddingBottom:6,marginBottom:10}}>THE TWO DICE</h3>
        <div style={{background:"rgba(20,16,10,.5)",padding:14,borderRadius:4,marginBottom:8,border:"1px solid rgba(200,160,60,.1)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#f0d050",marginBottom:4}}>🎲 KARMA DIE (1-6)</div>
          <p style={{fontSize:12,color:"#c0b080",lineHeight:1.7,margin:0}}>Determines movement forward.</p>
        </div>
        <div style={{background:"rgba(20,16,10,.5)",padding:14,borderRadius:4,marginBottom:20,border:"1px solid rgba(200,160,60,.1)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#f0d050",marginBottom:8}}>🌌 GRAHA DIE (9 Navagraha)</div>
          {GRAHA.map((g,i)=><div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:i<8?"1px solid rgba(200,160,60,.06)":"none"}}>
            <span style={{fontSize:18,color:g.color,minWidth:24}}>{g.icon}</span>
            <span style={{fontSize:11,color:"#c0b080"}}><strong style={{color:g.color}}>{g.n} · {g.en}</strong> — {g.desc}</span>
          </div>)}
        </div>
        <h3 style={{fontSize:15,color:"#e08040",letterSpacing:3,borderBottom:"1px solid rgba(200,160,60,.15)",paddingBottom:6,marginBottom:10}}>𓆙 SERPENTS</h3>
        {Object.entries(SNAKES).map(([sq,sn])=><div key={sq} style={{padding:"6px 0",borderBottom:"1px solid rgba(200,160,60,.04)",fontSize:11}}>
          <span style={{color:"#e08040",fontWeight:700}}>Sq {sq}</span> <span style={{fontFamily:"'Noto Serif Devanagari',serif",color:"#ffc050"}}>{sn.skt}</span> {sn.en} → {sn.to}
        </div>)}
        <h3 style={{fontSize:15,color:"#f0d050",letterSpacing:3,borderBottom:"1px solid rgba(200,160,60,.15)",paddingBottom:6,margin:"16px 0 10px"}}>🪔 VIRTUES</h3>
        {Object.entries(LADDERS).map(([sq,ld])=><div key={sq} style={{padding:"6px 0",borderBottom:"1px solid rgba(200,160,60,.04)",fontSize:11}}>
          <span style={{color:"#f0d050",fontWeight:700}}>Sq {sq}</span> <span style={{fontFamily:"'Noto Serif Devanagari',serif",color:"#ffe070"}}>{ld.skt}</span> {ld.en} → {ld.to}
        </div>)}
        <h3 style={{fontSize:15,color:"#d0b870",letterSpacing:3,borderBottom:"1px solid rgba(200,160,60,.15)",paddingBottom:6,margin:"16px 0 10px"}}>⚖ DHARMA CARDS ({DILEMMAS.length})</h3>
        {DILEMMAS.map((d,i)=><div key={i} style={{background:"rgba(20,16,10,.4)",border:"1px solid rgba(200,160,60,.08)",padding:10,borderRadius:4,marginBottom:8}}>
          <div style={{fontSize:12,fontFamily:"'Noto Serif Devanagari',serif",fontWeight:700,color:"#f0d050"}}>{d.t} — <span style={{fontFamily:"'Cinzel',serif",fontSize:11,opacity:.7}}>{d.en}</span></div>
          <p style={{fontSize:11,color:"#c0b080",lineHeight:1.6,margin:"4px 0",fontStyle:"italic"}}>{d.txt}</p>
          {d.c.map((ch,ci)=><div key={ci} style={{fontSize:10,color:ch.k==="punya"?"#f0d050":"#e08040",padding:"1px 0"}}>→ {ch.l}</div>)}
        </div>)}
      </div>
    </div>}
    {showGuide&&<div key="guide-panel" style={{position:"fixed",inset:0,background:"rgba(6,5,3,.95)",zIndex:300,overflowY:"auto",padding:"clamp(12px,3vw,24px)",animation:"fadeIn .3s ease"}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontSize:"clamp(18px,4vw,28px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:0}}>📜 How to Play</h2>
          <button className="gb" onClick={()=>setShowGuide(false)} style={{padding:"6px 16px",fontSize:12}}>✕ Close</button>
        </div>
        {[
          {t:"🎯 Goal",d:"Reach Square 108 (Moksha) through the Sacred 8-fold Path with Punya ≥ Papa. Or collect 30 Punya for instant Karma Victory."},
          {t:"🎲 Your Turn",d:"Roll TWO dice: Karma Die (1-6 movement) + Graha Die (9 planet effects). Popups explain what happened."},
          {t:"☀ The 9 Navagraha",d:"Surya = +2 steps. Chandra = +1 Punya. Mangal = push rival back 3. Budh = swap. Brihaspati = ALL +1 Punya. Shukra = Shield. Shani = back 3 +1 Papa. Rahu = steal from leader. Ketu = strip shields. Navagraha have NO power on the Sacred Path."},
          {t:"𓆙 Serpents (Red)",d:"10 Nāga serpents named after vices. Landing = dragged DOWN + 2 Papa."},
          {t:"🪔 Virtues (Gold)",d:"10 divine ladders of virtue. Landing = lifted UP + 1 Punya."},
          {t:"⚖ Dharma (Purple)",d:"21 moral dilemmas from Mahābhārata & real life. Choose wisely — no repeat in same game."},
          {t:"🛡 Shield",d:"Shukra grants a one-time shield blocking the next serpent."},
          {t:"🕉 Why 108?",d:"108 is sacred in Vedic tradition: 108 Upanishads, 108 beads on a mala, the distance between Sun & Earth = 108× Sun's diameter, 108 energy lines converge at the heart chakra. In this game, 100 squares test your karma — the final 8 test your soul."},
          {t:"🪷 Ashtanga Marga (Squares 101-108)",d:"The Sacred 8-fold Path of Patanjali. After square 100, you enter the crown. You move ONLY 1 step per turn (dice roll ignored). Each step asks a RIDDLE about that path's teaching. Correct = +2 Punya. Wrong = Papa + sent backwards. At square 107, you must roll EXACT 1 to reach 108 (Moksha). Navagraha cannot affect you here. No one can swap/push you. You are beyond the material world."},
          {t:"⚡ Karma Victory (30 Punya)",d:"Accumulate 30 Punya from any square = instant Moksha."},
          {t:"🔯 Sacred Geometry on the Board",d:"The geometric patterns represent ancient Vedic vibrations. Bhuloka: Square grid = material stability, the earthly foundation. Antarloka: Hexagonal patterns = the Star of David / Shatkona, union of Shiva (upward △) and Shakti (downward ▽). Svargaloka: Circular mandalas = cosmic unity, the celestial sphere. The Sri Yantra triangles in the Ashtanga crown represent the 9 interlocking triangles of creation."},
          {t:"☠️ Playing vs Yama",d:"Solo mode vs the God of Death. Yama favours Papa 60%. Can you stay purer than Death?"},
        ].map((s,i)=><div key={i} style={{background:"rgba(20,16,10,.5)",border:"1px solid rgba(200,160,60,.1)",padding:14,borderRadius:4,marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:700,color:"#f0d050",marginBottom:6}}>{s.t}</div>
          <p style={{fontSize:12,color:"#c0b080",lineHeight:1.8,margin:0}}>{s.d}</p>
        </div>)}
      </div>
    </div>}
    {showRiddles&&<div key="riddles-panel" style={{position:"fixed",inset:0,background:"rgba(6,5,3,.95)",zIndex:300,overflowY:"auto",padding:"clamp(12px,3vw,24px)",animation:"fadeIn .3s ease"}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontSize:"clamp(18px,4vw,28px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:0}}>🪷 Ashtanga Riddles</h2>
          <button className="gb" onClick={()=>setShowRiddles(false)} style={{padding:"6px 16px",fontSize:12}}>✕ Close</button>
        </div>
        {Object.entries(ASHTANGA_RIDDLES).map(([step,riddles])=>{
          const sq=SACRED_PATH[+step-101];
          return(<div key={step}>
            <h3 style={{fontSize:14,color:"#f0d050",letterSpacing:3,borderBottom:"1px solid rgba(200,160,60,.15)",paddingBottom:6,margin:"16px 0 10px"}}>{sq?.icon} {sq?.skt} · {sq?.en} (Sq {step})</h3>
            {riddles.map((r,i)=><div key={i} style={{background:"rgba(20,16,10,.4)",border:"1px solid rgba(200,160,60,.08)",padding:10,borderRadius:4,marginBottom:6}}>
              <div style={{fontSize:12,color:"#e8c850",fontWeight:700,marginBottom:4}}>Q: {r.q}</div>
              <div style={{fontSize:11,color:"#80c080"}}>✓ {r.a[r.correct]}</div>
              <div style={{fontSize:11,color:"#c08080"}}>✗ {r.a[1-r.correct]}</div>
            </div>)}
          </div>)
        })}
      </div>
    </div>}
    {/* ═══ PROFILE DASHBOARD ═══ */}
    {showProfile&&<div key="profile-panel" style={{position:"fixed",inset:0,background:"rgba(6,5,3,.97)",zIndex:350,overflowY:"auto",animation:"fadeIn .3s ease"}}>
      <button onClick={()=>setShowProfile(false)} style={{position:"fixed",top:16,right:16,background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"6px 16px",fontSize:11,cursor:"pointer",borderRadius:3,zIndex:401,fontFamily:"'Cinzel',serif"}}>✕ Close</button>
      <div style={{maxWidth:600,margin:"0 auto",padding:"clamp(16px,4vw,32px)"}}>
        {!auth.user?(
          <div style={{textAlign:"center",marginTop:"12vh"}}>
            <div style={{fontSize:48,marginBottom:16}}>🪷</div>
            <h2 style={{fontSize:"clamp(24px,6vw,38px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:"0 0 8px"}}>Your Karma Awaits</h2>
            <p style={{color:"#8a7a50",fontSize:13,lineHeight:1.8,marginBottom:30,maxWidth:400,margin:"0 auto 30px"}}>Sign in to save your journey across lifetimes. Track Punya and Papa, climb the sacred leaderboard, and carry your karma from game to game.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
              <button onClick={auth.signInGoogle} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 24px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(200,160,60,.2)",borderRadius:6,cursor:"pointer",color:"#e8c850",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:1,width:260,justifyContent:"center"}}><GoogleIcon/>Continue with Google</button>
              <div style={{fontSize:9,opacity:.25,letterSpacing:2,marginTop:6}}>SIGN IN TO SAVE YOUR KARMA</div>
            </div>
            <div style={{marginTop:40,padding:20,background:"rgba(200,160,60,.03)",borderRadius:8,border:"1px solid rgba(200,160,60,.06)",textAlign:"left"}}>
              <div style={{fontSize:11,color:"#8a7a50",letterSpacing:2,marginBottom:12,textAlign:"center"}}>WHY SIGN IN?</div>
              {[["🔱","Game history saved across sessions"],["📊","Track Punya, Papa, and karma score"],["🏆","Compete on the global leaderboard"],["🪷","See your Ashtanga riddle accuracy"],["🔄","Continue where you left off"]].map(([icon,text],i)=><div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 0",fontSize:12,color:"#c0b080"}}><span style={{fontSize:16}}>{icon}</span>{text}</div>)}
            </div>
          </div>
        ):(()=>{
          const p=auth.profile||{};
          const ks=(p.total_punya_earned||0)-(p.total_papa_earned||0);
          const wr=p.total_games>0?Math.round((p.total_wins/p.total_games)*100):0;
          const ra=(p.total_riddles_correct||0)+(p.total_riddles_wrong||0)>0?Math.round((p.total_riddles_correct/((p.total_riddles_correct||0)+(p.total_riddles_wrong||0)))*100):0;
          return<>
            {/* Profile Header */}
            <div style={{textAlign:"center",marginBottom:24}}>
              {(p.avatar_url||auth.user?.user_metadata?.avatar_url)?<img src={p.avatar_url||auth.user?.user_metadata?.avatar_url} alt="" referrerPolicy="no-referrer" style={{width:72,height:72,borderRadius:"50%",border:"2px solid rgba(240,200,80,.3)",boxShadow:"0 0 30px rgba(240,200,80,.1)",marginBottom:12}}/>:<div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,rgba(240,200,80,.2),rgba(200,160,60,.1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:"#f0d050",border:"2px solid rgba(240,200,80,.2)",margin:"0 auto 12px",fontFamily:"'Yatra One',serif"}}>{(p.display_name||auth.user?.user_metadata?.full_name||"S").charAt(0)}</div>}
              <h2 style={{fontSize:"clamp(22px,5vw,32px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:"0 0 4px"}}>{p.display_name||auth.user?.user_metadata?.full_name||"Seeker"}</h2>
              <div style={{fontSize:12,color:"#a09060",letterSpacing:1,marginTop:2}}>{p.email||auth.user?.email||""}</div>
              <div style={{display:"inline-flex",gap:8,alignItems:"center",padding:"4px 16px",marginTop:10,background:ks>=0?"rgba(100,200,100,.08)":"rgba(200,80,60,.08)",border:`1px solid ${ks>=0?"rgba(100,200,100,.15)":"rgba(200,80,60,.15)"}`,borderRadius:20,fontSize:13,color:ks>=0?"#80c080":"#e08060",fontFamily:"'Cinzel',serif"}}>{ks>=0?"☀":"🌑"} Karma: {ks>=0?"+":""}{ks}</div>
            </div>
            {/* Tabs */}
            <div style={{display:"flex",gap:6,marginBottom:20,justifyContent:"center",flexWrap:"wrap"}}>
              {[["overview","🔱 Overview"],["history","📜 Past Lives"],["leaderboard","🪶 Agrasandhani"]].map(([key,label])=><button key={key} onClick={()=>{setProfileTab(key);if(key==="history"&&auth.user){setHistLoading(true);GameDB.getHistory(auth.user.id).then(d=>{setGameHistory(d);setHistLoading(false)})}if(key==="leaderboard")GameDB.getLeaderboard().then(d=>setLeaderboard(d))}} style={{padding:"6px 16px",fontSize:11,borderRadius:20,cursor:"pointer",border:`1px solid ${profileTab===key?"rgba(240,200,80,.4)":"rgba(200,160,60,.15)"}`,background:profileTab===key?"rgba(240,200,80,.1)":"transparent",color:profileTab===key?"#f0d050":"#8a7a50",fontFamily:"'Cinzel',serif",letterSpacing:1}}>{label}</button>)}
            </div>
            {/* Overview */}
            {profileTab==="overview"&&<>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:16}}>
                {[[p.total_games||0,"GAMES"],[p.total_wins||0,"VICTORIES"],[p.total_punya_earned||0,"PUNYA","#80c080"],[p.total_papa_earned||0,"PAPA","#e08060"]].map(([v,l,c],i)=><div key={i} style={{background:"rgba(240,200,80,.04)",border:"1px solid rgba(200,160,60,.08)",borderRadius:6,padding:"12px 10px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:c||"#f0d050",fontFamily:"'Cinzel',serif"}}>{v}</div><div style={{fontSize:10,color:"#8a7a50",letterSpacing:1,marginTop:4}}>{l}</div></div>)}
              </div>
              <div style={{background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.1)",borderRadius:8,padding:16,marginBottom:12}}>
                <div style={{fontSize:12,color:"#f0d050",letterSpacing:2,marginBottom:12,fontWeight:700}}>JOURNEY STATS</div>
                {[["Win Rate",wr+"%"],["Moksha Victories",p.total_moksha_wins||0,"#f0d050"],["Karma Victories",p.total_karma_wins||0,"#80c080"],["Snakes Bitten",p.total_snakes_hit||0,"#e08060"],["Ladders Climbed",p.total_ladders_climbed||0,"#f0d050"],["Highest Square",p.highest_square_reached||1],["Riddle Accuracy",ra+"%"+" ("+(p.total_riddles_correct||0)+"/"+(((p.total_riddles_correct||0)+(p.total_riddles_wrong||0)))+")"],["Favorite Character",p.favorite_character||"—"]].map(([l,v,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(200,160,60,.06)",fontSize:12}}><span style={{color:"#8a7a50"}}>{l}</span><span style={{color:c||"#e8c850",fontWeight:600}}>{v}</span></div>)}
              </div>
              {/* Karma Bar */}
              <div style={{background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.1)",borderRadius:8,padding:16}}>
                <div style={{fontSize:12,color:"#f0d050",letterSpacing:2,marginBottom:10,fontWeight:700}}>KARMA BALANCE</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:10,color:"#80c080",width:45,textAlign:"right"}}>Punya</span>
                  <div style={{flex:1,height:8,background:"rgba(20,16,10,.4)",borderRadius:4,overflow:"hidden",position:"relative"}}>
                    {((p.total_punya_earned||0)+(p.total_papa_earned||0))>0&&<><div style={{position:"absolute",left:0,top:0,bottom:0,width:`${((p.total_punya_earned||0)/((p.total_punya_earned||0)+(p.total_papa_earned||0)))*100}%`,background:"linear-gradient(90deg,#80c080,#60a060)",borderRadius:4}}/><div style={{position:"absolute",right:0,top:0,bottom:0,width:`${((p.total_papa_earned||0)/((p.total_punya_earned||0)+(p.total_papa_earned||0)))*100}%`,background:"linear-gradient(90deg,#c06040,#e08060)",borderRadius:4}}/></>}
                  </div>
                  <span style={{fontSize:10,color:"#e08060",width:45}}>Papa</span>
                </div>
                <div style={{textAlign:"center",fontSize:10,color:"#8a7a50",marginTop:6}}>{ks>0?"Your soul leans toward liberation ☀":ks<0?"Darkness clouds your path 🌑":"Perfectly balanced ⚖"}</div>
              </div>
              {/* ═══ VEDIC ZODIAC — Birth date + Rashi ═══ */}
              <div style={{background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.1)",borderRadius:8,padding:16,marginTop:12}}>
                <div style={{fontSize:12,color:"#f0d050",letterSpacing:2,marginBottom:10,fontWeight:700}}>VEDIC RASHI · YOUR COSMIC IDENTITY</div>
                {(!birthDate||editingBirth)?(()=>{
                  // Pre-fill dropdowns if editing existing date
                  const existing=birthDate?new Date(birthDate):null;
                  const exDay=existing?existing.getDate():"";
                  const exMonth=existing?existing.getMonth()+1:"";
                  const exYear=existing?existing.getFullYear():"";
                  return<div style={{textAlign:"center",padding:"10px 0"}}>
                    <div style={{fontSize:11,color:"#8a7a50",marginBottom:12}}>{editingBirth?"Update your birth date":"Select your birth date to discover your Vedic Rashi"}</div>
                    <div style={{display:"flex",gap:8,justifyContent:"center",alignItems:"center",flexWrap:"wrap"}}>
                      <select id="bd-day" defaultValue={exDay} style={{background:"rgba(240,200,80,.06)",border:"1px solid rgba(200,160,60,.2)",borderRadius:6,padding:"8px 10px",color:"#e8c850",fontSize:13,fontFamily:"'Cinzel',serif",cursor:"pointer",appearance:"auto"}}>
                        <option value="" disabled>Day</option>
                        {Array.from({length:31},(_,i)=><option key={i+1} value={i+1} style={{background:"#1a1408",color:"#e8c850"}}>{i+1}</option>)}
                      </select>
                      <select id="bd-month" defaultValue={exMonth} style={{background:"rgba(240,200,80,.06)",border:"1px solid rgba(200,160,60,.2)",borderRadius:6,padding:"8px 10px",color:"#e8c850",fontSize:13,fontFamily:"'Cinzel',serif",cursor:"pointer",appearance:"auto"}}>
                        <option value="" disabled>Month</option>
                        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=><option key={i} value={i+1} style={{background:"#1a1408",color:"#e8c850"}}>{m}</option>)}
                      </select>
                      <select id="bd-year" defaultValue={exYear} style={{background:"rgba(240,200,80,.06)",border:"1px solid rgba(200,160,60,.2)",borderRadius:6,padding:"8px 10px",color:"#e8c850",fontSize:13,fontFamily:"'Cinzel',serif",cursor:"pointer",appearance:"auto"}}>
                        <option value="" disabled>Year</option>
                        {Array.from({length:80},(_,i)=><option key={i} value={2010-i} style={{background:"#1a1408",color:"#e8c850"}}>{2010-i}</option>)}
                      </select>
                    </div>
                    <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
                      <button onClick={()=>{
                        const day=document.getElementById("bd-day")?.value;
                        const month=document.getElementById("bd-month")?.value;
                        const year=document.getElementById("bd-year")?.value;
                        if(!day||!month||!year){alert("Please select day, month, and year");return}
                        saveBirthDate(`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`);
                      }} style={{background:"rgba(240,200,80,.08)",border:"1px solid rgba(200,160,60,.25)",borderRadius:6,padding:"8px 20px",color:"#e8c850",fontSize:12,fontFamily:"'Cinzel',serif",cursor:"pointer",letterSpacing:2}}>
                        {editingBirth?"UPDATE ✦":"REVEAL MY RASHI ✦"}
                      </button>
                      {editingBirth&&<button onClick={()=>setEditingBirth(false)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.15)",borderRadius:6,padding:"8px 16px",color:"#8a7a50",fontSize:11,cursor:"pointer",fontFamily:"'Cinzel',serif"}}>Cancel</button>}
                    </div>
                  </div>
                })():(()=>{
                  const d=new Date(birthDate);
                  if(isNaN(d.getTime()))return<div style={{textAlign:"center",padding:10}}><div style={{color:"#e08060",fontSize:11}}>Invalid date</div><button onClick={()=>{setBirthDate("");localStorage.removeItem("mp108_birth");setEditingBirth(true)}} style={{marginTop:8,background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#8a7a50",padding:"4px 12px",fontSize:10,cursor:"pointer",borderRadius:3}}>Reset</button></div>;
                  const rashi=getZodiac(d.getMonth()+1,d.getDate());
                  if(!rashi)return null;
                  return<div>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                      <div style={{fontSize:36,minWidth:44,textAlign:"center"}}>{rashi.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:16,color:"#f0d050",fontWeight:700,fontFamily:"'Cinzel',serif"}}>{rashi.skt} · {rashi.en}</div>
                        <div style={{fontSize:11,color:"#8a7a50"}}>{rashi.name} · {rashi.element} · Ruled by {rashi.planet}</div>
                        <div style={{fontSize:10,color:"#6a5a38"}}>{rashi.dates} · Born: {d.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
                      </div>
                      <button onClick={()=>setEditingBirth(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.15)",color:"#8a7a50",padding:"4px 10px",fontSize:10,cursor:"pointer",borderRadius:4,fontFamily:"'Cinzel',serif"}}>Edit</button>
                    </div>
                    <div style={{background:"rgba(240,200,80,.03)",border:"1px solid rgba(200,160,60,.06)",borderRadius:6,padding:12,marginBottom:10}}>
                      <div style={{fontSize:10,letterSpacing:2,color:"#8a7a50",marginBottom:6}}>VEDIC MEANING</div>
                      <div style={{fontSize:11,color:"#c0b080",lineHeight:1.8}}>{rashi.meaning}</div>
                    </div>
                    <div style={{background:"rgba(100,200,100,.03)",border:"1px solid rgba(100,200,100,.06)",borderRadius:6,padding:12}}>
                      <div style={{fontSize:10,letterSpacing:2,color:"#80c080",marginBottom:6}}>DHARMIC GUIDANCE</div>
                      <div style={{fontSize:11,color:"#a0c0a0",lineHeight:1.8}}>{rashi.advice}</div>
                    </div>
                  </div>
                })()}
              </div>
            </>}
            {/* History */}
            {profileTab==="history"&&<>{histLoading?<div style={{textAlign:"center",padding:40,color:"#5a4a30",fontSize:12}}>Loading past lives...</div>:gameHistory.length===0?<div style={{textAlign:"center",padding:40,color:"#5a4a30",fontSize:12,fontStyle:"italic"}}>No past lives recorded. Your journey begins with the first roll.</div>:gameHistory.map(g=>{
              // Parse players data from graha_effects
              let gamePlayers=[];let grahaHits={};
              try{const ge=typeof g.graha_effects==="string"?JSON.parse(g.graha_effects):g.graha_effects;gamePlayers=ge?.players||[];grahaHits=ge?.grahaHits||{}}catch(e){}
              const duration=g.duration_seconds?`${Math.floor(g.duration_seconds/60)}m ${g.duration_seconds%60}s`:"—";
              return<div key={g.id} style={{background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.1)",borderRadius:8,padding:14,marginBottom:12}}>
              {/* Header row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:22}}>{g.character_icon||"🔱"}</span>
                  <div>
                    <div style={{fontSize:13,color:"#f0d050",fontWeight:700,fontFamily:"'Cinzel',serif"}}>{g.character_name}</div>
                    <div style={{fontSize:10,color:"#8a7a50"}}>{g.opponent_type==="yama"?"vs Yama":"Multiplayer"} · {g.total_turns} turns · {duration}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:10,padding:"3px 10px",borderRadius:10,background:g.result==="moksha_win"?"rgba(240,200,80,.12)":g.result==="karma_win"?"rgba(100,200,100,.12)":"rgba(200,80,60,.12)",color:g.result==="moksha_win"?"#f0d050":g.result==="karma_win"?"#80c080":"#e08060",border:`1px solid ${g.result==="moksha_win"?"rgba(240,200,80,.2)":g.result==="karma_win"?"rgba(100,200,100,.2)":"rgba(200,80,60,.2)"}`}}>{g.result==="moksha_win"?"ॐ MOKSHA":g.result==="karma_win"?"☀ KARMA WIN":"🌑 LOSS"}</span>
                  <div style={{fontSize:9,color:"#5a4a30",marginTop:4}}>{new Date(g.played_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                </div>
              </div>
              {/* All players scoreboard */}
              {gamePlayers.length>0&&<div style={{background:"rgba(10,8,5,.4)",border:"1px solid rgba(200,160,60,.06)",borderRadius:6,overflow:"hidden",marginBottom:8}}>
                <div style={{fontSize:9,letterSpacing:2,color:"#5a4a30",padding:"6px 10px",borderBottom:"1px solid rgba(200,160,60,.06)"}}>ALL PLAYERS</div>
                {gamePlayers.map((pl,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderBottom:i<gamePlayers.length-1?"1px solid rgba(200,160,60,.04)":"none",background:pl.isWinner?"rgba(240,200,80,.04)":"transparent"}}>
                  <span style={{fontSize:16,minWidth:22}}>{pl.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,color:pl.isWinner?"#f0d050":"#c0b080",fontWeight:pl.isWinner?700:400,display:"flex",alignItems:"center",gap:4}}>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pl.name}</span>
                      {pl.cpu&&<span style={{fontSize:8,color:"#806060",border:"1px solid rgba(160,64,64,.2)",padding:"0 4px",borderRadius:3}}>CPU</span>}
                      {pl.isWinner&&<span style={{fontSize:8,color:"#f0d050",border:"1px solid rgba(240,200,80,.3)",padding:"0 4px",borderRadius:3}}>WINNER</span>}
                    </div>
                    <div style={{fontSize:10,color:"#6a5a38"}}>{pl.character} · Sq {pl.square}</div>
                  </div>
                  <div style={{display:"flex",gap:8,fontSize:10}}>
                    <span style={{color:"#80c080"}}>{pl.punya}P</span>
                    <span style={{color:"#e08060"}}>{pl.papa}Pa</span>
                  </div>
                </div>)}
              </div>}
              {/* Game stats row */}
              <div style={{display:"flex",gap:10,fontSize:10,color:"#8a7a50",flexWrap:"wrap"}}>
                <span style={{color:"#80c080"}}>+{g.final_punya} punya</span>
                <span style={{color:"#e08060"}}>+{g.final_papa} papa</span>
                <span>Sq {g.final_square}</span>
                {g.snakes_hit>0&&<span>🐍 {g.snakes_hit}</span>}
                {g.ladders_climbed>0&&<span>🪔 {g.ladders_climbed}</span>}
                {g.riddles_correct>0&&<span>🪷 {g.riddles_correct}/{g.riddles_correct+g.riddles_wrong}</span>}
                {g.ashtanga_reached&&<span style={{color:"#f0d050"}}>⚡ Ashtanga</span>}
              </div>
              {/* Graha effects breakdown */}
              {Object.values(grahaHits).some(v=>v>0)&&<div style={{marginTop:8,padding:"8px 10px",background:"rgba(10,8,5,.4)",border:"1px solid rgba(200,160,60,.06)",borderRadius:6}}>
                <div style={{fontSize:9,letterSpacing:2,color:"#5a4a30",marginBottom:6}}>GRAHA INFLUENCES</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {[["☀","sun","#f0b840"],["☾","moon","#a0c8e0"],["♂","mars","#e07050"],["☿","mercury","#80c080"],["♃","jupiter","#f0d060"],["♀","venus","#d0a0c0"],["♄","saturn","#8080a0"],["☊","rahu","#6050a0"],["☋","ketu","#a06060"]].map(([icon,key,color])=>grahaHits[key]>0&&<span key={key} style={{fontSize:10,padding:"2px 6px",background:`${color}15`,border:`1px solid ${color}30`,borderRadius:8,color:color,display:"flex",alignItems:"center",gap:3}}>
                    <span style={{fontSize:12}}>{icon}</span>{grahaHits[key]}
                  </span>)}
                </div>
                {(()=>{const max=Object.entries(grahaHits).reduce((a,b)=>b[1]>a[1]?b:a,["",0]);const grNames={sun:"Surya ☀",moon:"Chandra ☾",mars:"Mangal ♂",mercury:"Budh ☿",jupiter:"Brihaspati ♃",venus:"Shukra ♀",saturn:"Shani ♄",rahu:"Rahu ☊",ketu:"Ketu ☋"};return max[1]>1?<div style={{fontSize:9,color:"#8a7a50",marginTop:4,fontStyle:"italic"}}>{grNames[max[0]]||max[0]} influenced you most ({max[1]} times)</div>:null})()}
              </div>}
            </div>})}</>}
            {/* अग्रसंधानी — The Eternal Ledger */}
            {profileTab==="leaderboard"&&<div style={{background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.1)",borderRadius:8,overflow:"hidden"}}>{leaderboard.length===0?<div style={{textAlign:"center",padding:30,color:"#5a4a30",fontSize:12}}>चित्रगुप्त की कलम तैयार है · Chitragupta's quill awaits the first soul.</div>:leaderboard.map((lb,i)=>{const isMe=auth.user&&lb.id===auth.user.id;const lks=(lb.total_punya_earned||0)-(lb.total_papa_earned||0);return<div key={lb.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid rgba(200,160,60,.06)",background:isMe?"rgba(240,200,80,.06)":"transparent"}}>
              <div style={{width:28,textAlign:"center",fontSize:i<3?16:12,color:i===0?"#f0d050":i===1?"#c0c0c0":i===2?"#cd7f32":"#8a7a50",fontWeight:700}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</div>
              {lb.avatar_url?<img src={lb.avatar_url} alt="" style={{width:28,height:28,borderRadius:"50%",border:isMe?"2px solid rgba(240,200,80,.4)":"1px solid rgba(200,160,60,.1)"}} referrerPolicy="no-referrer"/>:<div style={{width:28,height:28,borderRadius:"50%",background:"rgba(240,200,80,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#c0b080"}}>{(lb.display_name||"S").charAt(0)}</div>}
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:isMe?"#f0d050":"#c0b080",fontWeight:isMe?700:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lb.display_name}{isMe?" (you)":""}</div><div style={{fontSize:10,color:"#8a7a50"}}>{lb.total_games} games · {lb.total_wins} wins</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:700,color:lks>=0?"#80c080":"#e08060",fontFamily:"'Cinzel',serif"}}>{lks>=0?"+":""}{lks}</div><div style={{fontSize:9,color:"#8a7a50"}}>karma</div></div>
            </div>})}</div>}
            {/* Sign Out */}
            <div style={{textAlign:"center",marginTop:24}}><button onClick={async()=>{await auth.signOut();setShowProfile(false)}} style={{background:"transparent",border:"1px solid rgba(200,80,60,.2)",color:"#c08060",padding:"8px 24px",fontSize:11,cursor:"pointer",borderRadius:3,fontFamily:"'Cinzel',serif",letterSpacing:2,opacity:.6}}>Sign Out</button></div>
          </>})()}
        {/* Footer */}
        <div style={{textAlign:"center",padding:"24px 0 10px",borderTop:"1px solid rgba(200,160,60,.06)",marginTop:24}}>
          <div style={{fontSize:11,color:"#a09060",letterSpacing:2}}>MOKSHA PATAM 108 · मोक्ष पटम् १०८</div>
          <div style={{fontSize:10,color:"#7a6a40",letterSpacing:1,marginTop:4}}>© {new Date().getFullYear()} RasaVisio · All rights reserved</div>
        </div>
      </div>
    </div>}
  </>;

  // ═══ TITLE ═══
  if(screen==="title")return(
    <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 20px 60px",minHeight:"100vh",overflowY:"auto"}}>
      {globalOverlays}

      {/* Main content */}
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:520}}>
        <div style={{fontSize:42,marginBottom:8,animation:"pulse 3s ease infinite"}}>🔱</div>
        <h1 style={{fontSize:"clamp(32px,8vw,64px)",fontFamily:"'Yatra One',serif",margin:"0 0 4px",letterSpacing:4,textShadow:"0 2px 10px rgba(0,0,0,.7)",color:"#f0d050",animation:"reveal 1.5s ease",textAlign:"center"}}>मोक्ष पटम् १०८</h1>
        <div style={{fontSize:"clamp(12px,2.5vw,20px)",letterSpacing:10,fontFamily:"'Cinzel Decorative',serif",fontWeight:700,opacity:.5,animation:"reveal 1.5s ease .2s both"}}>MOKSHA PATAM 108</div>
        <div style={{fontSize:"clamp(7px,1.2vw,10px)",letterSpacing:6,opacity:.2,marginTop:3}}>THE ANCIENT GAME OF KARMA</div>

        {/* Divider with naga knot */}
        <div style={{position:"relative",width:120,height:16,margin:"16px 0"}}>
          <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(240,200,80,.3),transparent)"}}/>
          <svg style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:20,height:20,opacity:.4}} viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="4" fill="none" stroke="#f0d050" strokeWidth=".8"/>
            <circle cx="10" cy="10" r="1.5" fill="#f0d050" opacity=".5"/>
          </svg>
        </div>

        {/* Shloka */}
        <div style={{textAlign:"center",opacity:shF?1:0,transition:"all .8s",marginBottom:16,minHeight:50}}>
          <div style={{fontSize:"clamp(12px,2.2vw,16px)",fontFamily:"'Noto Serif Devanagari',serif",lineHeight:2,color:"#f0d050",opacity:.65}}>{shl.s}</div>
          <div style={{fontSize:9,opacity:.3,fontFamily:"'Noto Serif Devanagari',serif",marginTop:2}}>{shl.r}</div>
        </div>

        <div style={{fontSize:"clamp(9px,1.2vw,11px)",fontStyle:"italic",opacity:.25,marginBottom:20,letterSpacing:2,textAlign:"center"}}>"Rise through virtue. Fall through vice. Seek liberation."</div>

        {/* ═══ MANDATORY LOGIN GATE ═══ */}
        {!auth.user && !auth.loading ? (
          <div style={{width:"100%",animation:"reveal 1.5s ease .3s both"}}>
            {/* Login card */}
            <div style={{background:"linear-gradient(180deg,rgba(240,200,80,.04),rgba(240,200,80,.01))",border:"1px solid rgba(200,160,60,.15)",borderRadius:12,padding:"24px 20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
              {/* Subtle cymatics pattern inside card */}
              <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:.03,pointerEvents:"none"}} viewBox="0 0 300 200">
                <circle cx="150" cy="100" r="60" fill="none" stroke="#c0a040" strokeWidth=".5"/>
                <circle cx="150" cy="100" r="90" fill="none" stroke="#c0a040" strokeWidth=".3"/>
              </svg>
              <div style={{fontSize:11,letterSpacing:4,color:"#8a7a50",marginBottom:14,position:"relative"}}>ENTER THE SACRED BOARD</div>
              <button onClick={auth.signInGoogle} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 28px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(200,160,60,.25)",borderRadius:8,cursor:"pointer",color:"#e8c850",fontSize:14,fontFamily:"'Cinzel',serif",letterSpacing:2,margin:"0 auto",transition:"all .3s",position:"relative"}}>
                <GoogleIcon/>Sign in with Google
              </button>
              <div style={{fontSize:9,color:"#5a4a30",marginTop:12,lineHeight:1.7}}>
                Sign in to save your karma across lifetimes<br/>
                Track Punya, Papa, and climb the sacred leaderboard
              </div>
            </div>
          </div>
        ) : auth.loading ? (
          <div style={{fontSize:12,color:"#8a7a50",opacity:.5,animation:"pulse 1.5s ease infinite"}}>Connecting to the cosmos...</div>
        ) : (
          /* ═══ SIGNED IN — Show game options ═══ */
          <div style={{width:"100%",animation:"reveal 1s ease"}}>
            {/* Signed in badge */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16}}>
              {auth.profile?.avatar_url?<img src={auth.profile.avatar_url} alt="" style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid rgba(240,200,80,.3)"}} referrerPolicy="no-referrer"/>:<div style={{width:28,height:28,borderRadius:"50%",background:"rgba(240,200,80,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#f0d050"}}>🪷</div>}
              <span style={{fontSize:12,color:"#c0b080"}}>{auth.profile?.display_name||auth.user?.user_metadata?.full_name||auth.user?.email?.split("@")[0]||"Seeker"}</span>
              <button onClick={()=>{setShowProfile(true);setProfileTab("overview")}} style={{background:"transparent",border:"1px solid rgba(200,160,60,.12)",color:"#8a7a50",padding:"2px 10px",fontSize:9,cursor:"pointer",borderRadius:12,fontFamily:"'Cinzel',serif",letterSpacing:1}}>Profile</button>
            </div>

            {/* Language selector — compact pills */}
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#5a4a30",alignSelf:"center",marginRight:4}}>VOICE</div>
              <button onClick={()=>{setChosenLang('en');ambient.start()}} style={{padding:"5px 14px",background:chosenLang==='en'?"rgba(240,200,80,.12)":"transparent",border:`1px solid ${chosenLang==='en'?"rgba(240,200,80,.5)":"rgba(200,160,60,.15)"}`,borderRadius:16,color:chosenLang==='en'?"#f0d050":"#8a7a50",fontSize:11,cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:1,transition:"all .2s"}}>EN</button>
              <button onClick={()=>{setChosenLang('hi');ambient.start()}} style={{padding:"5px 14px",background:chosenLang==='hi'?"rgba(240,200,80,.12)":"transparent",border:`1px solid ${chosenLang==='hi'?"rgba(240,200,80,.5)":"rgba(200,160,60,.15)"}`,borderRadius:16,color:chosenLang==='hi'?"#f0d050":"#8a7a50",fontSize:11,cursor:"pointer",fontFamily:"'Noto Serif Devanagari',serif",letterSpacing:1,transition:"all .2s"}}>हिन्दी</button>
            </div>

            {/* Action buttons */}
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="gb gp" onClick={()=>{
                ambient.start();
                navigateTo("story"); setStoryPage(0);
              }} style={{fontSize:13,padding:"12px 28px",letterSpacing:2}}>
                📜 BEGIN STORY
              </button>
              <button className="gb" onClick={()=>{ambient.start();navigateTo("pickcount")}} style={{fontSize:13,padding:"12px 28px",letterSpacing:2,opacity:.5}}>⚡ PLAY</button>
            </div>

            <div style={{marginTop:8,opacity:.12,fontSize:8,textAlign:"center"}}>Screen text = English · Voice = your choice</div>

            {/* Utilities row */}
            <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12,flexWrap:"wrap"}}>
              <button onClick={()=>setShowGuide(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.1)",color:"#8a7a50",padding:"3px 10px",fontSize:9,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1}}>📜 Rules</button>
              <button onClick={()=>setShowInfo(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.1)",color:"#8a7a50",padding:"3px 10px",fontSize:9,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1}}>📖 Encyclopaedia</button>
            </div>
            <div style={{marginTop:8,textAlign:"center"}}><InstaBadge/></div>
          </div>
        )}
      </div>

      {/* ═══ COPYRIGHT FOOTER — not fixed, flows at bottom ═══ */}
      <div style={{marginTop:"auto",paddingTop:24,textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{fontSize:10,color:"#7a6a40",letterSpacing:2}}>© {new Date().getFullYear()} RasaVisio · All rights reserved</div>
        <div style={{fontSize:9,color:"#5a4a30",letterSpacing:1,marginTop:3}}>Inspired by the ancient game of Moksha Patam · Created in India 🇮🇳</div>
      </div>
    </div>
  );

  // ═══ STORY — redesigned immersive onboarding ═══
  if(screen==="story"){
    const pg=STORY_PAGES[storyPage];
    const isHi=chosenLang==='hi';
    const bullets=(isHi?pg.bullets_hi:pg.bullets_en)||[];
    const vis=pg.visuals?.[0];

    // Determine which visual component to render
    const renderMainVisual=()=>{
      if(!vis) return null;

      if(vis.type==="animatedBoard") return(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:32,paddingTop:4}}>
          <OnboardingBoard mode={vis.mode}/>
          {/* Legend bar */}
          <div style={{display:"flex",gap:16,fontSize:9,letterSpacing:2,color:"#5a4a30",flexWrap:"wrap",justifyContent:"center"}}>
            <span style={{color:"#e06030"}}>𓆙 SERPENTS</span>
            <span style={{color:"rgba(200,160,60,.3)"}}>·</span>
            <span style={{color:"#80c080"}}>↑ VIRTUES</span>
            <span style={{color:"rgba(200,160,60,.3)"}}>·</span>
            <span style={{color:"#f0d050"}}>ॐ MOKSHA</span>
          </div>
        </div>
      );

      if(vis.type==="diceStage") return(
        <DiceStage GRAHA_INFO={GRAHA_INFO} chosenLang={chosenLang} isNarrating={!muted} narrateStartedAt={narrateStartedAt}/>
      );

      if(vis.type==="dharmaStage") return <DharmaStage key={0}/>;
      if(vis.type==="sacredPathStage") return <SacredPathStage key={0} SACRED_PATH={SACRED_PATH}/>;
      if(vis.type==="versus") return(
        <div style={{background:"radial-gradient(ellipse at center,rgba(160,40,40,.12),transparent 70%)",border:"1px solid rgba(160,40,40,.25)",borderRadius:12,padding:"24px 20px",textAlign:"center",animation:"fadeIn .8s ease",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(160,30,30,.08),transparent 60%)",pointerEvents:"none"}}/>
          <div style={{fontSize:56,marginBottom:8,animation:"pulse 3s ease infinite",filter:"drop-shadow(0 0 20px rgba(200,40,40,.5))"}}>{vis.data.icon}</div>
          <div style={{fontSize:18,fontFamily:"'Yatra One',serif",color:"#e08080",letterSpacing:2}}>{vis.data.name}</div>
          <div style={{fontSize:11,color:"#806060",marginTop:6,lineHeight:1.8}}>{vis.data.desc}</div>
          <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:16}}>
            <div style={{background:"rgba(160,40,40,.1)",border:"1px solid rgba(160,40,40,.2)",borderRadius:8,padding:"8px 16px",fontSize:10,color:"#c08080"}}>☠️ 1 vs Yama</div>
            <div style={{background:"rgba(200,160,60,.05)",border:"1px solid rgba(200,160,60,.15)",borderRadius:8,padding:"8px 16px",fontSize:10,color:"#c0b080"}}>👥 2–4 Players</div>
          </div>
        </div>
      );

      return null;
    };

    return(
      <div style={{...PG,minHeight:"100vh",display:"flex",flexDirection:"column",overflowY:"auto"}}>
        {globalOverlays}

        {/* ── Fixed top bar ── */}
        <div style={{position:"fixed",top:0,left:0,right:0,height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",background:"linear-gradient(180deg,rgba(12,10,7,.95),rgba(12,10,7,0))",zIndex:20}}>
          <button onClick={()=>{VoiceEngine.stop();if(storyPage>0)setStoryPage(storyPage-1);else navigateTo("title")}}
            style={{background:"transparent",border:"1px solid rgba(200,160,60,.18)",color:"#8a7a50",padding:"5px 14px",fontSize:10,cursor:"pointer",borderRadius:3,fontFamily:"'Cinzel',serif",letterSpacing:1}}>
            ← Back
          </button>
          {/* Progress bar */}
          <div style={{flex:1,margin:"0 16px",height:3,background:"rgba(200,160,60,.08)",borderRadius:2,position:"relative"}}>
            <div style={{height:"100%",width:`${((storyPage+1)/STORY_PAGES.length)*100}%`,background:"linear-gradient(90deg,rgba(200,160,60,.4),#f0d050)",borderRadius:2,transition:"width .6s cubic-bezier(.4,0,.2,1)"}}/>
            {/* Chapter dots */}
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 2px"}}>
              {STORY_PAGES.map((_,i)=>(
                <div key={i} onClick={()=>{VoiceEngine.stop();setStoryPage(i)}}
                  style={{width:i===storyPage?10:6,height:i===storyPage?10:6,borderRadius:"50%",background:i<=storyPage?"#f0d050":"rgba(200,160,60,.15)",cursor:"pointer",transition:"all .3s",border:i===storyPage?"2px solid rgba(240,200,80,.4)":"none",flexShrink:0}}/>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>{if(!muted){const su=`/onboarding/story-${storyPage}-${chosenLang}.mp3`;setNarrateStartedAt(null);VoiceEngine.speakNarrator(pg[chosenLang],chosenLang,su,()=>setNarrateStartedAt(Date.now()))}else VoiceEngine.stop()}}
              style={{background:"transparent",border:"1px solid rgba(200,160,60,.18)",color:"#c0b080",padding:"5px 10px",fontSize:13,cursor:"pointer",borderRadius:3,lineHeight:1}}>
              🔊
            </button>
            <button onClick={toggleMute}
              style={{background:"transparent",border:"1px solid rgba(200,160,60,.18)",color:muted?"#5a4a30":"#c0b080",padding:"5px 10px",fontSize:11,cursor:"pointer",borderRadius:3}}>
              {muted?"🔇":"🎵"}
            </button>
          </div>
        </div>

        {/* ── Main content — two-column on wide, stacked on mobile ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:72,paddingBottom:80,paddingLeft:"clamp(16px,4vw,32px)",paddingRight:"clamp(16px,4vw,32px)"}}>
          <div style={{width:"100%",maxWidth:700,animation:"slideUp .6s ease"}} key={storyPage}>

            {/* ── Chapter header ── */}
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:"clamp(36px,8vw,52px)",marginBottom:10,animation:"pulse 3s ease infinite",filter:"drop-shadow(0 0 16px rgba(240,200,80,.2))"}}>
                {pg.icon}
              </div>
              <div style={{fontSize:9,letterSpacing:5,color:"#5a4a30",marginBottom:6,fontFamily:"'Cinzel',serif"}}>
                CHAPTER {storyPage+1} OF {STORY_PAGES.length}
              </div>
              <h2 style={{fontSize:"clamp(22px,5vw,34px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:0,textShadow:"0 2px 20px rgba(240,200,80,.2)"}}>
                {pg.title}
              </h2>
              <div style={{width:60,height:1,background:"linear-gradient(90deg,transparent,rgba(240,200,80,.3),transparent)",margin:"14px auto 0"}}/>
            </div>

            {/* ── Responsive layout: full-width for cinematic pages, two-panel otherwise ── */}
            {(vis?.type==="dharmaStage"||vis?.type==="sacredPathStage") ? (
              /* FULL-WIDTH CINEMATIC — bullets stacked above visual */
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {/* Compact bullet row */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
                  {bullets.map((b,bi)=>(
                    <div key={bi} style={{
                      display:"flex",gap:10,alignItems:"flex-start",
                      background:"rgba(20,16,10,.5)",
                      border:`1px solid ${b.accent}18`,
                      borderLeft:`2px solid ${b.accent}`,
                      borderRadius:"0 6px 6px 0",
                      padding:"8px 12px",
                      animation:`slideUp .4s ease ${bi*0.08}s both`,
                    }}>
                      <div style={{width:28,height:28,borderRadius:6,flexShrink:0,background:`${b.accent}12`,border:`1px solid ${b.accent}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{b.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,fontWeight:700,color:b.accent,letterSpacing:.5,marginBottom:2,fontFamily:"'Cinzel',serif"}}>{b.title}</div>
                        <div style={{fontSize:10,color:"#8a7a50",lineHeight:1.6}}>{b.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Full-width visual */}
                <div style={{width:"100%"}}>
                  {renderMainVisual()}
                </div>
              </div>
            ) : (
              /* TWO-PANEL — bullets left, visual right */
              <div style={{display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap"}}>
                {/* LEFT: Bullet list */}
                <div style={{flex:"1 1 260px",minWidth:0}}>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {bullets.map((b,bi)=>(
                      <div key={bi} style={{
                        display:"flex",gap:14,alignItems:"flex-start",
                        background:"rgba(20,16,10,.55)",
                        border:`1px solid ${b.accent}22`,
                        borderLeft:`3px solid ${b.accent}`,
                        borderRadius:"0 8px 8px 0",
                        padding:"12px 14px",
                        animation:`slideUp .5s ease ${bi*0.1}s both`,
                        transition:"background .2s",
                      }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(30,22,12,.7)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(20,16,10,.55)"}
                      >
                        <div style={{width:34,height:34,borderRadius:8,flexShrink:0,background:`${b.accent}15`,border:`1px solid ${b.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{b.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:b.accent,letterSpacing:.5,marginBottom:3,fontFamily:"'Cinzel',serif"}}>{b.title}</div>
                          <div style={{fontSize:11,color:"#a09070",lineHeight:1.7}}>{b.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* RIGHT: Visual */}
                <div style={{flex:"0 0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",paddingTop:4,minWidth:280}}>
                  {renderMainVisual()}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Fixed bottom navigation ── */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"8px 20px 10px",background:"linear-gradient(0deg,rgba(12,10,7,.98) 60%,rgba(12,10,7,0))",display:"flex",flexDirection:"column",alignItems:"center",gap:4,zIndex:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",maxWidth:700,gap:12}}>
            <button onClick={()=>{VoiceEngine.stop();navigateTo("pickcount")}}
              style={{background:"transparent",border:"none",color:"rgba(90,74,48,.5)",fontSize:9,cursor:"pointer",letterSpacing:2,fontFamily:"'Cinzel',serif",flexShrink:0}}>
              SKIP →
            </button>
            <div style={{display:"flex",gap:12,flex:1,justifyContent:"flex-end"}}>
              {storyPage>0&&(
                <button className="gb" onClick={()=>{VoiceEngine.stop();setStoryPage(storyPage-1)}}
                  style={{padding:"10px 22px",fontSize:11,letterSpacing:2}}>
                  ← Prev
                </button>
              )}
              {storyPage<STORY_PAGES.length-1?(
                <button className="gb gp" onClick={()=>{VoiceEngine.stop();setStoryPage(storyPage+1)}}
                  style={{padding:"10px 28px",fontSize:12,letterSpacing:3}}>
                  Next →
                </button>
              ):(
                <button className="gb gp" onClick={()=>{VoiceEngine.stop();navigateTo("pickcount")}}
                  style={{padding:"10px 28px",fontSize:12,letterSpacing:3,animation:"pulse 2s ease infinite"}}>
                  ⚡ Play Now
                </button>
              )}
            </div>
          </div>
          <div style={{fontSize:9,color:"#4a3a28",letterSpacing:1}}>© {new Date().getFullYear()} RasaVisio · All rights reserved · Inspired by the ancient game of Moksha Patam · Created in India 🇮🇳</div>
        </div>
      </div>
    );
  }

  // ═══ PICK COUNT ═══
  if(screen==="pickcount")return(
    <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"20px 20px 80px",overflow:"hidden",position:"relative"}}>
      {globalOverlays}

      {/* ── Animated sine wave canvas ── */}
      <SineWaveBackground/>

      {/* Back */}
      <button onClick={()=>{VoiceEngine.stop();navigateTo("title")}} style={{position:"fixed",top:20,left:20,background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#8a7a50",padding:"5px 14px",fontSize:11,cursor:"pointer",borderRadius:3,fontFamily:"'Cinzel',serif",letterSpacing:1,zIndex:10}}>← Back</button>

      <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:560,animation:"slideUp .8s ease"}}>

        {/* Header */}
        <div style={{fontSize:40,marginBottom:10,filter:"drop-shadow(0 0 20px rgba(240,200,80,.35))",animation:"pulse 3s ease infinite"}}>🔱</div>
        <div style={{fontSize:9,letterSpacing:6,color:"#5a4a30",marginBottom:6,fontFamily:"'Cinzel',serif"}}>CHOOSE YOUR PATH</div>
        <h2 style={{fontSize:"clamp(24px,5vw,38px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:"0 0 4px",textAlign:"center",textShadow:"0 0 30px rgba(240,200,80,.25)"}}>How Many Seekers?</h2>
        <p style={{fontSize:12,opacity:.3,marginBottom:32,letterSpacing:4,fontFamily:"'Cinzel',serif",textAlign:"center"}}>Each soul walks a different path</p>

        {/* Mode cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,width:"100%",marginBottom:14}}>

          {/* 1 vs Yama — full width, special */}
          <div onClick={()=>{setNP(2);setIsCPU([false,true]);setPlayers([]);setUsedChars([]);setTempName("");setTempChar(-1);navigateTo("yama")}}
            style={{
              gridColumn:"1 / -1",
              background:"linear-gradient(135deg,rgba(160,40,40,.18),rgba(80,20,20,.25))",
              border:"1.5px solid rgba(180,50,50,.35)",
              borderRadius:14,padding:"22px 24px",
              cursor:"pointer",display:"flex",alignItems:"center",gap:20,
              transition:"all .3s cubic-bezier(.34,1.56,.64,1)",
              boxShadow:"0 0 40px rgba(160,40,40,.08),inset 0 0 30px rgba(0,0,0,.2)",
              position:"relative",overflow:"hidden",
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 40px rgba(160,40,40,.2),inset 0 0 30px rgba(0,0,0,.2)";e.currentTarget.style.borderColor="rgba(200,60,60,.6)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 0 40px rgba(160,40,40,.08),inset 0 0 30px rgba(0,0,0,.2)";e.currentTarget.style.borderColor="rgba(180,50,50,.35)"}}>
            {/* Radial glow */}
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 20% 50%,rgba(160,40,40,.15),transparent 60%)",pointerEvents:"none"}}/>
            <div style={{fontSize:52,filter:"drop-shadow(0 0 16px rgba(200,40,40,.6))",flexShrink:0,animation:"pulse 3s ease infinite"}}>☠️</div>
            <div style={{flex:1}}>
              <div style={{fontSize:18,fontFamily:"'Yatra One',serif",color:"#e08080",letterSpacing:2,marginBottom:4}}>1 vs Yama</div>
              <div style={{fontSize:11,color:"#906060",lineHeight:1.7}}>Face the God of Death alone. Yama plays every turn — cold, karmic, inevitable. Can your dharma outlast Death?</div>
              <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                {["☠️ CPU opponent","⚡ Instant start","🎲 Hardest karma test"].map((t,i)=>(
                  <span key={i} style={{fontSize:9,padding:"2px 8px",borderRadius:10,background:"rgba(160,40,40,.12)",border:"1px solid rgba(160,40,40,.2)",color:"#c07070",letterSpacing:1}}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{fontSize:20,color:"rgba(200,80,80,.4)",flexShrink:0}}>▸</div>
          </div>

          {/* 2, 3, 4 player cards */}
          {[
            {n:2,icon:"👥",label:"2 Players",desc:"Sacred duel. Two souls, one board, one Moksha.",tags:["⚔️ Head to head","🔱 Classic"]},
            {n:3,icon:"🧘",label:"3 Players",desc:"The dharmic triangle. Alliance and betrayal.",tags:["🌌 3-way","⚖ Complex"]},
            {n:4,icon:"🕉",label:"4 Players",desc:"Four cardinal paths. Maximum chaos and karma.",tags:["🎭 Full house","🔱 Epic"]}
          ].map(({n,icon,label,desc,tags})=>(
            <div key={n}
              onClick={()=>{setNP(n);setIsCPU(Array(n).fill(false));setPlayers([]);setUsedChars([]);setTempName("");setTempChar(-1);navigateTo("setup")}}
              style={{
                background:"linear-gradient(135deg,rgba(30,24,14,.7),rgba(20,16,10,.8))",
                border:"1px solid rgba(200,160,60,.18)",
                borderRadius:12,padding:"18px 16px",
                cursor:"pointer",display:"flex",flexDirection:"column",gap:8,
                transition:"all .3s cubic-bezier(.34,1.56,.64,1)",
                boxShadow:"inset 0 0 20px rgba(0,0,0,.2)",
                position:"relative",overflow:"hidden",
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px) scale(1.01)";e.currentTarget.style.borderColor="rgba(240,200,80,.45)";e.currentTarget.style.background="linear-gradient(135deg,rgba(40,32,18,.8),rgba(30,24,14,.9))";e.currentTarget.style.boxShadow="0 8px 30px rgba(200,160,60,.1),inset 0 0 20px rgba(0,0,0,.2)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor="rgba(200,160,60,.18)";e.currentTarget.style.background="linear-gradient(135deg,rgba(30,24,14,.7),rgba(20,16,10,.8))";e.currentTarget.style.boxShadow="inset 0 0 20px rgba(0,0,0,.2)"}}>
              <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(200,160,60,.04),transparent 60%)",pointerEvents:"none"}}/>
              <div style={{fontSize:32,filter:"drop-shadow(0 0 10px rgba(240,200,80,.3))"}}>{icon}</div>
              <div style={{fontSize:15,fontFamily:"'Cinzel',serif",color:"#e8c850",letterSpacing:1,fontWeight:700}}>{label}</div>
              <div style={{fontSize:10,color:"#8a7a50",lineHeight:1.6}}>{desc}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:2}}>
                {tags.map((t,i)=>(
                  <span key={i} style={{fontSize:9,padding:"1px 7px",borderRadius:8,background:"rgba(200,160,60,.06)",border:"1px solid rgba(200,160,60,.12)",color:"rgba(200,160,60,.6)",letterSpacing:1}}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Utility links */}
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:8}}>
          <button onClick={()=>setShowGuide(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.15)",color:"#8a7a50",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.6}}>📜 How to Play</button>
          <button onClick={()=>setShowInfo(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.15)",color:"#8a7a50",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.6}}>📖 Encyclopaedia</button>
        </div>
        <InstaBadge/>
      </div>

      {/* Footer */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,textAlign:"center",padding:"10px 0 12px",background:"linear-gradient(0deg,rgba(12,10,7,.9),transparent)",zIndex:2}}>
        <div style={{fontSize:10,color:"#6a5a38",letterSpacing:1}}>© {new Date().getFullYear()} RasaVisio · All rights reserved</div>
        <div style={{fontSize:9,color:"#4a3a28",letterSpacing:1,marginTop:2}}>Inspired by the ancient game of Moksha Patam · Created in India 🇮🇳</div>
      </div>
    </div>
  );

  // ═══ CHITRAGUPTA INTRO ═══
  if(screen==="chitragupta"){
    return <ChitraguptaIntroScreen
      players={pendingPlayers||players}
      chosenLang={chosenLang}
      muted={muted}
      onBegin={()=>startGame(pendingPlayers||players)}
      onSkip={()=>startGame(pendingPlayers||players)}
    />;
  }

  // ═══ YAMA INTRO ═══
  if(screen==="yama"){
    // Phase 0: Yama speaks intro
    // Phase 1: "Who dares challenge me?" - go to setup
    const yamaIntroEn='So, you dare to challenge me? I am Yama. The God of Death. I ride the great buffalo through the realm of the dead. Every soul that walks this board, eventually, comes to me. I have been waiting since the beginning of time. You think you can outwit Death? You think your little virtues will save you? I have watched a million souls fall. Brave warriors. Wise sages. Holy saints. They all fell. And I devoured their karma. Play your little game, mortal. I will be watching. Every. Single. Move. And when your karma falters, even by a whisper, I will be there. Waiting. Now tell me, little soul. Who are you?';
    const yamaIntroHi='तो, तुम मुझसे खेलना चाहते हो? मैं यमराज हूँ। मृत्यु का देवता। मैं महान भैंसे पर सवार होकर मृतकों के लोक से गुज़रता हूँ। हर आत्मा जो इस पट पर चलती है, अंत में मेरे पास आती है। मैं सृष्टि के आरम्भ से प्रतीक्षा कर रहा हूँ। तुम्हें लगता है तुम मृत्यु को हरा सकते हो? तुम्हें लगता है तुम्हारे छोटे-छोटे पुण्य तुम्हें बचा लेंगे? मैंने लाखों आत्माओं को गिरते देखा है। वीर योद्धा। ज्ञानी ऋषि। पवित्र संत। सब गिरे। और मैंने उनका कर्म निगल लिया। खेलो अपना छोटा सा खेल, नश्वर प्राणी। मैं देख रहा हूँ। हर एक कदम। और जब तुम्हारा कर्म डगमगाएगा, एक फुसफुसाहट भर भी, मैं वहीं रहूँगा। इंतज़ार करता हुआ। अब बताओ, छोटी सी आत्मा। तुम कौन हो?';

    return(
      <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh",background:"radial-gradient(ellipse at center,#1a0808 0%,#0c0505 40%,#050202 100%)"}}>
        {globalOverlays}
        <button onClick={()=>{VoiceEngine.stop();try{window.speechSynthesis.cancel()}catch(e){}navigateTo("pickcount");setYamaPhase(0)}} style={{position:"fixed",top:20,left:20,background:"transparent",border:"1px solid rgba(160,64,64,.25)",color:"#806060",padding:"5px 14px",fontSize:11,cursor:"pointer",borderRadius:3,fontFamily:"'Cinzel',serif",letterSpacing:1,zIndex:10}}>← Back</button>
        <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center,rgba(160,40,40,.08),transparent 60%)",pointerEvents:"none"}}/>
        
        {yamaPhase===0&&<div style={{textAlign:"center",animation:"yamaReveal 2s ease forwards",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{animation:"yamaBreath 3s ease infinite",marginBottom:16,display:"flex",justifyContent:"center"}}><YamaIcon size={200}/></div>
          <div style={{fontSize:"clamp(28px,6vw,48px)",fontFamily:"'Yatra One',serif",color:"#a04040",letterSpacing:4,animation:"yamaTextReveal 1.5s ease .5s both"}}>यमराज</div>
          <div style={{fontSize:"clamp(14px,3vw,22px)",fontFamily:"'Cinzel Decorative',serif",color:"#804040",letterSpacing:8,marginTop:4,animation:"yamaTextReveal 1.5s ease 1s both"}}>YAMA</div>
          <div style={{fontSize:"clamp(10px,2vw,14px)",color:"#604040",letterSpacing:4,marginTop:4,fontStyle:"italic",animation:"yamaTextReveal 1.5s ease 1.5s both"}}>God of Death · Lord of Dharma · The Inescapable</div>
          <div style={{width:60,height:1,background:"linear-gradient(90deg,transparent,#a0404060,transparent)",margin:"20px auto",animation:"yamaTextReveal 1s ease 2s both"}}/>
          <div style={{maxWidth:500,fontSize:"clamp(11px,1.5vw,14px)",color:"#906060",lineHeight:2.2,fontStyle:"italic",margin:"0 auto",animation:"yamaTextReveal 1.5s ease 2.5s both",padding:"0 20px"}}>
            {chosenLang==='hi'
              ?"सुनो... यमराज बोल रहे हैं..."
              :"Listen... Yama is speaking..."}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:3,marginTop:20,alignItems:"center",height:36,animation:"yamaTextReveal 1s ease 3s both"}}>
            {[0,1,2,3,4,5,6,5,4,3,2,1,0].map((d,i)=><div key={i} style={{width:3,background:`linear-gradient(180deg,#e04040,#601010)`,borderRadius:2,animation:`waveBar ${0.4+d*0.12}s ease ${i*0.06}s infinite alternate`,height:8,opacity:0.4+d*0.1}}/>)}
          </div>
          <div style={{fontSize:10,color:"#604040",marginTop:8,letterSpacing:3,animation:"pulse 2s ease infinite"}}>
            {chosenLang==='hi'?"🔊 यमराज की आवाज़ सुनो":"🔊 YAMA IS SPEAKING"}
          </div>
          <button onClick={()=>{VoiceEngine.stop();try{window.speechSynthesis.cancel()}catch(e){}setYamaPhase(1)}} style={{marginTop:16,background:"transparent",border:"1px solid rgba(160,64,64,.25)",color:"#806060",padding:"6px 20px",fontSize:10,cursor:"pointer",borderRadius:3,fontFamily:"'Cinzel',serif",letterSpacing:2,opacity:.6,transition:"all .2s",animation:"yamaTextReveal 1s ease 4s both"}}>
            SKIP ▸
          </button>
        </div>}

        {yamaPhase===1&&<div style={{textAlign:"center",animation:"dharmaIn .6s ease forwards",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{marginBottom:12,animation:"yamaBreath 2s ease infinite",display:"flex",justifyContent:"center"}}><YamaIcon size={150}/></div>
          <div style={{fontSize:"clamp(20px,5vw,36px)",fontFamily:"'Yatra One',serif",color:"#c04040",letterSpacing:3,marginBottom:8}}>
            {chosenLang==='hi'?"तुम कौन हो?":"Who dares challenge me?"}
          </div>
          <div style={{fontSize:"clamp(11px,1.5vw,14px)",color:"#806060",marginBottom:28,fontStyle:"italic",letterSpacing:2}}>
            {chosenLang==='hi'?"अपनी पहचान बताओ, नश्वर प्राणी":"Identify yourself, mortal"}
          </div>
          <button className="gb gp" onClick={()=>navigateTo("setup")} style={{padding:"14px 40px",fontSize:16,letterSpacing:4,background:"rgba(160,64,64,.15)",border:"2px solid rgba(160,64,64,.4)",color:"#e08080"}}>
            {chosenLang==='hi'?"अपना योद्धा चुनो ▸":"CHOOSE YOUR SEEKER ▸"}
          </button>
        </div>}

        <div style={{position:"fixed",bottom:8,left:0,right:0,textAlign:"center"}}><InstaBadge/><div style={{fontSize:9,color:"#6a5a38",letterSpacing:1,marginTop:3}}>© {new Date().getFullYear()} RasaVisio · Moksha Patam 108 · All rights reserved</div></div>
      </div>
    );
  }

  // ═══ SETUP ═══
  if(screen==="setup"){
    const pidx=players.length;
    return(
      <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",padding:"clamp(16px,4vw,32px)",overflowY:"auto"}}>
        {globalOverlays}
        <div style={{maxWidth:680,width:"100%",animation:"slideUp .6s ease"}} key={pidx}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <button onClick={()=>{VoiceEngine.stop();setPlayers([]);setUsedChars([]);setTempName("");setTempChar(-1);navigateTo("pickcount")}} style={{position:"absolute",top:20,left:20,background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#8a7a50",padding:"5px 14px",fontSize:11,cursor:"pointer",borderRadius:3,fontFamily:"'Cinzel',serif",letterSpacing:1,zIndex:10}}>← Back</button>
            <div style={{fontSize:10,opacity:.3,letterSpacing:5}}>SEEKER {pidx+1} OF {nP}</div>
            <h2 style={{fontSize:"clamp(20px,4vw,30px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:"8px 0"}}>Choose Your Identity</h2>
            {pidx===0&&<div
              onClick={()=>!muted&&VoiceEngine.speakChitragupta('seeker',chosenLang)}
              style={{
                display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer",
                padding:"5px 14px",marginTop:2,
                background:"linear-gradient(135deg,rgba(200,175,90,.06),rgba(200,175,90,.02))",
                border:"1px solid rgba(200,175,90,.14)",borderRadius:20,
                animation:"fadeIn 1.5s ease .8s both",
              }}>
              <svg width={11} height={14} viewBox="0 0 11 14" style={{opacity:.65}}>
                <path d="M5.5 1Q8.5 0 10 3Q11 7 7 9Q5.5 11 5.5 13Q4.5 11 4.5 9Q1 7 1 4Q2.5 1 5.5 1Z" fill="rgba(200,175,90,.25)" stroke="rgba(200,175,90,.5)" strokeWidth=".5"/>
                <path d="M5.5 13L5.5 9Q7.5 7 8.5 5" fill="none" stroke="rgba(200,175,90,.55)" strokeWidth=".5"/>
              </svg>
              <span style={{fontSize:8,color:"rgba(200,175,90,.4)",letterSpacing:2,fontFamily:"'Cinzel',serif",fontStyle:"italic"}}>
                Chitragupta watches · He already knows your choice
              </span>
            </div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(140px,30vw,200px),1fr))",gap:10,marginBottom:20}}>
            {CHARS.map((ch,i)=>{const used=usedChars.includes(i);const sel=tempChar===i;
              return(<div key={i} onClick={()=>{if(!used){setTempChar(i);if(!muted){VoiceEngine.stop();const sf=STATIC_VOICES[ch.id];if(sf)VoiceEngine.playStatic(sf[chosenLang==='hi'?'hi':'en']);else VoiceEngine.speak(chosenLang==='hi'?ch.voiceHi:ch.voiceEn,chosenLang)}}}} style={{background:sel?"rgba(200,160,60,.12)":"rgba(20,16,10,.5)",border:`1px solid ${sel?"rgba(240,200,80,.6)":used?"rgba(100,80,50,.15)":"rgba(200,160,60,.2)"}`,padding:14,borderRadius:4,cursor:used?"not-allowed":"pointer",opacity:used?.3:1,transition:"all .3s"}}>
                <div style={{fontSize:28,marginBottom:6}}>{ch.icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:ch.color}}>{ch.name}</div>
                <div style={{fontSize:11,fontFamily:"'Noto Serif Devanagari',serif",color:"#f0d050",opacity:.6,marginBottom:4}}>{ch.skt}</div>
                <div style={{fontSize:10,opacity:.5,lineHeight:1.6,color:"#c0b080"}}>{ch.trait}</div>
              </div>)})}
          </div>
          {tempChar>=0&&<div style={{background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.15)",padding:16,borderRadius:4,marginBottom:16,animation:"fadeIn .4s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:28}}>{CHARS[tempChar].icon}</span>
              <div><div style={{fontSize:16,fontWeight:700,color:CHARS[tempChar].color}}>{CHARS[tempChar].name}</div><div style={{fontSize:11,fontFamily:"'Noto Serif Devanagari',serif",color:"#f0d050",opacity:.6}}>{CHARS[tempChar].skt}</div></div>
              <button onClick={()=>{if(!muted){VoiceEngine.stop();const sf=STATIC_VOICES[CHARS[tempChar].id];if(sf)VoiceEngine.playStatic(sf[chosenLang==='hi'?'hi':'en']);else VoiceEngine.speak(chosenLang==='hi'?CHARS[tempChar].voiceHi:CHARS[tempChar].voiceEn,chosenLang)}}} style={{marginLeft:"auto",background:"transparent",border:"1px solid rgba(200,160,60,.25)",color:"#c0b080",padding:"3px 10px",fontSize:10,cursor:"pointer",borderRadius:3,opacity:.6}}>🔊</button>
            </div>
            <p style={{fontSize:12,lineHeight:1.9,color:"#c0b080",margin:0}}>{CHARS[tempChar].lore}</p>
          </div>}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:10,opacity:.4,letterSpacing:3,display:"block",marginBottom:6}}>ENTER YOUR NAME</label>
            <input type="text" value={tempName} onChange={e=>setTempName(e.target.value)} placeholder="Enter name..." maxLength={20} onKeyDown={e=>{if(e.key==="Enter")addPlayer()}}
              style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(200,160,60,.3)",color:"#e8c850",padding:"10px 14px",fontSize:14,fontFamily:"'Cinzel',serif",width:"100%",outline:"none",borderRadius:3}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
            <button className="gb" onClick={()=>{if(pidx===0)navigateTo("pickcount");else{const lp=players[players.length-1];setPlayers(p=>p.slice(0,-1));setUsedChars(u=>u.filter(x=>x!==lp.charIdx))}}}>← Back</button>
            <button className="gb gp" onClick={addPlayer} style={{opacity:(!tempName.trim()||tempChar<0)?.4:1}}>{pidx<nP-1?"Next Seeker →":"Begin Journey →"}</button>
          </div>
          {players.length>0&&<div style={{marginTop:16,borderTop:"1px solid rgba(200,160,60,.1)",paddingTop:12}}>
            <div style={{fontSize:9,letterSpacing:3,opacity:.3,marginBottom:6}}>CHOSEN</div>
            {players.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",opacity:.6}}><span style={{fontSize:16}}>{p.char.icon}</span><span style={{fontSize:12,color:p.char.color}}>{p.name}</span><span style={{fontSize:10,opacity:.4}}>— {p.char.name}</span></div>)}
          </div>}
          <div style={{textAlign:"center",marginTop:12}}><div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:8,flexWrap:"wrap"}}><button onClick={()=>setShowGuide(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📜 How to Play</button><button onClick={()=>setShowInfo(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📖 Encyclopaedia</button></div><InstaBadge/></div>
        </div>
        {/* Footer */}
        <div style={{textAlign:"center",padding:"16px 0 10px",width:"100%"}}>
          <div style={{fontSize:10,color:"#6a5a38",letterSpacing:1}}>© {new Date().getFullYear()} RasaVisio · All rights reserved</div>
          <div style={{fontSize:9,color:"#4a3a28",letterSpacing:1,marginTop:2}}>Inspired by the ancient game of Moksha Patam · Created in India 🇮🇳</div>
        </div>
      </div>
    );
  }
  if(screen!=="game"||players.length===0)return null;
  const cp=players[cur]||players[0];
  const hd=hov?(SNAKES[hov]?{type:"𓆙 NĀGA",label:`${SNAKES[hov].skt} — ${SNAKES[hov].en}`,desc:SNAKES[hov].tale,to:`Falls to ${SNAKES[hov].to}`,cl:"#e08040"}:LADDERS[hov]?{type:"🪔 VIRTUE",label:`${LADDERS[hov].skt} — ${LADDERS[hov].en}`,desc:LADDERS[hov].tale,to:`Rises to ${LADDERS[hov].to}`,cl:"#f0d050"}:DLM_SQ.includes(hov)?{type:"⚖ DHARMA",label:"Moral crossroads",desc:"A dilemma from the Mahābhārata.",cl:"#d0b870"}:hov===108?{type:"ॐ MOKSHA",label:"Square 108 — Liberation",desc:"The 108th square. Punya must ≥ Papa. The sacred number of the cosmos.",cl:"#f0d050"}:hov>100?{type:`${SACRED_PATH[hov-101]?.icon} ${SACRED_PATH[hov-101]?.en}`,label:`${SACRED_PATH[hov-101]?.skt} — ${SACRED_PATH[hov-101]?.desc}`,desc:"The Ashtanga Marga — 8-fold path of Patanjali. Only the purest souls walk here.",cl:"#f0d050"}:null):null;

  return(
    <div style={{...PG,padding:"10px 8px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      {globalOverlays}
      {eventPopup&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,pointerEvents:"auto"}} onClick={dismissEvent}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"popIn .4s ease forwards",background:"linear-gradient(180deg,#2a2015,#12100a)",border:`2px solid ${eventPopup.color}50`,borderRadius:8,padding:"28px 36px",textAlign:"center",maxWidth:380,width:"90vw",boxShadow:`0 0 60px ${eventPopup.color}30, 0 0 120px rgba(0,0,0,.8)`}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:52,marginBottom:8,filter:`drop-shadow(0 0 20px ${eventPopup.color})`}}>{eventPopup.icon}</div>
          <div style={{fontSize:18,fontFamily:"'Yatra One',serif",color:eventPopup.color,marginBottom:4,letterSpacing:2}}>{eventPopup.title}</div>
          {eventPopup.extra&&<div style={{fontSize:16,fontWeight:900,color:eventPopup.color,marginBottom:6,letterSpacing:4}}>{eventPopup.extra}</div>}
          <div style={{fontSize:11,color:"#d0c090",lineHeight:1.9,fontStyle:"italic",opacity:.8,maxHeight:200,overflowY:"auto"}}>{eventPopup.subtitle}</div>
          <button onClick={dismissEvent} style={{marginTop:16,background:"transparent",border:`1px solid ${eventPopup.color}40`,color:eventPopup.color,padding:"8px 24px",fontSize:11,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:4,letterSpacing:2}}>TAP TO CONTINUE ▸</button>
        </div>
      </div>}
      {turnBanner&&!dil&&<div style={{position:"fixed",inset:0,zIndex:180,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        <div style={{animation:"turnFlash 2s ease forwards",background:"linear-gradient(180deg,rgba(20,16,10,.95),rgba(12,10,7,.95))",border:`2px solid ${turnBanner.color}60`,borderRadius:12,padding:"24px 48px",textAlign:"center",boxShadow:`0 0 60px ${turnBanner.color}30`}}>
          <div style={{fontSize:44,marginBottom:4}}>{turnBanner.icon}</div>
          <div style={{fontSize:22,fontFamily:"'Yatra One',serif",color:turnBanner.color,letterSpacing:3}}>{turnBanner.name}</div>
          <div style={{fontSize:11,opacity:.5,letterSpacing:4,marginTop:4}}>{turnBanner.cpu?"🤖 CPU THINKING...":"YOUR TURN"}</div>
        </div>
      </div>}
      <div style={{textAlign:"center",marginBottom:4,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:10}}>
          <div onClick={()=>setShowRiddles(true)} style={{fontSize:"clamp(18px,3.5vw,28px)",fontFamily:"'Yatra One',serif",letterSpacing:3,color:"#f0d050",cursor:"pointer"}}>मोक्ष पटम् १०८</div>
          <button onClick={toggleMute} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"2px 8px",fontSize:12,cursor:"pointer",borderRadius:3}}>{muted?"🔇":"🔊"}</button>
          {auth.user?<button onClick={()=>{setShowProfile(true);setProfileTab("overview")}} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 10px 3px 3px",background:"rgba(240,200,80,.05)",border:"1px solid rgba(200,160,60,.15)",borderRadius:16,cursor:"pointer",color:"#e8c850",fontSize:10,fontFamily:"'Cinzel',serif"}}>
            {auth.profile?.avatar_url?<img src={auth.profile.avatar_url} alt="" style={{width:20,height:20,borderRadius:"50%",border:"1px solid rgba(240,200,80,.2)"}} referrerPolicy="no-referrer"/>:<div style={{width:20,height:20,borderRadius:"50%",background:"rgba(240,200,80,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>🪷</div>}
            <span>{(auth.profile?.display_name||auth.user?.user_metadata?.full_name||"").split(" ")[0]||"Profile"}</span>
            {auth.profile?.total_games>0&&<span style={{fontSize:8,padding:"1px 5px",background:(auth.profile.total_punya_earned-auth.profile.total_papa_earned)>=0?"rgba(100,200,100,.12)":"rgba(200,80,60,.12)",borderRadius:6,color:(auth.profile.total_punya_earned-auth.profile.total_papa_earned)>=0?"#80c080":"#e08060"}}>{(auth.profile.total_punya_earned-auth.profile.total_papa_earned)>=0?"+":""}{(auth.profile.total_punya_earned||0)-(auth.profile.total_papa_earned||0)}</span>}
          </button>:<button onClick={()=>setShowProfile(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.15)",color:"#8a7a50",padding:"3px 10px",fontSize:10,cursor:"pointer",borderRadius:16,fontFamily:"'Cinzel',serif"}}>Sign In</button>}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:6,flexWrap:"wrap"}}>
          <button onClick={()=>setShowGuide(true)} style={{background:"rgba(200,160,60,.08)",border:"1px solid rgba(200,160,60,.25)",color:"#e8c850",padding:"5px 14px",fontSize:11,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:4,letterSpacing:2}}>📜 How to Play</button>
          <button onClick={()=>setShowInfo(true)} style={{background:"rgba(200,160,60,.08)",border:"1px solid rgba(200,160,60,.25)",color:"#e8c850",padding:"5px 14px",fontSize:11,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:4,letterSpacing:2}}>📖 Encyclopaedia</button>
        </div>
        <div style={{fontSize:8,letterSpacing:5,opacity:.3,color:"#c0b080",marginTop:4}}>{rlm(pos[cur]||1)==="bhuloka"?"भूलोक EARTHLY":rlm(pos[cur]||1)==="antarloka"?"अन्तर्लोक INNER":rlm(pos[cur]||1)==="moksha_path"?"अष्टांग मार्ग SACRED PATH":"स्वर्गलोक CELESTIAL"}</div>
        <div style={{marginTop:4}}><InstaBadge/></div>
      </div>
      <div style={{background:"linear-gradient(90deg,transparent,rgba(30,24,14,.6),transparent)",borderTop:"1px solid rgba(200,160,60,.2)",borderBottom:"1px solid rgba(200,160,60,.2)",padding:"8px 14px",marginBottom:8,textAlign:"center",fontSize:"clamp(10px,1.4vw,12px)",maxWidth:780,width:"100%",fontStyle:"italic",lineHeight:1.7,color:"#c0b080"}}>{msg}</div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center",width:"100%",maxWidth:1140}}>
        {/* BOARD */}
        <div style={{flex:"1 1 340px",maxWidth:720,minWidth:300}}>
          <div style={{border:"2px solid rgba(200,160,60,.3)",background:"radial-gradient(ellipse at 30% 30%,rgba(60,45,20,.2),transparent 50%),radial-gradient(ellipse at 70% 70%,rgba(60,45,20,.15),transparent 50%),#1e1810",boxShadow:"0 0 60px rgba(0,0,0,.5),inset 0 0 40px rgba(0,0,0,.3)",borderRadius:2,overflow:"hidden"}}>
            {/* ═══ SACRED CROWN — Ashtanga Marga (101-108) ═══ */}
            <div style={{position:"relative",background:"linear-gradient(180deg,rgba(240,200,80,.08),rgba(20,16,10,.3))",borderBottom:"2px solid rgba(240,200,80,.25)",padding:"6px 4px 4px",overflow:"hidden"}}>
              {/* Geometric Hindu pattern overlay */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.06}} viewBox="0 0 200 50" preserveAspectRatio="none">
                {/* Sri Yantra inspired triangles */}
                {[0,25,50,75,100,125,150,175].map(x=><g key={x}><polygon points={`${x+12.5},5 ${x+25},45 ${x},45`} fill="none" stroke="#f0d050" strokeWidth=".5"/><polygon points={`${x+12.5},45 ${x+25},5 ${x},5`} fill="none" stroke="#f0d050" strokeWidth=".5"/><circle cx={x+12.5} cy={25} r="8" fill="none" stroke="#f0d050" strokeWidth=".3"/></g>)}
              </svg>
              <div style={{fontSize:"clamp(6px,1vw,9px)",textAlign:"center",letterSpacing:5,color:"#f0d050",opacity:.5,marginBottom:4,fontFamily:"'Cinzel',serif",textShadow:"0 0 10px rgba(240,200,80,.3)"}}>꧁ अष्टांग मार्ग · ASHTANGA MARGA · The 8-Fold Sacred Path ꧂</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:2}}>
                {SACRED_PATH.map((sq)=>{
                  const ph=[];for(let i=0;i<nP;i++){if((pos[i]||1)===sq.num)ph.push(i)}
                  const isMoksha=sq.num===108;
                  const stepIdx=sq.num-101;
                  return(<div key={sq.num} onMouseEnter={()=>setHov(sq.num)} onMouseLeave={()=>setHov(null)} style={{aspectRatio:"1",background:isMoksha?"radial-gradient(circle,rgba(240,200,80,.2),rgba(240,200,80,.04))":"radial-gradient(circle,rgba(240,200,80,.06),transparent)",border:`1px solid ${hov===sq.num?"rgba(240,200,80,.7)":isMoksha?"rgba(240,200,80,.4)":"rgba(240,200,80,.12)"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"all .3s",borderRadius:isMoksha?4:2,animation:isMoksha?"mp 3s ease infinite":"sacredGlow 4s ease infinite",animationDelay:`${stepIdx*0.3}s`,boxShadow:isMoksha?"0 0 20px rgba(240,200,80,.15)":"none"}}>
                    <span style={{position:"absolute",top:1,left:2,fontSize:"clamp(6px,1vw,9px)",color:"rgba(240,210,130,.5)",fontWeight:700}}>{sq.num}</span>
                    {/* Custom SVG icon for each step */}
                    <svg width="clamp(20px,3.5vw,32px)" height="clamp(20px,3.5vw,32px)" viewBox="0 0 24 24" fill="none" style={{marginBottom:2}}>
                      {stepIdx===0&&<>{/* Yama - Self-restraint: lotus bud (closed) */}
                        <path d="M12 18 L12 10" stroke="#f0d050" strokeWidth="1.2"/>
                        <path d="M8 10 Q10 4 12 6 Q14 4 16 10 Q14 7 12 8 Q10 7 8 10Z" fill="#f0d050" opacity=".7"/>
                      </>}
                      {stepIdx===1&&<>{/* Niyama - Discipline: flame */}
                        <path d="M12 4 Q16 10 14 14 Q13 16 12 18 Q11 16 10 14 Q8 10 12 4Z" fill="#f0d050" opacity=".7"/>
                        <path d="M12 8 Q14 12 13 15 Q12 16 12 18 Q12 16 11 15 Q10 12 12 8Z" fill="#ffa040" opacity=".6"/>
                      </>}
                      {stepIdx===2&&<>{/* Asana - Steadiness: meditating figure */}
                        <circle cx="12" cy="7" r="2.5" stroke="#f0d050" strokeWidth="1" fill="none"/>
                        <path d="M12 10 L12 16 M8 20 L12 16 L16 20 M7 14 L12 12 L17 14" stroke="#f0d050" strokeWidth="1" strokeLinecap="round"/>
                      </>}
                      {stepIdx===3&&<>{/* Pranayama - Life-force: wind spiral */}
                        <path d="M6 12 Q8 8 12 8 Q16 8 16 12 Q16 15 12 14 Q9 13 10 16" fill="none" stroke="#f0d050" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M8 16 Q10 19 14 18 Q17 17 17 14" fill="none" stroke="#f0d050" strokeWidth=".8" strokeLinecap="round" opacity=".5"/>
                      </>}
                      {stepIdx===4&&<>{/* Pratyahara - Withdrawal: eye closing */}
                        <ellipse cx="12" cy="12" rx="7" ry="4" stroke="#f0d050" strokeWidth="1" fill="none"/>
                        <circle cx="12" cy="12" r="2" fill="#f0d050" opacity=".5"/>
                        <line x1="5" y1="8" x2="19" y2="16" stroke="#f0d050" strokeWidth=".8" opacity=".6"/>
                      </>}
                      {stepIdx===5&&<>{/* Dharana - Concentration: yantra/triangle */}
                        <polygon points="12,4 20,19 4,19" fill="none" stroke="#f0d050" strokeWidth="1"/>
                        <polygon points="12,19 20,6 4,6" fill="none" stroke="#f0d050" strokeWidth=".7" opacity=".5"/>
                        <circle cx="12" cy="12" r="2" fill="#f0d050" opacity=".4"/>
                      </>}
                      {stepIdx===6&&<>{/* Dhyana - Meditation: third eye */}
                        <circle cx="12" cy="12" r="6" stroke="#f0d050" strokeWidth=".8" fill="none"/>
                        <circle cx="12" cy="12" r="3" stroke="#f0d050" strokeWidth=".6" fill="none" opacity=".6"/>
                        <circle cx="12" cy="12" r="1.5" fill="#f0d050" opacity=".7"><animate attributeName="r" values="1;2;1" dur="3s" repeatCount="indefinite"/></circle>
                      </>}
                      {stepIdx===7&&<>{/* Moksha - Liberation: OM symbol simplified */}
                        <text x="12" y="17" textAnchor="middle" fill="#f0d050" fontSize="16" fontFamily="serif" fontWeight="bold">ॐ</text>
                      </>}
                    </svg>
                    <span style={{fontSize:isMoksha?"clamp(8px,1.3vw,13px)":"clamp(7px,1.1vw,11px)",color:isMoksha?"#f0d050":"#e8c850",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,lineHeight:1.1,textShadow:"0 0 8px #000,0 0 16px rgba(240,200,80,.2)"}}>{sq.skt}</span>
                    <span style={{fontSize:"clamp(5px,.8vw,8px)",color:"#c0a050",letterSpacing:1,lineHeight:1.1,fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 6px #000"}}>{sq.en}</span>
                    {ph.length>0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",gap:2,zIndex:15,pointerEvents:"none"}}>
                      {ph.map(pi=>{const c=players[pi]?.char;const isActive=pi===cur;const pc=c?.color||"#fff";return <div key={pi} style={{display:"flex",flexDirection:"column",alignItems:"center",transform:isActive?"scale(1.3)":"scale(0.9)",zIndex:isActive?20:15}}>
                        <div style={{width:"clamp(18px,2.8vw,26px)",height:"clamp(18px,2.8vw,26px)",borderRadius:"50%",background:`radial-gradient(circle at 35% 30%,${pc},${pc}40 70%,#0c0a07)`,border:`2px solid ${pc}`,boxShadow:`0 0 ${isActive?12:4}px ${pc}${isActive?"99":"30"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(10px,1.6vw,15px)",lineHeight:1,animation:isActive?"activeGlow 1.5s ease infinite":"none","--pc":pc}}>{c?.icon}</div>
                      </div>})}
                    </div>}
                  </div>);
                })}
              </div>
            </div>
            {/* ═══ MAIN 10×10 BOARD — with SVG overlay aligned ═══ */}
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",inset:4,border:"1px solid rgba(200,160,60,.1)",pointerEvents:"none",zIndex:10}}/>
              {[{top:"1%",t:"स्वर्गलोक CELESTIAL"},{top:"34.5%",t:"अन्तर्लोक INNER"},{top:"67.5%",t:"भूलोक EARTHLY"}].map((r,i)=><div key={i} style={{position:"absolute",top:r.top,left:"50%",transform:"translateX(-50%)",fontSize:"clamp(6px,1vw,9px)",letterSpacing:4,opacity:.22,color:"#f0d050",zIndex:10,pointerEvents:"none",whiteSpace:"nowrap"}}>{r.t}</div>)}
              {/* Sacred Geometry Overlays */}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1,opacity:.12}} viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Bhuloka (bottom third 67-100%): Square grid = material stability */}
                {[70,75,80,85,90,95].map(y=><line key={`bh${y}`} x1="5" y1={y} x2="95" y2={y} stroke="#c0a060" strokeWidth=".4"/>)}
                {[10,20,30,40,50,60,70,80,90].map(x=><line key={`bv${x}`} x1={x} y1="67" x2={x} y2="100" stroke="#c0a060" strokeWidth=".4"/>)}
                {/* Antarloka (middle third 33-67%): Hexagrams / Shatkona */}
                {[38,48,58].map(y=><g key={`a${y}`}>
                  <polygon points={`50,${y-6} 58,${y+4} 42,${y+4}`} fill="none" stroke="#c0a060" strokeWidth=".5"/>
                  <polygon points={`50,${y+6} 42,${y-4} 58,${y-4}`} fill="none" stroke="#c0a060" strokeWidth=".5"/>
                </g>)}
                {/* Svargaloka (top third 0-33%): Circles / Mandalas */}
                {[8,16,24].map(y=><g key={`s${y}`}>
                  <circle cx="50" cy={y} r="12" fill="none" stroke="#c0a060" strokeWidth=".4"/>
                  <circle cx="50" cy={y} r="7" fill="none" stroke="#c0a060" strokeWidth=".3"/>
                  <circle cx="50" cy={y} r="2" fill="none" stroke="#c0a060" strokeWidth=".3"/>
                </g>)}
              </svg>
              <div style={{position:"absolute",top:"33.3%",left:"2%",right:"2%",height:1,background:"linear-gradient(90deg,transparent,rgba(200,160,60,.18),transparent)",pointerEvents:"none",zIndex:10}}/>
              <div style={{position:"absolute",top:"66.6%",left:"2%",right:"2%",height:1,background:"linear-gradient(90deg,transparent,rgba(200,160,60,.18),transparent)",pointerEvents:"none",zIndex:10}}/>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:5}}>
                {conns.map((cn,i)=>{const x1=cn.f.c*10+5,y1=cn.f.r*10+5,x2=cn.t.c*10+5,y2=cn.t.r*10+5;return cn.type==="s"?<Naga key={i} x1={x1} y1={y1} x2={x2} y2={y2} id={cn.id}/>:<Ldr key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>})}
              </svg>
              <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",position:"relative",zIndex:6}}>
              {board.map(({num})=>{
                const sn=SNAKES[num],ld=LADDERS[num],dl=DLM_SQ.includes(num),mk=num===108;
                const ph=[];for(let i=0;i<nP;i++){if((pos[i]||1)===num)ph.push(i)}
                let bg="transparent",bdr="rgba(200,160,60,.08)";
                if(mk){bg="radial-gradient(circle,rgba(240,200,80,.2),transparent)";bdr="rgba(240,200,80,.5)"}
                else if(sn){bg="radial-gradient(circle,rgba(180,60,20,.2),transparent)";bdr="rgba(180,60,20,.3)"}
                else if(ld){bg="radial-gradient(circle,rgba(200,160,60,.15),transparent)";bdr="rgba(200,160,60,.2)"}
                else if(dl){bg="radial-gradient(circle,rgba(120,80,180,.2),transparent)";bdr="rgba(140,100,200,.35)"}
                return(<div key={num} onMouseEnter={()=>setHov(num)} onMouseLeave={()=>setHov(null)} style={{aspectRatio:"1",background:bg,border:`0.5px solid ${hov===num?"rgba(240,200,80,.6)":bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"all .2s"}}>
                  <span style={{position:"absolute",top:1,left:2,fontSize:"clamp(7px,1.2vw,11px)",color:"rgba(240,210,130,.5)",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:700}}>{num}</span>
                  {mk&&<span style={{fontSize:"clamp(14px,2.5vw,22px)",animation:"mp 3s ease infinite",color:"#f0d050"}}>ॐ</span>}
                  {sn&&<><span style={{fontSize:"clamp(10px,2vw,16px)",lineHeight:1}}>𓆙</span><span style={{fontSize:"clamp(7px,1.2vw,11px)",color:"#ffb040",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,lineHeight:1.1,textShadow:"0 0 8px #000,0 1px 4px #000,0 0 12px rgba(180,60,20,.5)"}}>{sn.skt}</span><span style={{fontSize:"clamp(5px,.9vw,8px)",color:"#ffa040",fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1.1,textShadow:"0 0 6px #000,0 0 10px rgba(180,60,20,.4)"}}>{sn.en}</span></>}
                  {ld&&<><span style={{fontSize:"clamp(9px,1.8vw,14px)",lineHeight:1}}>🪔</span><span style={{fontSize:"clamp(7px,1.2vw,11px)",color:"#ffe070",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,lineHeight:1.1,textShadow:"0 0 8px #000,0 0 12px rgba(200,160,60,.4)"}}>{ld.skt}</span><span style={{fontSize:"clamp(5px,.9vw,8px)",color:"#f0d060",fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1.1,textShadow:"0 0 6px #000"}}>{ld.en}</span></>}
                  {dl&&<><span style={{fontSize:"clamp(8px,1.5vw,13px)",lineHeight:1}}>⚖</span><span style={{fontSize:"clamp(5px,.8vw,7px)",color:"#c8a0f0",fontFamily:"'Cinzel',serif",fontWeight:900,textShadow:"0 0 8px #000",letterSpacing:1}}>DHARMA</span></>}
                  {ph.length>0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",gap:2,zIndex:15,pointerEvents:"none"}}>
                    {ph.map(pi=>{const c=players[pi]?.char;const isMoving=pi===cur&&busy;const isActive=pi===cur;const pc=c?.color||"#fff";return <div key={pi} style={{display:"flex",flexDirection:"column",alignItems:"center",transition:"all .3s ease",transform:isMoving?"scale(1.6) translateY(-6px)":isActive?"scale(1.25)":"scale(0.9)",zIndex:isActive?20:15}}>
                      {isActive&&<div style={{position:"absolute",inset:-2,borderRadius:4,background:`${pc}15`,border:`1.5px solid ${pc}40`,animation:"activeGlow 1.5s ease infinite","--pc":pc}}/>}
                      <div style={{width:"clamp(20px,3.2vw,30px)",height:"clamp(20px,3.2vw,30px)",borderRadius:"50%",background:`radial-gradient(circle at 35% 30%,${pc},${pc}40 70%,#0c0a07)`,border:`2.5px solid ${pc}`,boxShadow:`0 0 ${isMoving?20:isActive?12:5}px ${pc}${isMoving?"dd":isActive?"99":"30"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(11px,2vw,17px)",lineHeight:1,animation:isActive&&!isMoving?"activeGlow 1.5s ease infinite":"none","--pc":pc}}>{c?.icon}</div>
                      <div style={{fontSize:"clamp(5px,.8vw,8px)",color:pc,fontWeight:900,marginTop:1,textShadow:`0 0 4px #000,0 0 8px #000,0 0 12px ${pc}40`,whiteSpace:"nowrap",letterSpacing:1,opacity:isActive?1:.7}}>{players[pi]?.name?.slice(0,6)}</div>
                    </div>})}
                  </div>}
                </div>);
              })}
            </div>
            </div>{/* close position:relative wrapper */}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:"clamp(10px,2.5vw,20px)",marginTop:6,fontSize:"clamp(8px,1.1vw,10px)",opacity:.45,color:"#c0b080",flexWrap:"wrap"}}>
            <span style={{color:"#e08040"}}>𓆙 Nāga</span><span style={{color:"#f0d050"}}>🪔 Virtue</span><span style={{color:"#c8a0f0"}}>⚖ Dharma</span><span style={{color:"#f0d050"}}>🪷 Sacred Path</span><span style={{color:"#f0d050"}}>ॐ Moksha 108</span>
          </div>
          {/* Karma Victory + Punya needed indicator */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:4,fontSize:"clamp(8px,1vw,10px)",flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",background:"rgba(100,200,100,.06)",border:"1px solid rgba(100,200,100,.12)",borderRadius:12}}>
              <span style={{color:"#80c080",fontWeight:700}}>⚡ Karma Victory: 30 Punya</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",background:"rgba(240,200,80,.06)",border:"1px solid rgba(240,200,80,.12)",borderRadius:12}}>
              <span style={{color:"#f0d050",fontWeight:700}}>ॐ Moksha: Punya ≥ Papa at Sq 108</span>
            </div>
            {players[cur]&&<div style={{padding:"3px 10px",background:punya[cur]>=30?"rgba(100,200,100,.1)":punya[cur]>=papa[cur]?"rgba(240,200,80,.08)":"rgba(200,80,60,.08)",border:`1px solid ${punya[cur]>=30?"rgba(100,200,100,.2)":punya[cur]>=papa[cur]?"rgba(240,200,80,.15)":"rgba(200,80,60,.15)"}`,borderRadius:12}}>
              <span style={{color:punya[cur]>=30?"#80c080":punya[cur]>=papa[cur]?"#f0d050":"#e08060",fontWeight:700}}>
                {punya[cur]>=30?"⚡ KARMA READY!":`You: ${punya[cur]} Punya / ${papa[cur]} Papa ${punya[cur]>=papa[cur]?"✓ Pure":"✗ Impure"}`}
              </span>
            </div>}
          </div>
        </div>
        {/* PANEL */}
        <div style={{flex:"0 1 310px",display:"flex",flexDirection:"column",gap:8,minWidth:"clamp(250px,40vw,310px)",maxWidth:360}}>
          <div style={{borderTop:"1px solid rgba(200,160,60,.15)",padding:8,textAlign:"center",opacity:shF?.7:0,transition:"opacity .8s"}}>
            <div style={{fontSize:"clamp(11px,1.5vw,13px)",fontFamily:"'Noto Serif Devanagari',serif",lineHeight:1.9,color:"#f0d050"}}>{shl.s}</div>
            <div style={{fontSize:8,opacity:.35,fontFamily:"'Noto Serif Devanagari',serif"}}>{shl.r}</div>
          </div>
          {!win&&<div style={{background:"#1a1408",border:`1px solid ${cp.char.color}30`,borderTop:`3px solid ${cp.char.color}`,padding:"clamp(10px,2vw,14px)",borderRadius:4}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:10,padding:"6px 12px",background:`${cp.char.color}10`,borderRadius:4}}>
              <span style={{fontSize:20}}>{cp.char.icon}</span>
              <span style={{fontSize:14,color:cp.char.color,fontWeight:700,letterSpacing:2}}>{cp.name}</span>
              <span style={{fontSize:10,opacity:.4}}>— {cp.char.name}</span>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:"clamp(12px,2vw,20px)",marginBottom:14}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:8,letterSpacing:2,opacity:.5,marginBottom:5,color:"#f0d050",fontWeight:700}}>KARMA</div><div style={{width:"clamp(50px,8vw,60px)",height:"clamp(50px,8vw,60px)",border:"2px solid rgba(200,160,60,.5)",borderRadius:6,background:"linear-gradient(135deg,#2a2015,#1a1408)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(24px,4vw,32px)",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,animation:busy?"dt .6s ease":"none",color:"#f0d050",boxShadow:"inset 0 0 15px rgba(0,0,0,.3)"}}>{rv||"?"}</div><div style={{fontSize:8,opacity:.4,marginTop:4}}>Movement</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:8,letterSpacing:2,opacity:.5,marginBottom:5,color:"#c0b080",fontWeight:700}}>GRAHA</div><div style={{width:"clamp(50px,8vw,60px)",height:"clamp(50px,8vw,60px)",border:"2px solid rgba(150,120,60,.4)",borderRadius:6,background:"linear-gradient(135deg,#221a10,#1a1408)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(22px,3.5vw,30px)",animation:busy?"dt .6s ease":"none",boxShadow:"inset 0 0 15px rgba(0,0,0,.3)",color:gv?gv.color:"#c0b080"}}>{gv?gv.icon:"?"}</div><div style={{fontSize:8,opacity:.4,marginTop:4}}>Cosmic</div></div>
            </div>
            {rv&&gv&&!busy&&<div style={{background:"#12100a",border:"1px solid rgba(200,160,60,.15)",padding:"10px 12px",marginBottom:14,borderRadius:4}}>
              <div style={{display:"flex",gap:10,marginBottom:8,paddingBottom:8,borderBottom:"1px solid rgba(200,160,60,.1)"}}>
                <div style={{fontSize:20,fontWeight:900,color:"#f0d050",fontFamily:"'Noto Serif Devanagari',serif",minWidth:26}}>{rv}</div>
                <div><div style={{fontSize:9,fontWeight:700,color:"#f0d050",letterSpacing:2}}>KARMA DIE</div><div style={{fontSize:11,color:"#e0d0a0"}}>Move <strong style={{color:"#f0d050"}}>{rv}{gv.fx==="sun"?"+1":""}</strong> forward</div></div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <div style={{fontSize:22,minWidth:26,color:gv.color}}>{gv.icon}</div>
                <div><div style={{fontSize:9,fontWeight:700,color:gv.color,letterSpacing:2}}>{gv.n} · {gv.en.toUpperCase()}</div><div style={{fontSize:11,color:"#e0d0a0"}}>{gv.desc}</div></div>
              </div>
            </div>}
            <button onClick={doRoll} disabled={!!dil||busy} className="gb gp" style={{width:"100%",padding:"clamp(10px,1.5vw,14px)",fontSize:"clamp(14px,2vw,16px)",letterSpacing:4}}>
              {busy?"Rolling...":"Roll Dice"}
            </button>
          </div>}
          {win!==null&&<div style={{background:"radial-gradient(circle,rgba(240,200,80,.1),rgba(12,10,7,.95))",border:"2px solid rgba(240,200,80,.5)",padding:20,textAlign:"center",borderRadius:6,animation:"fadeIn .5s ease"}}>
            <div style={{fontSize:44,animation:"mp 2s ease infinite",filter:"drop-shadow(0 0 20px rgba(240,200,80,.6))"}}>ॐ</div>
            <div style={{fontSize:18,fontFamily:"'Yatra One',serif",margin:"8px 0",color:"#f0d050",letterSpacing:3}}>मोक्ष प्राप्त</div>
            <div style={{fontSize:13,color:players[win]?.char?.color,marginBottom:4}}>{players[win]?.char?.icon} {players[win]?.name}</div>
            <div style={{fontSize:10,opacity:.5,marginBottom:14}}>{players[win]?.char?.name} · Liberation achieved</div>
            {auth.user&&<div style={{fontSize:10,color:"#80c080",marginBottom:10}}>✓ Game saved to profile</div>}
            <button onClick={()=>setShowMoksha(true)} style={{
              background:"linear-gradient(180deg,rgba(240,200,80,.25),rgba(240,200,80,.1))",
              border:"1.5px solid rgba(240,200,80,.5)",color:"#f0d050",
              padding:"10px 20px",fontSize:11,fontFamily:"'Cinzel',serif",
              cursor:"pointer",borderRadius:4,letterSpacing:2,marginBottom:8,
              display:"block",width:"100%",animation:"pulse 2s ease infinite",
            }}>✨ View Moksha Ceremony</button>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={()=>{navigateTo("title");setWin(null);setPlayers([]);ambient.stop()}} className="gb" style={{padding:"6px 16px",fontSize:10,marginTop:0}}>New Journey</button>
              {auth.user&&<button onClick={()=>{setShowProfile(true);setProfileTab("history")}} className="gb" style={{padding:"6px 16px",fontSize:10,marginTop:0,opacity:.7}}>📊 Stats</button>}
            </div>
          </div>}
          {dil&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:250,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
            <div style={{background:"linear-gradient(180deg,#2a2015,#12100a)",border:"2px solid rgba(220,180,80,.3)",borderRadius:8,padding:"clamp(20px,4vw,32px)",maxWidth:480,width:"100%",boxShadow:"0 0 80px rgba(200,160,60,.15), 0 0 200px rgba(0,0,0,.9)",animation:"dharmaIn .5s ease forwards",position:"relative"}}>
              <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",width:60,height:3,background:"linear-gradient(90deg,transparent,rgba(220,180,80,.5),transparent)"}}/>
              <div style={{textAlign:"center",marginBottom:16}}>
                <div style={{fontSize:48,marginBottom:6,filter:"drop-shadow(0 0 15px rgba(200,160,60,.4))"}}>⚖</div>
                <div style={{fontSize:8,letterSpacing:5,color:"#d0b870",opacity:.6,fontWeight:700,marginBottom:4}}>DHARMA DILEMMA</div>
                <div style={{fontSize:"clamp(18px,4vw,24px)",fontFamily:"'Yatra One',serif",color:"#f0d050",letterSpacing:2}}>{dil.t}</div>
                <div style={{fontSize:13,color:"#d0b870",fontWeight:700,marginTop:4,letterSpacing:1}}>{dil.en}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(200,160,60,.06)",border:"1px solid rgba(200,160,60,.12)",borderRadius:4,marginBottom:16}}>
                <span style={{fontSize:24}}>{players[dil.pi]?.char?.icon}</span>
                <div>
                  <div style={{fontSize:13,color:players[dil.pi]?.char?.color,fontWeight:700}}>{players[dil.pi]?.name}</div>
                  <div style={{fontSize:10,opacity:.5}}>{players[dil.pi]?.char?.name} · Square {pos[dil.pi]||1} · पुण्य {punya[dil.pi]||0} · पाप {papa[dil.pi]||0}</div>
                </div>
              </div>
              <div style={{fontSize:"clamp(12px,1.5vw,14px)",color:"#e0d0a0",lineHeight:2,marginBottom:20,fontStyle:"italic",padding:"0 4px",maxHeight:200,overflowY:"auto"}}>{dil.txt}</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {dil.c.map((ch,ci)=>{
                  const isAshtanga=!!dil.ashtanga;
                  const btnBg=isAshtanga?"rgba(200,160,60,.08)":ch.k==="punya"?"rgba(200,160,60,.1)":"rgba(180,50,20,.1)";
                  const btnBorder=isAshtanga?"rgba(200,160,60,.3)":ch.k==="punya"?"rgba(220,180,80,.4)":"rgba(200,60,30,.4)";
                  const btnColor=isAshtanga?"#e0c860":ch.k==="punya"?"#f0d050":"#e08040";
                  return <button key={ci} onClick={()=>solvD(ci)} style={{display:"block",width:"100%",background:btnBg,border:`2px solid ${btnBorder}`,color:btnColor,padding:"14px 16px",fontSize:"clamp(12px,1.4vw,14px)",fontFamily:"'Cinzel',serif",cursor:"pointer",textAlign:"left",lineHeight:1.7,borderRadius:6,transition:"all .2s",letterSpacing:1}}>
                    {ch.l}
                  </button>})}
              </div>
              <div style={{textAlign:"center",marginTop:14,fontSize:9,opacity:.25,letterSpacing:2}}>CHOOSE YOUR PATH WISELY</div>
            </div>
          </div>}
          {/* ══ CHITRAGUPTA'S AGRASANDHANI — the living ledger ══ */}
          <ChitraguptaPanel
            entries={cgEntries}
            players={players}
            punya={punya}
            papa={papa}
            cur={cur}
            win={win}
          />
          <div style={{background:"linear-gradient(180deg,#1e1810,#14100a)",border:"1px solid rgba(200,160,60,.2)",padding:12,borderRadius:4}}>
            <div onClick={(e)=>{
              // ═══ HIDDEN DEV PANEL: Triple-click to toggle ═══
              // To disable before release: search "devMode" and remove all related code
              if(e.detail===3)setDevMode(d=>!d)
            }} style={{fontSize:9,letterSpacing:4,opacity:.5,marginBottom:10,color:"#f0d050",fontWeight:700,textAlign:"center",cursor:"default"}}>⚔ KARMA SCOREBOARD ⚔</div>
            {/* ═══ DEV PANEL — Triple-click scoreboard title to show/hide ═══ */}
            {devMode&&<div style={{background:"rgba(255,0,0,.05)",border:"1px solid rgba(255,60,60,.2)",borderRadius:4,padding:10,marginBottom:10,fontSize:10}}>
              <div style={{color:"#ff6060",fontWeight:700,letterSpacing:2,marginBottom:8,textAlign:"center"}}>🔧 DEV MODE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                <button onClick={()=>{const np=[...pos];np[cur]=100;setPos(np);setMsg("DEV: →100")}} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#e8c850",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Jump to 100</button>
                <button onClick={()=>{const np=[...pos];np[cur]=101;setPos(np);setMsg("DEV: →101")}} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#e8c850",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Jump to 101</button>
                <button onClick={()=>{const np=[...pos];np[cur]=107;setPos(np);setMsg("DEV: →107")}} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#e8c850",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Jump to 107</button>
                <button onClick={()=>{const np=[...pos];np[cur]=108;setPos(np);setMsg("DEV: →108")}} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#e8c850",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Jump to 108</button>
                <button onClick={()=>{const np=[...punya];np[cur]+=5;setPunya(np);setMsg("DEV: +5 Punya")}} style={{background:"rgba(100,200,100,.1)",border:"1px solid rgba(100,200,100,.2)",color:"#80c080",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>+5 Punya</button>
                <button onClick={()=>{const np=[...papa];np[cur]+=5;setPapa(np);setMsg("DEV: +5 Papa")}} style={{background:"rgba(200,80,60,.1)",border:"1px solid rgba(200,80,60,.2)",color:"#e08060",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>+5 Papa</button>
                <button onClick={()=>{const np=[...punya];np[cur]=30;setPunya(np);setMsg("DEV: Punya=30 KARMA!")}} style={{background:"rgba(100,200,100,.15)",border:"1px solid rgba(100,200,100,.3)",color:"#80c080",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Set 30 Punya</button>
                <button onClick={()=>{const np=[...punya];np[cur]=0;setPunya(np);const npa=[...papa];npa[cur]=0;setPapa(npa);setMsg("DEV: Reset karma")}} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"#c0b080",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Reset Karma</button>
                <button onClick={()=>{const ns=[...shieldA];ns[cur]=!ns[cur];setShieldA(ns);setMsg("DEV: Shield "+(ns[cur]?"ON":"OFF"))}} style={{background:"rgba(200,160,200,.1)",border:"1px solid rgba(200,160,200,.2)",color:"#d0a0d0",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Toggle Shield</button>
                <button onClick={()=>{play("yamaLaugh");setMsg("DEV: Yama laughs!")}} style={{background:"rgba(200,60,60,.1)",border:"1px solid rgba(200,60,60,.2)",color:"#e06060",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Test Laugh</button>
                <button onClick={()=>{play("chime");setMsg("DEV: Chime!")}} style={{background:"rgba(200,200,100,.1)",border:"1px solid rgba(200,200,100,.2)",color:"#c0c060",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Test Chime</button>
                <button onClick={()=>{if(!muted)VoiceEngine.speak("Testing voice. Can you hear me?",chosenLang);setMsg("DEV: Voice test")}} style={{background:"rgba(100,150,200,.1)",border:"1px solid rgba(100,150,200,.2)",color:"#80a0c0",padding:"6px",fontSize:10,cursor:"pointer",borderRadius:3}}>Test Voice</button>
              </div>
              <div style={{marginTop:8,padding:6,background:"rgba(0,0,0,.2)",borderRadius:3,fontSize:9,color:"#8a7a50",fontFamily:"monospace",lineHeight:1.6}}>
                P{cur}: Sq{pos[cur]} | Punya:{punya[cur]} Papa:{papa[cur]} | Shield:{shieldA[cur]?"Y":"N"} | Win:{win!==null?win:"—"}<br/>
                Stats: 🐍{gameStats.current.snakes} 🪔{gameStats.current.ladders} ✓{gameStats.current.riddlesC} ✗{gameStats.current.riddlesW}<br/>
                Auth: {auth.user?auth.profile?.display_name||auth.user.email:"Not signed in"}
              </div>
            </div>}
            {players.map((pl,i)=>{const isActive=cur===i;const pn=punya[i]||0;const pp=papa[i]||0;const total=Math.max(pn+pp,1);const pc=pl.char.color;
              return(<div key={i} style={{background:isActive?`${pc}12`:"transparent",borderLeft:`4px solid ${isActive?pc:"transparent"}`,border:`1px solid ${isActive?pc+"50":"rgba(200,160,60,.08)"}`,borderLeftWidth:4,borderLeftColor:isActive?pc:"rgba(200,160,60,.08)",borderRadius:4,padding:"10px 12px",marginBottom:i<nP-1?8:0,transition:"all .3s",boxShadow:isActive?`inset 0 0 20px ${pc}10, 0 0 12px ${pc}15`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{fontSize:isActive?24:20,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",background:isActive?`${pc}20`:"transparent",border:isActive?`2px solid ${pc}50`:"2px solid transparent",transition:"all .3s"}}>{pl.char.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:isActive?14:12,color:pc,fontWeight:700,transition:"all .3s"}}>{pl.name}{pl.cpu?" ☠️":""}{isActive?" ◄":""}{shieldA[i]?" 🛡":""}{skipA[i]?" ⏭":""}</div>
                    <div style={{fontSize:10,opacity:.5,letterSpacing:1}}>Square {pos[i]||1} · {rlm(pos[i]||1)==="bhuloka"?"भूलोक":rlm(pos[i]||1)==="antarloka"?"अन्तर्लोक":"स्वर्गलोक"}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:"#f0d050",fontWeight:700}}>पुण्य</span><span style={{fontSize:14,color:"#f0d050",fontWeight:900}}>{pn}</span></div>
                    <div style={{height:6,background:"rgba(0,0,0,.3)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(pn/total)*100}%`,background:"linear-gradient(90deg,#f0d050,#c0a030)",borderRadius:3,transition:"width .6s"}}/></div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:"#e06030",fontWeight:700}}>पाप</span><span style={{fontSize:14,color:"#e06030",fontWeight:900}}>{pp}</span></div>
                    <div style={{height:6,background:"rgba(0,0,0,.3)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(pp/total)*100}%`,background:"linear-gradient(90deg,#e06030,#a03020)",borderRadius:3,transition:"width .6s"}}/></div>
                  </div>
                </div>
              </div>)
            })}
          </div>
          {hd&&<div style={{background:"#1a1408",border:"1px solid rgba(200,160,60,.15)",padding:10}}>
            <div style={{fontSize:8,opacity:.5,letterSpacing:3,color:hd.cl,fontWeight:700}}>{hd.type}</div>
            <div style={{fontSize:14,fontWeight:700,margin:"4px 0",fontFamily:"'Noto Serif Devanagari',serif",color:"#f0d050"}}>{hd.label}</div>
            <div style={{fontSize:11,fontStyle:"italic",opacity:.7,lineHeight:1.7,color:"#c0b080"}}>{hd.desc}</div>
            {hd.to&&<div style={{fontSize:10,opacity:.5,marginTop:4,color:hd.cl,fontWeight:700}}>{hd.to}</div>}
          </div>}
          {hist.length>0&&<div style={{background:"rgba(0,0,0,.2)",border:"1px solid rgba(200,160,60,.06)",padding:7,fontSize:8,opacity:.35,maxHeight:90,overflowY:"auto"}}>
            <div style={{letterSpacing:3,marginBottom:2,fontSize:7,color:"#f0d050",fontWeight:700}}>CHRONICLE</div>
            {hist.map((h,i)=><div key={i} style={{padding:"1px 0"}}>{h}</div>)}
          </div>}
          {/* Copyright */}
          <div style={{textAlign:"center",padding:"8px 0 4px"}}>
            <InstaBadge/>
            <div style={{fontSize:9,color:"#6a5a38",letterSpacing:1,marginTop:3}}>© {new Date().getFullYear()} RasaVisio · Moksha Patam 108 · All rights reserved</div>
          </div>
        </div>
      </div>
    </div>
  );
}
