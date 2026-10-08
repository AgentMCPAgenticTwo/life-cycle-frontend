import { useCallback, useEffect, useRef, useState } from 'react';
import { getClauseVersions } from '@/services/clausesService';

/**
 * Fetches version history for a clause (UC3-GC-003). Skipped while no id is
 * selected, e.g. while a brand-new (unsaved) clause editor is open.
 * @param {string|null} id
 * @returns {{ data: import('@/services/clausesService').VersionHistoryResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useClauseVersions(id) {
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
    getClauseVersions(id)
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
