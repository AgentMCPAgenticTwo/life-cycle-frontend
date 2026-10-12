import { useState } from 'react';
import { useFolderTagOptions } from '@/features/contract-repository/hooks/useFolderTagOptions';

const STATUS_OPTIONS = [
  'Draft',
  'In Negotiation',
  'In Approval',
  'In Signature',
  'Executed',
  'Expired',
  'Terminated',
  'Renewed',
  'Amended',
];

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';
const labelClass = 'text-xs font-medium uppercase tracking-wide text-neutral-500';

/**
 * Search Box, Status Filter, Date Range Filter, Value Filter, Folder/Tag Filter
 * and Search Button for the Contract Repository screen (UC8-MF-001).
 */
export default function SearchFilterPanel({ disabled, onSearch }) {
  const { data: folderTagOptions } = useFolderTagOptions();

  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('');
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  const [valueMin, setValueMin] = useState('');
  const [valueMax, setValueMax] = useState('');
  const [folderTagId, setFolderTagId] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    onSearch?.({
      searchText: searchText || undefined,
      status: status || undefined,
      startDateFrom: startDateFrom || undefined,
      startDateTo: startDateTo || undefined,
      valueMin: valueMin === '' ? undefined : Number(valueMin),
      valueMax: valueMax === '' ? undefined : Number(valueMax),
      folderTagIds: folderTagId ? [folderTagId] : undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="lg:col-span-1">
          <label className={labelClass} htmlFor="repo-search-box">
            Search
          </label>
          <input
            id="repo-search-box"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            disabled={disabled}
            placeholder="Search contracts…"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Matched against contract name, counterparty, clause text
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="repo-status-filter">
            Status Filter
          </label>
          <select
            id="repo-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={disabled}
            className={inputClass}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Date Range Filter</label>
          <div className="mt-1 flex items-center gap-1.5">
            <input
              type="date"
              aria-label="Date range start"
              value={startDateFrom}
              onChange={(event) => setStartDateFrom(event.target.value)}
              disabled={disabled}
              className={inputClass}
            />
            <span className="text-neutral-600">–</span>
            <input
              type="date"
              aria-label="Date range end"
              value={startDateTo}
              onChange={(event) => setStartDateTo(event.target.value)}
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">DD/MM/YYYY — filters by start and end date</p>
        </div>

        <div>
          <label className={labelClass}>Value Filter</label>
          <div className="mt-1 flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              aria-label="Minimum value"
              value={valueMin}
              onChange={(event) => setValueMin(event.target.value)}
              disabled={disabled}
              placeholder="Min"
              className={inputClass}
            />
            <span className="text-neutral-600">–</span>
            <input
              type="number"
              min="0"
              aria-label="Maximum value"
              value={valueMax}
              onChange={(event) => setValueMax(event.target.value)}
              disabled={disabled}
              placeholder="Max"
              className={inputClass}
            />
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Currency amount</p>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className={labelClass} htmlFor="repo-folder-tag-filter">
              Folder/Tag Filter
            </label>
            <select
              id="repo-folder-tag-filter"
              value={folderTagId}
              onChange={(event) => setFolderTagId(event.target.value)}
              disabled={disabled}
              className={inputClass}
            >
              <option value="">All folders/tags</option>
              {folderTagOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true">🔍</span>
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
