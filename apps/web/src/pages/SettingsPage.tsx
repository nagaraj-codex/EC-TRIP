import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Globe, Moon, Shield, Trash2, Info, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [crowdAlerts, setCrowdAlerts] = useState(true);
  const [priceDrops, setPriceDrops] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        on ? "bg-qc-blue-600" : "bg-slate-200"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="qc-page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <h1 className="font-display font-extrabold text-xl text-slate-900">Settings</h1>
      </motion.div>

      {/* Notification Preferences */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <h2 className="font-display font-bold text-xs text-slate-500 uppercase tracking-wider mb-3 px-1">
          Notifications
        </h2>
        <div className="qc-card-white rounded-2xl divide-y divide-slate-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-qc-blue-500" />
              <div>
                <p className="text-sm text-slate-900">Crowd Alerts</p>
                <p className="text-[11px] text-slate-500">Real-time crowd level notifications</p>
              </div>
            </div>
            <Toggle on={crowdAlerts} onToggle={() => setCrowdAlerts(!crowdAlerts)} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-sm text-slate-900">Price Drops</p>
                <p className="text-[11px] text-slate-500">Savings alerts for tracked parks</p>
              </div>
            </div>
            <Toggle on={priceDrops} onToggle={() => setPriceDrops(!priceDrops)} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-qc-amber-400" />
              <div>
                <p className="text-sm text-slate-900">Weather Alerts</p>
                <p className="text-[11px] text-slate-500">Rain & UV advisories for your trips</p>
              </div>
            </div>
            <Toggle on={weatherAlerts} onToggle={() => setWeatherAlerts(!weatherAlerts)} />
          </div>
        </div>
      </motion.section>

      {/* App Preferences */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="font-display font-bold text-xs text-slate-500 uppercase tracking-wider mb-3 px-1">
          Preferences
        </h2>
        <div className="qc-card-white rounded-2xl divide-y divide-slate-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-qc-blue-400" />
              <div>
                <p className="text-sm text-slate-900">Dark Mode</p>
                <p className="text-[11px] text-slate-500">Use dark theme</p>
              </div>
            </div>
            <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>
          <button className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm text-slate-900">Language</p>
                <p className="text-[11px] text-slate-500">English</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </motion.section>

      {/* About & Data */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <h2 className="font-display font-bold text-xs text-slate-500 uppercase tracking-wider mb-3 px-1">
          About
        </h2>
        <div className="qc-card-white rounded-2xl divide-y divide-slate-100">
          <button className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm text-slate-900">Version</p>
                <p className="text-[11px] text-slate-500">QueueCut v3.0.0</p>
              </div>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm text-slate-900">Privacy Policy</p>
                <p className="text-[11px] text-slate-500">Data handling & security</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </motion.section>

      {/* Danger Zone */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </motion.section>
    </div>
  );
}
