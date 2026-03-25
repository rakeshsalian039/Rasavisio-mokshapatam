// ═══════════════════════════════════════════════════════════════
// ═══ MOKSHA PATAM 108 — मोक्षपटम् १०८ ═══
// ═══ The Ancient Game of Karma & Liberation ═══
// ═══════════════════════════════════════════════════════════════
//
// PROJECT STRUCTURE:
// src/
//   App.jsx              ← THIS FILE: Main game component + screens
//   styles.js            ← CSS animations and page styles
//   data/
//     board.js           ← Snakes, Ladders, Dharma square positions
//     dilemmas.js        ← 30 Dharma Dilemma cards (stories + choices)
//     riddles.js         ← 210 Ashtanga Riddles (30 per sacred step)
//     graha.js           ← 9 Navagraha planet effects
//     characters.js      ← 6 playable seeker characters
//     story.js           ← Story pages, Shlokas, Sacred Path steps
//   audio/
//     voiceEngine.js     ← TTS, Yama voice, narrator, static MP3s
//     ambient.js         ← Background music loop
//     sfx.js             ← Sound effects (dice, snake, chime, etc.)
//   components/
//     Naga.jsx           ← Snake SVG (cobra with hood, tongue, scales)
//     Ladder.jsx         ← Ladder SVG (golden rungs)
//     YamaIcon.jsx       ← Yama on buffalo SVG
//     InstaBadge.jsx     ← Instagram link badge
//   utils/
//     helpers.js         ← Board position math, realm detection
//
// QUICK GUIDE:
// - To add riddles: Edit src/data/riddles.js
// - To add dharma cards: Edit src/data/dilemmas.js
// - To change snake/ladder positions: Edit src/data/board.js
// - To change graha effects: Edit doRoll() in this file
// - To change voice: Edit src/audio/voiceEngine.js
// - To add characters: Edit src/data/characters.js
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══ DATA IMPORTS ═══
import { SNAKES, LADDERS, DLM_SQ } from "./data/board";
import { DILEMMAS } from "./data/dilemmas";
import { ASHTANGA_RIDDLES } from "./data/riddles";
import { GRAHA } from "./data/graha";
import { CHARS } from "./data/characters";
import { SHLOKAS, STORY_PAGES, SACRED_PATH } from "./data/story";

// ═══ AUDIO IMPORTS ═══
import { AudioCache, STATIC_VOICES, VoiceEngine } from "./audio/voiceEngine";
import { useAmbient } from "./audio/ambient";
import { useSound } from "./audio/sfx";

// ═══ COMPONENT IMPORTS ═══
import Naga from "./components/Naga";
import Ldr from "./components/Ladder";
import YamaIcon from "./components/YamaIcon";
import InstaBadge from "./components/InstaBadge";

// ═══ UTILITY IMPORTS ═══
import { sqP, rlm, board } from "./utils/helpers";

// ═══ STYLE IMPORTS ═══
import { CSS, PG } from "./styles";

