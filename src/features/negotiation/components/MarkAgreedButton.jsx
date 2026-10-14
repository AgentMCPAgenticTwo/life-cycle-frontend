import { useState } from 'react';
import { useMarkAgreed } from '@/features/negotiation/hooks/useMarkAgreed';

/**
 * Visible only to Legal Reviewer; marks negotiation as Agreed after a completed
 * review cycle (UC5-BR-009, UC5-BR-014, UC5-BR-015, UC5-BR-021, UC5-BR-022).
 * Agreeing also sends the contract for approval: it moves to Pending Approval and
 * the first approver is notified, so the action asks for an explicit confirmation.
 */
export default function MarkAgreedButton({ contractId, visible, onAgreed }) {
  const { mutate, isLoading, error } = useMarkAgreed(contractId);

  const [confirming, setConfirming] = useState(false);

  if (!visible) return null;

  async function handleConfirm() {
    try {
      const result = await mutate();
      setConfirming(false);
      onAgreed?.(result);
    } catch {
      // The error is shown below; keep the confirmation open so it can be retried.
    }
  }

  return (
    <div>
      {confirming ? (
        <div className="rounded-md border border-emerald-600/40 bg-emerald-500/10 p-3">
          <p className="text-xs text-emerald-200">
            Mark this negotiation as Agreed? The contract will move to Pending Approval and the first approver
            will be notified.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Marking…' : 'Yes, Mark as Agreed'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isLoading}
              className="rounded-md border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          Mark as Agreed
        </button>
      )}
      <p className="mt-1 text-[11px] text-neutral-500">Visible to Legal Reviewer</p>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-300">
          {error.message}
        </p>
      )}
    </div>
  );
}
