import { Bookmark, Calendar, Trash2, ArrowRight, Lock, Sparkles } from "lucide-react";
import { useAuthStore, SavedTrip } from "../../store/slices/authStore";

interface SavedTripsViewProps {
  onViewItinerary: (trip: SavedTrip) => void;
  onPlanNew: () => void;
}

export default function SavedTripsView({ onViewItinerary, onPlanNew }: SavedTripsViewProps) {
  const { user, isGuest, savedTrips, removeSavedTrip, openAuthModal } = useAuthStore();

  if (isGuest || !user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-glow-amber">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">
          Sign In to Access Saved Trips
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Guest browsing allows you to forecast wait times and prices, but saving itineraries across devices requires a free account.
        </p>
        <div className="pt-2">
          <button
            onClick={() => openAuthModal("Sign in to view and save itineraries across all your devices", "signin")}
            className="btn btn-primary max-w-xs mx-auto text-xs font-bold shadow-glow-brand"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sign In with Google or Email</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">My Saved Trips</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized itineraries for {user.name}
          </p>
        </div>
        <button
          onClick={onPlanNew}
          className="btn btn-primary sm:w-auto px-4 py-2 text-xs font-bold"
        >
          <span>Plan New Trip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {savedTrips.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-slate-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">No saved trips yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Use the Trip Planner Wizard to evaluate visiting dates and click "Save This Trip" on the recommendation card.
          </p>
          <button
            onClick={onPlanNew}
            className="btn btn-secondary max-w-xs mx-auto text-xs mt-2"
          >
            Launch Trip Planner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedTrips.map((trip) => (
            <div
              key={trip.id}
              className="glass-card rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-3.5 hover:border-brand-500/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
                    {trip.parkName}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {trip.date}
                  </h3>
                </div>
                <button
                  onClick={() => removeSavedTrip(trip.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Crowd</span>
                  <span className="font-bold text-white capitalize">{trip.crowdLevel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Wait</span>
                  <span className="font-bold text-amber-300">{trip.predictedWait}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Price</span>
                  <span className="font-bold text-emerald-400">₹{trip.ticketPrice}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                  FastTrack: {trip.fastTrackVerdict}
                </span>
                <button
                  onClick={() => onViewItinerary(trip)}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>View Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
