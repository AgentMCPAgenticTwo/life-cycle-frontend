import { useCallback, useState } from 'react';
import { createContract } from '@/services/contractsService';

/**
 * Creates a new contract and saves it as Draft (UC2-MF-001 / UC2-BR-010).
 * @returns {{ mutate: (request: import('@/services/contractsService').CreateContractRequest) => Promise<import('@/services/contractsService').ContractResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useCreateContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createContract(request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
