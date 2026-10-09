import { useCallback, useState } from 'react';
import { markAgreed } from '@/services/lifecycleNegotiationService';

/**
 * Marks the negotiation as Agreed after a completed review cycle (UC5-BR-009 / BR-021 / BR-022).
 * @returns {{ mutate: () => Promise<import('@/services/lifecycleNegotiationService').MarkAgreedResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useMarkAgreed(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await markAgreed(contractId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  return { mutate, isLoading, error };
}
