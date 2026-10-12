import { useCallback, useEffect, useState } from 'react';
import { getRenewalPanel } from '@/services/contractRepositoryService';
import { useObligationsStore } from '@/store/obligationsSlice';

/**
 * Fetches the renewal alert, dates, and action button enablement for a
 * contract (UC9-BR-003, UC9-BR-004, UC9-FV-002, UC9-GC-001).
 * @param {string} contractId
 * @returns {{ data: import('@/services/contractRepositoryService').RenewalPanelResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useRenewalPanel(contractId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const setRenewal = useObligationsStore((state) => state.setRenewal);

  const load = useCallback(() => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    getRenewalPanel(contractId)
      .then((response) => {
        setData(response);
        setRenewal(response);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [contractId, setRenewal]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
