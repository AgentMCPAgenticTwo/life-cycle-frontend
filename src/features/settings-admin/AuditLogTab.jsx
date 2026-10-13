import AuditLogFilterPanel from '@/features/settings-admin/AuditLogFilterPanel';

function formatLogDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/**
 * Read-only audit log table sorted newest first with Filter Date Range
 * (UC11-GC-003 / UC11-FV-005). No edit or delete control is ever rendered
 * here, regardless of role (UC11-AF-006 / UC11-BR-005 / UC11-BR-011).
 */
export default function AuditLogTab({ entries, isLoading, error, onRetry, onApplyFilter }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-100">Audit Log</h2>
        <p className="mt-1 text-xs text-neutral-500">Read-only record of system activity, newest first</p>
      </div>

      <div className="mt-4">
        <AuditLogFilterPanel onApplyFilter={onApplyFilter} />
      </div>

      <div className="mt-5">
        {isLoading && <p className="text-sm text-neutral-500">Loading audit log…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error.message || 'Unable to load the audit log.'}
            {onRetry && (
              <button type="button" onClick={onRetry} className="ml-3 font-medium text-red-200 underline">
                Retry
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && (!entries || entries.length === 0) && (
          <p className="text-sm text-neutral-500">No audit log entries recorded yet.</p>
        )}

        {!isLoading && !error && entries && entries.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 font-medium">Log Date/Time</th>
                <th className="py-2 font-medium">Log User</th>
                <th className="py-2 font-medium">Log Action</th>
                <th className="py-2 font-medium">Log Entity</th>
                <th className="py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-neutral-800/60 last:border-0">
                  <td className="py-3 text-neutral-400">{formatLogDateTime(entry.logDateTime)}</td>
                  <td className="py-3 text-neutral-100">{entry.logUser}</td>
                  <td className="py-3 text-neutral-400">{entry.logAction}</td>
                  <td className="py-3 text-neutral-400">{entry.logEntity}</td>
                  <td className="py-3 text-neutral-500">{entry.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
