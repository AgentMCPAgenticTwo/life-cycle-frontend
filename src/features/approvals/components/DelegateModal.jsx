import { useState } from 'react';
import { useApproverUsers } from '@/features/approvals/hooks/useApproverUsers';
import { useAuth } from '@/shared/hooks/useAuth';

const DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

function toIsoDate(ddmmyyyy) {
  if (!ddmmyyyy || !DATE_PATTERN.test(ddmmyyyy)) return null;
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Delegate To dropdown with a start/end date range, letting the Approver
 * hand off approval rights for a time-bound window (UC6-AF-005, UC6-BR-008).
 * Only users holding the Approver role in the tenant are offered; the
 * Contract Owner exclusion (UC6-BR-011) and any other eligibility rule are
 * enforced server-side and surfaced here via the returned error message.
 */
export default function DelegateModal({ onConfirm, onClose, isSubmitting, error }) {
  const { userId } = useAuth();
  const { data, isLoading: usersLoading, error: usersError } = useApproverUsers();
  const [delegateToUserId, setDelegateToUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formError, setFormError] = useState(null);

  const eligibleUsers = (data?.items || []).filter((user) => user.id !== userId);

  function handleConfirm() {
    if (!delegateToUserId) {
      setFormError('Select a Delegate To user.');
      return;
    }
    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);
    if (!startIso || !endIso) {
      setFormError('Enter both From and To dates as DD/MM/YYYY.');
      return;
    }
    if (endIso < startIso) {
      setFormError('To date cannot be earlier than From date.');
      return;
    }
    setFormError(null);
    onConfirm({ delegateToUserId, startDate: startIso, endDate: endIso });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900">
        <div className="flex items-start justify-between border-b border-neutral-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-100">Delegate Approval</h2>
          <button type="button" onClick={onClose} className="text-sm text-neutral-400 hover:text-neutral-200">
            × Close
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label htmlFor="delegate-to" className="text-sm font-medium text-neutral-200">
              Delegate To
            </label>
            <select
              id="delegate-to"
              value={delegateToUserId}
              onChange={(e) => setDelegateToUserId(e.target.value)}
              disabled={usersLoading}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            >
              <option value="">Select a delegate…</option>
              {eligibleUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} — Approver
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">List of tenant users with Approver role</p>
            {usersError && <p className="mt-1 text-xs text-red-300">{usersError.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="delegate-from" className="text-sm font-medium text-neutral-200">
                From
              </label>
              <input
                id="delegate-from"
                type="text"
                placeholder="DD/MM/YYYY"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
              />
            </div>
            <div>
              <label htmlFor="delegate-to-date" className="text-sm font-medium text-neutral-200">
                To
              </label>
              <input
                id="delegate-to-date"
                type="text"
                placeholder="DD/MM/YYYY"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
              />
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-xs text-red-300">
              {formError}
            </p>
          )}
          {error && (
            <p role="alert" className="text-xs text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Delegating…' : 'Confirm Delegate'}
          </button>
        </div>
      </div>
    </div>
  );
}
