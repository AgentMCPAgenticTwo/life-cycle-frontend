// Active/Inactive status badge for templates and clauses (UC3-FV-001: Status
// is shown as a read-only label).
export default function LibraryStatusBadge({ status }) {
  const isActive = status === 'Active';
  const className = isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-700/60 text-neutral-300';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {status || 'Draft'}
    </span>
  );
}
