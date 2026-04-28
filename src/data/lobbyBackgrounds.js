/**
 * 大廳背景。圖檔放 public/lobby/，路徑勿加前導 /（GitHub Pages 子目錄相容）。
 * 若 PNG 尚未放入或載入失敗，會顯示 fallback 漸層。
 */
export const LOBBY_BACKGROUNDS = [
  /** 僅章節／戰鬥場景用，不列入大廳背景選擇器 */
  {
    id: 'ch0_heijing_zhuiluo',
    name: '第0章：黑晶墜落',
    image: 'lobby/ch0_heijing_zhuiluo.png',
    fallback: 'linear-gradient(165deg, #0a0614 0%, #1e1033 38%, #312e81 55%, #0f172a 100%)',
    effectHint: '章節背景（非大廳選項）',
    hideFromLobbyPicker: true,
  },
  {
    id: 'ximu_cun',
    name: '溪木村',
    image: 'lobby/ximu_cun.png',
    fallback: 'linear-gradient(165deg, #1e3a2f 0%, #0f172a 42%, #166534 100%)',
    effectHint: '無額外效果',
  },
  {
    id: 'cuiying_linhai',
    name: '翠影林海',
    image: 'lobby/cuiying_linhai.png',
    fallback: 'linear-gradient(165deg, #14532d 0%, #052e16 40%, #0f172a 100%)',
    effectHint: '休憩園採收：額外 +1 份作物',
  },
  {
    id: 'shuangzhu_binghe',
    name: '霜鑄冰河',
    image: 'lobby/shuangzhu_binghe.png',
    fallback: 'linear-gradient(165deg, #0c4a6e 0%, #0f172a 45%, #1e3a5f 100%)',
    effectHint: '休憩園釣魚：QTE 較易（綠區較寬、指針較慢）',
  },
  {
    id: 'yanji_volcano',
    name: '焰脊火山',
    image: 'lobby/yanji_volcano.png',
    fallback: 'linear-gradient(165deg, #7f1d1d 0%, #1c1917 38%, #9a3412 100%)',
    effectHint: '鍛造所：支付金幣時費用降低',
  },
  {
    id: 'xingjie_gang',
    name: '星階港',
    image: 'lobby/xingjie_gang.png',
    fallback: 'linear-gradient(165deg, #312e81 0%, #0f172a 45%, #1e1b4b 100%)',
    effectHint: '商店：金幣購買價格折扣',
  },
  {
    id: 'xingzhui_yiji',
    name: '星墜遺跡',
    image: 'lobby/xingzhui_yiji.png',
    fallback: 'linear-gradient(165deg, #1e1b4b 0%, #020617 50%, #4c1d95 100%)',
    effectHint: '星曉祈願：每日首次抽卡返還 20 晶（本機）',
  },
  {
    id: 'anchao_shenyuan',
    name: '黯潮深淵',
    image: 'lobby/anchao_shenyuan.png',
    fallback: 'linear-gradient(165deg, #0b1020 0%, #020617 45%, #1b1247 100%)',
    effectHint: '休憩園狩獵：龍出現機率提高',
  },
  {
    id: 'jinhui_wangdu',
    name: '燼輝王都',
    image: 'lobby/jinhui_wangdu.png',
    fallback: 'linear-gradient(165deg, #3b1d12 0%, #0f172a 45%, #7c2d12 100%)',
    effectHint: '暫無效果（待追加）',
  },
];

/** 大廳可儲存、可選擇的背景（排除章節專用條目） */
export const LOBBY_BACKGROUNDS_PICKABLE = LOBBY_BACKGROUNDS.filter((b) => !b.hideFromLobbyPicker);

export const DEFAULT_LOBBY_BG_ID = LOBBY_BACKGROUNDS_PICKABLE[0]?.id ?? 'ximu_cun';

export function getLobbyBackgroundById(id) {
  const found = LOBBY_BACKGROUNDS.find((b) => b.id === id);
  if (found) return found;
  const fallback = LOBBY_BACKGROUNDS.find((b) => b.id === DEFAULT_LOBBY_BG_ID);
  return fallback ?? LOBBY_BACKGROUNDS_PICKABLE[0] ?? LOBBY_BACKGROUNDS[0];
}
