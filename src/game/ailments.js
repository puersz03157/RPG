/** 異常狀態：燃燒、中毒、冰凍、黑暗、眩目（DOT 不吃屬性剋星，於 App.getDamage 內不套用 elementMul） */

export const BURN_MAX_STACKS = 3;
export const BURN_TURNS_PER_APPLY = 3;
/** 每層每回合 DOT：目標最大 HP 的比例（不吃剋屬） */
export const BURN_HP_PCT_PER_STACK = 0.012;

export const POISON_HEAL_RECV_MUL = 0.65;
export const POISON_TURNS = 3;
/** 每回合 DOT：目標最大 HP 的比例（不吃剋屬；低於燃燒） */
export const POISON_HP_PCT_PER_TURN = 0.006;

export const FREEZE_SPD_MUL = 0.82;
export const FREEZE_TURNS = 2;

/** 受到暗屬性攻擊的額外乘算（在 elementMul 之後套用） */
export const DARKNESS_DARK_DMG_MUL = 1.18;
export const DARKNESS_TURNS = 3;

export const DAZZLE_CRIT_RATE_ADD = -0.08;
export const DAZZLE_CRIT_DMG_MUL = 0.88;
export const DAZZLE_TURNS = 2;

export function defaultAilmentFields() {
  return {
    burnStacks: 0,
    burnTurns: 0,
    poisonTurns: 0,
    freezeTurns: 0,
    darknessTurns: 0,
    dazzleTurns: 0,
  };
}

export function applyBurnOnTarget(unit, stacksToAdd = 1) {
  if (!unit || unit.curHp <= 0) return unit;
  const u = { ...unit };
  const add = Math.max(0, stacksToAdd);
  if (add <= 0) return u;
  u.burnStacks = Math.min(BURN_MAX_STACKS, (u.burnStacks ?? 0) + add);
  u.burnTurns = Math.max(u.burnTurns ?? 0, BURN_TURNS_PER_APPLY);
  return u;
}

export function applyPoisonOnTarget(unit, turns = POISON_TURNS) {
  if (!unit || unit.curHp <= 0) return unit;
  return { ...unit, poisonTurns: Math.max(unit.poisonTurns ?? 0, turns) };
}

export function applyFreezeOnTarget(unit, turns = FREEZE_TURNS) {
  if (!unit || unit.curHp <= 0) return unit;
  return { ...unit, freezeTurns: Math.max(unit.freezeTurns ?? 0, turns) };
}

export function applyDarknessOnTarget(unit, turns = DARKNESS_TURNS) {
  if (!unit || unit.curHp <= 0) return unit;
  return { ...unit, darknessTurns: Math.max(unit.darknessTurns ?? 0, turns) };
}

export function applyDazzleOnTarget(unit, turns = DAZZLE_TURNS) {
  if (!unit || unit.curHp <= 0) return unit;
  return { ...unit, dazzleTurns: Math.max(unit.dazzleTurns ?? 0, turns) };
}

/** 行動條速度：冰凍軟控（與 buff/debuff 乘算） */
export function getFreezeSpdMul(unit) {
  return (unit?.freezeTurns ?? 0) > 0 ? FREEZE_SPD_MUL : 1;
}

/**
 * 回合開始：DOT（燃燒不吃剋屬；此處直接扣 HP）
 * @returns {{ unit: object, logs: string[] }}
 */
export function applyTurnStartDots(unit) {
  const logs = [];
  if (!unit || unit.curHp <= 0) return { unit, logs };
  let u = { ...unit };
  if ((u.burnTurns ?? 0) > 0 && (u.burnStacks ?? 0) > 0) {
    const pct = BURN_HP_PCT_PER_STACK * (u.burnStacks ?? 0);
    const dmg = Math.max(1, Math.floor((u.hp ?? 1) * pct));
    u.curHp = Math.max(0, u.curHp - dmg);
    logs.push(`${u.name} 燃燒 -${dmg}`);
  }
  if ((u.poisonTurns ?? 0) > 0) {
    const dmg = Math.max(1, Math.floor((u.hp ?? 1) * POISON_HP_PCT_PER_TURN));
    u.curHp = Math.max(0, u.curHp - dmg);
    logs.push(`${u.name} 中毒 -${dmg}`);
  }
  return { unit: u, logs };
}

/** 回合結束：僅扣異常持續（全體） */
export function tickAilmentDurationsAll(hList, mList) {
  const tickOne = (u) => {
    const prevBurnT = u.burnTurns ?? 0;
    const nextBurnT = Math.max(0, prevBurnT - 1);
    const nextStacks = nextBurnT > 0 ? (u.burnStacks ?? 0) : 0;
    return {
      ...u,
      burnTurns: nextBurnT,
      burnStacks: nextStacks,
      poisonTurns: Math.max(0, (u.poisonTurns ?? 0) - 1),
      freezeTurns: Math.max(0, (u.freezeTurns ?? 0) - 1),
      darknessTurns: Math.max(0, (u.darknessTurns ?? 0) - 1),
      dazzleTurns: Math.max(0, (u.dazzleTurns ?? 0) - 1),
    };
  };
  return {
    heroes: hList.map((h) => (h.curHp <= 0 ? h : tickOne(h))),
    monsters: mList.map((m) => (m.curHp <= 0 ? m : tickOne(m))),
  };
}

export function getIncomingHealMulFromPoison(target) {
  if (!target || (target.poisonTurns ?? 0) <= 0) return 1;
  return POISON_HEAL_RECV_MUL;
}

export function getDarknessDamageMul(attackerType, defender) {
  if (!defender || (defender.darknessTurns ?? 0) <= 0) return 1;
  if (attackerType !== 'dark') return 1;
  return DARKNESS_DARK_DMG_MUL;
}

export function getDazzleCritRateAdd(attacker) {
  if (!attacker || (attacker.dazzleTurns ?? 0) <= 0) return 0;
  return DAZZLE_CRIT_RATE_ADD;
}

export function getDazzleCritDmgMul(attacker) {
  if (!attacker || (attacker.dazzleTurns ?? 0) <= 0) return 1;
  return DAZZLE_CRIT_DMG_MUL;
}
