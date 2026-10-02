import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUIStore } from "../store/slices/uiStore";
import { useAuthStore } from "../store/slices/authStore";
import { Home, Compass, Map, Bell, User } from "lucide-react";
import AdvisorChatbot from "../components/chat/AdvisorChatbot";

const tabs = [
  { id: "home"    as const, label: "Home",    icon: Home,    path: "/app/home"    },
  { id: "explore" as const, label: "Explore", icon: Compass, path: "/app/explore" },
  { id: "trips"   as const, label: "Trips",   icon: Map,     path: "/app/trips"   },
  { id: "profile" as const, label: "Profile", icon: User,    path: "/app/profile" },
] as const;

export default function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { setActiveTab }  = useUIStore();
  const { notifications } = useAuthStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const activeTabId = (() => {
    const p = location.pathname;
    if (p.startsWith("/app/home"))    return "home";
    if (p.startsWith("/app/explore")) return "explore";
    if (p.startsWith("/app/trips"))   return "trips";
    if (p.startsWith("/app/profile") || p.startsWith("/app/settings")) return "profile";
    return "home";
  })();

  const handleTabPress = (tab: typeof tabs[number]) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  const isDetailPage = Boolean(location.pathname.match(/\/app\/explore\/[^/]+/));

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_45%),linear-gradient(180deg,#f8fbff_0%,#ffffff_18%,#f8fafc_100%)] text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/app/home")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            aria-label="QueueCut home"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-[0_12px_30px_rgba(37,99,235,0.25)]">
              <span className="text-white text-sm font-black">Q</span>
            </div>
            <span className="font-display font-black text-lg tracking-tight text-slate-900 hidden sm:block">
              Queue<span className="text-blue-600">Cut</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 p-1.5" aria-label="Primary navigation">
            {tabs.slice(0, 3).map((tab) => {
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabPress(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-700 shadow-sm border border-blue-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/app/notifications")}
              className="relative p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-700 transition-all min-h-10 min-w-10 flex items-center justify-center"
              aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/app/profile")}
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 transition-colors"
              aria-label="Profile"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

      {!isDetailPage && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/90 backdrop-blur-xl"
          style={{
            paddingBottom: "max(8px, env(safe-area-inset-bottom))",
            height: "var(--bottom-nav-height)",
            boxShadow: "0 -12px 32px rgba(15,23,42,0.08)",
          }}
          role="tablist"
          aria-label="Main navigation"
        >
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabPress(tab)}
                className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all duration-200 min-h-11 relative ${
                  isActive ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-5 h-0.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </nav>
      )}

      <AdvisorChatbot />
    </div>
  );
}
