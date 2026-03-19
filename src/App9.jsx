import { useState, useCallback, useMemo, useEffect, useRef } from "react";

const SNAKES={16:{to:4,skt:"क्रोध",en:"WRATH",tale:"As Duryodhana's rage consumed the Kuru dynasty..."},23:{to:7,skt:"लोभ",en:"GREED",tale:"Like Shakuni who gambled away an empire..."},33:{to:12,skt:"मोह",en:"DELUSION",tale:"Dhritarashtra's blind love veiled all judgment..."},38:{to:21,skt:"मात्सर्य",en:"ENVY",tale:"Duryodhana burned with jealousy at Indraprastha..."},47:{to:29,skt:"काम",en:"DESIRE",tale:"Keechaka's lust brought his annihilation..."},56:{to:41,skt:"मद",en:"PRIDE",tale:"Ravana's arrogance toppled golden Lanka..."},62:{to:44,skt:"भय",en:"TERROR",tale:"Arjuna paralysed before the great war..."},74:{to:51,skt:"द्वेष",en:"HATRED",tale:"Drona and Drupada's hatred echoed ages..."},85:{to:59,skt:"आलस्य",en:"SLOTH",tale:"Kumbhakarna slept while dharma crumbled..."},95:{to:68,skt:"अहंकार",en:"EGO",tale:"Parashurama's ego challenged even Rama..."}};
const LADDERS={3:{to:18,skt:"दया",en:"COMPASSION",tale:"Yudhishthira who wept for his enemies..."},9:{to:31,skt:"दान",en:"GENEROSITY",tale:"Karna gave his armour without hesitation..."},22:{to:42,skt:"सत्य",en:"TRUTH",tale:"Harishchandra sacrificed all for truth..."},28:{to:52,skt:"सेवा",en:"SERVICE",tale:"Hanuman whose devotion moved mountains..."},37:{to:58,skt:"तपस्",en:"AUSTERITY",tale:"Vishwamitra whose tapas shook Indra..."},44:{to:65,skt:"श्रद्धा",en:"FAITH",tale:"Shabari waited a lifetime for Rama..."},53:{to:72,skt:"विद्या",en:"WISDOM",tale:"Vidura whose counsel was dharma itself..."},61:{to:80,skt:"विवेक",en:"DISCERNMENT",tale:"Bhishma on his bed of arrows..."},71:{to:89,skt:"भक्ति",en:"DEVOTION",tale:"Prahlada whose devotion survived fire..."},82:{to:97,skt:"वैराग्य",en:"DETACHMENT",tale:"Siddhartha leaving the palace..."}};
const DLM_SQ=[5,14,25,35,43,55,64,73,83,92];
const SHLOKAS=[{s:"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",r:"भगवद्गीता २.४७"},{s:"यदा यदा हि धर्मस्य ग्लानिर्भवति भारत",r:"भगवद्गीता ४.७"},{s:"असतो मा सद्गमय तमसो मा ज्योतिर्गमय",r:"बृहदारण्यक उपनिषद्"},{s:"नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः",r:"भगवद्गीता २.२३"},{s:"सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज",r:"भगवद्गीता १८.६६"},{s:"अहिंसा परमो धर्मः",r:"महाभारत"}];
const DILEMMAS=[
  {t:"यक्ष-प्रश्न",en:"The Yaksha's Riddle",txt:"At the cursed lake, the Yaksha demands you answer. What is the greatest wonder?",c:[{l:"Answer humbly — skip turn, +3 Punya",k:"punya",fx:{punya:3,skip:true}},{l:"Drink defiantly — advance 5, +2 Papa",k:"papa",fx:{papa:2,move:5}}]},
  {t:"कर्णकवच",en:"Karna's Armour",txt:"Indra disguised asks for your divine armour. Giving it means vulnerability.",c:[{l:"Surrender selflessly — +3 Punya",k:"punya",fx:{punya:3}},{l:"Refuse — +2 Papa",k:"papa",fx:{papa:2}}]},
  {t:"द्रौपदीवस्त्र",en:"Draupadi's Honour",txt:"In the sabha, dharma is disrobed. Speak against the powerful or stay silent.",c:[{l:"Speak out — back 6, +3 Punya",k:"punya",fx:{punya:3,move:-6}},{l:"Stay silent — +2 Papa",k:"papa",fx:{papa:2}}]},
  {t:"भीष्मप्रतिज्ञा",en:"Bhishma's Vow",txt:"Sacrifice your future to protect another — even gods weep at this vow.",c:[{l:"Take the vow — back 10, +4 Punya",k:"punya",fx:{punya:4,move:-10}},{l:"Choose freedom",k:"neutral",fx:{}}]},
  {t:"अश्वत्थामा",en:"The Half-Truth",txt:"Speak a half-truth to win, or hold truth and watch the champion fall.",c:[{l:"Half-truth — advance 6, +1 Papa",k:"papa",fx:{papa:1,move:6}},{l:"Truth — skip turn, +2 Punya",k:"punya",fx:{punya:2,skip:true}}]},
  {t:"एकलव्य",en:"Eklavya's Dakshina",txt:"Your guru demands your greatest gift.",c:[{l:"Pay — back 5, +3 Punya",k:"punya",fx:{punya:3,move:-5}},{l:"Walk alone — +1 Punya",k:"punya",fx:{punya:1}}]},
];
const GRAHA=[
  {n:"सूर्य",en:"Sun",icon:"☀",desc:"Blazing radiance — +1 extra step",color:"#f0b840",fx:"sun"},
  {n:"चन्द्र",en:"Moon",icon:"☾",desc:"Lunar grace — +1 Punya to you",color:"#a0c8e0",fx:"moon"},
  {n:"मंगल",en:"Mars",icon:"♂",desc:"Warrior's fury — nearest foe retreats 2",color:"#e07050",fx:"mars"},
  {n:"बुध",en:"Mercury",icon:"☿",desc:"Cosmic flux — swap with nearest seeker",color:"#80c080",fx:"mercury"},
  {n:"बृहस्पति",en:"Jupiter",icon:"♃",desc:"Divine blessing — ALL seekers +1 Punya",color:"#f0d060",fx:"jupiter"},
  {n:"शुक्र",en:"Venus",icon:"♀",desc:"Celestial shield — immune from next serpent",color:"#d0a0c0",fx:"venus"},
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
  body:"Before the Mahābhārata was written down...\nbefore the temples were carved in stone...\nbefore even the oldest Vedas were chanted aloud...\n\nThere existed a game.\n\nNot a game of entertainment.\nA game of the soul.\n\nCreated by unknown ऋषि Rishis — sages so ancient\nthat even the gods have forgotten their names.\n\nThey called it मोक्षपटम् — Moksha Patam.\nThe Board of Liberation.\n\nWhoever truly understood this game\nwould understand the secret of life, death,\nand everything that lies beyond.\n\nFor thousands of years it was played\nin marble palaces and forest ashrams,\npassed from गुरु Guru to शिष्य Shishya\nin whispered secrecy.\n\nThen one day, foreigners came.\nThey stripped away every sacred name.\nThey renamed it — 'Snakes and Ladders.'\n\nThe soul of the game was murdered.\nUntil this very moment."},
  {title:"The Sacred Board",icon:"📜",
  en:"Now, look at the board before you. It is not a board. It is a map. A map, of the entire universe. A map, of your soul's journey through existence. One hundred squares. Three realms. And one, single, destination. The first realm, Squares 1 through 33, is Bhuloka. The Earthly Realm. This is where you are born. This is where chaos reigns. Snakes coil in every shadow. Ladders shimmer like mirages. Fortune rises and crashes with every single step. Most souls, are trapped here. Forever. Cycling endlessly through birth, and death, and birth again. Never escaping. The second realm, Squares 34 through 66, is Antarloka. The Inner Realm. Here, the noise of the world fades to silence. But do not be deceived by the quiet. The serpents here are more cunning. They do not bite your flesh. They poison, your mind. Doubt. Confusion. The slow erosion of faith. The third realm, Squares 67 through 99, is Svargaloka. The Celestial Realm. You can feel liberation from here. You can almost, taste it. But beware. The serpents who dwell in the heavens, are the most terrifying of all. A single fall here, does not cost you a few squares. It destroys, lifetimes, of spiritual progress. And there, at the summit, Square 100. Moksha. Liberation. The end of all suffering. But reaching Moksha, is only half the battle. Arriving, with a pure soul, that is the true challenge.",
  hi:"अब, अपने सामने पट को देखो। ये सिर्फ पट नहीं है। ये एक नक्शा है। पूरे ब्रह्मांड का नक्शा। अस्तित्व के माध्यम से तुम्हारी आत्मा की यात्रा का नक्शा। सौ खाने। तीन लोक। और एक, अकेली, मंज़िल। पहला लोक, खाना 1 से 33, भूलोक है। पृथ्वी लोक। यहीं तुम्हारा जन्म होता है। यहीं अराजकता राज करती है। हर छाया में सांप कुंडली मारे बैठे हैं। सीढ़ियां मरीचिकाओं सी चमकती हैं। किस्मत हर एक कदम पर उठती और गिरती है। ज़्यादातर आत्माएं, यहीं फंसी रहती हैं। हमेशा के लिए। जन्म, मृत्यु, और फिर जन्म के अंतहीन चक्र में। कभी नहीं छूटतीं। दूसरा लोक, खाना 34 से 66, अंतर्लोक है। आंतरिक लोक। यहां, दुनिया का शोर शांत हो जाता है। लेकिन इस सन्नाटे से धोखा मत खाना। यहां के सांप ज़्यादा चालाक हैं। ये तुम्हारा शरीर नहीं काटते। ये ज़हर भरते हैं, तुम्हारे मन में। संदेह। भ्रम। श्रद्धा का धीमा क्षरण। तीसरा लोक, खाना 67 से 99, स्वर्गलोक है। दिव्य लोक। यहां से मुक्ति महसूस होती है। लगभग, छू सकते हो। लेकिन सावधान। स्वर्ग में रहने वाले सांप, सबसे भयानक हैं। यहां एक गिरावट, कुछ खानों की नहीं होती। ये मिटा देती है, जन्मों की, आध्यात्मिक साधना को। और वहां, शिखर पर, खाना 100। मोक्ष। मुक्ति। सारे दुखों का अंत। लेकिन मोक्ष तक पहुंचना, आधी लड़ाई है। शुद्ध आत्मा लेकर पहुंचना, वो असली चुनौती है।",
  body:"The board is not a board.\nIt is a map — of the entire universe.\n\n१०० squares · Three realms · One destination\n\n꧁ भूलोक · BHULOKA ꧂\nSquares 1–33 — The Earthly Realm\nChaos reigns. Snakes coil in every shadow.\nMost souls are trapped here forever.\n\n꧁ अन्तर्लोक · ANTARLOKA ꧂\nSquares 34–66 — The Inner Realm\nThe serpents here do not bite your flesh.\nThey poison your mind.\n\n꧁ स्वर्गलोक · SVARGALOKA ꧂\nSquares 67–99 — The Celestial Realm\nOne fall destroys lifetimes of progress.\n\n꧁ मोक्ष · MOKSHA ꧂\nSquare 100 — Liberation.\nBut arriving with a pure soul — that is the true challenge."},
  {title:"The Serpents Within",icon:"𓆙",
  en:"Now, hear me well, because what I am about to describe, will haunt you. They are not, just snakes. They are living nightmares. Ten colossal Nagas, ancient as time itself, coiled around this board since the beginning of creation. Each one, a manifestation of the darkest force, inside every human soul. The sages gave them names. And those names, should make your blood run cold. Krodh. Wrath. The same fire that consumed Duryodhana's mind and burned the Kuru dynasty to ash. When Krodh strikes, you feel the venom of rage dissolving everything you've built. Lobh. Greed. The insatiable hunger that made Shakuni gamble away an entire kingdom. Its jaws swallow your progress whole. Moh. Delusion. The blindness that kept Dhritarashtra from seeing his own sons destroy the world. This serpent, wraps around your eyes. Matsarya. Envy, that green poison that ate Duryodhana alive when he saw the glory of Indraprastha. Kaam. Desire. The burning lust that destroyed Keechaka in a single night. Mad. Pride. The ten-headed arrogance that toppled golden Lanka and brought mighty Ravana to his knees. Bhay. Fear. The same terror that froze Arjuna's hands before the greatest war in history. Dvesh. Hatred. The ancient feud between Drona and Drupada that echoed through generations of blood. Aalasya. Sloth. The great sleep of Kumbhakarna, who slumbered while dharma crumbled around him. And then, the deadliest of them all. Ahankaar. Ego. The serpent king. The one who whispers, I am above all others. The ego that challenged even Lord Rama himself. When a serpent catches you, it does not simply move you backward. It wraps its coils around your soul. It drags you, screaming, into the depths. And it stains you, with Paap. Sin karma. That mark, does not wash away easily. The higher you climb, the more violently you fall. And there is only one protection in this entire game. The celestial shield of Shukra, the planet Venus. But even that divine protection, can only save you, once. After that, you face the serpents, alone.",
  hi:"अब, ध्यान से सुनो, क्योंकि जो मैं बताने वाली हूँ, वो तुम्हें सपनों में भी सताएगा। ये, सिर्फ सांप नहीं हैं। ये जीवित दुःस्वप्न हैं। दस विशाल नाग, समय जितने प्राचीन, सृष्टि के आरम्भ से इस पट पर कुंडली मारे बैठे हैं। हर एक, हर इंसान की आत्मा के अंदर की सबसे काली शक्ति का रूप। ऋषियों ने इन्हें नाम दिए। और वो नाम, तुम्हारा खून जमा देने चाहिए। क्रोध। वो आग जिसने दुर्योधन का मन जलाया और कुरु वंश को राख कर दिया। जब क्रोध हमला करता है, क्रोध का विष तुम्हारी हर उपलब्धि को गला देता है। लोभ। वो अतृप्त भूख जिसने शकुनि से पूरा राज्य जुए में हरवा दिया। इसके जबड़े तुम्हारी प्रगति को साबुत निगल जाते हैं। मोह। वो अंधापन जिसने धृतराष्ट्र को अपने ही पुत्रों को संसार का विनाश करते देखने से रोका। ये सांप, तुम्हारी आँखों पर लिपट जाता है। मात्सर्य। ईर्ष्या, वो हरा ज़हर जिसने दुर्योधन को इंद्रप्रस्थ की महिमा देखकर अंदर से खा लिया। काम। वासना। वो जलती आग जिसने कीचक को एक ही रात में नष्ट कर दिया। मद। घमंड। वो दस सिरों वाला अहंकार जिसने सोने की लंका को धराशायी किया और महान रावण को घुटनों पर ला दिया। भय। वही आतंक जिसने इतिहास के सबसे महान युद्ध से पहले अर्जुन के हाथ जमा दिए। द्वेष। नफ़रत। द्रोण और द्रुपद की वो प्राचीन दुश्मनी जो खून की पीढ़ियों तक गूंजती रही। आलस्य। कुम्भकर्ण की वो महानिद्रा, जो सोता रहा जबकि उसके चारों ओर धर्म टूट रहा था। और फिर, सबसे घातक। अहंकार। नागराज। वो जो फुसफुसाता है, मैं सबसे ऊपर हूँ। वो अहंकार जिसने स्वयं भगवान राम को भी चुनौती दी। जब कोई सांप तुम्हें पकड़ता है, तो सिर्फ पीछे नहीं ले जाता। वो अपने कुंडल तुम्हारी आत्मा पर कसता है। तुम्हें, चीखते हुए, गहराइयों में खींचता है। और तुम पर दाग लगाता है, पाप का। वो दाग, आसानी से नहीं धुलता। जितना ऊपर चढ़ो, उतनी हिंसक होगी गिरावट। और इस पूरे खेल में सिर्फ एक सुरक्षा है। शुक्र ग्रह का दिव्य कवच। लेकिन वो दिव्य सुरक्षा भी, सिर्फ एक बार, बचा सकती है। उसके बाद, तुम सांपों का सामना, अकेले करोगे।",
  body:"They are not just snakes.\nThey are living nightmares — ten colossal नाग Nāgas.\n\n𓆙 क्रोध Krodh — Wrath\n    The fire that burned the Kuru dynasty to ash\n𓆙 लोभ Lobh — Greed\n    The hunger that swallowed Shakuni's kingdom\n𓆙 मोह Moh — Delusion\n    The blindness that veiled Dhritarashtra's eyes\n𓆙 मात्सर्य Mātsarya — Envy\n    The green poison that consumed Duryodhana\n𓆙 काम Kām — Desire\n    The flame that destroyed Keechaka in one night\n𓆙 मद Mad — Pride\n    The arrogance that toppled golden Lankā\n𓆙 भय Bhay — Fear\n    The terror that froze Arjuna before war\n𓆙 द्वेष Dvesh — Hatred\n    The feud that echoed through generations\n𓆙 आलस्य Ālasya — Sloth\n    The sleep of Kumbhakarna while dharma crumbled\n𓆙 अहंकार Ahankār — Ego\n    The serpent king. The deadliest of all.\n\nWhen bitten → dragged into the depths + stained with पाप Pāp.\nOnly शुक्र Shukra shields you — once."},
  {title:"The Path to Moksha",icon:"ॐ",
  en:"And now, the final truth. There are only two ways, to escape the wheel of Samsara. Two narrow paths, through an ocean of suffering. The First Path. Reach, Square 100, with an exact roll of the dice. Not one square more. Not one square less. But, even if you reach Moksha, the gates will not open for a tainted soul. Your Punya, your accumulated virtue, must equal, or exceed, your Paap, your sin. If you arrive at the threshold of liberation, carrying the weight of your failures, you will be cast back. Hurled down, to Square 67. To suffer again. To purify through pain. To crawl, once more, through the celestial realm, past the deadliest serpents, knowing that one wrong step sends you even further down. The Second Path. Far rarer. Far more beautiful. Far more impossible. If, at any moment during your journey, you accumulate 15 Punya, fifteen acts of pure virtue, you transcend the board entirely. You do not need Square 100. You do not need an exact roll. The board itself, dissolves beneath you, and your soul rises, into pure light. Instant Moksha. This is the ancient truth that the sages encoded into this game. That a truly pure soul, can break free from the cycle of existence, at any moment. From any square. Most seekers, will never achieve either path. They will wander this board for eternity, rising and falling, climbing and being devoured, forever caught between virtue and vice. But perhaps, you, will be different. Dharma, awaits. The dice, are ready. The serpents, can already smell your fear. Take a breath. And step, onto the board.",
  hi:"और अब, अंतिम सत्य। संसार के चक्र से बचने के सिर्फ दो रास्ते हैं। दुख के सागर से गुज़रते दो संकरे रास्ते। पहला रास्ता। खाना 100 पर पहुंचो, पासे के बिल्कुल सटीक अंक से। एक खाना ज़्यादा नहीं। एक खाना कम नहीं। लेकिन, अगर मोक्ष तक पहुंच भी गए, तो दूषित आत्मा के लिए द्वार नहीं खुलेंगे। तुम्हारा पुण्य, तुम्हारी संचित पवित्रता, तुम्हारे पाप से बराबर, या ज़्यादा होनी चाहिए। अगर मुक्ति की देहलीज़ पर पहुंचे, अपनी असफलताओं का बोझ लेकर, तो वापस फेंक दिए जाओगे। नीचे, खाना 67 पर। फिर से कष्ट भोगने। दर्द से शुद्ध होने। एक बार फिर, दिव्य लोक से रेंगते हुए गुज़रने, सबसे घातक सांपों के बीच से, ये जानते हुए कि एक ग़लत कदम तुम्हें और भी गहरे गिरा देगा। दूसरा रास्ता। बहुत दुर्लभ। बहुत सुंदर। बहुत असंभव। अगर, यात्रा के किसी भी क्षण, तुम 15 पुण्य इकट्ठा कर लो, शुद्ध पवित्रता के पंद्रह कर्म, तो तुम पट से पूरी तरह ऊपर उठ जाते हो। खाना 100 की ज़रूरत नहीं। सटीक पासे की ज़रूरत नहीं। पट ख़ुद, तुम्हारे नीचे से विलीन हो जाता है, और तुम्हारी आत्मा उठती है, शुद्ध प्रकाश में। तुरंत मोक्ष। यही वो प्राचीन सत्य है जो ऋषियों ने इस खेल में छिपाया। कि सच्ची शुद्ध आत्मा, अस्तित्व के चक्र से मुक्त हो सकती है, किसी भी क्षण। किसी भी खाने से। ज़्यादातर साधक, कभी कोई रास्ता नहीं पा सकेंगे। वो इस पट पर अनंतकाल भटकते रहेंगे, उठते और गिरते, चढ़ते और निगले जाते, हमेशा पुण्य और पाप के बीच फंसे। लेकिन शायद, तुम, अलग हो। धर्म, इंतज़ार कर रहा है। पासे, तैयार हैं। सांप, तुम्हारे डर की गंध पहले से सूंघ रहे हैं। एक सांस लो। और कदम रखो, पट पर।",
  body:"Two paths to escape the wheel of संसार Saṃsāra.\n\n꧁ प्रथम मार्ग · THE FIRST PATH ꧂\nReach Square 100 with an exact roll.\nपुण्य Punya (virtue) must ≥ पाप Pāp (sin).\nIf impure → cast back to Square 67.\n\n꧁ द्वितीय मार्ग · THE SECOND PATH ꧂\nAccumulate 15 पुण्य Punya at any moment.\nThe board dissolves. Instant मोक्ष Moksha.\n\nMost seekers will never achieve either.\n\nधर्म Dharma awaits.\nThe dice are ready.\nThe serpents can smell your fear.\n\nStep onto the board."},
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
      a.volume=0.2;
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
  return{start,stop,playing};
}

