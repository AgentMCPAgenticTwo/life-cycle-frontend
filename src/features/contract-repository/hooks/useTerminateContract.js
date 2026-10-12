import { useState } from 'react';
import { terminateContract } from '@/services/contractRepositoryService';

/**
 * Triggers the Terminate action with a required Termination Reason and
 * Effective Termination Date on or after today (UC9-BR-018, UC9-FV-001).
 * @param {string} contractId
 * @returns {{ terminate: (req: import('@/services/contractRepositoryService').TerminateContractRequest) => Promise<import('@/services/contractRepositoryService').LinkedContractActionResponse>, isSaving: boolean, error: string }}
 */
export function useTerminateContract(contractId) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const terminate = (request) => {
    setIsSaving(true);
    setError('');
    return terminateContract(contractId, request)
      .catch((err) => {
        setError(err?.message || 'Unable to terminate this contract.');
        throw err;
      })
      .finally(() => setIsSaving(false));
  };

  return { terminate, isSaving, error };
}
