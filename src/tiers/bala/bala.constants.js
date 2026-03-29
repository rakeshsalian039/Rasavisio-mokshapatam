// ─────────────────────────────────────────────────────────────────────────────
// tiers/bala/bala.constants.js
// Game data for Bala Marg (ages 5–10)
//
// PHILOSOPHY:
//   · Snakes = animals who made a bad choice (relatable, not scary)
//   · Ladders = animals who did something kind (warm, rewarding)
//   · Dilemmas = simple yes/no moral choices with obvious right answers
//   · No Sanskrit, no Mahabharata — just stories kids understand
//   · No catastrophic falls — max snake drop is 15 squares
//   · Win at square 72 (not 108) — shorter game, kids' attention spans
// ─────────────────────────────────────────────────────────────────────────────

// ── SNAKES (bad choices = small animals, relatable mistakes) ──────────────
export const SNAKES_BALA = {
  14: { to:5,  animal:'🐊', name:'The Greedy Crocodile',
        tale:'This crocodile took ALL the mangoes from the tree and left none for others. Being greedy means everyone loses!' },
  22: { to:9,  animal:'🦊', name:'The Tricky Fox',
        tale:'This fox told a lie to get more food. But lies always come back! The forest animals found out and stopped trusting him.' },
  31: { to:18, animal:'🐘', name:'The Angry Elephant',
        tale:'This elephant got angry and stomped on the flowers just because he was in a bad mood. Anger hurts things that are beautiful.' },
  40: { to:28, animal:'🐒', name:'The Lazy Monkey',
        tale:'This monkey kept saying "later, later" and never helped build the shelter. When the rain came, he had no home.' },
  54: { to:38, animal:'🦁', name:'The Proud Lion',
        tale:'This lion said he was the best at EVERYTHING and never let others try. Pride stops you from learning new things.' },
  63: { to:50, animal:'🐺', name:'The Selfish Wolf',
        tale:'This wolf found a warm cave but kept it all to himself on a cold night. The next week, when HE needed help, no one came.' },
};

// ── LADDERS (good choices = helpful animals) ──────────────────────────────
export const LADDERS_BALA = {
  4:  { to:16, animal:'🐘', name:'The Helpful Elephant',
        tale:'This elephant used her trunk to lift a little deer who had fallen into a ditch. Helping others lifts YOU up too!' },
  11: { to:25, animal:'🦜', name:'The Kind Parrot',
        tale:'This parrot shared his seeds with hungry sparrows even though he was also hungry. Kindness always comes back.' },
  20: { to:36, animal:'🐝', name:'The Hardworking Bee',
        tale:'This bee worked every single day, even on sunny days when she wanted to play. Because she worked hard, her whole hive had honey all winter.' },
  33: { to:52, animal:'🦋', name:'The Brave Butterfly',
        tale:'This tiny butterfly flew through the storm to warn the other animals. Even small creatures can be incredibly brave.' },
  46: { to:60, animal:'🐢', name:'The Patient Turtle',
        tale:'Everyone laughed at the slow turtle. But the turtle never gave up, kept going steadily — and finished first!' },
  58: { to:67, animal:'🦚', name:'The Honest Peacock',
        tale:'This peacock found a golden feather that belonged to someone else. He returned it even though nobody saw him. Honesty feels better than any feather.' },
};

// ── DHARMA SQUARES (simpler, fewer) ──────────────────────────────────────
export const DLM_SQ_BALA = [8, 17, 27, 39, 48, 57];

