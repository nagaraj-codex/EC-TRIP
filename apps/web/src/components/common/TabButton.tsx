interface TabButtonProps {
  label: string;
  active: boolean;
  onSelect: () => void;
  count?: number;
}

export default function TabButton({ label, active, onSelect, count }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={`min-h-9 shrink-0 rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
    >
      {label}{count !== undefined && <span className="ml-1 text-[10px] text-slate-500">{count}</span>}
    </button>
  );
}
