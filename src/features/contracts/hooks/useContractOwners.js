import { useCallback, useEffect, useRef, useState } from 'react';
import { listUsers } from '@/services/usersService';

/**
 * Fetches tenant users eligible for the Contract Owner role (UC2-BR-003).
 * @returns {{ data: import('@/services/usersService').UserOptionListResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useContractOwners() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listUsers({ role: 'CONTRACT_OWNER' })
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
