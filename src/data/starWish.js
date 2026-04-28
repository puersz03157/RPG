/** 星曉祈願（首期限定池）— 數值與企劃對齊用常數 */

export const STAR_WISH_PULL_COST = 20;
export const STAR_WISH_CHAR_RATE = 0.05;
export const STAR_WISH_DIRECT_START = 600;
export const STAR_WISH_DIRECT_FLOOR = 300;
export const STAR_WISH_DISCOUNT_PER_PULL = 40;

/** 祈願池角色 id（與 HEROES_BASE 一致） */
export const STAR_WISH_HERO_IDS = ['butiya_halloween', 'bubu_harvest', 'moying', 'jack'];

export const STAR_WISH_HERO_ORDER = [
  { id: 'butiya_halloween', name: '萬聖節布提婭' },
  { id: 'bubu_harvest', name: '豐收節布布' },
  { id: 'moying', name: '墨影' },
  { id: 'jack', name: '傑克' },
];

/**
 * 自上次「抽到角色或直購角色」以來累積的抽數 → 直購價
 * @param {number} pullsSinceReset
 */
export function getStarWishDirectPrice(pullsSinceReset) {
  const n = Math.max(0, Math.floor(Number(pullsSinceReset) || 0));
  return Math.max(STAR_WISH_DIRECT_FLOOR, STAR_WISH_DIRECT_START - STAR_WISH_DISCOUNT_PER_PULL * n);
}

/**
 * 未邂逅到限定角時的雜物表（權重總和 1000，與 {@link rollStarWishJunkReward} 共用）
 * @type {ReadonlyArray<{ w: number, kind: 'gold'|'r4crystal', amount: number } | { w: number, kind: 'item', itemId: string, amount: number }>}
 */
export const STAR_WISH_JUNK_TABLE = /** @type {const} */ [
  { w: 200, kind: 'gold', amount: 50 },
  { w: 200, kind: 'gold', amount: 100 },
  { w: 140, kind: 'gold', amount: 180 },
  { w: 90, kind: 'r4crystal', amount: 1 },
  { w: 50, kind: 'r4crystal', amount: 2 },
  { w: 20, kind: 'r4crystal', amount: 3 },
  { w: 70, kind: 'item', itemId: 'it_tavern_voucher', amount: 1 },
  { w: 70, kind: 'item', itemId: 'it_forge_token', amount: 1 },
  { w: 30, kind: 'item', itemId: 'it_forge_token_force', amount: 1 },
  { w: 60, kind: 'item', itemId: 'it_training_guide', amount: 1 },
  { w: 70, kind: 'item', itemId: 'it_exp_ticket', amount: 1 },
];

export const STAR_WISH_JUNK_WEIGHT_SUM = STAR_WISH_JUNK_TABLE.reduce((s, r) => s + r.w, 0);

/**
 * 未邂逅到限定角時：權重正規化隨機
 * @returns {{ kind: 'gold'|'r4crystal', amount: number } | { kind: 'item', itemId: string, amount: number }}
 */
export function rollStarWishJunkReward() {
  const table = STAR_WISH_JUNK_TABLE;
  const total = table.reduce((s, r) => s + r.w, 0);
  let t = Math.random() * total;
  for (const row of table) {
    t -= row.w;
    if (t <= 0) {
      if (row.kind === 'item' && row.itemId) {
        return { kind: 'item', itemId: row.itemId, amount: Math.max(1, Math.floor(Number(row.amount) || 1)) };
      }
      return { kind: row.kind, amount: row.amount };
    }
  }
  const last = table[table.length - 1];
  if (last.kind === 'item' && 'itemId' in last && last.itemId) {
    return { kind: 'item', itemId: last.itemId, amount: Math.max(1, Math.floor(Number(last.amount) || 1)) };
  }
  return { kind: last.kind, amount: last.amount };
}
