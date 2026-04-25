export const EQUIP_SLOTS = /** @type {const} */ ({
  weapon: 'weapon',
  offhand: 'offhand',
  armor: 'armor',
});

/** @typedef {{ id:string, name:string, slot:'weapon'|'offhand'|'armor', price:number, stats: Partial<{hp:number, atk:number, matk:number, def:number, mdef:number, spd:number}>, shopPrismMin?: number }} EquipItem */

/** 基礎裝備庫：先做少量可測的示例裝備（後續可再擴充/掉落/商店） */
export const EQUIPMENT_CATALOG = /** @type {const} */ ({
  // weapons
  w_iron_sword: { id: 'w_iron_sword', name: '鐵劍', slot: 'weapon', price: 60, stats: { atk: 18 } },
  w_apprentice_staff: { id: 'w_apprentice_staff', name: '見習法杖', slot: 'weapon', price: 65, stats: { matk: 20 } },
  w_hunters_bow: { id: 'w_hunters_bow', name: '獵手短弓', slot: 'weapon', price: 62, stats: { atk: 12, spd: 2 } },

  // offhands
  o_small_shield: { id: 'o_small_shield', name: '小圓盾', slot: 'offhand', price: 58, stats: { def: 18, mdef: 6 } },
  o_charm: { id: 'o_charm', name: '護符', slot: 'offhand', price: 55, stats: { hp: 60 } },
  o_focus_orb: { id: 'o_focus_orb', name: '聚能寶珠', slot: 'offhand', price: 64, stats: { matk: 10, def: 6, mdef: 6 } },

  // armors
  a_leather: { id: 'a_leather', name: '皮甲', slot: 'armor', price: 70, stats: { def: 14, mdef: 8, hp: 40 } },
  a_chain: { id: 'a_chain', name: '鎖子甲', slot: 'armor', price: 78, stats: { def: 22, mdef: 10, spd: -2 } },
  a_mage_robe: { id: 'a_mage_robe', name: '術士長袍', slot: 'armor', price: 72, stats: { matk: 8, mdef: 14, hp: 30 } },

  // 第三顆淨化稜晶後商店進貨（數值為初階裝備的強化版）
  w_steel_sword: { id: 'w_steel_sword', name: '鋼刃長劍', slot: 'weapon', price: 125, stats: { atk: 28 }, shopPrismMin: 3 },
  w_arcane_rod: { id: 'w_arcane_rod', name: '秘紋法杖', slot: 'weapon', price: 132, stats: { matk: 32 }, shopPrismMin: 3 },
  w_composite_bow: { id: 'w_composite_bow', name: '複合戰弓', slot: 'weapon', price: 128, stats: { atk: 18, spd: 5 }, shopPrismMin: 3 },
  o_tower_shield: { id: 'o_tower_shield', name: '塔盾', slot: 'offhand', price: 118, stats: { def: 32, mdef: 12 }, shopPrismMin: 3 },
  o_spirit_charm: { id: 'o_spirit_charm', name: '靈脈護符', slot: 'offhand', price: 115, stats: { hp: 110, matk: 8 }, shopPrismMin: 3 },
  o_mystic_orb: { id: 'o_mystic_orb', name: '秘法靈珠', slot: 'offhand', price: 130, stats: { matk: 16, def: 10, mdef: 10 }, shopPrismMin: 3 },
  a_steel_mail: { id: 'a_steel_mail', name: '鋼環胸甲', slot: 'armor', price: 142, stats: { def: 36, mdef: 16, hp: 55, spd: -1 }, shopPrismMin: 3 },
  a_battle_mail: { id: 'a_battle_mail', name: '戰陣鎧衣', slot: 'armor', price: 155, stats: { def: 42, mdef: 18, hp: 52, spd: -3 }, shopPrismMin: 3 },
  a_scholar_gown: { id: 'a_scholar_gown', name: '學者法衣', slot: 'armor', price: 148, stats: { matk: 14, mdef: 22, hp: 48 }, shopPrismMin: 3 },
});

export function getEquipSellPrice(item) {
  const price = item?.price ?? 0;
  return Math.max(1, Math.floor(price * 0.6));
}

export function listEquipBySlot(slot) {
  return Object.values(EQUIPMENT_CATALOG).filter((it) => it.slot === slot);
}

export function getEquipItem(itemId) {
  if (!itemId) return null;
  return EQUIPMENT_CATALOG[itemId] ?? null;
}

