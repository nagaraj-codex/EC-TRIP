import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExploreStore } from "../store/slices/exploreStore";
import { apiClient } from "../services/apiClient";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, Star, ExternalLink,
  Thermometer, Droplets, Sun, Navigation, Ticket, Zap
} from "lucide-react";
import PeaceScoreRing from "../components/intelligence/PeaceScoreRing";
import CrowdLevelBadge from "../components/intelligence/CrowdLevelBadge";
import ConfidenceIndicator from "../components/intelligence/ConfidenceIndicator";
import WhyThisPrediction from "../components/intelligence/WhyThisPrediction";
import type { WeatherTelemetryResponse, RecommendationResponse } from "../types/api";

const GENERIC_IMAGE = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80";

export default function DestinationDetailPage() {
  const { parkId } = useParams<{ parkId: string }>();
  const navigate = useNavigate();
  const { destinations, loadDestinations } = useExploreStore();
  const [weather, setWeather] = useState<WeatherTelemetryResponse | null>(null);
  const [parkDetail, setParkDetail] = useState<Record<string, unknown> | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  const park = destinations.find((p) => p.park_id === parkId);
  const imgUrl = park?.image ?? GENERIC_IMAGE;

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  useEffect(() => {
    if (!parkId) return;
    apiClient.getWeather(parkId).then(setWeather).catch(() => {});
    apiClient.getPark(parkId).then((res) => setParkDetail(res.data as Record<string, unknown>)).catch(() => {});

    setRecLoading(true);
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
    }).then(setRecommendation).catch(() => {}).finally(() => setRecLoading(false));
  }, [parkId]);

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
        <img src={imgUrl} alt={park.name} className="w-full h-full object-cover" />
        <div className="qc-hero-overlay" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-slate-950/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-950/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

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
            {park.operating_hours && (
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> {park.operating_hours}
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
            <div className="flex items-center gap-5">
              <div className="w-[90px] h-[90px] rounded-full bg-slate-800/60 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-slate-800/60 rounded-full w-32 animate-pulse" />
                <div className="h-4 bg-slate-800/60 rounded w-48 animate-pulse" />
                <div className="h-4 bg-slate-800/60 rounded w-40 animate-pulse" />
              </div>
            </div>
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
              <p className="text-slate-500 text-sm">
                Visit recommendations will appear once enough information is available.
              </p>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/40 rounded-xl p-3 border border-white/[0.04]">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Weekday</p>
              <p className="text-white font-display font-bold text-lg">
                ₹{park.weekday_price || "—"}
              </p>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-3 border border-white/[0.04]">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Weekend</p>
              <p className="text-white font-display font-bold text-lg">
                ₹{park.weekend_price || "—"}
              </p>
            </div>
          </div>

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
        {weather && (
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

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">{weather.weather.temp_max_c}°C</p>
                <p className="text-slate-500 text-[10px]">High</p>
              </div>
              <div className="text-center">
                <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">{weather.weather.rain_probability_pct}%</p>
                <p className="text-slate-500 text-[10px]">Rain</p>
              </div>
              <div className="text-center">
                <Sun className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-white text-sm font-bold">UV {weather.solar_uv.peak_uv}</p>
                <p className="text-slate-500 text-[10px]">{weather.solar_uv.uv_category}</p>
              </div>
            </div>
          </motion.div>
        )}

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
            {park.operating_hours && (
              <div className="flex justify-between">
                <span className="text-slate-500">Hours</span>
                <span className="text-white font-semibold">{park.operating_hours}</span>
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
      </div>
    </div>
  );
}
