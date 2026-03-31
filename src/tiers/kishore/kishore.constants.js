// ─────────────────────────────────────────────────────────────────────────────
// tiers/kishore/kishore.constants.js
// Game data for Kishore Marg (ages 10–20)
//
// PHILOSOPHY:
//   · Real moral weight — peer pressure, loyalty, fairness
//   · Light Sanskrit names with English explanation
//   · Graha dice works — explained as "cosmic wildcards"
//   · Competitive framing — score tracking, combos
//   · References science, history, modern dilemmas alongside Mahabharata
//   · Standard 108-square board, full win conditions
// ─────────────────────────────────────────────────────────────────────────────

// ── SNAKES (real vices, relatable to teenagers) ───────────────────────────
export const SNAKES_KISHORE = {
  16: { to:4,  skt:'क्रोध', en:'ANGER',
        tale:'You said something in anger you cannot take back. Words are arrows — once released, they cannot return to the bow.' },
  23: { to:7,  skt:'लोभ',  en:'GREED',
        tale:'You cheated to get a higher score. For a moment it felt smart. But the feeling of knowing you didn\'t earn it — that stays.' },
  33: { to:12, skt:'मोह',  en:'ATTACHMENT',
        tale:'You were so attached to what people thought of you that you didn\'t do the right thing. Others\' opinions are not your north star.' },
  38: { to:21, skt:'ईर्ष्या', en:'JEALOUSY',
        tale:'You pulled down a friend\'s achievement because you felt left behind. Jealousy is a fire that burns the one who holds it.' },
  47: { to:29, skt:'प्रमाद', en:'CARELESSNESS',
        tale:'You knew something was wrong but said "it\'s not my problem." Passive inaction is still a choice. And choices have weight.' },
  56: { to:41, skt:'अहंकार', en:'EGO',
        tale:'You refused to admit you were wrong because it felt embarrassing. The strongest people are those who can say: I was wrong.' },
  62: { to:44, skt:'भय',  en:'FEAR',
        tale:'You stayed silent when you should have spoken up. Fear of judgment kept you from doing what you knew was right.' },
  74: { to:51, skt:'द्वेष', en:'HATE',
        tale:'You judged someone before knowing their story. Every person you meet is fighting a battle you know nothing about.' },
  85: { to:59, skt:'आलस्य', en:'LAZINESS',
        tale:'You had the talent but not the work ethic. Talent without effort is a superpower you never turned on.' },
  95: { to:68, skt:'अज्ञान', en:'IGNORANCE',
        tale:'You refused to question what you were told. The greatest thinkers in history questioned everything — even what seemed obvious.' },
};

// ── LADDERS (real virtues with modern resonance) ─────────────────────────
export const LADDERS_KISHORE = {
  3:  { to:18, skt:'सहानुभूति', en:'EMPATHY',
        tale:'You listened — really listened — to someone who was struggling. Empathy is the rarest superpower in the modern world.' },
  9:  { to:31, skt:'साहस', en:'COURAGE',
        tale:'You stood up for someone even when it cost you socially. That is the only kind of courage that matters.' },
  22: { to:42, skt:'जिज्ञासा', en:'CURIOSITY',
        tale:'You asked "why?" when everyone else accepted "because." Every discovery in history started with that one word.' },
  28: { to:52, skt:'अनुशासन', en:'DISCIPLINE',
        tale:'You did the work when you didn\'t feel like it. Motivation is for beginners. Discipline is what builds a life.' },
  37: { to:58, skt:'सत्य', en:'TRUTH',
        tale:'You told an uncomfortable truth instead of a comfortable lie. Truth is harder. Truth is also what builds trust.' },
  44: { to:65, skt:'कृतज्ञता', en:'GRATITUDE',
        tale:'You acknowledged how much you have been given. Gratitude doesn\'t change what you have — it changes how you see what you have.' },
  53: { to:72, skt:'विनम्रता', en:'HUMILITY',
        tale:'You admitted you don\'t know everything and asked for help. The wisest people in every field say: I\'m still learning.' },
  61: { to:80, skt:'सेवा', en:'SERVICE',
        tale:'You gave your time to something bigger than yourself. Service is the only thing that makes life feel like it means something.' },
  71: { to:89, skt:'एकाग्रता', en:'FOCUS',
        tale:'You ignored the noise and went deep. In a world of distraction, focus is the rarest and most valuable skill.' },
  82: { to:97, skt:'वैराग्य', en:'LETTING GO',
        tale:'You released something you were holding too tightly. Letting go is not weakness — it is the most advanced move.' },
};

