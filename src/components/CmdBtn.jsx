export default function CmdBtn({ icon, label, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${color} flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl shadow-md active:scale-95 transition-transform`}
    >
      {icon}
      <span className="text-[8px] font-black mt-0.5 uppercase tracking-tighter leading-none">{label}</span>
    </button>
  );
}
