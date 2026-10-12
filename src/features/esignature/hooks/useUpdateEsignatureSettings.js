import { useCallback, useState } from 'react';
import { updateEsignatureSettings } from '@/services/esignatureSettingsService';

/**
 * Submits updated tenant-wide reminder frequency / default signature
 * provider (UC7-BR-013 / UC7-FV-004) against PUT /esignature-settings.
 * @returns {{ mutate: (req: import('@/services/esignatureSettingsService').UpdateEsignatureSettingsRequest) => Promise<import('@/services/esignatureSettingsService').EsignatureSettingsResponse>, isLoading: boolean }}
 */
export function useUpdateEsignatureSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback((request) => {
    setIsLoading(true);
    return updateEsignatureSettings(request).finally(() => setIsLoading(false));
  }, []);

  return { mutate, isLoading };
}