// ── DILEMMAS (simple yes/no moral choices) ───────────────────────────────
export const DILEMMAS_BALA = [
  { t:'The Dropped Tiffin',
    txt:'Your friend dropped their lunchbox and all their food fell on the ground. You have a full lunch. What do you do?',
    c:[
      { l:'🤝 Share your lunch with them — +2 Stars, feels great',      k:'star', fx:{star:2} },
      { l:'😶 Keep eating yours and pretend you didn\'t see — +1 Square', k:'oops', fx:{move:1} },
    ]},
  { t:'The Lost Puppy',
    txt:'You see a little puppy sitting alone in the rain looking scared. You are on your way to play. What do you do?',
    c:[
      { l:'🐶 Help the puppy find shelter and tell an adult — +3 Stars', k:'star', fx:{star:3} },
      { l:'🏃 Run to play, someone else will help — keep going',         k:'oops', fx:{move:2} },
    ]},
  { t:'The Borrowed Pencil',
    txt:'You borrowed a pencil from your classmate and it broke. Do you tell them?',
    c:[
      { l:'✅ Tell the truth and offer to replace it — +2 Stars',        k:'star', fx:{star:2} },
      { l:'🙈 Hide the broken pencil and say nothing — +1 Square',       k:'oops', fx:{move:1} },
    ]},
  { t:'The Last Biscuit',
    txt:'There is one last biscuit on the plate. Your little brother hasn\'t had one yet. What do you do?',
    c:[
      { l:'🍪 Give it to your little brother — +2 Stars, you\'re amazing', k:'star', fx:{star:2} },
      { l:'😋 Eat it quickly before he sees — +1 Square',                  k:'oops', fx:{move:1} },
    ]},
  { t:'The Messy Classroom',
    txt:'Someone made a mess in the classroom and walked away. The teacher is about to come. What do you do?',
    c:[
      { l:'🧹 Clean it up even though it wasn\'t you — +3 Stars',          k:'star', fx:{star:3} },
      { l:'🤐 Sit down and pretend it\'s not your problem — +1 Square',    k:'oops', fx:{move:1} },
    ]},
  { t:'The New Kid',
    txt:'A new kid joined your class today. They are sitting alone at lunch looking shy. What do you do?',
    c:[
      { l:'👋 Go say hello and invite them to sit with you — +3 Stars',    k:'star', fx:{star:3} },
      { l:'😬 Stay with your friends, it\'s awkward — +1 Square',          k:'oops', fx:{move:1} },
    ]},
];

// ── CHARACTERS (animals — kids choose their avatar) ───────────────────────
export const CHARS_BALA = [
  { id:'elephant', name:'Gaja the Elephant', icon:'🐘', color:'#6888c0',
    lore:'Wise, strong, and never forgets a friend. Gaja helps everyone she meets.',
    trait:'Kindness' },
  { id:'peacock',  name:'Mayur the Peacock', icon:'🦚', color:'#30a870',
    lore:'Honest and beautiful. Mayur believes truth is always the most colourful choice.',
    trait:'Honesty' },
  { id:'tiger',    name:'Shera the Tiger',  icon:'🐯', color:'#e08030',
    lore:'Brave and fair. Shera stands up for those who cannot stand up for themselves.',
    trait:'Courage' },
  { id:'deer',     name:'Hiran the Deer',   icon:'🦌', color:'#c0a050',
    lore:'Swift and gentle. Hiran shows that softness is not weakness.',
    trait:'Grace' },
  { id:'monkey',   name:'Bandar the Monkey',icon:'🐒', color:'#b06030',
    lore:'Clever and curious. Bandar learns something new every single day.',
    trait:'Curiosity' },
  { id:'parrot',   name:'Tota the Parrot',  icon:'🦜', color:'#40c860',
    lore:'Cheerful and sharing. Tota believes the more you give, the more you have.',
    trait:'Generosity' },
];

// ── STAR MESSAGES (shown when stars are earned) ───────────────────────────
export const STAR_MESSAGES = [
  '⭐ Wonderful! You earned a star!',
  '🌟 Your heart is pure! A star for you!',
  '✨ That was so kind! Star earned!',
  '💫 Brilliant choice! You\'re shining!',
  '🌠 Amazing! The animals are cheering!',
];

// ── WIN CONDITION ────────────────────────────────────────────────────────
// Bala wins at square 72 OR when 8 stars collected
export const BALA_WIN_SQUARE  = 72;
export const BALA_WIN_STARS   = 8;

// ── GUIDE CHARACTER — Nani the Wise Owl ──────────────────────────────────
// Appears at the bottom of screen, gives gentle hints
export const NANI_MESSAGES = {
  start:    '🦉 Hello! I am Nani the Owl. I will watch over your journey. Roll the dice!',
  snake:    '🦉 Oh no! But don\'t worry — every mistake is a chance to learn. Try again!',
  ladder:   '🦉 Wonderful! Your kindness lifts you higher! Keep going!',
  dilemma:  '🦉 Hmm, a choice! Think carefully — what would a good friend do?',
  win:      '🦉 You did it! You reached the Garden of Stars! You are a true champion!',
  waiting:  '🦉 It\'s your turn! Give those dice a good roll!',
};
