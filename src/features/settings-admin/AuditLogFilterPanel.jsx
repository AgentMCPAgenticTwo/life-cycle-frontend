import { useState } from 'react';

/**
 * Filter Date Range and Apply Filter Button for the Audit Log Tab
 * (UC11-FV-005). Also exposes the userFilter/actionTypeFilter criteria named
 * in UC11-MF-001's acceptance criterion, since both are part of the
 * AuditLogQueryParams contract this panel submits.
 */
export default function AuditLogFilterPanel({ onApplyFilter }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');

  function handleApply(e) {
    e.preventDefault();
    onApplyFilter({
      filterDateRangeFrom: dateFrom || undefined,
      filterDateRangeTo: dateTo || undefined,
      userFilter: userFilter.trim() || undefined,
      actionTypeFilter: actionTypeFilter.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleApply} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="audit-filter-from" className="text-xs font-medium text-neutral-400">
          Filter Date Range — From
        </label>
        <input
          id="audit-filter-from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="mt-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100"
        />
      </div>
      <div>
        <label htmlFor="audit-filter-to" className="text-xs font-medium text-neutral-400">
          To
        </label>
        <input
          id="audit-filter-to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="mt-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100"
        />
      </div>
      <div>
        <label htmlFor="audit-filter-user" className="text-xs font-medium text-neutral-400">
          User
        </label>
        <input
          id="audit-filter-user"
          type="text"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="mt-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100"
        />
      </div>
      <div>
        <label htmlFor="audit-filter-action" className="text-xs font-medium text-neutral-400">
          Action Type
        </label>
        <input
          id="audit-filter-action"
          type="text"
          value={actionTypeFilter}
          onChange={(e) => setActionTypeFilter(e.target.value)}
          className="mt-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
      >
        Apply Filter
      </button>
    </form>
  );
}
