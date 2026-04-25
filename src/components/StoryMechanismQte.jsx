import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SFX, unlockAudio } from '../lib/sfx.js';

const KEYS = [
  { code: 'ArrowUp', label: '↑' },
  { code: 'ArrowDown', label: '↓' },
  { code: 'ArrowLeft', label: '←' },
  { code: 'ArrowRight', label: '→' },
];

const ARROW_CODES = new Set(KEYS.map((k) => k.code));

/**
 * 劇情用簡易 QTE：依提示按方向鍵累積進度，滿則觸發 onComplete。
 */
export function StoryMechanismQte({ onComplete, progressAdd = 17, wrongPenalty = 9, decayPerTick = 0.85 }) {
  const [progress, setProgress] = useState(0);
  const [kIdx, setKIdx] = useState(() => Math.floor(Math.random() * KEYS.length));
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : Math.max(0, p - decayPerTick)));
    }, 100);
    return () => window.clearInterval(id);
  }, [decayPerTick]);

  useEffect(() => {
    if (progress >= 100) finish();
  }, [progress, finish]);

  const tryHit = useCallback(
    (code) => {
      if (doneRef.current) return;
      void unlockAudio();
      if (code === KEYS[kIdx].code) {
        SFX.uiClick();
        setProgress((p) => Math.min(100, p + progressAdd));
        setKIdx(Math.floor(Math.random() * KEYS.length));
      } else if (ARROW_CODES.has(code)) {
        setProgress((p) => Math.max(0, p - wrongPenalty));
      }
    },
    [kIdx, progressAdd, wrongPenalty],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (ARROW_CODES.has(e.code)) e.preventDefault();
      tryHit(e.code);
    };
    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
  }, [tryHit]);

  const pct = Math.min(100, Math.round(progress));
  const cur = KEYS[kIdx];

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-amber-200/90 mb-2">機關破解 · QTE</p>
      <p className="text-[12px] font-bold text-slate-200 leading-relaxed mb-3">
        石盤上的鎖齒亮起——在進度消退前，依序按下閃爍的方位鍵推進破解。
      </p>
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-[11px] font-black text-slate-500">當前指令</span>
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl border-2 border-amber-400/60 bg-amber-500/15 text-2xl font-black text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
          {cur.label}
        </span>
      </div>
      <div className="mb-1 flex justify-between text-[10px] font-black text-slate-500">
        <span>破解進度</span>
        <span className="tabular-nums text-amber-200/90">{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-700 to-amber-400 transition-[width] duration-100 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {KEYS.map((k) => (
          <button
            key={k.code}
            type="button"
            onClick={() => tryHit(k.code)}
            className="rounded-xl border border-white/15 bg-slate-900/80 py-3 text-lg font-black text-slate-100 hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
