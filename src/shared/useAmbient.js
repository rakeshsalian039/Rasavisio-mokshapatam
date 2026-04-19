// ─────────────────────────────────────────────────────────────────────────────
// shared/useAmbient.js
// Ambient music engine — pauses when tab hidden, resumes on return
// Change /ambient.mp3 in /public to swap background music
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useCallback, useEffect } from 'react';

export function useAmbient(){
  const audioRef=useRef(null);const playing=useRef(false);
  const start=useCallback(()=>{
    if(playing.current)return;
    // Defer audio setup off the click's critical frame (see MokshaGame
    // useAmbient for the full rationale — presentation delay 183ms → <50ms).
    const run = () => {
      try{
        let a = typeof document !== 'undefined'
          ? document.getElementById('preload-ambient') : null;
        if (a && a.tagName === 'AUDIO') {
          a.muted = false; a.style.display = 'none';
        } else {
          a = new Audio("/ambient.mp3");
        }
        a.loop=true; a.volume=1.0;
        audioRef.current=a;
        a.play().then(()=>{playing.current=true}).catch(()=>{});
      }catch(e){}
    };
    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run, { timeout: 600 });
    } else {
      requestAnimationFrame(() => requestAnimationFrame(run));
    }
  },[]);
  const stop=useCallback(()=>{
    if(!playing.current||!audioRef.current)return;
    try{const a=audioRef.current;a.pause();a.currentTime=0;playing.current=false;audioRef.current=null;}catch(e){}
  },[]);
  const duck=useCallback(()=>{if(audioRef.current){try{audioRef.current.pause()}catch(e){}}},[]);
  const unduck=useCallback(()=>{if(audioRef.current&&playing.current){try{audioRef.current.play().catch(()=>{})}catch(e){}}},[]);

  // ── Pause when tab hidden, resume when visible ──
  useEffect(()=>{
    const onVisibility=()=>{
      if(!audioRef.current||!playing.current) return;
      if(document.hidden){ try{audioRef.current.pause()}catch(e){} }
      else { try{audioRef.current.play().catch(()=>{})}catch(e){} }
    };
    document.addEventListener('visibilitychange',onVisibility);
    return()=>document.removeEventListener('visibilitychange',onVisibility);
  },[]);

  return{start,stop,duck,unduck,playing};
}

/* ═══ VOICEOVER — Puter.js Neural AI → Browser Fallback ═══ */