export default function MokshaPatam(){
  const[screen,setScreen]=useState("title"); // title|story|pickcount|setup|game
  const[nP,setNP]=useState(2);
  const[players,setPlayers]=useState([]);
  const[tempName,setTempName]=useState("");
  const[tempChar,setTempChar]=useState(-1);
  const[usedChars,setUsedChars]=useState([]);
  const[storyPage,setStoryPage]=useState(0);

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

  const eventCallback=useRef(null);
  const showEvent = useCallback((popup, onDismiss) => {
    // ALWAYS stop any previous voice first to prevent overlapping
    VoiceEngine.stop();
    try{window.speechSynthesis.cancel()}catch(e){}
    setEventPopup(popup);
    eventCallback.current=onDismiss||null;
    if(!muted&&popup.subtitle){
      ambient.duck();
      // Small delay to ensure previous audio is fully stopped
      setTimeout(()=>VoiceEngine.speak(popup.subtitle,chosenLang),150);
    }
  }, [muted,chosenLang,ambient]);
  const dismissEvent = useCallback(() => {
    VoiceEngine.stop();
    try{window.speechSynthesis.cancel()}catch(e){}
    ambient.unduck();
    setEventPopup(null);
    if(eventCallback.current){const cb=eventCallback.current;eventCallback.current=null;setTimeout(cb,200);}
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
      setTimeout(()=>{if(!muted)VoiceEngine.speakNarrator(STORY_PAGES[storyPage][chosenLang],chosenLang)},300);
    }
    return()=>VoiceEngine.stop();
  },[screen,storyPage,muted]);

  const startGame=(pList)=>{
    const n=pList.length;
    setPos(Array(n).fill(1));setPunya(Array(n).fill(0));setPapa(Array(n).fill(0));
    setShieldA(Array(n).fill(false));setSkipA(Array(n).fill(false));
    setCur(0);setWin(null);setHist([]);setRv(null);setGv(null);setBusy(false);setDil(null);setUsedDharma([]);
    setMsg(`${pList[0].name} the ${pList[0].char.name} — your journey begins.`);
    setScreen("game");
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
    if(np.length>=nP)setTimeout(()=>startGame(np),100);
  };

  const nearest=(positions,ci,count)=>{let m=Infinity,idx=-1;for(let i=0;i<count;i++){if(i!==ci&&positions[i]<101){const d=Math.abs(positions[i]-positions[ci]);if(d>0&&d<m){m=d;idx=i}}}return idx};

  const doRoll=useCallback(()=>{
    if(dil||win||busy||players.length===0)return;
    if(skipA[cur]){const ns=[...skipA];ns[cur]=false;setSkipA(ns);setMsg(`${players[cur].name}'s turn is skipped.`);setCur(c=>(c+1)%nP);return}
    VoiceEngine.stop();try{window.speechSynthesis.cancel()}catch(e){}
    setBusy(true);play("dice");
    const r=Math.floor(Math.random()*6)+1,gi=Math.floor(Math.random()*9),g=GRAHA[gi];
    setRv(r);setGv(g);
    const pName=players[cur]?.name||"Seeker";

    // Compute graha effects first
    let tot=r;
    const oldP=pos[cur];let newP=oldP+tot;
    const extras=[];const nPunya=[...punya];const nPapa=[...papa];const nShield=[...shieldA];const nPos=[...pos];const nSkip=[...skipA];
    let grahaStory="";
    const onSacredPath=oldP>=101;
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
            setMsg([eMsg,...extras].filter(Boolean).join(" · ")||`Moved to ${p}.`);
            setHist(h=>[...h.slice(-12),`${pName}→${p}`]);
            if(nPunya[cur]>=30&&!win){setWin(cur);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory");
              showEvent({icon:"ॐ",title:"KARMA VICTORY!",subtitle:`${pName} has accumulated 30 Punya! The board dissolves. Instant Moksha!`,color:"#f0d050"});
            }
            if(skipDharmaCheck||(!DLM_SQ.includes(p)&&!(p>100&&p<108)))setCur(c=>(c+1)%nP);
            setBusy(false);
          };

          if(SNAKES[p]){const sn=SNAKES[p];if(nShield[cur]){nShield[cur]=false;eMsg=`𓆙 ${sn.skt} — Shield!`;play("ladder");
            showEvent({icon:"🛡",title:`Shield Saved ${pName}!`,subtitle:`The serpent ${sn.skt} (${sn.en}) struck — but Shukra's shield absorbed the venom! Shield is now gone.`,color:"#d0a0c0"},()=>finishTurn(true));
          }else{const o=p;p=sn.to;eMsg=`𓆙 ${o}→${p}`;nPapa[cur]+=2;play("snake");play("yamaLaugh");
            showEvent({icon:"𓆙",title:`${sn.skt} — ${sn.en}`,subtitle:`${pName}, the serpent of ${sn.en} caught you! ${sn.tale} Dragged from ${o} to ${p}. +2 PAPA.`,color:"#e06030",extra:`${o} → ${p}`},()=>finishTurn(true));
          }}
          else if(LADDERS[p]){const ld=LADDERS[p];const o=p;p=ld.to;eMsg=`🪔 ${o}→${p}`;nPunya[cur]+=1;play("ladder");
            showEvent({icon:"🪔",title:`${ld.skt} — ${ld.en}`,subtitle:`${pName}, the virtue of ${ld.en} lifts you! ${ld.tale} Rise from ${o} to ${p}. +1 PUNYA.`,color:"#f0d050",extra:`${o} → ${p}`},()=>finishTurn(true));
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
            const introText=isFirstStep
              ?`${pName}, you have ENTERED THE ASHTANGA MARGA — the 8-fold sacred path of Patanjali! From here, you move only ONE STEP per turn. Each step tests your soul. There are no dice shortcuts. Only dharma. Step ${stepNum} of 7: ${sq.en} (${sq.desc}).`
              :p===107
              ?`${pName}, you have reached the FINAL STEP — ध्यान Dhyana, Meditation. After this test, you must roll EXACT 1 to enter Moksha. Only absolute surrender opens the final gate. Step 7 of 7.`
              :`${pName}, Step ${stepNum} of 7 on the Sacred Path: ${sq.skt} — ${sq.en} (${sq.desc}). A test of your soul awaits.`;
            eMsg=`${sq.icon} ${sq.skt} — Step ${stepNum}/7`;play("dilemma");
            showEvent({icon:sq.icon,title:`अष्टांग मार्ग · Step ${stepNum}`,subtitle:introText,color:"#f0d050"},()=>{
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
            showEvent({icon:"ॐ",title:"मोक्ष प्राप्त — MOKSHA!",subtitle:`${pName} reached Square 108 — Moksha! Punya (${nPunya[cur]}) ≥ Papa (${nPapa[cur]}). Liberation! The cycle of Samsara ends.`,color:"#f0d050"},finishTurn);
          }else{p=67;eMsg="Impure → 67";play("snake");play("yamaLaugh");
            showEvent({icon:"⚠",title:"Gates of Moksha REJECT You!",subtitle:`${pName}, your soul is impure! Punya (${nPunya[cur]}) < Papa (${nPapa[cur]}). Cast back to 67.`,color:"#e06030"},finishTurn);
          }}
          else{finishTurn()}
        }
      },280);
    };

    // Show graha popup — user dismisses, then movement begins
    // On sacred path: skip graha popup entirely
    if(onSacredPath){startMovement()}
    else{showEvent({icon:g.icon,title:`${g.n} · ${g.en}`,subtitle:grahaStory,color:g.color,type:"graha"},startMovement)}
  },[cur,nP,dil,win,busy,punya,papa,pos,shieldA,skipA,play,players,showEvent,chosenLang,muted]);

  const solvD=(ci)=>{
    if(!dil)return;const ch=dil.c[ci],fx=ch.fx||{};
    const np=[...punya],npa=[...papa],nsk=[...skipA],npos=[...pos],nsh=[...shieldA];
    const pName=players[dil.pi]?.name||"Seeker";

    if(dil.ashtanga){
      // ═══ ASHTANGA RIDDLE RESULT ═══
      if(ch.k==="punya"){
        // CORRECT — give punya, advance normally (already moved to this square)
        np[dil.pi]+=(fx.punya||2);
        setPunya(np);setPapa(npa);setSkipA(nsk);setPos(npos);setShieldA(nsh);
        play("chime");
        setMsg(`✓ Correct! ${pName} gains +${fx.punya||2} Punya`);
        // Speak congratulations
        if(!muted)VoiceEngine.speak(`Well done ${pName}! You have answered correctly. Your soul grows purer.`,chosenLang);
      }else{
        // WRONG — add papa, move BACK but stay on sacred path if possible
        npa[dil.pi]+=(fx.papa||1);
        const curPos=npos[dil.pi];
        const backTo=Math.max(1,curPos-1); // go back 1 step on sacred path (retry next turn)
        npos[dil.pi]=backTo;
        setPunya(np);setPapa(npa);setSkipA(nsk);setPos(npos);setShieldA(nsh);
        play("yamaLaugh");
        setMsg(`✗ Wrong! ${pName} falls back to square ${backTo}. +${fx.papa||1} Papa`);
      }
      if(np[dil.pi]>=30&&!win){setWin(dil.pi);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory")}
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
    if(ch.k==="punya")play("chime");else if(ch.k==="papa")play("yamaLaugh");
    if(np[dil.pi]>=30&&!win){setWin(dil.pi);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory")}
    setDil(null);setCur(c=>(c+1)%nP);
  };

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
    const voiceText=`Dharma Dilemma. ${dil.en}. ${dil.txt}. Your choices are: ${dil.c.map((c,i)=>c.l).join('. Or. ')}`;
    VoiceEngine.speak(voiceText,chosenLang);
    return()=>VoiceEngine.stop();
  },[dil,muted]);

  const board=useMemo(()=>{const s=[];for(let r=0;r<10;r++)for(let c=0;c<10;c++){const a=9-r;s.push({num:a*10+(a%2===0?c:9-c)+1})}return s},[]);
  const conns=useMemo(()=>{const l=[];Object.entries(SNAKES).forEach(([f,{to}])=>{const a=sqP(+f),b=sqP(to);l.push({f:a,t:b,type:"s",id:+f})});Object.entries(LADDERS).forEach(([f,{to}])=>{const a=sqP(+f),b=sqP(to);l.push({f:a,t:b,type:"l",id:+f})});return l},[]);
  const shl=SHLOKAS[shI];

  // ═══ GLOBAL OVERLAYS — rendered on every screen ═══
  const globalOverlays=<>
    <style>{CSS}</style>
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
  </>;

  // ═══ TITLE ═══
  if(screen==="title")return(
    <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      {globalOverlays}
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center,transparent 35%,rgba(8,6,3,.8) 100%)",pointerEvents:"none"}}/>
      <div style={{fontSize:52,marginBottom:12,animation:"pulse 3s ease infinite"}}>🔱</div>
      <h1 style={{fontSize:"clamp(38px,9vw,72px)",fontFamily:"'Yatra One',serif",margin:"0 0 6px",letterSpacing:4,textShadow:"0 2px 10px rgba(0,0,0,.7)",color:"#f0d050",animation:"reveal 1.5s ease"}}>मोक्षपटम्</h1>
      <div style={{fontSize:"clamp(14px,3vw,24px)",letterSpacing:12,fontFamily:"'Cinzel Decorative',serif",fontWeight:700,opacity:.55,animation:"reveal 1.5s ease .2s both"}}>MOKSHA PATAM</div>
      <div style={{fontSize:"clamp(8px,1.3vw,11px)",letterSpacing:7,opacity:.25,marginTop:4}}>THE ANCIENT GAME OF KARMA</div>
      <div style={{width:60,height:1,background:"linear-gradient(90deg,transparent,rgba(240,200,80,.4),transparent)",margin:"22px 0"}}/>
      <div style={{maxWidth:520,textAlign:"center",opacity:shF?1:0,transition:"all .8s",marginBottom:24}}>
        <div style={{fontSize:"clamp(14px,2.5vw,19px)",fontFamily:"'Noto Serif Devanagari',serif",lineHeight:2,color:"#f0d050",opacity:.7}}>{shl.s}</div>
        <div style={{fontSize:10,opacity:.35,fontFamily:"'Noto Serif Devanagari',serif",marginTop:4}}>{shl.r}</div>
      </div>
      <div style={{fontSize:"clamp(10px,1.4vw,13px)",fontStyle:"italic",opacity:.3,marginBottom:28,letterSpacing:2,textAlign:"center"}}>"Rise through virtue. Fall through vice. Seek liberation."</div>
      <div style={{marginBottom:20,textAlign:"center",animation:"reveal 1.5s ease .3s both"}}>
        <div style={{fontSize:11,opacity:.4,letterSpacing:4,marginBottom:12}}>CHOOSE NARRATION VOICE</div>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>{setChosenLang('en');ambient.start()}} style={{width:120,background:chosenLang==='en'?"rgba(200,160,60,.15)":"transparent",border:`1px solid ${chosenLang==='en'?"rgba(240,200,80,.7)":"rgba(200,160,60,.3)"}`,boxShadow:chosenLang==='en'?"0 0 20px rgba(240,200,80,.1)":"none",color:"#e8c850",padding:"14px 0",fontSize:13,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,transition:"all .15s",letterSpacing:2,textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>🇬🇧</div>English
          </button>
          <button onClick={()=>{setChosenLang('hi');ambient.start()}} style={{width:120,background:chosenLang==='hi'?"rgba(200,160,60,.15)":"transparent",border:`1px solid ${chosenLang==='hi'?"rgba(240,200,80,.7)":"rgba(200,160,60,.3)"}`,boxShadow:chosenLang==='hi'?"0 0 20px rgba(240,200,80,.1)":"none",color:"#e8c850",padding:"14px 0",fontSize:13,fontFamily:"'Noto Serif Devanagari',serif",cursor:"pointer",borderRadius:3,transition:"all .15s",letterSpacing:2,textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>🇮🇳</div>हिन्दी
          </button>
        </div>
      </div>
      <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",animation:"reveal 1.5s ease .4s both"}}>
        <button className="gb gp" disabled={preloading} onClick={()=>{
          ambient.start();
          const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);
          if (isLocal) { setScreen("story"); setStoryPage(0); return; }
          setPreloading(true); setPreloadPct(0);
          const { promise, progress } = AudioCache.preloadAll(chosenLang);
          const iv = setInterval(() => setPreloadPct(progress()), 300);
          promise.then(() => { clearInterval(iv); setPreloadPct(100); setCacheCount(AudioCache.count()); setPreloading(false); setScreen("story"); setStoryPage(0); })
            .catch(() => { clearInterval(iv); setPreloading(false); setScreen("story"); setStoryPage(0); });
        }} style={{fontSize:14,padding:"14px 32px",letterSpacing:3}}>
          {preloading ? `📜 LOADING VOICES... ${preloadPct}%` : "📜 BEGIN WITH STORY"}
        </button>
        <button className="gb" onClick={()=>{ambient.start();setScreen("pickcount")}} style={{fontSize:14,padding:"14px 32px",letterSpacing:3,opacity:.6}}>⚡ SKIP TO GAME</button>
      </div>
      <div style={{marginTop:10,opacity:.15,fontSize:9}}>Screen text is always English · Voice follows your choice</div>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16,flexWrap:"wrap"}}>
        <button onClick={()=>setShowGuide(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📜 How to Play</button>
        <button onClick={()=>setShowInfo(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📖 Encyclopaedia</button>
      </div>
      <div style={{marginTop:10}}><InstaBadge/></div>
    </div>
  );

  // ═══ STORY ═══
  if(screen==="story"){
    const pg=STORY_PAGES[storyPage];
    return(
      <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",padding:"clamp(16px,4vw,40px)",overflowY:"auto"}}>
        {globalOverlays}
        <div style={{maxWidth:640,width:"100%",animation:"slideUp .8s ease"}} key={storyPage}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:40,marginBottom:8}}>{pg.icon}</div>
            <h2 style={{fontSize:"clamp(22px,5vw,36px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:0}}>{pg.title}</h2>
            <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{fontSize:10,opacity:.3,letterSpacing:5}}>{storyPage+1} OF {STORY_PAGES.length}</div>
              <button onClick={()=>{if(!muted)VoiceEngine.speakNarrator(pg[chosenLang],chosenLang);else VoiceEngine.stop()}} style={{background:"transparent",border:"1px solid rgba(200,160,60,.25)",color:"#c0b080",padding:"3px 10px",fontSize:10,cursor:"pointer",borderRadius:3,opacity:.6}}>
                🔊 Narrate
              </button>
              <button onClick={toggleMute} style={{background:"transparent",border:"1px solid rgba(200,160,60,.25)",color:"#c0b080",padding:"3px 10px",fontSize:11,cursor:"pointer",borderRadius:3,opacity:.6}}>
                {muted?"🔇":"🔊"}
              </button>
            </div>
            {cacheCount>0&&<div style={{display:"flex",justifyContent:"center",gap:10,marginTop:6,alignItems:"center"}}>
              <div style={{fontSize:8,opacity:.25,letterSpacing:2}}>{cacheCount} voices cached</div>
              <button onClick={()=>{AudioCache.clear();setCacheCount(0)}} style={{background:"transparent",border:"1px solid rgba(200,160,60,.15)",color:"#c0b080",padding:"1px 8px",fontSize:8,cursor:"pointer",borderRadius:2,opacity:.3,letterSpacing:1}}>Clear Cache</button>
            </div>}
          </div>
          <div style={{background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.15)",padding:"clamp(16px,3vw,28px)",borderRadius:4,marginBottom:20}}>
            {pg.body.split("\n\n").map((p,i)=><p key={i} style={{fontSize:"clamp(12px,1.6vw,15px)",lineHeight:2,color:"#d0c090",margin:i>0?"16px 0 0":0}}>{p}</p>)}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
            {storyPage>0?<button className="gb" onClick={()=>{VoiceEngine.stop();setStoryPage(storyPage-1)}}>← Back</button>:<div/>}
            {storyPage<STORY_PAGES.length-1?
              <button className="gb gp" onClick={()=>{VoiceEngine.stop();setStoryPage(storyPage+1)}}>Next →</button>:
              <button className="gb gp" onClick={()=>{VoiceEngine.stop();setScreen("pickcount")}}>Choose Seekers →</button>}
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:12}}><div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:8,flexWrap:"wrap"}}><button onClick={()=>setShowGuide(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📜 How to Play</button><button onClick={()=>setShowInfo(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📖 Encyclopaedia</button></div><InstaBadge/></div>
      </div>
    );
  }

  // ═══ PICK COUNT ═══
  if(screen==="pickcount")return(
    <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      {globalOverlays}
      <div style={{animation:"slideUp .8s ease",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>🔱</div>
        <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:"0 0 8px"}}>How Many Seekers?</h2>
        <p style={{fontSize:13,opacity:.4,marginBottom:12,letterSpacing:3}}>Each soul walks a different path</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="gb gp" onClick={()=>{
            setNP(2);setIsCPU([false,true]);setPlayers([]);setUsedChars([]);setTempName("");setTempChar(-1);
            setScreen("yama");
          }} style={{padding:"18px 36px",fontSize:16}}>
            <div style={{fontSize:22,marginBottom:4}}>☠️</div>1 vs Yama
          </button>
          {[2,3,4].map(n=><button key={n} className="gb" onClick={()=>{setNP(n);setIsCPU(Array(n).fill(false));setPlayers([]);setUsedChars([]);setTempName("");setTempChar(-1);setScreen("setup")}} style={{padding:"18px 36px",fontSize:16}}>{n} Players</button>)}
        </div>
        <div style={{marginTop:16}}><div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:8,flexWrap:"wrap"}}><button onClick={()=>setShowGuide(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📜 How to Play</button><button onClick={()=>setShowInfo(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📖 Encyclopaedia</button></div><InstaBadge/></div>
      </div>
    </div>
  );

  // ═══ YAMA INTRO ═══
  if(screen==="yama"){
    // Phase 0: Yama speaks intro
    // Phase 1: "Who dares challenge me?" - go to setup
    const yamaIntroEn='So, you dare to challenge me? I am Yama. The God of Death. I ride the great buffalo through the realm of the dead. Every soul that walks this board, eventually, comes to me. I have been waiting since the beginning of time. You think you can outwit Death? You think your little virtues will save you? I have watched a million souls fall. Brave warriors. Wise sages. Holy saints. They all fell. And I devoured their karma. Play your little game, mortal. I will be watching. Every. Single. Move. And when your karma falters, even by a whisper, I will be there. Waiting. Now tell me, little soul. Who are you?';
    const yamaIntroHi='तो, तुम मुझसे खेलना चाहते हो? मैं यमराज हूँ। मृत्यु का देवता। मैं महान भैंसे पर सवार होकर मृतकों के लोक से गुज़रता हूँ। हर आत्मा जो इस पट पर चलती है, अंत में मेरे पास आती है। मैं सृष्टि के आरम्भ से प्रतीक्षा कर रहा हूँ। तुम्हें लगता है तुम मृत्यु को हरा सकते हो? तुम्हें लगता है तुम्हारे छोटे-छोटे पुण्य तुम्हें बचा लेंगे? मैंने लाखों आत्माओं को गिरते देखा है। वीर योद्धा। ज्ञानी ऋषि। पवित्र संत। सब गिरे। और मैंने उनका कर्म निगल लिया। खेलो अपना छोटा सा खेल, नश्वर प्राणी। मैं देख रहा हूँ। हर एक कदम। और जब तुम्हारा कर्म डगमगाएगा, एक फुसफुसाहट भर भी, मैं वहीं रहूँगा। इंतज़ार करता हुआ। अब बताओ, छोटी सी आत्मा। तुम कौन हो?';

    return(
      <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh",background:"radial-gradient(ellipse at center,#1a0808 0%,#0c0505 40%,#050202 100%)"}}>
        {globalOverlays}
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
        </div>}

        {yamaPhase===1&&<div style={{textAlign:"center",animation:"dharmaIn .6s ease forwards",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{marginBottom:12,animation:"yamaBreath 2s ease infinite",display:"flex",justifyContent:"center"}}><YamaIcon size={150}/></div>
          <div style={{fontSize:"clamp(20px,5vw,36px)",fontFamily:"'Yatra One',serif",color:"#c04040",letterSpacing:3,marginBottom:8}}>
            {chosenLang==='hi'?"तुम कौन हो?":"Who dares challenge me?"}
          </div>
          <div style={{fontSize:"clamp(11px,1.5vw,14px)",color:"#806060",marginBottom:28,fontStyle:"italic",letterSpacing:2}}>
            {chosenLang==='hi'?"अपनी पहचान बताओ, नश्वर प्राणी":"Identify yourself, mortal"}
          </div>
          <button className="gb gp" onClick={()=>setScreen("setup")} style={{padding:"14px 40px",fontSize:16,letterSpacing:4,background:"rgba(160,64,64,.15)",border:"2px solid rgba(160,64,64,.4)",color:"#e08080"}}>
            {chosenLang==='hi'?"अपना योद्धा चुनो ▸":"CHOOSE YOUR SEEKER ▸"}
          </button>
        </div>}

        <div style={{position:"fixed",bottom:20,textAlign:"center"}}><InstaBadge/></div>
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
            <div style={{fontSize:10,opacity:.3,letterSpacing:5}}>SEEKER {pidx+1} OF {nP}</div>
            <h2 style={{fontSize:"clamp(20px,4vw,30px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:"8px 0"}}>Choose Your Identity</h2>
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
            <button className="gb" onClick={()=>{if(pidx===0)setScreen("pickcount");else{const lp=players[players.length-1];setPlayers(p=>p.slice(0,-1));setUsedChars(u=>u.filter(x=>x!==lp.charIdx))}}}>← Back</button>
            <button className="gb gp" onClick={addPlayer} style={{opacity:(!tempName.trim()||tempChar<0)?.4:1}}>{pidx<nP-1?"Next Seeker →":"Begin Journey →"}</button>
          </div>
          {players.length>0&&<div style={{marginTop:16,borderTop:"1px solid rgba(200,160,60,.1)",paddingTop:12}}>
            <div style={{fontSize:9,letterSpacing:3,opacity:.3,marginBottom:6}}>CHOSEN</div>
            {players.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",opacity:.6}}><span style={{fontSize:16}}>{p.char.icon}</span><span style={{fontSize:12,color:p.char.color}}>{p.name}</span><span style={{fontSize:10,opacity:.4}}>— {p.char.name}</span></div>)}
          </div>}
          <div style={{textAlign:"center",marginTop:12}}><div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:8,flexWrap:"wrap"}}><button onClick={()=>setShowGuide(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📜 How to Play</button><button onClick={()=>setShowInfo(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"4px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:3,letterSpacing:1,opacity:.5}}>📖 Encyclopaedia</button></div><InstaBadge/></div>
        </div>
      </div>
    );
  }

  // ═══ INFO ═══
  // ═══ GAME ═══
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
          <div onClick={()=>setShowRiddles(true)} style={{fontSize:"clamp(18px,3.5vw,28px)",fontFamily:"'Yatra One',serif",letterSpacing:3,color:"#f0d050",cursor:"pointer"}}>मोक्षपटम्</div>
          <button onClick={toggleMute} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"2px 8px",fontSize:12,cursor:"pointer",borderRadius:3}}>{muted?"🔇":"🔊"}</button>
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
          {win!==null&&<div style={{background:"radial-gradient(circle,rgba(240,200,80,.08),#12100a)",border:"2px solid rgba(240,200,80,.4)",padding:22,textAlign:"center"}}>
            <div style={{fontSize:40,animation:"mp 2s ease infinite"}}>ॐ</div>
            <div style={{fontSize:20,fontFamily:"'Yatra One',serif",margin:"6px 0",color:"#f0d050"}}>मोक्ष प्राप्त</div>
            <div style={{fontSize:15,color:players[win]?.char?.color}}>{players[win]?.char?.icon} {players[win]?.name}</div>
            <div style={{fontSize:12,opacity:.6}}>{players[win]?.char?.name} is liberated</div>
            <button onClick={()=>{setScreen("title");setWin(null);setPlayers([]);ambient.stop()}} className="gb" style={{marginTop:14}}>New Journey</button>
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
          <div style={{background:"linear-gradient(180deg,#1e1810,#14100a)",border:"1px solid rgba(200,160,60,.2)",padding:12,borderRadius:4}}>
            <div onClick={(e)=>{
              // ═══ HIDDEN DEBUG: Triple-click to jump to square 100 ═══
              // To disable: remove this onClick handler
              if(e.detail===3){const np=[...pos];np[cur]=100;setPos(np);setMsg("DEBUG: Jumped to 100")}
            }} style={{fontSize:9,letterSpacing:4,opacity:.5,marginBottom:10,color:"#f0d050",fontWeight:700,textAlign:"center",cursor:"default"}}>⚔ KARMA SCOREBOARD ⚔</div>
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
        </div>
      </div>
    </div>
  );
}
