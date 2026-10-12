import { useCallback, useEffect, useRef, useState } from 'react';
import { listApprovalMatrixConfig } from '@/services/approvalMatrixConfigService';

/**
 * Fetches tenant approval matrix configuration (UC6-BR-002 / UC6-BR-016) for
 * the Approval Matrix Config settings screen.
 * @returns {{ data: import('@/services/approvalMatrixConfigService').ApprovalMatrixConfigListResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useApprovalMatrixConfig() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listApprovalMatrixConfig()
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
