import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApprovalsListPage from '@/pages/ApprovalsListPage';
import { http } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const ITEM = {
  id: '11111111-1111-1111-1111-111111111111',
  contractId: '22222222-2222-2222-2222-222222222222',
  contractTitle: 'Master Services Agreement',
  contractType: 'MSA',
  contractValue: 480000,
  counterpartyName: 'Meridian Logistics',
  keyTermsSummary: 'Quarterly SOWs.',
  deviationsFromStandard: '1. Liability cap raised.',
  aiRiskScore: 82,
  approvalMatrixStepLabel: '2 of 3 – Legal Review',
  status: 'PendingApproval',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/approvals']}>
      <ApprovalsListPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ApprovalsListPage', () => {
  it('renders contract rows with title, value, counterparty, risk score and matrix step', async () => {
    http.get.mockResolvedValue({
      items: [ITEM],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      isEmpty: false,
      emptyMessage: null,
    });
    renderPage();

    await waitFor(() => screen.getByText(/Meridian Logistics/));
    expect(screen.getByText(/Master Services Agreement/)).toBeTruthy();
    expect(screen.getByText(/\$480,000/)).toBeTruthy();
    expect(screen.getByText(/Risk score 82/)).toBeTruthy();
    expect(screen.getByText(/2 of 3 – Legal Review/)).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('shows the empty-state message when no contracts are pending', async () => {
    http.get.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      isEmpty: true,
      emptyMessage: 'No contracts are currently awaiting your approval.',
    });
    renderPage();

    await waitFor(() => screen.getByText('No contracts are currently awaiting your approval.'));
    expect(screen.queryByText(/Meridian Logistics/)).toBeFalsy();
    expect(screen.queryByText('View all')).toBeFalsy();
  });

  it('shows an error state with retry on load failure', async () => {
    http.get.mockRejectedValue(new Error('Network error'));
    renderPage();

    await waitFor(() => screen.getByRole('alert'));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });
});
