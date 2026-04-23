import { HEROES_BASE } from '../data/units.js';

const STORAGE_KEY = 'aethelgard-party-ids';

const allIds = () => HEROES_BASE.map((h) => h.id);

function sanitize(ids) {
  const allowed = new Set(allIds());
  const seen = new Set();
  const out = [];
  for (const id of ids ?? []) {
    if (!allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  if (out.length === 0) return [HEROES_BASE[0].id];
  return out;
}

export function loadPartyIds() {
  if (typeof window === 'undefined') return allIds();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return allIds();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return allIds();
    return sanitize(parsed);
  } catch {
    return allIds();
  }
}

export function savePartyIds(ids) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitize(ids)));
  } catch {
    /* ignore */
  }
}

export function clearPartyStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const MIN_PARTY = 1;
export const MAX_PARTY = 5;
