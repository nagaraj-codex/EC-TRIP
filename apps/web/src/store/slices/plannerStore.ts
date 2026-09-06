import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecommendationResponse } from "../../types/api";

type ScreenId =
  | "landing"
  | "step1"
  | "step2"
  | "step3"
  | "step4"
  | "recommendation"
  | "itinerary"
  | "auth-signup"
  | "auth-email"
  | "settings";

export type Priority = "cheapest" | "least_crowded" | "balanced" | "max_rides" | "Cheapest" | "Least Crowded" | "Best Balanced" | "Maximum Rides";

interface PlannerState {
  currentScreen: ScreenId;
  parkId: string;
  candidateDates: string[];
  adults: number;
  children612: number;
  children05: number;
  groupType: string;
  budget: number;
  priority: Priority;
  isLoggedIn: boolean;
  activeRecommendation: RecommendationResponse | null;
  isLoading: boolean;
  error: string | null;

  setScreen: (id: ScreenId) => void;
  goBack: () => void;
  setParkId: (id: string) => void;
  setDates: (dates: string[]) => void;
  addDate: (date: string) => void;
  removeDate: (date: string) => void;
  updateCounter: (type: "adults" | "children612" | "children05", delta: number) => void;
  setGroupType: (t: string) => void;
  setBudget: (b: number) => void;
  setPriority: (p: Priority) => void;
  setRecommendation: (r: RecommendationResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  login: () => void;
  logout: () => void;
  reset: () => void;
}

const initialState = {
  currentScreen: "landing" as ScreenId,
  parkId: "wonderla-chennai",
  candidateDates: [] as string[],
  adults: 2,
  children612: 1,
  children05: 0,
  groupType: "family",
  budget: 3000,
  priority: "least_crowded" as Priority,
  isLoggedIn: false,
  activeRecommendation: null,
  isLoading: false,
  error: null,
};

const historyMap: Record<string, ScreenId> = {
  step1: "landing",
  step2: "step1",
  step3: "step2",
  step4: "step3",
  recommendation: "step4",
  itinerary: "recommendation",
  "auth-signup": "landing",
  "auth-email": "landing",
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setScreen: (id) => set({ currentScreen: id }),
      goBack: () => {
        const s = get();
        if (s.currentScreen === "settings") {
          set({ currentScreen: s.isLoggedIn ? "recommendation" : "landing" });
          return;
        }
        const prev = historyMap[s.currentScreen];
        if (prev) set({ currentScreen: prev });
      },
      setParkId: (id) => set({ parkId: id, activeRecommendation: null }),
      setDates: (dates) => set({ candidateDates: dates }),
      addDate: (date) =>
        set((s) => ({
          candidateDates: s.candidateDates.includes(date)
            ? s.candidateDates
            : [...s.candidateDates, date].slice(0, 5),
        })),
      removeDate: (date) =>
        set((s) => ({
          candidateDates: s.candidateDates.filter((d) => d !== date),
        })),
      updateCounter: (type, delta) => set((s) => ({ [type]: Math.max(0, s[type] + delta) })),
      setGroupType: (t) => set({ groupType: t }),
      setBudget: (b) => set({ budget: b }),
      setPriority: (p) => set({ priority: p }),
      setRecommendation: (r) => set({ activeRecommendation: r }),
      setLoading: (v) => set({ isLoading: v }),
      setError: (e) => set({ error: e }),
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: "queuecut-planner",
      partialize: (s: PlannerState) => ({
        currentScreen: s.currentScreen,
        parkId: s.parkId,
        candidateDates: s.candidateDates,
        adults: s.adults,
        children612: s.children612,
        children05: s.children05,
        groupType: s.groupType,
        budget: s.budget,
        priority: s.priority,
        isLoggedIn: s.isLoggedIn,
        activeRecommendation: s.activeRecommendation,
      }),
    }
  )
);
