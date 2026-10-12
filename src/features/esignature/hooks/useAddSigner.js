import { useCallback, useState } from 'react';
import { addSigner } from '@/services/signersService';

/**
 * Adds a signer to the Signer List with mandatory Signer Name, Signer Email,
 * Signer Type, Signing Order and Signature Method (UC7-FV-001 / UC7-BR-002).
 * @returns {{ mutate: (req: import('@/services/signersService').AddSignerRequest) => Promise<import('@/services/signersService').SignerResponse>, isLoading: boolean }}
 */
export function useAddSigner(contractId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    (request) => {
      setIsLoading(true);
      return addSigner(contractId, request).finally(() => setIsLoading(false));
    },
    [contractId]
  );

  return { mutate, isLoading };
}
