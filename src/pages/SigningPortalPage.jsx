import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OtpVerificationModal from '@/features/esignature/components/OtpVerificationModal';
import SignaturePadModal from '@/features/esignature/components/SignaturePadModal';
import DeclineToSignModal from '@/features/esignature/components/DeclineToSignModal';
import { useSigningSession } from '@/features/esignature/hooks/useSigningSession';
import { useResendOtp } from '@/features/esignature/hooks/useResendOtp';
import { useApplySignature } from '@/features/esignature/hooks/useApplySignature';
import { useDeclineSignature } from '@/features/esignature/hooks/useDeclineSignature';

// Once a signer signs, the backend drops isCurrentTurn (it only stays true for Sent/Viewed),
// so "Signed" has to be rendered outside the current-turn branch or the portal falls back to
// the "waiting on an earlier signer" message right after a successful signature.
const TERMINAL_STATUSES = ['Declined', 'Expired', 'Signed'];

export default function SigningPortalPage() {
  const { sessionId } = useParams();
  const { data: session, isLoading, error, refetch } = useSigningSession(sessionId);
  const resendOtp = useResendOtp(sessionId);
  const applySignature = useApplySignature(sessionId);
  const declineSignature = useDeclineSignature(sessionId);

  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyResponse, setVerifyResponse] = useState(null);
  const [signResult, setSignResult] = useState(null);
  const [declineResult, setDeclineResult] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [resendMessage, setResendMessage] = useState(null);

  function handleResend() {
    setActionError(null);
    setResendMessage(null);
    resendOtp
      .mutate()
      .then(() => {
        setResendMessage('A new signing link and OTP have been sent.');
        refetch();
      })
      .catch((err) => setActionError(err.message || 'Failed to resend the signing link'));
  }

  function handleSign(request) {
    setActionError(null);
    return applySignature
      .mutate(request)
      .then((response) => {
        setSignResult(response);
        refetch();
      })
      .catch((err) => {
        setActionError(err.message || 'Failed to apply signature');
        throw err;
      });
  }

  function handleDecline(request) {
    setActionError(null);
    return declineSignature
      .mutate(request)
      .then((response) => {
        setDeclineResult(response);
        refetch();
      })
      .catch((err) => {
        setActionError(err.message || 'Failed to record decline');
        throw err;
      });
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <span>Secure Link</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-300">Sign Document</span>
        </nav>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign Document</h1>
            {session && <p className="mt-1 text-sm text-neutral-500">{session.contractId}</p>}
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        {isLoading && <p className="text-sm text-neutral-500">Loading signing session…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <p>{error.message || 'Failed to load the signing session'}</p>
            <button type="button" onClick={refetch} className="mt-2 font-medium text-red-200 underline">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && session && session.linkExpired && (
          <div role="alert" className="rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
            <h2 className="text-lg font-semibold text-red-300">This signing link has expired.</h2>
            <p className="mt-2 text-sm text-red-200">Please contact the contract owner.</p>
          </div>
        )}

        {!isLoading && !error && session && !session.linkExpired && session.signerStatus === 'Expired' && (
          <div role="alert" className="rounded-xl border border-amber-600/40 bg-amber-500/10 px-6 py-8 text-center">
            <h2 className="text-lg font-semibold text-amber-300">This signing link has expired.</h2>
            <p className="mt-2 text-sm text-amber-200">Please wait for the Contract Owner to re-send a new link.</p>
          </div>
        )}

        {!isLoading && !error && session && !session.linkExpired && session.signerStatus === 'Declined' && (
          <div role="status" className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-8 text-center">
            <h2 className="text-lg font-semibold text-neutral-100">You have declined to sign this contract.</h2>
            {(declineResult?.reason || session) && (
              <p className="mt-2 text-sm text-neutral-400">
                {declineResult?.reason ? `Reason: ${declineResult.reason}` : 'The Contract Owner has been notified.'}
              </p>
            )}
          </div>
        )}

        {!isLoading && !error && session && !session.linkExpired && session.signerStatus === 'Signed' && (
          <div role="status" className="rounded-xl border border-emerald-700/40 bg-emerald-500/10 px-6 py-8 text-center">
            <h2 className="text-lg font-semibold text-emerald-300">You have signed this document.</h2>
            <p className="mt-2 text-sm text-emerald-200">
              {signResult?.contractStatus === 'Executed'
                ? 'All signers have completed signing — the contract is now Executed.'
                : 'The signing link has been sent to the next signer in sequence.'}
            </p>
          </div>
        )}

        {!isLoading &&
          !error &&
          session &&
          !session.linkExpired &&
          !TERMINAL_STATUSES.includes(session.signerStatus) &&
          !session.isCurrentTurn && (
            <div role="alert" className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-8 text-center">
              <h2 className="text-lg font-semibold text-neutral-100">Waiting on an earlier signer</h2>
              <p className="mt-2 text-sm text-neutral-400">
                {session.blockedMessage ||
                  'You must wait for prior signers in the Signing Order to complete signing before you can act.'}
              </p>
            </div>
          )}

        {!isLoading &&
          !error &&
          session &&
          !session.linkExpired &&
          !TERMINAL_STATUSES.includes(session.signerStatus) &&
          session.isCurrentTurn && (
            <>
              <div className="rounded-xl bg-gradient-to-r from-emerald-600/30 via-emerald-700/20 to-neutral-900 px-6 py-5">
                <h2 className="text-lg font-semibold text-neutral-50">Signer — {session.signerName}</h2>
                <p className="mt-1 text-sm text-neutral-200/80">{session.signerEmail}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-neutral-100">
                    Waiting on your signature
                  </span>
                  <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-neutral-100">
                    Status: {session.signerStatus}
                  </span>
                  {!(session.otpVerified || otpVerified) && (
                    <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-neutral-100">
                      Document locked until OTP verified
                    </span>
                  )}
                </div>
              </div>

              {actionError && (
                <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {actionError}
                </div>
              )}
              {resendMessage && (
                <div role="status" className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {resendMessage}
                </div>
              )}

              {session.signerStatus === 'Signed' || signResult?.signerStatus === 'Signed' ? (
                <div role="status" className="rounded-xl border border-emerald-700/40 bg-emerald-500/10 px-6 py-8 text-center">
                  <h2 className="text-lg font-semibold text-emerald-300">You have signed this document.</h2>
                  <p className="mt-2 text-sm text-emerald-200">
                    {signResult?.contractStatus === 'Executed'
                      ? 'All signers have completed signing — the contract is now Executed.'
                      : 'The signing link has been sent to the next signer in sequence.'}
                  </p>
                </div>
              ) : !(session.otpVerified || otpVerified) ? (
                <>
                  <OtpVerificationModal
                    sessionId={sessionId}
                    onVerified={(response) => {
                      setOtpVerified(true);
                      setVerifyResponse(response);
                      refetch();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendOtp.isLoading}
                    className="self-start text-xs font-medium text-neutral-400 underline hover:text-neutral-200"
                  >
                    {resendOtp.isLoading ? 'Requesting new code…' : 'Resend code / request new link'}
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-neutral-100">Document viewer</h2>
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                        Viewed
                      </span>
                    </div>
                    <div className="mt-4 flex h-64 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950">
                      {session.documentUrl || verifyResponse?.documentUrl ? (
                        <iframe
                          title="Contract document"
                          src={session.documentUrl || verifyResponse.documentUrl}
                          className="h-full w-full rounded-lg"
                        />
                      ) : (
                        <p className="text-xs text-neutral-600">Document preview unavailable</p>
                      )}
                    </div>
                  </div>

                  {(session.signaturePadAvailable || verifyResponse?.signaturePadAvailable) && (
                    <SignaturePadModal
                      sessionId={sessionId}
                      onSign={handleSign}
                      isSubmitting={applySignature.isLoading}
                    />
                  )}

                  <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                    <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-neutral-500">Signer name</dt>
                        <dd className="text-neutral-200">{session.signerName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-500">Email</dt>
                        <dd className="text-neutral-200">{session.signerEmail}</dd>
                      </div>
                    </dl>

                    {session.declineAvailable && (
                      <div className="mt-4">
                        <DeclineToSignModal
                          sessionId={sessionId}
                          onDecline={handleDecline}
                          isSubmitting={declineSignature.isLoading}
                        />
                      </div>
                    )}
                  </div>
                </>
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
