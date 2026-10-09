import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ClauseAnalysisPage from '@/pages/ClauseAnalysisPage';
import { http, authHeaders } from '@/services/http';
import { useClauseAnalysisStore } from '@/store/clauseAnalysisSlice';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
    authHeaders: { role: 'LEGAL_REVIEWER', userId: '00000000-0000-0000-0000-000000000001' },
  };
});

const CONTRACT_ID = '33333333-3333-3333-3333-333333333333';

const ANALYSIS = {
  contractId: CONTRACT_ID,
  fileFormatSupported: true,
  analysisStatus: 'Completed',
  overallContractRiskScore: 'High',
  proceedToNegotiationEnabled: false,
  askAiEnabled: true,
  clauses: [
    {
      clauseId: 'c1',
      clauseText: 'Payment within 30 days',
      clauseCategory: 'Payment',
      libraryMatchStatus: 'Standard',
      riskScore: 'Low',
      status: 'Accepted',
      isMandatory: true,
      mandatoryClauseFlag: false,
      version: 1,
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      clauseId: 'c2',
      clauseText: '',
      clauseCategory: 'Indemnity',
      libraryMatchStatus: 'Missing',
      riskScore: 'High',
      status: 'AI-Suggested',
      isMandatory: true,
      mandatoryClauseFlag: true,
      mandatoryClauseFlagLabel: 'Mandatory clause missing',
      version: 1,
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ],
  metadata: {
    parties: 'Novexa Solutions Ltd.',
    partiesLabel: 'AI-suggested',
    contractValue: 482000,
    contractValueLabel: 'AI-suggested',
    startDate: '2026-01-01',
    startDateLabel: 'AI-suggested',
    endDate: '2028-10-31',
    endDateLabel: 'AI-suggested',
    renewalTerms: 'Auto-renews for successive 12-month terms',
    renewalTermsLabel: 'AI-suggested',
    paymentTerms: 'Net 45 days',
    paymentTermsLabel: 'AI-suggested',
    keyObligations: 'Deliver milestones',
    keyObligationsLabel: 'AI-suggested',
  },
};

function mockEndpoints(overrides = {}) {
  http.get.mockImplementation((path) => {
    if (path.includes('/clause-analysis')) return Promise.resolve({ ...ANALYSIS, ...overrides });
    return Promise.reject(new Error(`Unexpected GET: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/contracts/${CONTRACT_ID}/clause-analysis`]}>
      <Routes>
        <Route path="/contracts/:contractId/clause-analysis" element={<ClauseAnalysisPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authHeaders.role = 'LEGAL_REVIEWER';
  useClauseAnalysisStore.getState().clear();
});

describe('ClauseAnalysisPage', () => {
  it('renders the clause list, overall risk score and metadata once loaded', async () => {
    mockEndpoints();
    renderPage();

    expect(screen.getByText(/Loading clause analysis/i)).toBeTruthy();

    await waitFor(() => expect(screen.getByText('AI Clause Analysis')).toBeTruthy());

    expect(screen.getByTestId('overall-risk-score').textContent).toBe('High');
    expect(screen.getByText('Payment')).toBeTruthy();
    expect(screen.getByText('Indemnity')).toBeTruthy();
    expect(screen.getAllByText('Mandatory clause missing').length).toBeGreaterThan(0);
    expect(screen.getByText('Contract Metadata')).toBeTruthy();
  });

  it('disables Proceed to Negotiation while a mandatory clause is missing', async () => {
    mockEndpoints();
    renderPage();

    await waitFor(() => expect(screen.getByText('AI Clause Analysis')).toBeTruthy());

    const proceedButton = screen.getByRole('button', { name: /Proceed to Negotiation/i });
    expect(proceedButton.disabled).toBe(true);
    expect(screen.getByText(/Resolve all mandatory clauses before proceeding/i)).toBeTruthy();
  });

  it('shows the unsupported file blocker and hides clause data when the format is unsupported', async () => {
    mockEndpoints({ fileFormatSupported: false, clauses: [], metadata: null });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/This file type is not supported for AI analysis/i)).toBeTruthy()
    );

    expect(screen.queryByText('Contract Metadata')).toBeNull();
  });

  it('denies access to roles outside Legal Reviewer, Contract Owner and Tenant Admin', async () => {
    authHeaders.role = 'APPROVER';
    mockEndpoints();
    renderPage();

    expect(
      screen.getByText(/You do not have permission to view this contract's clause analysis/i)
    ).toBeTruthy();
    expect(screen.queryByText('AI Clause Analysis')).toBeNull();
  });

  it('shows an AI extraction failure banner with retry and continue-manually options', async () => {
    mockEndpoints({ analysisStatus: 'Failed' });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/AI analysis could not be completed/i)).toBeTruthy()
    );
    expect(screen.getByRole('button', { name: /Retry/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Continue Manually/i })).toBeTruthy();
  });
});
