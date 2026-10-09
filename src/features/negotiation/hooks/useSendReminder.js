import { useCallback, useState } from 'react';
import { sendReminder } from '@/services/lifecycleNegotiationService';

/**
 * Sends a manual reminder email to an overdue reviewer, supplementing the automatic daily reminder (UC5-AF-006 / BR-010).
 * @returns {{ mutate: () => Promise<import('@/services/lifecycleNegotiationService').ReminderResponse>, data: import('@/services/lifecycleNegotiationService').ReminderResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useSendReminder(contractId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendReminder(contractId);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  return { mutate, data, isLoading, error };
}
