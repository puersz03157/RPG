const STORAGE_KEY = 'aethelgard-boss-loot';

function clampMap(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const id = String(k || '').trim();
    if (!id) continue;
    out[id] = !!v;
  }
  return out;
}

export function loadBossLootClaims() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return clampMap(parsed?.claimedStages);
  } catch {
    return {};
  }
}

export function saveBossLootClaims(claimedStages) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ claimedStages: clampMap(claimedStages) }));
  } catch {
    /* ignore */
  }
}

export function clearBossLootStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
