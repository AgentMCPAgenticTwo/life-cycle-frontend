import StatusBadge from '@/features/contracts/components/StatusBadge';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/**
 * Lists contracts awaiting the current user's review, approval or signature
 * (UC1-GC-001). Columns: Contract Name, Counterparty, Status, Due Date.
 */
export default function MyTasksPanel({ tasks, onRowClick, isLoading, error, onRetry }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="text-sm font-semibold text-neutral-100">My Tasks</h2>

      {error && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span>{error.message || 'Failed to load My Tasks.'}</span>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-red-500/60 px-3 py-1 text-xs font-medium hover:bg-red-500/10"
          >
            Retry
          </button>
        </div>
      )}

      {!error && isLoading && (
        <div className="mt-4 animate-pulse space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-800/60" />
          ))}
        </div>
      )}

      {!error && !isLoading && tasks && tasks.items.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">{tasks.emptyMessage || 'You have no pending tasks'}</p>
      )}

      {!error && !isLoading && tasks && tasks.items.length > 0 && (
        <ul className="mt-3 divide-y divide-neutral-800">
          {tasks.items.map((task) => (
            <li key={task.contractId}>
              <button
                type="button"
                onClick={() => onRowClick(task.contractId)}
                className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-neutral-900/40"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-neutral-100">{task.contractName}</span>
                  <span className="block truncate text-xs text-neutral-500">{task.counterparty}</span>
                </span>
                <StatusBadge status={task.status} />
                <span className="shrink-0 text-xs text-neutral-400">{formatDate(task.dueDate)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
