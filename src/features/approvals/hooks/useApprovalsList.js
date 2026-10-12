import { useCallback, useEffect, useRef, useState } from 'react';
import { listApprovals } from '@/services/approvalsService';

/**
 * Fetches the paged list of approvals visible to the current user — pending,
 * delegated, or tenant-wide for Tenant Admin (UC6-AF-006, UC6-BR-016/017/018).
 * @returns {{ data: import('@/services/approvalsService').ApprovalListResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useApprovalsList() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listApprovals()
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
