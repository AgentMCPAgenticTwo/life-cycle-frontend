import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ApprovalReviewPage from '@/pages/ApprovalReviewPage';
import { http, authHeaders } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
    authHeaders: { role: 'APPROVER', userId: '00000000-0000-0000-0000-000000000001' },
  };
});

const APPROVAL = {
  id: '11111111-1111-1111-1111-111111111111',
  contractId: '22222222-2222-2222-2222-222222222222',
  contractTitle: 'Master Services Agreement — Novaquant Analytics Inc.',
  contractType: 'MSA',
  contractValue: 1240000,
  counterpartyName: 'Novaquant Analytics Inc.',
  keyTermsSummary: '12-month initial term with two 6-month auto-renewals.',
  deviationsFromStandard: '1. Liability cap raised. 2. Net 45 payment terms.',
  aiRiskScore: 64,
  approvalMatrixStepLabel: 'Step 2 of 3 – Finance Approver',
  approvalMatrixStepNumber: 2,
  approvalMatrixTotalSteps: 3,
  status: 'PendingApproval',
  comments: null,
  delegateToUserId: null,
  delegateToName: null,
  delegationStartDate: null,
  delegationEndDate: null,
  currentApproverId: '00000000-0000-0000-0000-000000000001',
  currentApproverName: 'You',
  isCurrentUserApprover: true,
  isCurrentUserActiveDelegate: false,
  isStepActionable: true,
  canApprove: true,
  canReject: true,
  canSendBack: true,
  canDelegate: true,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
};

const HISTORY = {
  items: [
    {
      id: 'h1',
      approvalId: APPROVAL.id,
      contractTitle: APPROVAL.contractTitle,
      contractType: APPROVAL.contractType,
      contractValue: APPROVAL.contractValue,
      counterpartyName: APPROVAL.counterpartyName,
      approvalMatrixStepLabel: 'Step 1 of 3 – Legal Approver',
      action: 'Approve',
      actorId: 'a1',
      actorName: 'Dana Whitfield',
      actorRole: 'APPROVER',
      priorState: 'PendingApproval',
      newState: 'Approved',
      comments: 'Standard liability deviation acceptable given counterparty history.',
      timestamp: '2026-10-05T10:00:00Z',
    },
  ],
  page: 1,
  pageSize: 20,
  totalCount: 1,
};

function mockEndpoints({ approval = APPROVAL, history = HISTORY } = {}) {
  http.get.mockImplementation((path) => {
    if (path.endsWith('/history')) return Promise.resolve(history);
    if (path.startsWith('/api/v1/approvals/')) return Promise.resolve(approval);
    if (path.startsWith('/api/v1/users')) return Promise.resolve({ items: [] });
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/approvals/${APPROVAL.id}`]}>
      <Routes>
        <Route path="/approvals/:approvalId" element={<ApprovalReviewPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authHeaders.role = 'APPROVER';
});

describe('ApprovalReviewPage', () => {
  it('renders contract details, AI reference fields and decision controls', async () => {
    mockEndpoints();
    renderPage();

    await waitFor(() => screen.getByText('AI Risk Score: 64 / 100'));
    expect(screen.getAllByText('Novaquant Analytics Inc.').length).toBeGreaterThan(0);
    expect(screen.getByText('AI Suggestion – for reference only')).toBeTruthy();
    expect(screen.getByRole('button', { name: '✓ Approve' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '✗ Reject' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '↩ Send Back' })).toBeTruthy();
  });

  it('blocks access for a role outside the contract (e.g. SIGNER)', () => {
    authHeaders.role = 'SIGNER';
    mockEndpoints();
    renderPage();

    expect(screen.getByText('You do not have permission to approve this contract.')).toBeTruthy();
    expect(http.get).not.toHaveBeenCalled();
  });

  it('blocks Reject without Comments', async () => {
    mockEndpoints();
    renderPage();

    await waitFor(() => screen.getByRole('button', { name: '✗ Reject' }));
    fireEvent.click(screen.getByRole('button', { name: '✗ Reject' }));

    expect(screen.getByText('Comments are required when rejecting or sending back a contract.')).toBeTruthy();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('submits Approve without Comments', async () => {
    mockEndpoints();
    http.post.mockResolvedValue({
      approvalId: APPROVAL.id,
      status: 'Approved',
      approvalMatrixStepLabel: 'Step 3 of 3 – Executive Approver',
      approvalMatrixStepNumber: 3,
      contractStatus: 'PendingApproval',
    });
    renderPage();

    await waitFor(() => screen.getByRole('button', { name: '✓ Approve' }));
    fireEvent.click(screen.getByRole('button', { name: '✓ Approve' }));

    await waitFor(() =>
      expect(http.post).toHaveBeenCalledWith(
        `/api/v1/approvals/${APPROVAL.id}/actions`,
        expect.objectContaining({ actionType: 'Approve' })
      )
    );
  });

  it('disables actions and shows the waiting message for an out-of-sequence step', async () => {
    mockEndpoints({ approval: { ...APPROVAL, isStepActionable: false, canApprove: false, canReject: false, canSendBack: false } });
    renderPage();

    await waitFor(() => screen.getByText('This step is not yet available for approval. Waiting on an earlier approver.'));
    expect(screen.getByRole('button', { name: '✓ Approve' }).disabled).toBe(true);
  });

  it('renders the Approval History tab entries', async () => {
    mockEndpoints();
    renderPage();

    await waitFor(() => screen.getByText('Dana Whitfield', { exact: false }));
    expect(screen.getByText(/Standard liability deviation acceptable/)).toBeTruthy();
  });

  it('shows read-only Decision for a Contract Owner', async () => {
    authHeaders.role = 'CONTRACT_OWNER';
    mockEndpoints({ approval: { ...APPROVAL, isCurrentUserApprover: false, canApprove: false, canReject: false, canSendBack: false, canDelegate: false } });
    renderPage();

    await waitFor(() => screen.getByText('You can view this approval but do not have rights to act on it.'));
    expect(screen.queryByRole('button', { name: '✓ Approve' })).toBeFalsy();
  });
});
