import { useCallback, useState } from 'react';
import { externalSubmit } from '@/services/lifecycleNegotiationService';

/**
 * Submits external party redlines/comments on the current version (UC5-AF-003 / BR-6 / BR-20).
 * @returns {{ mutate: (payload: import('@/services/lifecycleNegotiationService').ExternalSubmitRequest) => Promise<import('@/services/lifecycleNegotiationService').ExternalSubmitResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useExternalSubmit(linkToken) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        return await externalSubmit(linkToken, payload);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [linkToken]
  );

  return { mutate, isLoading, error };
}
