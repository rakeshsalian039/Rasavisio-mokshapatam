// ─────────────────────────────────────────────────────────────────────────────
// 🪶 To use standalone: import ChitraguptaIntroScreen from './ChitraguptaIntro'
//    then remove the inline function below (search: function ChitraguptaIntroScreen)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import HowToPlay    from "../../components/HowToPlay.jsx";
import Encyclopedia from "../../components/Encyclopedia.jsx";
import MultiplayerLobby from "../../components/MultiplayerLobby";
import { useMultiplayer } from "../../hooks/useMultiplayer";
import { useTurnTimer }   from "../../hooks/useTurnTimer";
// ═══ AUTH + DATABASE (Supabase) ═══
// npm install @supabase/supabase-js
// Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel env vars
import { createClient } from '@supabase/supabase-js';
const sbUrl = process.env.REACT_APP_SUPABASE_URL || '';
const sbKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = (sbUrl && sbKey) ? createClient(sbUrl, sbKey) : null;
// Debug: log supabase status on load
console.log("Supabase init:",supabase?"✓ Connected to "+sbUrl:"✗ NOT configured (missing env vars)");

const SNAKES={16:{to:4,skt:"क्रोध",en:"WRATH",tale:"As Duryodhana's rage consumed the Kuru dynasty..."},23:{to:7,skt:"लोभ",en:"GREED",tale:"Like Shakuni who gambled away an empire..."},33:{to:12,skt:"मोह",en:"DELUSION",tale:"Dhritarashtra's blind love veiled all judgment..."},38:{to:21,skt:"मात्सर्य",en:"ENVY",tale:"Duryodhana burned with jealousy at Indraprastha..."},47:{to:29,skt:"काम",en:"DESIRE",tale:"Keechaka's lust brought his annihilation..."},56:{to:41,skt:"मद",en:"PRIDE",tale:"Ravana's arrogance toppled golden Lanka..."},62:{to:44,skt:"भय",en:"TERROR",tale:"Arjuna paralysed before the great war..."},74:{to:51,skt:"द्वेष",en:"HATRED",tale:"Drona and Drupada's hatred echoed ages..."},85:{to:59,skt:"आलस्य",en:"SLOTH",tale:"Kumbhakarna slept while dharma crumbled..."},95:{to:68,skt:"अहंकार",en:"EGO",tale:"Parashurama's ego challenged even Rama..."}};
const LADDERS={3:{to:18,skt:"दया",en:"COMPASSION",tale:"Yudhishthira who wept for his enemies..."},9:{to:31,skt:"दान",en:"GENEROSITY",tale:"Karna gave his armour without hesitation..."},22:{to:42,skt:"सत्य",en:"TRUTH",tale:"Harishchandra sacrificed all for truth..."},28:{to:52,skt:"सेवा",en:"SERVICE",tale:"Hanuman whose devotion moved mountains..."},37:{to:58,skt:"तपस्",en:"AUSTERITY",tale:"Vishwamitra whose tapas shook Indra..."},44:{to:65,skt:"श्रद्धा",en:"FAITH",tale:"Shabari waited a lifetime for Rama..."},53:{to:72,skt:"विद्या",en:"WISDOM",tale:"Vidura whose counsel was dharma itself..."},61:{to:80,skt:"विवेक",en:"DISCERNMENT",tale:"Bhishma on his bed of arrows..."},71:{to:89,skt:"भक्ति",en:"DEVOTION",tale:"Prahlada whose devotion survived fire..."},82:{to:97,skt:"वैराग्य",en:"DETACHMENT",tale:"Siddhartha leaving the palace..."}};
const DLM_SQ=[5,10,14,19,25,30,35,43,48,55,60,64,69,73,78,83,88,92,94,97,99];
const SHLOKAS=[{s:"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",r:"भगवद्गीता २.४७"},{s:"यदा यदा हि धर्मस्य ग्लानिर्भवति भारत",r:"भगवद्गीता ४.७"},{s:"असतो मा सद्गमय तमसो मा ज्योतिर्गमय",r:"बृहदारण्यक उपनिषद्"},{s:"नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः",r:"भगवद्गीता २.२३"},{s:"सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज",r:"भगवद्गीता १८.६६"},{s:"अहिंसा परमो धर्मः",r:"महाभारत"}];
// ═══ YAMA TAUNTS — spoken when snake bites or wrong answers ═══
const YAMA_TAUNTS_SNAKE=[
  "Ha ha ha! The serpent devours another soul! Did you think virtue would protect you here? I warned you!",
  "Delicious! Another mortal falls! The Nagas serve me well. Your karma crumbles!",
  "You stumble and fall! How predictable. Every soul thinks they are special, until the serpent strikes!",
  "The serpent's venom flows through you! I can taste your fear from here. Magnificent!",
  "Down you go! Ha ha! The board shows no mercy. Neither do I!",
  "Another one bites the dust! Or should I say, the serpent bites the seeker! How poetic!",
  "That snake was mine, you know. I sent it personally. Consider it, a gift from Death!",
  "Fall! Fall! Ha ha ha! Your precious Punya means nothing when Naga wraps around your soul!",
];
const YAMA_TAUNTS_WRONG=[
  "Wrong! Your ignorance amuses me! The sacred path demands wisdom you clearly lack!",
  "Ha! You call yourself a seeker? Even my buffalo knows that answer!",
  "Foolish mortal! The Rishis weep at your ignorance. Back you go!",
  "Wrong answer! I love watching seekers stumble on the sacred path. It warms my cold heart!",
];
const DILEMMAS=[
  {t:"यक्ष-प्रश्न",en:"The Yaksha's Riddle",
    txt:"At the cursed lake of Dvaitavana, a Yaksha (nature spirit) has killed your four brothers for drinking without answering his riddle. He asks: 'What is the greatest wonder in the world?' Answer with the humility of Yudhishthira — that all men see death around them yet live as though immortal — or shove past this guardian and seize the water by force.",
    c:[{l:"🙏 Answer humbly — skip turn, +3 Punya",k:"punya",fx:{punya:3,skip:true}},{l:"💀 Shove past by force — ADVANCE 10, +3 Papa",k:"papa",fx:{papa:3,move:10}}]},
  {t:"कर्णकवच",en:"Karna's Divine Armour",
    txt:"Indra, king of gods, disguises himself as a beggar to strip Karna of his celestial armour — the Kavach and Kundal given by Surya at birth. With it, Karna is invincible. Without it, he will die at Kurukshetra. Karna knew this, yet gave it away — earning the title Daanveer (greatest donor). Will you sacrifice your Shield to follow his path?",
    c:[{l:"🙏 Surrender your Shield — lose Shield, +4 Punya",k:"punya",fx:{punya:4,loseShield:true}},{l:"💀 Demand payment from Indra — keep Shield, ADVANCE 8, +3 Papa",k:"papa",fx:{papa:3,move:8}}]},
  {t:"द्रौपदीवस्त्र",en:"Draupadi's Disrobing",
    txt:"In the Kuru court, Dushasana drags Draupadi by her hair and attempts to disrobe her. Bhishma, Drona, and every elder sit in shameful silence — their inaction is their greatest sin. Speaking against Duryodhana means exile. Silence means complicity in adharma.",
    c:[{l:"🙏 Speak against the king — BACK 8, +4 Punya",k:"punya",fx:{punya:4,move:-8}},{l:"💀 Stay silent like Bhishma — ADVANCE 6, +3 Papa",k:"papa",fx:{papa:3,move:6}}]},
  {t:"भीष्मप्रतिज्ञा",en:"Bhishma's Terrible Vow",
    txt:"Young Devavrata sees his father Shantanu heartbroken over Satyavati. To bring his father happiness, he takes the most terrifying vow in history — to renounce the throne AND remain celibate forever. The gods wept and named him Bhishma (the terrible). This one act of sacrifice echoed for generations.",
    c:[{l:"🙏 Take the eternal vow — skip turn, +5 Punya",k:"punya",fx:{punya:5,skip:true}},{l:"💀 Seize the throne for yourself — ADVANCE 12, +4 Papa",k:"papa",fx:{papa:4,move:12}}]},
  {t:"अश्वत्थामा",en:"Yudhishthira's Half-Truth",
    txt:"Krishna tells Yudhishthira: 'Say Ashwatthama is dead — but whisper the word elephant.' Drona, hearing his son is dead, drops his weapons and is killed. Yudhishthira — who had never lied in his life — spoke a half-truth. His chariot, which always floated above the ground due to his truthfulness, touched the earth for the first time.",
    c:[{l:"🙏 Speak the full truth — BACK 4, +3 Punya",k:"punya",fx:{punya:3,move:-4}},{l:"💀 Speak the half-truth — ADVANCE 10, +3 Papa",k:"papa",fx:{papa:3,move:10}}]},
  {t:"एकलव्य",en:"Eklavya's Thumb",
    txt:"Eklavya, a tribal boy, mastered archery by practising before a clay idol of Dronacharya. When Drona discovered this, he demanded Eklavya's right thumb as guru-dakshina — knowing it would destroy his skill. Drona did this to protect Arjuna's supremacy. Eklavya cut his thumb without hesitation. The ultimate price of devotion.",
    c:[{l:"🙏 Cut your thumb — BACK 5, +4 Punya",k:"punya",fx:{punya:4,move:-5}},{l:"💀 Refuse and challenge the guru — ADVANCE 7, +3 Papa",k:"papa",fx:{papa:3,move:7}}]},
  {t:"शकुनिपासा",en:"Shakuni's Enchanted Dice",
    txt:"Shakuni's dice were carved from his dead father's bones — enchanted to always roll in his favour. With these cursed dice, he won Yudhishthira's kingdom, wealth, brothers, and finally Draupadi herself. The dice never lie — but they serve only adharma. Shakuni offers you these dice now. Your next move will leap you far ahead. But the curse of the Kuru destruction comes with them.",
    c:[{l:"🙏 Refuse the cursed dice — +3 Punya",k:"punya",fx:{punya:3}},{l:"💀 Take the enchanted dice — ADVANCE 15, +5 Papa",k:"papa",fx:{papa:5,move:15}}]},
  {t:"विभीषण",en:"Vibhishana's Betrayal",
    txt:"Vibhishana watched his brother Ravana descend into adharma — kidnapping Sita, ignoring every warning. When all counsel failed, Vibhishana made the hardest choice: betray his own blood brother and join Rama's army. Lanka called him traitor. History called him righteous. Family or dharma — you cannot always have both.",
    c:[{l:"🙏 Betray family for dharma — BACK 6, +4 Punya",k:"punya",fx:{punya:4,move:-6}},{l:"💀 Stand with your brother — ADVANCE 8, +3 Papa",k:"papa",fx:{papa:3,move:8}}]},
  {t:"कृष्णछल",en:"Krishna's Divine Deception",
    txt:"Throughout the Mahabharata, Krishna bent rules to protect dharma — hiding the sun to let Arjuna kill Jayadratha, telling Yudhishthira to lie, orchestrating Bhishma's fall using Shikhandi. Krishna's lesson: sometimes absolute truth serves adharma. He offers you a divine shortcut now — and a Shield against serpents. But every shortcut carries a karmic debt.",
    c:[{l:"🙏 Refuse even God's shortcut — +3 Punya",k:"punya",fx:{punya:3}},{l:"💀 Accept divine deception — ADVANCE 10, +3 Papa, gain Shield",k:"papa",fx:{papa:3,move:10,giveShield:true}}]},
  {t:"सुग्रीव",en:"The Stolen Crown",
    txt:"Sugriva's brother Vali stole his wife and kingdom. Rama agreed to help — but killed Vali by shooting from behind a tree during a sacred one-on-one duel. Rama's justification: Vali was adharmic. Critics say: a hidden arrow during a fair fight is never just. Power or principle — the line blurs when you're losing.",
    c:[{l:"🙏 Wait for fair justice — skip turn, +3 Punya",k:"punya",fx:{punya:3,skip:true}},{l:"💀 Strike from the shadows — ADVANCE 12, +4 Papa",k:"papa",fx:{papa:4,move:12}}]},
  {t:"धृतराष्ट्र",en:"The Blind King's Love",
    txt:"Dhritarashtra knew his sons were evil. He knew Duryodhana would destroy the world. But he was blinded — not by his eyes, but by love for his firstborn. Every time he could have stopped the war, his love paralysed him. Blind love is the most dangerous delusion. Someone you love is on the wrong path. Stop them and lose their love, or let them fall.",
    c:[{l:"🙏 Speak the hard truth — BACK 3, +3 Punya",k:"punya",fx:{punya:3,move:-3}},{l:"💀 Protect them with silence — ADVANCE 5, +2 Papa",k:"papa",fx:{papa:2,move:5}}]},
  {t:"अभिमन्यु",en:"The Chakravyuha Trap",
    txt:"Young Abhimanyu knew how to enter the Chakravyuha battle formation, but not how to exit. He entered anyway, knowing it meant almost certain death — because his army needed him. The Kaurava warriors broke every rule of war to kill this 16-year-old boy. Courage without knowledge, or safety without honour?",
    c:[{l:"🙏 Enter the trap bravely — BACK 7, +4 Punya",k:"punya",fx:{punya:4,move:-7}},{l:"💀 Stay safe outside — ADVANCE 5, +2 Papa",k:"papa",fx:{papa:2,move:5}}]},
  {t:"कुन्ती",en:"Kunti's Secret",
    txt:"Kunti kept a devastating secret her entire life — that Karna was her firstborn son, abandoned at birth. If she had revealed this truth before the war, the war itself might never have happened. Karna and Arjuna would have known they were brothers. But revealing the truth meant confessing her shame. One woman's secret killed millions.",
    c:[{l:"🙏 Reveal the painful truth — skip turn, +4 Punya",k:"punya",fx:{punya:4,skip:true}},{l:"💀 Keep the secret — ADVANCE 8, +3 Papa",k:"papa",fx:{papa:3,move:8}}]},
  {t:"शम्बूक",en:"The Price of Dharma",
    txt:"A child dies in Rama's kingdom. The sages blame a Shudra named Shambuka who is performing tapas (penance) — forbidden by the rigid dharma of that age. Rama, bound by duty as king, must choose between universal compassion and the rigid law he swore to uphold. Justice or law — they are not always the same.",
    c:[{l:"🙏 Choose compassion over rigid law — BACK 4, +3 Punya",k:"punya",fx:{punya:3,move:-4}},{l:"💀 Enforce the rigid law — ADVANCE 6, +3 Papa",k:"papa",fx:{papa:3,move:6}}]},
  {t:"दानवीर",en:"The Beggar at the Gate",
    txt:"A starving beggar appears at your door during a famine. You have exactly enough food for your family for one more day. Giving to the beggar means your own children go hungry tonight. In the Mahabharata, a mongoose tested a family who gave their last meal — and declared them more generous than Yudhishthira's Ashwamedha sacrifice.",
    c:[{l:"🙏 Give your last meal — skip turn, +4 Punya",k:"punya",fx:{punya:4,skip:true}},{l:"💀 Feed your family first — ADVANCE 4, +2 Papa",k:"papa",fx:{papa:2,move:4}}]},
  // ═══ MODERN REAL-LIFE DHARMA DILEMMAS ═══
  {t:"सत्यवचन",en:"The Honest Tax Return",
    txt:"You discover a way to save ₹5 lakhs on your taxes by hiding freelance income. The government wastes crores anyway — would anyone even notice? But your accountant warns: 'If caught, the penalty is 3x.' Your colleague says everyone does it. Your conscience says otherwise. Small dishonesty or heavy honesty?",
    c:[{l:"🙏 File honestly — skip turn, +3 Punya",k:"punya",fx:{punya:3,skip:true}},{l:"💀 Hide the income — ADVANCE 8, +3 Papa",k:"papa",fx:{papa:3,move:8}}]},
  {t:"परीक्षा",en:"The Exam Cheat Sheet",
    txt:"It's the final exam. Your best friend — the one who helped you through your darkest days — slides you a cheat sheet under the desk. If you refuse, they'll feel betrayed. If you accept, you pass easily but your degree means nothing. The invigilator isn't looking. No one will ever know. Except you.",
    c:[{l:"🙏 Refuse and face the exam alone — BACK 3, +3 Punya",k:"punya",fx:{punya:3,move:-3}},{l:"💀 Accept the cheat sheet — ADVANCE 7, +3 Papa",k:"papa",fx:{papa:3,move:7}}]},
  {t:"प्रेमधर्म",en:"The Arranged vs Love Marriage",
    txt:"Your parents have found a 'perfect match' — wealthy family, same caste, stable career. But your heart belongs to someone they would never approve of — different background, uncertain future, but a soul connection you've never felt before. Breaking your parents' heart or breaking your own?",
    c:[{l:"🙏 Follow your heart — BACK 5, +4 Punya",k:"punya",fx:{punya:4,move:-5}},{l:"💀 Marry for family honour — ADVANCE 6, +2 Papa",k:"papa",fx:{papa:2,move:6}}]},
  {t:"कर्मचारी",en:"The Whistleblower's Choice",
    txt:"Your company is dumping toxic waste into a river that flows through a tribal village. Children are getting sick. You have proof on your laptop. If you leak it, you'll lose your job — the only income for your aging parents. If you stay silent, the poisoning continues. Your manager says: 'Don't be a hero. Think of your family.'",
    c:[{l:"🙏 Blow the whistle — skip turn, +5 Punya",k:"punya",fx:{punya:5,skip:true}},{l:"💀 Stay silent for your family — ADVANCE 10, +4 Papa",k:"papa",fx:{papa:4,move:10}}]},
  {t:"वृद्धसेवा",en:"The Aging Parent",
    txt:"Your mother has dementia. She needs full-time care. You got a dream job offer in another city — double salary, career breakthrough. Your siblings refuse to help. The nursing home nearby has bad reviews. If you stay, your career stalls. If you leave, she's alone. There is no perfect answer.",
    c:[{l:"🙏 Stay and care for her — BACK 6, +4 Punya",k:"punya",fx:{punya:4,move:-6}},{l:"💀 Take the job — ADVANCE 8, +3 Papa",k:"papa",fx:{papa:3,move:8}}]},
  {t:"मित्रद्रोह",en:"The Friend's Secret",
    txt:"Your closest friend confesses they've been having an affair. Their spouse — who is also your friend — asks you directly: 'Is something going on?' You have three people's trust in your hands. Telling the truth destroys a family. Lying makes you complicit. Silence is its own answer.",
    c:[{l:"🙏 Tell the truth gently — BACK 4, +3 Punya",k:"punya",fx:{punya:3,move:-4}},{l:"💀 Protect your friend's secret — ADVANCE 5, +3 Papa",k:"papa",fx:{papa:3,move:5}}]},
  {t:"दानशीलता",en:"The Viral Donation",
    txt:"You donated ₹1 lakh to flood victims. Your friend suggests filming it and posting on Instagram — 'It will inspire others to donate too!' The video would get millions of views and boost your business. But is charity still charity when it's performed for an audience? Does intention matter if the result is good?",
    c:[{l:"🙏 Donate silently — +3 Punya",k:"punya",fx:{punya:3}},{l:"💀 Film it for views — ADVANCE 6, +2 Papa",k:"papa",fx:{papa:2,move:6}}]},
  {t:"न्यायालय",en:"The Bribe at the Courthouse",
    txt:"Your land case has been stuck in court for 8 years. Your lawyer says: 'Pay ₹50,000 to the clerk and your hearing gets scheduled next week. Otherwise, wait another 2 years.' Your father fought for this land. The system is broken — but does participating in corruption fix anything?",
    c:[{l:"🙏 Wait for justice — skip turn, +3 Punya",k:"punya",fx:{punya:3,skip:true}},{l:"💀 Pay the bribe — ADVANCE 10, +4 Papa",k:"papa",fx:{papa:4,move:10}}]},
  {t:"पर्यावरण",en:"The Plastic Factory",
    txt:"You can invest in a plastic manufacturing unit — guaranteed 40% returns. The factory will employ 200 people from a poor village. But it will also pollute the local river irreversibly. The villagers need the jobs desperately. The river feeds 10,000 people downstream. Prosperity or planet?",
    c:[{l:"🙏 Refuse the investment — BACK 4, +4 Punya",k:"punya",fx:{punya:4,move:-4}},{l:"💀 Invest for jobs and profit — ADVANCE 12, +4 Papa",k:"papa",fx:{papa:4,move:12}}]},
  {t:"सेवानिवृत्ति",en:"The Retirement Fund",
    txt:"Your father worked 35 years and saved ₹30 lakhs for retirement. Your startup needs exactly ₹30 lakhs to survive. He offers it willingly — 'Beta, your dreams matter more.' But if the startup fails, his entire life savings are gone. He'll have nothing. He says he trusts you. Should you take it?",
    c:[{l:"🙏 Refuse his money — BACK 5, +4 Punya",k:"punya",fx:{punya:4,move:-5}},{l:"💀 Take the investment — ADVANCE 10, +3 Papa",k:"papa",fx:{papa:3,move:10}}]},
  {t:"अंतिमसंस्कार",en:"The Funeral Leave",
    txt:"Your colleague's mother passed away. Your boss says the team is too busy — 'Send condolences on WhatsApp.' You know how it feels to grieve alone. Going to the funeral means missing the client deadline. Your promotion depends on this project. But some things matter more than promotions.",
    c:[{l:"🙏 Attend the funeral — skip turn, +3 Punya",k:"punya",fx:{punya:3,skip:true}},{l:"💀 Stay and meet the deadline — ADVANCE 5, +2 Papa",k:"papa",fx:{papa:2,move:5}}]},
  {t:"विद्यालय",en:"The School Admission",
    txt:"The best school in the city has one seat left. The principal hints that a ₹2 lakh 'donation' will secure it. Another child — from a poorer family — scored higher than yours. Your child's entire future could depend on this school. Or could it? Is a good education worth a stolen seat?",
    c:[{l:"🙏 Let merit decide — BACK 3, +3 Punya",k:"punya",fx:{punya:3,move:-3}},{l:"💀 Pay the donation — ADVANCE 8, +4 Papa",k:"papa",fx:{papa:4,move:8}}]},
  {t:"रोगी",en:"The Expensive Medicine",
    txt:"A life-saving medicine costs ₹5 lakhs. A friend offers you the same drug, smuggled from abroad, for ₹50,000. It's the exact same formula. The pharma company charges 10x because they can. Is it wrong to save a life by breaking an unjust law?",
    c:[{l:"🙏 Pay the full price legally — BACK 6, +3 Punya",k:"punya",fx:{punya:3,move:-6}},{l:"💀 Buy the smuggled drug — ADVANCE 8, +3 Papa",k:"papa",fx:{papa:3,move:8}}]},
  {t:"गृहस्थ",en:"The Joint Family",
    txt:"Your wife wants to move out of the joint family. She's unhappy, your mother is dominating, and the fights are daily. But your father built this house brick by brick. Leaving would break his heart. He's 75. Staying means watching two women you love suffer. There is no winning move.",
    c:[{l:"🙏 Move out with compassion — BACK 3, +3 Punya",k:"punya",fx:{punya:3,move:-3}},{l:"💀 Force everyone to adjust — ADVANCE 4, +2 Papa",k:"papa",fx:{papa:2,move:4}}]},
  {t:"सोशलमीडिया",en:"The Viral Lie",
    txt:"Someone posted a lie about your business competitor on social media. It's going viral and destroying their reputation. You know it's false. Speaking up means people will attack you too — cancel culture spares no one. Staying silent costs nothing. But you know the truth. And silence is a choice.",
    c:[{l:"🙏 Speak the truth publicly — BACK 4, +4 Punya",k:"punya",fx:{punya:4,move:-4}},{l:"💀 Stay silent and benefit — ADVANCE 6, +3 Papa",k:"papa",fx:{papa:3,move:6}}]},
];
const GRAHA=[
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
const CHARS=[
  {id:"warrior",name:"Kshatriya Warrior",skt:"क्षत्रिय",icon:"⚔",color:"#e04830",lore:"Once a commander at Kurukshetra alongside Bhishma. Haunted by bloodshed, you seek Moksha to cleanse the karma of a thousand battles.",trait:"Courage",
    voiceEn:"You are the Kshatriya Warrior. You once commanded armies at Kurukshetra, fighting alongside the great Bhishma himself. Haunted by the rivers of blood you spilled, you now seek Moksha. Your courage is your strength. But brute force alone, has never conquered the soul.",
    voiceHi:"तुम क्षत्रिय योद्धा हो। तुमने कुरुक्षेत्र में भीष्म के साथ सेनाओं का नेतृत्व किया। बहाए गए खून की नदियां अब भी तुम्हें सताती हैं। अब तुम मोक्ष की खोज में हो। साहस तुम्हारी ताकत है। लेकिन क्रूर बल से, कभी आत्मा नहीं जीती गई।"},
  {id:"sage",name:"Rishi Sage",skt:"ऋषि",icon:"🔱",color:"#f0c030",lore:"You meditated in Naimisharanya for twelve years, mastering the Vedas. Yet enlightenment eludes you — true knowledge lies in the journey.",trait:"Wisdom",
    voiceEn:"You are the Rishi Sage. For twelve years you meditated in the forests of Naimisharanya, mastering the Vedas. And yet, enlightenment eludes you. True knowledge lives not in scripture, but in the journey itself.",
    voiceHi:"तुम ऋषि हो। बारह वर्षों तक नैमिषारण्य के जंगलों में ध्यान किया, वेदों में महारत हासिल की। फिर भी, ज्ञान तुमसे दूर है। सच्चा ज्ञान शास्त्रों में नहीं, यात्रा में बसता है।"},
  {id:"healer",name:"Vaidya Healer",skt:"वैद्य",icon:"🌿",color:"#30c0b0",lore:"Trained in Dhanvantari's Ayurveda, you healed kings and beggars. But you could not save your guru. Now you seek the one cure no medicine provides.",trait:"Compassion",
    voiceEn:"You are the Vaidya Healer. Trained in the traditions of Lord Dhanvantari. You healed kings and beggars. But you could not save your own guru. Now you seek the one cure no medicine provides. Liberation from death itself.",
    voiceHi:"तुम वैद्य हो। भगवान धन्वंतरि की परंपरा में प्रशिक्षित। तुमने राजाओं और भिखारियों को ठीक किया। लेकिन अपने गुरु को नहीं बचा पाए। अब तुम वो इलाज खोज रहे हो जो कोई दवाई नहीं दे सकती। मृत्यु से मुक्ति।"},
  {id:"dancer",name:"Devadasi Dancer",skt:"नर्तकी",icon:"💃",color:"#c060d0",lore:"A temple dancer of Ujjain who performed the Tandava before kings. Now you dance not for men but for Moksha — each step a prayer.",trait:"Grace",
    voiceEn:"You are the Devadasi Dancer. In the temples of Ujjain, you performed the cosmic Tandava before kings. Now you dance not for men, but for Moksha. Each step is a prayer. Each mudra, a mantra.",
    voiceHi:"तुम देवदासी नर्तकी हो। उज्जैन के मंदिरों में, तुमने राजाओं के सामने तांडव किया। अब तुम पुरुषों के लिए नहीं, मोक्ष के लिए नाचती हो। हर कदम एक प्रार्थना। हर मुद्रा, एक मंत्र।"},
  {id:"merchant",name:"Vanik Merchant",skt:"वणिक्",icon:"⚖",color:"#e08030",lore:"You traded silk from Pataliputra to Taxila. A shipwreck took everything. Now you trade karma, not coins.",trait:"Judgment",
    voiceEn:"You are the Vanik Merchant. You traded silk from Pataliputra to Taxila. A shipwreck took everything. Now you trade karma, not coins. The only treasure that cannot sink.",
    voiceHi:"तुम वणिक व्यापारी हो। पाटलिपुत्र से तक्षशिला तक रेशम का व्यापार करते थे। एक जहाज़ डूबने ने सब छीन लिया। अब तुम कर्म का व्यापार करते हो, सिक्कों का नहीं। एकमात्र खज़ाना जो डूब नहीं सकता।"},
  {id:"ascetic",name:"Sannyasi Ascetic",skt:"संन्यासी",icon:"🪷",color:"#70c030",lore:"You renounced a kingdom at twenty. For decades you wandered forests. Others call you mad — but you have seen Moksha in visions.",trait:"Renunciation",
    voiceEn:"You are the Sannyasi Ascetic. At twenty, you renounced a kingdom. For decades you wandered forests. Others call you mad. But in your deepest meditations, you have seen Moksha. A golden light, calling you forward.",
    voiceHi:"तुम संन्यासी हो। बीस साल की उम्र में, एक राज्य त्याग दिया। दशकों तक जंगलों में भटके। लोग तुम्हें पागल कहते हैं। लेकिन गहन ध्यान में, तुमने मोक्ष देखा है। एक सुनहरी रोशनी, जो आगे बुला रही है।"},
];
/* chosenLang is managed as React state inside the component */
const STORY_PAGES=[
  {title:"A Forgotten Secret",icon:"🕉",
  bullets_en:[
    {icon:"🕰",accent:"#f0d050",title:"5,000 Years Hidden",text:"Before the Mahabharata was written. Before temples were carved in stone. This game existed."},
    {icon:"🔱",accent:"#c0a8e0",title:"Created by Forgotten Rishis",text:"Ancient sages so old, even the gods have forgotten their names. They called it Moksha Patam — the Board of Liberation."},
    {icon:"♟",accent:"#80c0b0",title:"Played by Kings & Sages",text:"For millennia, kings played in marble palaces. Sages by firelight. Passed from guru to disciple in whispered secrecy."},
    {icon:"⚔",accent:"#e08060",title:"Stolen & Stripped",text:"Foreigners came. Stripped every Sanskrit name. Every sacred verse. And renamed it Snakes & Ladders — a children's game."},
    {icon:"🔥",accent:"#f0d050",title:"Tonight — The Original",text:"The soul of the game is restored. You are about to play it as the ancient rishis intended."},
  ],
  bullets_hi:[
    {icon:"🕰",accent:"#f0d050",title:"पांच हज़ार साल छिपाया गया",text:"महाभारत लिखे जाने से पहले। मंदिरों को तराशे जाने से पहले। यह खेल था।"},
    {icon:"🔱",accent:"#c0a8e0",title:"भूले हुए ऋषियों द्वारा रचा गया",text:"इतने प्राचीन कि देवताओं को भी नाम याद नहीं। उन्होंने इसे कहा मोक्षपटम — मुक्ति का पट।"},
    {icon:"♟",accent:"#80c0b0",title:"राजाओं और ऋषियों का खेल",text:"हज़ारों सालों तक महलों और अग्नि की रोशनी में खेला गया। गुरु से शिष्य तक।"},
    {icon:"⚔",accent:"#e08060",title:"चुराया और बदला गया",text:"विदेशी आए। हर संस्कृत नाम छीन लिया। और नाम दिया सांप सीढ़ी।"},
    {icon:"🔥",accent:"#f0d050",title:"आज रात — असली खेल",text:"खेल की आत्मा वापस आई। तुम इसे उसी तरह खेलोगे जैसे ऋषियों ने सोचा था।"},
  ],
  en:"Listen carefully. What I am about to tell you, has been hidden for five thousand years. Before the Mahabharata was written down. Before the first temples were carved into stone. There existed, a game. A game of the soul. Created by unknown rishis, sages so ancient, that even the gods have forgotten their names. They called it, Moksha Patam. The Board, of Liberation. For thousands of years, kings played it in marble palaces. Sages played it by firelight. It was passed from guru to disciple in whispered secrecy. And then, foreigners came. They stole it. Stripped away every sacred name. Every Sanskrit verse. And renamed it. Snakes and Ladders. A children's game. The soul of the game was murdered. Until, this very moment. Tonight, you play the original.",
  hi:"ध्यान से सुनो। जो मैं बताने जा रहा हूँ, वो पांच हज़ार सालों से छिपाया गया है। महाभारत लिखे जाने से पहले। पहले मंदिरों को पत्थर में तराशे जाने से पहले। एक खेल था। आत्मा का खेल। अज्ञात ऋषियों द्वारा रचा गया, इतने प्राचीन कि देवताओं को भी उनके नाम याद नहीं। उन्होंने इसे कहा, मोक्षपटम। मुक्ति का पट। हज़ारों सालों तक राजाओं ने इसे संगमरमर के महलों में खेला। ऋषियों ने अग्नि की रोशनी में खेला। गुरु से शिष्य तक दबी आवाज़ में पहुंचाया गया। फिर विदेशी आए। चुरा लिया। हर पवित्र नाम छीन लिया। और नाम रख दिया सांप सीढ़ी। बच्चों का खेल। खेल की आत्मा की हत्या कर दी। इस एक क्षण तक। आज रात, तुम असली खेल खेलोगे।",
  visuals:[{type:"animatedBoard",mode:"intro"}]},
  {title:"The Sacred Board",icon:"📜",
  bullets_en:[
    {icon:"🗺",accent:"#f0d050",title:"108 Squares · 3 Realms",text:"Not a game board — a map of your soul's journey across three worlds toward liberation."},
    {icon:"🌍",accent:"#8a6030",title:"भूलोक · Bhuloka (1–33)",text:"The Earthly Realm. Chaos reigns. Most souls are trapped here forever by serpents of vice."},
    {icon:"🌌",accent:"#6a80a0",title:"अन्तर्लोक · Antarloka (34–66)",text:"The Inner Realm. Cunning serpents poison the mind with doubt, desire, and delusion."},
    {icon:"✨",accent:"#a080c0",title:"स्वर्गलोक · Svargaloka (67–99)",text:"The Celestial Realm. One single serpent can destroy lifetimes of progress."},
    {icon:"ॐ",accent:"#f0d050",title:"अष्टांग मार्ग · Sacred Crown (101–108)",text:"The 8-fold Path of Patanjali. Move one step at a time. Each gate demands wisdom."},
  ],
  bullets_hi:[
    {icon:"🗺",accent:"#f0d050",title:"108 खाने · 3 लोक",text:"खेल का पट नहीं — तीन लोकों में तुम्हारी आत्मा की यात्रा का नक्शा।"},
    {icon:"🌍",accent:"#8a6030",title:"भूलोक (1–33)",text:"पृथ्वी लोक। अराजकता राज करती है। अधिकांश आत्माएं यहाँ सांपों में फंसी रहती हैं।"},
    {icon:"🌌",accent:"#6a80a0",title:"अन्तर्लोक (34–66)",text:"आंतरिक लोक। चालाक सांप मन में संदेह, इच्छा और भ्रम का विष भरते हैं।"},
    {icon:"✨",accent:"#a080c0",title:"स्वर्गलोक (67–99)",text:"दिव्य लोक। एक ही सांप जन्मों की साधना मिटा सकता है।"},
    {icon:"ॐ",accent:"#f0d050",title:"अष्टांग मार्ग (101–108)",text:"पतंजलि का आठ-सूत्री मार्ग। एक-एक कदम चलते हो। हर द्वार ज्ञान मांगता है।"},
  ],
  en:"Look at the board. It is not a board. It is a map of your soul's journey. 108 squares. Three realms. And one destination. Bhuloka, Squares 1 through 33, the Earthly Realm, where chaos reigns and most souls are trapped forever. Antarloka, Squares 34 through 66, the Inner Realm, where cunning serpents poison your mind with doubt. Svargaloka, Squares 67 through 99, the Celestial Realm, where a single fall destroys lifetimes of progress. And above it all, the Sacred Crown, Squares 101 to 108, the Ashtanga Marga, the eight-fold path of Patanjali. Here you move one step at a time. Each step tests your knowledge of yoga and dharma. Only those who pass all eight gates may attempt Moksha.",
  hi:"पट को देखो। ये सिर्फ पट नहीं है। ये तुम्हारी आत्मा की यात्रा का नक्शा है। 108 खाने। तीन लोक। और एक मंज़िल। भूलोक, खाना 1 से 33, पृथ्वी लोक, जहाँ अराजकता राज करती है। अंतर्लोक, खाना 34 से 66, आंतरिक लोक, जहाँ चालाक सर्प तुम्हारे मन में संदेह का विष भरते हैं। स्वर्गलोक, खाना 67 से 99, दिव्य लोक, जहाँ एक गिरावट जन्मों की साधना मिटा देती है। और सबसे ऊपर, पवित्र मुकुट, खाना 101 से 108, अष्टांग मार्ग, पतंजलि का आठ-सूत्री मार्ग।",
  visuals:[{type:"animatedBoard",mode:"realms"}]},
  {title:"Two Sacred Dice",icon:"🎲",
  bullets_en:[
    {icon:"🎲",accent:"#f0d050",title:"Karma Die (1–6)",text:"The six-sided die of fate. Roll it and move forward. Familiar. Simple. But only half the story."},
    {icon:"🌌",accent:"#c0a0e0",title:"Navagraha Die — The 9 Planets",text:"Nine living gods that intervene in your journey. Each planet has cosmic power over your fate."},
    {icon:"☀",accent:"#f0b840",title:"Blessings",text:"Surya +2 steps · Chandra +1 Punya · Brihaspati blesses all · Shukra grants divine Shield"},
    {icon:"⚡",accent:"#e08060",title:"Chaos & Curses",text:"Mangal pushes rivals back · Budh swaps positions · Shani sets you back 3 squares"},
    {icon:"🌑",accent:"#9060a0",title:"Shadow & Fate",text:"Rahu steals Punya from the leader · Ketu strips all shields from every player"},
  ],
  bullets_hi:[
    {icon:"🎲",accent:"#f0d050",title:"कर्म पासा (1–6)",text:"भाग्य का छह-मुखी पासा। फेंको और आगे बढ़ो। परिचित। सरल। लेकिन आधी कहानी।"},
    {icon:"🌌",accent:"#c0a0e0",title:"नवग्रह पासा — 9 ग्रह",text:"नौ जीवित देवता जो तुम्हारी यात्रा में हस्तक्षेप करते हैं।"},
    {icon:"☀",accent:"#f0b840",title:"आशीर्वाद",text:"सूर्य +2 कदम · चन्द्र +1 पुण्य · बृहस्पति सबको आशीर्वाद · शुक्र दिव्य कवच"},
    {icon:"⚡",accent:"#e08060",title:"अराजकता और शाप",text:"मंगल प्रतिद्वंद्वी को पीछे धकेलता · बुध स्थान बदलता · शनि 3 खाने पीछे"},
    {icon:"🌑",accent:"#9060a0",title:"छाया और भाग्य",text:"राहु नेता का पुण्य चुराता · केतु सबके कवच छीनता"},
  ],
  en:"Every turn, you roll not one, but two dice. The first, the Karma Die, a six-sided die that moves you across the board. Simple. Familiar. But the second die, the Navagraha Die, this is what makes this game truly ancient. Nine planets. Nine cosmic forces. Each one, a living god that intervenes in your journey. Surya, the Sun, blazes your path with 2 extra steps. Chandra, the Moon, purifies you with Punya. Mangal, Mars, fills you with battle fury, pushing your rival back 3 squares. Budh, Mercury, swaps your position. Brihaspati, Jupiter, blesses everyone. Shukra, Venus, grants a divine Shield. Shani, Saturn, pushes you back 3 squares. Rahu steals from the leader. Ketu strips all shields.",
  hi:"हर बारी, तुम एक नहीं, दो पासे फेंकते हो। पहला, कर्म पासा। लेकिन दूसरा, नवग्रह पासा, यही इस खेल को प्राचीन बनाता है। नौ ग्रह। सूर्य 2 अतिरिक्त कदम। चन्द्र पुण्य। मंगल प्रतिद्वंद्वी को पीछे। बुध स्थान बदलता। बृहस्पति सबको। शुक्र कवच। शनि 3 पीछे। राहु चुराता। केतु कवच छीनता।",
  visuals:[{type:"diceStage"}]},
  {title:"Serpents & Virtues",icon:"𓆙",
  bullets_en:[
    {icon:"𓆙",accent:"#e06030",title:"10 Living Nightmares",text:"Ten Nagas coil across the board. Each one a manifestation of the darkest force inside the human soul."},
    {icon:"💀",accent:"#e06030",title:"When a Serpent Catches You",text:"Dragged screaming to a lower square. You gain +2 Papa (sin). The Yama laughs."},
    {icon:"🪔",accent:"#f0d050",title:"10 Divine Ladders",text:"Ten virtues lift your soul upward. Daya (Compassion). Satya (Truth). Seva (Service). Bhakti (Devotion)."},
    {icon:"☀",accent:"#80c080",title:"When a Ladder Lifts You",text:"Carried upward to higher ground. You gain +1 Punya (sacred merit)."},
    {icon:"⚖",accent:"#a0c8e0",title:"Dharma Dilemmas",text:"21 moral crossroads from the Mahabharata and real life. Your choices shape your karma permanently."},
  ],
  bullets_hi:[
    {icon:"𓆙",accent:"#e06030",title:"10 जीवित दुःस्वप्न",text:"दस नाग पट पर कुंडली मारे बैठे हैं। हर एक आत्मा की काली शक्ति का रूप।"},
    {icon:"💀",accent:"#e06030",title:"जब सांप पकड़े",text:"चीखते हुए नीचे खिंचते हो। +2 पाप मिलता है। यमराज हंसता है।"},
    {icon:"🪔",accent:"#f0d050",title:"10 दिव्य सीढ़ियां",text:"दस गुण आत्मा को ऊपर उठाते हैं। दया। सत्य। सेवा। भक्ति।"},
    {icon:"☀",accent:"#80c080",title:"जब सीढ़ी उठाए",text:"ऊपर पहुंचते हो। +1 पुण्य मिलता है।"},
    {icon:"⚖",accent:"#a0c8e0",title:"धर्म दुविधाएं",text:"महाभारत से 21 नैतिक चुनाव। तुम्हारे निर्णय कर्म बनाते हैं।"},
  ],
  en:"Ten colossal Nagas coil around this board. They are not just snakes. They are living nightmares. Each one a manifestation of the darkest force inside every human soul. Krodh, Wrath. Lobh, Greed. Moh, Delusion. When a serpent catches you, it drags you screaming into the depths. You lose squares, and gain 2 Papa, sin karma. But for every serpent, there is a ladder, a virtue. Daya, Compassion. Satya, Truth. Seva, Service. Bhakti, Devotion. When a ladder lifts you, you gain 1 Punya, sacred merit. Between the serpents, Dharma Dilemmas appear. Ancient moral choices from the epics. Choose wisely, for your choices shape your karma.",
  hi:"दस विशाल नाग इस पट पर कुंडली मारे बैठे हैं। ये सिर्फ सांप नहीं हैं। ये जीवित दुःस्वप्न हैं। क्रोध। लोभ। मोह। जब कोई सांप पकड़ता है, 2 पाप मिलता है। लेकिन हर सांप के लिए एक सीढ़ी है। दया। सत्य। सेवा। भक्ति। जब सीढ़ी उठाती है, 1 पुण्य मिलता है।",
  visuals:[{type:"animatedBoard",mode:"snakeladder"}]},
  {title:"Dharma Dilemma",icon:"⚖",
  bullets_en:[
    {icon:"⚖",accent:"#a0c8e0",title:"21 Moral Crossroads",text:"From the Mahabharata and real life. Ancient dilemmas that kings, sages, and warriors faced — now yours to answer."},
    {icon:"🙏",accent:"#80c080",title:"Choose Punya — The Righteous Path",text:"Harder. Costlier. Sometimes you move back. But your soul grows lighter. Karma accumulates."},
    {icon:"💀",accent:"#e06030",title:"Choose Papa — The Dark Path",text:"Easier. You advance faster. But sin accumulates. And the gates of Moksha may reject you."},
    {icon:"⚡",accent:"#f0d050",title:"Balance is Everything",text:"30 Punya anywhere = instant Moksha. But Papa can undo lifetimes of Punya. Every choice is permanent."},
  ],
  bullets_hi:[
    {icon:"⚖",accent:"#a0c8e0",title:"21 नैतिक चौराहे",text:"महाभारत और असल जीवन से। राजाओं, ऋषियों और योद्धाओं के सामने आए प्राचीन प्रश्न — अब तुम्हारे सामने।"},
    {icon:"🙏",accent:"#80c080",title:"पुण्य चुनो — धर्म का मार्ग",text:"कठिन। महंगा। कभी-कभी पीछे जाते हो। लेकिन आत्मा हल्की होती है। कर्म जमा होता है।"},
    {icon:"💀",accent:"#e06030",title:"पाप चुनो — अधर्म का मार्ग",text:"आसान। तेज़ आगे बढ़ते हो। लेकिन पाप जमा होता है। और मोक्ष के द्वार बंद हो सकते हैं।"},
    {icon:"⚡",accent:"#f0d050",title:"संतुलन सब कुछ है",text:"30 पुण्य कहीं से भी = तुरंत मोक्ष। लेकिन पाप जन्मों का पुण्य मिटा सकता है। हर चुनाव स्थायी है।"},
  ],
  en:"Every few squares, life stops you. A Dharma Dilemma appears. An ancient crossroads. These are not simple questions. They are the same moral choices that destroyed kings and elevated sages. Karna gave away his divine armour to a beggar. Knowing it would kill him. Eklavya cut off his own thumb for his guru. Yudhishthira told a half-truth to win a war. These choices are yours now. Choose Punya, the righteous path, and move back but grow purer. Choose Papa, the easy path, advance faster but sin accumulates. The board does not care about your intentions. Only your karma matters at the final gate.",
  hi:"हर कुछ खानों पर, जीवन तुम्हें रोकता है। एक धर्म दुविधा प्रकट होती है। एक प्राचीन चौराहा। ये सरल प्रश्न नहीं हैं। ये वही नैतिक चुनाव हैं जिन्होंने राजाओं को नष्ट किया और ऋषियों को ऊपर उठाया। कर्ण ने अपना दिव्य कवच एक भिखारी को दिया। जानते हुए कि इससे मृत्यु होगी। एकलव्य ने गुरु के लिए अपना अंगूठा काटा। युधिष्ठिर ने युद्ध जीतने के लिए आधा सच बोला। ये चुनाव अब तुम्हारे हैं।",
  visuals:[{type:"dharmaStage"}]},
  {title:"The 8-Fold Sacred Path",icon:"🪷",
  bullets_en:[
    {icon:"🪷",accent:"#f0d050",title:"Above Square 100 — A Different World",text:"Once you pass square 100, dice rolls no longer matter. You move exactly ONE step per turn."},
    {icon:"📖",accent:"#c0a0e0",title:"Patanjali's Ashtanga Yoga",text:"Each of the 8 steps tests your knowledge of yoga and dharma. Answer correctly — gain Punya. Fail — gain Papa and fall back."},
    {icon:"🚪",accent:"#f0b840",title:"The Final Gate at 107",text:"At Dhyana (square 107), you need an exact roll of 1. Only absolute surrender opens the gate to Moksha."},
    {icon:"ॐ",accent:"#80c080",title:"The Navagraha Cannot Touch You",text:"On the Sacred Path, no planet effects apply. No swapping. No pushing. You are beyond the material world."},
  ],
  bullets_hi:[
    {icon:"🪷",accent:"#f0d050",title:"खाना 100 के ऊपर — एक अलग दुनिया",text:"खाना 100 पार करने के बाद, पासे से कोई फर्क नहीं। हर बारी एक ही कदम चलते हो।"},
    {icon:"📖",accent:"#c0a0e0",title:"पतंजलि का अष्टांग योग",text:"8 में से हर कदम योग और धर्म ज्ञान की परीक्षा लेता है। सही उत्तर दो — पुण्य मिलता है। गलत — पाप और वापस।"},
    {icon:"🚪",accent:"#f0b840",title:"खाना 107 पर अंतिम द्वार",text:"ध्यान पर, सटीक 1 चाहिए। केवल पूर्ण समर्पण मोक्ष का द्वार खोलता है।"},
    {icon:"ॐ",accent:"#80c080",title:"नवग्रह तुम्हें नहीं छू सकते",text:"पवित्र मार्ग पर कोई ग्रह प्रभाव नहीं। अदला-बदली नहीं। धक्का नहीं। तुम भौतिक संसार से परे हो।"},
  ],
  en:"Past square 100, the rules change. You have transcended the material world. The Navagraha cannot touch you. You move one step at a time along the Ashtanga Marga — the eight-fold path of Patanjali. Yama, self-restraint. Niyama, discipline. Asana, steadiness. Pranayama, the expansion of life-force. Pratyahara, withdrawal of the senses. Dharana, single-pointed concentration. Dhyana, deep meditation. And finally, Moksha at square 108, liberation from the cycle of birth and death. But at square 107, the Dhyana gate demands exactness. You must roll a one. Only perfect surrender, no grasping, no eagerness, opens the final door.",
  hi:"खाना 100 के बाद, नियम बदल जाते हैं। तुम भौतिक संसार को पार कर चुके हो। नवग्रह तुम्हें नहीं छू सकते। अष्टांग मार्ग पर एक-एक कदम चलते हो। यम, नियम, आसन, प्राणायाम, प्रत्याहार, धारणा, ध्यान। और अंत में, खाना 108 पर मोक्ष — जन्म और मृत्यु के चक्र से मुक्ति। लेकिन खाना 107 पर, ध्यान का द्वार सटीकता मांगता है। सटीक 1 फेंकना होगा। केवल पूर्ण समर्पण अंतिम द्वार खोलता है।",
  visuals:[{type:"sacredPathStage"}]},
  {title:"Yama Awaits",icon:"💀",
  bullets_en:[
    {icon:"☠️",accent:"#e06060",title:"Not a Computer — A Cosmic Force",text:"In solo mode, you face Yama. The God of Death. He has judged souls since the dawn of creation."},
    {icon:"🎲",accent:"#c06060",title:"Yama Plays Different Rules",text:"He favours Papa choices 60% of the time. He cannot be reasoned with. He cannot be bribed."},
    {icon:"😂",accent:"#e04040",title:"When His Serpents Catch You",text:"He laughs. Oh, how he laughs. His voice echoes like thunder through an empty temple."},
    {icon:"👥",accent:"#c0b080",title:"Solo or Multiplayer",text:"Face Yama alone. Or bring 2, 3, or 4 seekers. But only one soul achieves Moksha first."},
  ],
  bullets_hi:[
    {icon:"☠️",accent:"#e06060",title:"कंप्यूटर नहीं — ब्रह्मांडीय शक्ति",text:"अकेले खेलो तो यमराज से सामना। मृत्यु के देवता। सृष्टि के आरम्भ से न्याय कर रहे हैं।"},
    {icon:"🎲",accent:"#c06060",title:"यमराज अलग नियमों से खेलता है",text:"60% बार पाप चुनता है। न तर्क, न रिश्वत।"},
    {icon:"😂",accent:"#e04040",title:"जब उसके सांप पकड़ें",text:"वो हंसता है। खाली मंदिर में गरज की तरह उसकी आवाज़ गूंजती है।"},
    {icon:"👥",accent:"#c0b080",title:"अकेले या साथ",text:"अकेले यमराज से लड़ो। या 2, 3, 4 साधक साथ आएं। मोक्ष पहले एक ही पाएगा।"},
  ],
  en:"In solo mode, you do not play alone. You play against Yama. The God of Death. Lord of the Underworld. Judge of all souls. He is not a computer opponent. He is a cosmic force who has been judging souls since the dawn of creation. Yama plays by different rules. He cannot be reasoned with. He cannot be bribed. And when his serpents catch you, he laughs. Oh, how he laughs. You will hear him. His voice echoes through the board like thunder through an empty temple. Every move you make, he watches. Every mistake, he remembers. You may choose to face Yama alone, or bring companions. 2, 3, or 4 seekers can walk this path together. But remember, only one soul achieves Moksha first.",
  hi:"अकेले खेलते हो तो यमराज से सामना होता है। मृत्यु के देवता। वो ब्रह्मांडीय शक्ति है। यमराज अलग नियमों से खेलता है। जब उसके सांप तुम्हें पकड़ते हैं, वो हंसता है। उसकी आवाज़ पट पर गूंजती है जैसे खाली मंदिर में गरज। साथी ला सकते हो। लेकिन मोक्ष पहले एक ही पाएगा।",
  visuals:[{type:"versus",data:{icon:"💀",name:"यमराज · YAMA",desc:"God of Death · Judge of Souls"}}]},
  {title:"The Path to Moksha",icon:"ॐ",
  bullets_en:[
    {icon:"🔱",accent:"#f0d050",title:"Path 1 — Reach Square 108",text:"Roll the exact number to land on 108. But the gate won't open for a tainted soul — Punya must equal or exceed Papa."},
    {icon:"💔",accent:"#e06030",title:"If Impure",text:"Cast back to Square 67. Back to suffering. The board shows no mercy."},
    {icon:"ॐ",accent:"#80c080",title:"Path 2 — Karma Victory",text:"Accumulate 30 Punya from any square. The board itself dissolves beneath you. Instant Moksha. The rarest path."},
    {icon:"🐍",accent:"#c08060",title:"The Dice Are Ready",text:"The serpents can smell your fear. The planets watch your every step. Step onto the board."},
  ],
  bullets_hi:[
    {icon:"🔱",accent:"#f0d050",title:"रास्ता 1 — खाना 108",text:"सटीक पासे से 108 पर पहुंचो। लेकिन अशुद्ध आत्मा के लिए द्वार बंद — पुण्य पाप से ज़्यादा होना चाहिए।"},
    {icon:"💔",accent:"#e06030",title:"अशुद्ध हो तो",text:"खाना 67 पर वापस। फिर से कष्ट। पट दया नहीं दिखाता।"},
    {icon:"ॐ",accent:"#80c080",title:"रास्ता 2 — कर्म विजय",text:"कहीं से भी 30 पुण्य इकट्ठा करो। पट विलीन हो जाता है। तुरंत मोक्ष। सबसे दुर्लभ रास्ता।"},
    {icon:"🐍",accent:"#c08060",title:"पासे तैयार हैं",text:"सांप तुम्हारे डर की गंध सूंघ रहे हैं। कदम रखो पट पर।"},
  ],
  en:"Two paths to escape the wheel of Samsara. The First Path, reach Square 108 with an exact roll. But even if you arrive, the gates will not open for a tainted soul. Your Punya must equal or exceed your Papa. If impure, you are cast back to Square 67. To suffer again. The Second Path, far rarer, far more beautiful. Accumulate 30 Punya at any moment during your journey. The board itself dissolves beneath you. Instant Moksha. This is the ancient truth the sages encoded. A truly pure soul can break free from any square. The dice are ready. The serpents can smell your fear. Step onto the board.",
  hi:"संसार के चक्र से बचने के दो रास्ते। पहला, खाना 108 पर सटीक पासे से। लेकिन दूषित आत्मा के लिए द्वार नहीं। पुण्य पाप से ज़्यादा होना चाहिए। अशुद्ध हो तो 67 पर वापस। दूसरा रास्ता, 30 पुण्य। पट विलीन। तुरंत मोक्ष। पासे तैयार हैं। सांप तुम्हारे डर की गंध सूंघ रहे हैं।",
  visuals:[{type:"animatedBoard",mode:"intro"}]}
];

function sqP(n){
  if(n>100){
    // Sacred crown row: squares 101-108 are in a special row above the board
    // Positioned across 8 columns centered in the 10-col grid
    const ci=n-101; // 0-7
    return{r:-1,c:ci+1}; // row -1 = above board, columns 1-8 (centered)
  }
  const r=Math.floor((n-1)/10);return{r:9-r,c:r%2===0?(n-1)%10:9-((n-1)%10)}
}
function rlm(n){return n<=33?"bhuloka":n<=66?"antarloka":n<=100?"svargaloka":"moksha_path"}

// The 8-fold Sacred Path (Ashtanga Marga) — squares 101-108
const SACRED_PATH=[
  {num:101,skt:"यम",en:"Yama",desc:"Self-restraint",icon:"🪷"},
  {num:102,skt:"नियम",en:"Niyama",desc:"Discipline",icon:"🔥"},
  {num:103,skt:"आसन",en:"Asana",desc:"Steadiness",icon:"🧘"},
  {num:104,skt:"प्राणायाम",en:"Pranayama",desc:"Life-force",icon:"💨"},
  {num:105,skt:"प्रत्याहार",en:"Pratyahara",desc:"Withdrawal",icon:"👁"},
  {num:106,skt:"धारणा",en:"Dharana",desc:"Concentration",icon:"🎯"},
  {num:107,skt:"ध्यान",en:"Dhyana",desc:"Meditation",icon:"✨"},
  {num:108,skt:"मोक्ष",en:"MOKSHA",desc:"Liberation",icon:"ॐ"},
];

// ═══ ASHTANGA RIDDLES — 5-6 per step, tricky but solvable ═══
// correct=0 means first option is right, correct=1 means second
const ASHTANGA_RIDDLES={
  101:[
    {q:"A king asked a sage: 'I conquered every kingdom. What remains?' The sage smiled: 'The kingdom that defeated every emperor since dawn of time — it lives inside you.' What kingdom?",a:["The uncontrolled mind — even Alexander couldn't conquer it","The human heart — it beats without anyone's permission"],correct:0},
    {q:"Yudhishthira was asked: 'What is the most surprising thing in the world?' His answer became the most quoted Mahabharata verse. What did he say?",a:["People die daily, yet the living believe they are immortal — this is the greatest wonder","The sun rises daily yet nobody stops to be grateful"],correct:0},
    {q:"Gandhi never fought back when beaten by soldiers. He practiced a Yoga Sutra principle that changed world politics. What?",a:["Ahimsa — non-violence requires MORE courage than fighting back","Satya — truth spoken loudly makes violence unnecessary"],correct:0},
    {q:"Buddha left a palace with 40,000 dancing girls and unlimited power. Asked how he could walk away, he said something revealing the core of Yama...",a:["I didn't walk FROM everything — I walked TOWARD everything. A palace is a prison when you're enslaved by it","Desire is a fire that burns brighter the more fuel you give it"],correct:0},
    {q:"A scorpion was drowning. A monk saved it, got stung. Saved it again, stung again. A passerby asked why. The monk's answer is the deepest Yama...",a:["It's the scorpion's nature to sting. It's my nature to save. Why abandon MY nature because he follows his?","Pain is temporary but the karma of not helping lasts forever"],correct:0},
    {q:"After basic needs are met, more possessions cause MORE anxiety — the 'hedonic treadmill.' Which Yama predicted this 3000 years ago?",a:["Aparigraha — non-possessiveness. We adapt to each new thing and want more, endlessly","Asteya — non-stealing, because wanting what others have is mental theft"],correct:0},
    {q:"A man steals bread to feed his starving child. Has he violated Asteya? The Mahabharata's surprising answer...",a:["No — when survival conflicts with rules, compassion overrides ritual morality","Yes — stealing is stealing, karma doesn't forgive regardless of reason"],correct:0},
    {q:"The marshmallow experiment: kids who waited 15 min for 2 marshmallows instead of eating 1 now were tracked 40 years. Results?",a:["Waiters had higher SAT scores, better careers, lower addiction — restraint predicts life success","Waiters had more anxiety from constant delayed gratification"],correct:0},
    {q:"In the Chandogya Upanishad, a student asks 'What is Brahman?' The teacher stays silent. Asks again. Silence. The answer IS the silence because...",a:["The highest truth cannot be spoken — only experienced through restraint of speech","The teacher was testing patience before revealing secret mantras"],correct:0},
    {q:"Viktor Frankl survived Nazi camps and discovered the last human freedom that can NEVER be taken away...",a:["The freedom to choose your response to any situation — THIS is Yama in its purest form","The freedom to hope for rescue — which kept prisoners alive"],correct:0},
    {q:"Arjuna refused to fight at Kurukshetra because killing family felt wrong. Krishna said this was NOT Ahimsa but...",a:["Cowardice disguised as virtue — true Ahimsa is doing your duty even when it hurts","Correct instinct that needed refinement through meditation first"],correct:0},
    {q:"Neuroscience shows resisting temptation uses the same brain area as physical effort — the prefrontal cortex literally gets 'tired.' This explains why...",a:["Willpower is finite and must be trained like a muscle — exactly what Yama practices do","Monks who practice extreme restraint are slowly damaging their brains"],correct:0},
    {q:"A Zen master was falsely accused of fathering a child. He simply said 'Is that so?' and raised it. Years later truth emerged. He returned the child saying 'Is that so?' This is...",a:["Supreme non-reaction — not defending ego IS the highest restraint","Indifference to justice — which contradicts the Yama of Satya"],correct:0},
    {q:"The tongue controls what enters (food) and exits (speech). Ancient yogis said mastering the tongue alone is enough for liberation because...",a:["Control what you consume and speak → you've mastered 90% of Yama","The tongue is connected to the heart chakra and controls all energy"],correct:0},
    {q:"Nelson Mandela spent 27 years in prison. When released, he invited his PRISON GUARD to his inauguration. This is...",a:["Kshama (forgiveness) — the highest Ahimsa, requiring more strength than revenge","Stockholm syndrome — bonding with captors over decades"],correct:0},
    {q:"A snake charmer doesn't remove the snake's fangs — he learns to handle it skillfully. This metaphor teaches...",a:["Don't destroy desires — learn to handle them. Suppression creates explosion, skill creates mastery","Desires are dangerous creatures that must be controlled through fear"],correct:0},
    {q:"Modern addiction science: every craving, if NOT acted upon, peaks at 20 minutes then fades. Ancient yogis called this...",a:["Titiksha — enduring discomfort without reacting, knowing it always passes","Vairagya — complete dispassion that makes cravings impossible"],correct:0},
    {q:"Why did Gandhi walk 388 km to pick up a handful of salt from the sea?",a:["The simplest act of defiance, done with Ahimsa and Satya, can break an empire","To prove Indian salt was superior to British salt"],correct:0},
    {q:"A student asked Ramakrishna: 'How do I control desire?' He held a bird: 'Hold tight, it suffocates. Hold loose, it flies.' The lesson?",a:["Don't suppress desires — observe them with gentle awareness until they lose power naturally","Hold desire at exactly 50% — partial indulgence is the middle path"],correct:0},
    {q:"The Gita says: 'For one who has conquered the mind, the mind is the best friend. For one who has failed, it is the greatest enemy.' Yama is...",a:["Befriending your own mind — not fighting it. The practice is friendship, not war","Destroying the mind's desires through extreme austerity"],correct:0},
    {q:"The word 'discipline' comes from Latin 'discipulus' meaning 'student.' Self-discipline's ORIGINAL meaning was NOT punishment but...",a:["Being a student of yourself — observing your patterns with curiosity, not judgment","Obeying strict rules set by a master without questioning"],correct:0},
    {q:"Epictetus, a Roman slave-turned-philosopher: 'It's not what happens to you, but how you react.' This is identical to...",a:["Pratipaksha Bhavana — cultivating the opposite thought when disturbed (Yoga Sutra 2.33)","Karma — accepting everything as past-life results without trying to change it"],correct:0},
    {q:"An eagle sees a rabbit from 3 km away — but only because it IGNORES everything else in its visual field. The yogic parallel...",a:["True restraint isn't giving up things — it's choosing what to focus on","Eagles have eye muscles yogis develop through Trataka meditation"],correct:0},
    {q:"In the Ramayana, Hanuman forgot his own powers until reminded. Why? Because...",a:["True power comes with humility — his self-restraint made him forget ego, and with ego gone, unlimited power returned","A sage's curse had sealed his memory until devotion broke it"],correct:0},
    {q:"Tapas means both 'heat' and 'austerity.' Modern biology confirms deliberate stress (cold showers, fasting) triggers...",a:["Hormesis — small stress doses make cells stronger, exactly mirroring the yogic concept","Cortisol floods that damage the body over time"],correct:0},
    {q:"A river flows around rocks, not through them. Water is softest yet carves the Grand Canyon. This teaches...",a:["Non-resistance is ultimate power — Ahimsa isn't passive, it's strategically yielding","Persistence beats everything — keep pushing no matter what"],correct:0},
    {q:"The Jain concept of Anekantavada says truth has infinite faces. Two people can disagree and BOTH be right. This connects to...",a:["Satya — truth isn't about being right, it's about not being false. Humility IS truthfulness","Ahimsa — seeing multiple truths prevents the violence of forced agreement"],correct:0},
    {q:"Japan's forest bathing (Shinrin-yoku) reduces cortisol 16%. The Vedic equivalent practiced for millennia...",a:["Vanaprastha — the forest-dwelling life stage where nature itself teaches restraint","Tapasya — meditating in forests until transcending hunger and cold"],correct:0},
    {q:"A monk owned only a blanket. A thief stole it. The monk chased him to give his pillow too, saying...",a:["I wish I could give you the moonlight — you need beauty more than I need warmth","Take everything, but please don't carry the habit of stealing into your next life"],correct:0},
    {q:"The eagle can fly highest of all birds. But it achieves this not by flapping harder — it finds thermals and RESTS while rising. This is...",a:["Effortless Yama — the highest restraint feels like freedom, not restriction. You ride natural forces instead of fighting","A physics lesson about aerodynamics unrelated to spiritual practice"],correct:0},
  ],
  102:[
    {q:"Toyota used 'Kaizen' to become the world's greatest car company. This mirrors the Niyama of Tapas. What is Kaizen?",a:["Improving by just 1% every day — tiny discipline that compounds into extraordinary results over years","Working 16 hours daily with no breaks until perfection"],correct:0},
    {q:"Vivekananda could memorize encyclopedia pages in one reading. His secret wasn't talent — it was pure Niyama...",a:["Brahmacharya — channeling ALL vital energy into mental focus through years of strict discipline","A photographic memory enhanced by meditation supplements"],correct:0},
    {q:"Scientists scanned Buddhist monks with 10,000+ meditation hours. Their brains showed something that stunned neuroscience...",a:["Physically changed — thicker cortex, more grey matter, gamma waves 30x stronger than average","Ability to enter death-like state with zero brain activity"],correct:0},
    {q:"Ramanujan produced 3,900 math results with almost no training. He said goddess Namagiri wrote equations in his dreams. This is...",a:["Ishvara Pranidhana — total surrender to the divine, the final Niyama","Mathematical genius that transcends spiritual explanation"],correct:0},
    {q:"Patanjali Sutra 1.12: 'Abhyasa vairagyabhyam tat nirodhah.' This single verse contains ALL of Niyama...",a:["Mastery through persistent practice AND detachment from results — do the work without obsessing over outcomes","Mastery through suffering — the harder the path, the greater the reward"],correct:0},
    {q:"James Clear's 'Atomic Habits': Cue → Craving → Response → Reward. The yogic equivalent practiced 3000 years earlier...",a:["Sankalpa — sacred intention that rewires the subconscious through daily repetition","Mantra chanting — repeating sounds 108 times to reprogram neural pathways"],correct:0},
    {q:"A Japanese master was asked: 'How many techniques do you know?' He said: 'Only one. But I've practiced it 10,000 times.' This mirrors...",a:["Abhyasa — persistent practice where mastery is depth, not breadth","Bushido — the samurai code valuing perfection over variety"],correct:0},
    {q:"Modern research: it takes 66 days (not 21) to form a habit. The ancient yogic prescription was...",a:["40 days of unbroken Sadhana — remarkably close to the scientific finding","108 days — matching the 108 mala beads"],correct:0},
    {q:"Einstein worked as a patent clerk while developing Relativity. He never complained. This is...",a:["Santosha — contentment with current circumstances while working toward higher goals","Pure genius that would have emerged regardless"],correct:0},
    {q:"The Sanskrit word 'Guru' literally means...",a:["'Gu' = darkness, 'Ru' = remover. One who removes darkness — not one who adds knowledge","'Great one' — a title of respect for learned teachers"],correct:0},
    {q:"A violinist: 'How do you play so beautifully?' 'I practiced BADLY for 10,000 hours.' This teaches...",a:["Tapas includes enduring being bad at something — discipline means doing it BEFORE you're good","Anyone can master anything with enough hours regardless of talent"],correct:0},
    {q:"Nikola Tesla could 'build' machines in his mind and test them before creating them physically. In yoga, this is...",a:["Dharana combined with Tapas — sustained focused imagination is a creative superpower","Siddhi — supernatural power from years of meditation"],correct:0},
    {q:"Research: writing goals down makes you 42% more likely to achieve them. The Vedic equivalent...",a:["Sankalpa — sacred vow spoken at dawn that programs the subconscious","Mantra writing — writing 'Om' 1,008 times to purify the mind"],correct:0},
    {q:"A farmer plants a seed and waits 3 months. He doesn't dig it up to check. This patience is...",a:["Shraddha — faith + discipline. Niyama means doing the work even when you can't see results","Tapas — the heat of waiting burns away impatience"],correct:0},
    {q:"Bill Gates reads 50 books/year. Buffett reads 5 hours daily. The Vedic term for continuous learning is...",a:["Svadhyaya — self-study, now expanded to mean lifelong learning from all sources","Abhyasa — disciplined repetition building compound knowledge"],correct:0},
    {q:"A mother wakes at 5 AM daily for 18 years to make her child's lunch. No thanks. No notice. This is the purest...",a:["Tapas AND Ishvara Pranidhana — selfless discipline without expectation of reward","Karma Yoga — working without attachment to results"],correct:0},
    {q:"Marcus Aurelius: 'The impediment to action advances action. What stands in the way becomes the way.' In Niyama...",a:["Obstacles ARE the practice — every difficulty is Tapas burning away weakness","Seek obstacles deliberately to accelerate spiritual growth"],correct:0},
    {q:"The practice of Mauna (24-hour silence weekly) is now recommended by neurologists because...",a:["The brain regenerates neural pathways during silence — constant noise prevents self-repair","Silent meditation releases DMT from the pineal gland"],correct:0},
    {q:"The Gita (6.17): 'Yoga is not for one who eats too much or too little, sleeps too much or too little.' This teaches...",a:["Discipline is BALANCE, not extremism — the middle path IS the Niyama","Only moderate people can practice yoga"],correct:0},
    {q:"Why do monks shave their heads?",a:["External simplicity removes decision fatigue — freeing mental energy for practice","Hair absorbs spiritual energy meant for the crown chakra"],correct:0},
    {q:"A craftsman makes the same pot 10,000 times. The 10,000th looks simple but contains wisdom of 9,999 failures. The Japanese call this...",a:["Wabi-sabi — beauty in imperfection through discipline. Each failure teaches what success cannot","Kaizen — the 10,000th pot is 1% better than the 9,999th"],correct:0},
    {q:"Traditional Indian wrestling (Kushti) requires 4 AM training, simple food, celibacy, and serving the guru. This system is...",a:["All five Niyamas in practice — Shaucha, Santosha, Tapas, Svadhyaya, Ishvara Pranidhana","An outdated method replaced by sports science"],correct:0},
    {q:"'Discipline equals freedom' (Navy SEAL Jocko Willink). MORE structure creates MORE freedom because...",a:["Automated daily choices through discipline free mental energy for creativity — exactly what Niyama does","Military and yogic discipline are fundamentally different"],correct:0},
    {q:"A seed contains an entire tree. The tree doesn't need to be 'added' — it needs conditions to emerge. Niyama creates...",a:["Conditions for inherent potential to emerge — discipline doesn't create greatness, it reveals it","Pressure forcing growth, like a plant through concrete"],correct:0},
    {q:"Svadhyaya originally meant chanting Vedic texts ALOUD, not silently. Why oral tradition was considered superior...",a:["Sanskrit syllable vibrations affect the nervous system — the sound IS the teaching","Paper hadn't been invented so oral was the only option"],correct:0},
    {q:"The Shaolin monks train carrying water up 1,000 steps for 10 years before learning one fighting move. Why?",a:["Tapas must be built in mundane tasks before applied to extraordinary ones — the fire of discipline is forged in boredom","Physical conditioning matters more than technique in combat"],correct:0},
    {q:"Swami Sivananda wrote 300 books, treated thousands, did 6 hours of yoga daily. His paradoxical secret...",a:["Ishvara Pranidhana — surrendering results to God eliminated anxiety, enabling work without burnout","Sleeping only 3 hours through yogic breathing"],correct:0},
    {q:"The Korean concept 'Nunchi' — reading the room and adapting — mirrors which Niyama?",a:["Svadhyaya — deep self-study including awareness of how you affect others and they affect you","Ishvara Pranidhana — letting divine guidance direct social behavior"],correct:0},
    {q:"The word 'practice' (Abhyasa) shares its root with 'seat' (Asana). This is because...",a:["True practice requires sitting with discomfort — willingness to stay when you want to run IS the practice","Both come from root 'as' meaning 'to be present'"],correct:0},
    {q:"The Japanese Misogi: one incredibly hard thing per year pushing your limits. This mirrors...",a:["Tapas — voluntary hardship expanding your capacity, burning away mental weakness","Extreme sports addiction disguised as spirituality"],correct:0},
  ],
  103:[
    {q:"Ram Bahadur Bomjon sat motionless without food or water, filmed by Discovery Channel. How long?",a:["10 months continuously — challenging everything medical science believed about human survival","72 hours in a hibernation-like metabolic state"],correct:0},
    {q:"A 2,500-year-old tree withstands hurricanes that destroy buildings. It perfectly explains 'Sthira Sukham Asanam' because...",a:["Firm roots but flexible branches — rigid things break, steady-yet-yielding survive. THIS is Asana","Bark harder than steel — pure rigidity is ultimate stability"],correct:0},
    {q:"NASA: astronauts doing yoga in space maintain 40% better bone density. This confirms...",a:["Asana affects bones, organs, and nervous system at the cellular level — not just muscles","Yoga creates an energy field protecting against radiation"],correct:0},
    {q:"Hatha Yoga Pradipika says 8.4 million asanas exist — one per species. Only 2 are essential. Which?",a:["Siddhasana and Padmasana — designed for prolonged meditation without pain","Shavasana and Tadasana — representing death and life"],correct:0},
    {q:"Patanjali never described a single posture. His ENTIRE instruction on Asana was...",a:["'Sthira sukham asanam' — steady and comfortable. Three words. That's it.","'Practice 84 postures daily at dawn for liberation'"],correct:0},
    {q:"Why is Shavasana (corpse pose) the MOST difficult asana according to masters?",a:["Complete stillness of body AND mind simultaneously is harder than any physical contortion","It requires holding breath for 5+ minutes while relaxing every muscle"],correct:0},
    {q:"A glass of muddy water clears when you stop stirring. You don't remove the mud. This teaches...",a:["Stillness IS purification — you don't need to 'fix' anything, just stop agitating","Meditation cleans the mind like a filter cleans water"],correct:0},
    {q:"Tai Chi practitioners at 80 have better balance than athletes at 20. Research shows...",a:["Slow steady movement rewires the cerebellum faster than fast movement — steadiness trains the brain MORE than intensity","Chinese herbs alongside practice boost neuroplasticity"],correct:0},
    {q:"Krishna's posture during the entire Gita revelation to Arjuna was...",a:["Standing perfectly still in a chariot between two armies — stillness amidst chaos IS the teaching","Seated in Padmasana hovering above the battlefield"],correct:0},
    {q:"A violin string too loose = no sound. Too tight = snaps. Perfect note = exact tension. This is...",a:["Buddha's Middle Way AND Patanjali's Asana — steadiness between effort and ease, never extremes","A physics principle unrelated to yoga"],correct:0},
    {q:"Studies: standing tall 2 min increases testosterone 20%, decreases cortisol 25%. Yogis knew this because...",a:["Asana was never about exercise — it uses body position to change brain chemistry and consciousness","Ancient yogis measured hormones through pulse diagnosis"],correct:0},
    {q:"Pyramids stood 4,500 years. Secret: wide base, narrow top. Identical to...",a:["Yogic teaching that spiritual height requires broad foundation — Asana IS the physical foundation","Sacred geometry channeling cosmic energy through pyramid shapes"],correct:0},
    {q:"Why do ALL meditation traditions worldwide arrive at the same cross-legged posture?",a:["Triangular base, locked knees, straight spine — biomechanically optimal for prolonged stillness","Cultural transmission through the Silk Road spread Indian postures"],correct:0},
    {q:"A sniper holds still 72 hours for one shot. The key isn't physical strength but...",a:["Mental acceptance of discomfort — when the mind stops resisting, the body stops fidgeting. Asana's deepest teaching","Specialized breathing reducing heartbeat to 30 BPM"],correct:0},
    {q:"Flamingos sleep on ONE leg for hours. This seems harder but is easier because...",a:["The leg locks mechanically using ZERO muscle effort — nature's perfect Asana uses structure, not strength","A special tendon acts as a cable lock"],correct:0},
    {q:"Chess grandmasters burn 6,000 calories/day during tournaments while SITTING STILL. This proves...",a:["Mental steadiness requires as much energy as physical exercise — the brain uses 20% of body energy when focused","Chess should be classified alongside marathon running"],correct:0},
    {q:"In Ashtanga Yoga, the SAME sequence repeats daily for years. Critics say boring. Practitioners say...",a:["When sequence is memorized, mind is freed — body moves on autopilot while consciousness deepens. Repetition IS the gateway","Each repetition burns past-life karma"],correct:0},
    {q:"The Great Wall of China was built with sticky rice + limestone. Rigid concrete cracks in earthquakes. This teaches...",a:["Flexibility within structure outlasts rigidity — a strong yet supple body lasts longer than merely strong","Ancient Chinese engineering was superior to modern methods"],correct:0},
    {q:"When you balance on one leg, your brain makes 100+ micro-adjustments per second below awareness. Yogis call this...",a:["Sahaja — the natural effortless state where balance maintains itself without 'trying.' True Asana feels like this","Kundalini activating balance centers"],correct:0},
    {q:"Trees in windy areas develop thicker trunks and deeper roots. Scientists call this 'stress inoculation.' In yoga...",a:["Challenging asanas IS the wind — discomfort builds the resilience 'trunk' supporting everything above","Wind represents negative energy yogis must avoid"],correct:0},
    {q:"'Comfortable' in Sthira Sukham doesn't mean easy. Sukha literally means...",a:["'Good space' (su=good, kha=space) — aligned posture creates good space for energy. Comfort is alignment, not softness","Happiness — the posture should make you feel joyful"],correct:0},
    {q:"A traditional Indian woman carries water on her head for miles without spilling. This requires...",a:["Perfect integration of Asana, Dharana, and Pranayama — three working as one","Years of neck-strengthening exercises"],correct:0},
    {q:"Your body replaces every atom in 7-10 years. Yet you remain 'you.' Asana's deepest teaching...",a:["The body is constantly moving at atomic level — stillness is illusion. True Asana finds steadiness within permanent change","Asana postures help replace cells more efficiently"],correct:0},
    {q:"Water takes the shape of any container yet remains water. This is ideal Asana because...",a:["Adaptability without losing essence — steady practice makes you MORE flexible in life, not rigid","Water has no form, like enlightened beings have no fixed personality"],correct:0},
    {q:"Japanese Seiza (kneeling) was mandatory for samurai. Why warriors chose uncomfortable posture for daily life...",a:["Straight spine, alert mind, can stand to fight instantly — steadiness serving both peace and action","Self-punishment building mental toughness"],correct:0},
    {q:"The average adult sits 10+ hours with back pain. A yogi sits 10+ hours pain-free. The difference...",a:["Active sitting with engaged core + aligned spine vs passive slumping — same duration, opposite effects","Yogis have genetically different spines from evolution"],correct:0},
    {q:"The Sanskrit 'Yoga' comes from 'yuj' meaning to yoke/unite. But unite WHAT with WHAT?",a:["Individual consciousness with universal consciousness — the body's steadiness creates the bridge","Body with mind — postures connect two halves of human experience"],correct:0},
    {q:"Reclining Buddha statues show him on his RIGHT side specifically because...",a:["Heart above stomach, aids digestion, neutral spine — ancient anatomical knowledge in art","The soul exits through the right side at death"],correct:0},
    {q:"The phrase 'standing your ground' means firmness of conviction. In Asana this manifests as...",a:["Pada Bandha — rooting the feet so firmly the entire body becomes an extension of the earth's stability","Mula Bandha — locking the root chakra to prevent energy leakage"],correct:0},
    {q:"An architect said: 'A building must be alive enough to sway in wind, dead enough to not collapse.' This paradox IS...",a:["Sthira Sukham — the eternal balance between firmness and softness that defines both great buildings and great asanas","Modern engineering copying ancient temple construction techniques"],correct:0},
  ],
  104:[
    {q:"Wim Hof climbed Everest in shorts using breathing alone. His technique is remarkably similar to...",a:["Tummo breathing from Tibetan yoga — proving ancient Pranayama claims about controlling biology","Holotropic breathwork from modern psychology"],correct:0},
    {q:"Animals with slower breathing (elephants, tortoises) live dramatically longer. The yogic claim this supports...",a:["Breath rate is linked to lifespan — fewer breaths/minute = longer life","Larger animals store more prana from birth"],correct:0},
    {q:"Pranayama means 'Prana + Ayama.' Most translate it as 'breath control.' The CORRECT translation...",a:["Expansion of life-force — Ayama means extend, not control. Goal is EXPANDING vital energy","Restraint of death — holding back death through breath"],correct:0},
    {q:"Stanford: 5 min of a yogic breathing technique reduced PTSD in veterans by 44%. The technique...",a:["Sudarshan Kriya — rhythmic breathing resetting the autonomic nervous system","Bhastrika — bellows breath forcing oxygen into traumatized cells"],correct:0},
    {q:"The longest nerve (Vagus) connects brain to heart, lungs, gut. Breathing stimulates it. Yogis called this nerve...",a:["Sushumna Nadi — they mapped the nervous system 3,000 years before Western anatomy","Kundalini — serpent energy awakened through nerve stimulation"],correct:0},
    {q:"When you sigh: double inhale + long exhale. Neuroscientist Huberman found this is the fastest way to...",a:["Calm the nervous system — identical to ancient Viloma Pranayama","Increase brain oxygen for better decisions"],correct:0},
    {q:"Breathing through LEFT nostril activates parasympathetic (rest). RIGHT activates sympathetic (alert). Yogis discovered this...",a:["2,000+ years before neuroscience confirmed lateralized nasal breathing affects brain hemispheres","Through trial and error in Himalayan retreats"],correct:0},
    {q:"Box breathing (4-4-4-4) is used by Navy SEALs before combat. The yogic original...",a:["Sama Vritti Pranayama — equal ratio breathing. Special Forces rediscovered a 3,000-year-old technique","Simplified Kapalabhati adapted for Western practitioners"],correct:0},
    {q:"The diaphragm works both voluntarily AND involuntarily. Why is this significant for Pranayama?",a:["Breath is the ONLY bridge between conscious and unconscious systems — controlling it gives access to both","The diaphragm is the seat of the soul in Vedic anatomy"],correct:0},
    {q:"Babies naturally belly-breathe. Adults chest-breathe. Why the change?",a:["Chronic stress and social conditioning train us out of natural breathing — Pranayama is RE-learning what we knew at birth","Chest muscles strengthen while diaphragm weakens with age"],correct:0},
    {q:"Singing, chanting, humming extend the exhale and stimulate the Vagus nerve. This explains why...",a:["Every religion independently developed chanting — OM, Gregorian chants, Sufi Zikr work through the same breath mechanism","Singing makes people happy through social bonding, not breath"],correct:0},
    {q:"Nose breathing filters, warms, humidifies air. A 2020 Stanford study showed mouth breathers develop...",a:["Higher blood pressure, worse sleep, more anxiety, facial changes — confirming why yogis insist on nose breathing","Larger lung capacity from wider airflow opening"],correct:0},
    {q:"Deep sleep: 4-6 breaths/min. Advanced meditators achieve this WHILE AWAKE. This means...",a:["The body enters repair state usually only in sleep — meditation gives sleep benefits while conscious","The brain can't tell difference between sleep and meditation"],correct:0},
    {q:"In panic attacks, the problem is NOT too little oxygen but too MUCH (hyperventilation). The yogic cure...",a:["Extending the exhale — breathing OUT longer than IN activates calming nervous system instantly","Holding breath as long as possible to 'reset' breathing"],correct:0},
    {q:"'Inspiration' means both inhaling AND receiving a creative idea. Not coincidence because...",a:["Ancient languages recognized breath-consciousness link — prana means BOTH breath and life-force","English borrowed from Latin which borrowed from Sanskrit"],correct:0},
    {q:"Heart Rate Variability (HRV) is the #1 longevity predictor. Pranayama affects HRV by...",a:["Dramatically increasing it — coherent breathing trains the heart to be more resilient","Decreasing it, making heartbeat perfectly constant"],correct:0},
    {q:"Why alternate nostrils (Nadi Shodhana)? Nostrils naturally alternate dominance every...",a:["90-120 minutes — called the nasal cycle. Nadi Shodhana artificially triggers this, balancing brain hemispheres","24 hours — one nostril for day, other for night"],correct:0},
    {q:"The CO2 tolerance test: hold breath after normal exhale. Healthy = 25-40 sec. Most manage 15-20. This indicates...",a:["Chronic over-breathing — most breathe 2-3x necessary, causing anxiety. Pranayama corrects this","Poor cardiovascular fitness needing more exercise"],correct:0},
    {q:"Freediver Budimir Šobat held his breath 24 min 37 sec. Yogic texts claim pranayama masters could stop breathing for...",a:["Days — 'Kevala Kumbhaka' where the body requires almost no oxygen","Hours — by reducing metabolic rate through nostril patterns"],correct:0},
    {q:"A candle at arm's length shouldn't flicker during a yogi's exhale. This tests...",a:["Breath control so refined that exhalation is steady and laminar, not turbulent — true mastery","Lung capacity — only advanced practitioners have large enough lungs"],correct:0},
    {q:"The 'second wind' in running happens because the body switches to efficient aerobic metabolism. Yogis trigger this through...",a:["Kapalabhati and Bhastrika — rapid breathing that flushes the system, forcing earlier metabolic switch","Visualization of prana flowing through legs"],correct:0},
    {q:"During labor, women learn specific breathing patterns. These are simplified versions of...",a:["Pranayama — Ferdinand Lamaze studied yoga in the 1950s and adapted it","Ancient European midwifery traditions"],correct:0},
    {q:"Dr. Andrew Weil's 4-7-8 technique (inhale 4, hold 7, exhale 8) credits...",a:["Pranayama — specifically Yoga Sutras' teaching on extended exhale ratios","His own clinical research at Harvard"],correct:0},
    {q:"Swami Rama at Menninger Clinic (1970) demonstrated voluntary control over...",a:["Heartbeat (stopping 17 sec), body temperature, specific brain waves — all through Pranayama","Only breathing rate, which impressed but didn't prove supernatural claims"],correct:0},
    {q:"The world record for continuous OM chanting is 75 hours. Chanters reported no fatigue because...",a:["OM at 136.1 Hz entrains alpha waves and vagus nerve sustains the body — the chant becomes life-force","Mass hysteria and group suggestion override physical limits"],correct:0},
    {q:"Why do we yawn? Most recent scientific theory: brain cooling. Yogic explanation...",a:["The body instinctively draws in more prana when energy is low — a pranayamic reflex","Yawning releases stored karma through the mouth"],correct:0},
    {q:"Apnea divers report peace and mystical experiences at extreme depths. Medically 'nitrogen narcosis.' Yogis say...",a:["Deep breath retention naturally produces altered consciousness — divers accidentally enter Pranayama meditation","Underwater pressure opens the third eye at 30 meters"],correct:0},
    {q:"Christian 'breath prayer' ('Lord Jesus Christ, have mercy') timed to breathing is functionally identical to...",a:["So-Ham meditation — 'So' on inhale, 'Ham' on exhale, synchronizing mantra with breath","Kapalabhati — rhythmic breath emptying all thoughts"],correct:0},
    {q:"In Ayurveda, a doctor's first diagnostic tool is observing breathing. Shallow chest breathing indicates...",a:["Vata imbalance — anxiety, overthinking. Treatment? Specific Pranayama before any medicine","Excess Pitta — overheating and respiratory inflammation"],correct:0},
    {q:"A single deep breath changes blood pH within seconds. This is why controlled breathing can stop...",a:["Panic attacks, pain perception, even allergic reactions — breath chemistry affects every cell","Only emotional states — physical conditions need physical medicine"],correct:0},
  ],
  105:[
    {q:"The Matrix red pill/blue pill was confirmed by the Wachowskis to be inspired by...",a:["Maya — our senses create false reality. Pratyahara is unplugging from the illusion","Karma — past-life choices determine reality, Neo broke the cycle"],correct:0},
    {q:"50% of subjects missed a GORILLA walking through a basketball game (inattentional blindness). This proves...",a:["We don't see reality — we see what mind expects. Senses are filters, not truth-revealers","The brain processes only 40 bits/sec while 11 million hit the retina"],correct:0},
    {q:"Tibetan monks raised finger temperature 17°F in freezing conditions (Harvard verified). This proves...",a:["Consciousness can override biology — withdrawn senses give mind direct control over 'automatic' functions","Monks have thicker skin from cold exposure"],correct:0},
    {q:"Avg person consumes 34 GB of information daily — 5x more than 1986. Yogis called this overstimulation...",a:["Vikshepa — mind scatters like a monkey jumping branches, unable to rest on any thought","Tamas — heavy lethargy from too much input drowning the mind"],correct:0},
    {q:"Katha Upanishad: soul=passenger, intelligence=charioteer, mind=reins, senses=horses. If charioteer sleeps...",a:["Horses run wild, drag chariot off a cliff — without awareness, senses lead to destruction","Passenger must take reins directly, bypassing the mind"],correct:0},
    {q:"Silence retreats (10 days, no talking/phones/reading) participants develop...",a:["Thicker auditory cortex and improved pattern recognition — brain rebuilds when freed from constant input","Hearing so acute they detect whispers 50 meters away"],correct:0},
    {q:"A blindfolded person's other senses sharpen within minutes. This 'cross-modal plasticity' means...",a:["Brain reallocates resources from unused senses — withdrawing ONE sense enhances others","The body evolves in real-time to survive"],correct:0},
    {q:"Steve Jobs wore the same outfit daily. His reason mirrors Pratyahara...",a:["Every decision depletes mental energy — reducing sensory choices frees mind for what matters","He had no fashion sense"],correct:0},
    {q:"Dopamine fasting — avoiding pleasure for 24 hours — resets the brain's reward system. Yogis practiced this as...",a:["Upavasa — fasting from ALL sensory pleasures, giving the nervous system time to recalibrate","Extreme Tapas — suffering that burns away karma"],correct:0},
    {q:"An art expert detects fakes in seconds through 'gut feeling.' This intuition comes from...",a:["Years of sensory refinement — Pratyahara isn't killing senses, it's SHARPENING them to perceive what others miss","Supernatural sixth sense from decades of study"],correct:0},
    {q:"Children raised in nature score higher on creativity than city kids because...",a:["Natural 'soft fascination' allows the mind to rest and create. Cities create exhausting 'hard fascination'","Nature has more oxygen enhancing brain creativity"],correct:0},
    {q:"Noise-canceling headphones create ANTI-noise (inverted waves). Perfect Pratyahara metaphor because...",a:["You don't fight input — you generate equal inner stillness that cancels it. Withdrawal is balance, not blockage","Technology replicated what yogis took decades to achieve"],correct:0},
    {q:"Your phone sends 80 notifications/day = 29,000/year of involuntary attention grabs. The yogic antidote...",a:["Pratyahara — training to CHOOSE which stimuli to respond to, rather than reacting to all","Complete digital detox, returning to pre-technology life"],correct:0},
    {q:"In martial arts, 'Mushin' (no-mind) = responding to attacks without thinking. This requires WITHDRAWING from...",a:["The analytical mind — stop thinking about the fight and the body responds faster than thought","Fear — which slows reaction 300 milliseconds"],correct:0},
    {q:"A wine sommelier identifies 1,000+ wines blindfolded. Their FIRST training step was...",a:["Ignoring all senses EXCEPT smell/taste — focused withdrawal of irrelevant senses sharpens relevant ones","Drinking enormous quantities daily to build sensory memory"],correct:0},
    {q:"The astronaut 'Overview Effect' — awe seeing Earth from space — happens because...",a:["All familiar sensory anchors removed simultaneously, forcing wider perspective. This IS forced Pratyahara","Zero gravity affects inner ear creating euphoria"],correct:0},
    {q:"Your nose adapts to smells in 20 min — you stop smelling your own home. Called...",a:["Olfactory adaptation — brain withdraws attention from constant stimuli automatically. Pratyahara does this DELIBERATELY","Nose blindness — a condition affecting 15% of people"],correct:0},
    {q:"Why do meditation traditions recommend CLOSING EYES first?",a:["Vision uses 30% of brain processing — closing eyes instantly frees 30% of neural resources","Eyes emit electromagnetic energy disturbing the aura"],correct:0},
    {q:"Grandmaster chess: heart rate DROPS during intense games. Beginners' rate spikes. This shows...",a:["Mastery includes mastery over reactions — expert has withdrawn from stress that enslaves beginners","Grandmasters have genetically lower heart rates"],correct:0},
    {q:"Japanese tea ceremony: every movement deliberate, each sense engaged ONE at a time. This is...",a:["Active Pratyahara — focusing each sense individually achieves stillness through control, not suppression","An art form unrelated to yoga"],correct:0},
    {q:"Social media 1+ hour daily = 66% higher depression. The yogic explanation...",a:["Constant comparison through eyes creates Vikshepa (scattering) and Dvesha (aversion to own life)","Screens emit negative electromagnetic frequencies"],correct:0},
    {q:"Beethoven composed greatest symphonies while COMPLETELY deaf. Pratyahara explains...",a:["When external hearing withdrew, inner musical hearing became infinitely refined — music was always inside","Deafness forced brain rewiring, creating new composing pathways"],correct:0},
    {q:"The Ganzfeld effect: staring at uniform white causes hallucinations within minutes because...",a:["Brain INVENTS input when deprived — proving most of what we 'see' is brain-generated, not real","White surfaces reflect spiritual energy opening the third eye"],correct:0},
    {q:"Ancient gurukuls (forest schools): students lived 12+ years away from cities. PRIMARY reason...",a:["Removing sensory distractions — controlled environment for Pratyahara, learning in nature's quiet","Cities had diseases, forest air was medicinal"],correct:0},
    {q:"Default Mode Network activates when NOT focused externally — daydreaming, self-reflection, creativity. Pratyahara...",a:["Deliberately activates DMN by withdrawing external focus — accessing deepest creative functions on demand","Suppresses DMN to achieve pure emptiness"],correct:0},
    {q:"A photographer sees compositions others miss. A chef tastes what others can't. This comes from...",a:["Selective Pratyahara — withdrawing from everything EXCEPT their craft's senses, which sharpen exponentially","Natural talent that cannot be learned"],correct:0},
    {q:"'Samsara' (world) literally means...",a:["'Wandering endlessly' — senses pull consciousness from object to object forever. Pratyahara stops the wandering","'Beautiful garden' — the world is divine creation to enjoy"],correct:0},
    {q:"Finnish 'Sisu' — inner resilience in extreme adversity — is closest to which Pratyahara aspect?",a:["Withdrawing from emotional reaction to pain — not numbing, but choosing not to be swept away","Fighting through pain by sheer willpower"],correct:0},
    {q:"'Turn a blind eye' means deliberately ignoring something. In Pratyahara, this skill is...",a:["Essential — CHOOSING what you perceive is highest sensory mastery, selection not suppression","Spiritual cowardice — a true yogi sees everything without flinching"],correct:0},
    {q:"Ancient Indian kings disguised themselves among commoners ('Chanakya's Mirror'). Purpose...",a:["Withdrawing from senses of power — removing crown to see reality undistorted by privilege","Gathering intelligence on potential rebels"],correct:0},
  ],
  106:[
    {q:"Drona asked each prince 'What do you see?' Only Arjuna's answer proved he was the greatest archer...",a:["Only the bird's eye — entire universe shrank to a single point. Perfect Dharana","The bird's heart — penetrating beyond surface to life-force"],correct:0},
    {q:"Flow state (Csikszentmihalyi, 1975) = Patanjali 2,500 years earlier. Both agree the key condition...",a:["Challenge must match skill — too easy=boredom, too hard=anxiety. Balance produces Dharana/Flow","Complete isolation from external stimuli"],correct:0},
    {q:"Einstein: Relativity came from thought experiments, not harder thinking. In yogic terms, Einstein practiced...",a:["Dharana with visualization — holding a scenario so intensely that new truths emerge","Dhyana — letting mind wander until patterns emerge"],correct:0},
    {q:"Multitasking reduces IQ by 15 points — more than marijuana (Stanford). This confirms...",a:["Dharana's teaching: a mind holding many things holds nothing. Scattered mind is weaker regardless of IQ","Modern technology is incompatible with human consciousness"],correct:0},
    {q:"Chess grandmasters use the same brain regions as monks in deep Dharana. What lights up?",a:["Pattern recognition + long-term memory — experts RECOGNIZE instantly, not calculate more","Prefrontal cortex working 10x faster"],correct:0},
    {q:"A laser and light bulb use same energy. Laser cuts steel. The difference...",a:["Coherence — all waves aligned. Dharana aligns ALL mental energy, creating 'laser mind'","Lasers use different light that doesn't exist in nature"],correct:0},
    {q:"Human attention span 2023: 8.25 sec — less than a goldfish (9 sec). Yogis would say...",a:["Not longer attention but DEEPER — Dharana isn't duration, it's quality on a single point","Humanity is devolving to animal-level consciousness"],correct:0},
    {q:"Mozart heard entire symphonies in his head 'in a single glance' — every instrument simultaneously. This is...",a:["Dharana so deep it becomes Dhyana — concentration collapsing time, making wholes appear as single experiences","Musical genius unrelated to meditation"],correct:0},
    {q:"Trataka (candle gazing): stare until tears flow. Why tears?",a:["Tears cleanse eyes AND mind — not blinking trains the mental act of not wavering. Discomfort IS the teacher","Candle heat dries eyes, tears are protective"],correct:0},
    {q:"A samurai's final test: master swings sword at neck, stopping millimeters away. Must NOT flinch. This tests...",a:["Absolute Dharana — concentration so complete that survival instinct is overridden. Mind controls body","Bravery and loyalty, proving readiness to die"],correct:0},
    {q:"Cal Newport's 'Deep Work': distraction-free focus is the most valuable 21st century skill. He described...",a:["Dharana — a 2,500-year-old practice that is now a competitive advantage in the modern economy","A new framework beyond anything ancient wisdom offered"],correct:0},
    {q:"A cat watching a mouse hole doesn't think about food, danger, or sleep. ENTIRE being on one point. This is...",a:["Natural Dharana — animals achieve instinctively what humans must train. Our thinking mind is an OBSTACLE to focus","Predatory instinct unrelated to meditation"],correct:0},
    {q:"A child building blocks is more concentrated than most adult meditators. Why?",a:["Children haven't developed the 'inner critic' interrupting focus — they're in natural Dharana before society trains it out","Children have shorter neural pathways so signals travel faster"],correct:0},
    {q:"'Where attention goes, energy flows.' The original Sanskrit from the Upanishads...",a:["'Yad bhavam tad bhavati' — you become what you focus on. Dharana shapes reality by directing consciousness","'Karma follows thought' — intentions create future lives"],correct:0},
    {q:"Speed readers process 1,000+ words/min by ELIMINATING...",a:["Subvocalization — 'hearing' words internally. Withdrawing auditory sense accelerates visual. Pratyahara serving Dharana","Eye movement — training perfectly straight lines"],correct:0},
    {q:"Michael Jordan's coach taught Zen meditation. Jordan described peak state as 'game slowing down.' This happens because...",a:["In deep Dharana, the focused mind processes faster, making external events appear slower — measurable neuroscience","Adrenaline speeds body while world stays normal"],correct:0},
    {q:"Your subconscious processes 11 million bits/sec. Conscious mind handles 50 bits. Dharana is...",a:["Training the 50-bit mind to direct the 11-million-bit subconscious — tiny rider steering enormous elephant","Expanding conscious processing to match subconscious"],correct:0},
    {q:"A surgeon's 12-hour operation: no hunger, no fatigue, no time awareness. This is...",a:["Spontaneous Dharana — high stakes naturally produce single-pointed focus. Practice = doing this at WILL","Adrenaline masking physical needs"],correct:0},
    {q:"Why tip of the nose specifically for Dharana meditation?",a:["Always visible, never moves, focusing on it slows breathing — a built-in concentration tool you carry everywhere","The nose tip is prana's exit point, concentrating there traps life-force"],correct:0},
    {q:"'If you chase two rabbits, you catch neither.' But Dharana's deeper teaching says...",a:["Don't chase the rabbit — become so still it comes to you. True focus is magnetic attraction, not pursuit","The rabbit is enlightenment and must be chased relentlessly"],correct:0},
    {q:"Elon Musk's 'first principles thinking' — breaking to fundamental truths — is identical to...",a:["Dharana applied to analysis — focusing so deeply you penetrate past assumptions to core truth","A modern business technique unrelated to meditation"],correct:0},
    {q:"Practicing one difficult passage 100 times > playing whole piece 10 times. Because...",a:["Dharana on difficulty creates myelin around specific pathways — focused repetition builds brain infrastructure","Passage becomes memorized regardless of focus quality"],correct:0},
    {q:"Hubble sees galaxies 13 billion light-years away by pointing at one patch of sky for 11 DAYS. This IS...",a:["Technological Dharana — the universe reveals secrets only to those looking at one point long enough","An engineering achievement unrelated to philosophy"],correct:0},
    {q:"Why do ALL religions use rosary/mala/tasbih beads for prayer?",a:["Giving restless hands a task withdraws that sense, freeing mind to focus — Dharana tool disguised as religious object","Beads help count prayers to ensure correct number"],correct:0},
    {q:"A master calligrapher paints one stroke. The paper records truth about the mind because...",a:["Whether mind wavered even one millisecond — brush reveals every fluctuation. Perfect calligraphy = perfect Dharana","Emotional state — happy strokes differ from sad strokes"],correct:0},
    {q:"Brain = 2% body weight but uses 20% energy. When Dharana is achieved, brain energy...",a:["DECREASES — focused minds use less energy than scattered. Mental noise is expensive. Clarity is efficient","Increases as more networks are recruited for focus"],correct:0},
    {q:"'Pay attention' uses 'pay' because...",a:["Attention is LIMITED — you literally 'spend' it. Dharana = learning where to invest your most precious currency","From Latin 'pacare' (pacify) — giving attention calms mind"],correct:0},
    {q:"A spider sits center of web. Any vibration anywhere is felt. This is deepest Dharana because...",a:["From ONE fixed point, you become aware of EVERYTHING — stillness at center creates sensitivity to periphery","Spider = soul trapped in web of Maya"],correct:0},
    {q:"Japanese Ikebana (flower arranging): placing one flower for up to an hour. Meditation because...",a:["The flower IS the Dharana object — sustained contemplation trains concentration and aesthetic awareness simultaneously","Japanese culture values patience above all"],correct:0},
    {q:"A magnifying glass focuses diffuse sunlight into fire. Remove focus = harmless light. This demonstrates...",a:["SAME mental energy everyone has becomes transformative when concentrated — Dharana doesn't add power, it focuses it","Solar energy contains hidden fire only appearing with glass"],correct:0},
  ],
  107:[
    {q:"Ramana Maharshi at 16 asked 'Who am I?' until the self dissolved. What remained?",a:["Pure awareness without a person — he never identified with body or mind again. Deepest Dhyana","Vision of Shiva transmitting enlightenment through grace"],correct:0},
    {q:"Neuroscientist Sam Harris: 'The self is an illusion — provably.' Brain scanning...",a:["Confirms — no single 'self' center. The feeling of being 'someone' is constructed fresh each moment","Disproves — default mode network IS a permanent self"],correct:0},
    {q:"Zen koan: 'What was your face before your parents were born?' Designed to...",a:["Break the logical mind — when thinking exhausts on the impossible, pure awareness remains","Test scripture memorization and dedication to study"],correct:0},
    {q:"Matthieu Ricard's gamma waves = highest ever recorded. The actual discovery...",a:["Happiness/compassion are SKILLS trainable through neuroplasticity — meditation rewires brain structure","A new neurotransmitter called 'dhyana-amine'"],correct:0},
    {q:"'Yoga chitta vritti nirodha' — Sutra 1.2, perhaps the most important sentence in Indian philosophy...",a:["Yoga = stilling mind-fluctuations. When thought-waves settle, you see the lake bottom. THIS is Dhyana","Union of individual with cosmic soul — drop merging with ocean"],correct:0},
    {q:"The word 'Zen' traces: Sanskrit → Chinese → Japanese...",a:["Dhyana → Chan → Zen — one concept across three civilizations over 1,500 years","Separate Japanese tradition merely influenced by Buddhism"],correct:0},
    {q:"12 consecutive Dharana units (each ~one breath) without interruption becomes...",a:["One Dhyana — and 12 Dhyanas = one Samadhi. Not different practices but deepening stages","One complete session after which practitioner should rest"],correct:0},
    {q:"Dharana vs Dhyana is like...",a:["Dripping water vs continuous stream — same substance but Dhyana flows without breaks","Student vs teacher — Dharana learns, Dhyana teaches"],correct:0},
    {q:"Shiva is called Adi Yogi because...",a:["First to teach meditation to 7 sages (Saptarishis) at Kailash — origin of all yoga","Created universe through 1,000 years of unbroken meditation"],correct:0},
    {q:"Brain waves in deep Dhyana shift from...",a:["Beta (active thinking) → alpha (calm) → theta (deep meditation) — measurable, reproducible","Active to completely inactive — brain shuts down"],correct:0},
    {q:"Dhyana mudra: hands in lap, thumbs touching forming a circle. The circle represents...",a:["Completeness of consciousness — a closed energy circuit. Emptiness INSIDE the circle is the goal: shunyata","Full moon — ideal time for deepest meditation"],correct:0},
    {q:"Rumi: 'Silence is the language of God. Everything else is a poor translation.' This is Dhyana because...",a:["Space BETWEEN thoughts is where truth lives — silence isn't absence, it's presence words cannot carry","Rumi was Sufi, separate from Hindu Dhyana"],correct:0},
    {q:"Monks in deep meditation produce same brain chemicals as psychedelics — specifically...",a:["DMT and endogenous opioids — the brain has a built-in 'pharmacy' meditation activates without substances","Serotonin only — explaining peace but not visions"],correct:0},
    {q:"Frankl: 'Between stimulus and response is a space. In that space is freedom.' He described...",a:["Exact Dhyana experience — finding the gap between thoughts where choice exists, instead of autopilot","Importance of counting to 10 before reacting"],correct:0},
    {q:"Mandukya Upanishad: consciousness has 4 states — waking, dreaming, deep sleep, and...",a:["Turiya — the 'fourth' existing DURING the others. The witness aware of itself. Dhyana accesses Turiya","Death — final state where consciousness merges with Brahman"],correct:0},
    {q:"Beginner's brain MRI: chaotic (city rush hour). Advanced meditator looks like...",a:["A symphony orchestra — regions active but perfectly synchronized in coherent harmony","A blank screen — minimal activity indicating stillness"],correct:0},
    {q:"Dalai Lama asked 'What surprises you about humanity?' He said: 'Man sacrifices health for money, then money for health.' Reveals failure of...",a:["Dhyana — without meditation, humans live reactively, never pausing to question the cycle","Economic planning — better financial literacy would prevent this"],correct:0},
    {q:"Tolle's 'Power of Now' (5M copies) core teaching = which Yoga Sutra?",a:["1.1 'Atha yoga anushasanam' — NOW begins yoga. Emphasis on NOW is the entire teaching","2.46 'Sthira sukham asanam' — comfort in present through posture"],correct:0},
    {q:"Asked 'Are you God?' Buddha: 'No.' 'Angel?' 'No.' 'Saint?' 'No.' Then what? He answered...",a:["'I am awake.' Buddha = 'awakened one.' Dhyana doesn't make you special — it wakes you to what you ARE","'Nothing and everything simultaneously — transcending all categories'"],correct:0},
    {q:"WHY do all traditions worldwide independently say 'Watch your breath'?",a:["Breath is the ONLY automatic process also controllable voluntarily — the only doorway between conscious and unconscious mind","Breathing produces the most noticeable sensation while sitting"],correct:0},
    {q:"Zen student: 'What is meditation?' Master: 'When I eat, I eat. When I walk, I walk.' Student: 'Everyone does that.' Master replied...",a:["'No. When they eat, they think about walking. When they walk, they think about eating.' Full presence IS Dhyana","'I do it without thoughts, that's the difference'"],correct:0},
    {q:"Yogis meditated in CREMATION GROUNDS. This disturbing choice was deliberate because...",a:["Confronting death dissolves ego's greatest fear — once you've sat with burning corpses, nothing disturbs meditation","Cremation grounds have special spiritual energy from departing souls"],correct:0},
    {q:"Placebo effect: belief alone heals the body. Yogis say this demonstrates...",a:["Mind's power over matter — focused intention during Dhyana can restructure physical reality","Brain's pharmacy releasing chemicals from expectation"],correct:0},
    {q:"Astronaut Edgar Mitchell experienced Samadhi-like consciousness from space. He founded Institute of Noetic Sciences to study...",a:["Whether consciousness extends beyond the brain — meditation accesses the same 'cosmic consciousness'","Whether zero gravity affects spiritual experiences"],correct:0},
    {q:"A candle in a WINDLESS room = classic Dhyana image. Why windless?",a:["Flame = consciousness, naturally pointing upward (liberation) when not disturbed by 'winds' of thought","Candle = Agni, wind = Vayu — gods must not compete"],correct:0},
    {q:"Heart Sutra: 'Form is emptiness, emptiness is form.' Understood only through...",a:["Direct Dhyana experience — intellect fails here. You must SEE that material and void are the same","Advanced Buddhist philosophical study"],correct:0},
    {q:"8 weeks meditation physically SHRINKS amygdala (fear) while GROWING prefrontal cortex (wisdom). This proves...",a:["Dhyana is neurosurgery performed by mind on itself — you literally reshape brain architecture through practice","Meditation is medical treatment doctors should prescribe"],correct:0},
    {q:"'Dhyana' (Sanskrit) and 'Dianoia' (Greek for thought) share the same Indo-European root. This suggests...",a:["Greeks and Indians recognized thinking and meditating are SAME faculty at different depths — thought refined = meditation","Greek philosophy was directly influenced by Indian yogis on Silk Road"],correct:0},
    {q:"Thich Nhat Hanh: 'Feelings come and go like clouds. Conscious breathing is my anchor.' This is...",a:["Dhyana in everyday life — no cave needed. Breath is always available as anchor to present awareness","Simplified meditation for beginners who can't sit long"],correct:0},
    {q:"The most profound Dhyana insight, according to virtually every tradition, is...",a:["You are not your thoughts — a silent witness BEHIND all thinking has been there since birth and remains after death","The universe is illusion, only Brahman is real"],correct:0},
  ],
};

/* ═══ AMBIENT MUSIC ENGINE ═══ */
function useAmbient(){
  const audioRef=useRef(null);const playing=useRef(false);
  const start=useCallback(()=>{
    if(playing.current)return;
    try{
      const a=new Audio("/ambient.mp3");
      a.loop=true; a.volume=1.0;
      audioRef.current=a;
      a.play().then(()=>{playing.current=true}).catch(()=>{});
    }catch(e){}
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
/* ═══ AUDIO CACHE — IndexedDB persistent MP3 cache (zero repeat OpenAI charges) ═══ */
const AudioCache = {
  cache: {},    // in-memory session cache: key → blob URL
  loading: {},  // in-flight promises

  // ── IndexedDB layer ──────────────────────────────────────────
  _db: null,
  async _getDB() {
    if (this._db) return this._db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('mp108_voice_cache_v1', 1);
      req.onupgradeneeded = e => {
        e.target.result.createObjectStore('voices');
      };
      req.onsuccess = e => { this._db = e.target.result; resolve(this._db); };
      req.onerror  = () => reject(req.error);
    });
  },
  async _dbGet(dbKey) {
    try {
      const db = await this._getDB();
      return new Promise(resolve => {
        const tx  = db.transaction('voices', 'readonly');
        const req = tx.objectStore('voices').get(dbKey);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror   = () => resolve(null);
      });
    } catch(e) { return null; }
  },
  async _dbSet(dbKey, arrayBuffer) {
    try {
      const db = await this._getDB();
      return new Promise(resolve => {
        const tx = db.transaction('voices', 'readwrite');
        tx.objectStore('voices').put(arrayBuffer, dbKey);
        tx.oncomplete = resolve;
        tx.onerror    = resolve; // never fail silently
      });
    } catch(e) {}
  },
  // ─────────────────────────────────────────────────────────────

  _key(text)            { return text.slice(0, 80); },
  _dbKey(text, lang)    { return `${lang||'en'}::${text.slice(0, 120)}`; },

  async fetchTTS(text, lang, voiceOverride, instructionOverride) {
    const key   = this._key(text);
    const dbKey = this._dbKey(text, lang);

    // 1. In-memory hit (fastest)
    if (this.cache[key])   return this.cache[key];
    if (this.loading[key]) return this.loading[key];

    const promise = (async () => {
      // 2. IndexedDB hit — no OpenAI call, no charge
      const stored = await this._dbGet(dbKey);
      if (stored) {
        const blob = new Blob([stored], { type: 'audio/mpeg' });
        const url  = URL.createObjectURL(blob);
        this.cache[key] = url;
        console.log('[AudioCache] IndexedDB hit:', key.slice(0,40));
        return url;
      }

      // 3. Fetch from OpenAI TTS (only on first use, then cached forever)
      const isHi = lang === 'hi';
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceOverride || 'ash',
          instructions: instructionOverride || (isHi
            ? 'You are an ancient Indian storyteller narrating in Hindi. Speak slowly, mysteriously, with deep emotion. Pause dramatically between sentences.'
            : 'You are an ancient Indian sage narrating a sacred epic in English. Speak slowly, with deep gravitas and reverence. Pause dramatically between sentences.')
        }),
      });
      if (!resp.ok) throw new Error('TTS API failed: ' + resp.status);

      const arrayBuffer = await resp.arrayBuffer();
      // Store in IndexedDB — all future loads are free
      await this._dbSet(dbKey, arrayBuffer);
      console.log('[AudioCache] Fetched & cached:', key.slice(0,40));

      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url  = URL.createObjectURL(blob);
      this.cache[key] = url;
      delete this.loading[key];
      return url;
    })().catch(e => {
      delete this.loading[key];
      console.warn('[AudioCache] fetchTTS failed:', e.message);
      return null;
    });

    this.loading[key] = promise;
    return promise;
  },

  get(text) { return this.cache[this._key(text)] || null; },

  // Returns count of entries cached in IndexedDB
  async countCached() {
    try {
      const db = await this._getDB();
      return new Promise(resolve => {
        const tx  = db.transaction('voices', 'readonly');
        const req = tx.objectStore('voices').count();
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => resolve(0);
      });
    } catch(e) { return 0; }
  },

  preloadAll(lang) {
    const texts = [];
    STORY_PAGES.forEach(p => texts.push({ text: p[lang], lang }));
    CHARS.forEach(c => texts.push({ text: lang === 'hi' ? c.voiceHi : c.voiceEn, lang }));
    let done = 0;
    const total = texts.length;
    const progress = () => Math.round((done / total) * 100);
    return {
      promise: Promise.all(texts.map(t => this.fetchTTS(t.text, t.lang).then(() => { done++; }))),
      progress, total,
    };
  },

  // Preload Yama intro + all character voices for instant playback
  preloadGameVoices(lang) {
    const yamaEn='So, you dare to challenge me? I am Yama. The God of Death. I ride the great buffalo through the realm of the dead. Every soul that walks this board eventually comes to me. You think you can outwit Death? I have watched a million souls fall. Brave warriors. Wise sages. They all fell. And I devoured their karma. Play your little game, mortal. I will be watching every single move. And when your karma falters, I will be there. Now tell me, little soul. Who are you?';
    const yamaHi='तो, तुम मुझसे खेलना चाहते हो? मैं यमराज हूँ। मृत्यु का देवता। मैं महान भैंसे पर सवार होकर मृतकों के लोक से गुज़रता हूँ। हर आत्मा जो इस पट पर चलती है, अंत में मेरे पास आती है। मैंने लाखों आत्माओं को गिरते देखा है। वीर योद्धा। ज्ञानी ऋषि। सब गिरे। और मैंने उनका कर्म निगल लिया। खेलो अपना छोटा सा खेल, नश्वर प्राणी। मैं देख रहा हूँ। हर एक कदम। अब बताओ, छोटी सी आत्मा। तुम कौन हो?';
    const yamaVoice='onyx';
    const yamaInstructions='Speak like Thanos — an impossibly deep, heavy, rumbling bass voice that vibrates through the chest. Extremely slow and deliberate. Each word lands like a boulder. Long pauses between sentences. Absolute calm confidence of someone who has already won. No emotion, no anger — just cold, inevitable, cosmic authority. The voice of someone who has existed for billions of years and knows exactly how this ends. Whisper certain words for emphasis. This is not a villain — this is a force of nature speaking.';
    const texts = [];
    // Yama gets onyx voice with scary instructions
    texts.push({ text: lang === 'hi' ? yamaHi : yamaEn, lang, voice: yamaVoice, instructions: yamaInstructions });
    // Characters get normal ash voice
    CHARS.forEach(c => texts.push({ text: lang === 'hi' ? c.voiceHi : c.voiceEn, lang }));
    let done = 0;
    const total = texts.length;
    const progress = () => Math.round((done / total) * 100);
    return {
      promise: Promise.all(texts.map(t => this.fetchTTS(t.text, t.lang, t.voice, t.instructions).then(() => { done++; }))),
      progress, total,
    };
  },

  clear() {
    Object.values(this.cache).forEach(url => { try { URL.revokeObjectURL(url); } catch(e){} });
    this.cache = {};
    this.loading = {};
  },

  count() { return Object.keys(this.cache).length; },
};

/* ═══ STATIC VOICE FILES — zero API cost ═══ */
const STATIC_VOICES = {
  yama: { en: '/yama-en.mp3', hi: '/yama-hi.mp3' },
  warrior: { en: '/char-warrior-en.mp3', hi: '/char-warrior-hi.mp3' },
  sage: { en: '/char-sage-en.mp3', hi: '/char-sage-hi.mp3' },
  healer: { en: '/char-healer-en.mp3', hi: '/char-healer-hi.mp3' },
  dancer: { en: '/char-dancer-en.mp3', hi: '/char-dancer-hi.mp3' },
  merchant: { en: '/char-merchant-en.mp3', hi: '/char-merchant-hi.mp3' },
  ascetic: { en: '/char-ascetic-en.mp3', hi: '/char-ascetic-hi.mp3' },
  // ── Graha effects (9 planets × 2 languages = 18 files) ──
  // Generate with: bash generate-game-voices.sh
  graha_sun:     { en: '/game-voices/graha-sun-en.mp3',     hi: '/game-voices/graha-sun-hi.mp3' },
  graha_moon:    { en: '/game-voices/graha-moon-en.mp3',    hi: '/game-voices/graha-moon-hi.mp3' },
  graha_mars:    { en: '/game-voices/graha-mars-en.mp3',    hi: '/game-voices/graha-mars-hi.mp3' },
  graha_mercury: { en: '/game-voices/graha-mercury-en.mp3', hi: '/game-voices/graha-mercury-hi.mp3' },
  graha_jupiter: { en: '/game-voices/graha-jupiter-en.mp3', hi: '/game-voices/graha-jupiter-hi.mp3' },
  graha_venus:   { en: '/game-voices/graha-venus-en.mp3',   hi: '/game-voices/graha-venus-hi.mp3' },
  graha_saturn:  { en: '/game-voices/graha-saturn-en.mp3',  hi: '/game-voices/graha-saturn-hi.mp3' },
  graha_rahu:    { en: '/game-voices/graha-rahu-en.mp3',    hi: '/game-voices/graha-rahu-hi.mp3' },
  graha_ketu:    { en: '/game-voices/graha-ketu-en.mp3',    hi: '/game-voices/graha-ketu-hi.mp3' },
  // ── Snake & ladder reactions ──
  snake_hit:   { en: '/game-voices/snake-hit-en.mp3',   hi: '/game-voices/snake-hit-hi.mp3' },
  ladder_rise: { en: '/game-voices/ladder-rise-en.mp3', hi: '/game-voices/ladder-rise-hi.mp3' },
  moksha_gate: { en: '/game-voices/moksha-gate-en.mp3', hi: '/game-voices/moksha-gate-hi.mp3' },
  karma_win:   { en: '/game-voices/karma-win-en.mp3',   hi: '/game-voices/karma-win-hi.mp3' },
  shield_save: { en: '/game-voices/shield-save-en.mp3', hi: '/game-voices/shield-save-hi.mp3' },
  // ── Ashtanga Marga step intros (7 steps × 2 langs = 14 files) ──
  ashtanga_step_1: { en: '/game-voices/ashtanga-1-en.mp3', hi: '/game-voices/ashtanga-1-hi.mp3' },
  ashtanga_step_2: { en: '/game-voices/ashtanga-2-en.mp3', hi: '/game-voices/ashtanga-2-hi.mp3' },
  ashtanga_step_3: { en: '/game-voices/ashtanga-3-en.mp3', hi: '/game-voices/ashtanga-3-hi.mp3' },
  ashtanga_step_4: { en: '/game-voices/ashtanga-4-en.mp3', hi: '/game-voices/ashtanga-4-hi.mp3' },
  ashtanga_step_5: { en: '/game-voices/ashtanga-5-en.mp3', hi: '/game-voices/ashtanga-5-hi.mp3' },
  ashtanga_step_6: { en: '/game-voices/ashtanga-6-en.mp3', hi: '/game-voices/ashtanga-6-hi.mp3' },
  ashtanga_step_7: { en: '/game-voices/ashtanga-7-en.mp3', hi: '/game-voices/ashtanga-7-hi.mp3' },
};

// Map graha fx key → STATIC_VOICES key
const GRAHA_STATIC_KEY = {
  sun:'graha_sun', moon:'graha_moon', mars:'graha_mars', mercury:'graha_mercury',
  jupiter:'graha_jupiter', venus:'graha_venus', saturn:'graha_saturn',
  rahu:'graha_rahu', ketu:'graha_ketu',
};

// ══════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA — The Divine Scribe. He didn't just record this game.
//    He WROTE it. Every number on this board is his handwriting.
//    Every snake name — his Sanskrit. Every virtue — his ink.
//    The Agrasandhani (cosmic ledger) updates in real-time.
// ══════════════════════════════════════════════════════════════════════
const CG_LINES = {
  en: {
    open:     "I am Chitragupta. Since the first soul drew breath, I have kept the record. I wrote every number on this board. Every serpent's name — my Sanskrit. Every virtue ladder — my ink. I open a new page today. I am watching.",
    punya:    "Noted. Punya recorded. The ledger grows lighter.",
    papa:     "Recorded. Papa entered. Without judgment. The ledger simply sees what is true.",
    snake:    "This serpent was already written here. I placed it where weakness would catch a soul. Your fall was always in the ledger.",
    ladder:   "This virtue was written here by me. I placed each ladder exactly where a pure act could lift a soul. You found it.",
    dharma_p: "Righteous. Written in gold. Every dharmic act, however costly, is inscribed differently. I use a finer quill.",
    dharma_x: "Recorded without judgment. Only Yama reads the final tally. And he always does.",
    sacred:   "You have entered the Ashtanga Marga. From this point, I set down my quill. Only the soul itself writes what happens here.",
    moksha:   "The page is complete. I seal it. In all the ages I have kept this record, few pages end this way. Go. You are free.",
    reject:   "The ledger speaks plainly. Papa exceeds Punya. Return. Purify. The board is still here. So am I.",
    balance:  "I note this carefully. Your Punya and Papa are nearly equal. What you do in these next squares — I will write with extraordinary attention.",
    seeker:   "I have watched every seeker who has walked this board. I know how each story ends. I say nothing. I only write.",
    judgment: "The game is over. I close the Agrasandhani. The pure soul has been liberated. For those who remain — Yama awaits. As he always does.",
  },
  hi: {
    open:     "मैं चित्रगुप्त हूँ। जब से पहली आत्मा ने श्वास लिया, मैं अभिलेख रखता आया हूँ। इस पट का हर अंक मेरी लिखावट है। हर सांप का नाम — मेरी संस्कृत। हर सीढ़ी — मेरी स्याही। आज नया पृष्ठ खोलता हूँ। मैं देख रहा हूँ।",
    punya:    "दर्ज। पुण्य अंकित। खाता हल्का होता है।",
    papa:     "दर्ज। पाप अंकित। बिना निर्णय के। खाता केवल सत्य देखता है।",
    snake:    "यह सांप यहाँ पहले से लिखा था। मैंने इसे वहाँ रखा जहाँ कमज़ोरी आत्मा को पकड़े। यह गिरावट हमेशा खाते में थी।",
    ladder:   "यह सीढ़ी मैंने लिखी थी। हर सीढ़ी ठीक वहाँ रखी जहाँ पुण्य कर्म आत्मा को उठा सके। तुमने इसे पाया।",
    dharma_p: "धर्मिक। सोने में लिखा गया। हर धर्मिक कार्य मैं अलग तरीके से लिखता हूँ।",
    dharma_x: "निर्णय के बिना दर्ज। केवल यमराज अंतिम गणना पढ़ते हैं।",
    sacred:   "तुम अष्टांग मार्ग में प्रवेश कर चुके हो। यहाँ मैं कलम रख देता हूँ। आत्मा ही लिखती है।",
    moksha:   "पृष्ठ पूर्ण हुआ। मैं मुहर लगाता हूँ। बहुत कम पृष्ठ इस तरह समाप्त होते हैं। जाओ। तुम मुक्त हो।",
    reject:   "खाता स्पष्ट बोलता है। पाप, पुण्य से अधिक है। लौटो। शुद्ध हो। पट यहाँ है। मैं भी।",
    balance:  "मैं इसे ध्यान से नोट करता हूँ। पुण्य और पाप लगभग बराबर हैं। इन अगले खानों में मैं असाधारण ध्यान से लिखूँगा।",
    seeker:   "मैंने हर उस साधक को देखा है जो इस पट पर चला है। मुझे पता है हर कहानी कैसे समाप्त होती है। केवल लिखता हूँ।",
    judgment: "खेल समाप्त हुआ। अग्रसंधानी बंद करता हूँ। जो शुद्ध था, मुक्त हुआ। जो शेष हैं — यमराज प्रतीक्षा करते हैं। जैसा हमेशा होता है।",
  }
};

// Static CG voice files (pre-generated with onyx voice + celestial processing)
const CG_STATIC = {
  open:'/game-voices/cg-open', punya:'/game-voices/cg-punya', papa:'/game-voices/cg-papa',
  snake:'/game-voices/cg-snake', ladder:'/game-voices/cg-ladder',
  dharma_p:'/game-voices/cg-dharmap', dharma_x:'/game-voices/cg-dharmapap',
  sacred:'/game-voices/cg-sacred', moksha:'/game-voices/cg-moksha',
  reject:'/game-voices/cg-reject', balance:'/game-voices/cg-balance',
  seeker:'/game-voices/cg-seeker', judgment:'/game-voices/cg-judgment',
};

// Entry type visual styles for the ledger
const CG_ENTRY_TYPES = {
  punya:    {icon:'✦',color:'#f0d050',bg:'rgba(240,200,80,.08)',label:'पुण्य'},
  papa:     {icon:'✦',color:'#e06030',bg:'rgba(200,80,40,.08)',label:'पाप'},
  snake:    {icon:'𓆙',color:'#e06030',bg:'rgba(200,80,40,.10)',label:'पाप'},
  ladder:   {icon:'🪔',color:'#80d080',bg:'rgba(80,200,80,.08)',label:'पुण्य'},
  dharma_p: {icon:'⚖',color:'#80c0a0',bg:'rgba(80,180,120,.08)',label:'धर्म'},
  dharma_x: {icon:'⚖',color:'#c08060',bg:'rgba(180,100,60,.08)',label:'अधर्म'},
  sacred:   {icon:'🪷',color:'#c0a0f0',bg:'rgba(160,120,220,.08)',label:'मार्ग'},
  moksha:   {icon:'ॐ', color:'#f0d050',bg:'rgba(240,200,80,.15)',label:'मोक्ष'},
  reject:   {icon:'⚠', color:'#e06060',bg:'rgba(200,60,60,.10)',label:'अशुद्ध'},
  balance:  {icon:'⚖',color:'#a0c8e0',bg:'rgba(120,160,200,.08)',label:'तुला'},
};

const VoiceEngine = {
  audio: null,
  speaking: false,
  _stopToken: 0, // incremented on every stop() — lets async fetches detect they've been cancelled

  // Play a static MP3 file — instant, zero API cost
  playStatic(url) {
    this.stop();
    const audio = new Audio(url);
    audio.volume = 1.0;
    this.audio = audio;
    this.speaking = true;
    audio.onended = () => { this.speaking = false; };
    audio.play().catch(()=>{});
  },

  _pickBestVoice(voices, lang) {
    if (lang === 'hi') {
      return voices.find(v => v.name.includes('Google') && v.lang === 'hi-IN')
        || voices.find(v => v.lang === 'hi-IN')
        || voices.find(v => v.lang.startsWith('hi'))
        || voices[0];
    }
    const preferred = ['Google UK English Male','Daniel','Rishi','Google US English','Aaron','Samantha'];
    for (const name of preferred) { const v = voices.find(v => v.name.includes(name)); if (v) return v; }
    return voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en')) || voices[0];
  },

  _browserSpeak(text, lang) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.75; u.pitch = 0.8; u.volume = 1.0;
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-GB';
      const voices = window.speechSynthesis.getVoices();
      const best = this._pickBestVoice(voices, lang);
      if (best) u.voice = best;
      this.speaking = true;
      u.onend = () => { this.speaking = false; };
      window.speechSynthesis.speak(u);
    } catch (e) {}
  },

  async speak(text, lang) {
    // Force stop any existing voice first — prevents overlap
    this.stop();
    if (!text) return;
    const myToken = this._stopToken; // capture before any await

    const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);

    if (!isLocal) {
      const cached = AudioCache.get(text);
      if (cached) {
        if (this._stopToken !== myToken) return; // dismissed while checking cache
        const audio = new Audio(cached);
        audio.volume=1.0;
        this.audio = audio;
        this.speaking = true;
        audio.onended = () => { this.speaking = false; };
        await audio.play().catch(()=>{});
        return;
      }

      // Not cached — fetch from OpenAI (1-3s). Check token after await.
      try {
        const url = await AudioCache.fetchTTS(text, lang);
        if (this._stopToken !== myToken) return; // user dismissed while fetching — discard
        if (url) {
          const audio = new Audio(url);
          audio.volume=1.0;
          this.audio = audio;
          this.speaking = true;
          audio.onended = () => { this.speaking = false; };
          audio.play();
          return;
        }
      } catch (e) {}
    }

    if (this._stopToken !== myToken) return; // check before browser fallback too
    // Fallback: browser speech
    this._browserSpeak(text, lang);
  },

  stop() {
    this._stopToken++;
    if (this.audio) { try { this.audio.pause(); this.audio.currentTime = 0; } catch (e) {} this.audio = null; }
    if (this._yamaCtx) { try { this._yamaCtx.close(); } catch(e){} this._yamaCtx = null; }
    if (this._yamaSource) { try { this._yamaSource.stop(); } catch(e){} this._yamaSource = null; }
    if (this._yamaSource2) { try { this._yamaSource2.stop(); } catch(e){} this._yamaSource2 = null; }
    if (this._cgCtx) { try { this._cgCtx.close(); } catch(e){} this._cgCtx = null; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    this.speaking = false;
  },

  // ═══ CHITRAGUPTA VOICE — Celestial scribe, absolute calm ═══
  // Audio chain: presence (2.5kHz +5dB) + air shimmer (10kHz +4dB)
  //   + 5s heavenly reverb + 528Hz singing bowl — never interrupts other voices
  _cgCtx: null,
  async speakChitragupta(key, lang) {
    // Chitragupta waits — he never interrupts
    if (this.speaking) return;
    const l = (lang==='hi') ? 'hi' : 'en';
    const text = CG_LINES[l]?.[key];
    if (!text) return;
    const staticBase = CG_STATIC[key];
    const staticUrl = staticBase ? `${staticBase}-${l}.mp3` : null;
    const myToken = this._stopToken;

    let audioUrl = null;
    // 1. Try static file (instant, zero cost)
    if (staticUrl) {
      try { const r=await fetch(staticUrl,{method:'HEAD'}); if(r.ok) audioUrl=staticUrl; } catch(e){}
    }
    if (this._stopToken !== myToken || this.speaking) return;
    // 2. Fallback: browser speech (always instant)
    if (!audioUrl) { this._browserSpeak(text, lang); return; }

    try {
      const resp = await fetch(audioUrl);
      const arrayBuf = await resp.arrayBuffer();
      if (this._stopToken !== myToken || this.speaking) return;
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      if (ctx.state==='suspended') await ctx.resume();
      this._cgCtx = ctx;
      const buf = await ctx.decodeAudioData(arrayBuf);
      if (this._stopToken !== myToken) { try{ctx.close()}catch(e){}; return; }

      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = 0.93; // Weight of eternity

      // Presence (2.5kHz) — divine authority
      const pres = ctx.createBiquadFilter();
      pres.type='peaking'; pres.frequency.value=2500; pres.Q.value=0.9; pres.gain.value=5;
      // Air shimmer (10kHz) — ethereal, above the world
      const air = ctx.createBiquadFilter();
      air.type='highshelf'; air.frequency.value=10000; air.gain.value=4;
      // Cut muddy low-mids (400Hz)
      const cut = ctx.createBiquadFilter();
      cut.type='peaking'; cut.frequency.value=400; cut.Q.value=1; cut.gain.value=-3;
      // 5-second heavenly reverb (longer than narrator's 2s)
      const rvLen = Math.floor(5*ctx.sampleRate);
      const rvBuf = ctx.createBuffer(2,rvLen,ctx.sampleRate);
      for(let ch=0;ch<2;ch++){
        const d=rvBuf.getChannelData(ch);
        for(let i=0;i<rvLen;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/rvLen,1.4)*(i<ctx.sampleRate*.03?i/(ctx.sampleRate*.03):1);
      }
      const conv = ctx.createConvolver(); conv.buffer=rvBuf;
      const rvMix = ctx.createGain(); rvMix.gain.value=0.32;
      // 528Hz "miracle tone" — unique signature of Chitragupta's voice
      const bowl = ctx.createOscillator(); bowl.type='sine'; bowl.frequency.value=528;
      const bowlG = ctx.createGain(); bowlG.gain.value=0.016;
      const bowlF = ctx.createBiquadFilter(); bowlF.type='bandpass'; bowlF.frequency.value=528; bowlF.Q.value=12;
      bowl.connect(bowlF); bowlF.connect(bowlG);
      // Route
      const master = ctx.createGain(); master.gain.value=1.0;
      src.connect(cut); cut.connect(pres); pres.connect(air);
      air.connect(master); air.connect(conv); conv.connect(rvMix); rvMix.connect(master);
      bowlG.connect(master); master.connect(ctx.destination);
      this.speaking = true;
      src.onended = () => {
        this.speaking = false;
        bowlG.gain.linearRampToValueAtTime(0, ctx.currentTime+2.5);
        setTimeout(()=>{try{bowl.stop();ctx.close()}catch(e){}this._cgCtx=null;},3000);
      };
      src.start(0); bowl.start(0);
    } catch(e) {
      this._browserSpeak(text, lang);
    }
  },

  // ═══ YAMA VOICE — Full audio processing for Thanos-like sound ═══
  async speakYama(text, lang) {
    this.stop();
    if (!text) return;

    // Use static MP3 file — zero API cost
    const staticUrl = STATIC_VOICES.yama[lang==='hi'?'hi':'en'];

    try {
      const resp = await fetch(staticUrl);
      const blob = await resp.blob();
      const arrayBuf = await blob.arrayBuffer();

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      this._yamaCtx = ctx;

      const buffer = await ctx.decodeAudioData(arrayBuf);

      // ═══ LAYER 1: Main voice (pitch 0.82) ═══
      const source1 = ctx.createBufferSource();
      source1.buffer = buffer;
      source1.playbackRate.value = 0.82;
      this._yamaSource = source1;

      // ═══ LAYER 2: Deep shadow (pitch 0.65, quiet) ═══
      const source2 = ctx.createBufferSource();
      source2.buffer = buffer;
      source2.playbackRate.value = 0.55;
      this._yamaSource2 = source2;

      const layer2Gain = ctx.createGain();
      layer2Gain.gain.value = 0.12;

      // ═══ SUB-BASS BOOST ═══
      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = 'lowshelf';
      bassBoost.frequency.value = 120;
      bassBoost.gain.value = 8;

      // ═══ HIGH CUT ═══
      const highCut = ctx.createBiquadFilter();
      highCut.type = 'lowpass';
      highCut.frequency.value = 5000;

      // ═══ MID CLARITY ═══
      const midBoost = ctx.createBiquadFilter();
      midBoost.type = 'peaking';
      midBoost.frequency.value = 1500;
      midBoost.gain.value = 3;
      midBoost.Q.value = 1;

      // ═══ DISTORTION ═══
      const distortion = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = (Math.PI + 10) * x / (Math.PI + 10 * Math.abs(x));
      }
      distortion.curve = curve;
      distortion.oversample = '4x';

      // ═══ DELAY ═══
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.3;
      const delayFb = ctx.createGain();
      delayFb.gain.value = 0.15;
      const delayMix = ctx.createGain();
      delayMix.gain.value = 0.25;
      delay.connect(delayFb);
      delayFb.connect(delay);
      delay.connect(delayMix);

      // ═══ REVERB ═══
      const rvLen = 2.5 * ctx.sampleRate;
      const rvBuf = ctx.createBuffer(2, rvLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = rvBuf.getChannelData(ch);
        for (let i = 0; i < rvLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rvLen, 2.5);
      }
      const conv = ctx.createConvolver();
      conv.buffer = rvBuf;
      const rvMix = ctx.createGain();
      rvMix.gain.value = 0.25;

      // ═══ COMPRESSOR ═══
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.ratio.value = 4;
      comp.attack.value = 0.005;
      comp.release.value = 0.1;

      // ═══ MASTER ═══
      const master = ctx.createGain();
      master.gain.value = 1.3;

      // ═══ ROUTING ═══
      source1.connect(bassBoost);
      source2.connect(layer2Gain);
      layer2Gain.connect(bassBoost);
      bassBoost.connect(highCut);
      highCut.connect(midBoost);
      midBoost.connect(distortion);
      distortion.connect(comp);
      comp.connect(master);
      comp.connect(delay);
      comp.connect(conv);
      delayMix.connect(master);
      conv.connect(rvMix);
      rvMix.connect(master);
      master.connect(ctx.destination);

      this.speaking = true;
      source1.onended = () => { this.speaking = false; try{ctx.close()}catch(e){} this._yamaCtx=null; };
      source1.start(0);
      source2.start(0);
      return; // Success!
    } catch(e) {
      console.warn('Yama Web Audio failed:', e.message);
    }

    // Fallback: play static file without processing
    try {
      this.playStatic(staticUrl);
    } catch(e) {
      this._browserSpeak(text, lang);
    }
  },

  // ═══ PLAY YAMA TAUNT — static MP3 from /yama-taunts/ with scary processing ═══
  async playYamaTaunt(type, lang) {
    this.stop();
    const isHi = lang === 'hi';
    let count, prefix;
    if (type === 'snake') { count = 8; prefix = 'snake'; }
    else if (type === 'wrong') { count = 4; prefix = 'wrong'; }
    else if (type === 'reject') { count = 1; prefix = 'reject'; }
    else return;

    const idx = type === 'reject' ? '' : '-' + (Math.floor(Math.random() * count) + 1);
    const file = `/yama-taunts/${prefix}-${isHi ? 'hi' : 'en'}${idx}.mp3`;
    console.log('Yama taunt:', file);

    try {
      const resp = await fetch(file);
      if (!resp.ok) throw new Error('File not found: ' + file);
      const arrayBuf = await resp.arrayBuffer();

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      this._yamaCtx = ctx;

      const buffer = await ctx.decodeAudioData(arrayBuf);

      // Apply Yama audio processing — pitch down + bass + reverb
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.88;
      this._yamaSource = source;

      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = 'lowshelf'; bassBoost.frequency.value = 200; bassBoost.gain.value = 8;

      const master = ctx.createGain();
      master.gain.value = 1.2;

      source.connect(bassBoost);
      bassBoost.connect(master);
      master.connect(ctx.destination);

      this.speaking = true;
      source.onended = () => { this.speaking = false; try{ctx.close()}catch(e){} this._yamaCtx=null; };
      source.start(0);
    } catch(e) {
      console.warn('Yama taunt MP3 not found, falling back to TTS API:', e.message);
      // Fallback: use TTS API if static files don't exist yet
      const taunts = type === 'snake' ? YAMA_TAUNTS_SNAKE : type === 'wrong' ? YAMA_TAUNTS_WRONG : ["Ha ha ha ha ha! Rejected! The gates of Moksha slam shut in your face!"];
      const text = taunts[Math.floor(Math.random() * taunts.length)];
      this.speak(text, lang);
    }
  },

  // ═══ NARRATOR VOICE — Vedic temple processing for story onboarding ═══
  // staticUrl: pre-generated /onboarding/story-N-lang.mp3 (zero API cost)
  // onAudioStart: fires the MOMENT audio begins playing (used for UI sync)
  async speakNarrator(text, lang, staticUrl, onAudioStart) {
    this.stop();
    if (!text) return;
    const myToken = this._stopToken;

    let audioUrl = null;

    // 1. Static pre-generated file (highest priority — always free)
    if (staticUrl) {
      try {
        const r = await fetch(staticUrl, { method: 'HEAD' });
        if (r.ok) { audioUrl = staticUrl; console.log('[Voice] Static:', staticUrl); }
      } catch(e) {}
    }

    if (this._stopToken !== myToken) return;

    // 2. IndexedDB / OpenAI API (fallback if static not deployed yet)
    if (!audioUrl) {
      const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);
      if (!isLocal) {
        audioUrl = AudioCache.get(text);
        if (!audioUrl) {
          try { audioUrl = await AudioCache.fetchTTS(text, lang); } catch(e){}
        }
      }
    }

    if (this._stopToken !== myToken) return;
    if (!audioUrl) { this._browserSpeak(text, lang); onAudioStart && onAudioStart(); return; }

    try {
      const resp = await fetch(audioUrl);
      const blob = await resp.blob();
      const arrayBuf = await blob.arrayBuffer();

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      this._yamaCtx = ctx; // reuse cleanup ref

      const buffer = await ctx.decodeAudioData(arrayBuf);

      // ═══ NARRATOR SOURCE (pitch 0.88 — slow gravitas) ═══
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.92;
      this._yamaSource = source;

      // ═══ BASS WARMTH (120Hz, +4dB) ═══
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 120;
      bass.gain.value = 4;

      // ═══ MID CLARITY (2kHz, +3dB) ═══
      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 2000;
      mid.gain.value = 3;
      mid.Q.value = 1;

      // ═══ HIGH CUT (gentle warmth) ═══
      const highCut = ctx.createBiquadFilter();
      highCut.type = 'lowpass';
      highCut.frequency.value = 7000;

      // ═══ DELAY (250ms, 15% feedback — words linger) ═══
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.25;
      const delayFb = ctx.createGain();
      delayFb.gain.value = 0.15;
      const delayMix = ctx.createGain();
      delayMix.gain.value = 0.18;
      delay.connect(delayFb);
      delayFb.connect(delay);
      delay.connect(delayMix);

      // ═══ TEMPLE REVERB (hall, 2s decay, 20% mix) ═══
      const rvLen = 2.0 * ctx.sampleRate;
      const rvBuf = ctx.createBuffer(2, rvLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = rvBuf.getChannelData(ch);
        for (let i = 0; i < rvLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rvLen, 2.0);
      }
      const conv = ctx.createConvolver();
      conv.buffer = rvBuf;
      const rvMix = ctx.createGain();
      rvMix.gain.value = 0.20;

      // ═══ OM DRONE (tanpura-like background hum) ═══
      // Layer 3 oscillators: fundamental + fifth + octave for rich drone
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.04; // Very subtle — felt not heard

      const droneBass = ctx.createBiquadFilter();
      droneBass.type = 'lowpass';
      droneBass.frequency.value = 200; // Keep only low frequencies

      // Sa (fundamental) — ~130 Hz (C3)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 130.81;

      // Pa (perfect fifth) — ~196 Hz (G3)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 196.00;
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.value = 0.6;

      // Low Sa (octave below) — ~65 Hz
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.value = 65.41;
      const osc3Gain = ctx.createGain();
      osc3Gain.gain.value = 0.8;

      osc1.connect(droneBass);
      osc2.connect(osc2Gain);
      osc2Gain.connect(droneBass);
      osc3.connect(osc3Gain);
      osc3Gain.connect(droneBass);
      droneBass.connect(droneGain);

      // ═══ MASTER ═══
      const master = ctx.createGain();
      master.gain.value = 1.1;

      // ═══ ROUTING ═══
      source.connect(bass);
      bass.connect(mid);
      mid.connect(highCut);
      highCut.connect(master);
      highCut.connect(delay);
      highCut.connect(conv);
      delayMix.connect(master);
      conv.connect(rvMix);
      rvMix.connect(master);
      droneGain.connect(master);
      master.connect(ctx.destination);

      // ═══ PLAY ═══
      if (this._stopToken !== myToken) { try{osc1.stop();osc2.stop();osc3.stop();ctx.close()}catch(e){} return; }
      this.speaking = true;
      source.onended = () => {
        this.speaking = false;
        // Fade out drone gracefully
        droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(()=>{try{osc1.stop();osc2.stop();osc3.stop();ctx.close()}catch(e){}this._yamaCtx=null},2000);
      };
      source.start(0);
      onAudioStart && onAudioStart(); // ← fires exactly when audio begins
      osc1.start(0);
      osc2.start(0);
      osc3.start(0);
      return;
    } catch(e) {
      console.warn('Narrator processing failed:', e.message);
    }

    // Fallback: play without effects
    try {
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      this.audio = audio;
      this.speaking = true;
      audio.onplay  = () => { onAudioStart && onAudioStart(); };
      audio.onended = () => { this.speaking = false; };
      await audio.play().catch(()=>{});
    } catch(e) {
      this._browserSpeak(text, lang);
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════
// MINI BOARD — pixel-perfect miniature of the actual game board
// Shares the same sqP() layout, realm zones, SVG snake/ladder paths,
// sacred crown strip, geometry overlays, and animated token.
// ═══════════════════════════════════════════════════════════════════════
function OnboardingBoard({ mode }) {
  const [tokenPos, setTokenPos]   = useState(1);
  const [highlight, setHighlight] = useState(null); // sq number or null
  const [realmPulse, setRealmPulse] = useState(null); // 'bhuloka'|'antarloka'|'svargaloka'
  const [snakeActive, setSnakeActive] = useState(null); // snake head sq
  const [ladderActive, setLadderActive] = useState(null); // ladder foot sq
  const [snakeFlash, setSnakeFlash] = useState(false);
  const [ladderFlash, setLadderFlash] = useState(false);
  const timerRef = useRef(null);

  // Same cell layout as game board
  function sqP(n) {
    if(n<1)n=1;if(n>100)n=100;
    const r=Math.floor((n-1)/10);
    return{r:9-r,c:r%2===0?(n-1)%10:9-((n-1)%10)};
  }
  function cellCenter(n,cs) {
    const{r,c}=sqP(n);
    return{x:c*cs+cs/2,y:r*cs+cs/2};
  }
  const CS=28; // cell size px
  const W=10*CS;

  const realmOf=n=>n<=33?'bhuloka':n<=66?'antarloka':'svargaloka';
  const RCOL={bhuloka:'#8a6030',antarloka:'#5a80a0',svargaloka:'#9070c0'};

  const SHEAD=Object.keys(SNAKES).map(Number);
  const LFOOT=Object.keys(LADDERS).map(Number);
  const DLM=DLM_SQ;

  useEffect(()=>{
    clearInterval(timerRef.current);
    clearTimeout(timerRef.current);

    if(mode==='intro'){
      const path=[1,3,9,18,22,28,31,37,44,47,53,56,61,65,71,74,82,85,89,95,97];
      let i=0;
      timerRef.current=setInterval(()=>{
        i=(i+1)%path.length;
        setTokenPos(path[i]);
        setHighlight(path[i]);
      },700);
    }
    if(mode==='realms'){
      const seq=['bhuloka','antarloka','svargaloka',null];
      let ri=0;
      setRealmPulse(seq[0]);
      timerRef.current=setInterval(()=>{
        ri=(ri+1)%seq.length;
        setRealmPulse(seq[ri]);
      },2000);
    }
    if(mode==='snakeladder'){
      const steps=[
        ()=>{setTokenPos(9);setHighlight(9);setLadderActive(9);setLadderFlash(true);setSnakeActive(null);setSnakeFlash(false)},
        ()=>{setTokenPos(31);setHighlight(31);setLadderFlash(false);setLadderActive(null)},
        ()=>{setTokenPos(47);setHighlight(47);setSnakeActive(47);setSnakeFlash(true)},
        ()=>{setTokenPos(29);setHighlight(29);setSnakeFlash(false);setSnakeActive(null)},
        ()=>{setHighlight(null)},
      ];
      let si=0; steps[0]();
      timerRef.current=setInterval(()=>{si=(si+1)%steps.length;steps[si]();},1800);
    }
    return()=>{clearInterval(timerRef.current);clearTimeout(timerRef.current)};
  },[mode]);

  const{x:tx,y:ty}=cellCenter(tokenPos,CS);

  // Build snake SVG path (sinuous curve)
  const snakePath=(from,to)=>{
    const f=cellCenter(from,CS),t=cellCenter(to,CS);
    const dx=t.x-f.x,dy=t.y-f.y,len=Math.sqrt(dx*dx+dy*dy),nx=-dy/len,amp=len*.14;
    let d=`M${f.x} ${f.y}`;
    for(let i=1;i<=6;i++){
      const p=i/6,s=i%2===0?1:-1;
      d+=` Q${f.x+dx*((i-.5)/6)+nx*amp*s} ${f.y+dy*((i-.5)/6)+(dx/len)*amp*s} ${f.x+dx*p} ${f.y+dy*p}`;
    }
    return{d,fx:f.x,fy:f.y};
  };
  // Ladder SVG lines
  const ladderLines=(from,to)=>{
    const f=cellCenter(from,CS),t=cellCenter(to,CS);
    return{x1f:f.x-2,y1f:f.y,x1t:t.x-2,y1t:t.y,x2f:f.x+2,y2f:f.y,x2t:t.x+2,y2t:t.y,fx:f.x,fy:f.y};
  };

  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
      {/* Sacred Crown strip — matches actual game */}
      <div style={{
        width:W,background:'linear-gradient(180deg,rgba(240,200,80,.1),rgba(20,16,10,.4))',
        border:'1px solid rgba(240,200,80,.2)',borderBottom:'2px solid rgba(240,200,80,.2)',
        borderRadius:'4px 4px 0 0',padding:'3px 2px 2px',position:'relative',overflow:'hidden',
      }}>
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:.07}} viewBox="0 0 200 36" preserveAspectRatio="none">
          {[0,25,50,75,100,125,150,175].map(x=><g key={x}>
            <polygon points={`${x+12.5},3 ${x+25},33 ${x},33`} fill="none" stroke="#f0d050" strokeWidth=".5"/>
            <polygon points={`${x+12.5},33 ${x+25},3 ${x},3`} fill="none" stroke="#f0d050" strokeWidth=".5"/>
          </g>)}
        </svg>
        <div style={{fontSize:6,textAlign:'center',letterSpacing:3,color:'#f0d050',opacity:.55,marginBottom:2,fontFamily:"'Cinzel',serif"}}>अष्टांग मार्ग</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:1}}>
          {SACRED_PATH.map((sq,si)=>(
            <div key={sq.num} style={{
              aspectRatio:'1',
              background:sq.num===108?'radial-gradient(circle,rgba(240,200,80,.25),rgba(240,200,80,.04))':'radial-gradient(circle,rgba(240,200,80,.08),transparent)',
              border:`0.5px solid ${sq.num===108?'rgba(240,200,80,.5)':'rgba(240,200,80,.15)'}`,
              borderRadius:2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              animation:`sacredGlow ${3+si*.3}s ease infinite`,
            }}>
              <span style={{fontSize:8}}>{sq.icon}</span>
              <span style={{fontSize:5,color:'#f0d050',fontFamily:"'Noto Serif Devanagari',serif",lineHeight:1}}>{sq.skt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main 10×10 board */}
      <div style={{
        width:W,height:W,position:'relative',
        background:"radial-gradient(ellipse at 30% 30%,rgba(60,45,20,.25),transparent 50%),radial-gradient(ellipse at 70% 70%,rgba(60,45,20,.2),transparent 50%),#1e1810",
        border:'1.5px solid rgba(200,160,60,.3)',
        boxShadow:'0 0 30px rgba(0,0,0,.5),inset 0 0 20px rgba(0,0,0,.3)',
      }}>
        {/* Realm divider lines */}
        <div style={{position:'absolute',left:'2%',right:'2%',top:'33.3%',height:1,background:'linear-gradient(90deg,transparent,rgba(200,160,60,.2),transparent)',zIndex:8,pointerEvents:'none'}}/>
        <div style={{position:'absolute',left:'2%',right:'2%',top:'66.6%',height:1,background:'linear-gradient(90deg,transparent,rgba(200,160,60,.2),transparent)',zIndex:8,pointerEvents:'none'}}/>

        {/* Realm labels */}
        {[{top:'5%',t:'स्वर्गलोक',c:'#9070c0'},{top:'38%',t:'अन्तर्लोक',c:'#5a80a0'},{top:'72%',t:'भूलोक',c:'#8a6030'}].map((r,i)=>(
          <div key={i} style={{
            position:'absolute',top:r.top,left:'50%',transform:'translateX(-50%)',
            fontSize:6,letterSpacing:3,color:r.c,opacity:realmPulse?
              (realmPulse===(['svargaloka','antarloka','bhuloka'][i])?0.7:0.15):0.2,
            zIndex:9,pointerEvents:'none',whiteSpace:'nowrap',
            transition:'opacity .5s',fontFamily:"'Cinzel',serif",
          }}>{r.t}</div>
        ))}

        {/* Sacred geometry overlay */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:2,opacity:.1}} viewBox="0 0 100 100" preserveAspectRatio="none">
          {[70,77,84,91].map(y=><line key={'bh'+y} x1="5" y1={y} x2="95" y2={y} stroke="#c0a060" strokeWidth=".4"/>)}
          {[10,20,30,40,50,60,70,80,90].map(x=><line key={'bv'+x} x1={x} y1="67" x2={x} y2="100" stroke="#c0a060" strokeWidth=".3"/>)}
          {[42,53].map(y=><g key={'al'+y}>
            <polygon points={`50,${y-5} 58,${y+5} 42,${y+5}`} fill="none" stroke="#c0a060" strokeWidth=".4"/>
            <polygon points={`50,${y+5} 42,${y-5} 58,${y-5}`} fill="none" stroke="#c0a060" strokeWidth=".4"/>
          </g>)}
          {[10,20].map(y=><g key={'sl'+y}>
            <circle cx="50" cy={y} r="10" fill="none" stroke="#c0a060" strokeWidth=".3"/>
            <circle cx="50" cy={y} r="5" fill="none" stroke="#c0a060" strokeWidth=".25"/>
          </g>)}
        </svg>

        {/* SVG layer: snakes + ladders + token */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:6}} viewBox={`0 0 ${W} ${W}`}>
          <defs>
            <filter id="mbglow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {/* Ladders */}
          {Object.entries(LADDERS).map(([from,{to}])=>{
            const l=ladderLines(+from,+to);
            const isAct=ladderActive===+from;
            return(
              <g key={'l'+from} opacity={isAct?1:0.5} filter={isAct?"url(#mbglow)":""}>
                <line x1={l.x1f} y1={l.y1f} x2={l.x1t} y2={l.y1t} stroke={isAct?"#f0d050":"rgba(200,160,60,.55)"} strokeWidth={isAct?1.4:0.7}/>
                <line x1={l.x2f} y1={l.y2f} x2={l.x2t} y2={l.y2t} stroke={isAct?"#f0d050":"rgba(200,160,60,.55)"} strokeWidth={isAct?1.4:0.7}/>
                {Array.from({length:Math.max(2,Math.floor(Math.sqrt((l.x1t-l.x1f)**2+(l.y1t-l.y1f)**2)/10))}).map((_,i,arr)=>{
                  const tt=(i+1)/(arr.length+1);
                  return<line key={i} x1={l.x1f+(l.x1t-l.x1f)*tt} y1={l.y1f+(l.y1t-l.y1f)*tt} x2={l.x2f+(l.x2t-l.x2f)*tt} y2={l.y2f+(l.y2t-l.y2f)*tt} stroke={isAct?"rgba(240,200,80,.8)":"rgba(200,160,60,.3)"} strokeWidth={0.5}/>;
                })}
                {isAct&&ladderFlash&&[0,1,2].map(i=>(
                  <circle key={i} cx={l.fx+(i-1)*3} r={2} fill="#f0d050" opacity={.7-i*.2}>
                    <animate attributeName="cy" values={`${l.fy};${l.fy-12};${l.fy}`} dur=".8s" begin={`${i*.2}s`} repeatCount="indefinite"/>
                  </circle>
                ))}
              </g>
            );
          })}

          {/* Snakes */}
          {Object.entries(SNAKES).map(([from,{to}])=>{
            const{d,fx,fy}=snakePath(+from,+to);
            const isAct=snakeActive===+from;
            return(
              <g key={'s'+from} opacity={isAct?1:0.45} filter={isAct?"url(#mbglow)":""}>
                <path d={d} fill="none" stroke={isAct?"#ff4020":"rgba(160,60,30,.6)"} strokeWidth={isAct?2:1} strokeLinecap="round"/>
                <circle cx={fx} cy={fy} r={isAct?3:2} fill={isAct?"#ff4020":"rgba(180,60,30,.7)"}/>
                {isAct&&snakeFlash&&(
                  <circle cx={fx} cy={fy} r={10} fill="none" stroke="rgba(255,40,20,.5)" strokeWidth={1.5}>
                    <animate attributeName="r" values="6;16;6" dur=".7s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="1;0;1" dur=".7s" repeatCount="indefinite"/>
                  </circle>
                )}
              </g>
            );
          })}

          {/* Token */}
          <g style={{transition:'transform .5s cubic-bezier(.34,1.56,.64,1)'}}
             transform={`translate(${tx},${ty})`}>
            <circle r={8} fill="rgba(240,200,80,.12)" stroke="none">
              <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle r={5.5} fill="#f0d050" stroke="rgba(240,200,80,.6)" strokeWidth={1}/>
            <text textAnchor="middle" y={2} fontSize="7" fill="#1a1408" fontWeight="bold">🔱</text>
          </g>
        </svg>

        {/* Cell grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',position:'relative',zIndex:5,width:'100%',height:'100%',position:'absolute',inset:0}}>
          {Array.from({length:100},(_,i)=>{
            const num=i+1;
            const sn=SNAKES[num],ld=LADDERS[num],dl=DLM.includes(num),mk=num===100;
            const realm=realmOf(num);
            const rc=RCOL[realm];
            const isPulsed=realmPulse&&realmOf(num)===realmPulse;
            let bg='transparent',bdr=`${rc}22`;
            if(mk){bg='radial-gradient(circle,rgba(240,200,80,.2),transparent)';bdr='rgba(240,200,80,.5)'}
            else if(sn){bg='radial-gradient(circle,rgba(180,60,20,.18),transparent)';bdr='rgba(180,60,20,.35)'}
            else if(ld){bg='radial-gradient(circle,rgba(200,160,60,.14),transparent)';bdr='rgba(200,160,60,.25)'}
            else if(dl){bg='radial-gradient(circle,rgba(120,80,180,.15),transparent)';bdr='rgba(140,100,200,.3)'}
            if(isPulsed)bg=`${rc}30`;
            return(
              <div key={num} style={{
                aspectRatio:'1',background:bg,
                border:`0.5px solid ${bdr}`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                position:'relative',transition:'background .4s',
                boxShadow:highlight===num?`0 0 8px ${rc}80`:'none',
              }}>
                <span style={{position:'absolute',top:1,left:1.5,fontSize:5,color:`${rc}70`,fontFamily:"'Cinzel',serif"}}>{num}</span>
                {mk&&<span style={{fontSize:9,animation:'mp 3s ease infinite',color:'#f0d050'}}>ॐ</span>}
                {sn&&<span style={{fontSize:8,lineHeight:1}}>𓆙</span>}
                {ld&&<span style={{fontSize:8,lineHeight:1}}>🪔</span>}
                {dl&&!sn&&!ld&&<span style={{fontSize:7,lineHeight:1}}>⚖</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:14,fontSize:8,letterSpacing:2,color:'#5a4a30',marginTop:4,flexWrap:'wrap',justifyContent:'center'}}>
        <span style={{color:'#e06030'}}>𓆙 NĀGA</span>
        <span style={{color:'#f0d050'}}>🪔 VIRTUE</span>
        <span style={{color:'#c8a0f0'}}>⚖ DHARMA</span>
        <span style={{color:'#f0d050'}}>ॐ MOKSHA</span>
      </div>

      {/* Event label */}
      {ladderFlash&&<div style={{fontSize:9,color:'#80c080',animation:'fadeIn .3s ease',letterSpacing:2,textAlign:'center'}}>🪔 VIRTUE LIFTS · +22 sq · +1 Punya</div>}
      {snakeFlash&&<div style={{fontSize:9,color:'#e06030',animation:'fadeIn .3s ease',letterSpacing:2,textAlign:'center'}}>𓆙 SERPENT BITES · −18 sq · +2 Papa</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DICE STAGE — 3D karma die + narration-synced graha showcase
// Graha order matches the spoken narration exactly:
//   Surya→Chandra→Mangal→Budh→Brihaspati→Shukra→Shani→Rahu→Ketu
// Each graha is highlighted and held until narration moves to the next one.
// ═══════════════════════════════════════════════════════════════════════

// Approximate spoken duration (ms) per graha segment at slow narrator pace
// Tuned to match the English narration script for story page 2.
const GRAHA_NARRATE_TIMING = [
  // [grahaIndex, holdDurationMs]
  // Intro "Every turn ... living god..." — show karma die only (grahaIdx = -1)
  [-1, 9000],   // 0–9s  : intro, no planet highlighted
  [0,  5500],   // Surya — "+2 extra steps"
  [1,  4500],   // Chandra — "purifies with Punya"
  [2,  6500],   // Mangal — "battle fury, pushing rival back"
  [3,  5000],   // Budh — "swaps your position"
  [4,  4500],   // Brihaspati — "blesses everyone"
  [5,  5000],   // Shukra — "divine Shield"
  [6,  5500],   // Shani — "back 3 squares, Papa"
  [7,  5000],   // Rahu — "steals from leader"
  [8,  4500],   // Ketu — "strips all shields"
];

function DiceStage({ GRAHA_INFO, chosenLang, isNarrating, narrateStartedAt }) {
  const [karmaDie, setKarmaDie] = useState(4);
  const [grahaIdx, setGrahaIdx] = useState(-1); // -1 = intro (no planet)
  const [showEffect, setShowEffect] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [narrateStep, setNarrateStep] = useState(0);
  const narrateRef = useRef(null);
  const idleRef = useRef(null);

  // ── Narration-sync mode ──────────────────────────────────────────────
  const startNarrateSequence = () => {
    let step = 0;
    setGrahaIdx(GRAHA_NARRATE_TIMING[0][0]);
    setShowEffect(GRAHA_NARRATE_TIMING[0][0] >= 0);
    setNarrateStep(0);

    const advance = () => {
      step++;
      if (step >= GRAHA_NARRATE_TIMING.length) {
        // Loop from Surya again
        step = 1;
      }
      const [gi, dur] = GRAHA_NARRATE_TIMING[step];
      setGrahaIdx(gi);
      setShowEffect(gi >= 0);
      setNarrateStep(step);
      // Roll karma die on each new planet
      if (gi >= 0) setKarmaDie(Math.floor(Math.random() * 6) + 1);
      narrateRef.current = setTimeout(advance, dur);
    };

    narrateRef.current = setTimeout(advance, GRAHA_NARRATE_TIMING[0][1]);
  };

  // ── Idle / manual mode ───────────────────────────────────────────────
  const handleRoll = () => {
    if (isNarrating) return; // don't let manual roll interrupt narration sync
    clearTimeout(idleRef.current);
    setRolling(true);
    setShowEffect(false);
    setTimeout(() => {
      setKarmaDie(Math.floor(Math.random() * 6) + 1);
      setGrahaIdx(g => (g + 1) % 9);
      setRolling(false);
      setTimeout(() => setShowEffect(true), 150);
    }, 440);
    // Resume idle after 6s
    idleRef.current = setTimeout(() => {
      idleRef.current = setInterval(() => {
        setKarmaDie(Math.floor(Math.random() * 6) + 1);
        setGrahaIdx(g => (g + 1) % 9);
        setShowEffect(true);
      }, 3500);
    }, 6000);
  };

  useEffect(() => {
    clearTimeout(narrateRef.current);
    clearInterval(narrateRef.current);
    clearTimeout(idleRef.current);
    clearInterval(idleRef.current);

    if (isNarrating && narrateStartedAt) {
      // Audio just started — begin graha sync sequence NOW
      startNarrateSequence();
    } else if (!isNarrating) {
      // Idle auto-cycle every 3.5s
      setGrahaIdx(0); setShowEffect(true);
      idleRef.current = setInterval(() => {
        setKarmaDie(Math.floor(Math.random() * 6) + 1);
        setGrahaIdx(g => (g + 1) % 9);
        setShowEffect(true);
      }, 3500);
    }
    // if isNarrating but narrateStartedAt is null → loading, don't start yet

    return () => {
      clearTimeout(narrateRef.current);
      clearInterval(narrateRef.current);
      clearTimeout(idleRef.current);
      clearInterval(idleRef.current);
    };
  }, [isNarrating, narrateStartedAt]);

  const DIE_DOTS = {
    1: [[50,50]],
    2: [[28,28],[72,72]],
    3: [[28,28],[50,50],[72,72]],
    4: [[28,28],[72,28],[28,72],[72,72]],
    5: [[28,28],[72,28],[50,50],[28,72],[72,72]],
    6: [[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]],
  };

  const g = grahaIdx >= 0 ? GRAHA_INFO[grahaIdx] : null;
  const typeColor = !g ? '#8a7a50' : g.type==='blessing'?'#80c080':g.type==='curse'?'#e06030':'#b0a0d0';
  const typeBg    = !g ? 'transparent' : g.type==='blessing'?'rgba(80,200,80,.1)':g.type==='curse'?'rgba(200,80,40,.1)':'rgba(160,120,200,.1)';
  const typeLabel = !g ? '' : g.type==='blessing'?'✦ Blessing':g.type==='curse'?'✦ Curse':'✦ Chaos';
  const grahaColor = g ? g.color : 'rgba(200,160,60,.2)';

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,userSelect:'none'}}>
      {/* Tap hint */}
      <div style={{fontSize:9,letterSpacing:4,color:'#5a4a30',cursor:isNarrating?'default':'pointer'}}
        onClick={handleRoll}>
        {isNarrating ? 'NARRATION SYNC ACTIVE' : 'TAP TO ROLL'}
      </div>

      {/* Dice row */}
      <div style={{display:'flex',gap:24,alignItems:'center',justifyContent:'center'}}>

        {/* ── Karma Die ── */}
        <div onClick={handleRoll} style={{cursor:isNarrating?'default':'pointer',
          transition:'transform .2s',transform:rolling?'scale(.88) rotate(18deg)':'scale(1)'}}>
          <svg width={72} height={72} viewBox="0 0 100 100"
            style={{filter:'drop-shadow(0 4px 16px rgba(240,200,80,.2))'}}>
            <defs>
              <linearGradient id="df2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(42,34,16,.97)"/>
                <stop offset="100%" stopColor="rgba(22,16,6,.99)"/>
              </linearGradient>
            </defs>
            <rect x={3} y={3} width={94} height={94} rx={18} fill="url(#df2)"
              stroke="rgba(240,200,80,.35)" strokeWidth={2}/>
            <rect x={9} y={5} width={82} height={18} rx={8} fill="rgba(255,255,255,.04)"/>
            {(DIE_DOTS[karmaDie]||[]).map(([cx,cy],i)=>(
              <circle key={i} cx={cx} cy={cy} r={7.5} fill="#f0d050"
                style={{filter:'drop-shadow(0 0 5px rgba(240,200,80,.7))'}}/>
            ))}
          </svg>
          <div style={{textAlign:'center',fontSize:8,color:'rgba(240,200,80,.45)',letterSpacing:2,marginTop:4}}>KARMA</div>
        </div>

        {/* Plus */}
        <div style={{fontSize:20,color:'rgba(200,160,60,.18)',fontWeight:700}}>+</div>

        {/* ── Graha Die ── */}
        <div onClick={handleRoll} style={{cursor:isNarrating?'default':'pointer',
          transition:'transform .2s',transform:rolling?'scale(.88) rotate(-18deg)':'scale(1)'}}>
          <div style={{
            width:72,height:72,
            background: g
              ? `radial-gradient(circle at 35% 35%,${g.color}35,rgba(10,8,5,.96))`
              : 'radial-gradient(circle at 35% 35%,rgba(200,160,60,.08),rgba(10,8,5,.96))',
            border:`2.5px solid ${grahaColor}60`,
            borderRadius:16,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:34,
            boxShadow: g
              ? `0 0 28px ${g.color}35,inset 0 0 24px rgba(0,0,0,.5),0 0 0 1px ${g.color}20`
              : 'inset 0 0 20px rgba(0,0,0,.4)',
            transition:'all .5s cubic-bezier(.4,0,.2,1)',
            position:'relative',overflow:'hidden',
          }}>
            {/* Spinning orbit ring — only when a planet is active */}
            {g && <div style={{
              position:'absolute',inset:-6,
              border:`1.5px solid ${g.color}30`,
              borderRadius:'50%',
              animation:'cymaticRotate 3s linear infinite',
            }}/>}
            {/* Planet icon with entrance anim */}
            <span key={grahaIdx} style={{
              position:'relative',zIndex:1,
              animation: g ? 'fadeIn .4s ease' : 'none',
              fontSize: g ? 34 : 20,
            }}>
              {g ? g.icon : '🌌'}
            </span>
          </div>
          <div style={{textAlign:'center',fontSize:8,color:`${grahaColor}80`,letterSpacing:2,marginTop:4,transition:'color .5s'}}>
            {g ? g.skt : 'GRAHA'}
          </div>
        </div>
      </div>

      {/* ── Planet 9-dot selector (only in idle) ── */}
      {!isNarrating && (
        <div style={{display:'flex',justifyContent:'center',gap:5,flexWrap:'wrap',maxWidth:280}}>
          {GRAHA_INFO.map((gi,i)=>(
            <div key={i}
              onClick={()=>{setGrahaIdx(i);setShowEffect(true);setKarmaDie(Math.floor(Math.random()*6)+1)}}
              title={gi.name}
              style={{
                width:i===grahaIdx?28:18,height:18,borderRadius:9,
                background:i===grahaIdx?gi.color:`${gi.color}28`,
                cursor:'pointer',transition:'all .3s',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:9,
              }}>
              {i===grahaIdx?gi.icon:''}
            </div>
          ))}
        </div>
      )}

      {/* ── Effect card ── */}
      <div style={{
        width:'100%',maxWidth:300,
        background: showEffect && g ? `${g.color}0e` : 'transparent',
        border: showEffect && g ? `1px solid ${g.color}40` : '1px solid transparent',
        borderRadius:12,
        padding: showEffect && g ? '14px 16px' : '0 16px',
        transition:'all .55s cubic-bezier(.34,1.56,.64,1)',
        opacity: showEffect && g ? 1 : 0,
        transform: showEffect && g ? 'translateY(0) scale(1)' : 'translateY(10px) scale(.97)',
        textAlign:'center',
        boxShadow: showEffect && g ? `0 0 32px ${g.color}15` : 'none',
        overflow:'hidden',
        maxHeight: showEffect && g ? 140 : 0,
      }}>
        {g && <>
          <div style={{fontSize:13,fontFamily:"'Noto Serif Devanagari',serif",color:g.color,fontWeight:700}}>
            {g.skt} &nbsp;·&nbsp;
            <span style={{fontFamily:"'Cinzel',serif",fontSize:11,opacity:.85}}>
              {g.name.replace(' — ','').replace(g.skt,'').trim()}
            </span>
          </div>
          <div style={{fontSize:11,color:'#c0b080',marginTop:6,lineHeight:1.7}}>{g.effect}</div>
          <div style={{marginTop:8}}>
            <span style={{fontSize:9,padding:'2px 10px',borderRadius:10,background:typeBg,color:typeColor,border:`1px solid ${typeColor}30`}}>
              {typeLabel}
            </span>
          </div>
        </>}
      </div>

      {/* Move summary */}
      {showEffect && g && (
        <div style={{fontSize:10,color:'rgba(240,200,80,.35)',letterSpacing:1,animation:'fadeIn .5s ease',textAlign:'center'}}>
          Roll <strong style={{color:'#f0d050'}}>{karmaDie}</strong> square{karmaDie!==1?'s':''} &nbsp;+&nbsp; {g.icon} {g.name.split('—')[0].trim()} effect
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DHARMA STAGE — cinematic moral choice experience
// Shows: the dilemma → player chooses → consequence plays out visually
// The balance scale animates, token moves, karma shifts in real time
// ═══════════════════════════════════════════════════════════════════════
function DharmaStage() {
  const CARDS=[
    {skt:"कर्णकवच",en:"Karna's Armour",era:"Mahabharata",
     story:"The god Indra disguises as a beggar. He begs Karna for his divine armour — the one that makes him invincible. Karna knew it was Indra. Knew it meant death. He gave it away with a smile.",
     punya:{l:"🙏 Give the armour",sub:"Honour above survival",karma:4,sq:-5,color:"#80c080"},
     papa:{l:"💀 Keep the armour",sub:"Survival above honour",karma:3,sq:8,color:"#e06030"}},
    {skt:"द्रौपदीवस्त्र",en:"Draupadi's Shame",era:"Mahabharata",
     story:"In the royal court, Dushasana drags Draupadi by her hair. Bhishma, Drona, every elder — silent. Speaking costs you exile. Silence costs your soul.",
     punya:{l:"🙏 Speak against the king",sub:"Exile for righteousness",karma:4,sq:-8,color:"#80c080"},
     papa:{l:"💀 Stay silent",sub:"Complicit in adharma",karma:3,sq:6,color:"#e06030"}},
    {skt:"कर्मचारी",en:"The Whistleblower",era:"Modern Life",
     story:"Your company dumps toxins in a river. Children are sick. You have proof. If you leak it — you lose your job, your parents lose support. If you stay silent — the poisoning continues.",
     punya:{l:"🙏 Blow the whistle",sub:"Truth at personal cost",karma:5,sq:0,color:"#80c080"},
     papa:{l:"💀 Stay silent",sub:"Protect your family",karma:4,sq:10,color:"#e06030"}},
    {skt:"एकलव्य",en:"Eklavya's Thumb",era:"Mahabharata",
     story:"Dronacharya demands your right thumb as payment for the archery you taught yourself. Giving it destroys your greatest skill. But to refuse is to deny your guru.",
     punya:{l:"🙏 Give the thumb",sub:"Devotion above all",karma:4,sq:-5,color:"#80c080"},
     papa:{l:"💀 Refuse the guru",sub:"Keep your power",karma:3,sq:7,color:"#e06030"}},
  ];

  const [cardIdx,setCardIdx]=useState(0);
  const [phase,setPhase]=useState('reveal'); // reveal → question → chosen → consequence → next
  const [chosen,setChosen]=useState(null);
  const [tokenSq,setTokenSq]=useState(28);
  const [punya,setPunya]=useState(8);
  const [papa,setPapa]=useState(4);
  const [shake,setShake]=useState(false);
  const [glowSide,setGlowSide]=useState(null); // 'punya'|'papa'
  const timerRef=useRef(null);

  const card=CARDS[cardIdx];

  // Auto-reveal on mount and card change
  useEffect(()=>{
    setPhase('reveal');
    const t=setTimeout(()=>setPhase('question'),1200);
    return()=>clearTimeout(t);
  },[cardIdx]);

  const choose=(side)=>{
    if(phase!=='question')return;
    const c=card[side];
    setChosen(side);
    setGlowSide(side);
    setPhase('chosen');

    // Animate consequence
    setTimeout(()=>{
      setPhase('consequence');
      setShake(true);
      setTimeout(()=>setShake(false),600);
      setTokenSq(sq=>Math.max(1,Math.min(99,sq+c.sq)));
      if(side==='punya') setPunya(p=>Math.min(30,p+c.karma));
      else setPapa(p=>Math.min(30,p+c.karma));
    },800);

    // Auto-advance to next card
    setTimeout(()=>{
      setChosen(null);setGlowSide(null);
      setCardIdx(i=>(i+1)%CARDS.length);
    },3800);

    return()=>clearTimeout(timerRef.current);
  };

  const total=Math.max(punya+papa,1);
  const punyaPct=(punya/total)*100;
  const isPure=punya>=papa;
  const realmOf=n=>n<=33?{name:'भूलोक',c:'#8a6030'}:n<=66?{name:'अन्तर्लोक',c:'#5a80a0'}:{name:'स्वर्गलोक',c:'#9070c0'};
  const realm=realmOf(tokenSq);

  return(
    <div style={{display:'flex',flexDirection:'column',gap:14,width:'100%'}}>

      {/* ── TOP: Karma scale + token position ── */}
      <div style={{
        display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:10,
        background:'rgba(8,6,3,.7)',border:'1px solid rgba(200,160,60,.1)',
        borderRadius:12,padding:'14px 16px',alignItems:'center',
      }}>
        {/* Punya side */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:9,letterSpacing:3,color:'#f0d050',marginBottom:6,fontFamily:"'Cinzel',serif"}}>पुण्य</div>
          <div style={{fontSize:28,fontWeight:900,color:'#f0d050',fontFamily:"'Cinzel',serif",
            transition:'all .8s cubic-bezier(.34,1.56,.64,1)',
            textShadow:glowSide==='punya'?'0 0 20px #f0d050,0 0 40px rgba(240,200,80,.6)':'none'}}>{punya}</div>
          <div style={{height:4,background:'rgba(200,160,60,.1)',borderRadius:2,overflow:'hidden',marginTop:6}}>
            <div style={{height:'100%',background:'linear-gradient(90deg,#f0d050,#80c080)',borderRadius:2,width:`${punyaPct}%`,transition:'width .8s cubic-bezier(.4,0,.2,1)'}}/>
          </div>
        </div>

        {/* Balance scale SVG */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
          <svg width={48} height={56} viewBox="0 0 48 56">
            {/* Fulcrum */}
            <line x1={24} y1={8} x2={24} y2={48} stroke="rgba(200,160,60,.4)" strokeWidth={1.5}/>
            <polygon points="18,48 30,48 24,52" fill="rgba(200,160,60,.35)"/>
            {/* Beam — tilts based on balance */}
            <line
              x1={4} y1={isPure?12:16} x2={44} y2={isPure?16:12}
              stroke={isPure?"#80c080":"#e06030"} strokeWidth={2}
              style={{transition:'all .8s cubic-bezier(.4,0,.2,1)'}}/>
            {/* Left pan (punya) */}
            <ellipse cx={4} cy={isPure?16:20} rx={6} ry={2} fill="rgba(80,200,80,.25)" stroke="#80c080" strokeWidth={.8}
              style={{transition:'all .8s'}}/>
            {/* Right pan (papa) */}
            <ellipse cx={44} cy={isPure?20:16} rx={6} ry={2} fill="rgba(200,80,60,.2)" stroke="#e06030" strokeWidth={.8}
              style={{transition:'all .8s'}}/>
          </svg>
          <div style={{fontSize:8,letterSpacing:2,color:isPure?'#80c080':'#e06030',textAlign:'center',transition:'color .5s'}}>
            {isPure?'PURE':'IMPURE'}
          </div>
        </div>

        {/* Papa side */}
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:9,letterSpacing:3,color:'#e06030',marginBottom:6,fontFamily:"'Cinzel',serif"}}>पाप</div>
          <div style={{fontSize:28,fontWeight:900,color:'#e06030',fontFamily:"'Cinzel',serif",
            transition:'all .8s cubic-bezier(.34,1.56,.64,1)',
            textShadow:glowSide==='papa'?'0 0 20px #e06030,0 0 40px rgba(200,80,40,.6)':'none'}}>{papa}</div>
          <div style={{height:4,background:'rgba(200,80,60,.1)',borderRadius:2,overflow:'hidden',marginTop:6}}>
            <div style={{height:'100%',background:'linear-gradient(90deg,#e06030,#a03020)',borderRadius:2,width:`${100-punyaPct}%`,transition:'width .8s cubic-bezier(.4,0,.2,1)'}}/>
          </div>
        </div>
      </div>

      {/* Token position strip */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 14px',background:'rgba(8,6,3,.5)',border:'1px solid rgba(200,160,60,.08)',borderRadius:8}}>
        {/* Mini progress bar */}
        <div style={{flex:1,height:6,background:'rgba(200,160,60,.08)',borderRadius:3,overflow:'visible',position:'relative'}}>
          <div style={{
            position:'absolute',left:0,top:0,height:'100%',
            width:`${(tokenSq/100)*100}%`,
            background:`linear-gradient(90deg,${realm.c}60,${realm.c})`,
            borderRadius:3,transition:'width 1s cubic-bezier(.34,1.56,.64,1)',
          }}/>
          {/* Token dot */}
          <div style={{
            position:'absolute',top:'50%',transform:'translate(-50%,-50%)',
            left:`${(tokenSq/100)*100}%`,
            width:14,height:14,borderRadius:'50%',
            background:`radial-gradient(circle at 35% 30%,${realm.c},${realm.c}50)`,
            border:`2px solid ${realm.c}`,
            boxShadow:`0 0 8px ${realm.c}80`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:7,transition:'left 1s cubic-bezier(.34,1.56,.64,1)',
            animation:shake?'diceRoll .5s ease':'none',
          }}>🔱</div>
        </div>
        <div style={{fontSize:9,color:realm.c,letterSpacing:2,whiteSpace:'nowrap',minWidth:80,textAlign:'right',transition:'color .5s'}}>
          Sq {tokenSq} · {realm.name}
        </div>
      </div>

      {/* ── DILEMMA CARD ── */}
      <div style={{
        background:'rgba(160,200,224,.04)',
        border:`1.5px solid ${phase==='reveal'?'rgba(160,200,224,.1)':'rgba(160,200,224,.22)'}`,
        borderRadius:12,overflow:'hidden',
        transition:'all .5s',
        boxShadow:phase==='question'?'0 0 40px rgba(160,200,224,.06)':'none',
      }}>
        {/* Card header */}
        <div style={{padding:'14px 16px 10px',borderBottom:'1px solid rgba(160,200,224,.08)',
          background:'rgba(160,200,224,.03)'}}>
          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:6}}>
            <span style={{fontSize:20}}>⚖</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontFamily:"'Noto Serif Devanagari',serif",color:'#a0c8e0',fontWeight:700}}>{card.skt}</div>
              <div style={{fontSize:10,color:'#5a7080',letterSpacing:2}}>{card.en} · {card.era}</div>
            </div>
            <div style={{fontSize:8,padding:'2px 8px',borderRadius:10,background:'rgba(160,200,224,.06)',
              border:'1px solid rgba(160,200,224,.12)',color:'#5a7080',letterSpacing:2}}>
              {cardIdx+1}/{CARDS.length}
            </div>
          </div>
          <div style={{
            fontSize:11,color:'#c0b080',lineHeight:1.8,fontStyle:'italic',
            opacity:phase==='reveal'?0:1,transition:'opacity .6s',
          }}>
            {card.story}
          </div>
        </div>

        {/* Choices */}
        <div style={{padding:'12px 14px',display:'flex',gap:10,flexWrap:'wrap'}}>
          {/* Punya choice */}
          <button
            disabled={phase!=='question'}
            onClick={()=>choose('punya')}
            style={{
              flex:'1 1 140px',
              background:chosen==='punya'?'rgba(80,200,80,.15)':phase==='consequence'&&chosen!=='punya'?'rgba(10,8,5,.3)':'rgba(80,200,80,.05)',
              border:`1.5px solid ${chosen==='punya'?'rgba(80,200,80,.5)':'rgba(80,200,80,.18)'}`,
              borderRadius:10,padding:'12px 12px',cursor:phase==='question'?'pointer':'default',
              textAlign:'center',transition:'all .4s cubic-bezier(.34,1.56,.64,1)',
              transform:chosen==='punya'?'scale(1.03)':'scale(1)',
              opacity:phase==='consequence'&&chosen!=='punya'?0.35:1,
              boxShadow:chosen==='punya'?'0 0 20px rgba(80,200,80,.15)':'none',
            }}
            onMouseEnter={e=>{if(phase==='question'){e.currentTarget.style.background='rgba(80,200,80,.12)';e.currentTarget.style.transform='translateY(-2px) scale(1.01)'}}}
            onMouseLeave={e=>{if(phase==='question'){e.currentTarget.style.background='rgba(80,200,80,.05)';e.currentTarget.style.transform='scale(1)'}}}
          >
            <div style={{fontSize:11,color:'#80c080',fontWeight:700,fontFamily:"'Cinzel',serif",marginBottom:4}}>{card.punya.l}</div>
            <div style={{fontSize:9,color:'#5a8060',letterSpacing:1}}>{card.punya.sub}</div>
            <div style={{fontSize:9,color:'rgba(80,200,80,.6)',marginTop:6,letterSpacing:1}}>+{card.punya.karma} Punya · {card.punya.sq<0?`Back ${Math.abs(card.punya.sq)}`:'Skip'} sq</div>
          </button>

          {/* Papa choice */}
          <button
            disabled={phase!=='question'}
            onClick={()=>choose('papa')}
            style={{
              flex:'1 1 140px',
              background:chosen==='papa'?'rgba(200,80,40,.15)':phase==='consequence'&&chosen!=='papa'?'rgba(10,8,5,.3)':'rgba(200,80,40,.05)',
              border:`1.5px solid ${chosen==='papa'?'rgba(200,80,40,.5)':'rgba(200,80,40,.18)'}`,
              borderRadius:10,padding:'12px 12px',cursor:phase==='question'?'pointer':'default',
              textAlign:'center',transition:'all .4s cubic-bezier(.34,1.56,.64,1)',
              transform:chosen==='papa'?'scale(1.03)':'scale(1)',
              opacity:phase==='consequence'&&chosen!=='papa'?0.35:1,
              boxShadow:chosen==='papa'?'0 0 20px rgba(200,80,40,.15)':'none',
            }}
            onMouseEnter={e=>{if(phase==='question'){e.currentTarget.style.background='rgba(200,80,40,.12)';e.currentTarget.style.transform='translateY(-2px) scale(1.01)'}}}
            onMouseLeave={e=>{if(phase==='question'){e.currentTarget.style.background='rgba(200,80,40,.05)';e.currentTarget.style.transform='scale(1)'}}}
          >
            <div style={{fontSize:11,color:'#e06030',fontWeight:700,fontFamily:"'Cinzel',serif",marginBottom:4}}>{card.papa.l}</div>
            <div style={{fontSize:9,color:'#80503a',letterSpacing:1}}>{card.papa.sub}</div>
            <div style={{fontSize:9,color:'rgba(200,80,40,.6)',marginTop:6,letterSpacing:1}}>+{card.papa.karma} Papa · Advance {card.papa.sq} sq</div>
          </button>
        </div>

        {/* Consequence reveal */}
        {phase==='consequence'&&chosen&&(
          <div style={{
            margin:'0 14px 14px',padding:'12px',
            background:chosen==='punya'?'rgba(80,200,80,.06)':'rgba(200,80,40,.06)',
            border:`1px solid ${chosen==='punya'?'rgba(80,200,80,.2)':'rgba(200,80,40,.2)'}`,
            borderRadius:8,animation:'fadeIn .4s ease',textAlign:'center',
          }}>
            <div style={{fontSize:16,marginBottom:4}}>{chosen==='punya'?'🙏':'💀'}</div>
            <div style={{fontSize:12,color:chosen==='punya'?'#80c080':'#e06030',fontWeight:700,letterSpacing:1}}>
              {chosen==='punya'?`+${card.punya.karma} Punya · ${card.punya.sq<0?`Back ${Math.abs(card.punya.sq)} squares`:'Turn skipped'}`:`+${card.papa.karma} Papa · Advance ${card.papa.sq} squares`}
            </div>
            <div style={{fontSize:9,color:'#5a4a30',marginTop:4,letterSpacing:2}}>
              {chosen==='punya'?'DHARMIC PATH CHOSEN':'ADHARMIC PATH CHOSEN'}
            </div>
          </div>
        )}
      </div>

      {/* Moksha gate status */}
      <div style={{
        textAlign:'center',padding:'8px',
        background:isPure?'rgba(80,200,80,.04)':'rgba(200,80,40,.04)',
        border:`1px solid ${isPure?'rgba(80,200,80,.12)':'rgba(200,80,40,.12)'}`,
        borderRadius:8,transition:'all .5s',
      }}>
        <div style={{fontSize:10,color:isPure?'#80c080':'#e06030',letterSpacing:2,fontFamily:"'Cinzel',serif"}}>
          {isPure?`✓ Moksha Gate OPEN — Punya (${punya}) ≥ Papa (${papa})`:`✗ Moksha Gate CLOSED — Papa (${papa}) > Punya (${punya})`}
        </div>
        {!isPure&&<div style={{fontSize:9,color:'#5a4a30',marginTop:3,letterSpacing:1}}>If you reach sq 108 like this, Yama casts you back to square 67</div>}
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SACRED PATH STAGE — cinematic Ashtanga gate ascension
// ═══════════════════════════════════════════════════════════════════════
function SacredPathStage({SACRED_PATH}) {
  const [active,setActive]=useState(0);
  const [entering,setEntering]=useState(false);
  const timerRef=useRef(null);

  useEffect(()=>{
    timerRef.current=setInterval(()=>{
      setEntering(true);
      setTimeout(()=>{
        setActive(a=>(a+1)%8);
        setEntering(false);
      },300);
    },2600);
    return()=>clearInterval(timerRef.current);
  },[]);

  const sq=SACRED_PATH[active];
  const isMoksha=sq.num===108;
  const STEP_COLORS=['#a0c8e0','#f0b840','#80c0a0','#c0a0e0','#e0c080','#d0a0c0','#90c0b0','#f0d050'];
  const sc=STEP_COLORS[active];

  const RIDGE_DESCS=[
    "The first gate. Restrain the senses. Still the mind. Without Yama, no gate opens.",
    "Daily practice. Sacred rituals. Without Niyama, discipline dissolves.",
    "The body as temple. Perfect stillness. Without Asana, the mind cannot settle.",
    "Breath is the bridge. Expand the life-force. Pranayama opens every other gate.",
    "Withdraw the senses. Turn the gaze inward. Without Pratyahara, distractions rule.",
    "Single-pointed focus. The laser of consciousness. Dharana burns through illusion.",
    "The stream flows unbroken. Thought dissolves into awareness. Dhyana is the door.",
    "The wheel of Samsara stops. You are free. Moksha — the only goal.",
  ];

  return(
    <div style={{display:'flex',flexDirection:'column',gap:12,width:'100%'}}>

      {/* Gate path — horizontal scroll of 8 gates */}
      <div style={{position:'relative',padding:'8px 4px 4px'}}>
        {/* Connecting path line */}
        <div style={{
          position:'absolute',top:'50%',left:16,right:16,height:2,
          background:'linear-gradient(90deg,rgba(200,160,60,.08),rgba(200,160,60,.15),rgba(200,160,60,.08))',
          zIndex:0,
        }}/>
        <div style={{display:'flex',gap:4,position:'relative',zIndex:1}}>
          {SACRED_PATH.slice(0,8).map((s,i)=>{
            const isAct=i===active;
            const isDone=i<active;
            const c=STEP_COLORS[i];
            return(
              <div key={i}
                onClick={()=>{clearInterval(timerRef.current);setActive(i)}}
                style={{
                  flex:isAct?'0 0 auto':'1',
                  display:'flex',flexDirection:'column',alignItems:'center',gap:2,
                  cursor:'pointer',
                  padding:isAct?'8px 10px':'6px 4px',
                  background:isAct?`${c}15`:isDone?'rgba(200,160,60,.04)':'transparent',
                  border:`1px solid ${isAct?`${c}50`:isDone?`${c}18`:'transparent'}`,
                  borderRadius:10,
                  transition:'all .4s cubic-bezier(.34,1.56,.64,1)',
                  boxShadow:isAct?`0 0 16px ${c}20`:'none',
                }}>
                <div style={{
                  fontSize:isAct?22:14,
                  filter:isAct?`drop-shadow(0 0 6px ${c})`:'none',
                  opacity:isAct?1:isDone?0.7:0.3,
                  transition:'all .4s',
                }}>{s.icon}</div>
                {isAct&&<div style={{fontSize:7,color:c,fontFamily:"'Cinzel',serif",letterSpacing:1,whiteSpace:'nowrap',fontWeight:700}}>
                  {s.en}
                </div>}
                {isDone&&!isAct&&<div style={{width:6,height:2,borderRadius:1,background:`${c}50`}}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main gate card */}
      <div style={{
        background:`radial-gradient(ellipse at 50% 0%,${sc}10,rgba(8,6,3,.7) 60%)`,
        border:`2px solid ${sc}30`,borderRadius:16,
        padding:'24px 20px',textAlign:'center',
        transition:'border-color .5s,box-shadow .5s',
        boxShadow:`0 0 40px ${sc}10,inset 0 0 40px rgba(0,0,0,.3)`,
        position:'relative',overflow:'hidden',
        opacity:entering?0:1,
        transform:entering?'translateY(8px)':'translateY(0)',
        transition:'opacity .3s ease,transform .3s ease,border-color .5s,box-shadow .5s',
      }}>
        {/* Background mandala */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',opacity:.04}} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
          <circle cx={100} cy={60} r={50} fill="none" stroke={sc} strokeWidth={.8}/>
          <circle cx={100} cy={60} r={35} fill="none" stroke={sc} strokeWidth={.6}/>
          <circle cx={100} cy={60} r={20} fill="none" stroke={sc} strokeWidth={.5}/>
          {[0,45,90,135,180,225,270,315].map(a=>(
            <line key={a}
              x1={100+50*Math.cos(a*Math.PI/180)} y1={60+50*Math.sin(a*Math.PI/180)}
              x2={100+20*Math.cos(a*Math.PI/180)} y2={60+20*Math.sin(a*Math.PI/180)}
              stroke={sc} strokeWidth={.4}/>
          ))}
        </svg>

        {/* Gate number */}
        <div style={{fontSize:8,letterSpacing:5,color:sc,opacity:.5,marginBottom:8,fontFamily:"'Cinzel',serif"}}>
          GATE {active+1} OF 8 &nbsp;·&nbsp; SQUARE {sq.num}
        </div>

        {/* Icon */}
        <div style={{
          fontSize:48,marginBottom:12,
          filter:`drop-shadow(0 0 16px ${sc}) drop-shadow(0 0 32px ${sc}50)`,
          animation:'pulse 2.5s ease infinite',
        }}>{sq.icon}</div>

        {/* Names */}
        <div style={{fontSize:24,fontFamily:"'Noto Serif Devanagari',serif",color:sc,fontWeight:700,marginBottom:4,
          textShadow:`0 0 20px ${sc}50`}}>{sq.skt}</div>
        <div style={{fontSize:16,color:'#e8c850',fontFamily:"'Cinzel',serif",letterSpacing:4,marginBottom:12}}>{sq.en}</div>
        <div style={{fontSize:11,color:'#8a7a50',letterSpacing:1,fontStyle:'italic',lineHeight:1.7,maxWidth:360,margin:'0 auto'}}>
          {RIDGE_DESCS[active]}
        </div>

        {/* Special badges */}
        {sq.num===107&&(
          <div style={{
            marginTop:14,display:'inline-flex',alignItems:'center',gap:8,
            padding:'6px 14px',borderRadius:20,
            background:'rgba(240,180,60,.08)',border:'1px solid rgba(240,180,60,.25)',
          }}>
            <span style={{fontSize:14}}>🚪</span>
            <span style={{fontSize:9,color:'#f0b840',letterSpacing:2}}>ROLL EXACT 1 TO ENTER MOKSHA</span>
          </div>
        )}
        {isMoksha&&(
          <div style={{marginTop:14}}>
            <div style={{fontSize:36,animation:'mp 3s ease infinite',color:'#f0d050',
              filter:'drop-shadow(0 0 20px rgba(240,200,80,.8))'}}>ॐ</div>
            <div style={{fontSize:10,letterSpacing:4,color:'rgba(240,200,80,.5)',marginTop:4}}>LIBERATION · MOKSHA · मोक्ष</div>
          </div>
        )}
      </div>

      {/* Step progress dots */}
      <div style={{display:'flex',gap:6,justifyContent:'center',alignItems:'center'}}>
        {SACRED_PATH.slice(0,8).map((_,i)=>(
          <div key={i}
            onClick={()=>{clearInterval(timerRef.current);setActive(i)}}
            style={{
              width:i===active?28:8,height:8,borderRadius:4,cursor:'pointer',
              background:i===active?STEP_COLORS[i]:i<active?`${STEP_COLORS[i]}50`:'rgba(200,160,60,.08)',
              boxShadow:i===active?`0 0 8px ${STEP_COLORS[i]}80`:'none',
              transition:'all .4s cubic-bezier(.34,1.56,.64,1)',
          }}/>
        ))}
      </div>

      {/* Navagraha reminder */}
      <div style={{
        textAlign:'center',padding:'8px 14px',
        background:'rgba(240,200,80,.03)',border:'1px solid rgba(240,200,80,.08)',borderRadius:8,
      }}>
        <div style={{fontSize:9,color:'rgba(240,200,80,.4)',letterSpacing:2}}>
          🌌 On the Sacred Path — no Navagraha effects · no swaps · no pushes · beyond the material world
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA'S AGRASANDHANI — The Living Cosmic Ledger
//    Real-time balance scale + quill-written entries + soul purity ring
// ══════════════════════════════════════════════════════════════════════
function ChitraguptaPanel({ entries, players, punya, papa, cur, win }) {
  const nP = players.length;
  // Compute aggregate punya/papa for balance scale
  const totalPunya = punya.reduce((a,b)=>a+b,0);
  const totalPapa  = papa.reduce((a,b)=>a+b,0);
  const total      = Math.max(totalPunya+totalPapa, 1);
  const balance    = (totalPunya-totalPapa); // positive = purer, negative = more sin
  // Scale tilt angle: max ±28deg
  const tiltDeg    = Math.max(-28, Math.min(28, -(balance/Math.max(total*.5,1))*28));
  const isShaking  = Math.abs(balance) < 3 && total > 4;
  const recent     = entries.slice(-6);

  const et = CG_ENTRY_TYPES;

  return (
    <div style={{
      background:'linear-gradient(160deg,rgba(26,18,8,.98),rgba(14,10,4,.99))',
      border:'1px solid rgba(200,175,90,.18)',borderRadius:8,
      overflow:'hidden',position:'relative',
    }}>
      {/* Parchment ruled lines */}
      <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(200,175,90,.022) 20px,rgba(200,175,90,.022) 21px)',pointerEvents:'none'}}/>

      {/* ── Header ── */}
      <div style={{padding:'8px 12px 6px',borderBottom:'1px solid rgba(200,175,90,.1)',display:'flex',alignItems:'center',gap:8,position:'relative'}}>
        {/* Quill SVG */}
        <svg width={16} height={20} viewBox="0 0 16 20" style={{flexShrink:0,filter:'drop-shadow(0 0 4px rgba(200,175,90,.6))'}}>
          <path d="M8 1 Q13 0 14 4 Q16 9 11 13 Q9 15 8 18 Q7 15 8 13 Q3 9 2 5 Q3 1 8 1Z" fill="rgba(200,175,90,.2)" stroke="rgba(200,175,90,.55)" strokeWidth=".6"/>
          <path d="M8 18 L8 13 Q11 10 12 7" fill="none" stroke="rgba(200,175,90,.6)" strokeWidth=".6"/>
          <circle cx={8} cy={18.5} r={1.3} fill="rgba(200,175,90,.7)">
            <animate attributeName="opacity" values=".4;1;.4" dur="2.2s" repeatCount="indefinite"/>
          </circle>
        </svg>
        <div style={{flex:1}}>
          <div style={{fontSize:8,letterSpacing:3,color:'rgba(200,175,90,.6)',fontFamily:"'Cinzel',serif",fontWeight:700}}>CHITRAGUPTA</div>
          <div style={{fontSize:6,color:'rgba(200,175,90,.3)',letterSpacing:2}}>अग्रसंधानी · AGRASANDHANI</div>
        </div>
        {entries.length>0&&<div style={{fontSize:7,color:'rgba(200,175,90,.2)',fontFamily:"'Cinzel',serif"}}>{entries.length} entries</div>}
      </div>

      {/* ── Balance Scale ── */}
      <div style={{padding:'10px 12px 6px',borderBottom:'1px solid rgba(200,175,90,.06)'}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:10}}>
          {/* Scale SVG */}
          <div style={{flexShrink:0,animation:isShaking?'cgScaleShake 0.3s ease infinite':'none'}}>
            <svg width={80} height={60} viewBox="0 0 80 60" style={{overflow:'visible'}}>
              {/* Fulcrum post */}
              <line x1={40} y1={10} x2={40} y2={52} stroke="rgba(200,175,90,.4)" strokeWidth={1.5}/>
              <polygon points="33,52 47,52 40,56" fill="rgba(200,175,90,.3)"/>
              {/* Top pivot circle */}
              <circle cx={40} cy={10} r={3} fill="rgba(200,175,90,.35)" stroke="rgba(200,175,90,.5)" strokeWidth=".8"/>
              {/* Beam — tilts dynamically */}
              <g style={{transformOrigin:'40px 10px',transform:`rotate(${tiltDeg}deg)`,transition:'transform 1.2s cubic-bezier(.34,1.56,.64,1)'}}>
                <line x1={4} y1={10} x2={76} y2={10} stroke={balance>=0?'rgba(80,200,80,.7)':'rgba(200,80,60,.7)'} strokeWidth={2} style={{transition:'stroke 0.8s'}}/>
                {/* Left string */}
                <line x1={4} y1={10} x2={4} y2={24} stroke="rgba(200,175,90,.35)" strokeWidth={.8}/>
                {/* Right string */}
                <line x1={76} y1={10} x2={76} y2={24} stroke="rgba(200,175,90,.35)" strokeWidth={.8}/>
                {/* Left pan (Punya) */}
                <ellipse cx={4} cy={26} rx={10} ry={3} fill="rgba(80,200,80,.15)" stroke="rgba(80,200,80,.5)" strokeWidth={.8}/>
                <text x={4} y={29.5} textAnchor="middle" fontSize={5} fill="rgba(80,200,80,.7)" fontFamily="Cinzel">पुण्य</text>
                {/* Right pan (Papa) */}
                <ellipse cx={76} cy={26} rx={10} ry={3} fill="rgba(200,80,60,.12)" stroke="rgba(200,80,60,.5)" strokeWidth={.8}/>
                <text x={76} y={29.5} textAnchor="middle" fontSize={5} fill="rgba(200,80,60,.7)" fontFamily="Cinzel">पाप</text>
              </g>
              {/* Punya weight stack */}
              {[...Array(Math.min(totalPunya,8))].map((_,i)=>(
                <rect key={i} x={-6+40-36} y={36+i*-3} width={16} height={2.5} rx={1}
                  fill={`rgba(240,200,80,${0.3+i*0.08})`}
                  style={{transformOrigin:'40px 10px',transform:`rotate(${tiltDeg}deg)`,transition:'transform 1.2s cubic-bezier(.34,1.56,.64,1)'}}/>
              ))}
              {/* Papa weight stack */}
              {[...Array(Math.min(totalPapa,8))].map((_,i)=>(
                <rect key={i} x={70} y={36+i*-3} width={16} height={2.5} rx={1}
                  fill={`rgba(200,80,60,${0.25+i*0.08})`}
                  style={{transformOrigin:'40px 10px',transform:`rotate(${tiltDeg}deg)`,transition:'transform 1.2s cubic-bezier(.34,1.56,.64,1)'}}/>
              ))}
            </svg>
          </div>
          {/* Balance readout */}
          <div style={{flex:1,paddingBottom:4}}>
            <div style={{display:'flex',gap:10,marginBottom:4}}>
              <div style={{flex:1}}>
                <div style={{fontSize:7,color:'rgba(80,200,80,.5)',letterSpacing:1,marginBottom:2}}>पुण्य</div>
                <div style={{height:4,background:'rgba(80,200,80,.08)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(totalPunya/Math.max(totalPunya+totalPapa,1))*100}%`,background:'linear-gradient(90deg,rgba(80,200,80,.4),rgba(80,200,80,.7))',borderRadius:2,transition:'width 1s cubic-bezier(.4,0,.2,1)'}}/>
                </div>
                <div style={{fontSize:9,color:'rgba(80,200,80,.7)',fontWeight:700,marginTop:1}}>{totalPunya}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:7,color:'rgba(200,80,60,.5)',letterSpacing:1,marginBottom:2}}>पाप</div>
                <div style={{height:4,background:'rgba(200,80,60,.08)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(totalPapa/Math.max(totalPunya+totalPapa,1))*100}%`,background:'linear-gradient(90deg,rgba(200,80,60,.4),rgba(200,80,60,.7))',borderRadius:2,transition:'width 1s cubic-bezier(.4,0,.2,1)'}}/>
                </div>
                <div style={{fontSize:9,color:'rgba(200,80,60,.7)',fontWeight:700,marginTop:1}}>{totalPapa}</div>
              </div>
            </div>
            <div style={{fontSize:8,color:balance>=0?'rgba(80,200,80,.5)':'rgba(200,80,60,.5)',letterSpacing:1,textAlign:'center',transition:'color 0.8s'}}>
              {isShaking?'⚖ तुला — The scales are even':balance>0?`✦ +${balance} Punya favoured`:`✦ ${Math.abs(balance)} Papa favoured`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Ledger Entries (last 5, most recent at bottom) ── */}
      <div style={{padding:'6px 10px',minHeight:40}}>
        {entries.length===0?(
          <div style={{fontSize:8,color:'rgba(200,175,90,.18)',fontStyle:'italic',letterSpacing:1,padding:'4px 2px'}}>
            The page is open. The ink waits...
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:3}}>
            {recent.map((e,i)=>{
              const t=et[e.type]||{icon:'·',color:'#a09060',bg:'rgba(200,160,60,.05)',label:'—'};
              const isNewest=i===recent.length-1;
              return(
                <div key={e.id} style={{
                  display:'flex',alignItems:'center',gap:6,
                  padding:'3px 6px',borderRadius:4,
                  background:isNewest?t.bg:'transparent',
                  border:isNewest?`1px solid ${t.color}18`:'1px solid transparent',
                  opacity:isNewest?1:0.3+(i/recent.length)*0.5,
                  animation:isNewest?'cgEntry .4s ease both':'none',
                  transition:'opacity .6s',
                }}>
                  <span style={{fontSize:9,color:t.color,flexShrink:0,filter:isNewest?`drop-shadow(0 0 3px ${t.color})`:'none'}}>{t.icon}</span>
                  <div style={{flex:1,minWidth:0,display:'flex',alignItems:'center',justifyContent:'space-between',gap:4}}>
                    <span style={{fontSize:8,color:t.color,fontFamily:"'Cinzel',serif",letterSpacing:.5,fontWeight:isNewest?700:400}}>{t.label}</span>
                    <span style={{fontSize:7,color:'rgba(200,175,90,.3)',whiteSpace:'nowrap'}}>sq {e.sq}</span>
                    <span style={{fontSize:7,color:'rgba(200,160,90,.4)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:70,fontStyle:'italic'}}>{e.detail}</span>
                  </div>
                  {/* Ink-weight bar */}
                  <div style={{width:2,height:12,borderRadius:1,background:t.color,opacity:isNewest?.6:.2,flexShrink:0}}/>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ✨ MOKSHA SCREEN — Full-screen canvas ascension cinematic
//    Winner's soul ascends through all three realms to Swarga.
//    2000 golden particles, lotus bloom, Chitragupta seals the ledger.
// ══════════════════════════════════════════════════════════════════════
function MokshaScreen({ winner, players, punya, papa, onClose, muted }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const [phase, setPhase] = useState(0); // 0=ascend 1=swarga 2=judgment
  const [showJudge, setShowJudge] = useState(false);
  // Find loser with most papa (for judgment)
  const loserIdx = useMemo(()=>{
    let mi=-1;
    players.forEach((_,i)=>{
      if(i!==winner&&(mi<0||papa[i]>papa[mi])) mi=i;
    });
    return mi;
  },[players, winner, papa]);
  const wPunya = punya[winner]||0;
  const wPapa  = papa[winner]||0;
  const wp = players[winner];
  const lp = loserIdx>=0 ? players[loserIdx] : null;

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    let t=0;
    const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize(); window.addEventListener('resize',resize);

    // ── Particle system ──
    const PARTICLE_COUNT=1800;
    const particles=[];
    for(let i=0;i<PARTICLE_COUNT;i++){
      const angle=(Math.random()*Math.PI*2);
      const radius=Math.random()*canvas.width*0.3;
      particles.push({
        x: canvas.width/2 + Math.cos(angle)*radius*Math.random(),
        y: canvas.height*0.8 + Math.random()*canvas.height*0.3,
        vx: (Math.random()-0.5)*1.2,
        vy: -(0.8+Math.random()*3.5),
        size: 0.8+Math.random()*3.5,
        opacity: 0.4+Math.random()*0.6,
        hue: 30+Math.random()*30, // gold range
        life: 0,
        maxLife: 120+Math.random()*180,
        delay: Math.random()*60,
        spiral: (Math.random()-0.5)*0.04,
      });
    }
    // Realm labels  
    const REALMS=[
      {y:0.75,label:'भूलोक',color:'rgba(160,120,60,.4)'},
      {y:0.45,label:'अन्तर्लोक',color:'rgba(80,120,160,.4)'},
      {y:0.18,label:'स्वर्गलोक',color:'rgba(160,120,220,.4)'},
      {y:0.02,label:'परमधाम',color:'rgba(240,200,80,.5)'},
    ];

    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      t++;

      // Background gradient
      const grad=ctx.createLinearGradient(0,canvas.height,0,0);
      grad.addColorStop(0,'rgba(8,5,2,.95)');
      grad.addColorStop(0.4,'rgba(10,8,20,.9)');
      grad.addColorStop(0.75,'rgba(15,10,35,.85)');
      grad.addColorStop(1,'rgba(30,20,60,.8)');
      ctx.fillStyle=grad;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      // Realm boundary lines
      REALMS.forEach(r=>{
        const y=r.y*canvas.height;
        ctx.strokeStyle=r.color;
        ctx.lineWidth=.8;
        ctx.setLineDash([4,8]);
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle=r.color;
        ctx.font=`${Math.max(10,canvas.width*0.018)}px Cinzel,serif`;
        ctx.textAlign='right';
        ctx.fillText(r.label, canvas.width-16, y-6);
      });

      // Light beam from center bottom
      const beamCx=canvas.width/2;
      if(t>20){
        const beamGrad=ctx.createLinearGradient(beamCx,canvas.height,beamCx,0);
        beamGrad.addColorStop(0,'rgba(240,200,80,0)');
        beamGrad.addColorStop(0.3,'rgba(240,200,80,.06)');
        beamGrad.addColorStop(0.7,'rgba(200,180,240,.08)');
        beamGrad.addColorStop(1,'rgba(255,255,255,.12)');
        const bw=Math.min(t*3,canvas.width*0.4);
        ctx.fillStyle=beamGrad;
        ctx.beginPath();
        ctx.moveTo(beamCx-20,canvas.height);
        ctx.lineTo(beamCx-bw,0);
        ctx.lineTo(beamCx+bw,0);
        ctx.lineTo(beamCx+20,canvas.height);
        ctx.fill();
      }

      // Particles
      particles.forEach(p=>{
        if(t<p.delay) return;
        p.life++;
        if(p.life>p.maxLife){ p.life=0; p.y=canvas.height*0.9+Math.random()*canvas.height*.2; p.x=canvas.width/2+(Math.random()-0.5)*canvas.width*.4; p.vy=-(0.8+Math.random()*3.5); }
        p.x+=p.vx+Math.sin(t*0.02+p.spiral*100)*p.spiral*60;
        p.y+=p.vy;
        p.vy*=0.998;
        const lifeRatio=p.life/p.maxLife;
        const alpha=p.opacity*(1-Math.pow(lifeRatio,2));
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size*(1-lifeRatio*.5),0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},80%,${50+lifeRatio*30}%,${alpha})`;
        ctx.fill();
        // Sparkle cross
        if(p.size>2.5){
          ctx.strokeStyle=`hsla(${p.hue},90%,80%,${alpha*.4})`;
          ctx.lineWidth=.5;
          ctx.beginPath(); ctx.moveTo(p.x-p.size*1.5,p.y); ctx.lineTo(p.x+p.size*1.5,p.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(p.x,p.y-p.size*1.5); ctx.lineTo(p.x,p.y+p.size*1.5); ctx.stroke();
        }
      });

      // Pulsing OM at top
      if(t>40){
        const omAlpha=Math.min((t-40)/60, 1);
        const omScale=1+Math.sin(t*.02)*.06;
        ctx.save();
        ctx.globalAlpha=omAlpha;
        ctx.translate(canvas.width/2, canvas.height*0.08);
        ctx.scale(omScale,omScale);
        ctx.font=`${Math.max(48,canvas.width*0.08)}px serif`;
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.fillStyle='rgba(240,200,80,.9)';
        ctx.shadowBlur=30; ctx.shadowColor='rgba(240,200,80,.6)';
        ctx.fillText('ॐ',0,0);
        ctx.restore();
      }

      // Expanding light rings from top
      if(t>60){
        for(let ring=0;ring<4;ring++){
          const rAge=((t-60)+ring*40)%160;
          const rAlpha=Math.max(0,(1-rAge/160)*.15);
          ctx.strokeStyle=`rgba(240,200,80,${rAlpha})`;
          ctx.lineWidth=1.5;
          ctx.beginPath();
          ctx.arc(canvas.width/2,canvas.height*.08,rAge*3,0,Math.PI*2);
          ctx.stroke();
        }
      }

      rafRef.current=requestAnimationFrame(draw);
    };
    draw();

    // Phase progression
    const t1=setTimeout(()=>setPhase(1),3500);
    const t2=setTimeout(()=>setPhase(2),5500);
    const t3=setTimeout(()=>setShowJudge(true),7000);

    return()=>{
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',resize);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  },[]);

  const isYamaMode = players.length===2 && players.find(p=>p.cpu);
  // Show judgment whenever there is a loser — especially Yama in solo mode

  return(
    <div style={{position:'fixed',inset:0,zIndex:600,overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>

      {/* Winner card — ascends over time */}
      <div style={{
        position:'absolute',left:'50%',bottom:'15%',transform:'translateX(-50%)',
        textAlign:'center',
        animation:'mokshaAscend 8s ease 1.5s both',
        filter:'drop-shadow(0 0 40px rgba(240,200,80,.6))',
      }}>
        <div style={{fontSize:'clamp(52px,10vw,80px)',marginBottom:8,animation:'cgGoldPulse 2s ease infinite'}}>{wp?.char?.icon}</div>
        <div style={{fontSize:'clamp(18px,4vw,28px)',fontFamily:"'Yatra One',serif",color:'#f0d050',letterSpacing:3,textShadow:'0 0 30px rgba(240,200,80,.6)'}}>{wp?.name}</div>
        <div style={{fontSize:'clamp(10px,2vw,13px)',color:'rgba(240,200,80,.6)',letterSpacing:4,fontFamily:"'Cinzel',serif",marginTop:4}}>मोक्ष प्राप्त · LIBERATED</div>
      </div>

      {/* Chitragupta seal — appears after ascension */}
      {phase>=1&&(
        <div style={{
          position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',
          textAlign:'center',animation:'fadeIn 1.5s ease',
          background:'linear-gradient(135deg,rgba(14,10,4,.95),rgba(20,14,6,.98))',
          border:'1px solid rgba(200,175,90,.25)',borderRadius:12,
          padding:'clamp(16px,3vw,28px) clamp(20px,4vw,40px)',
          maxWidth:'min(420px,90vw)',backdropFilter:'blur(10px)',
        }}>
          {/* Quill SVG above text */}
          <div style={{fontSize:20,marginBottom:8,animation:'pulse 2s ease infinite',opacity:.6}}>🪶</div>
          <div style={{fontSize:8,letterSpacing:4,color:'rgba(200,175,90,.5)',fontFamily:"'Cinzel',serif",marginBottom:10}}>CHITRAGUPTA SEALS THE LEDGER</div>
          <div style={{width:80,height:1,background:'linear-gradient(90deg,transparent,rgba(200,175,90,.4),transparent)',margin:'0 auto 16px'}}/>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
            <div style={{padding:'8px',background:'rgba(80,200,80,.06)',border:'1px solid rgba(80,200,80,.12)',borderRadius:6,textAlign:'center'}}>
              <div style={{fontSize:7,color:'rgba(80,200,80,.5)',letterSpacing:2,marginBottom:4}}>पुण्य EARNED</div>
              <div style={{fontSize:22,fontWeight:900,color:'#80c080',fontFamily:"'Cinzel',serif"}}>{wPunya}</div>
            </div>
            <div style={{padding:'8px',background:'rgba(200,80,60,.05)',border:'1px solid rgba(200,80,60,.1)',borderRadius:6,textAlign:'center'}}>
              <div style={{fontSize:7,color:'rgba(200,80,60,.45)',letterSpacing:2,marginBottom:4}}>पाप CARRIED</div>
              <div style={{fontSize:22,fontWeight:900,color:'#e08060',fontFamily:"'Cinzel',serif"}}>{wPapa}</div>
            </div>
          </div>

          {/* CG quote */}
          <div style={{fontSize:'clamp(10px,1.8vw,13px)',color:'rgba(200,175,120,.55)',fontStyle:'italic',lineHeight:1.8,marginBottom:16,letterSpacing:.5}}>
            "The page is complete. I seal it. In all the ages I have kept this record, few pages end this way."
          </div>
          <div style={{fontSize:8,color:'rgba(200,175,90,.3)',letterSpacing:3,marginBottom:16}}>— चित्रगुप्त</div>
        </div>
      )}

      {/* Yama judgment for losers — appears last */}
      {showJudge&&lp&&(
        <YamaJudgment loser={lp} papa={papa[loserIdx]} punya={punya[loserIdx]} isYama={!!lp.cpu}/>
      )}

      {/* Close button */}
      {phase>=2&&(
        <div style={{position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',display:'flex',gap:12,animation:'fadeIn 1s ease'}}>
          <button onClick={onClose} style={{
            background:'linear-gradient(180deg,rgba(200,160,60,.2),rgba(200,160,60,.08))',
            border:'1px solid rgba(200,160,60,.4)',color:'#e8c850',
            padding:'10px 28px',fontSize:11,fontFamily:"'Cinzel',serif",
            cursor:'pointer',borderRadius:4,letterSpacing:3,
          }}>नया जन्म · NEW JOURNEY</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ── PostGame Popup — Donate + Feedback (shown after Moksha ceremony) ─────────
const _SB_URL = process.env.REACT_APP_SUPABASE_URL || '';
const _SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
async function _saveFeedback(msg, email, type='moksha-post-game') {
  if (_SB_URL && _SB_KEY) {
    try {
      const r = await fetch(`${_SB_URL}/rest/v1/feedback`, {
        method:'POST',
        headers:{'apikey':_SB_KEY,'Authorization':`Bearer ${_SB_KEY}`,'Content-Type':'application/json','Prefer':'return=minimal'},
        body:JSON.stringify({message:msg,email:email||null,type,source:'moksha'}),
      });
      if(r.ok||r.status===201) return true;
    } catch {}
  }
  const s=encodeURIComponent('Moksha Patam 108 — Feedback');
  const b=encodeURIComponent(`Message:\n${msg}\n\nFrom: ${email||'Anonymous'}`);
  window.open(`mailto:rakesh@rasavisio.com?subject=${s}&body=${b}`);
  return true;
}

function MokshaPostGamePopup({ onClose, onNewJourney }) {
  const [tab,     setTab]     = useState('donate');
  const [msg,     setMsg]     = useState('');
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if(!msg.trim()) return;
    setSending(true);
    await _saveFeedback(msg, email);
    setSending(false); setSent(true);
    setMsg(''); setEmail('');
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:600,
      display:'flex',alignItems:'center',justifyContent:'center',padding:16,
      animation:'fadeIn .4s ease'}}>
      <div style={{
        background:'linear-gradient(180deg,#1e1810,#0c0a07)',
        border:'1px solid rgba(240,208,80,.25)',borderRadius:8,
        maxWidth:460,width:'100%',
        boxShadow:'0 0 80px rgba(240,208,80,.08),0 0 200px rgba(0,0,0,.8)',
        overflow:'hidden',maxHeight:'90vh',overflowY:'auto',
      }}>
        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid rgba(240,208,80,.1)'}}>
          {[['donate','🪔 Support'],['feedback','✍️ Feedback']].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1,padding:'14px 10px',background:'transparent',border:'none',
              fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,
              color:tab===t?'#f0d050':'rgba(200,180,100,.3)',
              borderBottom:`2px solid ${tab===t?'#f0d050':'transparent'}`,
              cursor:'pointer',transition:'all .25s',textTransform:'uppercase',
            }}>{l}</button>
          ))}
          <button onClick={onClose} style={{padding:'14px 18px',background:'transparent',
            border:'none',color:'rgba(200,180,100,.25)',cursor:'pointer',fontSize:16,
            transition:'color .2s'}}
            onMouseEnter={e=>e.target.style.color='rgba(200,180,100,.7)'}
            onMouseLeave={e=>e.target.style.color='rgba(200,180,100,.25)'}>
            ✕
          </button>
        </div>

        {/* Donate */}
        {tab==='donate'&&(
          <div style={{padding:'28px 28px 32px',textAlign:'center'}}>
            <div style={{fontSize:42,marginBottom:12,
              filter:'drop-shadow(0 0 20px rgba(240,208,80,.4))',
              animation:'mp 3s ease infinite'}}>🪔</div>
            <div style={{fontFamily:"'Yatra One',serif",fontSize:22,color:'#f0d050',
              marginBottom:8,letterSpacing:2,
              textShadow:'0 0 20px rgba(240,208,80,.3)'}}>
              Keep the Light Burning
            </div>
            <p style={{fontFamily:"'Noto Serif Devanagari',serif",fontSize:14,
              color:'rgba(200,180,100,.65)',lineHeight:2,marginBottom:24}}>
              Moksha Patam 108 is free and will remain free.
              If this game touched your soul — a small offering keeps it alive.
            </p>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:20,flexWrap:'wrap'}}>
              {[['₹108','Sacred'],['₹500','Generous'],['₹1,000','Patron']].map(([a,l])=>(
                <div key={a} style={{padding:'10px 16px',
                  border:'1px solid rgba(240,208,80,.2)',
                  background:'rgba(240,208,80,.04)',minWidth:90}}>
                  <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,
                    color:'#f0d050',textShadow:'0 0 10px rgba(240,208,80,.3)'}}>{a}</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:8,
                    letterSpacing:2,color:'rgba(240,208,80,.45)',
                    textTransform:'uppercase',marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:'inline-block',background:'white',padding:14,
              borderRadius:4,border:'1px solid rgba(240,208,80,.3)',
              boxShadow:'0 0 24px rgba(240,208,80,.1)'}}>
              <img src="/upi-qr.png" alt="UPI QR"
                style={{width:160,height:160,display:'block'}}/>
            </div>
            <div style={{marginTop:10,fontFamily:"'Cinzel',serif",fontSize:9,
              letterSpacing:4,color:'rgba(200,180,100,.35)',textTransform:'uppercase'}}>
              GPay · PhonePe · Paytm · any UPI
            </div>
            <div style={{marginTop:14,fontFamily:"'Noto Serif Devanagari',serif",
              fontSize:12,color:'rgba(200,180,100,.3)'}}>
              Outside India?{' '}
              <a href="https://ko-fi.com/rasavisio" target="_blank" rel="noreferrer"
                style={{color:'#e07820',textDecoration:'none',
                  borderBottom:'1px solid rgba(224,120,32,.3)'}}>
                Ko-fi →
              </a>
            </div>
            <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid rgba(240,208,80,.08)'}}>
              <button onClick={onNewJourney} style={{
                background:'transparent',border:'1px solid rgba(240,208,80,.25)',
                color:'rgba(240,208,80,.6)',padding:'9px 24px',
                fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,
                cursor:'pointer',transition:'all .3s',textTransform:'uppercase',
              }}
              onMouseEnter={e=>{e.target.style.borderColor='rgba(240,208,80,.5)';e.target.style.color='#f0d050'}}
              onMouseLeave={e=>{e.target.style.borderColor='rgba(240,208,80,.25)';e.target.style.color='rgba(240,208,80,.6)'}}>
                नया जन्म · New Journey →
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {tab==='feedback'&&(
          <div style={{padding:'28px 28px 32px'}}>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{fontSize:36,marginBottom:10}}>✍️</div>
              <div style={{fontFamily:"'Yatra One',serif",fontSize:18,
                color:'#f0d050',marginBottom:6,letterSpacing:2}}>Tell Chitragupta</div>
              <p style={{fontFamily:"'Noto Serif Devanagari',serif",fontSize:13,
                color:'rgba(200,180,100,.5)',lineHeight:1.9}}>
                Chitragupta records all. Your words will reach Rakesh.
              </p>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14,justifyContent:'center'}}>
              {['🐛 Found a bug','⭐ Loved it!','💡 Suggestion','📜 Story idea'].map(s=>(
                <button key={s} onClick={()=>setMsg(s+' — ')} style={{
                  fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,
                  padding:'5px 10px',background:'rgba(240,208,80,.06)',
                  border:'1px solid rgba(240,208,80,.15)',color:'rgba(240,208,80,.55)',
                  borderRadius:20,cursor:'pointer',transition:'all .2s',
                }}
                onMouseEnter={e=>{e.target.style.background='rgba(240,208,80,.12)';e.target.style.color='#f0d050'}}
                onMouseLeave={e=>{e.target.style.background='rgba(240,208,80,.06)';e.target.style.color='rgba(240,208,80,.55)'}}>
                  {s}
                </button>
              ))}
            </div>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)}
              placeholder="What's on your mind, seeker..."
              style={{width:'100%',background:'rgba(12,10,7,.8)',
                border:'1px solid rgba(240,208,80,.15)',
                color:'rgba(200,180,100,.85)',padding:'12px 14px',
                fontFamily:"'Noto Serif Devanagari',serif",fontSize:14,
                lineHeight:1.8,resize:'vertical',minHeight:100,outline:'none',
                borderRadius:4,transition:'border-color .3s',marginBottom:10}}
              onFocus={e=>e.target.style.borderColor='rgba(240,208,80,.4)'}
              onBlur={e=>e.target.style.borderColor='rgba(240,208,80,.15)'}/>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Email (optional — if you'd like a reply)"
              style={{width:'100%',background:'rgba(12,10,7,.8)',
                border:'1px solid rgba(240,208,80,.15)',
                color:'rgba(200,180,100,.8)',padding:'10px 14px',
                fontFamily:"'Noto Serif Devanagari',serif",fontSize:13,
                outline:'none',borderRadius:4,marginBottom:14,transition:'border-color .3s'}}
              onFocus={e=>e.target.style.borderColor='rgba(240,208,80,.4)'}
              onBlur={e=>e.target.style.borderColor='rgba(240,208,80,.15)'}/>
            <div style={{textAlign:'center'}}>
              {sent
                ? <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,
                    color:'#80c080',padding:'10px 0'}}>
                    ✦ Received. Chitragupta has recorded it.
                  </div>
                : <button onClick={send} disabled={sending||!msg.trim()} style={{
                    fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:4,
                    padding:'11px 28px',border:'1px solid rgba(240,208,80,.3)',
                    color:'#f0d050',cursor:msg.trim()?'pointer':'default',
                    background:'rgba(240,208,80,.06)',transition:'all .3s',
                    textTransform:'uppercase',opacity:msg.trim()?1:.35}}>
                    {sending?'Recording...':'Send ✦'}
                  </button>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 💀 YAMA JUDGMENT — Canvas fire + chains for the most-sinful player
// ══════════════════════════════════════════════════════════════════════
function YamaJudgment({ loser, papa, punya, isYama }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const W=canvas.width=360, H=canvas.height=280;
    const ctx=canvas.getContext('2d');
    let t=0;

    // Flame particles
    const flames=[];
    for(let i=0;i<120;i++){
      flames.push({
        x:W/2+(Math.random()-.5)*W*.7,
        y:H*.85+Math.random()*H*.2,
        vx:(Math.random()-.5)*.8,
        vy:-(0.5+Math.random()*2),
        size:4+Math.random()*14,
        life:0, maxLife:30+Math.random()*50,
        hue:Math.random()<.7?10+Math.random()*20:30+Math.random()*20,
        delay:Math.random()*30,
      });
    }

    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      t++;
      // Dark background
      ctx.fillStyle='rgba(8,3,2,.92)';
      ctx.fillRect(0,0,W,H);

      // Glow from bottom
      const grd=ctx.createRadialGradient(W/2,H,10,W/2,H,W*.6);
      grd.addColorStop(0,'rgba(200,40,10,.25)');
      grd.addColorStop(.5,'rgba(150,20,5,.08)');
      grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);

      // Flames
      flames.forEach(f=>{
        if(t<f.delay) return;
        f.life++;
        if(f.life>f.maxLife){f.life=0;f.y=H*.85+Math.random()*H*.2;f.x=W/2+(Math.random()-.5)*W*.65;f.vy=-(0.5+Math.random()*2);}
        f.x+=f.vx+Math.sin(t*.05+f.x*.01)*.5;
        f.y+=f.vy;
        f.vy*=0.995;
        const lr=f.life/f.maxLife;
        const alpha=(1-lr)*(0.5+Math.random()*.3);
        ctx.beginPath();
        ctx.arc(f.x,f.y,f.size*(1-lr*.6),0,Math.PI*2);
        ctx.fillStyle=`hsla(${f.hue+lr*20},90%,${35+lr*25}%,${alpha})`;
        ctx.fill();
      });

      // Smoke particles
      if(t%3===0){
        ctx.beginPath();
        const sx=W/2+(Math.random()-.5)*W*.5;
        const sy=H*.55;
        ctx.arc(sx,sy,3+Math.random()*8,0,Math.PI*2);
        ctx.fillStyle=`rgba(40,20,10,${0.1+Math.random()*.1})`;
        ctx.fill();
      }

      // SVG-like Yama silhouette (buffalo + figure)
      const yamaY=H*.55-Math.min(t*1.5,H*.25); // rises from flames
      const yamaAlpha=Math.min(t/40,1);
      ctx.save();
      ctx.globalAlpha=yamaAlpha;
      ctx.fillStyle='rgba(60,10,10,.9)';
      // Body
      ctx.beginPath(); ctx.ellipse(W/2,yamaY,20,28,0,0,Math.PI*2); ctx.fill();
      // Head
      ctx.beginPath(); ctx.arc(W/2,yamaY-32,14,0,Math.PI*2); ctx.fill();
      // Crown (trident-like)
      ctx.strokeStyle='rgba(200,40,10,.8)'; ctx.lineWidth=3; ctx.lineCap='round';
      for(let spike=-1;spike<=1;spike++){
        ctx.beginPath();
        ctx.moveTo(W/2+spike*8,yamaY-44);
        ctx.lineTo(W/2+spike*8,yamaY-64-Math.abs(spike)*6);
        ctx.stroke();
      }
      // Arms raised
      ctx.strokeStyle='rgba(60,10,10,.9)'; ctx.lineWidth=8;
      ctx.beginPath(); ctx.moveTo(W/2-18,yamaY-10); ctx.lineTo(W/2-50,yamaY-35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W/2+18,yamaY-10); ctx.lineTo(W/2+50,yamaY-35); ctx.stroke();
      ctx.restore();

      // Animated chains
      if(t>30){
        const chainAlpha=Math.min((t-30)/40,1);
        ctx.save();
        ctx.globalAlpha=chainAlpha;
        ctx.strokeStyle='rgba(180,140,60,.6)';
        ctx.lineWidth=2.5;
        ctx.setLineDash([4,3]);
        ctx.lineDashOffset=-t*.5;
        // Left chain
        ctx.beginPath();
        ctx.moveTo(30,H*.3);
        ctx.bezierCurveTo(W*.2,H*.35+Math.sin(t*.04)*8,W*.35,H*.5,W*.38,H*.7);
        ctx.stroke();
        // Right chain
        ctx.beginPath();
        ctx.moveTo(W-30,H*.3);
        ctx.bezierCurveTo(W*.8,H*.35+Math.sin(t*.04+1)*8,W*.65,H*.5,W*.62,H*.7);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>{ cancelAnimationFrame(rafRef.current); };
  },[]);

  return(
    <div style={{
      position:'fixed',bottom:20,right:20,
      background:'rgba(8,3,2,.95)',
      border:'1.5px solid rgba(180,40,20,.35)',
      borderRadius:10,overflow:'hidden',
      animation:'yamaRise .8s cubic-bezier(.34,1.56,.64,1)',
      boxShadow:'0 0 40px rgba(180,40,20,.2)',
      width:'min(360px,90vw)',
    }}>
      <canvas ref={canvasRef} width={360} height={280} style={{display:'block',width:'100%'}}/>
      <div style={{padding:'10px 14px',background:'linear-gradient(0deg,rgba(8,3,2,.98),rgba(8,3,2,.85))'}}>
        <div style={{fontSize:10,color:'rgba(200,60,30,.7)',letterSpacing:2,fontFamily:"'Cinzel',serif",fontWeight:700,marginBottom:4}}>
          {isYama ? '💀 YAMA FALLS — THE GOD OF DEATH IS JUDGED' : '☠️ YAMA\'S JUDGMENT'}
        </div>
        <div style={{fontSize:9,color:'rgba(200,80,60,.6)',marginBottom:6,lineHeight:1.6}}>
          {isYama
            ? <><span style={{fontSize:13}}>☠️</span> <strong style={{color:'#e06060'}}>यमराज · YAMA</strong> — God of Death. Defeated.</>
            : <>{loser.char.icon} <strong style={{color:loser.char.color}}>{loser.name}</strong> — {papa} Papa, {punya} Punya</>
          }
        </div>
        <div style={{fontSize:8,color:'rgba(180,60,40,.45)',fontStyle:'italic',lineHeight:1.7}}>
          {isYama
            ? '"Even the God of Death carries karma. He who judges all souls — has now been judged himself. The ledger does not exempt even Yama. He will return. He always returns."'
            : `"The ledger has spoken. ${papa} Papa cannot be hidden from Yama's gaze. The soul must return — to learn, to suffer, to try again."`
          }
        </div>
        <div style={{fontSize:7,color:'rgba(160,40,20,.4)',marginTop:4,letterSpacing:2}}>— CHITRAGUPTA'S FINAL ENTRY</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO SCREEN
//    A cameo page introducing the divine scribe before the game begins.
//    Story lines reveal themselves one by one. Quill draws across the top.
//    Skippable at any time.
// ══════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO — 3D Particle Deity + Cinematic Story
//
// A full-screen 3D canvas scene:
//   · Chitragupta built from ~1400 glowing gold particles
//   · 4-armed deity silhouette: head, body, arms, halo, lotus throne
//   · Particles spawn from center and fly to their positions (2s burst)
//   · Figure rotates slowly on Y-axis (real 3D perspective projection)
//   · Sanskrit characters orbit him in 3D ellipses at varying inclinations
//   · Stars parallax in the background
//   · Story lines appear ONE AT A TIME (cinematic, not a list)
//   · "BEGIN" triggers particle explosion outward
// ══════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO — 3D Particle Deity + 3 Orbital Rings + Hidden Riddle
//
// THE SCIENCE:
//   Every atom in your body was forged inside a dying star.
//   You are 99.9% empty space — and the universe is 99.9% empty space.
//   Information cannot be destroyed (Landauer's Principle, 1961).
//   Every deed you commit is written into the fabric of spacetime.
//   Chitragupta is that fabric.
//
// THE 3D SCENE:
//   · ~1,600 gold particles form a 4-armed deity, 1.6× larger than before
//   · Ring 1 (r=130): 9 Sanskrit numerals — the 9 Navagraha planets
//   · Ring 2 (r=210): Science/philosophy words — hidden in plain sight
//   · Ring 3 (r=310): The SECRET RING — one symbol returns to apex every 108×π frames
//
// THE HIDDEN RIDDLE:
//   108 — solar diameters from Earth to Sun.
//   108 — beads in a mala.
//   108 — squares on the Moksha Patam.
//   108 — Upanishads.
//   One character in the outer ring orbits at a speed of exactly 2π/(108×3) rad/frame.
//   Every 324 frames (~5.4s), it returns to the apex.
//   At that moment, the ring glows.
//   The character is ॐ — the answer was always there.
//   The riddle: "Which symbol in this universe knows the number 108?"
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO — Full canvas. No text. Only his voice.
//
// THREE ORBITAL RINGS:
//   Ring I   r=190  9 Navagraha drawn as real planets (Saturn has rings, etc)
//   Ring II  r=310  Science + Vedic symbols, slow drift
//   Ring III r=430  SECRET — OM orbits at 2π/(108×3). Returns to apex every 324 frames.
//
// THE HIDDEN RIDDLE:
//   Ring III orbits at exactly 2π/(108×3) rad/frame.
//   OM (ॐ) starts at the 12-o-clock apex.
//   Every 324 frames it returns. The ring pulses gold.
//   A single Sanskrit whisper appears bottom-left — no explanation.
//   Those who watch understand. Those who understand, know why 108 matters.
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA — Three-Ring Cipher
//
// THE RIDDLE:
//   Each ring has one "key digit" that orbits independently.
//   Three clocks. Three periods. One secret.
//
//   Ring I   (r=190, fast)    key: १  period = 108 frames
//   Ring II  (r=310, medium)  key: ०  period = 216 frames (108×2)
//   Ring III (r=430, slow)    key: ८  period = 324 frames (108×3)
//
//   At the bottom: three dim indicator boxes  [ ? ] [ ? ] [ ? ]
//   When a key digit hits the 12-o'clock apex → its box briefly lights up.
//   Most of the time: one box lit. Sometimes two. Rarely none.
//   At frame 648 (= LCM of 108, 216, 324 = 108×6):
//     ALL THREE align simultaneously → [ १ ] [ ० ] [ ८ ] = 108
//
//   The screen flashes gold. A message appears.
//   No explanation. Those who were watching, understand.
//
// THE SCIENCE:
//   This is exactly how the Antikythera Mechanism worked —
//   a 2,000-year-old Greek astronomical computer made of gears.
//   When independent gear cycles aligned, they revealed a date.
//   Three clocks with coprime periods. One alignment reveals everything.
//   Also: DNA uses 3-base codons. Three nucleotides → one amino acid.
//   Three rings → one number.
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA INTRO — Three Hidden Riddles
//
// RING I  — HYDROGEN SPECTRUM (4 colors, always same order)
// RING II — GRAVITATIONAL WAVE GW150914 (drawn as actual chirp waveform)
// RING III— DUAL RIDDLE:
//             EYES: Symbol ◈ blinks OM in Morse  — — — · — —
//             EARS: morse-108.wav plays quietly  (1=.———— 0=————— 8=———..)
//           Two hidden messages. Same ring. Same symbol.
//           "Those who know will hear. Those who know will see."
//
// DEPLOY: put /public/morse-108.wav  in your Vercel public folder
// ══════════════════════════════════════════════════════════════════════════════
function ChitraguptaIntroScreen({ players, chosenLang, muted, onBegin, onSkip }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef({ t:0, explode:false });
  const rafRef     = useRef(null);
  const morseAudio = useRef(null);
  const [done,      setDone]      = useState(false);
  const [exploding, setExploding] = useState(false);

  useEffect(()=>{ const t=setTimeout(()=>setDone(true),3000); return()=>clearTimeout(t); },[]);

  // Voice + morse audio init
  useEffect(()=>{
    if(!muted){
      setTimeout(()=>VoiceEngine.speakChitragupta('open',chosenLang),900);
      // Morse 108 audio — quiet, loops with gap
      try{
        const audio=new Audio('/morse-108.wav');
        audio.volume=0.18; // subtle — beneath the voice
        morseAudio.current=audio;
        // Play once after 8s, then every 35s
        const play=()=>{ try{ audio.currentTime=0; audio.play().catch(()=>{}); }catch(e){} };
        const t1=setTimeout(play,3000);
        const iv=setInterval(play,12000);
        return()=>{ clearTimeout(t1); clearInterval(iv); audio.pause(); };
      }catch(e){}
    }
    return()=>VoiceEngine.stop();
  },[]);

  // ─── HYDROGEN SPECTRUM ────────────────────────────────────────────────
  const H_LINES=[
    {nm:656,col:'#ff3520',glow:'rgba(255,53,32,',  phase:0           }, // Hα red
    {nm:486,col:'#30c8e0',glow:'rgba(48,200,224,', phase:Math.PI/2   }, // Hβ cyan
    {nm:434,col:'#8840e8',glow:'rgba(136,64,232,', phase:Math.PI     }, // Hγ violet
    {nm:410,col:'#5018c0',glow:'rgba(80,24,192,',  phase:3*Math.PI/2 }, // Hδ deep violet
  ];
  const H_PERIOD=260, H_FLASH=38;

  // ─── GW CHIRP — returns [amplitude 0-1, isChirping, isMerger] ────────
  const gwState=(t)=>{
    const phase=t%520;
    // INSPIRAL 0-310: 8 pulses, spacing 55→18 frames, each brighter
    if(phase<310){
      let cum=0;
      for(let i=0;i<8;i++){
        const sp=Math.round(55-i*4.6);
        if(phase>=cum&&phase<cum+18){
          const frac=(phase-cum)/18;
          const amp=Math.sin(frac*Math.PI)*(0.25+i*0.09);
          return {amp,chirp:false,merger:false};
        }
        cum+=sp; if(cum>310) break;
      }
      return {amp:0,chirp:false,merger:false};
    }
    // CHIRP 310-400: rapid pulses, 6-frame period
    if(phase<400){
      const cp=phase-310;
      const amp=cp%6<3?0.55+cp/90*0.4:0;
      return {amp,chirp:true,merger:false};
    }
    // MERGER 400-422: peak flash
    if(phase<422){
      const mp=phase-400;
      const amp=mp<10?0.9+mp*.01:Math.max(0,1-(mp-10)/12);
      return {amp,chirp:true,merger:true};
    }
    // RINGDOWN 422-520: 4 fading echoes
    if(phase<520){
      const rd=phase-422;
      const echo=Math.floor(rd/24);
      const w=rd%24;
      if(echo<4&&w<14) return {amp:Math.max(0,(1-w/14)*(0.45-echo*.1)),chirp:false,merger:false};
    }
    return {amp:0,chirp:false,merger:false};
  };

  // ─── MORSE: OM = O(— — —) M(— —) ────────────────────────────────────
  // DAH=30f  GAP=10f  LETTER=30f  WORD=60f  Total=270f
  const MORSE_PERIOD=270;
  const morseState=(t)=>{
    const p=t%MORSE_PERIOD;
    // O: dah dah dah
    if(p<30)  return {on:true,pct:p/30};
    if(p<40)  return {on:false,pct:0};
    if(p<70)  return {on:true,pct:(p-40)/30};
    if(p<80)  return {on:false,pct:0};
    if(p<110) return {on:true,pct:(p-80)/30};
    // letter gap
    if(p<140) return {on:false,pct:0};
    // M: dah dah
    if(p<170) return {on:true,pct:(p-140)/30};
    if(p<180) return {on:false,pct:0};
    if(p<210) return {on:true,pct:(p-180)/30};
    // word silence
    return {on:false,pct:0};
  };

  // ─── PARTICLE FIGURE (S=3.2, CY=0.60) ───────────────────────────────
  const buildFigure=useCallback(()=>{
    const pts=[], S=3.2;
    const add=(x,y,z,type,col)=>pts.push({tx:x*S,ty:y*S,tz:z*S,x:(Math.random()-.5)*10,y:(Math.random()-.5)*10,z:(Math.random()-.5)*10,color:col,type,size:1.2+Math.random()*2.2,baseOpacity:.5+Math.random()*.5,phase:Math.random()*Math.PI*2});
    const r=()=>(Math.random()-.5);
    for(let i=0;i<160;i++){const ph=Math.acos(2*Math.random()-1),th=Math.random()*Math.PI*2,rv=27+r()*5;add(rv*Math.sin(ph)*Math.cos(th),-154+rv*Math.cos(ph),rv*Math.sin(ph)*Math.sin(th),'head','#f0d880');}
    for(let i=0;i<55;i++)add(r()*17,-150+r()*21,25+r()*9,'face','#fffce0');
    for(let s=0;s<5;s++){const a=(s/5)*Math.PI*2,cx=22*Math.cos(a),cz=22*Math.sin(a);for(let j=0;j<14;j++)add(cx*(1-j*.04),-182-j*9+r()*4,cz*(1-j*.04),'crown','#ffe040');}
    for(let i=0;i<70;i++){const a=(i/70)*Math.PI*2;add(27*Math.cos(a)+r()*3,-187+r()*4,27*Math.sin(a)+r()*3,'crown','#f0c820');}
    for(let i=0;i<150;i++){const a=(i/150)*Math.PI*2,rv=72+r()*10;add(rv*Math.cos(a)+r()*4,-154+r()*8,-4+rv*Math.sin(a)*.2,'halo','#f0d050');}
    for(let i=0;i<55;i++){const a=(i/55)*Math.PI*2,rv=50+r()*10;add(rv*Math.cos(a),-154+r()*5,rv*Math.sin(a)*.16,'halo','#f0d050');}
    for(let i=0;i<230;i++){const t=Math.random(),a=Math.random()*Math.PI*2,y=-120+t*100,rx=31*(1-Math.pow((t-.5)*2,2)*.45);add(rx*Math.cos(a)+r()*6,y+r()*8,rx*.55*Math.sin(a)+r()*5,'body','#ddb84a');}
    for(let i=0;i<40;i++){const t=i/40,a=t*Math.PI;add(31*Math.cos(a)-6,-120+t*62+r()*4,31*Math.cos(a)*.3+r()*3,'thread','#f0d060');}
    for(let i=0;i<115;i++){const t=i/115;add(28+t*84+r()*8,-110-t*74+r()*8,t*25+r()*8,'arm','#c8a840');}
    for(let i=0;i<115;i++){const t=i/115;add(26+t*77+r()*8,-96+t*67+r()*8,t*18+r()*8,'arm','#c8a840');}
    for(let i=0;i<115;i++){const t=i/115;add(-28-t*77+r()*8,-110-t*62+r()*8,t*18+r()*8,'arm','#c8a840');}
    for(let i=0;i<115;i++){const t=i/115;add(-26-t*71+r()*8,-94+t*61+r()*8,t*12+r()*8,'arm','#c8a840');}
    for(let i=0;i<50;i++){const t=i/50;add(114+t*38+r()*5,-186-t*50+r()*5,25+t*7+r()*4,'quill','#ffffff');}
    for(let i=0;i<34;i++)add(119+i*1.4+r()*5,-194-i*1.9+r()*5,27+r()*4,'quill','#f0e888');
    for(let i=0;i<52;i++){const a=(i/52)*Math.PI;add(102+18*Math.cos(a)+r()*4,-31+10*Math.sin(a)+r()*4,18+r()*4,'scroll','#e8d070');}
    for(let i=0;i<62;i++)add(-99+r()*26,-36+r()*27,15+r()*7,'ledger','#c8aa50');
    for(let i=0;i<90;i++){const t=i/90;add(13+t*54+r()*10,-16+t*35+r()*10,-7+t*7+r()*10,'leg','#c0a030');}
    for(let i=0;i<90;i++){const t=i/90;add(-13-t*50+r()*10,-16+t*33+r()*10,-7+t*7+r()*10,'leg','#c0a030');}
    for(let p=0;p<16;p++){const pa=(p/16)*Math.PI*2;for(let j=0;j<24;j++){const t=j/24,rv=52+t*32;add(rv*Math.cos(pa)+r()*7,26+t*26+r()*6,rv*Math.sin(pa)*.55+r()*6,'lotus',p%3===0?'#ff90c0':p%3===1?'#e070a8':'#ff80b8');}}
    for(let i=0;i<55;i++){const a=Math.random()*Math.PI*2,rv=Math.random()*38;add(rv*Math.cos(a)+r()*4,26+r()*8,rv*Math.sin(a)*.5+r()*4,'lotus','#ffb0d0');}
    for(let i=0;i<160;i++){const a=Math.random()*Math.PI*2,rv=92+Math.random()*85;add(rv*Math.cos(a)+r()*22,-62+r()*225,rv*Math.sin(a)*.65+r()*22,'aura','#f0d050');}
    return pts;
  },[]);

  // ─── DRAW PLANET ──────────────────────────────────────────────────────
  const drawPlanet=useCallback((ctx,x,y,sc,p)=>{
    const rv=p.pr*sc; if(rv<1.2) return;
    if(p.rings){ctx.save();ctx.translate(x,y);ctx.scale(1,.28);ctx.beginPath();ctx.arc(0,0,rv*2.6,0,Math.PI*2);ctx.strokeStyle='rgba(210,185,115,.5)';ctx.lineWidth=rv*.85/.28;ctx.stroke();ctx.beginPath();ctx.arc(0,0,rv*1.75,0,Math.PI*2);ctx.strokeStyle='rgba(185,160,90,.38)';ctx.lineWidth=rv*.42/.28;ctx.stroke();ctx.restore();}
    const g=ctx.createRadialGradient(x-rv*.38,y-rv*.38,0,x,y,rv);g.addColorStop(0,p.hi);g.addColorStop(.65,p.col);g.addColorStop(1,p.sh);
    ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    if(p.corona){for(let ray=0;ray<8;ray++){const ra=(ray/8)*Math.PI*2;ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle='#f8d840';ctx.lineWidth=rv*.22;ctx.beginPath();ctx.moveTo(x+Math.cos(ra)*rv,y+Math.sin(ra)*rv);ctx.lineTo(x+Math.cos(ra)*rv*1.9,y+Math.sin(ra)*rv*1.9);ctx.stroke();ctx.restore();}}
    if(p.crescent){ctx.save();ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.clip();ctx.beginPath();ctx.arc(x+rv*.45,y,rv*.98,0,Math.PI*2);ctx.fillStyle='rgba(20,30,55,.78)';ctx.fill();ctx.restore();}
    if(p.polar){ctx.save();ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(x,y-rv*.62,rv*.3,0,Math.PI*2);ctx.fillStyle='#fff8f0';ctx.fill();ctx.beginPath();ctx.arc(x,y+rv*.62,rv*.2,0,Math.PI*2);ctx.fillStyle='#fff8f0';ctx.fill();ctx.restore();}
    if(p.bands){ctx.save();ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.clip();for(let b=0;b<5;b++){ctx.fillStyle=b%2===0?'rgba(160,75,15,.32)':'rgba(80,38,8,.22)';ctx.fillRect(x-rv,y-rv+b*rv*.4,rv*2,rv*.35);}ctx.beginPath();ctx.ellipse(x-rv*.08,y+rv*.17,rv*.32,rv*.16,0,0,Math.PI*2);ctx.fillStyle='rgba(190,55,35,.48)';ctx.fill();ctx.restore();}
    if(p.rings){const g2=ctx.createRadialGradient(x-rv*.38,y-rv*.38,0,x,y,rv);g2.addColorStop(0,p.hi);g2.addColorStop(.65,p.col);g2.addColorStop(1,p.sh);ctx.beginPath();ctx.arc(x,y,rv,0,Math.PI*2);ctx.fillStyle=g2;ctx.fill();}
    if(p.shadow){const sg=ctx.createRadialGradient(x,y,rv*.25,x,y,rv*2);sg.addColorStop(0,'transparent');sg.addColorStop(.55,'rgba(40,8,70,.14)');sg.addColorStop(1,'rgba(70,18,110,.28)');ctx.beginPath();ctx.arc(x,y,rv*2,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();}
    if(p.comet){ctx.save();ctx.globalAlpha=.38;const tg=ctx.createLinearGradient(x,y,x-rv*5,y);tg.addColorStop(0,'rgba(200,130,160,.7)');tg.addColorStop(1,'transparent');ctx.beginPath();ctx.moveTo(x,y-rv*.65);ctx.lineTo(x-rv*5,y);ctx.lineTo(x,y+rv*.65);ctx.fillStyle=tg;ctx.fill();ctx.restore();}
    ctx.save();ctx.globalAlpha=Math.min(sc*.85,.75);ctx.font=`${Math.max(6,8*sc)}px 'Noto Serif Devanagari',serif`;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle='rgba(200,175,90,.6)';ctx.fillText(p.skt,x,y+rv*(p.rings?2.2:1.55));ctx.restore();
  },[]);

  const NAVAGRAHA=[
    {skt:'☀ सूर्य',   pr:14,col:'#f0b020',hi:'#fff880',sh:'#b05800',corona:true,  speed:.0018,phase:.20},
    {skt:'☽ चन्द्र',  pr:9, col:'#c8d4e0',hi:'#f0f4ff',sh:'#506878',crescent:true,speed:.0014,phase:1.10},
    {skt:'♂ मंगल',    pr:8, col:'#c83020',hi:'#ff7060',sh:'#601010',polar:true,   speed:.0012,phase:1.85},
    {skt:'☿ बुध',     pr:6, col:'#7090a0',hi:'#a0c8d8',sh:'#304050',              speed:.0022,phase:2.60},
    {skt:'♃ बृहस्पति',pr:19,col:'#d08020',hi:'#f0c060',sh:'#804810',bands:true,  speed:.0010,phase:3.30},
    {skt:'♀ शुक्र',   pr:10,col:'#e8e098',hi:'#fffff8',sh:'#a09038',              speed:.0016,phase:4.05},
    {skt:'♄ शनि',     pr:13,col:'#c0a860',hi:'#e8d890',sh:'#7a6428',rings:true,   speed:.0008,phase:4.80},
    {skt:'☊ राहु',    pr:10,col:'#302840',hi:'#604880',sh:'#100a18',shadow:true,  speed:.0006,phase:5.50},
    {skt:'☋ केतु',    pr:8, col:'#805060',hi:'#c08090',sh:'#401020',comet:true,   speed:.0005,phase:6.00},
  ];

  // ─── CANVAS LOOP ──────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize(); window.addEventListener('resize',resize);

    const particles=buildFigure();
    const stars=Array.from({length:320},()=>({x:Math.random()*2400,y:Math.random()*1500,z:200+Math.random()*900,r:.3+Math.random()*1.8,op:.12+Math.random()*.6}));

    const FOV=680, ROTY=.0018, SPAWN=100;
    const s=stateRef.current; s.t=0;

    // Ring II symbols — 22 characters, slow
    const ring2syms=['∞','π','⚛','tat','tvam','asi','ħ','Δ','∇','Ψ','∅','E=mc²','∫','☯','ॐ','Ω','∴','∵','∑','DNA','◎','✦'].map((ch,i,a)=>({
      ch, phase:(i/a.length)*Math.PI*2, speed:.00085, idx:i, total:a.length,
    }));

    // Ring III filler (dim, non-blinking)
    const ring3syms=['✦','❊','⬡','∞','◯','△','▽','◇'].map((ch,i,a)=>({
      ch, phase:(i/a.length)*Math.PI*2+1.1, speed:.00035,
    }));

    const project=(x,y,z,ry,cx,cy)=>{
      const rx=x*Math.cos(ry)-z*Math.sin(ry),rz=x*Math.sin(ry)+z*Math.cos(ry);
      const sc=FOV/(FOV+rz+420);
      return {sx:cx+rx*sc,sy:cy+y*sc,scale:sc,rz};
    };
    const hA=(hex,a)=>{const rv=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgba(${rv},${g},${b},${a})`;};

    // ── GW: Draw chirp as pulsing light that travels around Ring II ──────
    // No flat line — the wave IS the ring. Pulses sweep around the orbit.
    // During inspiral: slow pulses, dim. Chirp: rapid bright sweep. Merger: full ring flash.
    const drawGWRing=(t,rotY,CX,CY,ral)=>{
      const phase=t%520;
      const gws=gwState(t);
      if(gws.amp<0.02&&!gws.merger) return;

      // Draw subtle orbit guide circle
      ctx.save();ctx.globalAlpha=ral*.06;ctx.strokeStyle='rgba(140,190,255,1)';ctx.lineWidth=.6;
      ctx.setLineDash([2,14]);
      ctx.beginPath();
      for(let i=0;i<=64;i++){
        const a2=(i/64)*Math.PI*2;
        const pr2=project(310*Math.cos(a2),-30+310*Math.sin(a2)*Math.sin(.32),310*Math.sin(a2)*Math.cos(.32),rotY,CX,CY);
        i===0?ctx.moveTo(pr2.sx,pr2.sy):ctx.lineTo(pr2.sx,pr2.sy);
      }
      ctx.stroke();ctx.setLineDash([]);ctx.restore();

      // During merger — flash the whole ring
      if(gws.merger){
        const mp=(phase-400)/22;
        const mAl=(1-mp)*.65;
        ctx.save();ctx.globalAlpha=ral*mAl;
        ctx.beginPath();
        for(let i=0;i<=64;i++){
          const a2=(i/64)*Math.PI*2;
          const pr2=project(310*Math.cos(a2),-30+310*Math.sin(a2)*Math.sin(.32),310*Math.sin(a2)*Math.cos(.32),rotY,CX,CY);
          i===0?ctx.moveTo(pr2.sx,pr2.sy):ctx.lineTo(pr2.sx,pr2.sy);
        }
        ctx.strokeStyle='rgba(200,220,255,.9)';ctx.lineWidth=3;ctx.shadowBlur=20;ctx.shadowColor='rgba(180,210,255,.8)';ctx.stroke();ctx.shadowBlur=0;
        ctx.restore();
        // Label
        ctx.save();ctx.globalAlpha=ral*mAl*.8;ctx.font=`${Math.max(8,10*Math.min(CX/700,1))}px 'Cinzel',serif`;ctx.textAlign='center';ctx.fillStyle='rgba(200,220,255,.85)';ctx.fillText('GW150914 · MERGER',CX,CY-CY*.52);ctx.restore();
        return;
      }

      // Inspiral / chirp — a bright arc sweeps around the ring
      // Arc width narrows as chirp accelerates (inspiral = wide slow arc, chirp = tight fast arc)
      const arcFrac=gws.chirp?0.08:0.25; // how much of ring is lit
      const sweepAngle=(t*.018)%(Math.PI*2); // sweep position

      ctx.save();ctx.globalAlpha=ral*Math.min(gws.amp*1.8,.75);
      ctx.beginPath();
      const arcSteps=32;
      for(let i=0;i<=arcSteps;i++){
        const a2=sweepAngle+(i/arcSteps)*arcFrac*Math.PI*2;
        const pr2=project(310*Math.cos(a2),-30+310*Math.sin(a2)*Math.sin(.32),310*Math.sin(a2)*Math.cos(.32),rotY,CX,CY);
        i===0?ctx.moveTo(pr2.sx,pr2.sy):ctx.lineTo(pr2.sx,pr2.sy);
      }
      ctx.strokeStyle=gws.chirp?'rgba(160,200,255,.85)':'rgba(120,170,240,.65)';
      ctx.lineWidth=gws.chirp?2.2:1.5;ctx.shadowBlur=gws.chirp?14:8;ctx.shadowColor='rgba(140,180,255,.6)';ctx.stroke();ctx.shadowBlur=0;ctx.restore();

      // Subtle GW label
      if(gws.amp>0.3){
        ctx.save();ctx.globalAlpha=ral*gws.amp*.3;ctx.font=`${Math.max(7,8*Math.min(CX/700,1))}px 'Cinzel',serif`;ctx.textAlign='center';ctx.fillStyle='rgba(140,190,255,.6)';ctx.fillText('GW150914',CX,CY-CY*.49);ctx.restore();
      }
    };

    const draw=()=>{
      const W=canvas.width, H=canvas.height;
      const CX=W*.5, CY=H*.60;
      s.t++;
      const rotY=s.t*ROTY;

      // BG
      ctx.fillStyle='rgba(4,2,1,1)';ctx.fillRect(0,0,W,H);
      const bg=ctx.createRadialGradient(CX,CY,50,CX,CY,Math.min(W,H)*.72);
      bg.addColorStop(0,'rgba(200,175,90,.036)');bg.addColorStop(.7,'rgba(0,0,0,0)');
      ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

      stars.forEach(st=>{const sc=FOV/(FOV+st.z);ctx.beginPath();ctx.arc(W*.5+(st.x-W*.5)*sc,H*.5+(st.y-H*.5)*sc,st.r*sc,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,220,${st.op*sc})`;ctx.fill();});

      // Particles
      const proj=particles.map(p=>{
        if(s.explode){p.x+=(p.x-CX%W)*.05+(Math.random()-.5)*5;p.y+=(p.y-H*.5)*.05+(Math.random()-.5)*5;p.z+=(Math.random()-.5)*7;}
        else if(s.t<SPAWN){p.x+=(p.tx-p.x)*.065;p.y+=(p.ty-p.y)*.065;p.z+=(p.tz-p.z)*.065;}
        else{const d=Math.sin(s.t*.016+p.phase)*2.4;p.x=p.tx+d*Math.cos(p.phase);p.y=p.ty+d*Math.sin(p.phase)*.5;p.z=p.tz+Math.sin(s.t*.013+p.phase*1.3)*3.8;}
        return {...project(p.x,p.y,p.z,rotY,CX,CY),p};
      });
      proj.sort((a,b)=>a.rz-b.rz);
      proj.forEach(({sx,sy,scale,p})=>{
        if(sx<-100||sx>W+100||sy<-100||sy>H+100)return;
        const rv=p.size*scale,al=p.baseOpacity*Math.min(1,s.t/55)*scale*1.5;
        const pulse=1+Math.sin(s.t*.033+p.phase)*.1;
        if(['quill','face','crown','halo'].includes(p.type)){ctx.beginPath();ctx.arc(sx,sy,rv*4*pulse,0,Math.PI*2);ctx.fillStyle=`rgba(240,210,80,${al*.13})`;ctx.fill();}
        ctx.beginPath();ctx.arc(sx,sy,rv*pulse,0,Math.PI*2);
        ctx.fillStyle=hA(p.color.startsWith('#')?p.color:'#d0b050',al);ctx.fill();
      });

      // ── RING I: Planets + Hydrogen Spectrum ──
      if(s.t>30){
        const ral=Math.min((s.t-30)/50,1);
        NAVAGRAHA.forEach(pl=>{
          const a=pl.phase+s.t*pl.speed;
          const pr=project(190*Math.cos(a),-80+190*Math.sin(a)*Math.sin(.18),190*Math.sin(a)*Math.cos(.18),rotY,CX,CY);
          if(pr.scale<.15)return;
          ctx.save();ctx.globalAlpha=ral*Math.min(pr.scale*1.8,1);drawPlanet(ctx,pr.sx,pr.sy,pr.scale,pl);ctx.restore();
        });
        H_LINES.forEach((hl,i)=>{
          const a=hl.phase+s.t*.0009;
          const pr=project(190*Math.cos(a),-80+190*Math.sin(a)*Math.sin(.18),190*Math.sin(a)*Math.cos(.18),rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.8,1);if(al<.04)return;
          const slotStart=i*(H_PERIOD/4);
          const phase=s.t%H_PERIOD;
          const w=phase-slotStart;
          const isFlashing=w>=0&&w<H_FLASH;
          const fb=isFlashing?Math.sin((w/H_FLASH)*Math.PI):0;
          ctx.save();ctx.globalAlpha=al*(isFlashing?1:.15);
          const sz=Math.max(8,11*pr.scale);
          ctx.font=`bold ${sz}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
          if(isFlashing){
            const gr=ctx.createRadialGradient(pr.sx,pr.sy,0,pr.sx,pr.sy,sz*2.2);
            gr.addColorStop(0,hl.glow+fb*.4+')');gr.addColorStop(1,hl.glow+'0)');
            ctx.beginPath();ctx.arc(pr.sx,pr.sy,sz*2.2,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();
            ctx.shadowBlur=18+fb*22;ctx.shadowColor=hl.col;ctx.fillStyle=hl.col;
            ctx.fillText('✦',pr.sx,pr.sy);
            if(fb>0.45){ctx.save();ctx.globalAlpha=fb*.65;ctx.font=`${Math.max(6,7*pr.scale)}px 'Cinzel',serif`;ctx.fillStyle=hl.col;ctx.fillText(hl.nm+'nm',pr.sx,pr.sy+sz*1.6);ctx.restore();}
          } else {
            ctx.fillStyle='rgba(200,175,90,.18)';ctx.fillText('✦',pr.sx,pr.sy);
          }
          ctx.restore();
        });
      }

      // ── RING II: GW waveform + orbiting symbols ──
      if(s.t>55){
        const ral=Math.min((s.t-55)/50,1);
        // GW ring chirp
        drawGWRing(s.t,rotY,CX,CY,ral);

        // Orbiting symbols
        ring2syms.forEach(orb=>{
          const a=orb.phase+s.t*orb.speed;
          const pr=project(310*Math.cos(a),-30+310*Math.sin(a)*Math.sin(.32),310*Math.sin(a)*Math.cos(.32),rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.5,.7);if(al<.04)return;
          const gws=gwState(s.t);
          const bright=gws.amp*(0.4+orb.idx/orb.total*.3);
          ctx.save();ctx.globalAlpha=al*(bright>0.05?Math.min(1,.12+bright):.12);
          ctx.font=`${(orb.ch.length>3?7:10)*pr.scale}px 'Cinzel',serif`;
          ctx.textAlign='center';ctx.textBaseline='middle';
          if(gws.merger){ctx.shadowBlur=16;ctx.shadowColor='rgba(180,200,255,.8)';ctx.fillStyle='rgba(200,220,255,.9)';}
          else if(bright>0.1){ctx.fillStyle='rgba(140,190,215,0.7)';}
          else{ctx.fillStyle='rgba(140,190,215,0.2)';}
          ctx.fillText(orb.ch,pr.sx,pr.sy);ctx.restore();
        });
      }

      // ── RING III: Morse blinker (◈) + filler ──
      if(s.t>80){
        const ral=Math.min((s.t-80)/60,1);
        ring3syms.forEach(orb=>{
          const a=orb.phase+s.t*orb.speed;
          const pr=project(430*Math.cos(a),430*Math.sin(a)*Math.sin(.5),430*Math.sin(a)*Math.cos(.5),rotY,CX,CY);
          const al=ral*Math.min(pr.scale*1.8,.6);if(al<.04)return;
          ctx.save();ctx.globalAlpha=al*.3;ctx.font=`${9*pr.scale}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(200,175,90,.3)';ctx.fillText(orb.ch,pr.sx,pr.sy);ctx.restore();
        });

        // ◈ — the Morse blinker (no label, no hint)
        const morseAngle=Math.PI/2+s.t*.00035;
        const mPr=project(430*Math.cos(morseAngle),430*Math.sin(morseAngle)*Math.sin(.5),430*Math.sin(morseAngle)*Math.cos(.5),rotY,CX,CY);
        const mAl=ral*Math.min(mPr.scale*1.8,.95);
        if(mAl>0.04){
          const ms=morseState(s.t);
          ctx.save();ctx.globalAlpha=mAl*(ms.on?1:.15);
          const sz=Math.max(10,17*mPr.scale);
          ctx.font=`bold ${sz}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
          if(ms.on){
            const og=ctx.createRadialGradient(mPr.sx,mPr.sy,0,mPr.sx,mPr.sy,sz*2.5);
            og.addColorStop(0,'rgba(240,200,80,.3)');og.addColorStop(1,'rgba(240,200,80,0)');
            ctx.beginPath();ctx.arc(mPr.sx,mPr.sy,sz*2.5,0,Math.PI*2);ctx.fillStyle=og;ctx.fill();
            ctx.shadowBlur=22+ms.pct*18;ctx.shadowColor='rgba(240,200,80,.95)';ctx.fillStyle='rgba(255,225,60,1)';
          } else {
            ctx.fillStyle='rgba(200,175,90,.22)';
          }
          ctx.fillText('◈',mPr.sx,mPr.sy);ctx.restore();
        }
      }

      // Ink drips
      if(s.t>90&&!s.explode){const ia=Math.min((s.t-90)/40,1);for(let i=0;i<2;i++){const pr=project(115+Math.random()*18,-190+Math.random()*10,24,rotY,CX,CY);ctx.beginPath();ctx.arc(pr.sx,pr.sy,1.8*pr.scale,0,Math.PI*2);ctx.fillStyle=`rgba(240,210,80,${ia*.4*Math.random()})`;ctx.fill();}}

      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>{ cancelAnimationFrame(rafRef.current); window.removeEventListener('resize',resize); };
  },[buildFigure,drawPlanet]);

  const handleBegin=()=>{ stateRef.current.explode=true; setExploding(true); setTimeout(onBegin,900); };
  const isHi=chosenLang==='hi';

  return(
    <div style={{position:'fixed',inset:0,zIndex:100,overflow:'hidden',background:'#040201'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>

      {/* Skip */}
      <button onClick={onSkip} style={{position:'fixed',top:20,right:20,zIndex:20,background:'transparent',border:'1px solid rgba(200,175,90,.15)',color:'rgba(200,175,90,.28)',padding:'5px 16px',fontSize:10,fontFamily:"'Cinzel',serif",cursor:'pointer',borderRadius:3,letterSpacing:2,transition:'all .25s'}}
        onMouseEnter={e=>{e.currentTarget.style.color='rgba(200,175,90,.65)';e.currentTarget.style.borderColor='rgba(200,175,90,.5)'}}
        onMouseLeave={e=>{e.currentTarget.style.color='rgba(200,175,90,.28)';e.currentTarget.style.borderColor='rgba(200,175,90,.15)'}}>
        SKIP ▸
      </button>

      {/* THE RIDDLE — fades in after 5s, stays subtle */}
      <div style={{
        position:'fixed',bottom:62,left:'50%',transform:'translateX(-50%)',
        zIndex:15,textAlign:'center',whiteSpace:'nowrap',
      }}>
        <div style={{
          fontSize:'clamp(9px,1.2vw,11px)',
          color:'rgba(200,175,90,.28)',
          fontFamily:"'Cinzel',serif",
          letterSpacing:'clamp(2px,.4vw,4px)',
          lineHeight:2,
        }}>
          {isHi
            ?<>जो सुनेंगे — सुनेंगे<br/>जो देखेंगे — देखेंगे</>
            :<>Those who know will hear.&nbsp;&nbsp;&nbsp;Those who know will see.</>
          }
        </div>
      </div>

      {/* Bottom */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'10px 24px 16px',background:'linear-gradient(0deg,rgba(4,2,1,.95) 60%,transparent)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,zIndex:10}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {players.filter(p=>!p.cpu).map((p,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',background:'rgba(200,175,90,.04)',border:'1px solid rgba(200,175,90,.1)',borderRadius:16}}>
              <span style={{fontSize:15}}>{p.char.icon}</span>
              <span style={{fontSize:9,color:'rgba(200,175,90,.38)',fontFamily:"'Cinzel',serif",letterSpacing:1}}>{p.name}</span>
            </div>
          ))}
        </div>
        {done
          ?<button onClick={handleBegin} disabled={exploding} style={{background:exploding?'transparent':'linear-gradient(180deg,rgba(200,175,90,.2),rgba(200,175,90,.07))',border:'1.5px solid rgba(200,175,90,.45)',color:'#f0d050',padding:'11px 32px',fontSize:12,fontFamily:"'Cinzel',serif",cursor:exploding?'default':'pointer',borderRadius:4,letterSpacing:4,animation:exploding?'none':'pulse 2.5s ease infinite'}}>
              {exploding?'✦':'▸ '+(isHi?'खेल आरंभ':'BEGIN')}
            </button>
          :<div style={{fontSize:8,color:'rgba(200,175,90,.18)',letterSpacing:3,fontFamily:"'Cinzel',serif",animation:'pulse 3s ease infinite'}}>
              {isHi?'अग्रसंधानी खुल रही है...':'AGRASANDHANI OPENS...'}
            </div>
        }
      </div>
    </div>
  );
}


/* Yama Image — put yama.png in /public folder */
function YamaIcon({size=80}){
  return <div style={{width:size,height:size*1.3,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <img src="/yama.png" alt="Yama - God of Death" style={{width:"100%",height:"100%",objectFit:"contain",filter:"drop-shadow(0 0 25px rgba(200,40,40,.5)) drop-shadow(0 0 50px rgba(160,40,40,.3))",borderRadius:8}}/>
  </div>;
}


// ═══ SINE WAVE BACKGROUND — animated sacred geometry waves ═══
function SineWaveBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const WAVES = [
      { amp: 38, freq: 0.012, speed: 0.018, phase: 0,    color: 'rgba(200,160,60,.10)',  width: 1.5, yOff: 0.35 },
      { amp: 22, freq: 0.018, speed: 0.026, phase: 1.2,  color: 'rgba(200,160,60,.07)',  width: 1.0, yOff: 0.45 },
      { amp: 50, freq: 0.008, speed: 0.012, phase: 2.4,  color: 'rgba(160,120,60,.06)',  width: 2.0, yOff: 0.55 },
      { amp: 28, freq: 0.022, speed: 0.032, phase: 3.6,  color: 'rgba(240,200,80,.05)',  width: 0.8, yOff: 0.65 },
      { amp: 60, freq: 0.006, speed: 0.008, phase: 4.8,  color: 'rgba(180,140,60,.04)',  width: 2.5, yOff: 0.50 },
      // Subtle Om-like circular resonance wave
      { amp: 15, freq: 0.030, speed: 0.045, phase: 0.8,  color: 'rgba(240,200,80,.06)',  width: 0.6, yOff: 0.38 },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 1;

      WAVES.forEach(w => {
        const y0 = canvas.height * w.yOff;
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.width;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(200,160,60,.12)';

        for (let x = 0; x <= canvas.width; x += 2) {
          // Layered sine: primary + harmonic for organic feel
          const y = y0
            + Math.sin(x * w.freq + t * w.speed + w.phase) * w.amp
            + Math.sin(x * w.freq * 2.1 + t * w.speed * 1.4 + w.phase) * (w.amp * 0.3);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0, opacity: 0.8,
    }}/>
  );
}

function InstaBadge(){
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

/* ═══ SFX ═══ */
function useSound(){
  const ctx=useRef(null);
  const gc=useCallback(()=>{if(!ctx.current)try{ctx.current=new(window.AudioContext||window.webkitAudioContext)()}catch(e){};return ctx.current},[]);
  return useCallback((type)=>{
    try{const c=gc();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);const t=c.currentTime;
    if(type==="dice"){o.type="square";o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(600,t+.05);o.frequency.exponentialRampToValueAtTime(150,t+.15);g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.01,t+.2);o.start(t);o.stop(t+.2)}
    else if(type==="snake"){o.type="sawtooth";o.frequency.setValueAtTime(800,t);o.frequency.exponentialRampToValueAtTime(80,t+.6);g.gain.setValueAtTime(.07,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);o.start(t);o.stop(t+.7)}
    else if(type==="ladder"){o.type="sine";o.frequency.setValueAtTime(400,t);g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.start(t);o.stop(t+.3)}
    else if(type==="dilemma"){o.type="sine";o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(80,t+.8);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+1);o.start(t);o.stop(t+1)}
    else if(type==="victory"){o.type="sine";o.frequency.setValueAtTime(523,t);g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.8);o.start(t);o.stop(t+.8)}
    else if(type==="move"){o.type="sine";o.frequency.setValueAtTime(350,t);g.gain.setValueAtTime(.03,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);o.start(t);o.stop(t+.08)}
    else if(type==="yamaLaugh"){
      // Terrifying evil laugh — Thanos-like, 6 staccato HA pulses with sub-bass
      // Layer 1: Main laugh pulses (pitched voice-like)
      o.type="sawtooth";
      const pulses=[[0,.22,180],[.15,.03,0],[.22,.20,160],[.37,.03,0],[.42,.18,145],[.55,.03,0],[.60,.15,135],[.72,.03,0],[.77,.12,125],[.90,.03,0],[.95,.08,110]];
      pulses.forEach(([time,vol,freq])=>{g.gain.setValueAtTime(vol,t+time);if(freq)o.frequency.setValueAtTime(freq,t+time)});
      g.gain.exponentialRampToValueAtTime(.001,t+1.5);o.start(t);o.stop(t+1.6);
      // Layer 2: Low growl undertone
      const o2=c.createOscillator(),g2=c.createGain();o2.connect(g2);g2.connect(c.destination);
      o2.type="triangle";g2.gain.setValueAtTime(.12,t);
      o2.frequency.setValueAtTime(85,t);o2.frequency.setValueAtTime(55,t+.8);o2.frequency.setValueAtTime(35,t+1.4);
      g2.gain.exponentialRampToValueAtTime(.001,t+1.5);o2.start(t);o2.stop(t+1.6);
      // Layer 3: High sinister wheeze between pulses
      const o3=c.createOscillator(),g3=c.createGain();o3.connect(g3);g3.connect(c.destination);
      o3.type="sine";o3.frequency.setValueAtTime(600,t);o3.frequency.setValueAtTime(400,t+1.4);
      g3.gain.setValueAtTime(.02,t);g3.gain.setValueAtTime(.04,t+.3);g3.gain.setValueAtTime(.02,t+.6);g3.gain.setValueAtTime(.03,t+.9);
      g3.gain.exponentialRampToValueAtTime(.001,t+1.5);o3.start(t);o3.stop(t+1.6);
    }
    else if(type==="chime"){
      // Soft angelic chime — ascending harmonics, louder
      o.type="sine";g.gain.setValueAtTime(.12,t);
      o.frequency.setValueAtTime(523,t);o.frequency.setValueAtTime(659,t+.2);o.frequency.setValueAtTime(784,t+.4);o.frequency.setValueAtTime(1047,t+.6);
      g.gain.exponentialRampToValueAtTime(.001,t+1);o.start(t);o.stop(t+1);
      const o2=c.createOscillator(),g2=c.createGain();o2.connect(g2);g2.connect(c.destination);
      o2.type="sine";g2.gain.setValueAtTime(.08,t+.1);
      o2.frequency.setValueAtTime(1047,t+.1);o2.frequency.setValueAtTime(1319,t+.3);o2.frequency.setValueAtTime(1568,t+.5);
      g2.gain.exponentialRampToValueAtTime(.001,t+.5);o2.start(t+.05);o2.stop(t+.5);
    }
    }catch(e){}
  },[gc]);
}

function Naga({x1,y1,x2,y2,id}){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy),nx=-dy/len,amp=len*.16;
  const hue=["#4a3020","#3a2818","#503828","#3a2015","#453020"][id%5];
  const glow=["rgba(180,60,30,.12)","rgba(160,50,20,.1)","rgba(140,40,10,.12)"][id%3];
  // Sinuous body
  let body=`M ${x1} ${y1}`;
  for(let i=1;i<=8;i++){const t=i/8,s=i%2===0?1:-1;const taper=1-t*.4;
    body+=` Q ${x1+dx*((i-.5)/8)+nx*amp*s*taper} ${y1+dy*((i-.5)/8)+(dx/len)*amp*s*taper} ${x1+dx*t} ${y1+dy*t}`}
  const hx=x1,hy=y1;
  // Hood spread
  const hoodL=`M ${hx-2} ${hy} Q ${hx-4} ${hy-3} ${hx-3.5} ${hy-5} Q ${hx-2} ${hy-6.5} ${hx} ${hy-6}`;
  const hoodR=`M ${hx+2} ${hy} Q ${hx+4} ${hy-3} ${hx+3.5} ${hy-5} Q ${hx+2} ${hy-6.5} ${hx} ${hy-6}`;
  return(<g opacity=".5">
    {/* Body glow */}
    <path d={body} fill="none" stroke={glow} strokeWidth="5" strokeLinecap="round" opacity=".4"/>
    {/* Body shadow */}
    <path d={body} fill="none" stroke="rgba(0,0,0,.5)" strokeWidth="4.5" strokeLinecap="round"/>
    {/* Body main */}
    <path d={body} fill="none" stroke={hue} strokeWidth="3.5" strokeLinecap="round"/>
    {/* Scale pattern */}
    <path d={body} fill="none" stroke="rgba(255,200,100,.08)" strokeWidth="2.5" strokeDasharray="1,2.5" strokeLinecap="round"/>
    {/* Belly highlight */}
    <path d={body} fill="none" stroke="rgba(255,220,150,.1)" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Hood */}
    <path d={hoodL} fill={hue} stroke="rgba(200,80,30,.6)" strokeWidth=".4" opacity=".85"/>
    <path d={hoodR} fill={hue} stroke="rgba(200,80,30,.6)" strokeWidth=".4" opacity=".85"/>
    {/* Hood pattern (V shape) */}
    <path d={`M ${hx-2} ${hy-4} L ${hx} ${hy-2} L ${hx+2} ${hy-4}`} fill="none" stroke="rgba(255,200,80,.25)" strokeWidth=".4"/>
    {/* Head */}
    <ellipse cx={hx} cy={hy-1} rx="1.8" ry="1.5" fill={hue} stroke="rgba(200,100,40,.5)" strokeWidth=".3"/>
    {/* Eyes — slit pupils */}
    <ellipse cx={hx-.7} cy={hy-1.3} rx=".6" ry=".5" fill="#0a0000" stroke="rgba(255,120,30,.8)" strokeWidth=".2"/>
    <ellipse cx={hx+.7} cy={hy-1.3} rx=".6" ry=".5" fill="#0a0000" stroke="rgba(255,120,30,.8)" strokeWidth=".2"/>
    <ellipse cx={hx-.7} cy={hy-1.3} rx=".1" ry=".45" fill="rgba(255,180,30,.9)"/>
    <ellipse cx={hx+.7} cy={hy-1.3} rx=".1" ry=".45" fill="rgba(255,180,30,.9)"/>
    {/* Eye glow */}
    <circle cx={hx-.7} cy={hy-1.3} r=".8" fill="rgba(255,60,20,.1)"><animate attributeName="r" values=".6;1;.6" dur="2s" repeatCount="indefinite"/></circle>
    <circle cx={hx+.7} cy={hy-1.3} r=".8" fill="rgba(255,60,20,.1)"><animate attributeName="r" values=".6;1;.6" dur="2s" repeatCount="indefinite"/></circle>
    {/* Forked tongue */}
    <path d={`M ${hx} ${hy+.3} L ${hx} ${hy+1.8} L ${hx-.4} ${hy+2.5} M ${hx} ${hy+1.8} L ${hx+.4} ${hy+2.5}`} fill="none" stroke="#ff6060" strokeWidth=".25" strokeLinecap="round">
      <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite"/>
    </path>
    {/* Tail tip */}
    <circle cx={x2} cy={y2} r="1" fill={hue} opacity=".4"/>
  </g>);
}
function Ldr({x1,y1,x2,y2}){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy),nx=(-dy/len)*1.5,ny=(dx/len)*1.5,rungs=Math.max(4,Math.floor(len/3));
  return(<g opacity=".55"><line x1={x1+nx} y1={y1+ny} x2={x2+nx} y2={y2+ny} stroke="rgba(220,180,80,.45)" strokeWidth=".9"/><line x1={x1-nx} y1={y1-ny} x2={x2-nx} y2={y2-ny} stroke="rgba(220,180,80,.45)" strokeWidth=".9"/>{Array.from({length:rungs}).map((_,i)=>{const t=(i+1)/(rungs+1);return <line key={i} x1={x1+dx*t+nx} y1={y1+dy*t+ny} x2={x1+dx*t-nx} y2={y1+dy*t-ny} stroke="rgba(220,180,80,.3)" strokeWidth=".4"/>})}</g>);
}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;700;900&family=Yatra+One&family=Cinzel:wght@400;700;900&family=Cinzel+Decorative:wght@700;900&display=swap');
*{box-sizing:border-box;margin:0}body{margin:0;background:#0c0a07}
@keyframes dt{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}
@keyframes mp{0%,100%{text-shadow:0 0 15px rgba(240,200,80,.3)}50%{text-shadow:0 0 40px rgba(240,200,80,.7)}}
@keyframes reveal{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
@keyframes breathe{0%,100%{border-color:rgba(200,160,60,.15)}50%{border-color:rgba(200,160,60,.35)}}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes slideUp{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
@keyframes popIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}60%{transform:translate(-50%,-50%) scale(1.05)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes dharmaIn{0%{opacity:0;transform:scale(.3)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
@keyframes turnFlash{0%{opacity:0;transform:scale(.5)}20%{opacity:1;transform:scale(1.1)}80%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}
@keyframes activeGlow{0%{box-shadow:0 0 8px var(--pc),0 0 16px var(--pc)}50%{box-shadow:0 0 16px var(--pc),0 0 32px var(--pc),0 0 48px var(--pc)}100%{box-shadow:0 0 8px var(--pc),0 0 16px var(--pc)}}
@keyframes sacredGlow{0%,100%{box-shadow:0 0 4px rgba(240,200,80,.05)}50%{box-shadow:0 0 12px rgba(240,200,80,.12),0 0 24px rgba(240,200,80,.06)}}
@keyframes yamaBreath{0%{text-shadow:0 0 20px #a04040,0 0 40px #a04040}50%{text-shadow:0 0 40px #e04040,0 0 80px #a04040,0 0 120px #60202060}100%{text-shadow:0 0 20px #a04040,0 0 40px #a04040}}
@keyframes yamaReveal{0%{opacity:0;transform:scale(2);filter:blur(20px)}100%{opacity:1;transform:scale(1);filter:blur(0)}}
@keyframes yamaTextReveal{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
@keyframes waveBar{0%,100%{height:8px}50%{height:28px}}
@keyframes cymaticPulse{0%{transform:scale(.97);opacity:.08}50%{transform:scale(1.03);opacity:.2}100%{transform:scale(.97);opacity:.08}}
@keyframes cgWrite{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
@keyframes cgEntry{0%{opacity:0;transform:translateX(-10px)}100%{opacity:1;transform:translateX(0)}}
@keyframes cgScaleShake{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-1.5deg)}75%{transform:rotate(1.5deg)}}
@keyframes cgGoldPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.6) drop-shadow(0 0 6px rgba(240,200,80,.8))}}
@keyframes mokshaAscend{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-120vh) scale(0.1);opacity:0}}
@keyframes mokshaLotus{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.15) rotate(10deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes mokshaBeam{0%{transform:scaleY(0);opacity:0;transform-origin:bottom}100%{transform:scaleY(1);opacity:1;transform-origin:bottom}}
@keyframes yamaRise{0%{transform:translateY(100%) scale(0.5);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes yamaFlame{0%,100%{transform:scaleY(1) skewX(0deg)}33%{transform:scaleY(1.1) skewX(-3deg)}66%{transform:scaleY(.95) skewX(2deg)}}
@keyframes yamaChain{0%{stroke-dashoffset:200}100%{stroke-dashoffset:0}}
@keyframes cymaticRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes diceRoll{0%{transform:rotate(0deg) scale(1)}25%{transform:rotate(90deg) scale(1.2)}50%{transform:rotate(180deg) scale(.9)}75%{transform:rotate(270deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}
@keyframes cymaticFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes nagaSlither{0%{d:path('M0,20 Q15,5 30,20 T60,20')}50%{d:path('M0,20 Q15,35 30,20 T60,20')}100%{d:path('M0,20 Q15,5 30,20 T60,20')}}
@keyframes tokenPop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
@keyframes karmaToast{0%{opacity:0;transform:translateY(20px) scale(.8)}15%{opacity:1;transform:translateY(0) scale(1.05)}85%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-16px) scale(.9)}}
@keyframes realmGlow{0%,100%{opacity:.18}50%{opacity:.38}}
@keyframes snakePulse{0%,100%{stroke-width:1.2;opacity:.45}50%{stroke-width:2.2;opacity:1}}
@keyframes ladderShine{0%,100%{opacity:.55}50%{opacity:1;filter:brightness(1.4)}}
@keyframes bulletReveal{0%{opacity:0;transform:translateX(-12px)}100%{opacity:1;transform:translateX(0)}}
@keyframes dieAppear{0%{transform:rotateY(90deg);opacity:0}100%{transform:rotateY(0deg);opacity:1}}
@keyframes effectSlide{0%{opacity:0;transform:translateY(8px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes orbitSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}

.gb{background:transparent;border:1px solid rgba(200,160,60,.3);color:#e8c850;padding:12px 32px;font-size:14px;font-family:'Cinzel',serif;cursor:pointer;transition:all .4s;letter-spacing:3px;border-radius:2px}
.gb:hover{background:rgba(200,160,60,.08);border-color:rgba(240,200,80,.6)}
.gp{background:linear-gradient(180deg,rgba(200,160,60,.2),rgba(200,160,60,.08));border-color:rgba(200,160,60,.5)}
.gp:hover{box-shadow:0 0 25px rgba(240,200,80,.12)}
.mb-roll{position:fixed;bottom:0;left:0;right:0;padding:12px 16px;padding-bottom:max(12px,env(safe-area-inset-bottom,12px));background:linear-gradient(0deg,#0c0a07 80%,transparent);border-top:1px solid rgba(200,160,60,.15);z-index:30}
.mb-sheet{position:fixed;bottom:0;left:0;right:0;background:#1a1408;border-top:2px solid rgba(200,160,60,.35);border-radius:16px 16px 0 0;padding:16px 16px max(16px,env(safe-area-inset-bottom,16px));z-index:100;animation:slideUp .3s ease}
`;
const PG={minHeight:"100vh",background:"linear-gradient(170deg,#0c0a07,#1a1408,#0c0a07)",fontFamily:"'Cinzel',serif",color:"#e8c850",position:"relative",overflow:"hidden"};

// ═══ useIsMobile ═══
function useIsMobile(){
  const[m,setM]=useState(typeof window!=='undefined'&&window.innerWidth<640);
  useEffect(()=>{
    const fn=()=>setM(window.innerWidth<640);
    window.addEventListener('resize',fn,{passive:true});
    return()=>window.removeEventListener('resize',fn);
  },[]);
  return m;
}

// ═══ AUTH HOOK ═══
function useAuth(){
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
function GoogleIcon(){return <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>}
function AppleIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="#e8c850"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>}

// ═══ VEDIC ASTROLOGY — Rashi (Sun Sign) + Nakshatra data ═══
const RASHI=[
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
function getZodiac(month,day){
  const dates=[[1,20,"♑"],[2,19,"♒"],[3,20,"♓"],[4,20,"♈"],[5,21,"♉"],[6,21,"♊"],[7,22,"♋"],[8,23,"♌"],[9,23,"♍"],[10,23,"♎"],[11,22,"♏"],[12,22,"♐"],[12,31,"♑"]];
  for(let i=0;i<dates.length;i++){if(month<dates[i][0]||(month===dates[i][0]&&day<=dates[i][1]))return RASHI.find(r=>r.icon===dates[i][2])}
  return RASHI[9]; // Capricorn default
}

export default function MokshaPatam108(){
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
  const isMobile=useIsMobile();
  const[showMultiplayer,setShowMultiplayer]=useState(false); // secret: long-press 5s on PLAY ONLINE
  const[showComingSoon,setShowComingSoon]=useState(false);
  const[longPressPct,setLongPressPct]=useState(0);
  const longPressRaf=useRef(null);
  const longPressStart=useRef(null);
  const[guestUnlocked,setGuestUnlocked]=useState(false);
  const guestBuf=useRef('');
  // ── Online game session ──────────────────────────────────────────────────
  const[onlineRoomId,setOnlineRoomId]=useState(null);
  const[myPlayerIndex,setMyPlayerIndex]=useState(null);
  const isOnline=!!onlineRoomId;
  const lastAppliedSeqRef=useRef(-1);

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
  const[opponentDice,setOpponentDice]=useState(null); // {diceVal, grahaIdx, playerName} shown after opponent rolls
  const[msg,setMsg]=useState("");
  const[dil,setDil]=useState(null);
  const[win,setWin]=useState(null);
  const[showPostGame,setShowPostGame]=useState(false);
  const[pendingPlayers,setPendingPlayers]=useState(null); // held during CG intro
  // ── Chitragupta state ──
  const[cgEntries,setCgEntries]=useState([]);
  const[showMoksha,setShowMoksha]=useState(false);
  const cgEntryId=useRef(0);
  const[busy,setBusy]=useState(false);
  const[karmaToasts,setKarmaToasts]=useState([]); // [{id,label,color,icon}]
  const karmaToastId=useRef(0);
  const gameReadyRef=useRef(false); // prevents timer auto-roll on game init
  const[lastRollBy,setLastRollBy]=useState(null);
  const[diceReveal,setDiceReveal]=useState(null);        // {name,icon,color} for "ROLLED" display
  const[bgMuted,setBgMuted]=useState(false);             // background music/SFX mute
  const[showMobileMenu,setShowMobileMenu]=useState(false); // bottom sheet menu on mobile
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
  const play=useCallback((t)=>{if(!muted&&!bgMuted)sfx(t)},[muted,bgMuted,sfx]);

  // ── Online multiplayer hook ──────────────────────────────────────────────
  const {
    remoteGameState, broadcastState: onlineBroadcast,
    broadcastRolling: _broadcastRolling, broadcastDilemmaPick: _broadcastDilemmaPick, broadcastEmoji,
    submitTurn: _submitTurn, isConnected: onlineConnected, reconnectAttempts,
  } = useMultiplayer({
    roomId: onlineRoomId,
    userId: auth?.user?.id,
    playerName: players[myPlayerIndex ?? 0]?.name || '',
    myPlayerIndex: myPlayerIndex ?? 0,
    enabled: isOnline,
  });
  // Safe no-ops when offline so doRoll deps stay stable
  const broadcastRolling = useCallback(_broadcastRolling || (()=>{}), [_broadcastRolling]);
  const broadcastDilemmaPick = useCallback(_broadcastDilemmaPick || (()=>{}), [_broadcastDilemmaPick]);
  const submitTurn = useCallback(_submitTurn || (()=>Promise.resolve()), [_submitTurn]);

  // Is it this device's turn?
  const isMyTurn = isOnline ? cur === myPlayerIndex : true;

  // doRoll ref — used by timer to avoid circular dependency
  const doRollRef = useRef(null);

  // ── 30-second turn timer (online only) ──────────────────────────────────
  const { secondsLeft: timerSecs, pct: timerPct, isDanger: timerDanger, isWarning: timerWarn } = useTurnTimer({
    isActive: isOnline && isMyTurn && !busy && !dil && !win && players.length>0 && gameReadyRef.current,
    timeoutSeconds: 30,
    onTimeout: ()=>{ doRollRef.current?.(true); },
  });

  // Timer warning sound — 3 beeps at 5s remaining (online only)
  const prevTimerDangerRef = useRef(false);
  useEffect(()=>{
    if(!isOnline||!isMyTurn)return;
    if(timerDanger&&!prevTimerDangerRef.current&&!muted){
      try{
        const ctx=new(window.AudioContext||window.webkitAudioContext)();
        [0,0.18,0.36].forEach((delay,i)=>{
          const o=ctx.createOscillator(),g=ctx.createGain();
          o.connect(g);g.connect(ctx.destination);
          o.type='sine';
          o.frequency.value=i===1?1320:880;
          g.gain.setValueAtTime(0.12,ctx.currentTime+delay);
          g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+delay+0.14);
          o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+0.15);
        });
      }catch(e){}
    }
    prevTimerDangerRef.current=timerDanger;
  },[timerDanger,isOnline,isMyTurn,muted]);

  // Opponent position animation — animate opponent piece step-by-step
  const [displayPos, setDisplayPos] = useState([]);
  const animatingOpponentRef = useRef(false);
  useEffect(()=>{
    if(!isOnline||!remoteGameState?.pos)return;
    const newPos=remoteGameState.pos;
    setDisplayPos(prev=>{
      if(prev.length===0)return newPos;
      const movedIdx=prev.findIndex((p,i)=>p!==newPos[i]&&i!==myPlayerIndex);
      if(movedIdx<0)return newPos;
      const from=prev[movedIdx],to=newPos[movedIdx];
      if(from===to||animatingOpponentRef.current)return newPos;
      animatingOpponentRef.current=true;
      const steps=Math.abs(to-from);const dir=to>from?1:-1;
      let step=0;
      const animate=()=>{
        step++;
        setDisplayPos(dp=>{const nd=[...dp];nd[movedIdx]=from+dir*step;return nd;});
        if(step<steps)setTimeout(animate,180);
        else animatingOpponentRef.current=false;
      };
      setTimeout(animate,200);
      return prev;
    });
  },[isOnline,remoteGameState?.pos,myPlayerIndex]); // eslint-disable-line

  // Apply remote game state when a new turn arrives from Supabase
  useEffect(()=>{
    if(!isOnline||!remoteGameState)return;
    const seq=remoteGameState.turnSeq??-1;
    if(seq<=lastAppliedSeqRef.current)return;
    lastAppliedSeqRef.current=seq;
    if(remoteGameState.cur===myPlayerIndex){
      setCur(remoteGameState.cur??0);
      setBusy(false);
      return;
    }
    setPos(remoteGameState.pos||[]);
    setPunya(remoteGameState.punya||[]);
    setPapa(remoteGameState.papa||[]);
    setShieldA(remoteGameState.shieldA||[]);
    setSkipA(remoteGameState.skipA||[]);
    setCur(remoteGameState.cur??0);
    if(remoteGameState.win!==null&&remoteGameState.win!==undefined)setWin(remoteGameState.win);
    if(remoteGameState.dil)setDil(remoteGameState.dil); else setDil(null);
    setBusy(false);
  },[isOnline,remoteGameState?.turnSeq,myPlayerIndex]); // eslint-disable-line

  // Toggle voice mute
  const toggleMute=useCallback(()=>{
    setMuted(m=>{
      if(!m){ambient.stop();VoiceEngine.stop()}
      return !m;
    });
  },[ambient]);

  // Toggle background music/SFX mute
  const toggleBG=useCallback(()=>{
    setBgMuted(m=>{
      if(!m)ambient.duck(); else ambient.unduck();
      return !m;
    });
  },[ambient]);

  // Haptic feedback (Capacitor — graceful no-op on web)
  const haptic=useCallback((style='Medium')=>{
    try{
      // Dynamic import so it doesn't break web builds
      import('@capacitor/haptics').then(({Haptics,ImpactStyle})=>{
        Haptics.impact({style:ImpactStyle[style]||ImpactStyle.Medium});
      }).catch(()=>{});
    }catch(e){}
  },[]);

  // ── Chitragupta helpers ──
  const addCGEntry=useCallback((type,sq,detail)=>{
    const id=++cgEntryId.current;
    setCgEntries(e=>[...e.slice(-29),{id,type,sq,detail,ts:Date.now()}]);
  },[]);

  // Show a floating karma change toast (punya/papa delta)
  const showKarmaToast=useCallback((playerName,delta,type,icon)=>{
    const id=++karmaToastId.current;
    const isPunya=type==='punya';
    const label=`${delta>0?'+':''}${delta} ${isPunya?'पुण्य':'पाप'}`;
    const color=isPunya?'#f0d050':'#e06030';
    setKarmaToasts(t=>[...t.slice(-3),{id,label,color,icon,playerName}]);
    setTimeout(()=>setKarmaToasts(t=>t.filter(x=>x.id!==id)),2800);
  },[]);

  const speakCG=useCallback((key,delayMs=600)=>{
    if(muted)return;
    setTimeout(()=>{
      if(!VoiceEngine.speaking) VoiceEngine.speakChitragupta(key,chosenLang);
    },delayMs);
  },[muted,chosenLang]);

  const eventCallback=useRef(null);
  const voiceTimerRef=useRef(null);
  const yamaTimerRef=useRef(null);
  const autoAdvanceTimerRef=useRef(null);
  const showEvent = useCallback((popup, onDismiss) => {
    // Kill ANY pending or playing voice + previous auto-advance
    if(voiceTimerRef.current){clearTimeout(voiceTimerRef.current);voiceTimerRef.current=null}
    if(autoAdvanceTimerRef.current){clearTimeout(autoAdvanceTimerRef.current);autoAdvanceTimerRef.current=null}
    if(yamaTimerRef.current){clearTimeout(yamaTimerRef.current);yamaTimerRef.current=null}
    VoiceEngine.stop();
    try{window.speechSynthesis.cancel()}catch(e){}
    setEventPopup(popup);
    eventCallback.current=onDismiss||null;
    if(!muted&&popup.subtitle){
      if(!bgMuted)ambient.duck();
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
          VoiceEngine.speakNarrator(popup.subtitle,chosenLang,null);
        }
      },200);
    }
    // Graha popups auto-advance after 8s so busy never gets stuck
    if(popup.type==="graha"&&onDismiss){
      autoAdvanceTimerRef.current=setTimeout(()=>{
        autoAdvanceTimerRef.current=null;
        if(eventCallback.current){
          const cb=eventCallback.current;eventCallback.current=null;
          setEventPopup(null);
          setTimeout(()=>cb(),150);
        }
      },8000);
    }
  }, [muted,chosenLang,ambient]);
  const dismissEvent = useCallback(() => {
    // Cancel any pending voice timeout + stop any playing voice
    if(voiceTimerRef.current){clearTimeout(voiceTimerRef.current);voiceTimerRef.current=null}
    if(autoAdvanceTimerRef.current){clearTimeout(autoAdvanceTimerRef.current);autoAdvanceTimerRef.current=null}
    if(yamaTimerRef.current){clearTimeout(yamaTimerRef.current);yamaTimerRef.current=null}
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
    gameReadyRef.current=false; // block timer until game is settled
    setPos(Array(n).fill(1));setDisplayPos(Array(n).fill(1));setPunya(Array(n).fill(0));setPapa(Array(n).fill(0));
    setShieldA(Array(n).fill(false));setSkipA(Array(n).fill(false));
    setCur(0);setWin(null);setHist([]);setRv(null);setGv(null);setLastRollBy(null);setDiceReveal(null);setBusy(false);setDil(null);setUsedDharma([]);
    setCgEntries([]);setShowMoksha(false);setShowPostGame(false);
    setMsg(`${pList[0].name} the ${pList[0].char.name} — your journey begins.`);
    gameStats.current={startTime:Date.now(),turns:0,snakes:0,ladders:0,dharma:0,riddlesC:0,riddlesW:0,highest:1,ashtanga:false,rejected:0,grahaHits:{sun:0,moon:0,mars:0,mercury:0,jupiter:0,venus:0,saturn:0,rahu:0,ketu:0}};
    navigateTo("game");
    setTimeout(()=>{ gameReadyRef.current=true; },3000); // allow timer after 3s
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

  const doRoll=useCallback((autoRoll=false)=>{
    if(dil||win||busy||players.length===0)return;
    if(isOnline&&!isMyTurn)return; // online: only active player rolls
    if(autoRoll&&!gameReadyRef.current)return; // block timer auto-roll during init
    if(skipA[cur]){const ns=[...skipA];ns[cur]=false;setSkipA(ns);setMsg(`${players[cur].name}'s turn is skipped.`);setCur(c=>(c+1)%nP);return}
    // Kill ALL audio before rolling
    if(voiceTimerRef.current){clearTimeout(voiceTimerRef.current);voiceTimerRef.current=null}
    if(yamaTimerRef.current){clearTimeout(yamaTimerRef.current);yamaTimerRef.current=null}
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
    if(!onSacredPath&&g.fx==="moon"){nPunya[cur]+=1;extras.push("+1 Punya");showKarmaToast(pName,1,'punya','🌙');
      grahaStory=`${pName}, you rolled Chandra, the Moon! Lunar grace purifies your soul. You receive +1 PUNYA. Your karma grows lighter.`}
    if(!onSacredPath&&g.fx==="jupiter"){for(let i=0;i<nP;i++){if(nPos[i]<101)nPunya[i]+=1};extras.push("ALL +1 Punya (below sacred path)");showKarmaToast('ALL',1,'punya','♃');
      grahaStory=`${pName}, you rolled Brihaspati, Jupiter! The divine guru blesses seekers on the board. +1 PUNYA for all below the sacred path.`}
    if(!onSacredPath&&g.fx==="venus"){nShield[cur]=true;extras.push("Shield granted");
      grahaStory=`${pName}, you rolled Shukra, Venus! The guru of Asuras grants you a CELESTIAL SHIELD. The next serpent that bites you will find its venom neutralized. This shield works only ONCE.`}
    if(!onSacredPath&&g.fx==="mars"){const ni=nearest(pos,cur,nP);if(ni>=0&&nPos[ni]<101){nPos[ni]=Math.max(1,nPos[ni]-3);nPapa[cur]+=1;showKarmaToast(pName,1,'papa','♂');
      extras.push(`${players[ni]?.name} -3`);
      grahaStory=`${pName}, you rolled Mangal, Mars! The warrior planet fills you with rage. ${players[ni]?.name} is PUSHED BACK 3 squares! But violence has a karmic price — you gain +1 PAPA.`}
      else{grahaStory=`${pName}, you rolled Mangal, Mars! But there's no valid target. ${ni>=0&&nPos[ni]>=101?players[ni]?.name+" is on the Sacred Path — untouchable.":"The warrior energy fades."}`}}
    if(!onSacredPath&&g.fx==="mercury"){const ni=nearest(pos,cur,nP);
      if(ni>=0&&nPos[ni]<101){const yourOldPos=oldP;const theirPos=nPos[ni];nPos[ni]=yourOldPos;newP=theirPos+tot;
        extras.push(`Swapped with ${players[ni]?.name}`);
        grahaStory=`${pName}, you rolled Budh, Mercury! The trickster planet reverses fortune. You SWAP PLACES with ${players[ni]?.name}! You were at square ${yourOldPos} — now you jump to their square ${theirPos}, then move ${tot} forward.`}
      else{grahaStory=`${pName}, you rolled Budh, Mercury! But there's no one to swap with.${ni>=0&&nPos[ni]>=101?" Seekers on the Sacred Path cannot be swapped.":""}`}}
    if(!onSacredPath&&g.fx==="saturn"){newP=Math.max(1,oldP-3)+tot;nPapa[cur]+=1;extras.push("Back 3, +1 Papa");showKarmaToast(pName,1,'papa','♄');
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
            const nextCur=(cur+1)%nP;
            if(skipDharmaCheck||(!DLM_SQ.includes(p)&&!(p>100&&p<108)))setCur(nextCur);
            // Online: write state so opponents sync
            if(isOnline){
              const gs={cur:skipDharmaCheck||(!DLM_SQ.includes(p)&&!(p>100&&p<108))?nextCur:cur,pos:[...nPos].map((v,i)=>i===cur?p:v),punya:[...nPunya],papa:[...nPapa],shieldA:[...nShield],skipA:[...nSkip],win:null,dil:null,usedDharma};
              submitTurn(gs,{moveType:"roll",diceVal:r,grahaIdx:gi}).catch(console.error);
              lastAppliedSeqRef.current=(lastAppliedSeqRef.current??0)+1;
            }
            setBusy(false);
          };

          if(SNAKES[p]){const sn=SNAKES[p];if(nShield[cur]){
            // Shield absorbs the snake
            nShield[cur]=false;eMsg=`𓆙 ${sn.skt} — Shield!`;play("ladder");showKarmaToast(pName,0,'shield','🛡');
            showEvent({icon:"🛡",title:`Shield Saved ${pName}!`,subtitle:`The serpent ${sn.skt} (${sn.en}) struck — but Shukra's shield absorbed the venom! Shield is now gone.`,color:"#d0a0c0",staticKey:"shield_save"},()=>{
              addCGEntry('punya',p,`${sn.skt} — shield`);speakCG('punya',500);
              setTimeout(()=>ambient.unduck(),2800);
              finishTurn(true);
            });
          }else{
            // Snake bites — drag player down
            const o=p;p=sn.to;eMsg=`𓆙 ${o}→${p}`;nPapa[cur]+=2;gameStats.current.snakes++;
            showKarmaToast(pName,2,'papa','𓆙');play("snake");setTimeout(()=>play("yamaLaugh"),320);haptic('Heavy');
            showEvent({icon:"𓆙",title:`${sn.skt} — ${sn.en}`,subtitle:`${pName}, the serpent of ${sn.en} caught you! ${sn.tale} Dragged from ${o} to ${p}. +2 PAPA.`,color:"#e06030",extra:`${o} → ${p}`,staticKey:"snake_hit"},()=>{
              addCGEntry('snake',p,`${sn.skt} · ${o}→${p}`);
              if(!muted){if(yamaTimerRef.current)clearTimeout(yamaTimerRef.current);yamaTimerRef.current=setTimeout(()=>{yamaTimerRef.current=null;VoiceEngine.playYamaTaunt("snake",chosenLang);},3500);}
              setTimeout(()=>ambient.unduck(),7000);
              finishTurn(true);
            });
          }}
          else if(LADDERS[p]){const ld=LADDERS[p];const o=p;p=ld.to;eMsg=`🪔 ${o}→${p}`;nPunya[cur]+=1;gameStats.current.ladders++;play("ladder");showKarmaToast(pName,1,'punya','🪔');
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
          }else{p=67;eMsg="Impure → 67";showKarmaToast(pName,-1,'papa','⚠');play("snake");play("yamaLaugh");
            showEvent({icon:"⚠",title:"Gates of Moksha REJECT You!",subtitle:`${pName}, your soul is impure! Punya (${nPunya[cur]}) < Papa (${nPapa[cur]}). Cast back to 67.`,color:"#e06030"},()=>{
              addCGEntry('reject',67,`${nPunya[cur]}P < ${nPapa[cur]}X`);
              // Popup narrator plays ~3s. Yama fires right after.
              if(!muted){if(yamaTimerRef.current)clearTimeout(yamaTimerRef.current);yamaTimerRef.current=setTimeout(()=>{yamaTimerRef.current=null;VoiceEngine.playYamaTaunt("reject",chosenLang);},3500);}
              setTimeout(()=>ambient.unduck(),7000);
              finishTurn();
            });
          }}
          else{finishTurn()}
        }
      },280);
    };

    // Show graha popup — user dismisses, then movement begins
    // On sacred path: skip graha popup entirely
    const rollInfo={r,g,name:players[cur]?.name,icon:players[cur]?.char?.icon,color:players[cur]?.char?.color||"#f0d050"};
    setDiceReveal(rollInfo);setLastRollBy(rollInfo);
    if(isOnline)broadcastRolling(players[cur]?.name); // broadcast to opponents
    setTimeout(()=>{
      setDiceReveal(null);
      if(onSacredPath){startMovement()}
      else{showEvent({icon:g.icon,title:`${g.n} · ${g.en}`,subtitle:grahaStory,color:g.color,type:"graha",staticKey:GRAHA_STATIC_KEY[g.fx]},startMovement)}
    },3000);
  },[cur,nP,dil,win,busy,punya,papa,pos,shieldA,skipA,play,players,showEvent,chosenLang,muted,isOnline,isMyTurn,usedDharma]);
  // Keep ref in sync so timer can call it without circular dependency
  doRollRef.current = doRoll;

  const solvD=(ci)=>{
    if(!dil)return;const ch=dil.c[ci],fx=ch.fx||{};
    // Broadcast choice to opponents
    if(isOnline)broadcastDilemmaPick(ci);
    const np=[...punya],npa=[...papa],nsk=[...skipA],npos=[...pos],nsh=[...shieldA];
    const pName=players[dil.pi]?.name||"Seeker";

    if(dil.ashtanga){
      // ═══ ASHTANGA RIDDLE RESULT ═══
      if(ch.k==="punya"){
        np[dil.pi]+=(fx.punya||2);showKarmaToast(pName,fx.punya||2,'punya','✓');
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
        npa[dil.pi]+=(fx.papa||1);showKarmaToast(pName,fx.papa||1,'papa','✗');
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
          // Yama fires just after yamaLaugh SFX (~1.2s)
          if(yamaTimerRef.current)clearTimeout(yamaTimerRef.current);
          yamaTimerRef.current=setTimeout(()=>{yamaTimerRef.current=null;if(!VoiceEngine.speaking)VoiceEngine.playYamaTaunt("wrong",chosenLang);},1200);
          setTimeout(()=>ambient.unduck(),5000);
        }
      }
      if(np[dil.pi]>=30&&!win){setWin(dil.pi);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory")}
      // Clear dil FIRST so useEffect cleanup doesn't kill the voice we just started
      const dilRef=dil;
      const nextCurA=(dil.pi+1)%nP;
      setDil(null);setCur(nextCurA);
      // Online: submit ashtanga result
      if(isOnline){
        const newStateA={cur:nextCurA,pos:[...npos],punya:[...np],papa:[...npa],
          shieldA:[...nsh],skipA:[...nsk],win:np[dil.pi]>=30?dil.pi:null,dil:null,usedDharma};
        submitTurn(newStateA,{moveType:'dilemma_pick',dilemmaPick:ci}).catch(console.error);
        lastAppliedSeqRef.current=(lastAppliedSeqRef.current??0)+1;
      }
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
    if(ch.k==="punya"){play("chime");showKarmaToast(pName,fx.punya||1,'punya','⚖');gameStats.current.riddlesC++;addCGEntry('dharma_p',npos[dil.pi]||1,dil.en||'');speakCG('dharma_p',600);setTimeout(()=>ambient.unduck(),3200);}
    else if(ch.k==="papa"){play("yamaLaugh");showKarmaToast(pName,fx.papa||1,'papa','⚖');gameStats.current.riddlesW++;addCGEntry('dharma_x',npos[dil.pi]||1,dil.en||'');speakCG('dharma_x',4000);setTimeout(()=>ambient.unduck(),6500);}
    if(np[dil.pi]>=30&&!win){setWin(dil.pi);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory")}
    const nextCurD=(cur+1)%nP;
    setDil(null);setCur(nextCurD);
    // Online: write state after dharma resolution
    if(isOnline){
      const newState={cur:nextCurD,pos:[...npos],punya:[...np],papa:[...npa],
        shieldA:[...nsh],skipA:[...nsk],win:np[dil.pi]>=30?dil.pi:null,dil:null,usedDharma};
      submitTurn(newState,{moveType:'dilemma_pick',dilemmaPick:ci}).catch(console.error);
      lastAppliedSeqRef.current=(lastAppliedSeqRef.current??0)+1;
    }
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
    // Online: notify THIS player when it becomes their turn
    if(isOnline&&cur===myPlayerIndex&&!p.cpu){
      // Vibrate pattern: attention pulse
      try{if(navigator.vibrate)navigator.vibrate([120,60,120,60,200]);}catch(e){}
      // Play a distinct chime so they know it's their turn
      if(!muted){
        try{
          const ctx=new(window.AudioContext||window.webkitAudioContext)();
          // Two rising tones — "your turn"
          [[523,0],[659,0.2],[784,0.4]].forEach(([freq,delay])=>{
            const o=ctx.createOscillator(),g=ctx.createGain();
            o.connect(g);g.connect(ctx.destination);
            o.type='sine';o.frequency.value=freq;
            g.gain.setValueAtTime(0.15,ctx.currentTime+delay);
            g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+delay+0.35);
            o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+0.4);
          });
        }catch(e){}
      }
    }
    // CPU auto-play after a delay
    if(p.cpu&&!dil&&!busy){
      const cpuTimer=setTimeout(()=>{doRoll()},2500);
      return()=>{clearTimeout(bannerTimer);clearTimeout(cpuTimer)};
    }
    return()=>clearTimeout(bannerTimer);
  },[cur,screen,win,players,dil,busy,isOnline,myPlayerIndex,muted]);

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
        onClose={()=>{setShowMoksha(false);setShowPostGame(true);}}
      />
    )}
    {/* ═══ POST-GAME POPUP — donate + feedback after ceremony ═══ */}
    {showPostGame&&(
      <MokshaPostGamePopup
        onClose={()=>setShowPostGame(false)}
        onNewJourney={()=>{setShowPostGame(false);navigateTo("title");setWin(null);setPlayers([]);setOnlineRoomId(null);setMyPlayerIndex(null);lastAppliedSeqRef.current=-1;ambient.stop();}}
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
    {showInfo   && <Encyclopedia onClose={()=>setShowInfo(false)}/>}
    {showGuide  && <HowToPlay    onClose={()=>setShowGuide(false)}/>}
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
  // ── Secret codes on title screen ──
  // "OM"  → opens multiplayer (private, only Rakesh)
  // "108" → reveals guest play (only when not signed in)
  const _omBuf = useRef("");
  useEffect(()=>{
    if(screen!=="title") return;
    const handler = (e) => {
      _omBuf.current = (_omBuf.current + e.key).slice(-3);
      if(_omBuf.current.toUpperCase().slice(-2) === "OM") {
        _omBuf.current = "";
        setShowMultiplayer(true);
      }
      if(_omBuf.current === "108") {
        _omBuf.current = "";
        setGuestUnlocked(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen]);

  // ── Multiplayer overlay (secret access only) ─────────────────────────────
  if(showMultiplayer) return (
    <MultiplayerLobby
      userId={auth?.user?.id}
      userName={auth?.profile?.display_name || auth?.user?.user_metadata?.full_name || "Seeker"}
      onGameStart={(players, roomId, myPlayerIndex) => {
        setShowMultiplayer(false);
        setPlayers(players);
        if(roomId){setOnlineRoomId(roomId);setMyPlayerIndex(myPlayerIndex);}
        navigateTo("chitragupta");
      }}
      onBack={() => setShowMultiplayer(false)}
    />
  );

  // ═══ COMING SOON MODAL ═══
  const comingSoonModal = showComingSoon ? (
    <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(4,3,2,.9)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"reveal .35s ease"}} onClick={()=>setShowComingSoon(false)}>
      <div style={{position:"relative",background:"linear-gradient(180deg,rgba(24,18,8,.98),rgba(10,8,4,.99))",border:"1px solid rgba(240,200,80,.12)",padding:"44px 36px 36px",textAlign:"center",maxWidth:340,width:"88%",animation:"reveal .4s cubic-bezier(.34,1.56,.64,1)"}} onClick={e=>e.stopPropagation()}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.04,pointerEvents:"none"}} viewBox="0 0 300 280">
          <circle cx={150} cy={140} r={90} fill="none" stroke="#c0a030" strokeWidth={.6}/>
          <circle cx={150} cy={140} r={55} fill="none" stroke="#c0a030" strokeWidth={.4}/>
          <polygon points="150,65 225,190 75,190" fill="none" stroke="#c0a030" strokeWidth={.5}/>
          <polygon points="150,215 225,90 75,90" fill="none" stroke="#c0a030" strokeWidth={.5}/>
        </svg>
        <div style={{fontSize:42,marginBottom:14,filter:"drop-shadow(0 0 20px rgba(240,200,80,.3))",animation:"pulse 3s ease infinite"}}>🌐</div>
        <div style={{fontFamily:"'Noto Serif Devanagari',serif",fontSize:26,color:"#f0d050",letterSpacing:2,marginBottom:4,textShadow:"0 0 24px rgba(240,200,80,.25)"}}>विश्व क्रीड</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:9,letterSpacing:6,color:"rgba(240,200,80,.35)",textTransform:"uppercase",marginBottom:20}}>Online Multiplayer</div>
        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(240,200,80,.15),transparent)",marginBottom:20}}/>
        <div style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:14,color:"rgba(200,170,80,.55)",lineHeight:2,marginBottom:8}}>Sacred journeys across the cosmos<br/>are being prepared.</div>
        <div style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:12,color:"rgba(180,150,60,.38)",lineHeight:1.9,marginBottom:24}}>Seekers worldwide will soon gather<br/>on this ancient board.</div>
        <div style={{display:"inline-block",padding:"5px 18px",background:"rgba(240,200,80,.05)",border:"1px solid rgba(240,200,80,.12)",fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:5,color:"rgba(240,200,80,.4)",textTransform:"uppercase",marginBottom:24}}>Coming Soon</div>
        <br/>
        <button onClick={()=>setShowComingSoon(false)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.14)",color:"rgba(200,160,60,.38)",padding:"8px 26px",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:3,textTransform:"uppercase",WebkitTapHighlightColor:"transparent"}}>Close ✕</button>
      </div>
    </div>
  ) : null;

  if(screen==="title")return(
    <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 20px 60px",minHeight:"100vh",overflowY:"auto"}}>
      {globalOverlays}
      {comingSoonModal}
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
              {/* Guest play — revealed by typing "108" on login screen */}
              {guestUnlocked && (
              <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid rgba(200,160,60,.08)"}}>
                <button onClick={()=>navigateTo("pickcount")} style={{
                  background:"transparent",border:"none",
                  color:"rgba(180,140,60,.35)",fontSize:10,
                  fontFamily:"'Cinzel',serif",letterSpacing:2,
                  cursor:"pointer",textDecoration:"underline",
                  textDecorationColor:"rgba(180,140,60,.2)",
                  WebkitTapHighlightColor:"transparent",
                }}>
                  Continue without signing in
                </button>
                <div style={{fontSize:8,color:"rgba(140,110,50,.25)",marginTop:4,letterSpacing:1}}>
                  Progress will not be saved
                </div>
              </div>
              )}
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

            {/* ═══ ACTION BUTTONS — clear visual hierarchy ═══ */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,width:"100%"}}>

              {/* PRIMARY: Begin Story — undeniable hero CTA */}
              <button className="gb gp" onClick={()=>{ ambient.start(); navigateTo("story"); setStoryPage(0); }}
                style={{
                  fontSize:15,padding:"15px 0",letterSpacing:3,
                  width:"100%",maxWidth:320,
                  boxShadow:"0 0 32px rgba(240,200,80,.18),0 4px 24px rgba(0,0,0,.5)",
                  position:"relative",overflow:"hidden",
                }}>
                <span style={{position:"relative",zIndex:1}}>📜 BEGIN THE JOURNEY</span>
                {/* Subtle shimmer */}
                <div style={{position:"absolute",top:0,left:"-60%",width:"40%",height:"100%",
                  background:"linear-gradient(105deg,transparent,rgba(255,255,255,.07),transparent)",
                  animation:"shimmer 3s ease infinite",pointerEvents:"none"}}/>
              </button>

              {/* Divider */}
              <div style={{display:"flex",alignItems:"center",gap:10,width:"70%",maxWidth:200,margin:"2px 0"}}>
                <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(200,160,60,.12))"}}/>
                <div style={{fontSize:7,color:"rgba(200,160,60,.18)",letterSpacing:4,fontFamily:"'Cinzel',serif"}}>OR</div>
                <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(200,160,60,.12),transparent)"}}/>
              </div>

              {/* SECONDARY: Play solo — smaller, clearly subordinate */}
              <button className="gb" onClick={()=>{ ambient.start(); navigateTo("pickcount"); }}
                style={{fontSize:11,padding:"9px 36px",letterSpacing:2,opacity:.5,
                  transition:"opacity .2s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=".75"}
                onMouseLeave={e=>e.currentTarget.style.opacity=".5"}>
                ⚡ PLAY SOLO
              </button>

              {/* TERTIARY: Play Online — ghost dim, coming soon / long-press secret */}
              <div style={{position:"relative",marginTop:6,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <button
                  onMouseDown={e=>{ e.preventDefault(); longPressStart.current=Date.now(); const tick=()=>{ const pct=Math.min((Date.now()-longPressStart.current)/5000,1); setLongPressPct(pct); if(pct<1){ longPressRaf.current=requestAnimationFrame(tick); } else { cancelAnimationFrame(longPressRaf.current); setLongPressPct(0); longPressStart.current=null; if(navigator.vibrate) navigator.vibrate([80,40,80]); setShowMultiplayer(true); } }; longPressRaf.current=requestAnimationFrame(tick); }}
                  onMouseUp={()=>{ cancelAnimationFrame(longPressRaf.current); if(longPressPct<1) setLongPressPct(0); longPressStart.current=null; }}
                  onMouseLeave={()=>{ cancelAnimationFrame(longPressRaf.current); setLongPressPct(0); longPressStart.current=null; }}
                  onTouchStart={e=>{ e.preventDefault(); longPressStart.current=Date.now(); const tick=()=>{ const pct=Math.min((Date.now()-longPressStart.current)/5000,1); setLongPressPct(pct); if(pct<1){ longPressRaf.current=requestAnimationFrame(tick); } else { cancelAnimationFrame(longPressRaf.current); setLongPressPct(0); longPressStart.current=null; if(navigator.vibrate) navigator.vibrate([80,40,80]); setShowMultiplayer(true); } }; longPressRaf.current=requestAnimationFrame(tick); }}
                  onTouchEnd={()=>{ cancelAnimationFrame(longPressRaf.current); if(longPressPct<1){ setLongPressPct(0); setShowComingSoon(true); } longPressStart.current=null; }}
                  onTouchCancel={()=>{ cancelAnimationFrame(longPressRaf.current); setLongPressPct(0); longPressStart.current=null; }}
                  onClick={()=>{ if(!longPressStart.current && longPressPct===0) setShowComingSoon(true); }}
                  style={{
                    background:"transparent",
                    border:"1px solid rgba(200,160,60,.16)",
                    color:"rgba(200,160,60,.38)",
                    padding:"8px 28px",fontSize:9,
                    fontFamily:"'Cinzel',serif",letterSpacing:4,
                    cursor:"pointer",transition:"border-color .3s,color .3s",
                    textTransform:"uppercase",userSelect:"none",WebkitUserSelect:"none",
                    position:"relative",overflow:"hidden",minWidth:180,minHeight:36,
                    touchAction:"none",WebkitTapHighlightColor:"transparent",
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(200,160,60,.3)"; e.currentTarget.style.color="rgba(200,160,60,.6)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(200,160,60,.16)"; e.currentTarget.style.color="rgba(200,160,60,.38)"; }}>
                  {/* Fill bar for long press progress */}
                  {longPressPct>0&&(
                    <div style={{
                      position:"absolute",inset:0,transformOrigin:"left",
                      background:"rgba(240,200,80,.1)",
                      transform:`scaleX(${longPressPct})`,transition:"none",
                      borderRight:"1px solid rgba(240,200,80,.45)",
                    }}/>
                  )}
                  <span style={{position:"relative",zIndex:1}}>🌐 PLAY ONLINE</span>
                </button>
                {/* Long press hint */}
                {longPressPct===0&&(
                  <div style={{fontSize:7,color:"rgba(200,160,60,.15)",letterSpacing:2,fontFamily:"'Cinzel',serif"}}>
                    COMING SOON
                  </div>
                )}
                {/* Progress label during hold */}
                {longPressPct>0&&(
                  <div style={{fontSize:8,color:"rgba(240,200,80,.55)",letterSpacing:2,fontFamily:"'Cinzel',serif",animation:"pulse 1s ease infinite"}}>
                    Hold... {Math.ceil((1-longPressPct)*5)}s
                  </div>
                )}
              </div>
            </div>

            {/* Utilities row — very subtle */}
            <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:16,flexWrap:"wrap"}}>
              <button onClick={()=>setShowGuide(true)} style={{background:"transparent",border:"none",color:"rgba(150,120,60,.35)",padding:"4px 8px",fontSize:8,fontFamily:"'Cinzel',serif",cursor:"pointer",letterSpacing:2,textTransform:"uppercase",WebkitTapHighlightColor:"transparent"}}>Rules</button>
              <div style={{color:"rgba(150,120,60,.15)",fontSize:8,alignSelf:"center"}}>·</div>
              <button onClick={()=>setShowInfo(true)} style={{background:"transparent",border:"none",color:"rgba(150,120,60,.35)",padding:"4px 8px",fontSize:8,fontFamily:"'Cinzel',serif",cursor:"pointer",letterSpacing:2,textTransform:"uppercase",WebkitTapHighlightColor:"transparent"}}>Encyclopaedia</button>
            </div>
            <div style={{marginTop:6,textAlign:"center"}}><InstaBadge/></div>
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
    <div style={{...PG,
      padding:"10px 8px",
      paddingTop:"max(10px, env(safe-area-inset-top, 10px))",
      paddingBottom:"max(20px, env(safe-area-inset-bottom, 20px))",
      paddingLeft:"max(8px, env(safe-area-inset-left, 8px))",
      paddingRight:"max(8px, env(safe-area-inset-right, 8px))",
      display:"flex",flexDirection:"column",alignItems:"center",
      WebkitOverflowScrolling:"touch",
    }}>
      {globalOverlays}
      {eventPopup&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,pointerEvents:"auto"}} onClick={dismissEvent}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"popIn .4s ease forwards",background:"linear-gradient(180deg,#2a2015,#12100a)",border:`2px solid ${eventPopup.color}50`,borderRadius:8,padding:"clamp(16px,4vw,28px) clamp(16px,4vw,36px)",textAlign:"center",maxWidth:380,width:"min(90vw,calc(100vw - 32px))",maxHeight:"85vh",overflowY:"auto",WebkitOverflowScrolling:"touch",boxShadow:`0 0 60px ${eventPopup.color}30, 0 0 120px rgba(0,0,0,.8)`}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:52,marginBottom:8,filter:`drop-shadow(0 0 20px ${eventPopup.color})`}}>{eventPopup.icon}</div>
          <div style={{fontSize:18,fontFamily:"'Yatra One',serif",color:eventPopup.color,marginBottom:4,letterSpacing:2}}>{eventPopup.title}</div>
          {eventPopup.extra&&<div style={{fontSize:16,fontWeight:900,color:eventPopup.color,marginBottom:6,letterSpacing:4}}>{eventPopup.extra}</div>}
          <div style={{fontSize:11,color:"#d0c090",lineHeight:1.9,fontStyle:"italic",opacity:.8,maxHeight:200,overflowY:"auto"}}>{eventPopup.subtitle}</div>
          <button onClick={dismissEvent} style={{marginTop:16,background:"transparent",border:`1px solid ${eventPopup.color}40`,color:eventPopup.color,padding:"12px 28px",fontSize:11,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:4,letterSpacing:2,minHeight:44,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>TAP TO CONTINUE ▸</button>
          {eventPopup.type==="graha"&&<div style={{marginTop:8,fontSize:9,opacity:.35,letterSpacing:2,fontFamily:"'Cinzel',serif"}}>auto-continues in 8s</div>}
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
      const isMyDilemma = !isOnline || dil.pi === myPlayerIndex;
      return <button key={ci} onClick={()=>isMyDilemma&&solvD(ci)}
      disabled={!isMyDilemma}
      style={{display:"block",width:"100%",background:btnBg,border:`2px solid ${btnBorder}`,color:btnColor,padding:"14px 16px",fontSize:"clamp(12px,1.4vw,14px)",fontFamily:"'Cinzel',serif",cursor:isMyDilemma?"pointer":"not-allowed",textAlign:"left",lineHeight:1.7,borderRadius:6,transition:"all .2s",letterSpacing:1,opacity:isMyDilemma?1:0.45,minHeight:52,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
      {ch.l}
      {!isMyDilemma&&<span style={{float:'right',fontSize:9,opacity:.4,fontFamily:"'Cinzel',serif"}}>Watching...</span>}
      </button>})}
      </div>
      <div style={{textAlign:"center",marginTop:14,fontSize:9,opacity:.25,letterSpacing:2}}>CHOOSE YOUR PATH WISELY</div>
      </div>
      </div>}

      {diceReveal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:185,display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .15s ease",cursor:"pointer"}} onClick={()=>setDiceReveal(null)}>
        <div style={{textAlign:"center",animation:"dharmaIn .3s ease forwards"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:14}}>
            <span style={{fontSize:22}}>{diceReveal.icon}</span>
            <span style={{fontSize:14,color:diceReveal.color,fontWeight:700,letterSpacing:1}}>{diceReveal.name}</span>
            <span style={{fontSize:11,color:"#c0b080",opacity:.5}}>rolled</span>
          </div>
          <div style={{width:110,height:110,background:"linear-gradient(135deg,#2a2015,#0c0a07)",border:"3px solid rgba(200,160,60,.7)",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:72,fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,color:"#f0d050",boxShadow:"0 0 50px rgba(240,200,80,.3), inset 0 0 20px rgba(0,0,0,.5)",margin:"0 auto 18px"}}>{diceReveal.r}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:`${diceReveal.g.color}18`,border:`1px solid ${diceReveal.g.color}50`,borderRadius:10,padding:"12px 20px"}}>
            <span style={{fontSize:30}}>{diceReveal.g.icon}</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:14,color:diceReveal.g.color,fontWeight:700,letterSpacing:1}}>{diceReveal.g.n}</div>
              <div style={{fontSize:11,color:"#c0b080",opacity:.7}}>{diceReveal.g.en}</div>
            </div>
          </div>
          <div style={{fontSize:9,color:"#c0b080",opacity:.3,marginTop:14,letterSpacing:3}}>CALCULATING KARMA…</div>
        </div>
      </div>}
      {turnBanner&&!dil&&!busy&&!diceReveal&&<div style={{position:"fixed",inset:0,zIndex:180,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        <div style={{animation:"turnFlash 2.2s ease forwards",
          background:"linear-gradient(180deg,rgba(20,16,10,.97),rgba(12,10,7,.97))",
          border:`2px solid ${isOnline&&cur===myPlayerIndex?"rgba(240,200,80,.9)":turnBanner.color+"60"}`,
          borderRadius:12,padding:"28px 52px",textAlign:"center",
          boxShadow:isOnline&&cur===myPlayerIndex
            ?`0 0 80px rgba(240,200,80,.4), 0 0 160px rgba(240,200,80,.1)`
            :`0 0 60px ${turnBanner.color}30`}}>
          <div style={{fontSize:48,marginBottom:4,filter:`drop-shadow(0 0 16px ${turnBanner.color})`}}>{turnBanner.icon}</div>
          <div style={{fontSize:24,fontFamily:"'Yatra One',serif",color:turnBanner.color,letterSpacing:3}}>{turnBanner.name}</div>
          <div style={{fontSize:isOnline&&cur===myPlayerIndex?14:11,
            letterSpacing:4,marginTop:6,fontFamily:"'Cinzel',serif",fontWeight:700,
            color:isOnline&&cur===myPlayerIndex?"#f0d050":turnBanner.cpu?"#7986cb":"rgba(240,200,80,.5)"}}>
            {turnBanner.cpu?"🤖 SPIRIT GUIDE THINKING...":
             isOnline&&cur!==myPlayerIndex?`⏳ ${turnBanner.name.split(" ")[0]}'s turn — wait...`:
             isOnline&&cur===myPlayerIndex?"✦ YOUR TURN — ROLL NOW ✦":"YOUR TURN"}
          </div>
        </div>
      </div>}
      {/* ── Desktop header — hidden on mobile ── */}
      {!isMobile&&<div style={{textAlign:"center",marginBottom:4,width:"100%"}}>
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
      </div>}

      {/* ── Mobile compact header ── */}
      {isMobile&&(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"4px 8px 6px",borderBottom:"1px solid rgba(200,160,60,.12)",marginBottom:4}}>
          <button onClick={()=>setShowMobileMenu(true)} style={{background:"rgba(200,160,60,.1)",border:"1.5px solid rgba(200,160,60,.3)",color:"#e8c850",padding:"6px 12px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:4,letterSpacing:2,minHeight:36,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
            ☰ MENU
          </button>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:14,fontFamily:"'Yatra One',serif",letterSpacing:2,color:"#f0d050",lineHeight:1}}>{cp.char.icon} मोक्ष पटम्</div>
            <div style={{fontSize:7,letterSpacing:4,opacity:.4,color:"#c0b080"}}>{rlm(pos[cur]||1)==="bhuloka"?"भूलोक":rlm(pos[cur]||1)==="antarloka"?"अन्तर्लोक":rlm(pos[cur]||1)==="svargaloka"?"स्वर्गलोक":"मोक्ष मार्ग"}</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={toggleMute} style={{background:muted?"rgba(200,80,60,.12)":"transparent",border:`1px solid ${muted?"rgba(200,80,60,.4)":"rgba(200,160,60,.2)"}`,color:muted?"#e08060":"#e8c850",padding:"5px 8px",fontSize:14,cursor:"pointer",borderRadius:4,minHeight:36,minWidth:36,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>{muted?"🔇":"🗣️"}</button>
            <button onClick={toggleBG} style={{background:bgMuted?"rgba(200,80,60,.12)":"transparent",border:`1px solid ${bgMuted?"rgba(200,80,60,.4)":"rgba(200,160,60,.2)"}`,color:bgMuted?"#e08060":"#e8c850",padding:"5px 8px",fontSize:14,cursor:"pointer",borderRadius:4,minHeight:36,minWidth:36,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>{bgMuted?"🔕":"🎵"}</button>
            {auth.user
              ?<button onClick={()=>{setShowProfile(true);setProfileTab("overview")}} style={{background:"rgba(240,200,80,.06)",border:"1px solid rgba(200,160,60,.2)",padding:2,cursor:"pointer",borderRadius:"50%",minHeight:36,minWidth:36,display:"flex",alignItems:"center",justifyContent:"center",touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
                {auth.profile?.avatar_url?<img src={auth.profile.avatar_url} alt="" style={{width:26,height:26,borderRadius:"50%"}} referrerPolicy="no-referrer"/>:<span style={{fontSize:14}}>🪷</span>}
              </button>
              :<button onClick={()=>setShowProfile(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.15)",color:"#8a7a50",padding:"4px 8px",fontSize:9,cursor:"pointer",fontFamily:"'Cinzel',serif",borderRadius:3,minHeight:36}}>Sign In</button>
            }
          </div>
        </div>
      )}

      <div style={{background:"linear-gradient(90deg,transparent,rgba(30,24,14,.6),transparent)",borderTop:"1px solid rgba(200,160,60,.2)",borderBottom:"1px solid rgba(200,160,60,.2)",padding:"8px 14px",marginBottom:4,textAlign:"center",fontSize:"clamp(10px,1.4vw,12px)",maxWidth:780,width:"100%",fontStyle:"italic",lineHeight:1.7,color:"#c0b080"}}>{msg}</div>

      {/* ── Karma strip — always visible above board ── */}
      {players.length>0&&!win&&(
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",width:"100%",maxWidth:780,marginBottom:8,padding:"0 8px"}}>
          {players.map((pl,i)=>{
            const pn=punya[i]||0,pp=papa[i]||0;
            const isActive=cur===i;const pc=pl.char.color;
            return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,
                padding:isMobile?"3px 7px":"5px 10px",borderRadius:20,
                background:isActive?`${pc}18`:"rgba(12,10,7,.7)",
                border:`1.5px solid ${isActive?pc+"60":"rgba(200,160,60,.1)"}`,
                transition:"all .3s",boxShadow:isActive?`0 0 12px ${pc}20`:"none"}}>
                <span style={{fontSize:16}}>{pl.char.icon}</span>
                <span style={{fontSize:11,color:pc,fontWeight:700,maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pl.name.split(" ")[0]}</span>
                {shieldA[i]&&<span style={{fontSize:11}}>🛡</span>}
                <span style={{width:1,height:14,background:"rgba(200,160,60,.2)",display:"inline-block"}}/>
                <span style={{fontSize:isMobile?12:13,color:"#f0d050",fontWeight:900,minWidth:16,textAlign:"center"}}>{pn}</span>
                <span style={{fontSize:9,color:"rgba(240,200,80,.5)",fontWeight:700}}>पु</span>
                <span style={{fontSize:11,color:"rgba(200,160,60,.3)"}}>·</span>
                <span style={{fontSize:isMobile?12:13,color:"#e06030",fontWeight:900,minWidth:16,textAlign:"center"}}>{pp}</span>
                <span style={{fontSize:9,color:"rgba(224,96,48,.5)",fontWeight:700}}>पा</span>
                {!isMobile&&<span style={{fontSize:9,opacity:.4}}>Sq {pos[i]||1}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Floating karma change toasts ── */}
      {karmaToasts.length>0&&(
        <div style={{position:"fixed",bottom:isMobile?100:120,right:16,zIndex:190,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end",pointerEvents:"none"}}>
          {karmaToasts.map(t=>(
            <div key={t.id} style={{
              display:"flex",alignItems:"center",gap:8,
              background:"rgba(12,10,7,.95)",
              border:`2px solid ${t.color}60`,
              borderRadius:24,padding:"8px 16px",
              boxShadow:`0 0 20px ${t.color}30`,
              animation:"karmaToast 2.8s ease forwards",
            }}>
              <span style={{fontSize:20}}>{t.icon}</span>
              <div>
                <div style={{fontSize:9,color:"rgba(200,160,60,.5)",letterSpacing:2,fontFamily:"'Cinzel',serif"}}>{t.playerName}</div>
                <div style={{fontSize:18,fontWeight:900,color:t.color,fontFamily:"'Cinzel Decorative',serif",lineHeight:1}}>{t.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center",width:"100%",maxWidth:1140}}>
        {/* BOARD */}
        <div style={{flex:"1 1 340px",maxWidth:isMobile?"100%":720,minWidth:300,width:isMobile?"100%":undefined}}>
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
                  const ph=[];for(let i=0;i<nP;i++){const rp=isOnline&&i!==myPlayerIndex&&displayPos.length>0?displayPos[i]:pos[i];if((rp||1)===sq.num)ph.push(i)}
                  const isMoksha=sq.num===108;
                  const stepIdx=sq.num-101;
                  return(<div key={sq.num} onMouseEnter={()=>!isMobile&&setHov(sq.num)} onMouseLeave={()=>!isMobile&&setHov(null)} onClick={()=>{if(isMobile)setHov(h=>h===sq.num?null:sq.num)}} style={{aspectRatio:"1",background:isMoksha?"radial-gradient(circle,rgba(240,200,80,.2),rgba(240,200,80,.04))":"radial-gradient(circle,rgba(240,200,80,.06),transparent)",border:`1px solid ${hov===sq.num?"rgba(240,200,80,.7)":isMoksha?"rgba(240,200,80,.4)":"rgba(240,200,80,.12)"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"all .3s",borderRadius:isMoksha?4:2,animation:isMoksha?"mp 3s ease infinite":"sacredGlow 4s ease infinite",animationDelay:`${stepIdx*0.3}s`,boxShadow:isMoksha?"0 0 20px rgba(240,200,80,.15)":"none"}}>
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
                const ph=[];for(let i=0;i<nP;i++){const rp=isOnline&&i!==myPlayerIndex&&displayPos.length>0?displayPos[i]:pos[i];if((rp||1)===num)ph.push(i)}
                let bg="transparent",bdr="rgba(200,160,60,.08)";
                if(mk){bg="radial-gradient(circle,rgba(240,200,80,.2),transparent)";bdr="rgba(240,200,80,.5)"}
                else if(sn){bg="radial-gradient(circle,rgba(180,60,20,.2),transparent)";bdr="rgba(180,60,20,.3)"}
                else if(ld){bg="radial-gradient(circle,rgba(200,160,60,.15),transparent)";bdr="rgba(200,160,60,.2)"}
                else if(dl){bg="radial-gradient(circle,rgba(120,80,180,.2),transparent)";bdr="rgba(140,100,200,.35)"}
                return(<div key={num} onMouseEnter={()=>!isMobile&&setHov(num)} onMouseLeave={()=>!isMobile&&setHov(null)} onClick={()=>{if(isMobile)setHov(h=>h===num?null:num)}} style={{aspectRatio:"1",background:bg,border:`0.5px solid ${hov===num?"rgba(240,200,80,.6)":bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"all .2s"}}>
                  <span style={{position:"absolute",top:1,left:2,fontSize:"clamp(7px,1.2vw,11px)",color:"rgba(240,210,130,.5)",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:700}}>{num}</span>
                  {mk&&<span style={{fontSize:"clamp(14px,2.5vw,22px)",animation:"mp 3s ease infinite",color:"#f0d050"}}>ॐ</span>}
                  {sn&&<><span style={{fontSize:"clamp(10px,2vw,16px)",lineHeight:1}}>𓆙</span><span style={{fontSize:"clamp(7px,1.2vw,11px)",color:"#ffb040",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,lineHeight:1.1,textShadow:"0 0 8px #000,0 1px 4px #000,0 0 12px rgba(180,60,20,.5)"}}>{sn.skt}</span><span style={{fontSize:"clamp(5px,.9vw,8px)",color:"#ffa040",fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1.1,textShadow:"0 0 6px #000,0 0 10px rgba(180,60,20,.4)"}}>{sn.en}</span></>}
                  {ld&&<><span style={{fontSize:"clamp(9px,1.8vw,14px)",lineHeight:1}}>🪔</span><span style={{fontSize:"clamp(7px,1.2vw,11px)",color:"#ffe070",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,lineHeight:1.1,textShadow:"0 0 8px #000,0 0 12px rgba(200,160,60,.4)"}}>{ld.skt}</span><span style={{fontSize:"clamp(5px,.9vw,8px)",color:"#f0d060",fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1.1,textShadow:"0 0 6px #000"}}>{ld.en}</span></>}
                  {dl&&<><span style={{fontSize:"clamp(8px,1.5vw,13px)",lineHeight:1}}>⚖</span><span style={{fontSize:"clamp(5px,.8vw,7px)",color:"#c8a0f0",fontFamily:"'Cinzel',serif",fontWeight:900,textShadow:"0 0 8px #000",letterSpacing:1}}>DHARMA</span></>}
                  {ph.length>0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",gap:2,zIndex:15,pointerEvents:"none"}}>
                    {ph.map(pi=>{const c=players[pi]?.char;const isMoving=pi===cur&&busy;const isActive=pi===cur;const pc=c?.color||"#fff";return <div key={pi} style={{display:"flex",flexDirection:"column",alignItems:"center",transition:"all .3s ease",transform:isMoving?"scale(1.6) translateY(-6px)":isActive?"scale(1.25)":"scale(0.9)",zIndex:isActive?20:15}}>
                      {isActive&&<div style={{position:"absolute",inset:-2,borderRadius:4,background:`${pc}15`,border:`1.5px solid ${pc}40`,animation:"activeGlow 1.5s ease infinite","--pc":pc}}/>}
                      <div style={{width:isMobile?"clamp(22px,6vw,28px)":"clamp(20px,3.2vw,30px)",height:isMobile?"clamp(22px,6vw,28px)":"clamp(20px,3.2vw,30px)",borderRadius:"50%",background:`radial-gradient(circle at 35% 30%,${pc},${pc}40 70%,#0c0a07)`,border:`2.5px solid ${pc}`,boxShadow:`0 0 ${isMoving?20:isActive?12:5}px ${pc}${isMoving?"dd":isActive?"99":"30"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(11px,2vw,17px)",lineHeight:1,animation:isActive&&!isMoving?"activeGlow 1.5s ease infinite":"none","--pc":pc}}>{c?.icon}</div>
                      {!isMobile&&<div style={{fontSize:"clamp(5px,.8vw,8px)",color:pc,fontWeight:900,marginTop:1,textShadow:`0 0 4px #000,0 0 8px #000,0 0 12px ${pc}40`,whiteSpace:"nowrap",letterSpacing:1,opacity:isActive?1:.7}}>{players[pi]?.name?.slice(0,6)}</div>}
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
        {/* PANEL — desktop only */}
        {!isMobile&&<div style={{flex:"0 1 310px",display:"flex",flexDirection:"column",gap:8,minWidth:"clamp(250px,40vw,310px)",maxWidth:360,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
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
            {/* Online: opponent rolling overlay */}
            {isOnline&&onlineBroadcast?.type==='rolling'&&onlineBroadcast.playerIndex!==myPlayerIndex&&(
              <div style={{position:'fixed',inset:0,zIndex:120,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
                <div style={{background:'rgba(12,10,7,.88)',border:'1px solid rgba(240,208,80,.2)',padding:'20px 32px',textAlign:'center',backdropFilter:'blur(8px)'}}>
                  <div style={{fontSize:36,animation:'pulse 1s ease infinite'}}>🎲</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,color:'rgba(240,208,80,.6)',marginTop:8}}>
                    {players[onlineBroadcast.playerIndex]?.name||'Opponent'} is rolling...
                  </div>
                </div>
              </div>
            )}
            {/* Online: opponent dharma choice overlay */}
            {isOnline&&onlineBroadcast?.type==='dilemma_pick'&&onlineBroadcast.playerIndex!==myPlayerIndex&&(
              <div style={{position:'fixed',top:80,left:'50%',transform:'translateX(-50%)',zIndex:120,
                background:'rgba(12,10,7,.88)',border:'1px solid rgba(240,208,80,.15)',
                padding:'10px 22px',textAlign:'center',backdropFilter:'blur(8px)',animation:'reveal .3s ease'}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:'rgba(240,208,80,.55)'}}>
                  {players[onlineBroadcast.playerIndex]?.name} chose&nbsp;
                  <strong style={{color:'#f0d050'}}>{onlineBroadcast.choice===0?'Dharma ✦':'Adharma ✕'}</strong>
                </div>
              </div>
            )}
            {/* Online: turn timer arc */}
            {isOnline&&isMyTurn&&!busy&&!dil&&!win&&(
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,padding:'6px 10px',
                background:'rgba(12,10,7,.6)',border:`1px solid ${timerDanger?'rgba(200,60,60,.4)':timerWarn?'rgba(224,120,32,.35)':'rgba(240,208,80,.12)'}`,
                transition:'border-color .5s'}}>
                <svg width={36} height={36} style={{flexShrink:0,transform:'rotate(-90deg)'}}>
                  <circle cx={18} cy={18} r={14} fill="none" stroke="rgba(240,208,80,.08)" strokeWidth={3}/>
                  <circle cx={18} cy={18} r={14} fill="none"
                    stroke={timerDanger?'#e04030':timerWarn?'#e07820':'#f0d050'}
                    strokeWidth={3} strokeLinecap="round"
                    strokeDasharray={2*Math.PI*14}
                    strokeDashoffset={2*Math.PI*14*(1-timerPct)}
                    style={{transition:'stroke-dashoffset .9s linear,stroke .5s'}}/>
                </svg>
                <div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,
                    color:timerDanger?'#e04030':timerWarn?'#e07820':'rgba(240,208,80,.5)',textTransform:'uppercase'}}>
                    Your Turn
                  </div>
                  <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16,
                    color:timerDanger?'#e04030':timerWarn?'#e07820':'#f0d050',fontWeight:700}}>
                    {timerSecs}s {timerDanger&&'⚠'}
                  </div>
                </div>
              </div>
            )}
            {/* Online: waiting for opponent */}
            {isOnline&&!isMyTurn&&!busy&&!dil&&(
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,padding:'8px 10px',
                background:'rgba(12,10,7,.4)',border:'1px solid rgba(240,208,80,.08)'}}>
                <div style={{fontSize:20,animation:'pulse 2s ease infinite'}}>
                  {players[cur]?.char?.icon||'🔱'}
                </div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:'rgba(240,208,80,.35)'}}>
                  Waiting for {players[cur]?.name||'opponent'}...
                </div>
              </div>
            )}
            {/* Disconnection warning */}
            {isOnline&&!onlineConnected&&(
              <div style={{padding:'7px 10px',background:'rgba(160,40,40,.15)',
                border:'1px solid rgba(200,60,60,.25)',marginBottom:6,
                fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:'#e08080',textTransform:'uppercase'}}>
                ⚡ Reconnecting{reconnectAttempts>0?` (${reconnectAttempts}/5)`:''}...
              </div>
            )}
            <button onClick={()=>doRoll(false)}
              disabled={!!dil||busy||(isOnline&&!isMyTurn)}
              className="gb gp"
              style={{width:"100%",padding:"clamp(10px,1.5vw,14px)",fontSize:"clamp(14px,2vw,16px)",letterSpacing:4,
                minHeight:48,touchAction:"manipulation",WebkitTapHighlightColor:"transparent",
                opacity:(isOnline&&!isMyTurn)?0.3:1,transition:'opacity .3s'}}>
              {busy?"Rolling...":(isOnline&&!isMyTurn)?`${players[cur]?.name||'Opponent'}'s turn`:"Roll Dice"}
            </button>
            {/* Donate / Feedback — subtle */}
            <button onClick={()=>setShowPostGame(true)} style={{
              width:"100%",marginTop:6,background:"transparent",
              border:"1px solid rgba(240,208,80,.1)",
              color:"rgba(240,208,80,.28)",padding:"7px",
              fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,
              cursor:"pointer",transition:"all .3s",textTransform:"uppercase",
            }}
            onMouseEnter={e=>{e.target.style.borderColor="rgba(240,208,80,.28)";e.target.style.color="rgba(240,208,80,.6)"}}
            onMouseLeave={e=>{e.target.style.borderColor="rgba(240,208,80,.1)";e.target.style.color="rgba(240,208,80,.28)"}}>
              🪔 Support · Feedback
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
              <button onClick={()=>{navigateTo("title");setWin(null);setPlayers([]);setOnlineRoomId(null);setMyPlayerIndex(null);lastAppliedSeqRef.current=-1;ambient.stop()}} className="gb" style={{padding:"6px 16px",fontSize:10,marginTop:0}}>New Journey</button>
              {auth.user&&<button onClick={()=>{setShowProfile(true);setProfileTab("history")}} className="gb" style={{padding:"6px 16px",fontSize:10,marginTop:0,opacity:.7}}>📊 Stats</button>}
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
        </div>}{/* end !isMobile panel */}
      </div>{/* end board+panel flex */}

      {/* ── MOBILE: Horizontal player karma cards ── */}
      {isMobile&&!win&&(
        <div style={{width:"100%",padding:"8px 0 0"}}>
          <div style={{overflowX:"auto",display:"flex",gap:8,padding:"0 8px 6px",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch"}}>
            {players.map((pl,i)=>{
              const isActive=cur===i;const pn=punya[i]||0;const pp=papa[i]||0;
              const total=Math.max(pn+pp,1);const pc=pl.char.color;
              return(
                <div key={i} style={{minWidth:140,flexShrink:0,scrollSnapAlign:"start",
                  background:isActive?`${pc}12`:"rgba(16,12,8,.85)",
                  border:`1.5px solid ${isActive?pc+"60":"rgba(200,160,60,.12)"}`,
                  borderRadius:6,padding:"10px 12px",transition:"all .3s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <span style={{fontSize:20}}>{pl.char.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,color:pc,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:90}}>{pl.name.split(" ")[0]}{pl.cpu?" ☠️":""}</div>
                      <div style={{fontSize:9,opacity:.45}}>Sq {pos[i]||1}{shieldA[i]?" 🛡":""}{skipA[i]?" ⏭":""}</div>
                    </div>
                  </div>
                  <div style={{marginBottom:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:9,color:"#f0d050"}}>पुण्य</span>
                      <span style={{fontSize:13,color:"#f0d050",fontWeight:900}}>{pn}</span>
                    </div>
                    <div style={{height:5,background:"rgba(0,0,0,.35)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(pn/total)*100}%`,background:"linear-gradient(90deg,#f0d050,#c0a030)",borderRadius:3,transition:"width .6s"}}/>
                    </div>
                  </div>
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:9,color:"#e08060"}}>पाप</span>
                      <span style={{fontSize:13,color:"#e08060",fontWeight:900}}>{pp}</span>
                    </div>
                    <div style={{height:5,background:"rgba(0,0,0,.35)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(pp/total)*100}%`,background:"linear-gradient(90deg,#e08060,#c05030)",borderRadius:3,transition:"width .6s"}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Last roll display on mobile */}
          {rv&&gv&&!busy&&lastRollBy&&(
            <div style={{margin:"4px 8px 6px",background:"linear-gradient(135deg,rgba(36,28,14,.97),rgba(18,14,8,.97))",border:"1px solid rgba(200,160,60,.2)",borderRadius:6,padding:"10px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:22}}>{lastRollBy.icon}</span>
                <div>
                  <div style={{fontSize:13,color:lastRollBy.color||"#f0d050",fontWeight:900,letterSpacing:1}}>{lastRollBy.name}</div>
                  <div style={{fontSize:9,letterSpacing:3,color:"#c0b080",opacity:.6,fontWeight:700}}>ROLLED</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:52,height:52,background:"#0c0a07",border:"2px solid rgba(200,160,60,.5)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,color:"#f0d050",flexShrink:0}}>{rv}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#f0d050",marginBottom:4}}>Moved {rv} square{rv>1?"s":""} forward</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,background:`${gv.color}10`,border:`1px solid ${gv.color}30`,borderRadius:6,padding:"6px 10px"}}>
                    <span style={{fontSize:20}}>{gv.icon}</span>
                    <div>
                      <div style={{fontSize:11,color:gv.color,fontWeight:700}}>{gv.n} · {gv.en}</div>
                      <div style={{fontSize:10,color:"#c0b080",lineHeight:1.4}}>{gv.desc}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chitragupta last entry on mobile */}
          {cgEntries.length>0&&(
            <div style={{margin:"0 8px 6px",background:"rgba(14,10,6,.9)",border:"1px solid rgba(200,160,60,.1)",borderRadius:4,padding:"8px 10px"}}>
              <div style={{fontSize:7,letterSpacing:4,color:"#f0d050",opacity:.5,marginBottom:3}}>✍ CHITRAGUPTA'S LEDGER</div>
              <div style={{fontSize:11,color:"#c0b080",lineHeight:1.7}}>
                {({moksha:"ॐ",snake:"𓆙",ladder:"🪔",punya:"☀",papa:"🌑",dharma_p:"⚖",dharma_x:"⚖",balance:"⚖",reject:"⚠",sacred:"🪷"})[cgEntries[cgEntries.length-1].type]||"·"}
                {" Sq "}{cgEntries[cgEntries.length-1].sq}{" — "}{String(cgEntries[cgEntries.length-1].detail).slice(0,40)}
              </div>
            </div>
          )}
          <div style={{height:90}}/>{/* spacer for mb-roll sticky bar */}
        </div>
      )}

      {/* ── mb-roll: Mobile sticky bottom roll bar ── */}
      {isMobile&&!win&&(
        <div className="mb-roll">
          <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:4}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:`${cp.char.color}20`,border:`1.5px solid ${cp.char.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{cp.char.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,color:cp.char.color,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cp.name.split(" ")[0]}{cp.cpu?" ☠️":""}</div>
              <div style={{fontSize:9,opacity:.45}}>Square {pos[cur]||1}{busy?" · Rolling…":rv&&gv&&lastRollBy?` · ${lastRollBy.name} rolled ${rv}`:""}</div>
            </div>
            {rv&&gv&&!busy&&(
              <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
                <div style={{width:30,height:30,border:"1.5px solid rgba(200,160,60,.5)",borderRadius:6,background:"#0c0a07",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,color:"#f0d050"}}>{rv}</div>
                <div style={{width:30,height:30,border:`1.5px solid ${gv.color}40`,borderRadius:6,background:"#0c0a07",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:gv.color}}>{gv.icon}</div>
              </div>
            )}
          </div>
          {/* Timer arc on mobile */}
          {isOnline&&isMyTurn&&!busy&&!dil&&(
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,padding:"4px 8px",background:timerDanger?"rgba(200,60,60,.1)":"rgba(12,10,7,.4)",border:`1px solid ${timerDanger?"rgba(200,60,60,.3)":timerWarn?"rgba(224,120,32,.25)":"rgba(240,208,80,.1)"}`,borderRadius:4}}>
              <svg width={22} height={22} style={{flexShrink:0,transform:"rotate(-90deg)"}}>
                <circle cx={11} cy={11} r={8} fill="none" stroke="rgba(240,208,80,.08)" strokeWidth={2}/>
                <circle cx={11} cy={11} r={8} fill="none" stroke={timerDanger?"#e04030":timerWarn?"#e07820":"#f0d050"} strokeWidth={2} strokeLinecap="round"
                  strokeDasharray={2*Math.PI*8} strokeDashoffset={2*Math.PI*8*(1-timerPct)}
                  style={{transition:"stroke-dashoffset .9s linear,stroke .5s"}}/>
              </svg>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:timerDanger?"#e04030":"rgba(240,208,80,.5)",letterSpacing:2}}>{timerSecs}s</span>
            </div>
          )}
          <button
            onClick={()=>{haptic();doRoll(false);}}
            disabled={!!dil||busy||(isOnline&&!isMyTurn)}
            className="gb gp"
            style={{width:"100%",padding:"13px",fontSize:15,letterSpacing:4,
              minHeight:50,touchAction:"manipulation",WebkitTapHighlightColor:"transparent",
              opacity:(isOnline&&!isMyTurn)?0.3:1,transition:"opacity .3s"}}>
            {busy?"Rolling…":(isOnline&&!isMyTurn)?`${players[cur]?.name||"Opponent"}'s turn`:"Roll Dice"}
          </button>
        </div>
      )}

      {/* ── mb-sheet: Mobile slide-up menu ── */}
      {isMobile&&showMobileMenu&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:99,touchAction:"none"}}
          onClick={()=>setShowMobileMenu(false)}>
          <div className="mb-sheet" onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:"rgba(200,160,60,.3)",borderRadius:2,margin:"0 auto 14px"}}/>
            <div style={{fontSize:9,letterSpacing:5,color:"#f0d050",opacity:.4,textAlign:"center",marginBottom:14}}>MENU</div>

            {/* Audio toggles */}
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <button onClick={toggleMute} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:muted?"rgba(200,80,60,.12)":"rgba(200,160,60,.06)",border:`1.5px solid ${muted?"rgba(200,80,60,.4)":"rgba(200,160,60,.2)"}`,color:muted?"#e08060":"#e8c850",padding:"11px 8px",fontSize:12,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:6,letterSpacing:1,minHeight:44,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:18}}>{muted?"🔇":"🗣️"}</span>
                <span>{muted?"Voice Off":"Voice On"}</span>
              </button>
              <button onClick={toggleBG} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:bgMuted?"rgba(200,80,60,.12)":"rgba(200,160,60,.06)",border:`1.5px solid ${bgMuted?"rgba(200,80,60,.4)":"rgba(200,160,60,.2)"}`,color:bgMuted?"#e08060":"#e8c850",padding:"11px 8px",fontSize:12,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:6,letterSpacing:1,minHeight:44,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
                <span style={{fontSize:18}}>{bgMuted?"🔕":"🎵"}</span>
                <span>{bgMuted?"Music Off":"Music On"}</span>
              </button>
            </div>

            {/* Nav buttons */}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
              <button onClick={()=>{setShowMobileMenu(false);setShowGuide(true);}} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(200,160,60,.06)",border:"1px solid rgba(200,160,60,.15)",color:"#c0b080",padding:"12px 14px",fontSize:12,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:6,letterSpacing:1,minHeight:44,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
                <span>📜</span><span>How to Play</span>
              </button>
              <button onClick={()=>{setShowMobileMenu(false);setShowInfo(true);}} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(200,160,60,.06)",border:"1px solid rgba(200,160,60,.15)",color:"#c0b080",padding:"12px 14px",fontSize:12,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:6,letterSpacing:1,minHeight:44,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
                <span>📖</span><span>Encyclopaedia</span>
              </button>
              <button onClick={()=>{setShowMobileMenu(false);setShowPostGame(true);}} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(200,160,60,.06)",border:"1px solid rgba(200,160,60,.15)",color:"#c0b080",padding:"12px 14px",fontSize:12,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:6,letterSpacing:1,minHeight:44,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
                <span>🪔</span><span>Support · Feedback</span>
              </button>
            </div>

            <button onClick={()=>{setShowMobileMenu(false);VoiceEngine.stop();navigateTo("title");}} style={{width:"100%",background:"transparent",border:"1px solid rgba(200,100,80,.2)",color:"rgba(200,100,80,.5)",padding:"10px",fontSize:10,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:4,letterSpacing:3,minHeight:44,touchAction:"manipulation",WebkitTapHighlightColor:"transparent"}}>
              ← Leave Game
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
