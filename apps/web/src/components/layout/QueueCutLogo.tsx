interface QueueCutLogoProps {
  compact?: boolean;
  tone?: "light" | "dark";
}

export default function QueueCutLogo({ compact = false, tone = "dark" }: QueueCutLogoProps) {
  const wordmarkColor = tone === "light" ? "text-white" : "text-slate-900";
  const cutColor = tone === "light" ? "text-blue-200" : "text-blue-600";

  return (
    <span className="inline-flex items-center gap-2.5" aria-hidden="true">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-[0_8px_22px_rgba(37,99,235,0.35)]">
        <span className="text-sm font-black text-white">Q</span>
      </span>
      {!compact && (
        <span className={`font-display text-lg font-black tracking-tight ${wordmarkColor}`}>
          Queue<span className={cutColor}>Cut</span>
        </span>
      )}
    </span>
  );
}
