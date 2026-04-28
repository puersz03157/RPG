import { STAGES } from '../data/units.js';

const BALANCE_KEY = 'aethelgard-star-crystal-balance';
const FIRST_CLEAR_KEY = 'aethelgard-star-crystal-first-clear-ids';
const MIGRATION_V1_KEY = 'aethelgard-star-crystal-migration-v1';

export function loadStarCrystalBalance() {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(BALANCE_KEY);
    const n = Math.floor(Number(raw));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveStarCrystalBalance(n) {
  if (typeof window === 'undefined') return;
  try {
    const v = Math.max(0, Math.floor(Number(n) || 0));
    window.localStorage.setItem(BALANCE_KEY, String(v));
  } catch {
    /* ignore */
  }
}

function loadFirstClearClaimedIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FIRST_CLEAR_KEY);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveFirstClearClaimedIds(ids) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FIRST_CLEAR_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/**
 * 舊存檔：已有通關紀錄但尚無首通領取紀錄時，一次性標記為已領（不補發晶石）。
 * @param {string[]|null|undefined} completedStageIds
 */
export function migrateStarCrystalFirstClearIfNeeded(completedStageIds) {
  if (typeof window === 'undefined') return;
  if (window.localStorage.getItem(MIGRATION_V1_KEY)) return;
  const existing = loadFirstClearClaimedIds();
  if (existing.length > 0) {
    window.localStorage.setItem(MIGRATION_V1_KEY, '1');
    return;
  }
  const done = new Set(Array.isArray(completedStageIds) ? completedStageIds : []);
  const claimed = [];
  for (const st of STAGES) {
    if (!st?.id || !done.has(st.id)) continue;
    if (st.kind === 'battle' || st.kind === 'story') claimed.push(st.id);
  }
  if (claimed.length) saveFirstClearClaimedIds(claimed);
  window.localStorage.setItem(MIGRATION_V1_KEY, '1');
}

/**
 * 戰鬥／劇情關卡首次完成：+5（同一關卡不重複）。
 * @param {string} stageId
 * @param {string|undefined} stageKind STAGES 的 kind
 * @returns {number} 0 或 5
 */
export function tryGrantStarCrystalFirstClear(stageId, stageKind) {
  if (!stageId) return 0;
  if (stageKind !== 'battle' && stageKind !== 'story') return 0;
  const claimed = loadFirstClearClaimedIds();
  if (claimed.includes(stageId)) return 0;
  const next = [...claimed, stageId];
  saveFirstClearClaimedIds(next);
  const bal = loadStarCrystalBalance() + 5;
  saveStarCrystalBalance(bal);
  return 5;
}

/** 經驗關卡通關：+5（每日次數由入場邏輯限制） */
export function grantStarCrystalExpStageClear() {
  const bal = loadStarCrystalBalance() + 5;
  saveStarCrystalBalance(bal);
  return 5;
}

/** 金錢關卡通關：+5（每日次數由入場邏輯限制） */
export function grantStarCrystalGoldStageClear() {
  const bal = loadStarCrystalBalance() + 5;
  saveStarCrystalBalance(bal);
  return 5;
}

export function clearStarCrystalStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(BALANCE_KEY);
    window.localStorage.removeItem(FIRST_CLEAR_KEY);
    window.localStorage.removeItem(MIGRATION_V1_KEY);
  } catch {
    /* ignore */
  }
}
