import { useCallback, useState } from 'react';
import { updateSigner } from '@/services/signersService';

/**
 * Updates or reorders a signer; blocked server-side once the first signature
 * has been collected (UC7-BR-004).
 * @returns {{ mutate: (signerId: string, req: import('@/services/signersService').UpdateSignerRequest) => Promise<import('@/services/signersService').SignerResponse>, isLoading: boolean }}
 */
export function useUpdateSigner(contractId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    (signerId, request) => {
      setIsLoading(true);
      return updateSigner(contractId, signerId, request).finally(() => setIsLoading(false));
    },
    [contractId]
  );

  return { mutate, isLoading };
}
