import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TrackerReportControlsPanel from '@/features/tracker/TrackerReportControlsPanel';
import TrackerExportButton from '@/features/tracker/TrackerExportButton';
import OwnershipTab from '@/features/tracker/OwnershipTab';
import CycleTimeTab from '@/features/tracker/CycleTimeTab';
import BottleneckTab from '@/features/tracker/BottleneckTab';
import TurnaroundTab from '@/features/tracker/TurnaroundTab';
import { useOwnershipTab } from '@/features/tracker/hooks/useOwnershipTab';
import { useCycleTimeTab } from '@/features/tracker/hooks/useCycleTimeTab';
import { useBottleneckTab } from '@/features/tracker/hooks/useBottleneckTab';
import { useTurnaroundTab } from '@/features/tracker/hooks/useTurnaroundTab';
import { useTrackerExport } from '@/features/tracker/hooks/useTrackerExport';
import { useEstimatedTurnaroundOverride } from '@/features/tracker/hooks/useEstimatedTurnaroundOverride';
import { useTrackerFiltersStore } from '@/store/trackerFiltersSlice';
import { useAuth } from '@/shared/hooks/useAuth';

// UC10-AF-002 / UC10-BR-012: only these roles may view the Tracker.
const ALLOWED_ROLES = ['TENANT_ADMIN', 'CONTRACT_OWNER', 'LEGAL_REVIEWER', 'APPROVER'];

const TABS = [
  { key: 'ownership', label: 'Ownership' },
  { key: 'cycleTime', label: 'Cycle Time' },
  { key: 'bottleneck', label: 'Bottleneck' },
  { key: 'turnaround', label: 'Turnaround' },
];

const PERIOD_WINDOW_LABEL = {
  Daily: 'last 24 hours',
  Weekly: 'last 7 days',
  Monthly: 'last 30 days',
};

