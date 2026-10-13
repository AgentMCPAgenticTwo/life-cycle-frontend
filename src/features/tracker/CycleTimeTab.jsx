import TrackerEmptyState from '@/features/tracker/TrackerEmptyState';

const STAGES = ['Drafting', 'Negotiation', 'Approval', 'Signature'];

/**
 * Average Cycle Time per stage table and bar chart, grouped by user and
 * contract type (UC10-GC-002 / UC10-BR-001).
 */
export default function CycleTimeTab({ data, isLoading, error, onRetry }) {
  if (isLoading) {
    return <p className="text-sm text-neutral-500">Loading Cycle Time data…</p>;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
        <p>{error.message || 'Unable to load Cycle Time data.'}</p>
        <button type="button" onClick={onRetry} className="mt-2 text-xs font-medium text-red-200 underline">
          Retry
        </button>
      </div>
    );
  }

  const rows = data?.rows || [];

  if (data?.isEmpty || rows.length === 0) {
    return (
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
        <TrackerEmptyState message={data?.emptyStateMessage || 'No stage data for the current filters.'} />
      </section>
    );
  }

  const maxAverage = Math.max(1, ...rows.map((r) => r.averageCycleTime || 0));

  const stageAverages = STAGES.map((stage) => {
    const stageRows = rows.filter((r) => r.stage === stage && r.averageCycleTime != null);
    const avg = stageRows.length
      ? stageRows.reduce((sum, r) => sum + r.averageCycleTime, 0) / stageRows.length
      : null;
    return { stage, avg };
  });

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-200">Average Cycle Time per Stage</h3>

      <div className="mt-4 flex items-end gap-6 border-b border-neutral-800 pb-6">
        {stageAverages.map(({ stage, avg }) => (
          <div key={stage} className="flex flex-col items-center gap-2">
            <div className="flex h-24 items-end">
              <div
                className="w-10 rounded-t bg-emerald-500"
                style={{ height: avg == null ? 2 : `${Math.max(4, (avg / maxAverage) * 96)}px` }}
              />
            </div>
            <span className="text-xs text-neutral-400">{stage}</span>
            <span className="text-xs font-medium text-neutral-200">{avg == null ? 'Not available' : `${avg.toFixed(1)}d`}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-2 pr-4">Stage</th>
              <th className="py-2 pr-4">Owner Name</th>
              <th className="py-2 pr-4">Contract Type</th>
              <th className="py-2 pr-4">Contracts Owned</th>
              <th className="py-2 pr-4">Average Cycle Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.stage}-${row.ownerName || ''}-${row.contractType || ''}-${i}`} className="border-b border-neutral-900 text-neutral-200">
                <td className="py-3 pr-4 font-medium">{row.stage}</td>
                <td className="py-3 pr-4">{row.ownerName || '—'}</td>
                <td className="py-3 pr-4">{row.contractType || '—'}</td>
                <td className="py-3 pr-4">{row.contractsOwned ?? '—'}</td>
                <td className="py-3 pr-4">{row.averageCycleTime != null ? `${row.averageCycleTime.toFixed(1)}d` : 'Not available'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
