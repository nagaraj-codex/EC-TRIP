import { useEffect, useState } from "react";

interface PeaceScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function PeaceScoreRing({
  score,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
}: PeaceScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "#10b981", text: "text-emerald-400", label: "Peaceful" };
    if (s >= 60) return { stroke: "#f59e0b", text: "text-amber-400", label: "Moderate" };
    if (s >= 40) return { stroke: "#f97316", text: "text-orange-400", label: "Busy" };
    return { stroke: "#ef4444", text: "text-red-400", label: "Crowded" };
  };

  const color = getColor(score);

  return (
    <div className="qc-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Track */}
        <circle
          className="score-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          className="score-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display font-extrabold ${color.text} ${size >= 80 ? "text-xl" : "text-base"}`}>
          {animatedScore}
        </span>
        {showLabel && size >= 70 && (
          <span className="text-slate-500 text-[8px] font-medium uppercase tracking-wider">
            {color.label}
          </span>
        )}
      </div>
    </div>
  );
}
