import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/slices/authStore";
import { motion } from "framer-motion";
import {
  Settings, ChevronRight, MapPin, Mail, Calendar,
  Shield, LogOut, Map, Bell, Heart
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isGuest, savedTrips, notifications, logout, openAuthModal } = useAuthStore();

  if (isGuest) {
    return (
      <div className="qc-page flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="font-display font-bold text-lg text-slate-900">Guest Explorer</h2>
          <p className="text-slate-500 text-sm max-w-xs">
            Sign in to save trips, receive alerts, and personalize your experience.
          </p>
          <button
            onClick={() => openAuthModal("Sign in to access your profile", "signin")}
            className="btn-blue-primary mx-auto"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  const stats = [
    { label: "Trips", value: savedTrips.length, icon: Map },
    { label: "Alerts", value: notifications.length, icon: Bell },
    { label: "Parks", value: new Set(savedTrips.map((t) => t.parkId)).size || 1, icon: Heart },
  ];

  const menuItems = [
    { label: "Notification Preferences", icon: Bell, action: () => navigate("/app/settings") },
    { label: "App Settings", icon: Settings, action: () => navigate("/app/settings") },
    { label: "Privacy & Data", icon: Shield, action: () => navigate("/app/settings") },
  ];

  return (
    <div className="qc-page">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-6 pt-4"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-qc-blue-200 mb-3">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-qc-blue-50 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-qc-blue-600">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
        </div>
        <h1 className="font-display font-extrabold text-xl text-slate-900">{user?.name}</h1>
        <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
          <Mail className="w-3 h-3" /> {user?.email}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {user?.homeCity && (
            <span className="qc-chip-neutral text-[10px] text-slate-700">
              <MapPin className="w-2.5 h-2.5" /> {user.homeCity}
            </span>
          )}
          <span className="qc-chip-neutral text-[10px] text-slate-700">
            <Calendar className="w-2.5 h-2.5" /> Since {memberSince}
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="qc-card-white rounded-xl p-3 text-center">
              <Icon className="w-4 h-4 text-qc-blue-500 mx-auto mb-1.5" />
              <p className="font-display font-bold text-lg text-slate-900">{stat.value}</p>
              <p className="text-slate-500 text-[10px]">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Menu items */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-1 mb-6"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          );
        })}
      </motion.div>

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
