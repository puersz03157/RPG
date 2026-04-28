/**
 * 合體技資料表：
 * - 每對組合只定義 1 招
 * - 每位英雄最多 2 個合體夥伴（此檔案內會做檢查並在 console 警告）
 *
 * NOTE: 這裡只放「解鎖與技能定義」，戰鬥內的代價（雙人硬直）由 App.jsx 在施放時處理。
 */

function pairKey(a, b) {
  const x = String(a || '');
  const y = String(b || '');
  if (!x || !y || x === y) return '';
  return x < y ? `${x}|${y}` : `${y}|${x}`;
}

/**
 * @typedef {{
 *  id: string,
 *  a: string,
 *  b: string,
 *  requiredBondLv: number,
 *  skill?: { id: string, name: string, mpCost: number, scale?: 'atk'|'matk'|'mix', effect: any } | null,
 * }} ComboDef
 */

/** @type {ComboDef[]} */
export const COMBO_SKILL_DEFS = [
  {
    id: 'combo_Puersz_xiongji',
    a: 'Puersz',
    b: 'xiongji',
    requiredBondLv: 2,
    skill: {
      id: 'combo-Puersz-xiongji',
      name: '合體技：焰風交錯',
      mpCost: 46,
      scale: 'mix',
      effect: {
        type: 'damage',
        target: 'enemy-single',
        // 雙人硬直的前提下小幅上修倍率，並加入團隊輔助
        powerMul: 1.8,
        allyBuff: { type: 'dmgVsWeaknessSeen', mul: 1.18, turns: 1 },
      },
    },
  },
  // 普爾斯：熊吉 + 虎吉
  { id: 'combo_Puersz_huji', a: 'Puersz', b: 'huji', requiredBondLv: 2, skill: null },

  // 熊吉：普爾斯 + 白澤
  { id: 'combo_xiongji_baize', a: 'xiongji', b: 'baize', requiredBondLv: 2, skill: null },

  // 白澤：熊吉 + 墨影
  { id: 'combo_baize_moying', a: 'baize', b: 'moying', requiredBondLv: 2, skill: null },

  // 布提婭：布布 + 傑克
  { id: 'combo_butiya_bubu', a: 'butiya', b: 'bubu', requiredBondLv: 2, skill: null },
  { id: 'combo_butiya_jack', a: 'butiya', b: 'jack', requiredBondLv: 2, skill: null },

  // 布布：布提婭 + 虎吉
  { id: 'combo_bubu_huji', a: 'bubu', b: 'huji', requiredBondLv: 2, skill: null },

  // 墨影：白澤 + 傑克
  // 傑克：布提婭 + 墨影
  { id: 'combo_moying_jack', a: 'moying', b: 'jack', requiredBondLv: 2, skill: null },
];

export function validateComboDefs(defs = COMBO_SKILL_DEFS) {
  const partnerCount = new Map(); // heroId -> Set(partners)
  const pairSeen = new Set();
  const dupPairs = [];
  for (const d of defs) {
    const k = pairKey(d?.a, d?.b);
    if (!k) continue;
    if (pairSeen.has(k)) dupPairs.push(k);
    pairSeen.add(k);

    for (const [h, p] of [
      [d.a, d.b],
      [d.b, d.a],
    ]) {
      const set = partnerCount.get(h) ?? new Set();
      set.add(p);
      partnerCount.set(h, set);
    }
  }
  const tooMany = [];
  for (const [h, set] of partnerCount.entries()) {
    if (set.size > 2) tooMany.push({ heroId: h, partners: [...set] });
  }
  return { ok: dupPairs.length === 0 && tooMany.length === 0, dupPairs, tooMany };
}

// 檔案載入時檢查限制（只警告，不 throw，以免打包時中斷）
try {
  const v = validateComboDefs(COMBO_SKILL_DEFS);
  if (!v.ok) {
    // eslint-disable-next-line no-console
    console.warn('[comboSkills] invalid combo defs', v);
  }
} catch {
  /* ignore */
}

