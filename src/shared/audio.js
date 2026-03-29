// ─────────────────────────────────────────────────────────────────────────────
// shared/audio.js
// AudioCache (IndexedDB TTS cache), VoiceEngine (Chitragupta, Yama, Narrator),
// STATIC_VOICES, GRAHA_STATIC_KEY, CG_LINES, CG_STATIC, CG_ENTRY_TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const AudioCache = {
  cache: {},    // in-memory session cache: key → blob URL
  loading: {},  // in-flight promises

  // ── IndexedDB layer ──────────────────────────────────────────
  _db: null,
  async _getDB() {
    if (this._db) return this._db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('mp108_voice_cache_v1', 1);
      req.onupgradeneeded = e => {
        e.target.result.createObjectStore('voices');
      };
      req.onsuccess = e => { this._db = e.target.result; resolve(this._db); };
      req.onerror  = () => reject(req.error);
    });
  },
  async _dbGet(dbKey) {
    try {
      const db = await this._getDB();
      return new Promise(resolve => {
        const tx  = db.transaction('voices', 'readonly');
        const req = tx.objectStore('voices').get(dbKey);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror   = () => resolve(null);
      });
    } catch(e) { return null; }
  },
  async _dbSet(dbKey, arrayBuffer) {
    try {
      const db = await this._getDB();
      return new Promise(resolve => {
        const tx = db.transaction('voices', 'readwrite');
        tx.objectStore('voices').put(arrayBuffer, dbKey);
        tx.oncomplete = resolve;
        tx.onerror    = resolve; // never fail silently
      });
    } catch(e) {}
  },
  // ─────────────────────────────────────────────────────────────

  _key(text)            { return text.slice(0, 80); },
  _dbKey(text, lang)    { return `${lang||'en'}::${text.slice(0, 120)}`; },

  async fetchTTS(text, lang, voiceOverride, instructionOverride) {
    const key   = this._key(text);
    const dbKey = this._dbKey(text, lang);

    // 1. In-memory hit (fastest)
    if (this.cache[key])   return this.cache[key];
    if (this.loading[key]) return this.loading[key];

    const promise = (async () => {
      // 2. IndexedDB hit — no OpenAI call, no charge
      const stored = await this._dbGet(dbKey);
      if (stored) {
        const blob = new Blob([stored], { type: 'audio/mpeg' });
        const url  = URL.createObjectURL(blob);
        this.cache[key] = url;
        console.log('[AudioCache] IndexedDB hit:', key.slice(0,40));
        return url;
      }

      // 3. Fetch from OpenAI TTS (only on first use, then cached forever)
      const isHi = lang === 'hi';
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceOverride || 'ash',
          instructions: instructionOverride || (isHi
            ? 'You are an ancient Indian storyteller narrating in Hindi. Speak slowly, mysteriously, with deep emotion. Pause dramatically between sentences.'
            : 'You are an ancient Indian sage narrating a sacred epic in English. Speak slowly, with deep gravitas and reverence. Pause dramatically between sentences.')
        }),
      });
      if (!resp.ok) throw new Error('TTS API failed: ' + resp.status);

      const arrayBuffer = await resp.arrayBuffer();
      // Store in IndexedDB — all future loads are free
      await this._dbSet(dbKey, arrayBuffer);
      console.log('[AudioCache] Fetched & cached:', key.slice(0,40));

      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url  = URL.createObjectURL(blob);
      this.cache[key] = url;
      delete this.loading[key];
      return url;
    })().catch(e => {
      delete this.loading[key];
      console.warn('[AudioCache] fetchTTS failed:', e.message);
      return null;
    });

    this.loading[key] = promise;
    return promise;
  },

  get(text) { return this.cache[this._key(text)] || null; },

  // Returns count of entries cached in IndexedDB
  async countCached() {
    try {
      const db = await this._getDB();
      return new Promise(resolve => {
        const tx  = db.transaction('voices', 'readonly');
        const req = tx.objectStore('voices').count();
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => resolve(0);
      });
    } catch(e) { return 0; }
  },

  preloadAll(lang) {
    const texts = [];
    STORY_PAGES.forEach(p => texts.push({ text: p[lang], lang }));
    CHARS.forEach(c => texts.push({ text: lang === 'hi' ? c.voiceHi : c.voiceEn, lang }));
    let done = 0;
    const total = texts.length;
    const progress = () => Math.round((done / total) * 100);
    return {
      promise: Promise.all(texts.map(t => this.fetchTTS(t.text, t.lang).then(() => { done++; }))),
      progress, total,
    };
  },

  // Preload Yama intro + all character voices for instant playback
  preloadGameVoices(lang) {
    const yamaEn='So, you dare to challenge me? I am Yama. The God of Death. I ride the great buffalo through the realm of the dead. Every soul that walks this board eventually comes to me. You think you can outwit Death? I have watched a million souls fall. Brave warriors. Wise sages. They all fell. And I devoured their karma. Play your little game, mortal. I will be watching every single move. And when your karma falters, I will be there. Now tell me, little soul. Who are you?';
    const yamaHi='तो, तुम मुझसे खेलना चाहते हो? मैं यमराज हूँ। मृत्यु का देवता। मैं महान भैंसे पर सवार होकर मृतकों के लोक से गुज़रता हूँ। हर आत्मा जो इस पट पर चलती है, अंत में मेरे पास आती है। मैंने लाखों आत्माओं को गिरते देखा है। वीर योद्धा। ज्ञानी ऋषि। सब गिरे। और मैंने उनका कर्म निगल लिया। खेलो अपना छोटा सा खेल, नश्वर प्राणी। मैं देख रहा हूँ। हर एक कदम। अब बताओ, छोटी सी आत्मा। तुम कौन हो?';
    const yamaVoice='onyx';
    const yamaInstructions='Speak like Thanos — an impossibly deep, heavy, rumbling bass voice that vibrates through the chest. Extremely slow and deliberate. Each word lands like a boulder. Long pauses between sentences. Absolute calm confidence of someone who has already won. No emotion, no anger — just cold, inevitable, cosmic authority. The voice of someone who has existed for billions of years and knows exactly how this ends. Whisper certain words for emphasis. This is not a villain — this is a force of nature speaking.';
    const texts = [];
    // Yama gets onyx voice with scary instructions
    texts.push({ text: lang === 'hi' ? yamaHi : yamaEn, lang, voice: yamaVoice, instructions: yamaInstructions });
    // Characters get normal ash voice
    CHARS.forEach(c => texts.push({ text: lang === 'hi' ? c.voiceHi : c.voiceEn, lang }));
    let done = 0;
    const total = texts.length;
    const progress = () => Math.round((done / total) * 100);
    return {
      promise: Promise.all(texts.map(t => this.fetchTTS(t.text, t.lang, t.voice, t.instructions).then(() => { done++; }))),
      progress, total,
    };
  },

  clear() {
    Object.values(this.cache).forEach(url => { try { URL.revokeObjectURL(url); } catch(e){} });
    this.cache = {};
    this.loading = {};
  },

  count() { return Object.keys(this.cache).length; },
};

