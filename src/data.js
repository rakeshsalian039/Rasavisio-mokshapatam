/* ═══════════════════════════════════════
   MOKSHA PATAM — Game Data
   All snakes, ladders, dilemmas, graha,
   characters, stories, shlokas
   ═══════════════════════════════════════ */

export const SNAKES = {
  16:{to:4,skt:"क्रोध",en:"WRATH",tale:"As Duryodhana's rage consumed the Kuru dynasty..."},
  23:{to:7,skt:"लोभ",en:"GREED",tale:"Like Shakuni who gambled away an empire..."},
  33:{to:12,skt:"मोह",en:"DELUSION",tale:"Dhritarashtra's blind love veiled all judgment..."},
  38:{to:21,skt:"मात्सर्य",en:"ENVY",tale:"Duryodhana burned with jealousy at Indraprastha..."},
  47:{to:29,skt:"काम",en:"DESIRE",tale:"Keechaka's lust brought his annihilation..."},
  56:{to:41,skt:"मद",en:"PRIDE",tale:"Ravana's arrogance toppled golden Lanka..."},
  62:{to:44,skt:"भय",en:"TERROR",tale:"Arjuna paralysed before the great war..."},
  74:{to:51,skt:"द्वेष",en:"HATRED",tale:"Drona and Drupada's hatred echoed ages..."},
  85:{to:59,skt:"आलस्य",en:"SLOTH",tale:"Kumbhakarna slept while dharma crumbled..."},
  95:{to:68,skt:"अहंकार",en:"EGO",tale:"Parashurama's ego challenged even Rama..."},
};

export const LADDERS = {
  3:{to:18,skt:"दया",en:"COMPASSION",tale:"Yudhishthira who wept for his enemies..."},
  9:{to:31,skt:"दान",en:"GENEROSITY",tale:"Karna gave his armour without hesitation..."},
  22:{to:42,skt:"सत्य",en:"TRUTH",tale:"Harishchandra sacrificed all for truth..."},
  28:{to:52,skt:"सेवा",en:"SERVICE",tale:"Hanuman whose devotion moved mountains..."},
  37:{to:58,skt:"तपस्",en:"AUSTERITY",tale:"Vishwamitra whose tapas shook Indra..."},
  44:{to:65,skt:"श्रद्धा",en:"FAITH",tale:"Shabari waited a lifetime for Rama..."},
  53:{to:72,skt:"विद्या",en:"WISDOM",tale:"Vidura whose counsel was dharma itself..."},
  61:{to:80,skt:"विवेक",en:"DISCERNMENT",tale:"Bhishma on his bed of arrows..."},
  71:{to:89,skt:"भक्ति",en:"DEVOTION",tale:"Prahlada whose devotion survived fire..."},
  82:{to:97,skt:"वैराग्य",en:"DETACHMENT",tale:"Siddhartha leaving the palace..."},
};

export const DILEMMA_SQUARES = [5,14,25,35,43,55,64,73,83,92];

export const SHLOKAS = [
  {s:"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",r:"भगवद्गीता २.४७"},
  {s:"यदा यदा हि धर्मस्य ग्लानिर्भवति भारत",r:"भगवद्गीता ४.७"},
  {s:"असतो मा सद्गमय तमसो मा ज्योतिर्गमय",r:"बृहदारण्यक उपनिषद्"},
  {s:"नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः",r:"भगवद्गीता २.२३"},
  {s:"सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज",r:"भगवद्गीता १८.६६"},
  {s:"अहिंसा परमो धर्मः",r:"महाभारत"},
];

