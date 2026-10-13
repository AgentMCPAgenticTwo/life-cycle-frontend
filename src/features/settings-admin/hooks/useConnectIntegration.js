import { useCallback, useState } from 'react';
import { connectIntegration } from '@/services/settingsIntegrationsService';

/**
 * Authorizes an integration connection (UC11-BR-016). On success the backend
 * masks the submitted credentials and transitions Connection Status to
 * Connected; on failure the Integration record stays Disconnected and the
 * HttpError message is shown inline on the connect form (UC11-BR-016).
 * @returns {{ connect: (integrationName: string, request: import('@/services/settingsIntegrationsService').ConnectIntegrationRequest) => Promise<import('@/services/settingsIntegrationsService').IntegrationResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useConnectIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async (integrationName, request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await connectIntegration(integrationName, request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { connect, isLoading, error };
}
