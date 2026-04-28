const STORAGE_KEY = 'aethelgard-fish-codex-v1';

/** @typedef {{ caught: Record<string, number> }} FishCodexState */

function defaultState() {
  return { caught: {} };
}

export function loadFishCodex() {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaultState();
    const caught = parsed.caught && typeof parsed.caught === 'object' ? { ...parsed.caught } : {};
    const clean = {};
    for (const k of Object.keys(caught)) {
      const n = Math.max(0, Math.floor(Number(caught[k]) || 0));
      if (n > 0) clean[k] = Math.min(9999, n);
    }
    return { caught: clean };
  } catch {
    return defaultState();
  }
}

/** @param {FishCodexState} state */
export function saveFishCodex(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ caught: state.caught ?? {} }));
  } catch {
    /* ignore */
  }
}

/** @param {string} fishId @param {number} add */
export function recordCatch(prev, fishId, add = 1) {
  const next = { caught: { ...(prev?.caught ?? {}) } };
  const cur = Math.max(0, Math.floor(Number(next.caught[fishId]) || 0));
  next.caught[fishId] = Math.min(9999, cur + Math.max(1, add));
  return next;
}

export function clearFishCodexStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
