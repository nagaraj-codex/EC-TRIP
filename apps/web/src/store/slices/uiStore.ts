import { create } from "zustand";
import { persist } from "zustand/middleware";

type TabId = "home" | "explore" | "trips" | "profile";

interface UIState {
  hasSeenOnboarding: boolean;
  hasSeenSplash: boolean;
  activeTab: TabId;
  bottomSheetOpen: boolean;
  bottomSheetContent: string | null;
  searchQuery: string;
  theme: "dark" | "light";

  // Actions
  setOnboardingSeen: () => void;
  setSplashSeen: () => void;
  setActiveTab: (tab: TabId) => void;
  openBottomSheet: (content?: string) => void;
  closeBottomSheet: () => void;
  setSearchQuery: (q: string) => void;
  setTheme: (t: "dark" | "light") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      hasSeenSplash: false,
      activeTab: "home",
      bottomSheetOpen: false,
      bottomSheetContent: null,
      searchQuery: "",
      theme: "dark",

      setOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      setSplashSeen: () => set({ hasSeenSplash: true }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      openBottomSheet: (content) =>
        set({ bottomSheetOpen: true, bottomSheetContent: content ?? null }),
      closeBottomSheet: () =>
        set({ bottomSheetOpen: false, bottomSheetContent: null }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: "queuecut-ui",
      partialize: (s) => ({
        hasSeenOnboarding: s.hasSeenOnboarding,
        hasSeenSplash: s.hasSeenSplash,
        theme: s.theme,
      }),
    }
  )
);
