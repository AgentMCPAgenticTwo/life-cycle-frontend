import { useActivityLog } from '@/features/contract-repository/hooks/useActivityLog';
import { formatDateTime } from '@/features/contract-repository/utils/format';

const ACTION_LABELS = {
  Create: 'Contract record created',
  Edit: 'Contract edited',
  Approve: 'Approval granted',
  Reject: 'Contract rejected',
  Sign: 'Contract signed',
  Tag: 'Folder/Tag updated',
  STATUS_CHANGE: 'Status changed',
};

/**
 * Read-only, immutable Activity Log display (UC8-BR-003 / UC8-BR-007). No
 * edit or delete affordance is rendered for any entry, for any role.
 */
export default function ContractActivityLogTab({ contractId }) {
  const { data, isLoading, error } = useActivityLog(contractId);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="text-sm font-semibold text-neutral-100">Activity Log</h2>
      <p className="mt-0.5 text-xs text-neutral-500">Read-only, time-stamped record of every action</p>

      {isLoading && <p className="mt-4 text-sm text-neutral-500">Loading activity…</p>}
      {error && <p className="mt-4 text-sm text-red-400">Unable to load the activity log.</p>}
      {!isLoading && !error && data.length === 0 && (
        <p className="mt-4 text-sm text-neutral-500">No activity recorded for this contract yet.</p>
      )}

      {!isLoading && !error && data.length > 0 && (
        <ul className="mt-4 space-y-4">
          {data
            .slice()
            .sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt))
            .map((entry) => (
              <li key={entry.entryId} className="flex items-start justify-between gap-4 border-b border-neutral-800/70 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-400">
                    •
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-100">
                      {ACTION_LABELS[entry.actionType] ?? entry.actionType}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {entry.details ? `${entry.details} · ` : ''}by {entry.performedBy}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-neutral-500">{formatDateTime(entry.performedAt)}</span>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
