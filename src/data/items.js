/** @typedef {{ id:string, name:string, price:number, desc:string, effect?: any, key?: boolean, maxStack?: number }} ShopItem */

export const ITEM_CATALOG = /** @type {const} */ ({
  it_potion: {
    id: 'it_potion',
    name: '治療藥水',
    price: 25,
    desc: '回復 160 HP（單體）。',
    effect: { type: 'healHp', target: 'ally-single', amount: 160 },
  },
  it_ether: {
    id: 'it_ether',
    name: '魔力藥水',
    price: 28,
    desc: '回復 35 MP（單體）。',
    effect: { type: 'restoreMp', target: 'ally-single', amount: 35 },
  },
  it_ether_mid: {
    id: 'it_ether_mid',
    name: '中級魔力藥水',
    price: 52,
    desc: '戰鬥中：回復 58 MP（單體）。',
    effect: { type: 'restoreMp', target: 'ally-single', amount: 58 },
  },
  it_panacea: {
    id: 'it_panacea',
    name: '萬靈藥',
    price: 60,
    desc: '解除 1 個異常狀態（單體）。',
    effect: { type: 'cleanseOneNegative', target: 'ally-single' },
  },
  it_exp_ticket: {
    id: 'it_exp_ticket',
    name: '經驗關卡入場券',
    price: 0,
    desc: '使用後恢復 1 次經驗關卡挑戰次數。',
    effect: { type: 'expStageTicket', amount: 1 },
  },
  it_purify_prism: {
    id: 'it_purify_prism',
    name: '淨化稜晶',
    price: 0,
    key: true,
    maxStack: 4,
    desc: '重要道具。各章 Boss 首次擊破掉落；最多持有 4。',
    effect: { type: 'keyItem' },
  },
  it_training_book_low: {
    id: 'it_training_book_low',
    name: '下級修煉手冊',
    price: 100,
    desc: '使用後使角色升 1 級（最高 10 級）。',
    effect: { type: 'manualLevelUp', amount: 1, maxLevel: 10 },
  },
  it_training_book_low_plus: {
    id: 'it_training_book_low_plus',
    name: '下級修煉手冊+',
    price: 200,
    desc: '使用後使角色升 1 級（僅限 Lv.20 以下，最高升到 Lv.20）。',
    effect: { type: 'manualLevelUp', amount: 1, maxLevel: 20 },
  },
  it_training_book_mid: {
    id: 'it_training_book_mid',
    name: '中級修煉手冊',
    price: 380,
    desc: '使用後使角色升 1 級（僅限 Lv.30 以下，最高升到 Lv.30）。',
    effect: { type: 'manualLevelUp', amount: 1, maxLevel: 30 },
  },
  it_training_book_mid_plus: {
    id: 'it_training_book_mid_plus',
    name: '中級修煉手冊+',
    price: 520,
    desc: '使用後使角色升 1 級（僅限 Lv.40 以下，最高升到 Lv.40）。',
    effect: { type: 'manualLevelUp', amount: 1, maxLevel: 40 },
  },
  it_healing_dust: {
    id: 'it_healing_dust',
    name: '治癒粉塵',
    price: 95,
    desc: '戰鬥中：為我方全體回復 HP（每位 110，中毒者依比例減少治療）。',
    effect: { type: 'healHp', target: 'ally-all', amount: 110 },
  },
  it_potion_mid: {
    id: 'it_potion_mid',
    name: '中級治療藥水',
    price: 55,
    desc: '戰鬥中：回復 300 HP（單體）。',
    effect: { type: 'healHp', target: 'ally-single', amount: 300 },
  },
});

export function getItemMaxStack(itemOrId) {
  const it = typeof itemOrId === 'string' ? getItem(itemOrId) : itemOrId;
  if (!it) return 999;
  const n = it.maxStack;
  if (n == null) return 999;
  return Math.max(1, Math.min(999, Math.floor(Number(n)) || 1));
}

export function canUseInBattle(item) {
  const t = item?.effect?.type;
  if (t === 'restoreMp' || t === 'cleanseOneNegative') return true;
  if (t === 'healHp') return item?.effect?.target === 'ally-single' || item?.effect?.target === 'ally-all';
  return false;
}

export function listItems() {
  return Object.values(ITEM_CATALOG);
}

export function getItem(itemId) {
  if (!itemId) return null;
  return ITEM_CATALOG[itemId] ?? null;
}

export function getItemSellPrice(item) {
  if (item?.key) return 0;
  const price = item?.price ?? 0;
  return Math.max(1, Math.floor(price * 0.5));
}

