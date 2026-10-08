import { useEffect } from "react";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { useExploreStore } from "../../store/slices/exploreStore";

interface ParksViewProps {
  onPlanTrip: (parkId: string) => void;
}

export default function ParksView({ onPlanTrip }: ParksViewProps) {
  const { destinations, loadDestinations, isLoading, error } = useExploreStore();

  useEffect(() => {
    void loadDestinations();
  }, [loadDestinations]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="border-b border-slate-800 pb-4">
        <p className="text-xs font-bold uppercase text-brand-300">QueueCut catalog</p>
        <h1 className="mt-1 text-2xl font-black text-white">Explore parks</h1>
        <p className="mt-2 text-sm text-slate-400">Park details and tariff information from the current catalog. Live operating status is not available.</p>
      </header>

      {isLoading ? (
        <div role="status" className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"><div className="h-40 animate-pulse rounded-lg bg-slate-800" /><div className="h-40 animate-pulse rounded-lg bg-slate-800" /><div className="h-40 animate-pulse rounded-lg bg-slate-800" /></div>
      ) : error && destinations.length === 0 ? (
        <div role="alert" className="rounded-lg border border-slate-700 p-6 text-center text-sm text-slate-300">Park catalog information is temporarily unavailable.</div>
      ) : destinations.length === 0 ? (
        <div role="status" className="rounded-lg border border-slate-700 p-6 text-center text-sm text-slate-300">No parks are listed in the catalog.</div>
      ) : (
        <div className="grid grid-cols-1 gap-px border border-slate-700 bg-slate-700 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((park) => (
            <article key={park.park_id} className="flex flex-col bg-slate-950 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-brand-300"><Sparkles className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white">{park.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3" />{[park.city, park.state].filter(Boolean).join(", ")}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">{park.total_rides > 0 ? `${park.total_rides} catalogued attractions` : "Attraction count unavailable"}</p>
              <p className="mt-1 text-[10px] text-slate-500">{park.provenance?.source ?? "QueueCut catalog"} · {park.provenance?.data_status?.toLowerCase() ?? "verification unavailable"}</p>
              <button type="button" onClick={() => onPlanTrip(park.park_id)} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-bold text-white transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400">
                Plan visit <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
