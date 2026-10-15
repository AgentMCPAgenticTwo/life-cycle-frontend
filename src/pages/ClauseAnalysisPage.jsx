import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import ClauseListPanel from '@/features/clause-analysis/components/ClauseListPanel';
import ClauseDetailDrawer from '@/features/clause-analysis/components/ClauseDetailDrawer';
import OverallRiskScoreLabel from '@/features/clause-analysis/components/OverallRiskScoreLabel';
import ContractMetadataPanel from '@/features/clause-analysis/components/ContractMetadataPanel';
import AskAIBox from '@/features/clause-analysis/components/AskAIBox';
import UnsupportedFileBlocker from '@/features/clause-analysis/components/UnsupportedFileBlocker';
import AIExtractionFailureBanner from '@/features/clause-analysis/components/AIExtractionFailureBanner';
import AccessDeniedBanner from '@/features/clause-analysis/components/AccessDeniedBanner';
import ConcurrentEditConflictModal from '@/features/clause-analysis/components/ConcurrentEditConflictModal';
import ProceedToNegotiationButton from '@/features/clause-analysis/components/ProceedToNegotiationButton';
import AuditLogViewer from '@/features/clause-analysis/components/AuditLogViewer';
import { useClauseAnalysis } from '@/features/clause-analysis/hooks/useClauseAnalysis';
import { useAcceptSuggestion } from '@/features/clause-analysis/hooks/useAcceptSuggestion';
import { useEditClause } from '@/features/clause-analysis/hooks/useEditClause';
import { useRejectClause } from '@/features/clause-analysis/hooks/useRejectClause';
import { useUpdateMetadata } from '@/features/clause-analysis/hooks/useUpdateMetadata';
import { useProceedToNegotiation } from '@/features/clause-analysis/hooks/useProceedToNegotiation';
import { useRetryExtraction } from '@/features/clause-analysis/hooks/useRetryExtraction';

const VIEW_ROLES = ['LEGAL_REVIEWER', 'CONTRACT_OWNER', 'TENANT_ADMIN'];

