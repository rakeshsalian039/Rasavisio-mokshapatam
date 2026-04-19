#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Moksha Patam 108 — Game Voice Generator (ElevenLabs Multilingual v2)
#
# Regenerates all in-game Hindi audio — navagraha effects, snake/ladder,
# shields, moksha, Ashtanga Marga steps, and all Chitragupta fragments.
# Chitragupta files get the app's reverb+bowl processing chain on top;
# Yama files get the Thanos chain. Raw voice = Shivank S throughout so the
# Hindi pronunciation is native and the delivery is cinematic.
#
# Voice assignments:
#   SHIVANK — Scriptures & Mythology voice → everything
#     (per-category voice_settings tune the tonal feel: dramatic for grahas,
#      reverent for Ashtanga, measured for Chitragupta, urgent for events)
#
# Usage:
#   export ELEVENLABS_API_KEY="..."
#   bash generate-game-voices-elevenlabs.sh
#
# Re-run safe: existing non-empty files are skipped. To regenerate a
# specific file, delete it first.
#
# Total: 34 Hindi files
#   9 navagraha + 5 game events + 7 Ashtanga + 13 Chitragupta = 34
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

API_KEY="${ELEVENLABS_API_KEY:?Please set ELEVENLABS_API_KEY}"
OUT_DIR="${1:-./public/game-voices}"
TOTAL=0; DONE=0; SKIP=0

SHIVANK="3zfVMgyQmfzZpm8pYvD2"  # Scriptures & Mythology narrator

mkdir -p "$OUT_DIR"
command -v python3 >/dev/null || { echo "❌ python3 required"; exit 1; }
command -v curl    >/dev/null || { echo "❌ curl required";    exit 1; }