/* ═══ STATIC VOICE FILES — zero API cost ═══ */
export const STATIC_VOICES = {
  yama: { en: '/yama-en.mp3', hi: '/yama-hi.mp3' },
  warrior: { en: '/char-warrior-en.mp3', hi: '/char-warrior-hi.mp3' },
  sage: { en: '/char-sage-en.mp3', hi: '/char-sage-hi.mp3' },
  healer: { en: '/char-healer-en.mp3', hi: '/char-healer-hi.mp3' },
  dancer: { en: '/char-dancer-en.mp3', hi: '/char-dancer-hi.mp3' },
  merchant: { en: '/char-merchant-en.mp3', hi: '/char-merchant-hi.mp3' },
  ascetic: { en: '/char-ascetic-en.mp3', hi: '/char-ascetic-hi.mp3' },
  // ── Graha effects (9 planets × 2 languages = 18 files) ──
  // Generate with: bash generate-game-voices.sh
  graha_sun:     { en: '/game-voices/graha-sun-en.mp3',     hi: '/game-voices/graha-sun-hi.mp3' },
  graha_moon:    { en: '/game-voices/graha-moon-en.mp3',    hi: '/game-voices/graha-moon-hi.mp3' },
  graha_mars:    { en: '/game-voices/graha-mars-en.mp3',    hi: '/game-voices/graha-mars-hi.mp3' },
  graha_mercury: { en: '/game-voices/graha-mercury-en.mp3', hi: '/game-voices/graha-mercury-hi.mp3' },
  graha_jupiter: { en: '/game-voices/graha-jupiter-en.mp3', hi: '/game-voices/graha-jupiter-hi.mp3' },
  graha_venus:   { en: '/game-voices/graha-venus-en.mp3',   hi: '/game-voices/graha-venus-hi.mp3' },
  graha_saturn:  { en: '/game-voices/graha-saturn-en.mp3',  hi: '/game-voices/graha-saturn-hi.mp3' },
  graha_rahu:    { en: '/game-voices/graha-rahu-en.mp3',    hi: '/game-voices/graha-rahu-hi.mp3' },
  graha_ketu:    { en: '/game-voices/graha-ketu-en.mp3',    hi: '/game-voices/graha-ketu-hi.mp3' },
  // ── Snake & ladder reactions ──
  snake_hit:   { en: '/game-voices/snake-hit-en.mp3',   hi: '/game-voices/snake-hit-hi.mp3' },
  ladder_rise: { en: '/game-voices/ladder-rise-en.mp3', hi: '/game-voices/ladder-rise-hi.mp3' },
  moksha_gate: { en: '/game-voices/moksha-gate-en.mp3', hi: '/game-voices/moksha-gate-hi.mp3' },
  karma_win:   { en: '/game-voices/karma-win-en.mp3',   hi: '/game-voices/karma-win-hi.mp3' },
  shield_save: { en: '/game-voices/shield-save-en.mp3', hi: '/game-voices/shield-save-hi.mp3' },
  // ── Ashtanga Marga step intros (7 steps × 2 langs = 14 files) ──
  ashtanga_step_1: { en: '/game-voices/ashtanga-1-en.mp3', hi: '/game-voices/ashtanga-1-hi.mp3' },
  ashtanga_step_2: { en: '/game-voices/ashtanga-2-en.mp3', hi: '/game-voices/ashtanga-2-hi.mp3' },
  ashtanga_step_3: { en: '/game-voices/ashtanga-3-en.mp3', hi: '/game-voices/ashtanga-3-hi.mp3' },
  ashtanga_step_4: { en: '/game-voices/ashtanga-4-en.mp3', hi: '/game-voices/ashtanga-4-hi.mp3' },
  ashtanga_step_5: { en: '/game-voices/ashtanga-5-en.mp3', hi: '/game-voices/ashtanga-5-hi.mp3' },
  ashtanga_step_6: { en: '/game-voices/ashtanga-6-en.mp3', hi: '/game-voices/ashtanga-6-hi.mp3' },
  ashtanga_step_7: { en: '/game-voices/ashtanga-7-en.mp3', hi: '/game-voices/ashtanga-7-hi.mp3' },
};

