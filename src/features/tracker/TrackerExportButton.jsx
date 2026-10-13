/**
 * Triggers an export of the currently selected tab/period/filters and shows
 * the failure message on error, without disturbing the current view
 * (UC10-AF-004 / UC10-MF-001).
 */
export default function TrackerExportButton({ onExport, isExporting, failureMessage }) {
  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExporting ? 'Exporting…' : '⬇ Export'}
      </button>
      {failureMessage && (
        <p role="alert" className="text-xs text-red-400">
          {failureMessage}
        </p>
      )}
    </div>
  );
}
