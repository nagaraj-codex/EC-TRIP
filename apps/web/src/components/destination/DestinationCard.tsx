import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import CrowdLevelBadge from "../intelligence/CrowdLevelBadge";
import type { ParkSummary } from "../../types/api";

interface DestinationCardProps {
  park: ParkSummary;
  imageUrl: string;
  peaceScore?: number;
  crowdLevel?: "low" | "medium" | "high" | "very_high";
  distance?: number;
  index?: number;
  variant?: "grid" | "list";
}

export default function DestinationCard({
  park,
  imageUrl,
  peaceScore,
  crowdLevel,
  distance,
  index = 0,
  variant = "grid",
}: DestinationCardProps) {
  const navigate = useNavigate();

  if (variant === "list") {
    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        onClick={() => navigate(`/app/explore/${park.park_id}`)}
        className="w-full text-left group qc-card-white rounded-2xl overflow-hidden flex transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
      >
        <div className="w-28 h-28 shrink-0 overflow-hidden">
          <img
            src={imageUrl}
            alt={park.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm truncate">{park.name}</h3>
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{park.city}</span>
              {distance !== undefined && (
                <span className="text-qc-blue-600 ml-1 shrink-0">• {distance} km</span>
              )}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            {crowdLevel && <CrowdLevelBadge level={crowdLevel} size="sm" />}
            <div className="text-right ml-auto">
              {park.weekday_price && (
                <p className="text-qc-blue-600 text-xs font-bold">₹{park.weekday_price}</p>
              )}
              {park.total_rides > 0 && (
                <p className="text-slate-400 text-[10px]">{park.total_rides} rides</p>
              )}
            </div>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/app/explore/${park.park_id}`)}
      className="w-full text-left group qc-card-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative h-40 sm:h-44 overflow-hidden">
        <img
          src={imageUrl}
          alt={park.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {crowdLevel && (
          <div className="absolute top-3 left-3 z-10">
            <CrowdLevelBadge level={crowdLevel} size="sm" showPulse />
          </div>
        )}
        {distance !== undefined && (
          <div className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-semibold border border-slate-200">
            📍 {distance} km
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-base leading-tight">{park.name}</h3>
        <p className="flex items-center gap-1 text-sm text-slate-500 mt-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{park.city}</span>
        </p>
        <div className="flex items-center justify-between mt-3">
          {park.weekday_price ? (
            <span className="text-qc-blue-600 text-sm font-semibold">From ₹{park.weekday_price}</span>
          ) : (
            <span className="text-slate-400 text-xs">{park.total_rides > 0 ? `${park.total_rides} rides` : ""}</span>
          )}
          <div className="flex items-center gap-1 text-slate-400 group-hover:text-qc-blue-600 transition-colors text-xs font-medium">
            View park <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
