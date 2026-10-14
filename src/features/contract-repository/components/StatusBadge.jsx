// Badge for the life-cycle-uc8-uc9 contract status enum (Draft / In Negotiation /
// In Approval / In Signature / Executed / Expired / Terminated / Renewed / Amended).
// Kept separate from features/contracts/components/StatusBadge.jsx, which renders
// the uc123 module's own (different) status enum.
const STATUS_STYLES = {
  Draft: 'bg-neutral-700/60 text-neutral-200',
  'In Negotiation': 'bg-slate-600/40 text-slate-200',
  'In Approval': 'bg-amber-500/20 text-amber-400',
  'In Signature': 'bg-cyan-500/20 text-cyan-300',
  'Pending Approval': 'bg-amber-500/20 text-amber-400',
  'Pending Signature': 'bg-cyan-500/20 text-cyan-300',
  Executed: 'bg-emerald-500/20 text-emerald-400',
  Rejected: 'bg-red-500/20 text-red-400',
  'Signature Declined': 'bg-red-500/20 text-red-400',
  Expired: 'bg-neutral-700/60 text-neutral-300',
  Terminated: 'bg-red-500/20 text-red-400',
  Renewed: 'bg-emerald-500/20 text-emerald-400',
  Amended: 'bg-amber-500/20 text-amber-400',
};

export default function StatusBadge({ status }) {
  const className = STATUS_STYLES[status] ?? 'bg-neutral-700/60 text-neutral-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}
