import { useCallback, useState } from 'react';
import { proceedToNegotiation } from '@/services/lifecycleClauseAnalysisService';

/**
 * Triggers routing of a contract from UC4 to UC5 once mandatory clauses are resolved (UC4-AF-006 / BR-5).
 * @returns {{ mutate: () => Promise<import('@/services/lifecycleClauseAnalysisService').ProceedToNegotiationResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useProceedToNegotiation(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await proceedToNegotiation(contractId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  return { mutate, isLoading, error };
}
