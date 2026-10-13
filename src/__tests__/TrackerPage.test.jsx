import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TrackerPage from '@/pages/TrackerPage';
import { http } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), del: vi.fn() },
  };
});

const authState = vi.hoisted(() => ({ role: 'TENANT_ADMIN', userId: '00000000-0000-0000-0000-000000000001' }));
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }));

const OWNERSHIP_ROW = {
  ownerName: 'Priya Nambiar',
  contractsOwned: 18,
  inDraftCount: 3,
  inNegotiationCount: 5,
  inApprovalCount: 2,
  inSignatureCount: 1,
  completedCount: 7,
};

function ownerRow() {
  return screen.getByText('Priya Nambiar', { selector: 'td' });
}

function mockEndpoints({ ownershipRows = [OWNERSHIP_ROW], isEmpty = false } = {}) {
  http.get.mockImplementation((path) => {
    if (path.startsWith('/api/v1/tracker/ownership'))
      return Promise.resolve({ rows: ownershipRows, isEmpty, emptyStateMessage: 'No contracts match the current filters.', totalCount: ownershipRows.length, page: 1, pageSize: 20 });
    if (path.startsWith('/api/v1/tracker/cycle-time'))
      return Promise.resolve({ rows: [], isEmpty: true, emptyStateMessage: 'No stage data.', totalCount: 0, page: 1, pageSize: 20 });
    if (path.startsWith('/api/v1/tracker/bottleneck'))
      return Promise.resolve({ rows: [], isEmpty: true, emptyStateMessage: 'No contracts.', totalCount: 0, page: 1, pageSize: 20 });
    if (path.startsWith('/api/v1/tracker/turnaround'))
      return Promise.resolve({ rows: [], isEmpty: true, emptyStateMessage: 'No contracts.', totalCount: 0, page: 1, pageSize: 20 });
    if (path.startsWith('/api/v1/tracker/bottleneck-thresholds')) return Promise.resolve([]);
    if (path.startsWith('/api/v1/dashboard/filters'))
      return Promise.resolve({ contractTypes: ['Product', 'Service'], departments: [], counterparties: [], owners: [{ id: 'o1', name: 'Priya Nambiar' }] });
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/tracker']}>
      <TrackerPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.role = 'TENANT_ADMIN';
});

describe('TrackerPage', () => {
  it('shows the Ownership tab by default with the Contracts by Owner table', async () => {
    mockEndpoints();
    renderPage();

    expect(screen.getByRole('heading', { name: 'Contract Tracker' })).toBeTruthy();
    await waitFor(() => ownerRow());
    expect(screen.getByText('18')).toBeTruthy();
    expect(screen.getByText('Contracts by Owner')).toBeTruthy();
  });

  it('redirects a role without Tracker access to the access-denied screen', async () => {
    authState.role = 'SIGNER';
    mockEndpoints();
    renderPage();

    await waitFor(() => expect(screen.queryByText('Contract Tracker')).toBeFalsy());
  });

  it('switches to the Bottleneck tab and shows its empty state', async () => {
    mockEndpoints();
    renderPage();

    await waitFor(() => ownerRow());
    fireEvent.click(screen.getByRole('button', { name: 'Bottleneck' }));

    await waitFor(() => screen.getByText('No contracts.'));
  });

  it('shows the export failure message and keeps the active tab unchanged', async () => {
    mockEndpoints();
    http.post.mockImplementation((path) => {
      if (path === '/api/v1/tracker/export') return Promise.resolve({ success: false, failureMessage: 'Export failed. Please try again.' });
      return Promise.reject(new Error(`Unexpected post: ${path}`));
    });
    renderPage();

    await waitFor(() => ownerRow());
    fireEvent.click(screen.getByRole('button', { name: /Export/ }));

    await waitFor(() => screen.getByText('Export failed. Please try again.'));
    expect(ownerRow()).toBeTruthy();
  });

  it('requires Period before allowing a custom Date Range to be invalid', async () => {
    mockEndpoints();
    renderPage();

    await waitFor(() => ownerRow());
    fireEvent.change(screen.getByLabelText(/^Date Range From/i), { target: { value: '2026-10-20' } });
    fireEvent.change(screen.getByLabelText(/^Date Range To/i), { target: { value: '2026-10-01' } });

    await waitFor(() => screen.getByText('Date Range From must be earlier than Date Range To.'));
  });
});
