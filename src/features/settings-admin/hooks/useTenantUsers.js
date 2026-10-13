import { useCallback, useEffect, useRef, useState } from 'react';
import { listTenantUsers } from '@/services/settingsUsersService';

/**
 * Fetches the tenant users list for the User Management Tab (UC11-GC-001).
 * @returns {{ data: import('@/services/settingsUsersService').UserListItemResponse[]|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useTenantUsers() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listTenantUsers()
      .then((response) => {
        if (requestId.current === id) setData(response.items || []);
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
