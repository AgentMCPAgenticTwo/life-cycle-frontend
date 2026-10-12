import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApprovalMatrixConfigPage from '@/pages/ApprovalMatrixConfigPage';
import { http, authHeaders } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
    authHeaders: { role: 'TENANT_ADMIN', userId: '00000000-0000-0000-0000-000000000001' },
  };
});

const RULE = {
  id: '11111111-1111-1111-1111-111111111111',
  contractType: 'MSA',
  valueMin: 0,
  valueMax: 500000,
  riskBandMin: 0,
  riskBandMax: 50,
  steps: [{ stepNumber: 1, approverRole: 'LEGAL_REVIEWER', stepName: 'Legal Review' }],
};

function mockEndpoints({ items = [RULE] } = {}) {
  http.get.mockImplementation((path) => {
    if (path.startsWith('/api/v1/approval-matrix-config')) return Promise.resolve({ items });
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/settings/approval-matrix-config']}>
      <ApprovalMatrixConfigPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authHeaders.role = 'TENANT_ADMIN';
});

describe('ApprovalMatrixConfigPage', () => {
  it('renders configured rules', async () => {
    mockEndpoints();
    renderPage();

    expect(screen.getByRole('heading', { name: 'Approval Matrix' })).toBeTruthy();
    await waitFor(() => screen.getByDisplayValue('MSA'));
    expect(screen.getByText('Step 1')).toBeTruthy();
    expect(screen.getByDisplayValue('Legal Review')).toBeTruthy();
  });

  it('blocks access for an unauthorized role', () => {
    authHeaders.role = 'APPROVER';
    mockEndpoints();
    renderPage();

    expect(screen.getByText('You do not have permission to access this screen.')).toBeTruthy();
    expect(screen.queryByText('Approval Matrix')).toBeFalsy();
  });

  it('shows the empty state when no rules are configured', async () => {
    mockEndpoints({ items: [] });
    renderPage();

    await waitFor(() => screen.getByText('No approval matrix rules configured yet. Add a rule to define routing for contracts.'));
  });

  it('shows an error state with retry on load failure', async () => {
    http.get.mockImplementation(() => Promise.reject(new Error('Network error')));
    renderPage();

    await waitFor(() => screen.getByText('Network error'));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('saves updated rules via PUT', async () => {
    mockEndpoints();
    http.put.mockImplementation((path, body) => {
      if (path === '/api/v1/approval-matrix-config') return Promise.resolve({ items: body.items });
      return Promise.reject(new Error(`Unexpected put: ${path}`));
    });
    renderPage();

    await waitFor(() => screen.getByDisplayValue('MSA'));
    fireEvent.change(screen.getByDisplayValue('MSA'), { target: { value: 'NDA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(http.put).toHaveBeenCalledWith(
        '/api/v1/approval-matrix-config',
        expect.objectContaining({ items: expect.arrayContaining([expect.objectContaining({ contractType: 'NDA' })]) })
      )
    );
    await waitFor(() => screen.getByText('Approval matrix configuration saved successfully'));
  });

  it('blocks Save when a rule has no Contract Type', async () => {
    mockEndpoints();
    renderPage();

    await waitFor(() => screen.getByDisplayValue('MSA'));
    fireEvent.change(screen.getByDisplayValue('MSA'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => screen.getByText('Contract Type is required for every rule.'));
    expect(http.put).not.toHaveBeenCalled();
  });
});
