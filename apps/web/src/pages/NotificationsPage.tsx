import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/slices/authStore";
import { apiClient } from "../services/apiClient";
import { motion } from "framer-motion";
import { Bell, BellOff, CloudSun, Zap, Tag, Sparkles, Gift, Map, Check } from "lucide-react";

const filterTabs = ["All", "Crowd Alerts", "Price Drops", "Weather"] as const;

const iconMap: Record<string, React.ReactNode> = {
  crowd:   <Zap className="w-4 h-4 text-qc-blue-500" />,
  weather: <CloudSun className="w-4 h-4 text-qc-amber-400" />,
  price:   <Tag className="w-4 h-4 text-emerald-500" />,
  system:  <Sparkles className="w-4 h-4 text-qc-blue-500" />,
  offer:   <Gift className="w-4 h-4 text-qc-amber-400" />,
  trip:    <Map className="w-4 h-4 text-qc-blue-500" />,
};

export default function NotificationsPage() {
  const { sessionType } = useAuthStore();
  const [notifications, setNotifications] = useState<ReturnType<typeof useAuthStore.getState>["notifications"]>([]);
  const [isLoading, setIsLoading] = useState(sessionType === "authenticated");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionType !== "authenticated") {
      setIsLoading(false);
      return;
    }
    apiClient.getNotifications()
      .then(({ data }) => setNotifications(data.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: "system" as const,
        time: notification.created_at,
        read: notification.read,
      }))))
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setIsLoading(false));
  }, [sessionType]);

  const [activeFilter, setActiveFilter] = useState<(typeof filterTabs)[number]>("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (id: string) => {
    void apiClient.markNotificationRead(id).then(() => {
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    });
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Crowd Alerts") return n.type === "crowd";
    if (activeFilter === "Price Drops") return n.type === "price";
    if (activeFilter === "Weather") return n.type === "weather";
    return true;
  });

  if (isLoading) {
    return <div className="qc-page text-sm text-slate-500">Loading notifications...</div>;
  }

  if (error) {
    return <div className="qc-page text-sm text-red-500">Notifications could not be loaded. {error}</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="qc-page flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <BellOff className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="font-display font-bold text-lg text-slate-900">All caught up!</h2>
          <p className="text-slate-500 text-sm">No notifications right now.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="qc-page">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display font-extrabold text-xl text-slate-900">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={() => {
                void apiClient.markAllNotificationsRead().then(() => {
                  setNotifications((items) => items.map((item) => ({ ...item, read: true })));
                });
              }}
              className="text-xs text-qc-blue-600 font-medium flex items-center gap-1 hover:text-qc-blue-700"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>
        <p className="text-slate-500 text-xs mb-4">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4 -mx-4 px-4">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
              activeFilter === tab
                ? "bg-qc-blue-50 text-qc-blue-600 border-qc-blue-200"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.map((notif, idx) => (
          <motion.button
            key={notif.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => markNotificationRead(notif.id)}
            className={`w-full text-left qc-card-white rounded-xl p-3.5 flex gap-3 ${
              !notif.read ? "border-l-2 border-l-qc-blue-500" : "opacity-70"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              {iconMap[notif.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`text-xs font-semibold truncate ${!notif.read ? "text-slate-900" : "text-slate-600"}`}>
                  {notif.title}
                </h3>
                {notif.badge && (
                  <span className="qc-badge bg-slate-100 text-slate-500 shrink-0">{notif.badge}</span>
                )}
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
              <p className="text-slate-400 text-[10px] mt-1">{notif.time}</p>
            </div>
            {!notif.read && (
              <div className="w-2 h-2 rounded-full bg-qc-blue-500 shrink-0 mt-1" />
            )}
          </motion.button>
        ))}
      </div>

    </div>
  );
}
