import { useState, useCallback, useMemo, useEffect, useRef } from "react";

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
  en:"Listen carefully. What I am about to tell you, has been hidden for five thousand years. Before the Mahabharata was written down. Before the first temples were carved into stone. Before even the oldest Vedas were chanted aloud by human lips. There existed, a game. But not a game of entertainment. No. This was a game, of the soul. Created by unknown sages, rishis so ancient, that even the gods, have forgotten their names. They called it, Moksha Patam. The Board, of Liberation. It was whispered, in sacred circles, that whoever truly understood this game, would understand the deepest secret of life, of death, and of everything, that lies beyond. For thousands of years, kings played it in marble palaces. Sages played it in forest ashrams, by firelight. It was passed from guru to disciple, in hushed tones, as if the board itself were alive. And then, one dark day, foreigners came to this land. They saw the board. They stole it. They stripped away every sacred name. Every Sanskrit verse. Every drop of meaning. And they renamed it. Snakes and Ladders. A children's game. The soul of the game, was murdered. Erased from history. Forgotten. Until, this very moment. Tonight, you play the original. The game your ancestors truly played. The game, the gods, forgot.",
  hi:"ध्यान से सुनो। जो मैं बताने जा रहा हूँ, वो पांच हज़ार सालों से छिपाया गया है। महाभारत लिखे जाने से पहले। पहले मंदिरों को पत्थर में तराशे जाने से पहले। इंसानी होंठों से सबसे पुराने वेदों के उच्चारण से भी पहले। एक खेल था। लेकिन मनोरंजन का खेल नहीं। नहीं। ये आत्मा का खेल था। अज्ञात ऋषियों द्वारा रचा गया, इतने प्राचीन, कि देवताओं को भी उनके नाम याद नहीं। उन्होंने इसे कहा, मोक्षपटम। मुक्ति का पट। पवित्र मंडलियों में फुसफुसाया जाता था, कि जो इस खेल को सच में समझ ले, वो जीवन का, मृत्यु का, और उसके पार जो कुछ भी है, उसका सबसे गहरा रहस्य जान जाएगा। हज़ारों सालों तक, राजाओं ने इसे संगमरमर के महलों में खेला। ऋषियों ने इसे वन के आश्रमों में, अग्नि की रोशनी में खेला। गुरु से शिष्य तक, दबी आवाज़ में, जैसे पट ख़ुद जीवित हो। और फिर, एक अंधेरे दिन, विदेशी इस धरती पर आए। उन्होंने पट देखा। चुरा लिया। हर पवित्र नाम छीन लिया। हर संस्कृत श्लोक। अर्थ की हर बूँद। और नाम रख दिया। सांप सीढ़ी। बच्चों का खेल। खेल की आत्मा की हत्या कर दी गई। इतिहास से मिटा दिया गया। भुला दिया गया। इस, एक क्षण तक। आज रात, तुम असली खेल खेलोगे। वो खेल जो तुम्हारे पूर्वजों ने खेला था। वो खेल, जो देवता, भूल गए।",
  body:"Before the Mahābhārata was written down...\nbefore the temples were carved in stone...\n\nThere existed a game. A game of the soul.\n\nThey called it मोक्ष पटम् १०८ — Moksha Patam 108.\nThe Board of Liberation.\n\nPassed from गुरु to शिष्य in whispered secrecy.\n\nThen foreigners came. They renamed it 'Snakes and Ladders.'\n\nThe soul of the game was murdered.\nUntil this very moment."},
  {title:"The Sacred Board",icon:"📜",
  en:"Now, look at the board before you. It is not a board. It is a map. A map, of the entire universe. A map, of your soul's journey through existence. One hundred squares. Three realms. And one, single, destination. The first realm, Squares 1 through 33, is Bhuloka. The Earthly Realm. This is where you are born. This is where chaos reigns. Snakes coil in every shadow. Ladders shimmer like mirages. Fortune rises and crashes with every single step. Most souls, are trapped here. Forever. Cycling endlessly through birth, and death, and birth again. Never escaping. The second realm, Squares 34 through 66, is Antarloka. The Inner Realm. Here, the noise of the world fades to silence. But do not be deceived by the quiet. The serpents here are more cunning. They do not bite your flesh. They poison, your mind. Doubt. Confusion. The slow erosion of faith. The third realm, Squares 67 through 99, is Svargaloka. The Celestial Realm. You can feel liberation from here. You can almost, taste it. But beware. The serpents who dwell in the heavens, are the most terrifying of all. A single fall here, does not cost you a few squares. It destroys, lifetimes, of spiritual progress. And there, at the summit, Square 100. Moksha. Liberation. The end of all suffering. But reaching Moksha, is only half the battle. Arriving, with a pure soul, that is the true challenge.",
  hi:"अब, अपने सामने पट को देखो। ये सिर्फ पट नहीं है। ये एक नक्शा है। पूरे ब्रह्मांड का नक्शा। अस्तित्व के माध्यम से तुम्हारी आत्मा की यात्रा का नक्शा। सौ खाने। तीन लोक। और एक, अकेली, मंज़िल। पहला लोक, खाना 1 से 33, भूलोक है। पृथ्वी लोक। यहीं तुम्हारा जन्म होता है। यहीं अराजकता राज करती है। हर छाया में सांप कुंडली मारे बैठे हैं। सीढ़ियां मरीचिकाओं सी चमकती हैं। किस्मत हर एक कदम पर उठती और गिरती है। ज़्यादातर आत्माएं, यहीं फंसी रहती हैं। हमेशा के लिए। जन्म, मृत्यु, और फिर जन्म के अंतहीन चक्र में। कभी नहीं छूटतीं। दूसरा लोक, खाना 34 से 66, अंतर्लोक है। आंतरिक लोक। यहां, दुनिया का शोर शांत हो जाता है। लेकिन इस सन्नाटे से धोखा मत खाना। यहां के सांप ज़्यादा चालाक हैं। ये तुम्हारा शरीर नहीं काटते। ये ज़हर भरते हैं, तुम्हारे मन में। संदेह। भ्रम। श्रद्धा का धीमा क्षरण। तीसरा लोक, खाना 67 से 99, स्वर्गलोक है। दिव्य लोक। यहां से मुक्ति महसूस होती है। लगभग, छू सकते हो। लेकिन सावधान। स्वर्ग में रहने वाले सांप, सबसे भयानक हैं। यहां एक गिरावट, कुछ खानों की नहीं होती। ये मिटा देती है, जन्मों की, आध्यात्मिक साधना को। और वहां, शिखर पर, खाना 100। मोक्ष। मुक्ति। सारे दुखों का अंत। लेकिन मोक्ष तक पहुंचना, आधी लड़ाई है। शुद्ध आत्मा लेकर पहुंचना, वो असली चुनौती है।",
  body:"The board is not a board.\nIt is a map — of the entire universe.\n\n१०० squares · Three realms · One destination\n\n꧁ भूलोक · BHULOKA ꧂\nSquares 1–33 — The Earthly Realm\nChaos reigns. Most souls trapped here forever.\n\n꧁ अन्तर्लोक · ANTARLOKA ꧂\nSquares 34–66 — The Inner Realm\nSerpents poison your mind, not your flesh.\n\n꧁ स्वर्गलोक · SVARGALOKA ꧂\nSquares 67–99 — The Celestial Realm\nOne fall destroys lifetimes of progress.\n\n꧁ मोक्ष · MOKSHA ꧂\nSquare 100 — Liberation.\nArriving with a pure soul — that is the true challenge."},
  {title:"The Serpents Within",icon:"𓆙",
  en:"Now, hear me well, because what I am about to describe, will haunt you. They are not, just snakes. They are living nightmares. Ten colossal Nagas, ancient as time itself, coiled around this board since the beginning of creation. Each one, a manifestation of the darkest force, inside every human soul. The sages gave them names. And those names, should make your blood run cold. Krodh. Wrath. The same fire that consumed Duryodhana's mind and burned the Kuru dynasty to ash. When Krodh strikes, you feel the venom of rage dissolving everything you've built. Lobh. Greed. The insatiable hunger that made Shakuni gamble away an entire kingdom. Its jaws swallow your progress whole. Moh. Delusion. The blindness that kept Dhritarashtra from seeing his own sons destroy the world. This serpent, wraps around your eyes. Matsarya. Envy, that green poison that ate Duryodhana alive when he saw the glory of Indraprastha. Kaam. Desire. The burning lust that destroyed Keechaka in a single night. Mad. Pride. The ten-headed arrogance that toppled golden Lanka and brought mighty Ravana to his knees. Bhay. Fear. The same terror that froze Arjuna's hands before the greatest war in history. Dvesh. Hatred. The ancient feud between Drona and Drupada that echoed through generations of blood. Aalasya. Sloth. The great sleep of Kumbhakarna, who slumbered while dharma crumbled around him. And then, the deadliest of them all. Ahankaar. Ego. The serpent king. The one who whispers, I am above all others. The ego that challenged even Lord Rama himself. When a serpent catches you, it does not simply move you backward. It wraps its coils around your soul. It drags you, screaming, into the depths. And it stains you, with Paap. Sin karma. That mark, does not wash away easily. The higher you climb, the more violently you fall. And there is only one protection in this entire game. The celestial shield of Shukra, the planet Venus. But even that divine protection, can only save you, once. After that, you face the serpents, alone.",
  hi:"अब, ध्यान से सुनो, क्योंकि जो मैं बताने वाला हूँ, वो तुम्हें सपनों में भी सताएगा। ये, सिर्फ सांप नहीं हैं। ये जीवित दुःस्वप्न हैं। दस विशाल नाग, समय जितने प्राचीन, सृष्टि के आरम्भ से इस पट पर कुंडली मारे बैठे हैं। हर एक, हर इंसान की आत्मा के अंदर की सबसे काली शक्ति का रूप। ऋषियों ने इन्हें नाम दिए। और वो नाम, तुम्हारा खून जमा देने चाहिए। क्रोध। वो आग जिसने दुर्योधन का मन जलाया और कुरु वंश को राख कर दिया। जब क्रोध हमला करता है, क्रोध का विष तुम्हारी हर उपलब्धि को गला देता है। लोभ। वो अतृप्त भूख जिसने शकुनि से पूरा राज्य जुए में हरवा दिया। इसके जबड़े तुम्हारी प्रगति को साबुत निगल जाते हैं। मोह। वो अंधापन जिसने धृतराष्ट्र को अपने ही पुत्रों को संसार का विनाश करते देखने से रोका। ये सांप, तुम्हारी आँखों पर लिपट जाता है। मात्सर्य। ईर्ष्या, वो हरा ज़हर जिसने दुर्योधन को इंद्रप्रस्थ की महिमा देखकर अंदर से खा लिया। काम। वासना। वो जलती आग जिसने कीचक को एक ही रात में नष्ट कर दिया। मद। घमंड। वो दस सिरों वाला अहंकार जिसने सोने की लंका को धराशायी किया और महान रावण को घुटनों पर ला दिया। भय। वही आतंक जिसने इतिहास के सबसे महान युद्ध से पहले अर्जुन के हाथ जमा दिए। द्वेष। नफ़रत। द्रोण और द्रुपद की वो प्राचीन दुश्मनी जो खून की पीढ़ियों तक गूंजती रही। आलस्य। कुम्भकर्ण की वो महानिद्रा, जो सोता रहा जबकि उसके चारों ओर धर्म टूट रहा था। और फिर, सबसे घातक। अहंकार। नागराज। वो जो फुसफुसाता है, मैं सबसे ऊपर हूँ। वो अहंकार जिसने स्वयं भगवान राम को भी चुनौती दी। जब कोई सांप तुम्हें पकड़ता है, तो सिर्फ पीछे नहीं ले जाता। वो अपने कुंडल तुम्हारी आत्मा पर कसता है। तुम्हें, चीखते हुए, गहराइयों में खींचता है। और तुम पर दाग लगाता है, पाप का। वो दाग, आसानी से नहीं धुलता। जितना ऊपर चढ़ो, उतनी हिंसक होगी गिरावट। और इस पूरे खेल में सिर्फ एक सुरक्षा है। शुक्र ग्रह का दिव्य कवच। लेकिन वो दिव्य सुरक्षा भी, सिर्फ एक बार, बचा सकती है। उसके बाद, तुम सांपों का सामना, अकेले करोगे।",
  body:"They are not just snakes.\nThey are living nightmares — ten colossal नाग Nāgas.\n\n𓆙 क्रोध Krodh — Wrath\n    The fire that burned the Kuru dynasty to ash\n𓆙 लोभ Lobh — Greed\n    The hunger that swallowed Shakuni's kingdom\n𓆙 मोह Moh — Delusion\n    The blindness that veiled Dhritarashtra's eyes\n𓆙 मात्सर्य Mātsarya — Envy\n    The green poison that consumed Duryodhana\n𓆙 काम Kām — Desire\n    The flame that destroyed Keechaka in one night\n𓆙 मद Mad — Pride\n    The arrogance that toppled golden Lankā\n𓆙 भय Bhay — Fear\n    The terror that froze Arjuna before war\n𓆙 द्वेष Dvesh — Hatred\n    The feud that echoed through generations\n𓆙 आलस्य Ālasya — Sloth\n    The sleep of Kumbhakarna while dharma crumbled\n𓆙 अहंकार Ahankār — Ego\n    The serpent king. The deadliest of all.\n\nWhen bitten → dragged into the depths + 2 पाप Pāp.\nOnly शुक्र Shukra shields you — once."},
  {title:"The Path to Moksha",icon:"ॐ",
  en:"And now, the final truth. There are only two ways, to escape the wheel of Samsara. Two narrow paths, through an ocean of suffering. The First Path. Reach, Square 100, with an exact roll of the dice. Not one square more. Not one square less. But, even if you reach Moksha, the gates will not open for a tainted soul. Your Punya, your accumulated virtue, must equal, or exceed, your Paap, your sin. If you arrive at the threshold of liberation, carrying the weight of your failures, you will be cast back. Hurled down, to Square 67. To suffer again. To purify through pain. To crawl, once more, through the celestial realm, past the deadliest serpents, knowing that one wrong step sends you even further down. The Second Path. Far rarer. Far more beautiful. Far more impossible. If, at any moment during your journey, you accumulate 30 Punya, fifteen acts of pure virtue, you transcend the board entirely. You do not need Square 100. You do not need an exact roll. The board itself, dissolves beneath you, and your soul rises, into pure light. Instant Moksha. This is the ancient truth that the sages encoded into this game. That a truly pure soul, can break free from the cycle of existence, at any moment. From any square. Most seekers, will never achieve either path. They will wander this board for eternity, rising and falling, climbing and being devoured, forever caught between virtue and vice. But perhaps, you, will be different. Dharma, awaits. The dice, are ready. The serpents, can already smell your fear. Take a breath. And step, onto the board.",
  hi:"और अब, अंतिम सत्य। संसार के चक्र से बचने के सिर्फ दो रास्ते हैं। दुख के सागर से गुज़रते दो संकरे रास्ते। पहला रास्ता। खाना 100 पर पहुंचो, पासे के बिल्कुल सटीक अंक से। एक खाना ज़्यादा नहीं। एक खाना कम नहीं। लेकिन, अगर मोक्ष तक पहुंच भी गए, तो दूषित आत्मा के लिए द्वार नहीं खुलेंगे। तुम्हारा पुण्य, तुम्हारी संचित पवित्रता, तुम्हारे पाप से बराबर, या ज़्यादा होनी चाहिए। अगर मुक्ति की देहलीज़ पर पहुंचे, अपनी असफलताओं का बोझ लेकर, तो वापस फेंक दिए जाओगे। नीचे, खाना 67 पर। फिर से कष्ट भोगने। दर्द से शुद्ध होने। एक बार फिर, दिव्य लोक से रेंगते हुए गुज़रने, सबसे घातक सांपों के बीच से, ये जानते हुए कि एक ग़लत कदम तुम्हें और भी गहरे गिरा देगा। दूसरा रास्ता। बहुत दुर्लभ। बहुत सुंदर। बहुत असंभव। अगर, यात्रा के किसी भी क्षण, तुम 15 पुण्य इकट्ठा कर लो, शुद्ध पवित्रता के पंद्रह कर्म, तो तुम पट से पूरी तरह ऊपर उठ जाते हो। खाना 100 की ज़रूरत नहीं। सटीक पासे की ज़रूरत नहीं। पट ख़ुद, तुम्हारे नीचे से विलीन हो जाता है, और तुम्हारी आत्मा उठती है, शुद्ध प्रकाश में। तुरंत मोक्ष। यही वो प्राचीन सत्य है जो ऋषियों ने इस खेल में छिपाया। कि सच्ची शुद्ध आत्मा, अस्तित्व के चक्र से मुक्त हो सकती है, किसी भी क्षण। किसी भी खाने से। ज़्यादातर साधक, कभी कोई रास्ता नहीं पा सकेंगे। वो इस पट पर अनंतकाल भटकते रहेंगे, उठते और गिरते, चढ़ते और निगले जाते, हमेशा पुण्य और पाप के बीच फंसे। लेकिन शायद, तुम, अलग हो। धर्म, इंतज़ार कर रहा है। पासे, तैयार हैं। सांप, तुम्हारे डर की गंध पहले से सूंघ रहे हैं। एक सांस लो। और कदम रखो, पट पर।",
  body:"Two paths to escape the wheel of संसार Saṃsāra.\n\n꧁ प्रथम मार्ग · THE FIRST PATH ꧂\nReach Square 100 with an exact roll.\nपुण्य Punya must ≥ पाप Pāp.\nIf impure → cast back to Square 67.\n\n꧁ द्वितीय मार्ग · THE SECOND PATH ꧂\nAccumulate 15 पुण्य Punya at any moment.\nThe board dissolves. Instant मोक्ष Moksha.\n\nMost seekers will never achieve either.\n\nधर्म Dharma awaits.\nThe नवग्रह Navagraha are watching.\nThe serpents can smell your fear.\n\nStep onto the board."},
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

