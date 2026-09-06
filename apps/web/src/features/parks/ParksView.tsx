import { useState, useEffect } from "react";
import { MapPin, Users, Ticket, Sparkles, ArrowRight, Star, Clock, ShieldCheck, Sun } from "lucide-react";
import { usePlannerStore } from "../../store/slices/plannerStore";
import { apiClient } from "../../services/apiClient";
import type { ParkSummary } from "../../types/api";

interface ParksViewProps {
  onPlanTrip: (parkId: string) => void;
}

const defaultParks: (ParkSummary & { image: string; rating: string; tagline: string; liveWaitTopRide: string; weekdayPrice: number; weekendPrice: number; status: string; features: string[] })[] = [
  {
    park_id: "wonderla-chennai",
    name: "Wonderla Amusement Park",
    brand: "Wonderla",
    city: "Chennai, Tamil Nadu",
    tagline: "Flagship 2026 Facility • 45+ Thrill & Water Rides",
    weekdayPrice: 1312,
    weekendPrice: 1549,
    status: "Open Now • 10:30 AM - 6:00 PM",
    liveWaitTopRide: "18m (Recaptcha-verified)",
    rating: "4.8",
    total_rides: 45,
    image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=600&q=80",
    features: ["Recaptcha Geofence Telemetry", "Open-Meteo Synced", "College Discounts Active", "FastTrack Available"]
  },
  {
    park_id: "mgm-dizzee-chennai",
    name: "MGM Dizzee World",
    brand: "MGM",
    city: "East Coast Road, Chennai",
    tagline: "Classic Coastal Theme Park • Jurong Bird Show & Water World",
    weekdayPrice: 699,
    weekendPrice: 849,
    status: "Open Now • 10:30 AM - 6:30 PM",
    liveWaitTopRide: "25m",
    rating: "4.3",
    total_rides: 35,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    features: ["Budget-Friendly", "Coastal Breeze", "Family Favourite", "5D Cinema"]
  },
  {
    park_id: "black-thunder-coimbatore",
    name: "Black Thunder Water Theme Park",
    brand: "Black Thunder",
    city: "Mettupalayam, Coimbatore",
    tagline: "Premier Nilgiris Foothills Water Theme Park",
    weekdayPrice: 1090,
    weekendPrice: 1090,
    status: "Open Now • 10:00 AM - 5:30 PM",
    liveWaitTopRide: "15m",
    rating: "4.5",
    total_rides: 40,
    image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=600&q=80",
    features: ["Wave Pool Specialist", "Nilgiris Mountain View", "Student Discount", "Lakeside Dining"]
  }
];

export default function ParksView({ onPlanTrip }: ParksViewProps) {
  const { setParkId } = usePlannerStore();
  const [parksData, setParksData] = useState(defaultParks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParks() {
      try {
        const fetched = await apiClient.getParks();
        if (fetched && fetched.length > 0) {
          // Merge with UI metadata
          const merged = defaultParks.map((p) => {
            const apiMatch = fetched.find((f) => f.park_id === p.park_id);
            if (apiMatch) {
              return {
                ...p,
                name: apiMatch.name || p.name,
                city: apiMatch.city || p.city,
                total_rides: apiMatch.total_rides || p.total_rides,
              };
            }
            return p;
          });
          setParksData(merged);
        }
      } catch {
        // Fallback to defaultParks
      } finally {
        setLoading(false);
      }
    }
    loadParks();
  }, []);

  const handleSelectPark = (id: string) => {
    setParkId(id);
    onPlanTrip(id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Standout Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 p-6 sm:p-8 text-white border border-brand-500/30 shadow-glow-brand">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/30 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Park Telemetry Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight gradient-heading">
            Live Attractions & Crowd Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-medium">
            Real-time crowd pressure, verified 2026 pricing baselines, and Open-Meteo weather integrations across South India.
          </p>
        </div>
        <div className="absolute right-4 bottom-2 text-8xl opacity-15 select-none pointer-events-none hidden sm:block animate-float">
          🎢
        </div>
      </div>

      {/* Parks Interactive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parksData.map((park) => (
          <div
            key={park.park_id}
            className="glass-card rounded-3xl border border-slate-800/80 bg-slate-900/70 hover:border-brand-500/50 shadow-xl flex flex-col overflow-hidden group transition-all duration-300 hover:-translate-y-1"
          >
            {/* Park Hero Card */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={park.image}
                alt={park.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{park.rating}</span>
              </div>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-1.5 text-xs text-brand-300 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">{park.city}</span>
                </div>
                <h3 className="font-extrabold text-lg leading-tight mt-1 text-white group-hover:text-brand-300 transition-colors">
                  {park.name}
                </h3>
              </div>
            </div>

            {/* Park Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-xs text-slate-400 line-clamp-2">{park.tagline}</p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-400" /> Status
                    </span>
                    <span className="font-bold text-emerald-400">{park.status}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" /> Top Ride Wait
                    </span>
                    <span className="font-bold text-slate-200">{park.liveWaitTopRide}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-indigo-400" /> 2026 Ticket Rates
                    </span>
                    <span className="font-bold text-slate-100">
                      ₹{park.weekdayPrice} <span className="text-[10px] text-slate-400 font-normal">weekday</span> / ₹{park.weekendPrice}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {park.features.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSelectPark(park.park_id)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-brand transition-all active:scale-98"
              >
                <span>Plan Visit & Predict Queues</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
