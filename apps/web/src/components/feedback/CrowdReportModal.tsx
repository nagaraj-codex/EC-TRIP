import { useState } from "react";
import { apiClient } from "../../services/apiClient";
import { usePlannerStore } from "../../store/slices/plannerStore";
import { MapPin, CheckCircle, ShieldCheck, X, Users, Sparkles } from "lucide-react";

interface Props {
  onClose: () => void;
}

const levels = ["low", "medium", "high", "very_high"] as const;
type Level = typeof levels[number];

const levelLabel: Record<Level, string> = {
  low: "Light (0-15m)",
  medium: "Moderate (15-30m)",
  high: "Busy (30-50m)",
  very_high: "Packed (50m+)"
};

export default function CrowdReportModal({ onClose }: Props) {
  const { parkId } = usePlannerStore();
  const [selected, setSelected] = useState<Level | null>("medium");
  const [wait, setWait] = useState(20);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [verified, setVerified] = useState(false);

  async function submit() {
    if (!selected) return;
    setStatus("loading");

    let coords: { user_lat?: number; user_lon?: number } = {};
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
      );
      coords = { user_lat: pos.coords.latitude, user_lon: pos.coords.longitude };
    } catch {
      // Location declined — submit without verification
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const result = await apiClient.submitCrowdReport({
        park_id: parkId || "wonderla-chennai",
        visit_date: today,
        observed_crowd: selected,
        observed_wait_top_ride_minutes: wait,
        fasttrack_purchased: false,
        ...coords,
      });
      setVerified(result.verified_on_site);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="glass-panel w-full max-w-sm mx-auto p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Report Live Crowd</h2>
              <p className="text-[10px] text-slate-400">Judge 3 Crowdsourced Calibration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {status === "done" ? (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-emerald">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Crowd Telemetry Submitted!</p>
              {verified ? (
                <p className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>On-site geofence verified. Score calibrated.</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  Thank you for contributing to community telemetry.
                </p>
              )}
            </div>
            <button onClick={onClose} className="btn btn-primary mt-3 text-xs font-bold">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">How busy does the park feel right now?</p>

            <div className="grid grid-cols-2 gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setSelected(l)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selected === l
                      ? "bg-brand-500/20 text-brand-300 border-brand-500 shadow-glow-brand"
                      : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {levelLabel[l]}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Top ride wait time:</span>
                <span className="font-extrabold text-brand-300">{wait} mins</span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={5}
                value={wait}
                onChange={(e) => setWait(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            {status === "error" && (
              <p className="text-xs text-rose-400">Submission failed. Please try again.</p>
            )}

            <button
              onClick={submit}
              disabled={!selected || status === "loading"}
              className="btn btn-primary text-xs font-bold disabled:opacity-50"
            >
              {status === "loading" ? "Submitting Telemetry..." : "Submit Live Report"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
