import { mapHeroIdKeys } from '../data/heroIdMap.js';

const STORAGE_KEY = 'aethelgard_talent_map_v1';

/**
 * @typedef {{ r1?: 'hp'|'def'|'mdef'|null, r2?: 'atk'|'matk'|'spd'|null, r3?: string|null, r4?: string|null }} TalentPick
 * @typedef {Record<string, TalentPick>} TalentMap
 */

/** @returns {TalentMap} */
export function loadTalentMap() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed0 = JSON.parse(raw);
    const parsed = mapHeroIdKeys(parsed0);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

/** @param {TalentMap} map */
export function saveTalentMap(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map ?? {}));
  } catch {
    // ignore
  }
}

export function clearTalentStorage() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

