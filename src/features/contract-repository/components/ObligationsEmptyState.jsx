/**
 * Shown when AI obligation extraction found zero obligations for an Executed
 * contract (UC9-AF-001). The Renewal Alert Banner and action buttons remain
 * visible outside this component — it only replaces the obligations grid.
 */
export default function ObligationsEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center">
      <p className="text-sm font-medium text-neutral-300">No obligations detected for this contract</p>
      <p className="mt-1 text-xs text-neutral-500">
        AI extraction found no obligations in the executed document. You can add one manually below.
      </p>
    </div>
  );
}
