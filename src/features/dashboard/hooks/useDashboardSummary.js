import { useCallback, useEffect, useRef, useState } from 'react';
import { getDashboardSummary } from '@/services/dashboardService';

/**
 * Fetches tenant-scoped dashboard status card counts for the applied filters.
 * @param {object} filters
 * @returns {{ data: import('@/services/dashboardService').DashboardSummaryResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useDashboardSummary(filters) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getDashboardSummary(filters)
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
