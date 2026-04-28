import { getSkillMastery } from '../lib/skillMasteryStorage.js';

/**
 * 熟練度規則（可再調整）：
 * - 每使用 10 次升 1 階（rank）
 * - rank 0..10（最多 100 次）
 * - 每階技能傷害/治療倍率 +1%（最多 +10%）
 * - 達 rank 6 後可選分支：
 *   - power：額外 +4% 倍率
 *   - efficiency：MP 消耗 -2（最低 1）
 */

export const MASTERY_USES_PER_RANK = 10;
export const MASTERY_RANK_MAX = 10;

export function getMasteryRank(uses) {
  const u = Math.max(0, Math.floor(Number(uses) || 0));
  return Math.max(0, Math.min(MASTERY_RANK_MAX, Math.floor(u / MASTERY_USES_PER_RANK)));
}

export function getSkillPowerMulFromMastery(masteryMap, heroId, skillId) {
  const m = getSkillMastery(masteryMap, heroId, skillId);
  const rank = getMasteryRank(m.uses);
  const base = 1 + rank * 0.01;
  const branchBonus = rank >= 6 && m.branch === 'power' ? 1.04 : 1;
  return base * branchBonus;
}

export function getSkillMpDiscountFromMastery(masteryMap, heroId, skillId) {
  const m = getSkillMastery(masteryMap, heroId, skillId);
  const rank = getMasteryRank(m.uses);
  if (rank >= 6 && m.branch === 'efficiency') return 2;
  return 0;
}

