import { useCallback, useEffect, useState } from 'react';
import { getContractActivityLog } from '@/services/contractRepositoryService';

/**
 * Fetches the immutable, read-only Activity Log entries for a contract (UC8-BR-003).
 * @param {string} contractId
 * @returns {{ data: import('@/services/contractRepositoryService').ActivityLogEntryResponse[], totalCount: number, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useActivityLog(contractId) {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    getContractActivityLog(contractId)
      .then((response) => {
        setData(response?.items ?? []);
        setTotalCount(response?.totalCount ?? response?.items?.length ?? 0);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [contractId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, totalCount, isLoading, error };
}
