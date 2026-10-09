import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyTasks } from '@/services/dashboardService';

/**
 * Fetches the logged-in user's pending task contracts, scoped by the applied
 * dashboard filters (BR-3).
 * @param {object} filters
 * @returns {{ data: import('@/services/dashboardService').MyTasksResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useMyTasks(filters) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getMyTasks(filters)
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
