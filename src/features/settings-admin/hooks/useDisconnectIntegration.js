import { useCallback, useState } from 'react';
import { disconnectIntegration } from '@/services/settingsIntegrationsService';

/**
 * Manually disconnects an integration (UC11-BR-017).
 * @returns {{ disconnect: (integrationName: string) => Promise<import('@/services/settingsIntegrationsService').IntegrationResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useDisconnectIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const disconnect = useCallback(async (integrationName) => {
    setIsLoading(true);
    setError(null);
    try {
      return await disconnectIntegration(integrationName);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { disconnect, isLoading, error };
}
