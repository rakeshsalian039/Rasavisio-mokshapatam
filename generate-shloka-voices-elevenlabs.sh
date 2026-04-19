#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Moksha Patam 108 — Mangalacharan Shloka Voice Generator (ElevenLabs)
#
# Regenerates 20 Sanskrit shloka MP3s + Hindi "begin" file using Shivank S
# — ElevenLabs' "Scriptures & Mythology Voice" — perfectly suited for this.
#
# English "begin" file is preserved (OpenAI's output for English is fine).
#
# Usage:
#   export ELEVENLABS_API_KEY="..."
#   bash generate-shloka-voices-elevenlabs.sh
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

API_KEY="${ELEVENLABS_API_KEY:?Please set ELEVENLABS_API_KEY}"
OUT_DIR="./public/shlokas"
TOTAL=0; DONE=0; SKIP=0

SHIVANK="3zfVMgyQmfzZpm8pYvD2"  # Scriptures & Mythology narrator

mkdir -p "$OUT_DIR"
command -v python3 >/dev/null || { echo "❌ python3 required"; exit 1; }
command -v curl    >/dev/null || { echo "❌ curl required";    exit 1; }

elevenlabs_tts() {
  local file="$1" voice_id="$2" text="$3"
  local stability="${4:-0.85}" similarity="${5:-0.90}" style="${6:-0.25}"
  (( TOTAL++ )) || true

  if [[ -f "$file" && -s "$file" ]]; then
    echo "  ⏭  SKIP: $(basename "$file")"
    (( SKIP++ )) || true
    return 0
  fi

  local payload
  payload=$(python3 -c "
import json, sys
print(json.dumps({
    'text': sys.argv[1],
    'model_id': 'eleven_multilingual_v2',
    'voice_settings': {
        'stability':        float(sys.argv[2]),
        'similarity_boost': float(sys.argv[3]),
        'style':            float(sys.argv[4]),
        'use_speaker_boost': True,
    }
}))
" "$text" "$stability" "$similarity" "$style")

  local url="https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128"
  local http_code
  http_code=$(curl -s -o "$file" -w "%{http_code}" -X POST "$url" \
    -H "xi-api-key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -H "Accept: audio/mpeg" \
    -d "$payload")

  if [[ "$http_code" == "200" && -s "$file" ]]; then
    echo "  ✅  $(basename "$file") ($(wc -c <"$file" | tr -d ' ') bytes)"
    (( DONE++ )) || true
  else
    local body
    body=$(head -c 500 "$file" 2>/dev/null || echo "")
    echo "  ❌  FAILED HTTP ${http_code}: ${body}"
    rm -f "$file"
    if [[ "$http_code" == "429" ]]; then
      echo "  ⏸  Rate limited — sleeping 30s"
      sleep 30
    fi
    return 1
  fi
  sleep 0.4
}

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Moksha Patam — Shlokas via ElevenLabs (Shivank S)     ║"
echo "║   20 Sanskrit shlokas + begin-hi                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ─── Extract 20 shlokas from src/data/mangalacharan.js ──────────────────────
echo "── मंगलाचरण शिलोक · 20 files (Shivank, slow sacred) ──"
python3 -c "
import re, json
with open('src/data/mangalacharan.js','r') as f:
    content = f.read()
shlokas = re.findall(r\"shloka:\s*'(.*?)'\", content, re.DOTALL)
for i, s in enumerate(shlokas[:20]):
    s = s.replace('\\\\n', ' ').replace(\"\\\\\'\", \"'\").strip()
    print(json.dumps({'id': i, 'text': s}))
" | while read -r line; do
  idx=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['id'])" "$line")
  text=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['text'])" "$line")

  # Shloka settings:
  #   stability 0.85 — very uniform cadence (chanted rhythm)
  #   similarity 0.90 — stays faithful to Shivank's tone
  #   style 0.25    — reverent, not overly dramatic
  elevenlabs_tts "$OUT_DIR/shloka-${idx}.mp3" "$SHIVANK" "$text" "0.85" "0.90" "0.25"
done

# ─── "Begin" files ──────────────────────────────────────────────────────────
echo ""
echo "── आरम्भ / BEGIN ──"

# EN: keep existing OpenAI file (it's fine for English)
if [[ -f "$OUT_DIR/begin-en.mp3" ]]; then
  echo "  ⏭  KEEP: begin-en.mp3 (existing English fine)"
else
  echo "  ⚠   begin-en.mp3 missing — regenerate with original script"
fi

# HI: Shivank with dramatic announcer settings
elevenlabs_tts "$OUT_DIR/begin-hi.mp3" "$SHIVANK" \
  "पासे तैयार हैं। पट प्रतीक्षा कर रहा है। खेल आरम्भ हो।" \
  "0.70" "0.90" "0.50"

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Total: $TOTAL  |  Generated: $DONE  |  Skipped: $SKIP"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Sample to audit first:"
echo "  afplay public/shlokas/shloka-0.mp3       # Gita 2.47 (कर्मण्येवाधिकारस्ते)"
echo "  afplay public/shlokas/shloka-3.mp3       # Gita 18.66 (सर्वधर्मान्)"
echo "  afplay public/shlokas/shloka-11.mp3      # असतो मा सद्गमय"
echo "  afplay public/shlokas/begin-hi.mp3       # Announcer"
