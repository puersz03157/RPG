const KEY = 'aethelgard-talent-r4-progress-v1';

/**
 * @typedef {{ unlocked: boolean, level: number }} TalentRow4HeroProgress
 * @typedef {{ crystals: number, byHero: Record<string, TalentRow4HeroProgress>, legacyUnlocked?: boolean, legacyLevel?: number }} TalentRow4Progress
 */

export const TALENT_R4_LEVEL_MAX = 5;

function clampInt(n, min, max) {
  const x = Math.floor(Number(n) || 0);
  return Math.min(max, Math.max(min, x));
}

function defaultState() {
  return { crystals: 0, byHero: {} };
}

/** @returns {TalentRow4Progress} */
export function loadTalentRow4Progress() {
  const base = defaultState();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    // v1 legacy: { unlocked, level, crystals }
    if ('unlocked' in parsed || 'level' in parsed) {
      return {
        crystals: clampInt(parsed.crystals, 0, 1_000_000_000),
        byHero: {},
        legacyUnlocked: !!parsed.unlocked,
        legacyLevel: clampInt(parsed.level, 1, TALENT_R4_LEVEL_MAX),
      };
    }
    const crystals = clampInt(parsed.crystals, 0, 1_000_000_000);
    const byHeroRaw = parsed.byHero && typeof parsed.byHero === 'object' ? parsed.byHero : {};
    const byHero = {};
    for (const [k, v] of Object.entries(byHeroRaw)) {
      if (!k) continue;
      const obj = v && typeof v === 'object' ? v : {};
      byHero[k] = { unlocked: !!obj.unlocked, level: clampInt(obj.level, 1, TALENT_R4_LEVEL_MAX) };
    }
    return { crystals, byHero };
  } catch {
    return base;
  }
}

/** @param {TalentRow4Progress} state */
export function saveTalentRow4Progress(state) {
  if (typeof window === 'undefined') return;
  try {
    const crystals = clampInt(state?.crystals, 0, 1_000_000_000);
    const byHeroRaw = state?.byHero && typeof state.byHero === 'object' ? state.byHero : {};
    const byHero = {};
    for (const [k, v] of Object.entries(byHeroRaw)) {
      if (!k) continue;
      const obj = v && typeof v === 'object' ? v : {};
      byHero[k] = { unlocked: !!obj.unlocked, level: clampInt(obj.level, 1, TALENT_R4_LEVEL_MAX) };
    }
    const next = { crystals, byHero };
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearTalentRow4ProgressStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

