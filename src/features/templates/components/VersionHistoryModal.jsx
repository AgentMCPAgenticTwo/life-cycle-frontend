function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/**
 * Displays Version Number, Changed By, Date Changed and Change Summary for a
 * selected template or clause (UC3-GC-003). Every saved change creates a new
 * read-only entry — no version may be edited in place (BR-2 / BR-14).
 */
export default function VersionHistoryModal({ title, subtitle, versions, isLoading, error, onRetry, onClose }) {
  const items = versions?.items ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/80 px-4 py-10">
      <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Version History</h1>
            <p className="mt-1 text-sm text-neutral-500">{title}{subtitle ? ` — ${subtitle}` : ''}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:border-neutral-500"
          >
            × Close
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="text-sm font-semibold text-neutral-100">Prior Versions</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Every saved change creates a new read-only entry — no version may be edited in place
          </p>

          {error && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <span>{error.message || 'Failed to load version history.'}</span>
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
                <div key={i} className="h-10 rounded-lg bg-neutral-800/60" />
              ))}
            </div>
          )}

          {!error && !isLoading && items.length === 0 && (
            <p className="mt-6 text-sm text-neutral-500">No version history yet.</p>
          )}

          {!error && !isLoading && items.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-800">
              <table className="min-w-full divide-y divide-neutral-800 text-sm">
                <thead className="bg-neutral-900/80 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Version Number</th>
                    <th className="px-4 py-3 font-medium">Changed By</th>
                    <th className="px-4 py-3 font-medium">Date Changed</th>
                    <th className="px-4 py-3 font-medium">Change Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {items.map((version) => (
                    <tr key={version.versionNumber}>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-200">
                          v{version.versionNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-200">{version.changedBy}</td>
                      <td className="px-4 py-3 text-neutral-400">{formatDateTime(version.dateChanged)}</td>
                      <td className="px-4 py-3 text-neutral-300">{version.changeSummary || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
