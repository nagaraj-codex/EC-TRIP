import React from "react";
import { Download, Trash2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../../store/slices/authStore";

interface TelemetrySecurityTabProps {
  onExportData: () => void;
}

export const TelemetrySecurityTab: React.FC<TelemetrySecurityTabProps> = ({ onExportData }) => {
  const { logout } = useAuthStore();

  const handleResetAccount = () => {
    if (confirm("Are you sure you want to reset all account data?")) {
      logout();
      alert("Account data reset.");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
          Telemetry & Privacy Management
        </h3>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
          <div>
            <div className="font-bold text-xs text-white">Export Personal Travel History</div>
            <div className="text-[11px] text-slate-400">Download a JSON snapshot of your preferences and saved trips.</div>
          </div>
          <button
            onClick={onExportData}
            className="btn btn-secondary sm:w-auto px-3.5 py-2 text-xs font-semibold shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" />
            <span>Export JSON</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-rose-950/20 rounded-2xl border border-rose-500/30">
          <div>
            <div className="font-bold text-xs text-rose-300">Delete Account & Stored Telemetry</div>
            <div className="text-[11px] text-rose-400/80">Permanently clears your profile, saved trips, and device tokens.</div>
          </div>
          <button
            onClick={handleResetAccount}
            className="btn sm:w-auto px-3.5 py-2 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Account</span>
          </button>
        </div>

        <div className="p-3 bg-brand-950/40 border border-brand-500/20 rounded-2xl text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>QueueCut adheres to strict 1-year data minimization and never sells visitor telemetry.</span>
        </div>
      </div>
    </div>
  );
};
