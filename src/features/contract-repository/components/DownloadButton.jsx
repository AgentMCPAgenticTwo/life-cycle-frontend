/**
 * Download control for the Document tab (UC8-AF-005, UC8-BR-006). When `enabled`
 * is false (oversized document) it renders disabled with the `comment` text
 * ("File unavailable") beside it; when enabled it fires `onClick` and lets the
 * caller surface any retrieval error (corrupted/missing document) separately.
 */
export default function DownloadButton({ enabled, comment, onClick, isLoading = false }) {
  if (!enabled) {
    return (
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          disabled
          title={comment || 'File unavailable'}
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-xs font-semibold text-neutral-500"
        >
          <DownloadIcon />
          Download
        </button>
        {comment ? <span className="text-xs text-neutral-500">{comment}</span> : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-100 hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-60"
    >
      <DownloadIcon />
      {isLoading ? 'Downloading…' : 'Download'}
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
