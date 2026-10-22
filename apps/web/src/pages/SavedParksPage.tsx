import { useEffect } from "react";
import { useParksQuery } from "../lib/apiHooks";
import { Heart, MapPin, ArrowRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExploreStore } from "../store/slices/exploreStore";
import { useAuthStore } from "../store/slices/authStore";
import Skeleton from "../components/common/Skeleton";
import EmptyState from "../components/common/EmptyState";
import ActionButton from "../components/common/ActionButton";

export default function SavedParksPage() {
  const navigate = useNavigate();
  const { data: destinations = [], isLoading, error, refetch } = useParksQuery();
  const {  } = useExploreStore();
  const savedParkIds = useAuthStore((state) => state.savedParkIds);
  const toggleSavedPark = useAuthStore((state) => state.toggleSavedPark);
  const savedParks = destinations.filter((park) => savedParkIds.includes(park.park_id));

  

  return (
    <div className="qc-page">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase text-blue-700">Saved on this device</p>
          <h1 className="mt-1 font-display text-xl font-extrabold text-slate-900">Saved parks</h1>
        </div>
        <span className="text-xs text-slate-500">{savedParks.length} saved</span>
      </div>
      <p className="mb-4 text-xs text-slate-500">Your saved parks stay in this browser and are not synced to an account or other devices.</p>

      {isLoading ? (
        <Skeleton variant="park" count={3} />
      ) : error && destinations.length === 0 ? (
        <EmptyState icon={Heart} title="Saved parks could not be loaded." description="Park catalog data is unavailable right now." actionLabel="Retry" onAction={() => void refetch()} />
      ) : savedParks.length === 0 ? (
        <EmptyState icon={Heart} title="No saved parks yet." description="Open a park and save it here for quick access on this device." actionLabel="Explore parks" onAction={() => navigate("/app/explore")} />
      ) : (
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {savedParks.map((park) => (
            <article key={park.park_id} className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700"><MapPin className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold text-slate-900">{park.name}</h2>
                <p className="mt-1 truncate text-xs text-slate-500">{park.city}{park.state ? `, ${park.state}` : ""} · {park.total_rides} catalogued attractions</p>
              </div>
              <ActionButton variant="ghost" size="icon" type="button" onClick={() => navigate(`/app/explore/${park.park_id}`)} aria-label={`View ${park.name}`}><ArrowRight className="h-4 w-4" /></ActionButton>
              <ActionButton variant="danger" size="icon" type="button" onClick={() => toggleSavedPark(park.park_id)} aria-label={`Remove ${park.name} from saved parks`}><Trash2 className="h-4 w-4" /></ActionButton>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
