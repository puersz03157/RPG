const TRACKS = {
  menu: '/bgm/the_morning_gate.mp3',
  battle: '/bgm/sprint_through_the_thicket.mp3',
  boss: '/bgm/forge_of_defiance.mp3',
  gacha: '/bgm/gilded_arrival.mp3',
  victory: '/bgm/the_path_opens.mp3',
  defeat: '/bgm/the_slow_return_to_light.mp3',
};

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

class BgmManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.6;
    this.loopAudio = null;
    this.loopKey = null;
    this.oneShotAudio = null;
    this.fadeTimer = null;
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    if (!this.enabled) this.stopAll();
    else if (this.loopKey) this.playLoop(this.loopKey);
  }

  setVolume(volume) {
    this.volume = clamp01(volume);
    if (this.loopAudio) this.loopAudio.volume = this.volume;
  }

  stopAll() {
    if (this.fadeTimer) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    if (this.oneShotAudio) {
      this.oneShotAudio.pause();
      this.oneShotAudio = null;
    }
    if (this.loopAudio) {
      this.loopAudio.pause();
      this.loopAudio = null;
    }
  }

  _fadeTo(audio, to, ms = 300) {
    if (!audio) return;
    if (this.fadeTimer) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    const from = Number(audio.volume) || 0;
    const steps = Math.max(1, Math.floor(ms / 30));
    let i = 0;
    this.fadeTimer = window.setInterval(() => {
      i += 1;
      const t = i / steps;
      audio.volume = from + (to - from) * t;
      if (i >= steps) {
        window.clearInterval(this.fadeTimer);
        this.fadeTimer = null;
        audio.volume = to;
      }
    }, 30);
  }

  async playLoop(key) {
    if (!this.enabled) return;
    const src = TRACKS[key];
    if (!src) return;
    if (this.loopKey === key && this.loopAudio && !this.loopAudio.paused) return;

    // stop oneshot
    if (this.oneShotAudio) {
      this.oneShotAudio.pause();
      this.oneShotAudio = null;
    }

    // crossfade old loop out
    const old = this.loopAudio;
    if (old && !old.paused) {
      this._fadeTo(old, 0, 180);
      window.setTimeout(() => {
        try {
          old.pause();
        } catch {
          /* ignore */
        }
      }, 200);
    }

    const a = new Audio(src);
    a.loop = true;
    a.volume = this.volume;
    this.loopAudio = a;
    this.loopKey = key;
    try {
      await a.play();
    } catch {
      // Autoplay may be blocked; will start after user gesture.
    }
  }

  async playOneShot(key) {
    if (!this.enabled) return;
    const src = TRACKS[key];
    if (!src) return;

    // stop loop (fade out)
    if (this.loopAudio && !this.loopAudio.paused) {
      this._fadeTo(this.loopAudio, 0, 160);
      window.setTimeout(() => {
        try {
          this.loopAudio.pause();
        } catch {
          /* ignore */
        }
      }, 180);
    }

    if (this.oneShotAudio) {
      this.oneShotAudio.pause();
      this.oneShotAudio = null;
    }

    const a = new Audio(src);
    a.loop = false;
    a.volume = this.volume;
    this.oneShotAudio = a;
    try {
      await a.play();
    } catch {
      // autoplay blocked
    }
  }
}

export const BGM = new BgmManager();

