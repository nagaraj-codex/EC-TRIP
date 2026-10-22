import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  tone?: "light" | "dark";
}

export default function ErrorState({ title, description, onRetry, tone = "light" }: ErrorStateProps) {
  const isDark = tone === "dark";
  return (
    <div role="alert" className={`px-3 py-3 ${isDark ? "text-slate-300" : "border border-red-200 bg-red-50 text-red-800"}`}>
      <div className="flex items-start gap-2">
        <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${isDark ? "text-amber-300" : "text-red-600"}`} aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-red-700"}`}>{description}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className={`mt-2 min-h-8 text-xs font-semibold underline focus-visible:ring-2 focus-visible:ring-blue-500 ${isDark ? "text-blue-300" : "text-red-800"}`}>
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
