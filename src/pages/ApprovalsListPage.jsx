import { Link } from 'react-router-dom';
import ApprovalsListTable from '@/features/approvals/components/ApprovalsListTable';
import { useApprovalsList } from '@/features/approvals/hooks/useApprovalsList';

const EMPTY_MESSAGE = 'No contracts are currently awaiting your approval.';
const HIGH_RISK_THRESHOLD = 70;

// ApprovalListItemResponse carries no date fields, so "awaiting > 3 days" and
// "completed this month" (shown as stat cards in the design) cannot be
// computed from this list alone — see blockers in the task output.
function summarize(items) {
  const pending = items.filter((item) => item.status === 'PendingApproval');
  const highRisk = items.filter((item) => (item.aiRiskScore ?? 0) >= HIGH_RISK_THRESHOLD);
  const completed = items.filter((item) => item.status === 'Approved');
  return {
    pendingYourAction: pending.length,
    highRisk: highRisk.length,
    completedThisMonth: completed.length,
  };
}

export default function ApprovalsListPage() {
  const { data, isLoading, error, refetch } = useApprovalsList();
  const items = data?.items ?? [];
  const pendingItems = items.filter((item) => item.status === 'PendingApproval');
  const stats = summarize(items);
  const isEmpty = !isLoading && !error && (data?.isEmpty ?? items.length === 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <span>CLM Hub</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-300">Approvals</span>
        </nav>
        <div className="mt-2">
          <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
          <p className="mt-1 text-sm text-neutral-500">Contracts awaiting your decision as an assigned Approver</p>
        </div>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        {error && (
          <div role="alert" className="flex items-center justify-between rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>{error.message || 'Failed to load approvals.'}</span>
            <button
              type="button"
              onClick={refetch}
              className="rounded-md border border-red-500/60 px-3 py-1 text-xs font-medium hover:bg-red-500/10"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading && !data && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-900/60" />
            ))}
          </div>
        )}

        {!error && data && (
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <div>
              <p className="text-2xl font-semibold text-neutral-100">{stats.pendingYourAction}</p>
              <p className="mt-1 text-xs text-neutral-500">Pending your action</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-amber-400">{stats.highRisk}</p>
              <p className="mt-1 text-xs text-neutral-500">High at risk</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-100">{data.totalCount}</p>
              <p className="mt-1 text-xs text-neutral-500">Total approvals</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-emerald-400">{stats.completedThisMonth}</p>
              <p className="mt-1 text-xs text-neutral-500">Completed this month</p>
            </div>
          </div>
        )}

        {!error && data && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">Pending Your Approval</h2>
                <p className="mt-0.5 text-xs text-neutral-500">Select a contract to open the Approval Review screen</p>
              </div>
              {!isEmpty && (
                <Link to="/approvals" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
                  View all
                </Link>
              )}
            </div>

            {isEmpty ? (
              <p className="px-5 py-12 text-center text-sm text-neutral-500">{data.emptyMessage || EMPTY_MESSAGE}</p>
            ) : (
              <ApprovalsListTable items={pendingItems.length > 0 ? pendingItems : items} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
