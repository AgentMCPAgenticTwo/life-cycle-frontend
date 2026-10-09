import { useCallback, useState } from 'react';
import { acceptSuggestion } from '@/services/lifecycleClauseAnalysisService';

/**
 * Calls accept-suggestion endpoint and updates clause status to Accepted (UC4-BR-014).
 * @returns {{ mutate: (clauseId: string) => Promise<import('@/services/lifecycleClauseAnalysisService').ClauseResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useAcceptSuggestion(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (clauseId) => {
      setIsLoading(true);
      setError(null);
      try {
        return await acceptSuggestion(contractId, clauseId);
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