/* ═══ VOICEOVER — Puter.js Neural AI → Browser Fallback ═══ */
/* ═══ AUDIO CACHE — Preloads all narration, plays instantly ═══ */
const AudioCache = {
  cache: {},
  loading: {},

  _key(text) { return text.slice(0, 80); },

  async fetchTTS(text, lang, voiceOverride, instructionOverride) {
    const key = this._key(text);
    if (this.cache[key]) return this.cache[key];
    if (this.loading[key]) return this.loading[key];

    const isHi = lang === 'hi';
    const promise = fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: voiceOverride || 'ash',
        instructions: instructionOverride || (isHi
          ? 'You are an ancient Indian storyteller narrating in Hindi. Speak slowly, mysteriously, with deep emotion. Pause dramatically between sentences.'
          : 'You are an ancient Indian sage narrating a sacred epic in English. Speak slowly, with deep gravitas and reverence. Pause dramatically between sentences.')
      }),
    }).then(r => {
      if (!r.ok) throw new Error('TTS failed');
      return r.blob();
    }).then(blob => {
      const url = URL.createObjectURL(blob);
      this.cache[key] = url;
      delete this.loading[key];
      return url;
    }).catch(e => {
      delete this.loading[key];
      return null;
    });

    this.loading[key] = promise;
    return promise;
  },

  get(text) { return this.cache[this._key(text)] || null; },

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
};

