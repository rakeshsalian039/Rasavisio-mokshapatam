import { useRef, useCallback } from "react";
// ═══ AMBIENT MUSIC ENGINE ═══
//
// Plays background music on loop.
// TO CHANGE MUSIC: Replace /ambient.mp3 in the /public folder.

/* ═══ AMBIENT MUSIC ENGINE ═══ */
export function useAmbient(){
  const audioRef=useRef(null);const playing=useRef(false);
  const start=useCallback(()=>{
    if(playing.current)return;
    try{
      // ═══════════════════════════════════════════════════════════
      // 🎵 TO CHANGE THE MUSIC:
      // Put your audio file in the /public folder and change the
      // filename below. Supports MP3, OGG, WAV.
      // Example: "/vedic-chant.mp3" or "/tanpura-drone.ogg"
      // ═══════════════════════════════════════════════════════════
      const a=new Audio("/ambient.mp3");
      a.loop=true;
      a.volume=0.08;
      audioRef.current=a;
      a.play().then(()=>{playing.current=true}).catch(()=>{});
    }catch(e){}
  },[]);
  const stop=useCallback(()=>{
    if(!playing.current||!audioRef.current)return;
    try{
      const a=audioRef.current;
      a.pause();a.currentTime=0;
      playing.current=false;audioRef.current=null;
    }catch(e){}
  },[]);
  // Mobile browsers (iOS/Android) ignore volume changes on audio elements.
  // So we pause/resume instead of duck/unduck for reliable behavior.
  const duck=useCallback(()=>{
    if(audioRef.current){try{audioRef.current.pause()}catch(e){}}
  },[]);
  const unduck=useCallback(()=>{
    if(audioRef.current&&playing.current){try{audioRef.current.play().catch(()=>{})}catch(e){}}
  },[]);
  return{start,stop,duck,unduck,playing};
}


