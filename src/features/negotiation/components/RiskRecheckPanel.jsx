import { useMemo, useState } from 'react';
import { useClauseAnalysis } from '@/features/clause-analysis/hooks/useClauseAnalysis';
import { useRetryExtraction } from '@/features/clause-analysis/hooks/useRetryExtraction';
import { useCompareVersions } from '@/features/negotiation/hooks/useCompareVersions';

const RISK_STYLES = {
  High: 'bg-red-500/15 text-red-300',
  Medium: 'bg-amber-500/15 text-amber-300',
  Low: 'bg-emerald-500/15 text-emerald-300',
};

function riskBadgeClass(riskScore) {
  return RISK_STYLES[riskScore] || 'bg-neutral-700/40 text-neutral-300';
}

/**
 * RiskRecheckPanel — UC5 re-check of risk after external changes. Once the
 * counterparty submits a redlined version, only the clauses they changed are
 * re-scored and the overall contract risk score is refreshed; clauses they did
 * not touch keep their previous score. When the AI re-analysis fails the
 * submitted version is still saved and the reviewer can retry.
 */
export default function RiskRecheckPanel({ contractId, externalVersion }) {
  const compareFrom = externalVersion > 1 ? externalVersion - 1 : null;
  const {
    data: comparison,
    isLoading: isComparing,
    error: compareError,
  } = useCompareVersions(contractId, compareFrom, externalVersion, Boolean(contractId && compareFrom));
  const { data: analysis, isLoading: isAnalysing, error: analysisError, setData } = useClauseAnalysis(contractId);
  const retryMutation = useRetryExtraction(contractId);
  const [retryError, setRetryError] = useState(null);

  const changedClauseIds = useMemo(() => {
    const ids = (comparison?.differences || [])
      .filter((diff) => diff.changeType && diff.changeType !== 'Unchanged')
      .map((diff) => diff.clauseId)
      .filter(Boolean);
    return new Set(ids);
  }, [comparison]);

  const clauses = analysis?.clauses || [];
  const rescoredClauses = clauses.filter((clause) => changedClauseIds.has(clause.clauseId));
  const analysisFailed = analysis?.analysisStatus === 'Failed';

  async function handleRetry() {
    setRetryError(null);
    try {
      setData(await retryMutation.retry());
    } catch (err) {
      setRetryError(err.message || 'Re-analysis failed. Please try again.');
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-100">Risk Re-check — v{externalVersion}</h2>
        {!analysisFailed && analysis?.overallContractRiskScore && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(analysis.overallContractRiskScore)}`}>
            Overall Risk: {analysis.overallContractRiskScore}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Clauses changed by the counterparty are re-analysed; untouched clauses keep their previous risk score.
      </p>

      {(isComparing || isAnalysing) && <p className="mt-4 text-sm text-neutral-500">Re-checking risk…</p>}

      {analysisFailed && (
        <div role="alert" className="mt-4 rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <p className="font-medium">AI re-analysis failed</p>
          <p className="mt-1 text-xs text-amber-200/80">
            Version {externalVersion} has still been saved and previous risk scores are unchanged. You can retry the
            re-analysis.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={retryMutation.isLoading}
            className="mt-3 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {retryMutation.isLoading ? 'Retrying…' : 'Retry Risk Analysis'}
          </button>
          {retryError && <p className="mt-2 text-xs text-red-300">{retryError}</p>}
        </div>
      )}

      {!analysisFailed && !isComparing && !isAnalysing && (
        <>
          {rescoredClauses.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {rescoredClauses.map((clause) => (
                <li
                  key={clause.clauseId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-100">
                      {clause.clauseCategory || clause.clauseId}
                    </p>
                    {clause.aiExplanation && (
                      <p className="mt-0.5 truncate text-xs text-neutral-500">{clause.aiExplanation}</p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${riskBadgeClass(clause.riskScore)}`}>
                    {clause.riskScore}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">
              No clause changes were detected in this version, so no clause was re-scored.
            </p>
          )}
        </>
      )}

      {(compareError || analysisError) && !analysisFailed && (
        <p role="alert" className="mt-3 text-xs text-red-300">
          {(compareError || analysisError).message}
        </p>
      )}
    </div>
  );
}
