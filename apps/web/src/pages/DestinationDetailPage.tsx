import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExploreStore } from "../store/slices/exploreStore";
import { apiClient } from "../services/apiClient";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, Star, ExternalLink,
  Thermometer, Droplets, Sun, Navigation, Ticket, Zap, Heart
} from "lucide-react";
import { useAuthStore } from "../store/slices/authStore";
import PeaceScoreRing from "../components/intelligence/PeaceScoreRing";
import CrowdLevelBadge from "../components/intelligence/CrowdLevelBadge";
import ConfidenceIndicator from "../components/intelligence/ConfidenceIndicator";
import WhyThisPrediction from "../components/intelligence/WhyThisPrediction";
import RouteSummary from "../components/maps/RouteSummary";
import ParkUpdates from "../components/intelligence/ParkUpdates";
import Skeleton from "../components/common/Skeleton";
import ErrorState from "../components/common/ErrorState";
import { formatOperatingHours } from "../utils/parkFormatting";
import { queueCutAssets } from "../data/assetConfig";
import type { ParkTariffResponse, WeatherTelemetryResponse, RecommendationResponse } from "../types/api";

const GENERIC_IMAGE = queueCutAssets.genericParkImage(900);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getAdultTariffPrices(pricing: Record<string, unknown> | null | undefined) {
  if (!pricing) return { weekday: null, weekend: null };
  const rates = isRecord(pricing.regular_rates) ? pricing.regular_rates : {};
  const packages = Array.isArray(pricing.packages) ? pricing.packages : [];
  const packagePrices = packages
    .filter(isRecord)
    .map((entry) => entry.adult_price)
    .filter((price): price is number => typeof price === "number");
  const entryCharges = isRecord(pricing.entry_charges) ? pricing.entry_charges : {};
  const entryPrice = typeof entryCharges.adult === "number" ? entryCharges.adult : null;
  const fallbackPrice = packagePrices.length > 0 ? Math.min(...packagePrices) : entryPrice;
  const weekday = typeof rates.adult_weekday === "number" ? rates.adult_weekday : fallbackPrice;
  const weekend = typeof rates.adult_weekend === "number" ? rates.adult_weekend : fallbackPrice;
  return { weekday, weekend };
}

