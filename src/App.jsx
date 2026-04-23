import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Sword,
  Shield,
  RotateCcw,
  Play,
  Flame,
  Droplets,
  Wind,
  Sun,
  Moon,
  Backpack,
  Sparkles,
  ShieldAlert,
  Crosshair,
  AlertTriangle,
  Users,
  Home,
  MessageSquare,
  ChevronLeft,
  Check,
  Crown,
} from 'lucide-react';
import { HEROES_BASE, MONSTERS_BASE } from './data/units.js';
import { getSkillsForHero } from './data/heroSkills.js';
import { getMonsterBasicSkill } from './data/monsterSkills.js';
import { loadPartyIds, savePartyIds, MIN_PARTY, MAX_PARTY } from './lib/partyStorage.js';
import { buildBattleHeroesWithAura, getCaptainPassiveDef } from './game/captainAura.js';
import { getBuffAllDef, getDebuffDef, getBarrierDef, getSkillTargeting, resolveSkillDamage, resolveSkillHeal } from './game/skills.js';
import CmdBtn from './components/CmdBtn.jsx';
import NavBtn from './components/NavBtn.jsx';
import HeroAvatar from './components/HeroAvatar.jsx';

export default function App() {
  const MP_MAX = 100;
  // MP 回饋（以 5 的倍數管理）：沒防禦被命中 +10 / 防禦被命中 +5（每位角色每回合最多一次）
  const HIT_MP_GAIN_NO_GUARD = 10;
  const HIT_MP_GAIN_GUARD = 5;
  // 防禦但整段期間沒被打：在下次輪到自己行動時補 +5（與被打回 MP 互斥）
  const GUARD_NO_HIT_MP_GAIN = 5;
  const MONSTER_ATK_MP_GAIN = 10;
  const MONSTER_HIT_MP_GAIN = 5;
  const [scene, setScene] = useState('lobby');
  const [heroes, setHeroes] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [activeUnit, setActiveUnit] = useState(null);
  const [turnQueue, setTurnQueue] = useState([]);
  const [logs, setLogs] = useState(['準備冒險...']);

  const [targetMode, setTargetMode] = useState(null);
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const [pickedSkill, setPickedSkill] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [turnSeq, setTurnSeq] = useState(0);
  const [statusFocus, setStatusFocus] = useState(null); // { side: 'hero' | 'monster', id: string }
  const [skillInfo, setSkillInfo] = useState(null); // skill object for modal
  const [partyIds, setPartyIds] = useState(() => loadPartyIds());
  const [partyNotice, setPartyNotice] = useState('');
  const longPressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);

  useEffect(() => {
    savePartyIds(partyIds);
  }, [partyIds]);

  const rosterFromParty = () =>
    partyIds
      .map((id) => HEROES_BASE.find((u) => u.id === id))
      .filter(Boolean);

  const togglePartyMember = (heroId) => {
    setPartyNotice('');
    if (partyIds.includes(heroId)) {
      if (partyIds.length <= MIN_PARTY) {
        setPartyNotice(`隊伍至少需要 ${MIN_PARTY} 人上場。`);
        return;
      }
      setPartyIds((prev) => prev.filter((id) => id !== heroId));
      return;
    }
    if (partyIds.length >= MAX_PARTY) {
      setPartyNotice(`隊伍最多 ${MAX_PARTY} 人。`);
      return;
    }
    setPartyIds((prev) => [...prev, heroId]);
  };

  const setCaptain = (heroId) => {
    setPartyNotice('');
    if (!partyIds.includes(heroId) || partyIds[0] === heroId) return;
    setPartyIds((prev) => {
      const rest = prev.filter((id) => id !== heroId);
      return [heroId, ...rest];
    });
  };

  const startBattle = () => {
    const roster = rosterFromParty();
    if (roster.length < MIN_PARTY) return;
    const { heroes: h, auraLine } = buildBattleHeroesWithAura(roster, partyIds[0]);
    const m = MONSTERS_BASE.map((u) => ({
      ...u,
      curHp: u.hp,
      curMp: u.mp ?? MP_MAX,
      mdef: u.mdef ?? u.def,
      lastHitMpTurn: -1,
      defDownTurns: 0,
      defDownMul: 1,
      mdefDownTurns: 0,
      mdefDownMul: 1,
      av: 10000 / u.spd,
      isHero: false,
    }));
    setHeroes(h);
    setMonsters(m);
    setTurnSeq(0);
    setScene('battle');
    setLogs(['戰鬥開始！史萊姆出現了。', ...(auraLine ? [auraLine] : [])].slice(0, 5));
    calculateNextTurn(h, m);
  };

  const calculateNextTurn = (hList, mList) => {
    const alive = [...hList.filter((u) => u.curHp > 0), ...mList.filter((u) => u.curHp > 0)];
    if (alive.length === 0) return;
    const sorted = [...alive].sort((a, b) => a.av - b.av);

    // 防禦沒被打的 MP 補償：在輪到本人行動時檢查（避免立即給，並可與被打回 MP 互斥）
    const next = sorted[0];
    // 回合開始被動（例：熊吉 turnStartMp）
    if (next?.isHero && next.passive?.effect?.type === 'turnStartMp') {
      const gain = next.passive.effect.value ?? 0;
      if (gain > 0) {
        const updated = hList.map((h) => (h.id === next.id ? { ...h, curMp: Math.min(MP_MAX, h.curMp + gain) } : h));
        setHeroes(updated);
      }
    }
    if (next?.isHero && next.status === 'guard' && (next.guardStartTurnSeq ?? -1) >= 0) {
      const guardSeq = next.guardStartTurnSeq ?? -1;
      const hasHitMpThisGuard = (next.lastHitMpTurn ?? -1) >= guardSeq;
      const alreadyRewarded = (next.guardNoHitRewardedSeq ?? -1) === guardSeq;
      if (!hasHitMpThisGuard && !alreadyRewarded) {
        const updated = hList.map((h) =>
          h.id === next.id
            ? {
                ...h,
                curMp: Math.min(MP_MAX, h.curMp + GUARD_NO_HIT_MP_GAIN),
                guardNoHitRewardedSeq: guardSeq,
              }
            : h
        );
        setHeroes(updated);
        // 重新計算 alive/sorted 會變動較大，這裡只更新 activeUnit 對應物件的 MP（視覺上立即反映即可）
        const patchedNext = updated.find((h) => h.id === next.id) ?? next;
        setActiveUnit(patchedNext);
      } else {
        setActiveUnit(next);
      }
    } else {
      setActiveUnit(next);
    }
    setTurnQueue(sorted.slice(0, 10));
    setTargetMode(null);
    setSkillMenuOpen(false);
    setPickedSkill(null);
    setIsProcessing(false);
  };

  const advanceTurn = (hList, mList) => {
    setTurnSeq((t) => t + 1);
    const h2 = tickHeroBuffsOnEndTurn(hList);
    const m2 = tickMonsterDebuffsOnEndTurn(mList);
    calculateNextTurn(h2, m2);
  };

  const endHeroAction = (baseHeroes, { mpCost = 0, mpGain = 0 } = {}) => {
    const nextAv = activeUnit.av + 10000 / activeUnit.spd;
    const newH = baseHeroes.map((h) =>
      h.id === activeUnit.id
        ? {
            ...h,
            av: nextAv,
            status: null,
            curMp: Math.max(0, Math.min(MP_MAX, h.curMp - mpCost + mpGain)),
          }
        : h
    );
    setHeroes(newH);
    return newH;
  };

  const getDamage = (atkU, defU, isSkill, skillMul = 1, scale = 'matk') => {
    const isMagical = isSkill && scale === 'matk';
    const isMixed = isSkill && scale === 'mix';
    const rawDef = defU.def;
    const rawMdef = defU.mdef ?? defU.def;
    const defMul = (defU.defDownTurns ?? 0) > 0 ? defU.defDownMul ?? 1 : 1;
    const mdefMul = (defU.mdefDownTurns ?? 0) > 0 ? defU.mdefDownMul ?? 1 : 1;
    const effDef = Math.max(1, Math.floor(rawDef * defMul));
    const effMdef = Math.max(1, Math.floor(rawMdef * mdefMul));
    const defense = isMixed ? Math.floor((effDef + effMdef) / 2) : isMagical ? effMdef : effDef;

    let base = atkU.atk;
    if (isSkill) {
      const atkMul = (atkU.atkBuffTurns ?? 0) > 0 ? atkU.atkBuffMul ?? 1 : 1;
      const effAtk = Math.max(1, Math.floor(atkU.atk * atkMul));
      const effMatk = atkU.matk ?? 0;
      if (scale === 'atk') base = effAtk * 1.5;
      else if (scale === 'mix') base = (effAtk * 0.7 + effMatk * 0.7) * 1.5;
      else base = effMatk || effAtk * 1.5;
      base *= skillMul;
    } else {
      const atkMul = (atkU.atkBuffTurns ?? 0) > 0 ? atkU.atkBuffMul ?? 1 : 1;
      base = Math.max(1, Math.floor(atkU.atk * atkMul));
      if (atkU.isHero && atkU.passive?.effect?.type === 'basicAtkMul') {
        const mul = atkU.passive.effect.value ?? 1;
        if (mul !== 1) base = Math.max(1, Math.floor(base * mul));
      }
    }
    const mitigation = defense / (defense + 500);
    let final = Math.max(1, Math.floor(base * (1 - mitigation) * (0.9 + Math.random() * 0.2)));
    if (defU.status === 'guard') final = Math.floor(final * 0.5);
    if (defU.isHero && defU.status === 'guard' && defU.passive?.effect?.type === 'guardIncomingMul') {
      const mul = defU.passive.effect.value ?? 1;
      if (mul !== 1) final = Math.max(1, Math.floor(final * mul));
    }
    if (!atkU.isHero && defU.isHero) {
      const mul = defU.incomingDmgMul ?? 1;
      if (mul !== 1) final = Math.max(1, Math.floor(final * mul));
      if ((defU.barrierTurns ?? 0) > 0) {
        const bMul = defU.barrierMul ?? 1;
        if (bMul !== 1) final = Math.max(1, Math.floor(final * bMul));
      }
    }
    return final;
  };

  const tickBarrierOnHit = (hList, targetHeroId) =>
    hList.map((h) =>
      h.id === targetHeroId && (h.barrierTurns ?? 0) > 0
        ? { ...h, barrierTurns: Math.max(0, (h.barrierTurns ?? 0) - 1) }
        : h
    );

  const tickHeroBuffsOnEndTurn = (hList) =>
    hList.map((h) =>
      h.curHp > 0
        ? {
            ...h,
            atkBuffTurns: Math.max(0, (h.atkBuffTurns ?? 0) - 1),
          }
        : h
    );

  const tickMonsterDebuffsOnEndTurn = (mList) =>
    mList.map((m) =>
      m.curHp > 0
        ? {
            ...m,
            defDownTurns: Math.max(0, (m.defDownTurns ?? 0) - 1),
            mdefDownTurns: Math.max(0, (m.mdefDownTurns ?? 0) - 1),
          }
        : m
    );

  const buildUnitEffects = (u) => {
    if (!u) return [];
    const out = [];

    if (u.isHero) {
      if (u.passive?.name) out.push({ kind: 'passive', label: `被動：${u.passive.name}` });
      if (u.status === 'guard') out.push({ kind: 'buff', label: '防禦' });
      if ((u.barrierTurns ?? 0) > 0) out.push({ kind: 'buff', label: `護盾×${u.barrierTurns}` });

      if ((u.atkBuffTurns ?? 0) > 0) {
        const mul = u.atkBuffMul ?? 1;
        const pct = Math.round((mul - 1) * 100);
        out.push({ kind: 'buff', label: `攻擊↑${pct}%（${u.atkBuffTurns}）` });
      }

      if ((u.incomingDmgMul ?? 1) !== 1) {
        const pct = Math.round((1 - (u.incomingDmgMul ?? 1)) * 100);
        out.push({ kind: 'buff', label: `受傷↓${pct}%` });
      }
    } else {
      if ((u.defDownTurns ?? 0) > 0) {
        const mul = u.defDownMul ?? 1;
        const pct = Math.round((1 - mul) * 100);
        out.push({ kind: 'debuff', label: `物防↓${pct}%（${u.defDownTurns}）` });
      }
      if ((u.mdefDownTurns ?? 0) > 0) {
        const mul = u.mdefDownMul ?? 1;
        const pct = Math.round((1 - mul) * 100);
        out.push({ kind: 'debuff', label: `魔防↓${pct}%（${u.mdefDownTurns}）` });
      }
    }

    return out;
  };

  const renderEffectChip = (e, idx) => (
    <span
      key={`${e.label}-${idx}`}
      className={`px-2 py-1 rounded-full text-[8px] font-black tracking-wide border ${
        e.kind === 'debuff'
          ? 'bg-red-950/40 text-red-200 border-red-500/25'
          : e.kind === 'passive'
            ? 'bg-slate-900/60 text-slate-300 border-white/10'
          : 'bg-emerald-950/35 text-emerald-200 border-emerald-500/20'
      }`}
    >
      {e.label}
    </span>
  );

  const describeSkillEffect = (skill) => {
    const e = skill?.effect;
    if (!e) return '（無效果資料）';
    if (e.type === 'damage') {
      const tgt = e.target === 'enemy-all' ? '敵方全體' : '敵方單體';
      const mul = e.powerMul ?? 1;
      return `${tgt}傷害（倍率×${mul}）`;
    }
    if (e.type === 'heal') {
      const mul = e.powerMul ?? 1;
      return `治療我方單體（倍率×${mul}）`;
    }
    if (e.type === 'barrier') {
      const pct = Math.round((1 - (e.incomingMul ?? 1)) * 100);
      return `我方全體護盾（減傷 ${pct}% · ${e.turns ?? 1} 次）`;
    }
    if (e.type === 'buff' && e.stat === 'atk') {
      const pct = Math.round(((e.mul ?? 1) - 1) * 100);
      return `我方全體攻擊提升 +${pct}%（${e.turns ?? 1} 回合）`;
    }
    if (e.type === 'debuff' && e.stat === 'def+mdef') {
      const pct = Math.round((1 - (e.mul ?? 1)) * 100);
      const dmg = typeof e.damageMul === 'number' ? `，並造成小傷害×${e.damageMul}` : '';
      return `敵方單體雙防降低 ${pct}%（${e.turns ?? 1} 回合）${dmg}`;
    }
    return `效果：${e.type}`;
  };

  const castBarrierAll = async (skill) => {
    if (!activeUnit?.isHero) return;
    const def = getBarrierDef(skill);
    if (!def) return;
    const mpCost = skill?.mpCost ?? 0;
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    setIsProcessing(true);
    const newH0 = heroes.map((h) =>
      h.curHp > 0 ? { ...h, barrierTurns: def.turns, barrierMul: def.incomingMul } : h
    );
    setHeroes(newH0);
    setLogs([`${activeUnit.name} 施放「${skill.name}」：全隊獲得護盾（${Math.round((1 - def.incomingMul) * 100)}%減傷，${def.turns}次）`, ...logs].slice(0, 5));
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters);
  };

  const castBuffAtkAll = async (skill) => {
    if (!activeUnit?.isHero) return;
    const def = getBuffAllDef(skill);
    if (!def) return;
    const mpCost = skill?.mpCost ?? 0;
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    setIsProcessing(true);
    const newH0 = heroes.map((h) => (h.curHp > 0 ? { ...h, atkBuffTurns: def.turns, atkBuffMul: def.mul } : h));
    setHeroes(newH0);
    setLogs([`${activeUnit.name} 施放「${skill.name}」：全隊攻擊提升（${Math.round((def.mul - 1) * 100)}%），${def.turns}回合`, ...logs].slice(0, 5));
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters);
  };

  const castDamageAllEnemies = async (skill) => {
    if (!activeUnit?.isHero) return;
    const effect = skill?.effect;
    if (!effect || effect.type !== 'damage' || effect.target !== 'enemy-all') return;
    const mpCost = skill?.mpCost ?? 0;
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    setIsProcessing(true);
    const alive = monsters.filter((m) => m.curHp > 0);
    const hits = alive.map((m) => ({
      id: m.id,
      dmg: resolveSkillDamage({ caster: activeUnit, target: m, skill, getDamage }).damage,
    }));
    const newM = monsters.map((m) => {
      const h = hits.find((x) => x.id === m.id);
      if (!h) return m;
      return { ...m, curHp: Math.max(0, m.curHp - h.dmg) };
    });
    setMonsters(newM);
    const total = hits.reduce((s, x) => s + x.dmg, 0);
    setLogs([`${activeUnit.name} 施放「${skill.name}」：全體造成總計 ${total} 傷害`, ...logs].slice(0, 5));
    const newH = endHeroAction(heroes, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    if (newM.every((m) => m.curHp <= 0)) setScene('victory');
    else advanceTurn(newH, newM);
  };

  const onHeroTargetSelect = async (hId) => {
    if (targetMode !== 'skill-ally' || isProcessing || !activeUnit?.isHero || !pickedSkill) return;
    const t = getSkillTargeting(pickedSkill);
    if (t.side !== 'ally') return;

    const target = heroes.find((h) => h.id === hId);
    if (!target || target.curHp <= 0) return;

    const mpCost = pickedSkill?.mpCost ?? 0;
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${pickedSkill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    setIsProcessing(true);
    const heal = resolveSkillHeal({ caster: activeUnit, target, skill: pickedSkill }).heal;
    const healPassive = activeUnit?.passive?.effect?.type === 'healGivesBarrier' ? activeUnit.passive.effect : null;
    const newH0 = heroes.map((h) => {
      if (h.id !== hId) return h;
      const next = { ...h, curHp: Math.min(h.hp, h.curHp + heal) };
      if (healPassive) {
        next.barrierTurns = Math.max(next.barrierTurns ?? 0, healPassive.turns ?? 1);
        next.barrierMul = Math.min(next.barrierMul ?? 1, healPassive.incomingMul ?? 1);
      }
      return next;
    });
    setHeroes(newH0);
    setLogs([`${activeUnit.name} 施放「${pickedSkill.name}」治療 ${target.name} +${heal}`, ...logs].slice(0, 5));

    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters);
  };

  const onTargetSelect = async (mId) => {
    if (!targetMode || isProcessing || !activeUnit?.isHero) return;
    if (targetMode === 'skill' && !pickedSkill) return;
    setIsProcessing(true);

    const target = monsters.find((m) => m.id === mId);
    if (!target || target.curHp <= 0) {
      setIsProcessing(false);
      return;
    }

    const isSkill = targetMode === 'skill';
    const t = isSkill ? getSkillTargeting(pickedSkill) : null;
    if (isSkill && t?.side === 'ally') {
      setIsProcessing(false);
      return;
    }
    const skillScale = isSkill ? pickedSkill?.scale ?? 'matk' : 'matk';
    const mpCost = isSkill ? pickedSkill?.mpCost ?? 20 : 0;
    if (isSkill && activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${pickedSkill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      setIsProcessing(false);
      return;
    }
    const deb = isSkill ? getDebuffDef(pickedSkill) : null;
    const applyDebuff = !!deb && pickedSkill?.effect?.type === 'debuff';
    const extraDebuffTurns =
      applyDebuff && activeUnit?.passive?.effect?.type === 'debuffTurnsPlus'
        ? activeUnit.passive.effect.value ?? 0
        : 0;
    const debuffDamageMul = applyDebuff ? pickedSkill?.effect?.damageMul : null;
    const applyDebuffDamage = applyDebuff && typeof debuffDamageMul === 'number' && debuffDamageMul > 0;
    const damage = applyDebuff
      ? (applyDebuffDamage ? getDamage(activeUnit, target, true, debuffDamageMul, pickedSkill?.scale ?? 'matk') : 0)
      : isSkill
        ? resolveSkillDamage({ caster: activeUnit, target, skill: pickedSkill, getDamage }).damage
        : getDamage(activeUnit, target, false, 1, skillScale);
    const newM = monsters.map((m) =>
      m.id === mId
        ? {
            ...m,
            curHp: Math.max(0, m.curHp - damage),
            curMp:
              (m.curHp > 0
                ? Math.min(MP_MAX, (m.curMp ?? 0) + (m.lastHitMpTurn === turnSeq ? 0 : MONSTER_HIT_MP_GAIN))
                : (m.curMp ?? 0)),
            lastHitMpTurn: m.lastHitMpTurn === turnSeq ? m.lastHitMpTurn : turnSeq,
            ...(applyDebuff && deb?.stat === 'def+mdef'
              ? {
                  defDownTurns: (deb.turns ?? 0) + extraDebuffTurns,
                  defDownMul: deb.mul,
                  mdefDownTurns: (deb.turns ?? 0) + extraDebuffTurns,
                  mdefDownMul: deb.mul,
                }
              : {}),
          }
        : m
    );
    setMonsters(newM);
    const skillLabel = isSkill && pickedSkill ? `「${pickedSkill.name}」` : '';
    const debuffLine =
      applyDebuff && deb?.stat === 'def+mdef'
        ? `降低雙防（${Math.round((1 - deb.mul) * 100)}%）${(deb.turns ?? 0) + extraDebuffTurns}回合`
        : '';
    setLogs(
      [
        isSkill
          ? applyDebuff
            ? `${activeUnit.name} 施放${skillLabel}：${target.name} ${debuffLine}${applyDebuffDamage ? `，並造成 ${damage} 傷害` : ''}`
            : `${activeUnit.name} 施放${skillLabel}對 ${target.name} 造成 ${damage} 傷害！`
          : `${activeUnit.name} 對 ${target.name} 造成 ${damage} 傷害！`,
        ...logs,
      ].slice(0, 5)
    );

    const isAttack = targetMode === 'attack';
    const atkMpGain = !isSkill && isAttack ? 10 : 0;
    const newH = endHeroAction(heroes, { mpCost: isSkill ? mpCost : 0, mpGain: atkMpGain });

    await new Promise((r) => setTimeout(r, 600));
    if (newM.every((m) => m.curHp <= 0)) setScene('victory');
    else advanceTurn(newH, newM);
  };

  const onGuard = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const newH = heroes.map((h) =>
      h.id === activeUnit.id
        ? { ...h, status: 'guard', guardStartTurnSeq: turnSeq, guardNoHitRewardedSeq: -1, av: h.av + 10000 / h.spd }
        : h
    );
    setHeroes(newH);
    setLogs([`${activeUnit.name} 進入防禦狀態`, ...logs].slice(0, 5));
    setTimeout(() => advanceTurn(newH, monsters), 500);
  };

  useEffect(() => {
    if (scene === 'battle' && activeUnit && !activeUnit.isHero && !isProcessing) {
      const monsterAI = async () => {
        setIsProcessing(true);
        await new Promise((r) => setTimeout(r, 1000));
        const aliveH = heroes.filter((h) => h.curHp > 0);
        if (aliveH.length === 0) return;
        const target = aliveH[Math.floor(Math.random() * aliveH.length)];
        const mSkill = getMonsterBasicSkill(activeUnit);
        const canSkill = mSkill && (activeUnit.curMp ?? 0) >= (mSkill.mpCost ?? 0);
        const useSkill = canSkill && Math.random() < 0.4;

        const dmg = useSkill
          ? resolveSkillDamage({ caster: activeUnit, target, skill: mSkill, getDamage }).damage
          : getDamage(activeUnit, target, false);
        let newH = heroes.map((h) => {
          if (h.id !== target.id) return h;
          const aliveBefore = h.curHp > 0;
          const nextHp = Math.max(0, h.curHp - dmg);
          const alreadyGained = h.lastHitMpTurn === turnSeq;
          const hitGain = h.status === 'guard' ? HIT_MP_GAIN_GUARD : HIT_MP_GAIN_NO_GUARD;
          const mpAdd = !alreadyGained && aliveBefore ? hitGain : 0;
          return {
            ...h,
            curHp: nextHp,
            curMp: Math.min(MP_MAX, h.curMp + mpAdd),
            lastHitMpTurn: alreadyGained ? h.lastHitMpTurn : turnSeq,
          };
        });
        newH = tickBarrierOnHit(newH, target.id);
        setHeroes(newH);
        const skillLabel = useSkill ? `施放「${mSkill.name}」` : '撞擊了';
        setLogs([`${activeUnit.name} ${skillLabel} ${target.name}，造成 ${dmg} 傷害`, ...logs].slice(0, 5));
        const nextAv = activeUnit.av + 10000 / activeUnit.spd;
        const newM = monsters.map((m) =>
          m.id === activeUnit.id
            ? {
                ...m,
                av: nextAv,
                curMp: Math.min(
                  MP_MAX,
                  (useSkill ? Math.max(0, (m.curMp ?? 0) - (mSkill.mpCost ?? 0)) : (m.curMp ?? 0)) +
                    (!useSkill ? MONSTER_ATK_MP_GAIN : 0)
                ),
              }
            : m
        );
        setMonsters(newM);
        if (newH.every((h) => h.curHp <= 0)) setScene('defeat');
        else advanceTurn(newH, newM);
      };
      monsterAI();
    }
  }, [activeUnit, scene, isProcessing]);

  useEffect(() => {
    if (scene !== 'battle') setShowExitModal(false);
  }, [scene]);

  const getStatusUnit = () => {
    if (statusFocus?.side === 'hero') return heroes.find((h) => h.id === statusFocus.id) ?? null;
    if (statusFocus?.side === 'monster') return monsters.find((m) => m.id === statusFocus.id) ?? null;
    return activeUnit;
  };

  const statusUnit = getStatusUnit();

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <div className="h-10 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-[10px] px-1.5 py-0.5 rounded font-black italic">AETHELGARD</div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {scene === 'lobby' ? 'Main Hall' : scene === 'party' ? 'Squad' : 'Battle Zone'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {scene === 'battle' ? (
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
              aria-label="返回首頁"
              title="返回首頁"
            >
              <Home size={18} strokeWidth={2.25} />
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/5 text-[10px]">
              <Zap size={10} className="text-yellow-400" /> 120
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {scene === 'lobby' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)]">
            <div className="animate-pulse mb-4">
              <Shield size={64} className="text-blue-500/50" />
            </div>
            <div className="text-center">
              <h1 className="text-5xl font-black italic tracking-tighter mb-2 text-white">遺落王權</h1>
              <p className="text-slate-500 text-[10px] tracking-[0.4em] uppercase">Adventure Awaits</p>
            </div>

            <div className="w-full max-w-xs space-y-4">
              <button
                type="button"
                onClick={startBattle}
                className="w-full group bg-red-600 hover:bg-red-500 p-4 rounded-2xl flex items-center justify-between shadow-xl transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <Sword className="text-white" />
                  <div className="text-left">
                    <p className="text-xs font-black italic">進入戰鬥</p>
                    <p className="text-[10px] text-white/60">第一章：史萊姆棲息地</p>
                  </div>
                </div>
                <Play size={20} fill="currentColor" />
              </button>
              <button
                type="button"
                onClick={() => setScene('party')}
                className="w-full bg-slate-900/80 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all hover:bg-slate-800/90 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-blue-400" />
                  <div className="text-left">
                    <p className="text-xs font-black italic">隊伍編輯</p>
                    <p className="text-[10px] text-slate-400">上場 {partyIds.length} 人 · 最少 {MIN_PARTY} 人</p>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-slate-500 -rotate-180" />
              </button>
            </div>
          </div>
        )}

        {scene === 'party' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)]">
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setScene('lobby')}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white mb-2"
              >
                <ChevronLeft size={14} />
                返回大廳
              </button>
              <h2 className="text-lg font-black italic text-white tracking-tight">隊伍編輯</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                點選角色加入或移出上場名單（至少 {MIN_PARTY} 人，最多 {MAX_PARTY} 人）。上陣<strong className="text-slate-400">第一位</strong>
                為<strong className="text-amber-400/90">隊長</strong>，戰鬥中底欄順序亦同。
              </p>
              {partyIds[0] ? (
                <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Crown size={16} className="text-amber-400 shrink-0" strokeWidth={2.25} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-amber-200/90 uppercase tracking-wide">隊長</p>
                      <p className="text-xs font-bold text-white truncate">
                        {HEROES_BASE.find((u) => u.id === partyIds[0])?.name ?? '—'}
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const cp = getCaptainPassiveDef(partyIds[0]);
                    return cp ? (
                      <p className="text-[9px] text-amber-100/85 mt-2 leading-snug pl-0.5 border-t border-amber-500/20 pt-2">
                        <span className="font-black text-amber-300">隊長技「{cp.name}」</span>
                        {cp.description}
                      </p>
                    ) : null;
                  })()}
                </div>
              ) : null}
              {partyNotice ? <p className="text-[10px] text-amber-400 mt-2 font-bold">{partyNotice}</p> : null}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 pb-6">
              {HEROES_BASE.map((hero) => {
                const on = partyIds.includes(hero.id);
                const isCaptain = on && partyIds[0] === hero.id;
                const cantLeave = on && partyIds.length <= MIN_PARTY;
                const cantJoin = !on && partyIds.length >= MAX_PARTY;
                return (
                  <div
                    key={hero.id}
                    className={`w-full flex items-stretch gap-1.5 rounded-xl border p-2 transition-colors ${
                      on
                        ? 'border-blue-500/50 bg-blue-600/15 ring-1 ring-blue-500/20'
                        : 'border-white/10 bg-slate-900/40'
                    } ${cantLeave || cantJoin ? 'opacity-70' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => togglePartyMember(hero.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-white/5 active:scale-[0.99]"
                    >
                      <HeroAvatar src={hero.avatar} name={hero.name} accentClassName={hero.color} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-black truncate ${on ? 'text-blue-100' : 'text-slate-200'}`}>{hero.name}</p>
                        {hero.title ? (
                          <p className="text-[9px] text-slate-500 mt-0.5 tracking-wide">「{hero.title}」</p>
                        ) : null}
                        {hero.captainPassive ? (
                          <p className="text-[8px] text-slate-600 mt-1 leading-snug line-clamp-2">
                            擔任隊長：{hero.captainPassive.name}（{hero.captainPassive.description}）
                          </p>
                        ) : null}
                      </div>
                    </button>
                    {on && !isCaptain ? (
                      <button
                        type="button"
                        onClick={() => setCaptain(hero.id)}
                        className="flex shrink-0 flex-col items-center justify-center gap-0.5 self-center rounded-lg border border-amber-500/45 bg-amber-950/55 px-2 py-1.5 text-[8px] font-black leading-tight text-amber-100 shadow-sm transition-colors hover:bg-amber-900/70 active:scale-95"
                        title="將此角色設為上陣第一位（隊長）"
                      >
                        <Crown size={14} strokeWidth={2.25} className="text-amber-400" />
                        設為隊長
                      </button>
                    ) : null}
                    <div
                      className={`flex shrink-0 flex-col items-center justify-center self-center rounded-full px-2 py-1 text-[9px] font-black ${
                        isCaptain
                          ? 'bg-amber-600 text-amber-950 ring-1 ring-amber-400/50'
                          : on
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {on ? (
                        isCaptain ? (
                          <span className="flex items-center gap-1">
                            <Crown size={12} strokeWidth={2.5} className="shrink-0" />
                            隊長
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Check size={12} strokeWidth={3} />
                            上陣
                          </span>
                        )
                      ) : (
                        '候補'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {scene === 'battle' && (
          <div className="flex-1 flex flex-col min-h-0 p-4 gap-2">
            {heroes[0]?.captainPassive ? (
              <div className="shrink-0 rounded-lg border border-amber-500/25 bg-amber-950/40 px-2 py-1.5 text-center">
                <p className="text-[8px] text-amber-100/95 leading-snug">
                  <span className="font-black text-amber-300">隊長技「{heroes[0].captainPassive.name}」</span>
                  <span className="text-amber-100/80"> {heroes[0].captainPassive.description}</span>
                </p>
              </div>
            ) : null}
            <div className="flex gap-1 overflow-x-auto no-scrollbar shrink-0 h-10 mt-1 items-center">
              {turnQueue.map((u, i) => (
                <div
                  key={`${u.id}-${i}`}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 overflow-hidden transition-all ${
                    i === 0 ? 'ring-2 ring-yellow-400 scale-110' : 'opacity-30'
                  } ${u.isHero ? 'border-blue-500 bg-blue-500/20' : 'border-red-500 bg-red-500/20'}`}
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt=""
                      width={64}
                      height={64}
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : u.isHero && u.avatar ? (
                    <HeroAvatar src={u.avatar} name={u.name} accentClassName={u.color} size="xs" className="!ring-0 rounded-none" />
                  ) : (
                    <span className="text-[8px] font-black uppercase">{u.name[0]}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center items-end gap-3 py-5 shrink-0 h-32">
              {monsters.map((m) => (
                <div
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const canTargetEnemy = targetMode === 'attack' || targetMode === 'skill';
                    if (canTargetEnemy) onTargetSelect(m.id);
                    else setStatusFocus({ side: 'monster', id: m.id });
                  }}
                  onKeyDown={(e) => {
                    const canTargetEnemy = targetMode === 'attack' || targetMode === 'skill';
                    if ((e.key === 'Enter' || e.key === ' ') && canTargetEnemy) onTargetSelect(m.id);
                  }}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    m.curHp <= 0 ? 'opacity-20 scale-75 grayscale' : 'active:scale-90 cursor-pointer'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full bg-slate-900 border-2 flex items-center justify-center overflow-hidden transition-all ${
                      (targetMode === 'attack' || targetMode === 'skill') && m.curHp > 0
                        ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                        : 'border-white/10'
                    } ${statusFocus?.side === 'monster' && statusFocus.id === m.id ? 'ring-2 ring-cyan-300/70' : ''}`}
                  >
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        alt=""
                        width={64}
                        height={64}
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        {m.type === 'fire' && <Flame className="text-red-400" size={24} />}
                        {m.type === 'water' && <Droplets className="text-blue-400" size={24} />}
                        {m.type === 'wind' && <Wind className="text-emerald-400" size={24} />}
                        {m.type === 'dark' && <Moon className="text-purple-400" size={24} />}
                        {m.type === 'light' && <Sun className="text-yellow-300" size={24} />}
                      </>
                    )}
                  </div>
                  <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(m.curHp / m.hp) * 100}%` }} />
                  </div>
                  <div className="text-[8px] font-black text-slate-500 mt-0.5 tabular-nums">
                    HP {m.curHp}/{m.hp}
                  </div>
                  <div className="text-[8px] font-black text-slate-600 -mt-0.5 tabular-nums">
                    MP {(m.curMp ?? 0)}/{m.mp ?? MP_MAX}
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-200 uppercase tracking-wide">狀態</p>
                  <p className="text-[9px] text-slate-500 truncate">
                    {statusUnit ? `${statusUnit.isHero ? '我方' : '敵方'} · ${statusUnit.name}` : '—'}
                  </p>
                </div>
                {statusUnit?.isHero ? (
                  <span className="text-[8px] font-black text-slate-500 tabular-nums">
                    HP {statusUnit.curHp}/{statusUnit.hp} · MP {statusUnit.curMp}/100
                  </span>
                ) : (
                  <span className="text-[8px] font-black text-slate-500 tabular-nums">
                    HP {statusUnit?.curHp}/{statusUnit?.hp} · MP {(statusUnit?.curMp ?? 0)}/{statusUnit?.mp ?? MP_MAX}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {statusUnit && buildUnitEffects(statusUnit).length > 0 ? (
                  buildUnitEffects(statusUnit).map(renderEffectChip)
                ) : (
                  <span className="text-[9px] text-slate-600 font-bold">（無）</span>
                )}
              </div>
            </div>

            <div className="bg-black/50 border border-white/5 rounded-xl p-2 h-20 overflow-y-auto no-scrollbar font-mono shrink-0">
              {logs.map((l, i) => (
                <div key={i} className={`text-[9px] mb-0.5 leading-tight ${i === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {i === 0 ? '▶ ' : ''}
                  {l}
                </div>
              ))}
            </div>

            <div className="flex-1 min-h-0 shrink" aria-hidden="true" />
            <div className="shrink-0 pb-1">
              {activeUnit?.isHero && !isProcessing && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 px-0.5">
                  {skillMenuOpen ? (
                    <div className="bg-purple-950/80 border border-purple-500/40 rounded-xl p-2 shadow-lg ring-1 ring-purple-500/25">
                      <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
                        <span className="text-[9px] font-black text-purple-200 uppercase tracking-wide">技能</span>
                        <button
                          type="button"
                          onClick={() => setSkillMenuOpen(false)}
                          className="flex items-center gap-0.5 text-[8px] font-bold text-purple-300 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10"
                        >
                          <ChevronLeft size={12} className="shrink-0" />
                          返回
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {getSkillsForHero(activeUnit).map((s) => {
                          const lackMp = activeUnit.curMp < s.mpCost;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              disabled={lackMp}
                              onPointerDown={() => {
                                longPressFiredRef.current = false;
                                if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                                longPressTimerRef.current = setTimeout(() => {
                                  longPressFiredRef.current = true;
                                  setSkillInfo(s);
                                }, 450);
                              }}
                              onPointerUp={() => {
                                if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                              }}
                              onPointerCancel={() => {
                                if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setSkillInfo(s);
                              }}
                              onClick={() => {
                                if (longPressFiredRef.current) return;
                                if (lackMp) {
                                  setLogs([`MP 不足，無法施放「${s.name}」（需 ${s.mpCost}）`, ...logs].slice(0, 5));
                                  return;
                                }
                                setPickedSkill(s);
                                setSkillMenuOpen(false);
                                const t = getSkillTargeting(s);
                                if (!t.requiresTarget && t.side === 'ally' && t.mode === 'all') {
                                  if (s?.effect?.type === 'barrier') {
                                    castBarrierAll(s);
                                    return;
                                  }
                                  if (s?.effect?.type === 'buff') {
                                    castBuffAtkAll(s);
                                    return;
                                  }
                                }
                                if (!t.requiresTarget && t.side === 'enemy' && t.mode === 'all') {
                                  if (s?.effect?.type === 'damage') {
                                    castDamageAllEnemies(s);
                                    return;
                                  }
                                }
                                if (t.requiresTarget) setTargetMode(t.side === 'ally' ? 'skill-ally' : 'skill');
                              }}
                              className={`flex flex-col items-start justify-center rounded-lg border px-2 py-1.5 text-left transition-all active:scale-[0.98] ${
                                lackMp
                                  ? 'border-white/5 bg-slate-900/40 text-slate-600 cursor-not-allowed opacity-60'
                                  : 'border-purple-500/40 bg-purple-600/25 hover:bg-purple-600/40 border-opacity-100'
                              }`}
                            >
                              <span className="text-[9px] font-black text-purple-100 leading-tight line-clamp-2">{s.name}</span>
                              <span className="text-[8px] font-bold text-cyan-300/90 mt-0.5">MP {s.mpCost}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : targetMode ? (
                    <div className="bg-blue-600/20 border border-blue-500/50 p-2 rounded-xl flex items-center justify-between shadow-lg ring-1 ring-blue-500/30 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Crosshair size={18} className="text-blue-400 animate-pulse shrink-0" />
                        <div>
                          <p className="text-[9px] font-black italic text-blue-100 uppercase">Target Selection</p>
                          <p className="text-[8px] text-blue-300 leading-snug">
                            {(targetMode === 'skill' || targetMode === 'skill-ally') && pickedSkill
                              ? (() => {
                                  const t = getSkillTargeting(pickedSkill);
                                  return t.side === 'ally' ? `請選擇隊友施放「${pickedSkill.name}」` : `請選擇目標施放「${pickedSkill.name}」`;
                                })()
                              : '請點擊上方的敵人進行攻擊'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetMode(null);
                          setPickedSkill(null);
                        }}
                        className="text-[9px] font-bold px-3 py-1 bg-white/10 rounded-full border border-white/10 shrink-0"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5">
                      <CmdBtn
                        icon={<Sword size={14} />}
                        label="攻擊"
                        color="bg-red-600"
                        onClick={() => {
                          setSkillMenuOpen(false);
                          setPickedSkill(null);
                          setTargetMode('attack');
                        }}
                      />
                      <CmdBtn icon={<ShieldAlert size={14} />} label="防禦" color="bg-blue-600" onClick={onGuard} />
                      <CmdBtn
                        icon={<Sparkles size={14} />}
                        label="技能"
                        color="bg-purple-600"
                        onClick={() => {
                          setTargetMode(null);
                          setPickedSkill(null);
                          setSkillMenuOpen(true);
                        }}
                      />
                      <CmdBtn icon={<Backpack size={14} />} label="道具" color="bg-slate-700" onClick={() => {}} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className={`grid gap-1 pt-2 border-t border-white/5 shrink-0 pb-2 mb-1 ${
                heroes.length === 1
                  ? 'grid-cols-1 max-w-[120px] mx-auto'
                  : heroes.length === 2
                    ? 'grid-cols-2'
                    : heroes.length === 3
                      ? 'grid-cols-3'
                      : heroes.length === 4
                        ? 'grid-cols-4'
                        : 'grid-cols-5'
              }`}
            >
              {heroes.map((h, hi) => (
                <div
                  key={h.id}
                  className={`flex flex-col items-center p-1 rounded-lg border transition-all ${
                    activeUnit?.id === h.id ? 'bg-blue-600/30 border-blue-400 shadow-lg ring-1 ring-blue-400/40' : 'bg-slate-900/50 border-white/5'
                  } ${h.curHp <= 0 ? 'opacity-20 grayscale' : ''} ${hi === 0 ? 'ring-1 ring-amber-500/35 border-amber-500/25' : ''}`}
                >
                  <div
                    role={targetMode === 'skill-ally' ? 'button' : undefined}
                    tabIndex={targetMode === 'skill-ally' ? 0 : undefined}
                    onClick={() => {
                      if (targetMode === 'skill-ally') onHeroTargetSelect(h.id);
                      else setStatusFocus({ side: 'hero', id: h.id });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (targetMode === 'skill-ally') onHeroTargetSelect(h.id);
                      }
                    }}
                    className={`relative mb-0.5 inline-flex cursor-pointer ${
                      statusFocus?.side === 'hero' && statusFocus.id === h.id ? 'ring-2 ring-cyan-300/70 rounded-full' : ''
                    }`}
                  >
                    <HeroAvatar src={h.avatar} name={h.name} accentClassName={h.color} size="md" />
                    {hi === 0 && (
                      <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-amber-950 shadow ring-1 ring-amber-300/60" title="隊長">
                        <Crown size={9} strokeWidth={2.75} />
                      </span>
                    )}
                    {(h.barrierTurns ?? 0) > 0 ? (
                      <span
                        className="absolute -bottom-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow ring-1 ring-cyan-200/70 px-1 text-[8px] font-black"
                        title="護盾剩餘次數"
                      >
                        {h.barrierTurns}
                      </span>
                    ) : null}
                    {h.status === 'guard' && <Shield size={9} className="absolute -top-1 -right-1 text-blue-400 animate-pulse drop-shadow" />}
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-0.5">
                    <div className="h-full bg-blue-500" style={{ width: `${(h.curHp / h.hp) * 100}%` }} />
                  </div>
                  <div className="w-full bg-slate-800 h-0.5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${h.curMp}%` }} />
                  </div>
                  <div className="mt-0.5 w-full text-center text-[8px] font-black text-slate-500 tabular-nums leading-tight">
                    <div>HP {h.curHp}/{h.hp}</div>
                    <div>MP {h.curMp}/100</div>
                  </div>
                  <span className="text-[9px] font-bold mt-1 w-full text-center text-slate-100 leading-tight line-clamp-2 break-words hyphens-none px-0.5">
                    {h.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(scene === 'victory' || scene === 'defeat') && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-950 text-center">
            <h2 className="text-5xl font-black italic mb-4 tracking-tighter">{scene === 'victory' ? 'VICTORY' : 'DEFEAT'}</h2>
            <button
              type="button"
              onClick={() => setScene('lobby')}
              className="px-10 py-3 bg-blue-600 rounded-full font-bold flex items-center gap-2"
            >
              <RotateCcw size={18} /> 返回主廳
            </button>
          </div>
        )}

        {showExitModal && (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-xs bg-slate-900 border-2 border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-center mb-4 text-red-500">
                <AlertTriangle size={48} />
              </div>
              <h3 className="text-xl font-black italic text-center mb-2">返回首頁？</h3>
              <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
                離開戰鬥將會失去目前所有的進度，
                <br />
                你確定要返回首頁嗎？
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScene('lobby');
                    setShowExitModal(false);
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-sm transition-colors"
                >
                  確認返回首頁
                </button>
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm text-slate-300 transition-colors"
                >
                  繼續戰鬥
                </button>
              </div>
            </div>
          </div>
        )}

        {skillInfo && (
          <div className="absolute inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-900 border-2 border-white/10 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Skill Info</p>
                  <h3 className="text-lg font-black italic text-white truncate">{skillInfo.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSkillInfo(null)}
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center shrink-0"
                  aria-label="關閉"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[9px] font-black text-slate-400">消耗</p>
                  <p className="text-sm font-bold text-white tabular-nums">MP {skillInfo.mpCost}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[9px] font-black text-slate-400">效果</p>
                  <p className="text-[11px] font-bold text-slate-200 leading-snug">{describeSkillEffect(skillInfo)}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSkillInfo(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm"
                >
                  知道了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {scene !== 'battle' && (
        <div className="h-16 bg-slate-950 border-t border-white/10 flex items-center justify-around px-4 shrink-0 z-50">
          <NavBtn
            icon={<Home />}
            label="主頁"
            active={scene === 'lobby'}
            onClick={() => setScene('lobby')}
          />
          <NavBtn
            icon={<Sword />}
            label="冒險"
            active={scene === 'battle'}
            onClick={() => {
              if (scene === 'lobby' || scene === 'party') startBattle();
            }}
          />
          <NavBtn icon={<Users />} label="隊伍" active={scene === 'party'} onClick={() => setScene('party')} />
          <NavBtn icon={<MessageSquare />} label="劇情" />
          <NavBtn icon={<Shield />} label="召喚" />
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes action-in { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: action-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
