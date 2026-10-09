import { useCallback, useEffect, useRef, useState } from 'react';
import { getTemplateVersions } from '@/services/templatesService';

/**
 * Fetches version history for a template (UC3-GC-003). Skipped while no id
 * is selected, e.g. while a brand-new (unsaved) template editor is open.
 * @param {string|null} id
 * @returns {{ data: import('@/services/templatesService').VersionHistoryResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useTemplateVersions(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }
    const requestNum = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getTemplateVersions(id)
      .then((response) => {
        if (requestId.current === requestNum) setData(response);
      })
      .catch((err) => {
        if (requestId.current === requestNum) setError(err);
      })
      .finally(() => {
        if (requestId.current === requestNum) setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
