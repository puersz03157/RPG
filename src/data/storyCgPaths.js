import { publicAssetUrl } from '../lib/publicAssetUrl.js';

/**
 * 主線劇情（雙 CG 框）圖檔路徑。
 * 圖放在 public/storycg/，檔名規則：`{關卡 id}_left.png`、`{關卡 id}_right.png`。
 * 實際網址會經 publicAssetUrl（帶入 import.meta.env.BASE_URL），子路徑部署時才會正確。
 */

/** 目前有左右 CG 框的主線劇情關卡 id（與 App.jsx 劇情分支一致） */
export const STORY_CG_DUAL_STAGE_IDS = /** @type {const} */ ([
  'c1-story-1',
  'c1-story-2',
  'c1-story-3',
  'c1-epilogue',
  'c2-story-1',
  'c2-story-2',
  'c2-epilogue',
  'c3-story-1',
  'c3-story-2',
  'c3-story-3',
  'c3-epilogue',
  'c4-story-1',
  'c4-story-2',
  'c4-epilogue',
  'c5-story-1',
  'c5-story-2',
  'c5-epilogue',
  'c6-story-1',
]);

const DUAL_SET = new Set(STORY_CG_DUAL_STAGE_IDS);

/**
 * @param {string | null | undefined} stageId
 * @returns {{ left: string, right: string } | null}
 */
export function getStoryCgImagePaths(stageId) {
  if (!stageId || !DUAL_SET.has(stageId)) return null;
  return {
    left: publicAssetUrl(`storycg/${stageId}_left.png`),
    right: publicAssetUrl(`storycg/${stageId}_right.png`),
  };
}