// ── DILEMMAS (real teenage moral weight) ─────────────────────────────────
export const DILEMMAS_KISHORE = [
  { t:'The Group Chat',
    txt:'Your friends are making fun of someone in the group chat. It\'s mean but nobody is stopping it. If you say something, you might get excluded. If you stay silent, you\'re complicit.',
    c:[
      { l:'💬 Say something — "This isn\'t cool." — BACK 5, +3 Punya',   k:'punya', fx:{punya:3, move:-5} },
      { l:'🔕 Stay silent, keep scrolling — ADVANCE 6, +2 Papa',          k:'papa',  fx:{papa:2,  move:6}  },
    ]},
  { t:'The Exam',
    txt:'You can see your classmate\'s answers. You haven\'t studied. The exam is 40% of your grade. Nobody will know.',
    c:[
      { l:'📝 Cover your paper and do your own work — BACK 3, +3 Punya', k:'punya', fx:{punya:3, move:-3} },
      { l:'👀 Copy just a few answers — ADVANCE 8, +3 Papa',              k:'papa',  fx:{papa:3,  move:8}  },
    ]},
  { t:'The Rumour',
    txt:'A rumour is spreading about someone you don\'t like much. It might not be true. But it\'s spreading fast and you could add to it.',
    c:[
      { l:'🛑 Don\'t spread it, tell others to stop — BACK 4, +4 Punya', k:'punya', fx:{punya:4, move:-4} },
      { l:'📢 Share it — just this once — ADVANCE 7, +3 Papa',            k:'papa',  fx:{papa:3,  move:7}  },
    ]},
  { t:'The Credit',
    txt:'You and your friend worked on a project together. The teacher praised only you. Your friend is standing right there.',
    c:[
      { l:'🤝 "Actually, we did this together" — skip turn, +4 Punya',   k:'punya', fx:{punya:4, skip:true} },
      { l:'😬 Accept the praise and say nothing — ADVANCE 5, +2 Papa',   k:'papa',  fx:{papa:2,  move:5}  },
    ]},
  { t:'The Shortcut',
    txt:'There\'s a way to get a massive advantage in this game by exploiting a rule loophole. You noticed it. Nobody else did.',
    c:[
      { l:'🎯 Play fair — more satisfying to win honestly — +3 Punya',   k:'punya', fx:{punya:3} },
      { l:'⚡ Use the loophole — ADVANCE 15, +5 Papa',                    k:'papa',  fx:{papa:5,  move:15} },
    ]},
  { t:'The Confession',
    txt:'You broke something valuable belonging to a friend. You could hide it. Or tell them.',
    c:[
      { l:'✅ Tell them — it will be awkward but honest — +3 Punya',      k:'punya', fx:{punya:3, move:-3} },
      { l:'🙈 Hide it and hope they don\'t notice — ADVANCE 6, +2 Papa', k:'papa',  fx:{papa:2,  move:6}  },
    ]},
];

// ── CHARACTERS ────────────────────────────────────────────────────────────
export const CHARS_KISHORE = [
  { id:'warrior',  name:'The Warrior',   icon:'⚔',  color:'#e04830',
    lore:'Fearless but learning when to fight and when to step back.' },
  { id:'scholar',  name:'The Scholar',   icon:'📚', color:'#4880e0',
    lore:'Smart but discovering that intelligence without wisdom is empty.' },
  { id:'artist',   name:'The Creator',   icon:'🎨', color:'#c060d0',
    lore:'Creative and finding that originality requires courage.' },
  { id:'athlete',  name:'The Athlete',   icon:'🏃', color:'#30c050',
    lore:'Disciplined and realising the body is just one arena.' },
  { id:'rebel',    name:'The Rebel',     icon:'⚡', color:'#e0a020',
    lore:'Questions everything — now learning what\'s worth fighting for.' },
  { id:'healer',   name:'The Healer',    icon:'🌿', color:'#40b090',
    lore:'Empathetic and realising caring for others starts with self.' },
];
