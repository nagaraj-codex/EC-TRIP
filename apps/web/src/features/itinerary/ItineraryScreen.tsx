import { useState, useEffect } from "react";
import {
  Printer,
  Mail,
  Share2,
  Sparkles,
  Clock,
  CheckCircle,
  ShieldAlert,
  Sun,
  Waves,
  Utensils,
  Compass,
  ArrowLeft,
  MessageSquare
} from "lucide-react";
import { usePlannerStore } from "../../store/slices/plannerStore";
import { useAuthStore } from "../../store/slices/authStore";
import { useActionGuard } from "../../hooks/useActionGuard";
import { apiClient } from "../../services/apiClient";
import type { TimelineItem, ItineraryResponse } from "../../types/api";
import AdvisorDrawer from "../../components/chat/AdvisorDrawer";

export default function ItineraryScreen() {
  const { activeRecommendation, parkId, priority, setScreen } = usePlannerStore();
  const { user } = useAuthStore();
  const { executeGuarded } = useActionGuard();

  const [itineraryData, setItineraryData] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const dateStr = activeRecommendation?.recommended_date ?? new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function fetchItinerary() {
      setLoading(true);
      try {
        const prioMap: Record<string, string> = {
          cheapest: "Cheapest",
          least_crowded: "Least Crowded",
          balanced: "Best Balanced",
          max_rides: "Maximum Rides",
        };
        const res = await apiClient.generateItinerary({
          park_id: parkId || "wonderla-chennai",
          visit_date: dateStr,
          priority: prioMap[priority] || "Best Balanced",
        });
        setItineraryData(res);
      } catch (err) {
        console.error("Failed to load dynamic itinerary", err);
      } finally {
        setLoading(false);
      }
    }
    fetchItinerary();
  }, [parkId, dateStr, priority]);

  const handlePrint = () => {
    executeGuarded(() => {
      window.print();
    }, "Sign in to export and print high-resolution PDF itineraries");
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim()) return;
    setSendingEmail(true);
    try {
      await apiClient.generateItinerary({
        park_id: parkId || "wonderla-chennai",
        visit_date: dateStr,
        email: emailInput.trim(),
      });
      setEmailSent(true);
      setTimeout(() => {
        setEmailModalOpen(false);
        setEmailSent(false);
      }, 2000);
    } catch {
      alert("Failed to send itinerary email. Please verify your address.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleEmailClick = () => {
    executeGuarded(() => {
      setEmailModalOpen(true);
    }, "Sign in to receive automated PDF itinerary emails via Resend API");
  };

  const handleShare = () => {
    executeGuarded(() => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert("Itinerary link copied to clipboard!");
      }
    }, "Sign in to generate shareable group itinerary links");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Thrill Ride":
        return {
          border: "border-indigo-500",
          badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        };
      case "Water Ride":
        return {
          border: "border-cyan-500",
          badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          icon: <Waves className="w-3.5 h-3.5 text-cyan-400" />
        };
      case "Dining":
        return {
          border: "border-amber-500",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: <Utensils className="w-3.5 h-3.5 text-amber-400" />
        };
      default:
        return {
          border: "border-emerald-500",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: <Compass className="w-3.5 h-3.5 text-emerald-400" />
        };
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen("recommendation")}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verdict</span>
        </button>

        <button
          onClick={() => setAdvisorOpen(true)}
          className="px-3 py-1.5 rounded-full bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-400/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-glow-brand"
        >
          <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
          <span>Ask AI Advisor</span>
        </button>
      </div>

      {/* Hero Card */}
      <div className="card-gradient relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-600 text-white shadow-xs">
            Optimized Schedule
          </span>
          <span className="text-xs font-semibold text-slate-300">
            {itineraryData?.park_name || "Wonderla Chennai"}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          1-Day Precision Itinerary
        </h1>
        <p className="text-xs text-slate-300 mt-0.5">{dateStr} • Slot-by-Slot Queue Strategy</p>

        {/* Telemetry & UV Alert Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-bold flex items-center gap-1.5 text-cyan-300">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Open-Meteo & UV Telemetry</span>
            </span>
            <span className="font-extrabold text-white">
              Est. Total Wait: ~{itineraryData?.total_estimated_wait_minutes ?? 35} mins
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {itineraryData?.uv_shield_applied
              ? "☀️ High UV irradiance detected (11:30 AM – 2:30 PM). Water rides & air-conditioned dining automatically timed for solar protection."
              : "🌤️ Optimal atmospheric conditions. Queue waits projected below peak threshold across major coasters."}
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Generating optimal ride routing...</span>
          </div>
        ) : (
          itineraryData?.timeline.map((item: TimelineItem, index: number) => {
            const colors = getCategoryColor(item.category);
            return (
              <div
                key={index}
                className={`glass-panel border-l-4 ${colors.border} p-4 rounded-2xl space-y-2 hover:border-slate-600 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-brand-400 text-xs sm:text-sm">
                    {item.time_slot}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${colors.badge}`}>
                    {colors.icon}
                    <span>{item.category}</span>
                  </span>
                </div>

                <div className="font-extrabold text-white text-sm">
                  {item.activity}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Est. queue wait: {item.estimated_wait_minutes} mins</span>
                  </div>
                  {item.uv_exposure === "High / Caution" && (
                    <span className="text-amber-400 font-semibold flex items-center gap-0.5 text-[10px]">
                      <ShieldAlert className="w-3 h-3" />
                      Peak UV Period
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed font-medium">
                  💡 <span className="text-brand-300 font-bold">Strategy:</span> {item.tip}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Gated Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5 pt-2">
        <button
          onClick={handlePrint}
          className="btn btn-secondary text-xs font-bold py-3 flex flex-col items-center gap-1"
        >
          <Printer className="w-4 h-4 text-brand-400" />
          <span>Print PDF</span>
        </button>

        <button
          onClick={handleEmailClick}
          className="btn btn-secondary text-xs font-bold py-3 flex flex-col items-center gap-1"
        >
          <Mail className="w-4 h-4 text-amber-400" />
          <span>Email Plan</span>
        </button>

        <button
          onClick={handleShare}
          className="btn btn-secondary text-xs font-bold py-3 flex flex-col items-center gap-1"
        >
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span>Share Link</span>
        </button>
      </div>

      {/* Email Itinerary Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl border border-slate-700/80 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-1">
              Email Itinerary PDF
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              We'll send the complete timetable and tips directly to your inbox via Resend.
            </p>

            {emailSent ? (
              <div className="py-4 text-center text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Itinerary sent successfully!</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="form-input"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setEmailModalOpen(false)}
                    className="btn btn-secondary flex-1 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="btn btn-primary flex-1 text-xs"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advisor Chat Drawer */}
      <AdvisorDrawer open={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </div>
  );
}
