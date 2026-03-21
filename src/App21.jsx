import { useState, useCallback, useMemo, useEffect, useRef } from "react";

const SNAKES={16:{to:4,skt:"क्रोध",en:"WRATH",tale:"As Duryodhana's rage consumed the Kuru dynasty..."},23:{to:7,skt:"लोभ",en:"GREED",tale:"Like Shakuni who gambled away an empire..."},33:{to:12,skt:"मोह",en:"DELUSION",tale:"Dhritarashtra's blind love veiled all judgment..."},38:{to:21,skt:"मात्सर्य",en:"ENVY",tale:"Duryodhana burned with jealousy at Indraprastha..."},47:{to:29,skt:"काम",en:"DESIRE",tale:"Keechaka's lust brought his annihilation..."},56:{to:41,skt:"मद",en:"PRIDE",tale:"Ravana's arrogance toppled golden Lanka..."},62:{to:44,skt:"भय",en:"TERROR",tale:"Arjuna paralysed before the great war..."},74:{to:51,skt:"द्वेष",en:"HATRED",tale:"Drona and Drupada's hatred echoed ages..."},85:{to:59,skt:"आलस्य",en:"SLOTH",tale:"Kumbhakarna slept while dharma crumbled..."},95:{to:68,skt:"अहंकार",en:"EGO",tale:"Parashurama's ego challenged even Rama..."}};
const LADDERS={3:{to:18,skt:"दया",en:"COMPASSION",tale:"Yudhishthira who wept for his enemies..."},9:{to:31,skt:"दान",en:"GENEROSITY",tale:"Karna gave his armour without hesitation..."},22:{to:42,skt:"सत्य",en:"TRUTH",tale:"Harishchandra sacrificed all for truth..."},28:{to:52,skt:"सेवा",en:"SERVICE",tale:"Hanuman whose devotion moved mountains..."},37:{to:58,skt:"तपस्",en:"AUSTERITY",tale:"Vishwamitra whose tapas shook Indra..."},44:{to:65,skt:"श्रद्धा",en:"FAITH",tale:"Shabari waited a lifetime for Rama..."},53:{to:72,skt:"विद्या",en:"WISDOM",tale:"Vidura whose counsel was dharma itself..."},61:{to:80,skt:"विवेक",en:"DISCERNMENT",tale:"Bhishma on his bed of arrows..."},71:{to:89,skt:"भक्ति",en:"DEVOTION",tale:"Prahlada whose devotion survived fire..."},82:{to:97,skt:"वैराग्य",en:"DETACHMENT",tale:"Siddhartha leaving the palace..."}};
const DLM_SQ=[5,10,14,19,25,30,35,43,48,55,60,64,69,73,78,83,88,92];
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
  {n:"केतु",en:"Ketu — The Tail",icon:"☋",desc:"Ketu is Rahu's headless body — the planet of detachment and moksha. All seekers lose their Shield (if any). Ketu strips away all protection, all attachments. But in loss, there is liberation. The seeker closest to Square 100 gains +1 Punya — for Ketu rewards those who are ready to let go.",color:"#a06060",fx:"ketu"},
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
  hi:"ध्यान से सुनो। जो मैं बताने जा रही हूँ, वो पांच हज़ार सालों से छिपाया गया है। महाभारत लिखे जाने से पहले। पहले मंदिरों को पत्थर में तराशे जाने से पहले। इंसानी होंठों से सबसे पुराने वेदों के उच्चारण से भी पहले। एक खेल था। लेकिन मनोरंजन का खेल नहीं। नहीं। ये आत्मा का खेल था। अज्ञात ऋषियों द्वारा रचा गया, इतने प्राचीन, कि देवताओं को भी उनके नाम याद नहीं। उन्होंने इसे कहा, मोक्षपटम। मुक्ति का पट। पवित्र मंडलियों में फुसफुसाया जाता था, कि जो इस खेल को सच में समझ ले, वो जीवन का, मृत्यु का, और उसके पार जो कुछ भी है, उसका सबसे गहरा रहस्य जान जाएगा। हज़ारों सालों तक, राजाओं ने इसे संगमरमर के महलों में खेला। ऋषियों ने इसे वन के आश्रमों में, अग्नि की रोशनी में खेला। गुरु से शिष्य तक, दबी आवाज़ में, जैसे पट ख़ुद जीवित हो। और फिर, एक अंधेरे दिन, विदेशी इस धरती पर आए। उन्होंने पट देखा। चुरा लिया। हर पवित्र नाम छीन लिया। हर संस्कृत श्लोक। अर्थ की हर बूँद। और नाम रख दिया। सांप सीढ़ी। बच्चों का खेल। खेल की आत्मा की हत्या कर दी गई। इतिहास से मिटा दिया गया। भुला दिया गया। इस, एक क्षण तक। आज रात, तुम असली खेल खेलोगे। वो खेल जो तुम्हारे पूर्वजों ने खेला था। वो खेल, जो देवता, भूल गए।",
  body:"Before the Mahābhārata was written down...\nbefore the temples were carved in stone...\n\nThere existed a game. A game of the soul.\n\nThey called it मोक्षपटम् — Moksha Patam.\nThe Board of Liberation.\n\nPassed from गुरु to शिष्य in whispered secrecy.\n\nThen foreigners came. They renamed it 'Snakes and Ladders.'\n\nThe soul of the game was murdered.\nUntil this very moment."},
  {title:"The Sacred Board",icon:"📜",
  en:"Now, look at the board before you. It is not a board. It is a map. A map, of the entire universe. A map, of your soul's journey through existence. One hundred squares. Three realms. And one, single, destination. The first realm, Squares 1 through 33, is Bhuloka. The Earthly Realm. This is where you are born. This is where chaos reigns. Snakes coil in every shadow. Ladders shimmer like mirages. Fortune rises and crashes with every single step. Most souls, are trapped here. Forever. Cycling endlessly through birth, and death, and birth again. Never escaping. The second realm, Squares 34 through 66, is Antarloka. The Inner Realm. Here, the noise of the world fades to silence. But do not be deceived by the quiet. The serpents here are more cunning. They do not bite your flesh. They poison, your mind. Doubt. Confusion. The slow erosion of faith. The third realm, Squares 67 through 99, is Svargaloka. The Celestial Realm. You can feel liberation from here. You can almost, taste it. But beware. The serpents who dwell in the heavens, are the most terrifying of all. A single fall here, does not cost you a few squares. It destroys, lifetimes, of spiritual progress. And there, at the summit, Square 100. Moksha. Liberation. The end of all suffering. But reaching Moksha, is only half the battle. Arriving, with a pure soul, that is the true challenge.",
  hi:"अब, अपने सामने पट को देखो। ये सिर्फ पट नहीं है। ये एक नक्शा है। पूरे ब्रह्मांड का नक्शा। अस्तित्व के माध्यम से तुम्हारी आत्मा की यात्रा का नक्शा। सौ खाने। तीन लोक। और एक, अकेली, मंज़िल। पहला लोक, खाना 1 से 33, भूलोक है। पृथ्वी लोक। यहीं तुम्हारा जन्म होता है। यहीं अराजकता राज करती है। हर छाया में सांप कुंडली मारे बैठे हैं। सीढ़ियां मरीचिकाओं सी चमकती हैं। किस्मत हर एक कदम पर उठती और गिरती है। ज़्यादातर आत्माएं, यहीं फंसी रहती हैं। हमेशा के लिए। जन्म, मृत्यु, और फिर जन्म के अंतहीन चक्र में। कभी नहीं छूटतीं। दूसरा लोक, खाना 34 से 66, अंतर्लोक है। आंतरिक लोक। यहां, दुनिया का शोर शांत हो जाता है। लेकिन इस सन्नाटे से धोखा मत खाना। यहां के सांप ज़्यादा चालाक हैं। ये तुम्हारा शरीर नहीं काटते। ये ज़हर भरते हैं, तुम्हारे मन में। संदेह। भ्रम। श्रद्धा का धीमा क्षरण। तीसरा लोक, खाना 67 से 99, स्वर्गलोक है। दिव्य लोक। यहां से मुक्ति महसूस होती है। लगभग, छू सकते हो। लेकिन सावधान। स्वर्ग में रहने वाले सांप, सबसे भयानक हैं। यहां एक गिरावट, कुछ खानों की नहीं होती। ये मिटा देती है, जन्मों की, आध्यात्मिक साधना को। और वहां, शिखर पर, खाना 100। मोक्ष। मुक्ति। सारे दुखों का अंत। लेकिन मोक्ष तक पहुंचना, आधी लड़ाई है। शुद्ध आत्मा लेकर पहुंचना, वो असली चुनौती है।",
  body:"The board is not a board.\nIt is a map — of the entire universe.\n\n१०० squares · Three realms · One destination\n\n꧁ भूलोक · BHULOKA ꧂\nSquares 1–33 — The Earthly Realm\nChaos reigns. Most souls trapped here forever.\n\n꧁ अन्तर्लोक · ANTARLOKA ꧂\nSquares 34–66 — The Inner Realm\nSerpents poison your mind, not your flesh.\n\n꧁ स्वर्गलोक · SVARGALOKA ꧂\nSquares 67–99 — The Celestial Realm\nOne fall destroys lifetimes of progress.\n\n꧁ मोक्ष · MOKSHA ꧂\nSquare 100 — Liberation.\nArriving with a pure soul — that is the true challenge."},
  {title:"The Serpents Within",icon:"𓆙",
  en:"Now, hear me well, because what I am about to describe, will haunt you. They are not, just snakes. They are living nightmares. Ten colossal Nagas, ancient as time itself, coiled around this board since the beginning of creation. Each one, a manifestation of the darkest force, inside every human soul. The sages gave them names. And those names, should make your blood run cold. Krodh. Wrath. The same fire that consumed Duryodhana's mind and burned the Kuru dynasty to ash. When Krodh strikes, you feel the venom of rage dissolving everything you've built. Lobh. Greed. The insatiable hunger that made Shakuni gamble away an entire kingdom. Its jaws swallow your progress whole. Moh. Delusion. The blindness that kept Dhritarashtra from seeing his own sons destroy the world. This serpent, wraps around your eyes. Matsarya. Envy, that green poison that ate Duryodhana alive when he saw the glory of Indraprastha. Kaam. Desire. The burning lust that destroyed Keechaka in a single night. Mad. Pride. The ten-headed arrogance that toppled golden Lanka and brought mighty Ravana to his knees. Bhay. Fear. The same terror that froze Arjuna's hands before the greatest war in history. Dvesh. Hatred. The ancient feud between Drona and Drupada that echoed through generations of blood. Aalasya. Sloth. The great sleep of Kumbhakarna, who slumbered while dharma crumbled around him. And then, the deadliest of them all. Ahankaar. Ego. The serpent king. The one who whispers, I am above all others. The ego that challenged even Lord Rama himself. When a serpent catches you, it does not simply move you backward. It wraps its coils around your soul. It drags you, screaming, into the depths. And it stains you, with Paap. Sin karma. That mark, does not wash away easily. The higher you climb, the more violently you fall. And there is only one protection in this entire game. The celestial shield of Shukra, the planet Venus. But even that divine protection, can only save you, once. After that, you face the serpents, alone.",
  hi:"अब, ध्यान से सुनो, क्योंकि जो मैं बताने वाली हूँ, वो तुम्हें सपनों में भी सताएगा। ये, सिर्फ सांप नहीं हैं। ये जीवित दुःस्वप्न हैं। दस विशाल नाग, समय जितने प्राचीन, सृष्टि के आरम्भ से इस पट पर कुंडली मारे बैठे हैं। हर एक, हर इंसान की आत्मा के अंदर की सबसे काली शक्ति का रूप। ऋषियों ने इन्हें नाम दिए। और वो नाम, तुम्हारा खून जमा देने चाहिए। क्रोध। वो आग जिसने दुर्योधन का मन जलाया और कुरु वंश को राख कर दिया। जब क्रोध हमला करता है, क्रोध का विष तुम्हारी हर उपलब्धि को गला देता है। लोभ। वो अतृप्त भूख जिसने शकुनि से पूरा राज्य जुए में हरवा दिया। इसके जबड़े तुम्हारी प्रगति को साबुत निगल जाते हैं। मोह। वो अंधापन जिसने धृतराष्ट्र को अपने ही पुत्रों को संसार का विनाश करते देखने से रोका। ये सांप, तुम्हारी आँखों पर लिपट जाता है। मात्सर्य। ईर्ष्या, वो हरा ज़हर जिसने दुर्योधन को इंद्रप्रस्थ की महिमा देखकर अंदर से खा लिया। काम। वासना। वो जलती आग जिसने कीचक को एक ही रात में नष्ट कर दिया। मद। घमंड। वो दस सिरों वाला अहंकार जिसने सोने की लंका को धराशायी किया और महान रावण को घुटनों पर ला दिया। भय। वही आतंक जिसने इतिहास के सबसे महान युद्ध से पहले अर्जुन के हाथ जमा दिए। द्वेष। नफ़रत। द्रोण और द्रुपद की वो प्राचीन दुश्मनी जो खून की पीढ़ियों तक गूंजती रही। आलस्य। कुम्भकर्ण की वो महानिद्रा, जो सोता रहा जबकि उसके चारों ओर धर्म टूट रहा था। और फिर, सबसे घातक। अहंकार। नागराज। वो जो फुसफुसाता है, मैं सबसे ऊपर हूँ। वो अहंकार जिसने स्वयं भगवान राम को भी चुनौती दी। जब कोई सांप तुम्हें पकड़ता है, तो सिर्फ पीछे नहीं ले जाता। वो अपने कुंडल तुम्हारी आत्मा पर कसता है। तुम्हें, चीखते हुए, गहराइयों में खींचता है। और तुम पर दाग लगाता है, पाप का। वो दाग, आसानी से नहीं धुलता। जितना ऊपर चढ़ो, उतनी हिंसक होगी गिरावट। और इस पूरे खेल में सिर्फ एक सुरक्षा है। शुक्र ग्रह का दिव्य कवच। लेकिन वो दिव्य सुरक्षा भी, सिर्फ एक बार, बचा सकती है। उसके बाद, तुम सांपों का सामना, अकेले करोगे।",
  body:"They are not just snakes.\nThey are living nightmares — ten colossal नाग Nāgas.\n\n𓆙 क्रोध Krodh — Wrath\n    The fire that burned the Kuru dynasty to ash\n𓆙 लोभ Lobh — Greed\n    The hunger that swallowed Shakuni's kingdom\n𓆙 मोह Moh — Delusion\n    The blindness that veiled Dhritarashtra's eyes\n𓆙 मात्सर्य Mātsarya — Envy\n    The green poison that consumed Duryodhana\n𓆙 काम Kām — Desire\n    The flame that destroyed Keechaka in one night\n𓆙 मद Mad — Pride\n    The arrogance that toppled golden Lankā\n𓆙 भय Bhay — Fear\n    The terror that froze Arjuna before war\n𓆙 द्वेष Dvesh — Hatred\n    The feud that echoed through generations\n𓆙 आलस्य Ālasya — Sloth\n    The sleep of Kumbhakarna while dharma crumbled\n𓆙 अहंकार Ahankār — Ego\n    The serpent king. The deadliest of all.\n\nWhen bitten → dragged into the depths + 2 पाप Pāp.\nOnly शुक्र Shukra shields you — once."},
  {title:"The Path to Moksha",icon:"ॐ",
  en:"And now, the final truth. There are only two ways, to escape the wheel of Samsara. Two narrow paths, through an ocean of suffering. The First Path. Reach, Square 100, with an exact roll of the dice. Not one square more. Not one square less. But, even if you reach Moksha, the gates will not open for a tainted soul. Your Punya, your accumulated virtue, must equal, or exceed, your Paap, your sin. If you arrive at the threshold of liberation, carrying the weight of your failures, you will be cast back. Hurled down, to Square 67. To suffer again. To purify through pain. To crawl, once more, through the celestial realm, past the deadliest serpents, knowing that one wrong step sends you even further down. The Second Path. Far rarer. Far more beautiful. Far more impossible. If, at any moment during your journey, you accumulate 20 Punya, fifteen acts of pure virtue, you transcend the board entirely. You do not need Square 100. You do not need an exact roll. The board itself, dissolves beneath you, and your soul rises, into pure light. Instant Moksha. This is the ancient truth that the sages encoded into this game. That a truly pure soul, can break free from the cycle of existence, at any moment. From any square. Most seekers, will never achieve either path. They will wander this board for eternity, rising and falling, climbing and being devoured, forever caught between virtue and vice. But perhaps, you, will be different. Dharma, awaits. The dice, are ready. The serpents, can already smell your fear. Take a breath. And step, onto the board.",
  hi:"और अब, अंतिम सत्य। संसार के चक्र से बचने के सिर्फ दो रास्ते हैं। दुख के सागर से गुज़रते दो संकरे रास्ते। पहला रास्ता। खाना 100 पर पहुंचो, पासे के बिल्कुल सटीक अंक से। एक खाना ज़्यादा नहीं। एक खाना कम नहीं। लेकिन, अगर मोक्ष तक पहुंच भी गए, तो दूषित आत्मा के लिए द्वार नहीं खुलेंगे। तुम्हारा पुण्य, तुम्हारी संचित पवित्रता, तुम्हारे पाप से बराबर, या ज़्यादा होनी चाहिए। अगर मुक्ति की देहलीज़ पर पहुंचे, अपनी असफलताओं का बोझ लेकर, तो वापस फेंक दिए जाओगे। नीचे, खाना 67 पर। फिर से कष्ट भोगने। दर्द से शुद्ध होने। एक बार फिर, दिव्य लोक से रेंगते हुए गुज़रने, सबसे घातक सांपों के बीच से, ये जानते हुए कि एक ग़लत कदम तुम्हें और भी गहरे गिरा देगा। दूसरा रास्ता। बहुत दुर्लभ। बहुत सुंदर। बहुत असंभव। अगर, यात्रा के किसी भी क्षण, तुम 15 पुण्य इकट्ठा कर लो, शुद्ध पवित्रता के पंद्रह कर्म, तो तुम पट से पूरी तरह ऊपर उठ जाते हो। खाना 100 की ज़रूरत नहीं। सटीक पासे की ज़रूरत नहीं। पट ख़ुद, तुम्हारे नीचे से विलीन हो जाता है, और तुम्हारी आत्मा उठती है, शुद्ध प्रकाश में। तुरंत मोक्ष। यही वो प्राचीन सत्य है जो ऋषियों ने इस खेल में छिपाया। कि सच्ची शुद्ध आत्मा, अस्तित्व के चक्र से मुक्त हो सकती है, किसी भी क्षण। किसी भी खाने से। ज़्यादातर साधक, कभी कोई रास्ता नहीं पा सकेंगे। वो इस पट पर अनंतकाल भटकते रहेंगे, उठते और गिरते, चढ़ते और निगले जाते, हमेशा पुण्य और पाप के बीच फंसे। लेकिन शायद, तुम, अलग हो। धर्म, इंतज़ार कर रहा है। पासे, तैयार हैं। सांप, तुम्हारे डर की गंध पहले से सूंघ रहे हैं। एक सांस लो। और कदम रखो, पट पर।",
  body:"Two paths to escape the wheel of संसार Saṃsāra.\n\n꧁ प्रथम मार्ग · THE FIRST PATH ꧂\nReach Square 100 with an exact roll.\nपुण्य Punya must ≥ पाप Pāp.\nIf impure → cast back to Square 67.\n\n꧁ द्वितीय मार्ग · THE SECOND PATH ꧂\nAccumulate 15 पुण्य Punya at any moment.\nThe board dissolves. Instant मोक्ष Moksha.\n\nMost seekers will never achieve either.\n\nधर्म Dharma awaits.\nThe नवग्रह Navagraha are watching.\nThe serpents can smell your fear.\n\nStep onto the board."},
];

