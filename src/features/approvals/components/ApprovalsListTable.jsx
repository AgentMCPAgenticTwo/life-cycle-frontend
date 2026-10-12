import { Link } from 'react-router-dom';

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const STATUS_LABELS = {
  PendingApproval: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  ReadyForSignature: 'Ready for Signature',
};

const STATUS_BADGE_CLASSES = {
  PendingApproval: 'bg-amber-500/20 text-amber-300',
  Approved: 'bg-emerald-500/20 text-emerald-300',
  Rejected: 'bg-red-500/20 text-red-300',
  ReadyForSignature: 'bg-sky-500/20 text-sky-300',
};

function riskTextColor(score) {
  if (score == null) return 'text-neutral-500';
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-emerald-400';
}

// No status/risk icon field exists on ApprovalListItemResponse — the marker
// shown per row is derived from aiRiskScore using the same high/medium/low
// bands as ApprovalDetailsCard's risk gauge, not a value the API returns.
function RowIcon({ score }) {
  if (score != null && score >= 70) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400" aria-hidden="true">
        ▲
      </span>
    );
  }
  if (score != null && score < 40) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400" aria-hidden="true">
        ✓
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-700/40 text-neutral-400" aria-hidden="true">
      ⏱
    </span>
  );
}

/**
 * Grid of approvals showing Contract Title, Type, Value, Counterparty, AI
 * Risk Score, and Approval Matrix Step (UC6-AF-006, UC6-BR-016/017/018).
 * Selecting a row opens the Approval Review screen for that approval.
 */
export default function ApprovalsListTable({ items }) {
  return (
    <ul className="flex flex-col divide-y divide-neutral-800">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={`/approvals/${item.id}`}
            className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-800/40"
          >
            <RowIcon score={item.aiRiskScore} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-100">
                {item.counterpartyName} — {item.contractTitle}
                <span className="ml-2 text-xs font-normal text-neutral-500">{item.contractType}</span>
              </p>
              <p className="mt-1 truncate text-xs text-neutral-500">
                Approval Matrix Step {item.approvalMatrixStepLabel} · Value {CURRENCY_FORMATTER.format(item.contractValue)}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  STATUS_BADGE_CLASSES[item.status] || 'bg-neutral-700/40 text-neutral-300'
                }`}
              >
                {STATUS_LABELS[item.status] || item.status}
              </span>
              <span className={`text-[11px] font-medium uppercase tracking-wide ${riskTextColor(item.aiRiskScore)}`}>
                Risk score {item.aiRiskScore ?? '—'}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