export default function DestinationDetailPage() {
  const { parkId } = useParams<{ parkId: string }>();
  const navigate = useNavigate();
  const { destinations, loadDestinations } = useExploreStore();
  const savedParkIds = useAuthStore((state) => state.savedParkIds);
  const toggleSavedPark = useAuthStore((state) => state.toggleSavedPark);
  const [weather, setWeather] = useState<WeatherTelemetryResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [weatherRetry, setWeatherRetry] = useState(0);
  const [tariff, setTariff] = useState<ParkTariffResponse | null>(null);
  const [tariffLoading, setTariffLoading] = useState(true);
  const [tariffError, setTariffError] = useState("");
  const [tariffRetry, setTariffRetry] = useState(0);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const [recRetry, setRecRetry] = useState(0);

  const park = destinations.find((p) => p.park_id === parkId);
  const isParkSaved = Boolean(parkId && savedParkIds.includes(parkId));
  const imgUrl = park?.image ?? GENERIC_IMAGE;
  const operatingHours = formatOperatingHours(park?.operating_hours);
  const adultPrices = getAdultTariffPrices(tariff?.pricing);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  useEffect(() => {
    if (!parkId) return;
    let isCurrentRequest = true;
    setWeather(null);
    setWeatherError("");
    setWeatherLoading(true);
    apiClient.getWeather(parkId)
      .then((result) => { if (isCurrentRequest) setWeather(result); })
      .catch(() => { if (isCurrentRequest) setWeatherError("Weather information is temporarily unavailable."); })
      .finally(() => { if (isCurrentRequest) setWeatherLoading(false); });
    return () => { isCurrentRequest = false; };
  }, [parkId, weatherRetry]);

  useEffect(() => {
    if (!parkId) return;
    let isCurrentRequest = true;
    setTariff(null);
    setTariffError("");
    setTariffLoading(true);
    apiClient.getParkTariff(parkId)
      .then((result) => { if (isCurrentRequest) setTariff(result); })
      .catch(() => { if (isCurrentRequest) setTariffError("Ticket information is temporarily unavailable."); })
      .finally(() => { if (isCurrentRequest) setTariffLoading(false); });
    return () => { isCurrentRequest = false; };
  }, [parkId, tariffRetry]);

  useEffect(() => {
    if (!parkId) return;
    let isCurrentRequest = true;
    setRecLoading(true);
    setRecError("");
    setRecommendation(null);
    const today = new Date().toISOString().split("T")[0];
    const next3 = Array.from({ length: 3 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return d.toISOString().split("T")[0];
    });
    apiClient.recommend({
      park_id: parkId,
      candidate_dates: [today, ...next3],
      priority: "Best Balanced"
    }).then((result) => { if (isCurrentRequest) setRecommendation(result); })
      .catch(() => { if (isCurrentRequest) setRecError("Crowd forecast is temporarily unavailable."); })
      .finally(() => { if (isCurrentRequest) setRecLoading(false); });
    return () => { isCurrentRequest = false; };
  }, [parkId, recRetry]);

  // Get the recommended day's evaluation
  const recommendedEval = recommendation
    ? recommendation.evaluations.find((e) => e.date === recommendation.recommended_date) ?? recommendation.evaluations[0]
    : null;

  if (!park) {
    return (
      <div className="qc-page flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-500 text-sm">Loading destination...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-8">
      {/* Hero Image */}
      <div className="relative h-56 sm:h-72">
        <img src={imgUrl} alt={park.image ? park.name : "Generic amusement park scene, not a photo of this park"} width={1600} height={900} fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
        <div className="qc-hero-overlay" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-slate-950/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-950/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        {park && (
          <button
            type="button"
            onClick={() => toggleSavedPark(park.park_id)}
            aria-label={isParkSaved ? `Remove ${park.name} from saved parks` : `Save ${park.name} on this device`}
            aria-pressed={isParkSaved}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white backdrop-blur-md transition-colors hover:bg-slate-950/80 focus-visible:ring-2 focus-visible:ring-white"
          >
            <Heart className="h-4 w-4" fill={isParkSaved ? "currentColor" : "none"} />
          </button>
        )}

        {/* Park info overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h1 className="font-display font-extrabold text-2xl text-white leading-tight">{park.name}</h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-slate-300 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {park.city}
            </span>
            {park.rating && (
              <span className="text-qc-amber-400 text-xs flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> {park.rating}
              </span>
            )}
            {operatingHours && (
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> {operatingHours}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4 mt-4">

        {/* Crowd Intelligence Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="qc-card rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-qc-teal-400" />
            Crowd Intelligence
          </h2>

          {recLoading ? (
            <Skeleton variant="crowd" dark />
          ) : recommendedEval ? (
            <div className="flex items-center gap-5">
              <PeaceScoreRing score={recommendedEval.visit_score} size={90} />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <CrowdLevelBadge level={recommendedEval.crowd_level} size="md" showPulse />
                  <ConfidenceIndicator level={recommendedEval.confidence} />
                </div>
                <p className="text-slate-400 text-xs">
                  Best date:{" "}
                  <span className="text-white font-semibold">{recommendation?.recommended_date}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              {recError ? <ErrorState title="Crowd forecast could not be loaded." description={recError} tone="dark" onRetry={() => setRecRetry((retry) => retry + 1)} /> : (
                <p className="text-slate-500 text-sm">Crowd forecast is unavailable for this park and date.</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Why This Prediction */}
        {recommendedEval && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <WhyThisPrediction reasoning={recommendedEval.reasoning} />
          </motion.div>
        )}

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="qc-card rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-qc-amber-400" />
            Pricing
          </h2>

          {tariffLoading ? (
            <Skeleton variant="tariff" dark />
          ) : tariffError ? (
            <ErrorState title="Ticket information could not be loaded." description={tariffError} tone="dark" onRetry={() => setTariffRetry((retry) => retry + 1)} />
          ) : adultPrices.weekday !== null || adultPrices.weekend !== null ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/40 rounded-xl p-3 border border-white/4">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Adult · Weekday</p>
              <p className="text-white font-display font-bold text-lg">
                {adultPrices.weekday !== null ? `₹${adultPrices.weekday.toLocaleString("en-IN")}` : "Not listed"}
              </p>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-3 border border-white/4">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Adult · Weekend</p>
              <p className="text-white font-display font-bold text-lg">
                {adultPrices.weekend !== null ? `₹${adultPrices.weekend.toLocaleString("en-IN")}` : "Not listed"}
              </p>
            </div>
          </div>
          ) : (
            <p className="text-sm text-slate-400">Adult ticket rates are not listed in this park&apos;s catalog.</p>
          )}
          {tariff?.provenance && <p className="mt-3 text-[10px] text-slate-500">Catalog status: {tariff.provenance.data_status.toLowerCase()} · verify current prices with the park.</p>}

          {park.official_website && (
            <a
              href={park.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full mt-4 text-sm"
            >
              Book Tickets
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </motion.div>

        {/* Weather Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="qc-card rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-qc-amber-400" />
            Weather Today
          </h2>
          {weatherLoading ? (
            <Skeleton variant="weather" dark />
          ) : weatherError ? (
            <ErrorState title="Weather could not be loaded." description={weatherError} tone="dark" onRetry={() => setWeatherRetry((retry) => retry + 1)} />
          ) : weather ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">{weather.weather.temp_max === null ? "Unavailable" : `${weather.weather.temp_max}°C`}</p>
                <p className="text-slate-500 text-[10px]">High</p>
              </div>
              <div className="text-center">
                <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">{weather.weather.rain_prob === null ? "Unavailable" : `${weather.weather.rain_prob}%`}</p>
                <p className="text-slate-500 text-[10px]">Rain</p>
              </div>
              <div className="text-center">
                <Sun className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">{weather.solar_uv.peak_uv === null ? "UV unavailable" : `UV ${weather.solar_uv.peak_uv}`}</p>
                <p className="text-slate-500 text-[10px]">{weather.solar_uv.advisory}</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-slate-500">{weather.weather.condition ?? "Forecast unavailable"} · Source: {weather.weather.source} · {weather.weather.data_status.toLowerCase()}</p>
            <p className="mt-2 flex flex-wrap gap-x-2 text-[10px] text-slate-500">
              <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">Weather: Open-Meteo</a>
              <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer" className="underline underline-offset-2">UV: Open-Meteo / CAMS</a>
              <a href="https://sunrise-sunset.org/" target="_blank" rel="noreferrer" className="underline underline-offset-2">Solar events: Sunrise-Sunset.org</a>
            </p>
          </>
          ) : (
            <p className="text-sm text-slate-400">Weather information is unavailable.</p>
          )}
        </motion.div>

        {/* Park Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="qc-card rounded-2xl p-5"
        >
          <h2 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-brand-400" />
            Park Details
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Rides</span>
              <span className="text-white font-semibold">{park.total_rides}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Brand</span>
              <span className="text-white font-semibold">{park.brand}</span>
            </div>
            {operatingHours && (
              <div className="flex justify-between">
                <span className="text-slate-500">Hours</span>
                <span className="text-white font-semibold">{operatingHours}</span>
              </div>
            )}
            {park.status && (
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-400 font-semibold">{park.status}</span>
              </div>
            )}
          </div>
        </motion.div>

        <section aria-labelledby="ride-availability-heading" className="qc-card rounded-2xl p-5">
          <h2 id="ride-availability-heading" className="font-display font-bold text-sm text-white">Ride availability</h2>
          <p className="mt-2 text-sm text-slate-400">Live operating status is not provided by this park&apos;s data source.</p>
          <p className="mt-1 text-xs text-slate-500">The catalog lists {park.total_rides} attractions; this does not indicate current ride availability.</p>
        </section>

        <RouteSummary parkId={park.park_id} />
        <ParkUpdates parkId={park.park_id} />
      </div>
    </div>
  );
}
