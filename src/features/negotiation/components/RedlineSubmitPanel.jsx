import { useState } from 'react';
import { useSubmitReview } from '@/features/negotiation/hooks/useSubmitReview';

/**
 * Internal reviewer redline submission. A submission made against the latest
 * version is saved normally and increments the contract version; if another
 * reviewer submitted a newer version first the backend answers 409 and the
 * conflict notice below is shown instead (UC5-AF-005).
 */
export default function RedlineSubmitPanel({ contractId, currentVersion, onSubmitted }) {
  const { mutate, isLoading, error, conflict, clearConflict } = useSubmitReview(contractId);
  const [redlineText, setRedlineText] = useState('');
  const [savedVersion, setSavedVersion] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!redlineText.trim()) return;
    setSavedVersion(null);
    try {
      const result = await mutate({ redlineText });
      setRedlineText('');
      setSavedVersion(result.versionNumber);
      if (onSubmitted) onSubmitted();
    } catch {
      // conflict / error state rendered below
    }
  }

  function handleRefresh() {
    clearConflict();
    if (onSubmitted) onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-100">Submit Redline</h2>
        <span className="text-xs text-neutral-500">Working from v{currentVersion}</span>
      </div>
      <label htmlFor="redline-text" className="mt-3 block text-xs text-neutral-400">
        Redline Changes
      </label>
      <textarea
        id="redline-text"
        rows={4}
        value={redlineText}
        onChange={(e) => setRedlineText(e.target.value)}
        placeholder="Describe or paste your redlined clause text"
        className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
      />

      {conflict && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
        >
          A newer version was submitted while you were editing. Please refresh and reapply your changes.
          <button type="button" onClick={handleRefresh} className="ml-2 font-semibold underline">
            Refresh
          </button>
        </div>
      )}

      {error && !conflict && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error.message}
        </p>
      )}

      {savedVersion != null && (
        <p role="status" className="mt-2 text-xs text-emerald-300">
          Redline submitted — contract is now at v{savedVersion}.
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !redlineText.trim()}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Submitting…' : 'Submit Redline'}
        </button>
      </div>
    </form>
  );
}
