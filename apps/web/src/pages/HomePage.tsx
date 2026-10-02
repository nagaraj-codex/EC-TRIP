// HomePage.tsx — complete rebuild
// NO fake data, NO PEACE_SCORES, NO per-park HERO_IMAGES
// White+blue design, real API data only

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/slices/authStore";
import { useExploreStore } from "../store/slices/exploreStore";
import { motion } from "framer-motion";
import { Search, Map, Calendar, Compass, ArrowRight, MapPin } from "lucide-react";

// Single generic fallback image — NOT associated with any specific park
const GENERIC_PARK_IMAGE = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

function ParkCardSkeleton() {
  return (
    <div className="qc-card-white rounded-2xl overflow-hidden">
      <div className="h-40 w-full bg-slate-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
        <div className="h-8 bg-slate-100 rounded mt-3 animate-pulse" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuthStore();
  const { destinations, loadDestinations, isLoading } = useExploreStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { loadDestinations(); }, [loadDestinations]);

  const userName = user?.name?.split(" ")[0] || "there";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickActions = [
    { label: "Explore Parks", icon: Compass, path: "/app/explore", description: "Discover nearby parks" },
    { label: "Plan a Visit", icon: Calendar, path: "/app/plan", description: "Step-by-step planner" },
    { label: "Compare Dates", icon: Map, path: "/app/compare", description: "Find the best day" },
    { label: "My Trips", icon: Map, path: "/app/trips", description: "Saved plans" },
  ];

  return (
    <div className="qc-page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        {!isGuest && (
          <p className="text-sm font-medium text-blue-700 mb-2">{getGreeting()}, {userName}</p>
        )}
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight tracking-[-0.04em]">
          Plan your next<br className="sm:hidden" /> park visit.
        </h1>
        <p className="mt-3 text-base text-slate-600 max-w-xl">
          Find the right park, day and time before you go.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-5 sm:p-7 text-white shadow-[0_26px_60px_rgba(37,99,235,0.28)]"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-50">
              QueueCut
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight tracking-[-0.04em]">
              Choose great park days before the queue starts.
            </h2>
            <p className="mt-3 max-w-md text-sm sm:text-base text-blue-50/90">
              Discover the right park, compare dates, and build a smarter visit around weather, timing, and conditions.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate("/app/plan")} className="btn-blue-hero">
                Plan My Visit
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/app/explore")} className="btn-blue-secondary border-white/30 bg-white/10 text-white hover:bg-white/15 border">
                Explore Parks
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[360px] rounded-[26px] border border-white/20 bg-white/10 p-3 shadow-[0_30px_40px_rgba(15,23,42,0.18)] backdrop-blur-sm">
              <img
                src={GENERIC_PARK_IMAGE}
                alt="Theme park landscape"
                className="h-64 w-full rounded-[20px] object-cover"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        onSubmit={handleSearch}
        className="relative mb-8"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search parks, cities or attractions"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-28 h-14 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </motion.form>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + idx * 0.05 }}
                onClick={() => navigate(action.path)}
                className="qc-card-white-interactive flex flex-col items-start gap-3 p-4 rounded-2xl text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Explore parks</h2>
          <button onClick={() => navigate("/app/explore")} className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors">
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <ParkCardSkeleton key={i} />)}
          </div>
        ) : destinations.length === 0 ? (
          <div className="qc-card-white rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No parks available yet</h3>
            <p className="text-slate-500 text-sm">Park information will appear here once connected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.slice(0, 3).map((park, idx) => (
              <motion.button
                key={park.park_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 + idx * 0.06 }}
                onClick={() => navigate(`/app/explore/${park.park_id}`)}
                className="qc-card-white-interactive rounded-2xl overflow-hidden text-left group"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={park.image ?? GENERIC_PARK_IMAGE}
                    alt={park.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 text-base leading-tight">{park.name}</h3>
                  <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {park.city}
                  </p>
                  {park.weekday_price && (
                    <p className="text-blue-700 text-sm font-semibold mt-3">From ₹{park.weekday_price}</p>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => navigate("/app/plan")}
          className="w-full flex items-center justify-between gap-4 rounded-[26px] bg-gradient-to-r from-blue-700 to-blue-600 p-5 sm:p-6 text-white shadow-[0_24px_50px_rgba(37,99,235,0.28)] group"
        >
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-[0.2em] text-blue-100">Smart planning</p>
            <h3 className="mt-2 font-bold text-lg sm:text-xl text-white">Ready to plan your visit?</h3>
            <p className="mt-1 text-sm text-blue-100">Compare parks, dates and live conditions step by step.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12 border border-white/20">
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </motion.section>
    </div>
  );
}
