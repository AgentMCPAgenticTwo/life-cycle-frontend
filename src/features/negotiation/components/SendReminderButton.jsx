import { useState } from 'react';
import { useSendReminder } from '@/features/negotiation/hooks/useSendReminder';

/**
 * Enabled only when a reviewer's Due Date has passed; sends a manual reminder email (UC5-AF-006 / BR-010 / BR-013).
 * `stopped` is true once every reviewer has submitted or the contract is marked Agreed — reminders
 * (manual here, daily automatic on the backend) stop at that point.
 */
export default function SendReminderButton({ contractId, dueDate, stopped = false }) {
  const { mutate, isLoading } = useSendReminder(contractId);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const enabled = !stopped && Boolean(dueDate) && new Date(dueDate).getTime() < Date.now();
  const stoppedHint = 'Reminders stopped — review submitted or contract agreed';
  const reminderHint = enabled
    ? undefined
    : stopped
      ? stoppedHint
      : 'Enabled only when Due Date has passed';

  async function handleClick() {
    setError(null);
    setResult(null);
    try {
      const response = await mutate();
      setResult(response);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={!enabled || isLoading}
        title={reminderHint}
        className="w-full rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Sending…' : 'Send Reminder'}
      </button>
      <p className="mt-1 text-[11px] text-neutral-500">
        {stopped
          ? stoppedHint
          : 'Enabled only when due date has passed. A daily reminder also goes to the reviewer and the owner.'}
      </p>
      {result && (
        <p role="status" className="mt-1 text-xs text-emerald-300">
          Reminder sent to {result.sentTo}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