# ─── Core TTS call ──────────────────────────────────────────────────────────
# Args: $1=file  $2=voice_id  $3=text  [$4=stability] [$5=similarity] [$6=style]
elevenlabs_tts() {
  local file="$1" voice_id="$2" text="$3"
  local stability="${4:-0.70}" similarity="${5:-0.85}" style="${6:-0.30}"
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

# ─── Tuning presets (chosen for how the text FEELS in game context) ─────────
# Format: stability similarity style
GRAHA_TUNE="0.70 0.88 0.40"      # dramatic planetary announcement
EVENT_TUNE="0.65 0.85 0.40"      # urgent consequence (snake bite, ladder rise)
ASHTANGA_TUNE="0.75 0.88 0.30"   # reverent sacred-path narration
CG_TUNE="0.80 0.90 0.15"         # calm measured scribe (app adds reverb+bowl)
CG_LONG_TUNE="0.78 0.90 0.20"    # longer Chitragupta passages — slightly more expression

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Moksha Patam — Game Voices (ElevenLabs / Shivank S)   ║"
echo "║   34 Hindi files · ~6K chars · ~\$0.50 in credits        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# NAVAGRAHA EFFECTS — 9 files
# ═══════════════════════════════════════════════════════════════════════════
echo "── नवग्रह प्रभाव · 9 files ──"

elevenlabs_tts "$OUT_DIR/graha-sun-hi.mp3" "$SHIVANK" \
  "सूर्य! ग्रहों का राजा तुम्हारे मार्ग को प्रकाशित करता है। तुम्हें दो अतिरिक्त कदम मिलते हैं। ब्रह्मांड की शक्ति से आगे बढ़ो।" \
  $GRAHA_TUNE

elevenlabs_tts "$OUT_DIR/graha-moon-hi.mp3" "$SHIVANK" \
  "चन्द्र! चंद्रमा की कृपा तुम्हारी आत्मा को शुद्ध करती है। तुम्हें एक पुण्य मिलता है। तुम्हारा कर्म हल्का होता है।" \
  $GRAHA_TUNE

elevenlabs_tts "$OUT_DIR/graha-mars-hi.mp3" "$SHIVANK" \
  "मंगल! योद्धा ग्रह तुम्हें क्रोध से भर देता है। तुम्हारा निकटतम प्रतिद्वंद्वी तीन खाने पीछे जाता है। लेकिन हिंसा का एक कार्मिक मूल्य है — एक पाप।" \
  $GRAHA_TUNE

elevenlabs_tts "$OUT_DIR/graha-mercury-hi.mp3" "$SHIVANK" \
  "बुध! चालाक ग्रह भाग्य को पलट देता है। तुम्हारी स्थिति निकटतम साधक से बदल जाती है। एक पल में भाग्य बदल जाता है।" \
  $GRAHA_TUNE

elevenlabs_tts "$OUT_DIR/graha-jupiter-hi.mp3" "$SHIVANK" \
  "बृहस्पति! दिव्य गुरु पट पर सभी साधकों को आशीर्वाद देता है। पवित्र मार्ग से नीचे सभी को एक पुण्य मिलता है। ब्रह्मांड सबका भला करता है।" \
  $GRAHA_TUNE

elevenlabs_tts "$OUT_DIR/graha-venus-hi.mp3" "$SHIVANK" \
  "शुक्र! असुरों के गुरु तुम्हें एक दिव्य कवच प्रदान करते हैं। अगला सांप जो तुम्हें काटेगा उसका विष निष्प्रभावी हो जाएगा। यह कवच केवल एक बार काम करता है।" \
  $GRAHA_TUNE

elevenlabs_tts "$OUT_DIR/graha-saturn-hi.mp3" "$SHIVANK" \
  "शनि! कर्म के स्वामी की भयंकर दृष्टि तुम पर पड़ती है। तुम तीन खाने पीछे जाते हो और एक पाप मिलता है। शनि के न्याय से कोई नहीं बच सकता।" \
  $GRAHA_TUNE

elevenlabs_tts "$OUT_DIR/graha-rahu-hi.mp3" "$SHIVANK" \
  "राहु! ब्रह्मांडीय धोखेबाज़ प्रहार करता है। नेता का एक पुण्य चुराकर सबसे कमज़ोर साधक को दिया जाता है। छाया सबको बराबर करती है।" \
  $GRAHA_TUNE

elevenlabs_tts "$OUT_DIR/graha-ketu-hi.mp3" "$SHIVANK" \
  "केतु! हर साधक का दिव्य कवच छीन लिया जाता है। और मोक्ष के सबसे करीब वाले को एक पुण्य मिलता है। केतु एक ही सांस में देता और लेता है।" \
  $GRAHA_TUNE

# ═══════════════════════════════════════════════════════════════════════════
# GAME EVENTS — 5 files (snake, ladder, shield, moksha, karma-win)
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── खेल घटनाएँ · 5 files ──"

elevenlabs_tts "$OUT_DIR/snake-hit-hi.mp3" "$SHIVANK" \
  "सांप ने काटा! तुम गहराइयों में खिंच जाते हो। दुर्गुण आत्मा को खा जाता है। दो पाप तुम्हारे कर्म में जुड़ते हैं। उठो, साधक।" \
  $EVENT_TUNE

elevenlabs_tts "$OUT_DIR/ladder-rise-hi.mp3" "$SHIVANK" \
  "गुण तुम्हें उठाता है! पवित्र सीढ़ी तुम्हारी आत्मा को ऊपर ले जाती है। एक पुण्य तुम्हारे कर्म में जुड़ता है। मोक्ष का मार्ग छोटा होता है।" \
  $EVENT_TUNE

elevenlabs_tts "$OUT_DIR/shield-save-hi.mp3" "$SHIVANK" \
  "तुम्हारा कवच बचाता है! शुक्र की दिव्य रक्षा ने सांप का विष सोख लिया। कवच अब चला गया। तुम अक्षत खड़े हो — लेकिन असुरक्षित।" \
  $EVENT_TUNE

elevenlabs_tts "$OUT_DIR/moksha-gate-hi.mp3" "$SHIVANK" \
  "मोक्ष! तुम एक सौ आठवें खाने पर पहुंच गए। संसार का चक्र समाप्त होता है। तुम्हारी आत्मा शुद्ध है। मुक्ति तुम्हारी है।" \
  "0.70" "0.88" "0.45"   # extra dramatic for the win moment

elevenlabs_tts "$OUT_DIR/karma-win-hi.mp3" "$SHIVANK" \
  "कर्म विजय! तीस पुण्य इकट्ठे हो गए। पट तुम्हारे नीचे से विलीन हो जाता है। सच्ची शुद्ध आत्मा किसी भी खाने से मुक्त हो सकती है। तुरंत मोक्ष।" \
  "0.70" "0.88" "0.45"

# ═══════════════════════════════════════════════════════════════════════════
# ASHTANGA MARGA — 7 sacred steps
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── अष्टांग मार्ग · 7 files ──"

elevenlabs_tts "$OUT_DIR/ashtanga-1-hi.mp3" "$SHIVANK" \
  "तुमने अष्टांग मार्ग में प्रवेश किया है — पतंजलि का आठ-सूत्री पवित्र मार्ग। अब हर बारी केवल एक कदम चलते हो। हर कदम तुम्हारी आत्मा की परीक्षा है। कोई पासे का शॉर्टकट नहीं। केवल धर्म। पहला कदम: यम। आत्म-संयम।" \
  $ASHTANGA_TUNE

elevenlabs_tts "$OUT_DIR/ashtanga-2-hi.mp3" "$SHIVANK" \
  "पवित्र मार्ग पर दूसरा कदम। नियम। अनुशासन। जो आत्मा खुद को अनुशासित नहीं कर सकती, वह ऊपर नहीं जा सकती। तुम्हारे ज्ञान की परीक्षा सामने है।" \
  $ASHTANGA_TUNE

elevenlabs_tts "$OUT_DIR/ashtanga-3-hi.mp3" "$SHIVANK" \
  "पवित्र मार्ग पर तीसरा कदम। आसन। स्थिरता। शरीर आत्मा का मंदिर है। पात्र को स्थिर करो, और आत्मा ऊपर उठती है। तुम्हारे ज्ञान की परीक्षा सामने है।" \
  $ASHTANGA_TUNE

elevenlabs_tts "$OUT_DIR/ashtanga-4-hi.mp3" "$SHIVANK" \
  "पवित्र मार्ग पर चौथा कदम। प्राणायाम। जीवन-शक्ति का विस्तार। श्वास शरीर और आत्मा के बीच का सेतु है। श्वास पर नियंत्रण, अस्तित्व पर नियंत्रण। तुम्हारे ज्ञान की परीक्षा सामने है।" \
  $ASHTANGA_TUNE

elevenlabs_tts "$OUT_DIR/ashtanga-5-hi.mp3" "$SHIVANK" \
  "पवित्र मार्ग पर पांचवां कदम। प्रत्याहार। इंद्रियों का निग्रह। दुनिया बुलाती है, लेकिन आत्मा को अंतर्मुखी होना होगा। शोर को शांत करो। तुम्हारे ज्ञान की परीक्षा सामने है।" \
  $ASHTANGA_TUNE

elevenlabs_tts "$OUT_DIR/ashtanga-6-hi.mp3" "$SHIVANK" \
  "पवित्र मार्ग पर छठा कदम। धारणा। एकाग्रता। चेतना की लेज़र। इसे सत्य पर केंद्रित करो। तुम्हारे ज्ञान की परीक्षा सामने है।" \
  $ASHTANGA_TUNE

elevenlabs_tts "$OUT_DIR/ashtanga-7-hi.mp3" "$SHIVANK" \
  "अंतिम कदम। ध्यान। गहरी समाधि। इस परीक्षा के बाद, मोक्ष में प्रवेश के लिए सटीक एक पासा फेंकना होगा। यहाँ पासे का महत्व नहीं। केवल तुम्हारे समर्पण की शुद्धता। सातवां कदम, सातवें में से।" \
  $ASHTANGA_TUNE

# ═══════════════════════════════════════════════════════════════════════════
# CHITRAGUPTA — 13 fragments
# App applies reverb convolver + 528Hz bowl oscillator on top in the
# Web Audio chain (MokshaGame.jsx speakChitragupta), so this raw voice
# should be calm + measured. The processing adds the mysticism.
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo "── चित्रगुप्त · 13 files (reverb+bowl applied in-app) ──"

elevenlabs_tts "$OUT_DIR/cg-open-hi.mp3" "$SHIVANK" \
  "मैं चित्रगुप्त हूँ। यमराज का दिव्य लेखक। जब से पहली आत्मा ने श्वास लिया, मैं अभिलेख रखता आया हूँ। हर विचार। हर कर्म। पुण्य की हर फुसफुसाहट और पाप की हर छाया। आज मैं अग्रसंधानी में नया पृष्ठ खोलता हूँ। खेल आरंभ हो। मैं देख रहा हूँ।" \
  $CG_LONG_TUNE

elevenlabs_tts "$OUT_DIR/cg-punya-hi.mp3" "$SHIVANK" \
  "दर्ज। पुण्य अंकित। खाता हल्का होता है।" \
  $CG_TUNE

elevenlabs_tts "$OUT_DIR/cg-papa-hi.mp3" "$SHIVANK" \
  "दर्ज। पाप अंकित। बिना निर्णय के। खाता केवल सत्य देखता है।" \
  $CG_TUNE

elevenlabs_tts "$OUT_DIR/cg-snake-hi.mp3" "$SHIVANK" \
  "दर्ज किया गया। दो पाप। दुर्गुण का सांप अपना मूल्य लेता है। खाता न्याय नहीं करता — केवल सत्य लिखता है।" \
  $CG_TUNE

elevenlabs_tts "$OUT_DIR/cg-ladder-hi.mp3" "$SHIVANK" \
  "दर्ज किया गया। एक पुण्य। करुणा का गुण अनदेखा नहीं जाता। खाता हल्का होता है।" \
  $CG_TUNE

elevenlabs_tts "$OUT_DIR/cg-dharmap-hi.mp3" "$SHIVANK" \
  "धर्मिक चुनाव। पुण्य पवित्र खाते में दर्ज किया गया। जानो कि हर धर्मिक कार्य, चाहे कितना भी कठिन हो, सोने में लिखा जाता है।" \
  $CG_TUNE

elevenlabs_tts "$OUT_DIR/cg-dharmapap-hi.mp3" "$SHIVANK" \
  "निर्णय के बिना दर्ज किया गया। पाप खाते में लिखा गया। पुस्तक कभी नहीं भूलती। लेकिन निंदा भी नहीं करती। केवल यमराज अंतिम गणना पढ़ते हैं।" \
  $CG_TUNE

elevenlabs_tts "$OUT_DIR/cg-sacred-hi.mp3" "$SHIVANK" \
  "अष्टांग मार्ग। मैं इस प्रविष्टि को लिखने की प्रतीक्षा कर रहा था। इस बिंदु से, मैं हर कदम पर विशेष ध्यान देता हूँ। पवित्र मार्ग वह है जहाँ आत्माएं प्रकट करती हैं कि वे वास्तव में क्या हैं।" \
  $CG_LONG_TUNE

elevenlabs_tts "$OUT_DIR/cg-moksha-hi.mp3" "$SHIVANK" \
  "पृष्ठ पूर्ण हुआ। मैं मुहर लगाता हूँ। इन युगों में जो मैंने अभिलेख रखा है, बहुत कम पृष्ठ इस तरह समाप्त होते हैं। जाओ। तुम मुक्त हो।" \
  $CG_LONG_TUNE

elevenlabs_tts "$OUT_DIR/cg-reject-hi.mp3" "$SHIVANK" \
  "खाता स्पष्ट बोलता है। पाप, पुण्य से अधिक है। जो लिखा है उसे मैं नहीं बदल सकता। अशुद्ध आत्मा के लिए द्वार नहीं खुल सकता। लौटो। शुद्ध हो। फिर प्रयास करो।" \
  $CG_TUNE

elevenlabs_tts "$OUT_DIR/cg-balance-hi.mp3" "$SHIVANK" \
  "मैं इसे ध्यान से नोट करता हूँ। तुम्हारे पुण्य और पाप लगभग बराबर हैं। मोक्ष का द्वार देख रहा है। इन अगले क्षणों में तुम जो करोगे, वह सब कुछ तय करेगा।" \
  $CG_TUNE

elevenlabs_tts "$OUT_DIR/cg-seeker-hi.mp3" "$SHIVANK" \
  "मैंने हर उस साधक को देखा है जो इस पट पर चला है। अपनी पहचान बुद्धिमानी से चुनो। तुम जो पात्र चुनते हो, वह उस कर्म को आकार देता है जो तुम वहन करोगे।" \
  $CG_TUNE

elevenlabs_tts "$OUT_DIR/cg-judgment-hi.mp3" "$SHIVANK" \
  "खेल समाप्त हुआ। अग्रसंधानी बंद करता हूँ। जो शुद्ध था, मुक्त हुआ। जो शेष हैं — खाता पहले ही पढ़ा जा चुका है। यमराज के पास हिसाब है। जैसा हमेशा होता है।" \
  $CG_LONG_TUNE

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Total: $TOTAL  |  Generated: $DONE  |  Skipped: $SKIP"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Sample audit:"
echo "  afplay public/game-voices/graha-sun-hi.mp3       # Surya blaze"
echo "  afplay public/game-voices/graha-saturn-hi.mp3    # Shani dread"
echo "  afplay public/game-voices/cg-open-hi.mp3         # Chitragupta intro (reverb-less raw)"
echo "  afplay public/game-voices/moksha-gate-hi.mp3     # Final liberation"
echo ""
echo "Chitragupta files will sound MORE mystical in-game — the app"
echo "applies a reverb convolver + 528Hz bowl oscillator on top."
