import { useCallback, useEffect, useRef, useState } from 'react';
import { getEsignatureSettings } from '@/services/esignatureSettingsService';

/**
 * Fetches tenant-wide e-signature settings (UC7-BR-013 / UC7-FV-004) for the
 * E-signature Settings screen.
 * @returns {{ data: import('@/services/esignatureSettingsService').EsignatureSettingsResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useEsignatureSettings() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getEsignatureSettings()
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
