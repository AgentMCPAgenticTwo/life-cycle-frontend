/**
 * Shown instead of the Contract List Table when the current user owns or is
 * assigned to no contracts at all (UC8-AF-002).
 */
export default function EmptyRepositoryState() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-6 py-16 text-center text-sm text-neutral-400">
      You have no contracts to display.
    </div>
  );
}
