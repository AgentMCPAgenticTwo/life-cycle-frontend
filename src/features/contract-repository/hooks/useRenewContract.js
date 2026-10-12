import { useState } from 'react';
import { renewContract } from '@/services/contractRepositoryService';

/**
 * Triggers the Renew action, creating a linked renewal contract and
 * transitioning the original to Renewed (UC9-BR-016).
 * @param {string} contractId
 * @returns {{ renew: () => Promise<import('@/services/contractRepositoryService').LinkedContractActionResponse>, isSaving: boolean, error: string }}
 */
export function useRenewContract(contractId) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const renew = () => {
    setIsSaving(true);
    setError('');
    return renewContract(contractId)
      .catch((err) => {
        setError(err?.message || 'Unable to renew this contract.');
        throw err;
      })
      .finally(() => setIsSaving(false));
  };

  return { renew, isSaving, error };
}
