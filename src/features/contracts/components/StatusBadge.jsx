const STATUS_STYLES = {
  Draft: 'bg-neutral-700/60 text-neutral-200',
  'In Negotiation': 'bg-slate-600/40 text-slate-200',
  'Pending Approval': 'bg-amber-500/20 text-amber-400',
  'Pending Signature': 'bg-cyan-500/20 text-cyan-300',
  Executed: 'bg-emerald-500/20 text-emerald-400',
};

export default function StatusBadge({ status }) {
  const className = STATUS_STYLES[status] ?? 'bg-neutral-700/60 text-neutral-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}
