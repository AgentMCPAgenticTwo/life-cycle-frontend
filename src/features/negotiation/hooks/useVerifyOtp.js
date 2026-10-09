import { useCallback, useState } from 'react';
import { verifyOtp } from '@/services/lifecycleNegotiationService';

/**
 * Verifies the OTP entered by the external party against the secure link (UC5-AF-002 / BR-16).
 * @returns {{ verify: (otp: string) => Promise<import('@/services/lifecycleNegotiationService').VerifyOtpResponse>, data: import('@/services/lifecycleNegotiationService').VerifyOtpResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useVerifyOtp(linkToken) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const verify = useCallback(
    async (otp) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await verifyOtp(linkToken, { otp });
        setData(response);
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [linkToken]
  );

  return { verify, data, isLoading, error };
}
