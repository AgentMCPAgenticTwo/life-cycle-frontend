import { useCallback, useState } from 'react';
import { delegateApproval } from '@/services/approvalsService';

/**
 * Submits a time-bound Delegate assignment against
 * POST /approvals/{id}/delegate (UC6-AF-005, UC6-BR-008).
 * @returns {{ mutate: (req: import('@/services/approvalsService').DelegateRequest) => Promise<import('@/services/approvalsService').DelegateResponse>, isLoading: boolean }}
 */
export function useDelegateApproval(approvalId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    (request) => {
      setIsLoading(true);
      return delegateApproval(approvalId, request).finally(() => setIsLoading(false));
    },
    [approvalId]
  );

  return { mutate, isLoading };
}
