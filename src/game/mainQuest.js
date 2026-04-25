import { CHAPTERS, STAGES } from '../data/units.js';

const stageById = Object.fromEntries(STAGES.map((s) => [s.id, s]));

/**
 * 依章節表順序找出第一個尚未完成的關卡，作為主線追蹤目標。
 * @param {string[]|null|undefined} completedStageIds
 * @param {(stageId: string) => boolean} isStageUnlocked
 * @returns {{ chapterId: string, stageId: string, stageTitle: string, stageSubtitle: string, stageKind: string, chapterTitle: string, unlocked: boolean } | null}
 */
export function getMainQuestPointer(completedStageIds, isStageUnlocked) {
  const done = new Set(Array.isArray(completedStageIds) ? completedStageIds : []);
  for (const ch of CHAPTERS) {
    for (const sid of ch.stages ?? []) {
      if (done.has(sid)) continue;
      const st = stageById[sid];
      const unlocked = typeof isStageUnlocked === 'function' ? !!isStageUnlocked(sid) : true;
      return {
        chapterId: ch.id,
        stageId: sid,
        stageTitle: st?.title ?? sid,
        stageSubtitle: st?.subtitle ?? '',
        stageKind: st?.kind ?? 'battle',
        chapterTitle: ch.title,
        unlocked,
      };
    }
  }
  return null;
}
