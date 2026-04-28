import { LOBBY_BACKGROUNDS, DEFAULT_LOBBY_BG_ID } from '../data/lobbyBackgrounds.js';

const KEY = 'aethelgard-lobby-bg-v1';

function isValidId(id) {
  return typeof id === 'string' && LOBBY_BACKGROUNDS.some((b) => b.id === id);
}

export function loadLobbyBgId() {
  if (typeof window === 'undefined') return DEFAULT_LOBBY_BG_ID;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_LOBBY_BG_ID;
    const parsed = JSON.parse(raw);
    const id = typeof parsed === 'string' ? parsed : parsed?.id;
    return isValidId(id) ? id : DEFAULT_LOBBY_BG_ID;
  } catch {
    return DEFAULT_LOBBY_BG_ID;
  }
}

export function saveLobbyBgId(id) {
  if (typeof window === 'undefined') return;
  if (!isValidId(id)) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(id));
  } catch {
    /* ignore */
  }
}

export function clearLobbyBgStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
