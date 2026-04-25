import { EQUIPMENT_CATALOG, getEquipItem } from '../data/equipment.js';
import { ITEM_CATALOG, getItem, getItemMaxStack } from '../data/items.js';

const EQUIP_KEY = 'aethelgard-equip-inv';
const ITEM_KEY = 'aethelgard-item-inv';

function clampCount(n) {
  const v = Math.floor(Number(n) || 0);
  return Math.max(0, Math.min(999, v));
}

function defaultEquipInv() {
  return {};
}

function defaultItemInv() {
  return { it_potion: 2 };
}

export function loadEquipInventory() {
  const base = defaultEquipInv();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(EQUIP_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    const out = { ...base };
    for (const id of Object.keys(EQUIPMENT_CATALOG)) {
      const v = parsed[id];
      if (v == null) continue;
      if (getEquipItem(id)) out[id] = clampCount(v);
    }
    return out;
  } catch {
    return base;
  }
}

export function saveEquipInventory(inv) {
  if (typeof window === 'undefined') return;
  try {
    const slim = {};
    for (const id of Object.keys(EQUIPMENT_CATALOG)) {
      const c = clampCount(inv?.[id]);
      if (c > 0) slim[id] = c;
    }
    window.localStorage.setItem(EQUIP_KEY, JSON.stringify(slim));
  } catch {
    /* ignore */
  }
}

export function clearEquipInventory() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(EQUIP_KEY);
  } catch {
    /* ignore */
  }
}

export function loadItemInventory() {
  const base = defaultItemInv();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(ITEM_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    const merged = { ...parsed };
    const legacyPure = clampCount(merged.it_pure_prism);
    if (legacyPure > 0) {
      const cur = clampCount(merged.it_purify_prism);
      const mx = getItemMaxStack('it_purify_prism');
      merged.it_purify_prism = Math.min(mx, cur + legacyPure);
      delete merged.it_pure_prism;
    }
    const out = { ...base };
    for (const id of Object.keys(ITEM_CATALOG)) {
      const v = merged[id];
      if (v == null) continue;
      if (getItem(id)) {
        const mx = getItemMaxStack(id);
        out[id] = Math.min(mx, clampCount(v));
      }
    }
    return out;
  } catch {
    return base;
  }
}

export function saveItemInventory(inv) {
  if (typeof window === 'undefined') return;
  try {
    const slim = {};
    for (const id of Object.keys(ITEM_CATALOG)) {
      const c = clampCount(inv?.[id]);
      if (c > 0) slim[id] = c;
    }
    window.localStorage.setItem(ITEM_KEY, JSON.stringify(slim));
  } catch {
    /* ignore */
  }
}

export function clearItemInventory() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ITEM_KEY);
  } catch {
    /* ignore */
  }
}

export function getInvCount(inv, id) {
  if (!getItem(id)) return 0;
  const mx = getItemMaxStack(id);
  return Math.min(mx, clampCount(inv?.[id]));
}

export function incInv(inv, id, delta) {
  const next = { ...(inv ?? {}) };
  if (!getItem(id)) return next;
  const mx = getItemMaxStack(id);
  const cur = clampCount(next[id]);
  const nextVal = Math.min(mx, Math.max(0, cur + Math.floor(Number(delta) || 0)));
  if (nextVal <= 0) delete next[id];
  else next[id] = nextVal;
  return next;
}

const EQUIP_MAX_STACK = 999;

/** 裝備背包數量（與道具的 getInvCount 分開，因 catalog 不同） */
export function getEquipInvCount(inv, id) {
  if (!getEquipItem(id)) return 0;
  return Math.min(EQUIP_MAX_STACK, clampCount(inv?.[id]));
}

export function incEquipInv(inv, id, delta) {
  const next = { ...(inv ?? {}) };
  if (!getEquipItem(id)) return next;
  const cur = clampCount(next[id]);
  const nextVal = Math.min(EQUIP_MAX_STACK, Math.max(0, cur + Math.floor(Number(delta) || 0)));
  if (nextVal <= 0) delete next[id];
  else next[id] = nextVal;
  return next;
}

