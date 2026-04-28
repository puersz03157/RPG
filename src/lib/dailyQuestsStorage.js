const STORAGE_KEY = 'aethelgard-daily-quests-v1';

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function todayKeyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function clampInt(n, lo, hi) {
  const x = Math.floor(Number(n) || 0);
  return Math.max(lo, Math.min(hi, x));
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rnd() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  const str = String(s ?? '');
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 固定多種任務（每天從中隨機抽 3 項）：
 * - skill_casts: 戰鬥中施放技能
 * - clear_xp / clear_gold: 通關經驗／金錢關卡
 * - bond_gain: 羈絆點數（勝利後兩兩 +1 的增量）
 * - forge_reroll: 大廳鍛造所重抽詞條
 * - training_buy: 大廳訓練場購買熟練度包
 * - camp_dine: 大廳餐酒館點餐
 * - harvest_crop: 休憩園收穫作物
 * - fish_catch: 休憩園釣到一條魚
 * - mine_play: 休憩園進行一次挖礦
 * - hunt_play: 休憩園進行一次狩獵
 */
export const DAILY_QUEST_DEFS = /** @type {const} */ ({
  skill_casts: { id: 'skill_casts', title: '熟練度訓練', desc: '今日施放技能', target: 12, unit: '次' },
  clear_xp: { id: 'clear_xp', title: '修煉日常', desc: '通關經驗關卡', target: 1, unit: '次' },
  clear_gold: { id: 'clear_gold', title: '補給日常', desc: '通關金錢關卡', target: 1, unit: '次' },
  bond_gain: { id: 'bond_gain', title: '羈絆升溫', desc: '獲得羈絆點數', target: 6, unit: '點' },
  forge_reroll: { id: 'forge_reroll', title: '鍛造日常', desc: '於鍛造所重抽裝備詞條', target: 2, unit: '次' },
  training_buy: { id: 'training_buy', title: '特訓日常', desc: '於訓練場購買熟練度包', target: 1, unit: '次' },
  camp_dine: { id: 'camp_dine', title: '餐敘日常', desc: '於餐酒館點餐', target: 1, unit: '次' },
  harvest_crop: { id: 'harvest_crop', title: '收成日常', desc: '收穫作物', target: 1, unit: '次' },
  fish_catch: { id: 'fish_catch', title: '釣魚日常', desc: '釣到一條魚', target: 1, unit: '次' },
  mine_play: { id: 'mine_play', title: '挖礦日常', desc: '進行一次挖礦', target: 1, unit: '次' },
  hunt_play: { id: 'hunt_play', title: '狩獵日常', desc: '進行一次狩獵', target: 1, unit: '次' },
});

export const DAILY_QUEST_IDS = /** @type {const} */ (/** @type {Array<keyof typeof DAILY_QUEST_DEFS>} */ (Object.keys(DAILY_QUEST_DEFS)));

export function buildNewDailyState(dateKey = todayKeyLocal()) {
  const rng = mulberry32(hashStr(`daily|${dateKey}`));
  const pool = [...DAILY_QUEST_IDS];
  // Fisher–Yates
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, 3);
  return {
    date: dateKey,
    picked, // ['skill_casts', ...]
    prog: Object.fromEntries(picked.map((id) => [id, 0])),
    claimed: Object.fromEntries(picked.map((id) => [id, false])),
    bonusClaimed: false,
  };
}

export function loadDailyQuestsState() {
  const today = todayKeyLocal();
  if (typeof window === 'undefined') return buildNewDailyState(today);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildNewDailyState(today);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return buildNewDailyState(today);
    if (parsed.date !== today) return buildNewDailyState(today);
    const picked = Array.isArray(parsed.picked) ? parsed.picked.filter((x) => DAILY_QUEST_IDS.includes(x)) : [];
    if (picked.length !== 3) return buildNewDailyState(today);
    const prog = parsed.prog && typeof parsed.prog === 'object' ? parsed.prog : {};
    const claimed = parsed.claimed && typeof parsed.claimed === 'object' ? parsed.claimed : {};
    const out = buildNewDailyState(today);
    out.picked = picked;
    out.prog = Object.fromEntries(picked.map((id) => [id, clampInt(prog[id] ?? 0, 0, 999999)]));
    out.claimed = Object.fromEntries(picked.map((id) => [id, !!claimed[id]]));
    out.bonusClaimed = !!parsed.bonusClaimed;
    return out;
  } catch {
    return buildNewDailyState(today);
  }
}

export function saveDailyQuestsState(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state ?? buildNewDailyState(todayKeyLocal())));
  } catch {
    /* ignore */
  }
}

export function clearDailyQuestsStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

