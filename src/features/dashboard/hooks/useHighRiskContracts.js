import { useCallback, useEffect, useRef, useState } from 'react';
import { getHighRiskContracts } from '@/services/dashboardService';

/**
 * Fetches role-scoped high risk contracts ordered by risk score, scoped by the
 * applied dashboard filters (BR-4). Pass `skip: true` for roles the endpoint
 * does not authorize (Signer, per BR-13) to avoid an expected-403 request.
 * @param {object} filters
 * @param {boolean} [skip]
 * @returns {{ data: import('@/services/dashboardService').HighRiskContractsResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useHighRiskContracts(filters, skip = false) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (skip) return;
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getHighRiskContracts(filters)
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [JSON.stringify(filters), skip]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
