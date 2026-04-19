#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Moksha Patam 108 — Hindi Voice Generator (Sarvam AI / Bulbul v3)
#
# Regenerates all Hindi audio with native-sounding Sarvam voices. Replaces
# the OpenAI `ash` voice which was English-first and mispronounced
# Devanagari phonemes (retroflex vs dental, anusvāra, श vs ष, etc.).
#
# Voice rotation (Bulbul v3):
#   varun  — deep, dramatic    → Yama, temple lore, Chanakya, Varahamihira
#   kabir  — calm, authoritative → Chitragupta, Patanjali, Aryabhata
#   gokul  — warm, teacherly   → Bhaskara, Charaka (gentle healers)
#   mani   — precise, priestly → Sushruta, Panini (methodical scholars)
#
# Usage:
#   export SARVAM_API_KEY="..."
#   bash generate-hindi-voices-sarvam.sh
#
# Re-run safe: existing non-empty files are skipped. To regenerate a
# specific file, delete it first.
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

API_KEY="${SARVAM_API_KEY:?Please set SARVAM_API_KEY}"
TOTAL=0; DONE=0; SKIP=0

# Paths
GURUS_JSON="src/i18n/hi/gurus.json"
TEMPLES_JSON="src/i18n/hi/temples.json"
SACRED_JSON="src/i18n/hi/sacred.json"

# Tools check
command -v ffmpeg >/dev/null || { echo "❌ ffmpeg required. brew install ffmpeg"; exit 1; }
command -v python3 >/dev/null || { echo "❌ python3 required"; exit 1; }

# ─── Helper: read JSON value ────────────────────────────────────────────────
jval() {
  python3 -c "import json,sys; print(json.load(open(sys.argv[1]))[sys.argv[2]])" "$1" "$2"
}

