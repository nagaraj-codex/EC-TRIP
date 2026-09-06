import React from "react";

interface NotificationSettingsTabProps {
  emailAlerts: boolean;
  setEmailAlerts: (val: boolean) => void;
  whatsappSurge: boolean;
  setWhatsappSurge: (val: boolean) => void;
  weatherFlash: boolean;
  setWeatherFlash: (val: boolean) => void;
  discountAlerts: boolean;
  setDiscountAlerts: (val: boolean) => void;
}

export const NotificationSettingsTab: React.FC<NotificationSettingsTabProps> = ({
  emailAlerts,
  setEmailAlerts,
  whatsappSurge,
  setWhatsappSurge,
  weatherFlash,
  setWeatherFlash,
  discountAlerts,
  setDiscountAlerts,
}) => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
          <div>
            <span className="font-bold text-xs text-white block">Email Itinerary Delivery</span>
            <span className="text-xs text-slate-400">Send PDF & timeline itineraries directly to your email (Resend API)</span>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            className="w-4 h-4 text-brand-500 rounded border-slate-700 bg-slate-900 focus:ring-brand-500 cursor-pointer accent-brand-500"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
          <div>
            <span className="font-bold text-xs text-white block">WhatsApp Crowd Surge Alerts</span>
            <span className="text-xs text-slate-400">Instant notification if top ride wait jumps beyond 35 minutes</span>
          </div>
          <input
            type="checkbox"
            checked={whatsappSurge}
            onChange={(e) => setWhatsappSurge(e.target.checked)}
            className="w-4 h-4 text-brand-500 rounded border-slate-700 bg-slate-900 focus:ring-brand-500 cursor-pointer accent-brand-500"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
          <div>
            <span className="font-bold text-xs text-white block">Open-Meteo Rain Flash Advisory</span>
            <span className="text-xs text-slate-400">Precipitation warning 2 hours before sudden weather shifts</span>
          </div>
          <input
            type="checkbox"
            checked={weatherFlash}
            onChange={(e) => setWeatherFlash(e.target.checked)}
            className="w-4 h-4 text-brand-500 rounded border-slate-700 bg-slate-900 focus:ring-brand-500 cursor-pointer accent-brand-500"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="font-bold text-xs text-white block">Discounts & College Offers</span>
            <span className="text-xs text-slate-400">Track student discounts and weekday promotional ticket price drops</span>
          </div>
          <input
            type="checkbox"
            checked={discountAlerts}
            onChange={(e) => setDiscountAlerts(e.target.checked)}
            className="w-4 h-4 text-brand-500 rounded border-slate-700 bg-slate-900 focus:ring-brand-500 cursor-pointer accent-brand-500"
          />
        </div>
      </div>
    </div>
  );
};
