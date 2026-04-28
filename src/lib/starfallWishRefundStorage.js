import { todayKeyLocal } from './dailyQuestsStorage.js';

const STORAGE_KEY = 'aethelgard-starfall-wish-refund-v1';

/** 大廳背景為「星墜遺跡」時，每日首次星曉祈願抽卡返還晶石用 */

export function loadStarfallWishRefundDayKey() {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return typeof parsed?.dayKey === 'string' ? parsed.dayKey : '';
  } catch {
    return '';
  }
}

export function hasClaimedStarfallWishRefundToday() {
  return loadStarfallWishRefundDayKey() === todayKeyLocal();
}

export function markStarfallWishRefundClaimed() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ dayKey: todayKeyLocal() }));
  } catch {
    /* ignore */
  }
}

export function clearStarfallWishRefundStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
