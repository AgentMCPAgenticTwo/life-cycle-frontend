import { useCallback, useState } from 'react';
import { editClause } from '@/services/lifecycleClauseAnalysisService';

/**
 * Saves a manual clause edit, handling the 409 concurrent-edit conflict response (UC4-AF-004 / BR-15).
 * @returns {{ mutate: (clauseId: string, payload: import('@/services/lifecycleClauseAnalysisService').EditClauseRequest) => Promise<import('@/services/lifecycleClauseAnalysisService').ClauseResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null, conflict: boolean, clearConflict: () => void }}
 */
export function useEditClause(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(false);

  const mutate = useCallback(
    async (clauseId, payload) => {
      setIsLoading(true);
      setError(null);
      setConflict(false);
      try {
        return await editClause(contractId, clauseId, payload);
      } catch (err) {
        if (err.status === 409) {
          setConflict(true);
        } else {
          setError(err);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contractId]
  );

  return { mutate, isLoading, error, conflict, clearConflict: () => setConflict(false) };
}
