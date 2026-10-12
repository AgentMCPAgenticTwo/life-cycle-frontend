import { useState } from 'react';
import { createObligation } from '@/services/contractRepositoryService';

/**
 * Manually adds an obligation when none were AI-extracted (UC9-AF-001).
 * @param {string} contractId
 * @returns {{ create: (req: import('@/services/contractRepositoryService').CreateObligationRequest) => Promise<import('@/services/contractRepositoryService').ObligationResponse>, isSaving: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useCreateObligation(contractId) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const create = (request) => {
    setIsSaving(true);
    setError(null);
    return createObligation(contractId, request)
      .catch((err) => {
        setError(err);
        throw err;
      })
      .finally(() => setIsSaving(false));
  };

  return { create, isSaving, error };
}