// Map graha fx key → STATIC_VOICES key
export const GRAHA_STATIC_KEY = {
  sun:'graha_sun', moon:'graha_moon', mars:'graha_mars', mercury:'graha_mercury',
  jupiter:'graha_jupiter', venus:'graha_venus', saturn:'graha_saturn',
  rahu:'graha_rahu', ketu:'graha_ketu',
};

// ══════════════════════════════════════════════════════════════════════
// 🪶 CHITRAGUPTA — The Divine Scribe. He didn't just record this game.
//    He WROTE it. Every number on this board is his handwriting.
//    Every snake name — his Sanskrit. Every virtue — his ink.
//    The Agrasandhani (cosmic ledger) updates in real-time.
// ══════════════════════════════════════════════════════════════════════
export const CG_LINES = {
  en: {
    open:     "I am Chitragupta. Since the first soul drew breath, I have kept the record. I wrote every number on this board. Every serpent's name — my Sanskrit. Every virtue ladder — my ink. I open a new page today. I am watching.",
    punya:    "Noted. Punya recorded. The ledger grows lighter.",
    papa:     "Recorded. Papa entered. Without judgment. The ledger simply sees what is true.",
    snake:    "This serpent was already written here. I placed it where weakness would catch a soul. Your fall was always in the ledger.",
    ladder:   "This virtue was written here by me. I placed each ladder exactly where a pure act could lift a soul. You found it.",
    dharma_p: "Righteous. Written in gold. Every dharmic act, however costly, is inscribed differently. I use a finer quill.",
    dharma_x: "Recorded without judgment. Only Yama reads the final tally. And he always does.",
    sacred:   "You have entered the Ashtanga Marga. From this point, I set down my quill. Only the soul itself writes what happens here.",
    moksha:   "The page is complete. I seal it. In all the ages I have kept this record, few pages end this way. Go. You are free.",
    reject:   "The ledger speaks plainly. Papa exceeds Punya. Return. Purify. The board is still here. So am I.",
    balance:  "I note this carefully. Your Punya and Papa are nearly equal. What you do in these next squares — I will write with extraordinary attention.",
    seeker:   "I have watched every seeker who has walked this board. I know how each story ends. I say nothing. I only write.",
    judgment: "The game is over. I close the Agrasandhani. The pure soul has been liberated. For those who remain — Yama awaits. As he always does.",
  },
  hi: {
    open:     "मैं चित्रगुप्त हूँ। जब से पहली आत्मा ने श्वास लिया, मैं अभिलेख रखता आया हूँ। इस पट का हर अंक मेरी लिखावट है। हर सांप का नाम — मेरी संस्कृत। हर सीढ़ी — मेरी स्याही। आज नया पृष्ठ खोलता हूँ। मैं देख रहा हूँ।",
    punya:    "दर्ज। पुण्य अंकित। खाता हल्का होता है।",
    papa:     "दर्ज। पाप अंकित। बिना निर्णय के। खाता केवल सत्य देखता है।",
    snake:    "यह सांप यहाँ पहले से लिखा था। मैंने इसे वहाँ रखा जहाँ कमज़ोरी आत्मा को पकड़े। यह गिरावट हमेशा खाते में थी।",
    ladder:   "यह सीढ़ी मैंने लिखी थी। हर सीढ़ी ठीक वहाँ रखी जहाँ पुण्य कर्म आत्मा को उठा सके। तुमने इसे पाया।",
    dharma_p: "धर्मिक। सोने में लिखा गया। हर धर्मिक कार्य मैं अलग तरीके से लिखता हूँ।",
    dharma_x: "निर्णय के बिना दर्ज। केवल यमराज अंतिम गणना पढ़ते हैं।",
    sacred:   "तुम अष्टांग मार्ग में प्रवेश कर चुके हो। यहाँ मैं कलम रख देता हूँ। आत्मा ही लिखती है।",
    moksha:   "पृष्ठ पूर्ण हुआ। मैं मुहर लगाता हूँ। बहुत कम पृष्ठ इस तरह समाप्त होते हैं। जाओ। तुम मुक्त हो।",
    reject:   "खाता स्पष्ट बोलता है। पाप, पुण्य से अधिक है। लौटो। शुद्ध हो। पट यहाँ है। मैं भी।",
    balance:  "मैं इसे ध्यान से नोट करता हूँ। पुण्य और पाप लगभग बराबर हैं। इन अगले खानों में मैं असाधारण ध्यान से लिखूँगा।",
    seeker:   "मैंने हर उस साधक को देखा है जो इस पट पर चला है। मुझे पता है हर कहानी कैसे समाप्त होती है। केवल लिखता हूँ।",
    judgment: "खेल समाप्त हुआ। अग्रसंधानी बंद करता हूँ। जो शुद्ध था, मुक्त हुआ। जो शेष हैं — यमराज प्रतीक्षा करते हैं। जैसा हमेशा होता है।",
  }
};

