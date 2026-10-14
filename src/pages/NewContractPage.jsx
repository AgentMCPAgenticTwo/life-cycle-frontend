import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ContractTypeIndustryTemplateSelector from '@/features/contracts/components/ContractTypeIndustryTemplateSelector';
import UploadThirdPartyPaperControl from '@/features/contracts/components/UploadThirdPartyPaperControl';
import CounterpartyPanel from '@/features/contracts/components/CounterpartyPanel';
import ContractDetailsForm from '@/features/contracts/components/ContractDetailsForm';
import { useTemplates } from '@/features/contracts/hooks/useTemplates';
import { useContractOwners } from '@/features/contracts/hooks/useContractOwners';
import { useCreateCounterparty } from '@/features/contracts/hooks/useCreateCounterparty';
import { useCreateContract } from '@/features/contracts/hooks/useCreateContract';
import { useContractDraftStore } from '@/store/contractDraftSlice';
import { useAuth } from '@/shared/hooks/useAuth';

const MANDATORY_FIELD_LABELS = {
  contractType: 'Contract Type',
  industry: 'Industry',
  counterpartySearch: 'Counterparty Search',
  counterpartyName: 'Counterparty Name',
  counterpartyEmail: 'Counterparty Email',
  counterpartyCompany: 'Counterparty Company',
  contractOwnerId: 'Contract Owner',
  contractValue: 'Contract Value',
  currency: 'Currency',
  startDate: 'Start Date',
  endDate: 'End Date',
  renewalType: 'Renewal Type',
  dueDate: 'Due Date',
};

const DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

