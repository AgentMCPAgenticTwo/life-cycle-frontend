import { useCallback, useEffect, useRef, useState } from 'react';
import { getSigningSession } from '@/services/signingSessionService';

/**
 * Fetches the current signer's session state including OTP/sequence gating
 * and link-expiry eligibility (UC7-BR-001 / UC7-BR-003 / UC7-BR-011 / UC7-BR-014 / UC7-BR-021).
 * @returns {{ data: import('@/services/signingSessionService').SigningSessionResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useSigningSession(sessionId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (!sessionId) return;
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getSigningSession(sessionId)
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
