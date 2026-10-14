import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NegotiationTrackerPage from '@/pages/NegotiationTrackerPage';
import { http, HttpError } from '@/services/http';
import { useNegotiationStore } from '@/store/negotiationSlice';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const authState = vi.hoisted(() => ({ role: 'CONTRACT_OWNER', userId: '00000000-0000-0000-0000-000000000001' }));
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }));

const CONTRACT_ID = '44444444-4444-4444-4444-444444444444';

const TRACKER = {
  contractId: CONTRACT_ID,
  routingType: 'Parallel',
  internalReviewers: [
    {
      reviewerId: 'r1',
      reviewerName: 'Priya Nair',
      role: 'Legal Reviewer',
      isMandatory: true,
      reviewStatus: 'Submitted',
      sequenceOrder: 1,
    },
    {
      reviewerId: 'r2',
      reviewerName: 'Arjun Mehta',
      role: 'Finance Head',
      isMandatory: true,
      reviewStatus: 'Pending',
      sequenceOrder: 2,
    },
  ],
  externalPartyName: 'Sanjay Kulkarni',
  externalPartyEmail: 'sanjay.kulkarni@nimbuslogistics.com',
  assignedDate: '2026-10-08',
  dueDate: '2026-10-22',
  negotiationStatus: 'With Counterparty',
  versionNumber: 6,
  overdueFlag: false,
  versions: [
    { versionNumber: 6, createdAt: '2026-10-06T00:00:00Z', createdBy: 'External Party', source: 'External' },
    { versionNumber: 5, createdAt: '2026-10-02T00:00:00Z', createdBy: 'Priya Nair', source: 'Internal' },
  ],
  comments: [],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/contracts/${CONTRACT_ID}/negotiation`]}>
      <Routes>
        <Route path="/contracts/:contractId/negotiation" element={<NegotiationTrackerPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.role = 'CONTRACT_OWNER';
  useNegotiationStore.getState().clear();
});

describe('NegotiationTrackerPage', () => {
  it('renders the routing panel when the contract has not been routed yet', async () => {
    http.get.mockRejectedValue(new HttpError(404, { error: 'Not routed', details: [] }));
    renderPage();

    await waitFor(() => expect(screen.getByText('Routing Panel')).toBeTruthy());
    expect(screen.getByLabelText(/Routing Type/i)).toBeTruthy();
    expect(screen.getByLabelText(/Internal Reviewers/i)).toBeTruthy();
  });

  it('blocks Submit for Review when no reviewer or external party is provided', async () => {
    http.get.mockRejectedValue(new HttpError(404, { error: 'Not routed', details: [] }));
    renderPage();

    await waitFor(() => expect(screen.getByText('Routing Panel')).toBeTruthy());
    screen.getByRole('button', { name: /Submit for Review/i }).click();

    await waitFor(() =>
      expect(
        screen.getByText('Please select at least one internal reviewer or external party before sending')
      ).toBeTruthy()
    );
    expect(http.post).not.toHaveBeenCalled();
  });

  it('renders the tracker with reviewers and version history once routed', async () => {
    http.get.mockResolvedValue(TRACKER);
    renderPage();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Negotiation Tracker' })).toBeTruthy());

    expect(screen.getByText('Sent to counterparty')).toBeTruthy();
    expect(screen.getByText(/secure link and one-time passcode were emailed/)).toBeTruthy();
    expect(screen.getAllByText(/Priya Nair/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Arjun Mehta/)).toBeTruthy();
    expect(screen.getByText(/v6 — External submission/)).toBeTruthy();
  });

  it('denies access to roles outside the negotiation tracker contract', async () => {
    authState.role = 'SIGNER';
    http.get.mockResolvedValue(TRACKER);
    renderPage();

    expect(screen.getByText(/You do not have permission to view this negotiation/i)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Negotiation Tracker' })).toBeNull();
  });

  it('only shows Mark as Agreed to the Legal Reviewer', async () => {
    authState.role = 'LEGAL_REVIEWER';
    http.get.mockResolvedValue(TRACKER);
    renderPage();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Negotiation Tracker' })).toBeTruthy());
    expect(screen.getByRole('button', { name: /Mark as Agreed/i })).toBeTruthy();
  });

  it('hides Mark as Agreed for roles other than Legal Reviewer', async () => {
    authState.role = 'CONTRACT_OWNER';
    http.get.mockResolvedValue(TRACKER);
    renderPage();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Negotiation Tracker' })).toBeTruthy());
    expect(screen.queryByRole('button', { name: /Mark as Agreed/i })).toBeNull();
  });
});
