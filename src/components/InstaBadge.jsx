import React from "react";
// ═══ INSTAGRAM BADGE ═══
//
// Shows @india.rasavisio link. Shown on all screens.

export default function InstaBadge(){
  return(
    <a href="https://www.instagram.com/india.rasavisio/" target="_blank" rel="noopener noreferrer"
      style={{display:"inline-flex",alignItems:"center",gap:6,opacity:.4,fontSize:10,color:"#c0b080",textDecoration:"none",transition:"opacity .3s",letterSpacing:1}}
      onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
      onMouseLeave={e=>e.currentTarget.style.opacity='.4'}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
      india.rasavisio
    </a>
  );
}


