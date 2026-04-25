import { HEROES_BASE } from '../data/units.js';
import { getEquipItem } from '../data/equipment.js';

const STORAGE_KEY = 'aethelgard-hero-equip';

export function defaultEquip() {
  return { weaponId: null, offhandId: null, armorId: null };
}

function allHeroIds() {
  return HEROES_BASE.map((h) => h.id);
}

function sanitizeEquip(obj) {
  const weaponId = typeof obj?.weaponId === 'string' ? obj.weaponId : null;
  const offhandId = typeof obj?.offhandId === 'string' ? obj.offhandId : null;
  const armorId = typeof obj?.armorId === 'string' ? obj.armorId : null;
  return {
    weaponId: getEquipItem(weaponId)?.slot === 'weapon' ? weaponId : null,
    offhandId: getEquipItem(offhandId)?.slot === 'offhand' ? offhandId : null,
    armorId: getEquipItem(armorId)?.slot === 'armor' ? armorId : null,
  };
}

export function loadHeroEquipMap() {
  const ids = allHeroIds();
  const base = Object.fromEntries(ids.map((id) => [id, defaultEquip()]));
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    const out = { ...base };
    for (const id of ids) {
      out[id] = sanitizeEquip(parsed[id]);
    }
    return out;
  } catch {
    return base;
  }
}

export function saveHeroEquipMap(map) {
  if (typeof window === 'undefined') return;
  try {
    const ids = allHeroIds();
    const slim = {};
    for (const id of ids) {
      slim[id] = sanitizeEquip(map?.[id] ?? defaultEquip());
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* ignore */
  }
}

export function clearHeroEquipStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getEquipSummary(equip) {
  const w = getEquipItem(equip?.weaponId);
  const o = getEquipItem(equip?.offhandId);
  const a = getEquipItem(equip?.armorId);
  return {
    weapon: w?.name ?? '—',
    offhand: o?.name ?? '—',
    armor: a?.name ?? '—',
  };
}

export function getEquipStatBonus(equip) {
  const items = [getEquipItem(equip?.weaponId), getEquipItem(equip?.offhandId), getEquipItem(equip?.armorId)].filter(Boolean);
  const bonus = { hp: 0, atk: 0, matk: 0, def: 0, mdef: 0, spd: 0 };
  for (const it of items) {
    const s = it.stats ?? {};
    bonus.hp += s.hp ?? 0;
    bonus.atk += s.atk ?? 0;
    bonus.matk += s.matk ?? 0;
    bonus.def += s.def ?? 0;
    bonus.mdef += s.mdef ?? 0;
    bonus.spd += s.spd ?? 0;
  }
  return bonus;
}

export function applyEquipmentToHero(heroBase, equip) {
  const b = getEquipStatBonus(equip);
  return {
    ...heroBase,
    equip,
    hp: Math.max(1, (heroBase.hp ?? 1) + b.hp),
    atk: Math.max(1, (heroBase.atk ?? 1) + b.atk),
    matk: Math.max(0, (heroBase.matk ?? 0) + b.matk),
    def: Math.max(1, (heroBase.def ?? 1) + b.def),
    mdef: Math.max(1, Math.round((heroBase.mdef ?? heroBase.def ?? 1) + b.mdef)),
    spd: Math.max(1, (heroBase.spd ?? 1) + b.spd),
  };
}

