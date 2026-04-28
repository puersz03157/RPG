import { HEROES_BASE } from '../data/units.js';
import { mapHeroId } from '../data/heroIdMap.js';
import { loadPartyIds } from './partyStorage.js';
import { loadAllHeroesUnlocked, loadUnlockedHeroIds } from './heroUnlockStorage.js';

const KEY = 'aethelgard-lobby-hero-v1';

const allowedIds = () => new Set(HEROES_BASE.map((h) => h.id));

function isHeroUnlockedForInit(heroId) {
  if (loadAllHeroesUnlocked()) return true;
  return loadUnlockedHeroIds().includes(heroId);
}

function partyDefault() {
  const p = loadPartyIds();
  const id = p[0] ?? HEROES_BASE[0]?.id ?? 'Puersz';
  return allowedIds().has(id) ? id : HEROES_BASE[0]?.id ?? 'Puersz';
}

/** 首次載入：有存檔且仍解鎖則用存檔，否則用隊伍首位。 */
export function getInitialLobbyHeroId() {
  const fallback = partyDefault();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const id = mapHeroId(typeof parsed === 'string' ? parsed : parsed?.id);
    if (!id || !allowedIds().has(id)) return fallback;
    if (!isHeroUnlockedForInit(id)) return fallback;
    return id;
  } catch {
    return fallback;
  }
}

export function saveLobbyHeroId(heroId) {
  if (typeof window === 'undefined') return;
  if (!heroId || !allowedIds().has(heroId)) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(heroId));
  } catch {
    /* ignore */
  }
}

export function clearLobbyHeroStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
