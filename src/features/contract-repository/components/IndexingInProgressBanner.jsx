/**
 * Notifies the user that some contracts were excluded from full-text search
 * results because their document index is still processing (UC8-AF-004).
 */
export default function IndexingInProgressBanner() {
  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
    >
      Some documents are still being indexed and may not appear in search results.
    </div>
  );
}
