export const BASIC_MONSTER_SKILLS_BY_TYPE = {
  fire: { id: 'ms-fire', name: '灼熱衝擊', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.35 } },
  wind: { id: 'ms-wind', name: '裂風突刺', mpCost: 18, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.3 } },
  water: { id: 'ms-water', name: '激流撞擊', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.33 } },
  dark: { id: 'ms-dark', name: '暗影撕咬', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.38 } },
  light: { id: 'ms-light', name: '聖光震盪', mpCost: 18, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.28 } },
};

export function getMonsterBasicSkill(monster) {
  if (!monster) return null;
  return BASIC_MONSTER_SKILLS_BY_TYPE[monster.type] ?? null;
}

