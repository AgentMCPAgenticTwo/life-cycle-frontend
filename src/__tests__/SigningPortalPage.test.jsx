import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SigningPortalPage from '@/pages/SigningPortalPage';
import { http } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const SESSION_ID = '33333333-3333-3333-3333-333333333333';

const BASE_SESSION = {
  sessionId: SESSION_ID,
  contractId: '11111111-1111-1111-1111-111111111111',
  signerId: '22222222-2222-2222-2222-222222222222',
  signerName: 'Priya Narayanan',
  signerEmail: 'priya.narayanan@nimbuslogistics.com',
  signerStatus: 'Sent',
  isCurrentTurn: true,
  otpVerified: false,
  documentUrl: null,
  signaturePadAvailable: false,
  declineAvailable: false,
  reminderFrequencyDays: 3,
  linkExpired: false,
  blockedMessage: null,
};

function mockSession(session) {
  http.get.mockImplementation((path) => {
    if (path === `/api/v1/signing-sessions/${SESSION_ID}`) return Promise.resolve(session);
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/sign/${SESSION_ID}`]}>
      <Routes>
        <Route path="/sign/:sessionId" element={<SigningPortalPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SigningPortalPage', () => {
  it('shows the expired-link message and hides the OTP field', async () => {
    mockSession({ ...BASE_SESSION, linkExpired: true });
    renderPage();

    await waitFor(() => screen.getByText('This signing link has expired.'));
    expect(screen.queryByLabelText('OTP Code*')).toBeNull();
  });

  it('blocks a signer whose turn has not arrived', async () => {
    mockSession({ ...BASE_SESSION, isCurrentTurn: false, blockedMessage: 'Waiting for prior signers.' });
    renderPage();

    await waitFor(() => screen.getByText('Waiting on an earlier signer'));
    expect(screen.getByText('Waiting for prior signers.')).toBeTruthy();
  });

  it('hides the document viewer and signature pad until OTP is verified', async () => {
    mockSession({ ...BASE_SESSION, otpVerified: false });
    renderPage();

    await waitFor(() => screen.getByLabelText('OTP Code*'));
    expect(screen.queryByText('Document viewer')).toBeNull();
  });

  it('reveals the document viewer and signature pad after successful OTP verification', async () => {
    mockSession({ ...BASE_SESSION, otpVerified: false });
    http.post.mockImplementation((path, body) => {
      if (path === `/api/v1/signing-sessions/${SESSION_ID}/otp/verify` && body.otpCode === '482913') {
        return Promise.resolve({ signerStatus: 'Viewed', documentUrl: 'https://example.com/doc.pdf', signaturePadAvailable: true });
      }
      return Promise.reject(new Error(`Unexpected post: ${path}`));
    });
    renderPage();

    await waitFor(() => screen.getByLabelText('OTP Code*'));
    fireEvent.change(screen.getByLabelText('OTP Code*'), { target: { value: '482913' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => screen.getByText('Document viewer'));
    expect(screen.getByText('Apply your signature')).toBeTruthy();
  });

  it('locks the link after three invalid OTP attempts', async () => {
    mockSession({ ...BASE_SESSION, otpVerified: false });
    let attempts = 0;
    http.post.mockImplementation((path) => {
      if (path === `/api/v1/signing-sessions/${SESSION_ID}/otp/verify`) {
        attempts += 1;
        const remaining = 3 - attempts;
        return Promise.resolve({
          signerStatus: 'Sent',
          signaturePadAvailable: false,
          attemptsRemaining: remaining,
          lockedUntil: remaining <= 0 ? new Date(Date.now() + 15 * 60000).toISOString() : null,
          errorMessage: 'Invalid OTP.',
        });
      }
      return Promise.reject(new Error(`Unexpected post: ${path}`));
    });
    renderPage();

    await waitFor(() => screen.getByLabelText('OTP Code*'));
    for (let i = 0; i < 3; i += 1) {
      fireEvent.change(screen.getByLabelText('OTP Code*'), { target: { value: '000000' } });
      fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
      await waitFor(() => expect(http.post).toHaveBeenCalledTimes(i + 1));
    }

    await waitFor(() => screen.getByText(/Invalid OTP\. Please request a new code\./));
  });

  it('submits a decline with a mandatory reason', async () => {
    mockSession({ ...BASE_SESSION, otpVerified: true, signaturePadAvailable: true, declineAvailable: true });
    http.post.mockImplementation((path, body) => {
      if (path === `/api/v1/signing-sessions/${SESSION_ID}/decline`) {
        return Promise.resolve({ signerId: BASE_SESSION.signerId, signerStatus: 'Declined', contractStatus: 'Signature Declined', reason: body.reason });
      }
      return Promise.reject(new Error(`Unexpected post: ${path}`));
    });
    renderPage();

    await waitFor(() => screen.getByRole('button', { name: 'Decline to Sign' }));
    fireEvent.click(screen.getByRole('button', { name: 'Decline to Sign' }));
    fireEvent.change(screen.getByLabelText('Reason for declining*'), { target: { value: 'Terms changed' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Decline' }));

    await waitFor(() =>
      expect(http.post).toHaveBeenCalledWith(`/api/v1/signing-sessions/${SESSION_ID}/decline`, { reason: 'Terms changed' })
    );
  });
});
