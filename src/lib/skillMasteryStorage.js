import { mapHeroIdKeys } from '../data/heroIdMap.js';

const STORAGE_KEY = 'aethelgard-skill-mastery-v1';

function clampInt(n, lo, hi) {
  const x = Math.floor(Number(n) || 0);
  return Math.max(lo, Math.min(hi, x));
}

/**
 * @typedef {{ uses?: number, branch?: 'power'|'efficiency'|null }} SkillMastery
 * @typedef {Record<string, Record<string, SkillMastery>>} SkillMasteryMap
 * shape: { [heroId]: { [skillId]: { uses, branch } } }
 */

export function loadSkillMasteryMap() {
  if (typeof window === 'undefined') return {};
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

export function saveSkillMasteryMap(map) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map ?? {}));
  } catch {
    /* ignore */
  }
}

export function clearSkillMasteryStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getSkillMastery(map, heroId, skillId) {
  if (!heroId || !skillId) return { uses: 0, branch: null };
  const m = map?.[heroId]?.[skillId];
  const uses = clampInt(m?.uses ?? 0, 0, 999999);
  const branch = m?.branch === 'power' || m?.branch === 'efficiency' ? m.branch : null;
  return { uses, branch };
}

export function incSkillUses(map, heroId, skillId, add = 1) {
  if (!heroId || !skillId) return map ?? {};
  const cur = getSkillMastery(map, heroId, skillId);
  const nextUses = clampInt(cur.uses + clampInt(add, 0, 999999), 0, 999999);
  return {
    ...(map ?? {}),
    [heroId]: {
      ...((map ?? {})[heroId] ?? {}),
      [skillId]: { uses: nextUses, branch: cur.branch },
    },
  };
}

export function setSkillMasteryBranch(map, heroId, skillId, branch) {
  if (!heroId || !skillId) return map ?? {};
  const cur = getSkillMastery(map, heroId, skillId);
  const b = branch === 'power' || branch === 'efficiency' ? branch : null;
  return {
    ...(map ?? {}),
    [heroId]: {
      ...((map ?? {})[heroId] ?? {}),
      [skillId]: { uses: cur.uses, branch: b },
    },
  };
}

