import { SFX, unlockAudio } from '../lib/sfx.js';

export default function CmdBtn({ icon, label, color, onClick, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        unlockAudio();
        SFX.uiClick();
        onClick?.(e);
      }}
      className={`${color} flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl shadow-md transition-transform ${
        disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'active:scale-95'
      }`}
    >
      {icon}
      <span className="text-[8px] font-black mt-0.5 uppercase tracking-tighter leading-none">{label}</span>
    </button>
  );
}
