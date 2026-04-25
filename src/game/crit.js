import { getDazzleCritDmgMul, getDazzleCritRateAdd } from './ailments.js';

/** 物攻結算用：普攻 + 以物攻倍率計算的傷害技能可暴擊（matk / mix 不暴擊） */
export const PHYS_CRIT_RATE = 0.1;
export const PHYS_CRIT_MULT = 1.5;

/** 蓄火斬擊等：爆擊率提升（中）— 加在基礎暴率上 */
export const CRIT_RATE_MID_ADD = 0.12;

/** 燼滅斬等：暴擊傷害提升（小）— 乘在暴擊倍率上 */
export const CRIT_DMG_SMALL_MUL = 1.12;

export function canPhysicalCrit(isSkill, scale) {
  if (!isSkill) return true;
  return scale === 'atk';
}

export function getPhysicalCritChance(atkU) {
  const extra = (atkU?.critRateBuffTurns ?? 0) > 0 ? (atkU.critRateBuffAdd ?? 0) : 0;
  const dazzleAdd = getDazzleCritRateAdd(atkU);
  const captainAdd = atkU?.captainCritRateAdd ?? 0;
  return Math.min(0.95, Math.max(0, PHYS_CRIT_RATE + extra + dazzleAdd + captainAdd));
}

export function getPhysicalCritDamageMultiplier(atkU) {
  const base = (atkU?.critDmgBuffTurns ?? 0) > 0 ? PHYS_CRIT_MULT * (atkU.critDmgBuffMul ?? 1) : PHYS_CRIT_MULT;
  const passiveCritDmgMul =
    atkU?.passive?.effect?.type === 'selfCritDmgMul' && typeof atkU.passive.effect.value === 'number'
      ? Math.max(1, atkU.passive.effect.value)
      : 1;
  return base * passiveCritDmgMul * getDazzleCritDmgMul(atkU);
}
