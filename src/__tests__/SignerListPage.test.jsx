import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SignerListPage from '@/pages/SignerListPage';
import { http } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const authState = vi.hoisted(() => ({ role: 'CONTRACT_OWNER', userId: '00000000-0000-0000-0000-000000000001' }));
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }));

const CONTRACT_ID = '11111111-1111-1111-1111-111111111111';
const CONTRACT = { id: CONTRACT_ID, contractName: 'Vendor Services Agreement', status: 'Approved' };
const SETTINGS = { reminderFrequencyDays: 3, defaultSignatureProvider: 'In-built E-signature' };

const SIGNER = {
  id: '22222222-2222-2222-2222-222222222222',
  contractId: CONTRACT_ID,
  signerName: 'Priya Nair',
  signerEmail: 'priya.nair@vendorco.com',
  signerType: 'Internal',
  signingOrder: 1,
  signatureMethod: 'In-built E-signature',
  reminderFrequencyDays: 3,
  signerStatus: 'Sent',
  signaturePadCompleted: false,
};

function mockEndpoints({ signers = [], sendForSignatureEnabled = false, signingOrderLocked = false, contract = CONTRACT } = {}) {
  http.get.mockImplementation((path) => {
    if (path === `/api/v1/contracts/${CONTRACT_ID}`) return Promise.resolve(contract);
    if (path === `/api/v1/contracts/${CONTRACT_ID}/signers`) {
      return Promise.resolve({ contractId: CONTRACT_ID, signers, sendForSignatureEnabled, signingOrderLocked });
    }
    if (path === '/api/v1/esignature-settings') return Promise.resolve(SETTINGS);
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/contracts/${CONTRACT_ID}/signers`]}>
      <Routes>
        <Route path="/contracts/:contractId/signers" element={<SignerListPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.role = 'CONTRACT_OWNER';
});

describe('SignerListPage', () => {
  it('blocks access for an Approver', async () => {
    authState.role = 'APPROVER';
    mockEndpoints();
    renderPage();

    expect(screen.getByText(/Only the Contract Owner, Legal Reviewer or Tenant Admin/)).toBeTruthy();
  });

  it('shows the empty state and a disabled Send for Signature button when no signers exist', async () => {
    mockEndpoints({ signers: [], sendForSignatureEnabled: false });
    renderPage();

    await waitFor(() => screen.getByText('Add Signers'));
    expect(screen.getByText(/No signers have been added yet/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send for Signature' })).toHaveProperty('disabled', true);
  });

  it('renders signer rows and enables Send for Signature once a signer exists', async () => {
    mockEndpoints({ signers: [SIGNER], sendForSignatureEnabled: true });
    renderPage();

    await waitFor(() => screen.getByText('Priya Nair'));
    expect(screen.getByText('priya.nair@vendorco.com')).toBeTruthy();
    expect(screen.getByText('Not Sent')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send for Signature' })).toHaveProperty('disabled', false);
  });

  it('shows an error state with retry on load failure', async () => {
    http.get.mockImplementation((path) => {
      if (path === `/api/v1/contracts/${CONTRACT_ID}`) return Promise.resolve(CONTRACT);
      if (path === '/api/v1/esignature-settings') return Promise.resolve(SETTINGS);
      return Promise.reject(new Error('Network error'));
    });
    renderPage();

    await waitFor(() => screen.getByText('Network error'));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('adds a signer via the Add Signer form', async () => {
    mockEndpoints({ signers: [], sendForSignatureEnabled: false });
    http.post.mockImplementation((path, body) => {
      if (path === `/api/v1/contracts/${CONTRACT_ID}/signers`) {
        return Promise.resolve({ ...SIGNER, ...body, id: 'new-signer' });
      }
      return Promise.reject(new Error(`Unexpected post: ${path}`));
    });
    renderPage();

    await waitFor(() => screen.getByLabelText('Signer Name*'));
    fireEvent.change(screen.getByLabelText('Signer Name*'), { target: { value: 'Arjun Kapoor' } });
    fireEvent.change(screen.getByLabelText('Signer Email*'), { target: { value: 'arjun.kapoor@vendorco.com' } });
    fireEvent.change(screen.getByLabelText('Signing Order*'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Signer' }));

    await waitFor(() =>
      expect(http.post).toHaveBeenCalledWith(
        `/api/v1/contracts/${CONTRACT_ID}/signers`,
        expect.objectContaining({
          signerName: 'Arjun Kapoor',
          signerEmail: 'arjun.kapoor@vendorco.com',
          signerType: 'Internal',
          signingOrder: 1,
          signatureMethod: 'In-built E-signature',
        })
      )
    );
  });

  it('shows the connection-failure message when the integrated provider fails during send', async () => {
    mockEndpoints({ signers: [SIGNER], sendForSignatureEnabled: true });
    http.post.mockImplementation((path) => {
      if (path === `/api/v1/contracts/${CONTRACT_ID}/signers/send`) {
        return Promise.resolve({
          contractId: CONTRACT_ID,
          contractStatus: 'SignatureConnectionFailed',
          signers: [SIGNER],
          errorMessage: 'Unable to connect to the selected e-signature provider. Please try again or choose the in-built e-signature option.',
        });
      }
      return Promise.reject(new Error(`Unexpected post: ${path}`));
    });
    renderPage();

    await waitFor(() => screen.getByRole('button', { name: 'Send for Signature' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send for Signature' }));

    await waitFor(() => screen.getByText(/Unable to connect to the selected e-signature provider/));
  });

  it('shows the Download Audit Certificate button enabled once Executed', async () => {
    mockEndpoints({
      signers: [{ ...SIGNER, signerStatus: 'Signed' }],
      sendForSignatureEnabled: true,
      signingOrderLocked: true,
      contract: { ...CONTRACT, status: 'Executed' },
    });
    renderPage();

    await waitFor(() => screen.getByText('Signing Tracker'));
    expect(screen.getByRole('button', { name: 'Download Audit Certificate' })).toHaveProperty('disabled', false);
  });
});
