const STORAGE_KEY = 'aethelgard-camp-recipes-v1';

export function loadCampRecipeOwnedIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === 'string' && x);
  } catch {
    return [];
  }
}

/**
 * @param {string[]} ids
 */
export function saveCampRecipeOwnedIds(ids) {
  if (typeof window === 'undefined') return;
  try {
    const uniq = Array.from(new Set((ids ?? []).filter((x) => typeof x === 'string' && x)));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uniq));
  } catch {
    /* ignore */
  }
}

export function clearCampRecipeStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

