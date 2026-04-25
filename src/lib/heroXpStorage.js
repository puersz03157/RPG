import { HEROES_BASE } from '../data/units.js';

const STORAGE_KEY = 'aethelgard-hero-xp';

/** 升到下一等所需經驗：need(L) = BASE + (L−1)×SLOPE（線性成長） */
export const XP_NEXT_BASE = 42;
export const XP_NEXT_SLOPE = 18;

/** 目前預設等級上限；未來可用「突破素材」提高到 60/70/80... */
export const DEFAULT_LEVEL_CAP = 50;

export function defaultProgress() {
  return { level: 1, xp: 0, cap: DEFAULT_LEVEL_CAP };
}

export function xpRequiredForNextLevel(level) {
  const L = Math.max(1, level);
  return Math.max(10, XP_NEXT_BASE + (L - 1) * XP_NEXT_SLOPE);
}

function allHeroIds() {
  return HEROES_BASE.map((h) => h.id);
}

export function loadHeroXpMap() {
  const ids = allHeroIds();
  const base = Object.fromEntries(ids.map((id) => [id, defaultProgress()]));
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    const out = { ...base };
    for (const id of ids) {
      const p = parsed[id];
      if (!p || typeof p !== 'object') continue;
      const cap = Math.max(1, Math.min(999, Math.floor(Number(p.cap)) || DEFAULT_LEVEL_CAP));
      const level = Math.max(1, Math.min(cap, Math.floor(Number(p.level)) || 1));
      const need = xpRequiredForNextLevel(level);
      const xp = level >= cap ? 0 : Math.max(0, Math.min(need - 1, Math.floor(Number(p.xp)) || 0));
      out[id] = { level, xp, cap };
    }
    return out;
  } catch {
    return base;
  }
}

export function saveHeroXpMap(map) {
  if (typeof window === 'undefined') return;
  try {
    const ids = allHeroIds();
    const slim = {};
    for (const id of ids) {
      const p = map[id] ?? defaultProgress();
      const cap = Math.max(1, Math.min(999, Math.floor(Number(p.cap)) || DEFAULT_LEVEL_CAP));
      const level = Math.max(1, Math.min(cap, Math.floor(Number(p.level)) || 1));
      slim[id] = { level, xp: Math.max(0, Math.floor(Number(p.xp)) || 0), cap };
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* ignore */
  }
}

export function clearHeroXpStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** 每等 +2.5% 全戰鬥相關屬性（線性） */
const STAT_PER_LEVEL_RATE = 0.025;

export function applyLevelLinearStatsToHero(heroBase, progress) {
  const level = progress?.level ?? 1;
  const cap = progress?.cap ?? DEFAULT_LEVEL_CAP;
  const L = Math.max(0, level - 1);
  const k = 1 + STAT_PER_LEVEL_RATE * L;
  return {
    ...heroBase,
    heroLevel: level,
    heroXp: progress?.xp ?? 0,
    heroLevelCap: cap,
    heroXpToNext: level >= cap ? 'MAX' : xpRequiredForNextLevel(level),
    hp: Math.max(1, Math.round(heroBase.hp * k)),
    atk: Math.max(1, Math.round(heroBase.atk * k)),
    matk: Math.max(1, Math.round((heroBase.matk ?? 0) * k)),
    def: Math.max(1, Math.round(heroBase.def * k)),
    mdef: Math.max(1, Math.round((heroBase.mdef ?? heroBase.def) * k)),
    spd: Math.max(1, Math.round(heroBase.spd * k)),
  };
}

export function applyXpWithLevelUps(progress, addXp) {
  let level = Math.max(1, progress.level ?? 1);
  const cap = Math.max(1, Math.min(999, Math.floor(Number(progress.cap)) || DEFAULT_LEVEL_CAP));
  let xp = Math.max(0, progress.xp ?? 0);
  let remaining = Math.max(0, Math.floor(addXp));
  let levelUpCount = 0;
  if (level >= cap) return { level: cap, xp: 0, cap, levelUpCount: 0 };
  while (remaining > 0 && level < cap) {
    const need = xpRequiredForNextLevel(level);
    const space = need - xp;
    if (remaining >= space) {
      remaining -= space;
      level += 1;
      levelUpCount += 1;
      xp = 0;
    } else {
      xp += remaining;
      remaining = 0;
    }
  }
  if (level >= cap) return { level: cap, xp: 0, cap, levelUpCount };
  return { level, xp, cap, levelUpCount };
}

/** 總經驗平分給上陣成員，餘數依序 +1 */
export function distributeBattleXp(partyIds, totalBattleXp) {
  const n = partyIds.length;
  if (n === 0) return [];
  const total = Math.max(0, Math.floor(totalBattleXp));
  const base = Math.floor(total / n);
  const rem = total % n;
  return partyIds.map((id, i) => ({ id, amount: base + (i < rem ? 1 : 0) }));
}

/**
 * 戰鬥勝利：依上陣名單分配經驗並寫入 localStorage。
 * @returns {{ map: Record<string,{level,xp}>, lines: Array<{id,name,amount,levelUpCount,newLevel}> }}
 */
export function sumMonstersXpReward(monstersList) {
  return monstersList.reduce((s, m) => s + (m.xpReward ?? 0), 0);
}

export function awardPartyXp(partyIds, totalBattleXp) {
  let map = loadHeroXpMap();
  const slices = distributeBattleXp(partyIds, totalBattleXp);
  const lines = [];
  for (const { id, amount } of slices) {
    if (amount <= 0) continue;
    const prev = map[id] ?? defaultProgress();
    const { level, xp, cap, levelUpCount } = applyXpWithLevelUps(prev, amount);
    map = { ...map, [id]: { level, xp, cap } };
    const name = HEROES_BASE.find((h) => h.id === id)?.name ?? id;
    lines.push({ id, name, amount, levelUpCount, newLevel: level });
  }
  saveHeroXpMap(map);
  return { map, lines };
}

export function applyManualLevelUps(progress, deltaLevels, maxLevel) {
  const curLevel = Math.max(1, Math.floor(Number(progress?.level)) || 1);
  const cap = Math.max(1, Math.min(999, Math.floor(Number(progress?.cap)) || DEFAULT_LEVEL_CAP));
  const hardMax = Math.max(1, Math.min(999, Math.floor(Number(maxLevel)) || 1));
  const limit = Math.min(cap, hardMax);
  const add = Math.max(0, Math.floor(Number(deltaLevels)) || 0);
  if (curLevel >= limit) return { level: curLevel, xp: 0, cap, gained: 0, limit };
  const nextLevel = Math.min(limit, curLevel + add);
  return { level: nextLevel, xp: 0, cap, gained: nextLevel - curLevel, limit };
}
