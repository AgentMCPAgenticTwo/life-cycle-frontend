import { useCallback, useEffect, useRef, useState } from 'react';
import { getClauseAnalysis } from '@/services/lifecycleClauseAnalysisService';
import { useClauseAnalysisStore } from '@/store/clauseAnalysisSlice';

/**
 * Fetches the clause list, overall risk score and metadata for a contract (UC4-MF-001).
 * @returns {{ data: import('@/services/lifecycleClauseAnalysisService').ClauseAnalysisResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null, refetch: () => void }}
 */
export function useClauseAnalysis(contractId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const setClauseAnalysis = useClauseAnalysisStore((s) => s.setClauseAnalysis);
  const clear = useClauseAnalysisStore((s) => s.clear);

  const load = useCallback(() => {
    if (!contractId) return;
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    getClauseAnalysis(contractId)
      .then((response) => {
        if (requestId.current !== id) return;
        setData(response);
        setClauseAnalysis(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [contractId, setClauseAnalysis]);

  useEffect(() => {
    load();
    return () => clear();
  }, [load, clear]);

  return { data, isLoading, error, refetch: load, setData };
}
