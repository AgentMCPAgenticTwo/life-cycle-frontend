import { useCallback, useState } from 'react';
import { rejectClause } from '@/services/lifecycleClauseAnalysisService';

/**
 * Submits a clause rejection (UC4-BR-006).
 * @returns {{ mutate: (clauseId: string, payload: import('@/services/lifecycleClauseAnalysisService').RejectClauseRequest) => Promise<import('@/services/lifecycleClauseAnalysisService').ClauseResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useRejectClause(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (clauseId, payload = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        return await rejectClause(contractId, clauseId, payload);
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
