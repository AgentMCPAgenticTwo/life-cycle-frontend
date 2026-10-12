import { useCallback, useEffect, useRef, useState } from 'react';
import { getNegotiationTracker } from '@/services/lifecycleNegotiationService';
import { useNegotiationStore } from '@/store/negotiationSlice';

/**
 * Fetches the negotiation tracker including routing, reviewers, status, version history and comments (UC5-MF-001).
 * @returns {{ data: import('@/services/lifecycleNegotiationService').NegotiationTrackerResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void, notRouted: boolean }}
 */
export function useNegotiationTracker(contractId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notRouted, setNotRouted] = useState(false);
  const requestId = useRef(0);
  const setNegotiation = useNegotiationStore((s) => s.setNegotiation);
  const clear = useNegotiationStore((s) => s.clear);

  const load = useCallback(() => {
    if (!contractId) return;
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    setNotRouted(false);
    getNegotiationTracker(contractId)
      .then((response) => {
        if (requestId.current !== id) return;
        setData(response);
        setNegotiation(response);
      })
      .catch((err) => {
        if (requestId.current !== id) return;
        if (err.status === 404) {
          // No routing configured yet — the Routing panel owns the Draft → With Internal transition.
          setNotRouted(true);
        } else {
          setError(err);
        }
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [contractId, setNegotiation]);

  useEffect(() => {
    load();
    return () => clear();
  }, [load, clear]);

  return { data, isLoading, error, refetch: load, notRouted, setData };
}
