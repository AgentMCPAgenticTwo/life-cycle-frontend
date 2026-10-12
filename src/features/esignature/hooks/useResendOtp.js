import { useCallback, useState } from 'react';
import { resendOtp } from '@/services/signingSessionService';

/**
 * Requests a new signing link/OTP after lockout or link expiry (UC7-AF-003 / UC7-BR-020).
 * @returns {{ mutate: () => Promise<import('@/services/signingSessionService').SigningSessionResponse>, isLoading: boolean }}
 */
export function useResendOtp(sessionId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(() => {
    setIsLoading(true);
    return resendOtp(sessionId).finally(() => setIsLoading(false));
  }, [sessionId]);

  return { mutate, isLoading };
}
