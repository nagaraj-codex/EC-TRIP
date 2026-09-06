import { usePlannerStore } from "../../store/slices/plannerStore";
import { apiClient } from "../../services/apiClient";
import type { RecommendationRequest } from "../../types/api";

const PARKS = [
  { id: "wonderla-chennai",         name: "Wonderla Chennai" },
  { id: "mgm-dizzee-chennai",       name: "MGM Dizzee World" },
  { id: "black-thunder-coimbatore", name: "Black Thunder" },
];

const PRIORITIES = ["Cheapest", "Least Crowded", "Best Balanced", "Maximum Rides"] as const;

export default function PlannerPanel() {
  const {
    parkId, setParkId,
    candidateDates, addDate, removeDate,
    priority, setPriority,
    setRecommendation, setLoading, setError,
    isLoading, error,
  } = usePlannerStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (candidateDates.length === 0) {
      setError("Please add at least one candidate date.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const prioStr = String(priority).toLowerCase();
      const apiPriority: RecommendationRequest["priority"] = prioStr.includes("least")
        ? "Least Crowded"
        : prioStr.includes("cheap")
        ? "Cheapest"
        : prioStr.includes("balan")
        ? "Best Balanced"
        : "Maximum Rides";

      const result = await apiClient.recommend({ park_id: parkId, candidate_dates: candidateDates, priority: apiPriority });
      setRecommendation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommendation.");
    } finally {
      setLoading(false);
    }
  }

  function handleDateInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value) addDate(e.target.value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Park
        </label>
        <select
          value={parkId}
          onChange={(e) => setParkId(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {PARKS.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Candidate Dates (up to 5)
        </label>
        <input
          type="date"
          onChange={handleDateInput}
          min={new Date().toISOString().split("T")[0]}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {candidateDates.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {candidateDates.map((d) => (
              <span key={d} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                {d}
                <button type="button" onClick={() => removeDate(d)} className="ml-1 text-slate-400 hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Priority
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                String(priority).toLowerCase() === p.toLowerCase()
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-brand-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full disabled:opacity-60"
      >
        {isLoading ? "Analyzing..." : "Get Recommendation"}
      </button>
    </form>
  );
}
