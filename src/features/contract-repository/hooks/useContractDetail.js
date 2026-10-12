import { useCallback, useEffect, useState } from 'react';
import { getContractDetail } from '@/services/contractRepositoryService';

/**
 * Fetches contract core metadata (Details tab), enforcing the backend's
 * direct-link access control (UC8-AF-003) — a 401/403 surfaces as `error`
 * rather than throwing, so the page can render AccessDeniedView instead.
 * @param {string} contractId
 * @returns {{ data: import('@/services/contractRepositoryService').ContractDetailResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useContractDetail(contractId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    getContractDetail(contractId)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [contractId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
