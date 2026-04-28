import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HUNTING_DURATION_MS,
  HUNTING_DAILY_MAX,
  HUNTING_DRAGON_ROUND_CHANCE,
  HUNTING_BAD_TIME_PENALTY_MS,
  HUNTING_MISCLICK_COOLDOWN_MS,
  HUNTING_SPAWN_INTERVAL_MS,
  HUNTING_MAX_SIMULTANEOUS,
  HUNTING_TARGET_TTL_MS,
  HUNTING_DRAGON_TTL_MS,
  HUNTING_DRAGON_SPAWN_MIN_MS,
  HUNTING_DRAGON_SPAWN_MAX_MS,
  rollHuntingStarCrystals,
  rollCommonSpawn,
  rollMonsterMaterialId,
  HUNT_DRAGON,
} from '../data/huntingData.js';
import { incInv } from '../lib/inventoryStorage.js';
import { loadHuntingDaily, consumeHuntingPlay } from '../lib/huntingDailyStorage.js';
import { SFX, unlockAudio } from '../lib/sfx.js';

const TICK_MS = 100;

/**
 * @param {{
 *   setItemInv: (fn: (p: Record<string, number>) => Record<string, number>) => void,
 *   setStarCrystals: (fn: (c: number) => number) => void,
 *   onDailyQuest?: (qid: string, add?: number) => void,
 * }} props
 */
