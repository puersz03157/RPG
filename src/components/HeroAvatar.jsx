import { useState } from 'react';
import { User } from 'lucide-react';

const sizeClass = {
  xs: 'h-8 w-8',
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-28 w-28',
};

const iconSize = { xs: 14, sm: 12, md: 16, lg: 20, xl: 28 };

export default function HeroAvatar({ src, name, accentClassName = 'text-slate-300', size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false);
  const dim = sizeClass[size] ?? sizeClass.md;
  const ring = 'ring-1 ring-white/15';

  if (!src || failed) {
    return (
      <div
        className={`${dim} rounded-full bg-slate-800 flex items-center justify-center shrink-0 ${ring} ${className}`}
        aria-hidden
      >
        <User size={iconSize[size] ?? 14} className={accentClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ? `${name} 頭像` : ''}
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`${dim} rounded-full object-cover shrink-0 bg-slate-900 ${ring} ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
