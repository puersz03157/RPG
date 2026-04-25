const ALL_KEY = 'aethelgard-unlock-all-heroes';
const IDS_KEY = 'aethelgard-unlocked-heroes';

const clampIds = (ids) =>
  (Array.isArray(ids) ? ids : [])
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .slice(0, 99);

export function loadAllHeroesUnlocked() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(ALL_KEY);
    return raw === '1' || raw === 'true';
  } catch {
    return false;
  }
}

export function saveAllHeroesUnlocked(v) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ALL_KEY, v ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function loadUnlockedHeroIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return clampIds(parsed);
  } catch {
    return [];
  }
}

export function saveUnlockedHeroIds(ids) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(IDS_KEY, JSON.stringify(clampIds(ids)));
  } catch {
    /* ignore */
  }
}

export function clearHeroUnlockStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ALL_KEY);
    window.localStorage.removeItem(IDS_KEY);
  } catch {
    /* ignore */
  }
}