export default function TrackerPage() {
  const navigate = useNavigate();
  const { role, userId } = useAuth();
  const isAllowed = ALLOWED_ROLES.includes(role);

  useEffect(() => {
    if (!isAllowed) {
      navigate('/access-denied', {
        replace: true,
        state: { accessDeniedMessage: 'You do not have permission to view this page.' },
      });
    }
  }, [isAllowed, navigate]);

  const period = useTrackerFiltersStore((s) => s.period);
  const contractTypeFilter = useTrackerFiltersStore((s) => s.contractTypeFilter);
  const ownerFilter = useTrackerFiltersStore((s) => s.ownerFilter);
  const dateRangeFrom = useTrackerFiltersStore((s) => s.dateRangeFrom);
  const dateRangeTo = useTrackerFiltersStore((s) => s.dateRangeTo);
  const activeTab = useTrackerFiltersStore((s) => s.activeTab);
  const setPeriod = useTrackerFiltersStore((s) => s.setPeriod);
  const setContractTypeFilter = useTrackerFiltersStore((s) => s.setContractTypeFilter);
  const setOwnerFilter = useTrackerFiltersStore((s) => s.setOwnerFilter);
  const setDateRange = useTrackerFiltersStore((s) => s.setDateRange);
  const setActiveTab = useTrackerFiltersStore((s) => s.setActiveTab);
  const resetOnOpen = useTrackerFiltersStore((s) => s.resetOnOpen);

  // UC10-BR-013: Period, filters and Tab reset to defaults every time the
  // screen is opened -- the Tracker persists no object state of its own.
  useEffect(() => {
    resetOnOpen();
  }, [resetOnOpen]);

  const queryParams = {
    period: dateRangeFrom && dateRangeTo ? undefined : period,
    contractTypeFilter: contractTypeFilter === 'All' ? undefined : contractTypeFilter,
    ownerFilter: ownerFilter === 'All' ? undefined : ownerFilter,
    dateRangeFrom: dateRangeFrom || undefined,
    dateRangeTo: dateRangeTo || undefined,
  };

  const ownershipResult = useOwnershipTab(queryParams);
  const cycleTimeResult = useCycleTimeTab(queryParams);
  const bottleneckResult = useBottleneckTab(queryParams);
  const turnaroundResult = useTurnaroundTab(queryParams);
  const { exportTab, isExporting, failureMessage } = useTrackerExport();
  const { override, isSubmitting: isOverriding } = useEstimatedTurnaroundOverride();

  if (!isAllowed) return null;

  function handleFilterChange(patch) {
    if ('period' in patch) setPeriod(patch.period);
    if ('contractTypeFilter' in patch) setContractTypeFilter(patch.contractTypeFilter);
    if ('ownerFilter' in patch) setOwnerFilter(patch.ownerFilter);
    if ('dateRangeFrom' in patch || 'dateRangeTo' in patch) {
      setDateRange(patch.dateRangeFrom ?? dateRangeFrom, patch.dateRangeTo ?? dateRangeTo);
    }
  }

  const tabKeyToExportTab = {
    ownership: 'Ownership',
    cycleTime: 'CycleTime',
    bottleneck: 'Bottleneck',
    turnaround: 'Turnaround',
  };

  async function handleExport(format = 'Excel') {
    const response = await exportTab({
      tab: tabKeyToExportTab[activeTab],
      format,
      period: queryParams.period,
      contractTypeFilter: queryParams.contractTypeFilter,
      ownerFilter: queryParams.ownerFilter,
      dateRangeFrom: queryParams.dateRangeFrom,
      dateRangeTo: queryParams.dateRangeTo,
    });
    if (response.success && response.fileUrl) {
      window.open(response.fileUrl, '_blank', 'noopener,noreferrer');
    }
  }

  async function handleOverride(contractId, request) {
    await override(contractId, {
      ...request,
      overriddenBy: userId,
      overrideTimestamp: new Date().toISOString(),
    });
    await turnaroundResult.refetch();
  }

  const periodLabel = dateRangeFrom && dateRangeTo ? 'Custom range' : `${period} view — ${PERIOD_WINDOW_LABEL[period] || ''}`;

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
          <span className="text-neutral-400">Tracker</span>
        </nav>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Contract Tracker</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Ownership, cycle times, bottlenecks and turnaround performance across your contract portfolio
            </p>
          </div>
          <TrackerExportButton onExport={handleExport} isExporting={isExporting} failureMessage={failureMessage} />
        </div>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        <TrackerReportControlsPanel
          period={period}
          contractTypeFilter={contractTypeFilter}
          ownerFilter={ownerFilter}
          dateRangeFrom={dateRangeFrom}
          dateRangeTo={dateRangeTo}
          onFilterChange={handleFilterChange}
        />

        <div className="flex gap-2 border-b border-neutral-800">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'ownership' && (
          <OwnershipTab
            data={ownershipResult.data}
            isLoading={ownershipResult.isLoading}
            error={ownershipResult.error}
            onRetry={ownershipResult.refetch}
            periodLabel={periodLabel}
          />
        )}

        {activeTab === 'cycleTime' && (
          <CycleTimeTab
            data={cycleTimeResult.data}
            isLoading={cycleTimeResult.isLoading}
            error={cycleTimeResult.error}
            onRetry={cycleTimeResult.refetch}
          />
        )}

        {activeTab === 'bottleneck' && (
          <BottleneckTab
            data={bottleneckResult.data}
            isLoading={bottleneckResult.isLoading}
            error={bottleneckResult.error}
            onRetry={bottleneckResult.refetch}
          />
        )}

        {activeTab === 'turnaround' && (
          <TurnaroundTab
            data={turnaroundResult.data}
            isLoading={turnaroundResult.isLoading}
            error={turnaroundResult.error}
            onRetry={turnaroundResult.refetch}
            onOverride={handleOverride}
            isOverriding={isOverriding}
          />
        )}
      </main>
    </div>
  );
}
