// ═══════════════════════════════════════════════════════════════════════════════
// i18n — Localization System for Moksha Patam
//
// Structure:
//   src/i18n/en/  — English JSON files (source of truth)
//   src/i18n/hi/  — Hindi JSON files (translated)
//   public/translations/ — CSV exports for translators
//
// Files per content type:
//   ui.json          — UI labels, buttons, headings
//   temples.json     — 9 temple intro, lore, 180 questions
//   gurus.json       — 8 guru intros, blessings, 120 questions
//   cosmic.json      — 60 "Did You Know?" cards
//   sacred.json      — 8-fold path lore + 88 riddles
//   dilemmas.json    — 21 dharma dilemmas
//   graha.json       — 9 planet descriptions
//   story.json       — 9 onboarding story pages
//   howtoplay.json   — 10 How to Play pages
//
// Usage:
//   import { t, setLang } from '../i18n';
//   t('ui.guru_encounter')  → "GURU ENCOUNTER" or "गुरु भेंट"
//   t('guru.aryabhata.intro') → full intro text in current language
// ═══════════════════════════════════════════════════════════════════════════════

// English locale files
import ui_en from './en/ui.json';
import gurus_en from './en/gurus.json';
import temples_en from './en/temples.json';
import cosmic_en from './en/cosmic.json';
import sacred_en from './en/sacred.json';
import dilemmas_en from './en/dilemmas.json';
import graha_en from './en/graha.json';
import howtoplay_en from './en/howtoplay.json';

// Hindi locale files (will be empty initially — filled by translators)
import ui_hi from './hi/ui.json';
import gurus_hi from './hi/gurus.json';
import temples_hi from './hi/temples.json';
import cosmic_hi from './hi/cosmic.json';
import sacred_hi from './hi/sacred.json';
import dilemmas_hi from './hi/dilemmas.json';
import graha_hi from './hi/graha.json';
import howtoplay_hi from './hi/howtoplay.json';

const LOCALES = {
  en: { ui: ui_en, gurus: gurus_en, temples: temples_en, cosmic: cosmic_en, sacred: sacred_en, dilemmas: dilemmas_en, graha: graha_en, howtoplay: howtoplay_en },
  hi: { ui: ui_hi, gurus: gurus_hi, temples: temples_hi, cosmic: cosmic_hi, sacred: sacred_hi, dilemmas: dilemmas_hi, graha: graha_hi, howtoplay: howtoplay_hi },
};

let currentLang = 'en';

export function setLang(lang) {
  currentLang = lang === 'hi' ? 'hi' : 'en';
}

export function getLang() {
  return currentLang;
}

/**
 * Get a translated string by dot-path key.
 * Falls back to English if Hindi translation is missing.
 * @param {string} key — dot-separated path like "ui.guru_encounter"
 * @param {string} [lang] — override language
 * @returns {string} translated text
 */
export function t(key, lang) {
  const l = lang || currentLang;
  const parts = key.split('.');
  const ns = parts[0]; // namespace (ui, gurus, temples, etc.)
  const path = parts.slice(1);

  // Try current language first
  let val = LOCALES[l]?.[ns];
  for (const p of path) {
    if (val && typeof val === 'object') val = val[p];
    else { val = undefined; break; }
  }

  // Fall back to English if not found
  if (val === undefined || val === '') {
    val = LOCALES.en?.[ns];
    for (const p of path) {
      if (val && typeof val === 'object') val = val[p];
      else { val = undefined; break; }
    }
  }

  return val || key; // Return key itself as last resort
}

export default t;
