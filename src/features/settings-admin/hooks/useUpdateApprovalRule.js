import { useCallback, useState } from 'react';
import { updateApprovalRule } from '@/services/settingsApprovalRulesService';

/**
 * Edits an existing approval matrix rule (UC11-BR-004). Blank fields are
 * blocked by the form; duplicate Contract Type + Value Threshold combinations
 * are rejected server-side and surfaced through the thrown HttpError.
 * @returns {{ updateRule: (ruleId: string, request: import('@/services/settingsApprovalRulesService').CreateApprovalRuleRequest) => Promise<import('@/services/settingsApprovalRulesService').ApprovalRuleResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useUpdateApprovalRule() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (ruleId, request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await updateApprovalRule(ruleId, request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateRule: mutate, isLoading, error };
}
