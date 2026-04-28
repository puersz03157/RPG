import { HEROES_BASE } from '../data/units.js';

export function getCaptainPassiveDef(captainId) {
  if (!captainId) return null;
  const def = HEROES_BASE.find((h) => h.id === captainId);
  return def?.captainPassive ?? null;
}

/** 戰鬥結算經驗倍率（僅隊長；buildBattleHeroesWithAura 不處理此 effect） */
export function getCaptainBattleXpMultiplier(captainId) {
  const eff = getCaptainPassiveDef(captainId)?.effect;
  if (eff?.type === 'partyXpMul' && typeof eff.value === 'number' && eff.value > 0) return eff.value;
  return 1;
}

/** 戰鬥結算金幣倍率（僅隊長） */
export function getCaptainBattleGoldMultiplier(captainId) {
  const eff = getCaptainPassiveDef(captainId)?.effect;
  if (eff?.type === 'partyGoldMul' && typeof eff.value === 'number' && eff.value > 0) return eff.value;
  return 1;
}

/**
 * 依隊長被動調整上場角色戰鬥數值；回傳的每位英雄皆帶 incomingDmgMul（預設 1）。
 */
export function buildBattleHeroesWithAura(roster, captainId) {
  const captainIdResolved = captainId ?? roster[0]?.id;
  const passive = getCaptainPassiveDef(captainIdResolved);
  const effect = passive?.effect;

  const heroes = roster.map((u) => {
    let atk = u.atk;
    let def = u.def;
    let mdef = u.mdef ?? u.def;
    let matk = u.matk;
    let spd = u.spd;
    let incomingDmgMul = 1;
    let captainCritRateAdd = 0;
    let captainDmgVsDazzledMul = 1;
    let captainDmgVsStunnedOrImmuneMul = 1;

    if (effect) {
      switch (effect.type) {
        case 'allyDmgVsDazzledEnemyMul':
          captainDmgVsDazzledMul =
            typeof effect.value === 'number' && effect.value > 1 ? Math.min(2, effect.value) : 1;
          break;
        case 'allyDmgVsStunnedOrImmuneMul':
          captainDmgVsStunnedOrImmuneMul =
            typeof effect.value === 'number' && effect.value > 1 ? Math.min(2, effect.value) : 1;
          break;
        case 'allyCritRateAdd':
          captainCritRateAdd =
            typeof effect.value === 'number' && effect.value > 0 ? Math.min(0.5, effect.value) : 0;
          break;
        case 'allyAtkMul':
          atk = Math.max(1, Math.round(atk * effect.value));
          break;
        case 'allyAtkMatkMul':
          atk = Math.max(1, Math.round(atk * (effect.atk ?? 1)));
          matk = Math.max(0, Math.round(matk * (effect.matk ?? 1)));
          break;
        case 'allySpdMul':
          spd = Math.max(1, Math.round(spd * effect.value));
          break;
        case 'allyDefMul':
          def = Math.max(1, Math.round(def * effect.value));
          mdef = Math.max(1, Math.round(mdef * effect.value));
          break;
        case 'allyMatkMul':
          matk = Math.max(1, Math.round(matk * effect.value));
          break;
        case 'allyIncomingDmgMul':
          incomingDmgMul = effect.value;
          break;
        default:
          break;
      }
    }

    return {
      ...u,
      atk,
      def,
      mdef,
      matk,
      spd,
      captainCritRateAdd,
      captainDmgVsDazzledMul,
      captainDmgVsStunnedOrImmuneMul,
      curHp: u.hp,
      curMp: 100,
      av: 10000 / spd,
      isHero: true,
      status: null,
      barrierTurns: 0,
      barrierMul: 1,
      barrierSource: null,
      lastHitMpTurn: -1,
      guardStartTurnSeq: -1,
      guardNoHitRewardedSeq: -1,
      atkBuffTurns: 0,
      atkBuffMul: 1,
      matkBuffTurns: 0,
      matkBuffMul: 1,
      spdBuffTurns: 0,
      spdBuffMul: 1,
      incomingDmgMul,
      regenTurns: 0,
      regenHeal: 0,
      tauntTurns: 0,
      critRateBuffTurns: 0,
      critRateBuffAdd: 0,
      critDmgBuffTurns: 0,
      critDmgBuffMul: 1,
    };
  });

  const auraLine =
    passive?.name && passive?.description
      ? `隊長技【${passive.name}】${passive.description}`
      : null;

  return { heroes, auraLine };
}
