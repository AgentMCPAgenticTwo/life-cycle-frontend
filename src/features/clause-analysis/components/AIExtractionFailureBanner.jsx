// Banner offering Retry or Continue Manually when AI extraction fails or
// times out (UC4-AF-002).
export default function AIExtractionFailureBanner({ isRetrying, onRetry, onContinueManually }) {
  return (
    <div role="alert" className="rounded-xl border border-amber-700/40 bg-amber-500/10 px-6 py-5">
      <h2 className="text-base font-semibold text-amber-300">AI analysis could not be completed</h2>
      <p className="mt-1 text-sm text-amber-200">Please retry or continue manually.</p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRetrying ? 'Retrying…' : 'Retry'}
        </button>
        <button
          type="button"
          onClick={onContinueManually}
          className="rounded-md border border-amber-600/60 px-4 py-2 text-sm font-medium text-amber-200 hover:border-amber-400"
        >
          Continue Manually
        </button>
      </div>
    </div>
  );
}
