import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ApprovalDetailsCard from '@/features/approvals/components/ApprovalDetailsCard';
import ApprovalActionsPanel from '@/features/approvals/components/ApprovalActionsPanel';
import DelegateModal from '@/features/approvals/components/DelegateModal';
import ApprovalHistoryTab from '@/features/approvals/components/ApprovalHistoryTab';
import { useApprovalDetail } from '@/features/approvals/hooks/useApprovalDetail';
import { useSubmitApprovalAction } from '@/features/approvals/hooks/useSubmitApprovalAction';
import { useDelegateApproval } from '@/features/approvals/hooks/useDelegateApproval';
import { useAuth } from '@/shared/hooks/useAuth';

// GET /api/v1/approvals/{approvalId} is readable by exactly these four
// roles (see module contract); Signer and any External Party are excluded
// outright (UC6-BR-019).
const ALLOWED_ROLES = ['APPROVER', 'TENANT_ADMIN', 'CONTRACT_OWNER', 'LEGAL_REVIEWER'];
const ACCESS_DENIED_MESSAGE = 'You do not have permission to approve this contract.';
const STALE_STATE_MESSAGE = "This contract's approval status has changed. Please refresh to see the latest status.";

export default function ApprovalReviewPage() {
  const { approvalId } = useParams();
  const { role } = useAuth();
  const isAllowed = ALLOWED_ROLES.includes(role);

  const { data: approval, isLoading, error, refetch } = useApprovalDetail(isAllowed ? approvalId : null);
  const submitAction = useSubmitApprovalAction(approvalId);
  const delegateMutation = useDelegateApproval(approvalId);

  const [actionError, setActionError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateError, setDelegateError] = useState(null);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
        <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-red-300">Access denied</h1>
          <p className="mt-2 text-sm text-red-200">{ACCESS_DENIED_MESSAGE}</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  function handleSubmitAction(request) {
    setActionError(null);
    setActionNotice(null);
    submitAction
      .mutate(request)
      .then(() => {
        setActionNotice(`Action recorded: ${request.actionType}.`);
        refetch();
      })
      .catch((err) => {
        if (err.status === 409) {
          setActionError(STALE_STATE_MESSAGE);
          refetch();
        } else {
          setActionError(err.message || 'Failed to submit approval action');
        }
      });
  }

  function handleDelegateConfirm(request) {
    setDelegateError(null);
    delegateMutation
      .mutate(request)
      .then(() => {
        setShowDelegateModal(false);
        refetch();
      })
      .catch((err) => {
        if (err.status === 409) {
          setDelegateError(STALE_STATE_MESSAGE);
          refetch();
        } else {
          setDelegateError(err.message || 'Failed to assign delegate');
        }
      });
  }

  const canAct = role === 'APPROVER' && approval && (approval.isCurrentUserApprover || approval.isCurrentUserActiveDelegate);
  const canDelegate = canAct && approval?.canDelegate;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-800 px-8 py-6">
        <div>
          <nav className="text-xs text-neutral-500">
            <Link to="/" className="hover:text-neutral-300">
              Home Page
            </Link>
            <span className="mx-1.5">/</span>
            <span>CLM Hub</span>
            <span className="mx-1.5">/</span>
            <span>Approvals</span>
            <span className="mx-1.5">/</span>
            <span className="text-neutral-300">Approval Review</span>
          </nav>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Approval Review</h1>
          {approval && (
            <p className="mt-1 text-sm text-neutral-500">
              {approval.contractTitle} — {approval.counterpartyName}
            </p>
          )}
        </div>
        {canDelegate && (
          <button
            type="button"
            onClick={() => setShowDelegateModal(true)}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500"
          >
            → Delegate
          </button>
        )}
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        {isLoading && <p className="text-sm text-neutral-500">Loading approval details…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <p>{error.message || 'Failed to load approval details'}</p>
            <button type="button" onClick={refetch} className="mt-2 font-medium text-red-200 underline">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && !approval && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-12 text-center text-sm text-neutral-500">
            No approval found for this contract.
          </div>
        )}

        {!isLoading && !error && approval && (
          <>
            {actionNotice && (
              <div role="status" className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {actionNotice}
              </div>
            )}
            {actionError && (
              <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {actionError}
              </div>
            )}

            <ApprovalDetailsCard approval={approval} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {canAct ? (
                <ApprovalActionsPanel approval={approval} onSubmit={handleSubmitAction} />
              ) : (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                  <h3 className="text-sm font-semibold text-neutral-100">Decision</h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    {approval.comments
                      ? `Comments on record: "${approval.comments}"`
                      : 'You can view this approval but do not have rights to act on it.'}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <h3 className="text-sm font-semibold text-neutral-100">Current Approver</h3>
                <p className="mt-2 text-sm text-neutral-300">{approval.currentApproverName}</p>
                {approval.delegateToName && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Delegated to {approval.delegateToName}
                    {approval.delegationStartDate && approval.delegationEndDate
                      ? ` (${approval.delegationStartDate} – ${approval.delegationEndDate})`
                      : ''}
                  </p>
                )}
              </div>
            </div>

            <ApprovalHistoryTab approvalId={approvalId} />
          </>
        )}
      </main>

      {showDelegateModal && (
        <DelegateModal
          approvalId={approvalId}
          isSubmitting={delegateMutation.isLoading}
          error={delegateError}
          onConfirm={handleDelegateConfirm}
          onClose={() => {
            setShowDelegateModal(false);
            setDelegateError(null);
          }}
        />
      )}
    </div>
  );
}