function sqP(n){const r=Math.floor((n-1)/10);return{r:9-r,c:r%2===0?(n-1)%10:9-((n-1)%10)}}
function rlm(n){return n<=33?"bhuloka":n<=66?"antarloka":"svargaloka"}

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
  const duck=useCallback(()=>{if(audioRef.current)audioRef.current.volume=0.01},[]);
  const unduck=useCallback(()=>{if(audioRef.current)audioRef.current.volume=0.08},[]);
  return{start,stop,duck,unduck,playing};
}

/* ═══ VOICEOVER — Puter.js Neural AI → Browser Fallback ═══ */
/* ═══ AUDIO CACHE — Preloads all narration, plays instantly ═══ */
const AudioCache = {
  cache: {},
  loading: {},

  _key(text) { return text.slice(0, 80); },

  async fetchTTS(text, lang) {
    const key = this._key(text);
    if (this.cache[key]) return this.cache[key];
    if (this.loading[key]) return this.loading[key];

    const isHi = lang === 'hi';
    const promise = fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: isHi ? 'nova' : 'ash',
        instructions: isHi
          ? 'You are an ancient Indian storyteller narrating in Hindi. Speak slowly, mysteriously, with deep emotion. Pause dramatically between sentences.'
          : 'You are an ancient Indian sage narrating a sacred epic in English. Speak slowly, with deep gravitas and reverence. Pause dramatically between sentences.'
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

  clear() {
    Object.values(this.cache).forEach(url => { try { URL.revokeObjectURL(url); } catch(e){} });
    this.cache = {};
    this.loading = {};
  },

  count() { return Object.keys(this.cache).length; },
};

const VoiceEngine = {
  audio: null,
  speaking: false,

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
    this.stop();
    if (!text) return;

    const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);

    if (!isLocal) {
      // Check cache FIRST — instant playback
      const cached = AudioCache.get(text);
      if (cached) {
        const audio = new Audio(cached);
        audio.volume=1.0;
        this.audio = audio;
        this.speaking = true;
        audio.onended = () => { this.speaking = false; };
        audio.play();
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
    try { window.speechSynthesis.cancel(); } catch (e) {}
    this.speaking = false;
  }
};

/* Instagram badge */
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
    }catch(e){}
  },[gc]);
}

