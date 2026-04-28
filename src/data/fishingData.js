/**
 * 釣魚：釣點、魚餌、魚類與權重抽取
 * QTE 成功後依權重決定品項；稀有度影響 QTE 命中區寬度（越窄越難）
 */

/** @typedef {'common'|'uncommon'|'rare'|'epic'|'legendary'} FishRarity */

/** @type {Record<FishRarity, { qteZoneWidth: number, needleSpeed: number }>} */
export const FISH_RARITY_QTE = {
  common: { qteZoneWidth: 0.34, needleSpeed: 1.2 },
  uncommon: { qteZoneWidth: 0.28, needleSpeed: 1.45 },
  rare: { qteZoneWidth: 0.2, needleSpeed: 1.75 },
  epic: { qteZoneWidth: 0.14, needleSpeed: 2.05 },
  legendary: { qteZoneWidth: 0.1, needleSpeed: 2.35 },
};

/** 釣點 */
export const FISH_SPOTS = /** @type {const} */ ([
  { id: 'pond', name: '淺塘', desc: '水草邊常有小魚唼食。', prismMin: 0 },
  { id: 'stream', name: '溪道', desc: '水流稍急，偶爾有好魚。', prismMin: 1 },
  { id: 'deep', name: '深潭', desc: '靜水深流，傳聞有異色之魚。', prismMin: 3 },
]);

/** 魚餌（影響權重；可選消耗） */
export const FISH_BAITS = /** @type {const} */ ([
  { id: 'none', name: '不用餌', itemId: null, rareWeightMul: 1 },
  { id: 'worm', name: '蟲餌', itemId: 'it_bait_worm', rareWeightMul: 1.65 },
  { id: 'lure', name: '擬餌', itemId: 'it_bait_lure', rareWeightMul: 2.15 },
]);

/**
 * @typedef {{ id:string, name:string, rarity: FishRarity, itemId:string, desc:string, weight: Record<string, number> }} FishDef
 * weight: 釣點 id -> 權重（僅參與有正權重之釣點）
 */

/** @type {FishDef[]} */
export const FISH_DEFS = /** @type {FishDef[]} */ ([
  {
    id: 'f_minnow',
    name: '溝溝米諾魚',
    rarity: 'common',
    itemId: 'it_fish_minnow',
    desc: '巴掌大，油炸剛好。',
    weight: { pond: 38, stream: 22, deep: 8 },
  },
  {
    id: 'f_crucian',
    name: '野溝鯽',
    rarity: 'common',
    itemId: 'it_fish_crucian',
    desc: '湯頭清甜。',
    weight: { pond: 30, stream: 26, deep: 10 },
  },
  {
    id: 'f_catfish',
    name: '鬍鯰',
    rarity: 'uncommon',
    itemId: 'it_fish_catfish',
    desc: '夜行俠，肉厚少刺。',
    weight: { pond: 12, stream: 22, deep: 16 },
  },
  {
    id: 'f_bass',
    name: '溪鱸',
    rarity: 'rare',
    itemId: 'it_fish_bass',
    desc: '拉竿時很有力氣。',
    weight: { pond: 4, stream: 18, deep: 24 },
  },
  {
    id: 'f_koi',
    name: '緋緋錦鯉',
    rarity: 'epic',
    itemId: 'it_fish_koi',
    desc: '色彩太搶眼，放回去也捨不得。',
    weight: { pond: 0, stream: 8, deep: 22 },
  },
  {
    id: 'f_golden',
    name: '金影游鯉',
    rarity: 'legendary',
    itemId: 'it_fish_golden',
    desc: '傳說只在深潭映光時現身。',
    weight: { pond: 0, stream: 2, deep: 8 },
  },
]);

export function getFishDef(id) {
  return FISH_DEFS.find((f) => f.id === id) ?? null;
}

export function getSpot(spotId) {
  return FISH_SPOTS.find((s) => s.id === spotId) ?? null;
}

export function isSpotUnlocked(spotId, prismCount) {
  const s = getSpot(spotId);
  if (!s) return false;
  return prismCount >= (s.prismMin ?? 0);
}

function rarityMul(rarity, baitRareWeightMul) {
  if (rarity === 'common') return 1;
  if (rarity === 'uncommon') return 1.15 * baitRareWeightMul;
  if (rarity === 'rare') return 1.35 * baitRareWeightMul;
  if (rarity === 'epic') return 1.55 * baitRareWeightMul;
  return 1.85 * baitRareWeightMul;
}

/**
 * 依釣點與魚餌權重抽一尾「本次拋竿」的目標魚（決定 QTE 難度）
 * @param {string} spotId
 * @param {number} baitRareWeightMul
 * @param {() => number} rng01
 * @returns {FishDef | null}
 */
export function rollPendingFish(spotId, baitRareWeightMul, rng01) {
  const entries = FISH_DEFS.map((f) => {
    const w0 = f.weight[spotId] ?? 0;
    if (w0 <= 0) return { f, w: 0 };
    const w = w0 * rarityMul(f.rarity, baitRareWeightMul);
    return { f, w };
  }).filter((x) => x.w > 0);
  const sum = entries.reduce((a, b) => a + b.w, 0);
  if (sum <= 0) return null;
  let t = rng01() * sum;
  for (const e of entries) {
    t -= e.w;
    if (t <= 0) return e.f;
  }
  return entries[entries.length - 1].f;
}

export function randomZoneCenter(rng01) {
  const margin = 0.12;
  return margin + rng01() * (1 - 2 * margin);
}

/** 與 `items.js` 的 `it_fresh_fish_meat` 對應 */
export const FRESH_FISH_MEAT_ITEM_ID = 'it_fresh_fish_meat';

/** 依魚種稀有度微調：約 common 28% → legendary 50% */
const FRESH_MEAT_RARITY_ADD = /** @type {Record<FishRarity, number>} */ ({
  common: 0,
  uncommon: 0.05,
  rare: 0.1,
  epic: 0.15,
  legendary: 0.22,
});
const FRESH_MEAT_BASE_P = 0.28;

/**
 * 釣成時是否額外得到一份新鮮魚肉
 * @param {{ rarity?: FishRarity }} fish
 * @param {() => number} rng01
 */
export function rollFreshFishMeat(fish, rng01) {
  const add = FRESH_MEAT_RARITY_ADD[fish?.rarity] ?? 0;
  const p = Math.min(0.62, FRESH_MEAT_BASE_P + add);
  return rng01() < p;
}
