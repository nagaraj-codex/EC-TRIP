import { Outlet } from "react-router-dom";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { ErrorBoundary } from "../components/ErrorBoundary";
import AdvisorChatbot from "../components/chat/AdvisorChatbot";

export default function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col bg-(--qc-bg)">
      <Header />
      <ErrorBoundary>
        <main id="main" className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 flex flex-col">
          <Outlet />
        </main>
      </ErrorBoundary>
      <Footer />
      <AdvisorChatbot />
    </div>
  );
}
