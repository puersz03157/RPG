const KEY = 'aethelgard-music-settings-v1';

function clamp01(n, fallback = 0.6) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(0, Math.min(1, x));
}

function defaultState() {
  return { enabled: true, volume: 0.6 };
}

export function loadMusicSettings() {
  const base = defaultState();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;
    return {
      enabled: parsed.enabled !== false,
      volume: clamp01(parsed.volume, base.volume),
    };
  } catch {
    return base;
  }
}

export function saveMusicSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    const next = {
      enabled: settings?.enabled !== false,
      volume: clamp01(settings?.volume, defaultState().volume),
    };
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearMusicStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

