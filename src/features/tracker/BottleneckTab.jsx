import TrackerEmptyState from '@/features/tracker/TrackerEmptyState';
import { useBottleneckThresholds } from '@/features/tracker/hooks/useBottleneckThresholds';

/**
 * Current Stage, Days in Current Stage, Stuck Flag table (UC10-GC-003 / UC10-BR-002).
 */
export default function BottleneckTab({ data, isLoading, error, onRetry }) {
  const { thresholds } = useBottleneckThresholds();

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Loading Bottleneck data…</p>;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
        <p>{error.message || 'Unable to load Bottleneck data.'}</p>
        <button type="button" onClick={onRetry} className="mt-2 text-xs font-medium text-red-200 underline">
          Retry
        </button>
      </div>
    );
  }

  const rows = data?.rows || [];

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">Bottleneck Detection</h3>
        {thresholds.length > 0 && (
          <p className="text-xs text-neutral-500">
            Stuck-flag thresholds: {thresholds.map((t) => `${t.stage} ${t.thresholdDays}d`).join(' · ')}
          </p>
        )}
      </div>

      {data?.isEmpty || rows.length === 0 ? (
        <TrackerEmptyState message={data?.emptyStateMessage || 'No contracts match the current filters.'} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 pr-4">Contract Name</th>
                <th className="py-2 pr-4">Owner Name</th>
                <th className="py-2 pr-4">Current Stage</th>
                <th className="py-2 pr-4">Days in Current Stage</th>
                <th className="py-2 pr-4">Stuck Flag</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.contractId} className="border-b border-neutral-900 text-neutral-200">
                  <td className="py-3 pr-4 font-medium">{row.contractName}</td>
                  <td className="py-3 pr-4">{row.ownerName || '—'}</td>
                  <td className="py-3 pr-4">{row.currentStage}</td>
                  <td className="py-3 pr-4">{row.daysInCurrentStage}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.stuckFlag === 'Yes'
                          ? 'bg-red-500/10 text-red-300'
                          : 'bg-emerald-500/10 text-emerald-300'
                      }`}
                    >
                      {row.stuckFlag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
