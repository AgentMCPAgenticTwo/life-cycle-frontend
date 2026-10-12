import { useState } from 'react';
import { amendContract } from '@/services/contractRepositoryService';

/**
 * Triggers the Amend action, creating a linked amendment contract and
 * transitioning the original to Amended (UC9-BR-017).
 * @param {string} contractId
 * @returns {{ amend: () => Promise<import('@/services/contractRepositoryService').LinkedContractActionResponse>, isSaving: boolean, error: string }}
 */
export function useAmendContract(contractId) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const amend = () => {
    setIsSaving(true);
    setError('');
    return amendContract(contractId)
      .catch((err) => {
        setError(err?.message || 'Unable to amend this contract.');
        throw err;
      })
      .finally(() => setIsSaving(false));
  };

  return { amend, isSaving, error };
}
