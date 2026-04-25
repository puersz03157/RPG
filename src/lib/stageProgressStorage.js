const STORAGE_KEY = 'aethelgard-stage-progress';

function clampIds(ids) {
  const out = [];
  const seen = new Set();
  for (const x of Array.isArray(ids) ? ids : []) {
    const s = String(x || '').trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= 999) break;
  }
  return out;
}

export function loadCompletedStageIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return clampIds(parsed?.completedStageIds);
  } catch {
    return [];
  }
}

export function saveCompletedStageIds(completedStageIds) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedStageIds: clampIds(completedStageIds) }));
  } catch {
    /* ignore */
  }
}

export function clearStageProgressStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

