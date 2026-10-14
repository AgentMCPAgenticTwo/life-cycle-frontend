import { useCallback, useState } from 'react';
import { deleteApprovalRule } from '@/services/settingsApprovalRulesService';

/**
 * Deletes an approval matrix rule. Approvals already in progress keep the
 * routing they were created with, so deletion only affects future routing.
 * @returns {{ removeRule: (ruleId: string) => Promise<void>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useDeleteApprovalRule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (ruleId) => {
    setIsLoading(true);
    setError(null);
    try {
      return await deleteApprovalRule(ruleId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { removeRule: mutate, isLoading, error };
}
