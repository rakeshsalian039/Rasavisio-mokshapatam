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
MODEL="tts-1"           # tts-1 is fine for short game events (cheaper than hd)
VOICE="ash"             # warm, clear narrator
TOTAL=0; DONE=0; SKIP=0

EN_INSTR="You are the narrator of an ancient Indian karma board game. Speak with mystical authority — warm, resonant, slightly dramatic. Short sentences. Pause naturally. Never rushed."
HI_INSTR="तुम एक प्राचीन भारतीय कर्म खेल के सूत्रधार हो। रहस्यमय अधिकार से बोलो — गर्म, गूंजती, थोड़ी नाटकीय। छोटे वाक्य। स्वाभाविक ठहराव।"

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
echo "══════════════════════════════════════════════════════"
echo "  Done!  Generated: $DONE  |  Skipped: $SKIP  |  Total: $TOTAL"
echo ""
echo "  Files saved to: $OUT_DIR/"
echo "  Deploy at: /public/game-voices/*.mp3"
echo ""
echo "  Cost summary:"
echo "  · tts-1 model: \$0.015 per 1K chars"
echo "  · ~28 files × ~120 chars avg = ~3,360 chars ≈ \$0.05 one-time"
echo "  · After deploy: \$0 per user forever"
echo ""
echo "  What this replaces (per game session, per user):"
echo "  · 9 graha popups × TTS fetch = ~9 API calls saved"
echo "  · Snake/ladder/events = ~5 more calls saved"
echo "  · At 1000 games/day = ~14,000 API calls/day saved"
echo "══════════════════════════════════════════════════════"
echo ""
