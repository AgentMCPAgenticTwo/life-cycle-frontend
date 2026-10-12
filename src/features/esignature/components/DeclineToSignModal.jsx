import { useState } from 'react';

/**
 * Decline to Sign control requiring a mandatory reason, available only to the
 * active Signer (UC7-AF-002 / UC7-BR-008 / UC7-BR-018 / UC7-FV-003).
 *
 * Named DeclineToSignModal per the module contract; the reason prompt expands
 * inline next to the Sign button to match the target design, not as an overlay.
 */
export default function DeclineToSignModal({ sessionId: _sessionId, onDecline, disabled, isSubmitting, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState(null);

  function handleOpen() {
    setFormError(null);
    setIsOpen(true);
  }

  function handleCancel() {
    setIsOpen(false);
    setReason('');
    setFormError(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    const trimmed = reason.trim();
    if (!trimmed) {
      setFormError('A reason is required to decline to sign.');
      return;
    }
    onDecline({ reason: trimmed });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="rounded-md border border-red-600/60 px-5 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Decline to Sign
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-red-600/40 bg-red-500/5 p-4">
      <label htmlFor="decline-reason" className="text-sm font-medium text-neutral-200">
        Reason for declining*
      </label>
      <textarea
        id="decline-reason"
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Terms do not match what was negotiated"
        className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
      />
      {formError && (
        <p role="alert" className="mt-1 text-xs text-red-300">
          {formError}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-300">
          {error}
        </p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Declining…' : 'Confirm Decline'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
