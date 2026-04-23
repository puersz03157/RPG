import React from 'react';

export default function NavBtn({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-400 scale-110 font-bold' : 'text-slate-700 hover:text-slate-400'}`}
    >
      {React.cloneElement(icon, { size: 18 })}
      <span className="text-[9px] uppercase tracking-tighter font-black">{label}</span>
    </button>
  );
}
