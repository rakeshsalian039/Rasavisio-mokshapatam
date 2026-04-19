#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Moksha Patam 108 — Hindi Voice Generator (ElevenLabs Multilingual v2)
#
# Regenerates all Hindi audio with professional-grade voices from ElevenLabs.
# Upgrades over OpenAI `ash` (wrong Hindi pronunciation) and Sarvam Bulbul v3
# (native but less dramatic). ElevenLabs gives cinematic, emotive delivery.
#
# Voices (paste IDs from ElevenLabs Voice Library):
#   SHIVANK    — "Shivank S – Scriptures & Mythology Voice" (3zfVMgyQmfzZpm8pYvD2)
#                Used for: Yama, Chitragupta, temples, shlokas, guru intros
#   WARM_GURU  — Warm narrator voice (yRis6UiS4dtT4Aqv72DC)
#                Used for: Guru blessings (tender, paternal delivery)
#
# Usage:
#   export ELEVENLABS_API_KEY="..."
#   bash generate-hindi-voices-elevenlabs.sh
#
# Re-run safe: existing non-empty files are skipped. To regenerate a
# specific file, delete it first.
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

API_KEY="${ELEVENLABS_API_KEY:?Please set ELEVENLABS_API_KEY}"
TOTAL=0; DONE=0; SKIP=0

# ─── Voice IDs ──────────────────────────────────────────────────────────────
SHIVANK="3zfVMgyQmfzZpm8pYvD2"      # Scriptures & Mythology narrator
WARM_GURU="yRis6UiS4dtT4Aqv72DC"    # Warm tender voice for blessings

# Paths
GURUS_JSON="src/i18n/hi/gurus.json"
TEMPLES_JSON="src/i18n/hi/temples.json"
SACRED_JSON="src/i18n/hi/sacred.json"

command -v python3 >/dev/null || { echo "❌ python3 required"; exit 1; }
command -v curl    >/dev/null || { echo "❌ curl required";    exit 1; }

# ─── Helper: read JSON value ────────────────────────────────────────────────
jval() {
  python3 -c "import json,sys; print(json.load(open(sys.argv[1]))[sys.argv[2]])" "$1" "$2"
}

# ─── Core TTS call ──────────────────────────────────────────────────────────
# Args: $1=file  $2=voice_id  $3=text  [$4=stability]  [$5=similarity]  [$6=style]
# Style guide (empirically tuned for Hindi/Sanskrit narration):
#   Dramatic slow (temple, shloka):   stability=0.70  sim=0.85  style=0.30
#   Authoritative (Chitragupta):      stability=0.80  sim=0.90  style=0.15
#   Menacing (Yama — pre-processed):  stability=0.75  sim=0.90  style=0.45
#   Warm (guru blessing):             stability=0.55  sim=0.80  style=0.40
elevenlabs_tts() {
  local file="$1" voice_id="$2" text="$3"
  local stability="${4:-0.70}" similarity="${5:-0.85}" style="${6:-0.30}"
  (( TOTAL++ )) || true

  if [[ -f "$file" && -s "$file" ]]; then
    echo "  ⏭  SKIP: $(basename "$file")"
    (( SKIP++ )) || true
    return 0
  fi

  # Build JSON payload safely via python (handles quote/newline escaping)
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

  # Endpoint — output_format=mp3_44100_128 gives final MP3 directly (no ffmpeg needed)
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
    # Common failures:
    #   401 → bad API key
    #   422 → voice ID invalid or text too long
    #   429 → rate limit (wait + retry)
    if [[ "$http_code" == "429" ]]; then
      echo "  ⏸  Rate limited — sleeping 30s, you can rerun script to continue"
      sleep 30
    fi
    return 1
  fi
  sleep 0.4  # gentle pacing
}

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Moksha Patam — Hindi Voices via ElevenLabs            ║"
echo "║   Expected: 40 files — gurus/temples/sacred path        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# GROUP A: 8 Guru Intros — Shivank (mythological narrator)
# Each guru gets slightly different style to give subtle tonal variety
# even though all share Shivank as the base voice.
# ═══════════════════════════════════════════════════════════════════════════
echo "── गुरु परिचय · 8 files (Shivank) ──"
mkdir -p public/guru-voices

