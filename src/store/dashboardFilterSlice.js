import { create } from 'zustand';

// Shape matches the dashboardFilterSlice contract exactly: contractType,
// department, counterpartyId, ownerId, dateRangeStart, dateRangeEnd.
const EMPTY_FILTERS = {
  contractType: null,
  department: null,
  counterpartyId: null,
  ownerId: null,
  dateRangeStart: null,
  dateRangeEnd: null,
};

/**
 * Holds the Dashboard's filter bar state. The top-level fields are the
 * in-progress (not-yet-applied) selections so a no-match result (UC1-AF-004)
 * can retain what the user picked; `appliedFilters` is the committed snapshot
 * the dashboard's hooks actually fetch against.
 */
export const useDashboardFilterStore = create((set) => ({
  ...EMPTY_FILTERS,
  appliedFilters: EMPTY_FILTERS,

  setFilter: (key, value) => set({ [key]: value }),

  applyFilters: () =>
    set((state) => ({
      appliedFilters: {
        contractType: state.contractType,
        department: state.department,
        counterpartyId: state.counterpartyId,
        ownerId: state.ownerId,
        dateRangeStart: state.dateRangeStart,
        dateRangeEnd: state.dateRangeEnd,
      },
    })),

  clearFilters: () => set({ ...EMPTY_FILTERS, appliedFilters: { ...EMPTY_FILTERS } }),
}));
