const STORAGE_KEY = 'aethelgard-gold';

export function loadGold() {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const n = Math.floor(Number(raw));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveGold(gold) {
  if (typeof window === 'undefined') return;
  try {
    const n = Math.max(0, Math.floor(Number(gold) || 0));
    window.localStorage.setItem(STORAGE_KEY, String(n));
  } catch {
    /* ignore */
  }
}

export function clearGoldStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function sumMonstersGoldReward(monstersList) {
  return (monstersList ?? []).reduce((s, m) => s + (m.goldReward ?? 0), 0);
}

