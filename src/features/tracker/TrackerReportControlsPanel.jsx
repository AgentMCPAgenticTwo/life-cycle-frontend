import { useState } from 'react';
import { useTrackerFilterOptions } from '@/features/tracker/hooks/useTrackerFilterOptions';

const PERIOD_OPTIONS = ['Daily', 'Weekly', 'Monthly'];

/**
 * Period dropdown, Contract Type Filter, Owner Filter, Date Range From/To and
 * the Export Button (UC10-MF-001 / UC10-FV-001). Period is mandatory; a
 * custom Date Range overrides Period when both From and To are valid
 * (UC10-BR-006), and From must be earlier than To (UC10-FV-001).
 */
export default function TrackerReportControlsPanel({
  period,
  contractTypeFilter,
  ownerFilter,
  dateRangeFrom,
  dateRangeTo,
  onFilterChange,
}) {
  const { contractTypes, owners } = useTrackerFilterOptions();
  const [dateRangeError, setDateRangeError] = useState(null);

  function validateRange(from, to) {
    if (from && to && from > to) {
      setDateRangeError('Date Range From must be earlier than Date Range To.');
      return false;
    }
    setDateRangeError(null);
    return true;
  }

  function handleDateRangeFrom(value) {
    validateRange(value, dateRangeTo);
    onFilterChange({ dateRangeFrom: value || null, dateRangeTo });
  }

  function handleDateRangeTo(value) {
    validateRange(dateRangeFrom, value);
    onFilterChange({ dateRangeFrom, dateRangeTo: value || null });
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h2 className="text-sm font-semibold text-neutral-200">Filters</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Period *</span>
          <select
            value={period}
            onChange={(e) => onFilterChange({ period: e.target.value })}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-xs text-neutral-600">Daily, Weekly, Monthly</span>
          {!period && <span className="text-xs text-red-400">Period is required.</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Contract Type Filter</span>
          <select
            value={contractTypeFilter}
            onChange={(e) => onFilterChange({ contractTypeFilter: e.target.value })}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All</option>
            {contractTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <span className="text-xs text-neutral-600">Tenant's configured contract types, plus All</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Owner Filter</span>
          <select
            value={ownerFilter}
            onChange={(e) => onFilterChange({ ownerFilter: e.target.value })}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-neutral-600">Tenant users with owned contracts, plus All</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Date Range From</span>
          <input
            type="date"
            value={dateRangeFrom || ''}
            onChange={(e) => handleDateRangeFrom(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          />
          <span className="text-xs text-neutral-600">DD/MM/YYYY — must be earlier than Date Range To</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Date Range To</span>
          <input
            type="date"
            value={dateRangeTo || ''}
            onChange={(e) => handleDateRangeTo(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          />
          <span className="text-xs text-neutral-600">DD/MM/YYYY — must be later than Date Range From</span>
        </label>
      </div>

      {dateRangeError && <p className="mt-3 text-xs text-red-400">{dateRangeError}</p>}
    </section>
  );
}
