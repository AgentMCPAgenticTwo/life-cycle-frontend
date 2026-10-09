import { useCallback, useState } from 'react';
import { retryExtraction } from '@/services/lifecycleClauseAnalysisService';

/**
 * Retries AI clause extraction after a failure or timeout (UC4-AF-002).
 * @returns {{ retry: () => Promise<import('@/services/lifecycleClauseAnalysisService').ClauseAnalysisResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useRetryExtraction(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const retry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await retryExtraction(contractId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  return { retry, isLoading, error };
}
