import { useApprovalHistory } from '@/features/approvals/hooks/useApprovalHistory';

const ACTION_LABELS = {
  Approve: 'Approved',
  Reject: 'Rejected',
  SendBack: 'Sent Back',
  Delegate: 'Delegated',
};

const ACTION_STYLES = {
  Approve: 'text-emerald-400',
  Reject: 'text-red-400',
  SendBack: 'text-amber-400',
  Delegate: 'text-sky-400',
};

/**
 * Immutable list of prior approval decisions, timestamps, actors and
 * comments, retained for 7 years (UC6-BR-010, UC6-BR-012, UC6-BR-013).
 */
export default function ApprovalHistoryTab({ approvalId }) {
  const { data, isLoading, error, refetch } = useApprovalHistory(approvalId);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="border-b border-neutral-800 pb-3">
        <span className="border-b-2 border-emerald-500 pb-3 text-sm font-semibold text-emerald-400">
          Approval History
        </span>
      </div>

      {isLoading && <p className="mt-4 text-sm text-neutral-500">Loading approval history…</p>}

      {!isLoading && error && (
        <div role="alert" className="mt-4 rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <p>{error.message || 'Failed to load approval history'}</p>
          <button type="button" onClick={refetch} className="mt-2 font-medium text-red-200 underline">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (data?.items?.length ?? 0) === 0 && (
        <p className="mt-4 text-sm text-neutral-500">No approval decisions have been recorded yet.</p>
      )}

      {!isLoading && !error && (data?.items?.length ?? 0) > 0 && (
        <ul className="mt-4 flex flex-col gap-4">
          {data.items.map((entry) => (
            <li key={entry.id} className="border-b border-neutral-800 pb-4 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-neutral-100">
                  {entry.approvalMatrixStepLabel} · {entry.actorName}
                  {entry.delegateToName ? ` (Delegate: ${entry.delegateToName})` : ''}
                </p>
                <span className={`text-sm font-semibold ${ACTION_STYLES[entry.action] || 'text-neutral-300'}`}>
                  {ACTION_LABELS[entry.action] || entry.action}
                </span>
              </div>
              {entry.comments && <p className="mt-1 text-sm italic text-neutral-400">&ldquo;{entry.comments}&rdquo;</p>}
              <p className="mt-1 text-xs text-neutral-600">{new Date(entry.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
