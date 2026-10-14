import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchFilterPanel from '@/features/contract-repository/components/SearchFilterPanel';
import ContractListTable from '@/features/contract-repository/components/ContractListTable';
import NoResultsMessage from '@/features/contract-repository/components/NoResultsMessage';
import EmptyRepositoryState from '@/features/contract-repository/components/EmptyRepositoryState';
import IndexingInProgressBanner from '@/features/contract-repository/components/IndexingInProgressBanner';
import { useContractSearch } from '@/features/contract-repository/hooks/useContractSearch';
import { useContractRepositoryStore } from '@/store/contractRepositorySlice';

const PAGE_SIZE = 20;

/**
 * Main repository page: Search/Filter panel plus the Contract List Table
 * (UC8-MF-001). Distinguishes the no-contracts-at-all empty state (UC8-AF-002)
 * from a no-matching-search empty state (UC8-AF-001), and surfaces the
 * indexing-in-progress notice for full text search (UC8-AF-004).
 */
export default function ContractRepositoryPage() {
  const navigate = useNavigate();
  const filters = useContractRepositoryStore((s) => s.filters);
  const setFilters = useContractRepositoryStore((s) => s.setFilters);
  const [sortBy, setSortBy] = useState('lastModified');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [page, setPage] = useState(1);

  const queryFilters = { ...filters, sortBy, sortDirection, page, pageSize: PAGE_SIZE };
  const {
    data,
    isLoading,
    totalCount,
    error,
    refetch,
    isEmptyRepository,
    indexingExcluded,
  } = useContractSearch(queryFilters);

  function handleSearch(nextFilters) {
    setPage(1);
    setFilters(nextFilters);
  }

  function handleSort(column) {
    setPage(1);
    setSortDirection((prev) => (sortBy === column && prev === 'ASC' ? 'DESC' : 'ASC'));
    setSortBy(column);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(totalCount, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <span>CLM Hub</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Contract Repository</span>
        </nav>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Contract Repository</h1>
        <p className="mt-1 text-sm text-neutral-500">Search, open and review all contracts you own or are assigned to</p>
      </header>

      <main className="px-8 py-6">
        <SearchFilterPanel disabled={isEmptyRepository} onSearch={handleSearch} />

        <section>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-neutral-100">Contracts</h2>
            <p className="text-xs text-neutral-500">Full text search includes extracted PDF/DOCX document content, not only metadata</p>
          </div>

          {indexingExcluded && !isEmptyRepository && <IndexingInProgressBanner />}

          {error && (
            <div className="flex items-center justify-between rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <span>{error.message || 'Failed to load contracts.'}</span>
              <button
                type="button"
                onClick={refetch}
                className="rounded-md border border-red-500/60 px-3 py-1 text-xs font-medium hover:bg-red-500/10"
              >
                Retry
              </button>
            </div>
          )}

          {!error && isLoading && (
            <div className="overflow-hidden rounded-xl border border-neutral-800">
              <div className="animate-pulse divide-y divide-neutral-800">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 bg-neutral-900/60" />
                ))}
              </div>
            </div>
          )}

          {!error && !isLoading && isEmptyRepository && <EmptyRepositoryState />}

          {!error && !isLoading && !isEmptyRepository && totalCount === 0 && <NoResultsMessage />}

          {!error && !isLoading && !isEmptyRepository && totalCount > 0 && (
            <>
              <ContractListTable
                contracts={data}
                onRowClick={(contractId) => navigate(`/contracts/${contractId}`)}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                searchText={filters.searchText}
              />

              <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                <span>
                  Showing {rangeStart}-{rangeEnd} of {totalCount} contracts visible to Owner, Reviewer, Approver or
                  Tenant Admin
                </span>
                {totalPages > 1 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-md border border-neutral-700 px-3 py-1.5 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="rounded-md border border-neutral-700 px-3 py-1.5 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
