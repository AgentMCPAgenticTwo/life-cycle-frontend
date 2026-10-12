import { useMemo, useState } from 'react';
import { useCompareVersions } from '@/features/negotiation/hooks/useCompareVersions';

const CHANGE_STYLES = {
  Added: 'border-l-4 border-emerald-500',
  Deleted: 'border-l-4 border-red-500',
  Modified: 'border-l-4 border-amber-500',
  Unchanged: 'border-l-4 border-transparent',
};

/**
 * Popup with Version A Selector and Version B Selector rendering a side-by-side
 * redline comparison (UC5-BR-011, UC5-BR-012, UC5-BR-014, UC5-BR-015, UC5-FV-002).
 */
export default function CompareVersionsModal({ contractId, versions, onClose }) {
  const sorted = useMemo(
    () => [...(versions || [])].sort((a, b) => b.versionNumber - a.versionNumber),
    [versions]
  );
  const [versionA, setVersionA] = useState(sorted[1]?.versionNumber ?? sorted[0]?.versionNumber);
  const [versionB, setVersionB] = useState(sorted[0]?.versionNumber);

  const { data, isLoading, error } = useCompareVersions(contractId, versionA, versionB, true);

  const additions = (data?.differences || []).filter((d) => d.changeType === 'Added').length;
  const deletions = (data?.differences || []).filter((d) => d.changeType === 'Deleted').length;
  const comments = data?.comments?.length || 0;
  const clausesAffected = (data?.differences || []).filter((d) => d.changeType !== 'Unchanged').length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10">
      <div className="w-full max-w-4xl rounded-xl border border-neutral-800 bg-neutral-900">
        <div className="flex items-start justify-between border-b border-neutral-800 px-6 py-4">
          <div>
            <nav className="text-xs text-neutral-500">
              Home Page / Contracts / Contract Detail / Negotiation Tracker / Compare Versions
            </nav>
            <h2 className="mt-1 text-lg font-semibold text-neutral-100">Compare Versions</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-neutral-400 hover:text-neutral-200">
            × Close
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="version-a" className="text-sm font-medium text-neutral-200">
                Version A Selector *
              </label>
              <select
                id="version-a"
                value={versionA ?? ''}
                onChange={(e) => setVersionA(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
              >
                {sorted.map((v) => (
                  <option key={v.versionNumber} value={v.versionNumber}>
                    v{v.versionNumber}.0 — {new Date(v.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-neutral-500">
                List of prior version numbers for this contract
              </p>
            </div>
            <div>
              <label htmlFor="version-b" className="text-sm font-medium text-neutral-200">
                Version B Selector *
              </label>
              <select
                id="version-b"
                value={versionB ?? ''}
                onChange={(e) => setVersionB(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
              >
                {sorted.map((v) => (
                  <option key={v.versionNumber} value={v.versionNumber}>
                    v{v.versionNumber}.0 — {new Date(v.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-neutral-500">
                Only versions belonging to the same contract and tenant can be compared
              </p>
            </div>
          </div>

          {isLoading && <p className="mt-6 text-sm text-neutral-400">Loading comparison…</p>}
          {error && (
            <p role="alert" className="mt-6 text-sm text-red-300">
              {error.message}
            </p>
          )}

          {data && (
            <>
              <div className="mt-6 grid grid-cols-4 gap-3 text-center">
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 py-3">
                  <p className="text-lg font-semibold text-emerald-400">{additions}</p>
                  <p className="text-xs text-neutral-500">Additions</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 py-3">
                  <p className="text-lg font-semibold text-amber-400">{deletions}</p>
                  <p className="text-xs text-neutral-500">Deletions</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 py-3">
                  <p className="text-lg font-semibold text-neutral-200">{comments}</p>
                  <p className="text-xs text-neutral-500">Comments</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 py-3">
                  <p className="text-lg font-semibold text-neutral-200">{clausesAffected}</p>
                  <p className="text-xs text-neutral-500">Clauses Affected</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-100">Redline Comparison</h3>
                  <div className="flex gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Added
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" /> Removed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Comment
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  v{data.versionA.versionNumber}.0 ({new Date(data.versionA.createdAt).toLocaleDateString()}) — v
                  {data.versionB.versionNumber}.0 ({new Date(data.versionB.createdAt).toLocaleDateString()})
                </p>

                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Version A — v{data.versionA.versionNumber}.0
                    </h4>
                    <ul className="mt-2 flex flex-col gap-3">
                      {(data.differences || []).map((diff, idx) => (
                        <li
                          key={diff.clauseId || idx}
                          className={`rounded-md bg-neutral-950 px-3 py-2 text-sm text-neutral-300 ${
                            CHANGE_STYLES[diff.changeType] || ''
                          }`}
                        >
                          {diff.clauseCategory && (
                            <p className="mb-1 text-xs font-medium text-neutral-500">{diff.clauseCategory}</p>
                          )}
                          {diff.textA || '—'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Version B — v{data.versionB.versionNumber}.0
                    </h4>
                    <ul className="mt-2 flex flex-col gap-3">
                      {(data.differences || []).map((diff, idx) => (
                        <li
                          key={diff.clauseId || idx}
                          className={`rounded-md bg-neutral-950 px-3 py-2 text-sm text-neutral-300 ${
                            CHANGE_STYLES[diff.changeType] || ''
                          }`}
                        >
                          {diff.clauseCategory && (
                            <p className="mb-1 text-xs font-medium text-neutral-500">{diff.clauseCategory}</p>
                          )}
                          {diff.textB || '—'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-neutral-100">Comments</h3>
                <ul className="mt-3 flex flex-col gap-3">
                  {(data.comments || []).map((comment) => (
                    <li
                      key={comment.commentId}
                      className="flex items-start justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-100">
                          {comment.clauseId ? `Clause ${comment.clauseId}` : 'General comment'}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {comment.authorName}: "{comment.commentText}"
                        </p>
                      </div>
                      <span className="rounded-full bg-neutral-700/40 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                        v{comment.versionNumber}
                      </span>
                    </li>
                  ))}
                  {!data.comments?.length && <p className="text-sm text-neutral-500">No comments yet.</p>}
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-6 py-4">
          <button
            type="button"
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500"
          >
            + Download Redline
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  );
}
