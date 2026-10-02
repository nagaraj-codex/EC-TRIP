import { create } from "zustand";
import type { ParkSummary } from "../../types/api";
import { apiClient } from "../../services/apiClient";

interface ExploreFilters {
  category: string;
  sortBy: "crowd" | "price" | "rating" | "name";
  crowdLevel: string;
}

interface ExploreState {
  destinations: ParkSummary[];
  selectedPark: ParkSummary | null;
  searchQuery: string;
  filters: ExploreFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadDestinations: () => Promise<void>;
  selectPark: (park: ParkSummary | null) => void;
  setSearchQuery: (q: string) => void;
  setFilter: (key: keyof ExploreFilters, value: string) => void;
  resetFilters: () => void;
}

const defaultFilters: ExploreFilters = {
  category: "all",
  sortBy: "crowd",
  crowdLevel: "all",
};

export const useExploreStore = create<ExploreState>()((set, get) => ({
  destinations: [],
  selectedPark: null,
  searchQuery: "",
  filters: { ...defaultFilters },
  isLoading: false,
  error: null,

  loadDestinations: async () => {
    if (get().destinations.length > 0) return; // Cache hit
    set({ isLoading: true, error: null });
    try {
      const parks = await apiClient.getParks();
      set({ destinations: parks, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load destinations",
        isLoading: false,
      });
    }
  },

  selectPark: (park) => set({ selectedPark: park }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  setFilter: (key, value) =>
    set((s) => ({
      filters: { ...s.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),
}));
