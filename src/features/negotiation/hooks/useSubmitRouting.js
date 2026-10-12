import { useCallback, useState } from 'react';
import { submitRouting } from '@/services/lifecycleNegotiationService';

/**
 * Submits routing configuration for Send/Submit for Review (UC5-AF-001 / BR-1..BR-4 / BR-18 / BR-23).
 * @returns {{ mutate: (payload: import('@/services/lifecycleNegotiationService').RoutingRequest) => Promise<import('@/services/lifecycleNegotiationService').RoutingResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useSubmitRouting(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        return await submitRouting(contractId, payload);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contractId]
  );

  return { mutate, isLoading, error };
}
