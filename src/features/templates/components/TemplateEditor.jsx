import { useEffect, useRef, useState } from 'react';
import LibraryStatusBadge from '@/features/templates/components/LibraryStatusBadge';

// Predefined per BR-6's notes_assumptions and the design's quick-insert
// chips — free-typed curly-brace text is never treated as a live merge field.
const MERGE_FIELDS = ['{Counterparty Name}', '{Contract Value}', '{Start Date}'];

// Predefined per the design's Template Category helper text.
const TEMPLATE_CATEGORIES = ['Sales Agreement', 'NDA', 'Procurement Contract', 'Service Agreement'];

// No template-file-upload endpoint exists in this module's contract, so
// Document Format is a constrained dropdown rather than an actual file
// upload — this inherently satisfies AF-5 (PDF/DOCX only, nothing else
// selectable).
const DOCUMENT_FORMATS = ['PDF', 'DOCX'];

const MAX_NAME_LENGTH = 150;

function fieldClass(hasError) {
  return `rounded-md border px-3 py-2 text-sm bg-neutral-900 text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed ${
    hasError ? 'border-red-500' : 'border-neutral-700'
  } focus:border-emerald-500 focus:outline-none`;
}

/**
 * Edits Template Name, Template Category, Document Format and Template Body
 * (UC3-FV-001), with predefined-list-only merge field insertion (UC3-BR-006)
 * and Version History / Deactivate / Reactivate for existing templates
 * (UC3-BR-002/007/012/013).
 */
export default function TemplateEditor({
  template,
  readOnly,
  canManage,
  canDeactivate,
  isSaving,
  formError,
  onSave,
  onDiscard,
  onVersionHistory,
  onDeactivate,
  onReactivate,
}) {
  const isNew = !template?.id;
  const [values, setValues] = useState({
    templateName: template?.templateName || '',
    templateCategory: template?.templateCategory || '',
    documentFormat: template?.documentFormat || '',
    templateBody: template?.templateBody || '',
  });
  const [errors, setErrors] = useState({});
  const bodyRef = useRef(null);

  useEffect(() => {
    setValues({
      templateName: template?.templateName || '',
      templateCategory: template?.templateCategory || '',
      documentFormat: template?.documentFormat || '',
      templateBody: template?.templateBody || '',
    });
    setErrors({});
  }, [template?.id]);

  function update(partial) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  function insertMergeField(field) {
    update({ templateBody: `${values.templateBody}${values.templateBody ? ' ' : ''}${field}` });
    bodyRef.current?.focus();
  }

  function validate() {
    const nextErrors = {};
    if (!values.templateName.trim()) nextErrors.templateName = 'Template Name is required.';
    else if (values.templateName.length > MAX_NAME_LENGTH) nextErrors.templateName = `Template Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
    if (!values.templateCategory) nextErrors.templateCategory = 'Template Category is required.';
    if (!values.documentFormat) nextErrors.documentFormat = 'Document Format is required.';
    if (!values.templateBody.trim()) nextErrors.templateBody = 'Template Body is required.';
    return nextErrors;
  }

  function handleSave() {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSave({
      templateName: values.templateName,
      templateCategory: values.templateCategory,
      documentFormat: values.documentFormat,
      templateBody: values.templateBody,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isNew ? 'New Template' : values.templateName || 'Edit Template'}</h1>
          <p className="mt-1 text-sm text-neutral-500">Define the template details and draft the document body</p>
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

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
        <h2 className="text-sm font-semibold text-neutral-100">Template Details</h2>
        <p className="mt-1 text-xs text-neutral-500">
          {isNew ? 'Version 1 will be created on save' : `Status: ${template?.status || 'Draft'}`}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Template Name *</span>
            <input
              type="text"
              disabled={readOnly}
              maxLength={MAX_NAME_LENGTH}
              placeholder="e.g. Standard Services Master Agreement"
              value={values.templateName}
              onChange={(e) => update({ templateName: e.target.value })}
              className={fieldClass(errors.templateName)}
            />
            <span className="text-[11px] text-neutral-500">Free text, max 150 characters</span>
            {errors.templateName && <span className="text-[11px] text-red-400">{errors.templateName}</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Template Category *</span>
            <select
              disabled={readOnly}
              value={values.templateCategory}
              onChange={(e) => update({ templateCategory: e.target.value })}
              className={fieldClass(errors.templateCategory)}
            >
              <option value="">Select category…</option>
              {TEMPLATE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-neutral-500">{TEMPLATE_CATEGORIES.join(', ')}</span>
            {errors.templateCategory && <span className="text-[11px] text-red-400">{errors.templateCategory}</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-400">Document Format *</span>
            <select
              disabled={readOnly}
              value={values.documentFormat}
              onChange={(e) => update({ documentFormat: e.target.value })}
              className={fieldClass(errors.documentFormat)}
            >
              <option value="">Select format…</option>
              {DOCUMENT_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-neutral-500">PDF, DOCX</span>
            {errors.documentFormat && <span className="text-[11px] text-red-400">{errors.documentFormat}</span>}
          </label>

          {!isNew && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">Status</span>
              <div>
                <LibraryStatusBadge status={template?.status} />
              </div>
            </label>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
        <h2 className="text-sm font-semibold text-neutral-100">Template Body</h2>
        <p className="mt-1 text-xs text-neutral-500">Rich text editor with merge field support</p>

        {!readOnly && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                aria-label="Insert Merge Field"
                value=""
                onChange={(e) => {
                  if (e.target.value) insertMergeField(e.target.value);
                }}
                className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-emerald-500"
              >
                <option value="">+ Insert Merge Field</option>
                {MERGE_FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
            <span className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-neutral-400">
              Only predefined merge fields are live
            </span>
          </div>
        )}

        <textarea
          ref={bodyRef}
          disabled={readOnly}
          rows={8}
          placeholder='This Service Agreement ("Agreement") is entered into between {Counterparty Name} and our organization, effective as of {Start Date}.'
          value={values.templateBody}
          onChange={(e) => update({ templateBody: e.target.value })}
          className={`mt-3 w-full ${fieldClass(errors.templateBody)}`}
        />
        <span className="mt-1 block text-[11px] text-neutral-500">Rich text editor supporting merge field insertion</span>
        {errors.templateBody && <span className="text-[11px] text-red-400">{errors.templateBody}</span>}

        {!readOnly && (
          <div className="mt-3 flex flex-wrap gap-2">
            {MERGE_FIELDS.map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => insertMergeField(field)}
                className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
              >
                {field}
              </button>
            ))}
          </div>
        )}
      </section>

      {!isNew && canManage && (
        <section className="flex items-center justify-end gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <button
            type="button"
            onClick={() => onVersionHistory(template.id)}
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Version History
          </button>
          {canDeactivate && template?.status === 'Active' && (
            <button
              type="button"
              onClick={() => onDeactivate(template.id)}
              className="rounded-md border border-red-500/60 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
            >
              Deactivate
            </button>
          )}
          {canDeactivate && template?.status === 'Inactive' && (
            <button
              type="button"
              onClick={() => onReactivate(template.id)}
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
