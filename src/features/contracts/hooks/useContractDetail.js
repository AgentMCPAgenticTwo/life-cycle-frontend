import { useCallback, useState } from 'react';
import { getContract } from '@/services/contractsService';

/**
 * Fetches a single contract's detail, enforcing role-based access.
 * Exposed as an imperative `fetchContract` rather than an auto-fetch-on-mount hook,
 * since this page only needs it to run the access check when a row is clicked.
 * @returns {{ data: import('@/services/contractsService').ContractResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, fetchContract: (id: string) => Promise<import('@/services/contractsService').ContractResponse> }}
 */
export function useContractDetail() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContract = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getContract(id);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchContract };
}
