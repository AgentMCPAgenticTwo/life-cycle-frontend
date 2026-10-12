import { useCallback, useEffect, useState } from 'react';
import { getObligations } from '@/services/contractRepositoryService';
import { useObligationsStore } from '@/store/obligationsSlice';

/**
 * Fetches the obligations list for a contract (UC9-GC-001, UC9-MF-001).
 * @param {string} contractId
 * @returns {{ data: import('@/services/contractRepositoryService').ObligationResponse[], isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useObligations(contractId) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const setObligations = useObligationsStore((state) => state.setObligations);

  const load = useCallback(() => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    getObligations(contractId)
      .then((response) => {
        const items = response?.items ?? [];
        setData(items);
        setObligations(items);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [contractId, setObligations]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
