import { useState } from 'react';

const COMMENTS_REQUIRED_MESSAGE = 'Comments are required when rejecting or sending back a contract.';
const NOT_YET_REACHED_MESSAGE = 'This step is not yet available for approval. Waiting on an earlier approver.';

/**
 * Approve / Reject / Send Back actions for the current approval step, with
 * a shared Comments field that is mandatory for Reject/Send Back and
 * optional for Approve (UC6-AF-002, UC6-BR-003, UC6-BR-004), and with every
 * action disabled whenever the step has not yet been reached in sequence
 * (UC6-AF-001, UC6-BR-007).
 */
export default function ApprovalActionsPanel({ approval, onSubmit }) {
  const [comments, setComments] = useState('');
  const [localError, setLocalError] = useState(null);

  const stepActionable = approval.isStepActionable;

  function handleAction(actionType) {
    if (!stepActionable) {
      setLocalError(NOT_YET_REACHED_MESSAGE);
      return;
    }
    const trimmed = comments.trim();
    if (actionType !== 'Approve' && !trimmed) {
      setLocalError(COMMENTS_REQUIRED_MESSAGE);
      return;
    }
    setLocalError(null);
    onSubmit({ actionType, comments: trimmed || undefined });
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <h3 className="text-sm font-semibold text-neutral-100">Decision</h3>

      {!stepActionable && (
        <p role="alert" className="mt-2 text-xs text-amber-300">
          {NOT_YET_REACHED_MESSAGE}
        </p>
      )}

      <label htmlFor="approval-comments" className="sr-only">
        Comments
      </label>
      <textarea
        id="approval-comments"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        disabled={!stepActionable}
        rows={3}
        placeholder="Add comments (optional for Approve)"
        className="mt-3 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p className="mt-1 text-xs text-neutral-500">Mandatory if rejecting or sending back</p>

      {localError && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {localError}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleAction('Approve')}
          disabled={!stepActionable || !approval.canApprove}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ✓ Approve
        </button>
        <button
          type="button"
          onClick={() => handleAction('Reject')}
          disabled={!stepActionable || !approval.canReject}
          className="rounded-md border border-red-600/60 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ✗ Reject
        </button>
        <button
          type="button"
          onClick={() => handleAction('SendBack')}
          disabled={!stepActionable || !approval.canSendBack}
          className="rounded-md border border-amber-500/60 px-4 py-2 text-sm font-semibold text-amber-300 hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ↩ Send Back
        </button>
      </div>
    </div>
  );
}
