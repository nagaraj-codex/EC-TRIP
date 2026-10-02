import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/slices/authStore";
import { apiClient } from "../services/apiClient";
import { motion } from "framer-motion";
import { Map, MapPin, Calendar, Clock, Plus, Trash2 } from "lucide-react";
import CrowdLevelBadge from "../components/intelligence/CrowdLevelBadge";

export default function TripsPage() {
  const navigate = useNavigate();
  const { isGuest, openAuthModal } = useAuthStore();
  const [savedTrips, setSavedTrips] = useState<ReturnType<typeof useAuthStore.getState>["savedTrips"]>([]);
  const [isLoading, setIsLoading] = useState(!isGuest);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isGuest) {
      setIsLoading(false);
      return;
    }
    apiClient.getTrips()
      .then(({ data }) => setSavedTrips(data.map((trip) => ({
        id: trip.id,
        parkId: trip.park_id,
        parkName: trip.park_id,
        date: trip.visit_date,
        ticketPrice: Number(trip.payload.ticketPrice ?? 0),
        crowdLevel: String(trip.payload.crowdLevel ?? "unknown"),
        predictedWait: Number(trip.payload.predictedWait ?? 0),
        fastTrackVerdict: String(trip.payload.fastTrackVerdict ?? "unknown"),
        savedAt: trip.created_at,
      }))))
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setIsLoading(false));
  }, [isGuest]);

  const removeTrip = async (id: string) => {
    await apiClient.deleteTrip(id);
    setSavedTrips((trips) => trips.filter((trip) => trip.id !== id));
  };

  if (isGuest) {
    return (
      <div className="qc-page flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <Map className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="font-display font-bold text-lg text-slate-900">Sign in to view trips</h2>
          <p className="text-slate-500 text-sm max-w-xs">
            Save and sync your trip plans across devices by signing in.
          </p>
          <button
            onClick={() => openAuthModal("Sign in to access your saved trips", "signin")}
            className="btn-blue-primary mx-auto"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="qc-page text-sm text-slate-500">Loading saved trips...</div>;
  }

  if (error) {
    return <div className="qc-page text-sm text-red-500">Trips could not be loaded. {error}</div>;
  }

  if (savedTrips.length === 0) {
    return (
      <div className="qc-page flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <Map className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="font-display font-bold text-lg text-slate-900">No trips yet</h2>
          <p className="text-slate-500 text-sm max-w-xs">
            Explore destinations and save your favorite plans here.
          </p>
          <button
            onClick={() => navigate("/app/explore")}
            className="btn-blue-primary mx-auto"
          >
            <Plus className="w-4 h-4" />
            Start Planning
          </button>
        </motion.div>
      </div>
    );
  }

  const upcoming = savedTrips.filter((t) => new Date(t.date) >= new Date());
  const past = savedTrips.filter((t) => new Date(t.date) < new Date());

  return (
    <div className="qc-page">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-xl text-slate-900 mb-1">My Trips</h1>
        <p className="text-slate-500 text-xs mb-5">{savedTrips.length} saved plans</p>
      </motion.div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display font-bold text-sm text-slate-900 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((trip, idx) => {
              const daysAway = Math.ceil((new Date(trip.date).getTime() - Date.now()) / 86400000);
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="qc-card-white rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-sm text-slate-900 truncate">{trip.parkName}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {trip.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {daysAway}d away
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <CrowdLevelBadge level={trip.crowdLevel as any} size="sm" />
                        <span className="text-qc-blue-600 text-xs font-bold">₹{trip.ticketPrice}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => void removeTrip(trip.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-sm text-slate-500 mb-3">Past Trips</h2>
          <div className="space-y-3">
            {past.map((trip) => (
              <div key={trip.id} className="qc-card-white rounded-2xl p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">{trip.parkName}</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {trip.date}
                    </p>
                  </div>
                  <button
                    onClick={() => void removeTrip(trip.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
