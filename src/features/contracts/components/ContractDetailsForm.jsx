// Currency and Renewal Type enums come straight from the CreateContractRequest
// DTO (context.json) — not invented.
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];
const RENEWAL_TYPES = ['Auto', 'Manual', 'None'];

function fieldClass(hasError) {
  return `rounded-md border px-3 py-2 text-sm bg-neutral-900 text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed ${
    hasError ? 'border-red-500' : 'border-neutral-700'
  } focus:border-emerald-500 focus:outline-none`;
}

/**
 * Captures Contract Owner, Contract Value, Currency, Start/End Date, Renewal
 * Type, Notice Period, Assigned Date (read-only) and Due Date. Notice Period
 * is mandatory and enabled only when Renewal Type is Auto or Manual, and is
 * disabled/cleared when Renewal Type is None (UC2-BR-004).
 */
export default function ContractDetailsForm({ owners, values, assignedDateDisplay, errors = {}, onChange }) {
  const ownerOptions = owners?.items ?? [];
  const noticePeriodEnabled = values.renewalType === 'Auto' || values.renewalType === 'Manual';

  function handleRenewalTypeChange(renewalType) {
    onChange({ renewalType, noticePeriod: renewalType === 'None' ? '' : values.noticePeriod });
  }

  return (
    <>
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
        <h2 className="text-sm font-semibold text-neutral-100">Commercial Details</h2>
        <p className="mt-1 text-xs text-neutral-500">Ownership, value and term of the contract</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Contract Owner *</span>
            <select
              value={values.contractOwnerId || ''}
              onChange={(e) => onChange({ contractOwnerId: e.target.value })}
              className={fieldClass(errors.contractOwnerId)}
            >
              <option value="">Select contract owner</option>
              {ownerOptions.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-neutral-500">
              Defaults to logged-in user; eligible for reassignment by Tenant Admin
            </span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Contract Value *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.contractValue ?? ''}
              onChange={(e) => onChange({ contractValue: e.target.value })}
              className={fieldClass(errors.contractValue)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Currency *</span>
            <select
              value={values.currency || ''}
              onChange={(e) => onChange({ currency: e.target.value })}
              className={fieldClass(errors.currency)}
            >
              <option value="">Select currency</option>
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Start Date *</span>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={values.startDate || ''}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className={fieldClass(errors.startDate)}
            />
            <span className="text-[11px] text-neutral-500">DD/MM/YYYY</span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">End Date *</span>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={values.endDate || ''}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className={fieldClass(errors.endDate)}
            />
            <span className="text-[11px] text-neutral-500">DD/MM/YYYY — must be after Start Date</span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Renewal Type *</span>
            <select
              value={values.renewalType || ''}
              onChange={(e) => handleRenewalTypeChange(e.target.value)}
              className={fieldClass(errors.renewalType)}
            >
              <option value="">Select renewal type</option>
              {RENEWAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">
              Notice Period {noticePeriodEnabled ? '*' : ''}
            </span>
            <input
              type="number"
              min="0"
              step="1"
              disabled={!noticePeriodEnabled}
              value={values.noticePeriod ?? ''}
              onChange={(e) => onChange({ noticePeriod: e.target.value })}
              className={fieldClass(errors.noticePeriod)}
            />
            <span className="text-[11px] text-neutral-500">
              Whole number (days) — required when Renewal Type is Auto or Manual
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
        <h2 className="text-sm font-semibold text-neutral-100">Scheduling</h2>
        <p className="mt-1 text-xs text-neutral-500">Assignment and review tracking dates</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Assigned Date</span>
            <input type="text" value={assignedDateDisplay || ''} disabled className={fieldClass(false)} />
            <span className="text-[11px] text-neutral-500">Auto-populated on creation, read-only.</span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Due Date *</span>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={values.dueDate || ''}
              onChange={(e) => onChange({ dueDate: e.target.value })}
              className={fieldClass(errors.dueDate)}
            />
            <span className="text-[11px] text-neutral-500">DD/MM/YYYY — cannot be earlier than Assigned Date</span>
          </label>
        </div>
      </section>
    </>
  );
}
