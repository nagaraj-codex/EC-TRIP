import type { DayEvaluation } from "../../types/api";

interface Props {
  evaluation: DayEvaluation;
}

const verdictStyles = {
  SKIP:        "bg-red-50 text-red-700 border border-red-200",
  CONSIDER:    "bg-amber-50 text-amber-700 border border-amber-200",
  RECOMMENDED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const verdictDesc = {
  SKIP:        "Less than 20 min saved. Not worth the spend.",
  CONSIDER:    "20–60 min saved. Value depends on your priorities.",
  RECOMMENDED: "60+ min saved. Clear time value for the day.",
};

export default function FastTrackROICalc({ evaluation: ev }: Props) {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">FastTrack ROI</p>
      <div className="flex items-center gap-3 mb-3">
        <span className={`tag text-sm ${verdictStyles[ev.fasttrack_verdict]}`}>{ev.fasttrack_verdict}</span>
      </div>
      <p className="text-sm text-slate-600 mb-3">{verdictDesc[ev.fasttrack_verdict]}</p>
      {ev.cost_per_minute_saved > 0 && (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900">₹{ev.cost_per_minute_saved.toFixed(0)}</span>
          <span className="text-sm text-slate-400">/ min saved</span>
        </div>
      )}
    </div>
  );
}
