/** 背包「新鮮食材」「鍛造素材」分類（與休憩園討論一致） */

/** @type {ReadonlySet<string>} */
export const BACKPACK_INGREDIENT_IDS = new Set([
  'it_ing_salad',
  'it_ing_carrot',
  'it_ing_melon',
  'it_fresh_fish_meat',
  'it_hunt_monster_meat',
  'it_hunt_egg',
]);

/** @type {ReadonlySet<string>} */
export const BACKPACK_FORGE_IDS = new Set([
  'it_ore_copper',
  'it_ore_silver',
  'it_ore_gold',
  'it_hunt_wolf_fang',
  'it_hunt_wolf_pelt',
  'it_hunt_boar_hide',
  'it_hunt_feather',
  'it_hunt_dragon_scale',
  'it_hunt_dragon_fang',
]);

export function isBackpackIngredientId(id) {
  return !!id && BACKPACK_INGREDIENT_IDS.has(id);
}

export function isBackpackForgeId(id) {
  return !!id && BACKPACK_FORGE_IDS.has(id);
}
