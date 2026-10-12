import { useState } from 'react';
import { acceptObligation } from '@/services/contractRepositoryService';
import { useObligationsStore } from '@/store/obligationsSlice';

/**
 * Accepts an AI-suggested obligation, changing its label from AI Suggested to
 * Confirmed without altering the underlying values (UC9-BR-005, UC9-BR-006).
 * @param {string} contractId
 * @param {string} obligationId
 * @returns {{ accept: () => Promise<import('@/services/contractRepositoryService').ObligationResponse>, isSaving: boolean }}
 */
export function useAcceptObligation(contractId, obligationId) {
  const [isSaving, setIsSaving] = useState(false);
  const storeUpdate = useObligationsStore((state) => state.updateObligation);

  const accept = () => {
    setIsSaving(true);
    return acceptObligation(contractId, obligationId)
      .then((updated) => {
        storeUpdate(updated);
        return updated;
      })
      .finally(() => setIsSaving(false));
  };

  return { accept, isSaving };
}