const VoiceEngine = {
  audio: null,
  speaking: false,

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

    const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);

    if (!isLocal) {
      const cached = AudioCache.get(text);
      if (cached) {
        const audio = new Audio(cached);
        audio.volume=1.0;
        this.audio = audio;
        this.speaking = true;
        audio.onended = () => { this.speaking = false; };
        await audio.play().catch(()=>{});
        return;
      }

      // Not cached — fetch now (will cache for next time)
      try {
        const url = await AudioCache.fetchTTS(text, lang);
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

    // Fallback: browser speech
    this._browserSpeak(text, lang);
  },

  stop() {
    if (this.audio) { try { this.audio.pause(); this.audio.currentTime = 0; } catch (e) {} this.audio = null; }
    if (this._yamaCtx) { try { this._yamaCtx.close(); } catch(e){} this._yamaCtx = null; }
    if (this._yamaSource) { try { this._yamaSource.stop(); } catch(e){} this._yamaSource = null; }
    if (this._yamaSource2) { try { this._yamaSource2.stop(); } catch(e){} this._yamaSource2 = null; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    this.speaking = false;
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

  // ═══ NARRATOR VOICE — Vedic temple processing for story onboarding ═══
  async speakNarrator(text, lang) {
    this.stop();
    if (!text) return;

    const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);
    let audioUrl = null;

    if (!isLocal) {
      audioUrl = AudioCache.get(text);
      if (!audioUrl) {
        try { audioUrl = await AudioCache.fetchTTS(text, lang); } catch(e){}
      }
    }
    if (!audioUrl) { this._browserSpeak(text, lang); return; }

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
      this.speaking = true;
      source.onended = () => {
        this.speaking = false;
        // Fade out drone gracefully
        droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(()=>{try{osc1.stop();osc2.stop();osc3.stop();ctx.close()}catch(e){}this._yamaCtx=null},2000);
      };
      source.start(0);
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
      audio.onended = () => { this.speaking = false; };
      await audio.play().catch(()=>{});
    } catch(e) {
      this._browserSpeak(text, lang);
    }
  }
};

