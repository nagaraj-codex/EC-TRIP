import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Menu,
  ChevronDown,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  MapPin,
  CheckCircle2,
  BookmarkCheck,
  ShieldCheck
} from "lucide-react";
import { useAuthStore } from "../../store/slices/authStore";
import { usePlannerStore } from "../../store/slices/plannerStore";

interface TopBarProps {
  onToggleSidebar: () => void;
  onNavigate: (view: string) => void;
}

const parks = [
  { id: "wonderla-chennai", name: "Wonderla Chennai", status: "Open • Live Queues" },
  { id: "mgm-dizzee-chennai", name: "MGM Dizzee World", status: "Open • Normal" },
  { id: "black-thunder-coimbatore", name: "Black Thunder", status: "Open • Low" },
];

export default function TopBar({ onToggleSidebar, onNavigate }: TopBarProps) {
  const { user, isGuest, notifications, markAllNotificationsRead, openAuthModal, logout } = useAuthStore();
  const { parkId, setParkId } = usePlannerStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [parkDropdownOpen, setParkDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const parkRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentPark = parks.find((p) => p.id === parkId) || parks[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (parkRef.current && !parkRef.current.contains(event.target as Node)) {
        setParkDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/90 shadow-glass">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-500 text-white flex items-center justify-center text-xl shadow-glow-brand group-hover:scale-105 transition-transform">
              🎢
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-brand-300 transition-colors">
                  QueueCut
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/30 rounded-md">
                  AI Hub
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Park Switcher Dropdown */}
        <div className="relative hidden md:block" ref={parkRef}>
          <button
            onClick={() => setParkDropdownOpen(!parkDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-850 text-xs font-semibold text-slate-200 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span>{currentPark.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {parkDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                Select Active Park
              </div>
              {parks.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setParkId(p.id);
                    setParkDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    parkId === p.id
                      ? "bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30"
                      : "text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <div>
                    <div>{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.status}</div>
                  </div>
                  {parkId === p.id && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions: Notifications & User / Guest Pill */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Notification Bell with Dropdown Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-glow-amber">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">Notifications & Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-400/30 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-brand-400 font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80 mt-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-xl transition-colors ${
                          notif.read ? "bg-slate-900/60 hover:bg-slate-800/60" : "bg-brand-950/40 hover:bg-brand-950/60 border border-brand-500/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white flex-1">
                            {notif.title}
                          </span>
                          {notif.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">
                              {notif.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-1.5">{notif.time}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400">
                    Auto-synced with Open-Meteo & Park Telemetry
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Guest State */}
          {user && !isGuest ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full hover:bg-slate-800 bg-slate-900 border border-slate-800 transition-all group"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/40"
                />
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline-block max-w-[90px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 border-b border-slate-800">
                    <div className="font-bold text-xs text-white truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified Member
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate("saved-trips");
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                    >
                      <BookmarkCheck className="w-4 h-4 text-brand-400" />
                      My Saved Trips
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate("settings");
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      Settings & Preferences
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                <UserIcon className="w-3 h-3" />
                Guest Mode
              </span>
              <button
                onClick={() => openAuthModal("Sign in to save trips, track prices and access personalized crowd advice", "signin")}
                className="btn btn-primary sm:w-auto px-4 py-1.5 text-xs font-bold shadow-glow-brand"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
