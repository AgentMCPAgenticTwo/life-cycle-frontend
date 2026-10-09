import { useEffect } from 'react';
import { useAuditLog } from '@/features/clause-analysis/hooks/useAuditLog';

// Read-only viewer of the immutable Accept/Edit/Reject/Metadata/AskAI audit
// trail (UC4-BR-006). Rendered as a slide-over panel opened from the page
// header — the target design does not show this surface explicitly, so its
// placement/trigger is a judgement call (see blockers).
export default function AuditLogViewer({ contractId, onClose }) {
  const { data, isLoading, error, load } = useAuditLog(contractId);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/70">
      <div className="h-full w-full max-w-lg overflow-y-auto border-l border-neutral-800 bg-neutral-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-100">Audit Log</h2>
          <button type="button" onClick={onClose} className="text-sm text-neutral-400 hover:text-neutral-200">
            Close
          </button>
        </div>

        {isLoading && <p className="mt-6 text-sm text-neutral-500">Loading audit log…</p>}
        {error && <p className="mt-6 text-sm text-red-400">{error.message}</p>}

        {data && data.items.length === 0 && (
          <p className="mt-6 text-sm text-neutral-500">No audit entries recorded yet.</p>
        )}

        {data && data.items.length > 0 && (
          <ul className="mt-4 space-y-3">
            {data.items.map((entry) => (
              <li key={entry.id} className="rounded-md border border-neutral-800 bg-neutral-950 p-3">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{entry.userName}</span>
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-neutral-200">{entry.actionType}</p>
                {entry.fieldName && <p className="text-xs text-neutral-500">Field: {entry.fieldName}</p>}
                {(entry.beforeText || entry.afterText) && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-neutral-600">Before</p>
                      <p className="text-neutral-400">{entry.beforeText || '—'}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">After</p>
                      <p className="text-neutral-400">{entry.afterText || '—'}</p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
