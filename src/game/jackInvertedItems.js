/** 傑克「道具反轉」：戰鬥道具改為進攻／干擾（數值與道具檔次對齊） */

export function isJackItemInvertActive(hero) {
  return hero?.id === 'jack' && (hero?.itemInvertTurns ?? 0) > 0;
}

/** 反轉後需選敵單體的道具 */
export function jackInvertedItemNeedsEnemyTarget(item) {
  const t = item?.effect?.type;
  if (t === 'healHp' && item.effect?.target === 'ally-single') return true;
  if (t === 'restoreMp') return true;
  if (t === 'cleanseOneNegative') return true;
  return false;
}

export function jackInvertedItemIsAllyAllHeal(item) {
  return item?.effect?.type === 'healHp' && item.effect?.target === 'ally-all';
}

function jackPower(jack) {
  const atk = Math.max(0, Math.floor(Number(jack?.atk) || 0));
  const matk = Math.max(0, Math.floor(Number(jack?.matk) || 0));
  // 傑克是 mix 技能多，因此用 atk + matk 的混合基準
  return Math.max(1, Math.floor(atk * 0.85 + matk * 0.85));
}

export function getJackInvertedSingleDamage(itemId, jack) {
  const base = jackPower(jack);
  const ratio = itemId === 'it_potion_mid' ? 0.85 : itemId === 'it_potion' ? 0.55 : 0.45;
  return { amount: Math.max(1, Math.floor(base * ratio)) };
}

export function getJackInvertedMpDrain(itemId) {
  if (itemId === 'it_ether_mid') return 26;
  if (itemId === 'it_ether') return 14;
  return 12;
}

export function getJackInvertedDustDamagePerEnemy(jack) {
  const base = jackPower(jack);
  return Math.max(1, Math.floor(base * 0.25));
}

export function getJackInvertedPanaceaDamage(jack) {
  const base = jackPower(jack);
  return Math.max(1, Math.floor(base * 0.65));
}
