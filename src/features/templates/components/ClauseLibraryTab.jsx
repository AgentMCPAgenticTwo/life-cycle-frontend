import RiskLevelBadge from '@/features/templates/components/RiskLevelBadge';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/**
 * Clause Library list grid: Clause Name, Category, Risk Level (colour-coded),
 * Mandatory, Last Modified (UC3-GC-002). Row click opens the ClauseEditor,
 * which hosts Version History / Deactivate / Reactivate for the selected clause.
 */
export default function ClauseLibraryTab({ clauses, onSelect, isLoading, error, onRetry }) {
  const items = clauses?.items ?? [];

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div>
        <h2 className="text-sm font-semibold text-neutral-100">Clause Library</h2>
        <p className="mt-1 text-xs text-neutral-500">Standard clauses available for assembly into templates and contracts</p>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span>{error.message || 'Failed to load clauses.'}</span>
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-800/60" />
          ))}
        </div>
      )}

      {!error && !isLoading && items.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">No clauses yet. Click New Clause to get started.</p>
      )}

      {!error && !isLoading && items.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-800">
          <table className="min-w-full divide-y divide-neutral-800 text-sm">
            <thead className="bg-neutral-900/80 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Clause Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Risk Level</th>
                <th className="px-4 py-3 font-medium">Mandatory</th>
                <th className="px-4 py-3 font-medium">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {items.map((clause) => (
                <tr key={clause.id} className="hover:bg-neutral-900/70">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(clause.id)}
                      className="font-medium text-neutral-100 hover:text-emerald-400"
                    >
                      {clause.clauseName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{clause.clauseCategory}</td>
                  <td className="px-4 py-3">
                    <RiskLevelBadge riskLevel={clause.riskLevel} />
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{clause.mandatory ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-neutral-400">{formatDate(clause.lastModifiedDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
