import {
  Compass,
  Calendar,
  Bookmark,
  Bell,
  Settings,
  X,
  Lock,
  LogOut,
  MapPin,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useAuthStore } from "../../store/slices/authStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ isOpen, onClose, activeView, onNavigate }: SidebarProps) {
  const { user, isGuest, savedTrips, openAuthModal, logout } = useAuthStore();

  const handleNavClick = (viewId: string, isGated = false, gateReason = "") => {
    onClose();
    if (isGated && isGuest) {
      openAuthModal(gateReason, "signin");
      return;
    }
    onNavigate(viewId);
  };

  const navItems = [
    {
      id: "planner",
      label: "Trip Planner Wizard",
      icon: Compass,
      description: "Find your optimal visiting date",
      gated: false
    },
    {
      id: "parks",
      label: "Parks & Live Queues",
      icon: MapPin,
      description: "Wonderla, MGM & Black Thunder",
      gated: false
    },
    {
      id: "calendar",
      label: "Crowd Calendar",
      icon: Calendar,
      description: "7-day forecast & rate heatmap",
      gated: false
    },
    {
      id: "saved-trips",
      label: "My Saved Trips",
      icon: Bookmark,
      description: "Access customized itineraries",
      badge: savedTrips.length > 0 ? `${savedTrips.length}` : undefined,
      gated: true,
      gateReason: "Sign in to save and access your customized theme park itineraries"
    },
    {
      id: "alerts",
      label: "Crowd & Price Alerts",
      icon: Bell,
      description: "Instant rain & surge alerts",
      gated: true,
      gateReason: "Sign in to activate SMS & WhatsApp price drop and crowd surge alerts"
    },
    {
      id: "settings",
      label: "Settings & Preferences",
      icon: Settings,
      description: "Profile, privacy & data",
      gated: false
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 sm:w-80 bg-slate-900 border-r border-slate-800 z-50 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header in Drawer */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-glow-brand">
                🎢
              </div>
              <span className="font-black text-base tracking-tight text-white">
                QueueCut
              </span>
              <span className="text-[9px] uppercase font-extrabold bg-brand-500/20 text-brand-300 border border-brand-400/30 px-1.5 py-0.5 rounded">
                Navigation
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Explore & Tools
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isLocked = item.gated && isGuest;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.gated, item.gateReason)}
                  className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-start justify-between group ${
                    isActive
                      ? "bg-brand-950/70 border border-brand-500/40 text-brand-300 font-bold shadow-glow-brand"
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 transition-colors ${
                        isActive
                          ? "bg-brand-600 text-white shadow-md"
                          : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5 text-white">
                        {item.label}
                        {isLocked && <Lock className="w-3 h-3 text-amber-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-1">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card / Guest Promo */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          {user && !isGuest ? (
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`
                  }
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-brand-500/30"
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-brand-950 via-slate-900 to-indigo-950 p-3.5 rounded-2xl text-white border border-brand-500/30 shadow-glow-brand">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-300">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Guest Browsing Active</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Sign in to save customized itineraries and unlock instant WhatsApp alerts.
              </p>
              <button
                onClick={() => {
                  onClose();
                  openAuthModal("Sign in to save trips and sync across your devices", "signin");
                }}
                className="btn btn-primary text-xs py-2 mt-2.5 font-bold"
              >
                <span>Sign In with Google</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
