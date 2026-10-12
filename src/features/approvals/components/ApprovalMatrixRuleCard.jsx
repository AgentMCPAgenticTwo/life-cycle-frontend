// One tenant-configured approval matrix rule: the Contract Type / Contract
// Value / AI Risk Score band that routes a contract, and the ordered
// Approver steps that then apply to it (UC6-BR-002, UC6-BR-016).

const APPROVER_ROLES = ['APPROVER', 'LEGAL_REVIEWER', 'CONTRACT_OWNER', 'TENANT_ADMIN'];

function numberOrUndefined(value) {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default function ApprovalMatrixRuleCard({ rule, index, onChange, onRemove }) {
  function updateField(field, value) {
    onChange(index, { ...rule, [field]: value });
  }

  function updateStep(stepIndex, patch) {
    const steps = rule.steps.map((step, i) => (i === stepIndex ? { ...step, ...patch } : step));
    onChange(index, { ...rule, steps });
  }

  function addStep() {
    const nextStepNumber = rule.steps.length + 1;
    onChange(index, {
      ...rule,
      steps: [...rule.steps, { stepNumber: nextStepNumber, approverRole: APPROVER_ROLES[0], stepName: '' }],
    });
  }

  function removeStep(stepIndex) {
    const steps = rule.steps
      .filter((_, i) => i !== stepIndex)
      .map((step, i) => ({ ...step, stepNumber: i + 1 }));
    onChange(index, { ...rule, steps });
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-5">
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Contract Type
            <input
              type="text"
              value={rule.contractType}
              onChange={(e) => updateField('contractType', e.target.value)}
              placeholder="e.g. MSA"
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Value Min ($)
            <input
              type="number"
              value={rule.valueMin ?? ''}
              onChange={(e) => updateField('valueMin', numberOrUndefined(e.target.value))}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Value Max ($)
            <input
              type="number"
              value={rule.valueMax ?? ''}
              onChange={(e) => updateField('valueMax', numberOrUndefined(e.target.value))}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Risk Band Min
            <input
              type="number"
              value={rule.riskBandMin ?? ''}
              onChange={(e) => updateField('riskBandMin', numberOrUndefined(e.target.value))}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Risk Band Max
            <input
              type="number"
              value={rule.riskBandMax ?? ''}
              onChange={(e) => updateField('riskBandMax', numberOrUndefined(e.target.value))}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="shrink-0 rounded-md border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-red-500 hover:text-red-300"
        >
          Remove Rule
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Approval Steps</h3>
          <button
            type="button"
            onClick={addStep}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-emerald-500 hover:text-emerald-400"
          >
            + Add Step
          </button>
        </div>

        {rule.steps.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No approval steps configured for this rule yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {rule.steps.map((step, stepIndex) => (
              <div
                key={stepIndex}
                className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2"
              >
                <span className="text-xs font-semibold text-emerald-400">Step {step.stepNumber}</span>
                <select
                  value={step.approverRole || ''}
                  onChange={(e) => updateStep(stepIndex, { approverRole: e.target.value })}
                  className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
                >
                  {APPROVER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={step.stepName}
                  onChange={(e) => updateStep(stepIndex, { stepName: e.target.value })}
                  placeholder="e.g. Finance Review"
                  className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeStep(stepIndex)}
                  className="text-xs font-medium text-neutral-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
