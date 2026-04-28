import { mapHeroId } from '../data/heroIdMap.js';

const STORAGE_KEY = 'aethelgard-bonds-v1';

function clampInt(n, lo, hi) {
  const x = Math.floor(Number(n) || 0);
  return Math.max(lo, Math.min(hi, x));
}

/**
 * @typedef {{ points?: number }} BondRec
 * @typedef {Record<string, BondRec>} BondMap
 * key: "h1|h2" (sorted)
 */

export function bondKey(a, b) {
  const x = String(a || '');
  const y = String(b || '');
  if (!x || !y || x === y) return '';
  return x < y ? `${x}|${y}` : `${y}|${x}`;
}

export function loadBondMap() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    // Migrate old keys like "h1|h2" to new ids
    const out = {};
    for (const [k, v] of Object.entries(parsed)) {
      const [a0, b0] = String(k || '').split('|');
      const a = mapHeroId(a0);
      const b = mapHeroId(b0);
      const nk = bondKey(a, b);
      if (!nk) continue;
      out[nk] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveBondMap(map) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map ?? {}));
  } catch {
    /* ignore */
  }
}

export function getBondPoints(map, a, b) {
  const k = bondKey(a, b);
  if (!k) return 0;
  const pts = map?.[k]?.points ?? 0;
  return clampInt(pts, 0, 999999);
}

/**
 * 羈絆等級：每 5 點 1 等（0..5）
 * - Lv1：戰前 +5 MP（兩人都在隊）
 * - Lv2：解鎖合體技（示範：h1+h2）
 */
export function getBondLevel(points) {
  const p = clampInt(points, 0, 999999);
  return Math.max(0, Math.min(5, Math.floor(p / 5)));
}

export function addBondPoints(map, a, b, add = 1) {
  const k = bondKey(a, b);
  if (!k) return map ?? {};
  const cur = getBondPoints(map, a, b);
  const next = clampInt(cur + clampInt(add, 0, 999999), 0, 999999);
  return { ...(map ?? {}), [k]: { points: next } };
}