export const DILEMMAS = [
  {t:"यक्ष-प्रश्न",en:"The Yaksha's Riddle",txt:"At the cursed lake, the Yaksha demands you answer. What is the greatest wonder?",c:[{l:"Answer humbly — skip turn, +3 Punya",k:"punya",fx:{punya:3,skip:true}},{l:"Drink defiantly — advance 5, +2 Papa",k:"papa",fx:{papa:2,move:5}}]},
  {t:"कर्णकवच",en:"Karna's Armour",txt:"Indra disguised asks for your divine armour. Giving it means vulnerability.",c:[{l:"Surrender selflessly — +3 Punya",k:"punya",fx:{punya:3}},{l:"Refuse — +2 Papa",k:"papa",fx:{papa:2}}]},
  {t:"द्रौपदीवस्त्र",en:"Draupadi's Honour",txt:"In the sabha, dharma is disrobed. Speak against the powerful or stay silent.",c:[{l:"Speak out — back 6, +3 Punya",k:"punya",fx:{punya:3,move:-6}},{l:"Stay silent — +2 Papa",k:"papa",fx:{papa:2}}]},
  {t:"भीष्मप्रतिज्ञा",en:"Bhishma's Vow",txt:"Sacrifice your future to protect another — even gods weep at this vow.",c:[{l:"Take the vow — back 10, +4 Punya",k:"punya",fx:{punya:4,move:-10}},{l:"Choose freedom",k:"neutral",fx:{}}]},
  {t:"अश्वत्थामा",en:"The Half-Truth",txt:"Speak a half-truth to win, or hold truth and watch the champion fall.",c:[{l:"Half-truth — advance 6, +1 Papa",k:"papa",fx:{papa:1,move:6}},{l:"Truth — skip turn, +2 Punya",k:"punya",fx:{punya:2,skip:true}}]},
  {t:"एकलव्य",en:"Eklavya's Dakshina",txt:"Your guru demands your greatest gift.",c:[{l:"Pay — back 5, +3 Punya",k:"punya",fx:{punya:3,move:-5}},{l:"Walk alone — +1 Punya",k:"punya",fx:{punya:1}}]},
];

export const GRAHA = [
  {n:"सूर्य",en:"Sun",icon:"☀",desc:"Blazing radiance — +1 extra step",color:"#f0b840",fx:"sun"},
  {n:"चन्द्र",en:"Moon",icon:"☾",desc:"Lunar grace — +1 Punya to you",color:"#a0c8e0",fx:"moon"},
  {n:"मंगल",en:"Mars",icon:"♂",desc:"Warrior's fury — nearest foe retreats 2",color:"#e07050",fx:"mars"},
  {n:"बुध",en:"Mercury",icon:"☿",desc:"Cosmic flux — swap with nearest seeker",color:"#80c080",fx:"mercury"},
  {n:"बृहस्पति",en:"Jupiter",icon:"♃",desc:"Divine blessing — ALL seekers +1 Punya",color:"#f0d060",fx:"jupiter"},
  {n:"शुक्र",en:"Venus",icon:"♀",desc:"Celestial shield — immune from next serpent",color:"#d0a0c0",fx:"venus"},
];

