import { EQUIPMENT_CATALOG, getEquipItem } from '../data/equipment.js';
import { HEROES_BASE } from '../data/units.js';
import { mapHeroIdKeys } from '../data/heroIdMap.js';
import { loadHeroEquipMap as loadHeroEquipMapV1, saveHeroEquipMap as saveHeroEquipMapV1, defaultEquip as defaultEquipV1 } from './equipmentStorage.js';
import { loadEquipInventory as loadEquipInvV1, saveEquipInventory as saveEquipInvV1 } from './inventoryStorage.js';
import { loadEquipAffixMap as loadEquipAffixMapV1, saveEquipAffixMap as saveEquipAffixMapV1 } from './equipAffixStorage.js';

const STORAGE_KEY = 'aethelgard-equip-instances-v1';
const HERO_EQUIP_V2_KEY = 'aethelgard-hero-equip-v2';

/**
 * @typedef {{ eid: string, itemId: string, affixes?: Array<{id:string,stat:string,value:number}>, salt?: number, locked?: boolean }} EquipInstance
 * @typedef {{ weaponEid: string|null, offhandEid: string|null, armorEid: string|null }} HeroEquipV2
 */

function clampInt(n, lo, hi) {
  const x = Math.floor(Number(n) || 0);
  return Math.max(lo, Math.min(hi, x));
}

function newEid() {
  return `eq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeInstance(x) {
  if (!x || typeof x !== 'object') return null;
  const itemId = typeof x.itemId === 'string' ? x.itemId : null;
  if (!getEquipItem(itemId)) return null;
  const eid = typeof x.eid === 'string' && x.eid ? x.eid : newEid();
  const affixes = Array.isArray(x.affixes) ? x.affixes.filter(Boolean) : [];
  const salt = clampInt(x.salt ?? 0, 0, 999999);
  const locked = !!x.locked;
  return { eid, itemId, affixes, salt, locked };
}

function defaultHeroEquipV2() {
  return { weaponEid: null, offhandEid: null, armorEid: null };
}

function allHeroIds() {
  return HEROES_BASE.map((h) => h.id);
}

export function loadHeroEquipMapV2() {
  const ids = allHeroIds();
  const base = Object.fromEntries(ids.map((id) => [id, defaultHeroEquipV2()]));
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(HERO_EQUIP_V2_KEY);
    if (!raw) return base;
    const parsed0 = JSON.parse(raw);
    const parsed = mapHeroIdKeys(parsed0);
    if (!parsed || typeof parsed !== 'object') return base;
    const out = { ...base };
    for (const id of ids) {
      const p = parsed[id];
      out[id] = {
        weaponEid: typeof p?.weaponEid === 'string' ? p.weaponEid : null,
        offhandEid: typeof p?.offhandEid === 'string' ? p.offhandEid : null,
        armorEid: typeof p?.armorEid === 'string' ? p.armorEid : null,
      };
    }
    return out;
  } catch {
    return base;
  }
}

export function saveHeroEquipMapV2(map) {
  if (typeof window === 'undefined') return;
  try {
    const ids = allHeroIds();
    const slim = {};
    for (const id of ids) {
      const p = map?.[id] ?? defaultHeroEquipV2();
      slim[id] = {
        weaponEid: typeof p.weaponEid === 'string' ? p.weaponEid : null,
        offhandEid: typeof p.offhandEid === 'string' ? p.offhandEid : null,
        armorEid: typeof p.armorEid === 'string' ? p.armorEid : null,
      };
    }
    window.localStorage.setItem(HERO_EQUIP_V2_KEY, JSON.stringify(slim));
  } catch {
    /* ignore */
  }
}

export function loadEquipInstances() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeInstance).filter(Boolean);
  } catch {
    return [];
  }
}

export function saveEquipInstances(list) {
  if (typeof window === 'undefined') return;
  try {
    const slim = (Array.isArray(list) ? list : []).map(sanitizeInstance).filter(Boolean);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* ignore */
  }
}

/**
 * 一次性遷移：
 * - 舊庫存：aethelgard-equip-inv（count by itemId）→ instances
 * - 舊穿戴：aethelgard-hero-equip（itemId per slot）+ aethelgard-equip-affixes-v1（hero+slot 詞條）→ instances + hero-equip-v2（eid per slot）
 * - 遷移後會清空舊 equipAffixMap（避免雙軌）
 */
export function migrateEquipToInstancesIfNeeded() {
  if (typeof window === 'undefined') return { instances: [], heroEquipV2: loadHeroEquipMapV2(), migrated: false };
  const hasNew = !!window.localStorage.getItem(STORAGE_KEY) && !!window.localStorage.getItem(HERO_EQUIP_V2_KEY);
  if (hasNew) return { instances: loadEquipInstances(), heroEquipV2: loadHeroEquipMapV2(), migrated: false };

  const equipInvV1 = loadEquipInvV1();
  const heroEquipV1 = loadHeroEquipMapV1();
  const affixV1 = loadEquipAffixMapV1();

  /** @type {EquipInstance[]} */
  const instances = [];
  const heroEquipV2 = loadHeroEquipMapV2(); // base

  // helper: take one count from v1 inventory
  const decCount = (itemId) => {
    if (!itemId) return;
    const cur = clampInt(equipInvV1?.[itemId] ?? 0, 0, 999);
    const next = Math.max(0, cur - 1);
    if (next <= 0) delete equipInvV1[itemId];
    else equipInvV1[itemId] = next;
  };

  // 1) migrate equipped items first (so affixes can be preserved)
  for (const hid of allHeroIds()) {
    const eq = heroEquipV1?.[hid] ?? defaultEquipV1();
    const slots = [
      { key: 'weapon', itemId: eq.weaponId },
      { key: 'offhand', itemId: eq.offhandId },
      { key: 'armor', itemId: eq.armorId },
    ];
    for (const s of slots) {
      const it = getEquipItem(s.itemId);
      if (!it) continue;
      const fx = affixV1?.[hid]?.[s.key];
      const affixes = fx?.itemId === s.itemId && Array.isArray(fx?.affixes) ? fx.affixes : [];
      const salt = clampInt(fx?.salt ?? 0, 0, 999999);
      const inst = { eid: newEid(), itemId: s.itemId, affixes, salt, locked: false };
      instances.push(inst);
      heroEquipV2[hid] = {
        ...(heroEquipV2[hid] ?? defaultHeroEquipV2()),
        ...(s.key === 'weapon' ? { weaponEid: inst.eid } : {}),
        ...(s.key === 'offhand' ? { offhandEid: inst.eid } : {}),
        ...(s.key === 'armor' ? { armorEid: inst.eid } : {}),
      };
      decCount(s.itemId);
    }
  }

  // 2) migrate remaining inventory counts into plain instances (no affixes yet)
  for (const itemId of Object.keys(EQUIPMENT_CATALOG)) {
    const c = clampInt(equipInvV1?.[itemId] ?? 0, 0, 999);
    for (let i = 0; i < c; i += 1) instances.push({ eid: newEid(), itemId, affixes: [], salt: 0, locked: false });
  }

  // persist new
  saveEquipInstances(instances);
  saveHeroEquipMapV2(heroEquipV2);

  // keep v1 storages but make them inert to prevent double effects
  try {
    saveEquipInvV1({}); // legacy counts no longer used
    saveHeroEquipMapV1(heroEquipV1); // keep (won't be read by new code) but don't destroy player data
    saveEquipAffixMapV1({}); // legacy affixes become instance-bound
  } catch {
    /* ignore */
  }

  return { instances, heroEquipV2, migrated: true };
}

