import { useEffect, useState } from 'react';

function FieldLabel({ label }) {
  const isConfirmed = label === 'User-confirmed';
  return (
    <span
      className={`text-[11px] font-medium ${isConfirmed ? 'text-emerald-400' : 'text-neutral-500'}`}
    >
      {label === 'User-confirmed' ? 'User-confirmed' : 'AI-suggested'}
    </span>
  );
}

// Editable AI-extracted contract metadata fields with AI-suggested/User-confirmed
// labelling (UC4-BR-007 / UC4-FV-003).
export default function ContractMetadataPanel({ metadata, canEdit, isSaving, onSave }) {
  const [form, setForm] = useState({
    parties: metadata?.parties || '',
    contractValue: metadata?.contractValue ?? '',
    startDate: metadata?.startDate || '',
    endDate: metadata?.endDate || '',
    renewalTerms: metadata?.renewalTerms || '',
    paymentTerms: metadata?.paymentTerms || '',
    keyObligations: metadata?.keyObligations || '',
  });

  useEffect(() => {
    setForm({
      parties: metadata?.parties || '',
      contractValue: metadata?.contractValue ?? '',
      startDate: metadata?.startDate || '',
      endDate: metadata?.endDate || '',
      renewalTerms: metadata?.renewalTerms || '',
      paymentTerms: metadata?.paymentTerms || '',
      keyObligations: metadata?.keyObligations || '',
    });
  }, [metadata]);

  if (!metadata) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function save() {
    // CLAUDE.md: send every field the request DTO lists, not just the edited one.
    onSave({
      parties: form.parties,
      contractValue: form.contractValue === '' ? undefined : Number(form.contractValue),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      renewalTerms: form.renewalTerms,
      paymentTerms: form.paymentTerms,
      keyObligations: form.keyObligations,
    });
  }

  const inputClass =
    'w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none disabled:opacity-60';

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="text-base font-semibold text-neutral-100">Contract Metadata</h2>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-400">Parties</label>
            <FieldLabel label={metadata.partiesLabel} />
          </div>
          <textarea
            className={inputClass}
            rows={2}
            disabled={!canEdit || isSaving}
            value={form.parties}
            onChange={(e) => update('parties', e.target.value)}
            onBlur={() => save('parties')}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-400">Contract Value</label>
            <FieldLabel label={metadata.contractValueLabel} />
          </div>
          <input
            type="number"
            className={inputClass}
            disabled={!canEdit || isSaving}
            value={form.contractValue}
            onChange={(e) => update('contractValue', e.target.value)}
            onBlur={() => save('contractValue')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-400">Start Date</label>
              <FieldLabel label={metadata.startDateLabel} />
            </div>
            <input
              type="date"
              className={inputClass}
              disabled={!canEdit || isSaving}
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              onBlur={() => save('startDate')}
            />
            <p className="mt-1 text-[10px] text-neutral-600">DD/MM/YYYY</p>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-400">End Date</label>
              <FieldLabel label={metadata.endDateLabel} />
            </div>
            <input
              type="date"
              className={inputClass}
              disabled={!canEdit || isSaving}
              value={form.endDate}
              onChange={(e) => update('endDate', e.target.value)}
              onBlur={() => save('endDate')}
            />
            <p className="mt-1 text-[10px] text-neutral-600">DD/MM/YYYY</p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-400">Renewal Terms</label>
            <FieldLabel label={metadata.renewalTermsLabel} />
          </div>
          <textarea
            className={inputClass}
            rows={2}
            disabled={!canEdit || isSaving}
            value={form.renewalTerms}
            onChange={(e) => update('renewalTerms', e.target.value)}
            onBlur={() => save('renewalTerms')}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-400">Payment Terms</label>
            <FieldLabel label={metadata.paymentTermsLabel} />
          </div>
          <textarea
            className={inputClass}
            rows={2}
            disabled={!canEdit || isSaving}
            value={form.paymentTerms}
            onChange={(e) => update('paymentTerms', e.target.value)}
            onBlur={() => save('paymentTerms')}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-400">Key Obligations</label>
            <FieldLabel label={metadata.keyObligationsLabel} />
          </div>
          <textarea
            className={inputClass}
            rows={2}
            disabled={!canEdit || isSaving}
            value={form.keyObligations}
            onChange={(e) => update('keyObligations', e.target.value)}
            onBlur={() => save('keyObligations')}
          />
        </div>
      </div>
    </div>
  );
}