/* Yama Image — put yama.png in /public folder */
function YamaIcon({size=80}){
  return <div style={{width:size,height:size*1.3,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <img src="/yama.png" alt="Yama - God of Death" style={{width:"100%",height:"100%",objectFit:"contain",filter:"drop-shadow(0 0 25px rgba(200,40,40,.5)) drop-shadow(0 0 50px rgba(160,40,40,.3))",borderRadius:8}}/>
  </div>;
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
      // Deep menacing laugh — 3 descending laugh pulses, LOUD
      o.type="sawtooth";
      g.gain.setValueAtTime(.18,t);
      // Pulse 1
      o.frequency.setValueAtTime(200,t);o.frequency.setValueAtTime(140,t+.2);
      g.gain.setValueAtTime(.18,t);g.gain.setValueAtTime(.02,t+.25);
      // Pulse 2
      g.gain.setValueAtTime(.15,t+.35);o.frequency.setValueAtTime(180,t+.35);o.frequency.setValueAtTime(120,t+.55);
      g.gain.setValueAtTime(.02,t+.6);
      // Pulse 3
      g.gain.setValueAtTime(.12,t+.7);o.frequency.setValueAtTime(160,t+.7);o.frequency.setValueAtTime(90,t+1);
      g.gain.exponentialRampToValueAtTime(.001,t+1.3);o.start(t);o.stop(t+1.4);
      // Sub-bass rumble under laugh
      const o2=c.createOscillator(),g2=c.createGain();o2.connect(g2);g2.connect(c.destination);
      o2.type="triangle";g2.gain.setValueAtTime(.1,t);
      o2.frequency.setValueAtTime(70,t);o2.frequency.setValueAtTime(50,t+.7);o2.frequency.setValueAtTime(35,t+1.2);
      g2.gain.exponentialRampToValueAtTime(.001,t+1.3);o2.start(t);o2.stop(t+1.4);
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
@keyframes cymaticPulse{0%{transform:scale(.95);opacity:.04}50%{transform:scale(1.05);opacity:.12}100%{transform:scale(.95);opacity:.04}}
@keyframes cymaticRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes cymaticFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes nagaSlither{0%{d:path('M0,20 Q15,5 30,20 T60,20')}50%{d:path('M0,20 Q15,35 30,20 T60,20')}100%{d:path('M0,20 Q15,5 30,20 T60,20')}}
@keyframes ringPulse{0%,100%{r:40;opacity:.06}50%{r:48;opacity:.1}}
.gb{background:transparent;border:1px solid rgba(200,160,60,.3);color:#e8c850;padding:12px 32px;font-size:14px;font-family:'Cinzel',serif;cursor:pointer;transition:all .4s;letter-spacing:3px;border-radius:2px}
.gb:hover{background:rgba(200,160,60,.08);border-color:rgba(240,200,80,.6)}
.gp{background:linear-gradient(180deg,rgba(200,160,60,.2),rgba(200,160,60,.08));border-color:rgba(200,160,60,.5)}
.gp:hover{box-shadow:0 0 25px rgba(240,200,80,.12)}
`;
const PG={minHeight:"100vh",background:"linear-gradient(170deg,#0c0a07,#1a1408,#0c0a07)",fontFamily:"'Cinzel',serif",color:"#e8c850",position:"relative",overflow:"hidden"};

// ═══ AUTH HOOK ═══
function useAuth(){
  const[user,setUser]=useState(null);
  const[profile,setProfile]=useState(null);
  const[loading,setLoading]=useState(true);
  const loadProfile=async(uid)=>{
    if(!supabase)return;
    try{
      const{data}=await supabase.from("profiles").select("*").eq("id",uid).single();
      if(data){
        setProfile(data);
        // Update profile with Google data if name/email missing
        const meta=supabase.auth?.getUser?.()?.then?.(r=>r.data?.user?.user_metadata);
        if(meta)meta.then(m=>{
          if(m&&(!data.display_name||data.display_name==="Seeker"||!data.email)){
            supabase.from("profiles").update({
              display_name:m.full_name||m.name||data.display_name,
              avatar_url:m.avatar_url||m.picture||data.avatar_url,
              email:m.email||data.email
            }).eq("id",uid).then(()=>supabase.from("profiles").select("*").eq("id",uid).single().then(r=>{if(r.data)setProfile(r.data)}));
          }
        });
      }
    }catch(e){console.error("Profile load error:",e)}
  };
  useEffect(()=>{
    if(!supabase){setLoading(false);return}
    // Timeout: if getSession hangs for 3s, force loading=false
    const timeout=setTimeout(()=>{console.warn("Auth: getSession timeout, proceeding without auth");setLoading(false)},3000);
    supabase.auth.getSession()
      .then(({data:{session}})=>{clearTimeout(timeout);setUser(session?.user??null);if(session?.user)loadProfile(session.user.id);setLoading(false)})
      .catch(e=>{clearTimeout(timeout);console.error("Auth getSession error:",e);setLoading(false)});
    const{data:{subscription}}=supabase.auth.onAuthStateChange(async(_,session)=>{setUser(session?.user??null);if(session?.user)await loadProfile(session.user.id);else setProfile(null);setLoading(false)});
    return()=>{clearTimeout(timeout);subscription.unsubscribe()};
  },[]);
  const signInGoogle=useCallback(async()=>{
    if(!supabase){alert("Supabase not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel env vars.");return}
    try{const{error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}});if(error){console.error("Google sign-in error:",error);alert("Google sign-in failed: "+error.message)}}catch(e){console.error("Sign-in error:",e);alert("Sign-in error: "+e.message)}
  },[]);
  const signOut=useCallback(async()=>{if(!supabase)return;await supabase.auth.signOut();setUser(null);setProfile(null)},[]);
  const refresh=useCallback(async()=>{if(user)await loadProfile(user.id)},[user]);
  return{user,profile,signInGoogle,signOut,loading,refresh};
}

// ═══ GAME DATABASE SERVICE ═══
const GameDB={
  async saveGame(userId,d){
    if(!supabase||!userId){console.log("GameDB: No supabase or userId");return null}
    console.log("GameDB: Step 1 - Saving game for",userId);

    // Check if profile exists first
    const{data:profileCheck,error:profileCheckErr}=await supabase.from("profiles").select("id").eq("id",userId).single();
    console.log("GameDB: Step 2 - Profile exists?",profileCheck?"YES":"NO",profileCheckErr?.message||"");

    // If no profile, create one
    if(!profileCheck){
      console.log("GameDB: Step 2b - Creating missing profile...");
      const{error:createErr}=await supabase.from("profiles").insert({id:userId,display_name:"Seeker",email:"",provider:"google"});
      console.log("GameDB: Profile create:",createErr?"FAILED "+createErr.message:"OK");
    }

    // Insert game history
    console.log("GameDB: Step 3 - Inserting game_history...");
    const{error:gameErr}=await supabase.from("game_history").insert({
      user_id:userId,duration_seconds:d.duration||0,total_turns:d.turns||0,
      character_name:d.charName||"Seeker",character_icon:d.charIcon||"🔱",
      opponent_type:d.opponent||"yama",result:d.result||"quit",
      final_square:d.square||1,final_punya:d.punya||0,final_papa:d.papa||0,
      snakes_hit:d.snakes||0,ladders_climbed:d.ladders||0,
      riddles_correct:d.riddlesC||0,riddles_wrong:d.riddlesW||0,
      highest_square:d.highest||1,ashtanga_reached:d.ashtanga||false
    });
    console.log("GameDB: Step 4 -",gameErr?"ERROR: "+gameErr.message:"SUCCESS");

    // Update profile
    console.log("GameDB: Step 5 - Updating profile...");
    const isWin=d.result==="moksha_win"||d.result==="karma_win";
    const{data:cur}=await supabase.from("profiles").select("*").eq("id",userId).single();
    if(cur){
      const{error:upErr}=await supabase.from("profiles").update({
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
      }).eq("id",userId);
      console.log("GameDB: Step 6 -",upErr?"ERROR: "+upErr.message:"PROFILE UPDATED ✓");
    }
    console.log("GameDB: ✓ ALL DONE");
    return true;
  },
  async getHistory(userId,limit=20){if(!supabase||!userId)return[];const{data,error}=await supabase.from("game_history").select("*").eq("user_id",userId).order("played_at",{ascending:false}).limit(limit);if(error)console.error("getHistory:",error.message);return data||[]},
  async getLeaderboard(limit=50){if(!supabase)return[];const{data,error}=await supabase.from("leaderboard").select("*").limit(limit);if(error)console.error("getLeaderboard:",error.message);return data||[]},
};

// ═══ GOOGLE SVG ICON ═══
function GoogleIcon(){return <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>}
function AppleIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="#e8c850"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>}

export default function MokshaPatam108(){
  const auth=useAuth();
  const[showProfile,setShowProfile]=useState(false);
  const[devMode,setDevMode]=useState(false);
  const[profileTab,setProfileTab]=useState("overview");
  const[gameHistory,setGameHistory]=useState([]);
  const[leaderboard,setLeaderboard]=useState([]);
  const[histLoading,setHistLoading]=useState(false);
  // Game tracking stats (reset each game)
  const gameStats=useRef({startTime:0,turns:0,snakes:0,ladders:0,dharma:0,riddlesC:0,riddlesW:0,highest:1,ashtanga:false,rejected:0});

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
      voiceTimerRef.current=setTimeout(()=>{voiceTimerRef.current=null;VoiceEngine.speak(popup.subtitle,chosenLang)},200);
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
    gameStats.current={startTime:Date.now(),turns:0,snakes:0,ladders:0,dharma:0,riddlesC:0,riddlesW:0,highest:1,ashtanga:false,rejected:0};
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
          }else{const o=p;p=sn.to;eMsg=`𓆙 ${o}→${p}`;nPapa[cur]+=2;gameStats.current.snakes++;play("snake");play("yamaLaugh");
            showEvent({icon:"𓆙",title:`${sn.skt} — ${sn.en}`,subtitle:`${pName}, the serpent of ${sn.en} caught you! ${sn.tale} Dragged from ${o} to ${p}. +2 PAPA.`,color:"#e06030",extra:`${o} → ${p}`},()=>finishTurn(true));
          }}
          else if(LADDERS[p]){const ld=LADDERS[p];const o=p;p=ld.to;eMsg=`🪔 ${o}→${p}`;nPunya[cur]+=1;gameStats.current.ladders++;play("ladder");
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
        np[dil.pi]+=(fx.punya||2);
        setPunya(np);setPapa(npa);setSkipA(nsk);setPos(npos);setShieldA(nsh);
        setMsg(`✓ Correct! ${pName} gains +${fx.punya||2} Punya`);
        gameStats.current.riddlesC++;
        // Play chime + speak appreciation with delay so voice isn't killed
        play("chime");
        if(!muted){
          ambient.duck();
          setTimeout(()=>VoiceEngine.speak(`Well done ${pName}! You answered correctly. Your soul grows purer.`,chosenLang),300);
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
          setTimeout(()=>VoiceEngine.speak(`Wrong answer! Yama laughs at your ignorance. Back to square ${backTo}.`,chosenLang),300);
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
    if(ch.k==="punya"){play("chime");gameStats.current.riddlesC++}else if(ch.k==="papa"){play("yamaLaugh");gameStats.current.riddlesW++}
    if(np[dil.pi]>=30&&!win){setWin(dil.pi);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory")}
    setDil(null);setCur(c=>(c+1)%nP);
  };

  // ═══ AUTO-SAVE GAME ON WIN ═══
  useEffect(()=>{
    if(win===null||!auth.user||!players[win])return;
    const gs=gameStats.current;
    const isKarma=punya[win]>=30;
    const isMoksha=pos[win]>=108&&punya[win]>=papa[win];
    GameDB.saveGame(auth.user.id,{
      duration:Math.floor((Date.now()-(gs.startTime||Date.now()))/1000),
      turns:gs.turns||0,
      charName:players[win]?.char?.name||"Seeker",
      charIcon:players[win]?.char?.icon||"🔱",
      opponent:players.some(p=>p.cpu)?"yama":"multiplayer",
      result:isKarma?"karma_win":"moksha_win",
      square:pos[win]||108,
      punya:punya[win]||0,papa:papa[win]||0,
      snakes:gs.snakes||0,ladders:gs.ladders||0,
      dharma:gs.dharma||0,riddlesC:gs.riddlesC||0,riddlesW:gs.riddlesW||0,
      highest:gs.highest||1,ashtanga:gs.ashtanga||false,rejected:gs.rejected||0
    }).then(()=>{auth.refresh();console.log("Game saved!")}).catch(e=>console.error("Save failed:",e));
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
      VoiceEngine.speak(voiceText,chosenLang);
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
              {[["overview","🔱 Overview"],["history","📜 History"],["leaderboard","🏆 Leaderboard"]].map(([key,label])=><button key={key} onClick={()=>{setProfileTab(key);if(key==="history"&&auth.user){setHistLoading(true);GameDB.getHistory(auth.user.id).then(d=>{setGameHistory(d);setHistLoading(false)})}if(key==="leaderboard")GameDB.getLeaderboard().then(d=>setLeaderboard(d))}} style={{padding:"6px 16px",fontSize:11,borderRadius:20,cursor:"pointer",border:`1px solid ${profileTab===key?"rgba(240,200,80,.4)":"rgba(200,160,60,.15)"}`,background:profileTab===key?"rgba(240,200,80,.1)":"transparent",color:profileTab===key?"#f0d050":"#8a7a50",fontFamily:"'Cinzel',serif",letterSpacing:1}}>{label}</button>)}
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
            </>}
            {/* History */}
            {profileTab==="history"&&<>{histLoading?<div style={{textAlign:"center",padding:40,color:"#5a4a30",fontSize:12}}>Loading past lives...</div>:gameHistory.length===0?<div style={{textAlign:"center",padding:40,color:"#5a4a30",fontSize:12,fontStyle:"italic"}}>No games yet. Your journey begins with the first roll.</div>:gameHistory.map(g=><div key={g.id} style={{background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.1)",borderRadius:8,padding:14,marginBottom:10,display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{fontSize:24,minWidth:36,textAlign:"center"}}>{g.character_icon||"🔱"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,color:"#f0d050",fontWeight:700,fontFamily:"'Cinzel',serif"}}>{g.character_name}</span><span style={{fontSize:10,color:"#8a7a50"}}>{new Date(g.played_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span></div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:g.result==="moksha_win"?"rgba(240,200,80,.12)":g.result==="karma_win"?"rgba(100,200,100,.12)":g.result==="loss"?"rgba(200,80,60,.12)":"rgba(100,100,100,.12)",color:g.result==="moksha_win"?"#f0d050":g.result==="karma_win"?"#80c080":g.result==="loss"?"#e08060":"#8a7a50",border:`1px solid ${g.result==="moksha_win"?"rgba(240,200,80,.2)":g.result==="karma_win"?"rgba(100,200,100,.2)":"rgba(200,80,60,.2)"}`}}>{g.result==="moksha_win"?"ॐ MOKSHA":g.result==="karma_win"?"☀ KARMA WIN":g.result==="loss"?"🌑 LOSS":"⏸ QUIT"}</span>
                  <span style={{fontSize:10,color:"#8a7a50"}}>Sq {g.final_square} · {g.total_turns} turns</span>
                </div>
                <div style={{display:"flex",gap:12,fontSize:10,color:"#8a7a50"}}><span style={{color:"#80c080"}}>+{g.final_punya} punya</span><span style={{color:"#e08060"}}>+{g.final_papa} papa</span>{g.riddles_correct>0&&<span>🪷 {g.riddles_correct}/{g.riddles_correct+g.riddles_wrong}</span>}{g.ashtanga_reached&&<span style={{color:"#f0d050"}}>⚡ Ashtanga</span>}</div>
              </div>
            </div>)}</>}
            {/* Leaderboard */}
            {profileTab==="leaderboard"&&<div style={{background:"rgba(20,16,10,.6)",border:"1px solid rgba(200,160,60,.1)",borderRadius:8,overflow:"hidden"}}>{leaderboard.length===0?<div style={{textAlign:"center",padding:30,color:"#5a4a30",fontSize:12}}>The sacred ledger is empty.</div>:leaderboard.map((lb,i)=>{const isMe=auth.user&&lb.id===auth.user.id;const lks=(lb.total_punya_earned||0)-(lb.total_papa_earned||0);return<div key={lb.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid rgba(200,160,60,.06)",background:isMe?"rgba(240,200,80,.06)":"transparent"}}>
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
      {/* Sacred geometry background — cymatics water vibration patterns */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at center,transparent 35%,rgba(8,6,3,.8) 100%)"}}/>
        {/* Cymatics rings — water vibration patterns at different frequencies */}
        <svg style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"120%",height:"120%",opacity:1}} viewBox="0 0 800 800">
          {/* Cymatics water vibration rings — multiple frequencies */}
          <circle cx="400" cy="400" r="60" fill="none" stroke="#c0a040" strokeWidth=".6" opacity=".08" style={{animation:"cymaticPulse 3.5s ease infinite"}}/>
          <circle cx="400" cy="400" r="100" fill="none" stroke="#c0a040" strokeWidth=".5" opacity=".1" style={{animation:"cymaticPulse 4s ease infinite .3s"}}/>
          <circle cx="400" cy="400" r="150" fill="none" stroke="#c0a040" strokeWidth=".4" opacity=".12" style={{animation:"cymaticPulse 5s ease infinite .6s"}}/>
          <circle cx="400" cy="400" r="210" fill="none" stroke="#c0a040" strokeWidth=".4" opacity=".1" style={{animation:"cymaticPulse 6s ease infinite 1s"}}/>
          <circle cx="400" cy="400" r="280" fill="none" stroke="#c0a040" strokeWidth=".3" opacity=".08" style={{animation:"cymaticPulse 7s ease infinite 1.4s"}}/>
          <circle cx="400" cy="400" r="360" fill="none" stroke="#c0a040" strokeWidth=".3" opacity=".06" style={{animation:"cymaticPulse 8s ease infinite 1.8s"}}/>

          {/* Flower of Life — seed of life circles */}
          {[0,60,120,180,240,300].map(a=><circle key={"fl"+a} cx={400+60*Math.cos(a*Math.PI/180)} cy={400+60*Math.sin(a*Math.PI/180)} r="60" fill="none" stroke="#c0a040" strokeWidth=".3" opacity=".06" style={{animation:`cymaticPulse ${5+a/100}s ease infinite ${a/400}s`}}/>)}

          {/* Hexagonal cymatics nodes — inner ring */}
          {[0,60,120,180,240,300].map(a=><g key={"n1"+a}><circle cx={400+105*Math.cos(a*Math.PI/180)} cy={400+105*Math.sin(a*Math.PI/180)} r="4" fill="#c0a040" opacity=".12" style={{animation:`cymaticPulse ${3+a/100}s ease infinite ${a/200}s`}}/><line x1={400+95*Math.cos(a*Math.PI/180)} y1={400+95*Math.sin(a*Math.PI/180)} x2={400+115*Math.cos(a*Math.PI/180)} y2={400+115*Math.sin(a*Math.PI/180)} stroke="#c0a040" strokeWidth=".3" opacity=".08"/></g>)}

          {/* Outer ring nodes */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=><circle key={"n2"+a} cx={400+220*Math.cos(a*Math.PI/180)} cy={400+220*Math.sin(a*Math.PI/180)} r="2.5" fill="#c0a040" opacity=".08" style={{animation:`cymaticPulse ${4+a/120}s ease infinite ${a/300}s`}}/>)}

          {/* Naga serpent knots — slow rotating infinity patterns */}
          <g style={{animation:"cymaticRotate 50s linear infinite"}} opacity=".1">
            <path d="M300,400 C300,340 350,300 400,300 C450,300 500,340 500,400 C500,460 450,500 400,500 C350,500 300,460 300,400 Z" fill="none" stroke="#c0a040" strokeWidth=".7"/>
            <path d="M320,400 C320,355 355,320 400,320 C445,320 480,355 480,400 C480,445 445,480 400,480 C355,480 320,445 320,400 Z" fill="none" stroke="#c0a040" strokeWidth=".5"/>
          </g>
          <g style={{animation:"cymaticRotate 70s linear infinite reverse"}} opacity=".08">
            <path d="M230,400 Q315,280 400,400 T570,400" fill="none" stroke="#c0a040" strokeWidth=".5"/>
            <path d="M230,400 Q315,520 400,400 T570,400" fill="none" stroke="#c0a040" strokeWidth=".5"/>
          </g>

          {/* Sri Yantra triangles */}
          <polygon points="400,290 325,440 475,440" fill="none" stroke="#c0a040" strokeWidth=".4" opacity=".06" style={{animation:"cymaticPulse 10s ease infinite"}}/>
          <polygon points="400,510 325,360 475,360" fill="none" stroke="#c0a040" strokeWidth=".4" opacity=".06" style={{animation:"cymaticPulse 10s ease infinite 5s"}}/>
          <polygon points="400,330 355,420 445,420" fill="none" stroke="#c0a040" strokeWidth=".3" opacity=".04" style={{animation:"cymaticPulse 12s ease infinite 2s"}}/>
          <polygon points="400,470 355,380 445,380" fill="none" stroke="#c0a040" strokeWidth=".3" opacity=".04" style={{animation:"cymaticPulse 12s ease infinite 7s"}}/>

          {/* Connecting radial lines — like spokes */}
          {[0,45,90,135,180,225,270,315].map(a=><line key={"sp"+a} x1={400+70*Math.cos(a*Math.PI/180)} y1={400+70*Math.sin(a*Math.PI/180)} x2={400+350*Math.cos(a*Math.PI/180)} y2={400+350*Math.sin(a*Math.PI/180)} stroke="#c0a040" strokeWidth=".15" opacity=".04"/>)}
        </svg>
        {/* Corner naga knots — Hindu temple inspired mandorla/vesica piscis */}
        <svg style={{position:"absolute",top:16,left:16,width:80,height:80,opacity:.15}} viewBox="0 0 80 80">
          <path d="M15,40 Q40,5 65,40 Q40,75 15,40 Z" fill="none" stroke="#c0a040" strokeWidth="1.2"/>
          <path d="M25,40 Q40,15 55,40 Q40,65 25,40 Z" fill="none" stroke="#c0a040" strokeWidth=".7"/>
          <circle cx="40" cy="40" r="5" fill="none" stroke="#c0a040" strokeWidth=".5" opacity=".5"/>
          <circle cx="40" cy="40" r="2" fill="#c0a040" opacity=".3"/>
        </svg>
        <svg style={{position:"absolute",top:16,right:16,width:80,height:80,opacity:.15,transform:"scaleX(-1)"}} viewBox="0 0 80 80">
          <path d="M15,40 Q40,5 65,40 Q40,75 15,40 Z" fill="none" stroke="#c0a040" strokeWidth="1.2"/>
          <path d="M25,40 Q40,15 55,40 Q40,65 25,40 Z" fill="none" stroke="#c0a040" strokeWidth=".7"/>
          <circle cx="40" cy="40" r="5" fill="none" stroke="#c0a040" strokeWidth=".5" opacity=".5"/>
          <circle cx="40" cy="40" r="2" fill="#c0a040" opacity=".3"/>
        </svg>
        <svg style={{position:"absolute",bottom:50,left:16,width:60,height:60,opacity:.1}} viewBox="0 0 60 60">
          <path d="M10,30 Q30,2 50,30 Q30,58 10,30 Z" fill="none" stroke="#c0a040" strokeWidth="1"/>
          <circle cx="30" cy="30" r="3" fill="#c0a040" opacity=".2"/>
        </svg>
        <svg style={{position:"absolute",bottom:50,right:16,width:60,height:60,opacity:.1,transform:"scaleX(-1)"}} viewBox="0 0 60 60">
          <path d="M10,30 Q30,2 50,30 Q30,58 10,30 Z" fill="none" stroke="#c0a040" strokeWidth="1"/>
          <circle cx="30" cy="30" r="3" fill="#c0a040" opacity=".2"/>
        </svg>
      </div>

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
              <button className="gb gp" disabled={preloading} onClick={()=>{
                ambient.start();
                const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);
                if (isLocal) { setScreen("story"); setStoryPage(0); return; }
                setPreloading(true); setPreloadPct(0);
                const { promise, progress } = AudioCache.preloadAll(chosenLang);
                const iv = setInterval(() => setPreloadPct(progress()), 300);
                promise.then(() => { clearInterval(iv); setPreloadPct(100); setCacheCount(AudioCache.count()); setPreloading(false); setScreen("story"); setStoryPage(0); })
                  .catch(() => { clearInterval(iv); setPreloading(false); setScreen("story"); setStoryPage(0); });
              }} style={{fontSize:13,padding:"12px 28px",letterSpacing:2}}>
                {preloading ? `📜 LOADING... ${preloadPct}%` : "📜 BEGIN STORY"}
              </button>
              <button className="gb" onClick={()=>{ambient.start();setScreen("pickcount")}} style={{fontSize:13,padding:"12px 28px",letterSpacing:2,opacity:.5}}>⚡ PLAY</button>
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
          <button className="gb gp" onClick={()=>setScreen("setup")} style={{padding:"14px 40px",fontSize:16,letterSpacing:4,background:"rgba(160,64,64,.15)",border:"2px solid rgba(160,64,64,.4)",color:"#e08080"}}>
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
          {win!==null&&<div style={{background:"radial-gradient(circle,rgba(240,200,80,.08),#12100a)",border:"2px solid rgba(240,200,80,.4)",padding:22,textAlign:"center"}}>
            <div style={{fontSize:40,animation:"mp 2s ease infinite"}}>ॐ</div>
            <div style={{fontSize:20,fontFamily:"'Yatra One',serif",margin:"6px 0",color:"#f0d050"}}>मोक्ष प्राप्त</div>
            <div style={{fontSize:15,color:players[win]?.char?.color}}>{players[win]?.char?.icon} {players[win]?.name}</div>
            <div style={{fontSize:12,opacity:.6,marginBottom:8}}>{players[win]?.char?.name} is liberated</div>
            <div style={{display:"flex",gap:12,justifyContent:"center",fontSize:11,opacity:.5,marginBottom:12}}>
              <span style={{color:"#80c080"}}>Punya: {punya[win]}</span>
              <span style={{color:"#e08060"}}>Papa: {papa[win]}</span>
              <span>Sq: {pos[win]}</span>
            </div>
            {auth.user&&<div style={{fontSize:11,color:"#80c080",marginBottom:8}}>✓ Game saved to your profile</div>}
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={()=>{setScreen("title");setWin(null);setPlayers([]);ambient.stop()}} className="gb" style={{marginTop:4}}>New Journey</button>
              {auth.user&&<button onClick={()=>{setShowProfile(true);setProfileTab("history")}} className="gb" style={{marginTop:4,opacity:.7}}>📊 View Stats</button>}
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
        </div>
      </div>
    </div>
  );
}
