import { useCallback, useEffect, useRef, useState } from 'react';
import { listNotificationEvents } from '@/services/settingsNotificationsService';

/**
 * Fetches notification event toggles for the Notifications Tab (UC11-BR-007:
 * toggles default On until a Tenant Admin explicitly turns one off).
 * @returns {{ data: import('@/services/settingsNotificationsService').NotificationEventResponse[]|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useNotificationEvents() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listNotificationEvents()
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
