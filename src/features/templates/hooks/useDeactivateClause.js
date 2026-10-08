import { useCallback, useState } from 'react';
import { deactivateClause } from '@/services/clausesService';

/**
 * Deactivates a clause (UC3-BR-012).
 * @returns {{ mutate: (id: string) => Promise<import('@/services/clausesService').ClauseResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useDeactivateClause() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      return await deactivateClause(id);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