/* ═══ VOICEOVER — Puter.js Neural AI → Browser Fallback ═══ */
const VoiceEngine = {
  audio: null,
  speaking: false,

  _browserSpeak(text, lang) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.8; u.pitch = 0.85; u.volume = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const isHi = lang === 'hi';
      if (isHi) {
        u.lang = 'hi-IN';
        const hv = voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang.startsWith('hi')) || voices[0];
        if (hv) u.voice = hv;
      } else {
        u.lang = 'en-US';
        const ev = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en')) || voices[0];
        if (ev) u.voice = ev;
      }
      this.speaking = true;
      u.onend = () => { this.speaking = false; };
      window.speechSynthesis.speak(u);
    } catch (e) {}
  },

  async speak(text, lang) {
    this.stop();
    if (!text) return;

    const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);

    // On hosted site: try OpenAI neural via /api/tts
    if (!isLocal) {
      try {
        const isHi = lang === 'hi';
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);

        const resp = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: isHi ? 'nova' : 'ash',
            instructions: isHi
              ? 'You are an ancient Indian storyteller narrating in Hindi. Speak slowly, mysteriously, with deep emotion. Pause dramatically between sentences. Your voice should feel like a grandmother telling sacred tales by firelight.'
              : 'You are an ancient Indian sage narrating a sacred epic in English. Speak slowly, with deep gravitas and reverence. Pause dramatically between sentences. Your voice should sound ancient, mysterious, and powerful — like a voice echoing from a thousand-year-old temple.'
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (resp.ok) {
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          this.audio = audio;
          this.speaking = true;
          audio.onended = () => { this.speaking = false; URL.revokeObjectURL(url); };
          audio.play();
          return;
        }
      } catch (e) { /* timeout or error — fall through to browser speech */ }
    }

    // Fallback: browser speech (localhost or if neural failed)
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
@keyframes popOut{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.5)}}
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
  const[chosenLang,setChosenLang]=useState("en");
  const[eventPopup,setEventPopup]=useState(null); // {icon, title, subtitle, color, desc}

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

  const showEvent = useCallback((popup) => {
    setEventPopup(popup);
    setTimeout(() => setEventPopup(null), 3500);
  }, []);

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
    setCur(0);setWin(null);setHist([]);setRv(null);setGv(null);setBusy(false);setDil(null);
    setMsg(`${pList[0].name} the ${pList[0].char.name} — your journey begins.`);
    setScreen("game");
  };

  const addPlayer=()=>{
    if(!tempName.trim()||tempChar<0)return;
    const ch=CHARS[tempChar];
    const np=[...players,{name:tempName.trim(),char:ch,charIdx:tempChar}];
    setPlayers(np);setUsedChars(u=>[...u,tempChar]);setTempName("");setTempChar(-1);
    if(np.length>=nP)setTimeout(()=>startGame(np),100);
  };

  const nearest=(positions,ci,count)=>{let m=Infinity,idx=-1;for(let i=0;i<count;i++){if(i!==ci){const d=Math.abs(positions[i]-positions[ci]);if(d>0&&d<m){m=d;idx=i}}}return idx};

  const doRoll=useCallback(()=>{
    if(dil||win||busy||players.length===0)return;
    if(skipA[cur]){const ns=[...skipA];ns[cur]=false;setSkipA(ns);setMsg(`${players[cur].name}'s turn is skipped.`);setCur(c=>(c+1)%nP);return}
    setBusy(true);play("dice");
    const r=Math.floor(Math.random()*6)+1,gi=Math.floor(Math.random()*6),g=GRAHA[gi];
    setRv(r);setGv(g);
    // Show Graha popup
    showEvent({icon:g.icon,title:`${g.n} · ${g.en}`,subtitle:g.desc,color:g.color,type:"graha"});
    setTimeout(()=>{
      let tot=r;if(g.fx==="sun")tot+=1;
      const oldP=pos[cur];let newP=oldP+tot;
      const extras=[];const nPunya=[...punya];const nPapa=[...papa];const nShield=[...shieldA];const nPos=[...pos];
      if(g.fx==="moon"){nPunya[cur]+=1;extras.push("+1 Punya (Moon)")}
      if(g.fx==="jupiter"){for(let i=0;i<nP;i++)nPunya[i]+=1;extras.push("All +1 Punya (Jupiter)")}
      if(g.fx==="venus"){nShield[cur]=true;extras.push("Shield (Venus)")}
      if(g.fx==="mars"){const ni=nearest(pos,cur,nP);if(ni>=0){nPos[ni]=Math.max(1,nPos[ni]-2);extras.push(`${players[ni]?.name} -2 (Mars)`)}}
      if(g.fx==="mercury"){const ni=nearest(pos,cur,nP);if(ni>=0){const sw=nPos[ni];nPos[ni]=oldP;newP=sw+tot;extras.push(`Swap (Mercury)`)}}
      if(newP>100){setMsg(`Overshot Moksha. ${extras.join(" · ")}`);setPunya(nPunya);setPapa(nPapa);setShieldA(nShield);setPos(nPos);setBusy(false);setCur(c=>(c+1)%nP);return}
      // Animate movement — smooth (280ms per step)
      let step=0;const steps=Math.abs(newP-oldP);const dir=newP>oldP?1:-1;
      const iv=setInterval(()=>{
        step++;nPos[cur]=oldP+dir*step;setPos([...nPos]);play("move");
        if(step>=steps){
          clearInterval(iv);
          let p=newP,eMsg="";
          if(SNAKES[p]){const sn=SNAKES[p];if(nShield[cur]){nShield[cur]=false;eMsg=`𓆙 ${sn.skt} — Shield protects!`;play("ladder")}else{const o=p;p=sn.to;eMsg=`𓆙 ${sn.skt} (${sn.en}) ${o}→${p}`;nPapa[cur]+=1;play("snake");
            showEvent({icon:"𓆙",title:`${sn.skt} — ${sn.en}`,subtitle:sn.tale,color:"#e06030",type:"snake",extra:`${o} → ${p}`});
          }}
          else if(LADDERS[p]){const ld=LADDERS[p];const o=p;p=ld.to;eMsg=`🪔 ${ld.skt} (${ld.en}) ${o}→${p}`;nPunya[cur]+=1;play("ladder");
            showEvent({icon:"🪔",title:`${ld.skt} — ${ld.en}`,subtitle:ld.tale,color:"#f0d050",type:"ladder",extra:`${o} → ${p}`});
          }
          else if(DLM_SQ.includes(p)){const d=DILEMMAS[Math.floor(Math.random()*DILEMMAS.length)];setDil({...d,pi:cur});eMsg=`⚖ ${d.en}`;play("dilemma");
            showEvent({icon:"⚖",title:d.t,subtitle:d.en,color:"#d0b870",type:"dilemma"});
          }
          else if(p===100){if(nPunya[cur]>=nPapa[cur]){setWin(cur);eMsg=`ॐ ${players[cur]?.name} attains MOKSHA!`;play("victory");
            showEvent({icon:"ॐ",title:"मोक्ष प्राप्त",subtitle:`${players[cur]?.name} is liberated!`,color:"#f0d050",type:"moksha"});
          }else{p=67;eMsg="Karma impure. Back to 67.";play("snake");
            showEvent({icon:"⚠",title:"Karma Impure",subtitle:"Punya must ≥ Papa. Cast back to 67.",color:"#e06030",type:"snake"});
          }}
          nPos[cur]=p;setPos([...nPos]);setPunya(nPunya);setPapa(nPapa);setShieldA(nShield);
          setMsg([eMsg,...extras].filter(Boolean).join(" · ")||`Moved to ${p}.`);
          setHist(h=>[...h.slice(-12),`${players[cur]?.name}→${p}`]);
          if(nPunya[cur]>=15&&!win){setWin(cur);setMsg(`ॐ KARMA VICTORY! ${players[cur]?.name} transcends!`);play("victory");
            showEvent({icon:"ॐ",title:"KARMA VICTORY",subtitle:`${players[cur]?.name} transcends the board!`,color:"#f0d050",type:"moksha"});
          }
          if(!DLM_SQ.includes(p))setCur(c=>(c+1)%nP);
          setBusy(false);
        }
      },280);
    },600);
  },[cur,nP,dil,win,busy,punya,papa,pos,shieldA,skipA,play,players,showEvent]);

  const solvD=(ci)=>{
    if(!dil)return;const ch=dil.c[ci],fx=ch.fx||{};
    const np=[...punya],npa=[...papa],nsk=[...skipA],npos=[...pos];
    if(fx.punya)np[dil.pi]+=(fx.punya);if(fx.papa)npa[dil.pi]+=(fx.papa);if(fx.skip)nsk[dil.pi]=true;
    if(fx.move)npos[dil.pi]=Math.max(1,Math.min(100,npos[dil.pi]+(fx.move)));
    setPunya(np);setPapa(npa);setSkipA(nsk);setPos(npos);
    const parts=[];if(fx.punya)parts.push(`+${fx.punya} Punya`);if(fx.papa)parts.push(`+${fx.papa} Papa`);if(fx.move)parts.push(fx.move>0?`advance ${fx.move}`:`back ${Math.abs(fx.move)}`);if(fx.skip)parts.push("skip next");
    setMsg(parts.join(", ")||"Balanced.");
    if(ch.k==="punya")play("ladder");else if(ch.k==="papa")play("snake");
    setDil(null);setCur(c=>(c+1)%nP);
  };

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
        <button className="gb gp" onClick={()=>{ambient.start();setScreen("story");setStoryPage(0)}} style={{fontSize:14,padding:"14px 32px",letterSpacing:3}}>📜 BEGIN WITH STORY</button>
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
            <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,alignItems:"center"}}>
              <div style={{fontSize:10,opacity:.3,letterSpacing:5}}>{storyPage+1} OF {STORY_PAGES.length}</div>
              <button onClick={()=>{if(!muted)VoiceEngine.speak(pg[chosenLang],chosenLang);else VoiceEngine.stop()}} style={{background:"transparent",border:"1px solid rgba(200,160,60,.25)",color:"#c0b080",padding:"3px 10px",fontSize:10,cursor:"pointer",borderRadius:3,opacity:.6}}>
                🔊 Narrate
              </button>
              <button onClick={toggleMute} style={{background:"transparent",border:"1px solid rgba(200,160,60,.25)",color:"#c0b080",padding:"3px 10px",fontSize:11,cursor:"pointer",borderRadius:3,opacity:.6}}>
                {muted?"🔇":"🔊"}
              </button>
            </div>
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
          {[2,3,4].map(n=><button key={n} className="gb gp" onClick={()=>{setNP(n);setPlayers([]);setUsedChars([]);setTempName("");setTempChar(-1);setScreen("setup")}} style={{padding:"18px 50px",fontSize:18}}>{n}</button>)}
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
  const InfoPanel=()=>(<div style={{position:"fixed",inset:0,background:"rgba(6,5,3,.95)",zIndex:300,overflowY:"auto",padding:"clamp(12px,3vw,24px)",animation:"fadeIn .3s ease"}}>
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
        <div style={{fontSize:13,fontWeight:700,color:"#f0d050",marginBottom:8}}>🌌 GRAHA DIE</div>
        {GRAHA.map((g,i)=><div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:i<5?"1px solid rgba(200,160,60,.06)":"none"}}>
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
      <h3 style={{fontSize:15,color:"#d0b870",letterSpacing:3,borderBottom:"1px solid rgba(200,160,60,.15)",paddingBottom:6,margin:"16px 0 10px"}}>⚖ DHARMA CARDS</h3>
      {DILEMMAS.map((d,i)=><div key={i} style={{background:"rgba(20,16,10,.4)",border:"1px solid rgba(200,160,60,.08)",padding:10,borderRadius:4,marginBottom:8}}>
        <div style={{fontSize:12,fontFamily:"'Noto Serif Devanagari',serif",fontWeight:700,color:"#f0d050"}}>{d.t} — <span style={{fontFamily:"'Cinzel',serif",fontSize:11,opacity:.7}}>{d.en}</span></div>
        <p style={{fontSize:11,color:"#c0b080",lineHeight:1.6,margin:"4px 0",fontStyle:"italic"}}>{d.txt}</p>
        {d.c.map((ch,ci)=><div key={ci} style={{fontSize:10,color:ch.k==="punya"?"#f0d050":"#e08040",padding:"1px 0"}}>→ {ch.l}</div>)}
      </div>)}
    </div>
  </div>);

  // ═══ GAME ═══
  if(screen!=="game"||players.length===0)return null;
  const cp=players[cur]||players[0];
  const hd=hov?(SNAKES[hov]?{type:"𓆙 NĀGA",label:`${SNAKES[hov].skt} — ${SNAKES[hov].en}`,desc:SNAKES[hov].tale,to:`Falls to ${SNAKES[hov].to}`,cl:"#e08040"}:LADDERS[hov]?{type:"🪔 VIRTUE",label:`${LADDERS[hov].skt} — ${LADDERS[hov].en}`,desc:LADDERS[hov].tale,to:`Rises to ${LADDERS[hov].to}`,cl:"#f0d050"}:DLM_SQ.includes(hov)?{type:"⚖ DHARMA",label:"Moral crossroads",desc:"A dilemma from the Mahābhārata.",cl:"#d0b870"}:hov===100?{type:"ॐ MOKSHA",label:"Liberation",desc:"Punya must ≥ Papa.",cl:"#f0d050"}:null):null;

  return(
    <div style={{...PG,padding:"10px 8px",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <style>{CSS}</style>
      {showInfo&&<InfoPanel/>}
      {eventPopup&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,pointerEvents:"auto"}} onClick={()=>setEventPopup(null)}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"popIn .4s ease forwards",background:"linear-gradient(180deg,#2a2015,#12100a)",border:`2px solid ${eventPopup.color}50`,borderRadius:8,padding:"28px 36px",textAlign:"center",maxWidth:340,width:"85vw",boxShadow:`0 0 60px ${eventPopup.color}30, 0 0 120px rgba(0,0,0,.8)`}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:52,marginBottom:8,filter:`drop-shadow(0 0 20px ${eventPopup.color})`}}>{eventPopup.icon}</div>
          <div style={{fontSize:20,fontFamily:"'Yatra One',serif",color:eventPopup.color,marginBottom:4,letterSpacing:2}}>{eventPopup.title}</div>
          {eventPopup.extra&&<div style={{fontSize:16,fontWeight:900,color:eventPopup.color,marginBottom:6,letterSpacing:4}}>{eventPopup.extra}</div>}
          <div style={{fontSize:12,color:"#d0c090",lineHeight:1.8,fontStyle:"italic",opacity:.8}}>{eventPopup.subtitle}</div>
          <div style={{marginTop:14,fontSize:9,opacity:.3,letterSpacing:2}}>TAP TO DISMISS</div>
        </div>
      </div>}
      <div style={{textAlign:"center",marginBottom:4,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:10}}>
          <div style={{fontSize:"clamp(18px,3.5vw,28px)",fontFamily:"'Yatra One',serif",letterSpacing:3,color:"#f0d050"}}>मोक्षपटम्</div>
          <button onClick={()=>setShowInfo(true)} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"2px 8px",fontSize:11,cursor:"pointer",borderRadius:3}}>📖</button>
          <button onClick={toggleMute} style={{background:"transparent",border:"1px solid rgba(200,160,60,.2)",color:"#c0b080",padding:"2px 8px",fontSize:12,cursor:"pointer",borderRadius:3}}>{muted?"🔇":"🔊"}</button>
        </div>
        <div style={{fontSize:8,letterSpacing:5,opacity:.3,color:"#c0b080"}}>{rlm(pos[cur]||1)==="bhuloka"?"भूलोक EARTHLY":rlm(pos[cur]||1)==="antarloka"?"अन्तर्लोक INNER":"स्वर्गलोक CELESTIAL"}</div>
        <div style={{marginTop:4}}><InstaBadge/></div>
      </div>
      <div style={{background:"linear-gradient(90deg,transparent,rgba(30,24,14,.6),transparent)",borderTop:"1px solid rgba(200,160,60,.2)",borderBottom:"1px solid rgba(200,160,60,.2)",padding:"8px 14px",marginBottom:8,textAlign:"center",fontSize:"clamp(10px,1.4vw,12px)",maxWidth:780,width:"100%",fontStyle:"italic",lineHeight:1.7,color:"#c0b080"}}>{msg}</div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center",width:"100%",maxWidth:1040}}>
        {/* BOARD */}
        <div style={{flex:"1 1 300px",maxWidth:640,minWidth:280}}>
          <div style={{position:"relative",border:"2px solid rgba(200,160,60,.3)",background:"radial-gradient(ellipse at 30% 30%,rgba(60,45,20,.2),transparent 50%),radial-gradient(ellipse at 70% 70%,rgba(60,45,20,.15),transparent 50%),#1e1810",boxShadow:"0 0 60px rgba(0,0,0,.5),inset 0 0 40px rgba(0,0,0,.3)",borderRadius:2}}>
            <div style={{position:"absolute",inset:4,border:"1px solid rgba(200,160,60,.1)",pointerEvents:"none",zIndex:10}}/>
            {[{top:"1%",t:"स्वर्गलोक CELESTIAL"},{top:"34.5%",t:"अन्तर्लोक INNER"},{top:"67.5%",t:"भूलोक EARTHLY"}].map((r,i)=><div key={i} style={{position:"absolute",top:r.top,left:"50%",transform:"translateX(-50%)",fontSize:"clamp(5px,.8vw,7px)",letterSpacing:4,opacity:.18,color:"#f0d050",zIndex:10,pointerEvents:"none",whiteSpace:"nowrap"}}>{r.t}</div>)}
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
                if(mk){bg="radial-gradient(circle,rgba(240,200,80,.15),transparent)";bdr="rgba(240,200,80,.4)"}
                else if(sn){bg="radial-gradient(circle,rgba(160,80,30,.15),transparent)";bdr="rgba(160,80,30,.2)"}
                else if(ld){bg="radial-gradient(circle,rgba(200,160,60,.1),transparent)";bdr="rgba(200,160,60,.15)"}
                else if(dl){bg="radial-gradient(circle,rgba(180,150,80,.1),transparent)";bdr="rgba(180,150,80,.18)"}
                return(<div key={num} onMouseEnter={()=>setHov(num)} onMouseLeave={()=>setHov(null)} style={{aspectRatio:"1",background:bg,border:`0.5px solid ${hov===num?"rgba(240,200,80,.5)":bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"all .2s"}}>
                  <span style={{position:"absolute",top:1,left:2,fontSize:"clamp(5px,.9vw,9px)",color:"rgba(240,210,130,.45)",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:700}}>{num}</span>
                  {mk&&<span style={{fontSize:"clamp(10px,2vw,18px)",animation:"mp 3s ease infinite",color:"#f0d050"}}>ॐ</span>}
                  {sn&&<><span style={{fontSize:"clamp(6px,1.3vw,12px)",lineHeight:1}}>𓆙</span><span style={{fontSize:"clamp(4.5px,.8vw,7.5px)",color:"#ffc050",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,lineHeight:1,textShadow:"0 0 8px #000,0 1px 3px #000"}}>{sn.skt}</span><span style={{fontSize:"clamp(3px,.5vw,5px)",color:"#ffa840",fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1,textShadow:"0 0 6px #000"}}>{sn.en}</span></>}
                  {ld&&<><span style={{fontSize:"clamp(5px,1.1vw,10px)",lineHeight:1}}>🪔</span><span style={{fontSize:"clamp(4.5px,.8vw,7.5px)",color:"#ffe070",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:900,lineHeight:1,textShadow:"0 0 8px #000"}}>{ld.skt}</span><span style={{fontSize:"clamp(3px,.5vw,5px)",color:"#f0d060",fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1,textShadow:"0 0 6px #000"}}>{ld.en}</span></>}
                  {dl&&<><span style={{fontSize:"clamp(5px,1.1vw,9px)",lineHeight:1}}>⚖</span><span style={{fontSize:"clamp(3px,.5vw,5px)",color:"#f0d060",fontFamily:"'Cinzel',serif",fontWeight:900,textShadow:"0 0 6px #000"}}>DHARMA</span></>}
                  {ph.length>0&&<div style={{position:"absolute",bottom:0,right:0,display:"flex",gap:1,zIndex:15}}>
                    {ph.map(pi=>{const c=players[pi]?.char;const isMoving=pi===cur&&busy;return <div key={pi} style={{width:"clamp(12px,2vw,18px)",height:"clamp(12px,2vw,18px)",borderRadius:"50%",background:`radial-gradient(circle,${c?.color||"#fff"},rgba(0,0,0,.6))`,border:`1.5px solid ${c?.color||"#fff"}`,boxShadow:`0 0 ${isMoving?12:6}px ${c?.color||"#fff"}${isMoving?"cc":"60"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(7px,1.1vw,11px)",transition:"all .25s ease",transform:isMoving?"scale(1.2)":"scale(1)"}}>{c?.icon?.charAt(0)||"•"}</div>})}
                  </div>}
                </div>);
              })}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:"clamp(8px,2vw,16px)",marginTop:5,fontSize:"clamp(7px,1vw,9px)",opacity:.35,color:"#c0b080",flexWrap:"wrap"}}>
            <span>𓆙 Nāga</span><span>🪔 Virtue</span><span>⚖ Dharma</span><span>ॐ Moksha</span>
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
          {dil&&<div style={{background:"linear-gradient(180deg,#221a10,#1a1408)",border:"1px solid rgba(220,180,80,.25)",padding:14,borderRadius:3}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:22}}>⚖</span><div><div style={{fontSize:8,letterSpacing:3,color:"#f0d050",opacity:.6,fontWeight:700}}>DHARMA DILEMMA</div><div style={{fontSize:"clamp(13px,2vw,16px)",fontFamily:"'Noto Serif Devanagari',serif",fontWeight:700,color:"#f0d050"}}>{dil.t}</div></div></div>
            <div style={{fontSize:11,color:"#f0d050",opacity:.55,fontWeight:700,marginBottom:6}}>{dil.en}</div>
            <div style={{fontSize:12,fontStyle:"italic",opacity:.8,marginBottom:14,lineHeight:1.8,color:"#e0d0a0"}}>{dil.txt}</div>
            {dil.c.map((ch,ci)=><button key={ci} onClick={()=>solvD(ci)} style={{display:"block",width:"100%",marginBottom:7,background:ch.k==="punya"?"rgba(200,160,60,.08)":"rgba(180,70,30,.08)",border:`1px solid ${ch.k==="punya"?"rgba(220,180,80,.35)":"rgba(180,70,30,.3)"}`,color:"#e0d0a0",padding:"11px 13px",fontSize:11,fontFamily:"'Cinzel',serif",cursor:"pointer",textAlign:"left",lineHeight:1.5,borderRadius:3}}>{ch.l}</button>)}
          </div>}
          <div style={{background:"linear-gradient(180deg,#1e1810,#14100a)",border:"1px solid rgba(200,160,60,.2)",padding:12,borderRadius:4}}>
            <div style={{fontSize:9,letterSpacing:4,opacity:.5,marginBottom:10,color:"#f0d050",fontWeight:700,textAlign:"center"}}>⚔ KARMA SCOREBOARD ⚔</div>
            {players.map((pl,i)=>{const isActive=cur===i;const pn=punya[i]||0;const pp=papa[i]||0;const total=Math.max(pn+pp,1);
              return(<div key={i} style={{background:isActive?"rgba(200,160,60,.08)":"transparent",border:`1px solid ${isActive?"rgba(240,200,80,.3)":"rgba(200,160,60,.08)"}`,borderRadius:4,padding:"10px 12px",marginBottom:i<nP-1?8:0,transition:"all .3s"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:20}}>{pl.char.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:pl.char.color,fontWeight:700}}>{pl.name}{isActive?" ◄":""}{shieldA[i]?" 🛡":""}{skipA[i]?" ⏭":""}</div>
                    <div style={{fontSize:10,opacity:.5,letterSpacing:1}}>Square {pos[i]||1} · {rlm(pos[i]||1)==="bhuloka"?"भूलोक":rlm(pos[i]||1)==="antarloka"?"अन्तर्लोक":"स्वर्गलोक"}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:10,color:"#f0d050",fontWeight:700,letterSpacing:1}}>पुण्य PUNYA</span>
                      <span style={{fontSize:14,color:"#f0d050",fontWeight:900,fontFamily:"'Noto Serif Devanagari',serif"}}>{pn}</span>
                    </div>
                    <div style={{height:6,background:"rgba(0,0,0,.3)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(pn/total)*100}%`,background:"linear-gradient(90deg,#f0d050,#c0a030)",borderRadius:3,transition:"width .6s ease"}}/>
                    </div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:10,color:"#e06030",fontWeight:700,letterSpacing:1}}>पाप PAPA</span>
                      <span style={{fontSize:14,color:"#e06030",fontWeight:900,fontFamily:"'Noto Serif Devanagari',serif"}}>{pp}</span>
                    </div>
                    <div style={{height:6,background:"rgba(0,0,0,.3)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(pp/total)*100}%`,background:"linear-gradient(90deg,#e06030,#a03020)",borderRadius:3,transition:"width .6s ease"}}/>
                    </div>
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
