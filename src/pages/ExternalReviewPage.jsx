import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OtpVerificationForm from '@/features/negotiation/components/OtpVerificationForm';
import { useVerifyOtp } from '@/features/negotiation/hooks/useVerifyOtp';
import { useExternalSubmit } from '@/features/negotiation/hooks/useExternalSubmit';
import { useNegotiationStore } from '@/store/negotiationSlice';

function formatCountdown(expiresAt) {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(diffMs) || diffMs <= 0) return 'Expired';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `Expires in ${hours}h ${minutes}m`;
}

export default function ExternalReviewPage() {
  const { linkToken } = useParams();
  const otpMutation = useVerifyOtp(linkToken);
  const submitMutation = useExternalSubmit(linkToken);
  const setNegotiation = useNegotiationStore((s) => s.setNegotiation);
  const setNegotiationStatus = useNegotiationStore((s) => s.setNegotiationStatus);

  const [negotiationData, setNegotiationData] = useState(null);
  const [linkExpired, setLinkExpired] = useState(false);
  const [selectedClauseId, setSelectedClauseId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  async function handleVerify(otp) {
    try {
      const result = await otpMutation.verify(otp);
      if (result?.verified && result.negotiationData) {
        setNegotiationData(result.negotiationData);
        setNegotiation({
          contractId: result.negotiationData.contractId,
          negotiationStatus: 'With Counterparty',
          versionNumber: result.negotiationData.versionNumber,
          versions: [],
          comments: [],
        });
      }
      return result;
    } catch (err) {
      if (err.status === 410 || /expired/i.test(err.message || '')) {
        setLinkExpired(true);
      }
      throw err;
    }
  }

  const clauses = negotiationData?.clauses || [];
  const selectedClause = useMemo(() => {
    if (!clauses.length) return null;
    return clauses.find((c) => c.clauseId === selectedClauseId) || clauses[0];
  }, [clauses, selectedClauseId]);

  async function handleSubmitChanges() {
    setSubmitError(null);
    try {
      const result = await submitMutation.mutate({
        commentText: commentText || undefined,
        redlineText: commentText || negotiationData?.documentText || '',
      });
      setSubmitResult(result);
      setNegotiationStatus(result.negotiationStatus);
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  if (linkExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
        <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-red-300">Link expired</h1>
          <p className="mt-2 text-sm text-red-200">
            This review link has expired. Please contact the Contract Owner for a new link.
          </p>
        </div>
      </div>
    );
  }

  const countdown = formatCountdown(negotiationData?.expiresAt);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <span>Secure Link</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">External Review</span>
        </nav>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">External Party Review</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Verify your identity to review and redline the current contract version
        </p>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        {negotiationData && (
          <div className="rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-6">
            <h2 className="text-lg font-semibold text-white">
              {negotiationData.contractTitle || `Contract ${negotiationData.contractId}`}
            </h2>
            <p className="mt-1 text-sm text-emerald-100">
              Current Version v{negotiationData.versionNumber} · Shared for external redline via secure link
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                Read/Redline access
              </span>
              {countdown && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">{countdown}</span>
              )}
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                Version {negotiationData.versionNumber}
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleSubmitChanges}
                disabled={!negotiationData.commentBoxEnabled || submitMutation.isLoading}
                className="rounded-md border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit Changes
              </button>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(negotiationData.documentText || '')}`}
                download={`contract-version-${negotiationData.versionNumber}.txt`}
                className="rounded-md border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Download Current Version
              </a>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          {negotiationData ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-100">OTP Verification</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  Verified
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-400">A one-time passcode was sent to your registered email</p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-neutral-400">One-Time Passcode</p>
                  <div className="mt-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm tracking-widest text-neutral-100">
                    ••••••
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">6-digit code, valid for 10 minutes</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Access Window</p>
                  <div className="mt-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100">
                    {negotiationData.expiresAt
                      ? `${new Date().toLocaleString()} — ${new Date(negotiationData.expiresAt).toLocaleString()}`
                      : 'Time-bound read/write access'}
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">Time-bound read/write access</p>
                </div>
              </div>
            </>
          ) : (
            <OtpVerificationForm isLoading={otpMutation.isLoading} onVerify={handleVerify} />
          )}
        </div>

        {negotiationData && (
          <>
            <div
              role="status"
              className="rounded-lg border border-sky-700/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-200"
            >
              As an external reviewer, you can see and redline the current version only. Internal reviewer
              comments, due dates and routing configuration are not shown.
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <h2 className="text-base font-semibold text-neutral-100">Clauses — Current Version</h2>
              <p className="mt-1 text-sm text-neutral-400">Select a clause to redline or leave a comment</p>

              {clauses.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {clauses.map((clause) => (
                    <li key={clause.clauseId}>
                      <button
                        type="button"
                        onClick={() => setSelectedClauseId(clause.clauseId)}
                        className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left ${
                          selectedClause?.clauseId === clause.clauseId
                            ? 'border-emerald-600/60 bg-emerald-500/5'
                            : 'border-neutral-800 bg-neutral-950'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-100">
                            Clause {clause.clauseCategory ? `${clause.clauseCategory} — ` : ''}
                            {clause.summary || clause.clauseId}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            clause.changeStatus === 'Redlined'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-neutral-700/40 text-neutral-300'
                          }`}
                        >
                          {clause.changeStatus}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
                  {negotiationData.documentText}
                </pre>
              )}
            </div>

            {negotiationData.commentBoxEnabled && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <h2 className="text-sm font-semibold text-neutral-100">
                  Comment{selectedClause ? ` on Clause ${selectedClause.clauseCategory || selectedClause.clauseId}` : ''}
                </h2>
                <label htmlFor="external-comment" className="mt-3 block text-xs text-neutral-400">
                  Your Comment
                </label>
                <textarea
                  id="external-comment"
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="e.g. We would prefer different terms to align with our standard vendor terms."
                  className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
                />
                <p className="mt-1 text-[11px] text-neutral-500">Visible to the Contract Owner once submitted.</p>

                {submitError && (
                  <p role="alert" className="mt-2 text-xs text-red-300">
                    {submitError}
                  </p>
                )}
                {submitResult && (
                  <p role="status" className="mt-2 text-xs text-emerald-300">
                    Changes submitted. Version {submitResult.versionNumber} sent for internal review.
                  </p>
                )}

                <div className="mt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500"
                  >
                    Save Redline
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitChanges}
                    disabled={submitMutation.isLoading || !commentText}
                    className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitMutation.isLoading ? 'Submitting…' : 'Submit Changes'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="px-8 pb-6 text-xs text-neutral-600">
        <Link to="/" className="hover:text-neutral-400">
          Return to Home Page
        </Link>
      </footer>
    </div>
  );
}
