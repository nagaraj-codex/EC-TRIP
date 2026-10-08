import { useEffect } from "react";
import { usePlannerStore } from "../../store/slices/plannerStore";
import { useExploreStore } from "../../store/slices/exploreStore";
import { ArrowLeft, ArrowRight, MapPin, Sparkles } from "lucide-react";

export default function Step1Park() {
  const { parkId, setParkId, setScreen } = usePlannerStore();
  const { destinations, loadDestinations, isLoading, error } = useExploreStore();

  useEffect(() => {
    void loadDestinations();
  }, [loadDestinations]);

  const handleSelect = (id: string) => {
    setParkId(id);
    setScreen("step2");
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="rounded-full border border-brand-400/30 bg-brand-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-brand-300">
          Step 1 of 4
        </span>
        <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">Where are you visiting?</h2>
        <p className="mt-0.5 text-xs text-slate-400">Choose a catalog park to compare estimated conditions for candidate dates.</p>
      </div>

      <div className="space-y-3 pt-1">
        {isLoading ? (
          <div role="status" className="space-y-2"><div className="h-16 animate-pulse rounded-xl bg-slate-800" /><div className="h-16 animate-pulse rounded-xl bg-slate-800" /></div>
        ) : error && destinations.length === 0 ? (
          <div role="alert" className="rounded-xl border border-slate-700 p-4 text-sm text-slate-300">Park catalog information is unavailable.</div>
        ) : destinations.map((park) => {
          const isSelected = parkId === park.park_id;
          return (
            <button
              key={park.park_id}
              type="button"
              onClick={() => handleSelect(park.park_id)}
              aria-pressed={isSelected}
              className={`relative flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${isSelected ? "border-brand-500 bg-brand-950/60 ring-2 ring-brand-500/30" : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60"}`}
            >
              <span className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800"><Sparkles className="h-4 w-4 text-brand-400" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-white">{park.name}</span>
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="h-3 w-3 shrink-0 text-brand-400" />{[park.city, park.state].filter(Boolean).join(", ")}</span>
                  <span className="mt-1 block text-[10px] text-slate-500">{park.total_rides > 0 ? `${park.total_rides} catalogued attractions` : "Attraction count unavailable"}</span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-brand-400">Select <ArrowRight className="h-3.5 w-3.5" /></span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2.5 pt-2">
        <button type="button" onClick={() => setScreen("landing")} className="btn btn-secondary flex-1 text-xs"><ArrowLeft className="h-4 w-4" /><span>Back</span></button>
        <button type="button" disabled={!destinations.some((park) => park.park_id === parkId)} onClick={() => setScreen("step2")} className="btn btn-primary flex-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"><span>Continue to Date</span><ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
