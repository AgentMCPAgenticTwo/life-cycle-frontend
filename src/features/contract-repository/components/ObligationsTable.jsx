import { useState } from 'react';
import { formatDate } from '@/features/contract-repository/utils/format';
import { ObligationStatusBadge, ObligationConfirmationBadge } from '@/features/contract-repository/components/ObligationBadges';
import ObligationRowForm from '@/features/contract-repository/components/ObligationRowForm';
import { useUpdateObligation } from '@/features/contract-repository/hooks/useUpdateObligation';
import { useAcceptObligation } from '@/features/contract-repository/hooks/useAcceptObligation';

const COLUMNS = ['Obligation Description', 'Obligation Type', 'Owner', 'Due Date', 'Status', 'Source'];

function ObligationRow({ obligation, readOnly, onEdit, isEditing, onSave, onCancel }) {
  const { update } = useUpdateObligation(obligation.contractId);
  const { accept, isSaving: isAccepting } = useAcceptObligation(obligation.contractId, obligation.obligationId);

  async function handleSave(changes) {
    const updated = await update(obligation.obligationId, changes);
    onSave(updated);
  }

  async function handleAccept() {
    const updated = await accept();
    onSave(updated);
  }

  if (isEditing) {
    return (
      <tr>
        <td colSpan={COLUMNS.length + 1} className="p-0">
          <div className="p-3">
            <ObligationRowForm
              obligation={obligation}
              readOnly={readOnly}
              onSave={(changes, acceptedResult) => (acceptedResult ? onSave(acceptedResult) : handleSave(changes))}
              onCancel={onCancel}
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-neutral-800">
      <td className="px-3 py-3 text-sm text-neutral-200">{obligation.obligationDescription}</td>
      <td className="px-3 py-3 text-sm text-neutral-300">{obligation.obligationType}</td>
      <td className="px-3 py-3 text-sm text-neutral-300">{obligation.owner || 'Unassigned'}</td>
      <td className="px-3 py-3 text-sm text-neutral-300">{formatDate(obligation.dueDate)}</td>
      <td className="px-3 py-3">
        <ObligationStatusBadge status={obligation.status} />
      </td>
      <td className="px-3 py-3">
        <ObligationConfirmationBadge confirmationLabel={obligation.confirmationLabel} />
      </td>
      <td className="px-3 py-3 text-right text-sm">
        {!readOnly && obligation.confirmationLabel === 'AI Suggested' && (
          <button
            type="button"
            onClick={handleAccept}
            disabled={isAccepting}
            className="mr-3 rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAccepting ? 'Accepting…' : 'Accept'}
          </button>
        )}
        {!readOnly && (
          <button type="button" onClick={onEdit} className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}

/**
 * Grid of obligations with columns Obligation Description, Obligation Type,
 * Owner, Due Date, Status, Source (UC9-GC-001, UC9-MF-001).
 */
export default function ObligationsTable({ obligations, readOnly }) {
  const [editingId, setEditingId] = useState(null);

  function handleSave(updated) {
    setEditingId(null);
    // Parent re-fetches/holds the source of truth list via useObligations' store sync.
    void updated;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60">
      <table className="w-full min-w-[720px] table-auto">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
            {COLUMNS.map((column) => (
              <th key={column} className="px-3 py-3 font-medium">
                {column}
              </th>
            ))}
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {obligations.map((obligation) => (
            <ObligationRow
              key={obligation.obligationId}
              obligation={obligation}
              readOnly={readOnly}
              isEditing={editingId === obligation.obligationId}
              onEdit={() => setEditingId(obligation.obligationId)}
              onCancel={() => setEditingId(null)}
              onSave={handleSave}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
