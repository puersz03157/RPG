import React, { useEffect, useRef, useState } from 'react';

/**
 * @param {{ label: string, src: string | null | undefined }} props
 */
export default function StoryCgFrame({ label, src }) {
  const [failed, setFailed] = useState(false);
  /** 開發環境 StrictMode 會卸載再掛載，中止的圖片載入仍可能觸發 onError；與目前掛載代號不符則忽略。 */
  const loadGenRef = useRef(0);
  const activeLoadGenRef = useRef(0);

  useEffect(() => {
    const gen = ++loadGenRef.current;
    activeLoadGenRef.current = gen;
    setFailed(false);
    return () => {
      activeLoadGenRef.current = -1;
    };
  }, [src]);

  const showImg = Boolean(src) && !failed;

  const onImgError = () => {
    const genAtFire = activeLoadGenRef.current;
    requestAnimationFrame(() => {
      if (activeLoadGenRef.current !== genAtFire || genAtFire < 0) return;
      setFailed(true);
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden flex flex-col items-center justify-center min-h-[16rem] p-4">
      <p className="text-[10px] font-black text-slate-300 text-center leading-tight">{label}</p>
      {showImg ? (
        <div className="mt-3 h-44 w-44 rounded-2xl border border-white/10 bg-black/40 overflow-hidden shrink-0">
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover object-[center_15%]"
            onLoad={() => setFailed(false)}
            onError={onImgError}
          />
        </div>
      ) : (
        <>
          <p className="text-[9px] text-slate-600 mt-1 text-center px-1">
            {src ? (
              <>
                預期檔案（未載入或檔案不存在）：
                <span className="block font-mono text-[8px] text-slate-500 mt-0.5 break-all">{src}</span>
              </>
            ) : (
              '未設定圖檔路徑'
            )}
          </p>
          <div className="mt-3 h-44 w-44 rounded-2xl border border-dashed border-white/15 bg-black/20 flex items-center justify-center text-slate-600 text-[10px] font-bold">
            CG FRAME
          </div>
        </>
      )}
    </div>
  );
}
