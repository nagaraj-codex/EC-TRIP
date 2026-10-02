import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useExploreStore } from "../store/slices/exploreStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, MapPin, Navigation, Loader2, ChevronDown
} from "lucide-react";
import DestinationCard from "../components/destination/DestinationCard";
import { useGeolocation, calculateDistance } from "../hooks/useGeolocation";

// Single generic fallback — not park-specific
const GENERIC_PARK_IMAGE = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80";

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  "Chennai":    { lat: 13.0827, lon: 80.2707 },
  "Bangalore":  { lat: 12.9716, lon: 77.5946 },
  "Coimbatore": { lat: 11.0168, lon: 76.9558 },
  "Kochi":      { lat: 9.9312,  lon: 76.2673 },
};

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { destinations, loadDestinations, isLoading } = useExploreStore();

  const [rawSearch,         setRawSearch]         = useState(searchParams.get("q") ?? "");
  const [manualCity,        setManualCity]         = useState<string>("");
  const [showCityDropdown,  setShowCityDropdown]   = useState(false);
  const [useMyLocation,     setUseMyLocation]      = useState(false);
  const searchQuery = useDebounced(rawSearch, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const geo = useGeolocation();

  const origin = (() => {
    if (useMyLocation && geo.coordinates) return geo.coordinates;
    if (manualCity && CITY_COORDS[manualCity]) return CITY_COORDS[manualCity];
    return null;
  })();

  useEffect(() => { loadDestinations(); }, [loadDestinations]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const enriched = destinations.map((park) => ({
    ...park,
    distance: (origin && park.coordinates)
      ? calculateDistance(origin.lat, origin.lon, park.coordinates.lat, park.coordinates.lon)
      : undefined,
  }));

  const filtered = enriched
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
    })
    .filter((p) => {
      if (useMyLocation) return p.distance !== undefined && p.distance < 200;
      if (manualCity)    return p.city.toLowerCase().includes(manualCity.toLowerCase());
      return true;
    })
    .sort((a, b) => {
      if ((useMyLocation || manualCity) && a.distance !== undefined && b.distance !== undefined)
        return a.distance - b.distance;
      return 0;
    });

  const handleLocationToggle = useCallback(() => {
    if (!useMyLocation) {
      setManualCity("");
      setUseMyLocation(true);
      geo.refresh();
    } else {
      setUseMyLocation(false);
    }
  }, [useMyLocation, geo]);

  return (
    <div className="qc-page">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-extrabold text-3xl text-slate-900">Explore parks</h1>
        <p className="text-slate-500 text-sm mt-1">Discover parks and start planning your visit.</p>
      </motion.div>

      {/* ── Search Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="relative mb-4"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search parks, cities or attractions"
          value={rawSearch}
          onChange={(e) => setRawSearch(e.target.value)}
          className="w-full pl-12 pr-12 h-14 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-qc-blue-500 focus:ring-2 focus:ring-qc-blue-500/20 outline-none transition-all shadow-sm"
        />
        {rawSearch && (
          <button onClick={() => setRawSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* ── Location Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="flex items-center gap-2 mb-6 flex-wrap"
      >
        <button
          onClick={handleLocationToggle}
          disabled={geo.loading}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
            useMyLocation
              ? "bg-qc-blue-50 text-qc-blue-700 border-qc-blue-200"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {geo.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
          {geo.loading ? "Locating..." : useMyLocation ? "My Location ✓" : "Near me"}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
              manualCity
                ? "bg-qc-blue-50 text-qc-blue-700 border-qc-blue-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <MapPin className="w-3 h-3" />
            {manualCity || "All cities"}
            <ChevronDown className={`w-3 h-3 transition-transform ${showCityDropdown ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showCityDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
              >
                {["", ...Object.keys(CITY_COORDS)].map((city) => (
                  <button
                    key={city || "__all"}
                    onClick={() => { setManualCity(city); setUseMyLocation(false); setShowCityDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      manualCity === city ? "text-qc-blue-600 bg-qc-blue-50 font-semibold" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {city || "All cities"}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(rawSearch || manualCity || useMyLocation) && (
          <button
            onClick={() => { setRawSearch(""); setManualCity(""); setUseMyLocation(false); }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </motion.div>

      {/* ── Results Count ── */}
      {!isLoading && (
        <p className="text-slate-500 text-sm mb-4">
          {filtered.length} park{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* ── Results Grid ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="qc-card-white rounded-2xl overflow-hidden">
                <div className="h-40 bg-slate-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                  <div className="h-8 bg-slate-100 rounded mt-3 animate-pulse" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No parks found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search or removing filters.</p>
            <button
              onClick={() => { setRawSearch(""); setManualCity(""); setUseMyLocation(false); }}
              className="mt-4 btn-blue-secondary text-sm"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div key="results" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((park, idx) => (
              <DestinationCard
                key={park.park_id}
                park={park}
                imageUrl={park.image ?? GENERIC_PARK_IMAGE}
                distance={park.distance}
                index={idx}
                variant="grid"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
