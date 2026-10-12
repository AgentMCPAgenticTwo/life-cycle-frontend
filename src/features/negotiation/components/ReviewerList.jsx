import OverdueFlagBadge from '@/features/negotiation/components/OverdueFlagBadge';

const STATUS_STYLES = {
  Submitted: 'bg-emerald-500/20 text-emerald-300',
  Pending: 'bg-neutral-700/40 text-neutral-300',
  Overdue: 'bg-red-500/20 text-red-300',
};

/**
 * Lists internal reviewers with mandatory badges, sequence order, and review status
 * (UC5-BR-002..005, UC5-BR-019, UC5-AF-006).
 */
export default function ReviewerList({ reviewers, dueDate }) {
  if (!reviewers?.length) {
    return <p className="text-sm text-neutral-500">No internal reviewers assigned yet.</p>;
  }

  const ordered = [...reviewers].sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0));

  return (
    <ul className="flex flex-col gap-2">
      {ordered.map((reviewer) => (
        <li
          key={reviewer.reviewerId}
          className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-neutral-100">
              {reviewer.sequenceOrder != null && (
                <span className="mr-2 text-neutral-500">#{reviewer.sequenceOrder}</span>
              )}
              {reviewer.reviewerName}
              {reviewer.role && <span className="ml-1 text-neutral-500">({reviewer.role})</span>}
            </p>
            {reviewer.isMandatory && (
              <span className="mt-1 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                Mandatory
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <OverdueFlagBadge dueDate={dueDate} submitted={reviewer.reviewStatus === 'Submitted'} />
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUS_STYLES[reviewer.reviewStatus] || STATUS_STYLES.Pending
              }`}
            >
              {reviewer.reviewStatus}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