export default function ClauseAnalysisPage() {
  const { contractId } = useParams();
  const { role } = useAuth();
  const isAllowed = VIEW_ROLES.includes(role);
  const isLegalReviewer = role === 'LEGAL_REVIEWER';
  const isContractOwner = role === 'CONTRACT_OWNER';
  const isTenantAdmin = role === 'TENANT_ADMIN';
  const canAccept = isLegalReviewer || isContractOwner;
  const canEditClauseText = isLegalReviewer;
  const canReject = isLegalReviewer;
  const canEditMetadata = (isLegalReviewer || isContractOwner) && !isTenantAdmin;
  const canAskAI = isLegalReviewer || isContractOwner;

  const [selectedClauseId, setSelectedClauseId] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [proceedError, setProceedError] = useState(null);
  const [proceedResult, setProceedResult] = useState(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const negotiationPath = `/contracts/${contractId}/negotiation`;

  const { data, isLoading, error, refetch, setData } = useClauseAnalysis(contractId);
  const acceptSuggestionMutation = useAcceptSuggestion(contractId);
  const editClauseMutation = useEditClause(contractId);
  const rejectClauseMutation = useRejectClause(contractId);
  const updateMetadataMutation = useUpdateMetadata(contractId);
  const proceedMutation = useProceedToNegotiation(contractId);
  const retryMutation = useRetryExtraction(contractId);

  if (!isAllowed) {
    return <AccessDeniedBanner />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading clause analysis…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
        <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-red-300">Unable to load clause analysis</h1>
          <p className="mt-2 text-sm text-red-200">{error.message}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-4 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  function replaceClause(updated) {
    setData((prev) => ({
      ...prev,
      clauses: prev.clauses.map((c) => (c.clauseId === updated.clauseId ? updated : c)),
    }));
  }

  async function handleAccept(clauseId) {
    setActionError(null);
    try {
      const updated = await acceptSuggestionMutation.mutate(clauseId);
      replaceClause(updated);
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleSaveEdit(payload) {
    setActionError(null);
    try {
      const updated = await editClauseMutation.mutate(payload.clauseId, {
        clauseText: payload.clauseText,
        expectedVersion: payload.expectedVersion,
      });
      replaceClause(updated);
    } catch (err) {
      if (err.status !== 409) setActionError(err.message);
    }
  }

  async function handleReject(clauseId) {
    setActionError(null);
    try {
      const updated = await rejectClauseMutation.mutate(clauseId, {});
      replaceClause(updated);
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleSaveMetadata(payload) {
    setActionError(null);
    try {
      const updated = await updateMetadataMutation.mutate(payload);
      setData((prev) => ({ ...prev, metadata: updated }));
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleProceed() {
    setProceedError(null);
    try {
      const result = await proceedMutation.mutate();
      setProceedResult(result);
    } catch (err) {
      setProceedError(err.message);
    }
  }

  async function handleRetry() {
    try {
      const refreshed = await retryMutation.retry();
      setData(refreshed);
      setManualMode(false);
    } catch {
      // Failure re-displays the same failure banner via analysisStatus.
    }
  }

  if (!data.fileFormatSupported) {
    return (
      <div className="min-h-screen bg-neutral-950 px-8 py-8 text-neutral-100">
        <UnsupportedFileBlocker />
      </div>
    );
  }

  const showExtractionFailure = data.analysisStatus === 'Failed' && !manualMode;

  const clauses = data.clauses || [];
  const mandatoryClauses = clauses.filter((c) => c.isMandatory);
  const matchedMandatory = mandatoryClauses.filter((c) => c.libraryMatchStatus !== 'Missing');
  const missingMandatory = mandatoryClauses.filter((c) => c.libraryMatchStatus === 'Missing');
  const selectedClause = clauses.find((c) => c.clauseId === selectedClauseId) || null;
  const selectedIndex = clauses.findIndex((c) => c.clauseId === selectedClauseId);

  const flagLabels = [];
  if (clauses.some((c) => c.libraryMatchStatus === 'Deviated')) {
    flagLabels.push('Liability clause deviates from standard wording');
  }
  if (missingMandatory.length > 0) {
    flagLabels.push('Mandatory clause missing');
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">CLM Hub</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">New Contract Creation</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Clause Analysis</span>
        </nav>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AI Clause Analysis</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAuditLog(true)}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500"
            >
              Audit Log
            </button>
            {!isTenantAdmin && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={retryMutation.isLoading}
                className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {retryMutation.isLoading ? 'Refreshing…' : 'Refresh Analysis'}
              </button>
            )}
            {!isTenantAdmin && !proceedResult && (
              <ProceedToNegotiationButton
                enabled={data.proceedToNegotiationEnabled}
                isLoading={proceedMutation.isLoading}
                onProceed={handleProceed}
              />
            )}
            {/* The proceed step is idempotent and leaves no stored flag, so a reviewer who
                already completed it and comes back to this screen would otherwise have no way
                through. Offer the link whenever nothing blocks negotiation. */}
            {!isTenantAdmin && (proceedResult || data.proceedToNegotiationEnabled) && (
              <Link
                to={negotiationPath}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
              >
                Go to Negotiation →
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        {actionError && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError}
          </div>
        )}
        {proceedError && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {proceedError}
          </div>
        )}
        {proceedResult && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            <span>
              Clause analysis complete. Status: {proceedResult.negotiationStatus}. Next, send the contract for
              review on the Negotiation screen.
            </span>
            <Link
              to={negotiationPath}
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-emerald-400"
            >
              Go to Negotiation →
            </Link>
          </div>
        )}

        {showExtractionFailure ? (
          <AIExtractionFailureBanner
            isRetrying={retryMutation.isLoading}
            onRetry={handleRetry}
            onContinueManually={() => setManualMode(true)}
          />
        ) : (
          <>
            <OverallRiskScoreLabel riskScore={data.overallContractRiskScore} flags={flagLabels} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-6">
                <ClauseListPanel clauses={clauses} selectedClauseId={selectedClauseId} onSelect={setSelectedClauseId} />

                {selectedClause && (
                  <ClauseDetailDrawer
                    clause={selectedClause}
                    index={selectedIndex}
                    total={clauses.length}
                    canEdit={canEditClauseText}
                    canAccept={canAccept}
                    canReject={canReject}
                    isAccepting={acceptSuggestionMutation.isLoading}
                    isSaving={editClauseMutation.isLoading}
                    isRejecting={rejectClauseMutation.isLoading}
                    onAccept={handleAccept}
                    onSave={handleSaveEdit}
                    onReject={handleReject}
                  />
                )}

                <AskAIBox contractId={contractId} disabled={!canAskAI || !data.askAiEnabled} />
              </div>

              <div className="flex flex-col gap-6">
                <ContractMetadataPanel
                  metadata={data.metadata}
                  canEdit={canEditMetadata}
                  isSaving={updateMetadataMutation.isLoading}
                  onSave={handleSaveMetadata}
                />

                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                  <h2 className="text-base font-semibold text-neutral-100">Mandatory Clause Check</h2>
                  {missingMandatory.length > 0 ? (
                    <div role="alert" className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">
                      {missingMandatory[0].clauseCategory || 'A mandatory clause'} clause is required by tenant policy and
                      was not found. Resolve before proceeding.
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-emerald-300">All mandatory clauses are matched.</p>
                  )}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: mandatoryClauses.length
                          ? `${(matchedMandatory.length / mandatoryClauses.length) * 100}%`
                          : '100%',
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {matchedMandatory.length} of {mandatoryClauses.length} mandatory clause categories matched
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {editClauseMutation.conflict && (
        <ConcurrentEditConflictModal
          onRefresh={() => {
            editClauseMutation.clearConflict();
            refetch();
          }}
        />
      )}

      {showAuditLog && <AuditLogViewer contractId={contractId} onClose={() => setShowAuditLog(false)} />}
    </div>
  );
}
