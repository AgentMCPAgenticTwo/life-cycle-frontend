import { useCounterpartySearch } from '@/features/contracts/hooks/useCounterpartySearch';

function fieldClass(hasError) {
  return `rounded-md border px-3 py-2 text-sm bg-neutral-900 text-neutral-100 ${
    hasError ? 'border-red-500' : 'border-neutral-700'
  } focus:border-emerald-500 focus:outline-none`;
}

/**
 * Counterparty Search with Add New Counterparty fields and duplicate
 * GST/Tax ID detection (UC2-AF-008, UC2-FV-002). The Name/Email/Company/
 * Address/GST fields are always editable (either filled from a selected
 * search result, or typed fresh for a new counterparty) — NewContractPage
 * persists them via useCreateCounterparty at Save time when no existing
 * counterparty was selected.
 */
export default function CounterpartyPanel({
  searchTerm,
  onSearchTermChange,
  counterpartyId,
  name,
  email,
  company,
  address,
  gstTaxId,
  onFieldChange,
  onSelect,
  onClear,
  errors = {},
}) {
  const { data: searchResults, isLoading: isSearching } = useCounterpartySearch(searchTerm);
  const { data: gstMatch } = useCounterpartySearch(gstTaxId);

  const duplicateWarning = gstMatch?.duplicateWarning;
  const duplicateMatch = duplicateWarning ? gstMatch?.items?.[0] : null;

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100">Counterparty</h2>
          <p className="mt-1 text-xs text-neutral-500">Search for an existing counterparty or add a new one</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          + Add New Counterparty
        </button>
      </div>

      <label className="mt-4 flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-400">Counterparty Search *</span>
        <input
          type="text"
          value={searchTerm || ''}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Search existing counterparties by name or company"
          className={fieldClass(errors.counterpartySearch)}
        />
      </label>

      {searchTerm && !isSearching && !counterpartyId && searchResults?.items?.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {searchResults.items.map((cp) => (
            <div key={cp.id} className="flex items-center justify-between rounded-lg border border-neutral-700 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-300">
                  {cp.name?.[0]?.toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-100">{cp.name}</p>
                  <p className="text-xs text-neutral-500">
                    {cp.email}
                    {cp.company ? ` · ${cp.company}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelect(cp)}
                className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-emerald-400"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Counterparty Name *</span>
          <input
            type="text"
            value={name || ''}
            onChange={(e) => onFieldChange('counterpartyName', e.target.value)}
            className={fieldClass(errors.counterpartyName)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Counterparty Email *</span>
          <input
            type="email"
            value={email || ''}
            onChange={(e) => onFieldChange('counterpartyEmail', e.target.value)}
            className={fieldClass(errors.counterpartyEmail)}
          />
          <span className="text-[11px] text-neutral-500">Email format</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Counterparty Company *</span>
          <input
            type="text"
            value={company || ''}
            onChange={(e) => onFieldChange('counterpartyCompany', e.target.value)}
            className={fieldClass(errors.counterpartyCompany)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-400">Counterparty GST/Tax ID</span>
          <input
            type="text"
            value={gstTaxId || ''}
            onChange={(e) => onFieldChange('counterpartyGstTaxId', e.target.value)}
            className={fieldClass(errors.counterpartyGstTaxId)}
          />
          <span className="text-[11px] text-neutral-500">Checked for duplicates</span>
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-neutral-400">Counterparty Address</span>
          <textarea
            value={address || ''}
            onChange={(e) => onFieldChange('counterpartyAddress', e.target.value)}
            rows={2}
            className={fieldClass(errors.counterpartyAddress)}
          />
        </label>
      </div>

      {duplicateWarning && duplicateMatch && !counterpartyId && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <span>{duplicateWarning}</span>
          <button
            type="button"
            onClick={() => onSelect(duplicateMatch)}
            className="rounded-md border border-amber-500/60 px-3 py-1 text-xs font-medium hover:bg-amber-500/10"
          >
            Use Existing
          </button>
        </div>
      )}
    </section>
  );
}
