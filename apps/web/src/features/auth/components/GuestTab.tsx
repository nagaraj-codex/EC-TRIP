import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../../store/slices/authStore";

export const GuestTab: React.FC = () => {
  const { loginWithGoogle, continueAsGuest } = useAuthStore();

  return (
    <div className="p-6 space-y-4 animate-in fade-in duration-150">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Instant Guest Access</span>
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">
          Browse freely with zero account
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Explore all verified 2026 pricing, live wait times, and 7-day crowd heatmaps right now without filling out forms.
        </p>
      </div>

      <div className="space-y-2.5 bg-[#070e1d] p-4 rounded-2xl border border-[#192744]">
        <div className="flex items-start gap-2 text-xs text-slate-300">
          <span className="text-emerald-400 font-bold shrink-0">✓</span>
          <span>Live Open-Meteo weather and rain advisories</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-300">
          <span className="text-emerald-400 font-bold shrink-0">✓</span>
          <span>Wonderla Chennai, MGM Dizzee & Black Thunder data</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-300">
          <span className="text-emerald-400 font-bold shrink-0">✓</span>
          <span>Full candidate date evaluation and FastTrack ROI</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-400 pt-1 border-t border-[#162340]">
          <span className="text-amber-400 font-bold shrink-0">ℹ</span>
          <span>Sign in later anytime to save trips and receive WhatsApp surge alerts.</span>
        </div>
      </div>

      <button
        type="button"
        onClick={continueAsGuest}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
      >
        <span>Start Browsing as Guest</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={loginWithGoogle}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Or 1-click upgrade with Google
        </button>
      </div>
    </div>
  );
};
