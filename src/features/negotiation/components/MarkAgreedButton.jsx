import { useState } from 'react';
import { useMarkAgreed } from '@/features/negotiation/hooks/useMarkAgreed';

/**
 * Visible only to Legal Reviewer; marks negotiation as Agreed after a completed
 * review cycle (UC5-BR-009, UC5-BR-014, UC5-BR-015, UC5-BR-021, UC5-BR-022).
 */
export default function MarkAgreedButton({ contractId, visible, onAgreed }) {
  const { mutate, isLoading, error } = useMarkAgreed(contractId);

  const [confirming, setConfirming] = useState(false);

  if (!visible) return null;

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    try {
      const result = await mutate();
      onAgreed?.(result);
      setConfirming(false);
    } catch {
      setConfirming(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Marking…' : confirming ? 'Confirm: Mark as Agreed' : 'Mark as Agreed'}
      </button>
      <p className="mt-1 text-[11px] text-neutral-500">Visible to Legal Reviewer</p>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-300">
          {error.message}
        </p>
      )}
    </div>
  );
}
