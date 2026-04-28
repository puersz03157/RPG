/**
 * 餐酒館：獨門食譜（購買後可於「客制點餐」用食材製作）
 *
 * - 不使用金幣/餐卷結帳（只消耗食材）
 * - Buff 只生效 1 場（沿用 campBuff 機制）
 */

/** @typedef {{ type: 'atkMul'|'matkMul'|'defMul'|'spdMul'|'avMul', mul?: number, turns?: number }} CampApply */

/**
 * @typedef {{
 *  id: string,
 *  name: string,
 *  shopPrice: number,
 *  desc: string,
 *  apply: CampApply,
 *  ingredients: { itemId: string, count: number }[],
 * }} CampRecipeDef
 */

/** @type {CampRecipeDef[]} */
export const CAMP_RECIPES = [
  {
    id: 'r_salad_crunch',
    name: '脆葉沙拉（獨門）',
    shopPrice: 180,
    desc: '我方全體速度提升（小，2 回合）',
    apply: { type: 'spdMul', mul: 1.12, turns: 2 },
    ingredients: [
      { itemId: 'it_ing_salad', count: 2 },
      { itemId: 'it_ing_carrot', count: 1 },
    ],
  },
  {
    id: 'r_melon_breeze',
    name: '蜜瓜清風飲（獨門）',
    shopPrice: 220,
    desc: '我方全體開場行動提前（AV -30%）',
    apply: { type: 'avMul', mul: 0.7 },
    ingredients: [
      { itemId: 'it_ing_melon', count: 1 },
      { itemId: 'it_ing_salad', count: 1 },
    ],
  },
  {
    id: 'r_fish_stew',
    name: '鮮魚濃湯（獨門）',
    shopPrice: 260,
    desc: '我方全體減傷（中，3 回合）',
    apply: { type: 'defMul', mul: 1.18, turns: 3 },
    ingredients: [
      { itemId: 'it_fresh_fish_meat', count: 2 },
      { itemId: 'it_ing_carrot', count: 1 },
    ],
  },
  {
    id: 'r_monster_jerky',
    name: '魔物風乾肉（獨門）',
    shopPrice: 240,
    desc: '我方全體攻擊提升（中，2 回合）',
    apply: { type: 'atkMul', mul: 1.16, turns: 2 },
    ingredients: [
      { itemId: 'it_hunt_monster_meat', count: 2 },
      { itemId: 'it_hunt_egg', count: 1 },
    ],
  },
];

export function getCampRecipe(recipeId) {
  return CAMP_RECIPES.find((r) => r.id === recipeId) ?? null;
}

