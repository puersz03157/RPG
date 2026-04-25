export const BASIC_MONSTER_SKILLS_BY_TYPE = {
  fire: { id: 'ms-fire', name: '灼熱衝擊', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.35 } },
  wind: { id: 'ms-wind', name: '裂風突刺', mpCost: 18, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.3 } },
  water: { id: 'ms-water', name: '激流撞擊', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.33 } },
  dark: { id: 'ms-dark', name: '暗影撕咬', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.38 } },
  light: { id: 'ms-light', name: '聖光震盪', mpCost: 18, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.28 } },
};

export const BASIC_MONSTER_SKILLS_BY_ID = {
  't-thug': {
    id: 'ms-thug-poison',
    name: '毒刃突刺',
    mpCost: 18,
    scale: 'atk',
    effect: { type: 'damage', target: 'enemy-single', powerMul: 1.2, ailment: { type: 'poison', turns: 3 } },
  },
  't-leader': {
    id: 'ms-leader-burn',
    name: '縱火瓶',
    mpCost: 22,
    scale: 'atk',
    effect: { type: 'damage', target: 'enemy-single', powerMul: 1.25, ailment: { type: 'burn', stacks: 1 } },
  },
  'boss-butiya': [
    // 參考 h4 技能組（稍微弱化）：單體、暗咒、全體
    { id: 'ms-butiya-grav', name: '暗引力', mpCost: 18, scale: 'matk', effect: { type: 'damage', target: 'enemy-single', powerMul: 0.92 } },
    {
      id: 'ms-butiya-curse',
      name: '影蝕',
      mpCost: 20,
      scale: 'matk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 0.75, ailment: { type: 'darkness', turns: 3 } },
    },
    { id: 'ms-butiya-meteor', name: '星隕', mpCost: 34, scale: 'matk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.38 } },
  ],
  'boss-thief': [
    { id: 'ms-thief-boss-cleave', name: '裂刃橫掃', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.33 } },
    { id: 'ms-thief-boss-crush', name: '首領重擊', mpCost: 18, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.05 } },
    { id: 'ms-thief-boss-ignite', name: '焚火斬', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 0.9, ailment: { type: 'burn', stacks: 1 } } },
  ],
  'boss-lava-giant': [
    { id: 'ms-lava-giant-slam', name: '熔臂崩擊', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.02, ailment: { type: 'burn', stacks: 1 } } },
    { id: 'ms-lava-giant-splash', name: '岩漿濺落', mpCost: 26, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.3, ailment: { type: 'burn', stacks: 1 } } },
    { id: 'ms-lava-giant-grasp', name: '熔池擒握', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.08 } },
  ],
  /** 無攻擊技能；由 App 戰鬥 AI 處理脈動 */
  'c4-lava-core': [],
  'boss-mummy-sovereign': [
    { id: 'ms-mummy-grasp', name: '君王擒握', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.08 } },
    { id: 'ms-mummy-wail', name: '冥冢哭嘯', mpCost: 28, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.34 } },
    {
      id: 'ms-mummy-bind',
      name: '腐朽纏縛',
      mpCost: 22,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 0.95, ailment: { type: 'poison', turns: 3 } },
    },
  ],
};

export function monsterTemplateId(monsterId) {
  if (typeof monsterId !== 'string') return monsterId;
  return monsterId.replace(/-\d+$/, '');
}

export function getMonsterSkillSet(monster) {
  if (!monster) return [];
  const tid = monsterTemplateId(monster.id);
  const byId = BASIC_MONSTER_SKILLS_BY_ID[monster.id] ?? BASIC_MONSTER_SKILLS_BY_ID[tid];
  if (Array.isArray(byId)) return byId;
  if (byId) return [byId];
  const byType = BASIC_MONSTER_SKILLS_BY_TYPE[monster.type] ?? null;
  return byType ? [byType] : [];
}

export function getMonsterBasicSkill(monster) {
  return getMonsterSkillSet(monster)[0] ?? null;
}

