import { useState } from 'react';
import { useReviewerOptions } from '@/features/negotiation/hooks/useReviewerOptions';

const ROLE_LABELS = {
  TENANT_ADMIN: 'Tenant Admin',
  CONTRACT_OWNER: 'Contract Owner',
  LEGAL_REVIEWER: 'Legal Reviewer',
  APPROVER: 'Approver',
  SIGNER: 'Signer',
};

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
  // Reviewer user ids, in the order picked — the order Sequential routing notifies them in.
  const [internalReviewers, setInternalReviewers] = useState([]);
  const reviewerOptions = useReviewerOptions();
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

  const users = reviewerOptions.data?.items ?? [];

  function toggleReviewer(userId) {
    setInternalReviewers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const hasReviewer = internalReviewers.length > 0;
    const hasExternalParty = Boolean(externalPartyName.trim()) && Boolean(externalPartyEmail.trim());
    if (!hasReviewer && !hasExternalParty) {
      setFormError('Please select at least one internal reviewer or external party before sending');
      return;
    }
    if (!hasReviewer) {
      setFormError('Please select at least one internal reviewer.');
      return;
    }
    if (!hasExternalParty) {
      setFormError('External Party Name and Email are required.');
      return;
    }
    if (!assignedDate || !dueDate) {
      setFormError('Assigned Date and Due Date are required.');
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
        <span id="internal-reviewers-label" className="text-sm font-medium text-neutral-200">
          Internal Reviewers *
        </span>
        <div
          role="group"
          aria-labelledby="internal-reviewers-label"
          className="mt-1 max-h-56 overflow-y-auto rounded-md border border-neutral-700 bg-neutral-950"
        >
          {reviewerOptions.isLoading && <p className="px-3 py-3 text-sm text-neutral-500">Loading users…</p>}
          {reviewerOptions.error && (
            <div role="alert" className="flex items-center justify-between gap-3 px-3 py-3 text-sm text-red-300">
              <span>{reviewerOptions.error.message || 'Unable to load users.'}</span>
              <button
                type="button"
                onClick={reviewerOptions.refetch}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                Retry
              </button>
            </div>
          )}
          {!reviewerOptions.isLoading && !reviewerOptions.error && users.length === 0 && (
            <p className="px-3 py-3 text-sm text-neutral-500">No users found in this tenant.</p>
          )}
          {!reviewerOptions.isLoading &&
            !reviewerOptions.error &&
            users.map((user) => {
              const order = internalReviewers.indexOf(user.id);
              const checked = order !== -1;
              return (
                <label
                  key={user.id}
                  className={`flex cursor-pointer items-center gap-3 border-b border-neutral-800 px-3 py-2 last:border-b-0 ${
                    checked ? 'bg-emerald-500/10' : 'hover:bg-neutral-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleReviewer(user.id)}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-neutral-100">{user.name}</span>
                    <span className="block truncate text-xs text-neutral-500">
                      {ROLE_LABELS[user.role] || user.role} · {user.email}
                    </span>
                  </span>
                  {checked && routingType === 'Sequential' && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                      #{order + 1}
                    </span>
                  )}
                </label>
              );
            })}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {internalReviewers.length
            ? `${internalReviewers.length} selected${routingType === 'Sequential' ? ' — reviewed in the order selected' : ''}`
            : 'Multi-select from tenant user list'}
        </p>
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
