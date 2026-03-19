# Moksha Patam — मोक्षपटम् — The Ancient Game of Karma

## Quick Start

```bash
cd moksha-patam
npm install
npm start
```

Opens at http://localhost:3000

## Deploy to Vercel (free)

```bash
npm install -g vercel
vercel
```

## Deploy to GitHub Pages

```bash
npm run build
# Upload the `build` folder contents to your GitHub Pages repo
```

## Project Structure

```
moksha-patam/
├── public/
│   └── index.html          # Loads Puter.js for AI voice + fonts
├── src/
│   ├── index.js             # React entry point
│   ├── App.jsx              # Complete game (all screens)
│   ├── data.js              # Snakes, ladders, dilemmas, graha, characters, stories
│   └── audio.js             # Voice engine, ambient music, SFX
├── package.json
└── README.md
```

## Features

- Hindi/English AI voice narration (Puter.js → OpenAI/ElevenLabs/Polly)
- 4-page epic story onboarding with auto-narration
- 6 Vedic character roles with backstories and voice lore
- Custom player names
- 10×10 board with SVG naga serpents
- 10 snakes (vices) + 10 ladders (virtues) + 10 dharma dilemma squares
- Dual dice: Karma Die + Graha Die with all 6 planet effects
- Graha effect banner overlay
- Animated piece movement
- Punya/Papa karma tracking
- Venus shield, skip turn mechanics
- Both win conditions (Moksha + Karma Victory)
- Sound effects + ambient tanpura music
- Game encyclopaedia
- Mobile responsive

## AI Voice

The game uses Puter.js (loaded in public/index.html) for neural AI voices.
When hosted, it tries: OpenAI → ElevenLabs → AWS Polly → Browser speech.
No API keys needed — Puter.js handles everything.
