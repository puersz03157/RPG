/** 種植作物定義（現實時間成長，不枯萎） */

/** @typedef {{ id:string, name:string, seedItemId:string, harvestItemId:string, growTimeMs:number, seedPrice:number, desc:string }} CropDef */

export const GARDEN_PLOT_COUNT = 3;

/** @type {Record<string, CropDef>} */
export const CROP_DEFS = /** @type {const} */ ({
  c_salad: {
    id: 'c_salad',
    name: '翠葉生菜',
    seedItemId: 'it_seed_salad',
    harvestItemId: 'it_ing_salad',
    growTimeMs: 2 * 60 * 1000,
    seedPrice: 40,
    desc: '短時間可採收，適合新手圃丁。',
  },
  c_carrot: {
    id: 'c_carrot',
    name: '砂原紅蘿蔔',
    seedItemId: 'it_seed_carrot',
    harvestItemId: 'it_ing_carrot',
    growTimeMs: 5 * 60 * 1000,
    seedPrice: 70,
    desc: '稍久一點，但口感紮實。',
  },
  c_melon: {
    id: 'c_melon',
    name: '薄皮蜜瓜',
    seedItemId: 'it_seed_melon',
    harvestItemId: 'it_ing_melon',
    growTimeMs: 10 * 60 * 1000,
    seedPrice: 120,
    desc: '慢工出細活，餐酒館愛用。',
  },
});

export function listCrops() {
  return Object.values(CROP_DEFS);
}

export function getCrop(cropId) {
  return cropId ? CROP_DEFS[cropId] ?? null : null;
}

/** 澆水後成長時間為原本的 90% */
export const WATER_GROW_MUL = 0.9;

/**
 * @param {{ cropId: string | null, plantedAt: number | null, watered: boolean }} plot
 * @param {CropDef | null} crop
 * @returns {number | null}
 */
export function getCropReadyAtMs(plot, crop) {
  if (!plot?.cropId || !plot.plantedAt || !crop) return null;
  const mul = plot.watered ? WATER_GROW_MUL : 1;
  return plot.plantedAt + crop.growTimeMs * mul;
}

export function isCropReady(plot, crop, nowMs = Date.now()) {
  const t = getCropReadyAtMs(plot, crop);
  return t != null && nowMs >= t;
}
