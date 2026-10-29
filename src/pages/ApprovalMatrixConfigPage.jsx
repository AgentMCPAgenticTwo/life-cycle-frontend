import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ApprovalMatrixRuleCard from '@/features/approvals/components/ApprovalMatrixRuleCard';
import { useApprovalMatrixConfig } from '@/features/approvals/hooks/useApprovalMatrixConfig';
import { useUpdateApprovalMatrixConfig } from '@/features/approvals/hooks/useUpdateApprovalMatrixConfig';
import { useAuth } from '@/shared/hooks/useAuth';

// GET/PUT /api/v1/approval-matrix-config are TENANT_ADMIN-only (see module
// contract); every other role is denied this screen outright.
const ALLOWED_ROLES = ['TENANT_ADMIN'];

function emptyRule() {
  return {
    id: uuidv4(),
    contractType: '',
    valueMin: undefined,
    valueMax: undefined,
    riskBandMin: undefined,
    riskBandMax: undefined,
    steps: [{ stepNumber: 1, approverRole: 'APPROVER', stepName: '' }],
  };
}

export default function ApprovalMatrixConfigPage() {
  const { role } = useAuth();
  const isAllowed = ALLOWED_ROLES.includes(role);

  const { data, isLoading, error, refetch } = useApprovalMatrixConfig();
  const updateConfig = useUpdateApprovalMatrixConfig();

  const [rules, setRules] = useState([]);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (data) setRules(data.items);
  }, [data]);

  function updateRule(index, nextRule) {
    setRules((prev) => prev.map((rule, i) => (i === index ? nextRule : rule)));
  }

  function removeRule(index) {
    setRules((prev) => prev.filter((_, i) => i !== index));
  }

  function addRule() {
    setRules((prev) => [...prev, emptyRule()]);
  }

  function handleSave() {
    setFormError(null);
    setSuccessMessage(null);

    if (rules.some((rule) => !rule.contractType.trim())) {
      setFormError('Contract Type is required for every rule.');
      return;
    }
    if (rules.some((rule) => rule.steps.some((step) => !step.stepName.trim()))) {
      setFormError('Step Name is required for every approval step.');
      return;
    }

    updateConfig
      .mutate({ items: rules })
      .then((response) => {
        setRules(response.items);
        setSuccessMessage('Approval matrix configuration saved successfully');
      })
      .catch((err) => setFormError(err.message || 'Failed to save approval matrix configuration'));
  }

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
        <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-red-300">Access denied</h1>
          <p className="mt-2 text-sm text-red-200">You do not have permission to access this screen.</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Settings / Admin</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Approval Matrix</span>
        </nav>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Approval Matrix</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Configure approval routing rules by Contract Type, Contract Value and AI Risk Score band
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={addRule}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500"
            >
              + Add Rule
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateConfig.isLoading || isLoading}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateConfig.isLoading ? 'Saving…' : 'Save Changes'}
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

        {isLoading && <p className="text-sm text-neutral-500">Loading approval matrix configuration…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <p>{error.message || 'Failed to load approval matrix configuration'}</p>
            <button type="button" onClick={refetch} className="mt-2 font-medium text-red-200 underline">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && rules.length === 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-12 text-center text-sm text-neutral-500">
            No approval matrix rules configured yet. Add a rule to define routing for contracts.
          </div>
        )}

        {!isLoading && !error && rules.length > 0 && (
          <div className="flex flex-col gap-4">
            {rules.map((rule, index) => (
              <ApprovalMatrixRuleCard key={rule.id} rule={rule} index={index} onChange={updateRule} onRemove={removeRule} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
