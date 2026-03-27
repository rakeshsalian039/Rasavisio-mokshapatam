#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Moksha Patam 108 — Game Voice Pre-generator
# Generates static MP3s for all in-game events: graha effects, snake/ladder,
# shield, moksha, karma victory. These replace dynamic OpenAI TTS calls
# during gameplay — every user hears instant audio at zero API cost.
#
# Usage:
#   export OPENAI_API_KEY="sk-..."
#   bash generate-game-voices.sh
#
# Output: ./public/game-voices/*.mp3  (serve as static files)
# Total:  9 grahas × 2 langs + 5 events × 2 langs = 28 files
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

API_KEY="${OPENAI_API_KEY:?Please set OPENAI_API_KEY}"
OUT_DIR="${1:-./public/game-voices}"
MODEL="tts-1-hd"        # Match onboarding quality
VOICE="ash"             # Same voice as onboarding narrator
TOTAL=0; DONE=0; SKIP=0

# ── CRITICAL: Same instructions as onboarding speakNarrator ──
# The app runs this through the same audio chain (bass+reverb+drone)
# so the raw TTS must match the onboarding character: slow, gravitas, sage-like
EN_INSTR="You are an ancient Indian sage narrating a sacred epic in English. Speak slowly, with deep gravitas and reverence. Pause dramatically between sentences. Your voice should feel like it resonates from stone temple walls."
HI_INSTR="You are an ancient Indian storyteller narrating in Hindi. Speak slowly, mysteriously, with deep emotion. Pause dramatically between sentences. Your voice should feel timeless and sacred."

mkdir -p "$OUT_DIR"

