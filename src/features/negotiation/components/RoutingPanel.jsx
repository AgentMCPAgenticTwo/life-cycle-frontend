import { useState } from 'react';

const ROUTING_TYPES = [
  {
    value: 'Sequential',
    label: 'Sequential — notifies next reviewer only after current one submits',
  },
  {
    value: 'Parallel',
    label: 'Parallel — notifies all reviewers simultaneously',
  },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Form capturing Routing Type, Internal Reviewers, External Party Name/Email,
 * Assigned Date and Due Date before Submit for Review (UC5-AF-001, UC5-AF-004, UC5-BR-001..004, UC5-BR-013, UC5-BR-017, UC5-BR-018, UC5-BR-023, UC5-FV-001).
 */
export default function RoutingPanel({ onSubmit, onCancel, isLoading, canAccess }) {
  const [routingType, setRoutingType] = useState('Parallel');
  const [internalReviewersText, setInternalReviewersText] = useState('');
  const [externalPartyName, setExternalPartyName] = useState('');
  const [externalPartyEmail, setExternalPartyEmail] = useState('');
  const [assignedDate, setAssignedDate] = useState(todayIso());
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState(null);

  if (!canAccess) {
    return (
      <div role="alert" className="rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
        <h2 className="text-lg font-semibold text-red-300">Access denied</h2>
        <p className="mt-2 text-sm text-red-200">You do not have permission to route this contract.</p>
      </div>
    );
  }

  const internalReviewers = internalReviewersText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  async function handleSubmit(e) {
    e.preventDefault();
    const hasReviewer = internalReviewers.length > 0;
    const hasExternalParty = Boolean(externalPartyName.trim()) && Boolean(externalPartyEmail.trim());
    if (!hasReviewer && !hasExternalParty) {
      setFormError('Please select at least one internal reviewer or external party before sending');
      return;
    }
    if (dueDate && assignedDate && dueDate <= assignedDate) {
      setFormError('Due Date must be after Assigned Date');
      return;
    }
    setFormError(null);
    try {
      await onSubmit({
        routingType,
        internalReviewers,
        externalPartyName,
        externalPartyEmail,
        assignedDate,
        dueDate,
      });
    } catch (err) {
      setFormError(err.message || 'Unable to submit routing.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-base font-semibold text-neutral-100">Routing Panel</h2>
      <p className="mt-1 text-sm text-neutral-400">
        Choose how this contract moves through review before it reaches Negotiation
      </p>

      <div className="mt-5">
        <label htmlFor="routing-type" className="text-sm font-medium text-neutral-200">
          Routing Type *
        </label>
        <select
          id="routing-type"
          value={routingType}
          onChange={(e) => setRoutingType(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
        >
          <option value="Sequential">Sequential</option>
          <option value="Parallel">Parallel</option>
        </select>
        <p className="mt-1 text-xs text-neutral-500">Sequential, Parallel</p>

        <div className="mt-3 flex flex-col gap-2">
          {ROUTING_TYPES.map((opt) => (
            <div
              key={opt.value}
              className={`rounded-md px-3 py-2 text-xs font-medium ${
                routingType === opt.value
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-neutral-800/60 text-neutral-500'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="internal-reviewers" className="text-sm font-medium text-neutral-200">
          Internal Reviewers *
        </label>
        <textarea
          id="internal-reviewers"
          rows={4}
          value={internalReviewersText}
          onChange={(e) => setInternalReviewersText(e.target.value)}
          placeholder={'Ritu Shenoy (Legal Counsel)\nArjun Mehta (Procurement Lead)'}
          className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
        />
        <p className="mt-1 text-xs text-neutral-500">Multi-select from tenant user list</p>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">External Party</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="external-party-name" className="text-sm font-medium text-neutral-200">
              External Party Name *
            </label>
            <input
              id="external-party-name"
              type="text"
              value={externalPartyName}
              onChange={(e) => setExternalPartyName(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            />
          </div>
          <div>
            <label htmlFor="external-party-email" className="text-sm font-medium text-neutral-200">
              External Party Email *
            </label>
            <input
              id="external-party-email"
              type="email"
              value={externalPartyEmail}
              onChange={(e) => setExternalPartyEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            />
            <p className="mt-1 text-xs text-neutral-500">Used to send secure OTP link</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Schedule</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="assigned-date" className="text-sm font-medium text-neutral-200">
              Assigned Date *
            </label>
            <input
              id="assigned-date"
              type="date"
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            />
            <p className="mt-1 text-xs text-neutral-500">DD/MM/YYYY — defaults to today</p>
          </div>
          <div>
            <label htmlFor="due-date" className="text-sm font-medium text-neutral-200">
              Due Date *
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            />
            <p className="mt-1 text-xs text-neutral-500">DD/MM/YYYY — must be after Assigned Date</p>
          </div>
        </div>
      </div>

      {formError && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {formError}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-4 border-t border-neutral-800 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={!onCancel}
          className="text-sm font-medium text-neutral-400 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Submitting…' : 'Submit for Review'}
        </button>
      </div>
    </form>
  );
}
