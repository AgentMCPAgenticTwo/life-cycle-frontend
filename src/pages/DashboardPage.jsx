import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusCardGroup from '@/features/dashboard/components/StatusCardGroup';
import MyTasksPanel from '@/features/dashboard/components/MyTasksPanel';
import HighRiskContractsPanel from '@/features/dashboard/components/HighRiskContractsPanel';
import DashboardFiltersBar from '@/features/dashboard/components/DashboardFiltersBar';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import { useMyTasks } from '@/features/dashboard/hooks/useMyTasks';
import { useHighRiskContracts } from '@/features/dashboard/hooks/useHighRiskContracts';
import { useDashboardFilterOptions } from '@/features/dashboard/hooks/useDashboardFilterOptions';
import { useDashboardFilterStore } from '@/store/dashboardFilterSlice';
import { useContractDetail } from '@/features/contracts/hooks/useContractDetail';
import { authHeaders, HttpError } from '@/services/http';

// High Risk Contracts panel is withheld from Signers (UC1-BR-013 / UC1-FV-003).
const HIDE_HIGH_RISK_FOR_ROLES = ['SIGNER'];

const EXPIRING_WINDOW_DAYS = { expiring30: 30, expiring60: 60, expiring90: 90 };

function toIsoDateString(date) {
  return date.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [accessMessage, setAccessMessage] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const draftFilters = useDashboardFilterStore((s) => ({
    contractType: s.contractType,
    department: s.department,
    counterpartyId: s.counterpartyId,
    ownerId: s.ownerId,
    dateRangeStart: s.dateRangeStart,
    dateRangeEnd: s.dateRangeEnd,
  }));
  const appliedFilters = useDashboardFilterStore((s) => s.appliedFilters);
  const setFilter = useDashboardFilterStore((s) => s.setFilter);
  const applyFiltersAction = useDashboardFilterStore((s) => s.applyFilters);
  const clearFiltersAction = useDashboardFilterStore((s) => s.clearFilters);

  const { data: options } = useDashboardFilterOptions();
  const { data: summary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } =
    useDashboardSummary(appliedFilters);
  const { data: tasks, isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } =
    useMyTasks(appliedFilters);

  const showHighRisk = !HIDE_HIGH_RISK_FOR_ROLES.includes(authHeaders.role);
  const highRiskResult = useHighRiskContracts(appliedFilters, !showHighRisk);
  const { fetchContract } = useContractDetail();

  // Any dashboard request failing with 401 means the session has expired
  // (UC1-AF-005): drop the applied filter selections and redirect to Login.
  useEffect(() => {
    const unauthorized = [summaryError, tasksError, highRiskResult.error].some(
      (err) => err instanceof HttpError && err.status === 401
    );
    if (unauthorized && !sessionExpired) {
      setSessionExpired(true);
      clearFiltersAction();
      navigate('/login', { state: { message: 'Your session has expired. Please log in again.' } });
    }
  }, [summaryError, tasksError, highRiskResult.error, sessionExpired, clearFiltersAction, navigate]);

  function handleApply(filtersObj) {
    Object.entries(filtersObj).forEach(([key, value]) => setFilter(key, value));
    applyFiltersAction();
  }

  function handleClear() {
    clearFiltersAction();
  }

  function handleCardClick(token) {
    const initialFilters = {
      contractType: appliedFilters.contractType || undefined,
      department: appliedFilters.department || undefined,
      counterpartyId: appliedFilters.counterpartyId || undefined,
      ownerId: appliedFilters.ownerId || undefined,
      dateRangeStart: appliedFilters.dateRangeStart || undefined,
      dateRangeEnd: appliedFilters.dateRangeEnd || undefined,
    };

    if (token in EXPIRING_WINDOW_DAYS) {
      const days = EXPIRING_WINDOW_DAYS[token];
      const today = new Date();
      const end = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      initialFilters.dateRangeStart = initialFilters.dateRangeStart || toIsoDateString(today);
      initialFilters.dateRangeEnd = toIsoDateString(end);
    } else if (token !== 'total') {
      initialFilters.status = token;
    }

    navigate('/contracts', { state: { initialFilters } });
  }

  async function handleRowClick(contractId) {
    setAccessMessage(null);
    try {
      const contract = await fetchContract(contractId);
      navigate(`/contracts/${contract.id}`);
    } catch (err) {
      if (err instanceof HttpError && (err.status === 403 || err.status === 401)) {
        setAccessMessage('You do not have access to this contract');
      } else {
        setAccessMessage('Unable to open this contract. Please try again.');
      }
    }
  }

  const noContractsMessage = summary?.totalContractsCount === 0 ? summary?.noContractsMessage : null;
  const noMatchMessage = summary?.noMatchMessage;

  const bannerMessage = useMemo(() => {
    if (noContractsMessage) return noContractsMessage;
    if (noMatchMessage) return noMatchMessage;
    return null;
  }, [noContractsMessage, noMatchMessage]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/login" className="hover:text-neutral-300">
            Login
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Dashboard</span>
        </nav>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Contract Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">Volumes, tasks and AI risk flags across your tenant</p>
          </div>
          <Link
            to="/contracts/new"
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            + New Contract
          </Link>
        </div>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        <DashboardFiltersBar options={options} filters={draftFilters} onApply={handleApply} onClear={handleClear} />

        {accessMessage && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
          >
            <span>{accessMessage}</span>
            <button
              type="button"
              onClick={() => setAccessMessage(null)}
              className="text-amber-300 hover:text-amber-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {summaryError && (
          <div className="flex items-center justify-between rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>{summaryError.message || 'Failed to load dashboard summary.'}</span>
            <button
              type="button"
              onClick={refetchSummary}
              className="rounded-md border border-red-500/60 px-3 py-1 text-xs font-medium hover:bg-red-500/10"
            >
              Retry
            </button>
          </div>
        )}

        {bannerMessage && !summaryError && (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-300">
            {bannerMessage}
          </div>
        )}

        {!summaryError && summaryLoading && !summary && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-900/60" />
            ))}
          </div>
        )}

        {!summaryError && summary && <StatusCardGroup summary={summary} onCardClick={handleCardClick} />}

        <div className="flex flex-col gap-6 lg:flex-row">
          <MyTasksPanel
            tasks={tasks}
            onRowClick={handleRowClick}
            isLoading={tasksLoading && !tasks}
            error={tasksError}
            onRetry={refetchTasks}
          />
          {showHighRisk && (
            <HighRiskContractsPanel
              contracts={highRiskResult.data}
              onRowClick={handleRowClick}
              isLoading={highRiskResult.isLoading && !highRiskResult.data}
              error={highRiskResult.error}
              onRetry={highRiskResult.refetch}
            />
          )}
        </div>
      </main>
    </div>
  );
}
