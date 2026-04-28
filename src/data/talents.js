/**
 * 3×3 天賦：每列三選一（可隨時切換）
 * - 第 1 列：HP / 物防 / 魔抗
 * - 第 2 列：攻擊 / 魔力 / 速度
 * - 第 3 列：角色專屬被動（三選一）
 */

export const TALENT_ROW_MUL_SMALL = 1.08;

export const TALENT_ROWS = [
  {
    id: 'r1',
    title: '生存',
    options: [
      { id: 'hp', name: '生命強化', description: `HP +${Math.round((TALENT_ROW_MUL_SMALL - 1) * 100)}%` },
      { id: 'def', name: '護甲強化', description: `物防 +${Math.round((TALENT_ROW_MUL_SMALL - 1) * 100)}%` },
      { id: 'mdef', name: '抗性強化', description: `魔抗 +${Math.round((TALENT_ROW_MUL_SMALL - 1) * 100)}%` },
    ],
  },
  {
    id: 'r2',
    title: '戰鬥',
    options: [
      { id: 'atk', name: '武力精進', description: `攻擊 +${Math.round((TALENT_ROW_MUL_SMALL - 1) * 100)}%` },
      { id: 'matk', name: '術式精進', description: `魔力 +${Math.round((TALENT_ROW_MUL_SMALL - 1) * 100)}%` },
      { id: 'spd', name: '迅捷步伐', description: `速度 +${Math.round((TALENT_ROW_MUL_SMALL - 1) * 100)}%` },
    ],
  },
];

/** 第 4 列：通用強化（需解鎖） */
export const TALENT_ROW4_LEVEL_MAX = 5;
export const TALENT_ROW4_OPTIONS = [
  {
    id: 'r4_skillMpDown',
    name: '術式省力',
    description: '施放技能時 MP 消耗降低（依第 4 列等級）。',
  },
  {
    id: 'r4_skillDmgUp',
    name: '術式增幅',
    description: '技能造成的傷害提高（依第 4 列等級）。',
  },
  {
    id: 'r4_critRateUp',
    name: '爆擊鍛鍊',
    description: '爆擊率提高（依第 4 列等級）。',
  },
];

