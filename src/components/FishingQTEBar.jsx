import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * 橫向長條 QTE：指針左右移動，點「收線」時需落在綠色區內
 * @param {{ zoneWidth: number, zoneCenter: number, needleSpeed: number, fishName: string, onResult: (ok: boolean) => void }} props
 * zoneWidth / zoneCenter: 0~1 比例
 */
export default function FishingQTEBar({ zoneWidth, zoneCenter, needleSpeed, fishName, onResult }) {
  const raf = useRef(0);
  const startRef = useRef(0);
  const needleRef = useRef(0.5);
  const [needle, setNeedle] = useState(0.5);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const tick = useCallback(() => {
    if (doneRef.current) return;
    const t = (performance.now() - startRef.current) / 1000;
    // 0~1 間往返
    const n = 0.5 + 0.5 * Math.sin(t * needleSpeed * Math.PI * 2);
    needleRef.current = n;
    setNeedle(n);
    raf.current = requestAnimationFrame(tick);
  }, [needleSpeed]);

  useEffect(() => {
    doneRef.current = false;
    startRef.current = performance.now();
    raf.current = requestAnimationFrame(tick);
    return () => {
      doneRef.current = true;
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [tick]);

  const tryHit = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    if (raf.current) cancelAnimationFrame(raf.current);
    const n = needleRef.current;
    const half = Math.max(0.02, zoneWidth) / 2;
    const lo = zoneCenter - half;
    const hi = zoneCenter + half;
    const ok = n >= lo && n <= hi;
    onResultRef.current(ok);
  }, [zoneCenter, zoneWidth]);

  const loPct = Math.max(0, (zoneCenter - zoneWidth / 2) * 100);
  const hiPct = Math.min(100, (zoneCenter + zoneWidth / 2) * 100);

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-4 space-y-3">
      <p className="text-[10px] font-black text-cyan-200/90">目標：{fishName || '？'}</p>
      <p className="text-[9px] font-bold text-slate-500">指針進入綠色區域時點「收線」</p>
      <div className="relative h-12 rounded-xl bg-slate-900/80 border border-white/10 overflow-hidden">
        <div
          className="absolute top-0 bottom-0 bg-emerald-500/35 border-x border-emerald-400/50"
          style={{ left: `${loPct}%`, width: `${Math.max(0, hiPct - loPct)}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-300 shadow-[0_0_8px_rgba(250,204,21,0.8)]"
          style={{ left: `${needle * 100}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="flex justify-between text-[8px] font-bold text-slate-600">
        <span>左</span>
        <span>右</span>
      </div>
      <button
        type="button"
        disabled={done}
        onClick={tryHit}
        className="w-full py-3 rounded-xl font-black text-sm bg-cyan-600/80 hover:bg-cyan-500/90 disabled:opacity-50 text-white border border-cyan-400/30"
      >
        收線！
      </button>
    </div>
  );
}
