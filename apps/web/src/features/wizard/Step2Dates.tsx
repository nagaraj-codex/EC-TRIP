import { useState } from "react";
import { usePlannerStore } from "../../store/slices/plannerStore";
import { Calendar, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

export default function Step2Dates() {
  const { setDates, setScreen } = usePlannerStore();

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(nextWeek);

  const handleContinue = () => {
    const dates: string[] = [];
    let curr = new Date(from);
    const end = new Date(to);
    while (curr <= end && dates.length < 5) {
      dates.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }
    if (dates.length === 0) dates.push(from);
    setDates(dates);
    setScreen("step3");
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/30">
          Step 2 of 4
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
          What dates work for you?
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          QueueCut compares crowds, weather, and rates across your candidate window.
        </p>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="form-label">Earliest Date</label>
          <input
            type="date"
            className="form-input"
            value={from}
            min={today}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Latest Date</label>
          <input
            type="date"
            className="form-input"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-brand-950/50 border border-brand-500/30 text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-brand-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Intelligence Engine Rule</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Selecting a 3–5 day window lets QueueCut detect weekday rate drops and avoid weekend crowd surges.
        </p>
      </div>

      <div className="flex gap-2.5 pt-2">
        <button
          onClick={() => setScreen("step1")}
          className="btn btn-secondary flex-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleContinue}
          className="btn btn-primary flex-2 text-xs"
        >
          <span>Continue to Group</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
