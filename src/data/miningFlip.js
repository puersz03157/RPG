/** 休憩園挖礦：4×4 翻牌 */

export const MINING_GRID = 16;
export const MINING_TIMER_SEC = 15;
export const MINING_DAILY_MAX = 3;
/** 每局開始時，星曉亂入（2 組銅改為 2 組星曉對子）的機率 */
export const MINING_STAR_INVADE_CHANCE = 0.2;
export const MINING_STAR_REWARD_MIN = 1;
export const MINING_STAR_REWARD_MAX = 3;

/** @typedef {'copper'|'silver'|'gold'|'star'} MiningMatchType */

/**
 * @typedef {{ uid: string, matchType: MiningMatchType, pairId: string, label: string }} MiningCardDef
 */

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

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {() => number} rng01
 * @returns {{ slots: MiningCardDef[], starInvade: boolean }}
 */
export function buildMiningRound(rng01) {
  const starInvade = rng01() < MINING_STAR_INVADE_CHANCE;
  /** @type {MiningCardDef[]} */
  const list = [];
  let n = 0;
  const mk = (matchType, pairId, label) => {
    list.push({ uid: `m${n++}`, matchType, pairId, label });
  };

  if (starInvade) {
    for (let i = 0; i < 6; i += 1) mk('copper', 'copper', '銅');
    mk('star', 'st0', '星Ⅰ');
    mk('star', 'st0', '星Ⅰ');
    mk('star', 'st1', '星Ⅱ');
    mk('star', 'st1', '星Ⅱ');
  } else {
    for (let i = 0; i < 10; i += 1) mk('copper', 'copper', '銅');
  }

  mk('silver', 's0', '銀');
  mk('silver', 's0', '銀');
  mk('silver', 's1', '銀');
  mk('silver', 's1', '銀');
  mk('gold', 'g0', '金');
  mk('gold', 'g0', '金');

  const seed = Math.floor(rng01() * 0xffffffff);
  const rng = mulberry32(seed);
  const slots = shuffle(list, rng);
  return { slots, starInvade };
}

/**
 * @param {MiningCardDef} a
 * @param {MiningCardDef} b
 */
export function miningCardsMatch(a, b) {
  if (!a || !b) return false;
  if (a.matchType === 'copper' && b.matchType === 'copper') return true;
  // 銀礦與星曉晶石量少：不強制固定配對，只要同類型即可消除
  if (a.matchType === 'silver' && b.matchType === 'silver') return true;
  if (a.matchType === 'star' && b.matchType === 'star') return true;
  // 金礦仍維持同一組兩張才可配對
  if (a.matchType === 'gold' && b.matchType === 'gold' && a.pairId === b.pairId) return true;
  return false;
}

export function rollStarCrystalReward(rng01) {
  const u = rng01();
  return MINING_STAR_REWARD_MIN + Math.floor(u * (MINING_STAR_REWARD_MAX - MINING_STAR_REWARD_MIN + 1));
}
