/**
 * Hero id migration map.
 * - Old ids: h1..h10
 * - New ids: readable strings (Puersz + others)
 */

export const HERO_ID_OLD_TO_NEW = Object.freeze({
  h1: 'Puersz',
  h2: 'xiongji',
  h3: 'baize',
  h4: 'butiya',
  h5: 'bubu',
  h6: 'butiya_halloween',
  h7: 'bubu_harvest',
  h8: 'moying',
  h9: 'jack',
  h10: 'huji',
});

export const HERO_ID_NEW_TO_OLD = Object.freeze(
  Object.fromEntries(Object.entries(HERO_ID_OLD_TO_NEW).map(([k, v]) => [v, k]))
);

export function mapHeroId(id) {
  if (!id) return id;
  return HERO_ID_OLD_TO_NEW[id] ?? id;
}

export function mapHeroIds(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.map((x) => mapHeroId(x)).filter(Boolean);
}

/**
 * Remap object keys that are hero ids: { [heroId]: any }
 * Keeps other keys untouched.
 */
export function mapHeroIdKeys(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const nk = mapHeroId(k);
    out[nk] = v;
  }
  return out;
}

