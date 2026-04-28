/**
 * 大廳背景。圖檔放 public/lobby/，路徑勿加前導 /（GitHub Pages 子目錄相容）。
 * 若 PNG 尚未放入或載入失敗，會顯示 fallback 漸層。
 */
export const LOBBY_BACKGROUNDS = [
  {
    id: 'ximu_cun',
    name: '溪木村',
    image: 'lobby/ximu_cun.png',
    fallback: 'linear-gradient(165deg, #1e3a2f 0%, #0f172a 42%, #166534 100%)',
  },
  {
    id: 'cuiying_linhai',
    name: '翠影林海',
    image: 'lobby/cuiying_linhai.png',
    fallback: 'linear-gradient(165deg, #14532d 0%, #052e16 40%, #0f172a 100%)',
  },
  {
    id: 'shuangzhu_binghe',
    name: '霜鑄冰河',
    image: 'lobby/shuangzhu_binghe.png',
    fallback: 'linear-gradient(165deg, #0c4a6e 0%, #0f172a 45%, #1e3a5f 100%)',
  },
  {
    id: 'yanji_volcano',
    name: '焰脊火山',
    image: 'lobby/yanji_volcano.png',
    fallback: 'linear-gradient(165deg, #7f1d1d 0%, #1c1917 38%, #9a3412 100%)',
  },
  {
    id: 'xingjie_gang',
    name: '星階港',
    image: 'lobby/xingjie_gang.png',
    fallback: 'linear-gradient(165deg, #312e81 0%, #0f172a 45%, #1e1b4b 100%)',
  },
  {
    id: 'xingzhui_yiji',
    name: '星墜遺跡',
    image: 'lobby/xingzhui_yiji.png',
    fallback: 'linear-gradient(165deg, #1e1b4b 0%, #020617 50%, #4c1d95 100%)',
  },
];

export const DEFAULT_LOBBY_BG_ID = LOBBY_BACKGROUNDS[0]?.id ?? 'ximu_cun';

export function getLobbyBackgroundById(id) {
  const found = LOBBY_BACKGROUNDS.find((b) => b.id === id);
  return found ?? LOBBY_BACKGROUNDS[0];
}
