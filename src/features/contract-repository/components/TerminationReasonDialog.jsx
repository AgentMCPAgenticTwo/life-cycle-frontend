import { useState } from 'react';
import { useTerminateContract } from '@/features/contract-repository/hooks/useTerminateContract';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Dialog capturing Termination Reason and Effective Termination Date with
 * validation (UC9-AF-001, UC9-BR-018, UC9-FV-001, UC9-FV-002). Blocks confirm
 * until a free-text reason is supplied and the date is on or after today.
 */
export default function TerminationReasonDialog({ contractId, onClose, onConfirm }) {
  const { terminate, isSaving, error } = useTerminateContract(contractId);
  const [terminationReason, setTerminationReason] = useState('');
  const [effectiveTerminationDate, setEffectiveTerminationDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const next = {};
    if (!terminationReason.trim()) next.terminationReason = 'Termination Reason is required.';
    if (!effectiveTerminationDate) next.effectiveTerminationDate = 'Effective Termination Date is required.';
    else if (effectiveTerminationDate < todayIso()) {
      next.effectiveTerminationDate = 'Effective Termination Date must be on or after today.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleConfirm() {
    if (!validate()) return;
    const result = await terminate({ terminationReason, effectiveTerminationDate });
    onConfirm?.(result);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div role="dialog" aria-modal="true" aria-label="Terminate Contract" className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
        <h2 className="text-sm font-semibold text-neutral-100">Terminate Contract</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          A Termination Reason and Effective Termination Date are required to proceed.
        </p>

        <label className="mt-4 block text-xs text-neutral-400">
          Termination Reason *
          <textarea
            value={terminationReason}
            onChange={(event) => setTerminationReason(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100"
          />
          {fieldErrors.terminationReason && <p className="mt-1 text-xs text-red-400">{fieldErrors.terminationReason}</p>}
        </label>

        <label className="mt-3 block text-xs text-neutral-400">
          Effective Termination Date *
          <input
            type="date"
            value={effectiveTerminationDate}
            onChange={(event) => setEffectiveTerminationDate(event.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100"
          />
          {fieldErrors.effectiveTerminationDate && (
            <p className="mt-1 text-xs text-red-400">{fieldErrors.effectiveTerminationDate}</p>
          )}
        </label>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-neutral-50 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Terminating…' : 'Confirm Termination'}
          </button>
        </div>
      </div>
    </div>
  );
}
