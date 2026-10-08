import { useCallback, useState } from 'react';
import { createTemplate } from '@/services/templatesService';

/**
 * Creates a new template as Version 1 (UC3-MF-001 / UC3-BR-011).
 * @returns {{ mutate: (request: import('@/services/templatesService').CreateTemplateRequest) => Promise<import('@/services/templatesService').TemplateResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useCreateTemplate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await createTemplate(request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
