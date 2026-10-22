import { create } from "zustand";
import type { ParkSummary } from "../../types/api";
import { apiClient } from "../../services/apiClient";

interface ExploreFilters {
  category: string;
  sortBy: "crowd" | "price" | "rating" | "name";
  crowdLevel: string;
}

interface ExploreState {
  selectedPark: ParkSummary | null;
  searchQuery: string;
  filters: ExploreFilters;

  // Actions
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

export const useExploreStore = create<ExploreState>()((set) => ({
  selectedPark: null,
  searchQuery: "",
  filters: { ...defaultFilters },

  selectPark: (park) => set({ selectedPark: park }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  setFilter: (key, value) =>
    set((s) => ({
      filters: { ...s.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),
}));
