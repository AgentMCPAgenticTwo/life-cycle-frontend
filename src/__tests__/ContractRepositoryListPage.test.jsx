import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContractRepositoryListPage from '@/pages/ContractRepositoryListPage';
import { http, HttpError } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const SAMPLE_ITEM = {
  id: '11111111-1111-1111-1111-111111111111',
  contractName: 'Master Services Agreement',
  contractType: 'MSA',
  department: 'Legal',
  counterpartyName: 'Vertex Logistics',
  contractOwnerName: 'Jane Doe',
  status: 'Pending Approval',
  startDate: '2026-01-01',
  endDate: '2026-12-01',
  contractValue: 50000,
  currency: 'USD',
  riskScore: 72,
};

function renderPage(initialEntries = ['/contracts']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ContractRepositoryListPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ContractRepositoryListPage', () => {
  it('shows a loading state then renders populated contract rows', async () => {
    http.get.mockResolvedValueOnce({
      items: [SAMPLE_ITEM],
      page: 1,
      pageSize: 20,
      totalCount: 1,
    });

    renderPage();

    await waitFor(() => screen.getByText('Master Services Agreement'));
    expect(screen.getByText('Vertex Logistics')).toBeTruthy();
    expect(screen.getAllByText('Pending Approval').length).toBeGreaterThan(0);
  });

  it('shows the empty state message when the list has no matches', async () => {
    http.get.mockResolvedValueOnce({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      noMatchMessage: 'No contracts match the selected filters',
    });

    renderPage();

    await waitFor(() => screen.getByText('No contracts match the selected filters'));
  });

  it('shows an error state with retry when the list request fails', async () => {
    http.get.mockRejectedValueOnce(new HttpError(500, { error: 'Server error', details: [] }));

    renderPage();

    await waitFor(() => screen.getByText('Server error'));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('blocks navigation and shows the access-denied message on a 403', async () => {
    http.get
      .mockResolvedValueOnce({ items: [SAMPLE_ITEM], page: 1, pageSize: 20, totalCount: 1 })
      .mockRejectedValueOnce(new HttpError(403, { error: 'Forbidden', details: [] }));

    renderPage();

    await waitFor(() => screen.getByText('Master Services Agreement'));
    fireEvent.click(screen.getByText('Master Services Agreement'));

    await waitFor(() => screen.getByText('You do not have access to this contract'));
  });

  it('reads the status filter carried over from the Dashboard out of router state', async () => {
    http.get.mockResolvedValueOnce({ items: [], page: 1, pageSize: 20, totalCount: 0 });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/contracts', state: { initialFilters: { status: 'Draft' } } }]}
      >
        <ContractRepositoryListPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(http.get).toHaveBeenCalled());
    const [calledPath] = http.get.mock.calls[0];
    expect(calledPath).toContain('status=Draft');
  });
});
