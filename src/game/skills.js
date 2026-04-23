export function getSkillTargeting(skill) {
  const effect = skill?.effect;
  if (!effect) return { requiresTarget: true, side: 'enemy', mode: 'single' };

  if (effect.target === 'enemy-all') return { requiresTarget: false, side: 'enemy', mode: 'all' };
  if (effect.target === 'ally-all') return { requiresTarget: false, side: 'ally', mode: 'all' };
  if (effect.target === 'ally-single') return { requiresTarget: true, side: 'ally', mode: 'single' };
  return { requiresTarget: true, side: 'enemy', mode: 'single' };
}

/** 怪物行動條用有效速度（減速 debuff 時低於基礎 spd） */
export function getEffectiveSpd(unit) {
  if (!unit) return 1;
  const base = unit.spd ?? 1;
  if (unit.isHero) return Math.max(1, base);
  const turns = unit.spdDownTurns ?? 0;
  const mul = turns > 0 ? (typeof unit.spdDownMul === 'number' ? unit.spdDownMul : 1) : 1;
  return Math.max(1, Math.floor(base * mul));
}

/** spd 變動時重算 av，使行動條位置與新速度一致（變慢則 av 變大、變快則 av 變小） */
export function rescaleAvForSpdChange(prevAv, oldEffSpd, newEffSpd) {
  if (oldEffSpd <= 0 || newEffSpd <= 0) return prevAv;
  if (oldEffSpd === newEffSpd) return prevAv;
  return prevAv * (oldEffSpd / newEffSpd);
}

/** 每回合開始觸發一次的緩回量（依施術者當下 matk） */
export function resolveRegenHealPerTick(caster, effect) {
  const powerMul = effect?.powerMul ?? 0.2;
  const matk = caster?.matk ?? 0;
  return Math.max(1, Math.floor(matk * powerMul * 0.28));
}

export function getRegenAllDef(skill) {
  const effect = skill?.effect;
  if (!effect || effect.type !== 'regen' || effect.target !== 'ally-all') return null;
  return {
    turns: Math.max(1, effect.turns ?? 1),
    powerMul: typeof effect.powerMul === 'number' ? effect.powerMul : 0.2,
  };
}

export function getSlowAllDef(skill) {
  const effect = skill?.effect;
  if (!effect || effect.type !== 'debuff' || effect.target !== 'enemy-all') return null;
  if (effect.stat !== 'spd') return null;
  return {
    turns: Math.max(1, effect.turns ?? 1),
    mul: typeof effect.mul === 'number' ? effect.mul : 0.85,
  };
}

/**
 * 技能結算雛形：先支援 enemy-single 的 damage。
 * 後續要擴充治療/狀態/全體，只要在這裡加 effect.type 分支。
 */
export function resolveSkillDamage({ caster, target, skill, getDamage }) {
  const effect = skill?.effect;
  if (!effect || effect.type !== 'damage') return { damage: 0 };

  const scale = skill?.scale ?? 'matk';
  const powerMul = effect.powerMul ?? 1;
  const damage = getDamage(caster, target, true, powerMul, scale);
  return { damage };
}

export function resolveSkillHeal({ caster, target, skill }) {
  const effect = skill?.effect;
  if (!effect || effect.type !== 'heal') return { heal: 0 };

  const scale = skill?.scale ?? 'matk';
  const powerMul = effect.powerMul ?? 1;

  // 先做簡單版：治療量以 matk 為主（未來可依 scale 再擴充）
  const base = scale === 'atk' ? caster.atk : scale === 'mix' ? caster.atk * 0.5 + (caster.matk ?? 0) * 0.8 : caster.matk ?? 0;
  const heal = Math.max(1, Math.floor(base * powerMul * (0.9 + Math.random() * 0.2)));
  return { heal };
}

export function getBarrierDef(skill) {
  const effect = skill?.effect;
  if (!effect || effect.type !== 'barrier') return null;
  return {
    turns: Math.max(1, effect.turns ?? 1),
    incomingMul: typeof effect.incomingMul === 'number' ? effect.incomingMul : 0.9,
  };
}

export function getBuffAllDef(skill) {
  const effect = skill?.effect;
  if (!effect || effect.type !== 'buff' || effect.target !== 'ally-all') return null;
  if (effect.stat !== 'atk') return null;
  return {
    turns: Math.max(1, effect.turns ?? 1),
    mul: typeof effect.mul === 'number' ? effect.mul : 1,
  };
}

export function getDebuffDef(skill) {
  const effect = skill?.effect;
  if (!effect || effect.type !== 'debuff' || effect.target !== 'enemy-single') return null;
  return {
    stat: effect.stat,
    turns: Math.max(1, effect.turns ?? 1),
    mul: typeof effect.mul === 'number' ? effect.mul : 1,
  };
}

