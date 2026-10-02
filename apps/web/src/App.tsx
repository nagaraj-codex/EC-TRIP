import { Routes, Route, Navigate } from "react-router-dom";
import { useUIStore } from "./store/slices/uiStore";
import { useAuthStore } from "./store/slices/authStore";

// Layouts
import AppShell from "./layouts/AppShell";

// Entry pages
import SplashPage from "./pages/SplashPage";
import OnboardingPage from "./pages/OnboardingPage";
import LoginPage from "./pages/LoginPage";

// Core app pages
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import TripsPage from "./pages/TripsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PlanMyVisitPage from "./pages/PlanMyVisitPage";

// Global overlays
import NotificationToasts from "./components/notifications/NotificationToasts";

/**
 * AppGuard: Protects /app/* routes.
 * If no session has been chosen (user hasn't gone through auth/onboarding flow),
 * redirect them to the correct entry point instead of silently landing as guest.
 */
function AppGuard({ children }: { children: React.ReactNode }) {
  const { hasSeenOnboarding, hasSeenSplash } = useUIStore();
  const { sessionType } = useAuthStore();

  // If they haven't seen the splash yet, send to root
  if (!hasSeenSplash) {
    return <Navigate to="/" replace />;
  }
  // If they haven't completed onboarding, send there
  if (!hasSeenOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  // If they haven't chosen a session type (neither authenticated nor guest), send to login
  if (sessionType === "none") {
    return <Navigate to="/login" replace />;
  }
  // Authenticated or guest — allow through
  return <>{children}</>;
}

export default function App() {
  const { hasSeenSplash, hasSeenOnboarding } = useUIStore();
  const { sessionType } = useAuthStore();

  return (
    <>
      <Routes>
        {/* Entry flow */}
        <Route
          path="/"
          element={
            !hasSeenSplash ? (
              <SplashPage />
            ) : !hasSeenOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : sessionType !== "none" ? (
              <Navigate to="/app/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Main app shell — guarded */}
        <Route
          path="/app"
          element={
            <AppGuard>
              <AppShell />
            </AppGuard>
          }
        >
          <Route index element={<Navigate to="/app/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="explore/:parkId" element={<DestinationDetailPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="plan" element={<PlanMyVisitPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating notification toasts (global) */}
      <NotificationToasts />
    </>
  );
}
