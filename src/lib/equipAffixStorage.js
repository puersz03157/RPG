const STORAGE_KEY = 'aethelgard-equip-affixes-v1';

/**
 * shape:
 * {
 *   [heroId]: {
 *     weapon: { itemId: string|null, affixes: Array<{id,stat,value}> },
 *     offhand: { itemId: string|null, affixes: Array<{id,stat,value}> },
 *     armor: { itemId: string|null, affixes: Array<{id,stat,value}> },
 *   }
 * }
 */

export function loadEquipAffixMap() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveEquipAffixMap(map) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map ?? {}));
  } catch {
    /* ignore */
  }
}

