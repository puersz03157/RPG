import { GARDEN_PLOT_COUNT } from '../data/gardenCrops.js';

const STORAGE_KEY = 'aethelgard-garden-plots-v1';

/** @typedef {{ cropId: string | null, plantedAt: number | null, watered: boolean }} GardenPlot */

function defaultPlots() {
  /** @type {GardenPlot[]} */
  const arr = [];
  for (let i = 0; i < GARDEN_PLOT_COUNT; i += 1) {
    arr.push({ cropId: null, plantedAt: null, watered: false });
  }
  return arr;
}

function normalizePlots(raw) {
  const base = defaultPlots();
  if (!Array.isArray(raw)) return base;
  for (let i = 0; i < base.length; i += 1) {
    const p = raw[i];
    if (!p || typeof p !== 'object') continue;
    base[i] = {
      cropId: typeof p.cropId === 'string' ? p.cropId : p.cropId ? String(p.cropId) : null,
      plantedAt: p.plantedAt != null ? Math.max(0, Math.floor(Number(p.plantedAt))) : null,
      watered: !!p.watered,
    };
    if (!base[i].cropId) {
      base[i].plantedAt = null;
      base[i].watered = false;
    }
  }
  return base;
}

export function loadGardenPlots() {
  if (typeof window === 'undefined') return defaultPlots();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPlots();
    const parsed = JSON.parse(raw);
    return normalizePlots(parsed.plots ?? parsed);
  } catch {
    return defaultPlots();
  }
}

/** @param {GardenPlot[]} plots */
export function saveGardenPlots(plots) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ plots: normalizePlots(plots) }));
  } catch {
    /* ignore */
  }
}

export function clearGardenPlotsStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
