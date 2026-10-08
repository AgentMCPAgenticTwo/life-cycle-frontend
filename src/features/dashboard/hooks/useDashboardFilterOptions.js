import { useCallback, useEffect, useRef, useState } from 'react';
import { getDashboardFilterOptions } from '@/services/dashboardService';

/**
 * Fetches tenant-scoped filter dropdown option values.
 * @returns {{ data: import('@/services/dashboardService').DashboardFilterOptionsResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useDashboardFilterOptions() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getDashboardFilterOptions()
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
