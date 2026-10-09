import { useCallback, useState } from 'react';
import { askAI } from '@/services/lifecycleClauseAnalysisService';

/**
 * Submits a free-text question and returns the AI answer with disclaimer (UC4-BR-008).
 * @returns {{ ask: (question: string) => Promise<import('@/services/lifecycleClauseAnalysisService').AskAIResponse>, answer: import('@/services/lifecycleClauseAnalysisService').AskAIResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useAskAI(contractId) {
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const ask = useCallback(
    async (question) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await askAI(contractId, { question });
        setAnswer(response);
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contractId]
  );

  return { ask, answer, isLoading, error };
}
