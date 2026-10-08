import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import { http, HttpError } from '@/services/http';
import { useDashboardFilterStore } from '@/store/dashboardFilterSlice';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const SUMMARY = {
  totalContractsCount: 10,
  inDraftCount: 2,
  inNegotiationCount: 1,
  pendingApprovalCount: 3,
  pendingSignatureCount: 1,
  executedCount: 3,
  expiring30DaysCount: 1,
  expiring60DaysCount: 2,
  expiring90DaysCount: 3,
};

const EMPTY_SUMMARY = {
  totalContractsCount: 0,
  inDraftCount: 0,
  inNegotiationCount: 0,
  pendingApprovalCount: 0,
  pendingSignatureCount: 0,
  executedCount: 0,
  expiring30DaysCount: 0,
  expiring60DaysCount: 0,
  expiring90DaysCount: 0,
  noContractsMessage: 'No contracts yet. Click New Contract to get started.',
};

const FILTER_OPTIONS = {
  contractTypes: ['MSA', 'NDA'],
  departments: ['Legal'],
  counterparties: [{ id: '11111111-1111-1111-1111-111111111111', name: 'Vertex Logistics' }],
  owners: [{ id: '22222222-2222-2222-2222-222222222222', name: 'Jane Doe' }],
};

const TASK_ITEM = {
  contractId: '33333333-3333-3333-3333-333333333333',
  contractName: 'Master Services Agreement',
  counterparty: 'Vertex Logistics',
  status: 'Pending Approval',
  dueDate: '2026-12-01',
};

const HIGH_RISK_ITEM = {
  contractId: '44444444-4444-4444-4444-444444444444',
  contractName: 'Supply Agreement',
  counterparty: 'Castellan Freight Co.',
  riskScore: 92,
};

function mockDashboardEndpoints({ summary = SUMMARY, tasks = { items: [] }, highRisk = { items: [] }, options = FILTER_OPTIONS } = {}) {
  http.get.mockImplementation((calledPath) => {
    if (calledPath.startsWith('/api/v1/dashboard/summary')) return Promise.resolve(summary);
    if (calledPath.startsWith('/api/v1/dashboard/my-tasks')) return Promise.resolve(tasks);
    if (calledPath.startsWith('/api/v1/dashboard/high-risk-contracts')) return Promise.resolve(highRisk);
    if (calledPath.startsWith('/api/v1/dashboard/filters')) return Promise.resolve(options);
    return Promise.reject(new Error(`Unexpected call: ${calledPath}`));
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  useDashboardFilterStore.getState().clearFilters();
});

describe('DashboardPage', () => {
  it('renders populated status cards, My Tasks and High Risk panels', async () => {
    mockDashboardEndpoints({ tasks: { items: [TASK_ITEM] }, highRisk: { items: [HIGH_RISK_ITEM] } });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('10'));
    expect(screen.getByText('Master Services Agreement')).toBeTruthy();
    expect(screen.getByText('Supply Agreement')).toBeTruthy();
    expect(screen.getByText('92')).toBeTruthy();
  });

  it('shows the empty-tenant message and zeroed cards when no contracts exist', async () => {
    mockDashboardEndpoints({ summary: EMPTY_SUMMARY });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('No contracts yet. Click New Contract to get started.'));
    expect(screen.getByText('You have no pending tasks')).toBeTruthy();
    expect(screen.getByText('No high risk contracts found')).toBeTruthy();
  });

  it('shows the My Tasks empty state independently of populated cards', async () => {
    mockDashboardEndpoints({ tasks: { items: [], emptyMessage: 'You have no pending tasks' } });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('You have no pending tasks'));
    expect(screen.getByText('10')).toBeTruthy();
  });

  it('shows an error state with retry when the summary request fails', async () => {
    http.get.mockImplementation((calledPath) => {
      if (calledPath.startsWith('/api/v1/dashboard/summary')) {
        return Promise.reject(new HttpError(500, { error: 'Server error', details: [] }));
      }
      if (calledPath.startsWith('/api/v1/dashboard/my-tasks')) return Promise.resolve({ items: [] });
      if (calledPath.startsWith('/api/v1/dashboard/high-risk-contracts')) return Promise.resolve({ items: [] });
      if (calledPath.startsWith('/api/v1/dashboard/filters')) return Promise.resolve(FILTER_OPTIONS);
      return Promise.reject(new Error(`Unexpected call: ${calledPath}`));
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Server error'));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('sends the applied filters to the dashboard endpoints after Apply Filters', async () => {
    mockDashboardEndpoints();

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('10'));

    const contractTypeSelects = screen.getAllByDisplayValue('All Types');
    fireEvent.change(contractTypeSelects[0], { target: { value: 'MSA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      const summaryCalls = http.get.mock.calls.filter(([path]) => path.startsWith('/api/v1/dashboard/summary'));
      expect(summaryCalls[summaryCalls.length - 1][0]).toContain('contractType=MSA');
    });
  });

  it('blocks row navigation and shows the access-denied message on a 403', async () => {
    mockDashboardEndpoints({ tasks: { items: [TASK_ITEM] } });
    http.get.mockImplementation((calledPath) => {
      if (calledPath.startsWith('/api/v1/dashboard/summary')) return Promise.resolve(SUMMARY);
      if (calledPath.startsWith('/api/v1/dashboard/my-tasks')) return Promise.resolve({ items: [TASK_ITEM] });
      if (calledPath.startsWith('/api/v1/dashboard/high-risk-contracts')) return Promise.resolve({ items: [] });
      if (calledPath.startsWith('/api/v1/dashboard/filters')) return Promise.resolve(FILTER_OPTIONS);
      if (calledPath.startsWith('/api/v1/contracts/')) return Promise.reject(new HttpError(403, { error: 'Forbidden', details: [] }));
      return Promise.reject(new Error(`Unexpected call: ${calledPath}`));
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Master Services Agreement'));
    fireEvent.click(screen.getByText('Master Services Agreement'));

    await waitFor(() => screen.getByText('You do not have access to this contract'));
  });
});
