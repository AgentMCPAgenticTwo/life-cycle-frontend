import { useState } from 'react';
import { useAcceptObligation } from '@/features/contract-repository/hooks/useAcceptObligation';
import { ObligationConfirmationBadge } from '@/features/contract-repository/components/ObligationBadges';

const OBLIGATION_TYPES = ['Deliverable', 'Payment Milestone', 'SLA', 'Reporting'];
const STATUSES = ['Pending', 'In Progress', 'Completed', 'Overdue'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Edit panel for a single obligation, including the Accept Suggestion Button
 * for AI-extracted values (UC9-BR-005, UC9-AF-004, UC9-FV-001).
 */
export default function ObligationRowForm({ obligation, onSave, onCancel, readOnly }) {
  const { accept, isSaving: isAccepting } = useAcceptObligation(obligation.contractId, obligation.obligationId);
  const [form, setForm] = useState({
    obligationDescription: obligation.obligationDescription,
    obligationType: obligation.obligationType,
    owner: obligation.owner || '',
    dueDate: obligation.dueDate || '',
    status: obligation.status,
  });
  const [dueDateError, setDueDateError] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'dueDate') setDueDateError('');
  }

  function handleSave(event) {
    event.preventDefault();
    if (form.dueDate && form.dueDate < todayIso()) {
      setDueDateError('Due date cannot be in the past');
      return;
    }
    onSave?.(form);
  }

  async function handleAccept() {
    const updated = await accept();
    onSave?.(null, updated);
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-100">Edit Obligation</h3>
        <ObligationConfirmationBadge confirmationLabel={obligation.confirmationLabel} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2 text-xs text-neutral-400">
          Obligation Description *
          <textarea
            value={form.obligationDescription}
            onChange={(event) => update('obligationDescription', event.target.value)}
            rows={2}
            disabled={readOnly}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-neutral-400">
          Obligation Type *
          <select
            value={form.obligationType}
            onChange={(event) => update('obligationType', event.target.value)}
            disabled={readOnly}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 disabled:opacity-60"
          >
            {OBLIGATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-neutral-400">
          Owner *
          <input
            value={form.owner}
            onChange={(event) => update('owner', event.target.value)}
            disabled={readOnly}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 disabled:opacity-60"
          />
        </label>
        <label className="text-xs text-neutral-400">
          Due Date *
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => update('dueDate', event.target.value)}
            disabled={readOnly}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 disabled:opacity-60"
          />
          {dueDateError && <p className="mt-1 text-xs text-red-400">{dueDateError}</p>}
        </label>
        <label className="text-xs text-neutral-400">
          Status *
          <select
            value={form.status}
            onChange={(event) => update('status', event.target.value)}
            disabled={readOnly}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 disabled:opacity-60"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-xs text-neutral-500">Source: {obligation.source}</p>

      {!readOnly && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-neutral-700 px-4 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-500"
          >
            Cancel
          </button>
          {obligation.confirmationLabel === 'AI Suggested' && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={isAccepting}
              className="rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAccepting ? 'Accepting…' : 'Accept Suggestion'}
            </button>
          )}
          <button
            type="submit"
            className="rounded-md border border-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10"
          >
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}
