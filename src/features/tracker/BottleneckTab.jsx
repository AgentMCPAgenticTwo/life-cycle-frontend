import { useState } from 'react';
import TrackerEmptyState from '@/features/tracker/TrackerEmptyState';
import { useBottleneckThresholds } from '@/features/tracker/hooks/useBottleneckThresholds';

const INVALID_THRESHOLD_MESSAGE = 'Days per stage must be a positive number.';

/**
 * Current Stage, Days in Current Stage, Stuck Flag table (UC10-GC-003 / UC10-BR-002).
 * A Tenant Admin can edit the days per stage; saving refreshes the rows so the
 * Stuck Flag reflects the new thresholds immediately.
 */
export default function BottleneckTab({ data, isLoading, error, onRetry }) {
  const { thresholds, canEdit, saveThresholds, isSaving } = useBottleneckThresholds();
  const [draft, setDraft] = useState(null);
  const [thresholdError, setThresholdError] = useState(null);

  function startEditing() {
    setThresholdError(null);
    setDraft(thresholds.map((t) => ({ stage: t.stage, thresholdDays: String(t.thresholdDays) })));
  }

  async function handleSaveThresholds() {
    const invalid = draft.some((row) => {
      const days = Number(row.thresholdDays);
      return row.thresholdDays.trim() === '' || !Number.isFinite(days) || days <= 0;
    });
    if (invalid) {
      setThresholdError(INVALID_THRESHOLD_MESSAGE);
      return;
    }
    try {
      await saveThresholds(draft.map((row) => ({ stage: row.stage, thresholdDays: Number(row.thresholdDays) })));
      setDraft(null);
      setThresholdError(null);
      onRetry?.();
    } catch (err) {
      setThresholdError(err.message || 'Unable to save thresholds. Please try again.');
    }
  }

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
        {thresholds.length > 0 && !draft && (
          <div className="flex items-center gap-3">
            <p className="text-xs text-neutral-500">
              Stuck-flag thresholds: {thresholds.map((t) => `${t.stage} ${t.thresholdDays}d`).join(' · ')}
            </p>
            {canEdit && (
              <button
                type="button"
                onClick={startEditing}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                Edit Thresholds
              </button>
            )}
          </div>
        )}
      </div>

      {draft && (
        <div className="mb-5 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Stuck-flag thresholds</h4>
          <div className="mt-3 flex flex-wrap gap-4">
            {draft.map((row, index) => (
              <label key={row.stage} className="flex flex-col gap-1">
                <span className="text-xs text-neutral-400">{row.stage}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  aria-label={`${row.stage} threshold days`}
                  value={row.thresholdDays}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, thresholdDays: e.target.value } : item))
                    )
                  }
                  disabled={isSaving}
                  className="w-28 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100"
                />
              </label>
            ))}
          </div>
          {thresholdError && (
            <p role="alert" className="mt-3 text-xs text-red-300">
              {thresholdError}
            </p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveThresholds}
              disabled={isSaving}
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save Thresholds'}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setThresholdError(null);
              }}
              disabled={isSaving}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
