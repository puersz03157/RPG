/** 星曉祈願（首期限定池）— 數值與企劃對齊用常數 */

export const STAR_WISH_PULL_COST = 20;
export const STAR_WISH_CHAR_RATE = 0.05;
export const STAR_WISH_DIRECT_START = 600;
export const STAR_WISH_DIRECT_FLOOR = 300;
export const STAR_WISH_DISCOUNT_PER_PULL = 40;

/** 祈願池角色 id（與 HEROES_BASE 一致） */
export const STAR_WISH_HERO_IDS = ['h6', 'h7', 'h8', 'h9'];

export const STAR_WISH_HERO_ORDER = [
  { id: 'h6', name: '萬聖節布提婭' },
  { id: 'h7', name: '豐收節布布' },
  { id: 'h8', name: '墨影' },
  { id: 'h9', name: '傑克' },
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
 * 未邂逅角色時（95%）：僅金幣檔位，權重正規化隨機
 * @returns {{ kind: 'gold', amount: number }}
 */
export function rollStarWishJunkReward() {
  const table = [
    { w: 20, kind: 'gold', amount: 30 },
    { w: 20, kind: 'gold', amount: 50 },
    { w: 18, kind: 'gold', amount: 80 },
    { w: 14, kind: 'gold', amount: 120 },
    { w: 8, kind: 'gold', amount: 180 },
    // 第 4 列天賦：碎晶（可用於解鎖/升級）
    { w: 12, kind: 'r4crystal', amount: 1 },
    { w: 6, kind: 'r4crystal', amount: 2 },
    { w: 2, kind: 'r4crystal', amount: 3 },
  ];
  const total = table.reduce((s, r) => s + r.w, 0);
  let t = Math.random() * total;
  for (const row of table) {
    t -= row.w;
    if (t <= 0) return { kind: row.kind, amount: row.amount };
  }
  return { kind: table[table.length - 1].kind, amount: table[table.length - 1].amount };
}
