import { TALENT_ROW_MUL_SMALL, TALENT_ROW3_BY_HERO } from '../data/talents.js';

export function getTalentPick(talentMap, heroId) {
  const m = talentMap ?? {};
  return m[heroId] ?? {};
}

export function getHeroRow3Def(heroId) {
  return TALENT_ROW3_BY_HERO[heroId] ?? { title: '專屬', options: [] };
}

export function getHeroRow3Effect(talentMap, heroId) {
  const pick = getTalentPick(talentMap, heroId);
  const r3 = pick?.r3 ?? null;
  const def = getHeroRow3Def(heroId);
  const opt = (def.options ?? []).find((o) => o.id === r3);
  return opt?.effect ?? null;
}

export function applyTalentStatsToUnit(unit, talentMap) {
  if (!unit?.isHero) return unit;
  const pick = getTalentPick(talentMap, unit.id);
  const r1 = pick?.r1 ?? null;
  const r2 = pick?.r2 ?? null;

  let hp = unit.hp;
  let atk = unit.atk;
  let def = unit.def;
  let mdef = unit.mdef ?? unit.def;
  let matk = unit.matk ?? 0;
  let spd = unit.spd ?? 1;

  if (r1 === 'hp') hp = Math.max(1, Math.round(hp * TALENT_ROW_MUL_SMALL));
  if (r1 === 'def') def = Math.max(1, Math.round(def * TALENT_ROW_MUL_SMALL));
  if (r1 === 'mdef') mdef = Math.max(1, Math.round(mdef * TALENT_ROW_MUL_SMALL));

  if (r2 === 'atk') atk = Math.max(1, Math.round(atk * TALENT_ROW_MUL_SMALL));
  if (r2 === 'matk') matk = Math.max(0, Math.round(matk * TALENT_ROW_MUL_SMALL));
  if (r2 === 'spd') spd = Math.max(1, Math.round(spd * TALENT_ROW_MUL_SMALL));

  return { ...unit, hp, atk, def, mdef, matk, spd };
}

export function getBuffTurnsBonusFromTalents(talentMap, casterHeroId) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type === 'buffTurnsPlus') return Math.max(0, e.value ?? 0);
  return 0;
}

export function getExtraTurnStartMpFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type === 'turnStartMp') return Math.max(0, e.value ?? 0);
  return 0;
}

export function getDamageMulFromTalents({ talentMap, attacker, target }) {
  if (!attacker?.isHero) return 1;
  const e = getHeroRow3Effect(talentMap, attacker.id);
  if (e?.type === 'dmgVsWeaknessSeenMul') {
    if (target?.weaknessSeen) return typeof e.mul === 'number' ? e.mul : 1;
  }
  return 1;
}

export function getSkillDamageMulVsStunImmuneFromTalents({ talentMap, casterHeroId, skillId, target }) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type !== 'skillDmgVsStunImmuneMul') return 1;
  if (e.skillId && skillId && e.skillId !== skillId) return 1;
  if (!target || (target.stunImmuneTurns ?? 0) <= 0) return 1;
  return typeof e.mul === 'number' ? Math.max(0, e.mul) : 1;
}

export function getSkillAilmentChanceAddFromTalents({ talentMap, casterHeroId, skillId, ailmentType }) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type !== 'skillAilmentChanceAdd') return 0;
  if (e.skillId && skillId && e.skillId !== skillId) return 0;
  if (e.ailmentType && ailmentType && e.ailmentType !== ailmentType) return 0;
  return typeof e.add === 'number' ? e.add : 0;
}

export function getHealTargetMpFlatFromTalents(talentMap, casterHeroId) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type !== 'healTargetMpFlat') return 0;
  return Math.max(0, Math.floor(Number(e.mp) || 0));
}

export function getOutgoingHealMulFromTalents(talentMap, casterHeroId) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type !== 'healMul') return 1;
  return typeof e.mul === 'number' ? Math.max(0, e.mul) : 1;
}

export function getIncomingHealMulFromTalents(talentMap, targetHeroId) {
  const e = getHeroRow3Effect(talentMap, targetHeroId);
  if (e?.type !== 'incomingHealMul') return 1;
  return typeof e.mul === 'number' ? Math.max(0, e.mul) : 1;
}

export function getChainHealOnHealFromTalents(talentMap, casterHeroId) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type !== 'chainHealOnHeal') return null;
  const chance = typeof e.chance === 'number' ? Math.max(0, Math.min(1, e.chance)) : 0;
  const ratio = typeof e.ratio === 'number' ? Math.max(0, e.ratio) : 0;
  if (!(chance > 0) || !(ratio > 0)) return null;
  return { chance, ratio };
}

export function getMpOnAllyDirectDamageFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type !== 'mpOnAllyDirectDamage') return null;
  const mp = Math.max(0, Math.floor(Number(e.mp) || 0));
  const perTurnCap = Math.max(0, Math.floor(Number(e.perTurnCap) || 0));
  if (!(mp > 0) || !(perTurnCap > 0)) return null;
  return { mp, perTurnCap };
}

export function getMpOnHitByAilmentedEnemyFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type !== 'mpOnHitByAilmentedEnemy') return null;
  const mp = Math.max(0, Math.floor(Number(e.mp) || 0));
  const perTurnCap = Math.max(0, Math.floor(Number(e.perTurnCap) || 0));
  if (!(mp > 0) || !(perTurnCap > 0)) return null;
  return { mp, perTurnCap };
}

export function hasDoubleDotFromSelfTalent(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  return e?.type === 'doubleDotFromSelf';
}

export function getOnKillSpdBuffFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type !== 'onKillSpdBuff') return null;
  const turns = Math.max(1, Math.floor(Number(e.turns) || 0));
  const mul = typeof e.mul === 'number' ? e.mul : 1;
  if (!(mul > 1) || !(turns > 0)) return null;
  return { turns, mul };
}

export function getSplashMulOverrideFromTalents({ talentMap, caster, skill, baseMul }) {
  if (!caster?.isHero) return baseMul;
  const e = getHeroRow3Effect(talentMap, caster.id);
  if (e?.type === 'skillSplashMulAdd') {
    const ok = !e.skillId || (skill?.id && e.skillId === skill.id);
    if (ok) return Math.max(0, (baseMul ?? 0) + (e.add ?? 0));
  }
  return baseMul;
}

export function canSkillCritFromTalents({ talentMap, attacker, isSkill, scale }) {
  if (!attacker?.isHero || !isSkill) return false;
  const e = getHeroRow3Effect(talentMap, attacker.id);
  if (e?.type !== 'skillCritEnable') return false;
  const scales = Array.isArray(e.scales) ? e.scales : [];
  return scales.includes(scale);
}

export function getOnKillMpFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type === 'onKillMp') return Math.max(0, e.value ?? 0);
  return 0;
}

export function getCritLifestealMulFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type !== 'critLifesteal') return 0;
  return Math.max(0, Number(e.mul) || 0);
}

export function getOnKillAtkBuffFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type !== 'onKillAtkBuff') return null;
  const mul = Number(e.mul) || 1;
  const turns = Math.max(1, Math.floor(Number(e.turns) || 0));
  if (!(mul > 1) || !(turns > 0)) return null;
  return { mul, turns };
}

export function getSkillMultiHitOverrideFromTalents({ talentMap, casterHeroId, skillId }) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type !== 'skillMultiHitOverride') return null;
  if (e.skillId && skillId && e.skillId !== skillId) return null;
  const hits = Math.max(1, Math.floor(Number(e.hits) || 1));
  const powerMul = Number(e.powerMul) || 1;
  return { hits, powerMul };
}

export function canCritStealRandomBuffFromEnemyFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  return e?.type === 'critStealRandomBuffFromEnemy';
}

export function getBattleStartTauntTurnsFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type === 'battleStartTaunt') return Math.max(0, e.turns ?? 0);
  return 0;
}

export function getBattleStartDazzleAllTurnsFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type === 'battleStartDazzleAllEnemies') return Math.max(0, Math.floor(Number(e.turns) || 0));
  return 0;
}

/** 傑克等：對隊友施放增益時，每名受增益隊友額外回復的 MP（不含施术者自己）。 */
export function getAllyMpOnBuffFromSelfFromTalents(talentMap, casterHeroId) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type !== 'allyMpOnBuffFromSelf') return 0;
  return Math.max(0, Math.floor(Number(e.mp) || 0));
}

export function getBarrierTurnsPlusFromTalents({ talentMap, casterHeroId, skillId }) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type === 'barrierTurnsPlus') {
    if (!e.skillId || e.skillId === skillId) return Math.max(0, e.value ?? 0);
  }
  return 0;
}

export function getBarrierBreakMpFromTalents({ talentMap, heroId, skillId }) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type === 'barrierBreakMp') {
    if (!e.skillId || e.skillId === skillId) return Math.max(0, e.value ?? 0);
  }
  return 0;
}

export function getSkillOnHitAilmentFromTalents({ talentMap, casterHeroId, skillId }) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type !== 'skillOnHitAilment') return null;
  if (e.skillId && skillId && e.skillId !== skillId) return null;
  const a = e.ailment ?? null;
  if (!a || typeof a !== 'object') return null;
  return a;
}

export function getSelfMpGainMulWhenAttackingSlowedTargetFromTalents(talentMap, heroId) {
  const e = getHeroRow3Effect(talentMap, heroId);
  if (e?.type !== 'selfMpGainMulWhenAttackingSlowedTarget') return 1;
  return typeof e.mul === 'number' ? Math.max(0, e.mul) : 1;
}

export function getSkillOnHitMdefDownAllFromTalents({ talentMap, casterHeroId, skillId }) {
  const e = getHeroRow3Effect(talentMap, casterHeroId);
  if (e?.type !== 'skillOnHitMdefDownAll') return null;
  if (e.skillId && skillId && e.skillId !== skillId) return null;
  const turns = Math.max(1, e.turns ?? 2);
  const mul = typeof e.mul === 'number' ? e.mul : 1;
  return { turns, mul };
}

