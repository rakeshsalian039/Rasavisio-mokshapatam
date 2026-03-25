// ═══ PLAYABLE CHARACTERS ═══
//
// 6 seekers the player can choose from.
// Each character has:
//   - name: Display name
//   - skt: Sanskrit name  
//   - icon: Emoji
//   - color: CSS color for token and UI
//   - voice: TTS voice name (for OpenAI API)
//   - desc: Description shown on character select screen
//
// TO ADD A CHARACTER: Add a new object. Make sure icon and color are unique.

export const CHARS=[
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

