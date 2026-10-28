import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ContractDetailPage from '@/pages/ContractDetailPage';
import { http, HttpError } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const authState = vi.hoisted(() => ({ role: 'TENANT_ADMIN', userId: '00000000-0000-0000-0000-000000000001' }));
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }));

const CONTRACT_ID = '11111111-1111-1111-1111-111111111111';

const CONTRACT = {
  id: CONTRACT_ID,
  contractId: CONTRACT_ID,
  contractName: 'Master Services Agreement',
  contractType: 'MSA',
  counterpartyName: 'Northbridge Logistics Inc.',
  status: 'Executed',
  contractValue: 184500,
  currency: 'USD',
  startDate: '2025-02-01',
  endDate: '2026-01-31',
  contractOwnerName: 'Priya Anand',
  lastModified: '2026-10-02T10:00:00Z',
  folderTags: [],
  availableTabs: ['Details', 'Document', 'Versions', 'Clauses', 'Approvals', 'Signatures', 'Obligations', 'Activity Log'],
};

const DOCUMENT = {
  contractId: CONTRACT_ID,
  documentUrl: 'https://files.example.com/msa.pdf',
  fileName: 'MSA-0412_v6_executed.pdf',
  fileType: 'PDF',
  fileSizeBytes: 10240,
  isOversized: false,
  isCorruptedOrMissing: false,
  downloadEnabled: true,
};

function mockEndpoints({ contract = CONTRACT, contractError = null } = {}) {
  http.get.mockImplementation((path) => {
    if (path === `/api/v1/contracts/${CONTRACT_ID}`) {
      return contractError ? Promise.reject(contractError) : Promise.resolve(contract);
    }
    if (path === `/api/v1/contracts/${CONTRACT_ID}/document`) return Promise.resolve(DOCUMENT);
    if (path === `/api/v1/contracts/${CONTRACT_ID}/versions`) {
      return Promise.resolve({ items: [], totalCount: 0 });
    }
    if (path === `/api/v1/contracts/${CONTRACT_ID}/activity-log`) {
      return Promise.resolve({ items: [], totalCount: 0 });
    }
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/contracts/${CONTRACT_ID}`]}>
      <Routes>
        <Route path="/contracts/:contractId" element={<ContractDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.role = 'TENANT_ADMIN';
});

describe('ContractDetailPage', () => {
  it('shows a loading state before the contract loads', () => {
    http.get.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/loading contract/i)).toBeTruthy();
  });

  it('renders the Details tab by default once the contract loads', async () => {
    mockEndpoints();
    renderPage();
    await waitFor(() => expect(screen.getByText('Master Services Agreement')).toBeTruthy());
    expect(screen.getByText('Northbridge Logistics Inc.')).toBeTruthy();
    expect(screen.getAllByText('Executed').length).toBeGreaterThan(0);
  });

  it('navigates between Document, Versions and Activity Log tabs (UC8-MF-001)', async () => {
    mockEndpoints();
    renderPage();
    await waitFor(() => expect(screen.getByText('Master Services Agreement')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: 'Versions' }));
    expect(await screen.findByText('Prior uploads of this document')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Activity Log' }));
    expect(await screen.findByText('Read-only, time-stamped record of every action')).toBeTruthy();
  });

  it('shows AccessDeniedView when the backend blocks direct-link access (UC8-AF-003)', async () => {
    mockEndpoints({ contractError: new HttpError(403, { error: 'Forbidden', details: [] }) });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('You do not have permission to view this contract.')).toBeTruthy()
    );
  });

  it('hides the Add Folder/Tag button for Legal Reviewer (UC8-BR-009)', async () => {
    authState.role = 'LEGAL_REVIEWER';
    mockEndpoints();
    renderPage();
    await waitFor(() => expect(screen.getByText('Master Services Agreement')).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'Add Folder/Tag' })).toBeNull();
  });

  it('shows the Add Folder/Tag button for Contract Owner (UC8-BR-008)', async () => {
    authState.role = 'CONTRACT_OWNER';
    mockEndpoints();
    renderPage();
    await waitFor(() => expect(screen.getByText('Master Services Agreement')).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Add Folder/Tag' })).toBeTruthy();
  });
});
