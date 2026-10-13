import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ObligationsRenewalPage from '@/pages/ObligationsRenewalPage';
import { http } from '@/services/http';
import { useObligationsStore } from '@/store/obligationsSlice';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), del: vi.fn() },
  };
});

const authState = vi.hoisted(() => ({ role: 'TENANT_ADMIN', userId: '00000000-0000-0000-0000-000000000001' }));
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }));

const CONTRACT_ID = '11111111-1111-1111-1111-111111111111';

const CONTRACT = {
  contractId: CONTRACT_ID,
  contractName: 'Master Services Agreement',
  counterparty: 'Veridian Logistics Inc.',
  status: 'Executed',
  value: 184500,
  startDate: '2025-02-01',
  endDate: '2026-12-07',
  owner: 'Priya Nair',
  lastModified: '2026-10-02T10:00:00Z',
  folderTags: [],
  availableTabs: ['Details', 'Obligations'],
};

const OBLIGATION = {
  obligationId: '22222222-2222-2222-2222-222222222222',
  contractId: CONTRACT_ID,
  obligationDescription: 'Deliver quarterly logistics performance report',
  obligationType: 'Reporting',
  owner: 'Priya Nair',
  dueDate: '2026-10-31',
  status: 'In Progress',
  source: 'AI Extracted',
  confirmationLabel: 'Confirmed',
  readOnly: false,
};

const RENEWAL = {
  contractId: CONTRACT_ID,
  renewalAlertBanner: 'Renewal Alert — 60 days to contract end',
  contractEndDate: '2026-12-07',
  noticePeriod: '45 days',
  alertThresholdDays: 60,
  renewEnabled: true,
  amendEnabled: true,
  terminateEnabled: true,
  actionInProgress: false,
};

function mockEndpoints({ obligations = [OBLIGATION], renewal = RENEWAL, contract = CONTRACT, contractError = null } = {}) {
  http.get.mockImplementation((path) => {
    if (path === `/api/v1/contracts/${CONTRACT_ID}`) {
      return contractError ? Promise.reject(contractError) : Promise.resolve(contract);
    }
    if (path === `/api/v1/contracts/${CONTRACT_ID}/obligations`) {
      return Promise.resolve({ items: obligations, totalCount: obligations.length });
    }
    if (path === `/api/v1/contracts/${CONTRACT_ID}/renewal`) {
      return Promise.resolve(renewal);
    }
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/contracts/${CONTRACT_ID}/obligations`]}>
      <Routes>
        <Route path="/contracts/:contractId/obligations" element={<ObligationsRenewalPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.role = 'TENANT_ADMIN';
  useObligationsStore.setState({ obligations: [], renewal: null });
});

describe('ObligationsRenewalPage', () => {
  it('shows a loading state before the contract loads', () => {
    http.get.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/loading contract/i)).toBeTruthy();
  });

  it('renders obligations and the renewal alert panel once loaded (UC9-MF-001, UC9-GC-001)', async () => {
    mockEndpoints();
    renderPage();
    await waitFor(() => expect(screen.getByText('Deliver quarterly logistics performance report')).toBeTruthy());
    expect(screen.getByText('Renewal Alert — 60 days to contract end')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Renew' }).length).toBeGreaterThan(0);
  });

  it('shows the empty state and manual add form when no obligations were extracted (UC9-AF-001)', async () => {
    mockEndpoints({ obligations: [] });
    renderPage();
    await waitFor(() => expect(screen.getByText('No obligations detected for this contract')).toBeTruthy());
    expect(screen.getByText('Add Obligation Manually')).toBeTruthy();
    // Renewal context remains visible even with no obligations.
    expect(screen.getByText('Renewal Alert — 60 days to contract end')).toBeTruthy();
  });

  it('shows the blocked message for a contract that is not yet Executed (UC9-AF-002)', async () => {
    mockEndpoints({ contract: { ...CONTRACT, status: 'In Negotiation' } });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Obligations are available only after a contract is fully executed')).toBeTruthy()
    );
  });

  it('shows the access-denied view for an Approver (UC9-BR-012)', async () => {
    authState.role = 'APPROVER';
    mockEndpoints();
    renderPage();
    await waitFor(() => expect(screen.getByText('You do not have permission to view this page')).toBeTruthy());
  });

  it('disables the Renew/Amend/Terminate buttons and hides Edit for a Legal Reviewer (UC9-BR-011)', async () => {
    authState.role = 'LEGAL_REVIEWER';
    mockEndpoints();
    renderPage();
    await waitFor(() => expect(screen.getByText('Deliver quarterly logistics performance report')).toBeTruthy());
    // The header action group is hidden entirely; the remaining (in-banner) button is forced disabled.
    const renewButtons = screen.getAllByRole('button', { name: 'Renew' });
    expect(renewButtons).toHaveLength(1);
    expect(renewButtons[0].disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });
});
