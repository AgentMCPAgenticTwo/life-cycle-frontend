import { create } from 'zustand';

/**
 * Holds the Contract Repository screen's active filters and last search
 * results, per the `life-cycle-uc8-uc9` module contract's `contractRepositorySlice`.
 */
export const useContractRepositoryStore = create((set) => ({
  filters: {},
  results: [],
  totalCount: 0,
  isEmptyState: false,
  isLoading: true,
  error: null,

  setFilters: (filters) => set({ filters }),
  setResults: (results, totalCount) => set({ results, totalCount }),
  clearFilters: () => set({ filters: {} }),
  setEmptyState: (isEmptyState) => set({ isEmptyState }),
}));
