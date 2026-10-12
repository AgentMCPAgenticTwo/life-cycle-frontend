import { useCallback, useState } from 'react';
import { updateApprovalMatrixConfig } from '@/services/approvalMatrixConfigService';

/**
 * Submits updated tenant approval matrix rules (UC6-BR-002 / UC6-BR-016)
 * against PUT /approval-matrix-config.
 * @returns {{ mutate: (req: import('@/services/approvalMatrixConfigService').UpdateApprovalMatrixConfigRequest) => Promise<import('@/services/approvalMatrixConfigService').ApprovalMatrixConfigListResponse>, isLoading: boolean }}
 */
export function useUpdateApprovalMatrixConfig() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback((request) => {
    setIsLoading(true);
    return updateApprovalMatrixConfig(request).finally(() => setIsLoading(false));
  }, []);

  return { mutate, isLoading };
}