tts() {
  local file="$1" voice="$2" instr="$3" text="$4"
  (( TOTAL++ )) || true
  if [[ -f "$file" && -s "$file" ]]; then
    echo "  ⏭  SKIP: $(basename "$file")"
    (( SKIP++ )) || true; return
  fi
  local payload
  payload=$(python3 -c "
import json,sys
print(json.dumps({'model':'${MODEL}','voice':sys.argv[1],'input':sys.argv[2],'instructions':sys.argv[3],'response_format':'mp3'}))
" "$voice" "$text" "$instr")
  echo "  🎙  $(basename "$file")"
  local code
  code=$(curl -s -o "$file" -w "%{http_code}" https://api.openai.com/v1/audio/speech \
    -H "Authorization: Bearer ${API_KEY}" -H "Content-Type: application/json" -d "$payload")
  if [[ "$code" == "200" ]]; then
    echo "  ✅  Done ($(wc -c <"$file" | tr -d ' ') bytes)"
    (( DONE++ )) || true
  else
    echo "  ❌  FAILED HTTP $code: $(cat "$file" 2>/dev/null)"
    rm -f "$file"
  fi
  sleep 0.8
}

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   Moksha Patam 108 — Game Voice Generator           ║"
echo "║   28 files · model: ${MODEL} · out: ${OUT_DIR}     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "── NAVAGRAHA EFFECTS ──────────────────────────────────"

# ── SURYA — Sun ──
tts "$OUT_DIR/graha-sun-en.mp3" "$VOICE" "$EN_INSTR" \
"Surya, the Sun! The king of planets blazes your path. You gain two extra steps forward. Move with the power of the cosmos."

tts "$OUT_DIR/graha-sun-hi.mp3" "$VOICE" "$HI_INSTR" \
"सूर्य! ग्रहों का राजा तुम्हारे मार्ग को प्रकाशित करता है। तुम्हें दो अतिरिक्त कदम मिलते हैं। ब्रह्मांड की शक्ति से आगे बढ़ो।"

# ── CHANDRA — Moon ──
tts "$OUT_DIR/graha-moon-en.mp3" "$VOICE" "$EN_INSTR" \
"Chandra, the Moon! Lunar grace purifies your soul. You receive one Punya. Your karma grows lighter."

tts "$OUT_DIR/graha-moon-hi.mp3" "$VOICE" "$HI_INSTR" \
"चन्द्र! चंद्रमा की कृपा तुम्हारी आत्मा को शुद्ध करती है। तुम्हें एक पुण्य मिलता है। तुम्हारा कर्म हल्का होता है।"

# ── MANGAL — Mars ──
tts "$OUT_DIR/graha-mars-en.mp3" "$VOICE" "$EN_INSTR" \
"Mangal, Mars! The warrior planet fills you with fury. Your nearest rival is pushed back three squares. But violence carries a karmic price — you gain one Papa."

tts "$OUT_DIR/graha-mars-hi.mp3" "$VOICE" "$HI_INSTR" \
"मंगल! योद्धा ग्रह तुम्हें क्रोध से भर देता है। तुम्हारा निकटतम प्रतिद्वंद्वी तीन खाने पीछे जाता है। लेकिन हिंसा का एक कार्मिक मूल्य है — एक पाप।"

# ── BUDH — Mercury ──
tts "$OUT_DIR/graha-mercury-en.mp3" "$VOICE" "$EN_INSTR" \
"Budh, Mercury! The trickster planet reverses fortune. Your position swaps with the nearest seeker. Fortune turns in an instant."

tts "$OUT_DIR/graha-mercury-hi.mp3" "$VOICE" "$HI_INSTR" \
"बुध! चालाक ग्रह भाग्य को पलट देता है। तुम्हारी स्थिति निकटतम साधक से बदल जाती है। एक पल में भाग्य बदल जाता है।"

# ── BRIHASPATI — Jupiter ──
tts "$OUT_DIR/graha-jupiter-en.mp3" "$VOICE" "$EN_INSTR" \
"Brihaspati, Jupiter! The divine guru blesses all seekers on the board. Everyone below the sacred path gains one Punya. The cosmos favours all."

tts "$OUT_DIR/graha-jupiter-hi.mp3" "$VOICE" "$HI_INSTR" \
"बृहस्पति! दिव्य गुरु पट पर सभी साधकों को आशीर्वाद देता है। पवित्र मार्ग से नीचे सभी को एक पुण्य मिलता है। ब्रह्मांड सबका भला करता है।"

# ── SHUKRA — Venus ──
tts "$OUT_DIR/graha-venus-en.mp3" "$VOICE" "$EN_INSTR" \
"Shukra, Venus! The guru of Asuras grants you a celestial shield. The next serpent that bites you will find its venom neutralized. This shield works only once."

tts "$OUT_DIR/graha-venus-hi.mp3" "$VOICE" "$HI_INSTR" \
"शुक्र! असुरों के गुरु तुम्हें एक दिव्य कवच प्रदान करते हैं। अगला सांप जो तुम्हें काटेगा उसका विष निष्प्रभावी हो जाएगा। यह कवच केवल एक बार काम करता है।"

# ── SHANI — Saturn ──
tts "$OUT_DIR/graha-saturn-en.mp3" "$VOICE" "$EN_INSTR" \
"Shani, Saturn! The lord of karma turns his fearsome gaze upon you. You are pushed back three squares and gain one Papa. No one escapes Saturn's justice."

tts "$OUT_DIR/graha-saturn-hi.mp3" "$VOICE" "$HI_INSTR" \
"शनि! कर्म के स्वामी की भयंकर दृष्टि तुम पर पड़ती है। तुम तीन खाने पीछे जाते हो और एक पाप मिलता है। शनि के न्याय से कोई नहीं बच सकता।"

# ── RAHU — Shadow Node ──
tts "$OUT_DIR/graha-rahu-en.mp3" "$VOICE" "$EN_INSTR" \
"Rahu, the Shadow! The cosmic deceiver strikes. One Punya is stolen from the leader and given to the weakest seeker. The shadow equalizes all."

tts "$OUT_DIR/graha-rahu-hi.mp3" "$VOICE" "$HI_INSTR" \
"राहु! ब्रह्मांडीय धोखेबाज़ प्रहार करता है। नेता का एक पुण्य चुराकर सबसे कमज़ोर साधक को दिया जाता है। छाया सबको बराबर करती है।"

# ── KETU — Tail Node ──
tts "$OUT_DIR/graha-ketu-en.mp3" "$VOICE" "$EN_INSTR" \
"Ketu, the Tail! All celestial shields are stripped from every seeker. And the one closest to Moksha receives one Punya. Ketu gives and takes in the same breath."

tts "$OUT_DIR/graha-ketu-hi.mp3" "$VOICE" "$HI_INSTR" \
"केतु! हर साधक का दिव्य कवच छीन लिया जाता है। और मोक्ष के सबसे करीब वाले को एक पुण्य मिलता है। केतु एक ही सांस में देता और लेता है।"

echo ""
echo "── GAME EVENTS ────────────────────────────────────────"

# ── SNAKE HIT ──
tts "$OUT_DIR/snake-hit-en.mp3" "$VOICE" "$EN_INSTR" \
"The serpent strikes! You are dragged down into the depths. Vice consumes the soul. Two Papa added to your karma. Rise again, seeker."

tts "$OUT_DIR/snake-hit-hi.mp3" "$VOICE" "$HI_INSTR" \
"सांप ने काटा! तुम गहराइयों में खिंच जाते हो। दुर्गुण आत्मा को खा जाता है। दो पाप तुम्हारे कर्म में जुड़ते हैं। उठो, साधक।"

# ── LADDER RISE ──
tts "$OUT_DIR/ladder-rise-en.mp3" "$VOICE" "$EN_INSTR" \
"Virtue lifts you! The sacred ladder carries your soul upward. One Punya added to your karma. The path to Moksha grows shorter."

tts "$OUT_DIR/ladder-rise-hi.mp3" "$VOICE" "$HI_INSTR" \
"गुण तुम्हें उठाता है! पवित्र सीढ़ी तुम्हारी आत्मा को ऊपर ले जाती है। एक पुण्य तुम्हारे कर्म में जुड़ता है। मोक्ष का मार्ग छोटा होता है।"

# ── SHIELD SAVE ──
tts "$OUT_DIR/shield-save-en.mp3" "$VOICE" "$EN_INSTR" \
"Your shield saves you! Shukra's divine protection absorbed the serpent's venom. The shield is now gone. You stand unharmed — but unprotected."

tts "$OUT_DIR/shield-save-hi.mp3" "$VOICE" "$HI_INSTR" \
"तुम्हारा कवच बचाता है! शुक्र की दिव्य रक्षा ने सांप का विष सोख लिया। कवच अब चला गया। तुम अक्षत खड़े हो — लेकिन असुरक्षित।"

# ── MOKSHA GATE ──
tts "$OUT_DIR/moksha-gate-en.mp3" "$VOICE" "$EN_INSTR" \
"Moksha! You have reached the one hundred and eighth square. The cycle of Samsara ends. Your soul is pure. Liberation is yours."

tts "$OUT_DIR/moksha-gate-hi.mp3" "$VOICE" "$HI_INSTR" \
"मोक्ष! तुम एक सौ आठवें खाने पर पहुंच गए। संसार का चक्र समाप्त होता है। तुम्हारी आत्मा शुद्ध है। मुक्ति तुम्हारी है।"

# ── KARMA WIN ──
tts "$OUT_DIR/karma-win-en.mp3" "$VOICE" "$EN_INSTR" \
"Karma Victory! Thirty Punya accumulated. The board itself dissolves beneath you. A truly pure soul can break free from any square. Instant Moksha."

tts "$OUT_DIR/karma-win-hi.mp3" "$VOICE" "$HI_INSTR" \
"कर्म विजय! तीस पुण्य इकट्ठे हो गए। पट तुम्हारे नीचे से विलीन हो जाता है। सच्ची शुद्ध आत्मा किसी भी खाने से मुक्त हो सकती है। तुरंत मोक्ष।"

echo ""
echo "── ASHTANGA MARGA — 7 SACRED STEPS ──────────────────"

# Step 1 — Yama (Self-restraint) — entry to sacred path
tts "$OUT_DIR/ashtanga-1-en.mp3" "$VOICE" "$EN_INSTR" \
"You have entered the Ashtanga Marga — the eight-fold sacred path of Patanjali. From here, you move only one step per turn. Each step tests your soul. There are no dice shortcuts. Only dharma. Step one of seven: Yama. Self-restraint."

tts "$OUT_DIR/ashtanga-1-hi.mp3" "$VOICE" "$HI_INSTR" \
"तुमने अष्टांग मार्ग में प्रवेश किया है — पतंजलि का आठ-सूत्री पवित्र मार्ग। अब हर बारी केवल एक कदम चलते हो। हर कदम तुम्हारी आत्मा की परीक्षा है। कोई पासे का शॉर्टकट नहीं। केवल धर्म। पहला कदम: यम। आत्म-संयम।"

# Step 2 — Niyama (Discipline)
tts "$OUT_DIR/ashtanga-2-en.mp3" "$VOICE" "$EN_INSTR" \
"Step two of seven on the Sacred Path. Niyama. Discipline. The soul that cannot discipline itself cannot ascend. A test of your wisdom awaits."

tts "$OUT_DIR/ashtanga-2-hi.mp3" "$VOICE" "$HI_INSTR" \
"पवित्र मार्ग पर दूसरा कदम। नियम। अनुशासन। जो आत्मा खुद को अनुशासित नहीं कर सकती, वह ऊपर नहीं जा सकती। तुम्हारे ज्ञान की परीक्षा सामने है।"

# Step 3 — Asana (Steadiness)
tts "$OUT_DIR/ashtanga-3-en.mp3" "$VOICE" "$EN_INSTR" \
"Step three of seven on the Sacred Path. Asana. Steadiness. The body is the temple of the soul. Still the vessel, and the soul rises. A test of your wisdom awaits."

tts "$OUT_DIR/ashtanga-3-hi.mp3" "$VOICE" "$HI_INSTR" \
"पवित्र मार्ग पर तीसरा कदम। आसन। स्थिरता। शरीर आत्मा का मंदिर है। पात्र को स्थिर करो, और आत्मा ऊपर उठती है। तुम्हारे ज्ञान की परीक्षा सामने है।"

# Step 4 — Pranayama (Life-force)
tts "$OUT_DIR/ashtanga-4-en.mp3" "$VOICE" "$EN_INSTR" \
"Step four of seven on the Sacred Path. Pranayama. The expansion of life-force. Breath is the bridge between body and soul. Master the breath, master existence. A test of your wisdom awaits."

tts "$OUT_DIR/ashtanga-4-hi.mp3" "$VOICE" "$HI_INSTR" \
"पवित्र मार्ग पर चौथा कदम। प्राणायाम। जीवन-शक्ति का विस्तार। श्वास शरीर और आत्मा के बीच का सेतु है। श्वास पर नियंत्रण, अस्तित्व पर नियंत्रण। तुम्हारे ज्ञान की परीक्षा सामने है।"

# Step 5 — Pratyahara (Withdrawal)
tts "$OUT_DIR/ashtanga-5-en.mp3" "$VOICE" "$EN_INSTR" \
"Step five of seven on the Sacred Path. Pratyahara. Withdrawal of the senses. The world calls, but the soul must turn inward. Silence the noise. A test of your wisdom awaits."

tts "$OUT_DIR/ashtanga-5-hi.mp3" "$VOICE" "$HI_INSTR" \
"पवित्र मार्ग पर पांचवां कदम। प्रत्याहार। इंद्रियों का निग्रह। दुनिया बुलाती है, लेकिन आत्मा को अंतर्मुखी होना होगा। शोर को शांत करो। तुम्हारे ज्ञान की परीक्षा सामने है।"

# Step 6 — Dharana (Concentration)
tts "$OUT_DIR/ashtanga-6-en.mp3" "$VOICE" "$EN_INSTR" \
"Step six of seven on the Sacred Path. Dharana. Single-pointed concentration. The laser of consciousness. Point it at truth. A test of your wisdom awaits."

tts "$OUT_DIR/ashtanga-6-hi.mp3" "$VOICE" "$HI_INSTR" \
"पवित्र मार्ग पर छठा कदम। धारणा। एकाग्रता। चेतना की लेज़र। इसे सत्य पर केंद्रित करो। तुम्हारे ज्ञान की परीक्षा सामने है।"

# Step 7 — Dhyana (Meditation) — final gate
tts "$OUT_DIR/ashtanga-7-en.mp3" "$VOICE" "$EN_INSTR" \
"The final step. Dhyana. Deep meditation. After this test, you must roll exact one to enter Moksha. The dice do not matter here. Only the purity of your surrender. Step seven of seven."

tts "$OUT_DIR/ashtanga-7-hi.mp3" "$VOICE" "$HI_INSTR" \
"अंतिम कदम। ध्यान। गहरी समाधि। इस परीक्षा के बाद, मोक्ष में प्रवेश के लिए सटीक एक पासा फेंकना होगा। यहाँ पासे का महत्व नहीं। केवल तुम्हारे समर्पण की शुद्धता। सातवां कदम, सातवें में से।"

echo ""
echo "══════════════════════════════════════════════════════"
echo "  Done!  Generated: $DONE  |  Skipped: $SKIP  |  Total: $TOTAL"
echo ""
echo "  Files saved to: $OUT_DIR/"
echo "  Deploy at: /public/game-voices/*.mp3"
echo ""
echo "  Files generated:"
echo "  · 9 graha effects × 2 langs  = 18 files"
echo "  · 5 game events × 2 langs    = 10 files"
echo "  · 7 Ashtanga steps × 2 langs = 14 files"
echo "  · Total: 42 files"
echo ""
echo "  Cost: tts-1-hd @ \$0.030/1K chars × ~300 chars avg × 42 ≈ \$0.38 one-time"
echo "  After deploy: \$0 per user, per game, forever"
echo "══════════════════════════════════════════════════════"
echo ""