function toIsoDate(ddmmyyyy) {
  if (!ddmmyyyy || !DATE_PATTERN.test(ddmmyyyy)) return null;
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

function toDisplayDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/**
 * NewContractPage — New Contract Creation screen (UC2-MF-001). Assembles
 * Contract Type/Industry/Template selection, third party paper upload,
 * Counterparty panel and Contract Details form behind a single Save that
 * validates every mandatory/conditional field before creating the contract
 * as Draft.
 */
export default function NewContractPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const formData = useContractDraftStore((s) => s.formData);
  const setField = useContractDraftStore((s) => s.setField);
  const reset = useContractDraftStore((s) => s.reset);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const assignedDate = useMemo(() => new Date(), []);
  const assignedDateIso = useMemo(() => toIsoDate(toDisplayDate(assignedDate)), [assignedDate]);

  const templateFilters = useMemo(
    () => ({ contractType: formData.contractType, industry: formData.industry, status: 'Active' }),
    [formData.contractType, formData.industry]
  );
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates(templateFilters);
  const { data: owners } = useContractOwners();
  const createCounterparty = useCreateCounterparty();
  const createContract = useCreateContract();

  // Contract Owner defaults to the logged-in user, reassignable from the
  // dropdown by any Contract Owner or Tenant Admin (UC2-BR-003 / UC2-BR-012).
  useEffect(() => {
    if (!formData.contractOwnerId) setField('contractOwnerId', userId);
  }, []);

  const noActiveTemplates =
    Boolean(formData.contractType) && Boolean(formData.industry) && !isLoadingTemplates && templates?.items?.length === 0;

  function updateField(partial) {
    Object.entries(partial).forEach(([key, value]) => setField(key, value));
  }

  function handleTemplateSelectorChange(selection) {
    updateField(selection);
  }

  function handleUploadSuccess(file) {
    setUploadedFile(file);
    setField('thirdPartyPaperFileId', file.fileId);
    setField('templateId', null);
  }

  function handleRemoveUpload() {
    setUploadedFile(null);
    setField('thirdPartyPaperFileId', null);
  }

  function handleCounterpartySelect(counterparty) {
    setField('counterpartyId', counterparty.id);
    setField('counterpartyName', counterparty.name);
    setField('counterpartyEmail', counterparty.email);
    setField('counterpartyCompany', counterparty.company);
    setField('counterpartyAddress', counterparty.address || '');
    setField('counterpartyGstTaxId', counterparty.gstTaxId || '');
  }

  function handleCounterpartyClear() {
    setField('counterpartyId', null);
    setField('counterpartyName', '');
    setField('counterpartyEmail', '');
    setField('counterpartyCompany', '');
    setField('counterpartyAddress', '');
    setField('counterpartyGstTaxId', '');
  }

  function validate() {
    const errors = {};

    Object.keys(MANDATORY_FIELD_LABELS).forEach((field) => {
      const value = formData[field];
      if (value === null || value === undefined || value === '') errors[field] = true;
    });

    if (!formData.templateId && !formData.thirdPartyPaperFileId) {
      errors.templateId = true;
      errors.thirdPartyPaperFileId = true;
    }

    if (formData.renewalType !== 'None' && !formData.noticePeriod) {
      errors.noticePeriod = true;
    }

    if (Object.keys(errors).length > 0) {
      return { errors, message: 'Please fill all mandatory fields' };
    }

    const startIso = toIsoDate(formData.startDate);
    const endIso = toIsoDate(formData.endDate);
    const dueIso = toIsoDate(formData.dueDate);

    if (!startIso || !endIso || !dueIso) {
      return { errors: { startDate: !startIso, endDate: !endIso, dueDate: !dueIso }, message: 'Dates must use DD/MM/YYYY format.' };
    }

    if (endIso <= startIso) {
      return { errors: { endDate: true }, message: 'End date cannot be earlier than start date' };
    }

    if (dueIso < assignedDateIso) {
      return { errors: { dueDate: true }, message: 'Due date cannot be earlier than assigned date' };
    }

    return { errors: {}, message: null };
  }

  async function handleSave() {
    setSuccessMessage(null);
    const { errors, message } = validate();
    setFieldErrors(errors);
    setFormError(message);
    if (message) return;

    let counterpartyId = formData.counterpartyId;
    if (!counterpartyId) {
      try {
        const created = await createCounterparty.mutate({
          name: formData.counterpartyName,
          email: formData.counterpartyEmail,
          company: formData.counterpartyCompany,
          address: formData.counterpartyAddress || undefined,
          gstTaxId: formData.counterpartyGstTaxId || undefined,
        });
        counterpartyId = created.id;
        setField('counterpartyId', created.id);
      } catch (err) {
        setFormError(err.message || 'Unable to save counterparty.');
        return;
      }
    }

    try {
      const response = await createContract.mutate({
        contractType: formData.contractType,
        industry: formData.industry,
        templateId: formData.templateId || undefined,
        thirdPartyPaperFileId: formData.thirdPartyPaperFileId || undefined,
        counterpartySearch: formData.counterpartySearch || undefined,
        counterpartyId,
        counterpartyName: formData.counterpartyName,
        counterpartyEmail: formData.counterpartyEmail,
        counterpartyCompany: formData.counterpartyCompany,
        counterpartyAddress: formData.counterpartyAddress || undefined,
        counterpartyGstTaxId: formData.counterpartyGstTaxId || undefined,
        contractOwnerId: formData.contractOwnerId,
        contractValue: Number(formData.contractValue),
        currency: formData.currency,
        startDate: toIsoDate(formData.startDate),
        endDate: toIsoDate(formData.endDate),
        renewalType: formData.renewalType,
        noticePeriod: formData.noticePeriod ? Number(formData.noticePeriod) : undefined,
        dueDate: toIsoDate(formData.dueDate),
      });
      setSuccessMessage('Contract created successfully and saved as Draft');
      reset();
      setUploadedFile(null);
      navigate(`/contracts/${response.id}`);
    } catch (err) {
      setFormError(err.message || 'Unable to create contract. Please try again.');
    }
  }

  function handleCancel() {
    reset();
    setUploadedFile(null);
    navigate('/');
  }

  const isSaving = createCounterparty.isLoading || createContract.isLoading;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/contracts" className="hover:text-neutral-300">
            Contracts
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">New Contract</span>
        </nav>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Contract Creation</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Choose a contract type, attach a template or third party paper, and capture key commercial terms.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500"
            >
              Cancel
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
        </div>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        {successMessage && (
          <div role="status" className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {formError && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {formError}
          </div>
        )}

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="text-sm font-semibold text-neutral-100">Contract Basics</h2>
          <p className="mt-1 text-xs text-neutral-500">Select the type of agreement and how it will be drafted</p>

          <div className="mt-4">
            <ContractTypeIndustryTemplateSelector
              contractType={formData.contractType}
              industry={formData.industry}
              templateId={formData.templateId}
              templates={templates}
              isLoadingTemplates={isLoadingTemplates}
              templateDisabled={Boolean(formData.thirdPartyPaperFileId)}
              noActiveTemplatesMessage={
                noActiveTemplates
                  ? 'No active templates available for this combination. Please upload third party paper.'
                  : null
              }
              errors={fieldErrors}
              onChange={handleTemplateSelectorChange}
            />
          </div>

          <div className="mt-4">
            <UploadThirdPartyPaperControl
              disabled={Boolean(formData.templateId)}
              uploadedFile={uploadedFile}
              onUploadSuccess={handleUploadSuccess}
              onRemove={handleRemoveUpload}
            />
          </div>
        </section>

        <CounterpartyPanel
          searchTerm={formData.counterpartySearch}
          onSearchTermChange={(value) => setField('counterpartySearch', value)}
          counterpartyId={formData.counterpartyId}
          name={formData.counterpartyName}
          email={formData.counterpartyEmail}
          company={formData.counterpartyCompany}
          address={formData.counterpartyAddress}
          gstTaxId={formData.counterpartyGstTaxId}
          onFieldChange={(field, value) => setField(field, value)}
          onSelect={handleCounterpartySelect}
          onClear={handleCounterpartyClear}
          errors={fieldErrors}
        />

        <ContractDetailsForm
          owners={owners}
          values={formData}
          assignedDateDisplay={toDisplayDate(assignedDate)}
          errors={fieldErrors}
          onChange={updateField}
        />

        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500"
          >
            Cancel
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
      </main>
    </div>
  );
}
