import { useCallback, useState } from 'react';
import { createApprovalRule } from '@/services/settingsApprovalRulesService';

/**
 * Creates a new approval matrix rule (UC11-MF-001 / UC11-BR-004). The backend
 * validates the Contract Type + Value Threshold combination is unique within
 * the tenant and returns an HttpError whose message is the duplicate-rule
 * error to show verbatim (UC11-AF-003).
 * @returns {{ createRule: (request: import('@/services/settingsApprovalRulesService').CreateApprovalRuleRequest) => Promise<import('@/services/settingsApprovalRulesService').ApprovalRuleResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useCreateApprovalRule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createApprovalRule(request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createRule: mutate, isLoading, error };
}
