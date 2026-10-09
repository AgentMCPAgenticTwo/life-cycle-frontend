// Contract Type, Industry and Template enums come straight from the
// CreateContractRequest/ContractResponse DTOs (context.json) — not invented.
const CONTRACT_TYPES = [
  'NDA',
  'MSA',
  'SOW',
  'Sales Agreement',
  'Purchase Agreement',
  'Service Agreement',
  'Vendor Agreement',
  'Licensing',
  'Amendment',
  'Renewal',
];
const INDUSTRIES = ['Product', 'Service'];

function fieldClass(hasError) {
  return `rounded-md border px-3 py-2 text-sm bg-neutral-900 text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed ${
    hasError ? 'border-red-500' : 'border-neutral-700'
  } focus:border-emerald-500 focus:outline-none`;
}

/**
 * Contract Type, Industry and Template dropdown. The Template list is
 * filtered to Active templates matching the selected Contract Type/Industry
 * (UC2-BR-001) and is disabled whenever third party paper has been uploaded,
 * or when no active template matches the combination (UC2-BR-002 / UC2-BR-008).
 */
export default function ContractTypeIndustryTemplateSelector({
  contractType,
  industry,
  templateId,
  templates,
  isLoadingTemplates,
  templateDisabled,
  noActiveTemplatesMessage,
  errors = {},
  onChange,
}) {
  const templateOptions = templates?.items ?? [];
  const templateSelectDisabled = templateDisabled || isLoadingTemplates || templateOptions.length === 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-400">Contract Type *</span>
        <select
          value={contractType || ''}
          onChange={(e) => onChange({ contractType: e.target.value, templateId: null })}
          className={fieldClass(errors.contractType)}
        >
          <option value="">Select contract type</option>
          {CONTRACT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-neutral-500">
          NDA, MSA, SOW, Sales Agreement, Purchase Agreement, Service Agreement, Vendor Agreement, Licensing,
          Amendment, Renewal
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-400">Industry *</span>
        <select
          value={industry || ''}
          onChange={(e) => onChange({ industry: e.target.value, templateId: null })}
          className={fieldClass(errors.industry)}
        >
          <option value="">Select industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-neutral-500">Product, Service</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral-400">Template</span>
        <select
          value={templateId || ''}
          disabled={templateSelectDisabled}
          onChange={(e) => onChange({ templateId: e.target.value || null })}
          className={fieldClass(errors.templateId)}
        >
          <option value="">{isLoadingTemplates ? 'Loading templates…' : 'Select template'}</option>
          {templateOptions.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.templateName}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-neutral-500">
          {noActiveTemplatesMessage ||
            'Shows active templates matching Contract Type and Industry; not required if third party paper is uploaded.'}
        </span>
      </label>
    </div>
  );
}
