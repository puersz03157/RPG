let ctx = null;
let unlocked = false;
let enabled = true;
let volume = 0.7; // 0..1

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  return ctx;
}

const KEY_ENABLED = 'aethelgard-sfx-enabled';
const KEY_VOLUME = 'aethelgard-sfx-volume';

function clamp01(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function loadSfxSettings() {
  if (typeof window === 'undefined') return { enabled, volume };
  try {
    const rawE = window.localStorage.getItem(KEY_ENABLED);
    if (rawE === '0') enabled = false;
    else if (rawE === '1') enabled = true;
    const rawV = window.localStorage.getItem(KEY_VOLUME);
    if (rawV != null) volume = clamp01(rawV);
  } catch {
    /* ignore */
  }
  return { enabled, volume };
}

export function getSfxEnabled() {
  return enabled;
}

export function getSfxVolume() {
  return volume;
}

export function setSfxEnabled(next) {
  enabled = !!next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY_ENABLED, enabled ? '1' : '0');
    } catch {
      /* ignore */
    }
  }
}

export function setSfxVolume(next) {
  volume = clamp01(next);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY_VOLUME, String(volume));
    } catch {
      /* ignore */
    }
  }
}

export function clearSfxStorage() {
  enabled = true;
  volume = 0.7;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY_ENABLED);
    window.localStorage.removeItem(KEY_VOLUME);
  } catch {
    /* ignore */
  }
}

export async function unlockAudio() {
  const c = getCtx();
  if (!c) return false;
  try {
    if (c.state === 'suspended') await c.resume();
    unlocked = c.state === 'running';
    return unlocked;
  } catch {
    return false;
  }
}

function now(c) {
  return c.currentTime;
}

function env(g, t0, a = 0.004, d = 0.08) {
  g.gain.cancelScheduledValues(t0);
  g.gain.setValueAtTime(0.00001, t0);
  g.gain.exponentialRampToValueAtTime(0.25, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.00001, t0 + a + d);
}

function tone({ type = 'sine', freq = 440, freqTo = null, duration = 0.09, gain = 0.25 } = {}) {
  const c = getCtx();
  if (!c) return;
  if (!unlocked) return;
  if (!enabled) return;
  const t0 = now(c);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (typeof freqTo === 'number') osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqTo), t0 + duration);
  g.gain.setValueAtTime(0.00001, t0);
  g.gain.exponentialRampToValueAtTime(gain * volume, t0 + 0.004);
  g.gain.exponentialRampToValueAtTime(0.00001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.01);
}

function noise({ duration = 0.06, gain = 0.18, hp = 900 } = {}) {
  const c = getCtx();
  if (!c) return;
  if (!unlocked) return;
  if (!enabled) return;
  const t0 = now(c);
  const len = Math.max(1, Math.floor(c.sampleRate * duration));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(hp, t0);
  const g = c.createGain();
  g.gain.setValueAtTime(0.00001, t0);
  g.gain.exponentialRampToValueAtTime(gain * volume, t0 + 0.003);
  g.gain.exponentialRampToValueAtTime(0.00001, t0 + duration);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.01);
}

export const SFX = {
  uiClick() {
    // short bright tick
    tone({ type: 'triangle', freq: 880, freqTo: 660, duration: 0.05, gain: 0.12 });
  },
  attack() {
    // punchy hit
    noise({ duration: 0.05, gain: 0.18, hp: 1200 });
    tone({ type: 'square', freq: 180, freqTo: 120, duration: 0.07, gain: 0.08 });
  },
  skill() {
    // spark sweep
    tone({ type: 'sine', freq: 520, freqTo: 1040, duration: 0.12, gain: 0.12 });
    tone({ type: 'triangle', freq: 780, freqTo: 520, duration: 0.1, gain: 0.08 });
  },
  guardHit() {
    // dull thud
    noise({ duration: 0.06, gain: 0.14, hp: 600 });
    tone({ type: 'sawtooth', freq: 140, freqTo: 110, duration: 0.09, gain: 0.06 });
  },
  levelUp() {
    // ascending chime
    tone({ type: 'sine', freq: 660, freqTo: 990, duration: 0.12, gain: 0.11 });
    setTimeout(() => tone({ type: 'sine', freq: 990, freqTo: 1320, duration: 0.14, gain: 0.11 }), 90);
  },
};

