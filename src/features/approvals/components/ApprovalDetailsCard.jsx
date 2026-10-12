const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

// deviationsFromStandard arrives as a single AI-authored paragraph of
// numbered sentences (e.g. "1. ... 2. ..."); split it into a list for
// display and to drive the "Deviations Found" count on the stat strip.
// There is no separate count field in ApprovalResponse for this. Only split
// on a digit sequence that continues the running 1,2,3... list, so stray
// numbers inside a sentence (e.g. "Net 30.") aren't mistaken for markers.
function splitDeviations(text) {
  if (!text) return [];
  const markerPattern = /(\d+)\.\s/g;
  const boundaries = [];
  let expected = 1;
  let match;
  while ((match = markerPattern.exec(text))) {
    if (Number(match[1]) === expected) {
      boundaries.push(match.index);
      expected += 1;
    }
  }
  if (boundaries.length === 0) return [text.trim()].filter(Boolean);
  const parts = boundaries.map((start, i) => text.slice(start, boundaries[i + 1]).trim());
  return parts.filter(Boolean);
}

function riskGaugeColor(score) {
  if (score == null) return 'text-neutral-400';
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-emerald-400';
}

/**
 * Read-only presentation of a contract's approval-relevant fields:
 * Contract Title, Contract Type, Contract Value, Counterparty Name, Key
 * Terms Summary, Deviations from Standard, AI Risk Score (labelled "AI
 * Suggestion – for reference only") and Approval Matrix Step (UC6-BR-009,
 * UC6-BR-014, UC6-BR-017, UC6-BR-018, UC6-FV-001).
 */
export default function ApprovalDetailsCard({ approval }) {
  const deviations = splitDeviations(approval.deviationsFromStandard);
  const stepsApproved = Math.max(0, approval.approvalMatrixStepNumber - 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-gradient-to-br from-sky-800 via-sky-900 to-neutral-950 p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-sky-100">
              Approval Matrix Step: {approval.approvalMatrixStepLabel}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              AI Risk Score: {approval.aiRiskScore ?? '—'} / 100
            </h2>
            <p className="mt-1 text-sm text-sky-100">
              AI Suggestion – for reference only. Does not block or allow progression.
            </p>
          </div>
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-current text-2xl font-bold ${riskGaugeColor(
              approval.aiRiskScore
            )}`}
            role="img"
            aria-label={`AI Risk Score ${approval.aiRiskScore ?? 'unavailable'} out of 100`}
          >
            {approval.aiRiskScore ?? '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 py-4">
          <p className="text-lg font-semibold text-emerald-400">{CURRENCY_FORMATTER.format(approval.contractValue)}</p>
          <p className="text-xs text-neutral-500">Contract Value</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 py-4">
          <p className="text-lg font-semibold text-neutral-100">{approval.contractType}</p>
          <p className="text-xs text-neutral-500">Contract Type</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 py-4">
          <p className="text-lg font-semibold text-amber-400">{deviations.length}</p>
          <p className="text-xs text-neutral-500">Deviations Found</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 py-4">
          <p className="text-lg font-semibold text-emerald-400">
            {stepsApproved} of {approval.approvalMatrixTotalSteps}
          </p>
          <p className="text-xs text-neutral-500">Steps Approved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <h3 className="text-sm font-semibold text-neutral-100">Contract Details</h3>
          <dl className="mt-3 flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-xs text-neutral-500">Contract Title</dt>
              <dd className="text-neutral-200">{approval.contractTitle}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Contract Type</dt>
              <dd className="text-neutral-200">{approval.contractType}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Contract Value</dt>
              <dd className="text-neutral-200">{CURRENCY_FORMATTER.format(approval.contractValue)}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Counterparty Name</dt>
              <dd className="text-neutral-200">{approval.counterpartyName}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <h3 className="text-sm font-semibold text-neutral-100">Key Terms Summary</h3>
          <p className="mt-3 text-sm text-neutral-300">{approval.keyTermsSummary || 'No key terms summary available.'}</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-neutral-100">Deviations from Standard</h3>
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
            AI Suggestion – for reference only
          </span>
        </div>
        {deviations.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-neutral-300">
            {deviations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">No deviations from the standard template were found.</p>
        )}
      </div>
    </div>
  );
}
