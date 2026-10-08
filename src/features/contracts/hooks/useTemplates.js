import { useCallback, useEffect, useRef, useState } from 'react';
import { listTemplates } from '@/services/templatesService';

/**
 * Fetches templates filtered by Contract Type, Industry and/or Status
 * (UC2-BR-001). Skipped until both Contract Type and Industry are selected,
 * since there is nothing active to filter against before that (UC2-BR-002).
 * @param {{ contractType?: string, industry?: string, status?: string }} filters
 * @returns {{ data: import('@/services/templatesService').TemplateListResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useTemplates(filters) {
  const skip = !filters?.contractType || !filters?.industry;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (skip) {
      setData(null);
      setIsLoading(false);
      return;
    }
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listTemplates(filters)
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [JSON.stringify(filters), skip]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
