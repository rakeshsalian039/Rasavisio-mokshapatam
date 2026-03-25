// ═══ NAVAGRAHA — 9 Planetary Effects ═══
//
// Each graha has:
//   - n: Sanskrit name
//   - en: English name  
//   - icon: Emoji icon
//   - fx: Effect key used in doRoll logic (sun/moon/mars/mercury/jupiter/venus/saturn/rahu/ketu)
//   - color: Popup border color
//
// The gameplay effects of each graha are in App.jsx doRoll function.
// To change what a graha DOES, edit the doRoll function.
// To change graha NAMES/ICONS, edit here.

export const GRAHA=[
  {n:"सूर्य",en:"Surya — The Sun",icon:"☀",desc:"The king of planets blazes your path forward. As Surya illuminated Karna with divine armour, his radiance grants you +2 extra steps. The Sun sees all — nothing hides from his gaze.",color:"#f0b840",fx:"sun"},
  {n:"चन्द्र",en:"Chandra — The Moon",icon:"☾",desc:"Chandra, who waxes and wanes like karma itself, bathes you in lunar grace. The Moon purifies — you receive +1 Punya. As Chandra calmed Shiva's burning third eye, his light soothes your soul.",color:"#a0c8e0",fx:"moon"},
  {n:"मंगल",en:"Mangal — Mars",icon:"♂",desc:"Mars, the warrior planet born from Shiva's sweat, fills you with battle fury. The nearest seeker retreats 3 squares. But violence has a price — you gain +1 Papa. Even righteous war leaves karmic scars.",color:"#e07050",fx:"mars"},
  {n:"बुध",en:"Budh — Mercury",icon:"☿",desc:"Mercury, son of Chandra and Tara (born from a cosmic scandal), governs fate's reversals. Your position swaps with the nearest seeker — you take their place, they take yours. Then you move forward. Budh reminds us: fortune is never permanent.",color:"#80c080",fx:"mercury"},
  {n:"बृहस्पति",en:"Brihaspati — Jupiter",icon:"♃",desc:"Brihaspati, guru of the Devas and wisest of all planets, showers divine blessings upon the entire board. ALL seekers gain +1 Punya. Jupiter's grace is universal — even enemies benefit from a truly great teacher's wisdom.",color:"#f0d060",fx:"jupiter"},
  {n:"शुक्र",en:"Shukra — Venus",icon:"♀",desc:"Shukra, guru of the Asuras, possessed the secret of Sanjeevani — the power to resurrect the dead. He grants you a celestial Shield. The next serpent that strikes you will find its venom neutralized. This Shield works once — use it wisely.",color:"#d0a0c0",fx:"venus"},
  {n:"शनि",en:"Shani — Saturn",icon:"♄",desc:"Shani Dev, the fearsome lord of karma and justice, turns his gaze upon you. His stare alone toppled kingdoms. You are pushed BACK 3 squares and gain +1 Papa. Even the gods feared Shani's slow, grinding justice. No one escapes Saturn's lessons.",color:"#8080a0",fx:"saturn"},
  {n:"राहु",en:"Rahu — The Shadow",icon:"☊",desc:"Rahu, the shadow planet, is the severed head of the demon Svarbhanu who drank the nectar of immortality. He creates eclipses by swallowing the Sun. Rahu steals +1 Punya from the leading seeker and gives it to the trailing seeker. Chaos. Inversion. The first shall be last.",color:"#6050a0",fx:"rahu"},
  {n:"केतु",en:"Ketu — The Tail",icon:"☋",desc:"Ketu is Rahu's headless body — the planet of detachment and moksha. All seekers lose their Shield (if any). Ketu strips away all protection, all attachments. But in loss, there is liberation. The seeker closest to Square 108 gains +1 Punya — for Ketu rewards those who are ready to let go.",color:"#a06060",fx:"ketu"},
];

