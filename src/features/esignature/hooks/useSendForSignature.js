import { useCallback, useState } from 'react';
import { sendForSignature } from '@/services/signersService';

/**
 * Sends the contract for signature, transitioning it to Sent and emailing the
 * first signer(s) in Signing Order (UC7-BR-002 / UC7-BR-015 / UC7-AF-005).
 * @returns {{ mutate: (req: import('@/services/signersService').SendForSignatureRequest) => Promise<import('@/services/signersService').SendForSignatureResponse>, isLoading: boolean }}
 */
export function useSendForSignature(contractId) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    (request) => {
      setIsLoading(true);
      return sendForSignature(contractId, request).finally(() => setIsLoading(false));
    },
    [contractId]
  );

  return { mutate, isLoading };
}
