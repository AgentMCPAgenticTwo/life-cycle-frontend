import { useCallback, useState } from 'react';
import { generateExternalLink } from '@/services/lifecycleNegotiationService';

/**
 * Generates a secure OTP link for the external party (UC5-BR-005 / BR-008 / BR-016).
 * @returns {{ mutate: () => Promise<import('@/services/lifecycleNegotiationService').GenerateExternalLinkResponse>, data: import('@/services/lifecycleNegotiationService').GenerateExternalLinkResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useGenerateExternalLink(contractId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await generateExternalLink(contractId);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  return { mutate, data, isLoading, error };
}
