import React from "react";
// ═══ YAMA ICON SVG ═══
//
// Renders Yama riding his buffalo mount.
// Props: size (default 80)
// Used on: Yama intro screen, CPU player token

export default function YamaIcon({size=80}){
  return <div style={{width:size,height:size*1.3,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <img src="/yama.png" alt="Yama - God of Death" style={{width:"100%",height:"100%",objectFit:"contain",filter:"drop-shadow(0 0 25px rgba(200,40,40,.5)) drop-shadow(0 0 50px rgba(160,40,40,.3))",borderRadius:8}}/>
  </div>;
}



