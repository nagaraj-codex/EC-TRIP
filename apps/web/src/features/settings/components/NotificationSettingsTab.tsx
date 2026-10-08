import { Bell, CheckCircle2, CircleSlash, Mail, CloudSun } from "lucide-react";

export function NotificationSettingsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 border-b border-slate-800/80 py-3">
        <Bell className="mt-0.5 h-4 w-4 text-emerald-400" />
        <div>
          <p className="text-xs font-bold text-white">In-app account notifications</p>
          <p className="mt-1 text-xs text-slate-400">Available for notifications delivered by the QueueCut account service.</p>
        </div>
        <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" aria-label="Available" />
      </div>
      <div className="flex items-start gap-3 border-b border-slate-800/80 py-3">
        <Mail className="mt-0.5 h-4 w-4 text-blue-300" />
        <div>
          <p className="text-xs font-bold text-white">Email itinerary delivery</p>
          <p className="mt-1 text-xs text-slate-400">Email is sent only when you request itinerary delivery; recurring email alerts are not configured.</p>
        </div>
        <CircleSlash className="ml-auto h-4 w-4 text-slate-500" aria-label="No recurring email alert provider" />
      </div>
      <div className="flex items-start gap-3 border-b border-slate-800/80 py-3">
        <CloudSun className="mt-0.5 h-4 w-4 text-amber-300" />
        <div>
          <p className="text-xs font-bold text-white">Weather advisories</p>
          <p className="mt-1 text-xs text-slate-400">Forecasts are available in park details; push or scheduled weather alerts are not configured.</p>
        </div>
        <CircleSlash className="ml-auto h-4 w-4 text-slate-500" aria-label="Push alerts unavailable" />
      </div>
      <p className="pt-2 text-xs text-slate-500">WhatsApp and recurring price/crowd alerts are unavailable because no delivery provider is configured.</p>
    </div>
  );
}
