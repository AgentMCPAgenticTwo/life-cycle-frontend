import { useCallback, useState } from 'react';
import { verifyOtp } from '@/services/signingSessionService';

/**
 * Verifies the signer's 6-digit OTP (UC7-AF-001 / UC7-BR-003 / UC7-BR-016 / UC7-FV-002).
 * @returns {{ mutate: (req: import('@/services/signingSessionService').VerifyOtpRequest) => Promise<import('@/services/signingSessionService').VerifyOtpResponse>, isLoading: boolean }}
 */
export function useVerifyOtp(sessionId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    (request) => {
      setIsLoading(true);
      return verifyOtp(sessionId, request).finally(() => setIsLoading(false));
    },
    [sessionId]
  );

  return { mutate, isLoading };
}
