function formatThreshold(value) {
  if (typeof value !== 'number') return '—';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Approval matrix table with Add Rule action (UC11-GC-002 / UC11-MF-001).
 * Columns are exactly Contract Type, Value Threshold, Approver Role.
 */
export default function RoutingApprovalTab({ rules, isLoading, error, onRetry, onAddRule }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-100">Routing &amp; Approval</h2>
          <p className="mt-1 text-xs text-neutral-500">Approval matrix applied to contracts by type and value</p>
        </div>
        <button
          type="button"
          onClick={onAddRule}
          className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          + Add Rule
        </button>
      </div>

      <div className="mt-5">
        {isLoading && <p className="text-sm text-neutral-500">Loading approval rules…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error.message || 'Unable to load approval rules.'}
            {onRetry && (
              <button type="button" onClick={onRetry} className="ml-3 font-medium text-red-200 underline">
                Retry
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && (!rules || rules.length === 0) && (
          <p className="text-sm text-neutral-500">No approval rules configured yet.</p>
        )}

        {!isLoading && !error && rules && rules.length > 0 && (
          <ul className="divide-y divide-neutral-800/60">
            {rules.map((rule) => (
              <li key={rule.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    ◎
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-100">{rule.contractType}</p>
                    <p className="text-xs text-neutral-500">Threshold &gt; {formatThreshold(rule.valueThreshold)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-100">{rule.approverRole}</p>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Approver Role</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
