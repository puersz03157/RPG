import { getInvCount } from './inventoryStorage.js';

/**
 * 基地設施（先做最小可玩的版本）：
 * - 鍛造鋪等級：用「淨化稜晶」數量直接映射（0..4）
 *   目的：不需要額外 UI 也能自然成長，並可隨劇情解鎖而變強。
 */

export function getForgeLevelFromInventory(itemInv) {
  const prisms = getInvCount(itemInv, 'it_purify_prism');
  return Math.max(0, Math.min(4, Math.floor(Number(prisms) || 0)));
}

