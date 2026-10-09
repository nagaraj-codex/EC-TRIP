import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUIStore } from "./store/slices/uiStore";
import { useAuthStore } from "./store/slices/authStore";
import { apiClient } from "./services/apiClient";

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
import SavedParksPage from "./pages/SavedParksPage";

// Global overlays
import { ToastContainer } from "./components/ui/Toast";

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

  useEffect(() => {
    // If the client state indicates an active account session, verify it with the backend
    if (sessionType === "authenticated") {
      apiClient.me()
        .then(({ user }) => {
          useAuthStore.getState().setAuthenticatedUser(user);
        })
        .catch(() => {
          // Session cookie expired or revoked on backend: reset session state cleanly
          useAuthStore.getState().logout();
        });
    }
  }, [sessionType]);

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
          <Route path="compare" element={<PlanMyVisitPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="saved" element={<SavedParksPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="plan" element={<PlanMyVisitPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating notification toasts (global) */}
      <ToastContainer />
    </>
  );
}
