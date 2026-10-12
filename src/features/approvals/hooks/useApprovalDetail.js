import { useCallback, useEffect, useRef, useState } from 'react';
import { getApproval } from '@/services/approvalsService';

/**
 * Fetches full approval review detail (UC6-MF-001 and friends) for the
 * Approval Review screen, including action-eligibility flags.
 * @returns {{ data: import('@/services/approvalsService').ApprovalResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useApprovalDetail(approvalId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (!approvalId) return;
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getApproval(approvalId)
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
