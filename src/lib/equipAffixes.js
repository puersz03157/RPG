import { getEquipItem } from '../data/equipment.js';

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
 * @typedef {{ id: string, stat: 'hp'|'atk'|'matk'|'def'|'mdef'|'spd'|'critRateAdd'|'critDmgMul'|'skillDmgMul'|'incomingDmgMul'|'ccHitAdd'|'ailResistAdd', value: number }} Affix
 * @typedef {{ weapon?: { itemId?: string|null, affixes?: Affix[] }, offhand?: { itemId?: string|null, affixes?: Affix[] }, armor?: { itemId?: string|null, affixes?: Affix[] } }} HeroAffixRec
 * @typedef {Record<string, HeroAffixRec>} EquipAffixMap
 */

/** 詞條池：依部位限定可洗出的屬性 */
const AFFIX_POOL_BY_SLOT = {
  weapon: [
    { id: 'atk_flat', stat: 'atk', min: 6, max: 16, weight: 1.0 },
    { id: 'matk_flat', stat: 'matk', min: 6, max: 16, weight: 1.0 },
    // 爆擊傷害：乘在暴擊倍率上（例：+10% → 1.10）
    { id: 'crit_dmg_mul', stat: 'critDmgMul', min: 6, max: 14, weight: 0.7 },
    // 技能傷害：乘在技能傷害上（例：+8% → 1.08）
    { id: 'skill_dmg_mul', stat: 'skillDmgMul', min: 5, max: 12, weight: 0.7 },
  ],
  offhand: [
    // MP 上限目前仍採全隊統一 100；先用「速度/爆擊率」兩軸讓副手更偏工具向
    { id: 'spd_flat', stat: 'spd', min: 1, max: 5, weight: 0.85 },
    { id: 'crit_rate_add', stat: 'critRateAdd', min: 3, max: 8, weight: 0.75 },
    // 減傷：乘在受傷上（例：8 → 0.92）
    { id: 'incoming_dmg_mul', stat: 'incomingDmgMul', min: 4, max: 10, weight: 0.8 },
    // 控制命中：提高施加異常（含暈眩/冰凍等）的機率（例：+6% → +0.06）
    { id: 'cc_hit_add', stat: 'ccHitAdd', min: 3, max: 8, weight: 0.7 },
  ],
  armor: [
    { id: 'hp_flat', stat: 'hp', min: 30, max: 90, weight: 1.0 },
    { id: 'def_flat', stat: 'def', min: 6, max: 18, weight: 1.0 },
    { id: 'mdef_flat', stat: 'mdef', min: 5, max: 16, weight: 1.0 },
    // 異常抗性：降低被施加異常（含暈眩/冰凍等）的機率（例：+6% → -0.06）
    { id: 'ail_resist_add', stat: 'ailResistAdd', min: 3, max: 8, weight: 0.75 },
  ],
};

function pickWeighted(rng, items) {
  const total = items.reduce((s, it) => s + (it.weight ?? 1), 0);
  let t = rng() * total;
  for (const it of items) {
    t -= it.weight ?? 1;
    if (t <= 0) return it;
  }
  return items[items.length - 1];
}

export function rollAffixesForEquip({ heroId, slotKey, itemId, forgeLevel, salt = 0, forcedStat = null }) {
  const it = getEquipItem(itemId);
  if (!it) return [];

  const fl = clampInt(forgeLevel, 0, 4);
  const count = 1 + (fl >= 2 ? 1 : 0) + (fl >= 4 ? 1 : 0); // 1~3 條
  const s = clampInt(salt, 0, 999999);
  const rng = mulberry32(hashStr(`${heroId}|${slotKey}|${itemId}|${fl}|${s}`));

  const poolAll = AFFIX_POOL_BY_SLOT?.[slotKey] ?? [];
  if (!Array.isArray(poolAll) || poolAll.length === 0) return [];

  const out = [];
  const used = new Set();
  const want =
    forcedStat === 'hp' ||
    forcedStat === 'atk' ||
    forcedStat === 'matk' ||
    forcedStat === 'def' ||
    forcedStat === 'mdef' ||
    forcedStat === 'spd' ||
    forcedStat === 'critRateAdd' ||
    forcedStat === 'critDmgMul' ||
    forcedStat === 'skillDmgMul' ||
    forcedStat === 'incomingDmgMul' ||
    forcedStat === 'ccHitAdd' ||
    forcedStat === 'ailResistAdd'
      ? forcedStat
      : null;
  if (want) {
    const pool = poolAll.filter((p) => p.stat === want);
    if (pool.length) {
      const pick0 = pickWeighted(rng, pool);
      used.add(pick0.id);
      const val0 = clampInt(pick0.min + Math.round((pick0.max - pick0.min) * rng()), pick0.min, pick0.max);
      out.push({ id: pick0.id, stat: pick0.stat, value: val0 });
    }
  }
  for (let i = out.length; i < count; i += 1) {
    let pick = pickWeighted(rng, poolAll);
    // avoid duplicates if possible
    let guard = 0;
    while (used.has(pick.id) && guard < 10) {
      pick = pickWeighted(rng, poolAll);
      guard += 1;
    }
    used.add(pick.id);
    const val = clampInt(pick.min + Math.round((pick.max - pick.min) * rng()), pick.min, pick.max);
    out.push({ id: pick.id, stat: pick.stat, value: val });
  }
  return out;
}

export function sumAffixStats(affixes) {
  const a = Array.isArray(affixes) ? affixes : [];
  const bonus = {
    hp: 0,
    atk: 0,
    matk: 0,
    def: 0,
    mdef: 0,
    spd: 0,
    critRateAdd: 0,
    critDmgMul: 1,
    skillDmgMul: 1,
    incomingDmgMul: 1,
    ccHitAdd: 0,
    ailResistAdd: 0,
  };
  for (const fx of a) {
    if (!fx || typeof fx !== 'object') continue;
    const stat = fx.stat;
    const v = Math.floor(Number(fx.value) || 0);
    if (!Number.isFinite(v)) continue;
    if (stat === 'hp') bonus.hp += v;
    if (stat === 'atk') bonus.atk += v;
    if (stat === 'matk') bonus.matk += v;
    if (stat === 'def') bonus.def += v;
    if (stat === 'mdef') bonus.mdef += v;
    if (stat === 'spd') bonus.spd += v;
    if (stat === 'critRateAdd') bonus.critRateAdd += v;
    if (stat === 'critDmgMul') bonus.critDmgMul *= 1 + v / 100;
    if (stat === 'skillDmgMul') bonus.skillDmgMul *= 1 + v / 100;
    if (stat === 'incomingDmgMul') bonus.incomingDmgMul *= Math.max(0.6, 1 - v / 100);
    if (stat === 'ccHitAdd') bonus.ccHitAdd += v / 100;
    if (stat === 'ailResistAdd') bonus.ailResistAdd += v / 100;
  }
  return bonus;
}

