import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useContractRepository } from '@/features/contracts/hooks/useContractRepository';
import { useContractDetail } from '@/features/contracts/hooks/useContractDetail';
import StatusBadge from '@/features/contracts/components/StatusBadge';
import { HttpError } from '@/services/http';

const FILTER_KEYS = [
  'status',
  'contractType',
  'department',
  'counterpartyId',
  'ownerId',
  'dateRangeStart',
  'dateRangeEnd',
];

const STATUS_OPTIONS = [
  'Draft',
  'In Negotiation',
  'Pending Approval',
  'Pending Signature',
  'Executed',
];

const FILTER_LABELS = {
  status: 'Status',
  contractType: 'Contract Type',
  department: 'Department',
  counterpartyId: 'Counterparty',
  ownerId: 'Owner',
  dateRangeStart: 'From',
  dateRangeEnd: 'To',
};

const PAGE_SIZE = 20;

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function formatCurrency(value, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

function readInitialFilters(locationState, searchParams) {
  if (locationState && typeof locationState === 'object') {
    const fromState = {};
    FILTER_KEYS.forEach((key) => {
      if (locationState[key]) fromState[key] = locationState[key];
    });
    if (Object.keys(fromState).length) return fromState;
  }
  const fromQuery = {};
  FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value) fromQuery[key] = value;
  });
  return fromQuery;
}

/**
 * ContractRepositoryListPage — opens pre-filtered by the status and dashboard
 * filters selected on the Dashboard (UC1-BR-007 / UC1-FV-001), and enforces
 * role-based access when navigating into a contract's detail screen (UC1-AF-006).
 */
export default function ContractRepositoryListPage({ initialFilters: initialFiltersProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() =>
    initialFiltersProp && Object.keys(initialFiltersProp).length
      ? initialFiltersProp
      : readInitialFilters(location.state?.initialFilters, searchParams)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [accessMessage, setAccessMessage] = useState(null);
  const [pendingRowId, setPendingRowId] = useState(null);

  useEffect(() => {
    const next = new URLSearchParams();
    FILTER_KEYS.forEach((key) => {
      if (filters[key]) next.set(key, filters[key]);
    });
    setSearchParams(next, { replace: true });
  }, [filters, setSearchParams]);

  const queryFilters = useMemo(
    () => ({ ...filters, search: searchTerm || undefined, sortBy, sortOrder, page, pageSize: PAGE_SIZE }),
    [filters, searchTerm, sortBy, sortOrder, page]
  );

  const { data, isLoading, error, refetch } = useContractRepository(queryFilters);
  const { fetchContract } = useContractDetail();

  const activeFilterEntries = FILTER_KEYS.filter((key) => filters[key]).map((key) => [key, filters[key]]);

  function handleStatusPillClick(status) {
    setPage(1);
    setFilters((prev) => {
      const next = { ...prev };
      if (prev.status === status) {
        delete next.status;
      } else {
        next.status = status;
      }
      return next;
    });
  }

  function handleRemoveFilter(key) {
    setPage(1);
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleClearAll() {
    setPage(1);
    setFilters({});
    setSearchTerm('');
  }

  function handleSort(column) {
    setPage(1);
    setSortOrder((prev) => (sortBy === column && prev === 'asc' ? 'desc' : 'asc'));
    setSortBy(column);
  }

  async function handleRowClick(id) {
    setAccessMessage(null);
    setPendingRowId(id);
    try {
      const contract = await fetchContract(id);
      navigate(`/contracts/${contract.id}`);
    } catch (err) {
      if (err instanceof HttpError && (err.status === 403 || err.status === 401)) {
        setAccessMessage('You do not have access to this contract');
      } else {
        setAccessMessage('Unable to open this contract. Please try again.');
      }
    } finally {
      setPendingRowId(null);
    }
  }

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Dashboard
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Contract Repository</span>
        </nav>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Contract Repository</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {isLoading ? 'Loading contracts…' : `${totalCount} contract${totalCount === 1 ? '' : 's'} found`}
        </p>
      </header>

      <main className="px-8 py-6">
        <section className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-neutral-400">Status</span>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusPillClick(status)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  filters.status === status
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                }`}
              >
                {status}
              </button>
            ))}

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setPage(1);
                setSearchTerm(event.target.value);
              }}
              placeholder="Search contract name…"
              className="ml-auto w-64 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {activeFilterEntries.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-800 pt-4">
              <span className="text-xs text-neutral-500">Carried over from Dashboard:</span>
              {activeFilterEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300"
                >
                  {FILTER_LABELS[key]}: {value}
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter(key)}
                    aria-label={`Remove ${FILTER_LABELS[key]} filter`}
                    className="text-neutral-500 hover:text-neutral-200"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {accessMessage && (
          <div
            role="alert"
            className="mb-4 flex items-center justify-between rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
          >
            <span>{accessMessage}</span>
            <button
              type="button"
              onClick={() => setAccessMessage(null)}
              className="text-amber-300 hover:text-amber-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
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

        {!error && !isLoading && data && data.items.length === 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-6 py-16 text-center text-neutral-400">
            {data.noMatchMessage || 'No contracts match the selected filters'}
          </div>
        )}

        {!error && !isLoading && data && data.items.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-xl border border-neutral-800">
              <table className="min-w-full divide-y divide-neutral-800 text-sm">
                <thead className="bg-neutral-900/80 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <SortableHeader label="Contract Name" column="contractName" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Counterparty</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <SortableHeader label="Start Date" column="startDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="End Date" column="endDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <th className="px-4 py-3 text-right font-medium">Value</th>
                    <th className="px-4 py-3 text-right font-medium">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {data.items.map((contract) => (
                    <tr
                      key={contract.id}
                      onClick={() => handleRowClick(contract.id)}
                      className={`cursor-pointer transition-colors hover:bg-neutral-900/70 ${
                        pendingRowId === contract.id ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-100">{contract.contractName}</td>
                      <td className="px-4 py-3 text-neutral-300">{contract.contractType}</td>
                      <td className="px-4 py-3 text-neutral-400">{contract.department || '—'}</td>
                      <td className="px-4 py-3 text-neutral-300">{contract.counterpartyName}</td>
                      <td className="px-4 py-3 text-neutral-300">{contract.contractOwnerName}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={contract.status} />
                      </td>
                      <td className="px-4 py-3 text-neutral-400">{formatDate(contract.startDate)}</td>
                      <td className="px-4 py-3 text-neutral-400">{formatDate(contract.endDate)}</td>
                      <td className="px-4 py-3 text-right text-neutral-200">
                        {formatCurrency(contract.contractValue, contract.currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-400">
                        {contract.riskScore ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-neutral-400">
              <span>
                Page {page} of {totalPages}
              </span>
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
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SortableHeader({ label, column, sortBy, sortOrder, onSort }) {
  const isActive = sortBy === column;
  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`flex items-center gap-1 ${isActive ? 'text-emerald-400' : ''}`}
      >
        {label}
        {isActive && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </th>
  );
}
