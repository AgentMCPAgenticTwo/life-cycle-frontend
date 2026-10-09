import { create } from 'zustand';

// Shape matches the clauseAnalysisSlice contract: contractId, clauses,
// overallContractRiskScore, metadata, proceedToNegotiationEnabled.
export const useClauseAnalysisStore = create((set) => ({
  contractId: null,
  clauses: [],
  overallContractRiskScore: 'Low',
  metadata: null,
  proceedToNegotiationEnabled: false,

  setClauseAnalysis: (analysis) =>
    set({
      contractId: analysis.contractId,
      clauses: analysis.clauses || [],
      overallContractRiskScore: analysis.overallContractRiskScore,
      metadata: analysis.metadata || null,
      proceedToNegotiationEnabled: Boolean(analysis.proceedToNegotiationEnabled),
    }),

  updateClause: (clause) =>
    set((state) => ({
      clauses: state.clauses.map((c) => (c.clauseId === clause.clauseId ? clause : c)),
    })),

  updateMetadata: (metadata) => set({ metadata }),

  clear: () =>
    set({
      contractId: null,
      clauses: [],
      overallContractRiskScore: 'Low',
      metadata: null,
      proceedToNegotiationEnabled: false,
    }),
}));
