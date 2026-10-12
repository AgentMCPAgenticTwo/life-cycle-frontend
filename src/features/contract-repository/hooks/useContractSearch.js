import { useCallback, useEffect } from 'react';
import { searchContracts } from '@/services/contractRepositoryService';
import { useContractRepositoryStore } from '@/store/contractRepositorySlice';

function hasActiveCriteria(filters) {
  return Boolean(
    filters.searchText ||
      filters.status ||
      filters.startDateFrom ||
      filters.startDateTo ||
      filters.endDateFrom ||
      filters.endDateTo ||
      filters.valueMin ||
      filters.valueMax ||
      (filters.folderTagIds && filters.folderTagIds.length)
  );
}

/**
 * Searches, filters, sorts and paginates the contracts visible to the current
 * user (UC8-MF-001). Distinguishes "no contracts at all" (UC8-AF-002, no
 * active filter/search term) from "search matched nothing" (UC8-AF-001, a
 * filter or search term is active) so the page can choose which empty message
 * to render.
 * @param {import('@/services/contractRepositoryService').ContractSearchRequest} filters
 * @returns {{
 *   data: import('@/services/contractRepositoryService').ContractListItemResponse[],
 *   isLoading: boolean,
 *   totalCount: number,
 *   error: import('@/services/http').HttpError|null,
 *   refetch: () => void,
 *   isEmptyRepository: boolean,
 *   hasActiveCriteria: boolean,
 *   indexingExcluded: boolean,
 * }}
 */
export function useContractSearch(filters) {
  const data = useContractRepositoryStore((s) => s.results);
  const totalCount = useContractRepositoryStore((s) => s.totalCount);
  const isEmptyState = useContractRepositoryStore((s) => s.isEmptyState);
  const setResults = useContractRepositoryStore((s) => s.setResults);
  const setEmptyState = useContractRepositoryStore((s) => s.setEmptyState);
  const isLoading = useContractRepositoryStore((s) => s.isLoading);
  const error = useContractRepositoryStore((s) => s.error);

  const filtersKey = JSON.stringify(filters);

  const load = useCallback(() => {
    useContractRepositoryStore.setState({ isLoading: true, error: null });
    searchContracts(filters)
      .then((response) => {
        const items = response?.items ?? [];
        setResults(items, response?.totalCount ?? items.length);
        if (!hasActiveCriteria(filters)) setEmptyState(items.length === 0);
      })
      .catch((err) => useContractRepositoryStore.setState({ error: err }))
      .finally(() => useContractRepositoryStore.setState({ isLoading: false }));
    // filtersKey mirrors `filters` by value so refetches only happen when the
    // actual search criteria change, not on every render of a new object literal.
  }, [filtersKey]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCriteria = hasActiveCriteria(filters);

  return {
    data,
    isLoading: Boolean(isLoading),
    totalCount,
    error,
    refetch: load,
    // Sticky: only an unfiltered fetch (hasActiveCriteria === false) updates this flag,
    // so it still reads true while the user has filters applied, per UC8-AF-002's third
    // acceptance criterion ("empty-state message persists" while filtering with no data).
    isEmptyRepository: isEmptyState,
    hasActiveCriteria: activeCriteria,
    indexingExcluded: Boolean(filters.searchText) && data.some((item) => item.indexingInProgress),
  };
}
