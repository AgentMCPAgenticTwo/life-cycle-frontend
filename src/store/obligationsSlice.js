import { create } from 'zustand';

/**
 * Holds the obligations list and renewal panel data for the open contract, per
 * the `life-cycle-uc8-uc9` module contract's `obligationsSlice`.
 */
export const useObligationsStore = create((set) => ({
  obligations: [],
  renewal: null,

  setObligations: (obligations) => set({ obligations }),
  updateObligation: (obligation) =>
    set((state) => ({
      obligations: state.obligations.map((item) =>
        item.obligationId === obligation.obligationId ? obligation : item
      ),
    })),
  setRenewal: (renewal) => set({ renewal }),
  clear: () => set({ obligations: [], renewal: null }),
}));
