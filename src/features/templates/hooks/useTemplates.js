import { useCallback, useEffect, useRef, useState } from 'react';
import { listTemplates } from '@/services/templatesService';

/**
 * Fetches templates for the Template Library listing (UC3-GC-001). Unlike
 * the New Contract flow's filtered variant, this always loads the full set
 * so Tenant Admin / Legal Reviewer can see Active and Inactive templates.
 * @returns {{ data: import('@/services/templatesService').TemplateListResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useTemplates() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listTemplates()
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
