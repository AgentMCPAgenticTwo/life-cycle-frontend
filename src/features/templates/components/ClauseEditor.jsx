import { useEffect, useState } from 'react';
import LibraryStatusBadge from '@/features/templates/components/LibraryStatusBadge';
import RiskLevelBadge from '@/features/templates/components/RiskLevelBadge';

// Predefined per UC3-FV-002's acceptance criteria.
const CLAUSE_CATEGORIES = ['Confidentiality', 'Liability', 'Termination', 'Payment Terms'];
const RISK_LEVELS = ['Low', 'Medium', 'High'];
const MAX_NAME_LENGTH = 150;

function fieldClass(hasError) {
  return `rounded-md border px-3 py-2 text-sm bg-neutral-900 text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed ${
    hasError ? 'border-red-500' : 'border-neutral-700'
  } focus:border-emerald-500 focus:outline-none`;
}

/**
 * Edits Clause Name, Clause Category, Standard Text, Fallback Text 1/2, Risk
 * Level and Mandatory (UC3-FV-002), with Version History / Deactivate /
 * Reactivate for existing clauses (UC3-BR-002/007/012/013) and the Mandatory
 * lock-in warning from UC3-AF-003/BR-001.
 */
export default function ClauseEditor({
  clause,
  readOnly,
  canManage,
  canDeactivate,
  isSaving,
  formError,
  existingClausesInCategory,
  onSave,
  onDiscard,
  onVersionHistory,
  onDeactivate,
  onReactivate,
}) {
  const isNew = !clause?.id;
  const [values, setValues] = useState({
    clauseName: clause?.clauseName || '',
    clauseCategory: clause?.clauseCategory || '',
    standardText: clause?.standardText || '',
    fallbackText1: clause?.fallbackText1 || '',
    fallbackText2: clause?.fallbackText2 || '',
    riskLevel: clause?.riskLevel || '',
    mandatory: clause?.mandatory || false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({
      clauseName: clause?.clauseName || '',
      clauseCategory: clause?.clauseCategory || '',
      standardText: clause?.standardText || '',
      fallbackText1: clause?.fallbackText1 || '',
      fallbackText2: clause?.fallbackText2 || '',
      riskLevel: clause?.riskLevel || '',
      mandatory: clause?.mandatory || false,
    });
    setErrors({});
  }, [clause?.id]);

  function update(partial) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  function validate() {
    const nextErrors = {};
    if (!values.clauseName.trim()) nextErrors.clauseName = 'Clause Name is required.';
    else if (values.clauseName.length > MAX_NAME_LENGTH) nextErrors.clauseName = `Clause Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
    if (!values.clauseCategory) nextErrors.clauseCategory = 'Clause Category is required.';
    if (!values.standardText.trim()) nextErrors.standardText = 'Standard Text is required.';
    if (!values.riskLevel) nextErrors.riskLevel = 'Risk Level is required.';
    return nextErrors;
  }

  function handleSave() {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSave({
      clauseName: values.clauseName,
      clauseCategory: values.clauseCategory,
      standardText: values.standardText,
      fallbackText1: values.fallbackText1 || undefined,
      fallbackText2: values.fallbackText2 || undefined,
      riskLevel: values.riskLevel,
      mandatory: values.mandatory,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isNew ? 'New Clause' : values.clauseName || 'Edit Clause'}</h1>
          <p className="mt-1 text-sm text-neutral-500">Define standard and fallback wording for use across contract templates</p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDiscard}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {formError && (
        <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {formError}
        </div>
      )}

      <div className="rounded-xl border border-emerald-600/40 bg-emerald-500/10 p-5">
        <h2 className="text-sm font-semibold text-emerald-200">Mandatory clauses can&apos;t be removed once attached</h2>
        <p className="mt-1 text-xs text-emerald-300/80">
          Setting Mandatory below locks this clause into every contract built from a template that includes it — the
          &apos;Remove Clause&apos; option will be disabled for it in the Contract Builder.
        </p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
            Template &amp; Clause Library
          </span>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
            {isNew ? 'Version 1 (new)' : `Status: ${clause?.status || 'Draft'}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="text-sm font-semibold text-neutral-100">Clause Details</h2>
          <p className="mt-1 text-xs text-neutral-500">Core identification and category</p>

          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">Clause Name *</span>
              <input
                type="text"
                disabled={readOnly}
                maxLength={MAX_NAME_LENGTH}
                placeholder="e.g. Limitation of Liability — Standard"
                value={values.clauseName}
                onChange={(e) => update({ clauseName: e.target.value })}
                className={fieldClass(errors.clauseName)}
              />
              <span className="text-[11px] text-neutral-500">Free text, max 150 characters</span>
              {errors.clauseName && <span className="text-[11px] text-red-400">{errors.clauseName}</span>}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">Clause Category *</span>
              <select
                disabled={readOnly}
                value={values.clauseCategory}
                onChange={(e) => update({ clauseCategory: e.target.value })}
                className={fieldClass(errors.clauseCategory)}
              >
                <option value="">Select category…</option>
                {CLAUSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-neutral-500">{CLAUSE_CATEGORIES.join(', ')}</span>
              {errors.clauseCategory && <span className="text-[11px] text-red-400">{errors.clauseCategory}</span>}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">Risk Level *</span>
              <select
                disabled={readOnly}
                value={values.riskLevel}
                onChange={(e) => update({ riskLevel: e.target.value })}
                className={fieldClass(errors.riskLevel)}
              >
                <option value="">Select risk level…</option>
                {RISK_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-neutral-500">Low, Medium, High</span>
              {errors.riskLevel && <span className="text-[11px] text-red-400">{errors.riskLevel}</span>}
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={values.mandatory}
                onChange={(e) => update({ mandatory: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-neutral-400">Mandatory *</span>
            </label>
            <span className="-mt-3 text-[11px] text-neutral-500">Checked = clause cannot be removed from any contract</span>

            {!isNew && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-400">Status</span>
                <LibraryStatusBadge status={clause?.status} />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="text-sm font-semibold text-neutral-100">Wording</h2>
          <p className="mt-1 text-xs text-neutral-500">Standard and fallback phrasing used during negotiation</p>

          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">Standard Text *</span>
              <textarea
                disabled={readOnly}
                rows={3}
                placeholder="Enter the preferred wording for this clause…"
                value={values.standardText}
                onChange={(e) => update({ standardText: e.target.value })}
                className={fieldClass(errors.standardText)}
              />
              <span className="text-[11px] text-neutral-500">Free text clause wording</span>
              {errors.standardText && <span className="text-[11px] text-red-400">{errors.standardText}</span>}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">Fallback Text 1</span>
              <textarea
                disabled={readOnly}
                rows={3}
                placeholder="Enter an acceptable alternate wording…"
                value={values.fallbackText1}
                onChange={(e) => update({ fallbackText1: e.target.value })}
                className={fieldClass(false)}
              />
              <span className="text-[11px] text-neutral-500">Free text alternate wording</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">Fallback Text 2</span>
              <textarea
                disabled={readOnly}
                rows={3}
                placeholder="Enter a second acceptable alternate wording…"
                value={values.fallbackText2}
                onChange={(e) => update({ fallbackText2: e.target.value })}
                className={fieldClass(false)}
              />
              <span className="text-[11px] text-neutral-500">Free text alternate wording</span>
            </label>
          </div>
        </section>
      </div>

      {existingClausesInCategory && existingClausesInCategory.length > 0 && (
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="text-sm font-semibold text-neutral-100">Existing Clauses in this Category</h2>
          <ul className="mt-3 divide-y divide-neutral-800">
            {existingClausesInCategory.map((existing) => (
              <li key={existing.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-100">{existing.clauseName}</p>
                  <p className="text-xs text-neutral-500">
                    {existing.clauseCategory} · {existing.mandatory ? 'Mandatory' : 'Optional'}
                  </p>
                </div>
                <RiskLevelBadge riskLevel={existing.riskLevel} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isNew && canManage && (
        <section className="flex items-center justify-end gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <button
            type="button"
            onClick={() => onVersionHistory(clause.id)}
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Version History
          </button>
          {canDeactivate && clause?.status === 'Active' && (
            <button
              type="button"
              onClick={() => onDeactivate(clause.id)}
              className="rounded-md border border-red-500/60 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
            >
              Deactivate
            </button>
          )}
          {canDeactivate && clause?.status === 'Inactive' && (
            <button
              type="button"
              onClick={() => onReactivate(clause.id)}
              className="rounded-md border border-emerald-500/60 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10"
            >
              Reactivate
            </button>
          )}
        </section>
      )}

      {!readOnly && (
        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}
