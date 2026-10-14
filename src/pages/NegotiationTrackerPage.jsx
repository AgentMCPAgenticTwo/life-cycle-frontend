import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import RoutingPanel from '@/features/negotiation/components/RoutingPanel';
import ReviewerList from '@/features/negotiation/components/ReviewerList';
import CommentBoxPanel from '@/features/negotiation/components/CommentBoxPanel';
import RedlineSubmitPanel from '@/features/negotiation/components/RedlineSubmitPanel';
import MarkAgreedButton from '@/features/negotiation/components/MarkAgreedButton';
import SendReminderButton from '@/features/negotiation/components/SendReminderButton';
import CompareVersionsModal from '@/features/negotiation/components/CompareVersionsModal';
import RiskRecheckPanel from '@/features/negotiation/components/RiskRecheckPanel';
import { useNegotiationTracker } from '@/features/negotiation/hooks/useNegotiationTracker';
import { useSubmitRouting } from '@/features/negotiation/hooks/useSubmitRouting';

const ROUTING_ALLOWED_ROLES = ['CONTRACT_OWNER'];
const VIEW_ALLOWED_ROLES = ['CONTRACT_OWNER', 'LEGAL_REVIEWER', 'APPROVER', 'TENANT_ADMIN'];

const STATUS_LABELS = {
  'With Internal': 'With Internal Reviewers',
  // UC5: once the last (sequential) or every (parallel) internal reviewer submits, the backend
  // emails the counterparty a secure link and OTP and flips the status — the tracker reflects it here.
  'With Counterparty': 'Sent to counterparty',
  Agreed: 'Agreed',
  // An approver sent the contract back: it is In Negotiation again and can be re-submitted
  // for review or marked Agreed once more.
  'Sent Back': 'Sent back from approval',
};

