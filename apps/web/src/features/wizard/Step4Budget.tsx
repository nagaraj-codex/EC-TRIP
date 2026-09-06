import { usePlannerStore, Priority } from "../../store/slices/plannerStore";
import { apiClient } from "../../services/apiClient";
import { Sparkles, ArrowLeft, ArrowRight, IndianRupee } from "lucide-react";

export default function Step4Budget() {
  const {
    budget,
    priority,
    parkId,
    candidateDates,
    setBudget,
    setPriority,
    setScreen,
    setRecommendation,
    setLoading,
    setError,
    isLoading,
    error,
  } = usePlannerStore();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const prioMap: Record<string, string> = {
        cheapest: "Cheapest",
        least_crowded: "Least Crowded",
        balanced: "Best Balanced",
        max_rides: "Maximum Rides",
      };

      const result = await apiClient.recommend({
        park_id: parkId || "wonderla-chennai",
        candidate_dates: candidateDates,
        priority: (prioMap[priority] || "Best Balanced") as any,
        budget_limit: budget,
      });
      setRecommendation(result);
      setScreen("recommendation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const options = [
    {
      id: "least_crowded",
      icon: "👥",
      label: "Least Crowded",
      desc: "Prioritize lowest queue times & walk-on ride access",
    },
    {
      id: "cheapest",
      icon: "💰",
      label: "Cheapest",
      desc: "Find lowest ticket tariff & promotional pricing",
    },
    {
      id: "balanced",
      icon: "⚖️",
      label: "Best Balanced",
      desc: "Optimal balance of low queues, pleasant weather & price",
    },
    {
      id: "max_rides",
      icon: "🎢",
      label: "Maximum Rides",
      desc: "Maximize attraction completions with FastTrack routing",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/30">
          Step 4 of 4
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
          What matters most to you?
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune our multi-objective scoring formula for your trip priorities.
        </p>
      </div>

      <div>
        <label className="form-label">Total Group Budget</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-400 font-bold">
            ₹
          </div>
          <input
            type="number"
            className="form-input pl-8 font-extrabold text-base text-white"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="form-label">Optimization Goal</label>
        <div className="space-y-2 mt-1">
          {options.map((opt) => {
            const isSelected = priority === opt.id;
            return (
              <label
                key={opt.id}
                className={`radio-option ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="priority"
                  checked={isSelected}
                  onChange={() => setPriority(opt.id as Priority)}
                  className="mr-3 mt-1 cursor-pointer accent-brand-500"
                />
                <div className="flex-1">
                  <div className="font-extrabold text-xs text-white flex items-center gap-1.5">
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="flex gap-2.5 pt-2">
        <button
          onClick={() => setScreen("step3")}
          className="btn btn-secondary flex-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          className="btn btn-primary flex-2 text-xs"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Predicting Queues...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate AI Verdict</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
