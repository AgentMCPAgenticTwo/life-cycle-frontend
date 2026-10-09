import { useCallback, useState } from 'react';
import { reactivateTemplate } from '@/services/templatesService';

/**
 * Reactivates an Inactive template with no restrictions (UC3-BR-013).
 * @returns {{ mutate: (id: string) => Promise<import('@/services/templatesService').TemplateResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useReactivateTemplate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      return await reactivateTemplate(id);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
