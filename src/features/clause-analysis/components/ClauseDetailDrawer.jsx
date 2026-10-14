import { useState } from 'react';
import ClauseEditBox from '@/features/clause-analysis/components/ClauseEditBox';
import AcceptSuggestionControl from '@/features/clause-analysis/components/AcceptSuggestionControl';

const MATCH_STATUS_STYLES = {
  Standard: 'bg-emerald-500/15 text-emerald-400',
  Deviated: 'bg-amber-500/15 text-amber-400',
  Missing: 'bg-red-500/15 text-red-400',
  'Non-standard': 'bg-neutral-700/60 text-neutral-300',
};

// Expanded clause detail showing Risk Score, AI Explanation, and Suggested
// Text (UC4-FV-002). Hosts the Accept Suggestion control, the Clause Edit Box
// for manual rewrite, and a Reject action, gated by the caller's permissions.
export default function ClauseDetailDrawer({
  clause,
  index,
  total,
  canEdit,
  canAccept,
  canReject,
  isAccepting,
  isSaving,
  isRejecting,
  onAccept,
  onSave,
  onReject,
}) {
  const [editing, setEditing] = useState(false);
  const [mandatoryBlockMessage, setMandatoryBlockMessage] = useState(null);

  if (!clause) return null;
  const matchClass = MATCH_STATUS_STYLES[clause.libraryMatchStatus] || 'bg-neutral-700/60 text-neutral-300';
  const isMissing = clause.libraryMatchStatus === 'Missing';
  const canAcceptNow = canAccept && !isMissing && clause.status === 'AI-Suggested';

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-100">
            {clause.clauseCategory || 'Other'} — Clause Detail
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Clause {index + 1} of {total} — flagged for review
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${matchClass}`}>
          {clause.libraryMatchStatus}
        </span>
      </div>

      {clause.aiExplanation && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-neutral-400">AI Explanation</p>
          <p className="text-sm text-neutral-300">{clause.aiExplanation}</p>
        </div>
      )}

      {clause.suggestedText && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-neutral-400">Suggested Text</p>
          <p className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200">
            {clause.suggestedText}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <AcceptSuggestionControl
          clauseId={clause.clauseId}
          suggestedText={clause.suggestedText}
          disabled={!canAcceptNow}
          isLoading={isAccepting}
          onAccept={onAccept}
        />
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-neutral-500"
          >
            ✎ Edit
          </button>
        )}
        {canReject && (
          <button
            type="button"
            onClick={() => {
              // A mandatory clause can never be removed from the contract
              // (UC3-BR / UC4-BR-006) — block before calling the API.
              if (clause.isMandatory) {
                setMandatoryBlockMessage('This clause is mandatory and cannot be removed from the contract.');
                return;
              }
              setMandatoryBlockMessage(null);
              onReject(clause.clauseId);
            }}
            disabled={isRejecting}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-700/60 px-3 py-1.5 text-sm font-medium text-red-400 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRejecting ? 'Rejecting…' : 'Reject'}
          </button>
        )}
      </div>

      {mandatoryBlockMessage && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {mandatoryBlockMessage}
        </p>
      )}

      {canEdit && editing && (
        <div className="mt-4">
          <ClauseEditBox
            clauseId={clause.clauseId}
            initialText={clause.clauseText}
            version={clause.version}
            isSaving={isSaving}
            onSave={(payload) => {
              onSave(payload);
              setEditing(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
