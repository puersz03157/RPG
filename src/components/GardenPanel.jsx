import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  listCrops,
  getCrop,
  getCropReadyAtMs,
  isCropReady,
  WATER_GROW_MUL,
} from '../data/gardenCrops.js';
import {
  FISH_SPOTS,
  FISH_BAITS,
  FISH_DEFS,
  FISH_RARITY_QTE,
  rollPendingFish,
  randomZoneCenter,
  isSpotUnlocked,
  rollFreshFishMeat,
  FRESH_FISH_MEAT_ITEM_ID,
} from '../data/fishingData.js';
import { getItem, getItemSellPrice } from '../data/items.js';
import { getInvCount, incInv } from '../lib/inventoryStorage.js';
import { recordCatch } from '../lib/fishCodexStorage.js';
import FishingQTEBar from './FishingQTEBar.jsx';
import MiningFlipGame from './MiningFlipGame.jsx';
import HuntingMinigame from './HuntingMinigame.jsx';
import { SFX, unlockAudio } from '../lib/sfx.js';
import { lobbyBgHarvestExtraOnce, getLobbyFishingQteAdjustments, getLobbyHuntingDragonRoundChance } from '../lib/lobbyBgBonuses.js';

const FISHING_CAST_GOLD = 25;

function formatRemainMs(ms) {
  if (ms <= 0) return '0:00';
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

/**
 * @param {{
 *  gardenPlots: import('../lib/gardenPlotsStorage.js').GardenPlot[],
 *  setGardenPlots: React.Dispatch<React.SetStateAction<any>>,
 *  fishCodex: { caught: Record<string, number> },
 *  setFishCodex: React.Dispatch<React.SetStateAction<any>>,
 *  itemInv: Record<string, number>,
 *  setItemInv: (fn: (p: any) => any) => void,
 *  gold: number,
 *  setGold: (fn: (g: number) => number) => void,
 *  prismCount: number,
 *  setStarCrystals: (fn: (c: number) => number) => void,
 *  onDailyQuest?: (qid: string, add?: number) => void,
 *  lobbyBgId?: string,
 *  onClose: () => void,
 * }} props
 */
export default function GardenPanel({
  gardenPlots,
  setGardenPlots,
  fishCodex,
  setFishCodex,
  itemInv,
  setItemInv,
  gold,
  setGold,
  prismCount,
  setStarCrystals,
  onDailyQuest,
  lobbyBgId = '',
  onClose,
}) {
  const [tab, setTab] = useState('farm');
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState(/** @type {string | null} */ (null));
  const [qte, setQte] = useState(/** @type {null | { fish: import('../data/fishingData.js').FishDef, zoneCenter: number }} */ (null));

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now() + 0 * tick;

  const buySeed = useCallback(
    (crop) => {
      if (!crop) return;
      const price = crop.seedPrice;
      if (gold < price) {
        setMsg('金幣不足。');
        return;
      }
      setGold((g) => g - price);
      setItemInv((inv) => incInv(inv, crop.seedItemId, 1));
      unlockAudio();
      SFX.uiClick();
      setMsg(`已買入「${getItem(crop.seedItemId)?.name ?? '種子'}」。`);
    },
    [gold, setGold, setItemInv],
  );

  const plant = useCallback(
    (plotIdx, cropId) => {
      const crop = getCrop(cropId);
      if (!crop) return;
      const p0 = gardenPlots[plotIdx];
      if (!p0 || p0.cropId) return;
      if (getInvCount(itemInv, crop.seedItemId) <= 0) {
        setMsg('種子不足。');
        return;
      }
      setItemInv((inv) => incInv(inv, crop.seedItemId, -1));
      setGardenPlots((plots) => {
        const next = plots.slice();
        const p = next[plotIdx];
        if (!p || p.cropId) return plots;
        next[plotIdx] = { cropId: crop.id, plantedAt: Date.now(), watered: false };
        return next;
      });
      unlockAudio();
      SFX.uiClick();
      setMsg(`已播種：${crop.name}。`);
    },
    [gardenPlots, itemInv, setGardenPlots, setItemInv],
  );

  const water = useCallback(
    (plotIdx) => {
      setGardenPlots((plots) => {
        const p = plots[plotIdx];
        if (!p?.cropId || !p.plantedAt || p.watered) return plots;
        const cr = getCrop(p.cropId);
        if (!cr || isCropReady(p, cr, now)) return plots;
        const next = plots.slice();
        next[plotIdx] = { ...p, watered: true };
        return next;
      });
      unlockAudio();
      SFX.uiClick();
      setMsg('已澆水：成長時間縮短 10%。');
    },
    [now, setGardenPlots],
  );

  const harvest = useCallback(
    (plotIdx) => {
      const p = gardenPlots[plotIdx];
      const cr = getCrop(p?.cropId ?? null);
      if (!p?.cropId || !cr) return;
      if (!isCropReady(p, cr, now)) return;
      const extra = lobbyBgHarvestExtraOnce(lobbyBgId);
      setItemInv((inv) => incInv(inv, cr.harvestItemId, extra ? 2 : 1));
      setGardenPlots((plots) => {
        const next = plots.slice();
        next[plotIdx] = { cropId: null, plantedAt: null, watered: false };
        return next;
      });
      unlockAudio();
      SFX.levelUp();
      setMsg(extra ? '採收完成（翠影林海：額外收成 +1）。' : '採收完成。');
      onDailyQuest?.('harvest_crop', 1);
    },
    [gardenPlots, now, setGardenPlots, setItemInv, onDailyQuest, lobbyBgId],
  );

  const baitMul = useCallback((baitId) => {
    const b = FISH_BAITS.find((x) => x.id === baitId);
    return b?.rareWeightMul ?? 1;
  }, []);

  const [fishSpot, setFishSpot] = useState('pond');
  const [baitId, setBaitId] = useState('none');

  const startFishing = useCallback(() => {
    if (!isSpotUnlocked(fishSpot, prismCount)) {
      setMsg('此釣點尚未解鎖。');
      return;
    }
    if (gold < FISHING_CAST_GOLD) {
      setMsg(`金幣不足（需 ${FISHING_CAST_GOLD}）。`);
      return;
    }
    const bait = FISH_BAITS.find((b) => b.id === baitId);
    if (bait?.itemId && getInvCount(itemInv, bait.itemId) < 1) {
      setMsg('所選魚餌數量不足。');
      return;
    }
    const mul = baitMul(baitId);
    const fish = rollPendingFish(fishSpot, mul, () => Math.random());
    if (!fish) {
      setMsg('此釣點沒有可用魚群。');
      return;
    }
    setGold((g) => g - FISHING_CAST_GOLD);
    if (bait?.itemId) {
      setItemInv((inv) => incInv(inv, bait.itemId, -1));
    }
    const zc = randomZoneCenter(() => Math.random());
    setQte({ fish, zoneCenter: zc });
    setMsg(null);
    unlockAudio();
    SFX.uiClick();
  }, [baitId, baitMul, fishSpot, gold, itemInv, prismCount, setGold, setItemInv]);

  const onQteResult = useCallback(
    (ok) => {
      if (!qte) return;
      const { fish } = qte;
      setQte(null);
      if (ok) {
        const gotMeat = rollFreshFishMeat(fish, () => Math.random());
        const it = getItem(fish.itemId);
        const sellGold = it ? getItemSellPrice(it) : 0;
        setGold((g) => g + sellGold);
        if (gotMeat) {
          setItemInv((inv) => incInv(inv, FRESH_FISH_MEAT_ITEM_ID, 1));
        }
        setFishCodex((prev) => recordCatch(prev, fish.id, 1));
        onDailyQuest?.('fish_catch', 1);
        setMsg(
          `釣上：${fish.name}！當場出售 +${sellGold} 金，圖鑑已記錄。${gotMeat ? ' 附帶新鮮魚肉×1！' : ''}`
        );
        unlockAudio();
        SFX.skill();
      } else {
        setMsg('魚掙脫逃走了……（金幣與已消耗魚餌不退回）');
        SFX.uiClick();
      }
    },
    [qte, setFishCodex, setGold, setItemInv, onDailyQuest],
  );

  const buyBait = useCallback(
    (itemId, price) => {
      if (gold < price) {
        setMsg('金幣不足。');
        return;
      }
      setGold((g) => g - price);
      setItemInv((inv) => incInv(inv, itemId, 1));
      unlockAudio();
      SFX.uiClick();
      setMsg('已補充魚餌。');
    },
    [gold, setGold, setItemInv],
  );

  const crops = useMemo(() => listCrops(), []);

  const rarityClass = (r) => {
    if (r === 'legendary') return 'text-amber-200';
    if (r === 'epic') return 'text-fuchsia-300';
    if (r === 'rare') return 'text-sky-300';
    if (r === 'uncommon') return 'text-emerald-300';
    return 'text-slate-300';
  };

  return (
    <div className="mt-2 space-y-3 max-h-[min(70vh,28rem)] overflow-y-auto pr-0.5 no-scrollbar">
      <div className="flex gap-1 rounded-xl border border-white/10 bg-slate-900/60 p-0.5" role="tablist">
        {[
          { id: 'farm', label: '種植' },
          { id: 'fish', label: '釣魚' },
          { id: 'mine', label: '挖礦' },
          { id: 'hunt', label: '狩獵' },
          { id: 'codex', label: '圖鑑' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setMsg(null);
            }}
            className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-[10px] font-black transition-colors ${
              tab === t.id
                ? 'border border-lime-500/40 bg-lime-600/30 text-lime-100'
                : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg ? (
        <p className="text-[11px] font-bold text-amber-200/90 rounded-lg border border-amber-500/20 bg-amber-950/25 px-3 py-2">{msg}</p>
      ) : null}

      {tab === 'farm' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-lime-500/20 bg-lime-950/15 px-3 py-2">
            <p className="text-[9px] font-black text-lime-200/80">種子鋪（金幣購入）</p>
            <div className="mt-2 flex flex-col gap-2">
              {crops.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => buySeed(c)}
                  className="w-full text-left rounded-lg border border-white/10 bg-slate-900/50 px-2 py-2 hover:bg-slate-800/70 text-[10px] font-bold text-slate-200"
                >
                  {c.name} 種子 · <span className="text-amber-200 tabular-nums">{c.seedPrice}</span> 金
                </button>
              ))}
            </div>
            <p className="text-[8px] font-bold text-slate-600 mt-1">成長以現實時間計算，枯萎未啟用。</p>
          </div>

          <div className="space-y-2">
            {gardenPlots.map((plot, idx) => {
              const cr = getCrop(plot.cropId);
              const ready = cr && isCropReady(plot, cr, now);
              const readyAt = cr && plot.plantedAt ? getCropReadyAtMs(plot, cr) : null;
              const remain = readyAt != null ? readyAt - now : 0;
              return (
                <div key={idx} className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
                  <p className="text-[9px] font-black text-slate-500">地塊 {idx + 1}</p>
                  {!plot.cropId ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] text-slate-500">空閒 — 播種</p>
                      <div className="flex flex-wrap gap-1">
                        {crops.map((c) => {
                          const have = getInvCount(itemInv, c.seedItemId) > 0;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              disabled={!have}
                              onClick={() => plant(idx, c.id)}
                              className="px-2 py-1 rounded-lg text-[9px] font-black border border-white/10 bg-slate-800/80 disabled:opacity-40"
                            >
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 space-y-2">
                      <p className="text-[11px] font-bold text-white">{cr?.name}</p>
                      {ready ? (
                        <p className="text-[10px] font-black text-lime-300">可採收</p>
                      ) : (
                        <p className="text-[10px] text-slate-400">
                          生長中 · 剩 {formatRemainMs(remain)} {plot.watered ? '（已澆水 -10%）' : '· 可澆水縮短'}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {!ready && !plot.watered ? (
                          <button
                            type="button"
                            onClick={() => water(idx)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-sky-600/30 border border-sky-400/30"
                          >
                            澆水（-{Math.round((1 - WATER_GROW_MUL) * 100)}% 時間）
                          </button>
                        ) : null}
                        {ready ? (
                          <button
                            type="button"
                            onClick={() => harvest(idx)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-lime-600/35 border border-lime-400/35"
                          >
                            採收
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'mine' && <MiningFlipGame setItemInv={setItemInv} setStarCrystals={setStarCrystals} onDailyQuest={onDailyQuest} />}

      {tab === 'hunt' && (
        <HuntingMinigame
          setItemInv={setItemInv}
          setStarCrystals={setStarCrystals}
          onDailyQuest={onDailyQuest}
          dragonRoundChance={getLobbyHuntingDragonRoundChance(lobbyBgId)}
        />
      )}

      {tab === 'fish' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/15 px-3 py-2 text-[10px] font-bold text-slate-300">
            每次拋竿消耗 <span className="text-amber-200 tabular-nums">{FISHING_CAST_GOLD}</span> 金幣
            {baitId !== 'none' ? '；若選用魚餌會額外消耗 1 份' : '。'}
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500">釣點</p>
            <div className="mt-1 flex flex-col gap-1">
              {FISH_SPOTS.map((s) => {
                const ok = isSpotUnlocked(s.id, prismCount);
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!ok}
                    onClick={() => setFishSpot(s.id)}
                    className={`w-full text-left rounded-lg border px-2 py-2 text-[10px] font-bold ${
                      fishSpot === s.id
                        ? 'border-cyan-400/50 bg-cyan-900/30 text-cyan-100'
                        : 'border-white/10 bg-slate-900/40 text-slate-300'
                    } disabled:opacity-40`}
                  >
                    {s.name} {!ok ? `（需稜晶 ${s.prismMin}+）` : ''} — {s.desc}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500">魚餌</p>
            <select
              value={baitId}
              onChange={(e) => setBaitId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-2 py-2 text-[10px] font-bold text-slate-100"
            >
              {FISH_BAITS.map((b) => {
                const c = b.itemId ? getInvCount(itemInv, b.itemId) : 999;
                return (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.itemId ? `（持有 ${c}）` : ''} ×{b.rareWeightMul} 珍稀權重
                  </option>
                );
              })}
            </select>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => buyBait('it_bait_worm', getItem('it_bait_worm')?.price ?? 18)}
                className="px-2 py-1 rounded-lg text-[9px] font-black border border-white/10 bg-slate-800/80"
              >
                買蟲餌
              </button>
              <button
                type="button"
                onClick={() => buyBait('it_bait_lure', getItem('it_bait_lure')?.price ?? 45)}
                className="px-2 py-1 rounded-lg text-[9px] font-black border border-white/10 bg-slate-800/80"
              >
                買擬餌
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={startFishing}
            disabled={!!qte}
            className="w-full py-2.5 rounded-xl font-black text-sm bg-cyan-600/40 hover:bg-cyan-500/50 border border-cyan-400/30 text-cyan-50 disabled:opacity-40"
          >
            拋竿（開始 QTE）
          </button>
        </div>
      )}

      {tab === 'codex' && (
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-slate-500">顯示所有魚種；釣獲後解鎖名稱與累計次數。</p>
          {FISH_DEFS.map((f) => {
            const c = Math.max(0, Math.floor(Number(fishCodex?.caught?.[f.id]) || 0));
            const got = c > 0;
            return (
              <div key={f.id} className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 flex justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-[11px] font-black truncate ${got ? 'text-white' : 'text-slate-600'}`}>
                    {got ? f.name : '？？？'}
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 line-clamp-2">{got ? f.desc : '未發現'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-[9px] font-black ${rarityClass(f.rarity)}`}>{f.rarity}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{got ? `×${c}` : '—'}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {qte && qte.fish ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70"
          role="presentation"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <FishingQTEBar
              key={qte.fish.id + String(qte.zoneCenter)}
              fishName={qte.fish.name}
              zoneWidth={(() => {
                const base = FISH_RARITY_QTE[qte.fish.rarity]?.qteZoneWidth ?? 0.2;
                const { zoneWidthMul } = getLobbyFishingQteAdjustments(lobbyBgId);
                return Math.min(0.92, Math.max(0.02, base * zoneWidthMul));
              })()}
              zoneCenter={qte.zoneCenter}
              needleSpeed={(() => {
                const base = FISH_RARITY_QTE[qte.fish.rarity]?.needleSpeed ?? 3;
                const { needleSpeedMul } = getLobbyFishingQteAdjustments(lobbyBgId);
                return Math.max(0.35, base * needleSpeedMul);
              })()}
              onResult={onQteResult}
            />
          </div>
        </div>
      ) : null}

      <div className="pt-1 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 text-xs font-black text-slate-200"
        >
          關閉
        </button>
      </div>
    </div>
  );
}
