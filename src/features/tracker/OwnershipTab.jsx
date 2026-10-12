import TrackerEmptyState from '@/features/tracker/TrackerEmptyState';

/**
 * Contracts by Owner table with per-status counts (UC10-GC-001 / UC10-MF-001).
 */
export default function OwnershipTab({ data, isLoading, error, onRetry, periodLabel }) {
  if (isLoading) {
    return <p className="text-sm text-neutral-500">Loading Ownership data…</p>;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
        <p>{error.message || 'Unable to load Ownership data.'}</p>
        <button type="button" onClick={onRetry} className="mt-2 text-xs font-medium text-red-200 underline">
          Retry
        </button>
      </div>
    );
  }

  const rows = data?.rows || [];

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-200">Contracts by Owner</h3>
        {periodLabel && <p className="text-xs text-neutral-500">{periodLabel}</p>}
      </div>

      {data?.isEmpty || rows.length === 0 ? (
        <TrackerEmptyState message={data?.emptyStateMessage || 'No contracts match the current filters.'} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 pr-4">Owner Name</th>
                <th className="py-2 pr-4">Contracts Owned</th>
                <th className="py-2 pr-4">In Draft</th>
                <th className="py-2 pr-4">In Negotiation</th>
                <th className="py-2 pr-4">In Approval</th>
                <th className="py-2 pr-4">In Signature</th>
                <th className="py-2 pr-4">Completed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ownerName} className="border-b border-neutral-900 text-neutral-200">
                  <td className="py-3 pr-4 font-medium">{row.ownerName}</td>
                  <td className="py-3 pr-4">{row.contractsOwned}</td>
                  <td className="py-3 pr-4">{row.inDraftCount}</td>
                  <td className="py-3 pr-4">{row.inNegotiationCount}</td>
                  <td className="py-3 pr-4">{row.inApprovalCount}</td>
                  <td className="py-3 pr-4">{row.inSignatureCount}</td>
                  <td className="py-3 pr-4">{row.completedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
