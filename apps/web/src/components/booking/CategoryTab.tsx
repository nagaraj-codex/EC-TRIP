import type { LucideIcon } from "lucide-react";

interface CategoryTabProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onSelect?: () => void;
}

export default function CategoryTab({
  label,
  icon: Icon,
  active = false,
  disabled = false,
  disabledReason,
  onSelect,
}: CategoryTabProps) {
  const stateClass = active
    ? "border-blue-600 text-blue-700"
    : disabled
      ? "border-transparent text-slate-400"
      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={active}
      aria-label={disabled && disabledReason ? `${label}. ${disabledReason}` : label}
      title={disabledReason}
      className={`relative flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 pb-2 pt-1 text-xs font-semibold transition-colors focus-visible:z-10 focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-sm ${stateClass} disabled:cursor-not-allowed`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
