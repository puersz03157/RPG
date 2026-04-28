import { todayKeyLocal } from './dailyQuestsStorage.js';

const STORAGE_KEY = 'aethelgard-hunting-daily-v1';

export function loadHuntingDaily() {
  const today = todayKeyLocal();
  if (typeof window === 'undefined') return { date: today, playsUsed: 0 };
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

function save(s) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function consumeHuntingPlay() {
  const cur = loadHuntingDaily();
  const next = { date: cur.date, playsUsed: Math.min(99, cur.playsUsed + 1) };
  save(next);
  return next;
}

export function clearHuntingDailyStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
