// ─────────────────────────────────────────────────────────────────────────────
// src/types/game.ts — Shared TypeScript interfaces for Moksha Patam
// ─────────────────────────────────────────────────────────────────────────────

export interface SnakeLadder {
  to: number;
  skt: string;
  en: string;
  tale: string;
}

export interface Shloka {
  s: string;  // Sanskrit text
  r: string;  // Reference
}

export interface GrahaEffect {
  id: string;
  name: string;
  skt: string;
  symbol: string;
  color: string;
  fx: string;
  desc: string;
  en: string;
  hi: string;
}

export interface Character {
  id: string;
  name: string;
  skt: string;
  role: string;
  color: string;
  accent: string;
  icon: string;
  voice: string;
  trait: string;
  lore: string;
}

export interface DilemmaChoice {
  l: string;   // label
  sub: string; // subtitle
  karma?: number;
  sq?: number;
  color: string;
  fx?: Record<string, unknown>;
}

export interface Dilemma {
  id: string;
  skt: string;
  en: string;
  era: string;
  story: string;
  punya: DilemmaChoice;
  papa: DilemmaChoice;
  ashtanga?: boolean;
}

export interface Player {
  name: string;
  char: Character;
  color: string;
  cpu?: boolean;
}

export interface SacredPathStep {
  sq: number;
  skt: string;
  en: string;
  desc: string;
  icon: string;
}

export interface Rashi {
  name: string;
  skt: string;
  symbol: string;
  element: string;
  planet: string;
  start: [number, number];  // [month, day]
  end: [number, number];
  meaning: string;
  advice: string;
}

export interface GameState {
  pos: number[];
  cur: number;
  punya: number[];
  papa: number[];
  shieldA: boolean[];
  skipA: boolean[];
  win: number | null;
  busy: boolean;
}

export type Lang = 'en' | 'hi';
export type Screen = 'title' | 'story' | 'pickcount' | 'setup' | 'chitragupta' | 'yama' | 'game';
export type Realm = 'bhuloka' | 'antarloka' | 'svargaloka' | 'moksha_path';
