#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Moksha Patam 108 — Mangalacharan Shloka Voice Generator
# Generates 42 MP3s: 20 shlokas × 2 langs + 2 "begin" files
#
# Usage:
#   export OPENAI_API_KEY="sk-..."
#   bash generate-shloka-voices.sh
#
# Output: public/shlokas/shloka-{0-19}-{en|hi}.mp3, begin-{en|hi}.mp3
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

API_KEY="${OPENAI_API_KEY:?Please set OPENAI_API_KEY}"
MODEL="gpt-4o-mini-tts"
VOICE="ash"
OUT_DIR="./public/shlokas"
TOTAL=0; DONE=0; SKIP=0

# Sanskrit shloka voice — divine cosmic entity, Vishnu-like
SKT_INSTR="You are the Supreme Being — Vishnu himself — speaking from beyond the cosmos. Your voice is impossibly deep, thundering yet gentle, as if the universe itself is vibrating. Speak the Sanskrit shloka with extreme slowness. Each word should feel like it echoes across eternity. Massive pauses between lines — 3 to 4 seconds of silence. The listener should feel the weight of 5,000 years in every syllable. This is not a human speaking. This is the voice of creation itself. Pronounce each Sanskrit word with absolute precision and divine authority."

# Hindi narrator — Amitabh Bachchan style
HI_INSTR="तुम अमिताभ बच्चन की शैली में बोलने वाले एक महान भारतीय सूत्रधार हो — वैसी ही गहरी, भारी, गूँजती हुई बैरीटोन आवाज़। हर शब्द में वज़न हो, हर वाक्य में नाटकीयता। बहुत धीरे बोलो। शुद्ध हिंदुस्तानी हिंदी।"

# English narrator — gravitas
EN_INSTR="You are an ancient Indian sage narrating a sacred epic in English. Speak slowly, with deep gravitas and reverence. Pause dramatically between sentences. Your voice should feel like it resonates from stone temple walls."

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
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Moksha Patam 108 — Mangalacharan Voice Generator      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Read shlokas from the data file ──
SHLOKAS=$(python3 -c "
import re
with open('src/data/mangalacharan.js','r') as f:
    content=f.read()
# Extract shloka texts
import json
shlokas=re.findall(r\"shloka:\s*'(.*?)'\",content,re.DOTALL)
# Also try backtick strings
shlokas2=re.findall(r\"shloka:\s*\\\`(.*?)\\\`\",content,re.DOTALL)
# Clean up
result=shlokas+shlokas2
for i,s in enumerate(result[:20]):
    s=s.replace('\\\\n','\n').replace(\"\\\\\'\",\"'\")
    print(f'{i}|||{s}')
")

echo "── श्लोक (20 shlokas × 2 langs = 40 files) ──"
echo ""

while IFS='|||' read -r idx text; do
  [[ -z "$idx" ]] && continue
  # Sanskrit shloka — same voice for both EN and HI versions
  tts "$OUT_DIR/shloka-${idx}-en.mp3" "$VOICE" "$SKT_INSTR" "$text"
  tts "$OUT_DIR/shloka-${idx}-hi.mp3" "$VOICE" "$SKT_INSTR" "$text"
done <<< "$SHLOKAS"

echo ""
echo "── आरम्भ / BEGIN (2 files) ──"
tts "$OUT_DIR/begin-en.mp3" "$VOICE" "$EN_INSTR" "The dice are ready. The board awaits. Let the game begin."
tts "$OUT_DIR/begin-hi.mp3" "$VOICE" "$HI_INSTR" "पासे तैयार हैं। पट प्रतीक्षा कर रहा है। खेल आरम्भ हो।"

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Total: $TOTAL  |  Generated: $DONE  |  Skipped: $SKIP"
echo "══════════════════════════════════════════════════════════"
