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
  const affixAdd = Math.max(0, Math.min(0.5, Number(atkU?.affixCritRateAdd ?? 0) || 0));
  const passive = atkU?.passive?.effect;
  let passiveAdd = 0;
  if (passive?.type === 'critRateByBuffCount') {
    const per = typeof passive.perBuffAdd === 'number' ? passive.perBuffAdd : 0;
    const max = typeof passive.maxAdd === 'number' ? passive.maxAdd : 0;
    if (per > 0 && max > 0) {
      let buffs = 0;
      if ((atkU?.atkBuffTurns ?? 0) > 0) buffs += 1;
      if ((atkU?.matkBuffTurns ?? 0) > 0) buffs += 1;
      if ((atkU?.defBuffTurns ?? 0) > 0) buffs += 1;
      if ((atkU?.mdefBuffTurns ?? 0) > 0) buffs += 1;
      if ((atkU?.spdBuffTurns ?? 0) > 0) buffs += 1;
      if ((atkU?.critRateBuffTurns ?? 0) > 0) buffs += 1;
      if ((atkU?.critDmgBuffTurns ?? 0) > 0) buffs += 1;
      if ((atkU?.jackDrawBuffTurns ?? 0) > 0) buffs += 1;
      if ((atkU?.barrierTurns ?? 0) > 0) buffs += 1;
      passiveAdd = Math.min(max, Math.max(0, buffs * per));
    }
  }
  return Math.min(0.95, Math.max(0, PHYS_CRIT_RATE + extra + dazzleAdd + captainAdd + affixAdd + passiveAdd));
}

export function getPhysicalCritDamageMultiplier(atkU) {
  const base = (atkU?.critDmgBuffTurns ?? 0) > 0 ? PHYS_CRIT_MULT * (atkU.critDmgBuffMul ?? 1) : PHYS_CRIT_MULT;
  const passiveCritDmgMul =
    atkU?.passive?.effect?.type === 'selfCritDmgMul' && typeof atkU.passive.effect.value === 'number'
      ? Math.max(1, atkU.passive.effect.value)
      : 1;
  const affixMul = typeof atkU?.affixCritDmgMul === 'number' ? Math.max(1, atkU.affixCritDmgMul) : 1;
  return base * passiveCritDmgMul * affixMul * getDazzleCritDmgMul(atkU);
}
