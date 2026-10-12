import { useCallback, useEffect, useState } from 'react';
import { getContractVersions } from '@/services/contractRepositoryService';

/**
 * Fetches the version history list (Versions tab).
 * @param {string} contractId
 * @returns {{ data: import('@/services/contractRepositoryService').ContractVersionResponse[], isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useContractVersions(contractId) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    getContractVersions(contractId)
      .then((response) => setData(response?.items ?? []))
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [contractId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error };
}
