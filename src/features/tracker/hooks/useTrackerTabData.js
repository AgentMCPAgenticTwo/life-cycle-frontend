import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Shared fetch-on-filter-change behaviour for the four Tracker tabs
 * (UC10-MF-001, UC10-BR-006): each tab refreshes whenever Period, the
 * filters, or the Date Range change.
 * @param {(params: import('@/services/trackerService').TrackerQueryParams) => Promise<any>} fetcher
 * @param {import('@/services/trackerService').TrackerQueryParams} params
 */
export function useTrackerTabData(fetcher, params) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    fetcher(params)
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [
    fetcher,
    params.period,
    params.contractTypeFilter,
    params.ownerFilter,
    params.dateRangeFrom,
    params.dateRangeTo,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
