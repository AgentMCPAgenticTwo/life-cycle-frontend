import { useState } from 'react';
import { updateObligation } from '@/services/contractRepositoryService';
import { useObligationsStore } from '@/store/obligationsSlice';

/**
 * Updates an obligation's fields and status, transitioning Source label to
 * Confirmed (UC9-AF-004, UC9-BR-005, UC9-BR-013, UC9-BR-014, UC9-BR-015).
 * @param {string} contractId
 * @returns {{ update: (obligationId: string, req: import('@/services/contractRepositoryService').UpdateObligationRequest) => Promise<import('@/services/contractRepositoryService').ObligationResponse>, isSaving: boolean, error: string }}
 */
export function useUpdateObligation(contractId) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const storeUpdate = useObligationsStore((state) => state.updateObligation);

  const update = (obligationId, request) => {
    setIsSaving(true);
    setError('');
    return updateObligation(contractId, obligationId, request)
      .then((updated) => {
        storeUpdate(updated);
        return updated;
      })
      .catch((err) => {
        setError(err?.message || 'Unable to save the obligation.');
        throw err;
      })
      .finally(() => setIsSaving(false));
  };

  return { update, isSaving, error };
}