export const CHARACTERS = [
  {id:"warrior",name:"Kshatriya Warrior",skt:"क्षत्रिय",icon:"⚔",color:"#e04830",
    lore:"Once a commander at Kurukshetra alongside Bhishma. Haunted by bloodshed, you seek Moksha to cleanse the karma of a thousand battles.",
    trait:"Courage",
    voiceEn:"You are the Kshatriya Warrior. You once commanded armies at Kurukshetra, fighting alongside the great Bhishma himself. Haunted by the rivers of blood you spilled, you now seek Moksha. Your courage is your strength. But brute force alone, has never conquered the soul.",
    voiceHi:"तुम क्षत्रिय योद्धा हो। तुमने कुरुक्षेत्र में भीष्म के साथ सेनाओं का नेतृत्व किया। बहाए गए खून की नदियां अब भी तुम्हें सताती हैं। अब तुम मोक्ष की खोज में हो। साहस तुम्हारी ताकत है। लेकिन क्रूर बल से, कभी आत्मा नहीं जीती गई।"},
  {id:"sage",name:"Rishi Sage",skt:"ऋषि",icon:"🔱",color:"#f0c030",
    lore:"You meditated in Naimisharanya for twelve years, mastering the Vedas. Yet enlightenment eludes you — true knowledge lies in the journey.",
    trait:"Wisdom",
    voiceEn:"You are the Rishi Sage. For twelve years you meditated in the forests of Naimisharanya, mastering the Vedas. And yet, enlightenment eludes you. True knowledge lives not in scripture, but in the journey itself.",
    voiceHi:"तुम ऋषि हो। बारह वर्षों तक नैमिषारण्य के जंगलों में ध्यान किया, वेदों में महारत हासिल की। फिर भी, ज्ञान तुमसे दूर है। सच्चा ज्ञान शास्त्रों में नहीं, यात्रा में बसता है।"},
  {id:"healer",name:"Vaidya Healer",skt:"वैद्य",icon:"🌿",color:"#30c0b0",
    lore:"Trained in Dhanvantari's Ayurveda, you healed kings and beggars. But you could not save your guru. Now you seek the one cure no medicine provides.",
    trait:"Compassion",
    voiceEn:"You are the Vaidya Healer. Trained in the traditions of Lord Dhanvantari. You healed kings and beggars. But you could not save your own guru. Now you seek the one cure no medicine provides. Liberation from death itself.",
    voiceHi:"तुम वैद्य हो। भगवान धन्वंतरि की परंपरा में प्रशिक्षित। तुमने राजाओं और भिखारियों को ठीक किया। लेकिन अपने गुरु को नहीं बचा पाए। अब तुम वो इलाज खोज रहे हो जो कोई दवाई नहीं दे सकती। मृत्यु से मुक्ति।"},
  {id:"dancer",name:"Devadasi Dancer",skt:"नर्तकी",icon:"💃",color:"#c060d0",
    lore:"A temple dancer of Ujjain who performed the Tandava before kings. Now you dance not for men but for Moksha — each step a prayer.",
    trait:"Grace",
    voiceEn:"You are the Devadasi Dancer. In the temples of Ujjain, you performed the cosmic Tandava before kings. Now you dance not for men, but for Moksha. Each step is a prayer. Each mudra, a mantra.",
    voiceHi:"तुम देवदासी नर्तकी हो। उज्जैन के मंदिरों में, तुमने राजाओं के सामने तांडव किया। अब तुम पुरुषों के लिए नहीं, मोक्ष के लिए नाचती हो। हर कदम एक प्रार्थना। हर मुद्रा, एक मंत्र।"},
  {id:"merchant",name:"Vanik Merchant",skt:"वणिक्",icon:"⚖",color:"#e08030",
    lore:"You traded silk from Pataliputra to Taxila. A shipwreck took everything. Now you trade karma, not coins.",
    trait:"Judgment",
    voiceEn:"You are the Vanik Merchant. You traded silk from Pataliputra to Taxila. A shipwreck took everything. Now you trade karma, not coins. The only treasure that cannot sink.",
    voiceHi:"तुम वणिक व्यापारी हो। पाटलिपुत्र से तक्षशिला तक रेशम का व्यापार करते थे। एक जहाज़ डूबने ने सब छीन लिया। अब तुम कर्म का व्यापार करते हो, सिक्कों का नहीं। एकमात्र खज़ाना जो डूब नहीं सकता।"},
  {id:"ascetic",name:"Sannyasi Ascetic",skt:"संन्यासी",icon:"🪷",color:"#70c030",
    lore:"You renounced a kingdom at twenty. For decades you wandered forests. Others call you mad — but you have seen Moksha in visions.",
    trait:"Renunciation",
    voiceEn:"You are the Sannyasi Ascetic. At twenty, you renounced a kingdom. For decades you wandered forests. Others call you mad. But in your deepest meditations, you have seen Moksha. A golden light, calling you forward.",
    voiceHi:"तुम संन्यासी हो। बीस साल की उम्र में, एक राज्य त्याग दिया। दशकों तक जंगलों में भटके। लोग तुम्हें पागल कहते हैं। लेकिन गहन ध्यान में, तुमने मोक्ष देखा है। एक सुनहरी रोशनी, जो आगे बुला रही है।"},
];

