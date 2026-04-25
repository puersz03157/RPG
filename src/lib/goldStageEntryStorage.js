const STORAGE_KEY = 'aethelgard-gold-stage-entry';

export const GOLD_STAGE_DAILY_LIMIT = 3;

function pad2(n) {
  return String(n).padStart(2, '0');
}

function todayKeyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function defaultState() {
  return { date: todayKeyLocal(), remaining: GOLD_STAGE_DAILY_LIMIT };
}

export function loadGoldStageEntryState() {
  const base = defaultState();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    const date = typeof parsed.date === 'string' ? parsed.date : base.date;
    const remaining = Math.max(0, Math.min(GOLD_STAGE_DAILY_LIMIT, Math.floor(Number(parsed.remaining)) || 0));
    if (date !== base.date) return base;
    return { date, remaining };
  } catch {
    return base;
  }
}

export function saveGoldStageEntryState(state) {
  if (typeof window === 'undefined') return;
  try {
    const base = defaultState();
    const date = typeof state?.date === 'string' ? state.date : base.date;
    const remaining = Math.max(0, Math.min(GOLD_STAGE_DAILY_LIMIT, Math.floor(Number(state?.remaining)) || 0));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ date, remaining }));
  } catch {
    /* ignore */
  }
}

export function getGoldStageRunsLeft() {
  return loadGoldStageEntryState().remaining;
}

export function consumeGoldStageRun() {
  const cur = loadGoldStageEntryState();
  if (cur.remaining <= 0) return { ok: false, remaining: 0 };
  const next = { ...cur, remaining: cur.remaining - 1 };
  saveGoldStageEntryState(next);
  return { ok: true, remaining: next.remaining };
}

export function refillGoldStageRuns(delta) {
  const cur = loadGoldStageEntryState();
  const add = Math.max(0, Math.floor(Number(delta) || 0));
  const next = { ...cur, remaining: Math.min(GOLD_STAGE_DAILY_LIMIT, cur.remaining + add) };
  saveGoldStageEntryState(next);
  return next.remaining;
}

export function clearGoldStageEntryStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
