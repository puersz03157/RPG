/** 敵方元素類型（與 units type 對應） */
export const ELEMENT_LABEL_ZH = {
  fire: '火',
  wind: '風',
  water: '水',
  dark: '暗',
  light: '光',
};

/** 最常見相剋：火剋風、風剋水、水剋火；光暗互剋 */
const WEAK_TO = {
  fire: 'water',
  wind: 'fire',
  water: 'wind',
  dark: 'light',
  light: 'dark',
};

/**
 * 看破後顯示：「元素／較易突破的防線」
 * mdef 較低 → 魔抗（建議魔攻）；def 較低或相等 → 防禦（建議物攻）
 */
export function getWeaknessRevealLabel(unit) {
  if (!unit || unit.isHero || !unit.weaknessSeen) return null;
  const weakType = WEAK_TO[unit.type] ?? unit.type;
  const el = ELEMENT_LABEL_ZH[weakType] ?? '？';
  const def = unit.def ?? 0;
  const mdef = unit.mdef ?? def;
  const second = mdef < def ? '魔抗' : '防禦';
  return `${el}／${second}`;
}
