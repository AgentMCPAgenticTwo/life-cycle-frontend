import { useState } from 'react';

const FORMATS = ['Excel', 'PDF'];

/**
 * Lets the user pick Excel or PDF, then triggers an export of the currently
 * selected tab/period/filters and shows the failure message on error, without
 * disturbing the current view (UC10-AF-004 / UC10-MF-001).
 */
export default function TrackerExportButton({ onExport, isExporting, failureMessage }) {
  const [format, setFormat] = useState('Excel');

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor="tracker-export-format" className="sr-only">
          Export format
        </label>
        <select
          id="tracker-export-format"
          value={format}
          onChange={(event) => setFormat(event.target.value)}
          disabled={isExporting}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {FORMATS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onExport?.(format)}
          disabled={isExporting}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? 'Exporting…' : '⬇ Export'}
        </button>
      </div>
      {failureMessage && (
        <p role="alert" className="text-xs text-red-400">
          {failureMessage}
        </p>
      )}
    </div>
  );
}
