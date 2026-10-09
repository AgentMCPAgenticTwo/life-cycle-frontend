import { useCallback, useState } from 'react';
import { deactivateTemplate } from '@/services/templatesService';

/**
 * Deactivates a template; blocked if attached to any active, unsigned
 * contract (UC3-AF-004 / UC3-BR-003 / UC3-BR-012).
 * @returns {{ mutate: (id: string) => Promise<import('@/services/templatesService').TemplateResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useDeactivateTemplate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      return await deactivateTemplate(id);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
