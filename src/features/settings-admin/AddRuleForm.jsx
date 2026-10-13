import { useState } from 'react';

const CONTRACT_TYPE_OPTIONS = ['Product', 'Service'];
const APPROVER_ROLE_OPTIONS = ['Approver', 'Legal Reviewer', 'Tenant Admin'];
const MISSING_FIELDS_MESSAGE = 'Please complete all required fields';

/**
 * Add Rule form (UC11-MF-001 / UC11-FV-002). Contract Type and Approver Role
 * are mandatory dropdowns; Value Threshold must be a non-negative number.
 * Duplicate Contract Type + Value Threshold combinations (UC11-BR-004) are
 * rejected server-side and surfaced via the `error` prop.
 */
export default function AddRuleForm({ onSubmit, onCancel, isSubmitting = false, error = null }) {
  const [contractType, setContractType] = useState('');
  const [valueThreshold, setValueThreshold] = useState('');
  const [approverRole, setApproverRole] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!contractType) nextErrors.contractType = true;
    if (!approverRole) nextErrors.approverRole = true;

    const numericThreshold = Number(valueThreshold);
    if (valueThreshold.trim() === '' || Number.isNaN(numericThreshold) || numericThreshold < 0) {
      nextErrors.valueThreshold = true;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    onSubmit({ contractType, valueThreshold: numericThreshold, approverRole });
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="border-b border-neutral-800 px-6 py-4">
          <h2 className="text-base font-semibold text-neutral-100">Rule Details</h2>
          <p className="mt-1 text-xs text-neutral-500">All fields are required to add a new rule</p>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label htmlFor="add-rule-contract-type" className="text-sm font-medium text-neutral-200">
              Contract Type <span className="text-red-400">*</span>
            </label>
            <select
              id="add-rule-contract-type"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              disabled={isSubmitting}
              className={`mt-1 w-full rounded-md border bg-neutral-950 px-3 py-2 text-sm text-neutral-100 ${
                fieldErrors.contractType ? 'border-red-500' : 'border-neutral-700'
              }`}
            >
              <option value="">Select a contract type</option>
              {CONTRACT_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">{CONTRACT_TYPE_OPTIONS.join(', ')}</p>
          </div>

          <div>
            <label htmlFor="add-rule-value-threshold" className="text-sm font-medium text-neutral-200">
              Value Threshold <span className="text-red-400">*</span>
            </label>
            <input
              id="add-rule-value-threshold"
              type="number"
              min="0"
              step="0.01"
              value={valueThreshold}
              onChange={(e) => setValueThreshold(e.target.value)}
              disabled={isSubmitting}
              className={`mt-1 w-full rounded-md border bg-neutral-950 px-3 py-2 text-sm text-neutral-100 ${
                fieldErrors.valueThreshold ? 'border-red-500' : 'border-neutral-700'
              }`}
            />
            <p className="mt-1 text-xs text-neutral-500">Minimum contract value triggering this rule</p>
          </div>

          <div>
            <label htmlFor="add-rule-approver-role" className="text-sm font-medium text-neutral-200">
              Approver Role <span className="text-red-400">*</span>
            </label>
            <select
              id="add-rule-approver-role"
              value={approverRole}
              onChange={(e) => setApproverRole(e.target.value)}
              disabled={isSubmitting}
              className={`mt-1 w-full rounded-md border bg-neutral-950 px-3 py-2 text-sm text-neutral-100 ${
                fieldErrors.approverRole ? 'border-red-500' : 'border-neutral-700'
              }`}
            >
              <option value="">Select an approver role</option>
              {APPROVER_ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">{APPROVER_ROLE_OPTIONS.join(', ')}</p>
          </div>

          {hasFieldErrors && (
            <p role="alert" className="text-xs text-red-300">
              {MISSING_FIELDS_MESSAGE}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-md border border-blue-900 bg-blue-950/40 px-3 py-2 text-xs text-blue-200">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Save Role'}
          </button>
        </div>
      </form>
    </div>
  );
}
