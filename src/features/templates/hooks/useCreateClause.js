import { useCallback, useState } from 'react';
import { createClause } from '@/services/clausesService';

/**
 * Creates a new clause as Version 1 (UC3-MF-001 / UC3-BR-011).
 * @returns {{ mutate: (request: import('@/services/clausesService').CreateClauseRequest) => Promise<import('@/services/clausesService').ClauseResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useCreateClause() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createClause(request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
