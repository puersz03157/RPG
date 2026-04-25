const KEY = 'aethelgard-star-wish-v1';

/** @typedef {{ discountPulls: number }} StarWishState */

function defaultState() {
  return { discountPulls: 0 };
}

export function loadStarWishState() {
  const base = defaultState();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    const discountPulls = Math.max(0, Math.floor(Number(parsed.discountPulls) || 0));
    return { discountPulls };
  } catch {
    return base;
  }
}

export function saveStarWishState(state) {
  if (typeof window === 'undefined') return;
  try {
    const discountPulls = Math.max(0, Math.floor(Number(state?.discountPulls) || 0));
    window.localStorage.setItem(KEY, JSON.stringify({ discountPulls }));
  } catch {
    /* ignore */
  }
}

export function clearStarWishStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
