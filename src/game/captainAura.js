import { HEROES_BASE } from '../data/units.js';

export function getCaptainPassiveDef(captainId) {
  if (!captainId) return null;
  const def = HEROES_BASE.find((h) => h.id === captainId);
  return def?.captainPassive ?? null;
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
    let matk = u.matk;
    let spd = u.spd;
    let incomingDmgMul = 1;

    if (effect) {
      switch (effect.type) {
        case 'allyAtkMul':
          atk = Math.max(1, Math.round(atk * effect.value));
          break;
        case 'allySpdMul':
          spd = Math.max(1, Math.round(spd * effect.value));
          break;
        case 'allyDefMul':
          def = Math.max(1, Math.round(def * effect.value));
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
      matk,
      spd,
      curHp: u.hp,
      curMp: 100,
      av: 10000 / spd,
      isHero: true,
      status: null,
      barrierTurns: 0,
      barrierMul: 1,
      lastHitMpTurn: -1,
      guardStartTurnSeq: -1,
      guardNoHitRewardedSeq: -1,
      atkBuffTurns: 0,
      atkBuffMul: 1,
      incomingDmgMul,
    };
  });

  const auraLine =
    passive?.name && passive?.description
      ? `隊長技【${passive.name}】${passive.description}`
      : null;

  return { heroes, auraLine };
}
