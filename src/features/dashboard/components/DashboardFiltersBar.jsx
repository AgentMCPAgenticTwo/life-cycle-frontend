import { useState } from 'react';

const DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

function toIsoDate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

function fromFilterValue(value) {
  return value ?? '';
}

/**
 * Contract Type, Department, Counterparty, Owner and Date Range filters with
 * Apply Filters and Clear Filters buttons (UC1-FV-004). Keeps its own draft
 * state so an Apply that produces no matches still shows the values the user
 * picked (UC1-AF-004), and only calls onApply once the Date Range passes
 * DD/MM/YYYY + start-before-end validation (UC1-BR-008).
 */
export default function DashboardFiltersBar({ options, filters, onApply, onClear }) {
  const [draft, setDraft] = useState({
    contractType: fromFilterValue(filters?.contractType),
    department: fromFilterValue(filters?.department),
    counterpartyId: fromFilterValue(filters?.counterpartyId),
    ownerId: fromFilterValue(filters?.ownerId),
    dateRangeStart: '',
    dateRangeEnd: '',
  });
  const [dateError, setDateError] = useState(null);

  function handleChange(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleApply() {
    const { dateRangeStart, dateRangeEnd } = draft;

    if (dateRangeStart && !DATE_PATTERN.test(dateRangeStart)) {
      setDateError('Date Range must use DD/MM/YYYY format.');
      return;
    }
    if (dateRangeEnd && !DATE_PATTERN.test(dateRangeEnd)) {
      setDateError('Date Range must use DD/MM/YYYY format.');
      return;
    }

    const startIso = dateRangeStart ? toIsoDate(dateRangeStart) : null;
    const endIso = dateRangeEnd ? toIsoDate(dateRangeEnd) : null;

    if (startIso && endIso && endIso < startIso) {
      setDateError('End date must be on or after the start date.');
      return;
    }

    setDateError(null);
    onApply({
      contractType: draft.contractType || null,
      department: draft.department || null,
      counterpartyId: draft.counterpartyId || null,
      ownerId: draft.ownerId || null,
      dateRangeStart: startIso,
      dateRangeEnd: endIso,
    });
  }

  function handleClear() {
    setDraft({
      contractType: '',
      department: '',
      counterpartyId: '',
      ownerId: '',
      dateRangeStart: '',
      dateRangeEnd: '',
    });
    setDateError(null);
    onClear();
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="text-sm font-semibold text-neutral-100">Filters</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Contract Type</span>
          <select
            value={draft.contractType}
            onChange={(e) => handleChange('contractType', e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Types</option>
            {(options?.contractTypes ?? []).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Department</span>
          <select
            value={draft.department}
            onChange={(e) => handleChange('department', e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Departments</option>
            {(options?.departments ?? []).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Counterparty</span>
          <select
            value={draft.counterpartyId}
            onChange={(e) => handleChange('counterpartyId', e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Counterparties</option>
            {(options?.counterparties ?? []).map((counterparty) => (
              <option key={counterparty.id} value={counterparty.id}>
                {counterparty.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Owner</span>
          <select
            value={draft.ownerId}
            onChange={(e) => handleChange('ownerId', e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Owners</option>
            {(options?.owners ?? []).map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Date Range</span>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="DD/MM/YYYY"
              value={draft.dateRangeStart}
              onChange={(e) => handleChange('dateRangeStart', e.target.value)}
              className="w-1/2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="DD/MM/YYYY"
              value={draft.dateRangeEnd}
              onChange={(e) => handleChange('dateRangeEnd', e.target.value)}
              className="w-1/2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </label>
      </div>

      {dateError && <p className="mt-3 text-xs text-red-400">{dateError}</p>}

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={handleApply}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          Clear Filters
        </button>
      </div>
    </section>
  );
}
