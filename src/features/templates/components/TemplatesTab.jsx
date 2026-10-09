import LibraryStatusBadge from '@/features/templates/components/LibraryStatusBadge';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/**
 * Templates list grid: Template Name, Category, Status, Last Modified By,
 * Last Modified Date (UC3-GC-001), plus an Actions column (Version History /
 * Deactivate or Reactivate) for Tenant Admin and Legal Reviewer.
 */
export default function TemplatesTab({
  templates,
  onSelect,
  onVersionHistory,
  onDeactivate,
  onReactivate,
  canManage,
  canDeactivate,
  pendingActionId,
  isLoading,
  error,
  onRetry,
}) {
  const items = templates?.items ?? [];

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100">Templates</h2>
          <p className="mt-1 text-xs text-neutral-500">Templates available for use in new contracts (UC2)</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span>{error.message || 'Failed to load templates.'}</span>
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-800/60" />
          ))}
        </div>
      )}

      {!error && !isLoading && items.length === 0 && (
        <p className="mt-6 text-sm text-neutral-500">No templates yet. Click New Template to get started.</p>
      )}

      {!error && !isLoading && items.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-800">
          <table className="min-w-full divide-y divide-neutral-800 text-sm">
            <thead className="bg-neutral-900/80 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Template Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Modified By</th>
                <th className="px-4 py-3 font-medium">Last Modified Date</th>
                {canManage && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {items.map((template) => (
                <tr key={template.id} className="hover:bg-neutral-900/70">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(template.id)}
                      className="font-medium text-neutral-100 hover:text-emerald-400"
                    >
                      {template.templateName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{template.templateCategory}</td>
                  <td className="px-4 py-3">
                    <LibraryStatusBadge status={template.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{template.lastModifiedBy}</td>
                  <td className="px-4 py-3 text-neutral-400">{formatDate(template.lastModifiedDate)}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onVersionHistory(template.id)}
                          className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                        >
                          Version History
                        </button>
                        {template.status === 'Active' ? (
                          <button
                            type="button"
                            disabled={!canDeactivate || pendingActionId === template.id}
                            onClick={() => onDeactivate(template.id)}
                            className="rounded-md border border-red-500/60 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canDeactivate || pendingActionId === template.id}
                            onClick={() => onReactivate(template.id)}
                            className="rounded-md border border-emerald-500/60 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
