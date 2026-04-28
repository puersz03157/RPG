/**
 * 大廳背景加成（僅影響非戰鬥系統；即時依目前選擇的背景生效）
 */

const CUIYING = 'cuiying_linhai';
const SHUANGZHU = 'shuangzhu_binghe';
const XINGJIE = 'xingjie_gang';
const YANJI = 'yanji_volcano';
const ANCHAO = 'anchao_shenyuan';

/** 採收時額外 +1 份（共 2 份） */
export function lobbyBgHarvestExtraOnce(bgId) {
  return bgId === CUIYING;
}

/** 釣魚 QTE：綠區變寬、指針變慢（霜鑄冰河） */
export function getLobbyFishingQteAdjustments(bgId) {
  if (bgId !== SHUANGZHU) return { zoneWidthMul: 1, needleSpeedMul: 1 };
  return { zoneWidthMul: 1.22, needleSpeedMul: 0.88 };
}

/** 商店以金幣購買時價格乘數（星階港折扣） */
export function getLobbyShopBuyGoldMul(bgId) {
  if (bgId !== XINGJIE) return 1;
  return 0.92;
}

export function applyLobbyShopBuyGoldPrice(bgId, basePrice) {
  const p = Math.max(0, Math.floor(Number(basePrice) || 0));
  if (p <= 0) return 0;
  const m = getLobbyShopBuyGoldMul(bgId);
  return Math.max(1, Math.round(p * m));
}

/** 鍛造所支付金幣時的乘數（焰脊火山） */
export function getLobbyForgePayGoldMul(bgId) {
  if (bgId !== YANJI) return 1;
  return 0.88;
}

export function applyLobbyForgeGoldCost(bgId, baseGold) {
  const c = Math.max(0, Math.floor(Number(baseGold) || 0));
  if (c <= 0) return 0;
  const m = getLobbyForgePayGoldMul(bgId);
  return Math.max(1, Math.round(c * m));
}

const HUNT_DRAGON_BASE = 0.2;

/** 狩獵本局是否出龍的機率（黯潮深淵加成，封頂） */
export function getLobbyHuntingDragonRoundChance(bgId) {
  if (bgId !== ANCHAO) return HUNT_DRAGON_BASE;
  return Math.min(0.45, HUNT_DRAGON_BASE + 0.15);
}
