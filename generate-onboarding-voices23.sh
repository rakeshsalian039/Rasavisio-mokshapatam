#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Moksha Patam 108 — Onboarding Voice Pre-generator
# Generates all onboarding MP3s once so no user ever hits the OpenAI TTS API
#
# Usage:
#   export OPENAI_API_KEY="sk-..."
#   bash generate-onboarding-voices.sh
#
# Output:  /public/onboarding/*.mp3  (serve these as static files)
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
API_KEY="${OPENAI_API_KEY:?Please set OPENAI_API_KEY}"
OUT_DIR="${1:-./public/onboarding}"
MODEL="tts-1-hd"         # tts-1 for cheaper, tts-1-hd for quality
VOICE_NARRATOR="ash"     # sacred narrator voice
VOICE_YAMA="onyx"        # Yama — deep, rumbling
RATE_LIMIT_DELAY=1       # seconds between API calls (avoid rate limits)

EN_INSTRUCTIONS="You are an ancient Indian sage narrating a sacred epic in English. Speak slowly, with deep gravitas and reverence. Pause dramatically between sentences. Your voice should feel like it resonates from stone temple walls."
HI_INSTRUCTIONS="You are an ancient Indian storyteller narrating in Hindi. Speak slowly, mysteriously, with deep emotion. Pause dramatically between sentences. Your voice should feel timeless and sacred."
YAMA_EN_INSTRUCTIONS="Speak like Thanos — an impossibly deep, heavy, rumbling bass voice that vibrates through the chest. Extremely slow and deliberate. Each word lands like a boulder. Long pauses between sentences. Absolute calm confidence of someone who has already won. No emotion, no anger — just cold, inevitable, cosmic authority. The voice of someone who has existed for billions of years and knows exactly how this ends."

mkdir -p "$OUT_DIR"
TOTAL=0; DONE=0; SKIP=0