# ─── Core TTS: text → chunked Sarvam calls → merged MP3 ─────────────────────
# Args: $1=file  $2=speaker  $3=text  [$4=pace (default 0.85)]
# Note: Bulbul v3 dropped `pitch` and `loudness` params — tone is controlled
# via speaker choice alone. `pace` still supported (range ~0.5 to 2.0).
sarvam_tts() {
  local file="$1" speaker="$2" text="$3"
  local pace="${4:-0.85}"
  # 5th arg (pitch) silently ignored for backward compat with existing calls
  (( TOTAL++ )) || true

  if [[ -f "$file" && -s "$file" ]]; then
    echo "  ⏭  SKIP: $(basename "$file")"
    (( SKIP++ )) || true
    return 0
  fi

  local wav_dir mp3_list
  wav_dir=$(mktemp -d)
  mp3_list=$(mktemp)

  # Run the chunker + API caller in Python for correctness
  local n_chunks
  n_chunks=$(python3 - "$API_KEY" "$speaker" "$text" "$wav_dir" "$pace" <<'PYEOF'
import sys, json, base64, urllib.request, urllib.error, re, os
key, speaker, text, outdir, pace = sys.argv[1:6]
pace = float(pace)

# Chunk by sentence boundary (। for Hindi, . ! ? for punctuation), max ~450 chars
parts = re.split(r'(?<=[।.!?])\s+', text.strip())
chunks, cur = [], ""
for p in parts:
    if len(cur) + len(p) > 450 and cur:
        chunks.append(cur.strip()); cur = p
    else:
        cur = (cur + " " + p).strip() if cur else p
if cur: chunks.append(cur)

for i, chunk in enumerate(chunks):
    body = json.dumps({
        "inputs": [chunk],
        "target_language_code": "hi-IN",
        "speaker": speaker,
        "pace": pace,
        "speech_sample_rate": 22050,
        "enable_preprocessing": True,
        "model": "bulbul:v3",
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.sarvam.ai/text-to-speech",
        data=body,
        headers={"api-subscription-key": key, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            payload = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"[SARVAM ERROR {e.code}] chunk {i+1}/{len(chunks)}: {err_body}", file=sys.stderr)
        sys.exit(2)
    except Exception as e:
        print(f"[SARVAM ERROR] chunk {i+1}/{len(chunks)}: {e}", file=sys.stderr)
        sys.exit(2)

    audios = payload.get("audios") or []
    if not audios:
        print(f"[SARVAM] empty audios on chunk {i+1}: {payload}", file=sys.stderr)
        sys.exit(2)

    wav = base64.b64decode(audios[0])
    with open(os.path.join(outdir, f"{i:03d}.wav"), "wb") as f:
        f.write(wav)

print(len(chunks))
PYEOF
)
  local py_exit=$?

  if [[ $py_exit -ne 0 ]]; then
    echo "  ❌  Sarvam API failed"
    rm -rf "$wav_dir" "$mp3_list"
    return 1
  fi

  # Build ffmpeg concat list
  for w in "$wav_dir"/*.wav; do
    echo "file '${w}'" >> "$mp3_list"
  done

  # Concat WAVs and encode to MP3 (qscale 4 ≈ 128kbps VBR — small + clear)
  if ffmpeg -y -f concat -safe 0 -i "$mp3_list" \
      -codec:a libmp3lame -qscale:a 4 "$file" </dev/null >/dev/null 2>&1 \
      && [[ -s "$file" ]]; then
    echo "  ✅  $(basename "$file") ($(wc -c <"$file" | tr -d ' ') bytes, ${n_chunks} chunk$([[ $n_chunks -gt 1 ]] && echo s))"
    (( DONE++ )) || true
  else
    echo "  ❌  ffmpeg merge failed: $(basename "$file")"
    rm -f "$file"
  fi

  rm -rf "$wav_dir" "$mp3_list"
  sleep 0.4  # rate-limit courtesy
}

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Moksha Patam — Hindi Voices via Sarvam (Bulbul v3)    ║"
echo "║   Expected: 40 files — gurus/temples/sacred path        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# GROUP A: 8 Guru Intros — voice rotation (varun/kabir/gokul/mani)
# ═══════════════════════════════════════════════════════════════════════════
echo "── गुरु परिचय · 8 files ──"
mkdir -p public/guru-voices

# Guru → voice mapping via case (portable to bash 3.2 on macOS,
# where `declare -A` associative arrays are not supported).
guru_voice() {
  case "$1" in
    chanakya|varahamihira)  echo "varun" ;;   # dramatic authority
    patanjali|aryabhata)    echo "kabir" ;;   # meditative wisdom
    bhaskara|charaka)       echo "gokul" ;;   # warm teacher
    sushruta|panini)        echo "mani"  ;;   # precise priest
    *)                      echo "varun" ;;   # fallback
  esac
}

for id in chanakya varahamihira patanjali aryabhata bhaskara charaka sushruta panini; do
  text=$(jval "$GURUS_JSON" "${id}_intro")
  voice=$(guru_voice "$id")
  echo "  🎙  $id → $voice"
  sarvam_tts "public/guru-voices/${id}-hi.mp3" "$voice" "$text"
done

# ═══════════════════════════════════════════════════════════════════════════
# GROUP B: 8 Guru Blessings — same voice per guru for identity continuity
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── गुरु आशीर्वाद · 8 files ──"
for id in chanakya varahamihira patanjali aryabhata bhaskara charaka sushruta panini; do
  text=$(jval "$GURUS_JSON" "${id}_blessingDesc")
  voice=$(guru_voice "$id")
  echo "  🎙  $id blessing → $voice"
  # Blessings are warmer/slower — pace 0.80
  sarvam_tts "public/guru-voices/${id}-blessing-hi.mp3" "$voice" "$text" "0.80"
done

# ═══════════════════════════════════════════════════════════════════════════
# GROUP C: 9 Temple Lore — varun (Amitabh-style) throughout for gravitas
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── मंदिर कथा · 9 files (varun / Amitabh style) ──"
mkdir -p public/temple-voices
for key in krishi vaidya shilpa ganita kala shabda jyotish darshan rajniti; do
  text=$(jval "$TEMPLES_JSON" "${key}_lore")
  # Temple lore: slower, deeper for reverence (pitch -0.1, pace 0.78)
  sarvam_tts "public/temple-voices/${key}-hi.mp3" "varun" "$text" "0.78" "-0.1"
done

# ═══════════════════════════════════════════════════════════════════════════
# GROUP D: 8 Sacred Path Steps — varun (same narrator as temples for consistency)
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── पवित्र मार्ग · 8 files ──"
mkdir -p public/sacred-voices
STEP_NAMES=("yama" "niyama" "asana" "pranayama" "pratyahara" "dharana" "dhyana" "moksha")
for i in "${!STEP_NAMES[@]}"; do
  name="${STEP_NAMES[$i]}"
  text=$(jval "$SACRED_JSON" "${name}_lore")
  sarvam_tts "public/sacred-voices/step${i}-hi.mp3" "varun" "$text" "0.80"
done

# ═══════════════════════════════════════════════════════════════════════════
# GROUP E: 7 Sacred Path Correct Answers — kabir (teacher/guide register)
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── पवित्र मार्ग सही उत्तर · 7 files ──"
STEP_SKT=("यम" "नियम" "आसन" "प्राणायाम" "प्रत्याहार" "धारणा" "ध्यान")
STEP_EN=("Yama" "Niyama" "Asana" "Pranayama" "Pratyahara" "Dharana" "Dhyana")
for i in 0 1 2 3 4 5 6; do
  text="सही उत्तर। ${STEP_SKT[$i]} पूर्ण। ${STEP_EN[$i]}। पवित्र मार्ग पर कदम $(( i + 1 ))।"
  sarvam_tts "public/sacred-voices/correct${i}-hi.mp3" "kabir" "$text" "0.90"
done

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Total: $TOTAL  |  Generated: $DONE  |  Skipped: $SKIP"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Done. Next steps:"
echo "  1. Listen in public/guru-voices/, public/temple-voices/, public/sacred-voices/"
echo "  2. If any voice sounds wrong, delete that MP3 and re-run this script"
echo "  3. npx cap sync android → rebuild release APK"
