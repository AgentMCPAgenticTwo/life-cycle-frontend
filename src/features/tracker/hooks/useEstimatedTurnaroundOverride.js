import { useCallback, useState } from 'react';
import { overrideEstimatedTurnaround } from '@/services/trackerService';

/**
 * Submits an override of an AI-suggested Estimated Turnaround value,
 * logging the original value, new value, user and timestamp (UC10-BR-007).
 * @returns {{ override: (contractId: string, request: import('@/services/trackerService').EstimatedTurnaroundOverrideRequest) => Promise<import('@/services/trackerService').TurnaroundRowResponse>, isSubmitting: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useEstimatedTurnaroundOverride() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const override = useCallback(async (contractId, request) => {
    setIsSubmitting(true);
    setError(null);
    try {
      return await overrideEstimatedTurnaround(contractId, request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { override, isSubmitting, error };
}
