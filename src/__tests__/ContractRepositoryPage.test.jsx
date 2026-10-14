import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ContractRepositoryPage from '@/pages/ContractRepositoryPage';
import { http } from '@/services/http';
import { useContractRepositoryStore } from '@/store/contractRepositorySlice';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const authState = vi.hoisted(() => ({ role: 'TENANT_ADMIN', userId: '00000000-0000-0000-0000-000000000001' }));
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }));

const CONTRACT = {
  contractId: '11111111-1111-1111-1111-111111111111',
  contractName: 'Cloud Hosting Data Services Agreement',
  counterparty: 'Northbridge Cloud Inc.',
  status: 'Executed',
  value: 184000,
  startDate: '2026-02-02',
  endDate: '2029-01-02',
  owner: 'M. Alvarez',
  lastModified: '2026-10-04T09:00:00Z',
  folderTags: [],
  indexingInProgress: false,
};

function mockSearch(response) {
  http.get.mockImplementation((path) => {
    if (path.startsWith('/api/v1/contracts')) return Promise.resolve(response);
    if (path === '/api/v1/folder-tags') return Promise.resolve([]);
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<ContractRepositoryPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.role = 'TENANT_ADMIN';
  useContractRepositoryStore.setState({ filters: {}, results: [], totalCount: 0, isEmptyState: false, isLoading: true, error: null });
});

describe('ContractRepositoryPage', () => {
  it('shows a loading state before results arrive', () => {
    http.get.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getAllByText('Contracts').length).toBeGreaterThan(0);
  });

  it('renders contracts once the search resolves (UC8-MF-001)', async () => {
    mockSearch({ items: [CONTRACT], totalCount: 1 });
    renderPage();
    await waitFor(() => expect(screen.getByText('Cloud Hosting Data Services Agreement')).toBeTruthy());
    expect(screen.getByText('Northbridge Cloud Inc.')).toBeTruthy();
  });

  it('shows the empty-repository message with no results at all (UC8-AF-002)', async () => {
    mockSearch({ items: [], totalCount: 0 });
    renderPage();
    await waitFor(() => expect(screen.getByText('You have no contracts to display.')).toBeTruthy());
  });

  it('shows the no-results message for a non-matching search (UC8-AF-001)', async () => {
    mockSearch({ items: [CONTRACT], totalCount: 1 });
    renderPage();
    await waitFor(() => expect(screen.getByText('Cloud Hosting Data Services Agreement')).toBeTruthy());

    mockSearch({ items: [], totalCount: 0 });
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'no such contract' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(screen.getByText('No contracts found matching your search.')).toBeTruthy());
  });

  it('shows the indexing-in-progress notice when a full text search excludes a contract (UC8-AF-004)', async () => {
    mockSearch({ items: [CONTRACT], totalCount: 1 });
    renderPage();
    await waitFor(() => expect(screen.getByText('Cloud Hosting Data Services Agreement')).toBeTruthy());

    const partiallyIndexed = { ...CONTRACT, indexingInProgress: true };
    mockSearch({ items: [partiallyIndexed], totalCount: 1 });
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'data retention' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() =>
      expect(
        screen.getByText('Some documents are still being indexed and may not appear in search results.')
      ).toBeTruthy()
    );
  });

  it('does not show the indexing notice when the search box is empty (filters only)', async () => {
    const partiallyIndexed = { ...CONTRACT, indexingInProgress: true };
    mockSearch({ items: [partiallyIndexed], totalCount: 1 });
    renderPage();
    await waitFor(() => expect(screen.getByText('Cloud Hosting Data Services Agreement')).toBeTruthy());

    expect(
      screen.queryByText('Some documents are still being indexed and may not appear in search results.')
    ).toBeNull();
  });
});
