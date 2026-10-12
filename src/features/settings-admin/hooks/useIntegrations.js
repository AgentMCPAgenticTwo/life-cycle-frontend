import { useCallback, useEffect, useRef, useState } from 'react';
import { listIntegrations } from '@/services/settingsIntegrationsService';

/**
 * Fetches integration cards for the Integrations Tab (UC11-FV-003).
 * @returns {{ data: import('@/services/settingsIntegrationsService').IntegrationResponse[]|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useIntegrations() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listIntegrations()
      .then((response) => {
        if (requestId.current === id) setData(Array.isArray(response) ? response : response?.items || []);
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