# Per-guru style presets — subtle variation via stability/style tuning
# Returns: "stability|similarity|style"
guru_preset() {
  case "$1" in
    chanakya|varahamihira)  echo "0.72|0.85|0.40" ;;  # sharp authority, more dramatic
    patanjali|aryabhata)    echo "0.80|0.88|0.20" ;;  # meditative, calm
    bhaskara|charaka)       echo "0.65|0.82|0.30" ;;  # slightly warmer
    sushruta|panini)        echo "0.78|0.85|0.25" ;;  # precise, measured
    *)                      echo "0.70|0.85|0.30" ;;
  esac
}

for id in chanakya varahamihira patanjali aryabhata bhaskara charaka sushruta panini; do
  text=$(jval "$GURUS_JSON" "${id}_intro")
  preset=$(guru_preset "$id")
  stab=$(echo "$preset" | cut -d'|' -f1)
  sim=$(echo  "$preset" | cut -d'|' -f2)
  sty=$(echo  "$preset" | cut -d'|' -f3)
  echo "  🎙  $id (stab=${stab} style=${sty})"
  elevenlabs_tts "public/guru-voices/${id}-hi.mp3" "$SHIVANK" "$text" "$stab" "$sim" "$sty"
done

# ═══════════════════════════════════════════════════════════════════════════
# GROUP B: 8 Guru Blessings — WARM voice (tender, paternal)
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── गुरु आशीर्वाद · 8 files (Warm voice) ──"
for id in chanakya varahamihira patanjali aryabhata bhaskara charaka sushruta panini; do
  text=$(jval "$GURUS_JSON" "${id}_blessingDesc")
  echo "  🎙  $id blessing"
  # Blessings: more expressive, less monotone, warmer delivery
  elevenlabs_tts "public/guru-voices/${id}-blessing-hi.mp3" \
    "$WARM_GURU" "$text" "0.55" "0.80" "0.40"
done

# ═══════════════════════════════════════════════════════════════════════════
# GROUP C: 9 Temple Lore — Shivank Amitabh-style, slow dramatic
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── मंदिर कथा · 9 files (Shivank / Amitabh style) ──"
mkdir -p public/temple-voices
for key in krishi vaidya shilpa ganita kala shabda jyotish darshan rajniti; do
  text=$(jval "$TEMPLES_JSON" "${key}_lore")
  # Temple lore: high stability (uniform gravitas), moderate style (controlled drama)
  elevenlabs_tts "public/temple-voices/${key}-hi.mp3" \
    "$SHIVANK" "$text" "0.75" "0.88" "0.35"
done

# ═══════════════════════════════════════════════════════════════════════════
# GROUP D: 8 Sacred Path Steps — Shivank, consistent narrator
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── पवित्र मार्ग · 8 files (Shivank) ──"
mkdir -p public/sacred-voices
STEP_NAMES=("yama" "niyama" "asana" "pranayama" "pratyahara" "dharana" "dhyana" "moksha")
for i in "${!STEP_NAMES[@]}"; do
  name="${STEP_NAMES[$i]}"
  text=$(jval "$SACRED_JSON" "${name}_lore")
  elevenlabs_tts "public/sacred-voices/step${i}-hi.mp3" \
    "$SHIVANK" "$text" "0.72" "0.85" "0.30"
done

# ═══════════════════════════════════════════════════════════════════════════
# GROUP E: 7 Sacred Path Correct Answers — Shivank, encouraging tone
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── पवित्र मार्ग सही उत्तर · 7 files (Shivank) ──"
STEP_SKT=("यम" "नियम" "आसन" "प्राणायाम" "प्रत्याहार" "धारणा" "ध्यान")
STEP_EN=("Yama" "Niyama" "Asana" "Pranayama" "Pratyahara" "Dharana" "Dhyana")
for i in 0 1 2 3 4 5 6; do
  text="सही उत्तर। ${STEP_SKT[$i]} पूर्ण। ${STEP_EN[$i]}। पवित्र मार्ग पर कदम $(( i + 1 ))।"
  # Slightly quicker/brighter — they're short affirmations
  elevenlabs_tts "public/sacred-voices/correct${i}-hi.mp3" \
    "$SHIVANK" "$text" "0.65" "0.85" "0.35"
done

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Total: $TOTAL  |  Generated: $DONE  |  Skipped: $SKIP"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Credits used: roughly $((TOTAL * 400)) characters (est.)"
echo ""
echo "Done. Next steps:"
echo "  1. Listen:  afplay public/temple-voices/darshan-hi.mp3"
echo "  2. If any voice wrong → delete that MP3, re-run script"
echo "  3. npx cap sync android → rebuild release APK"
