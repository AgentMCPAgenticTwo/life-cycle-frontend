// Blocking modal shown when a save is rejected due to a concurrent clause
// update, prompting refresh (UC4-AF-004).
export default function ConcurrentEditConflictModal({ onRefresh }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 px-4">
      <div role="alertdialog" className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="text-base font-semibold text-neutral-100">Clause updated by another user</h2>
        <p className="mt-2 text-sm text-neutral-400">
          This clause was just updated by another user. Please refresh to see the latest version.
        </p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
