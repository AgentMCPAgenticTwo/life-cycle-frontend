import { useCallback, useEffect, useRef, useState } from 'react';
import { listContracts } from '@/services/contractsService';

/**
 * Fetches the filtered Contract Repository list.
 * @param {object} filters
 * @returns {{ data: import('@/services/contractsService').ContractListResponse|null, isLoading: boolean, error: HttpError|null, refetch: () => void }}
 */
export function useContractRepository(filters) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listContracts(filters)
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
