interface ConfidenceIndicatorProps {
  level: "High" | "Medium" | "Low";
  showLabel?: boolean;
}

const config = {
  High: { bars: 3, color: "bg-emerald-400", label: "High Confidence" },
  Medium: { bars: 2, color: "bg-amber-400", label: "Medium Confidence" },
  Low: { bars: 1, color: "bg-red-400", label: "Low Confidence" },
};

export default function ConfidenceIndicator({
  level,
  showLabel = true,
}: ConfidenceIndicatorProps) {
  const c = config[level];

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-end gap-0.5 h-3.5">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-sm transition-colors duration-300 ${
              bar <= c.bars ? c.color : "bg-slate-700"
            }`}
            style={{ height: `${(bar / 3) * 100}%` }}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium text-slate-400">{c.label}</span>
      )}
    </div>
  );
}