export const STORY_PAGES = [
  {title:"A Forgotten Secret",icon:"🕉",
  en:"Before the Mahabharata was written down. Before the temples were carved in stone. Before even the oldest Vedas were chanted aloud. There existed, a game. Not a game of entertainment. A game, of the soul. Created by unknown sages in an age so ancient, that even the gods have forgotten its origin. They called it, Moksha Patam. The Board of Liberation. It was said, that whoever truly understood this game, would understand the secret of life, death, and everything beyond. For thousands of years, it was played in royal courts and forest ashrams. Passed from guru to disciple, in whispered secrecy. Then one day, foreigners came. They saw the board. They took it. They stripped away every sacred name. Every Sanskrit verse. They renamed it, Snakes and Ladders. The soul of the game, was erased. Until now.",
  hi:"महाभारत लिखे जाने से पहले। मंदिरों को पत्थर में तराशे जाने से पहले। सबसे पुराने वेदों के उच्चारण से भी पहले। एक खेल था। मनोरंजन का खेल नहीं। आत्मा का खेल। अज्ञात ऋषियों द्वारा बनाया गया, इतने प्राचीन युग में, कि देवताओं को भी इसकी उत्पत्ति याद नहीं। उन्होंने इसे मोक्षपटम कहा। मुक्ति का मार्ग। कहा जाता था कि जो इस खेल को सच में समझ ले, वो जीवन, मृत्यु, और उसके पार के रहस्य को समझ जाएगा। हजारों सालों तक, यह राजदरबारों और वन के आश्रमों में खेला गया। गुरु से शिष्य तक, फुसफुसाहट में। फिर एक दिन, विदेशी आए। उन्होंने इस पट को देखा। उठा लिया। हर पवित्र नाम, हर संस्कृत श्लोक मिटा दिया। इसका नाम रख दिया, सांप सीढ़ी। खेल की आत्मा, मिट गई। आज तक।",
  body:"Before the Mahabharata was written down... before the temples were carved in stone... before even the oldest Vedas were chanted aloud...\n\nThere existed a game.\n\nNot a game of entertainment. A game of the soul. Created by unknown sages in an age so ancient that even the gods have forgotten its origin.\n\nThey called it मोक्षपटम् — Moksha Patam. The Board of Liberation.\n\nIt was said that whoever truly understood this game would understand the secret of life, death, and everything beyond.\n\nFor thousands of years, it was played in royal courts and forest ashrams, passed from guru to disciple in whispered secrecy.\n\nThen one day, foreigners came. They stripped away every sacred name. They renamed it 'Snakes and Ladders.'\n\nThe soul of the game was erased. Until now."},
  {title:"The Sacred Board",icon:"📜",
  en:"The board is not a board. It is a map, of the universe. One hundred squares. Three realms. One destination. Squares 1 to 33, Bhuloka, the Earthly Realm. Here the chaos of mortal life rages. Snakes and ladders everywhere. Fortune changes with every step. This is where most souls are trapped. Endlessly cycling. Squares 34 to 66, Antarloka, the Inner Realm. The noise fades. The serpents here don't bite your body. They poison your mind. Squares 67 to 99, Svargaloka, the Celestial Realm. So close to freedom you can taste it. But the serpents here are the most deadly. One fall can destroy lifetimes of progress. And at Square 100, Moksha. Liberation. The end of suffering. But reaching it, is only half the battle.",
  hi:"यह पट, सिर्फ एक पट नहीं है। यह ब्रह्मांड का नक्शा है। सौ खाने। तीन लोक। एक मंज़िल। खाना 1 से 33, भूलोक, पृथ्वी लोक। यहां नश्वर जीवन का तूफ़ान है। सांप और सीढ़ियां हर जगह। किस्मत हर कदम पर बदलती है। ज़्यादातर आत्माएं यहीं फंसी रहती हैं। अंतहीन चक्र में। खाना 34 से 66, अंतर्लोक। शोर थमता है। यहां के सांप शरीर नहीं काटते। मन में ज़हर भरते हैं। खाना 67 से 99, स्वर्गलोक। मुक्ति इतनी करीब कि छू सकते हो। लेकिन यहां के सांप सबसे घातक हैं। एक गिरावट, जन्मों की तपस्या मिटा सकती है। और खाना 100 पर, मोक्ष। मुक्ति। दुख का अंत। लेकिन वहां पहुंचना, आधी लड़ाई है।",
  body:"The board is not a board. It is a map of the universe.\n\n100 squares. Three realms. One destination.\n\nभूलोक Bhuloka (1-33) — The Earthly Realm. Chaos. Most souls trapped here.\n\nअन्तर्लोक Antarloka (34-66) — The Inner Realm. Serpents poison the mind.\n\nस्वर्गलोक Svargaloka (67-99) — The Celestial Realm. One fall destroys lifetimes.\n\nSquare 100 — मोक्ष Moksha. Liberation.\n\nBut reaching it... is only half the battle."},
  {title:"The Serpents Within",icon:"𓆙",
  en:"They are not just snakes. They are the ten, darkest forces, inside every human soul. The ancient sages gave each one a name. Learn them. Fear them. Krodh, Wrath. The fire that consumed Duryodhana. Lobh, Greed. The madness that made Shakuni gamble a kingdom. Moh, Delusion. The blindness of Dhritarashtra. Matsarya, Envy. Kaam, Desire. Mad, Pride. The arrogance that burned Lanka. Bhay, Fear. Dvesh, Hatred. Aalasya, Sloth. And the deadliest of all. Ahankaar. Ego. When a serpent catches you, it drags you down, and stains your soul with Paap, sin karma. The higher you climb, the further you fall. There is only one protection. The shield of Shukra. And it can only save you, once.",
  hi:"ये सिर्फ सांप नहीं हैं। ये हर इंसान की आत्मा के अंदर की दस सबसे अंधेरी शक्तियां हैं। प्राचीन ऋषियों ने हर एक को नाम दिया। इन्हें जानो। इनसे डरो। क्रोध। वो आग जिसने दुर्योधन को जलाया। लोभ। वो पागलपन जिसने शकुनि से राज्य का जुआ खिलवाया। मोह। धृतराष्ट्र का अंधापन। मात्सर्य, ईर्ष्या। काम, वासना। मद, घमंड। वो अहंकार जिसने लंका जलाई। भय। द्वेष, नफरत। आलस्य। और सबसे घातक। अहंकार। जब सांप तुम्हें पकड़ता है, तो नीचे खींचता है, और तुम्हारी आत्मा पर पाप का दाग लगाता है। जितना ऊपर चढ़ो, उतना गहरा गिरो। एक ही सुरक्षा है। शुक्र का कवच। और वो सिर्फ एक बार बचा सकता है।",
  body:"They are not just snakes. They are the ten darkest forces inside every human soul.\n\n𓆙 क्रोध Krodh — Wrath\n𓆙 लोभ Lobh — Greed\n𓆙 मोह Moh — Delusion\n𓆙 मात्सर्य Matsarya — Envy\n𓆙 काम Kaam — Desire\n𓆙 मद Mad — Pride\n𓆙 भय Bhay — Fear\n𓆙 द्वेष Dvesh — Hatred\n𓆙 आलस्य Aalasya — Sloth\n𓆙 अहंकार Ahankaar — Ego\n\nWhen bitten → fall + gain पाप Papa.\nOnly शुक्र Shukra shields you — once."},
  {title:"The Path to Moksha",icon:"ॐ",
  en:"There are only two ways, to escape the cycle of Samsara. The First Path. Reach Square 100 with an exact roll. But, your Punya, your virtue, must equal or exceed your Paap, your sin. If you arrive at Moksha with a heavy soul, you will be cast back. To Square 67. To suffer. To purify. To try again. The Second Path. Far rarer. Far more beautiful. If at any moment, a seeker accumulates 15 Punya, they transcend the board entirely. Instant Moksha. This represents the ancient truth, that a pure soul can break free at any moment. Most seekers never achieve either. Will you? Dharma awaits. The dice are ready. The serpents, are watching. Step onto the board.",
  hi:"संसार के चक्र से बचने के सिर्फ दो रास्ते हैं। पहला रास्ता। खाना 100 पर सटीक पासे से पहुंचो। लेकिन, तुम्हारा पुण्य, तुम्हारे पाप से ज़्यादा या बराबर होना चाहिए। अगर भारी आत्मा लेकर मोक्ष पहुंचे, तो वापस भेज दिए जाओगे। खाना 67 पर। कष्ट भोगने। शुद्ध होने। फिर से कोशिश करने। दूसरा रास्ता। बहुत दुर्लभ। बहुत सुंदर। अगर किसी भी पल, कोई साधक 15 पुण्य इकट्ठा कर ले, तो वो पट से ऊपर उठ जाता है। तुरंत मोक्ष। यह प्राचीन सत्य है, कि शुद्ध आत्मा किसी भी क्षण मुक्त हो सकती है। ज़्यादातर साधक कभी नहीं पहुंचते। क्या तुम पहुंचोगे? धर्म इंतज़ार कर रहा है। पासे तैयार हैं। सांप देख रहे हैं। पट पर कदम रखो।",
  body:"Two paths to liberation:\n\nFirst — reach Square 100 with exact roll.\nपुण्य Punya must ≥ पाप Papa. Otherwise → Square 67.\n\nSecond — accumulate 15 Punya = instant Moksha.\n\nMost seekers never achieve either.\n\nWill you?\n\nDharma awaits. The dice are ready.\nThe serpents are watching.\n\nStep onto the board."},
];

export function sqP(n) {
  const r = Math.floor((n - 1) / 10);
  return { r: 9 - r, c: r % 2 === 0 ? (n - 1) % 10 : 9 - ((n - 1) % 10) };
}

export function rlm(n) {
  return n <= 33 ? "bhuloka" : n <= 66 ? "antarloka" : "svargaloka";
}
