import { useState } from "react";
import { usePlannerStore } from "../../store/slices/plannerStore";
import { useAuthStore } from "../../store/slices/authStore";
import { useActionGuard } from "../../hooks/useActionGuard";
import { Bookmark, Check, ExternalLink, Sparkles, Clock, Ticket, ArrowLeft, ShieldAlert, MessageSquare } from "lucide-react";
import ConfidenceBadge from "../../components/recommendation/ConfidenceBadge";
import AdvisorDrawer from "../../components/chat/AdvisorDrawer";

export default function RecommendationScreen() {
  const { activeRecommendation, setScreen } = usePlannerStore();
  const { isTripSaved, saveTrip } = useAuthStore();
  const { executeGuarded } = useActionGuard();
  const [showAlts, setShowAlts] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  if (!activeRecommendation) {
    return (
      <div className="text-center text-slate-400 py-16 space-y-3">
        <p className="text-sm">No recommendation calculated yet.</p>
        <button onClick={() => setScreen("step1")} className="btn btn-primary max-w-xs mx-auto text-xs">
          Start Trip Planner
        </button>
      </div>
    );
  }

  const { recommended_date, evaluations, park_id, park_name } = activeRecommendation;
  const best = evaluations.find((e) => e.date === recommended_date) ?? evaluations[0];
  const alts = evaluations.filter((e) => e.date !== recommended_date);

  const dateObj = new Date(best.date);
  const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "long" });
  const dateStr = dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

  const isFastTrack = best.fasttrack_verdict === "CONSIDER" || best.fasttrack_verdict === "RECOMMENDED";
  const alreadySaved = isTripSaved(best.date, park_id || "wonderla-chennai");

  const displayName =
    park_name ||
    (park_id === "mgm-dizzee-chennai"
      ? "MGM Dizzee World"
      : park_id === "black-thunder-coimbatore"
      ? "Black Thunder"
      : "Wonderla Chennai");

  const handleSaveTrip = () => {
    executeGuarded(() => {
      saveTrip({
        parkId: park_id || "wonderla-chennai",
        parkName: displayName,
        date: best.date,
        ticketPrice: best.ticket_price,
        crowdLevel: best.crowd_level,
        predictedWait: best.predicted_wait_top_ride_minutes,
        fastTrackVerdict: best.fasttrack_verdict
      });
    }, `Sign in to save this ${displayName} itinerary to your profile`);
  };

  const handleBookNow = () => {
    executeGuarded(() => {
      const url =
        park_id === "mgm-dizzee-chennai"
          ? "https://mgmdizzeeworld.com/"
          : park_id === "black-thunder-coimbatore"
          ? "https://blackthunder.in/"
          : "https://bookings.wonderla.com/";
      window.open(url, "_blank");
    }, "Sign in to unlock verified partner discounts & booking concierge");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen("step4")}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Adjust Inputs</span>
        </button>

        <button
          onClick={() => setAdvisorOpen(true)}
          className="px-3 py-1.5 rounded-full bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-400/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-glow-brand"
        >
          <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
          <span>Ask AI Advisor</span>
        </button>
      </div>

      {/* Hero Recommendation Card */}
      <div className="card-gradient relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500 text-white shadow-xs">
            Optimal Visiting Day
          </span>
          <span className="text-xs font-semibold text-brand-300">{displayName}</span>
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🎯 Best Choice: {dayName}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">{dateStr}</p>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-900/80 rounded-2xl text-center border border-slate-700/80">
            <span className="block text-xl font-black text-brand-300 capitalize">
              {best.crowd_level.replace("_", " ")}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
              Expected Crowd
            </span>
          </div>
          <div className="p-3.5 bg-slate-900/80 rounded-2xl text-center border border-slate-700/80">
            <span className="block text-xl font-black text-amber-300">
              ~{best.predicted_wait_top_ride_minutes}m
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
              Peak Ride Wait
            </span>
          </div>
        </div>

        {/* Detailed Reasoning Box */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-200 font-bold">Recommendation Telemetry</span>
            <ConfidenceBadge confidence={best.confidence} reasoning={best.reasoning} />
          </div>

          <div className="text-slate-300 space-y-1.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Crowd Pressure</span>
              <span className="font-semibold text-white capitalize">{best.crowd_level.replace("_", " ")}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Ticket Rate Baseline</span>
              <span className="font-semibold text-emerald-400">₹{best.ticket_price}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Open-Meteo Weather</span>
              <span className="font-semibold text-amber-300 capitalize">{best.weather_condition} ({best.temp_max}°C)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 italic leading-relaxed">
            "{best.reasoning}"
          </p>
        </div>

        {/* FastTrack ROI Verdict Pill */}
        <div className={`p-3.5 rounded-2xl border ${
          isFastTrack
            ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
            : "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
        }`}>
          <div className="font-extrabold text-xs mb-1 flex items-center gap-1.5">
            <Ticket className="w-4 h-4" />
            <span>FastTrack ROI: {best.fasttrack_verdict}</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            {isFastTrack
              ? `At ₹${best.cost_per_minute_saved}/min saved, FastTrack is recommended due to ${best.crowd_level} weekend queues.`
              : `Only ~${Math.max(0, best.predicted_wait_top_ride_minutes - 5)} mins saved. Regular queue recommended today.`}
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          className="btn btn-primary text-xs shadow-glow-brand"
          onClick={() => setScreen("itinerary")}
        >
          <span>📋 View Full 1-Day Slot Itinerary</span>
        </button>

        {alts.length > 0 && (
          <button
            className="btn btn-secondary text-xs"
            onClick={() => setShowAlts(!showAlts)}
          >
            {showAlts ? "Hide Alternative Dates" : `Compare ${alts.length} Alternative Dates`}
          </button>
        )}

        <button
          className="btn btn-accent text-xs"
          onClick={handleBookNow}
        >
          <span>🎫 Book Official Tickets</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <button
          className={`btn text-xs transition-all ${
            alreadySaved
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
              : "btn-secondary"
          }`}
          onClick={handleSaveTrip}
        >
          {alreadySaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Trip Saved in Your Profile</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 text-slate-400" />
              <span>Save This Trip</span>
            </>
          )}
        </button>
      </div>

      {/* Alternatives Comparison Accordion */}
      {showAlts && alts.length > 0 && (
        <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Alternative Candidate Dates
          </div>
          {alts.map((alt) => (
            <div
              key={alt.date}
              className="glass-panel p-3.5 rounded-2xl border border-slate-800 text-xs flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-brand-300">{alt.date}</span>
                  <ConfidenceBadge confidence={alt.confidence} reasoning={alt.reasoning} />
                </div>
                <div className="text-slate-400 capitalize mt-0.5">
                  {alt.crowd_level.replace("_", " ")} crowd • {alt.weather_condition}
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-emerald-400">₹{alt.ticket_price}</div>
                <div className="text-[10px] text-slate-400">~{alt.predicted_wait_top_ride_minutes}m wait</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Advisor Drawer */}
      <AdvisorDrawer open={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </div>
  );
}
