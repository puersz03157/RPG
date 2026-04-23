/**
 * 每位英雄四格技能：
 * - mpCost：耗魔
 * - scale：技能吃哪個屬性（atk / matk / mix）
 * - effect：技能效果（目前先支援 damage）
 */
export const SKILLS_BY_HERO_ID = {
  h1: [
    { id: 'h1-1', name: '紅蓮斬', mpCost: 20, scale: 'mix', effect: { type: 'damage', target: 'enemy-single', powerMul: 1 } },
    { id: 'h1-2', name: '焦熱痕', mpCost: 14, scale: 'mix', effect: { type: 'damage', target: 'enemy-single', powerMul: 0.72 } },
    { id: 'h1-3', name: '燎原勢', mpCost: 32, scale: 'mix', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.95 } },
    { id: 'h1-4', name: '燼滅斬', mpCost: 40, scale: 'mix', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.45 } },
  ],
  h2: [
    { id: 'h2-1', name: '疾風襲', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1 } },
    { id: 'h2-2', name: '戰意鼓舞', mpCost: 18, scale: 'atk', effect: { type: 'buff', target: 'ally-all', stat: 'atk', mul: 1.15, turns: 2 } },
    { id: 'h2-3', name: '破陣突', mpCost: 28, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.22 } },
    { id: 'h2-4', name: '真空斬', mpCost: 36, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.38 } },
  ],
  h3: [
    { id: 'h3-1', name: '守護盾', mpCost: 20, scale: 'atk', effect: { type: 'barrier', target: 'ally-all', turns: 1, incomingMul: 0.85 } },
    { id: 'h3-2', name: '潮湧擊', mpCost: 16, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 0.75 } },
    { id: 'h3-3', name: '淵流縛', mpCost: 30, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.18 } },
    { id: 'h3-4', name: '蒼壁碎', mpCost: 38, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.32 } },
  ],
  h4: [
    { id: 'h4-1', name: '暗引力', mpCost: 20, scale: 'matk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1 } },
    { id: 'h4-2', name: '影蝕', mpCost: 18, scale: 'matk', effect: { type: 'debuff', target: 'enemy-single', stat: 'def+mdef', mul: 0.8, turns: 2, damageMul: 0.35 } },
    { id: 'h4-3', name: '凝滯域', mpCost: 32, scale: 'matk', effect: { type: 'debuff', target: 'enemy-all', stat: 'spd', mul: 0.82, turns: 2 } },
    { id: 'h4-4', name: '星隕', mpCost: 42, scale: 'matk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.48 } },
  ],
  h5: [
    { id: 'h5-1', name: '聖治癒', mpCost: 20, scale: 'matk', effect: { type: 'heal', target: 'ally-single', powerMul: 1.05 } },
    { id: 'h5-2', name: '恩澤迴響', mpCost: 16, scale: 'matk', effect: { type: 'regen', target: 'ally-all', turns: 3, powerMul: 0.24 } },
    { id: 'h5-3', name: '裁決束', mpCost: 30, scale: 'matk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.2 } },
    { id: 'h5-4', name: '天罰', mpCost: 40, scale: 'matk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.4 } },
  ],
};

export function getSkillsForHero(hero) {
  if (!hero?.id) return [];
  return SKILLS_BY_HERO_ID[hero.id] ?? [];
}
