import { useCallback, useState } from 'react';
import { addComment } from '@/services/lifecycleNegotiationService';

/**
 * Adds a free-text comment tied to a clause and the current negotiation version (UC5-BR-011 / BR-014 / BR-015 / FV-001 / FV-003).
 * @returns {{ mutate: (payload: import('@/services/lifecycleNegotiationService').CommentRequest) => Promise<import('@/services/lifecycleNegotiationService').CommentResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useAddComment(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        return await addComment(contractId, payload);
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
