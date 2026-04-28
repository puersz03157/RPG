/** @typedef {{ id:string, name:string, price:number, desc:string, effect?: any, key?: boolean, maxStack?: number }} ShopItem */

export const ITEM_CATALOG = /** @type {const} */ ({
  it_potion: {
    id: 'it_potion',
    name: '治療藥水',
    price: 25,
    desc: '回復目標最大 HP 的 25%（單體，至少 120）。',
    effect: { type: 'healHp', target: 'ally-single', pct: 0.25, min: 120 },
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
  /** 餐酒館結帳時優先折抵等額金幣（1 筆料理抵 1 張） */
  it_tavern_voucher: {
    id: 'it_tavern_voucher',
    name: '通用餐卷',
    price: 100,
    maxStack: 99,
    desc: '在餐酒館點餐時優先使用；抵免該筆金幣消費（不足時才扣金幣）。',
    effect: { type: 'facilityVoucher', venue: 'tavern' },
  },
  /** 鍛造所「重抽詞條」專用；優先於金幣 */
  it_forge_token: {
    id: 'it_forge_token',
    name: '普通鍛造幣',
    price: 100,
    maxStack: 99,
    desc: '在鍛造所進行非指定重抽時優先使用；每枚抵 1 次重抽的費用。',
    effect: { type: 'facilityVoucher', venue: 'forgeReroll' },
  },
  /** 鍛造所「指定一條重抽」專用；優先於金幣 */
  it_forge_token_force: {
    id: 'it_forge_token_force',
    name: '指定鍛造幣',
    price: 200,
    maxStack: 99,
    desc: '在鍛造所進行指定屬性重抽時優先使用；每枚抵 1 次費用。',
    effect: { type: 'facilityVoucher', venue: 'forgeForce' },
  },
  /** 訓練場購買熟練度包時優先折抵 */
  it_training_guide: {
    id: 'it_training_guide',
    name: '訓練指導書',
    price: 70,
    maxStack: 99,
    desc: '在訓練場加購熟練度時優先使用；每本抵 1 次加購費用。',
    effect: { type: 'facilityVoucher', venue: 'training' },
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
    desc: '戰鬥中：為我方全體回復最大 HP 的 16%（每位至少 70；中毒者依比例減少治療）。',
    effect: { type: 'healHp', target: 'ally-all', pct: 0.16, min: 70 },
  },
  it_potion_mid: {
    id: 'it_potion_mid',
    name: '中級治療藥水',
    price: 55,
    desc: '戰鬥中：回復目標最大 HP 的 45%（單體，至少 220）。',
    effect: { type: 'healHp', target: 'ally-single', pct: 0.45, min: 220 },
  },

  // —— 休憩園：種子（大廳不可直接使用，僅圃內播種）——
  it_seed_salad: {
    id: 'it_seed_salad',
    name: '生菜種子包',
    price: 40,
    maxStack: 99,
    desc: '休憩園菜圃播種用。',
    effect: { type: 'gardenSeed', cropId: 'c_salad' },
  },
  it_seed_carrot: {
    id: 'it_seed_carrot',
    name: '紅蘿蔔種子包',
    price: 70,
    maxStack: 99,
    desc: '休憩園菜圃播種用。',
    effect: { type: 'gardenSeed', cropId: 'c_carrot' },
  },
  it_seed_melon: {
    id: 'it_seed_melon',
    name: '蜜瓜種子包',
    price: 120,
    maxStack: 99,
    desc: '休憩園菜圃播種用。',
    effect: { type: 'gardenSeed', cropId: 'c_melon' },
  },
  // 收成食材（之後可接餐酒館）
  it_ing_salad: {
    id: 'it_ing_salad',
    name: '鮮採葉菜',
    price: 8,
    maxStack: 99,
    desc: '休憩園採收。可出售或作為烹飪材料（開發中接軌餐酒館）。',
    effect: { type: 'material' },
  },
  it_ing_carrot: {
    id: 'it_ing_carrot',
    name: '鮮採紅蘿蔔',
    price: 12,
    maxStack: 99,
    desc: '休憩園採收。',
    effect: { type: 'material' },
  },
  it_ing_melon: {
    id: 'it_ing_melon',
    name: '鮮採蜜瓜',
    price: 22,
    maxStack: 99,
    desc: '休憩園採收。',
    effect: { type: 'material' },
  },
  // 釣魚用餌
  it_bait_worm: {
    id: 'it_bait_worm',
    name: '蟲餌',
    price: 18,
    maxStack: 99,
    desc: '休憩園釣魚時可選用，略提升較佳魚種出現權重。',
    effect: { type: 'material' },
  },
  it_bait_lure: {
    id: 'it_bait_lure',
    name: '擬餌',
    price: 45,
    maxStack: 99,
    desc: '高價擬餌，珍稀魚種權重更高。',
    effect: { type: 'material' },
  },
  // 魚類（材料／圖鑑）
  it_fish_minnow: {
    id: 'it_fish_minnow',
    name: '溝溝米諾魚',
    price: 6,
    maxStack: 99,
    desc: '休憩園釣獲時當場折算金幣；圖鑑仍計次。舊存貨可於商店出售。',
    effect: { type: 'material' },
  },
  it_fish_crucian: {
    id: 'it_fish_crucian',
    name: '野溝鯽',
    price: 8,
    maxStack: 99,
    desc: '休憩園釣獲時當場折算金幣；圖鑑仍計次。舊存貨可於商店出售。',
    effect: { type: 'material' },
  },
  it_fish_catfish: {
    id: 'it_fish_catfish',
    name: '鬍鯰',
    price: 16,
    maxStack: 99,
    desc: '休憩園釣獲時當場折算金幣；圖鑑仍計次。舊存貨可於商店出售。',
    effect: { type: 'material' },
  },
  it_fish_bass: {
    id: 'it_fish_bass',
    name: '溪鱸',
    price: 32,
    maxStack: 99,
    desc: '休憩園釣獲時當場折算金幣；圖鑑仍計次。舊存貨可於商店出售。',
    effect: { type: 'material' },
  },
  it_fish_koi: {
    id: 'it_fish_koi',
    name: '緋緋錦鯉',
    price: 88,
    maxStack: 99,
    desc: '休憩園釣獲時當場折算金幣；圖鑑仍計次。舊存貨可於商店出售。',
    effect: { type: 'material' },
  },
  it_fish_golden: {
    id: 'it_fish_golden',
    name: '金影游鯉',
    price: 220,
    maxStack: 99,
    desc: '休憩園釣獲時當場折算金幣；圖鑑仍計次。舊存貨可於商店出售。',
    effect: { type: 'material' },
  },
  it_fresh_fish_meat: {
    id: 'it_fresh_fish_meat',
    name: '新鮮魚肉',
    price: 12,
    maxStack: 99,
    desc: '釣魚成功時有機率附帶（整魚已折算金幣），烹飪用食材。',
    effect: { type: 'material' },
  },

  it_ore_copper: { id: 'it_ore_copper', name: '銅礦', price: 5, maxStack: 99, desc: '休憩園挖礦取得。', effect: { type: 'material' } },
  it_ore_silver: { id: 'it_ore_silver', name: '銀礦', price: 18, maxStack: 99, desc: '休憩園挖礦取得。', effect: { type: 'material' } },
  it_ore_gold: { id: 'it_ore_gold', name: '金礦', price: 45, maxStack: 99, desc: '休憩園挖礦取得。', effect: { type: 'material' } },

  it_hunt_wolf_fang: { id: 'it_hunt_wolf_fang', name: '狼牙', price: 14, maxStack: 99, desc: '休憩園狩獵。', effect: { type: 'material' } },
  it_hunt_wolf_pelt: { id: 'it_hunt_wolf_pelt', name: '狼皮', price: 22, maxStack: 99, desc: '休憩園狩獵。', effect: { type: 'material' } },
  it_hunt_boar_hide: { id: 'it_hunt_boar_hide', name: '野豬皮', price: 12, maxStack: 99, desc: '休憩園狩獵。', effect: { type: 'material' } },
  it_hunt_monster_meat: { id: 'it_hunt_monster_meat', name: '魔物肉', price: 10, maxStack: 99, desc: '休憩園狩獵。', effect: { type: 'material' } },
  it_hunt_feather: { id: 'it_hunt_feather', name: '魔羽', price: 16, maxStack: 99, desc: '休憩園狩獵。', effect: { type: 'material' } },
  it_hunt_egg: { id: 'it_hunt_egg', name: '魔物蛋', price: 28, maxStack: 99, desc: '休憩園狩獵。', effect: { type: 'material' } },
  it_hunt_dragon_scale: { id: 'it_hunt_dragon_scale', name: '龍鱗', price: 120, maxStack: 99, desc: '休憩園狩獵（極罕）。', effect: { type: 'material' } },
  it_hunt_dragon_fang: { id: 'it_hunt_dragon_fang', name: '龍牙', price: 160, maxStack: 99, desc: '休憩園狩獵（極罕）。', effect: { type: 'material' } },
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

