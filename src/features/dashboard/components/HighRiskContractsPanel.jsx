function riskTone(score) {
  if (score >= 90) return 'text-red-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-neutral-300';
}

/**
 * Lists AI-flagged contracts above the risk threshold, ordered by risk score
 * descending (UC1-GC-002). Risk scores are read-only suggestions: clicking a
 * row opens the contract detail screen, but there is no accept/reject control
 * for the score itself (UC1-BR-005 — that action lives in UC4).
 */
export default function HighRiskContractsPanel({ contracts, onRowClick, isLoading, error, onRetry }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="text-sm font-semibold text-neutral-100">High Risk Contracts</h2>
      <p className="mt-1 text-xs text-neutral-500">AI-generated risk suggestions. Accept/reject actions are handled in contract review.</p>

      {error && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span>{error.message || 'Failed to load High Risk Contracts.'}</span>
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

      {!error && !isLoading && contracts && contracts.items.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">{contracts.emptyMessage || 'No high risk contracts found'}</p>
      )}

      {!error && !isLoading && contracts && contracts.items.length > 0 && (
        <ul className="mt-3 divide-y divide-neutral-800">
          {contracts.items.map((contract) => (
            <li key={contract.contractId}>
              <button
                type="button"
                onClick={() => onRowClick(contract.contractId)}
                className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-neutral-900/40"
              >
                <span className="flex min-w-0 flex-1 items-start gap-2">
                  <span aria-hidden="true" className="mt-0.5 text-amber-400">⚠</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-neutral-100">{contract.contractName}</span>
                    <span className="block truncate text-xs text-neutral-500">{contract.counterparty}</span>
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`block text-sm font-semibold tabular-nums ${riskTone(contract.riskScore)}`}>
                    {contract.riskScore}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wide text-neutral-500">Risk Score</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
