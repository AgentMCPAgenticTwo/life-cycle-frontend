import { useCallback, useState } from 'react';
import { removeSigner } from '@/services/signersService';

/**
 * Removes a signer from the Signer List; blocked server-side once the first
 * signature has been collected (UC7-BR-004).
 * @returns {{ mutate: (signerId: string) => Promise<import('@/services/signersService').SignerResponse>, isLoading: boolean }}
 */
export function useRemoveSigner(contractId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    (signerId) => {
      setIsLoading(true);
      return removeSigner(contractId, signerId).finally(() => setIsLoading(false));
    },
    [contractId]
  );

  return { mutate, isLoading };
}
