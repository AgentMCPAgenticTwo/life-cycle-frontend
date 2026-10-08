import { useCallback, useState } from 'react';
import { createCounterparty } from '@/services/counterpartiesService';

/**
 * Creates a new counterparty record (UC2-AF-008).
 * @returns {{ mutate: (request: import('@/services/counterpartiesService').CreateCounterpartyRequest) => Promise<import('@/services/counterpartiesService').CounterpartyResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useCreateCounterparty() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createCounterparty(request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
