import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "light" | "dark";
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = "light",
}: EmptyStateProps) {
  const isDark = tone === "dark";
  return (
    <div role="status" className={`px-4 py-7 ${isDark ? "text-center" : "border border-slate-200 bg-white text-center"}`}>
      <Icon className={`mx-auto h-5 w-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} aria-hidden="true" />
      <p className={`mt-2 text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{title}</p>
      <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className={`mt-3 min-h-9 rounded-md px-3 text-xs font-semibold underline focus-visible:ring-2 focus-visible:ring-blue-500 ${isDark ? "text-blue-300" : "text-blue-700"}`}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
