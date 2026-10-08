import { useCallback, useEffect, useRef, useState } from 'react';
import { searchCounterparties } from '@/services/counterpartiesService';

/**
 * Searches counterparties by name, company or GST/Tax ID. Skipped while the
 * search term is empty.
 * @param {string} searchTerm
 * @returns {{ data: import('@/services/counterpartiesService').CounterpartySearchResponse|null, isLoading: boolean, error: import('@/services/http').HttpError|null }}
 */
export function useCounterpartySearch(searchTerm) {
  const skip = !searchTerm;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (skip) {
      setData(null);
      setIsLoading(false);
      return;
    }
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    searchCounterparties(searchTerm)
      .then((response) => {
        if (requestId.current === id) setData(response);
      })
      .catch((err) => {
        if (requestId.current === id) setError(err);
      })
      .finally(() => {
        if (requestId.current === id) setIsLoading(false);
      });
  }, [searchTerm, skip]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error };
}
