import { useState } from 'react';
import { useCreateObligation } from '@/features/contract-repository/hooks/useCreateObligation';

const OBLIGATION_TYPES = ['Deliverable', 'Payment Milestone', 'SLA', 'Reporting'];
const STATUSES = ['Pending', 'In Progress', 'Completed', 'Overdue'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Form to manually add an obligation when none were AI-extracted (UC9-AF-001,
 * UC9-FV-001). Source is set to 'Manually Added' by the backend on save.
 */
export default function ManualObligationForm({ contractId, onSave }) {
  const { create, isSaving } = useCreateObligation(contractId);
  const [form, setForm] = useState({
    obligationDescription: '',
    obligationType: OBLIGATION_TYPES[0],
    owner: '',
    dueDate: '',
    status: 'Pending',
  });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.obligationDescription.trim()) next.obligationDescription = 'Obligation Description is required.';
    if (!form.owner.trim()) next.owner = 'Owner is required.';
    if (!form.dueDate) next.dueDate = 'Due Date is required.';
    else if (form.dueDate < todayIso()) next.dueDate = 'Due date cannot be in the past';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    const saved = await create(form);
    onSave?.(saved);
    setForm({ obligationDescription: '', obligationType: OBLIGATION_TYPES[0], owner: '', dueDate: '', status: 'Pending' });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h3 className="text-sm font-semibold text-neutral-100">Add Obligation Manually</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2 text-xs text-neutral-400">
          Obligation Description *
          <textarea
            value={form.obligationDescription}
            onChange={(event) => update('obligationDescription', event.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100"
          />
          {errors.obligationDescription && <p className="mt-1 text-xs text-red-400">{errors.obligationDescription}</p>}
        </label>
        <label className="text-xs text-neutral-400">
          Obligation Type *
          <select
            value={form.obligationType}
            onChange={(event) => update('obligationType', event.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100"
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
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100"
          />
          {errors.owner && <p className="mt-1 text-xs text-red-400">{errors.owner}</p>}
        </label>
        <label className="text-xs text-neutral-400">
          Due Date *
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => update('dueDate', event.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100"
          />
          {errors.dueDate && <p className="mt-1 text-xs text-red-400">{errors.dueDate}</p>}
        </label>
        <label className="text-xs text-neutral-400">
          Status *
          <select
            value={form.status}
            onChange={(event) => update('status', event.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Add Obligation'}
        </button>
      </div>
    </form>
  );
}
