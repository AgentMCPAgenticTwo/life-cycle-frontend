import { useCallback, useState } from 'react';
import { uploadThirdPartyPaper } from '@/services/contractsService';

/**
 * Uploads a third party paper file (UC2-AF-005 / UC2-AF-006).
 * @returns {{ mutate: (request: import('@/services/contractsService').UploadThirdPartyPaperRequest) => Promise<import('@/services/contractsService').FileUploadResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useUploadThirdPartyPaper() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (request) => {
    setIsLoading(true);
    setError(null);
    try {
      return await uploadThirdPartyPaper(request);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
