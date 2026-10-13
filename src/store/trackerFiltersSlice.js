import { create } from 'zustand';

// Shape matches the trackerFiltersSlice contract exactly. Per UC10-BR-013 the
// Tracker has no persisted object state of its own -- Period, filters and Tab
// all reset to their defaults every time the screen is (re)opened.
const DEFAULTS = {
  period: 'Weekly',
  contractTypeFilter: 'All',
  ownerFilter: 'All',
  dateRangeFrom: null,
  dateRangeTo: null,
  activeTab: 'ownership',
};

export const useTrackerFiltersStore = create((set) => ({
  ...DEFAULTS,

  setPeriod: (period) => set({ period }),
  setContractTypeFilter: (contractTypeFilter) => set({ contractTypeFilter }),
  setOwnerFilter: (ownerFilter) => set({ ownerFilter }),
  setDateRange: (dateRangeFrom, dateRangeTo) => set({ dateRangeFrom, dateRangeTo }),
  setActiveTab: (activeTab) => set({ activeTab }),
  resetOnOpen: () => set({ ...DEFAULTS }),
}));
