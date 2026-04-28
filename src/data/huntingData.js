/** 休憩園狩獵小遊戲 */

export const HUNTING_DURATION_MS = 15 * 1000;
export const HUNTING_DAILY_MAX = 3;
/** 本局是否出現龍（最多一隻）的機率 */
export const HUNTING_DRAGON_ROUND_CHANCE = 0.2;
export const HUNTING_BAD_TIME_PENALTY_MS = 1200;
/** 誤點後短暫不再因連點重複扣時 */
export const HUNTING_MISCLICK_COOLDOWN_MS = 500;
export const HUNTING_SPAWN_INTERVAL_MS = 1000;
/** 畫面上同時存在的目標數上限（含龍） */
export const HUNTING_MAX_SIMULTANEOUS = 5;
export const HUNTING_TARGET_TTL_MS = 2600;
export const HUNTING_DRAGON_TTL_MS = 3800;
/** 龍若出現，在開始後此區間內隨機一刻刷出（毫秒） */
export const HUNTING_DRAGON_SPAWN_MIN_MS = 2500;
export const HUNTING_DRAGON_SPAWN_MAX_MS = 11000;

/** 僅點中龍時發放；一場最多一條龍故最多一次 */
export const HUNTING_STAR_REWARD_MIN = 1;
export const HUNTING_STAR_REWARD_MAX = 3;

export function rollHuntingStarCrystals(rng01) {
  const u = rng01();
  return HUNTING_STAR_REWARD_MIN + Math.floor(u * (HUNTING_STAR_REWARD_MAX - HUNTING_STAR_REWARD_MIN + 1));
}

/**
 * @typedef {{
 *  id:string, kind:'monster'|'critter'|'dragon',
 *  emoji:string, label:string,
 *  dropA:string, dropB:string,
 * }} HuntTargetType
 */

/** @type {HuntTargetType[]} */
export const HUNT_MONSTERS = [
  { id: 'wolf', kind: 'monster', emoji: '🐺', label: '狼', dropA: 'it_hunt_wolf_fang', dropB: 'it_hunt_wolf_pelt' },
  { id: 'boar', kind: 'monster', emoji: '🐗', label: '豬', dropA: 'it_hunt_boar_hide', dropB: 'it_hunt_monster_meat' },
  { id: 'eagle', kind: 'monster', emoji: '🦅', label: '鷹', dropA: 'it_hunt_feather', dropB: 'it_hunt_egg' },
];

export const HUNT_DRAGON = /** @type {const} */ ({
  id: 'dragon',
  kind: 'dragon',
  emoji: '🐲',
  label: '龍',
  dropA: 'it_hunt_dragon_scale',
  dropB: 'it_hunt_dragon_fang',
});

/** @type {HuntTargetType[]} */
export const HUNT_CRITTERS = [
  { id: 'rabbit', kind: 'critter', emoji: '🐰', label: '兔', dropA: '', dropB: '' },
  { id: 'snail', kind: 'critter', emoji: '🐌', label: '蝸', dropA: '', dropB: '' },
  { id: 'chick', kind: 'critter', emoji: '🐥', label: '雛', dropA: '', dropB: '' },
];

/** 一般刷新：魔物／小動物約各半，素材不會過於密集 */
export function rollCommonSpawn(rng01) {
  const r = rng01();
  if (r < 0.26) return HUNT_MONSTERS[0];
  if (r < 0.48) return HUNT_MONSTERS[1];
  if (r < 0.68) return HUNT_MONSTERS[2];
  if (r < 0.78) return HUNT_CRITTERS[0];
  if (r < 0.89) return HUNT_CRITTERS[1];
  return HUNT_CRITTERS[2];
}

/**
 * @param {HuntTargetType} t
 * @param {() => number} rng01
 */
export function rollMonsterMaterialId(t, rng01) {
  if (!t.dropA) return null;
  return rng01() < 0.5 ? t.dropA : t.dropB;
}
