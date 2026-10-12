import { useCallback, useState } from 'react';
import { getAuditCertificate } from '@/services/signersService';

/**
 * Fetches the audit certificate for an executed contract, available only
 * once every signer's Signer Status is Signed (UC7-BR-005 / UC7-FV-005).
 * @returns {{ mutate: () => Promise<import('@/services/signersService').AuditCertificateResponse>, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useAuditCertificate(contractId) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(() => {
    setIsLoading(true);
    setError(null);
    return getAuditCertificate(contractId)
      .catch((err) => {
        setError(err);
        throw err;
      })
      .finally(() => setIsLoading(false));
  }, [contractId]);

  return { mutate, isLoading, error };
}
