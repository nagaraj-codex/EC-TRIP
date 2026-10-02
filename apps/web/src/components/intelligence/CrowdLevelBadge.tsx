interface CrowdLevelBadgeProps {
  level: "low" | "medium" | "high" | "very_high";
  size?: "sm" | "md" | "lg";
  showPulse?: boolean;
}

const config = {
  low: {
    label: "Low",
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  medium: {
    label: "Moderate",
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    classes: "bg-red-500/15 text-red-400 border-red-500/20",
    dot: "bg-red-400",
  },
  very_high: {
    label: "Extreme",
    classes: "bg-red-900/25 text-red-300 border-red-800/30",
    dot: "bg-red-400",
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

export default function CrowdLevelBadge({
  level,
  size = "md",
  showPulse = false,
}: CrowdLevelBadgeProps) {
  const c = config[level];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${c.classes} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${showPulse ? "animate-pulse" : ""}`} />
      {c.label}
    </span>
  );
}
