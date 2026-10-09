import { useCallback, useState } from 'react';
import { reactivateClause } from '@/services/clausesService';

/**
 * Reactivates an Inactive clause with no restrictions (UC3-BR-013).
 * @returns {{ mutate: (id: string) => Promise<import('@/services/clausesService').ClauseResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useReactivateClause() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      return await reactivateClause(id);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
