import { useState } from 'react';
import TrackerEmptyState from '@/features/tracker/TrackerEmptyState';

/**
 * Contract Name/Type, Estimated/Actual Turnaround, Variance table with
 * color coding (UC10-GC-004 / UC10-BR-003 / UC10-BR-004 / UC10-BR-007).
 */
export default function TurnaroundTab({ data, isLoading, error, onRetry, onOverride, isOverriding }) {
  const [editingContractId, setEditingContractId] = useState(null);
  const [overrideValue, setOverrideValue] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Loading Turnaround data…</p>;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
        <p>{error.message || 'Unable to load Turnaround data.'}</p>
        <button type="button" onClick={onRetry} className="mt-2 text-xs font-medium text-red-200 underline">
          Retry
        </button>
      </div>
    );
  }

  const rows = data?.rows || [];

  function startEditing(row) {
    setEditingContractId(row.contractId);
    setOverrideValue(row.estimatedTurnaround != null ? String(row.estimatedTurnaround) : '');
    setOverrideReason('');
  }

  async function submitOverride(row) {
    const newEstimatedTurnaround = Number(overrideValue);
    if (Number.isNaN(newEstimatedTurnaround)) return;
    await onOverride(row.contractId, {
      newEstimatedTurnaround,
      overrideReason: overrideReason || null,
      originalAiSuggestedValue: row.estimatedTurnaround ?? null,
    });
    setEditingContractId(null);
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-200">Turnaround</h3>

      {data?.isEmpty || rows.length === 0 ? (
        <TrackerEmptyState message={data?.emptyStateMessage || 'No contracts match the current filters.'} />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 pr-4">Contract Name</th>
                <th className="py-2 pr-4">Contract Type</th>
                <th className="py-2 pr-4">Estimated Turnaround (Days)</th>
                <th className="py-2 pr-4">Actual Turnaround (Days)</th>
                <th className="py-2 pr-4">Variance (Days)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.contractId} className="border-b border-neutral-900 text-neutral-200">
                  <td className="py-3 pr-4 font-medium">{row.contractName}</td>
                  <td className="py-3 pr-4">{row.contractType}</td>
                  <td className="py-3 pr-4">
                    {editingContractId === row.contractId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={overrideValue}
                          onChange={(e) => setOverrideValue(e.target.value)}
                          className="w-20 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-neutral-100"
                        />
                        <button
                          type="button"
                          disabled={isOverriding}
                          onClick={() => submitOverride(row)}
                          className="text-xs font-medium text-emerald-400 underline"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingContractId(null)}
                          className="text-xs font-medium text-neutral-400 underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : row.estimatedTurnaroundNotSet ? (
                      <span className="text-neutral-500">Not Set</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{row.estimatedTurnaround}</span>
                        {row.estimatedTurnaroundSource === 'AI_SUGGESTED' && (
                          <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-300">
                            AI Suggested
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => startEditing(row)}
                          className="text-xs font-medium text-neutral-400 underline"
                        >
                          Override
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">{row.actualTurnaround ?? '—'}</td>
                  <td className="py-3 pr-4">
                    {row.variance != null ? (
                      <span className={row.varianceColor === 'RED' ? 'font-medium text-red-400' : 'font-medium text-emerald-400'}>
                        {row.variance}
                      </span>
                    ) : (
                      '—'
                    )}
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
