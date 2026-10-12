import { useEffect, useState } from 'react';
import { useVerifyOtp } from '@/features/esignature/hooks/useVerifyOtp';

const OTP_PATTERN = /^\d{6}$/;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

/**
 * 6-digit OTP entry gating the document viewer and Signature Pad. Locks for
 * 15 minutes after three consecutive invalid attempts (UC7-AF-001 / UC7-BR-003 /
 * UC7-BR-016 / UC7-FV-002).
 *
 * Named OtpVerificationModal per the module contract; rendered inline as a
 * card on the signing portal page to match the target design, not as an
 * overlay (see AddSignerModal for the same convention elsewhere in this module).
 */
export default function OtpVerificationModal({ sessionId, onVerified }) {
  const { mutate: verify, isLoading } = useVerifyOtp(sessionId);
  const [otpCode, setOtpCode] = useState('');
  const [formError, setFormError] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  const isLocked = lockedUntil ? new Date(lockedUntil) > now : false;

  useEffect(() => {
    if (lockedUntil && !isLocked) {
      // Lockout period has elapsed — allow OTP re-entry (UC7-AF-001).
      setLockedUntil(null);
      setAttemptsRemaining(MAX_ATTEMPTS);
      setFormError(null);
    }
  }, [isLocked, lockedUntil]);

  function minutesRemaining() {
    if (!lockedUntil) return LOCKOUT_MINUTES;
    const diffMs = new Date(lockedUntil).getTime() - now.getTime();
    return Math.max(1, Math.ceil(diffMs / 60000));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (isLocked) return;

    if (!OTP_PATTERN.test(otpCode)) {
      setFormError('OTP Code must be exactly 6 digits.');
      return;
    }

    verify({ otpCode })
      .then((response) => {
        if (response.signerStatus === 'Viewed' || response.signaturePadAvailable) {
          onVerified(response);
          return;
        }
        const remaining = response.attemptsRemaining ?? attemptsRemaining - 1;
        setAttemptsRemaining(remaining);
        if (response.lockedUntil || remaining <= 0) {
          const until = response.lockedUntil || new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString();
          setLockedUntil(until);
          setFormError('Invalid OTP. Please request a new code.');
        } else {
          setFormError(response.errorMessage || 'Invalid OTP. Please try again.');
        }
        setOtpCode('');
      })
      .catch((err) => {
        setFormError(err.message || 'Failed to verify OTP');
        setOtpCode('');
      });
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-sm font-semibold text-neutral-100">Verify your identity</h2>
      <p className="mt-1 text-xs text-neutral-500">A 6-digit code was sent to your registered email and mobile number</p>

      {isLocked ? (
        <div role="alert" className="mt-4 rounded-md border border-red-600/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          Invalid OTP. Please request a new code. The link is locked for {minutesRemaining()} more minute
          {minutesRemaining() === 1 ? '' : 's'}.
        </div>
      ) : (
        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp-code" className="text-sm font-medium text-neutral-200">
              OTP Code*
            </label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="482913"
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm tracking-widest text-neutral-100 placeholder:text-neutral-600"
            />
            <p className="mt-1 text-xs text-neutral-500">6-digit numeric code, expires in 15 minutes</p>
          </div>

          {formError && (
            <p role="alert" className="text-xs text-red-300">
              {formError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Verifying…' : 'Verify'}
            </button>
            <p className="text-xs text-neutral-500">Viewer &amp; signature pad unlock after verification</p>
          </div>
        </form>
      )}
    </div>
  );
}