// Static CG voice files (pre-generated with onyx voice + celestial processing)
export const CG_STATIC = {
  open:'/game-voices/cg-open', punya:'/game-voices/cg-punya', papa:'/game-voices/cg-papa',
  snake:'/game-voices/cg-snake', ladder:'/game-voices/cg-ladder',
  dharma_p:'/game-voices/cg-dharmap', dharma_x:'/game-voices/cg-dharmapap',
  sacred:'/game-voices/cg-sacred', moksha:'/game-voices/cg-moksha',
  reject:'/game-voices/cg-reject', balance:'/game-voices/cg-balance',
  seeker:'/game-voices/cg-seeker', judgment:'/game-voices/cg-judgment',
};

// Entry type visual styles for the ledger
export const CG_ENTRY_TYPES = {
  punya:    {icon:'✦',color:'#f0d050',bg:'rgba(240,200,80,.08)',label:'पुण्य'},
  papa:     {icon:'✦',color:'#e06030',bg:'rgba(200,80,40,.08)',label:'पाप'},
  snake:    {icon:'𓆙',color:'#e06030',bg:'rgba(200,80,40,.10)',label:'पाप'},
  ladder:   {icon:'🪔',color:'#80d080',bg:'rgba(80,200,80,.08)',label:'पुण्य'},
  dharma_p: {icon:'⚖',color:'#80c0a0',bg:'rgba(80,180,120,.08)',label:'धर्म'},
  dharma_x: {icon:'⚖',color:'#c08060',bg:'rgba(180,100,60,.08)',label:'अधर्म'},
  sacred:   {icon:'🪷',color:'#c0a0f0',bg:'rgba(160,120,220,.08)',label:'मार्ग'},
  moksha:   {icon:'ॐ', color:'#f0d050',bg:'rgba(240,200,80,.15)',label:'मोक्ष'},
  reject:   {icon:'⚠', color:'#e06060',bg:'rgba(200,60,60,.10)',label:'अशुद्ध'},
  balance:  {icon:'⚖',color:'#a0c8e0',bg:'rgba(120,160,200,.08)',label:'तुला'},
};

