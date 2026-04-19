#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Moksha Patam 108 — Mangalacharan Shloka Voice Generator (Sarvam / Bulbul v3)
#
# Regenerates 20 Sanskrit shloka MP3s + 2 "begin" files with native-sounding
# Sarvam voices that pronounce Devanagari correctly.
#
# Voice plan:
#   mani    — priestly male chanting (17 shlokas — default)
#   manisha — female rishika (3 shlokas — variety touch)
#               id 11: असतो मा सद्गमय (Brihadaranyaka)
#               id 17: वसुधैव कुटुम्बकम् (Maha Upanishad)
#               id 19: ॐ सह नाववतु Shanti Mantra (Taittiriya)
#   varun   — deep Hindi narrator for the 2 "begin" files
#
# Usage:
#   export SARVAM_API_KEY="..."
#   bash generate-shloka-voices-sarvam.sh
#
# Re-run safe: existing non-empty files are skipped.
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

API_KEY="${SARVAM_API_KEY:?Please set SARVAM_API_KEY}"
OUT_DIR="./public/shlokas"
TOTAL=0; DONE=0; SKIP=0

mkdir -p "$OUT_DIR"

command -v ffmpeg  >/dev/null || { echo "❌ ffmpeg required. brew install ffmpeg"; exit 1; }
command -v python3 >/dev/null || { echo "❌ python3 required"; exit 1; }

# ─── Core TTS (same pattern as generate-hindi-voices-sarvam.sh) ─────────────
# Bulbul v3 dropped pitch + loudness params — tone comes from speaker choice.
sarvam_tts() {
  local file="$1" speaker="$2" text="$3"
  local pace="${4:-0.72}"   # shlokas: very slow by default
  # 5th arg (pitch) silently ignored for backward compat
  (( TOTAL++ )) || true

  if [[ -f "$file" && -s "$file" ]]; then
    echo "  ⏭  SKIP: $(basename "$file")"
    (( SKIP++ )) || true
    return 0
  fi

  local wav_dir mp3_list
  wav_dir=$(mktemp -d)
  mp3_list=$(mktemp)

  local n_chunks
  n_chunks=$(python3 - "$API_KEY" "$speaker" "$text" "$wav_dir" "$pace" <<'PYEOF'
import sys, json, base64, urllib.request, urllib.error, re, os
key, speaker, text, outdir, pace = sys.argv[1:6]
pace = float(pace)

# Shlokas break on ॥ (double danda) or । (single danda) or newline — chunk long ones
parts = re.split(r'(?<=[॥।.!?])\s+|\n', text.strip())
parts = [p for p in parts if p.strip()]
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
        # Sanskrit uses the Hindi voice/lang since Devanagari script overlaps.
        # Sarvam doesn't have a dedicated "sa-IN" — hi-IN handles it best.
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
        print(f"[SARVAM ERROR {e.code}] chunk {i+1}/{len(chunks)}: {e.read().decode('utf-8', errors='replace')}", file=sys.stderr)
        sys.exit(2)
    except Exception as e:
        print(f"[SARVAM ERROR] chunk {i+1}/{len(chunks)}: {e}", file=sys.stderr)
        sys.exit(2)

    audios = payload.get("audios") or []
    if not audios:
        print(f"[SARVAM] empty audios on chunk {i+1}: {payload}", file=sys.stderr)
        sys.exit(2)

    with open(os.path.join(outdir, f"{i:03d}.wav"), "wb") as f:
        f.write(base64.b64decode(audios[0]))

print(len(chunks))
PYEOF
)
  local py_exit=$?

  if [[ $py_exit -ne 0 ]]; then
    echo "  ❌  Sarvam API failed"
    rm -rf "$wav_dir" "$mp3_list"
    return 1
  fi

  for w in "$wav_dir"/*.wav; do
    echo "file '${w}'" >> "$mp3_list"
  done

  if ffmpeg -y -f concat -safe 0 -i "$mp3_list" \
      -codec:a libmp3lame -qscale:a 4 "$file" </dev/null >/dev/null 2>&1 \
      && [[ -s "$file" ]]; then
    echo "  ✅  $(basename "$file") ($(wc -c <"$file" | tr -d ' ') bytes)"
    (( DONE++ )) || true
  else
    echo "  ❌  ffmpeg merge failed: $(basename "$file")"
    rm -f "$file"
  fi

  rm -rf "$wav_dir" "$mp3_list"
  sleep 0.4
}

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Moksha Patam — Shlokas via Sarvam (Bulbul v3)         ║"
echo "║   20 Sanskrit + 2 'begin' files                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ─── Extract the 20 shlokas from src/data/mangalacharan.js and emit JSON lines ─
echo "── मंगलाचरण शिलोक · 20 files ──"
python3 -c "
import re, json, sys
with open('src/data/mangalacharan.js','r') as f:
    content = f.read()
# The source uses single-quoted multi-line strings
shlokas = re.findall(r\"shloka:\s*'(.*?)'\", content, re.DOTALL)
for i, s in enumerate(shlokas[:20]):
    s = s.replace('\\\\n', ' ').replace(\"\\\\\'\", \"'\").strip()
    print(json.dumps({'id': i, 'text': s}))
" | while read -r line; do
  idx=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['id'])" "$line")
  text=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['text'])" "$line")

  # Pick voice: 3 shlokas get female (manisha) for variety, rest male (mani)
  case "$idx" in
    11|17|19) voice="manisha" ;;
    *)        voice="mani" ;;
  esac

  sarvam_tts "$OUT_DIR/shloka-${idx}.mp3" "$voice" "$text" "0.72"
done

# ─── "Begin" calls — deep dramatic announcement before game starts ──────────
echo ""
echo "── आरम्भ / BEGIN · 2 files ──"

# EN file — use mani (works reasonably for English too) or use English script
# Actually: Sarvam Hindi-only; for English "begin" we keep the existing
# OpenAI-generated file. Delete begin-en.mp3 only if you want to regenerate it.
if [[ -f "$OUT_DIR/begin-en.mp3" ]]; then
  echo "  ⏭  KEEP: begin-en.mp3 (OpenAI-generated English — Sarvam is Hindi-first)"
else
  echo "  ⚠   begin-en.mp3 missing — please regenerate with generate-shloka-voices.sh (OpenAI)"
fi

# HI file — varun for deep Hindi announcer
sarvam_tts "$OUT_DIR/begin-hi.mp3" "varun" \
  "पासे तैयार हैं। पट प्रतीक्षा कर रहा है। खेल आरम्भ हो।" "0.75" "-0.1"

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Total: $TOTAL  |  Generated: $DONE  |  Skipped: $SKIP"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Done. Sample files to audit first:"
echo "  afplay public/shlokas/shloka-0.mp3       # Gita 2.47 (mani)"
echo "  afplay public/shlokas/shloka-11.mp3      # Asato Ma (manisha — female)"
echo "  afplay public/shlokas/shloka-19.mp3      # Shanti Mantra (manisha)"
echo "  afplay public/shlokas/begin-hi.mp3       # Hindi announce (varun)"
