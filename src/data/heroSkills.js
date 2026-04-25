/**
 * 每位英雄四格技能：
 * - mpCost：耗魔
 * - scale：技能吃哪個屬性（atk / matk / mix）
 * - effect：技能效果（目前先支援 damage）
 */
export const SKILLS_BY_HERO_ID = {
  h1: [
    { id: 'h1-1', name: '紅蓮斬', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1 } },
    {
      id: 'h1-2',
      name: '蓄火斬擊',
      mpCost: 14,
      scale: 'mix',
      effect: {
        type: 'damage',
        target: 'enemy-single',
        powerMul: 0.72,
        selfOnHit: { critRateMid: { turns: 3 } },
      },
    },
    {
      id: 'h1-3',
      name: '燎原勢',
      mpCost: 32,
      scale: 'matk',
      effect: {
        type: 'damage',
        target: 'enemy-single',
        powerMul: 0.8,
        splash: { powerMul: 0.5 },
      },
    },
    {
      id: 'h1-4',
      name: '燼滅斬',
      mpCost: 40,
      scale: 'mix',
      effect: {
        type: 'damage',
        target: 'enemy-single',
        powerMul: 1.45,
        selfOnHit: { critDmgSmall: { turns: 2 } },
      },
    },
  ],
  h2: [
    { id: 'h2-1', name: '疾風襲', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1 } },
    { id: 'h2-2', name: '巽風陣', mpCost: 22, scale: 'atk', effect: { type: 'buff', target: 'ally-all', stat: 'spd', mul: 1.12, turns: 2 } },
    { id: 'h2-3', name: '戰意集中', mpCost: 26, scale: 'atk', effect: { type: 'buff', target: 'ally-single', stat: 'atk+matk', mul: 1.15, turns: 2 } },
    {
      id: 'h2-4',
      name: '觀察聲援',
      mpCost: 36,
      scale: 'atk',
      effect: {
        type: 'observeCheer',
        ally: { stat: 'atk+matk', mul: 1.08, turns: 3 },
      },
    },
  ],
  h3: [
    { id: 'h3-1', name: '守護盾', mpCost: 20, scale: 'atk', effect: { type: 'barrier', target: 'ally-all', turns: 1, incomingMul: 0.85 } },
    {
      id: 'h3-2',
      name: '潮湧擊',
      mpCost: 16,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 0.75, debuff: { stat: 'atk', target: 'enemy-single', mul: 0.8, turns: 2, size: 'mid' } },
    },
    { id: 'h3-3', name: '不動嘲陣', mpCost: 24, scale: 'atk', effect: { type: 'taunt', target: 'self', turns: 3 } },
    {
      id: 'h3-4',
      name: '蒼壁碎',
      mpCost: 30,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.55, debuff: { stat: 'atk', target: 'enemy-all', mul: 0.9, turns: 2, size: 'small' } },
    },
  ],
  h4: [
    { id: 'h4-1', name: '暗引力', mpCost: 20, scale: 'matk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1 } },
    { id: 'h4-2', name: '影蝕', mpCost: 18, scale: 'matk', effect: { type: 'debuff', target: 'enemy-single', stat: 'def+mdef', mul: 0.8, turns: 2, damageMul: 0.35 } },
    { id: 'h4-3', name: '凝滯域', mpCost: 32, scale: 'matk', effect: { type: 'debuff', target: 'enemy-all', stat: 'spd', mul: 0.82, turns: 2 } },
    {
      id: 'h4-4',
      name: '星隕',
      mpCost: 42,
      scale: 'matk',
      // 敵方全體：倍率需低於單體大招（原 1.48），約為「對 3 隻總傷害 ≈ 對單 1.0×」的量級
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.58 },
    },
  ],
  h5: [
    { id: 'h5-1', name: '聖治癒', mpCost: 20, scale: 'matk', effect: { type: 'heal', target: 'ally-single', powerMul: 1.05 } },
    { id: 'h5-2', name: '恩澤迴響', mpCost: 16, scale: 'matk', effect: { type: 'regen', target: 'ally-all', turns: 3, powerMul: 0.24 } },
    {
      id: 'h5-3',
      name: '裁決束',
      mpCost: 30,
      scale: 'matk',
      effect: { type: 'cleanseOne', target: 'ally-all' },
    },
    { id: 'h5-4', name: '天罰', mpCost: 40, scale: 'matk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.4 } },
  ],
  /** 星曉祈願：暫沿用原型技能組（之後可換皮／換名） */
  h6: [
    { id: 'h6-1', name: '暗引力', mpCost: 20, scale: 'matk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1 } },
    { id: 'h6-2', name: '影蝕', mpCost: 18, scale: 'matk', effect: { type: 'debuff', target: 'enemy-single', stat: 'def+mdef', mul: 0.8, turns: 2, damageMul: 0.35 } },
    { id: 'h6-3', name: '凝滯域', mpCost: 32, scale: 'matk', effect: { type: 'debuff', target: 'enemy-all', stat: 'spd', mul: 0.82, turns: 2 } },
    { id: 'h6-4', name: '星隕', mpCost: 42, scale: 'matk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.58 } },
  ],
  h7: [
    { id: 'h7-1', name: '聖治癒', mpCost: 20, scale: 'matk', effect: { type: 'heal', target: 'ally-single', powerMul: 1.05 } },
    { id: 'h7-2', name: '恩澤迴響', mpCost: 16, scale: 'matk', effect: { type: 'regen', target: 'ally-all', turns: 3, powerMul: 0.24 } },
    { id: 'h7-3', name: '裁決束', mpCost: 30, scale: 'matk', effect: { type: 'cleanseOne', target: 'ally-all' } },
    { id: 'h7-4', name: '天罰', mpCost: 40, scale: 'matk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.4 } },
  ],
  h8: [
    { id: 'h8-1', name: '影穿', mpCost: 18, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1 } },
    {
      id: 'h8-2',
      name: '裂甲刺',
      mpCost: 18,
      scale: 'atk',
      effect: {
        type: 'damage',
        target: 'enemy-single',
        powerMul: 0.78,
        debuff: { stat: 'def', target: 'enemy-single', mul: 0.72, turns: 3, size: 'mid' },
      },
    },
    {
      id: 'h8-3',
      name: '影賦陣',
      mpCost: 26,
      scale: 'atk',
      effect: { type: 'debuff', target: 'enemy-single', stat: 'spd', mul: 0.68, turns: 3 },
    },
    { id: 'h8-4', name: '夜戮', mpCost: 40, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.38 } },
  ],
  h9: [
    {
      id: 'h9-1',
      name: '假面點刺',
      mpCost: 20,
      scale: 'atk',
      effect: {
        type: 'damage',
        target: 'enemy-single',
        powerMul: 1,
        selfOnHit: { itemInvertTurns: 3 },
      },
    },
    {
      id: 'h9-2',
      name: '鎂光騙局',
      mpCost: 24,
      scale: 'matk',
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.48, dazzleAll: { turns: 2 } },
    },
    {
      id: 'h9-3',
      name: '怪盜洗牌',
      mpCost: 28,
      scale: 'mix',
      effect: { type: 'jackPhantomDrawAll', turns: 3, mul: 1.12 },
    },
    { id: 'h9-4', name: '謝幕黑燈', mpCost: 38, scale: 'mix', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.56 } },
  ],
};

export function getSkillsForHero(hero) {
  if (!hero?.id) return [];
  return SKILLS_BY_HERO_ID[hero.id] ?? [];
}
