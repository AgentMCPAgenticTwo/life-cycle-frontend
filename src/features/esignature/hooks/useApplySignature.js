import { useCallback, useState } from 'react';
import { applySignature } from '@/services/signingSessionService';

/**
 * Applies the signer's signature via the Signature Pad (UC7-BR-001 / UC7-BR-004 /
 * UC7-BR-007 / UC7-BR-017 / UC7-BR-019 / UC7-FV-003).
 * @returns {{ mutate: (req: import('@/services/signingSessionService').ApplySignatureRequest) => Promise<import('@/services/signingSessionService').ApplySignatureResponse>, isLoading: boolean }}
 */
export function useApplySignature(sessionId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    (request) => {
      setIsLoading(true);
      return applySignature(sessionId, request).finally(() => setIsLoading(false));
    },
    [sessionId]
  );

  return { mutate, isLoading };
}
