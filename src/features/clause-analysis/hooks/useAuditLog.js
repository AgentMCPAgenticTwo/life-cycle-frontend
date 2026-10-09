import { useCallback, useState } from 'react';
import { getAuditLog } from '@/services/lifecycleClauseAnalysisService';

/**
 * Fetches the paged immutable audit log for a contract (UC4-BR-006).
 * @returns {{ data: import('@/services/lifecycleClauseAnalysisService').PagedAuditLogResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, load: (page?: number) => void }}
 */
export function useAuditLog(contractId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    (page = 1) => {
      setIsLoading(true);
      setError(null);
      getAuditLog(contractId, { page })
        .then(setData)
        .catch(setError)
        .finally(() => setIsLoading(false));
    },
    [contractId]
  );

  return { data, isLoading, error, load };
}
