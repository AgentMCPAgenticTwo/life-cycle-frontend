import { useCallback, useEffect, useRef, useState } from 'react';
import { getApprovalHistory } from '@/services/approvalsService';

/**
 * Fetches the immutable Approval History tab entries (UC6-BR-010/012/013)
 * for a contract's approval workflow.
 * @returns {{ data: import('@/services/approvalsService').ApprovalHistoryListResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useApprovalHistory(approvalId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (!approvalId) return;
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getApprovalHistory(approvalId)
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [approvalId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
