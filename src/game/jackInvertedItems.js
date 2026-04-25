/** 傑克「道具反轉」：戰鬥道具改為進攻／干擾（數值與道具檔次對齊） */

export function isJackItemInvertActive(hero) {
  return hero?.id === 'h9' && (hero?.itemInvertTurns ?? 0) > 0;
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

export function getJackInvertedSingleDamage(itemId) {
  if (itemId === 'it_potion') return { amount: 52 };
  if (itemId === 'it_potion_mid') return { amount: 112 };
  return { amount: 40 };
}

export function getJackInvertedMpDrain(itemId) {
  if (itemId === 'it_ether_mid') return 26;
  if (itemId === 'it_ether') return 14;
  return 12;
}

export function getJackInvertedDustDamagePerEnemy() {
  return 36;
}

export function getJackInvertedPanaceaDamage() {
  return 58;
}