# ── Helper: call TTS API ──────────────────────────────────────────────────────
tts() {
  local file="$1" voice="$2" instructions="$3" text="$4"

  if [[ -f "$file" && -s "$file" ]]; then
    echo "  ⏭  SKIP (exists): $(basename "$file")"
    (( SKIP++ )) || true
    return
  fi

  # Use Python for safe JSON encoding (handles apostrophes, Unicode, etc.)
  local payload
  payload=$(python3 -c "
import json, sys
data = {
    'model': '${MODEL}',
    'voice': sys.argv[1],
    'input': sys.argv[2],
    'instructions': sys.argv[3],
    'response_format': 'mp3'
}
print(json.dumps(data))
" "$voice" "$text" "$instructions")

  echo "  🎙  Generating: $(basename "$file") (${#text} chars)"

  local http_code
  http_code=$(curl -s -o "$file" -w "%{http_code}" \
    "https://api.openai.com/v1/audio/speech" \
    -H "Authorization: Bearer ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$payload")

  if [[ "$http_code" == "200" ]]; then
    local size
    size=$(wc -c < "$file" | tr -d ' ')
    echo "  ✅  Done: $(basename "$file") (${size} bytes)"
    (( DONE++ )) || true
  else
    local err
    err=$(cat "$file" 2>/dev/null || echo "unknown error")
    echo "  ❌  FAILED (HTTP $http_code): $(basename "$file")"
    echo "     Error: $err"
    rm -f "$file"
  fi

  sleep "$RATE_LIMIT_DELAY"
}

count_file() { (( TOTAL++ )) || true; }

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Moksha Patam 108 — Onboarding Voice Generator     ║"
echo "║   Model: ${MODEL} · Output: ${OUT_DIR}              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# STORY PAGE 0 — A Forgotten Secret
# ══════════════════════════════════════════════════════════════════════════════
count_file; tts "$OUT_DIR/story-0-en.mp3" "$VOICE_NARRATOR" "$EN_INSTRUCTIONS" \
"Listen carefully. What I am about to tell you, has been hidden for five thousand years. Before the Mahabharata was written down. Before the first temples were carved into stone. There existed, a game. A game of the soul. Created by unknown rishis, sages so ancient, that even the gods have forgotten their names. They called it, Moksha Patam. The Board, of Liberation. For thousands of years, kings played it in marble palaces. Sages played it by firelight. It was passed from guru to disciple in whispered secrecy. And then, foreigners came. They stole it. Stripped away every sacred name. Every Sanskrit verse. And renamed it. Snakes and Ladders. A children's game. The soul of the game was murdered. Until, this very moment. Tonight, you play the original."

count_file; tts "$OUT_DIR/story-0-hi.mp3" "$VOICE_NARRATOR" "$HI_INSTRUCTIONS" \
"ध्यान से सुनो। जो मैं बताने जा रहा हूँ, वो पांच हज़ार सालों से छिपाया गया है। महाभारत लिखे जाने से पहले। पहले मंदिरों को पत्थर में तराशे जाने से पहले। एक खेल था। आत्मा का खेल। अज्ञात ऋषियों द्वारा रचा गया, इतने प्राचीन कि देवताओं को भी उनके नाम याद नहीं। उन्होंने इसे कहा, मोक्षपटम। मुक्ति का पट। हज़ारों सालों तक राजाओं ने इसे संगमरमर के महलों में खेला। ऋषियों ने अग्नि की रोशनी में खेला। गुरु से शिष्य तक दबी आवाज़ में पहुंचाया गया। फिर विदेशी आए। चुरा लिया। हर पवित्र नाम छीन लिया। और नाम रख दिया सांप सीढ़ी। बच्चों का खेल। खेल की आत्मा की हत्या कर दी। इस एक क्षण तक। आज रात, तुम असली खेल खेलोगे।"

# ══════════════════════════════════════════════════════════════════════════════
# STORY PAGE 1 — The Sacred Board
# ══════════════════════════════════════════════════════════════════════════════
count_file; tts "$OUT_DIR/story-1-en.mp3" "$VOICE_NARRATOR" "$EN_INSTRUCTIONS" \
"Look at the board. It is not a board. It is a map of your soul's journey. 108 squares. Three realms. And one destination. Bhuloka, Squares 1 through 33, the Earthly Realm, where chaos reigns and most souls are trapped forever. Antarloka, Squares 34 through 66, the Inner Realm, where cunning serpents poison your mind with doubt. Svargaloka, Squares 67 through 99, the Celestial Realm, where a single fall destroys lifetimes of progress. And above it all, the Sacred Crown, Squares 101 to 108, the Ashtanga Marga, the eight-fold path of Patanjali. Here you move one step at a time. Each step tests your knowledge of yoga and dharma. Only those who pass all eight gates may attempt Moksha."

count_file; tts "$OUT_DIR/story-1-hi.mp3" "$VOICE_NARRATOR" "$HI_INSTRUCTIONS" \
"पट को देखो। ये सिर्फ पट नहीं है। ये तुम्हारी आत्मा की यात्रा का नक्शा है। 108 खाने। तीन लोक। और एक मंज़िल। भूलोक, खाना 1 से 33, पृथ्वी लोक, जहाँ अराजकता राज करती है। अंतर्लोक, खाना 34 से 66, आंतरिक लोक, जहाँ चालाक सर्प तुम्हारे मन में संदेह का विष भरते हैं। स्वर्गलोक, खाना 67 से 99, दिव्य लोक, जहाँ एक गिरावट जन्मों की साधना मिटा देती है। और सबसे ऊपर, पवित्र मुकुट, खाना 101 से 108, अष्टांग मार्ग, पतंजलि का आठ-सूत्री मार्ग। यहाँ एक-एक कदम चलते हो। हर कदम तुम्हारे योग और धर्म ज्ञान की परीक्षा लेता है।"

# ══════════════════════════════════════════════════════════════════════════════
# STORY PAGE 2 — Two Sacred Dice
# ══════════════════════════════════════════════════════════════════════════════
count_file; tts "$OUT_DIR/story-2-en.mp3" "$VOICE_NARRATOR" "$EN_INSTRUCTIONS" \
"Every turn, you roll not one, but two dice. The first, the Karma Die, a six-sided die that moves you across the board. Simple. Familiar. But the second die, the Navagraha Die, this is what makes this game truly ancient. Nine planets. Nine cosmic forces. Each one, a living god that intervenes in your journey. Surya, the Sun, blazes your path with 2 extra steps. Chandra, the Moon, purifies you with Punya. Mangal, Mars, fills you with battle fury, pushing your rival back 3 squares. Budh, Mercury, swaps your position with the nearest seeker. Brihaspati, Jupiter, blesses everyone on the board. Shukra, Venus, grants a divine Shield against the next serpent. Shani, Saturn, pushes you back 3 squares and adds Papa. Rahu, the Shadow, steals from the leader and gives to the weakest. And Ketu, the Tail, strips all shields from every player."

count_file; tts "$OUT_DIR/story-2-hi.mp3" "$VOICE_NARRATOR" "$HI_INSTRUCTIONS" \
"हर बारी, तुम एक नहीं, दो पासे फेंकते हो। पहला, कर्म पासा, छह-मुखी पासा जो तुम्हें पट पर चलाता है। सरल। परिचित। लेकिन दूसरा, नवग्रह पासा, यही इस खेल को प्राचीन बनाता है। नौ ग्रह। नौ ब्रह्मांडीय शक्तियां। सूर्य, 2 अतिरिक्त कदम देता है। चन्द्र, पुण्य से शुद्ध करता है। मंगल, प्रतिद्वंद्वी को 3 खाने पीछे धकेलता है। बुध, तुम्हारी स्थिति अदला-बदली कर देता है। बृहस्पति, सबको आशीर्वाद देता है। शुक्र, दिव्य कवच देता है। शनि, 3 खाने पीछे और पाप जोड़ता है। राहु, नेता से चुराकर कमज़ोर को देता है। और केतु, सबके कवच छीन लेता है।"

# ══════════════════════════════════════════════════════════════════════════════
# STORY PAGE 3 — Serpents & Virtues
# ══════════════════════════════════════════════════════════════════════════════
count_file; tts "$OUT_DIR/story-3-en.mp3" "$VOICE_NARRATOR" "$EN_INSTRUCTIONS" \
"Ten colossal Nagas coil around this board. They are not just snakes. They are living nightmares. Each one a manifestation of the darkest force inside every human soul. Krodh, Wrath. Lobh, Greed. Moh, Delusion. When a serpent catches you, it drags you screaming into the depths. You lose squares, and gain 2 Papa, sin karma. But for every serpent, there is a ladder, a virtue. Daya, Compassion. Satya, Truth. Seva, Service. Bhakti, Devotion. When a ladder lifts you, you gain 1 Punya, sacred merit. Between the serpents, Dharma Dilemmas appear. Ancient moral choices from the epics. Choose wisely, for your choices shape your karma."

count_file; tts "$OUT_DIR/story-3-hi.mp3" "$VOICE_NARRATOR" "$HI_INSTRUCTIONS" \
"दस विशाल नाग इस पट पर कुंडली मारे बैठे हैं। ये सिर्फ सांप नहीं हैं। ये जीवित दुःस्वप्न हैं। हर एक तुम्हारी आत्मा के अंदर की काली शक्ति का रूप। क्रोध। लोभ। मोह। जब कोई सांप पकड़ता है, तुम्हें चीखते हुए गहराइयों में खींचता है। खाने खोते हो, और 2 पाप मिलता है। लेकिन हर सांप के लिए एक सीढ़ी है, एक गुण। दया। सत्य। सेवा। भक्ति। जब सीढ़ी उठाती है, 1 पुण्य मिलता है। सांपों के बीच धर्म दुविधाएं आती हैं। महाकाव्यों से प्राचीन नैतिक चुनाव। समझदारी से चुनो, तुम्हारे चुनाव तुम्हारा कर्म बनाते हैं।"

# ══════════════════════════════════════════════════════════════════════════════
# STORY PAGE 4 — Yama Awaits
# ══════════════════════════════════════════════════════════════════════════════
count_file; tts "$OUT_DIR/story-4-en.mp3" "$VOICE_NARRATOR" "$EN_INSTRUCTIONS" \
"In solo mode, you do not play alone. You play against Yama. The God of Death. Lord of the Underworld. Judge of all souls. He is not a computer opponent. He is a cosmic force who has been judging souls since the dawn of creation. Yama plays by different rules. He cannot be reasoned with. He cannot be bribed. And when his serpents catch you, he laughs. Oh, how he laughs. You will hear him. His voice echoes through the board like thunder through an empty temple. Every move you make, he watches. Every mistake, he remembers. You may choose to face Yama alone, or bring companions. 2, 3, or 4 seekers can walk this path together. But remember, only one soul achieves Moksha first."

count_file; tts "$OUT_DIR/story-4-hi.mp3" "$VOICE_NARRATOR" "$HI_INSTRUCTIONS" \
"अकेले खेलते हो तो खाली बोर्ड नहीं मिलता। तुम्हारा सामना होता है यमराज से। मृत्यु के देवता। पाताल के स्वामी। सभी आत्माओं के न्यायाधीश। वो कंप्यूटर प्रतिद्वंद्वी नहीं है। वो ब्रह्मांडीय शक्ति है जो सृष्टि के आरम्भ से आत्माओं का न्याय कर रहा है। यमराज अलग नियमों से खेलता है। उससे तर्क नहीं किया जा सकता। उसे रिश्वत नहीं दी जा सकती। और जब उसके सांप तुम्हें पकड़ते हैं, वो हंसता है। कैसे हंसता है। तुम सुनोगे। उसकी आवाज़ पट पर गूंजती है जैसे खाली मंदिर में गरज। तुम यमराज का अकेले सामना कर सकते हो, या साथी ला सकते हो। 2, 3, या 4 साधक साथ चल सकते हैं। लेकिन याद रखो, मोक्ष पहले एक ही पाएगा।"

# ══════════════════════════════════════════════════════════════════════════════
# STORY PAGE 5 — The Path to Moksha
# ══════════════════════════════════════════════════════════════════════════════
count_file; tts "$OUT_DIR/story-5-en.mp3" "$VOICE_NARRATOR" "$EN_INSTRUCTIONS" \
"Two paths to escape the wheel of Samsara. The First Path, reach Square 108 with an exact roll. But even if you arrive, the gates will not open for a tainted soul. Your Punya must equal or exceed your Papa. If impure, you are cast back to Square 67. To suffer again. The Second Path, far rarer, far more beautiful. Accumulate 30 Punya at any moment during your journey. The board itself dissolves beneath you. Instant Moksha. This is the ancient truth the sages encoded. A truly pure soul can break free from any square. The dice are ready. The serpents can smell your fear. Step onto the board."

count_file; tts "$OUT_DIR/story-5-hi.mp3" "$VOICE_NARRATOR" "$HI_INSTRUCTIONS" \
"संसार के चक्र से बचने के दो रास्ते। पहला, खाना 108 पर सटीक पासे से पहुंचो। लेकिन पहुंच भी गए तो दूषित आत्मा के लिए द्वार नहीं खुलेंगे। पुण्य, पाप से ज़्यादा होना चाहिए। अशुद्ध हो तो खाना 67 पर वापस। फिर से कष्ट भोगने। दूसरा रास्ता, बहुत दुर्लभ और सुंदर। यात्रा में 30 पुण्य इकट्ठा करो किसी भी खाने से। पट विलीन हो जाता है। तुरंत मोक्ष। यही प्राचीन सत्य है जो ऋषियों ने संकेतित किया। सच्ची शुद्ध आत्मा किसी भी खाने से मुक्त हो सकती है। पासे तैयार हैं। सांप तुम्हारे डर की गंध सूंघ रहे हैं। कदम रखो पट पर।"

# ══════════════════════════════════════════════════════════════════════════════
# STORY PAGE 6 — Dharma Dilemma
# ══════════════════════════════════════════════════════════════════════════════
count_file; tts "$OUT_DIR/story-6-en.mp3" "$VOICE_NARRATOR" "$EN_INSTRUCTIONS" \
"Every few squares, life stops you. A Dharma Dilemma appears. An ancient crossroads. These are not simple questions. They are the same moral choices that destroyed kings and elevated sages. Karna gave away his divine armour to a beggar. Knowing it would kill him. Eklavya cut off his own thumb for his guru. Yudhishthira told a half-truth to win a war. These choices are yours now. Choose Punya, the righteous path, and move back but grow purer. Choose Papa, the easy path, advance faster but sin accumulates. The board does not care about your intentions. Only your karma matters at the final gate."

count_file; tts "$OUT_DIR/story-6-hi.mp3" "$VOICE_NARRATOR" "$HI_INSTRUCTIONS" \
"हर कुछ खानों पर, जीवन तुम्हें रोकता है। एक धर्म दुविधा प्रकट होती है। एक प्राचीन चौराहा। ये सरल प्रश्न नहीं हैं। ये वही नैतिक चुनाव हैं जिन्होंने राजाओं को नष्ट किया और ऋषियों को ऊपर उठाया। कर्ण ने अपना दिव्य कवच एक भिखारी को दिया। जानते हुए कि इससे मृत्यु होगी। एकलव्य ने गुरु के लिए अपना अंगूठा काटा। ये चुनाव अब तुम्हारे हैं। पुण्य चुनो — धर्म का मार्ग। पाप चुनो — आसान मार्ग। पट तुम्हारे इरादों की परवाह नहीं करता।"

# ══════════════════════════════════════════════════════════════════════════════
# STORY PAGE 7 — The 8-Fold Sacred Path
# ══════════════════════════════════════════════════════════════════════════════
count_file; tts "$OUT_DIR/story-7-en.mp3" "$VOICE_NARRATOR" "$EN_INSTRUCTIONS" \
"Past square 100, the rules change. You have transcended the material world. The Navagraha cannot touch you. You move one step at a time along the Ashtanga Marga — the eight-fold path of Patanjali. Yama, self-restraint. Niyama, discipline. Asana, steadiness. Pranayama, the expansion of life-force. Pratyahara, withdrawal of the senses. Dharana, single-pointed concentration. Dhyana, deep meditation. And finally, Moksha at square 108, liberation from the cycle of birth and death. But at square 107, the Dhyana gate demands exactness. You must roll a one. Only perfect surrender opens the final door."

count_file; tts "$OUT_DIR/story-7-hi.mp3" "$VOICE_NARRATOR" "$HI_INSTRUCTIONS" \
"खाना 100 के बाद, नियम बदल जाते हैं। तुम भौतिक संसार को पार कर चुके हो। नवग्रह तुम्हें नहीं छू सकते। अष्टांग मार्ग पर एक-एक कदम चलते हो। यम, नियम, आसन, प्राणायाम, प्रत्याहार, धारणा, ध्यान। और अंत में, खाना 108 पर मोक्ष। लेकिन खाना 107 पर, ध्यान का द्वार सटीकता मांगता है। सटीक 1 फेंकना होगा। केवल पूर्ण समर्पण अंतिम द्वार खोलता है।"
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "══════════════════════════════════════════════════════"
echo "  Done!  Generated: $DONE  |  Skipped: $SKIP  |  Total: $TOTAL"
echo ""
echo "  Files saved to: $OUT_DIR/"
echo ""
echo "  Next steps:"
echo "  1. Verify files with: ls -lh $OUT_DIR/*.mp3"
echo "  2. Play-test: afplay $OUT_DIR/story-0-en.mp3  (macOS)"
echo "  3. Deploy: these files are served from /public/"
echo "     → /onboarding/story-0-en.mp3  etc."
echo "  4. The app will automatically prefer static files"
echo "     over OpenAI API — zero per-user cost forever."
echo "══════════════════════════════════════════════════════"
echo ""