/** 第 3 列：角色專屬被動 */
export const TALENT_ROW3_BY_HERO = {
  Puersz: {
    title: '普爾斯專屬',
    options: [
      {
        id: 'Puersz_burnSplashPlus',
        name: '燎原擴散',
        description: '「燎原勢」濺射傷害提高（濺射倍率 +0.15）。',
        effect: { type: 'skillSplashMulAdd', skillId: 'Puersz-3', add: 0.15 },
      },
      {
        id: 'Puersz_killMp',
        name: '焰返',
        description: '擊殺敵人時回復 8 MP。',
        effect: { type: 'onKillMp', value: 8 },
      },
      {
        id: 'Puersz_skillCritArcane',
        name: '術式暴擊',
        description: '魔攻／複合技能可以暴擊（沿用既有暴擊率／暴擊傷害）。',
        effect: { type: 'skillCritEnable', scales: ['matk', 'mix'] },
      },
    ],
  },
  xiongji: {
    title: '熊吉專屬',
    options: [
      {
        id: 'xiongji_seenDamage',
        name: '看破追擊',
        description: '對「看破」的敵人造成的傷害提高 12%。',
        effect: { type: 'dmgVsWeaknessSeenMul', mul: 1.12 },
      },
      {
        id: 'xiongji_buffPlus',
        name: '聲援餘韻',
        description: '由自己施放的強化效果持續回合 +1。',
        effect: { type: 'buffTurnsPlus', value: 1 },
      },
      {
        id: 'xiongji_turnMpSmall',
        name: '乘風回氣＋',
        description: '輪到自己行動時，額外回復 3 MP。',
        effect: { type: 'turnStartMp', value: 3 },
      },
    ],
  },
  baize: {
    title: '白澤專屬',
    options: [
      {
        id: 'baize_startTaunt',
        name: '不動之姿',
        description: '戰鬥開始時進入嘲諷（3 回合）。',
        effect: { type: 'battleStartTaunt', turns: 3 },
      },
      {
        id: 'baize_shieldDouble',
        name: '重壁',
        description: '「守護盾」護盾次數 +1（變成 2 次）。',
        effect: { type: 'barrierTurnsPlus', skillId: 'baize-1', value: 1 },
      },
      {
        id: 'baize_barrierBreakMp',
        name: '護盾回流',
        description: '「守護盾」賦予的護盾被擊破時，回復該角色 10 MP。',
        effect: { type: 'barrierBreakMp', skillId: 'baize-1', value: 10 },
      },
    ],
  },
  butiya: {
    title: '布提婭專屬',
    options: [
      {
        id: 'butiya_darkGravity',
        name: '暗引沉影',
        description: '「暗引力」命中後附加黑暗（2 回合）。',
        effect: { type: 'skillOnHitAilment', skillId: 'butiya-1', ailment: { type: 'darkness', turns: 2 } },
      },
      {
        id: 'butiya_slowMpDouble',
        name: '遲滯回氣',
        description: '攻擊被降低速度的敵人時，自己的 MP 回復加倍。',
        effect: { type: 'selfMpGainMulWhenAttackingSlowedTarget', mul: 2 },
      },
      {
        id: 'butiya_starfallMdefDown',
        name: '星隕裂抗',
        description: '「星隕」命中後附加敵方全體魔抗降低（小，2 回合）。',
        effect: { type: 'skillOnHitMdefDownAll', skillId: 'butiya-4', mul: 0.9, turns: 2 },
      },
    ],
  },
  bubu: {
    title: '布布專屬',
    options: [
      {
        id: 'bubu_healMul',
        name: '治療強化',
        description: '治療量提高 15%。',
        effect: { type: 'healMul', mul: 1.15 },
      },
      {
        id: 'bubu_chainBless',
        name: '連環祝福',
        description: '治療單體目標時，50% 機率再治療另一名存活隊友（治療量為本次的 40%）。',
        effect: { type: 'chainHealOnHeal', chance: 0.5, ratio: 0.4 },
      },
      {
        id: 'bubu_guardCycle',
        name: '守護循環',
        description: '我方角色受到直接傷害時，布布回復 2 MP（每回合最多觸發 3 次；DOT 不算）。',
        effect: { type: 'mpOnAllyDirectDamage', mp: 2, perTurnCap: 3 },
      },
    ],
  },
  butiya_halloween: {
    title: '萬聖節布提婭專屬',
    options: [
      {
        id: 'butiya_halloween_mpOnHitByAilmentedEnemy',
        name: '詛咒反饋',
        description: '受到持有異常狀態的敵人攻擊時，回復 5 MP（每回合最多 2 次）。',
        effect: { type: 'mpOnHitByAilmentedEnemy', mp: 5, perTurnCap: 2 },
      },
      {
        id: 'butiya_halloween_doubleDot',
        name: '疫焰加倍',
        description: '自身賦予敵人的 DOT 傷害加倍。',
        effect: { type: 'doubleDotFromSelf' },
      },
      {
        id: 'butiya_halloween_onKillSpd',
        name: '搗蛋疾走',
        description: '擊殺敵人時，自身獲得加速（2 回合）。',
        effect: { type: 'onKillSpdBuff', turns: 2, mul: 1.12 },
      },
    ],
  },
  bubu_harvest: {
    title: '豐收節布布專屬',
    options: [
      {
        id: 'bubu_harvest_sunflowerVsStunImmune',
        name: '葵花子追擊',
        description: '「葵花子射擊」對處於暈眩免疫的敵人造成的傷害提高 15%。',
        effect: { type: 'skillDmgVsStunImmuneMul', skillId: 'bubu_harvest-1', mul: 1.15 },
      },
      {
        id: 'bubu_harvest_sunbeamStunUp',
        name: '日芒鎖定',
        description: '「太陽光束」暈眩機率提高 5%。',
        effect: { type: 'skillAilmentChanceAdd', skillId: 'bubu_harvest-2', ailmentType: 'stun', add: 0.05 },
      },
      {
        id: 'bubu_harvest_healGivesMp',
        name: '療癒充能',
        description: '治療隊友時，額外使該目標回復 10 MP。',
        effect: { type: 'healTargetMpFlat', mp: 10 },
      },
    ],
  },
  moying: {
    title: '墨影專屬',
    options: [
      {
        id: 'moying_critLifesteal',
        name: '爆擊吸血',
        description: '自身造成暴擊傷害時，回復等同於該次暴擊傷害 25% 的 HP。',
        effect: { type: 'critLifesteal', mul: 0.25 },
      },
      {
        id: 'moying_onKillAtkBuff',
        name: '擊殺 + 攻擊',
        description: '擊殺敵人時，獲得攻擊提升（小，3 回合）。同回合多次擊殺可疊加。',
        effect: { type: 'onKillAtkBuff', mul: 1.08, turns: 3 },
      },
      {
        id: 'moying_multiHit',
        name: '夜戮・三連斬',
        description: '「夜戮」變為 48% 威力的 3 連擊（每擊各自判定暴擊）。',
        effect: { type: 'skillMultiHitOverride', skillId: 'moying-4', powerMul: 0.48, hits: 3 },
      },
    ],
  },
  jack: {
    title: '傑克專屬',
    options: [
      {
        id: 'jack_openingDazzle',
        name: '開幕眩術',
        description: '戰鬥開始時對敵方全體附加眩目（2 回合）。',
        effect: { type: 'battleStartDazzleAllEnemies', turns: 2 },
      },
      {
        id: 'jack_critSteal',
        name: '掠光竊印',
        description: '自身造成暴擊時，竊取敵方一個隨機增益（轉移到自己身上）。',
        effect: { type: 'critStealRandomBuffFromEnemy' },
      },
      {
        id: 'jack_allyMpOnBuff',
        name: '贈禮充能',
        description: '自身對隊友施加增益時，該名隊友回復 5 MP（不含自己）。',
        effect: { type: 'allyMpOnBuffFromSelf', mp: 5 },
      },
    ],
  },
  huji: {
    title: '虎吉專屬',
    options: [
      {
        id: 'huji_startTaunt',
        name: '山林王者',
        description: '戰鬥開始時進入嘲諷（2 回合）。',
        effect: { type: 'battleStartTaunt', turns: 2 },
      },
      {
        id: 'huji_pounceStunUp',
        name: '獵勢定身',
        description: '「猛虎撲殺」暈眩機率提高 10%。',
        effect: { type: 'skillAilmentChanceAdd', skillId: 'huji-3', ailmentType: 'stun', add: 0.1 },
      },
      {
        id: 'huji_incomingHeal',
        name: '野性恢復',
        description: '自身受到的治療量提高 15%。',
        effect: { type: 'incomingHealMul', mul: 1.15 },
      },
    ],
  },
};

