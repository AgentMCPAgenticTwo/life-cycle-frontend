import { useCallback, useEffect, useState } from 'react';
import { getContractDocument } from '@/services/contractRepositoryService';

/**
 * Fetches document viewer metadata for the Document tab (UC8-BR-006).
 * @param {string} contractId
 * @returns {{ data: import('@/services/contractRepositoryService').ContractDocumentResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useContractDocument(contractId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    getContractDocument(contractId)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [contractId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error };
}
