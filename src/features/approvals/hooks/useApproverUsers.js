import { useCallback, useEffect, useRef, useState } from 'react';
import { listUsers } from '@/services/usersService';

/**
 * Fetches tenant users holding the Approver role, to populate the Delegate
 * To dropdown (UC6-AF-005, UC6-BR-008) with eligible delegates.
 * @returns {{ data: import('@/services/usersService').UserOptionListResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useApproverUsers() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listUsers({ role: 'APPROVER' })
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
