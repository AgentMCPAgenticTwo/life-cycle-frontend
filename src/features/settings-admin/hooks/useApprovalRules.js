import { useCallback, useEffect, useRef, useState } from 'react';
import { listApprovalRules } from '@/services/settingsApprovalRulesService';

/**
 * Fetches the approval matrix rules for the Routing & Approval Tab (UC11-GC-002).
 * @returns {{ data: import('@/services/settingsApprovalRulesService').ApprovalRuleResponse[]|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useApprovalRules() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listApprovalRules()
      .then((response) => {
        if (requestId.current === id) setData(response.items || []);
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
