/**
 * Visual flag indicating an overdue reviewer on the Tracker (UC5-AF-006 / BR-010).
 */
export default function OverdueFlagBadge({ dueDate, submitted }) {
  const isOverdue = !submitted && dueDate && new Date(dueDate).getTime() < Date.now();
  if (!isOverdue) return null;

  return (
    <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-300">Overdue</span>
  );
}
