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
  't-underling': {
    id: 'ms-underling-hex',
    name: '破陣突刺',
    mpCost: 20,
    scale: 'atk',
    effect: { type: 'damage', target: 'enemy-single', powerMul: 1.15, debuff: { stat: 'def', mul: 0.85, turns: 2, chance: 0.6 } },
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
    { id: 'ms-thief-boss-sunder', name: '裂甲號令', mpCost: 26, effect: { type: 'allyBuff', stat: 'atk', mul: 1.25, turns: 2 } },
    { id: 'ms-thief-boss-cripple', name: '斷筋斬', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 0.95, debuff: { stat: 'spd', mul: 0.8, turns: 2, chance: 0.65 } } },
  ],
  'c4-flame-lizard': [
    { id: 'ms-c4fl-bite', name: '赤焰撕咬', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.12, ailment: { type: 'burn', stacks: 1, chance: 0.55 } } },
    { id: 'ms-c4fl-frenzy', name: '焦躁狂熱', mpCost: 22, effect: { type: 'selfBuff', stat: 'atk', mul: 1.28, turns: 2 } },
  ],
  'c4-magma-croc': [
    { id: 'ms-c4mc-crush', name: '熔顎粉碎', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.18, debuff: { stat: 'atk', mul: 0.85, turns: 2, chance: 0.55 } } },
    { id: 'ms-c4mc-guard', name: '熔甲硬化', mpCost: 24, effect: { type: 'selfBuff', stat: 'def', mul: 1.35, turns: 2 } },
  ],
  'c4-obsidian-giant': [
    { id: 'ms-c4og-slam', name: '黑曜崩擊', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.08, debuff: { stat: 'def+mdef', mul: 0.88, turns: 2, chance: 0.55 } } },
    { id: 'ms-c4og-quake', name: '碎地震盪', mpCost: 28, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.28, debuff: { stat: 'spd', mul: 0.85, turns: 2, chance: 0.45 } } },
  ],
  'c4-boiling-jelly': [
    { id: 'ms-c4bj-splash', name: '沸潮濺落', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.27, ailment: { type: 'poison', turns: 3, chance: 0.4 } } },
    { id: 'ms-c4bj-chill', name: '濕冷纏身', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.0, debuff: { stat: 'spd', mul: 0.8, turns: 2, chance: 0.6 } } },
  ],
  'c4-lava-worm': [
    { id: 'ms-c4lw-burst', name: '熔沙噴發', mpCost: 26, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.26, ailment: { type: 'burn', stacks: 1, chance: 0.4 } } },
    { id: 'ms-c4lw-bite', name: '地底噬咬', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.16 } },
  ],
  'c4-crimson-hound': [
    { id: 'ms-c4ch-pounce', name: '赤鬃撲咬', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.12, ailment: { type: 'stun', turns: 1, chance: 0.12 } } },
    { id: 'ms-c4ch-howl', name: '灼熱嚎鳴', mpCost: 22, effect: { type: 'allyBuff', stat: 'atk', mul: 1.22, turns: 2 } },
  ],
  'c4-magma-slug': [
    { id: 'ms-c4ms-slow', name: '熔渣黏滯', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.24, debuff: { stat: 'spd', mul: 0.82, turns: 2, chance: 0.5 } } },
    { id: 'ms-c4ms-shell', name: '炙殼加護', mpCost: 24, effect: { type: 'selfBuff', stat: 'def', mul: 1.4, turns: 2 } },
  ],
  'boss-lava-giant': [
    { id: 'ms-lava-giant-slam', name: '熔臂崩擊', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.02, ailment: { type: 'burn', stacks: 1 } } },
    { id: 'ms-lava-giant-splash', name: '岩漿濺落', mpCost: 26, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.3, ailment: { type: 'burn', stacks: 1 } } },
    { id: 'ms-lava-giant-grasp', name: '熔池擒握', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.08 } },
    { id: 'ms-lava-giant-heat', name: '熱浪鎮壓', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.26, debuff: { stat: 'atk', mul: 0.88, turns: 2, chance: 0.5 } } },
  ],
  /** 無攻擊技能；由 App 戰鬥 AI 處理脈動 */
  'c4-lava-core': [],
  'c6-dark-wraith': [
    { id: 'ms-c6dw-bite', name: '暗噬', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.38 } },
    { id: 'ms-c6dw-burst', name: '暗燃爆發', mpCost: 22, effect: { type: 'selfBuff', stat: 'atk', mul: 1.3, turns: 2 } },
    { id: 'ms-c6dw-fade', name: '黯潮侵蝕', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.05, debuff: { stat: 'def+mdef', mul: 0.86, turns: 2, chance: 0.6 } } },
  ],
  'c6-abyss-guard': [
    { id: 'ms-c6ag-slam', name: '深淵重擊', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.15 } },
    { id: 'ms-c6ag-shield', name: '岩盾強化', mpCost: 22, effect: { type: 'selfBuff', stat: 'def', mul: 1.35, turns: 2 } },
    { id: 'ms-c6ag-suppress', name: '鎮壓震波', mpCost: 26, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.25, debuff: { stat: 'atk', mul: 0.86, turns: 2, chance: 0.5 } } },
  ],
  'c6-void-eel': [
    { id: 'ms-c6ve-shock', name: '虛潮電擊', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.33 } },
    { id: 'ms-c6ve-cheer', name: '深海鼓舞', mpCost: 24, effect: { type: 'allyBuff', stat: 'atk', mul: 1.25, turns: 2 } },
    { id: 'ms-c6ve-drain', name: '潮汐纏繞', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.0, debuff: { stat: 'spd', mul: 0.8, turns: 2, chance: 0.65 } } },
  ],
  'c6-deep-crab': [
    { id: 'ms-c6dc-claw', name: '毒鉗夾擊', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.15, ailment: { type: 'poison', turns: 3 } } },
    { id: 'ms-c6dc-brine', name: '深海鹽蝕', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.24, debuff: { stat: 'def', mul: 0.86, turns: 2, chance: 0.5 } } },
  ],
  'c6-shadow-bat': [
    { id: 'ms-c6sb-screech', name: '黯鳴尖嘯', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.22, debuff: { stat: 'spd', mul: 0.82, turns: 2, chance: 0.5 } } },
    { id: 'ms-c6sb-bite', name: '裂翼啃咬', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.08 } },
  ],
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
    { id: 'ms-mummy-curse', name: '君王詛咒', mpCost: 26, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.26, debuff: { stat: 'atk', mul: 0.85, turns: 2, chance: 0.55 } } },
  ],
  'c5-pale-sentinel': [
    { id: 'ms-c5ps-smite', name: '蒼白裁決', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.12, debuff: { stat: 'def', mul: 0.86, turns: 2, chance: 0.55 } } },
    { id: 'ms-c5ps-aegis', name: '石衛加護', mpCost: 24, effect: { type: 'selfBuff', stat: 'def', mul: 1.4, turns: 2 } },
  ],
  'c5-rune-moth': [
    { id: 'ms-c5rm-glimmer', name: '磷光散佈', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.26, debuff: { stat: 'spd', mul: 0.82, turns: 2, chance: 0.5 } } },
    { id: 'ms-c5rm-sting', name: '符刺', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.08 } },
  ],
  'c5-echo-wisp': [
    { id: 'ms-c5ew-chime', name: '回音震顫', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.25, ailment: { type: 'darkness', turns: 2, chance: 0.35 } } },
    { id: 'ms-c5ew-focus', name: '共鳴凝聚', mpCost: 22, effect: { type: 'selfBuff', stat: 'atk', mul: 1.28, turns: 2 } },
  ],
  'c5-void-crawler': [
    { id: 'ms-c5vc-rend', name: '裂隙撕扯', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.12, ailment: { type: 'poison', turns: 3, chance: 0.4 } } },
    { id: 'ms-c5vc-sunder', name: '暗影破防', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 0.98, debuff: { stat: 'def+mdef', mul: 0.88, turns: 2, chance: 0.55 } } },
  ],
  'c5-dust-sprite': [
    { id: 'ms-c5ds-gale', name: '塵風亂流', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.24, debuff: { stat: 'atk', mul: 0.88, turns: 2, chance: 0.45 } } },
  ],
  'c5-vault-lumen': [
    { id: 'ms-c5vl-bastion', name: '封存壁壘', mpCost: 24, effect: { type: 'selfBuff', stat: 'def', mul: 1.45, turns: 2 } },
    { id: 'ms-c5vl-smash', name: '光衛震擊', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.1, debuff: { stat: 'spd', mul: 0.85, turns: 2, chance: 0.55 } } },
  ],
  'c5-prism-cantor': [
    { id: 'ms-c5pc-hymn', name: '稜鏡頌歌', mpCost: 24, effect: { type: 'allyBuff', stat: 'atk', mul: 1.22, turns: 2 } },
    { id: 'ms-c5pc-flash', name: '折光斬', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.05 } },
  ],
  'c5-deep-creek': [
    { id: 'ms-c5dc-surge', name: '幽泉激流', mpCost: 24, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.24, debuff: { stat: 'spd', mul: 0.82, turns: 2, chance: 0.45 } } },
  ],
  'c5-starfall-confessor': [
    { id: 'ms-c5sc-confess', name: '告解鎮壓', mpCost: 26, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.27, debuff: { stat: 'atk', mul: 0.86, turns: 2, chance: 0.55 } } },
    { id: 'ms-c5sc-pray', name: '星輝祈禱', mpCost: 24, effect: { type: 'selfBuff', stat: 'def', mul: 1.35, turns: 2 } },
  ],

  /** 第六章強化：百年樹長老（單體 BOSS） */
  'ex-boss-elder-tree': [
    {
      id: 'ms-ex-et-roots',
      name: '異界深根',
      mpCost: 24,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 1.12, debuff: { stat: 'spd', mul: 0.78, turns: 2, chance: 0.7 } },
    },
    {
      id: 'ms-ex-et-ring',
      name: '年輪震盪',
      mpCost: 28,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.32, debuff: { stat: 'def', mul: 0.84, turns: 2, chance: 0.55 } },
    },
    { id: 'ms-ex-et-bark', name: '古木甲殼', mpCost: 22, effect: { type: 'selfBuff', stat: 'def', mul: 1.42, turns: 2 } },
    {
      id: 'ms-ex-et-sap',
      name: '毒樹液噴濺',
      mpCost: 26,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.28, ailment: { type: 'poison', turns: 3, chance: 0.45 } },
    },
    {
      id: 'ms-ex-et-crush',
      name: '巨枝碾壓',
      mpCost: 22,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 1.18, debuff: { stat: 'def+mdef', mul: 0.86, turns: 2, chance: 0.6 } },
    },
  ],

  /** 第六章強化：冰封巨頸龍 */
  'ex-boss-frozen-longneck': [
    {
      id: 'ms-ex-fld-breath',
      name: '極寒吐息',
      mpCost: 28,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.34, debuff: { stat: 'spd', mul: 0.8, turns: 2, chance: 0.6 } },
    },
    {
      id: 'ms-ex-fld-bite',
      name: '頸枷碎骨',
      mpCost: 22,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 1.14, ailment: { type: 'stun', turns: 1, chance: 0.18 } },
    },
    { id: 'ms-ex-fld-frost', name: '霜嵐凝聚', mpCost: 24, effect: { type: 'selfBuff', stat: 'atk', mul: 1.32, turns: 2 } },
    {
      id: 'ms-ex-fld-blizzard',
      name: '永凍暴風',
      mpCost: 30,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.3, ailment: { type: 'darkness', turns: 2, chance: 0.4 } },
    },
  ],

  /** 第六章強化：暗影強盜首領 */
  'ex-boss-thief-shadow': [
    { id: 'ms-ex-ts-sweep', name: '影域橫掃', mpCost: 26, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.38 } },
    {
      id: 'ms-ex-ts-execute',
      name: '暗號處刑',
      mpCost: 22,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 1.12, debuff: { stat: 'def', mul: 0.82, turns: 2, chance: 0.65 } },
    },
    { id: 'ms-ex-ts-cloak', name: '掠奪帷幕', mpCost: 24, effect: { type: 'selfBuff', stat: 'atk', mul: 1.3, turns: 2 } },
    {
      id: 'ms-ex-ts-burn',
      name: '焚影斬',
      mpCost: 22,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 1.02, ailment: { type: 'burn', stacks: 1 } },
    },
    {
      id: 'ms-ex-ts-weaken',
      name: '暗影威嚇',
      mpCost: 26,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.28, debuff: { stat: 'atk', mul: 0.84, turns: 2, chance: 0.55 } },
    },
  ],

  /** 第七章強化：熔岩巨人（技能沿用原版邏輯，數值更兇） */
  'ex-boss-lava-giant': [
    { id: 'ms-ex-lg-slam', name: '熔臂崩擊·改', mpCost: 20, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.1, ailment: { type: 'burn', stacks: 1 } } },
    { id: 'ms-ex-lg-splash', name: '岩漿濺落·改', mpCost: 28, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.34, ailment: { type: 'burn', stacks: 1 } } },
    { id: 'ms-ex-lg-grasp', name: '熔池擒握·改', mpCost: 22, scale: 'atk', effect: { type: 'damage', target: 'enemy-single', powerMul: 1.14 } },
    {
      id: 'ms-ex-lg-heat',
      name: '熱浪鎮壓·改',
      mpCost: 26,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.3, debuff: { stat: 'atk', mul: 0.85, turns: 2, chance: 0.55 } },
    },
  ],
  /** 強化熔岩核心：無攻擊；脈動由戰鬥 AI 處理 */
  'ex-c7-lava-core': [],

  /** 第七章強化：木乃伊君王 */
  'ex-boss-mummy-abyss': [
    {
      id: 'ms-ex-ma-grasp',
      name: '冥河擒握',
      mpCost: 22,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 1.12, ailment: { type: 'poison', turns: 3 } },
    },
    { id: 'ms-ex-ma-wail', name: '冥冢怒號', mpCost: 30, scale: 'atk', effect: { type: 'damage', target: 'enemy-all', powerMul: 0.38 } },
    {
      id: 'ms-ex-ma-curse',
      name: '深淵君王詛咒',
      mpCost: 28,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-all', powerMul: 0.3, debuff: { stat: 'atk', mul: 0.82, turns: 2, chance: 0.6 } },
    },
    {
      id: 'ms-ex-ma-seal',
      name: '棺印烙印',
      mpCost: 24,
      scale: 'atk',
      effect: { type: 'damage', target: 'enemy-single', powerMul: 1.05, debuff: { stat: 'def+mdef', mul: 0.84, turns: 2, chance: 0.65 } },
    },
  ],
};

/** 熔岩巨人戰：核心／巨人 template id（含第四章原版與第七章強化） */
export const LAVA_CORE_TEMPLATE_IDS = new Set(['c4-lava-core', 'ex-c7-lava-core']);
export const LAVA_GIANT_TEMPLATE_IDS = new Set(['boss-lava-giant', 'ex-boss-lava-giant']);

export function isLavaCoreTemplateId(tid) {
  return !!tid && LAVA_CORE_TEMPLATE_IDS.has(String(tid));
}

export function isLavaGiantTemplateId(tid) {
  return !!tid && LAVA_GIANT_TEMPLATE_IDS.has(String(tid));
}

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

