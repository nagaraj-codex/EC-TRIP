import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUIStore } from "../store/slices/uiStore";
import { useAuthStore } from "../store/slices/authStore";
import { Home, Compass, Map, Bell, User, Menu, X, CalendarDays, Settings, Heart, ChevronDown, LogOut, LogIn } from "lucide-react";
import AdvisorChatbot from "../components/chat/AdvisorChatbot";
import QueueCutLogo from "../components/layout/QueueCutLogo";
import { apiClient } from "../services/apiClient";

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
  const { notifications, user, sessionType, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [accountError, setAccountError] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isHomePage = location.pathname === "/app/home";

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

  const handleSignOut = async () => {
    setAccountError("");
    try {
      await apiClient.logout();
      logout();
      setIsAccountMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : "Sign out failed. Please try again.");
    }
  };

  const isDetailPage = Boolean(location.pathname.match(/\/app\/explore\/[^/]+/));

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_45%),linear-gradient(180deg,#f8fbff_0%,#ffffff_18%,#f8fafc_100%)] text-slate-900 flex flex-col">
      <header className={isHomePage
        ? "absolute inset-x-0 top-0 z-40 border-b border-white/15 bg-slate-950/20 text-white backdrop-blur-sm"
        : "sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl"}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/app/home")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            aria-label="QueueCut home"
          >
            <QueueCutLogo tone={isHomePage ? "light" : "dark"} />
          </button>

          <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 p-1 shadow-sm backdrop-blur-sm" aria-label="Primary navigation">
            <button
              type="button"
              onClick={() => navigate("/app/home")}
              className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${isHomePage ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"}`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/explore")}
              className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${activeTabId === "explore" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"}`}
            >
              Explore
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/plan")}
              className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${location.pathname.startsWith("/app/plan") ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"}`}
            >
              Plan a visit
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/saved")}
              className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${location.pathname.startsWith("/app/saved") ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"}`}
            >
              Saved parks
            </button>
            <button
              type="button"
              disabled
              title="QueueCut's park partner portal is not available yet."
              className="cursor-not-allowed rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400"
            >
              List your park
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/trips")}
              className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${activeTabId === "trips" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"}`}
            >
              My trips
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/profile")}
              className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${activeTabId === "profile" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"}`}
            >
              Business
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <span title="INR and English are the currently supported format." className={`hidden whitespace-nowrap text-[11px] font-medium lg:inline ${isHomePage ? "text-white/80" : "text-slate-500"}`}>
              INR · English
            </span>
            <button
              onClick={() => navigate("/app/notifications")}
              className={`relative flex min-h-10 min-w-10 items-center justify-center rounded-full border p-2.5 transition-all ${isHomePage ? "border-white/30 bg-white/10 text-white hover:bg-white/20" : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-700"}`}
              aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {sessionType === "authenticated" ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((open) => !open)}
                  aria-expanded={isAccountMenuOpen}
                  aria-controls="account-menu"
                  className={`flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition-colors ${isHomePage ? "border-white/30 bg-white/10 text-white hover:bg-white/20" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{user?.name?.[0]?.toUpperCase() ?? "U"}</span>
                  <span className="max-w-28 truncate">{user?.name ?? "Account"}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {isAccountMenuOpen && (
                  <div id="account-menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 text-slate-900 shadow-xl">
                    <p className="truncate px-3 py-2 text-xs text-slate-500">{user?.email}</p>
                    {[{ label: "Profile", path: "/app/profile", icon: User }, { label: "Saved parks", path: "/app/saved", icon: Heart }, { label: "Settings", path: "/app/settings", icon: Settings }].map(({ label, path, icon: Icon }) => (
                      <button key={path} type="button" onClick={() => { setIsAccountMenuOpen(false); navigate(path); }} className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500">
                        <Icon className="h-4 w-4" /> {label}
                      </button>
                    ))}
                    <button type="button" onClick={() => void handleSignOut()} className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-blue-500">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                    {accountError && <p role="alert" className="px-3 py-2 text-xs text-red-700">{accountError}</p>}
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => navigate("/login")} className={`hidden min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors md:inline-flex ${isHomePage ? "bg-white text-slate-900 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                <LogIn className="h-4 w-4" /> Sign in
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors md:hidden ${isHomePage ? "border-white/30 bg-white/10 text-white hover:bg-white/20" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <nav id="mobile-navigation-menu" aria-label="Mobile navigation" className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white p-3 text-slate-900 shadow-xl md:hidden">
              {[
                { label: "Explore parks", path: "/app/explore", icon: Compass },
                { label: "Plan a visit", path: "/app/plan", icon: CalendarDays },
                { label: "My trips", path: "/app/trips", icon: Map },
                { label: "Saved parks", path: "/app/saved", icon: Heart },
                { label: "Notifications", path: "/app/notifications", icon: Bell },
                { label: "Profile", path: "/app/profile", icon: User },
                { label: "Settings", path: "/app/settings", icon: Settings },
              ].map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(path);
                  }}
                  className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-700 focus-visible:bg-slate-50"
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
              <button type="button" disabled title="QueueCut's park partner portal is not available yet." className="flex min-h-11 w-full cursor-not-allowed items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-slate-400">
                <Compass className="h-4 w-4" /> List your park · not available
              </button>
              <p className="px-3 py-2 text-[10px] text-slate-500">Currency and language: INR · English</p>
              {sessionType === "authenticated" ? (
                <button type="button" onClick={() => void handleSignOut()} className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:bg-red-50">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              ) : (
                <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate("/login"); }} className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:bg-blue-50">
                  <LogIn className="h-4 w-4" /> Sign in
                </button>
              )}
            </nav>
          )}
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
