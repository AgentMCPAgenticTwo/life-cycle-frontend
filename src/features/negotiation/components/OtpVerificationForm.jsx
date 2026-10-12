import { useState } from 'react';

const MAX_ATTEMPTS = 3;

/**
 * OTP entry form that locks the link after three consecutive failed attempts (UC5-AF-002).
 */
export default function OtpVerificationForm({ isLoading, onVerify }) {
  const [otp, setOtp] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [formError, setFormError] = useState(null);
  const locked = attempts >= MAX_ATTEMPTS;

  async function handleSubmit(e) {
    e.preventDefault();
    if (locked || !otp) return;
    setFormError(null);
    try {
      const result = await onVerify(otp);
      if (!result?.verified) {
        const next = attempts + 1;
        setAttempts(next);
        setFormError(
          next >= MAX_ATTEMPTS
            ? 'Invalid OTP. Link locked, please request a new link'
            : 'Invalid OTP. Please try again.'
        );
      }
    } catch (err) {
      const next = attempts + 1;
      setAttempts(next);
      setFormError(
        next >= MAX_ATTEMPTS
          ? 'Invalid OTP. Link locked, please request a new link'
          : err.message || 'Invalid OTP. Please try again.'
      );
    }
  }

  if (locked) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-sm font-semibold text-neutral-100">OTP Verification</h2>
        <div role="alert" className="mt-3 rounded-md border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Invalid OTP. Link locked, please request a new link
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="text-sm font-semibold text-neutral-100">OTP Verification</h2>
      <p className="mt-1 text-xs text-neutral-400">A one-time passcode was sent to your registered email</p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="otp-input" className="text-xs text-neutral-400">
            One-Time Passcode
          </label>
          <input
            id="otp-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code, valid for 10 minutes"
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !otp}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Verifying…' : 'Verify'}
        </button>
      </form>
      {formError && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {formError}
        </p>
      )}
      {attempts > 0 && attempts < MAX_ATTEMPTS && (
        <p className="mt-1 text-[11px] text-neutral-500">
          {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts === 1 ? '' : 's'} remaining
        </p>
      )}
    </div>
  );
}
