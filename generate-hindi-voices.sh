#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Moksha Patam 108 — Hindi Voice Generator
# Generates 40 Hindi MP3s for guru intros, guru blessings, temple lore,
# sacred path steps, and sacred path correct-answer affirmations.
#
# Reads text from src/i18n/hi/*.json so audio stays in sync with translations.
#
# Usage:
#   export OPENAI_API_KEY="sk-..."
#   bash generate-hindi-voices.sh
#
# Output:
#   public/guru-voices/{id}-hi.mp3           (8 files)
#   public/guru-voices/{id}-blessing-hi.mp3   (8 files)
#   public/temple-voices/{key}-hi.mp3         (9 files)
#   public/sacred-voices/step{0-7}-hi.mp3     (8 files)
#   public/sacred-voices/correct{0-6}-hi.mp3  (7 files)
#   Total: 40 files
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

API_KEY="${OPENAI_API_KEY:?Please set OPENAI_API_KEY}"
MODEL="tts-1-hd"
VOICE="ash"
TOTAL=0; DONE=0; SKIP=0

HI_INSTR="तुम एक प्राचीन भारतीय कथावाचक हो। शुद्ध हिंदी में बोलो — अंग्रेज़ी का कोई प्रभाव नहीं। गहरी, धीमी, नाटकीय आवाज़। वाक्यों के बीच लंबा ठहराव। जैसे कोई 5,000 साल पुराना ऋषि बोल रहा हो। शब्दों का उच्चारण शुद्ध संस्कृतनिष्ठ हिंदी में करो।"

GURUS_JSON="src/i18n/hi/gurus.json"
TEMPLES_JSON="src/i18n/hi/temples.json"
SACRED_JSON="src/i18n/hi/sacred.json"

# Helper: read a key from a JSON file
jval() {
  python3 -c "import json,sys; print(json.load(open(sys.argv[1]))[sys.argv[2]])" "$1" "$2"
}

# TTS helper (same as generate-game-voices.sh)
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
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Moksha Patam 108 — Hindi Voice Generator (40 files)   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# GROUP A: 8 Guru Intros
# ══════════════════════════════════════════════════════════════════════════════
echo "── गुरु परिचय (8 files) ──"
mkdir -p public/guru-voices
for id in aryabhata sushruta chanakya panini charaka bhaskara varahamihira patanjali; do
  text=$(jval "$GURUS_JSON" "${id}_intro")
  tts "public/guru-voices/${id}-hi.mp3" "$VOICE" "$HI_INSTR" "$text"
done

# ══════════════════════════════════════════════════════════════════════════════
# GROUP B: 8 Guru Blessings
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "── गुरु आशीर्वाद (8 files) ──"
for id in aryabhata sushruta chanakya panini charaka bhaskara varahamihira patanjali; do
  text=$(jval "$GURUS_JSON" "${id}_blessingDesc")
  tts "public/guru-voices/${id}-blessing-hi.mp3" "$VOICE" "$HI_INSTR" "$text"
done

# ══════════════════════════════════════════════════════════════════════════════
# GROUP C: 9 Temple Lore
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "── मंदिर कथा (9 files) ──"
mkdir -p public/temple-voices
for key in krishi vaidya shilpa ganita kala shabda jyotish darshan rajniti; do
  text=$(jval "$TEMPLES_JSON" "${key}_lore")
  tts "public/temple-voices/${key}-hi.mp3" "$VOICE" "$HI_INSTR" "$text"
done

# ══════════════════════════════════════════════════════════════════════════════
# GROUP D: 8 Sacred Path Steps
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "── पवित्र मार्ग (8 files) ──"
mkdir -p public/sacred-voices
STEP_NAMES=("yama" "niyama" "asana" "pranayama" "pratyahara" "dharana" "dhyana" "moksha")
for i in "${!STEP_NAMES[@]}"; do
  name="${STEP_NAMES[$i]}"
  text=$(jval "$SACRED_JSON" "${name}_lore")
  tts "public/sacred-voices/step${i}-hi.mp3" "$VOICE" "$HI_INSTR" "$text"
done

# ══════════════════════════════════════════════════════════════════════════════
# GROUP E: 7 Sacred Path Correct Answers (0-6, step 7 is Moksha itself)
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "── पवित्र मार्ग सही उत्तर (7 files) ──"
STEP_SKT=("यम" "नियम" "आसन" "प्राणायाम" "प्रत्याहार" "धारणा" "ध्यान")
STEP_EN=("Yama" "Niyama" "Asana" "Pranayama" "Pratyahara" "Dharana" "Dhyana")
for i in 0 1 2 3 4 5 6; do
  text="सही उत्तर। ${STEP_SKT[$i]} पूर्ण। ${STEP_EN[$i]}। पवित्र मार्ग पर कदम $(( i + 1 ))।"
  tts "public/sacred-voices/correct${i}-hi.mp3" "$VOICE" "$HI_INSTR" "$text"
done

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Total: $TOTAL  |  Generated: $DONE  |  Skipped: $SKIP"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "All done! Run 'ls -lhS public/guru-voices/*-hi.mp3 public/temple-voices/*-hi.mp3 public/sacred-voices/*-hi.mp3' to verify."
