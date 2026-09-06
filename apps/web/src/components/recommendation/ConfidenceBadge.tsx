import React, { useState } from "react";
import { ShieldCheck, AlertCircle, Info, X } from "lucide-react";

interface Props {
  confidence: "High" | "Medium" | "Low";
  reasoning: string;
}

const styles = {
  High: "bg-emerald-50 text-emerald-700 border border-emerald-300",
  Medium: "bg-amber-50 text-amber-700 border border-amber-300",
  Low: "bg-rose-50 text-rose-700 border border-rose-300",
};

const icons = {
  High: ShieldCheck,
  Medium: Info,
  Low: AlertCircle,
};

export default function ConfidenceBadge({ confidence, reasoning }: Props) {
  const [open, setOpen] = useState(false);
  const Icon = icons[confidence] || Info;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-98 ${styles[confidence]}`}
        aria-label={`Prediction Confidence: ${confidence}. Click for explanation.`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{confidence} Confidence</span>
        <span className="opacity-60 text-[10px] bg-black/10 px-1 py-0.2 rounded">?</span>
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute right-0 bottom-full mb-2 w-72 bg-[#0b1326] text-slate-100 shadow-2xl rounded-2xl border border-[#1d2a48] p-3.5 text-xs z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700">
            <span className="font-extrabold text-white flex items-center gap-1.5 text-xs">
              <Icon className="w-3.5 h-3.5 text-brand-400" />
              <span>{confidence} Confidence Rating</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {reasoning || "Derived from verified 2026 ground-truth tariff, Open-Meteo live weather radar, and public holiday calendars."}
          </p>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex items-center gap-1">
            <span>🛡️ Calibrated by QueueCut Signal Engine</span>
          </div>
        </div>
      )}
    </div>
  );
}
