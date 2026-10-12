import { useCallback, useEffect, useState } from 'react';
import { compareVersions } from '@/services/lifecycleNegotiationService';

/**
 * Fetches a side-by-side comparison for two selected versions of a contract (UC5-BR-011 / BR-012 / BR-014 / BR-015).
 * @returns {{ data: import('@/services/lifecycleNegotiationService').CompareVersionsResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useCompareVersions(contractId, versionA, versionB, enabled) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    compareVersions(contractId, versionA, versionB)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [contractId, versionA, versionB]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { data, isLoading, error, refetch: load };
}