export const VoiceEngine = {
  audio: null,
  speaking: false,
  _stopToken: 0, // incremented on every stop() — lets async fetches detect they've been cancelled

  // Play a static MP3 file — instant, zero API cost
  playStatic(url) {
    this.stop();
    const audio = new Audio(url);
    audio.volume = 1.0;
    this.audio = audio;
    this.speaking = true;
    audio.onended = () => { this.speaking = false; };
    audio.play().catch(()=>{});
  },

  _pickBestVoice(voices, lang) {
    if (lang === 'hi') {
      return voices.find(v => v.name.includes('Google') && v.lang === 'hi-IN')
        || voices.find(v => v.lang === 'hi-IN')
        || voices.find(v => v.lang.startsWith('hi'))
        || voices[0];
    }
    const preferred = ['Google UK English Male','Daniel','Rishi','Google US English','Aaron','Samantha'];
    for (const name of preferred) { const v = voices.find(v => v.name.includes(name)); if (v) return v; }
    return voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang.startsWith('en')) || voices[0];
  },

  _browserSpeak(text, lang) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.75; u.pitch = 0.8; u.volume = 1.0;
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-GB';
      const voices = window.speechSynthesis.getVoices();
      const best = this._pickBestVoice(voices, lang);
      if (best) u.voice = best;
      this.speaking = true;
      u.onend = () => { this.speaking = false; };
      window.speechSynthesis.speak(u);
    } catch (e) {}
  },

  async speak(text, lang) {
    // Force stop any existing voice first — prevents overlap
    this.stop();
    if (!text) return;
    const myToken = this._stopToken; // capture before any await

    const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);

    if (!isLocal) {
      const cached = AudioCache.get(text);
      if (cached) {
        if (this._stopToken !== myToken) return; // dismissed while checking cache
        const audio = new Audio(cached);
        audio.volume=1.0;
        this.audio = audio;
        this.speaking = true;
        audio.onended = () => { this.speaking = false; };
        await audio.play().catch(()=>{});
        return;
      }

      // Not cached — fetch from OpenAI (1-3s). Check token after await.
      try {
        const url = await AudioCache.fetchTTS(text, lang);
        if (this._stopToken !== myToken) return; // user dismissed while fetching — discard
        if (url) {
          const audio = new Audio(url);
          audio.volume=1.0;
          this.audio = audio;
          this.speaking = true;
          audio.onended = () => { this.speaking = false; };
          audio.play();
          return;
        }
      } catch (e) {}
    }

    if (this._stopToken !== myToken) return; // check before browser fallback too
    // Fallback: browser speech
    this._browserSpeak(text, lang);
  },

  stop() {
    this._stopToken++;
    if (this.audio) { try { this.audio.pause(); this.audio.currentTime = 0; } catch (e) {} this.audio = null; }
    if (this._yamaCtx) { try { this._yamaCtx.close(); } catch(e){} this._yamaCtx = null; }
    if (this._yamaSource) { try { this._yamaSource.stop(); } catch(e){} this._yamaSource = null; }
    if (this._yamaSource2) { try { this._yamaSource2.stop(); } catch(e){} this._yamaSource2 = null; }
    if (this._cgCtx) { try { this._cgCtx.close(); } catch(e){} this._cgCtx = null; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    this.speaking = false;
  },

  // ═══ CHITRAGUPTA VOICE — Celestial scribe, absolute calm ═══
  // Audio chain: presence (2.5kHz +5dB) + air shimmer (10kHz +4dB)
  //   + 5s heavenly reverb + 528Hz singing bowl — never interrupts other voices
  _cgCtx: null,
  async speakChitragupta(key, lang) {
    // Chitragupta waits — he never interrupts
    if (this.speaking) return;
    const l = (lang==='hi') ? 'hi' : 'en';
    const text = CG_LINES[l]?.[key];
    if (!text) return;
    const staticBase = CG_STATIC[key];
    const staticUrl = staticBase ? `${staticBase}-${l}.mp3` : null;
    const myToken = this._stopToken;

    let audioUrl = null;
    // 1. Try static file (instant, zero cost)
    if (staticUrl) {
      try { const r=await fetch(staticUrl,{method:'HEAD'}); if(r.ok) audioUrl=staticUrl; } catch(e){}
    }
    if (this._stopToken !== myToken || this.speaking) return;
    // 2. Fallback: browser speech (always instant)
    if (!audioUrl) { this._browserSpeak(text, lang); return; }

    try {
      const resp = await fetch(audioUrl);
      const arrayBuf = await resp.arrayBuffer();
      if (this._stopToken !== myToken || this.speaking) return;
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      if (ctx.state==='suspended') await ctx.resume();
      this._cgCtx = ctx;
      const buf = await ctx.decodeAudioData(arrayBuf);
      if (this._stopToken !== myToken) { try{ctx.close()}catch(e){}; return; }

      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = 0.93; // Weight of eternity

      // Presence (2.5kHz) — divine authority
      const pres = ctx.createBiquadFilter();
      pres.type='peaking'; pres.frequency.value=2500; pres.Q.value=0.9; pres.gain.value=5;
      // Air shimmer (10kHz) — ethereal, above the world
      const air = ctx.createBiquadFilter();
      air.type='highshelf'; air.frequency.value=10000; air.gain.value=4;
      // Cut muddy low-mids (400Hz)
      const cut = ctx.createBiquadFilter();
      cut.type='peaking'; cut.frequency.value=400; cut.Q.value=1; cut.gain.value=-3;
      // 5-second heavenly reverb (longer than narrator's 2s)
      const rvLen = Math.floor(5*ctx.sampleRate);
      const rvBuf = ctx.createBuffer(2,rvLen,ctx.sampleRate);
      for(let ch=0;ch<2;ch++){
        const d=rvBuf.getChannelData(ch);
        for(let i=0;i<rvLen;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/rvLen,1.4)*(i<ctx.sampleRate*.03?i/(ctx.sampleRate*.03):1);
      }
      const conv = ctx.createConvolver(); conv.buffer=rvBuf;
      const rvMix = ctx.createGain(); rvMix.gain.value=0.32;
      // 528Hz "miracle tone" — unique signature of Chitragupta's voice
      const bowl = ctx.createOscillator(); bowl.type='sine'; bowl.frequency.value=528;
      const bowlG = ctx.createGain(); bowlG.gain.value=0.016;
      const bowlF = ctx.createBiquadFilter(); bowlF.type='bandpass'; bowlF.frequency.value=528; bowlF.Q.value=12;
      bowl.connect(bowlF); bowlF.connect(bowlG);
      // Route
      const master = ctx.createGain(); master.gain.value=1.0;
      src.connect(cut); cut.connect(pres); pres.connect(air);
      air.connect(master); air.connect(conv); conv.connect(rvMix); rvMix.connect(master);
      bowlG.connect(master); master.connect(ctx.destination);
      this.speaking = true;
      src.onended = () => {
        this.speaking = false;
        bowlG.gain.linearRampToValueAtTime(0, ctx.currentTime+2.5);
        setTimeout(()=>{try{bowl.stop();ctx.close()}catch(e){}this._cgCtx=null;},3000);
      };
      src.start(0); bowl.start(0);
    } catch(e) {
      this._browserSpeak(text, lang);
    }
  },

  // ═══ YAMA VOICE — Full audio processing for Thanos-like sound ═══
  async speakYama(text, lang) {
    this.stop();
    if (!text) return;

    // Use static MP3 file — zero API cost
    const staticUrl = STATIC_VOICES.yama[lang==='hi'?'hi':'en'];

    try {
      const resp = await fetch(staticUrl);
      const blob = await resp.blob();
      const arrayBuf = await blob.arrayBuffer();

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      this._yamaCtx = ctx;

      const buffer = await ctx.decodeAudioData(arrayBuf);

      // ═══ LAYER 1: Main voice (pitch 0.82) ═══
      const source1 = ctx.createBufferSource();
      source1.buffer = buffer;
      source1.playbackRate.value = 0.82;
      this._yamaSource = source1;

      // ═══ LAYER 2: Deep shadow (pitch 0.65, quiet) ═══
      const source2 = ctx.createBufferSource();
      source2.buffer = buffer;
      source2.playbackRate.value = 0.55;
      this._yamaSource2 = source2;

      const layer2Gain = ctx.createGain();
      layer2Gain.gain.value = 0.12;

      // ═══ SUB-BASS BOOST ═══
      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = 'lowshelf';
      bassBoost.frequency.value = 120;
      bassBoost.gain.value = 8;

      // ═══ HIGH CUT ═══
      const highCut = ctx.createBiquadFilter();
      highCut.type = 'lowpass';
      highCut.frequency.value = 5000;

      // ═══ MID CLARITY ═══
      const midBoost = ctx.createBiquadFilter();
      midBoost.type = 'peaking';
      midBoost.frequency.value = 1500;
      midBoost.gain.value = 3;
      midBoost.Q.value = 1;

      // ═══ DISTORTION ═══
      const distortion = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = (Math.PI + 10) * x / (Math.PI + 10 * Math.abs(x));
      }
      distortion.curve = curve;
      distortion.oversample = '4x';

      // ═══ DELAY ═══
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.3;
      const delayFb = ctx.createGain();
      delayFb.gain.value = 0.15;
      const delayMix = ctx.createGain();
      delayMix.gain.value = 0.25;
      delay.connect(delayFb);
      delayFb.connect(delay);
      delay.connect(delayMix);

      // ═══ REVERB ═══
      const rvLen = 2.5 * ctx.sampleRate;
      const rvBuf = ctx.createBuffer(2, rvLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = rvBuf.getChannelData(ch);
        for (let i = 0; i < rvLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rvLen, 2.5);
      }
      const conv = ctx.createConvolver();
      conv.buffer = rvBuf;
      const rvMix = ctx.createGain();
      rvMix.gain.value = 0.25;

      // ═══ COMPRESSOR ═══
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.ratio.value = 4;
      comp.attack.value = 0.005;
      comp.release.value = 0.1;

      // ═══ MASTER ═══
      const master = ctx.createGain();
      master.gain.value = 1.3;

      // ═══ ROUTING ═══
      source1.connect(bassBoost);
      source2.connect(layer2Gain);
      layer2Gain.connect(bassBoost);
      bassBoost.connect(highCut);
      highCut.connect(midBoost);
      midBoost.connect(distortion);
      distortion.connect(comp);
      comp.connect(master);
      comp.connect(delay);
      comp.connect(conv);
      delayMix.connect(master);
      conv.connect(rvMix);
      rvMix.connect(master);
      master.connect(ctx.destination);

      this.speaking = true;
      source1.onended = () => { this.speaking = false; try{ctx.close()}catch(e){} this._yamaCtx=null; };
      source1.start(0);
      source2.start(0);
      return; // Success!
    } catch(e) {
      console.warn('Yama Web Audio failed:', e.message);
    }

    // Fallback: play static file without processing
    try {
      this.playStatic(staticUrl);
    } catch(e) {
      this._browserSpeak(text, lang);
    }
  },

  // ═══ PLAY YAMA TAUNT — static MP3 from /yama-taunts/ with scary processing ═══
  async playYamaTaunt(type, lang) {
    this.stop();
    const isHi = lang === 'hi';
    let count, prefix;
    if (type === 'snake') { count = 8; prefix = 'snake'; }
    else if (type === 'wrong') { count = 4; prefix = 'wrong'; }
    else if (type === 'reject') { count = 1; prefix = 'reject'; }
    else return;

    const idx = type === 'reject' ? '' : '-' + (Math.floor(Math.random() * count) + 1);
    const file = `/yama-taunts/${prefix}-${isHi ? 'hi' : 'en'}${idx}.mp3`;
    console.log('Yama taunt:', file);

    try {
      const resp = await fetch(file);
      if (!resp.ok) throw new Error('File not found: ' + file);
      const arrayBuf = await resp.arrayBuffer();

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      this._yamaCtx = ctx;

      const buffer = await ctx.decodeAudioData(arrayBuf);

      // Apply Yama audio processing — pitch down + bass + reverb
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.88;
      this._yamaSource = source;

      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = 'lowshelf'; bassBoost.frequency.value = 200; bassBoost.gain.value = 8;

      const master = ctx.createGain();
      master.gain.value = 1.2;

      source.connect(bassBoost);
      bassBoost.connect(master);
      master.connect(ctx.destination);

      this.speaking = true;
      source.onended = () => { this.speaking = false; try{ctx.close()}catch(e){} this._yamaCtx=null; };
      source.start(0);
    } catch(e) {
      console.warn('Yama taunt MP3 not found, falling back to TTS API:', e.message);
      // Fallback: use TTS API if static files don't exist yet
      const taunts = type === 'snake' ? YAMA_TAUNTS_SNAKE : type === 'wrong' ? YAMA_TAUNTS_WRONG : ["Ha ha ha ha ha! Rejected! The gates of Moksha slam shut in your face!"];
      const text = taunts[Math.floor(Math.random() * taunts.length)];
      this.speak(text, lang);
    }
  },

  // ═══ NARRATOR VOICE — Vedic temple processing for story onboarding ═══
  // staticUrl: pre-generated /onboarding/story-N-lang.mp3 (zero API cost)
  // onAudioStart: fires the MOMENT audio begins playing (used for UI sync)
  async speakNarrator(text, lang, staticUrl, onAudioStart) {
    this.stop();
    if (!text) return;
    const myToken = this._stopToken;

    let audioUrl = null;

    // 1. Static pre-generated file (highest priority — always free)
    if (staticUrl) {
      try {
        const r = await fetch(staticUrl, { method: 'HEAD' });
        if (r.ok) { audioUrl = staticUrl; console.log('[Voice] Static:', staticUrl); }
      } catch(e) {}
    }

    if (this._stopToken !== myToken) return;

    // 2. IndexedDB / OpenAI API (fallback if static not deployed yet)
    if (!audioUrl) {
      const isLocal = ['localhost','127.0.0.1',''].includes(window.location.hostname);
      if (!isLocal) {
        audioUrl = AudioCache.get(text);
        if (!audioUrl) {
          try { audioUrl = await AudioCache.fetchTTS(text, lang); } catch(e){}
        }
      }
    }

    if (this._stopToken !== myToken) return;
    if (!audioUrl) { this._browserSpeak(text, lang); onAudioStart && onAudioStart(); return; }

    try {
      const resp = await fetch(audioUrl);
      const blob = await resp.blob();
      const arrayBuf = await blob.arrayBuffer();

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      this._yamaCtx = ctx; // reuse cleanup ref

      const buffer = await ctx.decodeAudioData(arrayBuf);

      // ═══ NARRATOR SOURCE (pitch 0.88 — slow gravitas) ═══
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.92;
      this._yamaSource = source;

      // ═══ BASS WARMTH (120Hz, +4dB) ═══
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 120;
      bass.gain.value = 4;

      // ═══ MID CLARITY (2kHz, +3dB) ═══
      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 2000;
      mid.gain.value = 3;
      mid.Q.value = 1;

      // ═══ HIGH CUT (gentle warmth) ═══
      const highCut = ctx.createBiquadFilter();
      highCut.type = 'lowpass';
      highCut.frequency.value = 7000;

      // ═══ DELAY (250ms, 15% feedback — words linger) ═══
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.25;
      const delayFb = ctx.createGain();
      delayFb.gain.value = 0.15;
      const delayMix = ctx.createGain();
      delayMix.gain.value = 0.18;
      delay.connect(delayFb);
      delayFb.connect(delay);
      delay.connect(delayMix);

      // ═══ TEMPLE REVERB (hall, 2s decay, 20% mix) ═══
      const rvLen = 2.0 * ctx.sampleRate;
      const rvBuf = ctx.createBuffer(2, rvLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = rvBuf.getChannelData(ch);
        for (let i = 0; i < rvLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / rvLen, 2.0);
      }
      const conv = ctx.createConvolver();
      conv.buffer = rvBuf;
      const rvMix = ctx.createGain();
      rvMix.gain.value = 0.20;

      // ═══ OM DRONE (tanpura-like background hum) ═══
      // Layer 3 oscillators: fundamental + fifth + octave for rich drone
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.04; // Very subtle — felt not heard

      const droneBass = ctx.createBiquadFilter();
      droneBass.type = 'lowpass';
      droneBass.frequency.value = 200; // Keep only low frequencies

      // Sa (fundamental) — ~130 Hz (C3)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 130.81;

      // Pa (perfect fifth) — ~196 Hz (G3)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 196.00;
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.value = 0.6;

      // Low Sa (octave below) — ~65 Hz
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.value = 65.41;
      const osc3Gain = ctx.createGain();
      osc3Gain.gain.value = 0.8;

      osc1.connect(droneBass);
      osc2.connect(osc2Gain);
      osc2Gain.connect(droneBass);
      osc3.connect(osc3Gain);
      osc3Gain.connect(droneBass);
      droneBass.connect(droneGain);

      // ═══ MASTER ═══
      const master = ctx.createGain();
      master.gain.value = 1.1;

      // ═══ ROUTING ═══
      source.connect(bass);
      bass.connect(mid);
      mid.connect(highCut);
      highCut.connect(master);
      highCut.connect(delay);
      highCut.connect(conv);
      delayMix.connect(master);
      conv.connect(rvMix);
      rvMix.connect(master);
      droneGain.connect(master);
      master.connect(ctx.destination);

      // ═══ PLAY ═══
      if (this._stopToken !== myToken) { try{osc1.stop();osc2.stop();osc3.stop();ctx.close()}catch(e){} return; }
      this.speaking = true;
      source.onended = () => {
        this.speaking = false;
        // Fade out drone gracefully
        droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(()=>{try{osc1.stop();osc2.stop();osc3.stop();ctx.close()}catch(e){}this._yamaCtx=null},2000);
      };
      source.start(0);
      onAudioStart && onAudioStart(); // ← fires exactly when audio begins
      osc1.start(0);
      osc2.start(0);
      osc3.start(0);
      return;
    } catch(e) {
      console.warn('Narrator processing failed:', e.message);
    }

    // Fallback: play without effects
    try {
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      this.audio = audio;
      this.speaking = true;
      audio.onplay  = () => { onAudioStart && onAudioStart(); };
      audio.onended = () => { this.speaking = false; };
      await audio.play().catch(()=>{});
    } catch(e) {
      this._browserSpeak(text, lang);
    }
  }
};

