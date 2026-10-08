import { useCallback, useState } from 'react';
import { updateTemplate } from '@/services/templatesService';

/**
 * Edits a template, generating a new version (UC3-BR-002 / UC3-BR-014).
 * Blocked with a 409 when another user already saved a conflicting change
 * (UC3-AF-006) — callers should check `err.status === 409`.
 * @returns {{ mutate: (id: string, request: import('@/services/templatesService').UpdateTemplateRequest) => Promise<import('@/services/templatesService').TemplateResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useUpdateTemplate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (id, request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await updateTemplate(id, request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