export default function NegotiationTrackerPage() {
  const { contractId } = useParams();
  const { role } = useAuth();
  const canView = VIEW_ALLOWED_ROLES.includes(role);
  const canRoute = ROUTING_ALLOWED_ROLES.includes(role);
  const isLegalReviewer = role === 'LEGAL_REVIEWER';

  const { data, isLoading, error, refetch, notRouted } = useNegotiationTracker(contractId);
  const routingMutation = useSubmitRouting(contractId);

  const [showCompare, setShowCompare] = useState(false);
  const [showRoutingPanel, setShowRoutingPanel] = useState(false);

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
        <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-red-300">Access denied</h1>
          <p className="mt-2 text-sm text-red-200">You do not have permission to view this negotiation.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading negotiation tracker…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
        <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-red-300">Unable to load negotiation tracker</h1>
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

  if (notRouted || !data || showRoutingPanel) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="px-8 py-6">
          <nav className="text-xs text-neutral-500">
            <Link to="/" className="hover:text-neutral-300">
              Home Page
            </Link>
            <span className="mx-1.5">/</span>
            <Link to="/contracts" className="hover:text-neutral-300">
              Contracts
            </Link>
            <span className="mx-1.5">/</span>
            <span>Contract Detail</span>
            <span className="mx-1.5">/</span>
            <span className="text-neutral-300">Send for Review</span>
          </nav>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Send for Review</h1>
        </header>
        <main className="mx-auto max-w-3xl px-8 pb-10">
          <RoutingPanel
            canAccess={canRoute}
            isLoading={routingMutation.isLoading}
            onCancel={data ? () => setShowRoutingPanel(false) : undefined}
            onSubmit={async (payload) => {
              await routingMutation.mutate(payload);
              setShowRoutingPanel(false);
              refetch();
            }}
          />
        </main>
      </div>
    );
  }

  const dueDatePassed = data.dueDate && new Date(data.dueDate).getTime() < Date.now();

  // UC5: reminders stop once every reviewer has submitted or the contract is marked Agreed.
  const remindersStopped =
    data.negotiationStatus === 'Agreed' ||
    (Boolean(data.internalReviewers?.length) &&
      data.internalReviewers.every((reviewer) => reviewer.reviewStatus === 'Submitted'));

  // UC5: the latest version coming from the counterparty triggers a risk re-check
  // of the clauses they changed.
  const latestVersion = [...(data.versions || [])].sort((a, b) => b.versionNumber - a.versionNumber)[0];
  const latestIsExternal = latestVersion?.source === 'External';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex flex-wrap items-start justify-between gap-4 px-8 py-6">
        <div>
          <nav className="text-xs text-neutral-500">
            <Link to="/" className="hover:text-neutral-300">
              Home Page
            </Link>
            <span className="mx-1.5">/</span>
            <Link to="/contracts" className="hover:text-neutral-300">
              Contracts
            </Link>
            <span className="mx-1.5">/</span>
            <span>Contract Detail</span>
            <span className="mx-1.5">/</span>
            <span className="text-neutral-300">Negotiation Tracker</span>
          </nav>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Negotiation Tracker</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowCompare(true)}
            disabled={!data.versions?.length}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ⇄ Compare Versions
          </button>
          {data.negotiationStatus !== 'Agreed' && canRoute && (
            <button
              type="button"
              onClick={() => setShowRoutingPanel(true)}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
            >
              → Send for Review
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-col gap-6 px-8 pb-10">
        <div className="rounded-xl bg-gradient-to-br from-sky-800 to-neutral-950 p-6">
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
            {data.negotiationStatus}
          </span>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {STATUS_LABELS[data.negotiationStatus] || data.negotiationStatus}
          </h2>
          <p className="mt-1 text-sm text-sky-100">
            Current Version: v{data.versionNumber} · auto-incremented on each redline submission
          </p>
          {data.negotiationStatus === 'With Counterparty' && (
            <p className="mt-1 text-xs text-sky-200">
              A secure link and one-time passcode were emailed to {data.externalPartyName} (
              {data.externalPartyEmail}). The passcode is never displayed here.
            </p>
          )}
          {data.negotiationStatus === 'Agreed' && (
            <p role="status" className="mt-2 text-sm text-emerald-200">
              Negotiation agreed — the contract is now Pending Approval and the first approver has been notified.{' '}
              <Link to="/approvals" className="font-semibold text-emerald-300 underline hover:text-emerald-200">
                View Approvals
              </Link>
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              Due {new Date(data.dueDate).toLocaleDateString()}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              {data.internalReviewers?.length || 0} reviewers engaged
            </span>
            {data.overdueFlag && (
              <span className="rounded-full bg-red-500/30 px-3 py-1 text-xs font-medium text-white">Overdue</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-100">Redline & Version History</h2>
              <button
                type="button"
                onClick={() => setShowCompare(true)}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                View all
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Every submission increments the contract version</p>

            <ul className="mt-4 flex flex-col gap-2">
              {[...(data.versions || [])]
                .sort((a, b) => b.versionNumber - a.versionNumber)
                .map((version) => (
                  <li
                    key={version.versionNumber}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-100">
                        v{version.versionNumber} — {version.source} submission
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {version.createdBy} · {new Date(version.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-neutral-700/40 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                      v{version.versionNumber}
                      {version.versionNumber === data.versionNumber ? ' · Current' : ''}
                    </span>
                  </li>
                ))}
              {!data.versions?.length && <p className="text-sm text-neutral-500">No versions yet.</p>}
            </ul>

            <h3 className="mt-6 text-sm font-semibold text-neutral-100">Internal Reviewers</h3>
            <div className="mt-3">
              <ReviewerList reviewers={data.internalReviewers} dueDate={data.dueDate} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {latestIsExternal && (
              <RiskRecheckPanel contractId={contractId} externalVersion={latestVersion.versionNumber} />
            )}

            {data.negotiationStatus !== 'Agreed' && (isLegalReviewer || canRoute) && (
              <RedlineSubmitPanel
                contractId={contractId}
                currentVersion={data.versionNumber}
                onSubmitted={refetch}
              />
            )}

            <CommentBoxPanel contractId={contractId} />

            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <h2 className="text-sm font-semibold text-neutral-100">Reviewer Actions</h2>
              <p className="mt-2 text-xs text-neutral-400">Due Date</p>
              <p className="text-sm text-neutral-200">{new Date(data.dueDate).toLocaleDateString()}</p>

              <div className="mt-4">
                <SendReminderButton
                  contractId={contractId}
                  dueDate={data.dueDate}
                  stopped={remindersStopped}
                />
              </div>

              <div className="mt-3">
                <MarkAgreedButton
                  contractId={contractId}
                  visible={isLegalReviewer && data.negotiationStatus !== 'Agreed'}
                  onAgreed={refetch}
                />
              </div>
              {!dueDatePassed && !remindersStopped && (
                <p className="mt-2 text-[11px] text-neutral-600">Reminder enabled only once overdue.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {showCompare && (
        <CompareVersionsModal
          contractId={contractId}
          versions={data.versions}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
