import { useCallback, useEffect, useRef, useState } from 'react';
import { listSigners } from '@/services/signersService';

/**
 * Fetches the Signer List for a contract's e-signature workflow
 * (UC7-GC-001 / UC7-BR-012 / UC7-FV-005).
 * @returns {{ data: import('@/services/signersService').SignerListResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useSignerList(contractId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (!contractId) return;
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    listSigners(contractId)
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [contractId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
