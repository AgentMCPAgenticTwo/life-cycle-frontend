import { create } from 'zustand';

// Shape matches the negotiationSlice contract: contractId, routing,
// negotiationStatus, versionNumber, versions, comments.
export const useNegotiationStore = create((set) => ({
  contractId: null,
  routing: null,
  negotiationStatus: null,
  versionNumber: null,
  versions: [],
  comments: [],

  setNegotiation: (negotiation) =>
    set({
      contractId: negotiation.contractId,
      // NegotiationTrackerResponse/RoutingResponse carry the routing fields flat
      // (routingType, internalReviewers, ...) rather than nested; derive the
      // slice's `routing` shape from them when a pre-built `routing` isn't given.
      routing:
        negotiation.routing ??
        (negotiation.routingType
          ? {
              routingType: negotiation.routingType,
              internalReviewers: negotiation.internalReviewers || [],
              externalPartyName: negotiation.externalPartyName,
              externalPartyEmail: negotiation.externalPartyEmail,
              assignedDate: negotiation.assignedDate,
              dueDate: negotiation.dueDate,
            }
          : null),
      negotiationStatus: negotiation.negotiationStatus,
      versionNumber: negotiation.versionNumber,
      versions: negotiation.versions || [],
      comments: negotiation.comments || [],
    }),

  appendVersion: (version) =>
    set((state) => ({
      versions: [...state.versions, version],
      versionNumber: version.versionNumber,
    })),

  addComment: (comment) =>
    set((state) => ({ comments: [...state.comments, comment] })),

  setNegotiationStatus: (negotiationStatus) => set({ negotiationStatus }),

  clear: () =>
    set({
      contractId: null,
      routing: null,
      negotiationStatus: null,
      versionNumber: null,
      versions: [],
      comments: [],
    }),
}));
