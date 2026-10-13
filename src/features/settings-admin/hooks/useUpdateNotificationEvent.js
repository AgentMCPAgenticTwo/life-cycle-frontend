import { useCallback, useState } from 'react';
import { updateNotificationEvent } from '@/services/settingsNotificationsService';

/**
 * Updates the Email Toggle and/or In-App Toggle for a notification event
 * (UC11-FV-004): toggling one never touches the other.
 * @returns {{ updateEvent: (eventName: string, request: import('@/services/settingsNotificationsService').UpdateNotificationEventRequest) => Promise<import('@/services/settingsNotificationsService').NotificationEventResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useUpdateNotificationEvent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateEvent = useCallback(async (eventName, request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await updateNotificationEvent(eventName, request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateEvent, isLoading, error };
}
