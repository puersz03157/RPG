import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

/**
 * 大廳主畫面：不顯示小框框，以接近全景／全身的方式呈現 lobbyCg（或退回 avatar），貼底置中與大廳背景合成。
 */
export default function LobbyHeroStage({ hero, onActivate, className = '' }) {
  const lobbyCg = hero?.lobbyCg;
  const avatar = hero?.avatar;
  const name = hero?.name;
  const accent = hero?.color ?? 'text-slate-300';

  const [stage, setStage] = useState(() => (lobbyCg ? 'cg' : 'avatar'));
  useEffect(() => {
    setStage(lobbyCg ? 'cg' : 'avatar');
  }, [hero?.id, lobbyCg]);

  const showLobbyCg = stage === 'cg' && lobbyCg;
  const src = showLobbyCg ? lobbyCg : stage === 'icon' ? null : avatar;

  if (!src || stage === 'icon') {
    return (
      <button
        type="button"
        onClick={onActivate}
        className={`flex h-full min-h-[10rem] w-full items-center justify-center border-0 bg-transparent p-0 cursor-pointer ${className}`}
        aria-label={name ? `角色問候 · ${name}` : '角色問候'}
      >
        <User className={accent} size={64} strokeWidth={1.5} aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onActivate}
      className={[
        'group flex h-full min-h-0 w-full min-w-0 p-0 border-0 bg-transparent cursor-pointer outline-none',
        'focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950/80 rounded-lg',
        showLobbyCg ? 'relative overflow-hidden flex-col justify-end items-center' : 'flex-col justify-center items-center',
        className,
      ].join(' ')}
      aria-label={name ? `角色問候 · ${name}` : '角色問候'}
    >
      <img
        src={src}
        alt={name ? `${name} 大廳立繪` : ''}
        width={800}
        height={1200}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={[
          'shrink-0 h-auto',
          showLobbyCg
            ? [
                // Mobile: fill the stage (crop allowed) to look "full scene".
                'max-sm:absolute max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:object-cover max-sm:object-bottom',
                // Mobile: slightly wider while keeping height similar.
                'max-sm:scale-y-[0.84] max-sm:scale-x-[0.9] max-sm:origin-bottom',
                // Desktop/tablet: keep full image visible.
                // Desktop: shrink overall ~20%.
                'sm:w-full sm:max-w-2xl md:sm:max-w-3xl sm:max-h-[100%] sm:object-contain sm:object-bottom sm:scale-[0.8] sm:origin-bottom',
              ].join(' ')
            : 'max-w-[10.5rem] sm:max-w-xs max-h-[min(40svh,100%)] object-contain object-center',
          'select-none',
          'transition-transform duration-200 group-active:scale-[0.99]',
        ].join(' ')}
        onError={() => {
          if (stage === 'cg' && lobbyCg) setStage('avatar');
          else setStage('icon');
        }}
      />
    </button>
  );
}
