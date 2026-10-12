/**
 * Shown when a search/filter combination matches no contracts (UC8-AF-001).
 */
export default function NoResultsMessage() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-6 py-16 text-center text-sm text-neutral-400">
      No contracts found matching your search.
    </div>
  );
}
