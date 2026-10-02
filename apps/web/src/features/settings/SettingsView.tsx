import React, { useState } from "react";
import {
  User as UserIcon,
  Bell,
  Shield,
  Sliders,
  LogOut,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "../../store/slices/authStore";
import { ProfileSettingsTab } from "./components/ProfileSettingsTab";
import { NotificationSettingsTab } from "./components/NotificationSettingsTab";
import { TelemetrySecurityTab } from "./components/TelemetrySecurityTab";
import { apiClient } from "../../services/apiClient";

export default function SettingsView() {
  const { user, isGuest, logout, openAuthModal } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "notifications" | "security">("profile");

  const [preferredPark, setPreferredPark] = useState(user?.preferredPark || "wonderla-chennai");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappSurge, setWhatsappSurge] = useState(true);
  const [weatherFlash, setWeatherFlash] = useState(true);
  const [discountAlerts, setDiscountAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavedSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = async () => {
    const exportPayload = {
      user: user || "Guest",
      timestamp: new Date().toISOString(),
      app: "QueueCut v1.0.0",
      settings: {
        preferredPark,
        emailAlerts,
        whatsappSurge,
        weatherFlash,
        discountAlerts,
      },
    };
    try {
      const blob = await apiClient.exportData(exportPayload);
      const downloadUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = downloadUrl;
      downloadAnchor.download = `queuecut_telemetry_${Date.now()}.json`;
      downloadAnchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = dataUrl;
      downloadAnchor.download = `queuecut_telemetry_${Date.now()}.json`;
      downloadAnchor.click();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Account & App Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile, live wait notifications, and telemetry preferences.
          </p>
        </div>

        {isGuest ? (
          <button
            onClick={() => openAuthModal("Sign in to sync your profile and alerts across all your devices", "signin")}
            className="btn btn-primary sm:w-auto px-4 py-2 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sign In with Google</span>
          </button>
        ) : (
          <button
            onClick={logout}
            className="btn btn-secondary sm:w-auto px-4 py-2 text-rose-400 hover:text-rose-300 text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "profile"
              ? "border-brand-500 text-brand-300 bg-brand-500/10 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Bio</span>
        </button>

        <button
          onClick={() => setActiveTab("preferences")}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "preferences"
              ? "border-brand-500 text-brand-300 bg-brand-500/10 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Park Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "notifications"
              ? "border-brand-500 text-brand-300 bg-brand-500/10 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "security"
              ? "border-brand-500 text-brand-300 bg-brand-500/10 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Privacy & Security</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Settings successfully synchronized and stored!</span>
        </div>
      )}

      {activeTab === "profile" && <ProfileSettingsTab onSaved={handleSavedSuccess} />}

      {activeTab === "preferences" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <label className="form-label">Default Theme Park</label>
            <select
              value={preferredPark}
              onChange={(e) => setPreferredPark(e.target.value)}
              className="form-input"
            >
              <option value="wonderla-chennai">Wonderla Amusement Park (Chennai)</option>
              <option value="mgm-dizzee-chennai">MGM Dizzee World (Chennai)</option>
              <option value="black-thunder-coimbatore">Black Thunder Water Theme Park (Coimbatore)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="font-bold text-xs text-white block">Currency & Units</span>
              <span className="text-xs text-slate-400 block mt-1">₹ INR (Indian Rupee) • Celsius (°C)</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="font-bold text-xs text-white block">Pricing Baseline</span>
              <span className="text-xs text-slate-400 block mt-1">Official 2026 Verified Rates</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <NotificationSettingsTab
          emailAlerts={emailAlerts}
          setEmailAlerts={setEmailAlerts}
          whatsappSurge={whatsappSurge}
          setWhatsappSurge={setWhatsappSurge}
          weatherFlash={weatherFlash}
          setWeatherFlash={setWeatherFlash}
          discountAlerts={discountAlerts}
          setDiscountAlerts={setDiscountAlerts}
        />
      )}

      {activeTab === "security" && (
        <TelemetrySecurityTab onExportData={handleExportData} />
      )}
    </div>
  );
}
