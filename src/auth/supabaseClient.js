// ═══ SUPABASE CLIENT ═══
//
// SETUP INSTRUCTIONS:
// 1. Go to https://supabase.com → Create a project
// 2. Copy your Project URL and Anon Key from Settings → API
// 3. Replace the values below
// 4. Enable Google OAuth: Authentication → Providers → Google → Enable
//    - Get Google Client ID from https://console.cloud.google.com
//    - Add your domain to Authorized redirect URIs
// 5. Enable Apple OAuth: Authentication → Providers → Apple → Enable
//    - Requires Apple Developer account ($99/yr)
//    - Follow Supabase Apple auth guide
// 6. Run the SQL from schema.sql in Supabase SQL Editor
//
// ENV VARS (set in Vercel):
//   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
//   REACT_APP_SUPABASE_ANON_KEY=your-anon-key

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
