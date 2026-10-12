import { useCallback, useState } from 'react';
import { submitApprovalAction } from '@/services/approvalsService';

/**
 * Submits an Approve/Reject/SendBack action against
 * POST /approvals/{id}/actions (UC6-MF-001, UC6-BR-020/021/022).
 * @returns {{ mutate: (req: import('@/services/approvalsService').ApprovalActionRequest) => Promise<import('@/services/approvalsService').ApprovalActionResponse>, isLoading: boolean }}
 */
export function useSubmitApprovalAction(approvalId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    (request) => {
      setIsLoading(true);
      return submitApprovalAction(approvalId, request).finally(() => setIsLoading(false));
    },
    [approvalId]
  );

  return { mutate, isLoading };
}
