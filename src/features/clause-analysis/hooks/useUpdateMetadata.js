import { useCallback, useState } from 'react';
import { updateMetadata } from '@/services/lifecycleClauseAnalysisService';

/**
 * Saves manual edits to AI-extracted contract metadata fields (UC4-BR-007).
 * @returns {{ mutate: (payload: import('@/services/lifecycleClauseAnalysisService').UpdateMetadataRequest) => Promise<import('@/services/lifecycleClauseAnalysisService').ContractMetadataResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useUpdateMetadata(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        return await updateMetadata(contractId, payload);
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
