import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sword,
  Shield,
  RotateCcw,
  Play,
  Store,
  Hammer,
  Dumbbell,
  Utensils,
  Heart,
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
  Coins,
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
  Crown,
  Calendar,
  Trophy,
  ListTodo,
  Sprout,
} from 'lucide-react';
import { HEROES_BASE, MONSTERS_BASE, STAGES, CHAPTERS } from './data/units.js';
import { mapHeroId } from './data/heroIdMap.js';
import { LOBBY_GREETINGS, LOBBY_DEFAULT_GREETINGS } from './data/lobbyGreetings.js';
import { LOBBY_BACKGROUNDS, getLobbyBackgroundById } from './data/lobbyBackgrounds.js';
import { loadLobbyBgId, saveLobbyBgId, clearLobbyBgStorage } from './lib/lobbyBgStorage.js';
import { getInitialLobbyHeroId, saveLobbyHeroId, clearLobbyHeroStorage } from './lib/lobbyHeroStorage.js';
import { getSkillsForHero } from './data/heroSkills.js';
import { getMonsterSkillSet, monsterTemplateId, isLavaCoreTemplateId, isLavaGiantTemplateId } from './data/monsterSkills.js';
import { loadPartyIds, savePartyIds, clearPartyStorage, MIN_PARTY, MAX_PARTY } from './lib/partyStorage.js';
import {
  loadHeroXpMap,
  awardPartyXp,
  applyLevelLinearStatsToHero,
  defaultProgress,
  sumMonstersXpReward,
  xpRequiredForNextLevel,
  saveHeroXpMap,
  applyManualLevelUps,
  clearHeroXpStorage,
} from './lib/heroXpStorage.js';
import { loadGold, saveGold, clearGoldStorage, sumMonstersGoldReward } from './lib/goldStorage.js';
import {
  loadStarCrystalBalance,
  saveStarCrystalBalance,
  clearStarCrystalStorage,
  migrateStarCrystalFirstClearIfNeeded,
  tryGrantStarCrystalFirstClear,
  grantStarCrystalExpStageClear,
  grantStarCrystalGoldStageClear,
} from './lib/starCrystalStorage.js';
import {
  STAR_WISH_PULL_COST,
  STAR_WISH_CHAR_RATE,
  STAR_WISH_HERO_IDS,
  STAR_WISH_HERO_ORDER,
  STAR_WISH_JUNK_TABLE,
  STAR_WISH_JUNK_WEIGHT_SUM,
  getStarWishDirectPrice,
  rollStarWishJunkReward,
} from './data/starWish.js';
import { loadStarWishState, saveStarWishState, clearStarWishStorage } from './lib/starWishStorage.js';
import { consumeExpStageRun, getExpStageRunsLeft, refillExpStageRuns, clearExpStageEntryStorage, EXP_STAGE_DAILY_LIMIT } from './lib/expStageEntryStorage.js';
import { consumeGoldStageRun, getGoldStageRunsLeft, clearGoldStageEntryStorage, GOLD_STAGE_DAILY_LIMIT } from './lib/goldStageEntryStorage.js';
import { loadMusicSettings, saveMusicSettings, clearMusicStorage } from './lib/musicStorage.js';
import { BGM } from './lib/bgm.js';
import {
  loadDailyQuestsState,
  saveDailyQuestsState,
  DAILY_QUEST_DEFS,
  DAILY_QUEST_IDS,
  clearDailyQuestsStorage,
} from './lib/dailyQuestsStorage.js';
import {
  loadAllHeroesUnlocked,
  saveAllHeroesUnlocked,
  loadUnlockedHeroIds,
  saveUnlockedHeroIds,
  clearHeroUnlockStorage,
} from './lib/heroUnlockStorage.js';
import { loadCompletedStageIds, saveCompletedStageIds, clearStageProgressStorage } from './lib/stageProgressStorage.js';
import { loadBossLootClaims, saveBossLootClaims, clearBossLootStorage } from './lib/bossLootStorage.js';
import { loadTalentMap, saveTalentMap, clearTalentStorage } from './lib/talentStorage.js';
import { applyEquipmentToHero, getEquipSummary, getEquipStatBonus, clearHeroEquipStorage } from './lib/equipmentStorage.js';
import { migrateEquipToInstancesIfNeeded, loadHeroEquipMapV2, saveHeroEquipMapV2 } from './lib/equipInstanceStorage.js';
import { loadSkillMasteryMap, saveSkillMasteryMap, incSkillUses, setSkillMasteryBranch, clearSkillMasteryStorage } from './lib/skillMasteryStorage.js';
import { getMasteryRank, MASTERY_USES_PER_RANK, getSkillMpDiscountFromMastery, getSkillPowerMulFromMastery } from './game/skillMastery.js';
import { loadBondMap, saveBondMap, addBondPoints, getBondPoints, getBondLevel } from './lib/bondStorage.js';
import { rollAffixesForEquip, sumAffixStats } from './lib/equipAffixes.js';
import { getForgeLevelFromInventory } from './lib/baseProgress.js';
import { EQUIP_SLOTS, listEquipBySlot, getEquipItem, EQUIPMENT_CATALOG, getEquipSellPrice } from './data/equipment.js';
import { ITEM_CATALOG, getItem, getItemSellPrice, getItemMaxStack, canUseInBattle } from './data/items.js';
import { isBackpackIngredientId, isBackpackForgeId } from './data/backpackCategories.js';
import {
  loadEquipInventory,
  saveEquipInventory,
  clearEquipInventory,
  loadItemInventory,
  saveItemInventory,
  clearItemInventory,
  getInvCount,
  getEquipInvCount,
  incInv,
  incEquipInv,
} from './lib/inventoryStorage.js';
import { loadGardenPlots, saveGardenPlots, clearGardenPlotsStorage } from './lib/gardenPlotsStorage.js';
import { loadFishCodex, saveFishCodex, clearFishCodexStorage } from './lib/fishCodexStorage.js';
import { clearMiningDailyStorage } from './lib/miningDailyStorage.js';
import { clearHuntingDailyStorage } from './lib/huntingDailyStorage.js';
import { CAMP_RECIPES, getCampRecipe } from './data/campRecipes.js';
import { loadCampRecipeOwnedIds, saveCampRecipeOwnedIds, clearCampRecipeStorage } from './lib/campRecipeStorage.js';
import GardenPanel from './components/GardenPanel.jsx';
import {
  buildBattleHeroesWithAura,
  getCaptainPassiveDef,
  getCaptainBattleXpMultiplier,
  getCaptainBattleGoldMultiplier,
} from './game/captainAura.js';
import {
  isJackItemInvertActive,
  jackInvertedItemNeedsEnemyTarget,
  jackInvertedItemIsAllyAllHeal,
  getJackInvertedSingleDamage,
  getJackInvertedMpDrain,
  getJackInvertedDustDamagePerEnemy,
  getJackInvertedPanaceaDamage,
} from './game/jackInvertedItems.js';
import { SFX, unlockAudio, loadSfxSettings, setSfxEnabled, setSfxVolume } from './lib/sfx.js';
import {
  getBuffAllDef,
  getBuffSingleDef,
  getDebuffDef,
  getBarrierDef,
  getSkillTargeting,
  resolveSkillDamage,
  resolveSkillHeal,
  getEffectiveSpd,
  rescaleAvForSpdChange,
  resolveRegenHealPerTick,
  getRegenAllDef,
  getSlowAllDef,
} from './game/skills.js';
import { getMainQuestPointer } from './game/mainQuest.js';
import { getWeaknessRevealLabel } from './game/weaknessReveal.js';
import { TALENT_ROWS, TALENT_ROW4_OPTIONS } from './data/talents.js';
import { COMBO_SKILL_DEFS, validateComboDefs } from './data/comboSkills.js';
import {
  applyTalentStatsToUnit,
  getBuffTurnsBonusFromTalents,
  getBarrierBreakMpFromTalents,
  getBarrierTurnsPlusFromTalents,
  getBattleStartTauntTurnsFromTalents,
  getBattleStartDazzleAllTurnsFromTalents,
  getAllyMpOnBuffFromSelfFromTalents,
  getDamageMulFromTalents,
  getOutgoingHealMulFromTalents,
  getIncomingHealMulFromTalents,
  getChainHealOnHealFromTalents,
  getMpOnAllyDirectDamageFromTalents,
  getSkillDamageMulVsStunImmuneFromTalents,
  getSkillAilmentChanceAddFromTalents,
  getHealTargetMpFlatFromTalents,
  getMpOnHitByAilmentedEnemyFromTalents,
  hasDoubleDotFromSelfTalent,
  getOnKillSpdBuffFromTalents,
  getExtraTurnStartMpFromTalents,
  getOnKillMpFromTalents,
  getCritLifestealMulFromTalents,
  getOnKillAtkBuffFromTalents,
  getSkillMultiHitOverrideFromTalents,
  getSplashMulOverrideFromTalents,
  getSkillOnHitAilmentFromTalents,
  getSkillOnHitMdefDownAllFromTalents,
  canSkillCritFromTalents,
  getHeroRow3Def,
  getTalentPick,
  canCritStealRandomBuffFromEnemyFromTalents,
} from './game/talents.js';
import {
  loadTalentRow4Progress,
  saveTalentRow4Progress,
  TALENT_R4_LEVEL_MAX,
  clearTalentRow4ProgressStorage,
} from './lib/talentRow4ProgressStorage.js';
import {
  canPhysicalCrit,
  getPhysicalCritChance,
  getPhysicalCritDamageMultiplier,
  CRIT_RATE_MID_ADD,
  CRIT_DMG_SMALL_MUL,
} from './game/crit.js';
import {
  applyTurnStartDots,
  applyBurnOnTarget,
  applyPoisonOnTarget,
  applyDarknessOnTarget,
  applyDazzleOnTarget,
  applyStunOnTarget,
  STUN_IMMUNE_TURNS_AFTER,
  defaultAilmentFields,
  getDarknessDamageMul,
  getIncomingHealMulFromPoison,
  tickAilmentDurationsAll,
} from './game/ailments.js';
import CmdBtn from './components/CmdBtn.jsx';
import NavBtn from './components/NavBtn.jsx';
import HeroAvatar from './components/HeroAvatar.jsx';
import LobbyHeroStage from './components/LobbyHeroStage.jsx';
import { StoryMechanismQte } from './components/StoryMechanismQte.jsx';

function getStarWishJunkRowLabel(row) {
  if (row.kind === 'gold') return `金幣 +${row.amount}`;
  if (row.kind === 'r4crystal') return `天賦碎晶 +${row.amount}`;
  if (row.kind === 'item' && row.itemId) {
    const it = getItem(row.itemId);
    return it?.name ? `${it.name} ×${row.amount}` : String(row.itemId);
  }
  return '—';
}

export default function App() {
  const MP_MAX = 100;
  // MP 回饋（以 5 的倍數管理）：沒防禦被命中 +10 / 防禦被命中 +5（每位角色每回合最多一次）
  const HIT_MP_GAIN_NO_GUARD = 10;
  const HIT_MP_GAIN_GUARD = 5;
  // 防禦但整段期間沒被打：在下次輪到自己行動時補 +5（與被打回 MP 互斥）
  const GUARD_NO_HIT_MP_GAIN = 5;
  const MONSTER_ATK_MP_GAIN = 10;
  const MONSTER_HIT_MP_GAIN = 5;

  // 碎晶列（通用強化）— 數值隨等級成長
  const R4_SKILL_MP_DOWN_BY_LEVEL = [2, 2, 3, 3, 4];
  const R4_SKILL_DMG_MUL_BY_LEVEL = [1.1, 1.12, 1.14, 1.16, 1.18];
  const R4_CRIT_RATE_ADD_BY_LEVEL = [0.07, 0.08, 0.09, 0.1, 0.11];
  const [scene, setScene] = useState('lobby');
  const [heroes, setHeroes] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [activeUnit, setActiveUnit] = useState(null);
  const [turnQueue, setTurnQueue] = useState([]);
  const [logs, setLogs] = useState(['準備冒險...']);

  const [targetMode, setTargetMode] = useState(null);
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const [pickedSkill, setPickedSkill] = useState(null);
  const [itemMenuOpen, setItemMenuOpen] = useState(false);
  const [pickedItemId, setPickedItemId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [turnSeq, setTurnSeq] = useState(0);
  const [statusFocus, setStatusFocus] = useState(null); // { side: 'hero' | 'monster', id: string }
  const [skillInfo, setSkillInfo] = useState(null); // skill object for modal
  const [passiveInfo, setPassiveInfo] = useState(null); // { name, description, mechanics } from units.passive
  const [partyIds, setPartyIds] = useState(() => loadPartyIds());
  const [partyNotice, setPartyNotice] = useState('');
  const [victoryXpReport, setVictoryXpReport] = useState(null);
  const [victoryGoldGain, setVictoryGoldGain] = useState(0);
  const [victoryStarCrystalLine, setVictoryStarCrystalLine] = useState('');
  const [starCrystals, setStarCrystals] = useState(() => loadStarCrystalBalance());
  const [starWishDiscountPulls, setStarWishDiscountPulls] = useState(() => loadStarWishState().discountPulls);
  const [starWishLastMsg, setStarWishLastMsg] = useState('');
  /** 星曉祈願結果圖像用：'hero' | 'gold' | null */
  const [starWishRewardPreview, setStarWishRewardPreview] = useState(null);
  const [starWishOddsOpen, setStarWishOddsOpen] = useState(false);
  /** 星曉祈願介面分頁：星曉限定 | 佔位 */
  const [recruitWishTab, setRecruitWishTab] = useState('limited');
  const [talentR4Prog, setTalentR4Prog] = useState(() => loadTalentRow4Progress());
  const [victoryLootLine, setVictoryLootLine] = useState('');
  const [victoryXpFootnote, setVictoryXpFootnote] = useState('');
  const [victoryGoldFootnote, setVictoryGoldFootnote] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('stage-0');
  const [selectedChapterId, setSelectedChapterId] = useState('ch-0');
  const [expRunsLeft, setExpRunsLeft] = useState(() => getExpStageRunsLeft());
  const [goldRunsLeft, setGoldRunsLeft] = useState(() => getGoldStageRunsLeft());
  const [stageNotice, setStageNotice] = useState('');
  const [storyStageId, setStoryStageId] = useState(null);
  const [storyLineIdx, setStoryLineIdx] = useState(0);
  const [useItemTargetPick, setUseItemTargetPick] = useState(null); // { itemId, maxLevel, amount }
  const [gold, setGold] = useState(() => loadGold());
  const EQUIP_INSTANCE_CAP = 50;
  const migrated0 = migrateEquipToInstancesIfNeeded();
  const [equipInstances, setEquipInstances] = useState(() => migrated0.instances ?? []);
  const [heroEquipV2, setHeroEquipV2] = useState(() => migrated0.heroEquipV2 ?? loadHeroEquipMapV2());
  const [facilityNpcTalkIdx, setFacilityNpcTalkIdx] = useState({ forge: 0, training: 0, camp: 0, garden: 0 });
  const [backpackTab, setBackpackTab] = useState('items'); // items | ingredients | forge | equip
  const [skillMasteryMap, setSkillMasteryMap] = useState(() => loadSkillMasteryMap());
  const [bondMap, setBondMap] = useState(() => loadBondMap());
  // legacy (no longer used after switching to instances)
  const [equipAffixMap, setEquipAffixMap] = useState(() => ({}));
  const [talentMap, setTalentMap] = useState(() => loadTalentMap());
  const [equipModalHeroId, setEquipModalHeroId] = useState(null);
  const [shopMode, setShopMode] = useState('buy-item'); // buy-equip | sell-equip | buy-item | sell-item
  const [shopDialog, setShopDialog] = useState('「歡迎光臨。想買點什麼，或是把不要的東西賣掉？」');
  // legacy equipInv (count-based) kept for backward compatibility, but not used after migration
  const [equipInv, setEquipInv] = useState(() => loadEquipInventory());
  const [itemInv, setItemInv] = useState(() => loadItemInventory());
  const [gardenPlots, setGardenPlots] = useState(() => loadGardenPlots());
  const [fishCodex, setFishCodex] = useState(() => loadFishCodex());
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sfxEnabled, setSfxEnabledState] = useState(() => loadSfxSettings().enabled);
  const [sfxVolume, setSfxVolumeState] = useState(() => loadSfxSettings().volume);
  const [musicEnabled, setMusicEnabledState] = useState(() => loadMusicSettings().enabled);
  const [musicVolume, setMusicVolumeState] = useState(() => loadMusicSettings().volume);
  const [dailyQ, setDailyQ] = useState(() => loadDailyQuestsState());
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [allHeroesUnlocked, setAllHeroesUnlocked] = useState(() => loadAllHeroesUnlocked());
  const [unlockedHeroIds, setUnlockedHeroIds] = useState(() => loadUnlockedHeroIds());
  const [completedStageIds, setCompletedStageIds] = useState(() => loadCompletedStageIds());
  const [resetAccountModalOpen, setResetAccountModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetConfirmError, setResetConfirmError] = useState('');
  const [heroInfo, setHeroInfo] = useState(null); // { heroId }
  const [lobbyHeroId, setLobbyHeroId] = useState(() => getInitialLobbyHeroId());
  const [lobbyPanelModal, setLobbyPanelModal] = useState(null); // 'daily' | 'achievements' | 'recruit' | 'forge' | 'training' | 'camp'(餐酒館) | 'garden' | 'lobbyBg' | null
  const [lobbyNotice, setLobbyNotice] = useState('');
  const [lobbyBubble, setLobbyBubble] = useState({ text: '', tick: 0 });
  const [lobbyBgId, setLobbyBgId] = useState(() => loadLobbyBgId());
  const [lobbyBgImgVisible, setLobbyBgImgVisible] = useState(false);
  const chapterIdByStageId = useMemo(() => {
    const map = {};
    for (const ch of CHAPTERS ?? []) {
      for (const sid of ch?.stages ?? []) map[sid] = ch.id;
    }
    return map;
  }, []);

  const chapterBgIdMap = useMemo(
    () => ({
      'ch-0': 'ximu_cun',
      'ch-1': 'cuiying_linhai',
      'ch-2': 'shuangzhu_binghe',
      'ch-3': 'xingjie_gang',
      'ch-4': 'yanji_volcano',
      'ch-5': 'xingzhui_yiji',
      // ch-6 黯潮深淵：目前缺圖，先 fallback 使用者選的背景
      // ch-7 終幕試煉：沿用使用者選的背景（看你之後要不要做專屬圖）
    }),
    [],
  );

  const sceneBgId = useMemo(() => {
    if (scene === 'lobby') return lobbyBgId;
    if (scene === 'story') {
      const ch = storyStageId ? chapterIdByStageId?.[storyStageId] : null;
      return (ch && chapterBgIdMap?.[ch]) || lobbyBgId;
    }
    if (scene === 'battle') {
      const ch = selectedStageId ? chapterIdByStageId?.[selectedStageId] : null;
      return (ch && chapterBgIdMap?.[ch]) || lobbyBgId;
    }
    return lobbyBgId;
  }, [scene, lobbyBgId, selectedStageId, storyStageId, chapterIdByStageId, chapterBgIdMap]);

  const lobbyBgDef = useMemo(() => getLobbyBackgroundById(sceneBgId), [sceneBgId]);

  const [forgePick, setForgePick] = useState({ heroId: null, slotKey: 'weapon', forcedStat: null });
  const [trainingPick, setTrainingPick] = useState({ heroId: null, skillId: null });
  const [campDishId, setCampDishId] = useState(null);
  const [campBuff, setCampBuff] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(window.localStorage.getItem('aethelgard-camp-buff-v1') || 'null');
    } catch {
      return null;
    }
  });
  const [campTab, setCampTab] = useState('menu'); // menu | recipes | custom
  const [campOwnedRecipeIds, setCampOwnedRecipeIds] = useState(() => loadCampRecipeOwnedIds());
  const longPressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);
  const passiveLongPressTimerRef = useRef(null);
  const passiveLongPressFiredRef = useRef(false);
  const heroInfoLongPressTimerRef = useRef(null);
  const heroInfoLongPressFiredRef = useRef(false);

  useEffect(() => {
    savePartyIds(partyIds);
  }, [partyIds]);

  useEffect(() => {
    saveAllHeroesUnlocked(allHeroesUnlocked);
  }, [allHeroesUnlocked]);

  useEffect(() => {
    saveUnlockedHeroIds(unlockedHeroIds);
  }, [unlockedHeroIds]);

  useEffect(() => {
    saveCompletedStageIds(completedStageIds);
  }, [completedStageIds]);

  useEffect(() => {
    const completed = loadCompletedStageIds();
    let claims = loadBossLootClaims();
    let changed = false;
    for (const sid of ['c1-boss-1', 'c2-boss-1', 'c3-boss-1', 'c4-boss-1', 'c5-boss-1']) {
      if (completed.includes(sid) && !claims[sid]) {
        claims = { ...claims, [sid]: true };
        changed = true;
      }
    }
    if (changed) saveBossLootClaims(claims);
  }, []);

  useEffect(() => {
    if (allHeroesUnlocked) return;
    const must = 'Puersz';
    if ((unlockedHeroIds ?? []).length > 0) return;
    if (partyIds.length !== 1 || partyIds[0] !== must) setPartyIds([must]);
  }, [allHeroesUnlocked, unlockedHeroIds, partyIds]);

  const isHeroUnlocked = (heroId) => {
    if (heroId === 'Puersz') return true;
    if (allHeroesUnlocked) return true;
    return (unlockedHeroIds ?? []).includes(heroId);
  };

  const unlockHero = useCallback((heroId) => {
    if (!heroId || heroId === 'Puersz') return;
    setUnlockedHeroIds((prev) => (prev?.includes(heroId) ? prev : [...(prev ?? []), heroId]));
  }, []);

  const remainingWishHeroIds = useMemo(
    () => STAR_WISH_HERO_IDS.filter((id) => !isHeroUnlocked(id)),
    [unlockedHeroIds, allHeroesUnlocked],
  );

  const isStarWishUnlocked = useMemo(() => (completedStageIds ?? []).includes('c5-epilogue'), [completedStageIds]);

  // migrate legacy global r4 → per-hero (for all current heroes)
  useEffect(() => {
    if (!talentR4Prog?.legacyUnlocked) return;
    const lvl = Math.max(1, Math.min(talentR4Prog?.legacyLevel ?? 1, TALENT_R4_LEVEL_MAX));
    const byHero = {};
    for (const h of HEROES_BASE) byHero[h.id] = { unlocked: true, level: lvl };
    setTalentR4Prog({ crystals: talentR4Prog?.crystals ?? 0, byHero });
  }, []);

  // r4 progress share key (skins share unlock/level)
  const getR4ShareKey = (heroId) => {
    if (heroId === 'butiya_halloween') return 'butiya'; // 萬聖節布提婭 → 布提婭
    if (heroId === 'bubu_harvest') return 'xiongji'; // 豐收節布布 → 熊吉
    return heroId;
  };

  // migrate old per-hero progress → shared keys (keep strongest)
  useEffect(() => {
    const by = talentR4Prog?.byHero ?? {};
    const keys = Object.keys(by);
    if (!keys.length) return;
    // if it already uses share keys only, skip
    const needs = keys.some((k) => getR4ShareKey(k) !== k);
    if (!needs) return;
    const merged = {};
    for (const [k, v] of Object.entries(by)) {
      const sk = getR4ShareKey(k);
      const cur = merged[sk];
      const next = v && typeof v === 'object' ? v : { unlocked: false, level: 1 };
      if (!cur) merged[sk] = { unlocked: !!next.unlocked, level: Math.max(1, Math.min(next.level ?? 1, TALENT_R4_LEVEL_MAX)) };
      else {
        merged[sk] = {
          unlocked: cur.unlocked || !!next.unlocked,
          level: Math.max(cur.level ?? 1, next.level ?? 1),
        };
      }
    }
    setTalentR4Prog((s) => ({ crystals: s?.crystals ?? 0, byHero: merged }));
  }, []);

  const getR4HeroProg = (heroId) => {
    const key = getR4ShareKey(heroId);
    const by = talentR4Prog?.byHero ?? {};
    return by?.[key] ?? { unlocked: false, level: 1 };
  };

  const getR4LevelIndexForHero = (heroId) => {
    const p = getR4HeroProg(heroId);
    return Math.max(0, Math.min((p?.level ?? 1) - 1, TALENT_R4_LEVEL_MAX - 1));
  };

  const getR4SelectionForHero = (heroId) => {
    const p = getR4HeroProg(heroId);
    if (!p?.unlocked) return null;
    const pick = getTalentPick(talentMap, heroId);
    return pick?.r4 ?? null;
  };

  const getR4SkillDamageMul = (heroId) => {
    const p = getR4HeroProg(heroId);
    if (!p?.unlocked) return 1;
    if (getR4SelectionForHero(heroId) !== 'r4_skillDmgUp') return 1;
    return R4_SKILL_DMG_MUL_BY_LEVEL[getR4LevelIndexForHero(heroId)] ?? 1;
  };

  const getR4SkillMpDiscount = (heroId) => {
    const p = getR4HeroProg(heroId);
    if (!p?.unlocked) return 0;
    if (getR4SelectionForHero(heroId) !== 'r4_skillMpDown') return 0;
    return R4_SKILL_MP_DOWN_BY_LEVEL[getR4LevelIndexForHero(heroId)] ?? 0;
  };

  const getR4CritRateAdd = (heroId) => {
    const p = getR4HeroProg(heroId);
    if (!p?.unlocked) return 0;
    if (getR4SelectionForHero(heroId) !== 'r4_critRateUp') return 0;
    return R4_CRIT_RATE_ADD_BY_LEVEL[getR4LevelIndexForHero(heroId)] ?? 0;
  };

  const getSkillMpCostForCaster = (skill, caster) => {
    const base = skill?.mpCost ?? 0;
    if (!caster?.isHero) return base;
    const r4 = getR4SkillMpDiscount(caster.id);
    const m = skill?.id ? getSkillMpDiscountFromMastery(skillMasteryMap, caster.id, skill.id) : 0;
    return Math.max(1, base - r4 - m);
  };

  // 合體技：資料表驅動（每位英雄最多 2 夥伴、每對 1 招）
  useEffect(() => {
    const v = validateComboDefs(COMBO_SKILL_DEFS);
    if (!v.ok) {
      // eslint-disable-next-line no-console
      console.warn('[daily] combo defs violate constraints', v);
    }
  }, []);

  const getComboSkillsForHero = (hero) => {
    if (!hero?.isHero) return [];
    if (!(partyIds ?? []).includes(hero.id)) return [];
    const out = [];
    for (const def of COMBO_SKILL_DEFS) {
      if (!def) continue;
      const a = def.a;
      const b = def.b;
      const isA = hero.id === a;
      const isB = hero.id === b;
      if (!isA && !isB) continue;
      const partnerId = isA ? b : a;
      if (!(partyIds ?? []).includes(partnerId)) continue;

      const lv = getBondLevel(getBondPoints(bondMap, hero.id, partnerId));
      if (lv < (def.requiredBondLv ?? 2)) continue;

      // 夥伴需存活（戰鬥中才有 curHp；非戰鬥狀態直接允許顯示）
      const partnerUnit = (heroes ?? []).find((h) => h.id === partnerId);
      if (partnerUnit && (partnerUnit.curHp ?? 0) <= 0) continue;

      const s = def.skill;
      // 允許先登記組合、晚點再補技能：沒技能就不加入戰鬥技能清單
      if (!s?.id) continue;
      out.push({ ...s, combo: { partnerId, bondLevel: lv } });
    }
    return out;
  };

  const getBattleSkillsForHero = (hero) => {
    const base = getSkillsForHero(hero) ?? [];
    const combo = getComboSkillsForHero(hero);
    return [...base, ...combo];
  };

  const stealRandomBuffFromMonsterToHero = ({ heroId, monsterId, monstersList }) => {
    if (!heroId || !monsterId) return { ok: false, heroesNext: null, monstersNext: null, stolen: null };
    const m = (monstersList ?? monsters).find((x) => x.id === monsterId);
    if (!m || m.curHp <= 0) return { ok: false, heroesNext: null, monstersNext: null, stolen: null };

    const pool = [];
    if ((m.atkBuffTurns ?? 0) > 0) pool.push('atk');
    if ((m.defBuffTurns ?? 0) > 0) pool.push('def');
    if ((m.matkBuffTurns ?? 0) > 0) pool.push('matk');
    if ((m.mdefBuffTurns ?? 0) > 0) pool.push('mdef');
    if ((m.spdBuffTurns ?? 0) > 0) pool.push('spd');
    if ((m.critRateBuffTurns ?? 0) > 0) pool.push('critRate');
    if ((m.critDmgBuffTurns ?? 0) > 0) pool.push('critDmg');
    if (!pool.length) return { ok: false, heroesNext: null, monstersNext: null, stolen: null };

    const kind = pool[Math.floor(Math.random() * pool.length)];
    const label = {
      atk: '攻擊',
      def: '防禦',
      matk: '魔力',
      mdef: '魔抗',
      spd: '速度',
      critRate: '暴擊率',
      critDmg: '暴擊傷害',
    }[kind];

    const monstersNext = (monstersList ?? monsters).map((x) => {
      if (x.id !== monsterId) return x;
      if (kind === 'atk') return { ...x, atkBuffTurns: 0, atkBuffMul: 1 };
      if (kind === 'def') return { ...x, defBuffTurns: 0, defBuffMul: 1 };
      if (kind === 'matk') return { ...x, matkBuffTurns: 0, matkBuffMul: 1 };
      if (kind === 'mdef') return { ...x, mdefBuffTurns: 0, mdefBuffMul: 1 };
      if (kind === 'spd') return { ...x, spdBuffTurns: 0, spdBuffMul: 1 };
      if (kind === 'critRate') return { ...x, critRateBuffTurns: 0, critRateBuffAdd: 0 };
      return { ...x, critDmgBuffTurns: 0, critDmgBuffMul: 1 };
    });

    const heroesNext = heroes.map((h) => {
      if (h.id !== heroId) return h;
      const src = m;
      if (kind === 'atk') return { ...h, atkBuffTurns: src.atkBuffTurns ?? 0, atkBuffMul: src.atkBuffMul ?? 1 };
      if (kind === 'def') return { ...h, defBuffTurns: src.defBuffTurns ?? 0, defBuffMul: src.defBuffMul ?? 1 };
      if (kind === 'matk') return { ...h, matkBuffTurns: src.matkBuffTurns ?? 0, matkBuffMul: src.matkBuffMul ?? 1 };
      if (kind === 'mdef') return { ...h, mdefBuffTurns: src.mdefBuffTurns ?? 0, mdefBuffMul: src.mdefBuffMul ?? 1 };
      if (kind === 'spd') {
        const oldEff = getEffectiveSpd(h);
        const next = { ...h, spdBuffTurns: src.spdBuffTurns ?? 0, spdBuffMul: src.spdBuffMul ?? 1 };
        const newEff = getEffectiveSpd(next);
        return { ...next, av: rescaleAvForSpdChange(h.av, oldEff, newEff) };
      }
      if (kind === 'critRate') return { ...h, critRateBuffTurns: src.critRateBuffTurns ?? 0, critRateBuffAdd: src.critRateBuffAdd ?? 0 };
      return { ...h, critDmgBuffTurns: src.critDmgBuffTurns ?? 0, critDmgBuffMul: src.critDmgBuffMul ?? 1 };
    });

    return { ok: true, heroesNext, monstersNext, stolen: label ?? '增益' };
  };

  const starWishDirectPrice = useMemo(() => getStarWishDirectPrice(starWishDiscountPulls), [starWishDiscountPulls]);

  const runStarWishPull = useCallback(() => {
    setStarWishLastMsg('');
    setStarWishRewardPreview(null);
    if (!isStarWishUnlocked) {
      setStarWishLastMsg('通關第五章尾聲後開放「星曉祈願」。');
      return;
    }
    if (starCrystals < STAR_WISH_PULL_COST) {
      setStarWishLastMsg(`星曉晶石不足（需要 ${STAR_WISH_PULL_COST}）。`);
      return;
    }
    setStarCrystals((c) => c - STAR_WISH_PULL_COST);
    const nWishLeft = remainingWishHeroIds.length;
    const hitChar = nWishLeft > 0 && Math.random() < STAR_WISH_CHAR_RATE;
    if (hitChar) {
      const pick = remainingWishHeroIds[Math.floor(Math.random() * remainingWishHeroIds.length)];
      unlockHero(pick);
      setStarWishDiscountPulls(0);
      unlockAudio();
      SFX.skill();
      const nm = HEROES_BASE.find((h) => h.id === pick)?.name ?? pick;
      setStarWishRewardPreview({ type: 'hero', heroId: pick });
      setStarWishLastMsg(`星曉祈願邂逅：獲得「${nm}」！直購價格已重置。`);
      return;
    }
    const junk = rollStarWishJunkReward();
    if (nWishLeft > 0) setStarWishDiscountPulls((p) => p + 1);
    unlockAudio();
    SFX.uiClick();
    const allWishOwned = nWishLeft === 0;
    const pullNote = allWishOwned ? '' : '（未邂逅到限定角，直購價格已降低）';
    if (junk.kind === 'r4crystal') {
      const g = Math.max(0, Math.floor(junk.amount ?? 0));
      if (g > 0) setTalentR4Prog((s) => ({ ...(s ?? {}), crystals: Math.max(0, (s?.crystals ?? 0) + g), byHero: s?.byHero ?? {} }));
      setStarWishRewardPreview({ type: 'r4crystal', amount: g });
      setStarWishLastMsg(
        allWishOwned
          ? `獲得天賦碎晶 +${g}。（可用於解鎖/升級「碎晶列」）`
          : `獲得天賦碎晶 +${g}。（可用於解鎖/升級「碎晶列」；未邂逅到限定角，直購價格已降低）`
      );
    } else if (junk.kind === 'item' && junk.itemId) {
      const n = Math.max(1, Math.floor(junk.amount ?? 1));
      const itemId = junk.itemId;
      setItemInv((inv) => incInv(inv, itemId, n));
      const it = getItem(itemId);
      setStarWishRewardPreview({ type: 'item', itemId, amount: n });
      setStarWishLastMsg(
        allWishOwned
          ? `獲得「${it?.name ?? itemId}」×${n}。`
          : `獲得「${it?.name ?? itemId}」×${n}。${pullNote}`
      );
    } else {
      const g = Math.max(0, Math.floor(junk.amount ?? 0));
      if (g > 0) setGold((x) => x + g);
      setStarWishRewardPreview({ type: 'gold', amount: g });
      setStarWishLastMsg(allWishOwned ? `獲得金幣 +${g}。` : `獲得金幣 +${g}。${pullNote}`);
    }
  }, [remainingWishHeroIds, starCrystals, unlockHero, isStarWishUnlocked]);

  const directPurchaseWishHero = useCallback(
    (heroId) => {
      setStarWishLastMsg('');
      setStarWishRewardPreview(null);
      if (!isStarWishUnlocked) {
        setStarWishLastMsg('通關第五章尾聲後開放「星曉祈願」。');
        return;
      }
      if (!STAR_WISH_HERO_IDS.includes(heroId) || isHeroUnlocked(heroId)) {
        setStarWishLastMsg('無法直購此角色。');
        return;
      }
      const price = getStarWishDirectPrice(starWishDiscountPulls);
      if (starCrystals < price) {
        setStarWishLastMsg(`星曉晶石不足（需要 ${price}）。`);
        return;
      }
      setStarCrystals((c) => c - price);
      unlockHero(heroId);
      setStarWishDiscountPulls(0);
      unlockAudio();
      SFX.levelUp();
      const nm = HEROES_BASE.find((h) => h.id === heroId)?.name ?? heroId;
      setStarWishRewardPreview({ type: 'hero', heroId });
      setStarWishLastMsg(`直購成功：「${nm}」加入！價格已重置。`);
    },
    [starWishDiscountPulls, starCrystals, allHeroesUnlocked, unlockedHeroIds, unlockHero, isStarWishUnlocked],
  );

  const isStageCompleted = (stageId) => (completedStageIds ?? []).includes(stageId);

  const completeStage = (stageId) => {
    if (!stageId) return;
    const st = STAGES.find((s) => s.id === stageId);
    const gained = tryGrantStarCrystalFirstClear(stageId, st?.kind);
    if (gained > 0) setStarCrystals(loadStarCrystalBalance());
    setCompletedStageIds((prev) => (prev?.includes(stageId) ? prev : [...(prev ?? []), stageId]));
  };

  const isChapterUnlocked = (chapterId) => {
    if (chapterId === 'ch-0') return true;
    if (allHeroesUnlocked) return true;
    if (chapterId === 'ch-1') return isStageCompleted('stage-0');
    if (chapterId === 'ch-2') return isStageCompleted('c1-epilogue');
    if (chapterId === 'ch-3') return isStageCompleted('c2-epilogue');
    if (chapterId === 'ch-4') return isStageCompleted('c3-epilogue');
    if (chapterId === 'ch-5') return isStageCompleted('c4-epilogue');
    if (chapterId === 'ch-6') return isStageCompleted('c5-epilogue');
    if (chapterId === 'ch-7') return isStageCompleted('c6-boss-ex-thief');
    return isStageCompleted('stage-0');
  };

  const isExpStagesUnlocked = () => allHeroesUnlocked || isStageCompleted('stage-0');

  const isStageUnlocked = (stageId) => {
    if (!stageId) return false;
    if (allHeroesUnlocked) return true;
    if (stageId === 'stage-0') return true;
    if (stageId.startsWith('xp-') || stageId.startsWith('gl-')) return isExpStagesUnlocked();
    if (stageId === 'c1-story-1') return isChapterUnlocked('ch-1');
    if (stageId === 'c1-battle-1') return isStageCompleted('c1-story-1');
    if (stageId === 'c1-battle-2') return isStageCompleted('c1-battle-1');
    if (stageId === 'c1-story-2') return isStageCompleted('c1-battle-2');
    if (stageId === 'c1-battle-3') return isStageCompleted('c1-story-2');
    if (stageId === 'c1-battle-4') return isStageCompleted('c1-battle-3');
    if (stageId === 'c1-story-3') return isStageCompleted('c1-battle-4');
    if (stageId === 'c1-boss-1') return isStageCompleted('c1-story-3');
    if (stageId === 'c1-epilogue') return isStageCompleted('c1-boss-1');
    if (stageId === 'c2-battle-1') return isChapterUnlocked('ch-2');
    if (stageId === 'c2-battle-2') return isStageCompleted('c2-battle-1');
    if (stageId === 'c2-story-1') return isStageCompleted('c2-battle-2');
    if (stageId === 'c2-battle-3') return isStageCompleted('c2-story-1');
    if (stageId === 'c2-battle-4') return isStageCompleted('c2-battle-3');
    if (stageId === 'c2-story-2') return isStageCompleted('c2-battle-4');
    if (stageId === 'c2-boss-1') return isStageCompleted('c2-story-2');
    if (stageId === 'c2-epilogue') return isStageCompleted('c2-boss-1');
    if (stageId === 'c3-story-1') return isChapterUnlocked('ch-3');
    if (stageId === 'c3-battle-1') return isStageCompleted('c3-story-1');
    if (stageId === 'c3-battle-2') return isStageCompleted('c3-battle-1');
    if (stageId === 'c3-story-2') return isStageCompleted('c3-battle-2');
    if (stageId === 'c3-battle-3') return isStageCompleted('c3-story-2');
    if (stageId === 'c3-story-3') return isStageCompleted('c3-battle-3');
    if (stageId === 'c3-boss-1') return isStageCompleted('c3-story-3');
    if (stageId === 'c3-epilogue') return isStageCompleted('c3-boss-1');
    if (stageId === 'c4-battle-1') return isChapterUnlocked('ch-4');
    if (stageId === 'c4-battle-2') return isStageCompleted('c4-battle-1');
    if (stageId === 'c4-story-1') return isStageCompleted('c4-battle-2');
    if (stageId === 'c4-battle-3') return isStageCompleted('c4-story-1');
    if (stageId === 'c4-battle-4') return isStageCompleted('c4-battle-3');
    if (stageId === 'c4-story-2') return isStageCompleted('c4-battle-4');
    if (stageId === 'c4-boss-1') return isStageCompleted('c4-story-2');
    if (stageId === 'c4-epilogue') return isStageCompleted('c4-boss-1');
    if (stageId === 'c5-battle-1') return isChapterUnlocked('ch-5');
    if (stageId === 'c5-battle-2') return isStageCompleted('c5-battle-1');
    if (stageId === 'c5-story-1') return isStageCompleted('c5-battle-2');
    if (stageId === 'c5-battle-3') return isStageCompleted('c5-story-1');
    if (stageId === 'c5-battle-4') return isStageCompleted('c5-battle-3');
    if (stageId === 'c5-story-2') return isStageCompleted('c5-battle-4');
    if (stageId === 'c5-boss-1') return isStageCompleted('c5-story-2');
    if (stageId === 'c5-epilogue') return isStageCompleted('c5-boss-1');
    if (stageId === 'c6-story-1') return isChapterUnlocked('ch-6');
    if (stageId === 'c6-battle-1') return isStageCompleted('c6-story-1');
    if (stageId === 'c6-battle-2') return isStageCompleted('c6-battle-1');
    if (stageId === 'c6-boss-ex-elder') return isStageCompleted('c6-battle-2');
    if (stageId === 'c6-boss-ex-dragon') return isStageCompleted('c6-boss-ex-elder');
    if (stageId === 'c6-boss-ex-thief') return isStageCompleted('c6-boss-ex-dragon');
    if (stageId === 'c7-boss-ex-lava') return isChapterUnlocked('ch-7');
    if (stageId === 'c7-boss-ex-mummy') return isStageCompleted('c7-boss-ex-lava');
    return false;
  };

  const getShopPrismCount = () => getInvCount(itemInv, 'it_purify_prism');

  /** 商店可購道具：0=僅治療藥水；1=+魔力藥水、下級修煉手冊；2=+下級修煉手冊+、萬靈藥；3=+中級手冊、治癒粉塵、中級治療藥水；4=+中級魔力藥水、中級修煉手冊+（通用餐卷／鍛造幣／訓練指導書不販售） */
  const canBuyItemInShop = (itemId) => {
    const n = getShopPrismCount();
    if (
      itemId === 'it_tavern_voucher' ||
      itemId === 'it_forge_token' ||
      itemId === 'it_forge_token_force' ||
      itemId === 'it_training_guide'
    )
      return false;
    if (itemId === 'it_potion') return true;
    if (itemId === 'it_ether') return n >= 1;
    if (itemId === 'it_training_book_low') return n >= 1;
    if (itemId === 'it_training_book_low_plus') return n >= 2;
    if (itemId === 'it_panacea') return n >= 2;
    if (itemId === 'it_training_book_mid') return n >= 3;
    if (itemId === 'it_healing_dust') return n >= 3;
    if (itemId === 'it_potion_mid') return n >= 3;
    if (itemId === 'it_ether_mid') return n >= 4;
    if (itemId === 'it_training_book_mid_plus') return n >= 4;
    return false;
  };

  const mainQuestPtr = useMemo(
    () => getMainQuestPointer(completedStageIds, isStageUnlocked),
    [completedStageIds, allHeroesUnlocked, unlockedHeroIds],
  );

  const lobbyUnlockedHeroIds = useMemo(
    () => HEROES_BASE.filter((h) => isHeroUnlocked(h.id)).map((h) => h.id),
    [allHeroesUnlocked, unlockedHeroIds],
  );

  useEffect(() => {
    if (!isHeroUnlocked(lobbyHeroId)) {
      const first = HEROES_BASE.find((h) => isHeroUnlocked(h.id))?.id ?? 'Puersz';
      setLobbyHeroId(first);
    }
  }, [allHeroesUnlocked, unlockedHeroIds, lobbyHeroId]);

  useEffect(() => {
    saveLobbyHeroId(lobbyHeroId);
  }, [lobbyHeroId]);

  useEffect(() => {
    if (!lobbyNotice) return;
    const t = window.setTimeout(() => setLobbyNotice(''), 4200);
    return () => window.clearTimeout(t);
  }, [lobbyNotice]);

  useEffect(() => {
    if (scene !== 'lobby') return undefined;
    const lines = LOBBY_GREETINGS[lobbyHeroId] ?? LOBBY_DEFAULT_GREETINGS;
    const tick = () => {
      const text = lines[Math.floor(Math.random() * lines.length)];
      setLobbyBubble((b) => ({ text, tick: b.tick + 1 }));
    };
    const id = window.setInterval(tick, 26000 + Math.random() * 14000);
    return () => window.clearInterval(id);
  }, [scene, lobbyHeroId]);

  useEffect(() => {
    setLobbyBgImgVisible(false);
  }, [sceneBgId]);

  useEffect(() => {
    if (scene !== 'lobby') setLobbyPanelModal(null);
  }, [scene]);

  useEffect(() => {
    if (lobbyPanelModal === 'daily') setDailyQ(loadDailyQuestsState());
  }, [lobbyPanelModal]);

  useEffect(() => {
    if (lobbyPanelModal !== 'recruit') {
      setStarWishOddsOpen(false);
      setRecruitWishTab('limited');
    }
  }, [lobbyPanelModal]);

  useEffect(() => {
    if (recruitWishTab !== 'limited') setStarWishOddsOpen(false);
  }, [recruitWishTab]);

  const showLobbyGreeting = (heroId) => {
    const pool = LOBBY_GREETINGS[heroId] ?? LOBBY_DEFAULT_GREETINGS;
    const text = pool[Math.floor(Math.random() * pool.length)];
    setLobbyBubble((b) => ({ text, tick: b.tick + 1 }));
  };

  const cycleLobbyHero = (dir) => {
    const ids = lobbyUnlockedHeroIds;
    if (!ids.length) return;
    const i = Math.max(0, ids.indexOf(lobbyHeroId));
    const next = (i + dir + ids.length) % ids.length;
    setLobbyHeroId(ids[next]);
  };

  const goToMainQuestTarget = () => {
    setLobbyNotice('');
    const ptr = mainQuestPtr;
    if (!ptr) {
      setLobbyNotice('主線進度已全部完成（或暫無可追蹤目標）。');
      return;
    }
    if (!ptr.unlocked) {
      setLobbyNotice('此目標尚未解鎖，請先完成前置關卡。');
      return;
    }
    setSelectedChapterId(ptr.chapterId);
    setSelectedStageId(ptr.stageId);
    const st = STAGES.find((s) => s.id === ptr.stageId);
    if (st?.kind === 'story') {
      setStoryStageId(ptr.stageId);
      setScene('story');
      return;
    }
    setScene('chapter');
  };

  useEffect(() => {
    migrateStarCrystalFirstClearIfNeeded(loadCompletedStageIds());
    setStarCrystals(loadStarCrystalBalance());
  }, []);

  useEffect(() => {
    saveGold(gold);
  }, [gold]);

  useEffect(() => {
    saveStarCrystalBalance(starCrystals);
  }, [starCrystals]);

  useEffect(() => {
    saveStarWishState({ discountPulls: starWishDiscountPulls });
  }, [starWishDiscountPulls]);

  useEffect(() => {
    saveTalentRow4Progress(talentR4Prog);
  }, [talentR4Prog]);

  useEffect(() => {
    if (!lobbyPanelModal) setStarWishRewardPreview(null);
  }, [lobbyPanelModal]);

  useEffect(() => {
    if (!lobbyPanelModal) return;
    if (lobbyPanelModal === 'forge' || lobbyPanelModal === 'training' || lobbyPanelModal === 'camp' || lobbyPanelModal === 'garden') {
      setFacilityNpcTalkIdx((s) => ({ ...(s ?? {}), [lobbyPanelModal]: 0 }));
    }
  }, [lobbyPanelModal]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('aethelgard-camp-buff-v1', JSON.stringify(campBuff ?? null));
    } catch {
      /* ignore */
    }
  }, [campBuff]);

  useEffect(() => {
    saveCampRecipeOwnedIds(campOwnedRecipeIds);
  }, [campOwnedRecipeIds]);

  useEffect(() => {
    saveHeroEquipMapV2(heroEquipV2);
  }, [heroEquipV2]);

  useEffect(() => {
    saveSkillMasteryMap(skillMasteryMap);
  }, [skillMasteryMap]);

  useEffect(() => {
    saveBondMap(bondMap);
  }, [bondMap]);

  // 若全角色全技能都已滿級，避免每日任務抽到「訓練一次」而卡死
  useEffect(() => {
    const s = dailyQ ?? loadDailyQuestsState();
    if (!s?.picked?.includes('training_buy')) return;
    const unlocked = HEROES_BASE.filter((h) => isHeroUnlocked(h.id));
    const hasTrainable = unlocked.some((h) => {
      const skills = getSkillsForHero({ id: h.id }) ?? [];
      return skills.some((sk) => getMasteryRank(skillMasteryMap?.[h.id]?.[sk.id]?.uses ?? 0) < 10);
    });
    if (hasTrainable) return;
    // 重新 roll 今天的任務直到沒有 training_buy（最多嘗試幾次避免死迴圈）
    let next = loadDailyQuestsState();
    for (let i = 0; i < 8 && next?.picked?.includes('training_buy'); i += 1) {
      clearDailyQuestsStorage();
      next = loadDailyQuestsState();
    }
    setDailyQ(next);
  }, [dailyQ, skillMasteryMap, allHeroesUnlocked, unlockedHeroIds]);

  useEffect(() => {
    // instances are persisted by the instance storage layer
    if (typeof window === 'undefined') return;
    try {
      const { saveEquipInstances } = require('./lib/equipInstanceStorage.js');
      saveEquipInstances(equipInstances);
    } catch {
      /* ignore */
    }
  }, [equipInstances]);

  // 裝備詞條（instance）：打開換裝視窗時，為「已穿戴的實例」生成/補齊詞條
  useEffect(() => {
    if (!equipModalHeroId) return;
    const heroId = equipModalHeroId;
    const forgeLevel = getForgeLevelFromInventory(itemInv);
    const eq = heroEquipV2?.[heroId];
    const slots = [
      { slotKey: 'weapon', eid: eq?.weaponEid ?? null },
      { slotKey: 'offhand', eid: eq?.offhandEid ?? null },
      { slotKey: 'armor', eid: eq?.armorEid ?? null },
    ];
    setEquipInstances((prev) => {
      let next = Array.isArray(prev) ? prev : [];
      for (const s of slots) {
        if (!s.eid) continue;
        const idx = next.findIndex((x) => x.eid === s.eid);
        if (idx < 0) continue;
        const inst = next[idx];
        const itemId = inst?.itemId ?? null;
        if (!itemId) continue;
        if (Array.isArray(inst.affixes) && inst.affixes.length > 0) continue;
        const salt = Math.max(0, Math.floor(Number(inst.salt) || 0));
        const affixes = rollAffixesForEquip({ heroId, slotKey: s.slotKey, itemId, forgeLevel, salt });
        const patched = { ...inst, affixes };
        next = next.map((x, i) => (i === idx ? patched : x));
      }
      return next;
    });
  }, [equipModalHeroId, itemInv, heroEquipV2]);

  useEffect(() => {
    // legacy count-based equip inventory is no longer written
  }, [equipInv]);

  useEffect(() => {
    saveItemInventory(itemInv);
  }, [itemInv]);

  useEffect(() => {
    saveGardenPlots(gardenPlots);
  }, [gardenPlots]);

  useEffect(() => {
    saveFishCodex(fishCodex);
  }, [fishCodex]);

  useEffect(() => {
    saveDailyQuestsState(dailyQ);
  }, [dailyQ]);

  const bumpDailyQuest = (qid, amount = 1) => {
    const d = Math.max(1, Math.floor(Number(amount) || 0));
    setDailyQ((s) => {
      if (!s?.picked?.includes(qid)) return s;
      const def = DAILY_QUEST_DEFS[qid];
      if (!def) return s;
      const now = loadDailyQuestsState();
      if (now.date !== s.date) return now;
      const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
      return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + d) } };
    });
  };

  const rosterFromParty = () =>
    partyIds
      .map((id) => HEROES_BASE.find((u) => u.id === id))
      .filter(Boolean);

  const grantVictory = (battleMonsters, rewardStageId) => {
    const sid = rewardStageId ?? selectedStageId;
    const sidStr = String(sid || '');
    const bm = battleMonsters ?? monsters;
    const captainId = partyIds[0];
    const passive = getCaptainPassiveDef(captainId);
    const xpMul = getCaptainBattleXpMultiplier(captainId);
    const goldMul = getCaptainBattleGoldMultiplier(captainId);
    const baseXp = sumMonstersXpReward(bm);
    const baseGold = sumMonstersGoldReward(bm);
    const totalXp = Math.max(0, Math.floor(baseXp * xpMul));
    const totalGold = Math.max(0, Math.floor(baseGold * goldMul));
    const xpPct = xpMul > 1 ? Math.round((xpMul - 1) * 100) : 0;
    const goldPct = goldMul > 1 ? Math.round((goldMul - 1) * 100) : 0;

    setVictoryXpFootnote(
      xpMul > 1 && passive?.name
        ? `基礎 ${baseXp} EXP，隊長技「${passive.name}」+${xpPct}% → 結算合計 ${totalXp} EXP`
        : ''
    );
    setVictoryGoldFootnote(
      goldMul > 1 && passive?.name
        ? `基礎 ${baseGold}，隊長技「${passive.name}」+${goldPct}% → 結算 +${totalGold}`
        : ''
    );

    // 經驗／金錢關卡：改成「通關才扣次數」，輸了不扣
    if (sidStr.startsWith('xp-')) {
      const res = consumeExpStageRun();
      if (!res.ok) {
        // 理論上不會發生（出發前已擋），但保底避免白拿獎勵
        setExpRunsLeft(getExpStageRunsLeft());
        setStageNotice(`今日經驗關卡次數已用完（0/${EXP_STAGE_DAILY_LIMIT}）。`);
        return;
      }
      setExpRunsLeft(res.remaining);
    } else if (sidStr.startsWith('gl-')) {
      const res = consumeGoldStageRun();
      if (!res.ok) {
        setGoldRunsLeft(getGoldStageRunsLeft());
        setStageNotice(`今日金錢關卡次數已用完（0/${GOLD_STAGE_DAILY_LIMIT}）。`);
        return;
      }
      setGoldRunsLeft(res.remaining);
    }

    const { lines } = awardPartyXp(partyIds, totalXp);
    setVictoryXpReport(lines);
    setVictoryGoldGain(totalGold);
    if (totalGold > 0) setGold((g) => g + totalGold);

    setVictoryStarCrystalLine('');
    const starSnap = loadStarCrystalBalance();
    completeStage(sid);
    const afterClear = loadStarCrystalBalance();
    if (sidStr.startsWith('xp-')) {
      grantStarCrystalExpStageClear();
      setDailyQ((s) => {
        const qid = 'clear_xp';
        if (!s?.picked?.includes(qid)) return s;
        const def = DAILY_QUEST_DEFS[qid];
        const now = loadDailyQuestsState();
        if (now.date !== s.date) return now;
        const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
        return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + 1) } };
      });
    }
    if (sidStr.startsWith('gl-')) {
      grantStarCrystalGoldStageClear();
      setDailyQ((s) => {
        const qid = 'clear_gold';
        if (!s?.picked?.includes(qid)) return s;
        const def = DAILY_QUEST_DEFS[qid];
        const now = loadDailyQuestsState();
        if (now.date !== s.date) return now;
        const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
        return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + 1) } };
      });
    }
    const starEnd = loadStarCrystalBalance();
    setStarCrystals(starEnd);
    if (starEnd > starSnap) {
      const bits = [];
      if (afterClear > starSnap) bits.push(`+${afterClear - starSnap}（關卡首通）`);
      if (starEnd > afterClear) {
        if (sidStr.startsWith('xp-')) bits.push(`+${starEnd - afterClear}（經驗關卡）`);
        else if (sidStr.startsWith('gl-')) bits.push(`+${starEnd - afterClear}（金錢關卡）`);
        else bits.push(`+${starEnd - afterClear}`);
      }
      setVictoryStarCrystalLine(`星曉晶石 ${bits.join(' ')}`);
    }

    setVictoryLootLine('');
    let claims = loadBossLootClaims();
    const lootParts = [];
    if (sid === 'c1-boss-1' && !claims['c1-boss-1']) {
      claims = { ...claims, 'c1-boss-1': true };
      saveBossLootClaims(claims);
      const maxP = getItemMaxStack('it_purify_prism');
      const curP = getInvCount(itemInv, 'it_purify_prism');
      const addP = Math.min(1, Math.max(0, maxP - curP));
      if (addP > 0) {
        setItemInv((inv) => incInv(inv, 'it_purify_prism', addP));
        lootParts.push(`淨化稜晶 ×${addP}`);
      }
    } else if (sid === 'c2-boss-1' && !claims['c2-boss-1']) {
      claims = { ...claims, 'c2-boss-1': true };
      saveBossLootClaims(claims);
      const maxU = getItemMaxStack('it_purify_prism');
      const curU = getInvCount(itemInv, 'it_purify_prism');
      const addU = Math.min(1, Math.max(0, maxU - curU));
      if (addU > 0) {
        setItemInv((inv) => incInv(inv, 'it_purify_prism', addU));
        lootParts.push(`淨化稜晶 ×${addU}`);
      }
    } else if (sid === 'c4-boss-1' && !claims['c4-boss-1']) {
      claims = { ...claims, 'c4-boss-1': true };
      saveBossLootClaims(claims);
      const maxG = getItemMaxStack('it_purify_prism');
      const curG = getInvCount(itemInv, 'it_purify_prism');
      const addG = Math.min(1, Math.max(0, maxG - curG));
      if (addG > 0) {
        setItemInv((inv) => incInv(inv, 'it_purify_prism', addG));
        lootParts.push(`淨化稜晶 ×${addG}（第三顆）`);
      }
    } else if (sid === 'c5-boss-1' && !claims['c5-boss-1']) {
      claims = { ...claims, 'c5-boss-1': true };
      saveBossLootClaims(claims);
      const maxQ = getItemMaxStack('it_purify_prism');
      const curQ = getInvCount(itemInv, 'it_purify_prism');
      const addQ = Math.min(1, Math.max(0, maxQ - curQ));
      if (addQ > 0) {
        setItemInv((inv) => incInv(inv, 'it_purify_prism', addQ));
        lootParts.push(`淨化稜晶 ×${addQ}（第四顆）`);
      }
    }
    if (lootParts.length) setVictoryLootLine(`獲得重要道具：${lootParts.join('、')}`);
    if (lines.some((r) => (r.levelUpCount ?? 0) > 0)) {
      unlockAudio();
      SFX.levelUp();
    }
    // 羈絆：勝利後，上陣角色兩兩 +1 點（也同步到每日任務的「羈絆點數」）
    if (Array.isArray(partyIds) && partyIds.length >= 2) {
      setBondMap((prev) => {
        let next = prev ?? {};
        for (let i = 0; i < partyIds.length; i += 1) {
          for (let j = i + 1; j < partyIds.length; j += 1) {
            next = addBondPoints(next, partyIds[i], partyIds[j], 1);
          }
        }
        return next;
      });
      const gained = (partyIds.length * (partyIds.length - 1)) / 2;
      setDailyQ((s) => {
        const qid = 'bond_gain';
        if (!s?.picked?.includes(qid)) return s;
        const def = DAILY_QUEST_DEFS[qid];
        const now = loadDailyQuestsState();
        if (now.date !== s.date) return now;
        const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
        return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + gained) } };
      });
    }
    setSelectedStageId(sid);
    setScene('victory');
  };

  /** 已通關的經驗／金錢關卡可掃蕩：扣同日次數、立即結算（等同通關）。 */
  const sweepClearedExpGoldStage = (stageId) => {
    setStageNotice('');
    const stage = STAGES.find((s) => s.id === stageId) ?? null;
    if (!stage || (stage.kind !== 'xp' && stage.kind !== 'gold')) return;
    if (!isStageUnlocked(stageId)) {
      setStageNotice('此關卡尚未解鎖。');
      return;
    }
    if (!isStageCompleted(stageId)) {
      setStageNotice('須先通關一次後才能掃蕩。');
      return;
    }
    if (rosterFromParty().length < MIN_PARTY) {
      setStageNotice(`隊伍至少需要 ${MIN_PARTY} 人。`);
      return;
    }
    if (stage.kind === 'xp') {
      const res = consumeExpStageRun();
      if (!res.ok) {
        setExpRunsLeft(getExpStageRunsLeft());
        setStageNotice(`今日經驗關卡次數已用完（0/${EXP_STAGE_DAILY_LIMIT}）。之後可用入場券恢復次數。`);
        return;
      }
      setExpRunsLeft(res.remaining);
    } else {
      const res = consumeGoldStageRun();
      if (!res.ok) {
        setGoldRunsLeft(getGoldStageRunsLeft());
        setStageNotice(`今日金錢關卡次數已用完（0/${GOLD_STAGE_DAILY_LIMIT}）。`);
        return;
      }
      setGoldRunsLeft(res.remaining);
    }
    unlockAudio();
    SFX.uiClick();
    grantVictory(stage.monsters, stageId);
  };

  const togglePartyMember = (heroId) => {
    setPartyNotice('');
    if (!isHeroUnlocked(heroId)) {
      setPartyNotice('目前劇情進度尚未解鎖此角色。');
      return;
    }
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
    if (!isHeroUnlocked(heroId)) {
      setPartyNotice('目前劇情進度尚未解鎖此角色。');
      return;
    }
    if (!partyIds.includes(heroId) || partyIds[0] === heroId) return;
    setPartyIds((prev) => {
      const rest = prev.filter((id) => id !== heroId);
      return [heroId, ...rest];
    });
  };

  /** 熔岩核心全滅後，移除熔岩巨人因核心獲得的額外 HP 上限 */
  const applyLavaCoreDeathBonusStrip = (mList) => {
    const coreAlive = mList.some((m) => m.curHp > 0 && isLavaCoreTemplateId(monsterTemplateId(m.id)));
    if (coreAlive) return mList;
    return mList.map((m) => {
      const bonus = m.lavaCoreMaxHpBonus ?? 0;
      if (bonus <= 0) return m;
      const newMax = Math.max(1, m.hp - bonus);
      const newCur = Math.min(newMax, m.curHp);
      return { ...m, hp: newMax, curHp: newCur, lavaCoreMaxHpBonus: 0 };
    });
  };

  const startBattle = (stageId = selectedStageId) => {
    setStageNotice('');
    const stage = STAGES.find((s) => s.id === stageId) ?? STAGES[0];
    if (!isStageUnlocked(stage?.id)) {
      setStageNotice('此關卡尚未解鎖。');
      return;
    }
    if (stage?.kind === 'story') {
      setStoryStageId(stage.id);
      setSelectedStageId(stage.id);
      setScene('story');
      return;
    }
    const xpMap = loadHeroXpMap();
    const forgeLevel = getForgeLevelFromInventory(itemInv);
    const roster = rosterFromParty()
      .map((u) => applyLevelLinearStatsToHero(u, xpMap[u.id] ?? defaultProgress()))
      .map((u) => applyEquipmentToHero(u, equipItemIdsForHero(u.id)))
      .map((u) => applyTalentStatsToUnit({ ...u, isHero: true }, talentMap));
    if (roster.length < MIN_PARTY) return;
    const { heroes: h0, auraLine } = buildBattleHeroesWithAura(roster, partyIds[0]);

    // 裝備詞條（instance）：確保「目前穿戴的實例」有詞條
    for (const hero of roster) {
      const eq2 = equipForHeroV2(hero.id);
      const slots = [
        { slotKey: 'weapon', eid: eq2.weaponEid },
        { slotKey: 'offhand', eid: eq2.offhandEid },
        { slotKey: 'armor', eid: eq2.armorEid },
      ];
      for (const s of slots) {
        if (!s.eid) continue;
        const inst = getInstanceByEid(s.eid);
        if (!inst?.itemId) continue;
        if (Array.isArray(inst.affixes) && inst.affixes.length > 0) continue;
        const salt = Math.max(0, Math.floor(Number(inst.salt) || 0));
        const affixes = rollAffixesForEquip({ heroId: hero.id, slotKey: s.slotKey, itemId: inst.itemId, forgeLevel, salt });
        setEquipInstances((list) => (Array.isArray(list) ? list.map((x) => (x.eid === s.eid ? { ...x, affixes } : x)) : []));
      }
    }

    const applyForgeAndAffixBonus = (hero) => {
      if (!hero?.isHero) return hero;
      const eq = equipItemIdsForHero(hero.id);
      const baseBonus = getEquipStatBonus(eq);
      const forgeMul = 1 + Math.max(0, Math.min(4, forgeLevel)) * 0.02;
      const forgeDelta = {
        hp: Math.round((baseBonus.hp ?? 0) * (forgeMul - 1)),
        atk: Math.round((baseBonus.atk ?? 0) * (forgeMul - 1)),
        matk: Math.round((baseBonus.matk ?? 0) * (forgeMul - 1)),
        def: Math.round((baseBonus.def ?? 0) * (forgeMul - 1)),
        mdef: Math.round((baseBonus.mdef ?? 0) * (forgeMul - 1)),
        spd: Math.round((baseBonus.spd ?? 0) * (forgeMul - 1)),
      };
      const affixStats = {
        hp: 0,
        atk: 0,
        matk: 0,
        def: 0,
        mdef: 0,
        spd: 0,
        critRateAdd: 0,
        critDmgMul: 1,
        skillDmgMul: 1,
        incomingDmgMul: 1,
        ccHitAdd: 0,
        ailResistAdd: 0,
      };
      {
        const e2 = equipForHeroV2(hero.id);
        const insts = [getInstanceByEid(e2.weaponEid), getInstanceByEid(e2.offhandEid), getInstanceByEid(e2.armorEid)].filter(Boolean);
        const s = sumAffixStats(insts.flatMap((x) => x.affixes ?? []));
        affixStats.hp += s.hp;
        affixStats.atk += s.atk;
        affixStats.matk += s.matk;
        affixStats.def += s.def;
        affixStats.mdef += s.mdef;
        affixStats.spd += s.spd;
        affixStats.critRateAdd += s.critRateAdd ?? 0;
        affixStats.critDmgMul *= s.critDmgMul ?? 1;
        affixStats.skillDmgMul *= s.skillDmgMul ?? 1;
        affixStats.incomingDmgMul *= s.incomingDmgMul ?? 1;
        affixStats.ccHitAdd += s.ccHitAdd ?? 0;
        affixStats.ailResistAdd += s.ailResistAdd ?? 0;
      }
      return {
        ...hero,
        hp: Math.max(1, (hero.hp ?? 1) + forgeDelta.hp + affixStats.hp),
        atk: Math.max(1, (hero.atk ?? 1) + forgeDelta.atk + affixStats.atk),
        matk: Math.max(0, (hero.matk ?? 0) + forgeDelta.matk + affixStats.matk),
        def: Math.max(1, (hero.def ?? 1) + forgeDelta.def + affixStats.def),
        mdef: Math.max(1, (hero.mdef ?? hero.def ?? 1) + forgeDelta.mdef + affixStats.mdef),
        spd: Math.max(1, (hero.spd ?? 1) + forgeDelta.spd + affixStats.spd),
        affixCritRateAdd: Math.max(0, Math.min(0.5, (affixStats.critRateAdd ?? 0) / 100)),
        affixCritDmgMul: Math.max(1, affixStats.critDmgMul ?? 1),
        affixSkillDmgMul: Math.max(1, affixStats.skillDmgMul ?? 1),
        affixIncomingDmgMul: Math.max(0.6, Math.min(1, affixStats.incomingDmgMul ?? 1)),
        affixCcHitAdd: Math.max(0, Math.min(0.25, affixStats.ccHitAdd ?? 0)),
        affixAilResistAdd: Math.max(0, Math.min(0.25, affixStats.ailResistAdd ?? 0)),
      };
    };

    const h = h0.map((u) => {
      let uu = applyForgeAndAffixBonus(u);
      const t = getBattleStartTauntTurnsFromTalents(talentMap, u.id);

      // 羈絆戰前加成：若與隊伍中任一夥伴羈絆 Lv>=1，開場 +5 MP；總加成封頂 10
      const buddies = (partyIds ?? []).filter((id) => id && id !== uu.id);
      let mpAdd = 0;
      for (const b of buddies) {
        const lv = getBondLevel(getBondPoints(bondMap, uu.id, b));
        if (lv >= 1) mpAdd += 5;
      }
      mpAdd = Math.min(10, mpAdd);
      if (mpAdd > 0) uu = { ...uu, curMp: Math.min(MP_MAX, (uu.curMp ?? 0) + mpAdd) };

      if (t > 0) uu = { ...uu, tauntTurns: Math.max(uu.tauntTurns ?? 0, t) };
      return uu;
    });

    // 餐酒館：料理戰前 Buff（只生效 1 場）
    const camp = campBuff && typeof campBuff === 'object' ? campBuff : null;
    let hCamp = h;
    if (camp?.apply?.type === 'atkMul') {
      const mul = typeof camp.apply.mul === 'number' ? Math.max(1, camp.apply.mul) : 1;
      const turns = Math.max(1, Math.floor(Number(camp.apply.turns) || 2));
      if (mul !== 1)
        hCamp = hCamp.map((x) =>
          x.curHp > 0 ? { ...x, atkBuffTurns: Math.max(x.atkBuffTurns ?? 0, turns), atkBuffMul: Math.max(x.atkBuffMul ?? 1, mul) } : x
        );
    } else if (camp?.apply?.type === 'defMul') {
      const mul = typeof camp.apply.mul === 'number' ? Math.max(1, camp.apply.mul) : 1;
      const turns = Math.max(1, Math.floor(Number(camp.apply.turns) || 2));
      if (mul !== 1)
        hCamp = hCamp.map((x) =>
          x.curHp > 0
            ? {
                ...x,
                campIncomingDmgMulTurns: Math.max(x.campIncomingDmgMulTurns ?? 0, turns),
                campIncomingDmgMul: Math.min(x.campIncomingDmgMul ?? 1, 1 / mul),
              }
            : x
        );
    } else if (camp?.apply?.type === 'spdMul') {
      const mul = typeof camp.apply.mul === 'number' ? Math.max(1, camp.apply.mul) : 1;
      const turns = Math.max(1, Math.floor(Number(camp.apply.turns) || 2));
      if (mul !== 1)
        hCamp = hCamp.map((x) =>
          x.curHp > 0 ? { ...x, spdBuffTurns: Math.max(x.spdBuffTurns ?? 0, turns), spdBuffMul: Math.max(x.spdBuffMul ?? 1, mul) } : x
        );
    } else if (camp?.apply?.type === 'matkMul') {
      const mul = typeof camp.apply.mul === 'number' ? Math.max(1, camp.apply.mul) : 1;
      const turns = Math.max(1, Math.floor(Number(camp.apply.turns) || 2));
      if (mul !== 1)
        hCamp = hCamp.map((x) =>
          x.curHp > 0 ? { ...x, matkBuffTurns: Math.max(x.matkBuffTurns ?? 0, turns), matkBuffMul: Math.max(x.matkBuffMul ?? 1, mul) } : x
        );
    } else if (camp?.apply?.type === 'avMul') {
      const mul = typeof camp.apply.mul === 'number' ? Math.max(0.2, Math.min(1, camp.apply.mul)) : 1;
      if (mul !== 1) hCamp = hCamp.map((x) => (x.curHp > 0 ? { ...x, av: Math.max(0, (x.av ?? 0) * mul) } : x));
    }
    if (camp) setCampBuff(null);
    if (stage?.kind === 'xp') {
      if (expRunsLeft <= 0) {
        setExpRunsLeft(getExpStageRunsLeft());
        setStageNotice(`今日經驗關卡次數已用完（0/${EXP_STAGE_DAILY_LIMIT}）。之後可用入場券恢復次數。`);
        return;
      }
    } else if (stage?.kind === 'gold') {
      if (goldRunsLeft <= 0) {
        setGoldRunsLeft(getGoldStageRunsLeft());
        setStageNotice(`今日金錢關卡次數已用完（0/${GOLD_STAGE_DAILY_LIMIT}）。`);
        return;
      }
    }
    const baseMonsters = stage?.monsters ?? MONSTERS_BASE;
    let m = baseMonsters.map((u, i) => ({
      ...defaultAilmentFields(),
      ...u,
      id: `${u.id}-${i}`,
      curHp: u.hp,
      curMp: u.mp ?? MP_MAX,
      mdef: u.mdef ?? u.def,
      weaknessSeen: false,
      lastHitMpTurn: -1,
      defDownTurns: 0,
      defDownMul: 1,
      mdefDownTurns: 0,
      mdefDownMul: 1,
      atkDownTurns: 0,
      atkDownMul: 1,
      spdDownTurns: 0,
      spdDownMul: 1,
      av: 10000 / u.spd,
      isHero: false,
    }));
    if (stage?.id === 'c4-boss-1' || stage?.id === 'c7-boss-ex-lava') {
      const giantI = m.findIndex((mm) => isLavaGiantTemplateId(monsterTemplateId(mm.id)));
      const coreI = m.findIndex((mm) => isLavaCoreTemplateId(monsterTemplateId(mm.id)));
      if (giantI >= 0 && coreI >= 0) {
        const g = m[giantI];
        const bonus = Math.round(g.hp * 0.42);
        m = m.map((mm, idx) =>
          idx === giantI ? { ...mm, hp: mm.hp + bonus, curHp: mm.curHp + bonus, lavaCoreMaxHpBonus: bonus } : mm,
        );
      }
    }
    let jackOpeningDazzle = 0;
    if (partyIds.includes('jack')) {
      jackOpeningDazzle = getBattleStartDazzleAllTurnsFromTalents(talentMap, 'jack');
      if (jackOpeningDazzle > 0) {
        m = m.map((mm) => (mm.curHp > 0 ? applyDazzleOnTarget(mm, jackOpeningDazzle) : mm));
      }
    }
    const heroesForBattle = hCamp.map((u) => ({ ...defaultAilmentFields(), ...u }));
    setHeroes(heroesForBattle);
    setMonsters(m);
    setTurnSeq(0);
    setSelectedStageId(stage?.id ?? stageId);
    setScene('battle');
    const intro = [`戰鬥開始！${stage?.title ?? '未知關卡'}`];
    if (jackOpeningDazzle > 0) {
      intro.push(`開幕眩術：敵方全體眩目（${jackOpeningDazzle} 回合）`);
    }
    if (stage?.id === 'c4-boss-1' || stage?.id === 'c7-boss-ex-lava') {
      intro.push('普爾斯：「優先破壞熔岩核心——它會強化巨人的體魄，還會不斷把熱能輸回巨人身上！」');
    }
    if (auraLine) intro.push(auraLine);
    setLogs(intro.slice(0, 5));
    calculateNextTurn(heroesForBattle, m);
  };

  const calculateNextTurn = (hList, mList) => {
    let hCur = hList;
    let mCur = mList;

    for (let guard = 0; guard < 12; guard += 1) {
      const alive = [...hCur.filter((u) => u.curHp > 0), ...mCur.filter((u) => u.curHp > 0)];
      if (alive.length === 0) {
        setActiveUnit(null);
        setTurnQueue([]);
        setTargetMode(null);
        setSkillMenuOpen(false);
        setPickedSkill(null);
        setItemMenuOpen(false);
        setPickedItemId(null);
        setIsProcessing(false);
        return;
      }
      const sorted = [...alive].sort((a, b) => a.av - b.av);
      const head = sorted[0];
      const headId = head.id;

      const pickUpdated = () => {
        const hh = hCur.find((h) => h.id === headId);
        if (hh) return { side: 'hero', u: hh };
        const mm = mCur.find((m) => m.id === headId);
        if (mm) return { side: 'monster', u: mm };
        return { side: null, u: head };
      };

      let { side, u: nextUnit } = pickUpdated();

      // 回合開始：燃燒 DOT（不吃屬性剋星；可能直接擊殺行動者）
      const dot = applyTurnStartDots(nextUnit);
      if (dot.logs.length) {
        setLogs((prev) => [...dot.logs, ...prev].slice(0, 5));
      }
      if (!nextUnit?.isHero && nextUnit?.curHp > 0 && dot.unit?.curHp <= 0) {
        const boom = triggerDeathMarkExplosion(nextUnit, mCur);
        if (boom.logLine) setLogs((prev) => [boom.logLine, ...prev].slice(0, 5));
        if (boom.monstersNext !== mCur) {
          mCur = applyLavaCoreDeathBonusStrip(boom.monstersNext);
          setMonsters(mCur);
        }
      }
      if (dot.unit !== nextUnit) {
        if (side === 'hero') {
          const oldEff = getEffectiveSpd(nextUnit);
          const newEff = getEffectiveSpd(dot.unit);
          hCur = hCur.map((h) => (h.id === headId ? { ...dot.unit, av: rescaleAvForSpdChange(h.av, oldEff, newEff) } : h));
          setHeroes(hCur);
        } else if (side === 'monster') {
          const oldEff = getEffectiveSpd(nextUnit);
          const newEff = getEffectiveSpd(dot.unit);
          mCur = applyLavaCoreDeathBonusStrip(
            mCur.map((m) => (m.id === headId ? { ...dot.unit, av: rescaleAvForSpdChange(m.av, oldEff, newEff) } : m)),
          );
          setMonsters(mCur);
        } else {
          // fallback：兩邊找
          if (hCur.some((h) => h.id === headId)) {
            const oldEff = getEffectiveSpd(nextUnit);
            const newEff = getEffectiveSpd(dot.unit);
            hCur = hCur.map((h) => (h.id === headId ? { ...dot.unit, av: rescaleAvForSpdChange(h.av, oldEff, newEff) } : h));
            setHeroes(hCur);
            side = 'hero';
          } else if (mCur.some((m) => m.id === headId)) {
            const oldEff = getEffectiveSpd(nextUnit);
            const newEff = getEffectiveSpd(dot.unit);
            mCur = applyLavaCoreDeathBonusStrip(
              mCur.map((m) => (m.id === headId ? { ...dot.unit, av: rescaleAvForSpdChange(m.av, oldEff, newEff) } : m)),
            );
            setMonsters(mCur);
            side = 'monster';
          }
        }
      }

      ({ u: nextUnit } = pickUpdated());
      if (!nextUnit || nextUnit.curHp <= 0) {
        continue;
      }

      // 防禦沒被打的 MP 補償：在輪到本人行動時檢查（避免立即給，並可與被打回 MP 互斥）
      let heroPatch = hCur;
      if (nextUnit?.isHero) {
        const id = nextUnit.id;
        const mpGainBase = nextUnit.passive?.effect?.type === 'turnStartMp' ? (nextUnit.passive.effect.value ?? 0) : 0;
        const mpGainJackDraw =
          nextUnit.passive?.effect?.type === 'jackDrawSustainMp' && (nextUnit.jackDrawBuffTurns ?? 0) > 0
            ? (nextUnit.passive.effect.value ?? 0)
            : 0;
        const allyMp = nextUnit.passive?.effect?.type === 'allyAllTurnStartMp' ? (nextUnit.passive.effect.value ?? 0) : 0;
        const mpGainTalent = getExtraTurnStartMpFromTalents(talentMap, id);
        const mpGain = mpGainBase + mpGainTalent + mpGainJackDraw;
        if (mpGain > 0) {
          heroPatch = heroPatch.map((h) => (h.id === id ? { ...h, curMp: Math.min(MP_MAX, h.curMp + mpGain) } : h));
        }
        if (allyMp > 0) {
          heroPatch = heroPatch.map((h) =>
            h.curHp > 0 ? { ...h, curMp: Math.min(MP_MAX, (h.curMp ?? 0) + allyMp) } : h
          );
        }
        let cur = heroPatch.find((h) => h.id === id) ?? nextUnit;
        if ((cur.regenTurns ?? 0) > 0 && (cur.regenHeal ?? 0) > 0) {
          const heal = cur.regenHeal;
          const poisonMul = getIncomingHealMulFromPoison(cur);
          const incMul = cur?.isHero ? getIncomingHealMulFromTalents(talentMap, id) : 1;
          const healAmt = Math.max(1, Math.floor(heal * poisonMul * incMul));
          heroPatch = heroPatch.map((h) =>
            h.id === id
              ? {
                  ...h,
                  curHp: Math.min(h.hp, h.curHp + healAmt),
                  regenTurns: Math.max(0, (h.regenTurns ?? 0) - 1),
                }
              : h
          );
          setLogs((prev) => [`${cur.name} 緩回 +${healAmt}`, ...prev].slice(0, 5));
          cur = heroPatch.find((h) => h.id === id) ?? cur;
        }
        if (heroPatch !== hCur) {
          hCur = heroPatch;
          setHeroes(hCur);
        }
      }

      // 暈眩：輪到自己行動時直接跳過（暈眩結束後 2 回合內免疫）
      ({ u: nextUnit } = pickUpdated());
      if (nextUnit?.curHp > 0 && (nextUnit.stunTurns ?? 0) > 0) {
        const id = nextUnit.id;
        const spd = getEffectiveSpd(nextUnit);
        const nextAv = nextUnit.av + 10000 / spd;
        const prevTurns = nextUnit.stunTurns ?? 0;
        const afterTurns = Math.max(0, prevTurns - 1);
        const gainedImmune = prevTurns > 0 && afterTurns === 0;
        const patch = {
          ...nextUnit,
          av: nextAv,
          status: nextUnit.isHero ? null : (nextUnit.status ?? null),
          stunTurns: afterTurns,
          ...(gainedImmune ? { stunImmuneTurns: Math.max(nextUnit.stunImmuneTurns ?? 0, STUN_IMMUNE_TURNS_AFTER) } : {}),
        };

        setLogs((prev) => [`${nextUnit.name} 暈眩，無法行動！`, ...prev].slice(0, 5));
        if (side === 'hero') {
          hCur = hCur.map((h) => (h.id === id ? patch : h));
          setHeroes(hCur);
        } else if (side === 'monster') {
          mCur = applyLavaCoreDeathBonusStrip(mCur.map((m) => (m.id === id ? patch : m)));
          setMonsters(mCur);
        } else {
          // fallback：兩邊找
          if (hCur.some((h) => h.id === id)) {
            hCur = hCur.map((h) => (h.id === id ? patch : h));
            setHeroes(hCur);
          } else if (mCur.some((m) => m.id === id)) {
            mCur = applyLavaCoreDeathBonusStrip(mCur.map((m) => (m.id === id ? patch : m)));
            setMonsters(mCur);
          }
        }
        // 直接結束本次輪到的行動者，重新挑下一位
        continue;
      }

      const finalPick = () => hCur.find((h) => h.id === headId) ?? mCur.find((m) => m.id === headId) ?? nextUnit;

      if (nextUnit?.isHero && nextUnit.status === 'guard' && (nextUnit.guardStartTurnSeq ?? -1) >= 0) {
        const id = nextUnit.id;
        const guardSeq = nextUnit.guardStartTurnSeq ?? -1;
        const curHero = (heroPatch !== hCur ? heroPatch : hCur).find((h) => h.id === id) ?? nextUnit;
        const hasHitMpThisGuard = (curHero.lastHitMpTurn ?? -1) >= guardSeq;
        const alreadyRewarded = (curHero.guardNoHitRewardedSeq ?? -1) === guardSeq;
        if (!hasHitMpThisGuard && !alreadyRewarded) {
          const base = heroPatch !== hCur ? heroPatch : hCur;
          const updated = base.map((h) =>
            h.id === id
              ? {
                  ...h,
                  curMp: Math.min(MP_MAX, h.curMp + GUARD_NO_HIT_MP_GAIN),
                  guardNoHitRewardedSeq: guardSeq,
                }
              : h
          );
          hCur = updated;
          setHeroes(hCur);
          setActiveUnit(updated.find((h) => h.id === id) ?? finalPick());
        } else {
          setActiveUnit((heroPatch !== hCur ? heroPatch : hCur).find((h) => h.id === id) ?? finalPick());
        }
      } else {
        setActiveUnit(finalPick());
      }

      const alive2 = [...hCur.filter((u) => u.curHp > 0), ...mCur.filter((u) => u.curHp > 0)];
      const sorted2 = [...alive2].sort((a, b) => a.av - b.av);
      setTurnQueue(sorted2.slice(0, 10));
      setTargetMode(null);
      setSkillMenuOpen(false);
      setPickedSkill(null);
      setItemMenuOpen(false);
      setPickedItemId(null);
      setIsProcessing(false);
      return;
    }
  };

  const advanceTurn = (hList, mList, endedHeroId = null, endedMonsterId = null) => {
    setTurnSeq((t) => t + 1);
    const h2 = tickHeroBuffsOnEndTurn(hList, endedHeroId);
    const m2 = tickMonsterDebuffsOnEndTurn(mList, endedMonsterId);
    const ticked = tickAilmentDurationsAll(h2, m2);
    calculateNextTurn(ticked.heroes, ticked.monsters);
  };

  const triggerDeathMarkExplosion = (monster, monsterList) => {
    if (!monster || !monster.deathMark) return { monstersNext: monsterList, logLine: null };
    const alive = monsterList.filter((m) => m.curHp > 0 && m.id !== monster.id);
    if (alive.length === 0) return { monstersNext: monsterList, logLine: null };
    const tgt = alive[Math.floor(Math.random() * alive.length)];
    const dmg = Math.max(1, Math.floor((monster.hp ?? 1) * 0.2));
    const monstersNext = monsterList.map((m) =>
      m.id === tgt.id ? { ...m, curHp: Math.max(0, (m.curHp ?? 0) - dmg) } : m
    );
    return { monstersNext, logLine: `死亡標記爆發：${monster.name} 倒下時波及 ${tgt.name} -${dmg}` };
  };

  const endHeroAction = (baseHeroes, { mpCost = 0, mpGain = 0 } = {}) => {
    const spd = getEffectiveSpd(activeUnit);
    const nextAv = activeUnit.av + 10000 / spd;
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
    const getElementMul = (attType, tgtType) => {
      const STRONG_AGAINST = {
        fire: 'wind',
        wind: 'water',
        water: 'fire',
        dark: 'light',
        light: 'dark',
      };
      if (!attType || !tgtType) return 1;
      if (STRONG_AGAINST[attType] === tgtType) return 1.2;
      if (STRONG_AGAINST[tgtType] === attType) return 0.8;
      return 1;
    };

    const isMagical = isSkill && scale === 'matk';
    const isMixed = isSkill && scale === 'mix';
    const rawDef = defU.def;
    const rawMdef = defU.mdef ?? defU.def;
    const defMul = (defU.defDownTurns ?? 0) > 0 ? defU.defDownMul ?? 1 : 1;
    const mdefMul = (defU.mdefDownTurns ?? 0) > 0 ? defU.mdefDownMul ?? 1 : 1;
    let effDef = Math.max(1, Math.floor(rawDef * defMul));
    let effMdef = Math.max(1, Math.floor(rawMdef * mdefMul));
    if ((defU.defBuffTurns ?? 0) > 0) effDef = Math.max(1, Math.floor(effDef * (defU.defBuffMul ?? 1)));
    if ((defU.mdefBuffTurns ?? 0) > 0) effMdef = Math.max(1, Math.floor(effMdef * (defU.mdefBuffMul ?? 1)));
    /** 物攻吃物防；魔攻吃魔抗；複合（mix）吃 (物防+魔抗)/2 */
    const defense = isMixed ? Math.floor((effDef + effMdef) / 2) : isMagical ? effMdef : effDef;

    let base = atkU.atk;
    if (isSkill) {
      const atkMul = (atkU.atkBuffTurns ?? 0) > 0 ? atkU.atkBuffMul ?? 1 : 1;
      const atkDownMul = (atkU.atkDownTurns ?? 0) > 0 ? atkU.atkDownMul ?? 1 : 1;
      const effAtk = Math.max(1, Math.floor(atkU.atk * atkMul * atkDownMul));
      const matkMul = (atkU.matkBuffTurns ?? 0) > 0 ? atkU.matkBuffMul ?? 1 : 1;
      const effMatk = Math.max(0, Math.floor((atkU.matk ?? 0) * matkMul));
      if (scale === 'atk') base = effAtk * 1.5;
      else if (scale === 'mix') base = (effAtk * 0.7 + effMatk * 0.7) * 1.5;
      else base = effMatk || effAtk * 1.5;
      base *= skillMul;
    } else {
      const atkMul = (atkU.atkBuffTurns ?? 0) > 0 ? atkU.atkBuffMul ?? 1 : 1;
      const atkDownMul = (atkU.atkDownTurns ?? 0) > 0 ? atkU.atkDownMul ?? 1 : 1;
      base = Math.max(1, Math.floor(atkU.atk * atkMul * atkDownMul));
      if (atkU.isHero && atkU.passive?.effect?.type === 'basicAtkMul') {
        const mul = atkU.passive.effect.value ?? 1;
        if (mul !== 1) base = Math.max(1, Math.floor(base * mul));
      }
    }
    const mitigation = defense / (defense + 500);
    let final = Math.max(1, Math.floor(base * (1 - mitigation) * (0.9 + Math.random() * 0.2)));
    const elementMul = getElementMul(atkU?.type, defU?.type);
    if (elementMul !== 1) final = Math.max(1, Math.floor(final * elementMul));
    const darknessMul = getDarknessDamageMul(atkU?.type, defU);
    if (darknessMul !== 1) final = Math.max(1, Math.floor(final * darknessMul));
    const talentMul = getDamageMulFromTalents({ talentMap, attacker: atkU, target: defU });
    if (talentMul !== 1) final = Math.max(1, Math.floor(final * talentMul));
    // 看破特攻（臨時團隊增傷）：對 weaknessSeen 目標增傷
    if (
      atkU?.isHero &&
      !defU?.isHero &&
      defU?.weaknessSeen &&
      (atkU?.weaknessSeenDmgTurns ?? 0) > 0 &&
      typeof atkU?.weaknessSeenDmgMul === 'number' &&
      atkU.weaknessSeenDmgMul > 1
    ) {
      final = Math.max(1, Math.floor(final * atkU.weaknessSeenDmgMul));
    }
    if (atkU?.isHero && !defU?.isHero && atkU.passive?.effect?.type === 'dmgVsAilmentedEnemyMul') {
      const hasAil =
        ((defU?.burnTurns ?? 0) > 0 && (defU?.burnStacks ?? 0) > 0) ||
        (defU?.poisonTurns ?? 0) > 0 ||
        (defU?.freezeTurns ?? 0) > 0 ||
        (defU?.darknessTurns ?? 0) > 0 ||
        (defU?.dazzleTurns ?? 0) > 0 ||
        (defU?.stunTurns ?? 0) > 0;
      if (hasAil) {
        const mul = typeof atkU.passive.effect.mul === 'number' ? atkU.passive.effect.mul : 1;
        if (mul !== 1) final = Math.max(1, Math.floor(final * mul));
      }
    }
    const capDazzMul =
      atkU?.isHero &&
      !defU?.isHero &&
      (defU?.dazzleTurns ?? 0) > 0 &&
      typeof atkU.captainDmgVsDazzledMul === 'number' &&
      atkU.captainDmgVsDazzledMul > 1
        ? atkU.captainDmgVsDazzledMul
        : 1;
    if (capDazzMul !== 1) final = Math.max(1, Math.floor(final * capDazzMul));
    const capStunMul =
      atkU?.isHero &&
      !defU?.isHero &&
      (((defU?.stunTurns ?? 0) > 0) || ((defU?.stunImmuneTurns ?? 0) > 0)) &&
      typeof atkU.captainDmgVsStunnedOrImmuneMul === 'number' &&
      atkU.captainDmgVsStunnedOrImmuneMul > 1
        ? atkU.captainDmgVsStunnedOrImmuneMul
        : 1;
    if (capStunMul !== 1) final = Math.max(1, Math.floor(final * capStunMul));
    if (atkU?.isHero && isSkill) {
      const r4Mul = getR4SkillDamageMul(atkU.id);
      if (r4Mul !== 1) final = Math.max(1, Math.floor(final * r4Mul));
      const affixSkillMul = typeof atkU?.affixSkillDmgMul === 'number' ? Math.max(1, atkU.affixSkillDmgMul) : 1;
      if (affixSkillMul !== 1) final = Math.max(1, Math.floor(final * affixSkillMul));
    }
    let crit = false;
    const allowCrit =
      canPhysicalCrit(isSkill, scale) ||
      canSkillCritFromTalents({ talentMap, attacker: atkU, isSkill, scale }) ||
      ((atkU?.skillCritTurns ?? 0) > 0 && Array.isArray(atkU?.skillCritScales) && atkU.skillCritScales.includes(scale));
    const r4Crit = atkU?.isHero ? getR4CritRateAdd(atkU.id) : 0;
    const critChance = Math.min(0.95, Math.max(0, getPhysicalCritChance(atkU) + r4Crit));
    if (allowCrit && Math.random() < critChance) {
      final = Math.max(1, Math.floor(final * getPhysicalCritDamageMultiplier(atkU)));
      crit = true;
    }
    if (defU.status === 'guard') final = Math.floor(final * 0.5);
    if (defU.isHero && defU.status === 'guard' && defU.passive?.effect?.type === 'guardIncomingMul') {
      const mul = defU.passive.effect.value ?? 1;
      if (mul !== 1) final = Math.max(1, Math.floor(final * mul));
    }
    if (!atkU.isHero && defU.isHero) {
      const mul = defU.incomingDmgMul ?? 1;
      if (mul !== 1) final = Math.max(1, Math.floor(final * mul));
      if ((defU.campIncomingDmgMulTurns ?? 0) > 0) {
        const cm = typeof defU.campIncomingDmgMul === 'number' ? defU.campIncomingDmgMul : 1;
        if (cm !== 1) final = Math.max(1, Math.floor(final * cm));
      }
      if ((defU.barrierTurns ?? 0) > 0) {
        const bMul = defU.barrierMul ?? 1;
        if (bMul !== 1) final = Math.max(1, Math.floor(final * bMul));
      }
    }
    if (defU?.isHero) {
      const am = typeof defU.affixIncomingDmgMul === 'number' ? defU.affixIncomingDmgMul : 1;
      if (am !== 1) final = Math.max(1, Math.floor(final * am));
    }
    return { damage: final, crit };
  };

  const applySelfOnHitToHero = (h, selfOnHit) => {
    if (!selfOnHit || !h?.isHero) return h;
    const next = { ...h };
    if (selfOnHit.critRateMid) {
      next.critRateBuffTurns = Math.max(1, selfOnHit.critRateMid.turns ?? 3);
      next.critRateBuffAdd = CRIT_RATE_MID_ADD;
    }
    if (selfOnHit.critDmgSmall) {
      next.critDmgBuffTurns = Math.max(1, selfOnHit.critDmgSmall.turns ?? 2);
      next.critDmgBuffMul = CRIT_DMG_SMALL_MUL;
    }
    if (typeof selfOnHit.itemInvertTurns === 'number' && selfOnHit.itemInvertTurns > 0) {
      next.itemInvertTurns = Math.max(1, Math.floor(selfOnHit.itemInvertTurns));
    }
    return next;
  };

  const tickBarrierOnHit = (hList, targetHeroId) =>
    hList.map((h) => {
      if (h.id !== targetHeroId) return h;
      const prev = h.barrierTurns ?? 0;
      if (prev <= 0) return h;
      const nextTurns = Math.max(0, prev - 1);
      if (nextTurns <= 0) return { ...h, barrierTurns: 0, barrierMul: 1, barrierSource: null };
      return { ...h, barrierTurns: nextTurns };
    });

  const applyBubuMpOnAllyDirectDamage = (hList, hitCount) => {
    const triggers = Math.max(0, Math.floor(Number(hitCount) || 0));
    if (triggers <= 0) return { heroesNext: hList, mpGained: 0, triggersApplied: 0 };
    const def = getMpOnAllyDirectDamageFromTalents(talentMap, 'bubu');
    if (!def) return { heroesNext: hList, mpGained: 0, triggersApplied: 0 };
    const bubu = hList.find((h) => h.id === 'bubu') ?? null;
    if (!bubu || bubu.curHp <= 0) return { heroesNext: hList, mpGained: 0, triggersApplied: 0 };

    const seq = turnSeq;
    const used = (bubu.guardCycleTurnSeq ?? -1) === seq ? Math.max(0, bubu.guardCycleTriggersUsed ?? 0) : 0;
    const left = Math.max(0, def.perTurnCap - used);
    const applyCount = Math.min(triggers, left);
    if (applyCount <= 0) return { heroesNext: hList, mpGained: 0, triggersApplied: 0 };

    const gain = def.mp * applyCount;
    const heroesNext = hList.map((h) =>
      h.id === 'bubu'
        ? {
            ...h,
            curMp: Math.min(MP_MAX, (h.curMp ?? 0) + gain),
            guardCycleTurnSeq: seq,
            guardCycleTriggersUsed: used + applyCount,
          }
        : h
    );
    return { heroesNext, mpGained: gain, triggersApplied: applyCount };
  };

  /** 僅在 endedHeroId 行動結束時扣該員的增益回合（不含其他我方／敵方行動） */
  const tickHeroBuffsOnEndTurn = (hList, endedHeroId) => {
    if (!endedHeroId) return hList;
    return hList.map((h) => {
      if (h.id !== endedHeroId || h.curHp <= 0) return h;
      const prevSpdT = h.spdBuffTurns ?? 0;
      const nextSpdT = Math.max(0, prevSpdT - 1);
      let next = {
        ...h,
        atkBuffTurns: Math.max(0, (h.atkBuffTurns ?? 0) - 1),
        matkBuffTurns: Math.max(0, (h.matkBuffTurns ?? 0) - 1),
        spdBuffTurns: nextSpdT,
        tauntTurns: Math.max(0, (h.tauntTurns ?? 0) - 1),
        critRateBuffTurns: Math.max(0, (h.critRateBuffTurns ?? 0) - 1),
        critDmgBuffTurns: Math.max(0, (h.critDmgBuffTurns ?? 0) - 1),
        defBuffTurns: Math.max(0, (h.defBuffTurns ?? 0) - 1),
        mdefBuffTurns: Math.max(0, (h.mdefBuffTurns ?? 0) - 1),
        jackDrawBuffTurns: Math.max(0, (h.jackDrawBuffTurns ?? 0) - 1),
        skillCritTurns: Math.max(0, (h.skillCritTurns ?? 0) - 1),
        weaknessSeenDmgTurns: Math.max(0, (h.weaknessSeenDmgTurns ?? 0) - 1),
        itemInvertTurns: h.id === 'jack' ? Math.max(0, (h.itemInvertTurns ?? 0) - 1) : (h.itemInvertTurns ?? 0),
        campIncomingDmgMulTurns: Math.max(0, (h.campIncomingDmgMulTurns ?? 0) - 1),
      };
      if ((next.campIncomingDmgMulTurns ?? 0) === 0) next = { ...next, campIncomingDmgMul: 1 };
      if (prevSpdT > 0 && nextSpdT === 0) {
        const oldEff = getEffectiveSpd(h);
        const newEff = getEffectiveSpd(next);
        next = { ...next, av: rescaleAvForSpdChange(h.av, oldEff, newEff) };
      }
      return next;
    });
  };

  const tickMonsterDebuffsOnEndTurn = (mList, endedMonsterId = null) => {
    if (!endedMonsterId) return mList;
    return mList.map((m) => {
      if (m.curHp <= 0 || m.id !== endedMonsterId) return m;
      const oldEff = getEffectiveSpd(m);
      const nextDef = Math.max(0, (m.defDownTurns ?? 0) - 1);
      const nextMdef = Math.max(0, (m.mdefDownTurns ?? 0) - 1);
      const nextAtkT = Math.max(0, (m.atkDownTurns ?? 0) - 1);
      const nextSpdT = Math.max(0, (m.spdDownTurns ?? 0) - 1);
      const nextAtkBuffT = Math.max(0, (m.atkBuffTurns ?? 0) - 1);
      const nextDefBuffT = Math.max(0, (m.defBuffTurns ?? 0) - 1);
      let next = {
        ...m,
        defDownTurns: nextDef,
        mdefDownTurns: nextMdef,
        atkDownTurns: nextAtkT,
        spdDownTurns: nextSpdT,
        atkBuffTurns: nextAtkBuffT,
        atkBuffMul: nextAtkBuffT > 0 ? (m.atkBuffMul ?? 1) : 1,
        defBuffTurns: nextDefBuffT,
        defBuffMul: nextDefBuffT > 0 ? (m.defBuffMul ?? 1) : 1,
      };
      const newEff = getEffectiveSpd(next);
      const av = rescaleAvForSpdChange(m.av, oldEff, newEff);
      return { ...next, av };
    });
  };

  const buildUnitEffects = (u) => {
    if (!u) return [];
    const out = [];

    if (u.isHero) {
      if (u.passive?.name) out.push({ kind: 'passive', label: `被動：${u.passive.name}`, passive: u.passive });
      if (u.status === 'guard') out.push({ kind: 'buff', label: '防禦' });
      if ((u.barrierTurns ?? 0) > 0) out.push({ kind: 'buff', label: `護盾×${u.barrierTurns}` });

      if ((u.atkBuffTurns ?? 0) > 0) {
        const mul = u.atkBuffMul ?? 1;
        const pct = Math.round((mul - 1) * 100);
        out.push({ kind: 'buff', label: `攻擊↑${pct}%（${u.atkBuffTurns}）` });
      }

      if ((u.matkBuffTurns ?? 0) > 0) {
        const mul = u.matkBuffMul ?? 1;
        const pct = Math.round((mul - 1) * 100);
        out.push({ kind: 'buff', label: `魔力↑${pct}%（${u.matkBuffTurns}）` });
      }

      if ((u.spdBuffTurns ?? 0) > 0) {
        const mul = u.spdBuffMul ?? 1;
        const pct = Math.round((mul - 1) * 100);
        out.push({ kind: 'buff', label: `速度↑${pct}%（${u.spdBuffTurns}）` });
      }

      if ((u.critRateBuffTurns ?? 0) > 0) {
        const add = u.critRateBuffAdd ?? 0;
        const pct = Math.round(add * 100);
        out.push({ kind: 'buff', label: `暴擊率↑${pct}%（${u.critRateBuffTurns}）` });
      }
      if ((u.critDmgBuffTurns ?? 0) > 0) {
        const mul = u.critDmgBuffMul ?? 1;
        const pct = Math.round((mul - 1) * 100);
        out.push({ kind: 'buff', label: `暴擊傷害↑${pct}%（${u.critDmgBuffTurns}）` });
      }

      if ((u.captainCritRateAdd ?? 0) > 0) {
        const pct = Math.round((u.captainCritRateAdd ?? 0) * 100);
        out.push({ kind: 'buff', label: `隊長暴擊率 +${pct}%` });
      }
      if ((u.captainDmgVsDazzledMul ?? 1) > 1) {
        const pct = Math.round(((u.captainDmgVsDazzledMul ?? 1) - 1) * 100);
        out.push({ kind: 'buff', label: `隊長：對眩目敵 +${pct}% 傷` });
      }

      if ((u.itemInvertTurns ?? 0) > 0) {
        out.push({ kind: 'buff', label: `道具反轉（${u.itemInvertTurns}）` });
      }

      if ((u.defBuffTurns ?? 0) > 0) {
        const mul = u.defBuffMul ?? 1;
        const pct = Math.round((mul - 1) * 100);
        out.push({ kind: 'buff', label: `物防↑${pct}%（${u.defBuffTurns}）` });
      }
      if ((u.mdefBuffTurns ?? 0) > 0) {
        const mul = u.mdefBuffMul ?? 1;
        const pct = Math.round((mul - 1) * 100);
        out.push({ kind: 'buff', label: `魔抗↑${pct}%（${u.mdefBuffTurns}）` });
      }
      if ((u.jackDrawBuffTurns ?? 0) > 0) {
        out.push({ kind: 'buff', label: `抽牌（${u.jackDrawBuffTurns}）` });
      }
      if ((u.skillCritTurns ?? 0) > 0) {
        out.push({ kind: 'buff', label: `術式爆擊（${u.skillCritTurns}）` });
      }
      if ((u.weaknessSeenDmgTurns ?? 0) > 0 && (u.weaknessSeenDmgMul ?? 1) > 1) {
        const pct = Math.round(((u.weaknessSeenDmgMul ?? 1) - 1) * 100);
        out.push({ kind: 'buff', label: `看破特攻 +${pct}%（${u.weaknessSeenDmgTurns}）` });
      }

      if ((u.tauntTurns ?? 0) > 0) out.push({ kind: 'buff', label: `嘲諷×${u.tauntTurns}` });

      if ((u.incomingDmgMul ?? 1) !== 1) {
        const pct = Math.round((1 - (u.incomingDmgMul ?? 1)) * 100);
        out.push({ kind: 'buff', label: `受傷↓${pct}%` });
      }

      if ((u.regenTurns ?? 0) > 0 && (u.regenHeal ?? 0) > 0) {
        out.push({ kind: 'buff', label: `緩回×${u.regenTurns}（每回合+${u.regenHeal}）` });
      }

      if ((u.burnTurns ?? 0) > 0 && (u.burnStacks ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `燃燒×${u.burnStacks}（${u.burnTurns}）` });
      }
      if ((u.poisonTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `中毒（${u.poisonTurns}）` });
      }
      if ((u.freezeTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `冰凍（${u.freezeTurns}）` });
      }
      if ((u.darknessTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `黑暗（${u.darknessTurns}）` });
      }
      if ((u.dazzleTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `眩目（${u.dazzleTurns}）` });
      }
      if ((u.stunTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `暈眩（${u.stunTurns}）` });
      }
      if ((u.stunImmuneTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `暈眩免疫（${u.stunImmuneTurns}）` });
      }
      if (u.deathMark) {
        out.push({ kind: 'debuff', label: '死亡標記' });
      }
    } else {
      if ((u.atkBuffTurns ?? 0) > 0) {
        const mul = u.atkBuffMul ?? 1;
        const pct = Math.round((mul - 1) * 100);
        out.push({ kind: 'buff', label: `攻擊↑${pct}%（${u.atkBuffTurns}）` });
      }
      if ((u.defBuffTurns ?? 0) > 0) {
        const mul = u.defBuffMul ?? 1;
        const pct = Math.round((mul - 1) * 100);
        out.push({ kind: 'buff', label: `物防↑${pct}%（${u.defBuffTurns}）` });
      }
      if ((u.defDownTurns ?? 0) > 0) {
        const mul = u.defDownMul ?? 1;
        const pct = Math.round((1 - mul) * 100);
        out.push({ kind: 'debuff', label: `物防↓${pct}%（${u.defDownTurns}）` });
      }
      if ((u.mdefDownTurns ?? 0) > 0) {
        const mul = u.mdefDownMul ?? 1;
        const pct = Math.round((1 - mul) * 100);
        out.push({ kind: 'debuff', label: `魔抗↓${pct}%（${u.mdefDownTurns}）` });
      }
      if ((u.atkDownTurns ?? 0) > 0) {
        const mul = u.atkDownMul ?? 1;
        const pct = Math.round((1 - mul) * 100);
        out.push({ kind: 'debuff', label: `攻擊↓${pct}%（${u.atkDownTurns}）` });
      }
      if ((u.spdDownTurns ?? 0) > 0) {
        const mul = u.spdDownMul ?? 1;
        const pct = Math.round((1 - mul) * 100);
        out.push({ kind: 'debuff', label: `速度↓${pct}%（${u.spdDownTurns}）` });
      }
      if (u.weaknessSeen) {
        const w = getWeaknessRevealLabel(u);
        if (w) out.push({ kind: 'debuff', label: `弱點：${w}` });
      }

      if ((u.skillCritTurns ?? 0) > 0) {
        out.push({ kind: 'buff', label: `術式爆擊（${u.skillCritTurns}）` });
      }

      if ((u.burnTurns ?? 0) > 0 && (u.burnStacks ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `燃燒×${u.burnStacks}（${u.burnTurns}）` });
      }
      if ((u.poisonTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `中毒（${u.poisonTurns}）` });
      }
      if ((u.freezeTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `冰凍（${u.freezeTurns}）` });
      }
      if ((u.darknessTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `黑暗（${u.darknessTurns}）` });
      }
      if ((u.dazzleTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `眩目（${u.dazzleTurns}）` });
      }
      if ((u.stunTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `暈眩（${u.stunTurns}）` });
      }
      if ((u.stunImmuneTurns ?? 0) > 0) {
        out.push({ kind: 'debuff', label: `暈眩免疫（${u.stunImmuneTurns}）` });
      }
      if (u.deathMark) {
        out.push({ kind: 'debuff', label: '死亡標記' });
      }
    }

    return out;
  };

  const describePassiveMechanics = (passive) => {
    const e = passive?.effect;
    if (!e?.type) return null;
    if (e.type === 'basicAtkMul') return `戰鬥機制：一般攻擊造成的傷害 ×${e.value ?? 1}（與其他倍率相乘）。`;
    if (e.type === 'turnStartMp') return `戰鬥機制：輪到自己行動時，先獲得 ${e.value ?? 0} MP（上限 100）。`;
    if (e.type === 'guardIncomingMul') return `戰鬥機制：處於防禦且被敵方攻擊命中時，該次傷害再 ×${e.value ?? 1}。`;
    if (e.type === 'debuffTurnsPlus') return `戰鬥機制：我方技能對敵人施加的弱化持續回合 +${e.value ?? 0}。`;
    if (e.type === 'jackDrawSustainMp') {
      return `戰鬥機制：帶有「抽牌」強化（怪盜洗牌）期間，每回合行動開始額外回復 ${e.value ?? 0} MP。`;
    }
    if (e.type === 'dmgVsAilmentedEnemyMul') {
      const pct = Math.round(((e.mul ?? 1) - 1) * 100);
      return `戰鬥機制：對持有異常狀態的敵人造成的傷害提高約 ${pct}%（與其他倍率相乘）。`;
    }
    if (e.type === 'critRateByBuffCount') {
      const per = typeof e.perBuffAdd === 'number' ? e.perBuffAdd : 0;
      const max = typeof e.maxAdd === 'number' ? e.maxAdd : 0;
      return `戰鬥機制：自身擁有的增益越多，爆擊率越高（每個增益 +${Math.round(per * 100)}%，最多 +${Math.round(max * 100)}%）。`;
    }
    if (e.type === 'selfCritDmgMul') {
      const pct = Math.round(((e.value ?? 1) - 1) * 100);
      return `戰鬥機制：暴擊時傷害倍率額外提高約 ${pct}%（與暴擊傷害 Buff 相乘）。`;
    }
    if (e.type === 'healGivesBarrier') {
      const pct = Math.round((1 - (e.incomingMul ?? 1)) * 100);
      return `戰鬥機制：治療隊友成功後，目標獲得護盾（約 ${pct}% 減傷，${e.turns ?? 1} 次）。`;
    }
    return `戰鬥機制：效果類型「${e.type}」。`;
  };

  const renderEffectChip = (e, idx) => {
    const baseClass = `px-2 py-1 rounded-full text-[8px] font-black tracking-wide border ${
      e.kind === 'debuff'
        ? 'bg-red-950/40 text-red-200 border-red-500/25'
        : e.kind === 'passive'
          ? 'bg-slate-900/60 text-slate-300 border-white/10'
          : 'bg-emerald-950/35 text-emerald-200 border-emerald-500/20'
    }`;

    if (e.kind === 'passive' && e.passive?.name) {
      return (
        <span
          key={`${e.label}-${idx}`}
          role="button"
          tabIndex={0}
          title="長按或右鍵查看詳細"
          className={`${baseClass} cursor-help select-none touch-manipulation active:scale-[0.98]`}
          onPointerDown={() => {
            passiveLongPressFiredRef.current = false;
            if (passiveLongPressTimerRef.current) clearTimeout(passiveLongPressTimerRef.current);
            passiveLongPressTimerRef.current = setTimeout(() => {
              passiveLongPressFiredRef.current = true;
              setPassiveInfo({
                name: e.passive.name,
                description: e.passive.description ?? '',
                mechanics: describePassiveMechanics(e.passive),
              });
            }, 450);
          }}
          onPointerUp={() => {
            if (passiveLongPressTimerRef.current) clearTimeout(passiveLongPressTimerRef.current);
          }}
          onPointerCancel={() => {
            if (passiveLongPressTimerRef.current) clearTimeout(passiveLongPressTimerRef.current);
          }}
          onContextMenu={(ev) => {
            ev.preventDefault();
            setPassiveInfo({
              name: e.passive.name,
              description: e.passive.description ?? '',
              mechanics: describePassiveMechanics(e.passive),
            });
          }}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              setPassiveInfo({
                name: e.passive.name,
                description: e.passive.description ?? '',
                mechanics: describePassiveMechanics(e.passive),
              });
            }
          }}
        >
          {e.label}
        </span>
      );
    }

    return (
      <span key={`${e.label}-${idx}`} className={baseClass}>
        {e.label}
      </span>
    );
  };

  const describeSkillEffect = (skill, opts = null) => {
    const e = skill?.effect;
    if (!e) return '（無效果資料）';
    const masteryPct = Math.max(0, Math.floor(Number(opts?.masteryPct) || 0));
    const pctOf = (mul) => `${Math.round((mul ?? 1) * 100)}%`;
    const scale = skill?.scale ?? 'matk';
    const scaleBadge =
      scale === 'atk' ? (
        <span className="inline-flex items-center gap-1 font-black text-amber-200">
          <Sword size={12} className="text-amber-300" /> 物攻
        </span>
      ) : scale === 'mix' ? (
        <span className="inline-flex items-center gap-1 font-black text-slate-200">
          <Sword size={12} className="text-amber-300" /> + <Sparkles size={12} className="text-violet-300" /> 混合
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 font-black text-violet-200">
          <Sparkles size={12} className="text-violet-300" /> 魔攻
        </span>
      );

    if (e.type === 'damage') {
      const mul = e.powerMul ?? 1;
      const splashMul = typeof e.splash?.powerMul === 'number' ? e.splash.powerMul : null;
      const hasSplash = splashMul != null;
      const dmgLabel =
        e.target === 'enemy-all' ? '敵方全體傷害：' : hasSplash ? '敵方單體主目標：' : '敵方單體傷害：';
      const ail = e.ailment ?? null;
      const ailBadge =
        ail?.type === 'poison' ? (
          <span className="inline-flex items-center gap-1 text-emerald-200 font-black">
            ＋中毒（{ail.turns ?? 3} 回合{typeof ail.chance === 'number' ? `，${Math.round(ail.chance * 100)}%` : ''}）
          </span>
        ) : ail?.type === 'burn' ? (
          <span className="inline-flex items-center gap-1 text-orange-200 font-black">
            ＋燃燒×{ail.stacks ?? 1}{typeof ail.chance === 'number' ? `（${Math.round(ail.chance * 100)}%）` : ''}
          </span>
        ) : ail?.type === 'darkness' ? (
          <span className="inline-flex items-center gap-1 text-slate-200 font-black">
            ＋黑暗（{ail.turns ?? 2} 回合{typeof ail.chance === 'number' ? `，${Math.round(ail.chance * 100)}%` : ''}）
          </span>
        ) : ail?.type === 'stun' ? (
          <span className="inline-flex items-center gap-1 text-amber-200 font-black">
            ＋暈眩（{ail.turns ?? 1} 回合{typeof ail.chance === 'number' ? `，${Math.round(ail.chance * 100)}%` : ''}）
          </span>
        ) : null;
      const deb = e.debuff;
      const debuffBadge =
        deb?.stat === 'atk' && typeof deb.mul === 'number' ? (
          <span className="inline-flex items-center gap-1">
            <span className="text-slate-400">＋</span>
            <span className="font-black text-red-200 tabular-nums">降攻{Math.round((1 - deb.mul) * 100)}%</span>
            <span className="text-slate-400">（{deb.turns ?? 1} 回合）</span>
            {deb.target === 'enemy-all' ? <span className="text-slate-500 font-black">全體</span> : null}
          </span>
        ) : deb?.stat === 'def' && typeof deb.mul === 'number' ? (
          <span className="inline-flex items-center gap-1">
            <span className="text-slate-400">＋</span>
            <span className="font-black text-red-200 tabular-nums">降物防{Math.round((1 - deb.mul) * 100)}%</span>
            <span className="text-slate-400">（{deb.turns ?? 1} 回合）</span>
          </span>
        ) : null;
      const selfOnBadge =
        e.selfOnHit?.critRateMid != null ? (
          <span className="inline-flex items-center gap-1 text-amber-200 font-black">
            ＋自身爆擊率提升（中・{e.selfOnHit.critRateMid.turns ?? 3} 回合）
          </span>
        ) : e.selfOnHit?.critDmgSmall != null ? (
          <span className="inline-flex items-center gap-1 text-amber-200 font-black">
            ＋自身暴擊傷害提升（小・{e.selfOnHit.critDmgSmall.turns ?? 2} 回合）
          </span>
        ) : typeof e.selfOnHit?.itemInvertTurns === 'number' && e.selfOnHit.itemInvertTurns > 0 ? (
          <span className="inline-flex items-center gap-1 text-amber-200 font-black">
            ＋自身道具反轉（{e.selfOnHit.itemInvertTurns} 回合）
          </span>
        ) : null;
      const splashBadge =
        splashMul != null ? (
          <span className="inline-flex items-center gap-1 text-orange-200 font-black">
            ＋鄰位濺射 {pctOf(splashMul)} {scaleBadge}
          </span>
        ) : null;
      const dazzleAllBadge =
        e.dazzleAll && typeof e.dazzleAll.turns === 'number' ? (
          <span className="inline-flex items-center gap-1 text-amber-200 font-black">
            ＋敵方全體眩目（{e.dazzleAll.turns} 回合）
          </span>
        ) : null;
      const extraBadges = [splashBadge, debuffBadge, dazzleAllBadge, ailBadge, selfOnBadge].filter(Boolean);
      return (
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-x-1.5 whitespace-nowrap">
            <span>{dmgLabel}</span>
            <span className="font-black text-cyan-200 tabular-nums">{pctOf(mul)}</span>
            {masteryPct > 0 ? <span className="font-black text-amber-200/90 tabular-nums">+ {masteryPct}%</span> : null}
            {scaleBadge}
          </div>
          {extraBadges.length ? (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">{extraBadges}</div>
          ) : null}
        </div>
      );
    }
    if (e.type === 'heal') {
      const mul = e.powerMul ?? 1;
      return (
        <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap">
          <span>治療我方單體：</span>
          <span className="font-black text-cyan-200 tabular-nums">{pctOf(mul)}</span>
          {masteryPct > 0 ? <span className="font-black text-amber-200/90 tabular-nums">+ {masteryPct}%</span> : null}
          {scaleBadge}
        </span>
      );
    }
    if (e.type === 'barrier') {
      const pct = Math.round((1 - (e.incomingMul ?? 1)) * 100);
      return `我方全體護盾（減傷 ${pct}% · ${e.turns ?? 1} 次）`;
    }
    if (e.type === 'buff' && e.stat === 'atk') {
      const pct = Math.round(((e.mul ?? 1) - 1) * 100);
      return `我方全體攻擊提升 +${pct}%（${e.turns ?? 1} 回合）`;
    }
    if (e.type === 'buff' && e.stat === 'atk+matk' && e.target === 'ally-single') {
      const pct = Math.round(((e.mul ?? 1) - 1) * 100);
      return `我方單體 攻擊／魔力提升（中） +${pct}%（${e.turns ?? 1} 回合）`;
    }
    if (e.type === 'buff' && e.stat === 'atk+matk') {
      const pct = Math.round(((e.mul ?? 1) - 1) * 100);
      return `我方全體攻擊/魔力提升 +${pct}%（${e.turns ?? 1} 回合）`;
    }
    if (e.type === 'buff' && e.stat === 'matk' && e.target === 'ally-all') {
      const pct = Math.round(((e.mul ?? 1) - 1) * 100);
      return `我方全體魔力提升 +${pct}%（${e.turns ?? 1} 回合）`;
    }
    if (e.type === 'buff' && e.stat === 'spd' && e.target === 'ally-all') {
      const pct = Math.round(((e.mul ?? 1) - 1) * 100);
      return `我方全體速度提升 +${pct}%（${e.turns ?? 1} 回合）`;
    }
    if (e.type === 'debuff' && e.stat === 'def+mdef') {
      const pct = Math.round((1 - (e.mul ?? 1)) * 100);
      const dmg =
        typeof e.damageMul === 'number' ? (
          <span className="inline-flex items-center gap-1">
            ，並造成 <span className="font-black text-cyan-200 tabular-nums">{pctOf(e.damageMul)}</span>
            {scaleBadge} 傷害
          </span>
        ) : null;
      return (
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span>敵方單體雙防降低</span>
          <span className="font-black text-red-200 tabular-nums">{pct}%</span>
          <span>（{e.turns ?? 1} 回合）</span>
          {dmg}
        </span>
      );
    }
    if (e.type === 'debuff' && e.stat === 'spd' && e.target === 'enemy-all') {
      const pct = Math.round((1 - (e.mul ?? 1)) * 100);
      return `敵方全體速度降低 ${pct}%（${e.turns ?? 1} 回合）`;
    }
    if (e.type === 'debuff' && e.stat === 'spd' && e.target === 'enemy-single') {
      const pct = Math.round((1 - (e.mul ?? 1)) * 100);
      const ail = e.ailment ?? null;
      const ailText = ail?.type === 'darkness' ? `，並附加黑暗（${ail.turns ?? 2} 回合）` : '';
      return `敵方單體速度降低 ${pct}%（${e.turns ?? 1} 回合）${ailText}`;
    }
    if (e.type === 'regen') {
      const mul = e.powerMul ?? 0.2;
      return (
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span>我方全體緩回：</span>
          <span className="font-black text-cyan-200 tabular-nums">{pctOf(mul)}</span>
          <span className="inline-flex items-center gap-1 font-black text-violet-200">
            <Sparkles size={12} className="text-violet-300" /> 魔攻
          </span>
          <span>（{e.turns ?? 1} 回合）</span>
        </span>
      );
    }
    if (e.type === 'cleanseOne' && e.target === 'ally-all') {
      return '我方全體：各清除 1 個負面狀態（減益優先；無減益時清除嘲諷）';
    }
    if (e.type === 'taunt') {
      return `嘲諷（${e.turns ?? 3} 回合）`;
    }
    if (e.type === 'observeCheer') {
      const ally = e.ally ?? {};
      const pct = Math.round(((ally.mul ?? 1.08) - 1) * 100);
      return `敵方全體看破（永久顯示弱點）；我方全體攻擊／魔力提升（小）+${pct}%（${ally.turns ?? 3} 回合）`;
    }
    if (e.type === 'jackPhantomDrawAll') {
      const pct = Math.round(((e.mul ?? 1.12) - 1) * 100);
      return `怪盜式發牌：我方全體各隨機獲得攻／防／魔力／魔抗其中一項 +${pct}%（${e.turns ?? 3} 回合，同次不重複）`;
    }
    if (e.type === 'halloweenTrickOrTreat') {
      return `敵方全體：隨機獲得燃燒或中毒（${e.enemyTurns ?? 2} 回合）；我方全體：隨機獲得爆擊率或爆擊傷害提升（${e.allyTurns ?? 2} 回合）。`;
    }
    if (e.type === 'deathMark') {
      return '賦予敵方單體「死亡標記」：該目標死亡時，對其陣營的隨機友軍造成其最大 HP 20% 的傷害。';
    }
    if (e.type === 'skillCritBuff') {
      return `我方單體：獲得「術式爆擊」（魔攻／複合技能可爆擊，${e.turns ?? 2} 回合）`;
    }
    if (e.type === 'sunflowerShot') {
      return `可選擇敵人或隊友：對敵造成 ${pctOf(e.dmgPowerMul ?? 1)} 傷害；對友治療 ${pctOf(e.healPowerMul ?? 1)}。`;
    }
    return `效果：${e.type}`;
  };

  const castBarrierAll = async (skill) => {
    if (!activeUnit?.isHero) return;
    unlockAudio();
    SFX.skill();
    const def = getBarrierDef(skill);
    if (!def) return;
    const plus = getBarrierTurnsPlusFromTalents({ talentMap, casterHeroId: activeUnit.id, skillId: skill.id });
    const def2 = { ...def, turns: Math.max(1, (def.turns ?? 1) + plus) };
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    setIsProcessing(true);
    const newH0 = heroes.map((h) =>
      h.curHp > 0 ? { ...h, barrierTurns: def2.turns, barrierMul: def2.incomingMul, barrierSource: skill.id } : h
    );
    setHeroes(newH0);
    setLogs([`${activeUnit.name} 施放「${skill.name}」：全隊獲得護盾（${Math.round((1 - def2.incomingMul) * 100)}%減傷，${def2.turns}次）`, ...logs].slice(0, 5));
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters, activeUnit.id);
  };

  const castBuffAtkAll = async (skill) => {
    if (!activeUnit?.isHero) return;
    unlockAudio();
    SFX.skill();
    const baseDef = getBuffAllDef(skill);
    if (!baseDef) return;
    const turnsBonus = getBuffTurnsBonusFromTalents(talentMap, activeUnit.id);
    const def = { ...baseDef, turns: Math.max(1, (baseDef.turns ?? 1) + turnsBonus) };
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    setIsProcessing(true);
    let newH0 = heroes.map((h) => {
      if (h.curHp <= 0) return h;
      if (def.kind === 'spd') {
        const oldEff = getEffectiveSpd(h);
        const next = { ...h, spdBuffTurns: def.turns, spdBuffMul: def.mulSpd };
        const newEff = getEffectiveSpd(next);
        return { ...next, av: rescaleAvForSpdChange(h.av, oldEff, newEff) };
      }
      if (def.kind === 'matk') {
        return { ...h, matkBuffTurns: def.turns, matkBuffMul: def.mulMatk };
      }
      return {
        ...h,
        atkBuffTurns: def.turns,
        atkBuffMul: def.mulAtk,
        matkBuffTurns: def.mulMatk !== 1 ? def.turns : (h.matkBuffTurns ?? 0),
        matkBuffMul: def.mulMatk !== 1 ? def.mulMatk : (h.matkBuffMul ?? 1),
      };
    });
    const jackGiftMpAll = activeUnit.id === 'jack' ? getAllyMpOnBuffFromSelfFromTalents(talentMap, 'jack') : 0;
    if (jackGiftMpAll > 0) {
      newH0 = newH0.map((h) =>
        h.curHp > 0 && h.id !== 'jack' ? { ...h, curMp: Math.min(MP_MAX, (h.curMp ?? 0) + jackGiftMpAll) } : h
      );
    }
    setHeroes(newH0);
    if (def.kind === 'spd') {
      const spdPct = Math.round((def.mulSpd - 1) * 100);
      setLogs([`${activeUnit.name} 施放「${skill.name}」：全隊速度提升（${spdPct}%），${def.turns} 回合`, ...logs].slice(0, 5));
    } else if (def.kind === 'matk') {
      const matkPct = Math.round((def.mulMatk - 1) * 100);
      setLogs([`${activeUnit.name} 施放「${skill.name}」：全隊魔力提升（${matkPct}%），${def.turns} 回合`, ...logs].slice(0, 5));
    } else {
      const atkPct = Math.round((def.mulAtk - 1) * 100);
      const matkPct = Math.round((def.mulMatk - 1) * 100);
      const extra = def.mulMatk !== 1 ? `，魔力提升（${matkPct}%）` : '';
      setLogs([`${activeUnit.name} 施放「${skill.name}」：全隊攻擊提升（${atkPct}%）${extra}，${def.turns}回合`, ...logs].slice(0, 5));
    }
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters, activeUnit.id);
  };

  const castObserveCheer = async (skill) => {
    if (!activeUnit?.isHero) return;
    const eff = skill?.effect;
    if (!eff || eff.type !== 'observeCheer') return;
    unlockAudio();
    SFX.skill();
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }
    const fakeBuffSkill = {
      effect: {
        type: 'buff',
        target: 'ally-all',
        stat: eff.ally?.stat ?? 'atk+matk',
        mul: eff.ally?.mul ?? 1.08,
        turns: (eff.ally?.turns ?? 3) + getBuffTurnsBonusFromTalents(talentMap, activeUnit.id),
      },
    };
    const def = getBuffAllDef(fakeBuffSkill);
    if (!def) return;

    setIsProcessing(true);
    const newM = monsters.map((m) => (m.curHp > 0 ? { ...m, weaknessSeen: true } : m));
    setMonsters(newM);

    const newH0 = heroes.map((h) => {
      if (h.curHp <= 0) return h;
      return {
        ...h,
        atkBuffTurns: def.turns,
        atkBuffMul: def.mulAtk,
        matkBuffTurns: def.mulMatk !== 1 ? def.turns : (h.matkBuffTurns ?? 0),
        matkBuffMul: def.mulMatk !== 1 ? def.mulMatk : (h.matkBuffMul ?? 1),
      };
    });
    setHeroes(newH0);

    const atkPct = Math.round((def.mulAtk - 1) * 100);
    const matkPct = Math.round((def.mulMatk - 1) * 100);
    setLogs(
      [
        `${activeUnit.name} 施放「${skill.name}」：敵方全體看破（永久弱點），我方攻／魔提升（小・攻+${atkPct}%／魔+${matkPct}%，${def.turns} 回合）`,
        ...logs,
      ].slice(0, 5)
    );
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, newM, activeUnit.id);
  };

  const castJackPhantomDrawAll = async (skill) => {
    if (!activeUnit?.isHero || activeUnit.id !== 'jack') return;
    const eff = skill?.effect;
    if (!eff || eff.type !== 'jackPhantomDrawAll') return;
    unlockAudio();
    SFX.skill();
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }
    const baseTurns = Math.max(1, eff.turns ?? 3);
    const turns = baseTurns + getBuffTurnsBonusFromTalents(talentMap, activeUnit.id);
    const mul = typeof eff.mul === 'number' ? eff.mul : 1.12;
    const deck = ['atk', 'def', 'matk', 'mdef'];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = deck[i];
      deck[i] = deck[j];
      deck[j] = t;
    }
    const aliveOrder = heroes.filter((h) => h.curHp > 0);
    const kindById = {};
    const logParts = [];
    const label = { atk: '攻擊', def: '防禦', matk: '魔力', mdef: '魔抗' };
    aliveOrder.forEach((h, idx) => {
      const kind = idx < 4 ? deck[idx] : deck[Math.floor(Math.random() * 4)];
      kindById[h.id] = kind;
      logParts.push(`${h.name}：${label[kind] ?? kind}↑`);
    });

    setIsProcessing(true);
    let newH0 = heroes.map((h) => {
      if (h.curHp <= 0) return h;
      const kind = kindById[h.id];
      if (!kind) return h;
      const basePatch = { jackDrawBuffTurns: turns };
      if (kind === 'atk') return { ...h, ...basePatch, atkBuffTurns: turns, atkBuffMul: mul };
      if (kind === 'matk') return { ...h, ...basePatch, matkBuffTurns: turns, matkBuffMul: mul };
      if (kind === 'def') return { ...h, ...basePatch, defBuffTurns: turns, defBuffMul: mul };
      return { ...h, ...basePatch, mdefBuffTurns: turns, mdefBuffMul: mul };
    });
    const jackGiftMpDraw = getAllyMpOnBuffFromSelfFromTalents(talentMap, 'jack');
    if (jackGiftMpDraw > 0) {
      newH0 = newH0.map((h) =>
        h.curHp > 0 && h.id !== 'jack' ? { ...h, curMp: Math.min(MP_MAX, (h.curMp ?? 0) + jackGiftMpDraw) } : h
      );
    }
    setHeroes(newH0);
    const pct = Math.round((mul - 1) * 100);
    setLogs(
      [
        `${activeUnit.name} 施放「${skill.name}」：我方全體各獲得一項隨機強化（攻／防／魔／魔抗 +${pct}%，${turns} 回合，同次不重複）——${logParts.join('；')}`,
        ...logs,
      ].slice(0, 5)
    );
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters, activeUnit.id);
  };

  const castHalloweenTrickOrTreat = async (skill) => {
    if (!activeUnit?.isHero) return;
    const eff = skill?.effect;
    if (!eff || eff.type !== 'halloweenTrickOrTreat') return;
    unlockAudio();
    SFX.skill();
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }
    const enemyTurns = Math.max(1, Math.floor(Number(eff.enemyTurns) || 2));
    const allyTurns = Math.max(1, Math.floor(Number(eff.allyTurns) || 2));

    setIsProcessing(true);
    const doubleDot = activeUnit.id === 'butiya_halloween' && hasDoubleDotFromSelfTalent(talentMap, 'butiya_halloween');
    const newM0 = monsters.map((m) => {
      if (m.curHp <= 0) return m;
      const roll = Math.random() < 0.5 ? 'burn' : 'poison';
      if (roll === 'burn') {
        const next = applyBurnOnTarget(m, 1);
        return { ...next, burnTurns: Math.max(next.burnTurns ?? 0, enemyTurns), burnDmgMul: doubleDot ? 2 : (next.burnDmgMul ?? 1) };
      }
      const next = applyPoisonOnTarget(m, enemyTurns);
      return { ...next, poisonDmgMul: doubleDot ? 2 : (next.poisonDmgMul ?? 1) };
    });
    const newM = applyLavaCoreDeathBonusStrip(newM0);
    setMonsters(newM);

    const newH0 = heroes.map((h) => {
      if (h.curHp <= 0) return h;
      const roll = Math.random() < 0.5 ? 'critRate' : 'critDmg';
      if (roll === 'critRate') return { ...h, critRateBuffTurns: allyTurns, critRateBuffAdd: CRIT_RATE_MID_ADD };
      return { ...h, critDmgBuffTurns: allyTurns, critDmgBuffMul: CRIT_DMG_SMALL_MUL };
    });
    setHeroes(newH0);

    setLogs([`${activeUnit.name} 施放「${skill.name}」：敵方全體隨機獲得 燃燒/中毒（${enemyTurns} 回合），我方全體隨機獲得 爆擊率/爆擊傷害提升（${allyTurns} 回合）`, ...logs].slice(0, 5));
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    if (newM.every((m) => m.curHp <= 0)) grantVictory(newM);
    else advanceTurn(newH, newM, activeUnit.id);
  };

  const castTauntSelf = async (skill) => {
    if (!activeUnit?.isHero) return;
    const turns = Math.max(1, skill?.effect?.turns ?? 3);
    const selfRegen = skill?.effect?.selfRegen ?? null;
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }
    unlockAudio();
    SFX.skill();
    setIsProcessing(true);
    let newH0 = heroes.map((h) => (h.id === activeUnit.id && h.curHp > 0 ? { ...h, tauntTurns: turns } : h));
    if (selfRegen && typeof selfRegen === 'object') {
      const rTurns = Math.max(1, Math.floor(Number(selfRegen.turns) || 1));
      const healPer = resolveRegenHealPerTick(activeUnit, { powerMul: selfRegen.powerMul ?? 0.2 });
      newH0 = newH0.map((h) =>
        h.id === activeUnit.id && h.curHp > 0
          ? { ...h, regenTurns: Math.max(h.regenTurns ?? 0, rTurns), regenHeal: Math.max(h.regenHeal ?? 0, healPer) }
          : h
      );
    }
    setHeroes(newH0);
    setLogs([`${activeUnit.name} 施放「${skill.name}」：嘲諷 ${turns} 回合${selfRegen ? '，並獲得緩回' : ''}`, ...logs].slice(0, 5));
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters, activeUnit.id);
  };

  const castRegenAll = async (skill) => {
    if (!activeUnit?.isHero) return;
    unlockAudio();
    SFX.skill();
    const def = getRegenAllDef(skill);
    if (!def) return;
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    const healPer = resolveRegenHealPerTick(activeUnit, { powerMul: def.powerMul });
    setIsProcessing(true);
    const newH0 = heroes.map((h) =>
      h.curHp > 0 ? { ...h, regenTurns: def.turns, regenHeal: healPer } : h
    );
    setHeroes(newH0);
    setLogs(
      [
        `${activeUnit.name} 施放「${skill.name}」：全隊獲得緩回（${def.turns} 回合，每回合行動開始 +${healPer} HP）`,
        ...logs,
      ].slice(0, 5)
    );
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters, activeUnit.id);
  };

  /** 每位英雄清除一個負面（減益優先；無減益時才清除嘲諷） */
  const clearOneNegativeFromHero = (h) => {
    if (!h || h.curHp <= 0) return { next: h, cleared: null };
    let next = { ...h };
    let cleared = null;
    const clearIf = (cond, patch, label) => {
      if (cleared || !cond) return;
      next = { ...next, ...patch };
      cleared = label;
    };
    clearIf((next.defDownTurns ?? 0) > 0, { defDownTurns: 0, defDownMul: 1 }, '物防↓');
    clearIf((next.mdefDownTurns ?? 0) > 0, { mdefDownTurns: 0, mdefDownMul: 1 }, '魔抗↓');
    clearIf((next.atkDownTurns ?? 0) > 0, { atkDownTurns: 0, atkDownMul: 1 }, '攻擊↓');
    clearIf((next.spdDownTurns ?? 0) > 0, { spdDownTurns: 0, spdDownMul: 1 }, '速度↓');
    clearIf((next.poisonTurns ?? 0) > 0, { poisonTurns: 0 }, '中毒');
    clearIf((next.burnTurns ?? 0) > 0 || (next.burnStacks ?? 0) > 0, { burnTurns: 0, burnStacks: 0 }, '燃燒');
    clearIf((next.freezeTurns ?? 0) > 0, { freezeTurns: 0 }, '冰凍');
    clearIf((next.stunTurns ?? 0) > 0, { stunTurns: 0 }, '暈眩');
    clearIf((next.darknessTurns ?? 0) > 0, { darknessTurns: 0 }, '黑暗');
    clearIf((next.dazzleTurns ?? 0) > 0, { dazzleTurns: 0 }, '眩目');
    clearIf((next.tauntTurns ?? 0) > 0, { tauntTurns: 0 }, '嘲諷');
    return { next, cleared };
  };

  const castCleanseOneAll = async (skill) => {
    if (!activeUnit?.isHero) return;
    const eff = skill?.effect;
    if (!eff || eff.type !== 'cleanseOne' || eff.target !== 'ally-all') return;
    unlockAudio();
    SFX.skill();
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    setIsProcessing(true);
    const parts = [];
    const newH0 = heroes.map((h) => {
      if (h.curHp <= 0) return h;
      const oldEff = getEffectiveSpd(h);
      const { next, cleared } = clearOneNegativeFromHero(h);
      const newEff = getEffectiveSpd(next);
      const patched = oldEff !== newEff ? { ...next, av: rescaleAvForSpdChange(h.av, oldEff, newEff) } : next;
      parts.push(`${h.name}：${cleared ?? '（無）'}`);
      return patched;
    });
    setHeroes(newH0);
    setLogs([`${activeUnit.name} 施放「${skill.name}」：${parts.join('；')}`, ...logs].slice(0, 5));
    const newH = endHeroAction(newH0, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters, activeUnit.id);
  };

  const castSlowAllEnemies = async (skill) => {
    if (!activeUnit?.isHero) return;
    unlockAudio();
    SFX.skill();
    const def = getSlowAllDef(skill);
    if (!def) return;
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    const extraTurns = activeUnit?.passive?.effect?.type === 'debuffTurnsPlus' ? (activeUnit.passive.effect.value ?? 0) : 0;
    const turns = def.turns + extraTurns;

    setIsProcessing(true);
    const newM = monsters.map((m) => {
      if (m.curHp <= 0) return m;
      const oldEff = getEffectiveSpd(m);
      const next = { ...m, spdDownTurns: turns, spdDownMul: def.mul };
      const newEff = getEffectiveSpd(next);
      const av = rescaleAvForSpdChange(m.av, oldEff, newEff);
      return { ...next, av };
    });
    setMonsters(newM);
    const pct = Math.round((1 - def.mul) * 100);
    setLogs(
      [
        `${activeUnit.name} 施放「${skill.name}」：敵方全體速度降低 ${pct}%（${turns} 回合）`,
        ...logs,
      ].slice(0, 5)
    );
    const newH = endHeroAction(heroes, { mpCost });
    await new Promise((r) => setTimeout(r, 600));
    if (newM.every((m) => m.curHp <= 0)) grantVictory(newM);
    else advanceTurn(newH, newM, activeUnit.id);
  };

  const castDamageAllEnemies = async (skill) => {
    if (!activeUnit?.isHero) return;
    unlockAudio();
    SFX.skill();
    const effect = skill?.effect;
    if (!effect || effect.type !== 'damage' || effect.target !== 'enemy-all') return;
    const mpCost = getSkillMpCostForCaster(skill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${skill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    setIsProcessing(true);
    const alive = monsters.filter((m) => m.curHp > 0);
    const masteryMul = activeUnit?.id && skill?.id ? getSkillPowerMulFromMastery(skillMasteryMap, activeUnit.id, skill.id) : 1;
    const hits = alive.map((m) => {
      const r = resolveSkillDamage({ caster: activeUnit, target: m, skill, getDamage, powerMulOverride: masteryMul });
      return { id: m.id, dmg: r.damage, crit: r.crit };
    });
    const onHitAilment = effect?.ailment ?? null;
    const debuff = effect?.debuff;
    const extraTurns = activeUnit?.passive?.effect?.type === 'debuffTurnsPlus' ? (activeUnit.passive.effect.value ?? 0) : 0;
    const applyAtkDown = !!debuff && debuff.stat === 'atk' && debuff.target === 'enemy-all' && typeof debuff.mul === 'number';
    const atkDownTurns = applyAtkDown ? Math.max(1, (debuff.turns ?? 1) + extraTurns) : 0;
    const atkDownMul = applyAtkDown ? debuff.mul : 1;
    const talentMdefDown =
      activeUnit?.id && skill?.id
        ? getSkillOnHitMdefDownAllFromTalents({ talentMap, casterHeroId: activeUnit.id, skillId: skill.id })
        : null;

    const dazzleAll = effect?.dazzleAll;
    const dazzleTurnsAll =
      dazzleAll && typeof dazzleAll.turns === 'number'
        ? Math.max(1, dazzleAll.turns + (activeUnit?.passive?.effect?.type === 'debuffTurnsPlus' ? (activeUnit.passive.effect.value ?? 0) : 0))
        : 0;

    const newM0 = monsters.map((m) => {
      const h = hits.find((x) => x.id === m.id);
      if (!h) return m;
      let u = {
        ...m,
        curHp: Math.max(0, m.curHp - h.dmg),
        ...(applyAtkDown ? { atkDownTurns, atkDownMul } : {}),
        ...(talentMdefDown ? { mdefDownTurns: talentMdefDown.turns, mdefDownMul: talentMdefDown.mul } : {}),
      };
      if (onHitAilment && u.curHp > 0) {
        const chanceAdd =
          onHitAilment.type && skill?.id
            ? getSkillAilmentChanceAddFromTalents({
                talentMap,
                casterHeroId: activeUnit.id,
                skillId: skill.id,
                ailmentType: onHitAilment.type,
              })
            : 0;
        const chanceBase = typeof onHitAilment.chance === 'number' ? onHitAilment.chance : null;
        const affixHit = typeof activeUnit?.affixCcHitAdd === 'number' ? activeUnit.affixCcHitAdd : 0;
        const affixRes = typeof u?.affixAilResistAdd === 'number' ? u.affixAilResistAdd : 0;
        const chance = chanceBase == null ? null : Math.max(0, Math.min(1, chanceBase + chanceAdd + affixHit - affixRes));
        const ok = chance == null ? true : Math.random() < chance;
        if (ok) {
          if (onHitAilment.type === 'poison') u = applyPoisonOnTarget(u, onHitAilment.turns);
          else if (onHitAilment.type === 'burn') u = applyBurnOnTarget(u, onHitAilment.stacks);
          else if (onHitAilment.type === 'darkness') u = applyDarknessOnTarget(u, onHitAilment.turns);
          else if (onHitAilment.type === 'stun') u = applyStunOnTarget(u, onHitAilment.turns);
        }
      }
      if (dazzleTurnsAll > 0 && u.curHp > 0) u = applyDazzleOnTarget(u, dazzleTurnsAll);
      return u;
    });

    // 傑克專屬：暴擊竊取隨機增益（全體技：取第一個暴擊目標，竊取一次）
    if (activeUnit?.isHero && activeUnit.id === 'jack' && canCritStealRandomBuffFromEnemyFromTalents(talentMap, 'jack')) {
      const critHit = hits.find((h) => h.crit);
      if (critHit?.id) {
        const res = stealRandomBuffFromMonsterToHero({ heroId: 'jack', monsterId: critHit.id, monstersList: newM0 });
        if (res.ok) {
          setHeroes(res.heroesNext);
          // overwrite monster list before strip
          for (let i = 0; i < newM0.length; i += 1) {
            newM0[i] = res.monstersNext[i];
          }
          setLogs([`掠光竊印：竊取敵方「${res.stolen}」增益`, ...logs].slice(0, 5));
        }
      }
    }
    const coreWasAlive = monsters.some((m) => isLavaCoreTemplateId(monsterTemplateId(m.id)) && m.curHp > 0);
    const coreNowDead = !newM0.some((m) => isLavaCoreTemplateId(monsterTemplateId(m.id)) && m.curHp > 0);
    const newM = applyLavaCoreDeathBonusStrip(newM0);
    const shellCracked = coreWasAlive && coreNowDead;
    setMonsters(newM);
    const total = hits.reduce((s, x) => s + x.dmg, 0);
    const anyCrit = hits.some((x) => x.crit);
    const critNote = anyCrit ? '（含暴擊）' : '';
    const debLine = applyAtkDown ? `，並降低攻擊 ${Math.round((1 - atkDownMul) * 100)}%（${atkDownTurns} 回合）` : '';
    const dazzleLine = dazzleTurnsAll > 0 ? `，敵方全體眩目（${dazzleTurnsAll} 回合）` : '';
    setLogs(
      [
        ...(shellCracked ? ['熔岩核心的加護潰散：熔岩巨人的額外體魄被剝離！'] : []),
        `${activeUnit.name} 施放「${skill.name}」：全體造成總計 ${total} 傷害${critNote}${debLine}${dazzleLine}`,
        ...logs,
      ].slice(0, 5),
    );
    const newH = endHeroAction(heroes, { mpCost });
    if (activeUnit?.id && skill?.id) {
      setSkillMasteryMap((prev) => incSkillUses(prev, activeUnit.id, skill.id, 1));
      setDailyQ((s) => {
        const qid = 'skill_casts';
        if (!s?.picked?.includes(qid)) return s;
        const def = DAILY_QUEST_DEFS[qid];
        const now = loadDailyQuestsState();
        if (now.date !== s.date) return now;
        const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
        return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + 1) } };
      });
    }
    await new Promise((r) => setTimeout(r, 600));
    if (newM.every((m) => m.curHp <= 0)) grantVictory(newM);
    else advanceTurn(newH, newM, activeUnit.id);
  };

  const onHeroTargetSelect = async (hId) => {
    if ((targetMode !== 'skill-ally' && targetMode !== 'skill-flex') || isProcessing || !activeUnit?.isHero || !pickedSkill) return;
    unlockAudio();
    SFX.skill();
    const t = getSkillTargeting(pickedSkill);
    if (t.side !== 'ally' && t.side !== 'both') return;

    const target = heroes.find((h) => h.id === hId);
    if (!target || target.curHp <= 0) return;

    const mpCost = getSkillMpCostForCaster(pickedSkill, activeUnit);
    if (activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${pickedSkill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      return;
    }

    setIsProcessing(true);

    if (pickedSkill?.effect?.type === 'skillCritBuff') {
      const turns = Math.max(1, pickedSkill.effect.turns ?? 2);
      const scales = Array.isArray(pickedSkill.effect.scales) ? pickedSkill.effect.scales : ['matk', 'mix'];
      const newH0 = heroes.map((h) =>
        h.id === hId && h.curHp > 0 ? { ...h, skillCritTurns: turns, skillCritScales: scales } : h
      );
      setHeroes(newH0);
      setLogs([`${activeUnit.name} 施放「${pickedSkill.name}」：${target.name} 獲得「術式爆擊」（${turns} 回合）`, ...logs].slice(0, 5));
      const newH = endHeroAction(newH0, { mpCost });
      if (activeUnit?.id && pickedSkill?.id) {
        setSkillMasteryMap((prev) => incSkillUses(prev, activeUnit.id, pickedSkill.id, 1));
        setDailyQ((s) => {
          const qid = 'skill_casts';
          if (!s?.picked?.includes(qid)) return s;
          const def = DAILY_QUEST_DEFS[qid];
          const now = loadDailyQuestsState();
          if (now.date !== s.date) return now;
          const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
          return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + 1) } };
        });
      }
      await new Promise((r) => setTimeout(r, 600));
      advanceTurn(newH, monsters, activeUnit.id);
      return;
    }

    if (pickedSkill?.effect?.type === 'sunflowerShot') {
      const healSkill = { scale: 'matk', effect: { type: 'heal', target: 'ally-single', powerMul: pickedSkill.effect.healPowerMul ?? 1 } };
      let heal = resolveSkillHeal({ caster: activeUnit, target, skill: healSkill }).heal;
      const incMul = getIncomingHealMulFromTalents(talentMap, hId);
      if (incMul !== 1) heal = Math.max(1, Math.floor(heal * incMul));
      const mpFlat = getHealTargetMpFlatFromTalents(talentMap, activeUnit.id);
      const newH0 = heroes.map((h) =>
        h.id === hId
          ? { ...h, curHp: Math.min(h.hp, h.curHp + heal), curMp: Math.min(MP_MAX, (h.curMp ?? 0) + mpFlat) }
          : h
      );
      setHeroes(newH0);
      setLogs([`${activeUnit.name} 使用「${pickedSkill.name}」：${target.name} 回復 +${heal}`, ...logs].slice(0, 5));
      const newH = endHeroAction(newH0, { mpCost });
      if (activeUnit?.id && pickedSkill?.id) {
        setSkillMasteryMap((prev) => incSkillUses(prev, activeUnit.id, pickedSkill.id, 1));
        setDailyQ((s) => {
          const qid = 'skill_casts';
          if (!s?.picked?.includes(qid)) return s;
          const def = DAILY_QUEST_DEFS[qid];
          const now = loadDailyQuestsState();
          if (now.date !== s.date) return now;
          const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
          return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + 1) } };
        });
      }
      await new Promise((r) => setTimeout(r, 600));
      advanceTurn(newH, monsters, activeUnit.id);
      return;
    }

    const singleBuff = getBuffSingleDef(pickedSkill);
    if (singleBuff) {
      const turnsBonus = getBuffTurnsBonusFromTalents(talentMap, activeUnit.id);
      const buffTurns = Math.max(1, singleBuff.turns + turnsBonus);
      let newH0 = heroes.map((h) =>
        h.id === hId
          ? {
              ...h,
              atkBuffTurns: buffTurns,
              atkBuffMul: singleBuff.mulAtk,
              matkBuffTurns: buffTurns,
              matkBuffMul: singleBuff.mulMatk,
            }
          : h
      );
      const jackGiftMpOne = activeUnit.id === 'jack' ? getAllyMpOnBuffFromSelfFromTalents(talentMap, 'jack') : 0;
      if (jackGiftMpOne > 0 && hId !== 'jack') {
        newH0 = newH0.map((h) =>
          h.id === hId && h.curHp > 0 ? { ...h, curMp: Math.min(MP_MAX, (h.curMp ?? 0) + jackGiftMpOne) } : h
        );
      }
      setHeroes(newH0);
      const pct = Math.round((singleBuff.mulAtk - 1) * 100);
      setLogs(
        [
          `${activeUnit.name} 施放「${pickedSkill.name}」：${target.name} 攻擊／魔力提升（${pct}%，${buffTurns} 回合）`,
          ...logs,
        ].slice(0, 5)
      );
      const newH = endHeroAction(newH0, { mpCost });
      if (activeUnit?.id && pickedSkill?.id) {
        setSkillMasteryMap((prev) => incSkillUses(prev, activeUnit.id, pickedSkill.id, 1));
        setDailyQ((s) => {
          const qid = 'skill_casts';
          if (!s?.picked?.includes(qid)) return s;
          const def = DAILY_QUEST_DEFS[qid];
          const now = loadDailyQuestsState();
          if (now.date !== s.date) return now;
          const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
          return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + 1) } };
        });
      }
      await new Promise((r) => setTimeout(r, 600));
      advanceTurn(newH, monsters, activeUnit.id);
      return;
    }

    let heal = resolveSkillHeal({ caster: activeUnit, target, skill: pickedSkill }).heal;
    if (activeUnit?.id === 'bubu' || activeUnit?.id === 'bubu_harvest') {
      const healMul = getOutgoingHealMulFromTalents(talentMap, activeUnit.id);
      if (healMul !== 1) heal = Math.max(1, Math.floor(heal * healMul));
    }
    {
      const incMul = getIncomingHealMulFromTalents(talentMap, hId);
      if (incMul !== 1) heal = Math.max(1, Math.floor(heal * incMul));
    }
    const healPassive = activeUnit?.passive?.effect?.type === 'healGivesBarrier' ? activeUnit.passive.effect : null;
    let newH0 = heroes.map((h) => {
      if (h.id !== hId) return h;
      const next = { ...h, curHp: Math.min(h.hp, h.curHp + heal) };
      if (healPassive) {
        next.barrierTurns = Math.max(next.barrierTurns ?? 0, healPassive.turns ?? 1);
        next.barrierMul = Math.min(next.barrierMul ?? 1, healPassive.incomingMul ?? 1);
        next.barrierSource = next.barrierTurns > 0 ? 'healBarrier' : (next.barrierSource ?? null);
      }
      return next;
    });
    if (activeUnit?.id === 'bubu_harvest') {
      const mpFlat = getHealTargetMpFlatFromTalents(talentMap, 'bubu_harvest');
      if (mpFlat > 0) {
        newH0 = newH0.map((h) => (h.id === hId && h.curHp > 0 ? { ...h, curMp: Math.min(MP_MAX, (h.curMp ?? 0) + mpFlat) } : h));
      }
    }
    let chainLine = '';
    if (activeUnit?.id === 'bubu') {
      const chain = getChainHealOnHealFromTalents(talentMap, 'bubu');
      if (chain && Math.random() < chain.chance) {
        const pool = newH0.filter((h) => h.curHp > 0 && h.id !== hId);
        if (pool.length > 0) {
          const pick = pool[Math.floor(Math.random() * pool.length)];
          const splash = Math.max(1, Math.floor(heal * chain.ratio));
          newH0 = newH0.map((h) => (h.id === pick.id ? { ...h, curHp: Math.min(h.hp, h.curHp + splash) } : h));
          chainLine = `；連環祝福：${pick.name} +${splash}`;
        }
      }
    }
    setHeroes(newH0);
    setLogs([`${activeUnit.name} 施放「${pickedSkill.name}」治療 ${target.name} +${heal}${chainLine}`, ...logs].slice(0, 5));

    const newH = endHeroAction(newH0, { mpCost });
    if (activeUnit?.id && pickedSkill?.id) {
      setSkillMasteryMap((prev) => incSkillUses(prev, activeUnit.id, pickedSkill.id, 1));
      setDailyQ((s) => {
        const qid = 'skill_casts';
        if (!s?.picked?.includes(qid)) return s;
        const def = DAILY_QUEST_DEFS[qid];
        const now = loadDailyQuestsState();
        if (now.date !== s.date) return now;
        const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
        return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + 1) } };
      });
    }
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters, activeUnit.id);
  };

  const useBattleItemAllyAll = async (itemId) => {
    const it = getItem(itemId);
    if (!it || !canUseInBattle(it) || it.effect?.type !== 'healHp' || it.effect?.target !== 'ally-all') return;
    if (!activeUnit?.isHero || isProcessing) return;
    if (isJackItemInvertActive(activeUnit) && itemId === 'it_healing_dust') {
      const count = getInvCount(itemInv, itemId);
      if (count <= 0) {
        setLogs([`道具不足：${it.name}`, ...logs].slice(0, 5));
        return;
      }
      unlockAudio();
      SFX.skill();
      setIsProcessing(true);
      const dmgEach = getJackInvertedDustDamagePerEnemy(activeUnit);
      const newM0 = monsters.map((m) => (m.curHp <= 0 ? m : { ...m, curHp: Math.max(0, m.curHp - dmgEach) }));
      const newM = applyLavaCoreDeathBonusStrip(newM0);
      setMonsters(newM);
      setItemInv((inv) => incInv(inv, itemId, -1));
      setLogs(
        [
          `${activeUnit.name} 道具反轉「${it.name}」：敵方全體各受到 ${dmgEach} 傷害`,
          ...logs,
        ].slice(0, 5)
      );
      const newH = endHeroAction(heroes, { mpCost: 0, mpGain: 0 });
      await new Promise((r) => setTimeout(r, 600));
      if (newM.every((m) => m.curHp <= 0)) grantVictory(newM);
      else advanceTurn(newH, newM, activeUnit.id);
      return;
    }

    const count = getInvCount(itemInv, itemId);
    if (count <= 0) {
      setLogs([`道具不足：${it.name}`, ...logs].slice(0, 5));
      return;
    }
    unlockAudio();
    SFX.skill();
    setIsProcessing(true);
    const pct = typeof it.effect.pct === 'number' ? Math.max(0, it.effect.pct) : 0;
    const minBase = Math.max(0, Math.floor(Number(it.effect.min) || 0));
    const newH0 = heroes.map((h) => {
      if (h.curHp <= 0) return h;
      const poisonMul = getIncomingHealMulFromPoison(h);
      const incMul = getIncomingHealMulFromTalents(talentMap, h.id);
      const base = pct > 0 ? Math.floor((h.hp ?? 1) * pct) : Math.max(1, Math.floor(Number(it.effect.amount) || 0));
      const healAmt = Math.max(1, Math.floor(Math.max(minBase, base) * poisonMul * incMul));
      return { ...h, curHp: Math.min(h.hp, h.curHp + healAmt) };
    });
    const parts = newH0
      .map((h) => {
        const prev = heroes.find((x) => x.id === h.id);
        if (!prev || prev.curHp <= 0) return null;
        const gained = h.curHp - prev.curHp;
        return gained > 0 ? `${h.name} +${gained}` : null;
      })
      .filter(Boolean);
    setHeroes(newH0);
    setItemInv((inv) => incInv(inv, itemId, -1));
    setTargetMode(null);
    setPickedItemId(null);
    setLogs([`${activeUnit.name} 使用「${it.name}」：全隊 ${parts.join('、')}`, ...logs].slice(0, 5));
    const newH = endHeroAction(newH0, { mpCost: 0, mpGain: 0 });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters, activeUnit.id);
  };

  const onMonsterItemInvertSelect = async (mId) => {
    if (targetMode !== 'item-enemy' || isProcessing || !activeUnit?.isHero || !pickedItemId) return;
    if (!isJackItemInvertActive(activeUnit)) {
      setTargetMode(null);
      setPickedItemId(null);
      return;
    }
    const it = getItem(pickedItemId);
    if (!it || !canUseInBattle(it)) {
      setTargetMode(null);
      setPickedItemId(null);
      return;
    }
    const target = monsters.find((m) => m.id === mId);
    if (!target || target.curHp <= 0) return;
    const count = getInvCount(itemInv, pickedItemId);
    if (count <= 0) {
      setLogs([`道具不足：${it.name}`, ...logs].slice(0, 5));
      setTargetMode(null);
      setPickedItemId(null);
      return;
    }

    unlockAudio();
    SFX.skill();
    setIsProcessing(true);

    const t = it.effect?.type;
    let newM0 = monsters;
    let logLine = '';

    if (t === 'healHp' && it.effect?.target === 'ally-single') {
      const { amount } = getJackInvertedSingleDamage(pickedItemId, activeUnit);
      newM0 = monsters.map((m) => (m.id === mId ? { ...m, curHp: Math.max(0, m.curHp - amount) } : m));
      logLine = `${activeUnit.name} 道具反轉「${it.name}」：對 ${target.name} 造成 ${amount} 傷害`;
    } else if (t === 'restoreMp') {
      const drain = getJackInvertedMpDrain(pickedItemId);
      newM0 = monsters.map((m) =>
        m.id === mId ? { ...m, curMp: Math.max(0, (m.curMp ?? 0) - drain) } : m
      );
      logLine = `${activeUnit.name} 道具反轉「${it.name}」：${target.name} MP -${drain}`;
    } else if (t === 'cleanseOneNegative') {
      const dmg = getJackInvertedPanaceaDamage(activeUnit);
      newM0 = monsters.map((m) => (m.id === mId ? { ...m, curHp: Math.max(0, m.curHp - dmg) } : m));
      logLine = `${activeUnit.name} 道具反轉「${it.name}」：對 ${target.name} 驅散衝擊 ${dmg}`;
    } else {
      setIsProcessing(false);
      setTargetMode(null);
      setPickedItemId(null);
      return;
    }

    const newM = applyLavaCoreDeathBonusStrip(newM0);
    setMonsters(newM);
    setItemInv((inv) => incInv(inv, pickedItemId, -1));
    setTargetMode(null);
    setPickedItemId(null);
    setLogs([logLine, ...logs].slice(0, 5));
    const newH = endHeroAction(heroes, { mpCost: 0, mpGain: 0 });
    await new Promise((r) => setTimeout(r, 600));
    if (newM.every((m) => m.curHp <= 0)) grantVictory(newM);
    else advanceTurn(newH, newM, activeUnit.id);
  };

  const onHeroItemSelect = async (hId) => {
    if (targetMode !== 'item' || isProcessing || !activeUnit?.isHero || !pickedItemId) return;
    const it = getItem(pickedItemId);
    if (!it || !canUseInBattle(it)) return;
    const target = heroes.find((h) => h.id === hId);
    if (!target || target.curHp <= 0) return;
    const count = getInvCount(itemInv, pickedItemId);
    if (count <= 0) {
      setLogs([`道具不足：${it.name}`, ...logs].slice(0, 5));
      setTargetMode(null);
      setPickedItemId(null);
      return;
    }

    unlockAudio();
    SFX.skill();
    setIsProcessing(true);

    let newH0 = heroes;
    if (it.effect?.type === 'healHp' && (it.effect?.target ?? 'ally-single') === 'ally-single') {
      const pct = typeof it.effect.pct === 'number' ? Math.max(0, it.effect.pct) : 0;
      const minBase = Math.max(0, Math.floor(Number(it.effect.min) || 0));
      const poisonMul = getIncomingHealMulFromPoison(target);
      const incMul = getIncomingHealMulFromTalents(talentMap, hId);
      const base = pct > 0 ? Math.floor((target.hp ?? 1) * pct) : Math.max(1, Math.floor(Number(it.effect.amount) || 0));
      const healAmt = Math.max(1, Math.floor(Math.max(minBase, base) * poisonMul * incMul));
      newH0 = heroes.map((h) => (h.id === hId ? { ...h, curHp: Math.min(h.hp, h.curHp + healAmt) } : h));
      setLogs([`${activeUnit.name} 使用「${it.name}」：${target.name} HP +${healAmt}`, ...logs].slice(0, 5));
    } else if (it.effect?.type === 'restoreMp') {
      const amt = Math.max(1, it.effect.amount ?? 0);
      newH0 = heroes.map((h) => (h.id === hId ? { ...h, curMp: Math.min(MP_MAX, (h.curMp ?? 0) + amt) } : h));
      setLogs([`${activeUnit.name} 使用「${it.name}」：${target.name} MP +${amt}`, ...logs].slice(0, 5));
    } else if (it.effect?.type === 'cleanseOneNegative') {
      const oldEff = getEffectiveSpd(target);
      const { next, cleared } = clearOneNegativeFromHero(target);
      const newEff = getEffectiveSpd(next);
      const patched = oldEff !== newEff ? { ...next, av: rescaleAvForSpdChange(target.av, oldEff, newEff) } : next;
      newH0 = heroes.map((h) => (h.id === hId ? patched : h));
      setLogs([`${activeUnit.name} 使用「${it.name}」：${target.name} 解除 ${cleared ?? '（無）'}`, ...logs].slice(0, 5));
    } else {
      setIsProcessing(false);
      return;
    }

    setHeroes(newH0);
    setItemInv((inv) => incInv(inv, pickedItemId, -1));
    setTargetMode(null);
    setPickedItemId(null);
    const newH = endHeroAction(newH0, { mpCost: 0, mpGain: 0 });
    await new Promise((r) => setTimeout(r, 600));
    advanceTurn(newH, monsters, activeUnit.id);
  };

  const onTargetSelect = async (mId) => {
    if (!targetMode || isProcessing || !activeUnit?.isHero) return;
    if (targetMode === 'skill' && !pickedSkill) return;
    if (targetMode === 'skill-flex' && !pickedSkill) return;
    setIsProcessing(true);

    const target = monsters.find((m) => m.id === mId);
    if (!target || target.curHp <= 0) {
      setIsProcessing(false);
      return;
    }

    const isSkill = targetMode === 'skill' || targetMode === 'skill-flex';
    const t = isSkill ? getSkillTargeting(pickedSkill) : null;
    if (isSkill && t?.side === 'ally') {
      setIsProcessing(false);
      return;
    }
    const skillScale = isSkill ? pickedSkill?.scale ?? 'matk' : 'matk';
    const baseMpCost = isSkill ? pickedSkill?.mpCost ?? 20 : 0;
    const mpDiscount = isSkill && activeUnit?.isHero ? getR4SkillMpDiscount(activeUnit.id) : 0;
    const mpCost = isSkill ? Math.max(1, baseMpCost - mpDiscount) : 0;
    if (isSkill && activeUnit.curMp < mpCost) {
      setLogs([`MP 不足，無法施放「${pickedSkill.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
      setIsProcessing(false);
      return;
    }

    // 萬聖驚喜：死亡標記（不造成傷害）
    if (isSkill && pickedSkill?.effect?.type === 'deathMark') {
      unlockAudio();
      SFX.skill();
      const newM0 = monsters.map((m) => (m.id === mId && m.curHp > 0 ? { ...m, deathMark: true } : m));
      setMonsters(newM0);
      setLogs([`${activeUnit.name} 施放「${pickedSkill.name}」：${target.name} 被施加「死亡標記」`, ...logs].slice(0, 5));
      const newH = endHeroAction(heroes, { mpCost });
      await new Promise((r) => setTimeout(r, 600));
      advanceTurn(newH, newM0, activeUnit.id);
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
    let damage = 0;
    let didCrit = false;
    let critDamageForLifesteal = 0;
    let multiHitLine = '';
    if (isSkill && pickedSkill?.effect?.type === 'sunflowerShot') {
      const mul = pickedSkill.effect.dmgPowerMul ?? 1;
      const talentMul = getSkillDamageMulVsStunImmuneFromTalents({
        talentMap,
        casterHeroId: activeUnit.id,
        skillId: pickedSkill.id,
        target,
      });
      const masteryMul =
        activeUnit?.id && pickedSkill?.id ? getSkillPowerMulFromMastery(skillMasteryMap, activeUnit.id, pickedSkill.id) : 1;
      const r = getDamage(activeUnit, target, true, mul * talentMul * masteryMul, 'atk');
      damage = r.damage;
      didCrit = r.crit;
      critDamageForLifesteal = r.crit ? r.damage : 0;
    } else if (applyDebuff) {
      if (applyDebuffDamage) {
        const r = getDamage(activeUnit, target, true, debuffDamageMul, pickedSkill?.scale ?? 'matk');
        damage = r.damage;
        didCrit = r.crit;
        critDamageForLifesteal = r.crit ? r.damage : 0;
      }
    } else if (isSkill) {
      const ov =
        pickedSkill?.id && activeUnit?.isHero
          ? getSkillMultiHitOverrideFromTalents({ talentMap, casterHeroId: activeUnit.id, skillId: pickedSkill.id })
          : null;
      const hits = Math.max(1, ov?.hits ?? 1);
      const masteryMul =
        activeUnit?.id && pickedSkill?.id ? getSkillPowerMulFromMastery(skillMasteryMap, activeUnit.id, pickedSkill.id) : 1;
      const powerMulOverride = typeof ov?.powerMul === 'number' ? ov.powerMul * masteryMul : masteryMul;
      if (hits > 1) {
        let tmpTarget = target;
        let sum = 0;
        let anyCrit = false;
        let critSum = 0;
        const parts = [];
        let performed = 0;
        for (let i = 0; i < hits; i += 1) {
          const r = resolveSkillDamage({ caster: activeUnit, target: tmpTarget, skill: pickedSkill, getDamage, powerMulOverride });
          sum += r.damage;
          if (r.crit) critSum += r.damage;
          anyCrit = anyCrit || r.crit;
          performed += 1;
          parts.push(`${r.damage}${r.crit ? '（暴擊）' : ''}`);
          tmpTarget = { ...tmpTarget, curHp: Math.max(0, (tmpTarget.curHp ?? 0) - r.damage) };
          if ((tmpTarget.curHp ?? 0) <= 0) break;
        }
        damage = sum;
        didCrit = anyCrit;
        critDamageForLifesteal = critSum;
        multiHitLine = performed > 1 ? `（連擊：${parts.join(' + ')} = ${sum}）` : '';
      } else {
        const r = resolveSkillDamage({ caster: activeUnit, target, skill: pickedSkill, getDamage, powerMulOverride });
        damage = r.damage;
        didCrit = r.crit;
        critDamageForLifesteal = r.crit ? r.damage : 0;
      }
    } else {
      const r = getDamage(activeUnit, target, false, 1, skillScale);
      damage = r.damage;
      didCrit = r.crit;
      critDamageForLifesteal = r.crit ? r.damage : 0;
    }
    const selfOnHit = isSkill && pickedSkill?.effect?.type === 'damage' ? pickedSkill.effect.selfOnHit : null;
    const allyBuff = isSkill && pickedSkill?.effect?.type === 'damage' ? pickedSkill.effect.allyBuff : null;
    const baseOnHitAilment = isSkill && pickedSkill?.effect?.type === 'damage' ? (pickedSkill.effect.ailment ?? null) : null;
    const talentOnHitAilment =
      isSkill && pickedSkill?.id
        ? getSkillOnHitAilmentFromTalents({ talentMap, casterHeroId: activeUnit.id, skillId: pickedSkill.id })
        : null;
    const onHitAilment = talentOnHitAilment ?? baseOnHitAilment;
    const critMark = didCrit ? '（暴擊！）' : '';
    const selfOnHitBits = [];
    if (selfOnHit?.critRateMid) selfOnHitBits.push(`自身爆擊率提升（中・${selfOnHit.critRateMid.turns ?? 3} 回合）`);
    if (selfOnHit?.critDmgSmall) selfOnHitBits.push(`自身暴擊傷害提升（小・${selfOnHit.critDmgSmall.turns ?? 2} 回合）`);
    if (typeof selfOnHit?.itemInvertTurns === 'number' && selfOnHit.itemInvertTurns > 0) {
      selfOnHitBits.push(`道具反轉（${selfOnHit.itemInvertTurns} 回合）`);
    }
    const selfOnHitLine = selfOnHitBits.length ? `，${selfOnHitBits.join('；')}` : '';
    const extraTurnsFromPassive =
      isSkill && activeUnit?.passive?.effect?.type === 'debuffTurnsPlus' ? activeUnit.passive.effect.value ?? 0 : 0;
    const dmgDebuff = isSkill && pickedSkill?.effect?.type === 'damage' ? pickedSkill?.effect?.debuff : null;
    const applyAtkDownFromDamage =
      !!dmgDebuff && dmgDebuff.stat === 'atk' && dmgDebuff.target === 'enemy-single' && typeof dmgDebuff.mul === 'number';
    const atkDownTurns = applyAtkDownFromDamage ? Math.max(1, (dmgDebuff.turns ?? 1) + extraTurnsFromPassive) : 0;
    const atkDownMul = applyAtkDownFromDamage ? dmgDebuff.mul : 1;
    const applyDefDownFromDamage =
      !!dmgDebuff && dmgDebuff.stat === 'def' && dmgDebuff.target === 'enemy-single' && typeof dmgDebuff.mul === 'number';
    const defDownTurnsFromDmg = applyDefDownFromDamage ? Math.max(1, (dmgDebuff.turns ?? 1) + extraTurnsFromPassive) : 0;
    const defDownMulFromDmg = applyDefDownFromDamage ? dmgDebuff.mul : 1;

    const splashHits = [];
    if (isSkill && !applyDebuff && pickedSkill?.effect?.type === 'damage') {
      const baseSm = pickedSkill.effect.splash?.powerMul;
      const sm =
        typeof baseSm === 'number'
          ? getSplashMulOverrideFromTalents({ talentMap, caster: activeUnit, skill: pickedSkill, baseMul: baseSm })
          : baseSm;
      if (typeof sm === 'number') {
        const idx = monsters.findIndex((m) => m.id === mId);
        if (idx >= 0) {
          for (const d of [-1, 1]) {
            const j = idx + d;
            if (j < 0 || j >= monsters.length) continue;
            const nm = monsters[j];
            if (nm.curHp <= 0) continue;
            const rS = resolveSkillDamage({
              caster: activeUnit,
              target: nm,
              skill: pickedSkill,
              getDamage,
              powerMulOverride: sm,
            });
            splashHits.push({ id: nm.id, dmg: rS.damage, crit: rS.crit, name: nm.name });
          }
        }
      }
    }
    if (splashHits.length) {
      for (const sh of splashHits) if (sh.crit) critDamageForLifesteal += sh.dmg;
    }

    const applyMonsterSkillHit = (m, dmg) => {
      const aliveBefore = m.curHp > 0;
      const nextHp = Math.max(0, m.curHp - dmg);
      const alreadyGained = m.lastHitMpTurn === turnSeq;
      const mpAdd = !alreadyGained && aliveBefore ? MONSTER_HIT_MP_GAIN : 0;
      return {
        ...m,
        curHp: nextHp,
        curMp: Math.min(MP_MAX, (m.curMp ?? 0) + mpAdd),
        lastHitMpTurn: alreadyGained ? m.lastHitMpTurn : turnSeq,
      };
    };

    let newM = monsters.map((m) => {
      if (m.id === mId) {
        const postHit = applyMonsterSkillHit(m, damage);
        const chanceAdd =
          onHitAilment?.type && isSkill && pickedSkill?.id
            ? getSkillAilmentChanceAddFromTalents({
                talentMap,
                casterHeroId: activeUnit.id,
                skillId: pickedSkill.id,
                ailmentType: onHitAilment.type,
              })
            : 0;
        const chanceBase = typeof onHitAilment?.chance === 'number' ? onHitAilment.chance : null;
        const affixHit = typeof activeUnit?.affixCcHitAdd === 'number' ? activeUnit.affixCcHitAdd : 0;
        const affixRes = typeof postHit?.affixAilResistAdd === 'number' ? postHit.affixAilResistAdd : 0;
        const chance = chanceBase == null ? null : Math.max(0, Math.min(1, chanceBase + chanceAdd + affixHit - affixRes));
        const rollOk = !onHitAilment || chance == null ? true : Math.random() < chance;
        let postAilment =
          !rollOk
            ? postHit
            : onHitAilment?.type === 'poison'
              ? applyPoisonOnTarget(postHit, onHitAilment.turns)
              : onHitAilment?.type === 'burn'
                ? applyBurnOnTarget(postHit, onHitAilment.stacks)
                : onHitAilment?.type === 'darkness'
                  ? applyDarknessOnTarget(postHit, onHitAilment.turns)
                  : onHitAilment?.type === 'stun'
                    ? applyStunOnTarget(postHit, onHitAilment.turns)
                    : postHit;
        if (rollOk && activeUnit?.id === 'butiya_halloween' && hasDoubleDotFromSelfTalent(talentMap, 'butiya_halloween')) {
          if (onHitAilment?.type === 'burn') postAilment = { ...postAilment, burnDmgMul: 2 };
          if (onHitAilment?.type === 'poison') postAilment = { ...postAilment, poisonDmgMul: 2 };
        }
        let merged = {
          ...postAilment,
          ...(applyDebuff && deb?.stat === 'def+mdef'
            ? {
                defDownTurns: (deb.turns ?? 0) + extraDebuffTurns,
                defDownMul: deb.mul,
                mdefDownTurns: (deb.turns ?? 0) + extraDebuffTurns,
                mdefDownMul: deb.mul,
              }
            : {}),
          ...(applyAtkDownFromDamage ? { atkDownTurns, atkDownMul } : {}),
          ...(applyDefDownFromDamage ? { defDownTurns: defDownTurnsFromDmg, defDownMul: defDownMulFromDmg } : {}),
        };
        if (applyDebuff && deb?.stat === 'spd') {
          const spdTurns = Math.max(1, (deb.turns ?? 1) + extraDebuffTurns);
          const oldEff = getEffectiveSpd(m);
          merged = { ...merged, spdDownTurns: spdTurns, spdDownMul: deb.mul };
          merged = { ...merged, av: rescaleAvForSpdChange(m.av, oldEff, getEffectiveSpd(merged)) };
        }
        if (applyDebuff && pickedSkill?.effect?.ailment?.type === 'darkness') {
          merged = applyDarknessOnTarget(merged, pickedSkill.effect.ailment.turns);
        }
        return merged;
      }
      const sh = splashHits.find((s) => s.id === m.id);
      if (sh) return applyMonsterSkillHit(m, sh.dmg);
      return m;
    });

    let heroesForEnd = heroes;

    // 死亡標記：本次行動造成擊殺則觸發（波及怪物友軍）
    {
      const died = [];
      const prevMain = monsters.find((m) => m.id === mId);
      const nextMain = newM.find((m) => m.id === mId);
      if (prevMain && nextMain && prevMain.curHp > 0 && nextMain.curHp <= 0 && prevMain.deathMark) died.push(prevMain);
      for (const sh of splashHits) {
        const p = monsters.find((m) => m.id === sh.id);
        const n = newM.find((m) => m.id === sh.id);
        if (p && n && p.curHp > 0 && n.curHp <= 0 && p.deathMark) died.push(p);
      }
      let mWork = newM;
      for (const dm of died) {
        const boom = triggerDeathMarkExplosion(dm, mWork);
        mWork = boom.monstersNext;
        if (boom.logLine) setLogs((prev) => [boom.logLine, ...prev].slice(0, 5));
      }
      newM = applyLavaCoreDeathBonusStrip(mWork);
    }

    // 天賦：擊殺回 MP（僅計算本次行動造成的擊殺）
    const killMp = getOnKillMpFromTalents(talentMap, activeUnit.id);
    if (killMp > 0 && activeUnit?.isHero) {
      const killedIds = new Set();
      const prevMain = monsters.find((m) => m.id === mId);
      const nextMain = newM.find((m) => m.id === mId);
      if (prevMain && nextMain && prevMain.curHp > 0 && nextMain.curHp <= 0) killedIds.add(mId);
      for (const sh of splashHits) {
        const p = monsters.find((m) => m.id === sh.id);
        const n = newM.find((m) => m.id === sh.id);
        if (p && n && p.curHp > 0 && n.curHp <= 0) killedIds.add(sh.id);
      }
      const kills = killedIds.size;
      if (kills > 0) {
        const gain = killMp * kills;
        heroesForEnd = heroesForEnd.map((h) =>
          h.id === activeUnit.id ? { ...h, curMp: Math.min(MP_MAX, (h.curMp ?? 0) + gain) } : h
        );
      }
    }

    // 天賦：擊殺 + 攻擊（僅計算本次行動造成的擊殺）
    const killAtk = activeUnit?.isHero ? getOnKillAtkBuffFromTalents(talentMap, activeUnit.id) : null;
    if (killAtk && activeUnit?.isHero) {
      const killedIds = new Set();
      const prevMain = monsters.find((m) => m.id === mId);
      const nextMain = newM.find((m) => m.id === mId);
      if (prevMain && nextMain && prevMain.curHp > 0 && nextMain.curHp <= 0) killedIds.add(mId);
      for (const sh of splashHits) {
        const p = monsters.find((m) => m.id === sh.id);
        const n = newM.find((m) => m.id === sh.id);
        if (p && n && p.curHp > 0 && n.curHp <= 0) killedIds.add(sh.id);
      }
      const kills = killedIds.size;
      if (kills > 0) {
        const mul = killAtk.mul ** kills;
        heroesForEnd = heroesForEnd.map((h) => {
          if (h.id !== activeUnit.id) return h;
          const prevMul = (h.atkBuffTurns ?? 0) > 0 ? (h.atkBuffMul ?? 1) : 1;
          const nextMul = Math.max(1, prevMul * mul);
          const nextTurns = Math.max(h.atkBuffTurns ?? 0, killAtk.turns);
          return { ...h, atkBuffTurns: nextTurns, atkBuffMul: nextMul };
        });
      }
    }

    // 天賦：擊殺 + 加速（僅計算本次行動造成的擊殺）
    const killSpd = activeUnit?.isHero ? getOnKillSpdBuffFromTalents(talentMap, activeUnit.id) : null;
    if (killSpd && activeUnit?.isHero) {
      const killedIds = new Set();
      const prevMain = monsters.find((m) => m.id === mId);
      const nextMain = newM.find((m) => m.id === mId);
      if (prevMain && nextMain && prevMain.curHp > 0 && nextMain.curHp <= 0) killedIds.add(mId);
      for (const sh of splashHits) {
        const p = monsters.find((m) => m.id === sh.id);
        const n = newM.find((m) => m.id === sh.id);
        if (p && n && p.curHp > 0 && n.curHp <= 0) killedIds.add(sh.id);
      }
      const kills = killedIds.size;
      if (kills > 0) {
        heroesForEnd = heroesForEnd.map((h) => {
          if (h.id !== activeUnit.id) return h;
          const nextTurns = Math.max(h.spdBuffTurns ?? 0, killSpd.turns);
          const nextMul = Math.max(h.spdBuffMul ?? 1, killSpd.mul);
          return { ...h, spdBuffTurns: nextTurns, spdBuffMul: nextMul };
        });
      }
    }

    // 天賦：爆擊吸血（只吃本次行動造成的暴擊傷害）
    const lsMul = activeUnit?.isHero ? getCritLifestealMulFromTalents(talentMap, activeUnit.id) : 0;
    if (lsMul > 0 && activeUnit?.isHero && critDamageForLifesteal > 0) {
      const heal = Math.max(1, Math.floor(critDamageForLifesteal * lsMul));
      heroesForEnd = heroesForEnd.map((h) =>
        h.id === activeUnit.id ? { ...h, curHp: Math.min(h.hp, (h.curHp ?? 0) + heal) } : h
      );
    }

    // 傑克專屬：暴擊竊取隨機增益（單體目標：暴擊則竊取一次）
    if (
      didCrit &&
      activeUnit?.isHero &&
      activeUnit.id === 'jack' &&
      canCritStealRandomBuffFromEnemyFromTalents(talentMap, 'jack')
    ) {
      const res = stealRandomBuffFromMonsterToHero({ heroId: 'jack', monsterId: mId, monstersList: newM });
      if (res.ok) {
        heroesForEnd = res.heroesNext;
        newM = res.monstersNext;
        setLogs([`掠光竊印：竊取敵方「${res.stolen}」增益`, ...logs].slice(0, 5));
      }
    }

    if (selfOnHit && activeUnit?.isHero) {
      heroesForEnd = heroesForEnd.map((h) =>
        h.id === activeUnit.id ? applySelfOnHitToHero(h, selfOnHit) : h
      );
    }
    // 合體技／技能：我方全體看破特攻（1 回合）
    if (allyBuff?.type === 'dmgVsWeaknessSeen' && typeof allyBuff.mul === 'number' && allyBuff.mul > 1) {
      const turns = Math.max(1, Math.floor(Number(allyBuff.turns) || 1));
      const mul = allyBuff.mul;
      heroesForEnd = heroesForEnd.map((h) => {
        if (!h?.isHero || (h.curHp ?? 0) <= 0) return h;
        const nextTurns = Math.max(h.weaknessSeenDmgTurns ?? 0, turns);
        const nextMul = Math.max(h.weaknessSeenDmgMul ?? 1, mul);
        return { ...h, weaknessSeenDmgTurns: nextTurns, weaknessSeenDmgMul: nextMul };
      });
    }
    setHeroes(heroesForEnd);
    const coreWasAlive = monsters.some((m) => isLavaCoreTemplateId(monsterTemplateId(m.id)) && m.curHp > 0);
    const coreNowDead = !newM.some((m) => isLavaCoreTemplateId(monsterTemplateId(m.id)) && m.curHp > 0);
    const strippedM = applyLavaCoreDeathBonusStrip(newM);
    const shellCracked = coreWasAlive && coreNowDead;
    setMonsters(strippedM);
    unlockAudio();
    if (isSkill) SFX.skill();
    else SFX.attack();
    const skillLabel = isSkill && pickedSkill ? `「${pickedSkill.name}」` : '';
    const debuffLine = applyDebuff
      ? deb?.stat === 'def+mdef'
        ? `降低雙防（${Math.round((1 - deb.mul) * 100)}%）${(deb.turns ?? 0) + extraDebuffTurns}回合`
        : deb?.stat === 'spd'
          ? `速度降低（${Math.round((1 - deb.mul) * 100)}%）${(deb.turns ?? 0) + extraDebuffTurns}回合`
          : ''
      : applyAtkDownFromDamage
        ? `降低攻擊（${Math.round((1 - atkDownMul) * 100)}%）${atkDownTurns}回合`
        : applyDefDownFromDamage
          ? `降低物防（${Math.round((1 - defDownMulFromDmg) * 100)}%）${defDownTurnsFromDmg}回合`
          : '';
    const splashLine =
      splashHits.length > 0
        ? `；濺射 ${splashHits.map((s) => `${s.name} ${s.dmg}${s.crit ? '（暴擊）' : ''}`).join('、')}`
        : '';
    const mainHitLine = isSkill
      ? applyDebuff
        ? `${activeUnit.name} 施放${skillLabel}：${target.name} ${debuffLine}${applyDebuffDamage ? `，並造成 ${damage} 傷害${critMark}` : ''}`
        : `${activeUnit.name} 施放${skillLabel}對 ${target.name} 造成 ${damage} 傷害${critMark}${multiHitLine}！${splashLine}${selfOnHitLine}`
      : `${activeUnit.name} 對 ${target.name} 造成 ${damage} 傷害${critMark}${multiHitLine}！`;
    setLogs(
      [
        ...(shellCracked ? ['熔岩核心的加護潰散：熔岩巨人的額外體魄被剝離！'] : []),
        mainHitLine,
        ...logs,
      ].slice(0, 5)
    );

    const isAttack = targetMode === 'attack';
    const baseAtkMpGain = !isSkill && isAttack ? 10 : 0;
    const butiyaBonus = activeUnit?.id === 'butiya' && (target?.spdDownTurns ?? 0) > 0 ? 2 : 1;
    const atkMpGain = Math.floor(baseAtkMpGain * butiyaBonus);
    let newH = endHeroAction(heroesForEnd, { mpCost: isSkill ? mpCost : 0, mpGain: atkMpGain });
    if (isSkill && activeUnit?.id && pickedSkill?.id) {
      setSkillMasteryMap((prev) => incSkillUses(prev, activeUnit.id, pickedSkill.id, 1));
      setDailyQ((s) => {
        const qid = 'skill_casts';
        if (!s?.picked?.includes(qid)) return s;
        const def = DAILY_QUEST_DEFS[qid];
        const now = loadDailyQuestsState();
        if (now.date !== s.date) return now;
        const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
        return { ...s, prog: { ...(s.prog ?? {}), [qid]: Math.min(def.target, p + 1) } };
      });
    }

    // 合體技代價：夥伴也進入硬直（行動條推到更後面）
    if (isSkill && pickedSkill?.combo?.partnerId) {
      const pid = pickedSkill.combo.partnerId;
      const partner = newH.find((h) => h.id === pid);
      if (partner && (partner.curHp ?? 0) > 0) {
        const spd = getEffectiveSpd(partner);
        newH = newH.map((h) => (h.id === pid ? { ...h, av: (h.av ?? 0) + 10000 / spd } : h));
        setHeroes(newH);
      }
    }

    await new Promise((r) => setTimeout(r, 600));
    if (strippedM.every((m) => m.curHp <= 0)) grantVictory(strippedM);
    else advanceTurn(newH, strippedM, activeUnit.id);
  };

  const onGuard = () => {
    if (isProcessing) return;
    unlockAudio();
    SFX.uiClick();
    setIsProcessing(true);
    const guardHeroId = activeUnit.id;
    const newH = heroes.map((h) =>
      h.id === activeUnit.id
        ? { ...h, status: 'guard', guardStartTurnSeq: turnSeq, guardNoHitRewardedSeq: -1, av: h.av + 10000 / getEffectiveSpd(h) }
        : h
    );
    setHeroes(newH);
    setLogs([`${activeUnit.name} 進入防禦狀態`, ...logs].slice(0, 5));
    setTimeout(() => advanceTurn(newH, monsters, guardHeroId), 500);
  };

  useEffect(() => {
    if (scene === 'battle' && activeUnit && !activeUnit.isHero && !isProcessing) {
      const monsterAI = async () => {
        setIsProcessing(true);
        await new Promise((r) => setTimeout(r, 1000));
        const aliveH = heroes.filter((h) => h.curHp > 0);
        if (aliveH.length === 0) return;

        if ((activeUnit.battlePassive ?? '') === 'lavaCore') {
          unlockAudio();
          SFX.skill();
          const giant = monsters.find((m) => isLavaGiantTemplateId(monsterTemplateId(m.id)) && m.curHp > 0);
          let newM = monsters;
          if (giant) {
            const heal = Math.max(1, Math.floor(giant.hp * 0.055));
            newM = monsters.map((m) => (m.id === giant.id ? { ...m, curHp: Math.min(m.hp, m.curHp + heal) } : m));
            setMonsters(newM);
            setLogs([`熔岩核心脈動：熔岩巨人回復 ${heal} HP。`, ...logs].slice(0, 5));
          } else {
            setLogs([`熔岩核心脈動：只剩餘燼的嗡鳴……`, ...logs].slice(0, 5));
          }
          const nextAv = activeUnit.av + 10000 / getEffectiveSpd(activeUnit);
          const newM2 = newM.map((m) =>
            m.id === activeUnit.id
              ? { ...m, av: nextAv, curMp: Math.min(MP_MAX, (m.curMp ?? 0) + MONSTER_ATK_MP_GAIN) }
              : m,
          );
          setMonsters(newM2);
          if (heroes.every((h) => h.curHp <= 0)) setScene('defeat');
          else advanceTurn(heroes, newM2, null, activeUnit.id);
          return;
        }

        const taunter = aliveH.find((h) => (h.tauntTurns ?? 0) > 0);
        const target = taunter ?? aliveH[Math.floor(Math.random() * aliveH.length)];

        const applyAilmentOnHero = (u, ail) => {
          if (!u || u.curHp <= 0 || !ail) return u;
          const ok = typeof ail.chance === 'number' ? Math.random() < Math.max(0, Math.min(1, ail.chance)) : true;
          if (!ok) return u;
          if (ail.type === 'poison') return applyPoisonOnTarget(u, ail.turns);
          if (ail.type === 'burn') return applyBurnOnTarget(u, ail.stacks);
          if (ail.type === 'darkness') return applyDarknessOnTarget(u, ail.turns);
          if (ail.type === 'stun') return applyStunOnTarget(u, ail.turns);
          return u;
        };

        const skillSet = getMonsterSkillSet(activeUnit);
        const usable = skillSet.filter((s) => s && (activeUnit.curMp ?? 0) >= (s.mpCost ?? 0));
        const chooseSkill = () => {
          if (usable.length === 0) return null;
          const filtered = usable.filter((s) => {
            if (s?.effect?.type === 'selfBuff') {
              if (s.effect.stat === 'atk' && (activeUnit.atkBuffTurns ?? 0) > 0) return false;
              if (s.effect.stat === 'def' && (activeUnit.defBuffTurns ?? 0) > 0) return false;
            }
            return true;
          });
          const pool = filtered.length > 0 ? filtered : usable;
          const all = pool.filter((s) => s?.effect?.type === 'damage' && s.effect.target === 'enemy-all');
          if (all.length > 0 && Math.random() < 0.22) return all[Math.floor(Math.random() * all.length)];
          return pool[Math.floor(Math.random() * pool.length)];
        };
        const mSkill = chooseSkill();
        const useSkill = !!mSkill && Math.random() < 0.75;
        const effect = useSkill ? mSkill?.effect : null;
        const mOnHitAilment = useSkill && effect?.type === 'damage' ? (effect.ailment ?? null) : null;
        const mDebuff = useSkill && effect?.type === 'damage' ? (effect.debuff ?? null) : null;
        const applyDebuffOnHero = (u, deb) => {
          if (!u || u.curHp <= 0 || !deb) return u;
          const stat = deb.stat;
          const mul = typeof deb.mul === 'number' ? deb.mul : 1;
          const turns = Math.max(1, Math.floor(Number(deb.turns) || 1));
          const ok = typeof deb.chance === 'number' ? Math.random() < Math.max(0, Math.min(1, deb.chance)) : true;
          if (!ok) return u;
          if (stat === 'atk') return { ...u, atkDownTurns: Math.max(u.atkDownTurns ?? 0, turns), atkDownMul: Math.min(u.atkDownMul ?? 1, mul) };
          if (stat === 'def')
            return { ...u, defDownTurns: Math.max(u.defDownTurns ?? 0, turns), defDownMul: Math.min(u.defDownMul ?? 1, mul) };
          if (stat === 'spd') return { ...u, spdDownTurns: Math.max(u.spdDownTurns ?? 0, turns), spdDownMul: Math.min(u.spdDownMul ?? 1, mul) };
          if (stat === 'def+mdef')
            return {
              ...u,
              defDownTurns: Math.max(u.defDownTurns ?? 0, turns),
              defDownMul: Math.min(u.defDownMul ?? 1, mul),
              mdefDownTurns: Math.max(u.mdefDownTurns ?? 0, turns),
              mdefDownMul: Math.min(u.mdefDownMul ?? 1, mul),
            };
          return u;
        };

        unlockAudio();

        if (useSkill && (effect?.type === 'selfBuff' || effect?.type === 'allyBuff')) {
          const stat = effect.stat;
          const mul = effect.mul ?? 1;
          const turns = effect.turns ?? 2;
          const nextMonstAv = activeUnit.av + 10000 / getEffectiveSpd(activeUnit);
          const nextMonstMp = Math.max(0, (activeUnit.curMp ?? 0) - (mSkill.mpCost ?? 0));
          let newM;
          let logTarget = activeUnit.name;
          if (effect.type === 'selfBuff') {
            const patch = stat === 'atk' ? { atkBuffTurns: turns, atkBuffMul: mul } : { defBuffTurns: turns, defBuffMul: mul };
            newM = monsters.map((m) =>
              m.id === activeUnit.id ? { ...m, ...patch, av: nextMonstAv, curMp: nextMonstMp } : m
            );
          } else {
            const allies = monsters.filter((m) => m.id !== activeUnit.id && m.curHp > 0);
            const buffTarget = allies.length > 0 ? allies[Math.floor(Math.random() * allies.length)] : null;
            logTarget = buffTarget?.name ?? activeUnit.name;
            const patch = stat === 'atk' ? { atkBuffTurns: turns, atkBuffMul: mul } : { defBuffTurns: turns, defBuffMul: mul };
            newM = monsters.map((m) => {
              if (m.id === activeUnit.id) return { ...m, av: nextMonstAv, curMp: nextMonstMp };
              if (buffTarget && m.id === buffTarget.id) return { ...m, ...patch };
              return m;
            });
          }
          setMonsters(newM);
          const buffLabel = stat === 'atk' ? '攻擊' : '防禦';
          setLogs([`${activeUnit.name} 施放「${mSkill.name}」：${logTarget} ${buffLabel}提升！`, ...logs].slice(0, 5));
          advanceTurn(heroes, newM, null, activeUnit.id);
          return;
        }

        let newH = heroes;
        if (useSkill && effect?.type === 'damage' && effect.target === 'enemy-all') {
          SFX.skill();
          const alive = heroes.filter((h) => h.curHp > 0);
          const hits = alive.map((h) => {
            const r = resolveSkillDamage({ caster: activeUnit, target: h, skill: mSkill, getDamage });
            return { id: h.id, dmg: r.damage, crit: r.crit };
          });
          const prevBarrier = Object.fromEntries(heroes.map((h) => [h.id, { turns: h.barrierTurns ?? 0, source: h.barrierSource ?? null }]));
          newH = heroes.map((h) => {
            const hh = hits.find((x) => x.id === h.id);
            if (!hh) return h;
            const aliveBefore = h.curHp > 0;
            const nextHp = Math.max(0, h.curHp - hh.dmg);
            const alreadyGained = h.lastHitMpTurn === turnSeq;
            const hitGain = h.status === 'guard' ? HIT_MP_GAIN_GUARD : HIT_MP_GAIN_NO_GUARD;
            const mpAdd = !alreadyGained && aliveBefore ? hitGain : 0;
            const baseNext = {
              ...h,
              curHp: nextHp,
              curMp: Math.min(MP_MAX, h.curMp + mpAdd),
              lastHitMpTurn: alreadyGained ? h.lastHitMpTurn : turnSeq,
            };
            return applyDebuffOnHero(applyAilmentOnHero(baseNext, mOnHitAilment), mDebuff);
          });
          // h6 天賦：被異常怪物攻擊時回 MP（只看 h6 本人）
          {
            const def = getMpOnHitByAilmentedEnemyFromTalents(talentMap, 'butiya_halloween');
            const attackerHasAil =
              (activeUnit.burnTurns ?? 0) > 0 ||
              (activeUnit.poisonTurns ?? 0) > 0 ||
              (activeUnit.freezeTurns ?? 0) > 0 ||
              (activeUnit.darknessTurns ?? 0) > 0 ||
              (activeUnit.dazzleTurns ?? 0) > 0 ||
              (activeUnit.stunTurns ?? 0) > 0;
            if (def && attackerHasAil) {
              const b = newH.find((h) => h.id === 'butiya_halloween');
              if (b && b.curHp > 0) {
                const used = (b.h6MpOnHitTurnSeq ?? -1) === turnSeq ? Math.max(0, b.h6MpOnHitUsed ?? 0) : 0;
                const left = Math.max(0, def.perTurnCap - used);
                if (left > 0) {
                  newH = newH.map((h) =>
                    h.id === 'butiya_halloween'
                      ? {
                          ...h,
                          curMp: Math.min(MP_MAX, (h.curMp ?? 0) + def.mp),
                          h6MpOnHitTurnSeq: turnSeq,
                          h6MpOnHitUsed: used + 1,
                        }
                      : h
                  );
                }
              }
            }
          }
          {
            const directHits = hits.filter((x) => (x.dmg ?? 0) > 0).length;
            const res = applyBubuMpOnAllyDirectDamage(newH, directHits);
            newH = res.heroesNext;
          }
          for (const hh of hits) newH = tickBarrierOnHit(newH, hh.id);
          // 虎吉被動：受到攻擊時低機率暈眩攻擊者（怪物）；全體攻擊時任一命中即可觸發一次
          {
            const anyTriggered = hits.some((hh) => {
              const hitHero = newH.find((h) => h.id === hh.id);
              const eff = hitHero?.passive?.effect;
              const chance = eff?.type === 'stunOnBeingHit' ? Number(eff.chance) || 0 : 0;
              const turns = eff?.type === 'stunOnBeingHit' ? Math.max(1, Math.floor(Number(eff.turns) || 1)) : 0;
              if (!(chance > 0) || !(turns > 0)) return false;
              if ((hitHero?.curHp ?? 0) <= 0) return false;
              return Math.random() < Math.max(0, Math.min(1, chance));
            });
            if (anyTriggered && activeUnit?.curHp > 0) {
              setMonsters((prev) =>
                prev.map((m) => (m.id === activeUnit.id && m.curHp > 0 ? applyStunOnTarget(m, 1) : m))
              );
              setLogs((prev) => [`厚實肚肚：${activeUnit.name} 暈眩（1 回合）`, ...prev].slice(0, 5));
            }
          }
          for (const hh of hits) {
            const prev = prevBarrier[hh.id];
            const next = newH.find((h) => h.id === hh.id);
            if (!prev || !next) continue;
            if ((prev.turns ?? 0) > 0 && (next.barrierTurns ?? 0) === 0 && prev.source === 'h3-1') {
              const mpBack = getBarrierBreakMpFromTalents({ talentMap, heroId: hh.id, skillId: 'h3-1' });
              if (mpBack > 0) newH = newH.map((h) => (h.id === hh.id ? { ...h, curMp: Math.min(MP_MAX, (h.curMp ?? 0) + mpBack) } : h));
            }
          }
          setHeroes(newH);
          const total = hits.reduce((s, x) => s + x.dmg, 0);
          const anyCrit = hits.some((x) => x.crit);
          const critNote = anyCrit ? '（含暴擊）' : '';
          setLogs([`${activeUnit.name} 施放「${mSkill.name}」：全體造成總計 ${total} 傷害${critNote}`, ...logs].slice(0, 5));
        } else {
          const dmgRes = useSkill ? resolveSkillDamage({ caster: activeUnit, target, skill: mSkill, getDamage }) : getDamage(activeUnit, target, false);
          const dmg = dmgRes.damage;
          const mobCrit = dmgRes.crit;
          if (target.status === 'guard') SFX.guardHit();
          else SFX.attack();
          const prevTarget = heroes.find((h) => h.id === target.id);
          const prevBarrierTurns = prevTarget?.barrierTurns ?? 0;
          const prevBarrierSource = prevTarget?.barrierSource ?? null;
          newH = heroes.map((h) => {
            if (h.id !== target.id) return h;
            const aliveBefore = h.curHp > 0;
            const nextHp = Math.max(0, h.curHp - dmg);
            const alreadyGained = h.lastHitMpTurn === turnSeq;
            const hitGain = h.status === 'guard' ? HIT_MP_GAIN_GUARD : HIT_MP_GAIN_NO_GUARD;
            const mpAdd = !alreadyGained && aliveBefore ? hitGain : 0;
            const baseNext = {
              ...h,
              curHp: nextHp,
              curMp: Math.min(MP_MAX, h.curMp + mpAdd),
              lastHitMpTurn: alreadyGained ? h.lastHitMpTurn : turnSeq,
            };
            return applyDebuffOnHero(applyAilmentOnHero(baseNext, mOnHitAilment), mDebuff);
          });
          // 虎吉被動：受到攻擊時低機率暈眩攻擊者（怪物）
          {
            const hitHero = newH.find((h) => h.id === target.id);
            const eff = hitHero?.passive?.effect;
            const chance = eff?.type === 'stunOnBeingHit' ? Number(eff.chance) || 0 : 0;
            const turns = eff?.type === 'stunOnBeingHit' ? Math.max(1, Math.floor(Number(eff.turns) || 1)) : 0;
            if (chance > 0 && turns > 0 && activeUnit?.curHp > 0 && Math.random() < Math.max(0, Math.min(1, chance))) {
              setMonsters((prev) =>
                prev.map((m) => (m.id === activeUnit.id && m.curHp > 0 ? applyStunOnTarget(m, turns) : m))
              );
              setLogs((prev) => [`厚實肚肚：${activeUnit.name} 暈眩（${turns} 回合）`, ...prev].slice(0, 5));
            }
          }
          // h6 天賦：被異常怪物攻擊時回 MP（只看 h6 本人）
          {
            const def = getMpOnHitByAilmentedEnemyFromTalents(talentMap, 'butiya_halloween');
            const attackerHasAil =
              (activeUnit.burnTurns ?? 0) > 0 ||
              (activeUnit.poisonTurns ?? 0) > 0 ||
              (activeUnit.freezeTurns ?? 0) > 0 ||
              (activeUnit.darknessTurns ?? 0) > 0 ||
              (activeUnit.dazzleTurns ?? 0) > 0 ||
              (activeUnit.stunTurns ?? 0) > 0;
            if (def && attackerHasAil && target?.id === 'butiya_halloween') {
              const b = newH.find((h) => h.id === 'butiya_halloween');
              if (b && b.curHp > 0) {
                const used = (b.h6MpOnHitTurnSeq ?? -1) === turnSeq ? Math.max(0, b.h6MpOnHitUsed ?? 0) : 0;
                const left = Math.max(0, def.perTurnCap - used);
                if (left > 0) {
                  newH = newH.map((h) =>
                    h.id === 'butiya_halloween'
                      ? {
                          ...h,
                          curMp: Math.min(MP_MAX, (h.curMp ?? 0) + def.mp),
                          h6MpOnHitTurnSeq: turnSeq,
                          h6MpOnHitUsed: used + 1,
                        }
                      : h
                  );
                }
              }
            }
          }
          {
            const directHits = (dmg ?? 0) > 0 ? 1 : 0;
            const res = applyBubuMpOnAllyDirectDamage(newH, directHits);
            newH = res.heroesNext;
          }
          newH = tickBarrierOnHit(newH, target.id);
          // 天賦：守護盾護盾被擊破回 MP（回的是被護盾保護的角色）
          const nextTarget = newH.find((h) => h.id === target.id);
          const nextBarrierTurns = nextTarget?.barrierTurns ?? 0;
          if (prevBarrierTurns > 0 && nextBarrierTurns === 0 && prevBarrierSource === 'h3-1') {
            const mpBack = getBarrierBreakMpFromTalents({ talentMap, heroId: target.id, skillId: 'h3-1' });
            if (mpBack > 0) {
              newH = newH.map((h) => (h.id === target.id ? { ...h, curMp: Math.min(MP_MAX, (h.curMp ?? 0) + mpBack) } : h));
            }
          }
          setHeroes(newH);
          const skillLabel = useSkill && mSkill ? `施放「${mSkill.name}」` : '撞擊了';
          const critMark = mobCrit ? '（暴擊！）' : '';
          setLogs([`${activeUnit.name} ${skillLabel} ${target.name}，造成 ${dmg} 傷害${critMark}`, ...logs].slice(0, 5));
        }
        const nextAv = activeUnit.av + 10000 / getEffectiveSpd(activeUnit);
        const newM = monsters.map((m) =>
          m.id === activeUnit.id
            ? {
                ...m,
                av: nextAv,
                curMp: Math.min(
                  MP_MAX,
                  (useSkill && mSkill ? Math.max(0, (m.curMp ?? 0) - (mSkill.mpCost ?? 0)) : (m.curMp ?? 0)) +
                    (!useSkill ? MONSTER_ATK_MP_GAIN : 0)
                ),
              }
            : m
        );
        setMonsters(newM);
        if (newH.every((h) => h.curHp <= 0)) setScene('defeat');
        else advanceTurn(newH, newM, null, activeUnit.id);
      };
      monsterAI();
    }
  }, [activeUnit, scene, isProcessing]);

  useEffect(() => {
    if (scene !== 'battle') {
      setShowExitModal(false);
      setSkillInfo(null);
      setPassiveInfo(null);
    }
  }, [scene]);

  useEffect(() => {
    if (scene !== 'story') return;
    setStoryLineIdx(0);
  }, [scene, storyStageId]);

  const getStatusUnit = () => {
    if (statusFocus?.side === 'hero') return heroes.find((h) => h.id === statusFocus.id) ?? null;
    if (statusFocus?.side === 'monster') return monsters.find((m) => m.id === statusFocus.id) ?? null;
    return activeUnit;
  };

  const statusUnit = getStatusUnit();

  const performAccountReset = () => {
    // 允許大小寫與前後空白，避免手機/輸入法導致「看起來一樣但比對失敗」
    const confirm = String(resetConfirmInput ?? '').trim().toLowerCase();
    if (confirm !== 'reset') {
      setResetConfirmError('請輸入 reset（可忽略大小寫與前後空白）以確認');
      return;
    }
    setPartyNotice('重置中…');
    clearPartyStorage();
    clearHeroXpStorage();
    clearGoldStorage();
    clearStarCrystalStorage();
    clearStarWishStorage();
    clearMusicStorage();
    clearHeroEquipStorage();
    clearEquipInventory();
    clearItemInventory();
    clearHeroUnlockStorage();
    clearStageProgressStorage();
    clearBossLootStorage();
    clearExpStageEntryStorage();
    clearGoldStageEntryStorage();
    clearTalentStorage();
    clearTalentRow4ProgressStorage();
    clearDailyQuestsStorage();
    clearGardenPlotsStorage();
    clearFishCodexStorage();
    clearMiningDailyStorage();
    clearHuntingDailyStorage();
    clearCampRecipeStorage();
    clearSkillMasteryStorage();
    clearLobbyBgStorage();
    clearLobbyHeroStorage();
    setGold(0);
    setStarCrystals(0);
    setStarWishDiscountPulls(0);
    setStarWishLastMsg('');
    setHeroEquipV2(loadHeroEquipMapV2());
    setEquipModalHeroId(null);
    setEquipInv(loadEquipInventory());
    setItemInv(loadItemInventory());
    setGardenPlots(loadGardenPlots());
    setFishCodex(loadFishCodex());
    setPartyIds(loadPartyIds());
    setCampOwnedRecipeIds(loadCampRecipeOwnedIds());
    setAllHeroesUnlocked(loadAllHeroesUnlocked());
    setUnlockedHeroIds(loadUnlockedHeroIds());
    setCompletedStageIds(loadCompletedStageIds());
    setExpRunsLeft(getExpStageRunsLeft());
    setGoldRunsLeft(getGoldStageRunsLeft());
    setTalentMap(loadTalentMap());
    setTalentR4Prog(loadTalentRow4Progress());
    setSkillMasteryMap(loadSkillMasteryMap());
    setDailyQ(loadDailyQuestsState());
    setSelectedChapterId('ch-0');
    setSelectedStageId('stage-0');
    setStageNotice('');
    setStoryStageId(null);
    setStoryLineIdx(0);
    setPartyNotice('帳號已重置：隊伍與等級／經驗已還原為預設。');
    setVictoryXpReport(null);
    setVictoryGoldGain(0);
    setVictoryXpFootnote('');
    setVictoryGoldFootnote('');
    setVictoryStarCrystalLine('');
    setResetAccountModalOpen(false);
    setResetConfirmInput('');
    setResetConfirmError('');
    setSettingsMenuOpen(false);
    setShowExitModal(false);
    setScene('lobby');
    setLobbyBgId(loadLobbyBgId());
    setLobbyHeroId(getInitialLobbyHeroId());
  };

  const getInstanceByEid = (eid) => (equipInstances ?? []).find((x) => x.eid === eid) ?? null;

  const equipForHeroV2 = (heroId) => heroEquipV2?.[heroId] ?? { weaponEid: null, offhandEid: null, armorEid: null };

  const equipItemIdsForHero = (heroId) => {
    const e = equipForHeroV2(heroId);
    const w = getInstanceByEid(e.weaponEid);
    const o = getInstanceByEid(e.offhandEid);
    const a = getInstanceByEid(e.armorEid);
    return { weaponId: w?.itemId ?? null, offhandId: o?.itemId ?? null, armorId: a?.itemId ?? null };
  };

  const equippedEidOwner = useMemo(() => {
    const map = {};
    for (const hid of HEROES_BASE.map((h) => h.id)) {
      const e = heroEquipV2?.[hid];
      if (!e) continue;
      if (e.weaponEid) map[e.weaponEid] = hid;
      if (e.offhandEid) map[e.offhandEid] = hid;
      if (e.armorEid) map[e.armorEid] = hid;
    }
    return map;
  }, [heroEquipV2]);

  const formatAffixZh = (a) => {
    const stat = a?.stat;
    const v = Math.floor(Number(a?.value) || 0);
    const nameMap = {
      hp: 'HP',
      atk: '攻擊',
      matk: '魔力',
      def: '物防',
      mdef: '魔抗',
      spd: '速度',
      critRateAdd: '爆擊率',
      critDmgMul: '爆擊傷害',
      skillDmgMul: '技能傷害',
      incomingDmgMul: '減傷',
      ccHitAdd: '控制命中',
      ailResistAdd: '異常抗性',
    };
    const nm = nameMap[stat] ?? String(stat || '');
    if (stat === 'incomingDmgMul' || stat === 'ccHitAdd' || stat === 'ailResistAdd') return `${nm}+${v}%`;
    if (stat === 'critRateAdd' || stat === 'critDmgMul' || stat === 'skillDmgMul') return `${nm}+${v}%`;
    return `${nm}+${v}`;
  };

  const renderFacilityNpcHeader = (kind) => {
    const map = {
      forge: {
        name: '赫里斯',
        title: '鍛造所管理人',
        badge: 'Forge',
        cls: 'from-amber-500/15 via-slate-950/60 to-orange-900/20',
        lines: ['「想要更好的詞條？給我金幣，我給你火花。」', '「想指定一條？價錢更高，但成功率由我保。」', '（點一下我，換一句）'],
      },
      training: {
        name: '洛薇',
        title: '訓練場教官',
        badge: 'Train',
        cls: 'from-emerald-500/12 via-slate-950/60 to-sky-900/20',
        lines: ['「熟練度是用汗換的。你出錢，我出方法。」', '「今天練慢一點，明天你就會更痛。」', '（點一下我，換一句）'],
      },
      camp: {
        name: '米菈',
        title: '餐酒館掌櫃',
        badge: 'Tavern',
        cls: 'from-violet-500/12 via-slate-950/60 to-fuchsia-900/20',
        lines: ['「先喝一杯再上路吧。料理的力量，會在戰鬥一開始替你守住節奏。」', '「想打得更穩？先把胃跟心都暖起來。」', '（點一下我，換一句）'],
      },
      garden: {
        name: '奧凜',
        title: '休憩園管園人',
        badge: 'Garden',
        cls: 'from-lime-500/10 via-slate-950/60 to-emerald-900/18',
        lines: [
          '「這裡不趕路，只趕得走疲憊。想種子發芽、想浮標沉一下，都隨你。」',
          '「釣上來的寧靜、採下來的鮮味，以後都會回進你們的鍋邊與戰邊。」',
          '（點一下我，換一句）',
        ],
      },
    };
    const d = map[kind] ?? map.camp;
    const k = kind === 'forge' || kind === 'training' || kind === 'camp' || kind === 'garden' ? kind : 'camp';
    const idx0 = Math.max(0, Math.floor(Number(facilityNpcTalkIdx?.[k] ?? 0)));
    const lines = Array.isArray(d.lines) && d.lines.length ? d.lines : ['……'];
    const idx = idx0 % lines.length;
    return (
      <div className="mt-3 grid grid-cols-[80px,1fr] gap-3 items-stretch">
        <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${d.cls} p-2 flex items-center justify-center`}>
          <div className="h-14 w-14 rounded-2xl border border-white/15 bg-black/20 flex items-center justify-center">
            <span className="text-[11px] font-black text-slate-200 tracking-wide">{d.badge}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFacilityNpcTalkIdx((s) => ({ ...(s ?? {}), [k]: (Number(s?.[k] ?? 0) + 1) % Math.max(1, lines.length) }))}
          className="text-left rounded-2xl border border-white/10 bg-black/35 p-3 hover:bg-black/45 active:scale-[0.995] transition-all"
          title="點一下輪播對話"
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Dialogue</p>
          <p className="text-[11px] font-black text-slate-200 mt-2 leading-tight">
            {d.name} <span className="text-slate-500 font-bold">· {d.title}</span>
          </p>
          <p className="text-[11px] font-bold text-slate-200/90 leading-relaxed mt-1 whitespace-pre-wrap">{lines[idx]}</p>
          <p className="text-[9px] font-black text-slate-600 mt-2 tabular-nums">
            {idx + 1}/{lines.length}
          </p>
        </button>
      </div>
    );
  };

  const setEquipForHeroV2 = (heroId, patch) => {
    setHeroEquipV2((prev) => ({ ...(prev ?? {}), [heroId]: { ...(prev?.[heroId] ?? { weaponEid: null, offhandEid: null, armorEid: null }), ...patch } }));
  };

  const canEquipEid = (eid, heroId) => {
    if (!eid) return true;
    const owner = equippedEidOwner?.[eid] ?? null;
    return !owner || owner === heroId;
  };

  const buyEquip = (itemId) => {
    if (getShopPrismCount() < 2) {
      setShopDialog('「想買裝備？等你帶著兩顆淨化稜晶再來找我。」');
      return;
    }
    const it = getEquipItem(itemId);
    if (!it) return;
    if ((equipInstances?.length ?? 0) >= EQUIP_INSTANCE_CAP) {
      setShopDialog(`「你的裝備背包已滿（上限 ${EQUIP_INSTANCE_CAP}）。先去賣掉一些再來買吧。」`);
      return;
    }
    if (gold < (it.price ?? 0)) {
      setShopDialog(`「金幣不夠喔。${it.name} 需要 ${it.price} 金。」`);
      return;
    }
    setGold((g) => g - it.price);
    setEquipInstances((list) => [...(Array.isArray(list) ? list : []), { eid: `eq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`, itemId: it.id, affixes: [], salt: 0, locked: false }]);
    setShopDialog(`「成交！你買下了 ${it.name}。」`);
  };

  const sellEquip = (eid) => {
    if (getShopPrismCount() < 2) {
      setShopDialog('「裝備買賣也要等你湊齊兩顆淨化稜晶再說。」');
      return;
    }
    const inst = getInstanceByEid(eid);
    const it = getEquipItem(inst?.itemId);
    if (!it) return;
    const owner = equippedEidOwner?.[eid] ?? null;
    if (owner) {
      const nm = HEROES_BASE.find((h) => h.id === owner)?.name ?? owner;
      setShopDialog(`「這件 ${it.name} 目前正由 ${nm} 裝備中，先卸下再賣吧。」`);
      return;
    }
    const gain = getEquipSellPrice(it);
    setGold((g) => g + gain);
    setEquipInstances((list) => (Array.isArray(list) ? list.filter((x) => x.eid !== eid) : []));
    setShopDialog(`「我收下了。${it.name}（#${String(eid).slice(-4)}）賣出 +${gain} 金。」`);
  };

  const buyItem = (itemId) => {
    const it = getItem(itemId);
    if (!it) return;
    if (!canBuyItemInShop(itemId)) {
      setShopDialog('「這件貨還不賣；先去湊齊淨化稜晶吧。」');
      return;
    }
    if ((it.price ?? 0) <= 0) return;
    const cap = getItemMaxStack(it);
    if (cap < 999 && getInvCount(itemInv, itemId) >= cap) {
      setShopDialog(`「${it.name} 你身上已經帶滿了（最多 ${cap}）。」`);
      return;
    }
    if (gold < (it.price ?? 0)) {
      setShopDialog(`「金幣不夠喔。${it.name} 需要 ${it.price} 金。」`);
      return;
    }
    setGold((g) => g - it.price);
    setItemInv((inv) => incInv(inv, it.id, 1));
    setShopDialog(`「${it.name} 已放入背包。」`);
  };

  const sellItem = (itemId) => {
    const it = getItem(itemId);
    if (!it) return;
    const owned = getInvCount(itemInv, itemId);
    if (owned <= 0) return;
    const gain = getItemSellPrice(it);
    if (gain <= 0) {
      setShopDialog(`「這個我不收。${it.name} 是重要物品。」`);
      return;
    }
    setGold((g) => g + gain);
    setItemInv((inv) => incInv(inv, it.id, -1));
    setShopDialog(`「好的。${it.name} 賣出 +${gain} 金。」`);
  };

  useEffect(() => {
    // keep localStorage + sfx module in sync
    setSfxEnabled(sfxEnabled);
    setSfxVolume(sfxVolume);
  }, [sfxEnabled, sfxVolume]);

  useEffect(() => {
    saveMusicSettings({ enabled: musicEnabled, volume: musicVolume });
    BGM.setEnabled(musicEnabled);
    BGM.setVolume(musicVolume);
  }, [musicEnabled, musicVolume]);

  const isBossStageId = (stageId) => String(stageId || '').includes('boss');

  useEffect(() => {
    if (!musicEnabled) return;

    // one-shots
    if (scene === 'victory') {
      BGM.playOneShot('victory');
      return;
    }
    if (scene === 'defeat') {
      BGM.playOneShot('defeat');
      return;
    }

    // loops
    if (scene === 'battle') {
      BGM.playLoop(isBossStageId(selectedStageId) ? 'boss' : 'battle');
      return;
    }
    if (scene === 'shop') {
      BGM.playLoop('shop');
      return;
    }
    if (scene === 'lobby' && lobbyPanelModal === 'recruit') {
      BGM.playLoop('gacha');
      return;
    }
    if (scene === 'lobby' || scene === 'story') {
      BGM.playLoop('menu');
    }
  }, [scene, selectedStageId, lobbyPanelModal, musicEnabled]);

  // Mobile browsers often block autoplay; start BGM after first user gesture.
  useEffect(() => {
    if (!musicEnabled) return;
    const onFirstGesture = async () => {
      await unlockAudio();
      if (scene === 'victory') BGM.playOneShot('victory');
      else if (scene === 'defeat') BGM.playOneShot('defeat');
      else if (scene === 'battle') BGM.playLoop(isBossStageId(selectedStageId) ? 'boss' : 'battle');
      else if (scene === 'shop') BGM.playLoop('shop');
      else if (scene === 'lobby' && lobbyPanelModal === 'recruit') BGM.playLoop('gacha');
      else if (scene === 'lobby' || scene === 'story') BGM.playLoop('menu');
    };
    window.addEventListener('pointerdown', onFirstGesture, { once: true });
    window.addEventListener('touchstart', onFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
    };
  }, [musicEnabled, scene, selectedStageId, lobbyPanelModal]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <div className="h-10 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-[10px] px-1.5 py-0.5 rounded font-black italic">AETHELGARD</div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {scene === 'lobby'
              ? 'Main Hall'
              : scene === 'party'
                ? 'Squad'
                : scene === 'stage' || scene === 'main-story' || scene === 'chapter' || scene === 'exp-stage' || scene === 'gold-stage'
                  ? 'Adventure'
                  : scene === 'use-item'
                    ? 'Items'
                  : scene === 'shop'
                    ? 'Shop'
                    : 'Battle Zone'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {scene === 'battle' ? (
            <>
              <div className="flex items-center gap-2 bg-black/40 px-2 py-0.5 rounded-full border border-white/5 text-[10px] tabular-nums shrink min-w-0">
                <span className="inline-flex items-center gap-0.5 min-w-0">
                  <Coins size={12} className="text-amber-300 shrink-0" /> {gold}
                </span>
                <span className="text-slate-600 shrink-0">|</span>
                <span className="inline-flex items-center gap-0.5 min-w-0" title="星曉晶石">
                  <Sparkles size={12} className="text-cyan-300 shrink-0" /> {starCrystals}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowExitModal(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
                aria-label="返回首頁"
                title="返回首頁"
              >
                <Home size={18} strokeWidth={2.25} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-black/40 px-2 py-0.5 rounded-full border border-white/5 text-[10px] tabular-nums">
              <span className="inline-flex items-center gap-0.5">
                <Coins size={12} className="text-amber-300" /> {gold}
              </span>
              <span className="text-slate-600">|</span>
              <span className="inline-flex items-center gap-0.5" title="星曉晶石">
                <Sparkles size={12} className="text-cyan-300" /> {starCrystals}
              </span>
            </div>
          )}
          {scene === 'lobby' ? (
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
              aria-label="術語與機制說明"
              title="術語與機制說明"
            >
              ?
            </button>
          ) : null}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsMenuOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
              aria-label="選項"
              title="選項"
            >
              <Settings size={18} strokeWidth={2.25} />
            </button>
            {settingsMenuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-[115] cursor-default bg-transparent"
                  aria-label="關閉選單"
                  onClick={() => setSettingsMenuOpen(false)}
                />
                <div className="fixed right-3 top-11 z-[120] w-60 overflow-hidden rounded-xl border border-white/15 bg-slate-900 py-1 shadow-2xl ring-1 ring-black/40">
                  <div className="px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">音效</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-300">開關</span>
                      <button
                        type="button"
                        onClick={() => {
                          unlockAudio();
                          setSfxEnabledState((v) => !v);
                        }}
                        className={`h-6 w-11 rounded-full border transition-colors ${
                          sfxEnabled ? 'bg-emerald-600/40 border-emerald-500/50' : 'bg-slate-800 border-white/10'
                        }`}
                        aria-label="音效開關"
                        title="音效開關"
                      >
                        <span
                          className={`block h-5 w-5 rounded-full bg-white/90 shadow translate-y-[1px] transition-transform ${
                            sfxEnabled ? 'translate-x-[22px]' : 'translate-x-[1px]'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-300">音量</span>
                        <span className="text-[10px] font-black text-slate-400 tabular-nums">{Math.round(sfxVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={sfxVolume}
                        onChange={(e) => {
                          unlockAudio();
                          setSfxVolumeState(Number(e.target.value));
                        }}
                        className="mt-1 w-full accent-emerald-500"
                        aria-label="音效音量"
                        title="音效音量"
                      />
                    </div>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">音樂</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-300">開關</span>
                      <button
                        type="button"
                        onClick={() => {
                          unlockAudio();
                          setMusicEnabledState((v) => !v);
                        }}
                        className={`h-6 w-11 rounded-full border transition-colors ${
                          musicEnabled ? 'bg-cyan-600/35 border-cyan-500/50' : 'bg-slate-800 border-white/10'
                        }`}
                        aria-label="音樂開關"
                        title="音樂開關"
                      >
                        <span
                          className={`block h-5 w-5 rounded-full bg-white/90 shadow translate-y-[1px] transition-transform ${
                            musicEnabled ? 'translate-x-[22px]' : 'translate-x-[1px]'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-300">音量</span>
                        <span className="text-[10px] font-black text-slate-400 tabular-nums">{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={musicVolume}
                        onChange={(e) => {
                          unlockAudio();
                          setMusicVolumeState(Number(e.target.value));
                        }}
                        className="mt-1 w-full accent-cyan-500"
                        aria-label="音樂音量"
                        title="音樂音量"
                      />
                    </div>
                  </div>
                  {scene === 'lobby' ? (
                    <>
                      <div className="h-px bg-white/10" />
                      <div className="px-3 py-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">大廳</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsMenuOpen(false);
                            setLobbyPanelModal('lobbyBg');
                          }}
                          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-800/60 px-2.5 py-2 text-left text-[11px] font-bold text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          更換大廳背景…
                        </button>
                      </div>
                    </>
                  ) : null}
                  <div className="h-px bg-white/10" />
                  <div className="px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">兌換碼</p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        value={redeemCode}
                        onChange={(e) => {
                          setRedeemCode(e.target.value);
                          setRedeemMsg('');
                        }}
                        placeholder="輸入兌換碼"
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[11px] font-bold text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const code = (redeemCode ?? '').trim().toLowerCase();
                          if (!code) return;
                          if (code === 'exp') {
                            setItemInv((inv) => incInv(inv, 'it_exp_ticket', 3));
                            setRedeemMsg('兌換成功：經驗關卡入場券 ×3 已加入背包。');
                            setRedeemCode('');
                          } else if (code === 'unlock') {
                            setAllHeroesUnlocked(true);
                            setUnlockedHeroIds(HEROES_BASE.map((h) => h.id).filter(Boolean));
                            setCompletedStageIds(CHAPTERS.flatMap((c) => c.stages ?? []).filter(Boolean));
                            setRedeemMsg('兌換成功：已解鎖全角色，且主線進度已推到最新。');
                            setRedeemCode('');
                          } else if (code === 'gold') {
                            setGold((g) => g + 9999);
                            setRedeemMsg('兌換成功：金幣 +9999。');
                            setRedeemCode('');
                          } else if (code === 'star5k') {
                            setStarCrystals((c) => c + 5000);
                            setRedeemMsg('兌換成功：星曉晶石 +5000。');
                            setRedeemCode('');
                          } else {
                            setRedeemMsg('兌換碼無效。');
                          }
                        }}
                        className="shrink-0 rounded-lg border border-emerald-500/35 bg-emerald-600/20 px-2.5 py-1.5 text-[11px] font-black text-emerald-100 hover:bg-emerald-600/30 active:scale-[0.99]"
                      >
                        兌換
                      </button>
                    </div>
                    {redeemMsg ? <p className="mt-2 text-[10px] font-bold text-amber-200 leading-snug">{redeemMsg}</p> : null}
                  </div>
                  <div className="h-px bg-white/10" />
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsMenuOpen(false);
                      setResetConfirmInput('');
                      setResetConfirmError('');
                      setResetAccountModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 text-left text-[11px] font-bold text-red-200 hover:bg-red-950/50 transition-colors"
                  >
                    重置帳號…
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {helpOpen && scene === 'lobby' ? (
        <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl border-2 border-white/10 bg-slate-900 shadow-2xl flex flex-col">
            <div className="px-5 pt-5 pb-3 border-b border-white/10 bg-slate-900/95 backdrop-blur sticky top-0 z-10 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Help</p>
                <h3 className="text-lg font-black italic text-white truncate">術語／機制說明</h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center shrink-0"
                aria-label="關閉"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto no-scrollbar space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">商店解鎖（依淨化稜晶數量）</p>
                <ul className="mt-1 space-y-1 text-[11px] font-bold text-slate-300 leading-snug">
                  <li>0 顆：治療藥水</li>
                  <li>1 顆：魔力藥水、下級修煉手冊</li>
                  <li>2 顆：裝備買賣、下級修煉手冊+、萬靈藥</li>
                  <li>3 顆：進階裝備、中級修煉手冊（Lv.30 以下升 1 級）、治癒粉塵（全體補血）、中級治療藥水</li>
                  <li>4 顆：中級魔力藥水、中級修煉手冊+（Lv.40 以下升 1 級）</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">屬性剋制</p>
                <ul className="mt-1 space-y-1 text-[11px] font-bold text-slate-300 leading-snug">
                  <li>火 → 風：傷害 ×1.2；反過來 ×0.8</li>
                  <li>風 → 水：傷害 ×1.2；反過來 ×0.8</li>
                  <li>水 → 火：傷害 ×1.2；反過來 ×0.8</li>
                  <li>暗 ↔ 光：互剋（互打皆 ×1.2）</li>
                  <li>備註：燃燒等 DOT 傷害不吃屬性剋制。</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">MP 恢復機制</p>
                <ul className="mt-1 space-y-1 text-[11px] font-bold text-slate-300 leading-snug">
                  <li>普攻後：自身 MP +10</li>
                  <li>被攻擊命中：自身 MP +10（防禦狀態則 +5；同一回合序列最多一次）</li>
                  <li>怪物普攻後：怪物 MP +10</li>
                  <li>怪物被命中：怪物 MP +5（同一回合序列最多一次）</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">行動條（速度/AV）</p>
                <p className="mt-1 text-[11px] font-bold text-slate-300 leading-snug">速度越高行動越頻繁；速度上升/下降會影響行動條推進。</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">暴擊</p>
                <p className="mt-1 text-[11px] font-bold text-slate-300 leading-snug">
                  普攻與物理技能可爆擊（可受天賦影響其他類型傷害）；「眩目」會降低暴擊能力。
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">異常狀態（常見）</p>
                <ul className="mt-1 space-y-1 text-[11px] font-bold text-slate-300 leading-snug">
                  <li>燃燒：每回合開始扣血（可疊層）。</li>
                  <li>中毒：每回合開始扣血（較低），並降低受到治療量。</li>
                  <li>冰凍：降低速度（軟控）。</li>
                  <li>黑暗：暗屬性對其增傷。</li>
                  <li>眩目：降低暴擊率/暴擊傷害。</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">天賦（3×3）</p>
                <p className="mt-1 text-[11px] font-bold text-slate-300 leading-snug">每列三選一，可隨時切換；第 3 列是角色專屬效果。</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">技能熟練度</p>
                <ul className="mt-1 space-y-1 text-[11px] font-bold text-slate-300 leading-snug">
                  <li>戰鬥中成功施放技能會累積使用次數；每 10 次升 1 階（熟練度 Lv.）。</li>
                  <li>階位上限 Lv.10：施放約 100 次可滿階，之後次數仍會累計但階位不再升；每階約 +1% 技能傷害／治療（階位部分最高約 +10%）。</li>
                  <li>達 Lv.6 可選「威力」或「省魔」分支（分別影響倍率或 MP 消耗）。</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">裝備詞條（鍛造所）</p>
                <p className="mt-1 text-[11px] font-bold text-slate-300 leading-snug">
                  「爆擊率+10%」代表額外 +10% 暴擊率（百分點，與基礎暴擊率相加；裝備來源合計封頂 +50%）。「爆擊傷害+10%」表示暴擊時的傷害倍率再提高約 10%（乘算）。減傷、控制命中、異常抗性的 +N% 亦為百分點。
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[10px] font-black text-slate-200">每日任務</p>
                <p className="mt-1 text-[11px] font-bold text-slate-300 leading-snug">
                  每天從下列類型中隨機抽出 3 項：施放技能、更換裝備、通關經驗或金錢關卡、羈絆點、鍛造所重抽詞條、訓練場買熟練包、餐酒館點餐。完成可領星曉晶石；全清有加成（面板內可見目標次數）。
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-white/10 bg-slate-900/95 backdrop-blur shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {scene === 'lobby' && (
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
              <div className="absolute inset-0" style={{ background: lobbyBgDef.fallback }} />
              <img
                key={lobbyBgDef.id}
                src={lobbyBgDef.image}
                alt=""
                decoding="async"
                draggable={false}
                className={`absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-[center_30%] max-sm:scale-[1.03] max-sm:origin-[center_30%] sm:scale-100 sm:object-center transition-opacity duration-500 ${
                  lobbyBgImgVisible ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setLobbyBgImgVisible(true)}
                onError={() => setLobbyBgImgVisible(false)}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950/55 via-slate-950/20 to-slate-950/88 max-sm:from-slate-950/40 max-sm:via-slate-950/12 max-sm:to-slate-950/60" />
            </div>
            <div className="relative z-10 flex-1 flex flex-col min-h-0">
            <div className="shrink-0 px-2 sm:px-3 pt-2 sm:pt-3 pb-1.5 sm:pb-2 space-y-2">
              <button
                type="button"
                onClick={goToMainQuestTarget}
                className="w-full text-left rounded-2xl border border-violet-500/35 bg-violet-950/35 px-3 py-2.5 transition-all hover:bg-violet-950/50 active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <ListTodo size={18} className="text-violet-300 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-violet-300/90">任務追蹤 · 主線</p>
                    {mainQuestPtr ? (
                      <>
                        <p className="text-[12px] font-black text-white mt-0.5 truncate">{mainQuestPtr.stageTitle}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{mainQuestPtr.stageSubtitle}</p>
                        {!mainQuestPtr.unlocked ? (
                          <p className="text-[9px] font-bold text-amber-300/95 mt-1">未解鎖 · 請先完成前置</p>
                        ) : (
                          <p className="text-[9px] font-bold text-violet-300/80 mt-1">點擊前往</p>
                        )}
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1 font-bold">目前無進行中目標</p>
                    )}
                  </div>
                </div>
              </button>
              {lobbyNotice ? (
                <p className="text-center text-[10px] font-black text-amber-300/95 px-2">{lobbyNotice}</p>
              ) : null}
            </div>

            <div className="flex-1 flex min-h-0">
              <div className="flex-1 flex flex-col min-h-0 min-w-0 px-0 sm:px-2 md:px-3 pb-0 min-h-0">
                <div className="relative flex-1 min-h-0 w-full min-w-0">
                  <div
                    key={lobbyBubble.tick}
                    className="absolute top-1 left-1 right-1 sm:top-2 z-20 mx-auto max-w-[min(20rem,100%)] animate-in rounded-2xl border border-white/12 bg-slate-900/85 px-3 py-2.5 sm:px-4 sm:py-3 shadow-lg"
                  >
                    <p className="text-[13px] font-bold text-slate-100 leading-relaxed text-center whitespace-pre-wrap">
                      {lobbyBubble.text || '……'}
                    </p>
                    {!lobbyBubble.text ? (
                      <p className="text-[9px] text-slate-500 mt-2 text-center">點擊立繪或等候隨機問候</p>
                    ) : null}
                  </div>
                  {(() => {
                    const lh = HEROES_BASE.find((h) => h.id === lobbyHeroId) ?? HEROES_BASE[0];
                    return (
                      <>
                        <LobbyHeroStage
                          key={lobbyHeroId}
                          hero={lh}
                          onActivate={() => showLobbyGreeting(lobbyHeroId)}
                        />
                        <div className="absolute inset-0 z-10 flex max-sm:items-end max-sm:pb-1.5 sm:items-center sm:pb-0 justify-between pointer-events-none px-0.5 sm:px-0.5">
                          <button
                            type="button"
                            onClick={() => cycleLobbyHero(-1)}
                            className="pointer-events-auto h-9 w-9 sm:h-11 sm:w-11 shrink-0 rounded-xl border border-white/15 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center text-slate-200 hover:bg-slate-900/70 active:scale-95 shadow-md"
                            aria-label="上一角色"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() => cycleLobbyHero(1)}
                            className="pointer-events-auto h-9 w-9 sm:h-11 sm:w-11 shrink-0 rounded-xl border border-white/15 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center text-slate-200 hover:bg-slate-900/70 active:scale-95 shadow-md"
                            aria-label="下一角色"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <aside className="shrink-0 w-[4.75rem] sm:w-[6.25rem] border-l border-white/10 py-2 sm:py-4 pr-1.5 sm:pr-3 flex flex-col gap-1 sm:gap-2 items-stretch">
                <button
                  type="button"
                  onClick={() => setLobbyPanelModal('daily')}
                  className="relative flex flex-col items-center gap-0.5 sm:gap-1 rounded-xl border border-white/10 bg-slate-900/50 py-2 sm:py-2.5 px-1 hover:bg-slate-800/70 active:scale-[0.98] transition-all"
                >
                  {(() => {
                    const s = dailyQ ?? loadDailyQuestsState();
                    const picked = Array.isArray(s?.picked) ? s.picked : [];
                    const isDone = (qid) => {
                      const def = DAILY_QUEST_DEFS[qid];
                      const p = Number(s?.prog?.[qid] ?? 0);
                      return p >= (def?.target ?? 0);
                    };
                    const anyClaimable = picked.some((qid) => isDone(qid) && !s?.claimed?.[qid]);
                    const allClaimed = picked.length === 3 && picked.every((qid) => !!s?.claimed?.[qid]);
                    const bonusClaimable = allClaimed && !s?.bonusClaimed;
                    const show = anyClaimable || bonusClaimable;
                    if (!show) return null;
                    return (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-rose-200/40 animate-pulse" />
                    );
                  })()}
                  <Calendar size={20} className="text-sky-400" />
                  <span className="text-[8px] font-black text-slate-300 text-center leading-tight">每日任務</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLobbyPanelModal('achievements')}
                  className="flex flex-col items-center gap-0.5 sm:gap-1 rounded-xl border border-white/10 bg-slate-900/50 py-2 sm:py-2.5 px-1 hover:bg-slate-800/70 active:scale-[0.98] transition-all"
                >
                  <Trophy size={20} className="text-amber-400" />
                  <span className="text-[8px] font-black text-slate-300 text-center leading-tight">成就</span>
                </button>
                <button
                  type="button"
                  onClick={() => (isStarWishUnlocked ? setLobbyPanelModal('recruit') : setLobbyNotice('通關第五章尾聲後開放「星曉祈願」。'))}
                  className={
                    'flex flex-col items-center gap-0.5 sm:gap-1 rounded-xl border border-white/10 bg-slate-900/50 py-2 sm:py-2.5 px-1 hover:bg-slate-800/70 active:scale-[0.98] transition-all ' +
                    (isStarWishUnlocked ? '' : 'opacity-45')
                  }
                  aria-label="星曉祈願"
                >
                  <div
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl border border-cyan-400/35 bg-gradient-to-b from-cyan-400/25 via-slate-900/90 to-violet-600/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_16px_rgba(34,211,238,0.18)]"
                    aria-hidden
                  >
                    <Sparkles className="h-[18px] w-[18px] sm:h-5 sm:w-5 text-cyan-100 drop-shadow-[0_0_6px_rgba(167,243,208,0.45)]" strokeWidth={2.35} />
                  </div>
                  <span className="text-[8px] font-black text-slate-300 text-center leading-tight">星曉祈願</span>
                </button>

                <div className="h-px bg-white/10 shrink-0" aria-hidden />

                <button
                  type="button"
                  onClick={() => setLobbyPanelModal('forge')}
                  className="flex flex-col items-center gap-0.5 sm:gap-1 rounded-xl border border-white/10 bg-slate-900/50 py-2 sm:py-2.5 px-1 hover:bg-slate-800/70 active:scale-[0.98] transition-all"
                >
                  <Hammer size={20} className="text-orange-300" />
                  <span className="text-[8px] font-black text-slate-300 text-center leading-tight">鍛造所</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLobbyPanelModal('training')}
                  className="flex flex-col items-center gap-0.5 sm:gap-1 rounded-xl border border-white/10 bg-slate-900/50 py-2 sm:py-2.5 px-1 hover:bg-slate-800/70 active:scale-[0.98] transition-all"
                >
                  <Dumbbell size={20} className="text-emerald-300" />
                  <span className="text-[8px] font-black text-slate-300 text-center leading-tight">訓練場</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLobbyPanelModal('camp')}
                  className="flex flex-col items-center gap-0.5 sm:gap-1 rounded-xl border border-white/10 bg-slate-900/50 py-2 sm:py-2.5 px-1 hover:bg-slate-800/70 active:scale-[0.98] transition-all"
                >
                  <Utensils size={20} className="text-amber-200" />
                  <span className="text-[8px] font-black text-slate-300 text-center leading-tight">餐酒館</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLobbyPanelModal('garden')}
                  className="flex flex-col items-center gap-0.5 sm:gap-1 rounded-xl border border-white/10 bg-slate-900/50 py-2 sm:py-2.5 px-1 hover:bg-slate-800/70 active:scale-[0.98] transition-all"
                >
                  <Sprout size={20} className="text-lime-300" />
                  <span className="text-[8px] font-black text-slate-300 text-center leading-tight">休憩園</span>
                </button>
              </aside>
            </div>
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
                        <span className="ml-2 text-[10px] font-black text-amber-200/85">
                          {HEROES_BASE.find((u) => u.id === partyIds[0])?.captainPassive?.description
                            ? `（${HEROES_BASE.find((u) => u.id === partyIds[0])?.captainPassive?.description}）`
                            : ''}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* 隊長技詳細說明改為長按頭像顯示完整資訊 */}
                </div>
              ) : null}
              {partyNotice ? <p className="text-[10px] text-amber-400 mt-2 font-bold">{partyNotice}</p> : null}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 pb-6">
              {(() => {
                const partyXpMap = loadHeroXpMap();
                const roster = HEROES_BASE.slice().sort((a, b) => {
                  const desired = ['Puersz', 'xiongji', 'baize', 'butiya', 'bubu', 'huji', 'moying', 'jack', 'butiya_halloween', 'bubu_harvest'];
                  const rank = new Map(desired.map((id, i) => [id, i]));
                  const ar = rank.has(a.id) ? rank.get(a.id) : 9999;
                  const br = rank.has(b.id) ? rank.get(b.id) : 9999;
                  if (ar !== br) return ar - br;
                  return HEROES_BASE.findIndex((x) => x.id === a.id) - HEROES_BASE.findIndex((x) => x.id === b.id);
                });
                return roster.map((hero) => {
                const prog = partyXpMap[hero.id] ?? defaultProgress();
                const on = partyIds.includes(hero.id);
                const isCaptain = on && partyIds[0] === hero.id;
                const cantLeave = on && partyIds.length <= MIN_PARTY;
                const cantJoin = !on && partyIds.length >= MAX_PARTY;
                const locked = !isHeroUnlocked(hero.id);
                return (
                  <div
                    key={hero.id}
                    className={`w-full flex items-stretch gap-1.5 rounded-xl border p-2 transition-colors ${
                      on
                        ? 'border-blue-500/50 bg-blue-600/15 ring-1 ring-blue-500/20'
                        : 'border-white/10 bg-slate-900/40'
                    } ${cantLeave || cantJoin || locked ? 'opacity-70' : ''}`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5">
                      <button
                        type="button"
                        className="shrink-0 rounded-full active:scale-95 transition-transform cursor-help"
                        title="長按查看完整資訊"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeroInfo({ heroId: hero.id });
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          heroInfoLongPressFiredRef.current = false;
                          if (heroInfoLongPressTimerRef.current) clearTimeout(heroInfoLongPressTimerRef.current);
                          heroInfoLongPressTimerRef.current = setTimeout(() => {
                            heroInfoLongPressFiredRef.current = true;
                            setHeroInfo({ heroId: hero.id });
                          }, 450);
                        }}
                        onPointerUp={(e) => {
                          e.stopPropagation();
                          if (heroInfoLongPressTimerRef.current) clearTimeout(heroInfoLongPressTimerRef.current);
                        }}
                        onPointerCancel={(e) => {
                          e.stopPropagation();
                          if (heroInfoLongPressTimerRef.current) clearTimeout(heroInfoLongPressTimerRef.current);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setHeroInfo({ heroId: hero.id });
                        }}
                      >
                        <HeroAvatar src={hero.avatar} name={hero.name} accentClassName={hero.color} size="lg" />
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePartyMember(hero.id)}
                        className="flex min-w-0 flex-1 flex-col items-start text-left transition-colors hover:bg-white/5 active:scale-[0.99] rounded-lg px-1.5 py-1"
                      >
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <p className={`text-xs font-black truncate min-w-0 flex-1 ${on ? 'text-blue-100' : 'text-slate-200'}`}>{hero.name}</p>
                          {(() => {
                            const t = hero.type;
                            const map = {
                              fire: { name: '火', cls: 'bg-red-500/15 text-red-200 border-red-500/25' },
                              wind: { name: '風', cls: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25' },
                              water: { name: '水', cls: 'bg-sky-500/15 text-sky-200 border-sky-500/25' },
                              dark: { name: '暗', cls: 'bg-violet-500/15 text-violet-200 border-violet-500/25' },
                              light: { name: '光', cls: 'bg-amber-500/15 text-amber-200 border-amber-500/25' },
                            };
                            const it = map[t];
                            if (!it) return null;
                            return (
                              <span className={`shrink-0 px-1.5 py-0.5 rounded-md border text-[8px] font-black ${it.cls}`}>
                                {it.name}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-[8px] font-bold text-violet-300/90 mt-0.5">
                          Lv.{prog.level} · EXP {prog.xp}/{xpRequiredForNextLevel(prog.level)}
                        </p>
                        {hero.title ? <p className="text-[9px] text-slate-500 mt-0.5 tracking-wide">「{hero.title}」</p> : null}
                        {locked ? <p className="text-[9px] font-black text-amber-200/90 mt-1">（未解鎖）</p> : null}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (locked) {
                          setPartyNotice('目前劇情進度尚未解鎖此角色。');
                          return;
                        }
                        setEquipModalHeroId(hero.id);
                      }}
                      className="flex shrink-0 flex-col items-center justify-center gap-0.5 self-center rounded-lg border border-white/10 bg-slate-950/40 px-2 py-1.5 text-[8px] font-black leading-tight text-slate-200 shadow-sm transition-colors hover:bg-slate-800/60 active:scale-95"
                      title="裝備"
                    >
                      裝備
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
                    {isCaptain ? (
                      <div
                        className="flex shrink-0 flex-col items-center justify-center gap-0.5 self-center rounded-lg border border-amber-500/45 bg-amber-600 px-2 py-1.5 text-[8px] font-black leading-tight text-amber-950 shadow-sm"
                        title="隊長"
                      >
                        <Crown size={14} strokeWidth={2.25} className="text-amber-950" />
                        隊長
                      </div>
                    ) : null}
                  </div>
                );
              });
              })()}
            </div>
          </div>
        )}

        {scene === 'stage' && (
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
              <h2 className="text-lg font-black italic text-white tracking-tight">關卡選擇</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">經驗、金幣、或從主線任務進入第0章～第6章。</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 pb-6">
              {/* 經驗關卡入口（點進去才顯示 5 關） */}
              <button
                type="button"
                onClick={() => {
                  if (!isExpStagesUnlocked()) {
                    setStageNotice('經驗關卡尚未解鎖。');
                    return;
                  }
                  setStageNotice('');
                  setScene('exp-stage');
                }}
                className={`w-full text-left rounded-2xl border p-4 transition-all active:scale-[0.99] ${
                  isExpStagesUnlocked()
                    ? 'border-violet-500/25 bg-violet-950/20 hover:bg-violet-950/30'
                    : 'border-white/10 bg-slate-900/30 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black italic text-white leading-tight">經驗關卡</p>
                    <p className="text-[9px] text-slate-500 mt-1">刷經驗用（5 種級別）</p>
                    <p className="text-[9px] text-slate-400 mt-2 leading-snug">
                      每日可刷 {EXP_STAGE_DAILY_LIMIT} 次（所有經驗關卡共用）；通關每次 +5 星曉晶石
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[9px] font-black text-violet-300/90">剩餘次數</p>
                    <p className="text-sm font-black text-violet-200 tabular-nums">
                      {expRunsLeft}/{EXP_STAGE_DAILY_LIMIT}
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isExpStagesUnlocked()) {
                    setStageNotice('金錢關卡尚未解鎖。');
                    return;
                  }
                  setStageNotice('');
                  setSelectedStageId('gl-1');
                  setScene('gold-stage');
                }}
                className={`w-full text-left rounded-2xl border p-4 transition-all active:scale-[0.99] ${
                  isExpStagesUnlocked()
                    ? 'border-amber-500/25 bg-amber-950/20 hover:bg-amber-950/30'
                    : 'border-white/10 bg-slate-900/30 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black italic text-white leading-tight">金錢關卡</p>
                    <p className="text-[9px] text-slate-500 mt-1">刷金幣用（5 隻光史萊姆 × 5 種級別）</p>
                    <p className="text-[9px] text-slate-400 mt-2 leading-snug">
                      每日可刷 {GOLD_STAGE_DAILY_LIMIT} 次（所有金錢關卡共用）；通關每次 +5 星曉晶石
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[9px] font-black text-amber-300/90">剩餘次數</p>
                    <p className="text-sm font-black text-amber-200 tabular-nums">
                      {goldRunsLeft}/{GOLD_STAGE_DAILY_LIMIT}
                    </p>
                  </div>
                </div>
              </button>

              {stageNotice ? <p className="text-[10px] text-amber-400 mt-1 font-bold">{stageNotice}</p> : null}

              <button
                type="button"
                onClick={() => {
                  setStageNotice('');
                  setScene('main-story');
                }}
                className="w-full text-left rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 transition-all hover:bg-cyan-950/30 active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black italic text-white leading-tight">主線任務</p>
                    <p className="text-[9px] text-slate-500 mt-1">第0章～第6章 · 劇情與戰鬥關卡</p>
                    <p className="text-[9px] text-cyan-200/80 mt-2 leading-snug">章節數：{CHAPTERS.length}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[9px] font-black text-cyan-300/90">進入</p>
                    <p className="text-sm font-black text-cyan-100 tabular-nums">›</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {scene === 'main-story' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)]">
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setScene('stage')}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white mb-2"
              >
                <ChevronLeft size={14} />
                返回關卡
              </button>
              <h2 className="text-lg font-black italic text-white tracking-tight">主線任務</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">第0章～第6章：選擇章節後進入關卡列表。</p>
              {stageNotice ? <p className="text-[10px] text-amber-400 mt-2 font-bold">{stageNotice}</p> : null}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 pb-6">
              {CHAPTERS.map((ch) => {
                const unlocked = isChapterUnlocked(ch.id);
                const active = selectedChapterId === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      if (!unlocked) {
                        setStageNotice('此章節尚未解鎖。');
                        return;
                      }
                      setStageNotice('');
                      setSelectedChapterId(ch.id);
                      setScene('chapter');
                    }}
                    className={`w-full text-left rounded-2xl border p-4 transition-all active:scale-[0.99] ${
                      !unlocked
                        ? 'border-white/10 bg-slate-900/30 opacity-60 cursor-not-allowed'
                        : active
                        ? 'border-blue-500/50 bg-blue-600/15 ring-1 ring-blue-500/20'
                        : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/55'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-black italic text-white leading-tight">{ch.title}</p>
                        <p className="text-[9px] text-slate-500 mt-1">{ch.subtitle}</p>
                        <p className="text-[9px] text-slate-400 mt-2 leading-snug">
                          關卡數：{(ch.stages ?? []).length}
                          {!unlocked ? <span className="ml-2 text-amber-200/90 font-black">（未解鎖）</span> : null}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[9px] font-black text-slate-400/90">進入</p>
                        <p className="text-sm font-black text-slate-200 tabular-nums">›</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {scene === 'chapter' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)]">
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setScene('main-story')}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white mb-2"
              >
                <ChevronLeft size={14} />
                返回主線
              </button>
              <h2 className="text-lg font-black italic text-white tracking-tight">
                {CHAPTERS.find((c) => c.id === selectedChapterId)?.title ?? '章節'}
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">選擇關卡後出發。</p>
              {stageNotice ? <p className="text-[10px] text-amber-400 mt-2 font-bold">{stageNotice}</p> : null}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 pb-6">
              {(CHAPTERS.find((c) => c.id === selectedChapterId)?.stages ?? [])
                .map((id) => STAGES.find((s) => s.id === id))
                .filter(Boolean)
                .map((st) => {
                  const active = selectedStageId === st.id;
                  const unlocked = isStageUnlocked(st.id);
                  const xpSum = sumMonstersXpReward(st.monsters ?? []);
                  const goldSum = sumMonstersGoldReward(st.monsters ?? []);
                  const isStory = st.kind === 'story';
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        if (!unlocked) {
                          setStageNotice('此關卡尚未解鎖。');
                          return;
                        }
                        setStageNotice('');
                        setSelectedStageId(st.id);
                      }}
                      className={`w-full text-left rounded-2xl border p-4 transition-all active:scale-[0.99] ${
                        !unlocked
                          ? 'border-white/10 bg-slate-900/30 opacity-60 cursor-not-allowed'
                          : active
                          ? 'border-blue-500/50 bg-blue-600/15 ring-1 ring-blue-500/20'
                          : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/55'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black italic text-white leading-tight">
                            {st.title}
                            {isStory ? <span className="ml-2 text-[9px] font-black text-cyan-200/90">STORY</span> : null}
                            {isStageCompleted(st.id) ? <span className="ml-2 text-[9px] font-black text-emerald-200/90">CLEAR</span> : null}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1">{st.subtitle}</p>
                          {!isStory ? (
                            <p className="text-[9px] text-slate-400 mt-2 leading-snug">
                              敵人：{(st.monsters ?? []).map((m) => m.name).join(' + ') || '—'}
                            </p>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[9px] font-black text-violet-300/90">EXP</p>
                          <p className="text-sm font-black text-violet-200 tabular-nums">{isStory ? '—' : xpSum}</p>
                          <p className="text-[9px] font-black text-amber-300/90 mt-2">金錢</p>
                          <p className="text-sm font-black text-amber-200 tabular-nums">{isStory ? '—' : goldSum}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}

              <button
                type="button"
                onClick={() => startBattle(selectedStageId)}
                className="w-full mt-2 group bg-red-600 hover:bg-red-500 p-4 rounded-2xl flex items-center justify-between shadow-xl transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <Sword className="text-white" />
                  <div className="text-left">
                    <p className="text-xs font-black italic">出發</p>
                    <p className="text-[10px] text-white/60">{STAGES.find((s) => s.id === selectedStageId)?.title ?? '—'}</p>
                  </div>
                </div>
                <Play size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        )}

        {scene === 'gold-stage' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)]">
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setScene('stage')}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white mb-2"
              >
                <ChevronLeft size={14} />
                返回關卡
              </button>
              <h2 className="text-lg font-black italic text-white tracking-tight">金錢關卡</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                選擇級別後出發（所有金錢關卡共用每日次數）。敵方為 5 隻光史萊姆。通關每次 +5 星曉晶石；已通關的級別可掃蕩略過戰鬥。
              </p>
              <p className="text-[10px] text-amber-200/90 mt-2 font-bold">
                今日剩餘：{goldRunsLeft}/{GOLD_STAGE_DAILY_LIMIT}
              </p>
              {stageNotice ? <p className="text-[10px] text-amber-400 mt-2 font-bold">{stageNotice}</p> : null}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 pb-6">
              {STAGES.filter((st) => st?.kind === 'gold').map((st) => {
                const unlocked = isStageUnlocked(st.id);
                const active = selectedStageId === st.id;
                const cleared = isStageCompleted(st.id);
                const xpSum = sumMonstersXpReward(st.monsters ?? []);
                const goldSum = sumMonstersGoldReward(st.monsters ?? []);
                return (
                  <div key={st.id} className="flex gap-2 items-stretch">
                    <button
                      type="button"
                      onClick={() => {
                        if (!unlocked) {
                          setStageNotice('此關卡尚未解鎖。');
                          return;
                        }
                        setStageNotice('');
                        setSelectedStageId(st.id);
                      }}
                      className={`min-w-0 flex-1 text-left rounded-2xl border p-4 transition-all active:scale-[0.99] ${
                        !unlocked
                          ? 'border-white/10 bg-slate-900/30 opacity-60 cursor-not-allowed'
                          : active
                            ? 'border-amber-500/50 bg-amber-600/10 ring-1 ring-amber-500/20'
                            : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/55'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black italic text-white leading-tight">{st.title}</p>
                          <p className="text-[9px] text-slate-500 mt-1">{st.subtitle}</p>
                          <p className="text-[9px] text-slate-400 mt-2 leading-snug">
                            敵人：{(st.monsters ?? []).map((m) => m.name).join(' + ') || '—'}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[9px] font-black text-amber-300/90">金錢 合計</p>
                          <p className="text-sm font-black text-amber-200 tabular-nums">{goldSum}</p>
                          <p className="text-[9px] font-black text-violet-300/90 mt-2">EXP</p>
                          <p className="text-sm font-black text-violet-200 tabular-nums">{xpSum}</p>
                        </div>
                      </div>
                    </button>
                    {unlocked && cleared ? (
                      <button
                        type="button"
                        onClick={() => sweepClearedExpGoldStage(st.id)}
                        title="掃蕩：略過戰鬥並結算（仍消耗今日次數）"
                        className="shrink-0 w-[3.1rem] self-stretch rounded-2xl border border-emerald-500/40 bg-emerald-950/45 px-1 py-2 text-[9px] font-black leading-tight text-emerald-100 shadow-sm transition-all hover:bg-emerald-900/55 active:scale-95"
                      >
                        掃蕩
                      </button>
                    ) : null}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => startBattle(selectedStageId)}
                className="w-full mt-2 group bg-red-600 hover:bg-red-500 p-4 rounded-2xl flex items-center justify-between shadow-xl transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <Sword className="text-white" />
                  <div className="text-left">
                    <p className="text-xs font-black italic">出發</p>
                    <p className="text-[10px] text-white/60">{STAGES.find((s) => s.id === selectedStageId)?.title ?? '—'}</p>
                  </div>
                </div>
                <Play size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        )}

        {scene === 'exp-stage' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_70%)]">
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setScene('stage')}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white mb-2"
              >
                <ChevronLeft size={14} />
                返回關卡
              </button>
              <h2 className="text-lg font-black italic text-white tracking-tight">經驗關卡</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                選擇級別後出發（所有經驗關卡共用每日次數）。通關每次 +5 星曉晶石；已通關的級別可掃蕩略過戰鬥。
              </p>
              <p className="text-[10px] text-slate-400 mt-2 font-bold">
                今日剩餘：{expRunsLeft}/{EXP_STAGE_DAILY_LIMIT}
              </p>
              {stageNotice ? <p className="text-[10px] text-amber-400 mt-2 font-bold">{stageNotice}</p> : null}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 py-3 space-y-2 pb-6">
              {STAGES.filter((st) => st?.kind === 'xp').map((st) => {
                const unlocked = isStageUnlocked(st.id);
                const active = selectedStageId === st.id;
                const cleared = isStageCompleted(st.id);
                const xpSum = sumMonstersXpReward(st.monsters ?? []);
                const goldSum = sumMonstersGoldReward(st.monsters ?? []);
                return (
                  <div key={st.id} className="flex gap-2 items-stretch">
                    <button
                      type="button"
                      onClick={() => {
                        if (!unlocked) {
                          setStageNotice('此關卡尚未解鎖。');
                          return;
                        }
                        setStageNotice('');
                        setSelectedStageId(st.id);
                      }}
                      className={`min-w-0 flex-1 text-left rounded-2xl border p-4 transition-all active:scale-[0.99] ${
                        !unlocked
                          ? 'border-white/10 bg-slate-900/30 opacity-60 cursor-not-allowed'
                          : active
                            ? 'border-violet-500/50 bg-violet-600/10 ring-1 ring-violet-500/20'
                            : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/55'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black italic text-white leading-tight">{st.title}</p>
                          <p className="text-[9px] text-slate-500 mt-1">{st.subtitle}</p>
                          <p className="text-[9px] text-slate-400 mt-2 leading-snug">
                            敵人：{(st.monsters ?? []).map((m) => m.name).join(' + ') || '—'}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[9px] font-black text-violet-300/90">EXP 合計</p>
                          <p className="text-sm font-black text-violet-200 tabular-nums">{xpSum}</p>
                          <p className="text-[9px] font-black text-amber-300/90 mt-2">金錢</p>
                          <p className="text-sm font-black text-amber-200 tabular-nums">{goldSum}</p>
                        </div>
                      </div>
                    </button>
                    {unlocked && cleared ? (
                      <button
                        type="button"
                        onClick={() => sweepClearedExpGoldStage(st.id)}
                        title="掃蕩：略過戰鬥並結算（仍消耗今日次數）"
                        className="shrink-0 w-[3.1rem] self-stretch rounded-2xl border border-emerald-500/40 bg-emerald-950/45 px-1 py-2 text-[9px] font-black leading-tight text-emerald-100 shadow-sm transition-all hover:bg-emerald-900/55 active:scale-95"
                      >
                        掃蕩
                      </button>
                    ) : null}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => startBattle(selectedStageId)}
                className="w-full mt-2 group bg-red-600 hover:bg-red-500 p-4 rounded-2xl flex items-center justify-between shadow-xl transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <Sword className="text-white" />
                  <div className="text-left">
                    <p className="text-xs font-black italic">出發</p>
                    <p className="text-[10px] text-white/60">{STAGES.find((s) => s.id === selectedStageId)?.title ?? '—'}</p>
                  </div>
                </div>
                <Play size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        )}

        {scene === 'use-item' && (
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
              <h2 className="text-lg font-black italic text-white tracking-tight">背包</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBackpackTab('items')}
                  className={`px-3 py-2 rounded-xl border text-[10px] font-black transition-colors ${
                    backpackTab === 'items'
                      ? 'border-blue-500/45 bg-blue-600/15 text-blue-100'
                      : 'border-white/10 bg-slate-900/40 text-slate-300 hover:bg-slate-900/55'
                  }`}
                >
                  道具
                </button>
                <button
                  type="button"
                  onClick={() => setBackpackTab('ingredients')}
                  className={`px-3 py-2 rounded-xl border text-[10px] font-black transition-colors ${
                    backpackTab === 'ingredients'
                      ? 'border-emerald-500/45 bg-emerald-600/15 text-emerald-100'
                      : 'border-white/10 bg-slate-900/40 text-slate-300 hover:bg-slate-900/55'
                  }`}
                >
                  新鮮食材
                </button>
                <button
                  type="button"
                  onClick={() => setBackpackTab('forge')}
                  className={`px-3 py-2 rounded-xl border text-[10px] font-black transition-colors ${
                    backpackTab === 'forge'
                      ? 'border-amber-500/45 bg-amber-600/15 text-amber-100'
                      : 'border-white/10 bg-slate-900/40 text-slate-300 hover:bg-slate-900/55'
                  }`}
                >
                  鍛造素材
                </button>
                <button
                  type="button"
                  onClick={() => setBackpackTab('equip')}
                  className={`px-3 py-2 rounded-xl border text-[10px] font-black transition-colors ${
                    backpackTab === 'equip'
                      ? 'border-violet-500/45 bg-violet-600/15 text-violet-100'
                      : 'border-white/10 bg-slate-900/40 text-slate-300 hover:bg-slate-900/55'
                  }`}
                >
                  裝備
                </button>
                <div className="flex-1 min-w-[1rem]" />
                {backpackTab === 'equip' ? (
                  <div className="text-[10px] font-black text-slate-300 tabular-nums">
                    裝備背包 {equipInstances?.length ?? 0}/{EQUIP_INSTANCE_CAP}
                  </div>
                ) : null}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                {backpackTab === 'items'
                  ? '僅顯示可在戰鬥外使用、且背包持有數大於 0 的道具（食材與鍛造素材改由專用分頁檢視）；重要道具固定列於最上方。'
                  : backpackTab === 'ingredients'
                    ? '菜圃收成、釣魚、狩獵等的「新鮮食材」；持有數大於 0 時顯示，於餐酒館料理等系統消耗。'
                    : backpackTab === 'forge'
                      ? '休憩園挖礦與狩獵取得的礦石、魔物素材；持有數大於 0 時顯示，於鍛造所使用。'
                      : '在此管理裝備實例；可鎖定防止誤賣（商店「出售裝備」不列出已鎖定與角色身上已裝備的實例）。'}
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4">
              {backpackTab === 'items' || backpackTab === 'ingredients' || backpackTab === 'forge' ? (
                <div className="space-y-2">
                  {(() => {
                    const bySubTab = (it) => {
                      if (backpackTab === 'items') {
                        return !isBackpackIngredientId(it.id) && !isBackpackForgeId(it.id);
                      }
                      if (backpackTab === 'ingredients') return isBackpackIngredientId(it.id);
                      return isBackpackForgeId(it.id);
                    };
                    const items = Object.values(ITEM_CATALOG)
                      .filter((it) => !canUseInBattle(it))
                      .filter((it) => getInvCount(itemInv, it.id) > 0)
                      .filter(bySubTab)
                      .sort((a, b) => {
                        const ak = a.key ? 1 : 0;
                        const bk = b.key ? 1 : 0;
                        if (bk !== ak) return bk - ak;
                        return 0;
                      });
                    if (items.length === 0) {
                      const emptyMsg =
                        backpackTab === 'ingredients'
                          ? '目前沒有新鮮食材。'
                          : backpackTab === 'forge'
                            ? '目前沒有鍛造素材。'
                            : '目前沒有可在這裡使用的持有道具。';
                      return (
                        <p className="text-center text-[11px] font-bold text-slate-500 py-10">{emptyMsg}</p>
                      );
                    }
                    const materialSub = backpackTab === 'ingredients' || backpackTab === 'forge';
                    return items.map((it) => {
                      const owned = getInvCount(itemInv, it.id);
                      const disabled = materialSub
                        ? true
                        : it.effect?.type === 'none' ||
                          it.effect?.type === 'keyItem' ||
                          it.effect?.type === 'facilityVoucher' ||
                          it.effect?.type === 'material' ||
                          it.effect?.type === 'gardenSeed';
                      return (
                        <div key={it.id} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[12px] font-black text-white truncate">{it.name}</p>
                              <p className="text-[10px] font-bold text-slate-300 mt-1 leading-snug">
                                持有 {owned} · {it.desc}
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => {
                                if (materialSub || owned <= 0) return;
                                if (it.effect?.type === 'none') return;
                                if (it.effect?.type === 'expStageTicket') {
                                  const before = getExpStageRunsLeft();
                                  const after = refillExpStageRuns(it.effect?.amount ?? 1);
                                  if (after <= before) {
                                    setStageNotice(`經驗關卡次數已滿（${after}/${EXP_STAGE_DAILY_LIMIT}）。入場券未消耗。`);
                                    setExpRunsLeft(after);
                                    return;
                                  }
                                  setItemInv((inv) => incInv(inv, it.id, -1));
                                  setStageNotice(`經驗關卡次數 +1（${after}/${EXP_STAGE_DAILY_LIMIT}）。`);
                                  setExpRunsLeft(after);
                                  return;
                                }
                                if (it.effect?.type === 'manualLevelUp') {
                                  setUseItemTargetPick({
                                    itemId: it.id,
                                    amount: it.effect?.amount ?? 1,
                                    maxLevel: it.effect?.maxLevel ?? 10,
                                  });
                                  return;
                                }
                                setItemInv((inv) => incInv(inv, it.id, -1));
                                setShopDialog(`你使用了「${it.name}」。`);
                              }}
                              className={`shrink-0 px-4 py-2 rounded-xl border text-[10px] font-black ${
                                disabled
                                  ? 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed opacity-70'
                                  : 'bg-emerald-600/25 hover:bg-emerald-600/40 border-emerald-500/35 text-emerald-100'
                              }`}
                            >
                              使用
                            </button>
                          </div>
                          {backpackTab === 'ingredients' ? (
                            <p className="text-[9px] text-slate-600 mt-2 font-bold">新鮮食材於餐酒館料理等系統消耗，無法從此處直接使用</p>
                          ) : backpackTab === 'forge' ? (
                            <p className="text-[9px] text-slate-600 mt-2 font-bold">鍛造素材於鍛造所強化與製作時消耗，無法從此處直接使用</p>
                          ) : it.effect?.type === 'none' ? (
                            <p className="text-[9px] text-slate-600 mt-2 font-bold">此道具效果尚未實裝</p>
                          ) : it.effect?.type === 'keyItem' ? (
                            <p className="text-[9px] text-slate-600 mt-2 font-bold">重要道具不可使用</p>
                          ) : it.effect?.type === 'facilityVoucher' ? (
                            <p className="text-[9px] text-slate-600 mt-2 font-bold">於鍛造所／訓練場／餐酒館結帳時自動優先折抵，無法從此處消耗</p>
                          ) : it.effect?.type === 'material' ? (
                            <p className="text-[9px] text-slate-600 mt-2 font-bold">生活材料，請於休憩園或其他系統使用</p>
                          ) : it.effect?.type === 'gardenSeed' ? (
                            <p className="text-[9px] text-slate-600 mt-2 font-bold">種子僅能在大廳「休憩園」菜圃播種</p>
                          ) : null}
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const list = (equipInstances ?? []).slice().sort((a, b) => {
                      const al = a?.locked ? 1 : 0;
                      const bl = b?.locked ? 1 : 0;
                      if (bl !== al) return bl - al;
                      const ao = equippedEidOwner?.[a?.eid] ? 1 : 0;
                      const bo = equippedEidOwner?.[b?.eid] ? 1 : 0;
                      if (bo !== ao) return bo - ao;
                      return String(a?.itemId || '').localeCompare(String(b?.itemId || ''));
                    });
                    if (list.length === 0) {
                      return <p className="text-center text-[11px] font-bold text-slate-500 py-10">目前沒有裝備。</p>;
                    }
                    return list.map((inst) => {
                      const it = getEquipItem(inst.itemId);
                      if (!it) return null;
                      const owner = equippedEidOwner?.[inst.eid] ?? null;
                      const ownerName = owner ? HEROES_BASE.find((h) => h.id === owner)?.name ?? owner : null;
                            const fxLine = (inst.affixes ?? []).map((a) => formatAffixZh(a)).join(' · ');
                      return (
                        <div key={inst.eid} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[12px] font-black text-white truncate">
                                {it.name}{' '}
                                <span className="text-[10px] font-black text-slate-500 tabular-nums">#{String(inst.eid).slice(-4)}</span>
                              </p>
                              <p className="text-[10px] font-bold text-slate-300 mt-1 leading-snug">
                                {it.slot === 'weapon' ? '武器' : it.slot === 'offhand' ? '副手' : '防具'}
                                {ownerName ? ` · 裝備中：${ownerName}` : ''}
                                {inst.locked ? ' · 已鎖定' : ''}
                              </p>
                              <p className="text-[10px] font-black text-slate-200/90 mt-2">{fxLine ? fxLine : '（無詞條）'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setEquipInstances((list) =>
                                  Array.isArray(list) ? list.map((x) => (x.eid === inst.eid ? { ...x, locked: !x.locked } : x)) : []
                                )
                              }
                              className={`shrink-0 px-4 py-2 rounded-xl border text-[10px] font-black ${
                                inst.locked
                                  ? 'bg-violet-600/25 hover:bg-violet-600/40 border-violet-500/35 text-violet-100'
                                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                              }`}
                            >
                              {inst.locked ? '解鎖' : '鎖定'}
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
            {useItemTargetPick ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-[115] cursor-default bg-black/40"
                  aria-label="關閉"
                  onClick={() => setUseItemTargetPick(null)}
                />
                <div className="fixed inset-x-4 bottom-20 z-[120] max-w-md mx-auto rounded-2xl border border-white/15 bg-slate-950 p-4 shadow-2xl ring-1 ring-black/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">選擇使用對象</p>
                  <p className="text-[11px] font-bold text-slate-200 mt-2">
                    要讓誰使用「{getItem(useItemTargetPick?.itemId)?.name ?? '修煉手冊'}」？
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(() => {
                      const xpMap = loadHeroXpMap();
                      return partyIds.map((hid) => {
                      const hero = HEROES_BASE.find((h) => h.id === hid);
                      if (!hero) return null;
                      const lv = xpMap?.[hid]?.level ?? 1;
                      return (
                        <button
                          key={hid}
                          type="button"
                          onClick={() => {
                            const xpMap = loadHeroXpMap();
                            const prev = xpMap[hid] ?? defaultProgress();
                            const res = applyManualLevelUps(prev, useItemTargetPick.amount ?? 1, useItemTargetPick.maxLevel ?? 10);
                            if ((res.gained ?? 0) <= 0) {
                              setStageNotice(`已達手冊上限（Lv.${res.limit}）。未消耗道具。`);
                              setUseItemTargetPick(null);
                              return;
                            }
                            const nextMap = { ...xpMap, [hid]: { level: res.level, xp: res.xp, cap: res.cap } };
                            saveHeroXpMap(nextMap);
                            setItemInv((inv) => incInv(inv, useItemTargetPick.itemId, -1));
                            setStageNotice(`${hero.name} 升級 +${res.gained}（Lv.${res.level}）。`);
                            setUseItemTargetPick(null);
                          }}
                          className="rounded-xl border border-white/10 bg-black/30 hover:bg-black/40 px-3 py-2 text-left active:scale-[0.99] transition-all"
                        >
                          <p className="text-[11px] font-black text-white truncate">
                            {hero.name}
                            <span className="ml-1 text-[10px] font-black text-slate-300">Lv.{lv}</span>
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1">隊伍成員</p>
                        </button>
                      );
                      });
                    })()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseItemTargetPick(null)}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/55 px-3 py-2 text-[11px] font-black text-slate-200"
                  >
                    取消
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {scene === 'story' && (
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
              <div className="absolute inset-0" style={{ background: lobbyBgDef.fallback }} />
              <img
                key={lobbyBgDef.id}
                src={lobbyBgDef.image}
                alt=""
                decoding="async"
                draggable={false}
                className={`absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-[center_30%] max-sm:scale-[1.03] max-sm:origin-[center_30%] sm:object-center transition-opacity duration-500 ${
                  lobbyBgImgVisible ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setLobbyBgImgVisible(true)}
                onError={() => setLobbyBgImgVisible(false)}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950/60 via-slate-950/25 to-slate-950/90 max-sm:from-slate-950/45 max-sm:via-slate-950/18 max-sm:to-slate-950/70" />
            </div>
            <div className="relative z-10 flex-1 flex flex-col min-h-0">
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setScene('stage')}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white mb-2"
              >
                <ChevronLeft size={14} />
                返回關卡
              </button>
              <h2 className="text-lg font-black italic text-white tracking-tight">
                {STAGES.find((s) => s.id === storyStageId)?.title ?? '劇情'}
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">{STAGES.find((s) => s.id === storyStageId)?.subtitle ?? ''}</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5">
              {storyStageId === 'c1-story-1' ||
              storyStageId === 'c1-story-2' ||
              storyStageId === 'c1-story-3' ||
              storyStageId === 'c1-epilogue' ||
              storyStageId === 'c2-story-1' ||
              storyStageId === 'c2-story-2' ||
              storyStageId === 'c2-epilogue' ||
              storyStageId === 'c3-story-1' ||
              storyStageId === 'c3-story-2' ||
              storyStageId === 'c3-story-3' ||
              storyStageId === 'c3-epilogue' ||
              storyStageId === 'c4-story-1' ||
              storyStageId === 'c4-story-2' ||
              storyStageId === 'c4-epilogue' ||
              storyStageId === 'c5-story-1' ||
              storyStageId === 'c5-story-2' ||
              storyStageId === 'c5-epilogue' ||
              storyStageId === 'c6-story-1' ? (
                <div className="max-w-5xl mx-auto">
                  {(() => {
                    const def =
                      storyStageId === 'c2-epilogue'
                        ? {
                            leftCgLabel: '商人 半身 CG',
                            rightCgLabel: '普爾斯一行人 半身 CG',
                            endBtn: '返回章節',
                            onEnd: () => {
                              completeStage('c2-epilogue');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-2');
                              setSelectedStageId('c2-epilogue');
                              setShopDialog(
                                '「諸位救命之恩無以為報——到了星階港若不嫌棄，務必讓我盡地主之誼！店裡新到的裝備與補給，也為各位留了位子。」',
                              );
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '巨龍退去後，冰河上的碎霧緩緩沉降。商人跌坐在地，嘴唇仍發白，卻仍緊抱著那束冰河花不肯鬆手。',
                              },
                              { who: '商人', text: '謝、謝謝各位……我以為自己要在這裡結束了。若不是你們出手，別說花，命都撿不回來。' },
                              { who: '白澤', text: '下次別孤身犯險。冰河盡頭的邪氣未盡，這裡仍不安全。' },
                              { who: '普爾斯', text: '先把狀況穩住。我們會護送你離開河岸。' },
                              {
                                who: '商人',
                                text: '這份恩情我一定要還。我在港邊有些門路——「星階港」聽過嗎？南方最大的貿易城，桅杆像林子一樣密，連鍛造工坊都能排成一條街。',
                              },
                              { who: '熊吉', text: '聽過。船來船往，奇貨也多。你要帶我們去那？' },
                              {
                                who: '商人',
                                text: '我想邀請諸位到星階港作客，讓我好好招待一晚——當然也不是白請：我店裡的護具、藥水與旅途補給，諸位一定用得上。',
                              },
                              {
                                who: '旁白',
                                text: '他說得熱切，眼底卻閃著生意人的精明：感謝與推銷，竟能在同一段話裡並行不悖。',
                              },
                              { who: '普爾斯', text: '……行。我們正好需要補充物資。那就叨擾了。' },
                            ],
                          }
                        : storyStageId === 'c4-story-1'
                        ? {
                            leftCgLabel: '焰脊火山（遠景）',
                            rightCgLabel: '小隊休息 半身 CG',
                            endBtn: '返回章節',
                            onEnd: () => {
                              completeStage('c4-story-1');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-4');
                              setSelectedStageId('c4-story-1');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '連番遭遇戰後，你們終於找到一處勉強能喘息的岩陰。硫磺味仍刺鼻，但至少不再被魔物逼著奔跑。',
                              },
                              {
                                who: '旁白',
                                text: '從星階港一路南下至此，空氣裡的灰燼與熱浪從未輕過；腳下裂隙與落石提醒著你們，這條路本就不容鬆懈。',
                              },
                              {
                                who: '旁白',
                                text: '你們彼此照應著前進——補水、輪流警戒、互相提醒腳下裂隙。這一路不算輕鬆，卻讓「同伴」兩個字變得更具體。',
                              },
                              { who: '普爾斯', text: '前面岔路多，我去探一圈。你們先在陰處歇一下，別硬撐。' },
                              { who: '白澤', text: '小心熱浪與落石。有狀況就吹口哨。' },
                              { who: '布提婭', text: '……快去快回。我可不想替你收屍。' },
                              { who: '旁白', text: '普爾斯點頭，身影沒入岩脊後方。剩下的人圍在狹窄的陰影裡，像一小隊勉強撐住的火苗。' },
                              { who: '熊吉', text: '呼……好熱……頭有點昏……' },
                              { who: '旁白', text: '熊吉腳步一軟，扶著岩壁才沒跪下去。額上汗珠滾落，呼吸變得又急又淺。' },
                              { who: '白澤', text: '中暑了。別亂動，先降溫。' },
                              {
                                who: '旁白',
                                text: '白澤掌心凝起一層涼意，像薄霧般覆上熊吉的額與頸側。那股燥熱被緩緩抽走，熊吉的喘息才終於平穩些。',
                              },
                              { who: '熊吉', text: '……好多了。謝了，白澤。' },
                              { who: '白澤', text: '還要往前走，別逞強。水省著喝，但別渴到失神。' },
                              {
                                who: '旁白',
                                text: '一旁的影子忽然晃了晃——布提婭像貓一樣縮進熊吉腳邊那片較深的陰影裡，只露出一雙眼睛。',
                              },
                              { who: '布提婭', text: '……別看我。這裡最涼。' },
                              { who: '熊吉', text: '喂！那是我的影子耶！' },
                              { who: '布提婭', text: '租一下而已。等普爾斯回來我就出去。' },
                              {
                                who: '旁白',
                                text: '你們在炙熱裡短暫地笑了一下。遠處傳來普爾斯的口哨聲——路還在前方，但至少此刻，誰都沒有落單。',
                              },
                            ],
                          }
                        : storyStageId === 'c4-story-2'
                        ? {
                            leftCgLabel: '岩漿池與光繭機關（遠景）',
                            rightCgLabel: '普爾斯一行人 半身 CG',
                            endBtn: '迎戰熔岩巨人',
                            onEnd: () => {
                              completeStage('c4-story-2');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-4');
                              setSelectedStageId('c4-boss-1');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '岩脊深處，一池岩漿靜靜翻騰。池心浮著一圈符文般的光繭，像有什麼機關被隔在沸騰的熱浪之後，仍受到保護。',
                              },
                              {
                                who: '熊吉',
                                text: '欸……那邊在發光？可是靠太近會把鞋底烤化吧……',
                              },
                              {
                                who: '白澤',
                                text: '熱氣被某種力量排開，那是結界。有人刻意把機關封在岩漿池裡。',
                              },
                              {
                                who: '普爾斯',
                                text: '若能穩住結界，也許能觸發機關。先確認周遭，別貿然踩上——',
                              },
                              {
                                who: '旁白',
                                text: '話未說完，池邊的岩盤驟然隆起。熔漿順著裂痕往上攀，聚成巨人的脊背與雙臂；灼熱的眼窩俯視著你們，像在看擅闖者。',
                              },
                              { who: '布提婭', text: '……守門的。不打倒它，連池邊都站不穩。' },
                              { who: '普爾斯', text: '全員，戰鬥準備。擊退巨人後，再處理機關。' },
                            ],
                          }
                        : storyStageId === 'c4-epilogue'
                        ? {
                            leftCgLabel: '岩漿池・浮起的石板',
                            rightCgLabel: '布提婭解讀 半身 CG',
                            endBtn: '返回章節',
                            onEnd: () => {
                              completeStage('c4-epilogue');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-4');
                              setSelectedStageId('c4-epilogue');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '熔岩巨人崩解後，池心的光繭像被抽走了支撐，熱浪一沉，岩漿緩緩向兩側退開。你們終於踏進那片曾被守護的空心。',
                              },
                              {
                                who: '旁白',
                                text: '腳下傳來低沉的咔嗒聲——岩漿中的機關浮起，托出一面被燒得焦黑、卻仍泛著微光的古老石板。',
                              },
                              {
                                who: '熊吉',
                                text: '這……像地圖耶？可是線條歪七扭八的，我看不懂啦。',
                              },
                              {
                                who: '白澤',
                                text: '刻痕很深，不是尋常路標。像是刻意把「方向」藏進符號裡，免得被外人一眼讀穿。',
                              },
                              {
                                who: '布提婭',
                                text: '……讓我看看。這種東西，我以前在「某些委託」裡見過。',
                              },
                              {
                                who: '旁白',
                                text: '布提婭指尖沿著刻痕滑過，像在撫摸一條沉睡的蛇。她的聲音低了下來，卻比平常更專注。',
                              },
                              {
                                who: '布提婭',
                                text: '石板在指路——星墜遺跡。那裡……曾有人以古老的邪惡之力，把什麼東西封住。',
                              },
                              { who: '普爾斯', text: '封住？封的是誰？' },
                              {
                                who: '布提婭',
                                text: '刻文寫得很隱晦，但意思很清楚：被封的是「光之妖精」。至於為什麼要封、誰下的手……石板沒說。',
                              },
                              {
                                who: '白澤',
                                text: '若封印鬆動，邪氣外溢，各地異變就說得通了。我們不能當沒看見。',
                              },
                              {
                                who: '熊吉',
                                text: '那就去星墜遺跡啊！總比在這邊猜來猜去好吧？',
                              },
                              {
                                who: '普爾斯',
                                text: '同意。先把石板拓下來，路上再對照。下一站在星墜遺跡——把這件事查到底。',
                              },
                              {
                                who: '旁白',
                                text: '你們收好石板拓痕，轉身離開沸騰的池畔。身後的岩漿重新合攏，像一口吞回秘密的嘴；而前方的路標，已指向遺跡深處。',
                              },
                            ],
                          }
                        : storyStageId === 'c5-story-1'
                        ? {
                            leftCgLabel: '星墜遺跡（斷柱與符文殘垣）',
                            rightCgLabel: '小隊分頭探索 半身 CG',
                            endBtn: '返回章節',
                            onEnd: () => {
                              completeStage('c5-story-1');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-5');
                              setSelectedStageId('c5-story-1');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '星墜遺跡的迴廊像被誰惡意打亂過——同一段階梯走兩次，牆上的符文卻換了位置。你們很快意識到：不是路在變，而是你們正在迷路。',
                              },
                              {
                                who: '普爾斯',
                                text: '別擠在一起。各自用拿手的方式找——十分鐘後在這根斷柱匯合。找不到也要回來。',
                              },
                              {
                                who: '旁白',
                                text: isHeroUnlocked('bubu')
                                  ? '普爾斯沿著高處殘梁巡視，試圖用視線串起地勢；白澤閉眼感應殘留的結界波動；布提婭貼著陰影滑行，指尖掠過刻痕尋找被藏起的記號；布布低聲祈禱，讓微光在岔路口一一亮起又熄滅。'
                                  : '普爾斯沿著高處殘梁巡視，試圖用視線串起地勢；白澤閉眼感應殘留的結界波動；布提婭貼著陰影滑行，指尖掠過刻痕尋找被藏起的記號。',
                              },
                              {
                                who: '旁白',
                                text: '熊吉則乾脆沿著風聲與回音跑了一圈——風告訴他哪裡寬敞，卻沒告訴他封印在哪。',
                              },
                              {
                                who: '旁白',
                                text: '十分鐘後，斷柱下只剩沉默。每個人都搖頭：沒有封印座標，沒有明顯的「門」，連可疑的祭壇都像在捉弄人。',
                              },
                              { who: '白澤', text: '……有東西被藏得很深。表面只有迷宮，真正的核心不在我們剛才踏過的任何一條主路。' },
                              { who: '布提婭', text: '刻痕也很狡猾。像故意讓人繞圈——我差點以為自己回到原點三次。' },
                              ...(isHeroUnlocked('bubu') ? [{ who: '布布', text: '光線的回應很模糊……像是被厚層岩石蓋住了。' }] : []),
                              { who: '普爾斯', text: '也就是說，我們還缺一把「鑰匙」，或一個入口。先休整——' },
                              {
                                who: '熊吉',
                                text: '不找了啦！我腿痠、肚子也在叫，再繞下去我會先餓死在這種鬼地方！',
                              },
                              {
                                who: '旁白',
                                text: '熊吉氣呼呼地往地上一坐——臀下卻傳來清脆的「喀」一聲，像某個卡榫被體重硬生生壓進槽裡。',
                              },
                              { who: '布提婭', text: '……你坐到了什麼？' },
                              {
                                who: '旁白',
                                text: '腳下的石板緩緩下沉，塵土簌簌落下。遺跡深處傳來鏈條拖曳的悶響，一道斜向下的階梯從裂縫中顯現，陰冷的風從地下涌出，帶著陳舊金屬與封印的氣息。',
                              },
                              { who: '普爾斯', text: '……地下入口。' },
                              { who: '白澤', text: '機關偽裝成普通的磨損石面。若不是這一下，確實很難發現。' },
                              {
                                who: '熊吉',
                                text: '欸？所以是我……坐對了？',
                              },
                              ...(isHeroUnlocked('bubu') ? [{ who: '布布', text: '熊吉，謝謝你願意「坐下來」休息。' }] : []),
                              { who: '熊吉', text: '不要講得好像我是故意的好不好！' },
                              {
                                who: '普爾斯',
                                text: '行了，玩笑之後再開。全員——準備下樓。真正的封印，恐怕就在這下面。',
                              },
                            ],
                          }
                        : storyStageId === 'c5-story-2'
                        ? {
                            leftCgLabel: '地下遺跡深處 · 儀式石盤',
                            rightCgLabel: '普爾斯操作機關 半身 CG',
                            endBtn: '迎戰木乃伊君王',
                            onEnd: () => {
                              completeStage('c5-story-2');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-5');
                              setSelectedStageId('c5-boss-1');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '階梯盡頭的空氣更冷了。你們踏入一處被掏空的石室——中央隆起一座刻滿封咒的儀式石盤，周圍散落著碎裂的陪葬與早已褪色的金箔。',
                              },
                              {
                                who: '旁白',
                                text: '石盤邊緣嵌著幾枚仍在微微搏動的鎖齒，像心臟殘存的節拍；牆後隱約傳來沙粒摩擦的細響，彷彿有什麼被繃緊的布條正一寸寸鬆開。',
                              },
                              { who: '白澤', text: '封印還在……但邊緣已經裂了。別碰那些咒文，會反噬。' },
                              { who: '布提婭', text: '石盤底下有機關。不是破壞型，是「解讀型」——有人在等我們把鎖齒對回去。' },
                              { who: '普爾斯', text: '交給我。你們警戒四周，別讓任何東西靠近石盤。' },
                              {
                                who: '旁白',
                                text: '普爾斯半跪在石盤前，指尖沿著刻痕滑動，將紊亂的符文一一對回基線。鎖齒亮起刺目的白光——整座石室跟著低鳴，像某個沉睡的名字被叫醒了一半。',
                              },
                              { kind: 'qte' },
                              {
                                who: '旁白',
                                text: '最後一枚鎖齒「咔」地歸位。白光驟滅，取而代之的是死寂——那種死寂太完整，反而讓人耳鳴。',
                              },
                              {
                                who: '旁白',
                                text: '石室深處的牆面崩裂，塵土如瀑。一具纏滿咒布的巨大棺槨從裂縫中滑出，棺蓋被內側的力量硬生生撞開——乾裂的繃帶崩斷，露出君王空洞的眼窩與森白的指骨。',
                              },
                              {
                                who: '木乃伊君王',
                                text: '……誰……膽敢……解我的枷鎖……',
                              },
                              { who: '熊吉', text: '喂喂喂！這不是「開門」而已嗎！怎麼連「住戶」都一起放出來了！' },
                              { who: '布布', text: '邪氣濃得像要凝成實體……大家小心！' },
                              {
                                who: '普爾斯',
                                text: '機關已破，封印反噬成召喚——全員備戰！別讓它踏出這間石室！',
                              },
                            ],
                          }
                        : storyStageId === 'c5-epilogue'
                        ? {
                            leftCgLabel: '破裂棺底 · 光球與糧袋',
                            rightCgLabel: '小隊營地 半身 CG',
                            endBtn: '返回章節',
                            onEnd: () => {
                              completeStage('c5-epilogue');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-5');
                              setSelectedStageId('c5-epilogue');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '木乃伊君王崩解後，碎裂的棺底轟然塌陷。塵霧裡有什麼發出一聲亮叮嚀——下一瞬，一顆圓滾滾的光球從破口竄出，不撲向任何人，竟直衝你們紮營處那只沉甸甸的糧食袋。',
                              },
                              { who: '熊吉', text: '喂——！那是明天的口糧欸！' },
                              {
                                who: '旁白',
                                text: '光球整顆埋進布袋，袋口被撐得一鼓一鼓；乾糧與肉乾的香氣以驚人的速度消失，只剩布底窸窣的咀嚼聲，聽起來竟有點……滿足。',
                              },
                              { who: '布提婭', text: '……小偷也要講良心吧，至少留一口。' },
                              {
                                who: '旁白',
                                text: '好一會兒，光球終於滾了出來，身上的光帶亮了好幾分，像剛被吹飽的小燈籠。她抖了抖，聲音從圓圓的身體裡傳出來——清脆、甜甜的。',
                              },
                              {
                                who: '光之幼靈',
                                text: '謝謝招待！我好餓好餓……終於有力氣好好說話了。',
                              },
                              { who: '普爾斯', text: '……你是封印裡被一起震出來的「什麼」？沒有敵意嗎？' },
                              {
                                who: '光之幼靈',
                                text: '敵意沒有，食慾倒是很多——開玩笑的啦！我想跟你們一起走，把那片擴散的黑暗重新封回去。',
                              },
                              {
                                who: '光之幼靈',
                                text: '還有還有！你們收集的「星曉晶石」，可以用來做「星曉祈願」——能把平行時空的自己，或是有緣分的夥伴叫來，陪你們打一場喔！',
                              },
                              {
                                who: '熊吉',
                                text: '等等，「另外一個我」？聽起來超恐怖的好不好！萬一他比我還會吃怎麼辦！',
                              },
                              {
                                who: '普爾斯',
                                text: '別慌，只在需要戰鬥的那段時間會來幫忙。而且啊……其他時空的你，搞不好會帶不同產地的蜂蜜來。',
                              },
                              { who: '熊吉', text: '……蜂蜜？' },
                              { who: '普爾斯', text: '對，蜂蜜。' },
                              {
                                who: '熊吉',
                                text: '……成交。但先聲明：不準再偷吃我的便當袋！星曉祈願也只能在戰鬥的時候啦！',
                              },
                              {
                                who: '光之幼靈',
                                text: '嘻嘻，約定好囉——漆黑前面，我們互相照亮吧！',
                              },
                              {
                                who: '旁白',
                                text: '你們收整行囊，火光在通道盡頭搖晃。新的旅伴蹭了蹭你的鞋尖，像把「星曉」兩個字輕輕繫在未來的路上。',
                              },
                            ],
                          }
                        : storyStageId === 'c6-story-1'
                        ? {
                            leftCgLabel: '黯潮深淵（入口）',
                            rightCgLabel: '普爾斯一行人 半身 CG',
                            endBtn: '進入深淵',
                            onEnd: () => {
                              completeStage('c6-story-1');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-6');
                              setSelectedStageId('c6-battle-1');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '黯潮深淵的入口像一道張開的傷口。從裂縫裡湧出的黑潮帶著刺骨的寒意與令人作嘔的腥甜，彷彿連光都會被吞沒。',
                              },
                              {
                                who: '旁白',
                                text: '深淵散發出邪惡的魔力，使大家顫抖不已。那股波動貼著皮膚往骨頭裡鑽，讓人本能想轉身逃離。',
                              },
                              { who: '熊吉', text: '這地方……真的不是什麼「走錯路」可以解釋的欸……我、我雞皮疙瘩都起來了。' },
                              { who: '布布', text: '大家靠近一點。我會盡力穩住你們的心跳……別讓恐懼把隊伍拆散。' },
                              { who: '白澤', text: '邪氣很濃，但不是無法對抗。只要步伐一致，就不會被它逐個吞下。' },
                              { who: '普爾斯', text: '互相打氣一下。接下來每一步都可能是陷阱——但我們會一起走過去。' },
                              {
                                who: '旁白',
                                text: '你們交換了一個短促卻堅定的眼神。呼吸仍顫，腳步卻沒有退後——在互相打氣後，你們決定邁向深淵。',
                              },
                            ],
                          }
                        : storyStageId === 'c3-epilogue'
                        ? {
                            leftCgLabel: '星階港（遠景）',
                            rightCgLabel: '普爾斯一行人＆布提婭 半身 CG',
                            endBtn: '返回章節',
                            onEnd: () => {
                              completeStage('c3-epilogue');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-3');
                              setSelectedStageId('c3-epilogue');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '盜賊首領倒下後，港巷的喧囂像被潮水帶走般迅速退去。護衛趕到時，只剩滿地凌亂與逐漸散去的人群。',
                              },
                              {
                                who: '旁白',
                                text: '商人終於找到了你們。他的衣襬沾滿灰塵，卻仍緊抱著那只沉甸甸的錢袋，像抱著命。',
                              },
                              { who: '商人', text: '諸位、諸位！這、這是說好的報酬——還有一點謝禮！要不是你們，我的貨、我的命……都完了。' },
                              {
                                who: '旁白',
                                text: '普爾斯接過錢袋，指尖掂了掂重量，隨即轉身，把它遞到布提婭面前。',
                              },
                              { who: '熊吉', text: '……你要把商人的報酬給她？' },
                              { who: '普爾斯', text: '她幫了我們一把——不管初衷是什麼。這筆就當作酬金。' },
                              {
                                who: '普爾斯',
                                text: '布提婭，我們正在追查發生在這片大陸上的災難。你若願意繼續同行……我希望你把本事用在正確的地方。',
                              },
                              { who: '旁白', text: '布提婭盯著錢袋，像在衡量一把刀的分量。她的嘴角抽了一下，視線卻刻意別開。' },
                              { who: '布提婭', text: '哼。別誤會了。只是你們太弱……我不在旁邊看著，怕你們死得太快。' },
                              { who: '白澤', text: '嘴硬。' },
                              { who: '布提婭', text: '閉嘴。' },
                              {
                                who: '旁白',
                                text: '短暫的沉默後，布提婭把錢袋收下，像收起一份「勉強可接受」的契約。',
                              },
                              { who: '普爾斯', text: '下一站？' },
                              { who: '白澤', text: '南方的火山帶。那裡的波動……正在升溫。' },
                              { who: '旁白', text: '你們離開星階港，踏上通往火山的道路。海風漸遠，前方的天空染上隱約的赤紅——新的災厄正在等待。' },
                            ],
                          }
                        : storyStageId === 'c3-story-2'
                        ? {
                            leftCgLabel: '白澤 半身 CG',
                            rightCgLabel: '布提婭 半身 CG',
                            endBtn: '迎戰布提婭',
                            onEnd: () => {
                              completeStage('c3-story-2');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-3');
                              setSelectedStageId('c3-battle-3');
                              setScene('chapter');
                            },
                            lines: [
                              { who: '旁白', text: '貨運倉庫的混亂暫時被壓下，人群散去後，港邊仍殘留著緊繃的氣味。' },
                              { who: '旁白', text: '你們沿著倉庫外圍前進，白澤的目光卻始終沒有離開身後的陰影。' },
                              { who: '白澤', text: '……我們被跟蹤觀察了。從進港開始就有一條視線黏著。' },
                              { who: '熊吉', text: '我也覺得不對勁。一直有人在繞路。' },
                              { who: '普爾斯', text: '既然想看，那就讓她看清楚。出來。' },
                              { who: '旁白', text: '沉默持續了半個呼吸。下一刻，屋簷陰影裡落下一道輕巧的身影，像黑鳥一樣無聲著地。' },
                              { who: '布提婭', text: '呵……反應不慢。' },
                              { who: '布提婭', text: '我叫布提婭。是那些強盜首領雇用來的刺客。' },
                              { who: '布提婭', text: '你們妨礙了他們的事——所以，我要把妨礙的人消滅。' },
                              { who: '普爾斯', text: '原來如此。那就別浪費時間。' },
                              { who: '白澤', text: '她的氣息……不只是普通刺客。小心。' },
                              { who: '旁白', text: '布提婭微微一笑，指尖寒光一閃。殺意像潮水般逼近——戰鬥一觸即發。' },
                            ],
                          }
                        : storyStageId === 'c3-story-3'
                        ? {
                            leftCgLabel: '盜賊首領 半身 CG',
                            rightCgLabel: '布提婭＆普爾斯一行人 半身 CG',
                            endBtn: '前往隊伍編輯（解鎖布提婭）',
                            onEnd: () => {
                              unlockHero('butiya');
                              completeStage('c3-story-3');
                              setPartyNotice('新同伴加入：布提婭已解鎖。請前往「隊伍編輯」配置新角色上場。');
                              setStoryStageId(null);
                              setScene('party');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '激戰結束後，港邊的石板路上只剩斷裂的刃痕與急促的喘息。你們雖然擊退了布提婭，卻也被逼得精疲力竭。',
                              },
                              { who: '旁白', text: '就在此時，周遭的巷口與屋簷上亮起一雙雙眼睛——腳步聲像潮水般湧來。' },
                              { who: '熊吉', text: '……糟。被包圍了。' },
                              {
                                who: '旁白',
                                text: '一名身形魁梧的男人從人群中走出，身後跟著眾多手下。那張笑臉不帶半分善意，像是早已等候多時。',
                              },
                              { who: '盜賊首領', text: '哈哈哈！辛苦了，各位。替我們把麻煩的刺客「試」出了深淺。' },
                              { who: '普爾斯', text: '你是……' },
                              {
                                who: '盜賊首領',
                                text: '星階港的秩序？那是給有錢人看的。至於你們——是擋路的人。',
                              },
                              {
                                who: '盜賊首領',
                                text: '布提婭要求的酬金跟「實驗材料」過於昂貴，我們根本不打算支付。何況……她也差不多該被「回收」了。',
                              },
                              { who: '旁白', text: '話語落下，四周的盜賊們發出低低的哄笑。那不是同伴的笑，而是獵人分食前的興奮。' },
                              { who: '布提婭', text: '……原來如此。' },
                              { who: '布提婭', text: '你們從一開始就沒打算讓我活著拿走酬金。' },
                              { who: '盜賊首領', text: '懂就好。你們都省得我們麻煩。' },
                              { who: '旁白', text: '布提婭的目光在盜賊與你們之間掃過，短暫的沉默像刀刃般薄。' },
                              { who: '布提婭', text: '普爾斯。你們現在也沒有退路了。' },
                              { who: '布提婭', text: '我被拋棄了，但我不打算死在這群垃圾手上。暫時合作——先把他們剷平。' },
                              { who: '白澤', text: '……合作可以。但你若背刺，我會先凍住你的心跳。' },
                              { who: '普爾斯', text: '成交。先活下來，再談其他。' },
                              { who: '旁白', text: '海風捲起腥鹹的氣味，包圍圈越收越緊。你們與布提婭站到同一邊——至少此刻如此。' },
                            ],
                          }
                        : storyStageId === 'c3-story-1'
                        ? {
                            leftCgLabel: '星階港碼頭（背景）',
                            rightCgLabel: '普爾斯一行人＆商人 半身 CG',
                            endBtn: '返回章節',
                            onEnd: () => {
                              completeStage('c3-story-1');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-3');
                              setSelectedStageId('c3-story-1');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '穿越霜鑄冰河後，鹹濕的海風終於取代了雪霧的寒意。星階港的港灣在晨光中展開，桅杆如林、鐘聲與叫賣聲此起彼落。',
                              },
                              {
                                who: '旁白',
                                text: '商人一路領路，語速都快了幾分——彷彿只要踏上熟悉的石板路，他就能把在冰河失去的底氣全數找回。',
                              },
                              { who: '商人', text: '快到了、快到了！我先帶各位回商會——呃，至少先讓我把貨交接……' },
                              {
                                who: '旁白',
                                text: '話音未落，碼頭方向突然傳來一陣騷動。木箱翻倒的巨響、尖叫與怒吼混在一起，像浪頭般拍向人群。',
                              },
                              { who: '熊吉', text: '那邊……不太妙。' },
                              {
                                who: '旁白',
                                text: '你們循聲望去，只見靠近貨運倉庫的巷口擠滿了人。有人揮舞棍棒，有人試圖拉開打鬥的群眾；護衛的哨聲急促，卻壓不住失控的混亂。',
                              },
                              { who: '白澤', text: '暴亂。看樣子是從貨倉那一帶爆發的。' },
                              { who: '普爾斯', text: '商人，你先回商會。把自己的人看好，別再被捲進去。' },
                              { who: '商人', text: '可、可是——那是我的貨！我……' },
                              { who: '普爾斯', text: '交給我們。你現在過去只會添亂。去找能調度護衛的人，越快越好。' },
                              {
                                who: '旁白',
                                text: '商人咬牙點頭，轉身衝向商會方向。普爾斯一行人則朝貨運倉庫的騷動走去——要弄清楚，究竟是普通的碼頭紛爭，還是邪氣已經把黑手伸到了這座港灣。',
                              },
                            ],
                          }
                        : storyStageId === 'c2-story-2'
                        ? {
                            leftCgLabel: '冰封巨頸龍 半身 CG',
                            rightCgLabel: '商人＆冰河花 半身 CG',
                            endBtn: '前往 Boss 關卡',
                            onEnd: () => {
                              completeStage('c2-story-2');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-2');
                              setSelectedStageId('c2-boss-1');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '普爾斯一行人終於抵達冰河盡頭。風雪稍歇之處，幽藍的冰河花在裂隙間綻放，像星點般閃爍。',
                              },
                              {
                                who: '旁白',
                                text: '不遠處，一名商人正小心翼翼地採集冰河花——彷彿沒察覺腳下的薄冰正在發出細碎的哀鳴。',
                              },
                              { who: '熊吉', text: '等等，那邊的冰層不對勁……別再往前了！' },
                              {
                                who: '旁白',
                                text: '話音未落，冰面猛然炸裂。碎冰如暴雨般騰起，一頭巨影從裂隙中昂起長頸——冰封巨頸龍張開獠牙，直撲向毫無防備的商人！',
                              },
                              {
                                who: '旁白',
                                text: '白澤的身影幾乎在同一瞬間掠出，寒光化作屏障擋在商人與巨龍之間；熊吉腳步一沉，掌風已蓄勢待發。',
                              },
                              { who: '普爾斯', text: '——全員，戰鬥準備！' },
                            ],
                          }
                        : storyStageId === 'c2-story-1'
                        ? {
                            leftCgLabel: '白澤 半身 CG',
                            rightCgLabel: '普爾斯＆熊吉 半身 CG',
                            endBtn: '前往隊伍編輯（解鎖白澤）',
                            onEnd: () => {
                              unlockHero('baize');
                              completeStage('c2-story-1');
                              setPartyNotice('新同伴加入：白澤已解鎖。請前往「隊伍編輯」配置新角色上場。');
                              setStoryStageId(null);
                              setScene('party');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '霜鑄冰河的寒風像刀刃般切割著呼吸。屬性不利的普爾斯逐漸力竭，熊吉也在刺骨寒意中昏昏欲睡。',
                              },
                              { who: '旁白', text: '怪物的攻勢一波接一波，兩人幾乎快要抵不住——就在此時，一道身影踏入風雪之中。' },
                              { who: '旁白', text: '對方抬手一揮，冰河的寒流化作屏障，將敵人的攻勢盡數化解，替普爾斯與熊吉解脫離危機。' },
                              { who: '普爾斯', text: '……你是？' },
                              { who: '白澤', text: '白澤。這片冰河的守護者。' },
                              { who: '白澤', text: '我也感受到冰河盡頭的邪氣在增長。若不清除，遲早會吞噬更多土地。' },
                              { who: '熊吉', text: '我們正要前往調查。一起來吧，守護者。' },
                              { who: '白澤', text: '正合我意。從現在起，我與你們同行。' },
                            ],
                          }
                        : storyStageId === 'c1-epilogue'
                        ? {
                            leftCgLabel: '百年長老樹（重生） 半身 CG',
                            rightCgLabel: '熊吉＆普爾斯 半身 CG',
                            endBtn: '返回章節',
                            onEnd: () => {
                              completeStage('c1-epilogue');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-1');
                              setSelectedStageId('c1-epilogue');
                              setScene('chapter');
                            },
                            lines: [
                              {
                                who: '旁白',
                                text: '戰鬥結束後，百年長老樹的狂暴逐漸平息。它失去了大片力量，枝葉垂落，卻仍保有重新萌芽的生機。',
                              },
                              { who: '旁白', text: '周遭魔物的狂化也像潮水退去般消散，林間終於恢復短暫的寧靜。' },
                              { who: '旁白', text: '然而，遠方卻傳來更令人不安的邪氣——來自霜鑄冰河的方向，寒意像刀鋒般劃過背脊。' },
                              { who: '熊吉', text: '翠影林海暫時穩住了……但那股邪氣更兇。我跟你一起去。' },
                              { who: '普爾斯', text: '好。下一站，霜鑄冰河。' },
                            ],
                          }
                        : storyStageId === 'c1-story-3'
                        ? {
                            leftCgLabel: '百年長老樹（異變） 半身 CG',
                            rightCgLabel: '熊吉＆普爾斯 半身 CG',
                            endBtn: '前往 Boss 關卡',
                            onEnd: () => {
                              completeStage('c1-story-3');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-1');
                              setSelectedStageId('c1-boss-1');
                              setScene('chapter');
                            },
                            lines: [
                              { who: '旁白', text: '穿過濃密樹影後，兩人終於來到傳說中的百年長老樹前。' },
                              { who: '旁白', text: '一枚黑暗晶體深深鑲嵌在樹身之中，像尖刺般撕裂年輪。樹皮裂痕間滲出幽黑的光，長老樹的枝幹不住顫抖——彷彿在痛苦中掙扎。' },
                              { who: '熊吉', text: '果然……波動的源頭就在這裡。' },
                              { who: '旁白', text: '長老樹察覺到靠近的生命，猛然爆發出強烈的抵抗。狂暴的樹根拍擊地面，捲起碎葉與塵土，逼得兩人連連退步。' },
                              { who: '普爾斯', text: '它不是在攻擊我們……像是被什麼逼得失控。只能先把它制服、讓它安定下來！' },
                              { who: '熊吉', text: '上吧。先穩住它，我們才有機會找出淨化的方法。' },
                            ],
                          }
                        : storyStageId === 'c1-story-2'
                        ? {
                            leftCgLabel: '熊吉 半身 CG',
                            rightCgLabel: '普爾斯 半身 CG',
                            endBtn: '一起前往（解鎖熊吉）',
                            onEnd: () => {
                              unlockHero('xiongji');
                              completeStage('c1-story-2');
                              setPartyNotice('新同伴加入：熊吉已解鎖。請前往「隊伍編輯」將熊吉加入上陣名單。');
                              setStoryStageId(null);
                              setScene('party');
                            },
                            lines: [
                              { who: '旁白', text: '普爾斯一路趕往翠影林海。越靠近林緣，空氣越像被什麼攪動過——躁動、尖銳。' },
                              { who: '旁白', text: '前方傳來激烈的碰撞聲。普爾斯循聲望去，只見熊吉正獨自迎戰幾隻兇惡魔物。' },
                              { who: '普爾斯', text: '我來幫你！' },
                              { who: '旁白', text: '普爾斯加入戰局，兩人默契地交錯攻防，終於將魔物逼退。' },
                              { who: '普爾斯', text: '我叫普爾斯。奉溪木村警備隊長之請，前來視察翠影林海的異常波動。你怎麼會一個人在這？' },
                              {
                                who: '熊吉',
                                text: '百年樹長老周邊出現了更多凶狠化的魔物……我一個人應付不來，只好先處理其他地方，免得它們往村子方向擴散。',
                              },
                              { who: '普爾斯', text: '我願意幫你。我們一起去百年樹長老那邊，看看究竟發生了什麼。' },
                              { who: '熊吉', text: '……好。那就同行吧。' },
                            ],
                          }
                        : {
                            leftCgLabel: '警備隊長 半身 CG',
                            rightCgLabel: '普爾斯 半身 CG',
                            endBtn: '出發（前往戰鬥關卡 1）',
                            onEnd: () => {
                              completeStage('c1-story-1');
                              setStoryStageId(null);
                              setSelectedChapterId('ch-1');
                              setSelectedStageId('c1-battle-1');
                              setScene('chapter');
                            },
                            lines: [
                              { who: '旁白', text: '夜色籠罩著溪木村。巡邏的火把在木柵旁搖曳，空氣卻異常沉重。' },
                              {
                                who: '洛恩（警備隊長）',
                                text: '最近從翠影林海傳來的波動不太對勁……不像野獸，更像是——某種意志在呼吸。',
                              },
                              {
                                who: '洛恩（警備隊長）',
                                text: '我需要你去林海邊緣視察。帶上裝備，別逞強。如果情況不對，立刻回報。',
                              },
                              { who: '普爾斯', text: '明白。我會把異常的源頭找出來。' },
                            ],
                          };
                    const lines = def.lines;
                    const i = Math.max(0, Math.min(lines.length - 1, storyLineIdx));
                    const atEnd = i >= lines.length - 1;
                    const cur = lines[i];
                    const isQteLine = cur?.kind === 'qte';
                    return (
                      <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden flex items-center justify-center min-h-[16rem]">
                      <div className="text-center p-4">
                        <p className="text-[10px] font-black text-slate-300">{def.leftCgLabel}</p>
                        <p className="text-[9px] text-slate-600 mt-1">在此放置圖片</p>
                        <div className="mt-3 h-44 w-44 rounded-2xl border border-dashed border-white/15 bg-black/20 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                          CG FRAME
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden flex items-center justify-center min-h-[16rem]">
                      <div className="text-center p-4">
                        <p className="text-[10px] font-black text-slate-300">{def.rightCgLabel}</p>
                        <p className="text-[9px] text-slate-600 mt-1">在此放置圖片</p>
                        <div className="mt-3 h-44 w-44 rounded-2xl border border-dashed border-white/15 bg-black/20 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                          CG FRAME
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-white/10 bg-black/35 p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      {isQteLine ? 'Mechanism' : 'Dialogue'}
                    </p>
                    {isQteLine ? (
                      <div className="mt-3">
                        <StoryMechanismQte
                          key={`${storyStageId}-qte`}
                          onComplete={() => {
                            unlockAudio();
                            SFX.skill();
                            setStoryLineIdx((v) => Math.min(lines.length - 1, v + 1));
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] font-black text-slate-400 mt-2">{cur.who}</p>
                        <p className="text-[13px] font-bold text-slate-200 leading-relaxed mt-1 whitespace-pre-wrap">{cur.text}</p>
                      </>
                    )}

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStoryLineIdx(lines.length - 1)}
                        className="rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-white/10 px-4 py-3 text-[12px] font-black text-slate-200 active:scale-[0.99] transition-all"
                      >
                        略過
                      </button>
                      {isQteLine ? (
                        <p className="flex-1 self-center text-[10px] font-bold text-slate-500 leading-snug pl-1">
                          進度達 100% 後自動繼續劇情。略過會跳到結尾台詞。
                        </p>
                      ) : !atEnd ? (
                        <button
                          type="button"
                          onClick={() => setStoryLineIdx((v) => Math.min(lines.length - 1, v + 1))}
                          className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-[12px] font-black text-white active:scale-[0.99] transition-all"
                        >
                          下一句
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={def.onEnd}
                          className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-[12px] font-black text-white active:scale-[0.99] transition-all"
                        >
                          {def.endBtn}
                        </button>
                      )}
                    </div>
                  </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
              <div className="max-w-xl mx-auto rounded-2xl border border-white/10 bg-black/30 p-5 leading-relaxed">
                <p className="text-[12px] font-bold text-slate-200">
                  在長久的和平之下，王國的人們早已習慣了夜晚的寧靜。
                  然而某一天——深夜的天幕忽然裂開，黑色的晶體碎片如流星雨般墜落，散向大地各處。
                </p>
                <p className="text-[12px] font-bold text-slate-200 mt-4">
                  自那之後，怪物變得前所未有地兇狠；各地村莊紛紛加強守備與巡邏，火把的光在城牆上連成一線。
                  更令人不安的是，五個地區出現了特別強烈的波動——彷彿有什麼在黑暗中甦醒。
                </p>
                <ul className="mt-4 space-y-2 text-[12px] font-black text-slate-100">
                  <li className="rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2">
                    翠影林海（森林）——樹影之間有低語回響。
                  </li>
                  <li className="rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2">
                    焰脊火山群（火山）——熔岩深處傳來悶雷般的震顫。
                  </li>
                  <li className="rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2">
                    霜鑄冰河（冰河）——冰層裂紋延伸，寒意滲入骨髓。
                  </li>
                  <li className="rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2">
                    星墜遺跡（遺跡）——古老符文再度微光閃爍。
                  </li>
                  <li className="rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2">
                    黯潮深淵（深淵）——黑潮翻湧，像在等待某個召喚。
                  </li>
                </ul>
                <p className="text-[12px] font-bold text-slate-200 mt-4">
                  不祥的災難，或許已在路上。
                </p>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      completeStage('stage-0');
                      setStoryStageId(null);
                      setSelectedChapterId('ch-1');
                      setSelectedStageId('c1-story-1');
                      setScene('chapter');
                    }}
                    className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-[12px] font-black text-white active:scale-[0.99] transition-all"
                  >
                    繼續（前往冒險）
                  </button>
                </div>
              </div>
              )}
            </div>
            </div>
          </div>
        )}

        {scene === 'shop' && (
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
              <h2 className="text-lg font-black italic text-white tracking-tight">商店</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                販售選項會依照你持有的<span className="text-violet-300 font-black">淨化稜晶</span>數量逐步解鎖。詳細規則請看右上角「?」說明。
              </p>
            </div>

            <div className="flex-1 min-h-0 flex gap-3 p-4">
              {/* 左：交易按鈕 */}
              <div className="w-32 shrink-0 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (getShopPrismCount() < 2) {
                      setShopDialog('「想買裝備？等你帶著兩顆淨化稜晶再來找我。」');
                      return;
                    }
                    setShopMode('buy-equip');
                    setShopDialog('「想買些武器防具嗎？每一件都有價格。」');
                  }}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                    shopMode === 'buy-equip' ? 'border-blue-500/50 bg-blue-600/15' : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/55'
                  } ${getShopPrismCount() < 2 ? 'opacity-55' : ''}`}
                >
                  <p className="text-[10px] font-black text-slate-100">購買裝備</p>
                  <p className="text-[9px] text-slate-500 mt-1">Buy</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (getShopPrismCount() < 2) {
                      setShopDialog('「裝備買賣也要等你湊齊兩顆淨化稜晶再說。」');
                      return;
                    }
                    setShopMode('sell-equip');
                    setShopDialog('「把不要的裝備賣給我吧。我會給你合理的價錢。」');
                  }}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                    shopMode === 'sell-equip' ? 'border-blue-500/50 bg-blue-600/15' : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/55'
                  } ${getShopPrismCount() < 2 ? 'opacity-55' : ''}`}
                >
                  <p className="text-[10px] font-black text-slate-100">出售裝備</p>
                  <p className="text-[9px] text-slate-500 mt-1">Sell</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShopMode('buy-item');
                    setShopDialog('「道具在路上總用得上。要買點嗎？」');
                  }}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                    shopMode === 'buy-item' ? 'border-blue-500/50 bg-blue-600/15' : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/55'
                  }`}
                >
                  <p className="text-[10px] font-black text-slate-100">購買道具</p>
                  <p className="text-[9px] text-slate-500 mt-1">Items</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShopMode('sell-item');
                    setShopDialog('「背包太滿？我也收道具。」');
                  }}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                    shopMode === 'sell-item' ? 'border-blue-500/50 bg-blue-600/15' : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/55'
                  }`}
                >
                  <p className="text-[10px] font-black text-slate-100">出售道具</p>
                  <p className="text-[9px] text-slate-500 mt-1">Items</p>
                </button>

                {/* 手機版：商人 CG 放在左側按鈕下方 */}
                <div className="flex-1" />
                <div className="mt-2 rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden sm:hidden">
                  <div className="p-3 text-center">
                    <p className="text-[10px] font-black text-slate-300">商人半身 CG</p>
                    <p className="text-[9px] text-slate-600 mt-1">在此放置圖片</p>
                    <div className="mt-3 h-32 w-full rounded-2xl border border-dashed border-white/15 bg-black/20 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                      CG FRAME
                    </div>
                  </div>
                </div>
              </div>

              {/* 中：清單 + 對話框 */}
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <div className="flex-1 min-h-0 rounded-2xl border border-white/10 bg-slate-900/25 p-3 overflow-y-auto no-scrollbar">
                  {shopMode === 'buy-equip' || shopMode === 'sell-equip' ? (
                    getShopPrismCount() < 2 ? (
                      <div className="h-full min-h-[8rem] flex flex-col items-center justify-center text-center px-4">
                        <p className="text-[12px] font-bold text-slate-400 leading-relaxed">
                          裝備買賣需持有 <span className="text-violet-300 font-black">2</span> 顆淨化稜晶才會解鎖。
                        </p>
                      </div>
                    ) : (
                    <div className="space-y-2">
                      {shopMode === 'buy-equip'
                        ? Object.values(EQUIPMENT_CATALOG)
                            .filter((it) => getShopPrismCount() >= (it.shopPrismMin ?? 2))
                            .map((it) => {
                              const sell = getEquipSellPrice(it);
                              return (
                                <div key={it.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-black text-white truncate">{it.name}</p>
                                      <p className="text-[10px] font-bold text-slate-300 mt-1 leading-snug">
                                        {it.slot === 'weapon' ? '武器' : it.slot === 'offhand' ? '副手' : '防具'} · 裝備背包 {(equipInstances?.length ?? 0)}/{EQUIP_INSTANCE_CAP}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => buyEquip(it.id)}
                                      className="shrink-0 px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/45 border border-emerald-500/40 text-[10px] font-black text-emerald-100 tabular-nums"
                                    >
                                      買 {it.price}
                                    </button>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black text-slate-200 tabular-nums">
                                    {it.stats?.atk ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Sword size={12} className="text-amber-300" /> +{it.stats.atk}
                                      </span>
                                    ) : null}
                                    {it.stats?.matk ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Sparkles size={12} className="text-violet-300" /> +{it.stats.matk}
                                      </span>
                                    ) : null}
                                    {it.stats?.def ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Shield size={12} className="text-sky-300" /> +{it.stats.def}
                                      </span>
                                    ) : null}
                                    {it.stats?.mdef ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Sparkles size={12} className="text-indigo-300" /> 魔抗+{it.stats.mdef}
                                      </span>
                                    ) : null}
                                    {it.stats?.hp ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Heart size={12} className="text-rose-300" /> +{it.stats.hp}
                                      </span>
                                    ) : null}
                                    {it.stats?.spd ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Wind size={12} className="text-emerald-300" /> {it.stats.spd > 0 ? `+${it.stats.spd}` : it.stats.spd}
                                      </span>
                                    ) : null}
                                    <span className="inline-flex items-center gap-1 text-slate-500 font-bold">賣出價 +{sell}</span>
                                  </div>
                                </div>
                              );
                            })
                        : (equipInstances ?? [])
                            .filter((inst) =>
                              shopMode === 'sell-equip' ? !inst?.locked && !equippedEidOwner?.[inst.eid] : true
                            )
                            .map((inst) => {
                              const it = getEquipItem(inst.itemId);
                              if (!it) return null;
                              const sell = getEquipSellPrice(it);
                              const owner = equippedEidOwner?.[inst.eid] ?? null;
                              const ownerName = owner ? HEROES_BASE.find((h) => h.id === owner)?.name ?? owner : null;
                              const locked = !!inst.locked;
                              const disabledSell = !!owner || locked;
                      const fxLine = (inst.affixes ?? []).map((a) => formatAffixZh(a)).join(' · ');
                              return (
                                <div key={inst.eid} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-black text-white truncate">
                                        {it.name} <span className="text-slate-500 font-bold">#{String(inst.eid).slice(-4)}</span>
                                      </p>
                                      <p className="text-[10px] font-bold text-slate-300 mt-1 leading-snug">
                                        {it.slot === 'weapon' ? '武器' : it.slot === 'offhand' ? '副手' : '防具'}
                                        {ownerName ? ` · 裝備中：${ownerName}` : ''}
                                        {locked ? ' · 已鎖定' : ''}
                                      </p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={disabledSell}
                                        onClick={() => sellEquip(inst.eid)}
                                        className={`px-3 py-2 rounded-xl border text-[10px] font-black tabular-nums ${
                                          disabledSell
                                            ? 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed opacity-70'
                                            : 'bg-amber-600/25 hover:bg-amber-600/40 border-amber-500/35 text-amber-100'
                                        }`}
                                      >
                                        賣 +{sell}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black text-slate-200 tabular-nums">
                                    {it.stats?.atk ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Sword size={12} className="text-amber-300" /> +{it.stats.atk}
                                      </span>
                                    ) : null}
                                    {it.stats?.matk ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Sparkles size={12} className="text-violet-300" /> +{it.stats.matk}
                                      </span>
                                    ) : null}
                                    {it.stats?.def ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Shield size={12} className="text-sky-300" /> +{it.stats.def}
                                      </span>
                                    ) : null}
                                    {it.stats?.mdef ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Sparkles size={12} className="text-indigo-300" /> 魔抗+{it.stats.mdef}
                                      </span>
                                    ) : null}
                                    {it.stats?.hp ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Heart size={12} className="text-rose-300" /> +{it.stats.hp}
                                      </span>
                                    ) : null}
                                    {it.stats?.spd ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Wind size={12} className="text-emerald-300" /> {it.stats.spd > 0 ? `+${it.stats.spd}` : it.stats.spd}
                                      </span>
                                    ) : null}
                                    {fxLine ? (
                                      <span className="text-[10px] font-black text-slate-300">{fxLine}</span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-600">（無詞條）</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                            .filter(Boolean)}
                      {shopMode === 'sell-equip' &&
                      ((equipInstances ?? []).filter((x) => !x?.locked && !equippedEidOwner?.[x.eid]).length ?? 0) === 0 ? (
                        <div className="h-24 flex items-center justify-center text-slate-600 text-[10px] font-bold">（沒有未裝備且未鎖定的裝備可出售）</div>
                      ) : null}
                    </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      {Object.values(ITEM_CATALOG)
                        .filter((it) => {
                          if (shopMode === 'buy-item') return (it.price ?? 0) > 0 && canBuyItemInShop(it.id);
                          return getInvCount(itemInv, it.id) > 0 && getItemSellPrice(it) > 0;
                        })
                        .map((it) => {
                        const owned = getInvCount(itemInv, it.id);
                        const sell = getItemSellPrice(it);
                        const disabledSell = owned <= 0 || sell <= 0;
                        return (
                          <div key={it.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[11px] font-black text-white truncate">{it.name}</p>
                                <p className="text-[10px] font-bold text-slate-300 mt-1 leading-snug">
                                  持有 {owned} · {it.desc}
                                </p>
                              </div>
                              {shopMode === 'buy-item' ? (
                                <button
                                  type="button"
                                  onClick={() => buyItem(it.id)}
                                  className="shrink-0 px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/45 border border-emerald-500/40 text-[10px] font-black text-emerald-100 tabular-nums"
                                >
                                  買 {it.price}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={disabledSell}
                                  onClick={() => sellItem(it.id)}
                                  className={`shrink-0 px-3 py-2 rounded-xl border text-[10px] font-black tabular-nums ${
                                    disabledSell
                                      ? 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed opacity-70'
                                      : 'bg-amber-600/25 hover:bg-amber-600/40 border-amber-500/35 text-amber-100'
                                  }`}
                                >
                                  {sell > 0 ? `賣 +${sell}` : '不可賣'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 min-h-[7.5rem]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Merchant</p>
                  <p className="text-[12px] font-bold text-slate-200 leading-relaxed mt-2">
                    {shopDialog}
                  </p>
                </div>
              </div>

              {/* 右：商人 CG 圖框 */}
              <div className="w-[16rem] shrink-0 hidden sm:block">
                <div className="h-full rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-[10px] font-black text-slate-300">商人半身 CG</p>
                    <p className="text-[9px] text-slate-600 mt-1">在此放置圖片</p>
                    <div className="mt-3 h-40 w-40 rounded-2xl border border-dashed border-white/15 bg-black/20 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                      CG FRAME
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {scene === 'battle' && (
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
              <div className="absolute inset-0" style={{ background: lobbyBgDef.fallback }} />
              <img
                key={lobbyBgDef.id}
                src={lobbyBgDef.image}
                alt=""
                decoding="async"
                draggable={false}
                className={`absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-[center_30%] max-sm:scale-[1.03] max-sm:origin-[center_30%] sm:object-center transition-opacity duration-500 ${
                  lobbyBgImgVisible ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setLobbyBgImgVisible(true)}
                onError={() => setLobbyBgImgVisible(false)}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950/65 via-slate-950/40 to-slate-950/95" />
            </div>
            <div className="relative z-10 flex-1 flex flex-col min-h-0 p-4 gap-2">
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

            <div className="flex justify-center items-end gap-3 py-4 shrink-0 min-h-[8.5rem]">
              {monsters.map((m) => (
                <div
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const canTargetEnemy =
                      targetMode === 'attack' || targetMode === 'skill' || targetMode === 'skill-flex' || targetMode === 'item-enemy';
                    if (targetMode === 'item-enemy' && pickedItemId) void onMonsterItemInvertSelect(m.id);
                    else if (canTargetEnemy) onTargetSelect(m.id);
                    else setStatusFocus({ side: 'monster', id: m.id });
                  }}
                  onKeyDown={(e) => {
                    const canTargetEnemy =
                      targetMode === 'attack' || targetMode === 'skill' || targetMode === 'skill-flex' || targetMode === 'item-enemy';
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (targetMode === 'item-enemy' && pickedItemId) void onMonsterItemInvertSelect(m.id);
                      else if (canTargetEnemy) onTargetSelect(m.id);
                    }
                  }}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    m.curHp <= 0 ? 'opacity-20 scale-75 grayscale' : 'active:scale-90 cursor-pointer'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full bg-slate-900 border-2 flex items-center justify-center overflow-hidden transition-all ${
                      (targetMode === 'attack' || targetMode === 'skill' || targetMode === 'skill-flex' || targetMode === 'item-enemy') &&
                      m.curHp > 0
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
                  <span className="max-w-[4.5rem] text-center text-[8px] font-bold text-slate-200 leading-tight line-clamp-2 break-words px-0.5">
                    {m.name}
                  </span>
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
              <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 px-0.5">
                {!activeUnit?.isHero || isProcessing ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    <CmdBtn icon={<Sword size={14} />} label="攻擊" color="bg-red-600" disabled />
                    <CmdBtn icon={<ShieldAlert size={14} />} label="防禦" color="bg-blue-600" disabled />
                    <CmdBtn icon={<Sparkles size={14} />} label="技能" color="bg-purple-600" disabled />
                    <CmdBtn icon={<Backpack size={14} />} label="道具" color="bg-slate-700" disabled />
                  </div>
                ) : (
                  skillMenuOpen ? (
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
                        {getBattleSkillsForHero(activeUnit).map((s) => {
                          const mpCost = getSkillMpCostForCaster(s, activeUnit);
                          const lackMp = activeUnit.curMp < mpCost;
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
                                  setLogs([`MP 不足，無法施放「${s.name}」（需 ${mpCost}）`, ...logs].slice(0, 5));
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
                                  if (s?.effect?.type === 'observeCheer') {
                                    castObserveCheer(s);
                                    return;
                                  }
                                  if (s?.effect?.type === 'jackPhantomDrawAll') {
                                    castJackPhantomDrawAll(s);
                                    return;
                                  }
                                  if (s?.effect?.type === 'halloweenTrickOrTreat') {
                                    castHalloweenTrickOrTreat(s);
                                    return;
                                  }
                                  if (s?.effect?.type === 'buff') {
                                    castBuffAtkAll(s);
                                    return;
                                  }
                                  if (s?.effect?.type === 'regen') {
                                    castRegenAll(s);
                                    return;
                                  }
                                  if (s?.effect?.type === 'cleanseOne') {
                                    castCleanseOneAll(s);
                                    return;
                                  }
                                }
                                if (!t.requiresTarget && t.side === 'ally' && t.mode === 'self') {
                                  if (s?.effect?.type === 'taunt') {
                                    castTauntSelf(s);
                                    return;
                                  }
                                }
                                if (!t.requiresTarget && t.side === 'enemy' && t.mode === 'all') {
                                  if (s?.effect?.type === 'damage') {
                                    castDamageAllEnemies(s);
                                    return;
                                  }
                                  if (s?.effect?.type === 'debuff' && s?.effect?.stat === 'spd') {
                                    castSlowAllEnemies(s);
                                    return;
                                  }
                                }
                                if (t.requiresTarget) {
                                  if (t.side === 'both') setTargetMode('skill-flex');
                                  else setTargetMode(t.side === 'ally' ? 'skill-ally' : 'skill');
                                }
                              }}
                              className={`flex flex-col items-start justify-center rounded-lg border px-2 py-1.5 text-left transition-all active:scale-[0.98] ${
                                lackMp
                                  ? 'border-white/5 bg-slate-900/40 text-slate-600 cursor-not-allowed opacity-60'
                                  : 'border-purple-500/40 bg-purple-600/25 hover:bg-purple-600/40 border-opacity-100'
                              }`}
                            >
                              <span className="text-[9px] font-black text-purple-100 leading-tight line-clamp-2">{s.name}</span>
                              <span className="text-[8px] font-bold text-cyan-300/90 mt-0.5">MP {mpCost}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : itemMenuOpen ? (
                    <div className="bg-slate-950/80 border border-white/10 rounded-xl p-2 shadow-lg ring-1 ring-white/10">
                      <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
                        <span className="text-[9px] font-black text-slate-200 uppercase tracking-wide">道具</span>
                        <button
                          type="button"
                          onClick={() => setItemMenuOpen(false)}
                          className="flex items-center gap-0.5 text-[8px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10"
                        >
                          <ChevronLeft size={12} className="shrink-0" />
                          返回
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(() => {
                          const owned = Object.values(ITEM_CATALOG).filter((it) => getInvCount(itemInv, it.id) > 0);
                          const items = owned.filter((it) => canUseInBattle(it));
                          if (items.length === 0) {
                            return (
                              <p className="col-span-2 text-[10px] text-slate-600 font-bold px-1 py-2">
                                {owned.length === 0 ? '（背包是空的）' : '（沒有可在戰鬥中使用的道具）'}
                              </p>
                            );
                          }
                          return items.map((it) => {
                            return (
                              <button
                                key={it.id}
                                type="button"
                                onClick={() => {
                                  const invert = isJackItemInvertActive(activeUnit);
                                  if (invert && jackInvertedItemIsAllyAllHeal(it)) {
                                    setItemMenuOpen(false);
                                    void useBattleItemAllyAll(it.id);
                                    return;
                                  }
                                  if (invert && jackInvertedItemNeedsEnemyTarget(it)) {
                                    setPickedItemId(it.id);
                                    setItemMenuOpen(false);
                                    setTargetMode('item-enemy');
                                    return;
                                  }
                                  if (it.effect?.type === 'healHp' && it.effect?.target === 'ally-all') {
                                    setItemMenuOpen(false);
                                    void useBattleItemAllyAll(it.id);
                                    return;
                                  }
                                  setPickedItemId(it.id);
                                  setItemMenuOpen(false);
                                  setTargetMode('item');
                                }}
                                className="flex flex-col items-start justify-center rounded-lg border px-2 py-1.5 text-left transition-all active:scale-[0.98] border-white/10 bg-white/5 hover:bg-white/10"
                              >
                                <span className="text-[9px] font-black text-slate-100 leading-tight line-clamp-2">{it.name}</span>
                                <span className="text-[8px] font-bold text-slate-400 mt-0.5">x{getInvCount(itemInv, it.id)}</span>
                                <span className="text-[8px] font-bold text-slate-500 mt-0.5 line-clamp-1">{it.desc}</span>
                              </button>
                            );
                          });
                        })()}
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
                              : targetMode === 'item' && pickedItemId
                                ? `請選擇隊友使用「${getItem(pickedItemId)?.name ?? '道具'}」`
                                : targetMode === 'item-enemy' && pickedItemId
                                  ? `道具反轉：請選擇敵人使用「${getItem(pickedItemId)?.name ?? '道具'}」`
                              : '請點擊上方的敵人進行攻擊'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetMode(null);
                          setPickedSkill(null);
                          setPickedItemId(null);
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
                          setItemMenuOpen(false);
                          setPickedItemId(null);
                        }}
                      />
                      <CmdBtn
                        icon={<Backpack size={14} />}
                        label="道具"
                        color="bg-slate-700"
                        onClick={() => {
                          setTargetMode(null);
                          setPickedSkill(null);
                          setSkillMenuOpen(false);
                          setItemMenuOpen(true);
                        }}
                      />
                    </div>
                  )
                )}
              </div>
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
                    role={targetMode === 'skill-ally' || targetMode === 'item' ? 'button' : undefined}
                    tabIndex={targetMode === 'skill-ally' || targetMode === 'item' ? 0 : undefined}
                    onClick={() => {
                      if (targetMode === 'skill-ally' || targetMode === 'skill-flex') onHeroTargetSelect(h.id);
                      else if (targetMode === 'item') onHeroItemSelect(h.id);
                      else setStatusFocus({ side: 'hero', id: h.id });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (targetMode === 'skill-ally' || targetMode === 'skill-flex') onHeroTargetSelect(h.id);
                        else if (targetMode === 'item') onHeroItemSelect(h.id);
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
                  <div className="mt-0.5 w-full bg-slate-800 h-0.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500"
                      style={{
                        width: `${Math.min(100, ((h.heroXp ?? 0) / Math.max(1, h.heroXpToNext ?? 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-0.5 w-full text-center text-[8px] font-black text-slate-500 tabular-nums leading-tight">
                    <div>HP {h.curHp}/{h.hp}</div>
                    <div>MP {h.curMp}/100</div>
                    <div className="text-violet-300/90">
                      Lv.{h.heroLevel ?? 1}/{h.heroLevelCap ?? 50} · EXP {h.heroXp ?? 0}/{h.heroXpToNext ?? '—'}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold mt-1 w-full text-center text-slate-100 leading-tight line-clamp-2 break-words hyphens-none px-0.5">
                    {h.name}
                  </span>
                  {(() => {
                    const t = h.type;
                    const map = {
                      fire: { name: '火', cls: 'text-red-300' },
                      wind: { name: '風', cls: 'text-emerald-300' },
                      water: { name: '水', cls: 'text-sky-300' },
                      dark: { name: '暗', cls: 'text-violet-300' },
                      light: { name: '光', cls: 'text-amber-200' },
                    };
                    const it = map[t];
                    if (!it) return null;
                    return <span className={`text-[8px] font-black mt-0.5 ${it.cls}`}>{it.name}</span>;
                  })()}
                </div>
              ))}
            </div>
            </div>
          </div>
        )}

        {(scene === 'victory' || scene === 'defeat') && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-950 text-center">
            <h2 className="text-5xl font-black italic mb-4 tracking-tighter">{scene === 'victory' ? 'VICTORY' : 'DEFEAT'}</h2>
            {scene === 'victory' && victoryXpReport?.length ? (
              <div className="w-full max-w-sm mb-6 rounded-2xl border border-violet-500/25 bg-violet-950/30 px-4 py-3 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-violet-300/90 mb-2">
                  戰鬥經驗（本戰合計{' '}
                  {victoryXpReport?.length
                    ? victoryXpReport.reduce((s, r) => s + (r.amount ?? 0), 0)
                    : sumMonstersXpReward(monsters)}{' '}
                  EXP，平分予上陣成員）
                </p>
                {victoryXpFootnote ? (
                  <p className="text-[9px] font-bold text-violet-200/85 mb-2 leading-snug">{victoryXpFootnote}</p>
                ) : null}
                <p className="text-[10px] font-black text-amber-200 mb-2">金錢獲得：+{victoryGoldGain}</p>
                {victoryGoldFootnote ? (
                  <p className="text-[9px] font-bold text-amber-200/85 mb-2 leading-snug">{victoryGoldFootnote}</p>
                ) : null}
                {victoryStarCrystalLine ? (
                  <p className="text-[10px] font-black text-cyan-200/95 mb-2">{victoryStarCrystalLine}</p>
                ) : null}
                {victoryLootLine ? <p className="text-[10px] font-black text-cyan-200 mb-2">{victoryLootLine}</p> : null}
                <ul className="space-y-1.5 text-[11px] font-bold text-slate-200 leading-snug">
                  {victoryXpReport.map((row) => (
                    <li key={row.id}>
                      {row.name} 獲得 <span className="text-violet-200">{row.amount}</span> EXP
                      {row.levelUpCount > 0 ? (
                        <span className="text-amber-300">
                          {' '}
                          · 升級 ×{row.levelUpCount}（Lv.{row.newLevel}）
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setVictoryXpReport(null);
                setVictoryStarCrystalLine('');
                setVictoryXpFootnote('');
                setVictoryGoldFootnote('');
                setScene('lobby');
              }}
              className="px-10 py-3 bg-blue-600 rounded-full font-bold flex items-center gap-2"
            >
              <RotateCcw size={18} /> 返回主廳
            </button>
          </div>
        )}

        {resetAccountModalOpen && (
          <div className="fixed inset-0 z-[118] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-900 border-2 border-red-500/30 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-center mb-3 text-red-500">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-lg font-black italic text-center mb-2 text-white">重置帳號</h3>
              <p className="text-[11px] text-slate-400 text-center mb-4 leading-relaxed">
                將清除本機儲存的<strong className="text-slate-300"> 隊伍編成 </strong>與<strong className="text-slate-300"> 等級／經驗值 </strong>
                ，無法復原。若確定要繼續，請在下方輸入 <span className="font-mono font-black text-amber-300">reset</span>（全小寫）。
              </p>
              <label className="block text-[9px] font-black uppercase tracking-wide text-slate-500 mb-1.5">確認文字</label>
              <input
                type="text"
                autoComplete="off"
                value={resetConfirmInput}
                onChange={(e) => {
                  setResetConfirmInput(e.target.value);
                  setResetConfirmError('');
                }}
                placeholder="reset"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
              {resetConfirmError ? <p className="mt-2 text-[10px] font-bold text-red-400">{resetConfirmError}</p> : null}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={performAccountReset}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-black text-sm transition-colors"
                >
                  確認重置
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetAccountModalOpen(false);
                    setResetConfirmInput('');
                    setResetConfirmError('');
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm text-slate-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {equipModalHeroId && (
          <div className="fixed inset-0 z-[118] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            {(() => {
              const hero = HEROES_BASE.find((h) => h.id === equipModalHeroId);
              if (!hero) return null;
              const equip2 = equipForHeroV2(hero.id);
              const equip = equipItemIdsForHero(hero.id);
              const summary = getEquipSummary(equip);

              const renderStatIcons = (stats) => {
                const s = stats ?? {};
                const items = [
                  s.hp ? { key: 'hp', icon: <Heart size={12} className="text-rose-300" />, val: s.hp } : null,
                  s.atk ? { key: 'atk', icon: <Sword size={12} className="text-amber-300" />, val: s.atk } : null,
                  s.matk ? { key: 'matk', icon: <Sparkles size={12} className="text-violet-300" />, val: s.matk } : null,
                  s.def ? { key: 'def', icon: <Shield size={12} className="text-sky-300" />, val: s.def } : null,
                  s.mdef ? { key: 'mdef', icon: <Sparkles size={12} className="text-indigo-300" />, val: s.mdef } : null,
                  s.spd ? { key: 'spd', icon: <Wind size={12} className="text-emerald-300" />, val: s.spd } : null,
                ].filter(Boolean);
                if (!items.length) return <span className="text-[9px] font-bold text-slate-600">（無加成）</span>;
                return (
                  <div className="flex flex-wrap gap-2">
                    {items.map((it) => (
                      <span key={it.key} className="inline-flex items-center gap-1 text-[10px] font-black text-slate-200 tabular-nums">
                        {it.icon}
                        +{it.val}
                      </span>
                    ))}
                  </div>
                );
              };

              const optionLabel = (it) => {
                const s = it?.stats ?? {};
                const parts = [];
                if (s.atk) parts.push(`攻擊+${s.atk}`);
                if (s.def) parts.push(`物防+${s.def}`);
                if (s.mdef) parts.push(`魔抗+${s.mdef}`);
                if (s.matk) parts.push(`魔力+${s.matk}`);
                if (s.hp) parts.push(`HP+${s.hp}`);
                if (s.spd) parts.push(`速度${s.spd > 0 ? `+${s.spd}` : s.spd}`);
                return parts.length ? `${it.name}（${parts.join(' ') }）` : it.name;
              };

              const slotSelect = (slot, label, eidValue, setEidValue, slotKey, affixKey) => {
                const inst = getInstanceByEid(eidValue);
                const valueItemId = inst?.itemId ?? null;
                const ok = !!inst?.itemId && Array.isArray(inst?.affixes) && inst.affixes.length > 0;
                const renderAffix = (a, idx) => {
                  const statKey = a?.stat;
                  const val = Math.floor(Number(a?.value) || 0);
                        const map = {
                    hp: { icon: <Heart size={12} className="text-rose-300" />, name: 'HP' },
                    atk: { icon: <Sword size={12} className="text-amber-300" />, name: '攻擊' },
                    matk: { icon: <Sparkles size={12} className="text-violet-300" />, name: '魔力' },
                    def: { icon: <Shield size={12} className="text-sky-300" />, name: '物防' },
                    mdef: { icon: <Sparkles size={12} className="text-indigo-300" />, name: '魔抗' },
                    spd: { icon: <Wind size={12} className="text-emerald-300" />, name: '速度' },
                          critRateAdd: { icon: <Sparkles size={12} className="text-cyan-300" />, name: '爆擊率' },
                          critDmgMul: { icon: <Sparkles size={12} className="text-fuchsia-300" />, name: '爆傷' },
                          skillDmgMul: { icon: <Sparkles size={12} className="text-amber-200" />, name: '技能傷' },
                          incomingDmgMul: { icon: <Shield size={12} className="text-emerald-200" />, name: '減傷' },
                          ccHitAdd: { icon: <Sparkles size={12} className="text-sky-200" />, name: '控制命中' },
                          ailResistAdd: { icon: <Shield size={12} className="text-violet-200" />, name: '異常抗性' },
                  };
                  const meta = map[statKey] ?? { icon: null, name: String(statKey || '—') };
                  return (
                    <span key={`${statKey}-${idx}`} className="inline-flex items-center gap-1 text-[10px] font-black text-slate-200 tabular-nums">
                      {meta.icon}
                      {meta.name}+{val}
                    </span>
                  );
                };
                return (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[9px] font-black text-slate-400">{label}</p>
                  <select
                    value={eidValue ?? ''}
                    onChange={(e) => setEidValue(e.target.value || null)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-[11px] font-black text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  >
                    <option value="">（不裝備）</option>
                    {(equipInstances ?? [])
                      .filter((x) => getEquipItem(x.itemId)?.slot === slot)
                      .filter((x) => canEquipEid(x.eid, hero.id) || x.eid === eidValue)
                      .map((x) => {
                        const it = getEquipItem(x.itemId);
                        if (!it) return null;
                        const suffix = equippedEidOwner?.[x.eid] && equippedEidOwner?.[x.eid] !== hero.id ? '（已被他人裝備）' : '';
                        const fxBits = (x.affixes ?? [])
                          .slice(0, 2)
                          .map((a) => `${String(a.stat).toUpperCase()}+${a.value}`)
                          .join(' ');
                        const fxLine = fxBits ? `｜${fxBits}${(x.affixes?.length ?? 0) > 2 ? '…' : ''}` : '';
                        return (
                          <option key={x.eid} value={x.eid}>
                            {it.name}{fxLine}{suffix}
                          </option>
                        );
                      }).filter(Boolean)}
                  </select>
                  <div className="mt-2">{renderStatIcons(getEquipItem(valueItemId)?.stats)}</div>
                  <div className="mt-2">
                    <p className="text-[9px] font-black text-slate-500">詞條</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {ok ? inst.affixes.map(renderAffix) : <span className="text-[10px] font-bold text-slate-600">（無）</span>}
                    </div>
                  </div>
                </div>
                );
              };

              return (
                <div className="w-full max-w-sm bg-slate-900 border-2 border-white/10 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Equipment</p>
                      <h3 className="text-lg font-black italic text-white truncate">{hero.name}</h3>
                      <p className="text-[9px] font-bold text-slate-500 mt-1">
                        武器：{summary.weapon} · 副手：{summary.offhand} · 防具：{summary.armor}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEquipModalHeroId(null)}
                      className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center shrink-0"
                      aria-label="關閉"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {slotSelect(
                      EQUIP_SLOTS.weapon,
                      '武器',
                      equip2.weaponEid,
                      (v) => setEquipForHeroV2(hero.id, { weaponEid: v }),
                      'weaponId',
                      'weapon'
                    )}
                    {slotSelect(
                      EQUIP_SLOTS.offhand,
                      '副手',
                      equip2.offhandEid,
                      (v) => setEquipForHeroV2(hero.id, { offhandEid: v }),
                      'offhandId',
                      'offhand'
                    )}
                    {slotSelect(
                      EQUIP_SLOTS.armor,
                      '防具',
                      equip2.armorEid,
                      (v) => setEquipForHeroV2(hero.id, { armorEid: v }),
                      'armorId',
                      'armor'
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[9px] font-black text-slate-400">鍛造鋪</p>
                      <span className="text-[9px] font-black text-violet-200/90 tabular-nums">Lv.{getForgeLevelFromInventory(itemInv)}</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 mt-1">提示：詞條會依鍛造鋪等級生成，可在「鍛造所」重抽或指定。</p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setEquipForHeroV2(hero.id, { weaponEid: null, offhandEid: null, armorEid: null })}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-black text-[11px] text-slate-200 border border-white/10"
                    >
                      全部卸下
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipModalHeroId(null)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm"
                    >
                      完成
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {heroInfo && (
          <div className="fixed inset-0 z-[118] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            {(() => {
              const heroBase = HEROES_BASE.find((h) => h.id === heroInfo.heroId);
              if (!heroBase) return null;
              const equip = equipItemIdsForHero(heroBase.id);
              const bonus = getEquipStatBonus(equip);
              const eqSum = getEquipSummary(equip);
              const xpMap = loadHeroXpMap();
              const prog = xpMap[heroBase.id] ?? defaultProgress();
              const leveled = applyLevelLinearStatsToHero(heroBase, prog);
              const final0 = applyEquipmentToHero(leveled, equip);
              const final = applyTalentStatsToUnit({ ...final0, isHero: true }, talentMap);
              const skills = getSkillsForHero({ id: heroBase.id }) ?? [];
              const pick = getTalentPick(talentMap, heroBase.id);
              const row3 = getHeroRow3Def(heroBase.id);
              const setPick = (patch) => {
                const next = { ...(talentMap ?? {}), [heroBase.id]: { ...(talentMap?.[heroBase.id] ?? {}), ...patch } };
                setTalentMap(next);
                saveTalentMap(next);
              };
              const clearPick = () => {
                const next = { ...(talentMap ?? {}) };
                const cur = next[heroBase.id] ?? {};
                const cleaned = { ...cur, r1: null, r2: null, r3: null, r4: null };
                const empty = !cleaned.r1 && !cleaned.r2 && !cleaned.r3 && !cleaned.r4;
                if (empty) delete next[heroBase.id];
                else next[heroBase.id] = cleaned;
                setTalentMap(next);
                saveTalentMap(next);
              };

              const statRow = (label, baseVal, bonusVal, finalVal) => (
                <div className="flex items-center justify-between text-[11px] font-black tabular-nums">
                  <span className="text-slate-300">{label}</span>
                  <span className="text-slate-400">
                    {baseVal}
                    <span className="text-amber-300/90"> +{bonusVal}</span>
                    <span className="text-slate-500"> = </span>
                    <span className="text-white">{finalVal}</span>
                  </span>
                </div>
              );

              return (
                <div className="w-full max-w-sm max-h-[85vh] bg-slate-900 border-2 border-white/10 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col">
                  <div className="px-5 pt-5 pb-3 border-b border-white/10 bg-slate-900/95 backdrop-blur sticky top-0 z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hero Info</p>
                        <h3 className="text-lg font-black italic text-white truncate">{heroBase.name}</h3>
                        <p className="text-[9px] font-bold text-violet-300/90 mt-1">
                          Lv.{prog.level} · EXP {prog.xp}/{xpRequiredForNextLevel(prog.level)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHeroInfo(null)}
                        className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center shrink-0"
                        aria-label="關閉"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-2 overflow-y-auto no-scrollbar">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3 flex items-center gap-3">
                      <HeroAvatar src={heroBase.avatar} name={heroBase.name} accentClassName={heroBase.color} size="lg" />
                      <div className="min-w-0">
                        {heroBase.title ? <p className="text-[10px] font-black text-slate-200">「{heroBase.title}」</p> : null}
                        <p className="text-[9px] font-black mt-1">
                          {(() => {
                            const t = heroBase.type;
                            const map = {
                              fire: { name: '火', cls: 'text-red-300' },
                              wind: { name: '風', cls: 'text-emerald-300' },
                              water: { name: '水', cls: 'text-sky-300' },
                              dark: { name: '暗', cls: 'text-violet-300' },
                              light: { name: '光', cls: 'text-amber-200' },
                            };
                            const it = map[t] ?? { name: String(t || '—'), cls: 'text-slate-400' };
                            return (
                              <span className="inline-flex items-center gap-2">
                                <span className="text-slate-600">屬性</span>
                                <span className={it.cls}>{it.name}</span>
                              </span>
                            );
                          })()}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 mt-1">
                          武器：{eqSum.weapon} · 副手：{eqSum.offhand} · 防具：{eqSum.armor}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3 space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400">數值（基礎+裝備）</p>
                      {statRow('HP', leveled.hp, bonus.hp, final.hp)}
                      {statRow('攻擊', leveled.atk, bonus.atk, final.atk)}
                      {statRow('魔力', leveled.matk ?? 0, bonus.matk, final.matk ?? 0)}
                      {statRow('物防', leveled.def, bonus.def, final.def)}
                      {statRow('魔抗', leveled.mdef ?? leveled.def, bonus.mdef, final.mdef ?? final.def)}
                      {statRow('速度', leveled.spd, bonus.spd, final.spd)}
                    </div>

                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[9px] font-black text-slate-400">天賦（含「碎晶列」）</p>
                        <button
                          type="button"
                          onClick={clearPick}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
                          title="清空此角色已選天賦"
                        >
                          清空選擇
                        </button>
                      </div>
                      <div className="mt-2 space-y-3">
                        {TALENT_ROWS.map((row) => {
                          const selected = row.id === 'r1' ? (pick.r1 ?? null) : (pick.r2 ?? null);
                          return (
                            <div key={row.id}>
                              <p className="text-[10px] font-black text-slate-200">{row.title}</p>
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                {row.options.map((o) => {
                                  const on = selected === o.id;
                                  return (
                                    <button
                                      key={o.id}
                                      type="button"
                                      onClick={() => setPick(row.id === 'r1' ? { r1: o.id } : { r2: o.id })}
                                      className={
                                        (on
                                          ? 'bg-emerald-600/25 border-emerald-400/40 text-emerald-100'
                                          : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10') +
                                        ' rounded-xl border px-2 py-2 text-left'
                                      }
                                    >
                                      <p className="text-[10px] font-black truncate">{o.name}</p>
                                      <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-snug">{o.description}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-black text-slate-200">
                              {(() => {
                                const p = getR4HeroProg(heroBase.id);
                                return `碎晶列（${p?.unlocked ? `Lv.${p?.level ?? 1}/${TALENT_R4_LEVEL_MAX}` : '未解鎖'}）`;
                              })()}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-violet-200/90 tabular-nums">碎晶 {talentR4Prog?.crystals ?? 0}</span>
                              {!getR4HeroProg(heroBase.id)?.unlocked ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cost = 10;
                                    const key = getR4ShareKey(heroBase.id);
                                    if ((talentR4Prog?.crystals ?? 0) < cost) return;
                                    setTalentR4Prog((s) => ({
                                      ...(s ?? {}),
                                      crystals: Math.max(0, (s?.crystals ?? 0) - cost),
                                      byHero: { ...(s?.byHero ?? {}), [key]: { unlocked: true, level: 1 } },
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-violet-600/20 hover:bg-violet-600/30 border border-violet-400/30 text-violet-100 disabled:opacity-40 disabled:pointer-events-none"
                                  disabled={(talentR4Prog?.crystals ?? 0) < 10}
                                  title="消耗碎晶解鎖此角色的碎晶列"
                                >
                                  解鎖（10）
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cost = 12;
                                    const key = getR4ShareKey(heroBase.id);
                                    const curLv = getR4HeroProg(heroBase.id)?.level ?? 1;
                                    if (curLv >= TALENT_R4_LEVEL_MAX) return;
                                    if ((talentR4Prog?.crystals ?? 0) < cost) return;
                                    setTalentR4Prog((s) => ({
                                      ...(s ?? {}),
                                      crystals: Math.max(0, (s?.crystals ?? 0) - cost),
                                      byHero: {
                                        ...(s?.byHero ?? {}),
                                        [key]: { unlocked: true, level: Math.min(TALENT_R4_LEVEL_MAX, curLv + 1) },
                                      },
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-violet-600/20 hover:bg-violet-600/30 border border-violet-400/30 text-violet-100 disabled:opacity-40 disabled:pointer-events-none"
                                  disabled={(getR4HeroProg(heroBase.id)?.level ?? 1) >= TALENT_R4_LEVEL_MAX || (talentR4Prog?.crystals ?? 0) < 12}
                                  title="消耗碎晶提升此角色的碎晶列等級"
                                >
                                  升級（12）
                                </button>
                              )}
                            </div>
                          </div>
                          {getR4HeroProg(heroBase.id)?.unlocked ? (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {TALENT_ROW4_OPTIONS.map((o) => {
                                const on = (pick.r4 ?? null) === o.id;
                                const lvlI = getR4LevelIndexForHero(heroBase.id);
                                const desc =
                                  o.id === 'r4_skillMpDown'
                                    ? `技能 MP -${R4_SKILL_MP_DOWN_BY_LEVEL[lvlI] ?? 2}（最低 1）`
                                    : o.id === 'r4_skillDmgUp'
                                      ? `技能傷害 +${Math.round((((R4_SKILL_DMG_MUL_BY_LEVEL[lvlI] ?? 1) - 1) * 100))}%`
                                      : `爆擊率 +${Math.round(((R4_CRIT_RATE_ADD_BY_LEVEL[lvlI] ?? 0) * 100))}%`;
                                return (
                                  <button
                                    key={o.id}
                                    type="button"
                                    onClick={() => setPick({ r4: o.id })}
                                    className={
                                      (on
                                        ? 'bg-violet-600/25 border-violet-400/40 text-violet-100'
                                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10') +
                                      ' rounded-xl border px-2 py-2 text-left'
                                    }
                                  >
                                    <p className="text-[10px] font-black truncate">{o.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-snug">{desc}</p>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="mt-2 text-[10px] font-bold text-slate-500">（可在「星曉祈願」抽到天賦碎晶來解鎖/升級）</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-black text-slate-200">{row3.title ?? '專屬'}</p>
                          {row3.options?.length ? (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {row3.options.map((o) => {
                                const on = (pick.r3 ?? null) === o.id;
                                return (
                                  <button
                                    key={o.id}
                                    type="button"
                                    onClick={() => setPick({ r3: o.id })}
                                    className={
                                      (on
                                        ? 'bg-violet-600/25 border-violet-400/40 text-violet-100'
                                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10') +
                                      ' rounded-xl border px-2 py-2 text-left'
                                    }
                                  >
                                    <p className="text-[10px] font-black truncate">{o.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-snug">{o.description}</p>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="mt-2 text-[10px] font-bold text-slate-500">（此角色的專屬天賦尚未設計）</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <p className="text-[9px] font-black text-slate-400">隊長技</p>
                      {heroBase.captainPassive ? (
                        <p className="text-[11px] font-bold text-amber-100/90 mt-1 leading-snug">
                          <span className="font-black text-amber-300">「{heroBase.captainPassive.name}」</span> {heroBase.captainPassive.description}
                        </p>
                      ) : (
                        <p className="text-[11px] font-bold text-slate-500 mt-1">（無）</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <p className="text-[9px] font-black text-slate-400">被動</p>
                      {heroBase.passive ? (
                        <p className="text-[11px] font-bold text-slate-200 mt-1 leading-snug">
                          <span className="font-black text-slate-100">「{heroBase.passive.name}」</span> {heroBase.passive.description}
                        </p>
                      ) : (
                        <p className="text-[11px] font-bold text-slate-500 mt-1">（無）</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <p className="text-[9px] font-black text-slate-400">技能</p>
                      {skills.length ? (
                        <ul className="mt-2 space-y-2">
                          {skills.map((s) => (
                            <li key={s.id} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  {(() => {
                                    const uses = skillMasteryMap?.[heroBase.id]?.[s.id]?.uses ?? 0;
                                    const rank = getMasteryRank(uses);
                                    const mul = getSkillPowerMulFromMastery(skillMasteryMap, heroBase.id, s.id);
                                    const pct = Math.round((mul - 1) * 100);
                                    return (
                                      <>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                          <p className="text-[11px] font-black text-white truncate">{s.name}</p>
                                          <span className="text-[10px] font-black text-slate-400 tabular-nums shrink-0">Lv.{rank}/10</span>
                                        </div>
                                        <div className="mt-1 text-[10px] font-bold text-slate-300 leading-snug flex flex-wrap items-center gap-x-2 gap-y-1">
                                          <span>{describeSkillEffect(s, { masteryPct: pct })}</span>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                                <span className="text-[10px] font-black text-cyan-300 tabular-nums shrink-0">
                                  MP {Math.max(1, (s.mpCost ?? 0) - getSkillMpDiscountFromMastery(skillMasteryMap, heroBase.id, s.id))}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] font-bold text-slate-500 mt-1">（無）</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <p className="text-[9px] font-black text-slate-400">合體技</p>
                      {(() => {
                        const combos = (COMBO_SKILL_DEFS ?? []).filter((d) => d && (d.a === heroBase.id || d.b === heroBase.id));
                        if (!combos.length) return <p className="text-[11px] font-bold text-slate-500 mt-1">（無）</p>;
                        return (
                          <ul className="mt-2 space-y-2">
                            {combos.map((d) => {
                              const partnerId = d.a === heroBase.id ? d.b : d.a;
                              const partnerName = HEROES_BASE.find((h) => h.id === partnerId)?.name ?? partnerId;
                              const pts = getBondPoints(bondMap, heroBase.id, partnerId);
                              const lv = getBondLevel(pts);
                              const need = Math.max(1, Math.floor(Number(d.requiredBondLv) || 2));
                              const ok = lv >= need;
                              const skillName = d.skill?.name ?? '（尚未實裝技能）';
                              return (
                                <li key={d.id} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-black text-white truncate">
                                        與 {partnerName}：{skillName}
                                      </p>
                                      <p className="text-[10px] font-bold text-slate-300 mt-1 leading-snug">
                                        解鎖：羈絆 Lv.{need}（目前 Lv.{lv}）
                                      </p>
                                      <p className="text-[10px] font-bold text-slate-300 mt-1 leading-snug">
                                        {d.skill ? `效果：${describeSkillEffect(d.skill)}` : '效果：尚未實裝（之後可補技能資料）'}
                                      </p>
                                      <p className="text-[9px] font-black text-slate-500 mt-1">代價：施放者與夥伴皆進入硬直（行動延後）。</p>
                                    </div>
                                    <span className={`text-[10px] font-black shrink-0 ${ok ? 'text-emerald-300' : 'text-slate-500'}`}>
                                      {ok ? '可用' : '未解鎖'}
                                    </span>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-white/10 bg-slate-900/95 backdrop-blur shrink-0">
                    <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setHeroInfo(null)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm"
                    >
                      知道了
                    </button>
                    </div>
                  </div>
                </div>
              );
            })()}
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

        {passiveInfo && (
          <div className="absolute inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-900 border-2 border-white/10 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Passive</p>
                  <h3 className="text-lg font-black italic text-white leading-tight">{passiveInfo.name}</h3>
                  <p className="text-[9px] font-bold text-slate-500 mt-1">被動技能（常駐）</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPassiveInfo(null)}
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center shrink-0"
                  aria-label="關閉"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <p className="text-[9px] font-black text-slate-400">說明</p>
                  <p className="text-[11px] font-bold text-slate-200 leading-snug">{passiveInfo.description || '（無說明）'}</p>
                </div>
                {passiveInfo.mechanics ? (
                  <div className="rounded-2xl border border-slate-600/30 bg-slate-950/50 p-3">
                    <p className="text-[9px] font-black text-slate-400">詳細效果</p>
                    <p className="text-[11px] font-bold text-slate-300 leading-snug mt-1">{passiveInfo.mechanics}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPassiveInfo(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm"
                >
                  知道了
                </button>
              </div>
            </div>
          </div>
        )}

        {lobbyPanelModal && scene === 'lobby' ? (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/55"
            onClick={() => setLobbyPanelModal(null)}
            role="presentation"
          >
            <div
              className={`w-full rounded-2xl border border-white/15 bg-slate-950 p-5 shadow-2xl ${
                lobbyPanelModal === 'recruit'
                  ? 'max-w-lg'
                  : lobbyPanelModal === 'garden' || lobbyPanelModal === 'lobbyBg'
                    ? 'max-w-md'
                    : 'max-w-sm'
              }`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={
                lobbyPanelModal === 'daily'
                  ? '每日任務'
                  : lobbyPanelModal === 'achievements'
                    ? '成就'
                    : lobbyPanelModal === 'recruit'
                      ? '星曉祈願'
                      : lobbyPanelModal === 'forge'
                        ? '鍛造所'
                        : lobbyPanelModal === 'training'
                          ? '訓練場'
                          : lobbyPanelModal === 'camp'
                            ? '餐酒館'
                            : lobbyPanelModal === 'garden'
                              ? '休憩園'
                              : lobbyPanelModal === 'lobbyBg'
                                ? '大廳背景'
                                : '面板'
              }
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-black text-white">
                  {lobbyPanelModal === 'daily'
                    ? '每日任務'
                    : lobbyPanelModal === 'achievements'
                      ? '成就'
                      : lobbyPanelModal === 'recruit'
                        ? '星曉祈願'
                        : lobbyPanelModal === 'forge'
                          ? '鍛造所'
                          : lobbyPanelModal === 'training'
                            ? '訓練場'
                            : lobbyPanelModal === 'camp'
                              ? '餐酒館'
                              : lobbyPanelModal === 'garden'
                                ? '休憩園'
                                : lobbyPanelModal === 'lobbyBg'
                                  ? '大廳背景'
                                  : '面板'}
                </h3>
                <button
                  type="button"
                  onClick={() => setLobbyPanelModal(null)}
                  className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 text-sm font-black"
                  aria-label="關閉"
                >
                  ×
                </button>
              </div>
              {lobbyPanelModal === 'recruit' ? (
                <div className="mt-3 flex min-h-0 max-h-[min(78vh,32rem)] flex-col gap-2">
                  <div className="flex shrink-0 gap-1 rounded-xl border border-white/10 bg-slate-900/60 p-0.5" role="tablist" aria-label="星曉祈願分頁">
                    {[
                      { id: 'limited', label: '星曉限定池1' },
                      { id: 'soon1', label: '星曉限定池2' },
                      { id: 'soon2', label: '星曉限定池3' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={recruitWishTab === t.id}
                        onClick={() => setRecruitWishTab(t.id)}
                        className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-[10px] font-black transition-colors ${
                          recruitWishTab === t.id
                            ? 'border border-cyan-500/40 bg-cyan-600/40 text-cyan-100'
                            : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {recruitWishTab === 'limited' ? (
                <div className="relative min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5 no-scrollbar">
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                    限定池：邂逅率 <span className="text-cyan-300 font-black">5%</span>（僅當尚餘未擁有之限定角時生效），其餘為
                    <span className="text-amber-200/90 font-black"> 金幣、天賦碎晶、抵用券／鍛造幣／訓練書、經驗關卡入場券等</span>。
                    每抽 <span className="text-cyan-300 font-black">{STAR_WISH_PULL_COST}</span> 星曉晶石；未邂逅到角時，直購價
                    <span className="text-amber-200/90 font-black"> -40</span>（最低 300），取得角色或直購後重置。限定角齊全後仍可持續星曉祈願以取得碎晶等獎勵。
                  </p>
                  <button
                    type="button"
                    onClick={() => setStarWishOddsOpen(true)}
                    className="w-full py-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-950/45 text-[12px] font-black text-cyan-100"
                  >
                    檢視完整機率表
                  </button>
                  <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-bold text-slate-300">
                    <span className="text-slate-500">持有星曉晶石：</span>
                    <span className="tabular-nums text-cyan-200">{starCrystals}</span>
                    <span className="text-slate-600 mx-2">|</span>
                    <span className="text-slate-500">直購目前價格：</span>
                    <span className="tabular-nums text-amber-200">{starWishDirectPrice}</span>
                    <span className="text-slate-600 mx-1">（累積未邂逅抽數 {starWishDiscountPulls}）</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] font-bold text-slate-200">
                    {STAR_WISH_HERO_ORDER.map(({ id, name }) => (
                      <li key={id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1.5">
                        <span>{name}</span>
                        {isHeroUnlocked(id) ? <span className="text-emerald-400 text-[10px] font-black">已取得</span> : <span className="text-slate-500 text-[10px]">未邂逅</span>}
                      </li>
                    ))}
                  </ul>
                  {starWishLastMsg ? (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-950/25 px-3 py-2.5">
                      {starWishRewardPreview?.type === 'hero' ? (
                        (() => {
                          const wh = HEROES_BASE.find((h) => h.id === starWishRewardPreview.heroId);
                          if (!wh) return null;
                          return (
                            <div className="shrink-0 rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-1 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                              <HeroAvatar src={wh.avatar} name={wh.name} accentClassName={wh.color} size="xl" className="!rounded-2xl !ring-2 !ring-cyan-400/35" />
                            </div>
                          );
                        })()
                      ) : starWishRewardPreview?.type === 'gold' ? (
                        <div
                          className="flex h-[7.25rem] w-[7.25rem] shrink-0 items-center justify-center rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-500/20 via-amber-950/60 to-yellow-900/30 shadow-[0_0_14px_rgba(251,191,36,0.2)]"
                          aria-hidden
                        >
                          <Coins size={44} className="text-amber-200 drop-shadow-md" strokeWidth={2} />
                        </div>
                      ) : starWishRewardPreview?.type === 'r4crystal' ? (
                        <div
                          className="flex h-[7.25rem] w-[7.25rem] shrink-0 items-center justify-center rounded-2xl border border-violet-400/35 bg-gradient-to-br from-violet-500/15 via-slate-950/60 to-fuchsia-900/25 shadow-[0_0_14px_rgba(167,139,250,0.18)]"
                          aria-hidden
                        >
                          <span className="text-[34px] font-black text-violet-200 drop-shadow-md">✦</span>
                        </div>
                      ) : starWishRewardPreview?.type === 'item' ? (
                        <div
                          className="flex h-[7.25rem] w-[7.25rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-500/15 via-slate-950/60 to-cyan-900/20 shadow-[0_0_14px_rgba(52,211,153,0.16)] px-1"
                          aria-hidden
                        >
                          <Backpack size={40} className="text-emerald-200" strokeWidth={2.25} />
                          <span className="text-[9px] font-black text-emerald-100/90 text-center leading-tight line-clamp-2">
                            {getItem(starWishRewardPreview.itemId)?.name ?? '道具'}
                            {starWishRewardPreview.amount > 1 ? ` ×${starWishRewardPreview.amount}` : ''}
                          </span>
                        </div>
                      ) : null}
                      <p className="text-[11px] font-bold text-amber-100/95 leading-snug min-w-0 flex-1">{starWishLastMsg}</p>
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    {(() => {
                      const sellRate = 120; // 1 碎晶 → 120 金幣
                      const canSell = (talentR4Prog?.crystals ?? 0) > 0;
                      return (
                        <button
                          type="button"
                          disabled={!canSell}
                          onClick={() => {
                            if (!canSell) return;
                            const amt = talentR4Prog?.crystals ?? 0;
                            setTalentR4Prog((s) => ({ ...(s ?? {}), crystals: 0, byHero: s?.byHero ?? {} }));
                            setGold((g) => g + amt * sellRate);
                            setStarWishRewardPreview({ type: 'gold', amount: amt * sellRate });
                            setStarWishLastMsg(`出售天賦碎晶 ×${amt}：獲得金幣 +${amt * sellRate}。`);
                          }}
                          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-45 disabled:pointer-events-none text-[12px] font-black text-slate-200 border border-white/10"
                          title="把碎晶換成金幣（可清空庫存）"
                        >
                          出售碎晶換金幣（1→{sellRate}）
                        </button>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={runStarWishPull}
                      disabled={starCrystals < STAR_WISH_PULL_COST}
                      className="w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 disabled:opacity-45 disabled:pointer-events-none text-sm font-black text-white border border-cyan-500/30"
                    >
                      星曉祈願一次（{STAR_WISH_PULL_COST} 星曉晶石）
                    </button>
                    {remainingWishHeroIds.length === 0 ? (
                      <p className="text-[10px] font-bold text-center text-emerald-300/95 leading-snug">
                        本期四位限定角已齊，仍可持續星曉祈願以取得天賦碎晶與其餘獎勵。
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">直購自選（未擁有者）</p>
                        <div className="grid grid-cols-2 gap-2">
                          {remainingWishHeroIds.map((hid) => {
                            const nm = HEROES_BASE.find((h) => h.id === hid)?.name ?? hid;
                            const can = starCrystals >= starWishDirectPrice;
                            return (
                              <button
                                key={hid}
                                type="button"
                                disabled={!can}
                                onClick={() => directPurchaseWishHero(hid)}
                                className="rounded-xl border border-amber-500/30 bg-amber-950/25 px-2 py-2 text-left hover:bg-amber-950/40 disabled:opacity-45 disabled:pointer-events-none transition-colors"
                              >
                                <span className="block text-[11px] font-black text-amber-100 leading-tight">{nm}</span>
                                <span className="block text-[9px] font-bold text-amber-200/80 mt-0.5">{starWishDirectPrice} 晶</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLobbyPanelModal(null)}
                    className="w-full py-2 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 text-xs font-black text-slate-200"
                  >
                    關閉
                  </button>
                  {starWishOddsOpen ? (
                    <div
                      className="absolute inset-0 z-[25] flex items-center justify-center rounded-2xl bg-black/75 p-2 backdrop-blur-sm"
                      onClick={() => setStarWishOddsOpen(false)}
                      role="presentation"
                    >
                      <div
                        className="max-h-[min(72vh,26rem)] w-full max-w-md overflow-y-auto no-scrollbar rounded-xl border border-cyan-500/25 bg-slate-950/98 p-3 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-label="星曉祈願 機率表"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12px] font-black text-white">星曉限定 機率表</p>
                          <button
                            type="button"
                            onClick={() => setStarWishOddsOpen(false)}
                            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-black shrink-0"
                            aria-label="關閉機率表"
                          >
                            ×
                          </button>
                        </div>
                        {(() => {
                          const nWish = remainingWishHeroIds.length;
                          const pMeet = 100 * STAR_WISH_CHAR_RATE;
                          const pEach = nWish > 0 ? pMeet / nWish : 0;
                          const jMul = nWish > 0 ? 1 - STAR_WISH_CHAR_RATE : 1;
                          const sumW = STAR_WISH_JUNK_WEIGHT_SUM;
                          return (
                            <div className="mt-2 space-y-3 text-[10px] font-bold text-slate-300">
                              <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                                <p className="text-[9px] font-black uppercase tracking-wider text-cyan-400/90">星曉限定·角色</p>
                                {nWish === 0 ? (
                                  <p className="mt-1.5 text-slate-400 font-bold">尚餘 0 位可邂逅：不會再觸發邂逅，本池雜物權重佔當次星曉祈願 100%。</p>
                                ) : (
                                  <>
                                    <p className="mt-1.5 leading-relaxed text-slate-200">
                                      當次星曉祈願先判定是否邂逅：總機率 <span className="text-cyan-300 font-black">{pMeet.toFixed(0)}%</span>（
                                      {nWish} 人未擁有時，命中後在該 {nWish} 人中均分）。
                                    </p>
                                    <ul className="mt-2 space-y-1 text-slate-200">
                                      {STAR_WISH_HERO_ORDER.map(({ id, name }) => {
                                        const inPool = remainingWishHeroIds.includes(id);
                                        return (
                                          <li key={id} className="flex justify-between gap-2">
                                            <span className="min-w-0 truncate">{name}</span>
                                            <span className="shrink-0 font-black text-cyan-200/90 tabular-nums">
                                              {inPool ? `${pEach.toFixed(2)}%` : '0%（已取得）'}
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                    <p className="mt-2 text-slate-500">
                                      其餘 <span className="text-amber-200/90 font-black">{(100 - pMeet).toFixed(0)}%</span> 進入下表雜物池；未邂逅到角時，直購價 -40 累積至下次直購成功。
                                    </p>
                                  </>
                                )}
                              </div>
                              <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                                <p className="text-[9px] font-black uppercase tracking-wider text-amber-400/90">雜物池（觸發「非角色」或角色已齊全）</p>
                                <p className="mt-1.5 text-slate-500 text-[9px] font-bold">
                                  權重總和 {sumW}。下列「佔當次星曉祈願」= 雜物佔比 ×（{jMul === 1 ? '100%（全池）' : `約 ${(jMul * 100).toFixed(0)}%（前段未中 ${pMeet.toFixed(0)}% 邂逅）`}）。
                                </p>
                                <table className="mt-2 w-full border-collapse text-left">
                                  <thead>
                                    <tr className="text-slate-500 text-[9px] font-black">
                                      <th className="py-0.5 pr-1">獎勵</th>
                                      <th className="py-0.5 pr-1">權重</th>
                                      <th className="py-0.5 pr-1">佔雜物</th>
                                      <th className="py-0.5">佔當次星曉祈願</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {STAR_WISH_JUNK_TABLE.map((row, idx) => {
                                      const w = row.w;
                                      const pSub = (w / sumW) * 100;
                                      const pAll = jMul * (w / sumW) * 100;
                                      return (
                                        <tr key={`${row.kind}-${row.amount}-${'itemId' in row ? row.itemId : ''}-${idx}`} className="border-t border-white/5 text-slate-200">
                                          <td className="py-1 pr-1">{getStarWishJunkRowLabel(row)}</td>
                                          <td className="py-1 pr-1 font-black text-slate-300 tabular-nums">{w}</td>
                                          <td className="py-1 pr-1 text-slate-300 tabular-nums">{pSub.toFixed(1)}%</td>
                                          <td className="py-1 font-black text-amber-200/90 tabular-nums">{pAll.toFixed(2)}%</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() => setStarWishOddsOpen(false)}
                          className="mt-3 w-full py-2 rounded-lg border border-white/10 bg-slate-800/80 hover:bg-slate-700/80 text-[11px] font-black text-slate-200"
                        >
                          關閉
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
                  ) : (
                    <div className="flex min-h-[14rem] flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-slate-900/35 px-4 py-8 text-center">
                      <p className="text-sm font-black uppercase tracking-widest text-slate-500">Coming soon</p>
                      <p className="text-[11px] font-bold text-slate-500">內容規劃中，敬請期待</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {lobbyPanelModal === 'forge' ? renderFacilityNpcHeader('forge') : null}
                  {lobbyPanelModal === 'training' ? renderFacilityNpcHeader('training') : null}
                  {lobbyPanelModal === 'camp' ? renderFacilityNpcHeader('camp') : null}
                  {lobbyPanelModal === 'garden' ? renderFacilityNpcHeader('garden') : null}
                  {lobbyPanelModal === 'daily' ? (
                    (() => {
                      const s = dailyQ ?? loadDailyQuestsState();
                      const picked = Array.isArray(s.picked) ? s.picked : [];
                      const rewardEach = 5;
                      const bonus = 15;
                      const isDone = (qid) => {
                        const def = DAILY_QUEST_DEFS[qid];
                        const p = Number(s.prog?.[qid] ?? 0);
                        return p >= (def?.target ?? 0);
                      };
                      const canClaim = (qid) => isDone(qid) && !s.claimed?.[qid];
                      const allClaimed = picked.length === 3 && picked.every((qid) => !!s.claimed?.[qid]);
                      const canBonus = allClaimed && !s.bonusClaimed;

                      const claimQuest = (qid) => {
                        if (!canClaim(qid)) return;
                        setDailyQ((prev) => ({ ...prev, claimed: { ...(prev.claimed ?? {}), [qid]: true } }));
                        setStarCrystals((c) => c + rewardEach);
                        unlockAudio();
                        SFX.levelUp();
                      };
                      const claimBonus = () => {
                        if (!canBonus) return;
                        setDailyQ((prev) => ({ ...prev, bonusClaimed: true }));
                        setStarCrystals((c) => c + bonus);
                        unlockAudio();
                        SFX.levelUp();
                      };

                      return (
                        <div className="mt-3 space-y-3">
                          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-bold text-slate-300">
                            <span className="text-slate-500">完成獎勵：</span>
                            <span className="text-cyan-200 font-black">每項 +{rewardEach} 星曉晶石</span>
                            <span className="text-slate-600 mx-2">|</span>
                            <span className="text-slate-500">全清加成：</span>
                            <span className="text-amber-200 font-black">+{bonus} 星曉晶石</span>
                          </div>

                          <div className="space-y-2">
                            {picked.map((qid) => {
                              const def = DAILY_QUEST_DEFS[qid];
                              const p = Math.max(0, Number(s.prog?.[qid] ?? 0));
                              const t = def?.target ?? 1;
                              const done = p >= t;
                              const claimed = !!s.claimed?.[qid];
                              const pct = Math.max(0, Math.min(100, Math.floor((Math.min(p, t) / t) * 100)));
                              return (
                                <div key={qid} className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-black text-white">{def?.title ?? qid}</p>
                                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                        {def?.desc ?? ''} {t}
                                        {def?.unit ?? ''}
                                      </p>
                                    </div>
                                    {claimed ? (
                                      <span className="text-[10px] font-black text-emerald-300">已領取</span>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={!canClaim(qid)}
                                        onClick={() => claimQuest(qid)}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-black border border-cyan-400/25 bg-cyan-700/30 hover:bg-cyan-700/45 disabled:opacity-45 disabled:pointer-events-none text-cyan-100"
                                      >
                                        領取 +{rewardEach}
                                      </button>
                                    )}
                                  </div>
                                  <div className="mt-2 flex items-center justify-between text-[10px] font-black text-slate-300 tabular-nums">
                                    <span className={done ? 'text-emerald-300' : 'text-slate-400'}>
                                      {Math.min(p, t)}/{t}
                                      {def?.unit ?? ''}
                                    </span>
                                    <span className="text-slate-500">{done ? '完成' : `${pct}%`}</span>
                                  </div>
                                  <div className="mt-1.5 h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                                    <div className={`h-full ${done ? 'bg-emerald-500' : 'bg-sky-500'}`} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-[11px] font-black text-amber-100">全清加成</p>
                                <p className="text-[10px] font-bold text-amber-200/70 mt-0.5">三項任務皆領取後可領取。</p>
                              </div>
                              <button
                                type="button"
                                disabled={!canBonus}
                                onClick={claimBonus}
                                className="px-3.5 py-1.5 rounded-lg text-[10px] font-black border border-amber-400/25 bg-amber-700/20 hover:bg-amber-700/30 disabled:opacity-45 disabled:pointer-events-none text-amber-100"
                              >
                                領取 +{bonus}
                              </button>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 mt-2">
                              狀態：{allClaimed ? (s.bonusClaimed ? <span className="text-emerald-300">已領取</span> : <span className="text-amber-200">可領取</span>) : <span>未達成</span>}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setLobbyPanelModal(null)}
                            className="w-full py-2 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 text-xs font-black text-slate-200"
                          >
                            關閉
                          </button>
                        </div>
                      );
                    })()
                  ) : lobbyPanelModal === 'achievements' ? (
                    <>
                      <p className="text-[12px] text-slate-400 mt-3 leading-relaxed">此功能尚在規劃中，之後會接上成就條件、進度與獎勵結算。</p>
                      <button
                        type="button"
                        onClick={() => setLobbyPanelModal(null)}
                        className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-black text-white"
                      >
                        知道了
                      </button>
                    </>
                  ) : lobbyPanelModal === 'lobbyBg' ? (
                    <div className="mt-3 space-y-3">
                      <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                        將圖檔置於 <span className="text-slate-200 font-mono text-[10px]">public/lobby/</span>，檔名見各卡片下方。未放圖時會顯示主題色漸層。
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-h-[min(60vh,22rem)] overflow-y-auto pr-0.5 no-scrollbar">
                        {LOBBY_BACKGROUNDS.map((b) => {
                          const selected = b.id === lobbyBgId;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setLobbyBgId(b.id);
                                saveLobbyBgId(b.id);
                                setLobbyPanelModal(null);
                              }}
                              className={`rounded-xl border p-2 text-left transition-all active:scale-[0.99] ${
                                selected
                                  ? 'border-violet-400/60 bg-violet-950/40 ring-1 ring-violet-400/35'
                                  : 'border-white/10 bg-slate-900/50 hover:bg-slate-800/70'
                              }`}
                            >
                              <div
                                className="relative h-14 w-full overflow-hidden rounded-lg border border-white/10"
                                style={{
                                  backgroundImage: `url('${b.image}'), ${b.fallback}`,
                                  backgroundSize: 'cover, cover',
                                  backgroundPosition: 'center, center',
                                  backgroundRepeat: 'no-repeat, no-repeat',
                                }}
                                aria-hidden
                              />
                              <p className="mt-1.5 text-[11px] font-black text-white leading-tight">{b.name}</p>
                              <p className="mt-0.5 text-[9px] font-mono text-slate-500 truncate" title={b.image}>
                                {b.image.replace(/^lobby\//, '')}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => setLobbyPanelModal(null)}
                        className="w-full py-2 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 text-xs font-black text-slate-200"
                      >
                        關閉
                      </button>
                    </div>
                  ) : lobbyPanelModal === 'forge' ? (
                    (() => {
                      const heroIds = (partyIds ?? []).filter((id) => id && isHeroUnlocked(id));
                      const heroId = forgePick.heroId ?? heroIds[0] ?? null;
                      const hero = HEROES_BASE.find((h) => h.id === heroId);
                      const eq2 = heroId ? equipForHeroV2(heroId) : null;
                      const slotKey = forgePick.slotKey ?? 'weapon';
                      const eid = slotKey === 'weapon' ? eq2?.weaponEid : slotKey === 'offhand' ? eq2?.offhandEid : eq2?.armorEid;
                      const inst = eid ? getInstanceByEid(eid) : null;
                      const itemId = inst?.itemId ?? null;
                      const forgeLevel = getForgeLevelFromInventory(itemInv);
                      const curAffixes = Array.isArray(inst?.affixes) ? inst.affixes : [];
                      const salt = Math.max(0, Math.floor(Number(inst?.salt) || 0));
                      const can = !!heroId && !!eid && !!itemId;

                      const statOptsAll = [
                        { id: null, label: '（不指定）' },
                        { id: 'hp', label: 'HP' },
                        { id: 'atk', label: '攻擊' },
                        { id: 'matk', label: '魔力' },
                        { id: 'def', label: '物防' },
                        { id: 'mdef', label: '魔抗' },
                        { id: 'spd', label: '速度' },
                        { id: 'critRateAdd', label: '爆擊率' },
                        { id: 'critDmgMul', label: '爆擊傷害' },
                        { id: 'skillDmgMul', label: '技能傷害' },
                        { id: 'incomingDmgMul', label: '減傷' },
                        { id: 'ccHitAdd', label: '控制命中' },
                        { id: 'ailResistAdd', label: '異常抗性' },
                      ];
                      const statOpts =
                        slotKey === 'weapon'
                          ? statOptsAll.filter((o) => [null, 'atk', 'matk', 'critDmgMul', 'skillDmgMul'].includes(o.id))
                          : slotKey === 'offhand'
                            ? statOptsAll.filter((o) => [null, 'spd', 'critRateAdd', 'incomingDmgMul', 'ccHitAdd'].includes(o.id))
                            : statOptsAll.filter((o) => [null, 'hp', 'def', 'mdef', 'ailResistAdd'].includes(o.id));

                      const costReroll = 120;
                      const costForce = 220;
                      const cTok = getInvCount(itemInv, 'it_forge_token');
                      const cTokF = getInvCount(itemInv, 'it_forge_token_force');
                      const canPayReroll = cTok > 0 || gold >= costReroll;
                      const canPayForce = cTokF > 0 || gold >= costForce;

                      const doReroll = (forcedStat = null) => {
                        if (!can) return;
                        const cost = forcedStat ? costForce : costReroll;
                        if (forcedStat) {
                          if (cTokF > 0) setItemInv((inv) => incInv(inv, 'it_forge_token_force', -1));
                          else if (gold < cost) return;
                          else setGold((g) => g - cost);
                        } else if (cTok > 0) {
                          setItemInv((inv) => incInv(inv, 'it_forge_token', -1));
                        } else if (gold < cost) {
                          return;
                        } else {
                          setGold((g) => g - cost);
                        }
                        const nextSalt = salt + 1;
                        const affixes = rollAffixesForEquip({ heroId, slotKey, itemId, forgeLevel, salt: nextSalt, forcedStat });
                        setEquipInstances((list) =>
                          Array.isArray(list) ? list.map((x) => (x.eid === eid ? { ...x, affixes, salt: nextSalt } : x)) : []
                        );
                        unlockAudio();
                        SFX.skill();
                        bumpDailyQuest('forge_reroll', 1);
                      };

                      return (
                        <div className="mt-3 space-y-3">
                          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-bold text-slate-300">
                            <span className="text-slate-500">持有金幣：</span>
                            <span className="tabular-nums text-amber-200">{gold}</span>
                            <span className="text-slate-600 mx-2">|</span>
                            <span className="text-slate-500">鍛造 Lv.</span>
                            <span className="tabular-nums text-violet-200">{forgeLevel}</span>
                            <div className="mt-1.5 text-[10px] font-bold text-slate-500">
                              普通鍛造幣 ×<span className="text-amber-200/90 tabular-nums">{cTok}</span>
                              <span className="text-slate-600 mx-1.5">|</span>
                              指定鍛造幣 ×<span className="text-amber-200/90 tabular-nums">{cTokF}</span>
                              <span className="block text-[9px] font-bold text-slate-600 mt-0.5">結帳時優先使用代幣，不足再扣金幣</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
                              <p className="text-[9px] font-black text-slate-400">角色</p>
                              <select
                                value={heroId ?? ''}
                                onChange={(e) => setForgePick((s) => ({ ...(s ?? {}), heroId: e.target.value || null }))}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-[11px] font-black text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                              >
                                {heroIds.map((hid) => (
                                  <option key={hid} value={hid}>
                                    {HEROES_BASE.find((h) => h.id === hid)?.name ?? hid}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
                              <p className="text-[9px] font-black text-slate-400">部位</p>
                              <select
                                value={slotKey}
                                onChange={(e) => setForgePick((s) => ({ ...(s ?? {}), slotKey: e.target.value || 'weapon' }))}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-[11px] font-black text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                              >
                                <option value="weapon">武器</option>
                                <option value="offhand">副手</option>
                                <option value="armor">防具</option>
                              </select>
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
                            <p className="text-[10px] font-black text-slate-200">目前裝備</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">
                              {hero ? hero.name : '—'} · {itemId ? (getEquipItem(itemId)?.name ?? itemId) : '（未裝備）'}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {curAffixes?.length ? (
                                curAffixes.map((a, i) => (
                                  <span key={`${a.id}-${i}`} className="text-[10px] font-black text-slate-200 tabular-nums">
                                    {formatAffixZh(a)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] font-bold text-slate-600">（尚未生成詞條）</span>
                              )}
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
                            <p className="text-[9px] font-black text-slate-400">指定一條詞條（重抽時必含）</p>
                            <select
                              value={forgePick.forcedStat ?? ''}
                              onChange={(e) => setForgePick((s) => ({ ...(s ?? {}), forcedStat: e.target.value || null }))}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-[11px] font-black text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                            >
                              {statOpts.map((o) => (
                                <option key={String(o.id)} value={o.id ?? ''}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                            <p className="text-[9px] font-bold text-slate-500 mt-1">提示：指定只保證「包含該屬性」，數值仍會重新抽取。</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={!can || !canPayReroll}
                              onClick={() => doReroll(null)}
                              className="w-full py-2 rounded-xl bg-orange-700/40 hover:bg-orange-700/55 disabled:opacity-45 disabled:pointer-events-none text-[12px] font-black text-orange-100 border border-orange-400/25"
                            >
                              重抽詞條（{cTok > 0 ? '-1 普通鍛造幣' : `-${costReroll} 金`}）
                            </button>
                            <button
                              type="button"
                              disabled={!can || !forgePick.forcedStat || !canPayForce}
                              onClick={() => doReroll(forgePick.forcedStat)}
                              className="w-full py-2 rounded-xl bg-orange-700/40 hover:bg-orange-700/55 disabled:opacity-45 disabled:pointer-events-none text-[12px] font-black text-orange-100 border border-orange-400/25"
                            >
                              指定重抽（{cTokF > 0 ? '-1 指定鍛造幣' : `-${costForce} 金`}）
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setLobbyPanelModal(null)}
                            className="w-full py-2 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 text-xs font-black text-slate-200"
                          >
                            關閉
                          </button>
                        </div>
                      );
                    })()
                  ) : lobbyPanelModal === 'training' ? (
                    (() => {
                      const heroIds = (partyIds ?? []).filter((id) => id && isHeroUnlocked(id));
                      const heroId = trainingPick.heroId ?? heroIds[0] ?? null;
                      const hero = HEROES_BASE.find((h) => h.id === heroId);
                      const skills = heroId ? (getSkillsForHero({ id: heroId }) ?? []) : [];
                      const skillId = trainingPick.skillId ?? skills[0]?.id ?? null;
                      const s = skills.find((x) => x.id === skillId) ?? null;
                      const uses = heroId && skillId ? (skillMasteryMap?.[heroId]?.[skillId]?.uses ?? 0) : 0;
                      const rank = getMasteryRank(uses);
                      const isMax = rank >= 10;
                      const branch = heroId && skillId ? (skillMasteryMap?.[heroId]?.[skillId]?.branch ?? null) : null;
                      const can = !!heroId && !!skillId;
                      const packUses = 10;
                      const cost = 80;
                      const cGuide = getInvCount(itemInv, 'it_training_guide');
                      const canPayTrain = cGuide > 0 || gold >= cost;

                      const train = () => {
                        if (!can || !canPayTrain || isMax) return;
                        if (cGuide > 0) setItemInv((inv) => incInv(inv, 'it_training_guide', -1));
                        else setGold((g) => g - cost);
                        setSkillMasteryMap((prev) => incSkillUses(prev, heroId, skillId, packUses));
                        unlockAudio();
                        SFX.levelUp();
                        bumpDailyQuest('training_buy', 1);
                      };

                      const setBranch = (b) => {
                        if (!can || rank < 6) return;
                        setSkillMasteryMap((prev) => setSkillMasteryBranch(prev, heroId, skillId, b));
                        unlockAudio();
                        SFX.skill();
                      };

                      return (
                        <div className="mt-3 space-y-3">
                          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-bold text-slate-300">
                            <span className="text-slate-500">持有金幣：</span>
                            <span className="tabular-nums text-amber-200">{gold}</span>
                            <span className="text-slate-600 mx-2">|</span>
                            <span className="text-slate-500">訓練指導書</span>
                            <span className="tabular-nums text-emerald-200/90">×{cGuide}</span>
                            <p className="text-[9px] font-bold text-slate-600 mt-1">結帳時優先使用指導書，不足再扣金幣</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
                              <p className="text-[9px] font-black text-slate-400">角色</p>
                              <select
                                value={heroId ?? ''}
                                onChange={(e) => setTrainingPick((st) => ({ ...(st ?? {}), heroId: e.target.value || null, skillId: null }))}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-[11px] font-black text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                              >
                                {heroIds.map((hid) => (
                                  <option key={hid} value={hid}>
                                    {HEROES_BASE.find((h) => h.id === hid)?.name ?? hid}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
                              <p className="text-[9px] font-black text-slate-400">技能</p>
                              <select
                                value={skillId ?? ''}
                                onChange={(e) => setTrainingPick((st) => ({ ...(st ?? {}), skillId: e.target.value || null }))}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-[11px] font-black text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                              >
                                {skills.map((sk) => (
                                  <option key={sk.id} value={sk.id}>
                                    {sk.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
                            <p className="text-[10px] font-black text-slate-200">{hero ? hero.name : '—'} · {s ? s.name : '—'}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 tabular-nums">
                              熟練度 Lv.{rank}/10{isMax ? '（Max）' : ''} · 使用 {uses} 次{' '}
                              {branch ? `· 分支：${branch === 'power' ? '威力' : '省魔'}` : ''}
                            </p>

                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                disabled={!can || rank < 6}
                                onClick={() => setBranch(branch === 'power' ? null : 'power')}
                                className="w-full py-2 rounded-xl bg-violet-700/25 hover:bg-violet-700/35 disabled:opacity-45 disabled:pointer-events-none text-[12px] font-black text-violet-100 border border-violet-400/25"
                              >
                                分支：威力
                              </button>
                              <button
                                type="button"
                                disabled={!can || rank < 6}
                                onClick={() => setBranch(branch === 'efficiency' ? null : 'efficiency')}
                                className="w-full py-2 rounded-xl bg-cyan-700/20 hover:bg-cyan-700/30 disabled:opacity-45 disabled:pointer-events-none text-[12px] font-black text-cyan-100 border border-cyan-400/25"
                              >
                                分支：省魔
                              </button>
                            </div>

                            <button
                              type="button"
                              disabled={!can || !canPayTrain || isMax}
                              onClick={train}
                              className="mt-2 w-full py-2 rounded-xl bg-emerald-700/35 hover:bg-emerald-700/50 disabled:opacity-45 disabled:pointer-events-none text-[12px] font-black text-emerald-100 border border-emerald-400/25"
                            >
                              {isMax ? '熟練度已滿（Max）' : `訓練 +${packUses} 次（${cGuide > 0 ? '-1 指導書' : `-${cost} 金`}）`}
                            </button>
                            <p className="text-[9px] font-bold text-slate-500 mt-2">提示：Lv.6 後可選分支；威力提升倍率、省魔降低 MP 消耗。</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setLobbyPanelModal(null)}
                            className="w-full py-2 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 text-xs font-black text-slate-200"
                          >
                            關閉
                          </button>
                        </div>
                      );
                    })()
                  ) : lobbyPanelModal === 'camp' ? (
                    (() => {
                      const dishes = [
                        { id: 'skewer', name: '炙烤肉串', desc: '我方全體攻擊提升（小，2 回合）', cost: 90, apply: { type: 'atkMul', mul: 1.1, turns: 2 } },
                        { id: 'herb', name: '清風香草', desc: '我方全體魔力提升（小，2 回合）', cost: 90, apply: { type: 'matkMul', mul: 1.12, turns: 2 } },
                        { id: 'stew', name: '暖湯炖鍋', desc: '我方全體減傷（小，3 回合）', cost: 110, apply: { type: 'defMul', mul: 1.12, turns: 3 } },
                        { id: 'tea', name: '醒神熱茶', desc: '我方全體開場行動提前（AV -25%）', cost: 120, apply: { type: 'avMul', mul: 0.75 } },
                      ];
                      const cTavern = getInvCount(itemInv, 'it_tavern_voucher');
                      const active = campBuff && typeof campBuff === 'object' ? campBuff : null;
                      const ownedSet = new Set(campOwnedRecipeIds ?? []);
                      const ownedRecipes = CAMP_RECIPES.filter((r) => ownedSet.has(r.id));

                      const canAffordRecipe = (r) => gold >= (r?.shopPrice ?? 0);
                      const buyRecipe = (r) => {
                        if (!r) return;
                        if (ownedSet.has(r.id)) return;
                        if (!canAffordRecipe(r)) return;
                        setGold((g) => g - (r.shopPrice ?? 0));
                        setCampOwnedRecipeIds((ids) => Array.from(new Set([...(ids ?? []), r.id])));
                        setShopDialog(`你買下了「${r.name}」食譜。`);
                        unlockAudio();
                        SFX.skill();
                      };

                      const hasIngredients = (ings) => {
                        const list = Array.isArray(ings) ? ings : [];
                        for (const it of list) {
                          const need = Math.max(0, Math.floor(Number(it?.count) || 0));
                          const id = String(it?.itemId || '');
                          if (!id) return false;
                          if (getInvCount(itemInv, id) < need) return false;
                        }
                        return true;
                      };
                      const consumeIngredients = (ings) => {
                        const list = Array.isArray(ings) ? ings : [];
                        setItemInv((inv) => {
                          let next = inv;
                          for (const it of list) {
                            const need = Math.max(0, Math.floor(Number(it?.count) || 0));
                            const id = String(it?.itemId || '');
                            if (!id || need <= 0) continue;
                            next = incInv(next, id, -need);
                          }
                          return next;
                        });
                      };

                      const cookRecipe = (r) => {
                        if (!r) return;
                        if (active) return; // 已準備時禁止再次點餐
                        if (!ownedSet.has(r.id)) return;
                        if (!hasIngredients(r.ingredients)) return;
                        consumeIngredients(r.ingredients);
                        setCampBuff({ id: r.id, name: r.name, desc: r.desc, apply: r.apply });
                        unlockAudio();
                        SFX.skill();
                        bumpDailyQuest('camp_dine', 1);
                      };

                      const craft = (d) => {
                        if (!d) return;
                        if (active) return; // 已準備時禁止再次點餐（避免連扣）
                        if (cTavern > 0) setItemInv((inv) => incInv(inv, 'it_tavern_voucher', -1));
                        else if (gold < d.cost) return;
                        else setGold((g) => g - d.cost);
                        setCampBuff({ id: d.id, name: d.name, desc: d.desc, apply: d.apply });
                        unlockAudio();
                        SFX.skill();
                        bumpDailyQuest('camp_dine', 1);
                      };
                      return (
                        <div className="mt-3 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCampTab('menu')}
                              className={`px-3 py-2 rounded-xl border text-[10px] font-black transition-colors ${
                                campTab === 'menu'
                                  ? 'border-amber-500/45 bg-amber-600/15 text-amber-100'
                                  : 'border-white/10 bg-slate-900/40 text-slate-300 hover:bg-slate-900/55'
                              }`}
                            >
                              金幣料理
                            </button>
                            <button
                              type="button"
                              onClick={() => setCampTab('recipes')}
                              className={`px-3 py-2 rounded-xl border text-[10px] font-black transition-colors ${
                                campTab === 'recipes'
                                  ? 'border-violet-500/45 bg-violet-600/15 text-violet-100'
                                  : 'border-white/10 bg-slate-900/40 text-slate-300 hover:bg-slate-900/55'
                              }`}
                            >
                              食譜商店
                            </button>
                            <button
                              type="button"
                              onClick={() => setCampTab('custom')}
                              className={`px-3 py-2 rounded-xl border text-[10px] font-black transition-colors ${
                                campTab === 'custom'
                                  ? 'border-emerald-500/45 bg-emerald-600/15 text-emerald-100'
                                  : 'border-white/10 bg-slate-900/40 text-slate-300 hover:bg-slate-900/55'
                              }`}
                            >
                              客制點餐
                            </button>
                            <div className="flex-1" />
                            <span className="text-[10px] font-black text-slate-400">
                              已擁有食譜 <span className="tabular-nums">{(campOwnedRecipeIds ?? []).length}</span>
                            </span>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-bold text-slate-300">
                            <span className="text-slate-500">持有金幣：</span>
                            <span className="tabular-nums text-amber-200">{gold}</span>
                            <span className="text-slate-600 mx-2">|</span>
                            <span className="text-slate-500">通用餐卷</span>
                            <span className="tabular-nums text-violet-200/90">×{cTavern}</span>
                            <p className="text-[9px] font-bold text-slate-600 mt-1">餐卷僅能用於「金幣料理」分頁；客制點餐僅消耗食材。</p>
                          </div>
                          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 px-3 py-2">
                            <p className="text-[10px] font-black text-amber-100">目前料理</p>
                            <p className="text-[10px] font-bold text-amber-200/80 mt-1">
                              {active ? `${active.name}：${active.desc}` : '（未準備）'}
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 mt-1">料理只會在「下一場戰鬥」開場套用一次。</p>
                            {active ? (
                              <button
                                type="button"
                                onClick={() => setCampBuff(null)}
                                className="mt-2 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black text-slate-200 border border-white/10"
                              >
                                取消準備
                              </button>
                            ) : null}
                          </div>

                          {campTab === 'menu' ? (
                            <div className="space-y-2">
                              {dishes.map((d) => {
                                const canPayDish = cTavern > 0 || gold >= d.cost;
                                return (
                                  <button
                                    key={d.id}
                                    type="button"
                                    disabled={!!active || !canPayDish}
                                    onClick={() => craft(d)}
                                    className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-left hover:bg-slate-800/60 disabled:opacity-45 disabled:pointer-events-none transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-black text-white truncate">{d.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug">{d.desc}</p>
                                      </div>
                                      <span className="text-[10px] font-black text-amber-200 tabular-nums shrink-0 text-right">
                                        {cTavern > 0 ? '1 餐卷' : `${d.cost} 金`}
                                      </span>
                                    </div>
                                    {active ? <p className="mt-1 text-[9px] font-bold text-slate-600">已準備餐點：請先取消準備</p> : null}
                                  </button>
                                );
                              })}
                            </div>
                          ) : campTab === 'recipes' ? (
                            <div className="space-y-2">
                              {CAMP_RECIPES.map((r) => {
                                const owned = ownedSet.has(r.id);
                                const canBuy = !owned && canAffordRecipe(r);
                                return (
                                  <button
                                    key={r.id}
                                    type="button"
                                    disabled={!canBuy}
                                    onClick={() => buyRecipe(r)}
                                    className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-left hover:bg-slate-800/60 disabled:opacity-45 disabled:pointer-events-none transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-black text-white truncate">
                                          {r.name} {owned ? <span className="text-[10px] text-emerald-300/90">（已擁有）</span> : null}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug">{r.desc}</p>
                                        <p className="text-[9px] font-bold text-slate-600 mt-1">
                                          需要食材：
                                          {(r.ingredients ?? [])
                                            .map((x) => `${getItem(x.itemId)?.name ?? x.itemId}×${x.count}`)
                                            .join('、')}
                                        </p>
                                      </div>
                                      <span className="text-[10px] font-black text-amber-200 tabular-nums shrink-0 text-right">
                                        {owned ? '—' : `${r.shopPrice} 金`}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                              <p className="text-[9px] font-bold text-slate-500">提示：買完食譜後，去「客制點餐」用食材製作強化料理。</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {ownedRecipes.length === 0 ? (
                                <p className="text-center text-[11px] font-bold text-slate-500 py-6">你還沒有獨門食譜。先去「食譜商店」買一本吧。</p>
                              ) : null}
                              {ownedRecipes.map((r) => {
                                const canCook = !active && hasIngredients(r.ingredients);
                                return (
                                  <button
                                    key={r.id}
                                    type="button"
                                    disabled={!canCook}
                                    onClick={() => cookRecipe(r)}
                                    className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-left hover:bg-slate-800/60 disabled:opacity-45 disabled:pointer-events-none transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-black text-white truncate">{r.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug">{r.desc}</p>
                                        <p className="text-[9px] font-bold text-slate-600 mt-1">
                                          消耗食材：
                                          {(r.ingredients ?? [])
                                            .map((x) => {
                                              const nm = getItem(x.itemId)?.name ?? x.itemId;
                                              const owned = getInvCount(itemInv, x.itemId);
                                              return `${nm}×${x.count}（${owned}）`;
                                            })
                                            .join('、')}
                                        </p>
                                      </div>
                                      <span className="text-[10px] font-black text-emerald-200 tabular-nums shrink-0 text-right">
                                        {active ? '已準備' : canCook ? '可製作' : '不足'}
                                      </span>
                                    </div>
                                    {active ? <p className="mt-1 text-[9px] font-bold text-slate-600">已準備餐點：請先取消準備</p> : null}
                                  </button>
                                );
                              })}
                              <p className="text-[9px] font-bold text-slate-500">客制點餐不扣金幣與餐卷，只會消耗新鮮食材。</p>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setLobbyPanelModal(null)}
                            className="w-full py-2 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 text-xs font-black text-slate-200"
                          >
                            關閉
                          </button>
                        </div>
                      );
                    })()
                  ) : lobbyPanelModal === 'garden' ? (
                    <GardenPanel
                      gardenPlots={gardenPlots}
                      setGardenPlots={setGardenPlots}
                      fishCodex={fishCodex}
                      setFishCodex={setFishCodex}
                      itemInv={itemInv}
                      setItemInv={setItemInv}
                      gold={gold}
                      setGold={setGold}
                      prismCount={getShopPrismCount()}
                      setStarCrystals={setStarCrystals}
                      onDailyQuest={bumpDailyQuest}
                      onClose={() => setLobbyPanelModal(null)}
                    />
                  ) : (
                    <>
                      <p className="text-[12px] text-slate-400 mt-3 leading-relaxed">此功能尚在規劃中。</p>
                      <button
                        type="button"
                        onClick={() => setLobbyPanelModal(null)}
                        className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-black text-white"
                      >
                        知道了
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ) : null}
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
              if (
                scene === 'lobby' ||
                scene === 'party' ||
                scene === 'stage' ||
                scene === 'main-story' ||
                scene === 'exp-stage' ||
                scene === 'gold-stage' ||
                scene === 'chapter' ||
                scene === 'use-item' ||
                scene === 'shop'
              )
                setScene('stage');
            }}
          />
          <NavBtn icon={<Users />} label="隊伍" active={scene === 'party'} onClick={() => setScene('party')} />
          <NavBtn
            icon={<Backpack />}
            label="背包"
            active={scene === 'use-item'}
            onClick={() => setScene('use-item')}
          />
          <NavBtn
            icon={<Store />}
            label="商店"
            active={scene === 'shop'}
            onClick={() => setScene('shop')}
          />
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
