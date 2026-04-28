import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildMiningRound,
  miningCardsMatch,
  MINING_TIMER_SEC,
  MINING_DAILY_MAX,
  rollStarCrystalReward,
} from '../data/miningFlip.js';
import { incInv } from '../lib/inventoryStorage.js';
import { loadMiningDaily, consumeMiningPlay } from '../lib/miningDailyStorage.js';
import { SFX, unlockAudio } from '../lib/sfx.js';

/** @typedef {{ uid: string, matchType: string, pairId: string, label: string, faceUp: boolean, removed: boolean }} MiningSlot */

/**
 * @param {{
 *   setItemInv: (fn: (p: Record<string, number>) => Record<string, number>) => void,
 *   setStarCrystals: (fn: (c: number) => number) => void,
 *   onDailyQuest?: (qid: string, add?: number) => void,
 * }} props
 */
export default function MiningFlipGame({ setItemInv, setStarCrystals, onDailyQuest }) {
  const [daily, setDaily] = useState(() => loadMiningDaily());
  const [phase, setPhase] = useState('lobby');
  const [board, setBoard] = useState(/** @type {MiningSlot[]} */ ([]));
  const boardRef = useRef(/** @type {MiningSlot[]} */ ([]));
  const [starInvade, setStarInvade] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MINING_TIMER_SEC);
  const selectedRef = useRef(/** @type {number | null} */ (null));
  const [locked, setLocked] = useState(false);
  const [summary, setSummary] = useState(/** @type {string | null} */ (null));
  const rewardsRef = useRef({ copper: 0, silver: 0, gold: 0, star: 0, starCrystals: 0 });

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const refreshDaily = useCallback(() => {
    setDaily(loadMiningDaily());
  }, []);

  const remaining = useMemo(() => Math.max(0, MINING_DAILY_MAX - daily.playsUsed), [daily.playsUsed]);

  const applyReward = useCallback(
    (matchType) => {
      const r = rewardsRef.current;
      if (matchType === 'copper') {
        r.copper += 1;
        setItemInv((inv) => incInv(inv, 'it_ore_copper', 1));
      } else if (matchType === 'silver') {
        r.silver += 1;
        setItemInv((inv) => incInv(inv, 'it_ore_silver', 1));
      } else if (matchType === 'gold') {
        r.gold += 1;
        setItemInv((inv) => incInv(inv, 'it_ore_gold', 1));
      } else if (matchType === 'star') {
        r.star += 1;
        const add = rollStarCrystalReward(() => Math.random());
        r.starCrystals += add;
        setStarCrystals((c) => c + add);
      }
    },
    [setItemInv, setStarCrystals],
  );

  const buildSummaryLine = useCallback(() => {
    const r = rewardsRef.current;
    const parts = [];
    if (r.copper) parts.push(`銅礦 ×${r.copper}`);
    if (r.silver) parts.push(`銀礦 ×${r.silver}`);
    if (r.gold) parts.push(`金礦 ×${r.gold}`);
    if (r.starCrystals > 0) parts.push(`星曉晶石 +${r.starCrystals}`);
    return parts.length ? `獲得：${parts.join('、')}` : '';
  }, []);

  const startRound = useCallback(() => {
    const st = loadMiningDaily();
    if (st.playsUsed >= MINING_DAILY_MAX) {
      setSummary('今日挖礦次數已用完（每日 3 次）。');
      return;
    }
    consumeMiningPlay();
    refreshDaily();
    onDailyQuest?.('mine_play', 1);

    const { slots, starInvade: inv } = buildMiningRound(() => Math.random());
    const b = slots.map((c) => ({ ...c, faceUp: false, removed: false }));
    rewardsRef.current = { copper: 0, silver: 0, gold: 0, star: 0, starCrystals: 0 };
    selectedRef.current = null;
    setBoard(b);
    boardRef.current = b;
    setStarInvade(inv);
    setTimeLeft(MINING_TIMER_SEC);
    setLocked(false);
    setPhase('playing');
    setSummary(inv ? '岩脈共鳴……星曉反光混進銅礦裡了！星曉須成對翻出。' : null);
    unlockAudio();
    SFX.uiClick();
  }, [refreshDaily, onDailyQuest]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => (t <= 0 ? 0 : t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft > 0) return;
    setPhase('ended');
    const line = buildSummaryLine();
    setSummary(line ? `時間到！${line}` : '時間到！未取得礦物。');
  }, [phase, timeLeft, buildSummaryLine]);

  const onCardClick = useCallback(
    (idx) => {
      if (phase !== 'playing' || locked) return;
      const prev = boardRef.current;
      const cell = prev[idx];
      if (!cell || cell.removed || cell.faceUp) return;

      const sel = selectedRef.current;
      if (sel === null) {
        selectedRef.current = idx;
        setBoard((p) => p.map((c, i) => (i === idx ? { ...c, faceUp: true } : c)));
        return;
      }

      if (sel === idx) return;

      const firstIdx = sel;
      const first = prev[firstIdx];
      const second = prev[idx];
      if (!first || !second) return;

      selectedRef.current = null;
      setLocked(true);
      setBoard((p) => p.map((c, i) => (i === idx ? { ...c, faceUp: true } : c)));

      window.setTimeout(() => {
        const match = miningCardsMatch(first, second);
        if (match) {
          applyReward(first.matchType);
          unlockAudio();
          SFX.skill();
          setBoard((cur) => {
            const n = cur.map((c, i) =>
              i === firstIdx || i === idx ? { ...c, faceUp: false, removed: true } : c
            );
            boardRef.current = n;
            if (n.every((s) => s.removed)) {
              setPhase('ended');
              const line = buildSummaryLine();
              setSummary(line ? `全部翻完！${line}` : '全部翻完！');
            }
            return n;
          });
        } else {
          setBoard((cur) => {
            const n = cur.map((c, i) => (i === firstIdx || i === idx ? { ...c, faceUp: false } : c));
            boardRef.current = n;
            return n;
          });
          SFX.uiClick();
        }
        setLocked(false);
      }, 520);
    },
    [applyReward, buildSummaryLine, locked, phase],
  );

  useEffect(() => {
    refreshDaily();
  }, [refreshDaily]);

  const symbolFor = useCallback((matchType) => {
    if (matchType === 'star') return '💎';
    if (matchType === 'gold') return '🟡';
    if (matchType === 'silver') return '⚪';
    return '🟤'; // copper
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-[10px] font-bold text-slate-300">
        4×4 翻牌 · {MINING_TIMER_SEC} 秒 · 銅礦／銀礦／星曉任意兩張可配對；金礦須翻到<strong className="text-slate-200">同一組兩張</strong>。
        <span className="block mt-1 text-cyan-200/90">
          今日剩餘 <span className="tabular-nums font-black">{remaining}</span> / {MINING_DAILY_MAX} 次
        </span>
      </div>

      {phase === 'lobby' && (
        <button
          type="button"
          onClick={startRound}
          disabled={remaining <= 0}
          className="w-full py-2.5 rounded-xl font-black text-sm bg-amber-700/40 hover:bg-amber-600/50 border border-amber-400/35 text-amber-50 disabled:opacity-40"
        >
          {remaining <= 0 ? '今日次數已用完' : '開始挖礦'}
        </button>
      )}

      {(phase === 'playing' || phase === 'ended') && board.length > 0 && (
        <>
          <div className="flex items-center justify-between text-[11px] font-black">
            <span className={timeLeft <= 5 && phase === 'playing' ? 'text-rose-300' : 'text-slate-200'}>
              剩餘 <span className="tabular-nums">{phase === 'playing' ? timeLeft : 0}</span> 秒
            </span>
            {starInvade ? <span className="text-cyan-200/90 text-[9px]">星曉亂入</span> : null}
          </div>
          <div className="grid grid-cols-4 gap-0.5 w-full">
            {board.map((cell, idx) => (
              <button
                key={cell.uid}
                type="button"
                disabled={cell.removed || locked || phase !== 'playing'}
                onClick={() => onCardClick(idx)}
                title={cell?.label || ''}
                className={`aspect-[2/1] min-h-0 rounded border text-[8px] font-black p-0.5 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                  cell.removed
                    ? 'border-transparent bg-transparent'
                    : cell.faceUp
                      ? cell.matchType === 'star'
                        ? 'border-cyan-400/50 bg-cyan-950/50 text-cyan-100'
                        : cell.matchType === 'gold'
                          ? 'border-amber-400/60 bg-amber-950/40 text-amber-100'
                          : cell.matchType === 'silver'
                            ? 'border-slate-300/40 bg-slate-800/80 text-slate-100'
                            : 'border-orange-400/40 bg-orange-950/35 text-orange-100'
                      : 'border-white/15 bg-slate-900/70 text-slate-500 hover:bg-slate-800/80'
                }`}
              >
                {cell.removed ? null : cell.faceUp ? (
                  <span className="inline-flex items-center justify-center w-full h-full text-xs leading-none select-none">
                    {symbolFor(cell.matchType)}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center justify-center w-full h-full text-[0.55rem] leading-none opacity-70 select-none"
                    aria-hidden
                  >
                    ⬡
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {summary ? (
        <p className="text-[11px] font-bold text-amber-100/90 rounded-lg border border-amber-500/25 bg-black/35 px-3 py-2 whitespace-pre-wrap">{summary}</p>
      ) : null}

      {phase === 'ended' && (
        <button
          type="button"
          onClick={() => {
            setPhase('lobby');
            setBoard([]);
            boardRef.current = [];
            selectedRef.current = null;
            setSummary(null);
            refreshDaily();
          }}
          className="w-full py-2 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 text-xs font-black text-slate-200"
        >
          返回
        </button>
      )}
    </div>
  );
}
