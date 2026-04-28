import { todayKeyLocal } from './dailyQuestsStorage.js';

const STORAGE_KEY = 'aethelgard-mining-daily-v1';

/** @typedef {{ date: string, playsUsed: number }} MiningDailyState */

export function defaultMiningDaily() {
  return { date: todayKeyLocal(), playsUsed: 0 };
}

export function loadMiningDaily() {
  const today = todayKeyLocal();
  if (typeof window === 'undefined') return defaultMiningDaily();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: today, playsUsed: 0 };
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object') return { date: today, playsUsed: 0 };
    if (p.date !== today) return { date: today, playsUsed: 0 };
    const playsUsed = Math.max(0, Math.min(99, Math.floor(Number(p.playsUsed) || 0)));
    return { date: today, playsUsed };
  } catch {
    return { date: today, playsUsed: 0 };
  }
}

/** @param {MiningDailyState} s */
export function saveMiningDaily(s) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** 成功開一局時呼叫（已用次數 +1） */
export function consumeMiningPlay() {
  const cur = loadMiningDaily();
  const next = { date: cur.date, playsUsed: Math.min(99, cur.playsUsed + 1) };
  saveMiningDaily(next);
  return next;
}

export function clearMiningDailyStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
