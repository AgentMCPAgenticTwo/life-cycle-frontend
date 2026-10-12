import { create } from 'zustand';

/**
 * Holds which contract is open on ContractDetailPage and which tab is active,
 * per the `life-cycle-uc8-uc9` module contract's `contractDetailSlice`.
 */
export const useContractDetailStore = create((set) => ({
  contract: null,
  activeTab: 'Details',

  setContract: (contract) => set({ contract }),
  setActiveTab: (activeTab) => set({ activeTab }),
  clear: () => set({ contract: null, activeTab: 'Details' }),
}));
