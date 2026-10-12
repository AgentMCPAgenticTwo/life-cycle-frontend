// Badges for the ObligationResponse Status and confirmationLabel enums
// (UC9-GC-001 grid columns / UC9-BR-005 AI Suggested vs Confirmed labelling).
const STATUS_STYLES = {
  Pending: 'bg-amber-500/20 text-amber-400',
  'In Progress': 'bg-cyan-500/20 text-cyan-300',
  Completed: 'bg-emerald-500/20 text-emerald-400',
  Overdue: 'bg-red-500/20 text-red-400',
};

const CONFIRMATION_STYLES = {
  'AI Suggested': 'bg-cyan-500/20 text-cyan-300',
  Confirmed: 'bg-emerald-500/20 text-emerald-400',
};

export function ObligationStatusBadge({ status }) {
  const className = STATUS_STYLES[status] ?? 'bg-neutral-700/60 text-neutral-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}

export function ObligationConfirmationBadge({ confirmationLabel }) {
  const className = CONFIRMATION_STYLES[confirmationLabel] ?? 'bg-neutral-700/60 text-neutral-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {confirmationLabel}
    </span>
  );
}