function Naga({x1,y1,x2,y2,id}){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy),nx=-dy/len,amp=len*.14;
  let body=`M ${x1} ${y1}`;for(let i=1;i<=7;i++){const t=i/7,s=i%2===0?1:-1;body+=` Q ${x1+dx*((i-.5)/7)+nx*amp*s*(1-t*.3)} ${y1+dy*((i-.5)/7)+(dx/len)*amp*s*(1-t*.3)} ${x1+dx*t} ${y1+dy*t}`}
  const hx=x1,hy=y1,hue=["#6a2010","#502815","#3a1a0a"][id%3];
  return(<g>
    <path d={body} fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="4" strokeLinecap="round"/><path d={body} fill="none" stroke={hue} strokeWidth="3" strokeLinecap="round" opacity=".7"/><path d={body} fill="none" stroke="rgba(255,180,80,.12)" strokeWidth="2" strokeDasharray="1.2,2" strokeLinecap="round"/>
    <path d={`M ${hx-4.5} ${hy+1} C ${hx-5} ${hy-2} ${hx-3} ${hy-4.5} ${hx} ${hy-5} C ${hx+3} ${hy-4.5} ${hx+5} ${hy-2} ${hx+4.5} ${hy+1} C ${hx+3} ${hy+2} ${hx+1.5} ${hy+2.5} ${hx} ${hy+2.5} C ${hx-1.5} ${hy+2.5} ${hx-3} ${hy+2} ${hx-4.5} ${hy+1} Z`} fill={hue} stroke="rgba(200,100,40,.4)" strokeWidth=".3" opacity=".85"/>
    <ellipse cx={hx} cy={hy-2.8} rx=".7" ry=".6" fill="rgba(255,60,20,.5)"><animate attributeName="fill-opacity" values=".5;.8;.5" dur="2s" repeatCount="indefinite"/></ellipse>
    <ellipse cx={hx-1.2} cy={hy-.4} rx=".7" ry=".55" fill="#0a0000" stroke="rgba(255,120,30,.8)" strokeWidth=".25"/><ellipse cx={hx+1.2} cy={hy-.4} rx=".7" ry=".55" fill="#0a0000" stroke="rgba(255,120,30,.8)" strokeWidth=".25"/>
    <ellipse cx={hx-1.2} cy={hy-.4} rx=".12" ry=".5" fill="rgba(255,160,30,.9)"/><ellipse cx={hx+1.2} cy={hy-.4} rx=".12" ry=".5" fill="rgba(255,160,30,.9)"/>
    <path d={`M ${hx-.7} ${hy+1} L ${hx-1} ${hy+3.5} L ${hx-.3} ${hy+1.5} Z`} fill="rgba(255,250,230,.8)"/><path d={`M ${hx+.7} ${hy+1} L ${hx+1} ${hy+3.5} L ${hx+.3} ${hy+1.5} Z`} fill="rgba(255,250,230,.8)"/>
    <circle cx={x2} cy={y2} r=".9" fill="rgba(80,30,10,.25)"/>
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
.gb{background:transparent;border:1px solid rgba(200,160,60,.3);color:#e8c850;padding:12px 32px;font-size:14px;font-family:'Cinzel',serif;cursor:pointer;transition:all .4s;letter-spacing:3px;border-radius:2px}
.gb:hover{background:rgba(200,160,60,.08);border-color:rgba(240,200,80,.6)}
.gp{background:linear-gradient(180deg,rgba(200,160,60,.2),rgba(200,160,60,.08));border-color:rgba(200,160,60,.5)}
.gp:hover{box-shadow:0 0 25px rgba(240,200,80,.12)}
`;
const PG={minHeight:"100vh",background:"linear-gradient(170deg,#0c0a07,#1a1408,#0c0a07)",fontFamily:"'Cinzel',serif",color:"#e8c850",position:"relative",overflow:"hidden"};

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
  const[chosenLang,setChosenLang]=useState("en");
  const[preloading,setPreloading]=useState(false);
  const[preloadPct,setPreloadPct]=useState(0);
  const[cacheCount,setCacheCount]=useState(0);
  const[eventPopup,setEventPopup]=useState(null);
  const[turnBanner,setTurnBanner]=useState(null);
  const[isCPU,setIsCPU]=useState([]);
  const[usedDharma,setUsedDharma]=useState([]); // tracks which players are CPU

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
    setEventPopup(popup);
    eventCallback.current=onDismiss||null;
    if(!muted&&popup.subtitle){
      ambient.duck();
      VoiceEngine.speak(popup.subtitle,chosenLang);
    }
  }, [muted,chosenLang,ambient]);
  const dismissEvent = useCallback(() => {
    VoiceEngine.stop();
    ambient.unduck();
    setEventPopup(null);
    if(eventCallback.current){const cb=eventCallback.current;eventCallback.current=null;setTimeout(cb,100);}
  }, [ambient]);

  useEffect(()=>{try{window.speechSynthesis.getVoices();window.speechSynthesis.onvoiceschanged=()=>window.speechSynthesis.getVoices()}catch(e){}},[]);
  useEffect(()=>{const iv=setInterval(()=>{setShF(false);setTimeout(()=>{setShI(i=>(i+1)%SHLOKAS.length);setShF(true)},700)},6e3);return()=>clearInterval(iv)},[]);

  // Speak story page on change
  useEffect(()=>{
    if(screen==="story"&&!muted){
      VoiceEngine.stop();
      // Small delay so browser is ready
      setTimeout(()=>{if(!muted)VoiceEngine.speak(STORY_PAGES[storyPage][chosenLang],chosenLang)},300);
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
        np.push({name:"Yama",char:{...CHARS[cpuIdx],icon:"🐂",name:"God of Death",skt:"यम",color:"#a04040"},charIdx:cpuIdx,cpu:true});
        uc.push(cpuIdx);
      }
    }
    setPlayers(np);setUsedChars(uc);setTempName("");setTempChar(-1);
    if(np.length>=nP)setTimeout(()=>startGame(np),100);
  };

  const nearest=(positions,ci,count)=>{let m=Infinity,idx=-1;for(let i=0;i<count;i++){if(i!==ci){const d=Math.abs(positions[i]-positions[ci]);if(d>0&&d<m){m=d;idx=i}}}return idx};

  const doRoll=useCallback(()=>{
    if(dil||win||busy||players.length===0)return;
    if(skipA[cur]){const ns=[...skipA];ns[cur]=false;setSkipA(ns);setMsg(`${players[cur].name}'s turn is skipped.`);setCur(c=>(c+1)%nP);return}
    setBusy(true);play("dice");
    const r=Math.floor(Math.random()*6)+1,gi=Math.floor(Math.random()*9),g=GRAHA[gi];
    setRv(r);setGv(g);
    const pName=players[cur]?.name||"Seeker";

    // Compute graha effects first
    let tot=r;
    const oldP=pos[cur];let newP=oldP+tot;
    const extras=[];const nPunya=[...punya];const nPapa=[...papa];const nShield=[...shieldA];const nPos=[...pos];const nSkip=[...skipA];
    let grahaStory="";
    if(g.fx==="sun"){tot+=2;newP=oldP+tot;extras.push("+2 extra steps");
      grahaStory=`${pName}, you rolled Surya, the Sun! The king of planets blazes your path. You get 2 EXTRA STEPS — move ${tot} squares instead of ${r}.`}
    if(g.fx==="moon"){nPunya[cur]+=1;extras.push("+1 Punya");
      grahaStory=`${pName}, you rolled Chandra, the Moon! Lunar grace purifies your soul. You receive +1 PUNYA. Your karma grows lighter.`}
    if(g.fx==="jupiter"){for(let i=0;i<nP;i++)nPunya[i]+=1;extras.push("ALL +1 Punya");
      grahaStory=`${pName}, you rolled Brihaspati, Jupiter! The divine guru blesses the ENTIRE BOARD. Every seeker receives +1 PUNYA — even your rivals benefit from wisdom.`}
    if(g.fx==="venus"){nShield[cur]=true;extras.push("Shield granted");
      grahaStory=`${pName}, you rolled Shukra, Venus! The guru of Asuras grants you a CELESTIAL SHIELD. The next serpent that bites you will find its venom neutralized. This shield works only ONCE.`}
    if(g.fx==="mars"){const ni=nearest(pos,cur,nP);if(ni>=0){nPos[ni]=Math.max(1,nPos[ni]-3);nPapa[cur]+=1;
      extras.push(`${players[ni]?.name} -3`);
      grahaStory=`${pName}, you rolled Mangal, Mars! The warrior planet fills you with rage. ${players[ni]?.name} is PUSHED BACK 3 squares! But violence has a karmic price — you gain +1 PAPA.`}
      else{grahaStory=`${pName}, you rolled Mangal, Mars! But there's no one nearby to strike. The warrior energy fades.`}}
    if(g.fx==="mercury"){const ni=nearest(pos,cur,nP);
      if(ni>=0){const yourOldPos=oldP;const theirPos=nPos[ni];nPos[ni]=yourOldPos;newP=theirPos+tot;
        extras.push(`Swapped with ${players[ni]?.name}`);
        grahaStory=`${pName}, you rolled Budh, Mercury! The trickster planet reverses fortune. You SWAP PLACES with ${players[ni]?.name}! You were at square ${yourOldPos} — now you jump to their square ${theirPos}, then move ${tot} forward.`}
      else{grahaStory=`${pName}, you rolled Budh, Mercury! But there's no one nearby to swap with.`}}
    if(g.fx==="saturn"){newP=Math.max(1,oldP-3)+tot;nPapa[cur]+=1;extras.push("Back 3, +1 Papa");
      grahaStory=`${pName}, you rolled Shani, Saturn! The lord of karma turns his fearsome gaze upon you. You are PUSHED BACK 3 squares and gain +1 PAPA. No one escapes Shani's justice.`}
    if(g.fx==="rahu"){let maxI=0,minI=0;
      for(let i=0;i<nP;i++){if(nPos[i]>nPos[maxI])maxI=i;if(nPos[i]<nPos[minI])minI=i}
      if(maxI!==minI&&nPunya[maxI]>0){nPunya[maxI]-=1;nPunya[minI]+=1;
        extras.push(`${players[maxI]?.name}→${players[minI]?.name}`);
        grahaStory=`${pName}, you rolled Rahu, the Shadow! The demon who swallows the sun STEALS 1 Punya from ${players[maxI]?.name} (the leader) and gives it to ${players[minI]?.name} (trailing behind). The first shall be last!`}
      else{extras.push("No effect");grahaStory=`${pName}, you rolled Rahu, the Shadow! But Rahu finds no karma to steal this time.`}}
    if(g.fx==="ketu"){for(let i=0;i<nP;i++)nShield[i]=false;
      let closest=0;for(let i=0;i<nP;i++){if(nPos[i]>nPos[closest])closest=i}
      nPunya[closest]+=1;extras.push(`${players[closest]?.name} +1 Punya`);
      grahaStory=`${pName}, you rolled Ketu, the Tail! The planet of detachment strips ALL SHIELDS from every seeker. But ${players[closest]?.name}, closest to Moksha, receives +1 Punya — Ketu rewards those ready to let go.`}

    // ═══ STEP 1: Show graha popup, wait for user dismiss ═══
    const startMovement=()=>{
      if(newP>100){setMsg(`Overshot Moksha. ${extras.join(" · ")}`);setPunya(nPunya);setPapa(nPapa);setShieldA(nShield);setPos(nPos);setSkipA(nSkip);setBusy(false);setCur(c=>(c+1)%nP);return}
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
          const finishTurn=()=>{
            nPos[cur]=p;setPos([...nPos]);setPunya(nPunya);setPapa(nPapa);setShieldA(nShield);setSkipA(nSkip);
            setMsg([eMsg,...extras].filter(Boolean).join(" · ")||`Moved to ${p}.`);
            setHist(h=>[...h.slice(-12),`${pName}→${p}`]);
            if(nPunya[cur]>=20&&!win){setWin(cur);setMsg(`ॐ KARMA VICTORY! ${pName} transcends!`);play("victory");
              showEvent({icon:"ॐ",title:"KARMA VICTORY!",subtitle:`${pName} has accumulated 20 Punya! The board dissolves. Instant Moksha!`,color:"#f0d050"});
            }
            if(!DLM_SQ.includes(p))setCur(c=>(c+1)%nP);
            setBusy(false);
          };

          if(SNAKES[p]){const sn=SNAKES[p];if(nShield[cur]){nShield[cur]=false;eMsg=`𓆙 ${sn.skt} — Shield!`;play("ladder");
            showEvent({icon:"🛡",title:`Shield Saved ${pName}!`,subtitle:`The serpent ${sn.skt} (${sn.en}) struck — but Shukra's shield absorbed the venom! Shield is now gone.`,color:"#d0a0c0"},finishTurn);
          }else{const o=p;p=sn.to;eMsg=`𓆙 ${o}→${p}`;nPapa[cur]+=2;play("snake");
            showEvent({icon:"𓆙",title:`${sn.skt} — ${sn.en}`,subtitle:`${pName}, the serpent of ${sn.en} caught you! ${sn.tale} Dragged from ${o} to ${p}. +2 PAPA.`,color:"#e06030",extra:`${o} → ${p}`},finishTurn);
          }}
          else if(LADDERS[p]){const ld=LADDERS[p];const o=p;p=ld.to;eMsg=`🪔 ${o}→${p}`;nPunya[cur]+=1;play("ladder");
            showEvent({icon:"🪔",title:`${ld.skt} — ${ld.en}`,subtitle:`${pName}, the virtue of ${ld.en} lifts you! ${ld.tale} Rise from ${o} to ${p}. +1 PUNYA.`,color:"#f0d050",extra:`${o} → ${p}`},finishTurn);
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
          else if(p===100){if(nPunya[cur]>=nPapa[cur]){setWin(cur);eMsg=`ॐ MOKSHA!`;play("victory");
            showEvent({icon:"ॐ",title:"मोक्ष प्राप्त — MOKSHA!",subtitle:`${pName} reached 100 with Punya (${nPunya[cur]}) ≥ Papa (${nPapa[cur]}). Liberation! The cycle of Samsara ends.`,color:"#f0d050"},finishTurn);
          }else{p=67;eMsg="Impure → 67";play("snake");
            showEvent({icon:"⚠",title:"Gates of Moksha REJECT You!",subtitle:`${pName}, your soul is impure! Punya (${nPunya[cur]}) < Papa (${nPapa[cur]}). Cast back to 67.`,color:"#e06030"},finishTurn);
          }}
          else{finishTurn()}
        }
      },280);
    };

    // Show graha popup — user dismisses, then movement begins
    showEvent({icon:g.icon,title:`${g.n} · ${g.en}`,subtitle:grahaStory,color:g.color,type:"graha"},startMovement);
  },[cur,nP,dil,win,busy,punya,papa,pos,shieldA,skipA,play,players,showEvent,chosenLang,muted]);

  const solvD=(ci)=>{
    if(!dil)return;const ch=dil.c[ci],fx=ch.fx||{};
    const np=[...punya],npa=[...papa],nsk=[...skipA],npos=[...pos],nsh=[...shieldA];
    if(fx.punya)np[dil.pi]+=(fx.punya);if(fx.papa)npa[dil.pi]+=(fx.papa);if(fx.skip)nsk[dil.pi]=true;
    if(fx.move)npos[dil.pi]=Math.max(1,Math.min(100,npos[dil.pi]+(fx.move)));
    if(fx.loseShield)nsh[dil.pi]=false;
    if(fx.giveShield)nsh[dil.pi]=true;
    setPunya(np);setPapa(npa);setSkipA(nsk);setPos(npos);setShieldA(nsh);
    const parts=[];if(fx.punya)parts.push(`+${fx.punya} Punya`);if(fx.papa)parts.push(`+${fx.papa} Papa`);if(fx.move)parts.push(fx.move>0?`advance ${fx.move}`:`back ${Math.abs(fx.move)}`);if(fx.skip)parts.push("skip next");if(fx.loseShield)parts.push("lost Shield");if(fx.giveShield)parts.push("gained Shield");
    setMsg(parts.join(", ")||"Balanced.");
    if(ch.k==="punya")play("ladder");else if(ch.k==="papa")play("snake");
    if(np[dil.pi]>=20&&!win){setWin(dil.pi);setMsg(`ॐ KARMA VICTORY! ${players[dil.pi]?.name} transcends!`);play("victory")}
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

  // ═══ TITLE ═══
  if(screen==="title")return(
    <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
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
      <div style={{marginTop:20}}><InstaBadge/></div>
    </div>
  );

  // ═══ STORY ═══
  if(screen==="story"){
    const pg=STORY_PAGES[storyPage];
    return(
      <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",padding:"clamp(16px,4vw,40px)",overflowY:"auto"}}>
        <style>{CSS}</style>
        <div style={{maxWidth:640,width:"100%",animation:"slideUp .8s ease"}} key={storyPage}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:40,marginBottom:8}}>{pg.icon}</div>
            <h2 style={{fontSize:"clamp(22px,5vw,36px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:0}}>{pg.title}</h2>
            <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{fontSize:10,opacity:.3,letterSpacing:5}}>{storyPage+1} OF {STORY_PAGES.length}</div>
              <button onClick={()=>{if(!muted)VoiceEngine.speak(pg[chosenLang],chosenLang);else VoiceEngine.stop()}} style={{background:"transparent",border:"1px solid rgba(200,160,60,.25)",color:"#c0b080",padding:"3px 10px",fontSize:10,cursor:"pointer",borderRadius:3,opacity:.6}}>
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
        <div style={{textAlign:"center",marginTop:16}}><InstaBadge/></div>
      </div>
    );
  }

  // ═══ PICK COUNT ═══
  if(screen==="pickcount")return(
    <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
      <div style={{animation:"slideUp .8s ease",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>🔱</div>
        <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:"0 0 8px"}}>How Many Seekers?</h2>
        <p style={{fontSize:13,opacity:.4,marginBottom:24,letterSpacing:3}}>Each soul walks a different path</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="gb gp" onClick={()=>{setNP(2);setIsCPU([false,true]);setPlayers([]);setUsedChars([]);setTempName("");setTempChar(-1);setScreen("setup")}} style={{padding:"18px 36px",fontSize:16}}>
            <div style={{fontSize:22,marginBottom:4}}>🐂</div>1 vs Yama
          </button>
          {[2,3,4].map(n=><button key={n} className="gb" onClick={()=>{setNP(n);setIsCPU(Array(n).fill(false));setPlayers([]);setUsedChars([]);setTempName("");setTempChar(-1);setScreen("setup")}} style={{padding:"18px 36px",fontSize:16}}>{n} Players</button>)}
        </div>
        <div style={{marginTop:24}}><InstaBadge/></div>
      </div>
    </div>
  );

  // ═══ SETUP ═══
  if(screen==="setup"){
    const pidx=players.length;
    return(
      <div style={{...PG,display:"flex",flexDirection:"column",alignItems:"center",padding:"clamp(16px,4vw,32px)",overflowY:"auto"}}>
        <style>{CSS}</style>
        <div style={{maxWidth:680,width:"100%",animation:"slideUp .6s ease"}} key={pidx}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:10,opacity:.3,letterSpacing:5}}>SEEKER {pidx+1} OF {nP}</div>
            <h2 style={{fontSize:"clamp(20px,4vw,30px)",fontFamily:"'Yatra One',serif",color:"#f0d050",margin:"8px 0"}}>Choose Your Identity</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(140px,30vw,200px),1fr))",gap:10,marginBottom:20}}>
            {CHARS.map((ch,i)=>{const used=usedChars.includes(i);const sel=tempChar===i;
              return(<div key={i} onClick={()=>{if(!used){setTempChar(i);if(!muted){VoiceEngine.stop();setTimeout(()=>VoiceEngine.speak(chosenLang==='hi'?ch.voiceHi:ch.voiceEn,chosenLang),200)}}}} style={{background:sel?"rgba(200,160,60,.12)":"rgba(20,16,10,.5)",border:`1px solid ${sel?"rgba(240,200,80,.6)":used?"rgba(100,80,50,.15)":"rgba(200,160,60,.2)"}`,padding:14,borderRadius:4,cursor:used?"not-allowed":"pointer",opacity:used?.3:1,transition:"all .3s"}}>
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
              <button onClick={()=>{if(!muted)VoiceEngine.speak(chosenLang==='hi'?CHARS[tempChar].voiceHi:CHARS[tempChar].voiceEn,chosenLang)}} style={{marginLeft:"auto",background:"transparent",border:"1px solid rgba(200,160,60,.25)",color:"#c0b080",padding:"3px 10px",fontSize:10,cursor:"pointer",borderRadius:3,opacity:.6}}>🔊</button>
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
          <div style={{textAlign:"center",marginTop:16}}><InstaBadge/></div>
        </div>
      </div>
    );
  }

  // ═══ INFO ═══
  // ═══ GAME ═══
  if(screen!=="game"||players.length===0)return null;
  const cp=players[cur]||players[0];
  const hd=hov?(SNAKES[hov]?{type:"𓆙 NĀGA",label:`${SNAKES[hov].skt} — ${SNAKES[hov].en}`,desc:SNAKES[hov].tale,to:`Falls to ${SNAKES[hov].to}`,cl:"#e08040"}:LADDERS[hov]?{type:"🪔 VIRTUE",label:`${LADDERS[hov].skt} — ${LADDERS[hov].en}`,desc:LADDERS[hov].tale,to:`Rises to ${LADDERS[hov].to}`,cl:"#f0d050"}:DLM_SQ.includes(hov)?{type:"⚖ DHARMA",label:"Moral crossroads",desc:"A dilemma from the Mahābhārata.",cl:"#d0b870"}:hov===100?{type:"ॐ MOKSHA",label:"Liberation",desc:"Punya must ≥ Papa.",cl:"#f0d050"}:null):null;

  return(
    <div style={{...PG,padding:"10px 8px",display:"flex",flexDirection:"column",alignItems:"center"}}>
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
            {t:"🎯 Goal",d:"Reach Square 100 (Moksha) with your Punya (virtue) equal to or greater than your Papa (sin). Alternatively, collect 20 Punya at any point for an instant Karma Victory — the board dissolves and your soul transcends!"},
            {t:"🎲 Your Turn",d:"Each turn you roll TWO dice simultaneously: the Karma Die (1-6, determines how many squares you move) and the Graha Die (one of 9 Navagraha planets, each with a cosmic effect). A popup will explain exactly what happened — read it carefully before dismissing."},
            {t:"☀ The 9 Navagraha (Planet Effects)",d:"Surya (Sun) = +2 extra steps. Chandra (Moon) = +1 Punya. Mangal (Mars) = push nearest rival back 3, but you get +1 Papa. Budh (Mercury) = swap positions with nearest seeker. Brihaspati (Jupiter) = ALL players +1 Punya. Shukra (Venus) = get a serpent Shield. Shani (Saturn) = pushed back 3 + 1 Papa. Rahu = steals Punya from leader, gives to trailer. Ketu = strips all Shields."},
            {t:"𓆙 Serpents (Red Squares)",d:"10 Nāga serpents lurk on the board — each named after a vice (Wrath, Greed, Ego, etc). Landing on one drags you DOWN to a lower square and stains you with +2 Papa. The higher you are, the harder you fall."},
            {t:"🪔 Virtues (Gold Squares)",d:"10 divine ladders represent virtues (Compassion, Truth, Devotion, etc). Landing on one lifts you UP to a higher square and grants +1 Punya."},
            {t:"⚖ Dharma Dilemmas (Purple Squares)",d:"The heart of the game! Land on a purple square and face a moral choice from the Mahābhārata or real life. The 🙏 virtuous path gives Punya but costs position (go back, skip turn). The 💀 tempting path gives Papa but advances you far ahead. Choose wisely — your Punya must beat your Papa at Moksha!"},
            {t:"🛡 Shukra's Shield",d:"When Venus appears on the Graha Die, you receive a one-time celestial shield. The next serpent that bites you will be blocked. The shield disappears after one use, or if Ketu strips it away."},
            {t:"ॐ Reaching Moksha (Square 100)",d:"You must land EXACTLY on Square 100. If you overshoot, you stay put. When you reach 100: if Punya ≥ Papa, the gates open — you WIN! If Papa > Punya, your soul is impure and you're cast back to Square 67 to purify and try again."},
            {t:"⚡ Karma Victory (20 Punya)",d:"If at any point you accumulate 20 Punya, you achieve instant Moksha from ANY square. The board dissolves beneath you. This is the rarer, more beautiful path — a truly pure soul transcends without needing Square 100."},
            {t:"🐂 Playing vs Yama",d:"In solo mode, you face Yama — the Hindu God of Death who rides a buffalo. Yama is ruthless: he favours the 💀 Papa path 60% of the time on Dharma cards. Can you stay purer than Death itself? Yama auto-rolls after your turn."},
          ].map((s,i)=><div key={i} style={{background:"rgba(20,16,10,.5)",border:"1px solid rgba(200,160,60,.1)",padding:14,borderRadius:4,marginBottom:10}}>
            <div style={{fontSize:14,fontWeight:700,color:"#f0d050",marginBottom:6}}>{s.t}</div>
            <p style={{fontSize:12,color:"#c0b080",lineHeight:1.8,margin:0}}>{s.d}</p>
          </div>)}
        </div>
      </div>}
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
          <div style={{fontSize:"clamp(18px,3.5vw,28px)",fontFamily:"'Yatra One',serif",letterSpacing:3,color:"#f0d050"}}>मोक्षपटम्</div>
          <button onClick={toggleMute} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"2px 8px",fontSize:12,cursor:"pointer",borderRadius:3}}>{muted?"🔇":"🔊"}</button>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:6,flexWrap:"wrap"}}>
          <button onClick={()=>setShowGuide(true)} style={{background:"rgba(200,160,60,.08)",border:"1px solid rgba(200,160,60,.25)",color:"#e8c850",padding:"5px 14px",fontSize:11,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:4,letterSpacing:2}}>📜 How to Play</button>
          <button onClick={()=>setShowInfo(true)} style={{background:"rgba(200,160,60,.08)",border:"1px solid rgba(200,160,60,.25)",color:"#e8c850",padding:"5px 14px",fontSize:11,fontFamily:"'Cinzel',serif",cursor:"pointer",borderRadius:4,letterSpacing:2}}>📖 Encyclopaedia</button>
        </div>
        <div style={{fontSize:8,letterSpacing:5,opacity:.3,color:"#c0b080",marginTop:4}}>{rlm(pos[cur]||1)==="bhuloka"?"भूलोक EARTHLY":rlm(pos[cur]||1)==="antarloka"?"अन्तर्लोक INNER":"स्वर्गलोक CELESTIAL"}</div>
        <div style={{marginTop:4}}><InstaBadge/></div>
      </div>
      <div style={{background:"linear-gradient(90deg,transparent,rgba(30,24,14,.6),transparent)",borderTop:"1px solid rgba(200,160,60,.2)",borderBottom:"1px solid rgba(200,160,60,.2)",padding:"8px 14px",marginBottom:8,textAlign:"center",fontSize:"clamp(10px,1.4vw,12px)",maxWidth:780,width:"100%",fontStyle:"italic",lineHeight:1.7,color:"#c0b080"}}>{msg}</div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center",width:"100%",maxWidth:1140}}>
        {/* BOARD */}
        <div style={{flex:"1 1 340px",maxWidth:720,minWidth:300}}>
          <div style={{position:"relative",border:"2px solid rgba(200,160,60,.3)",background:"radial-gradient(ellipse at 30% 30%,rgba(60,45,20,.2),transparent 50%),radial-gradient(ellipse at 70% 70%,rgba(60,45,20,.15),transparent 50%),#1e1810",boxShadow:"0 0 60px rgba(0,0,0,.5),inset 0 0 40px rgba(0,0,0,.3)",borderRadius:2}}>
            <div style={{position:"absolute",inset:4,border:"1px solid rgba(200,160,60,.1)",pointerEvents:"none",zIndex:10}}/>
            {[{top:"1%",t:"स्वर्गलोक CELESTIAL"},{top:"34.5%",t:"अन्तर्लोक INNER"},{top:"67.5%",t:"भूलोक EARTHLY"}].map((r,i)=><div key={i} style={{position:"absolute",top:r.top,left:"50%",transform:"translateX(-50%)",fontSize:"clamp(6px,1vw,9px)",letterSpacing:4,opacity:.22,color:"#f0d050",zIndex:10,pointerEvents:"none",whiteSpace:"nowrap"}}>{r.t}</div>)}
            <div style={{position:"absolute",top:"33.3%",left:"2%",right:"2%",height:1,background:"linear-gradient(90deg,transparent,rgba(200,160,60,.18),transparent)",pointerEvents:"none",zIndex:10}}/>
            <div style={{position:"absolute",top:"66.6%",left:"2%",right:"2%",height:1,background:"linear-gradient(90deg,transparent,rgba(200,160,60,.18),transparent)",pointerEvents:"none",zIndex:10}}/>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:5}}>
              {conns.map((cn,i)=>{const x1=cn.f.c*10+5,y1=cn.f.r*10+5,x2=cn.t.c*10+5,y2=cn.t.r*10+5;return cn.type==="s"?<Naga key={i} x1={x1} y1={y1} x2={x2} y2={y2} id={cn.id}/>:<Ldr key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>})}
            </svg>
            <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",position:"relative",zIndex:6}}>
              {board.map(({num})=>{
                const sn=SNAKES[num],ld=LADDERS[num],dl=DLM_SQ.includes(num),mk=num===100;
                const ph=[];for(let i=0;i<nP;i++){if((pos[i]||1)===num)ph.push(i)}
                let bg="transparent",bdr="rgba(200,160,60,.08)";
                if(mk){bg="radial-gradient(circle,rgba(240,200,80,.2),transparent)";bdr="rgba(240,200,80,.5)"}
                else if(sn){bg="radial-gradient(circle,rgba(180,60,20,.2),transparent)";bdr="rgba(180,60,20,.3)"}
                else if(ld){bg="radial-gradient(circle,rgba(200,160,60,.15),transparent)";bdr="rgba(200,160,60,.2)"}
                else if(dl){bg="radial-gradient(circle,rgba(120,80,180,.2),transparent)";bdr="rgba(140,100,200,.35)"}
                return(<div key={num} onMouseEnter={()=>setHov(num)} onMouseLeave={()=>setHov(null)} style={{aspectRatio:"1",background:bg,border:`0.5px solid ${hov===num?"rgba(240,200,80,.6)":bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"all .2s"}}>
                  <span style={{position:"absolute",top:1,left:2,fontSize:"clamp(7px,1.2vw,11px)",color:"rgba(240,210,130,.5)",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:700}}>{num}</span>
                  {mk&&<span style={{fontSize:"clamp(14px,2.5vw,22px)",animation:"mp 3s ease infinite",color:"#f0d050"}}>ॐ</span>}
                  {sn&&<><span style={{fontSize:"clamp(8px,1.6vw,14px)",lineHeight:1}}>𓆙</span><span style={{fontSize:"clamp(6px,1vw,9px)",color:"#ffc050",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,lineHeight:1,textShadow:"0 0 8px #000,0 1px 3px #000"}}>{sn.skt}</span><span style={{fontSize:"clamp(4px,.7vw,7px)",color:"#ffa840",fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1,textShadow:"0 0 6px #000"}}>{sn.en}</span></>}
                  {ld&&<><span style={{fontSize:"clamp(7px,1.4vw,12px)",lineHeight:1}}>🪔</span><span style={{fontSize:"clamp(6px,1vw,9px)",color:"#ffe070",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,lineHeight:1,textShadow:"0 0 8px #000"}}>{ld.skt}</span><span style={{fontSize:"clamp(4px,.7vw,7px)",color:"#f0d060",fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1,textShadow:"0 0 6px #000"}}>{ld.en}</span></>}
                  {dl&&<><span style={{fontSize:"clamp(8px,1.5vw,13px)",lineHeight:1}}>⚖</span><span style={{fontSize:"clamp(5px,.8vw,7px)",color:"#c8a0f0",fontFamily:"'Cinzel',serif",fontWeight:900,textShadow:"0 0 8px #000",letterSpacing:1}}>DHARMA</span></>}
                  {ph.length>0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",gap:2,zIndex:15,pointerEvents:"none"}}>
                    {ph.map(pi=>{const c=players[pi]?.char;const isMoving=pi===cur&&busy;const isActive=pi===cur;return <div key={pi} style={{display:"flex",flexDirection:"column",alignItems:"center",transition:"all .3s ease",transform:isMoving?"scale(1.5) translateY(-4px)":isActive?"scale(1.2)":"scale(1)",zIndex:isActive?20:15,filter:isActive?"drop-shadow(0 0 8px "+c?.color+")":"none"}}>
                      <div style={{width:"clamp(18px,3vw,28px)",height:"clamp(18px,3vw,28px)",borderRadius:"50%",background:`radial-gradient(circle at 35% 30%,${c?.color||"#fff"},#1a1408)`,border:`2px solid ${c?.color||"#fff"}`,boxShadow:`0 0 ${isMoving?18:isActive?10:4}px ${c?.color||"#fff"}${isMoving?"ee":isActive?"aa":"40"}, inset 0 -3px 6px rgba(0,0,0,.4)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(10px,1.8vw,16px)",lineHeight:1}}>{c?.icon}</div>
                      {isActive&&<div style={{fontSize:"clamp(5px,.7vw,7px)",color:c?.color,fontWeight:900,marginTop:1,textShadow:"0 0 4px #000,0 0 8px #000",whiteSpace:"nowrap",letterSpacing:1}}>{players[pi]?.name?.slice(0,5)}</div>}
                    </div>})}
                  </div>}
                </div>);
              })}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:"clamp(10px,2.5vw,20px)",marginTop:6,fontSize:"clamp(8px,1.1vw,10px)",opacity:.45,color:"#c0b080",flexWrap:"wrap"}}>
            <span style={{color:"#e08040"}}>𓆙 Nāga</span><span style={{color:"#f0d050"}}>🪔 Virtue</span><span style={{color:"#c8a0f0"}}>⚖ Dharma</span><span style={{color:"#f0d050"}}>ॐ Moksha</span>
          </div>
        </div>
        {/* PANEL */}
        <div style={{flex:"0 1 310px",display:"flex",flexDirection:"column",gap:8,minWidth:"clamp(250px,40vw,310px)",maxWidth:360}}>
          <div style={{borderTop:"1px solid rgba(200,160,60,.15)",padding:8,textAlign:"center",opacity:shF?.7:0,transition:"opacity .8s"}}>
            <div style={{fontSize:"clamp(11px,1.5vw,13px)",fontFamily:"'Noto Serif Devanagari',serif",lineHeight:1.9,color:"#f0d050"}}>{shl.s}</div>
            <div style={{fontSize:8,opacity:.35,fontFamily:"'Noto Serif Devanagari',serif"}}>{shl.r}</div>
          </div>
          {!win&&<div style={{background:"#1a1408",border:"1px solid rgba(200,160,60,.2)",padding:"clamp(10px,2vw,14px)"}}>
            <div style={{fontSize:11,opacity:.5,marginBottom:10,letterSpacing:2,textAlign:"center",color:"#c0b080"}}>
              <span style={{fontSize:14}}>{cp.char.icon}</span> <span style={{color:cp.char.color,fontWeight:700}}>{cp.name}</span>
              <span style={{opacity:.5}}> — {cp.char.name}</span>
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
                {dil.c.map((ch,ci)=><button key={ci} onClick={()=>solvD(ci)} style={{display:"block",width:"100%",background:ch.k==="punya"?"rgba(200,160,60,.1)":"rgba(180,50,20,.1)",border:`2px solid ${ch.k==="punya"?"rgba(220,180,80,.4)":"rgba(200,60,30,.4)"}`,color:ch.k==="punya"?"#f0d050":"#e08040",padding:"14px 16px",fontSize:"clamp(12px,1.4vw,14px)",fontFamily:"'Cinzel',serif",cursor:"pointer",textAlign:"left",lineHeight:1.7,borderRadius:6,transition:"all .2s",letterSpacing:1}}>
                  {ch.l}
                </button>)}
              </div>
              <div style={{textAlign:"center",marginTop:14,fontSize:9,opacity:.25,letterSpacing:2}}>CHOOSE YOUR PATH WISELY</div>
            </div>
          </div>}
          <div style={{background:"linear-gradient(180deg,#1e1810,#14100a)",border:"1px solid rgba(200,160,60,.2)",padding:12,borderRadius:4}}>
            <div style={{fontSize:9,letterSpacing:4,opacity:.5,marginBottom:10,color:"#f0d050",fontWeight:700,textAlign:"center"}}>⚔ KARMA SCOREBOARD ⚔</div>
            {players.map((pl,i)=>{const isActive=cur===i;const pn=punya[i]||0;const pp=papa[i]||0;const total=Math.max(pn+pp,1);
              return(<div key={i} style={{background:isActive?"rgba(200,160,60,.08)":"transparent",border:`1px solid ${isActive?"rgba(240,200,80,.3)":"rgba(200,160,60,.08)"}`,borderRadius:4,padding:"10px 12px",marginBottom:i<nP-1?8:0,transition:"all .3s"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:20}}>{pl.char.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:pl.char.color,fontWeight:700}}>{pl.name}{pl.cpu?" 🤖":""}{isActive?" ◄":""}{shieldA[i]?" 🛡":""}{skipA[i]?" ⏭":""}</div>
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
