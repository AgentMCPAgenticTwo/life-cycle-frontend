/**
 * Replaces a Tracker tab's table/chart when there is nothing to show --
 * zero contracts in the tenant (UC10-AF-001), an empty date range
 * (UC10-AF-003), or a conflicting filter combination (UC10-AF-005). The
 * exact copy to render is decided by the caller and passed in as `message`.
 */
export default function TrackerEmptyState({ message }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-6 py-16 text-center"
    >
      <p className="text-sm font-medium text-neutral-300">{message}</p>
    </div>
  );
}
