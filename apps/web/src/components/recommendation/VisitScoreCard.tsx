import type { DayEvaluation } from "../../types/api";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  evaluation: DayEvaluation;
  isRecommended?: boolean;
}

const weatherLabel: Record<string, string> = {
  sunny: "Clear",
  cloudy: "Overcast",
  light_rain: "Light Rain",
  heavy_rain: "Heavy Rain",
};

const crowdColor: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-orange-600",
  very_high: "text-red-600",
};

export default function VisitScoreCard({ evaluation: ev, isRecommended = false }: Props) {
  const date = new Date(ev.date + "T00:00:00");
  const dateLabel = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  const timeSavingPct = Math.max(0, 100 - ev.predicted_wait_top_ride_minutes);
  const moneyPct = ev.ticket_price <= 1312 ? 100 : ev.ticket_price <= 1400 ? 60 : 20;
  const weatherPct: Record<string, number> = { sunny: 100, cloudy: 80, light_rain: 40, heavy_rain: 10 };

  return (
    <div
      className={`card transition-all duration-200 ${
        isRecommended ? "ring-2 ring-brand-500 shadow-md" : "hover:shadow-md"
      }`}
    >
      {isRecommended && (
        <div className="mb-3 flex items-center gap-2">
          <span className="tag bg-brand-100 text-brand-700">Best Day</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{dateLabel}</p>
          <p className={`text-lg font-semibold mt-0.5 capitalize ${crowdColor[ev.crowd_level]}`}>
            {ev.crowd_level.replace("_", " ")} crowd
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{weatherLabel[ev.weather_condition]} · {ev.temp_max.toFixed(0)}°C</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-900">{ev.visit_score}</p>
          <p className="text-xs text-slate-400">/ 100</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Bar label="Time Saving" pct={timeSavingPct} color="bg-indigo-500" />
        <Bar label="Money Saving" pct={moneyPct} color="bg-emerald-500" />
        <Bar label="Weather Fit" pct={weatherPct[ev.weather_condition] ?? 70} color="bg-sky-500" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">₹{ev.ticket_price.toLocaleString("en-IN")} ticket</p>
        <ConfidenceBadge confidence={ev.confidence} reasoning={ev.reasoning} />
      </div>
    </div>
  );
}

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
