import { useState } from "react";
import { usePlannerStore } from "./store/slices/plannerStore";
import { useAuthStore } from "./store/slices/authStore";
import TopBar from "./components/layout/TopBar";
import Sidebar from "./components/layout/Sidebar";
import NotificationToasts from "./components/notifications/NotificationToasts";
import AuthModal from "./features/auth/AuthModal";

// Wizard screens
import LandingScreen from "./features/wizard/LandingScreen";
import Step1Park from "./features/wizard/Step1Park";
import Step2Dates from "./features/wizard/Step2Dates";
import Step3Group from "./features/wizard/Step3Group";
import Step4Budget from "./features/wizard/Step4Budget";
import RecommendationScreen from "./features/results/RecommendationScreen";
import ItineraryScreen from "./features/itinerary/ItineraryScreen";

// Main feature views
import ParksView from "./features/parks/ParksView";
import CrowdCalendarView from "./features/calendar/CrowdCalendarView";
import SavedTripsView from "./features/trips/SavedTripsView";
import SettingsView from "./features/settings/SettingsView";

import { Compass, MapPin, Calendar, Bookmark, Settings as SettingsIcon } from "lucide-react";

export default function App() {
  const { currentScreen, setScreen, setDates, setParkId } = usePlannerStore();
  const { isGuest, openAuthModal } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<"planner" | "parks" | "calendar" | "saved-trips" | "settings">("planner");

  const handleNavigate = (view: string) => {
    if (view === "landing" || view === "planner") {
      setActiveView("planner");
      setScreen("landing");
    } else if (view === "parks") {
      setActiveView("parks");
    } else if (view === "calendar") {
      setActiveView("calendar");
    } else if (view === "saved-trips") {
      if (isGuest) {
        openAuthModal("Sign in to access and sync your saved itineraries across devices", "signin");
        return;
      }
      setActiveView("saved-trips");
    } else if (view === "alerts") {
      if (isGuest) {
        openAuthModal("Sign in to configure live SMS and WhatsApp crowd alerts", "signin");
        return;
      }
      setActiveView("settings");
    } else if (view === "settings") {
      setActiveView("settings");
    }
  };

  const handlePlanTripFromPark = (parkId: string) => {
    setParkId(parkId);
    setActiveView("planner");
    setScreen("step2");
  };

  const handleSelectDateFromCalendar = (date: string) => {
    setDates([date]);
    setActiveView("planner");
    setScreen("step3");
  };

  const renderWizardScreen = () => {
    switch (currentScreen) {
      case "landing":
        return <LandingScreen />;
      case "step1":
        return <Step1Park />;
      case "step2":
        return <Step2Dates />;
      case "step3":
        return <Step3Group />;
      case "step4":
        return <Step4Budget />;
      case "recommendation":
        return <RecommendationScreen />;
      case "itinerary":
        return <ItineraryScreen />;
      default:
        return <LandingScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-brand-500 selection:text-white">
      {/* Top Bar with Brand, Notifications & User/Guest State */}
      <TopBar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={handleNavigate}
      />

      {/* Collapsible Sidebar Navigation Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8">
        {activeView === "planner" && (
          <div className="flex justify-center">
            <div className="w-full max-w-lg glass-panel rounded-3xl min-h-[580px] shadow-2xl p-5 sm:p-7 relative animate-in fade-in duration-200">
              {renderWizardScreen()}
            </div>
          </div>
        )}

        {activeView === "parks" && (
          <div className="animate-in fade-in duration-200">
            <ParksView onPlanTrip={handlePlanTripFromPark} />
          </div>
        )}

        {activeView === "calendar" && (
          <div className="animate-in fade-in duration-200">
            <CrowdCalendarView onSelectDate={handleSelectDateFromCalendar} />
          </div>
        )}

        {activeView === "saved-trips" && (
          <div className="animate-in fade-in duration-200">
            <SavedTripsView
              onViewItinerary={() => {
                setActiveView("planner");
                setScreen("itinerary");
              }}
              onPlanNew={() => {
                setActiveView("planner");
                setScreen("step1");
              }}
            />
          </div>
        )}

        {activeView === "settings" && (
          <div className="animate-in fade-in duration-200">
            <SettingsView />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/90 sm:hidden flex items-center justify-around py-2 px-1">
        <button
          onClick={() => handleNavigate("planner")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeView === "planner" ? "text-brand-400 font-bold" : "text-slate-400"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Planner</span>
        </button>

        <button
          onClick={() => handleNavigate("parks")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeView === "parks" ? "text-brand-400 font-bold" : "text-slate-400"
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px]">Parks</span>
        </button>

        <button
          onClick={() => handleNavigate("calendar")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeView === "calendar" ? "text-brand-400 font-bold" : "text-slate-400"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Calendar</span>
        </button>

        <button
          onClick={() => handleNavigate("saved-trips")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeView === "saved-trips" ? "text-brand-400 font-bold" : "text-slate-400"
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px]">Trips</span>
        </button>

        <button
          onClick={() => handleNavigate("settings")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeView === "settings" ? "text-brand-400 font-bold" : "text-slate-400"
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </nav>

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Floating Notification Popups */}
      <NotificationToasts />
    </div>
  );
}