export default function HuntingMinigame({ setItemInv, setStarCrystals, onDailyQuest }) {
  const [daily, setDaily] = useState(() => loadHuntingDaily());
  const [phase, setPhase] = useState('lobby');
  const [timeLeftMs, setTimeLeftMs] = useState(HUNTING_DURATION_MS);
  /** @type {[{ uid: string, def: any, leftPct: number, topPct: number, expires: number }]} */
  const [targets, setTargets] = useState([]);
  const [summary, setSummary] = useState(/** @type {string | null} */ (null));

  const phaseRef = useRef('lobby');
  const timeRef = useRef(HUNTING_DURATION_MS);
  const uidRef = useRef(0);
  const statsRef = useRef({ hits: 0, material: {}, starGained: 0, misclicks: 0, dragonSeen: false });
  const endedRef = useRef(false);
  const penaltyGateRef = useRef(0);
  const spawnTimerRef = useRef(null);
  const dragonTimerRef = useRef(null);
  const tickTimerRef = useRef(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const refreshDaily = useCallback(() => setDaily(loadHuntingDaily()), []);
  const remaining = useMemo(() => Math.max(0, HUNTING_DAILY_MAX - daily.playsUsed), [daily.playsUsed]);

  const clearTimers = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (dragonTimerRef.current) clearTimeout(dragonTimerRef.current);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    spawnTimerRef.current = null;
    dragonTimerRef.current = null;
    tickTimerRef.current = null;
  }, []);

  const purgeExpired = useCallback(() => {
    const t = Date.now();
    setTargets((list) => list.filter((e) => e.expires > t));
  }, []);

  const spawnOne = useCallback((def) => {
    const uid = `h${++uidRef.current}`;
    const leftPct = 8 + Math.random() * 78;
    const topPct = 8 + Math.random() * 62;
    const ttl = def.kind === 'dragon' ? HUNTING_DRAGON_TTL_MS : HUNTING_TARGET_TTL_MS;
    const ent = { uid, def, leftPct, topPct, expires: Date.now() + ttl };
    setTargets((list) => {
      let pruned = list.filter((e) => e.expires > Date.now());
      if (def.kind === 'dragon' && pruned.length >= HUNTING_MAX_SIMULTANEOUS) {
        pruned = pruned.slice(0, HUNTING_MAX_SIMULTANEOUS - 1);
      }
      if (pruned.length >= HUNTING_MAX_SIMULTANEOUS) return pruned;
      return [...pruned, ent];
    });
  }, []);

  const grantMonster = useCallback(
    (def) => {
      const mat = rollMonsterMaterialId(def, () => Math.random());
      if (mat) {
        setItemInv((inv) => incInv(inv, mat, 1));
        statsRef.current.material[mat] = (statsRef.current.material[mat] ?? 0) + 1;
      }
      statsRef.current.hits += 1;
      // 星曉晶石僅在點中龍時發放，一場一條龍故最多一次
      if (def.kind === 'dragon') {
        const stars = rollHuntingStarCrystals(() => Math.random());
        statsRef.current.starGained += stars;
        setStarCrystals((c) => c + stars);
      }
    },
    [setItemInv, setStarCrystals],
  );

  const endGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearTimers();
    setPhase('ended');
    phaseRef.current = 'ended';
    const st = statsRef.current;
    const bits = [];
    if (st.starGained > 0) bits.push(`星曉晶石 +${st.starGained}`);
    if (st.hits > 0) bits.push(`狩獵成功 ${st.hits} 次（素材已入背包）`);
    if (st.misclicks > 0) bits.push(`誤傷小動物 ${st.misclicks} 次`);
    if (st.dragonSeen) bits.push('本局曾出現龍影');
    setSummary(bits.length ? bits.join(' · ') : '時間到。');
  }, [clearTimers]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      setTimeLeftMs((ms) => {
        const next = Math.max(0, ms - TICK_MS);
        timeRef.current = next;
        if (next <= 0) {
          window.setTimeout(endGame, 0);
          return 0;
        }
        return next;
      });
      purgeExpired();
    }, TICK_MS);
    tickTimerRef.current = id;
    return () => clearInterval(id);
  }, [phase, endGame, purgeExpired]);

  const startRound = useCallback(() => {
    const st = loadHuntingDaily();
    if (st.playsUsed >= HUNTING_DAILY_MAX) {
      setSummary('今日狩獵次數已用完（每日 3 次，與挖礦分開計）。');
      return;
    }
    consumeHuntingPlay();
    refreshDaily();
    onDailyQuest?.('hunt_play', 1);
    clearTimers();

    endedRef.current = false;
    statsRef.current = { hits: 0, material: {}, starGained: 0, misclicks: 0, dragonSeen: false };
    uidRef.current = 0;
    penaltyGateRef.current = 0;
    setTargets([]);
    setSummary(null);
    const dragonThisRound = Math.random() < HUNTING_DRAGON_ROUND_CHANCE;
    const t0 =
      HUNTING_DRAGON_SPAWN_MIN_MS + Math.random() * (HUNTING_DRAGON_SPAWN_MAX_MS - HUNTING_DRAGON_SPAWN_MIN_MS);

    setTimeLeftMs(HUNTING_DURATION_MS);
    timeRef.current = HUNTING_DURATION_MS;
    setPhase('playing');
    phaseRef.current = 'playing';
    unlockAudio();
    SFX.uiClick();

    spawnTimerRef.current = window.setInterval(() => {
      if (phaseRef.current !== 'playing') return;
      const roll = rollCommonSpawn(() => Math.random());
      spawnOne(roll);
    }, HUNTING_SPAWN_INTERVAL_MS);

    dragonTimerRef.current = window.setTimeout(() => {
      if (phaseRef.current !== 'playing') return;
      if (dragonThisRound) {
        statsRef.current.dragonSeen = true;
        spawnOne(HUNT_DRAGON);
      }
    }, t0);
  }, [clearTimers, refreshDaily, spawnOne, onDailyQuest]);

  const onTap = useCallback(
    (uid) => {
      if (phaseRef.current !== 'playing') return;
      setTargets((list) => {
        const ent = list.find((e) => e.uid === uid);
        if (!ent) return list;
        const def = ent.def;
        const next = list.filter((e) => e.uid !== uid);

        if (def.kind === 'critter') {
          const now = Date.now();
          if (now - penaltyGateRef.current >= HUNTING_MISCLICK_COOLDOWN_MS) {
            penaltyGateRef.current = now;
            statsRef.current.misclicks += 1;
            setTimeLeftMs((ms) => {
              const n = Math.max(0, ms - HUNTING_BAD_TIME_PENALTY_MS);
              timeRef.current = n;
              if (n <= 0) window.setTimeout(endGame, 0);
              return n;
            });
          }
          SFX.uiClick();
        } else {
          grantMonster(def);
          unlockAudio();
          SFX.skill();
        }
        return next;
      });
    },
    [endGame, grantMonster],
  );

  useEffect(() => {
    refreshDaily();
  }, [refreshDaily]);

  const secLeft = Math.ceil(timeLeftMs / 1000);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-rose-500/25 bg-rose-950/15 px-3 py-2 text-[10px] font-bold text-slate-300">
        15 秒內點<strong className="text-rose-200">一般魔物</strong>（紅框）得素材；僅點中<strong className="text-amber-200">龍 🐲</strong>（金框）才<strong className="text-cyan-200">+1～3 星曉晶石</strong>（一場頂多一次）。
        誤點<strong className="text-emerald-200">小動物</strong>（綠框）扣約 1.2 秒，短時間內重複誤點不會連續扣時。
        <span className="block mt-1 text-amber-200/90">
          今日剩餘 <span className="tabular-nums font-black">{remaining}</span> / {HUNTING_DAILY_MAX} 次（狩獵獨立計）
        </span>
      </div>

      {phase === 'lobby' && (
        <button
          type="button"
          onClick={startRound}
          disabled={remaining <= 0}
          className="w-full py-2.5 rounded-xl font-black text-sm bg-rose-700/35 hover:bg-rose-600/45 border border-rose-400/35 text-rose-50 disabled:opacity-40"
        >
          {remaining <= 0 ? '今日次數已用完' : '開始狩獵'}
        </button>
      )}

      {phase === 'playing' && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className={`text-[11px] font-black tabular-nums ${secLeft <= 5 ? 'text-rose-300' : 'text-slate-200'}`}>
              {secLeft} 秒
            </span>
            <span className="text-[9px] font-bold text-slate-500">龍最多 1 隻 · 20% 局出 · 晶石僅龍給</span>
          </div>
          <div className="relative h-[12.5rem] w-full">
            {targets.map((t) => {
              const d = t.def;
              const isCrit = d.kind === 'critter';
              const isDrag = d.kind === 'dragon';
              const ring = isCrit
                ? 'ring-2 ring-emerald-400/60 border-emerald-500/30'
                : isDrag
                  ? 'ring-2 ring-amber-400/70 border-amber-500/40'
                  : 'ring-2 ring-rose-500/65 border-rose-500/35';
              return (
                <button
                  key={t.uid}
                  type="button"
                  onClick={() => onTap(t.uid)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-xl border bg-slate-900/90 text-xl sm:text-2xl shadow-lg active:scale-95 transition-transform ${ring}`}
                  style={{ left: `${t.leftPct}%`, top: `${t.topPct}%` }}
                  title={d.label}
                >
                  {d.emoji}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {summary ? (
        <p className="text-[11px] font-bold text-amber-100/90 rounded-lg border border-amber-500/25 bg-black/35 px-3 py-2">{summary}</p>
      ) : null}

      {phase === 'ended' && (
        <button
          type="button"
          onClick={() => {
            setPhase('lobby');
            setSummary(null);
            setTargets([]);
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
