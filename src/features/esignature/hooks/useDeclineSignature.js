import { useCallback, useState } from 'react';
import { declineSignature } from '@/services/signingSessionService';

/**
 * Submits a Decline to Sign action with a mandatory reason (UC7-AF-002 / UC7-BR-008 /
 * UC7-BR-018 / UC7-FV-003).
 * @returns {{ mutate: (req: import('@/services/signingSessionService').DeclineSignatureRequest) => Promise<import('@/services/signingSessionService').DeclineSignatureResponse>, isLoading: boolean }}
 */
export function useDeclineSignature(sessionId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    (request) => {
      setIsLoading(true);
      return declineSignature(sessionId, request).finally(() => setIsLoading(false));
    },
    [sessionId]
  );

  return { mutate, isLoading };
}
