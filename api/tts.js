// Vercel Serverless Function — OpenAI TTS proxy
// Your API key stays on the server, never exposed to the browser

import { createClient } from '@supabase/supabase-js';

const ALLOWED_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'ash', 'coral', 'sage'];
const MAX_TEXT_LENGTH = 1000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

// Simple in-memory rate limiter (resets per cold start, good enough for serverless)
const rateLimitMap = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not set in environment variables' });
  }

  // Verify Supabase auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const token = authHeader.slice(7);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Rate limit per user
  if (isRateLimited(user.id)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const { text, voice } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text required' });
  }
  if (typeof text !== 'string' || text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: `text must be a string under ${MAX_TEXT_LENGTH} chars` });
  }

  const safeVoice = ALLOWED_VOICES.includes(voice) ? voice : 'onyx';

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: safeVoice,
        input: text,
        instructions: 'Speak slowly and dramatically.',
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
