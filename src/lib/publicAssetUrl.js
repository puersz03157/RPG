/**
 * 組合 Vite `public/` 資源 URL（依 `base` / `import.meta.env.BASE_URL`）。
 * @param {string} relativePath 例 `storycg/foo.png`，勿前導 /
 */
export function publicAssetUrl(relativePath) {
  const rel = String(relativePath ?? '').replace(/^\//, '');
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === '/' || base === '') return `/${rel}`;
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${rel}`.replace(/([^:]\/)\/+/g, '$1');
}
