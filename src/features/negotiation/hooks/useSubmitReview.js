import { useCallback, useState } from 'react';
import { submitReview } from '@/services/lifecycleNegotiationService';

/**
 * Submits an internal reviewer's redline/comment; surfaces version-conflict errors (UC5-AF-005).
 * @returns {{ mutate: (payload: import('@/services/lifecycleNegotiationService').SubmitReviewRequest) => Promise<import('@/services/lifecycleNegotiationService').SubmitReviewResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null, conflict: boolean, clearConflict: () => void }}
 */
export function useSubmitReview(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(false);

  const mutate = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      setConflict(false);
      try {
        return await submitReview(contractId, payload);
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
