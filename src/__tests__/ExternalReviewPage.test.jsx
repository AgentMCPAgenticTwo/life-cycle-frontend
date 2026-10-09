import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ExternalReviewPage from '@/pages/ExternalReviewPage';
import { http } from '@/services/http';
import { useNegotiationStore } from '@/store/negotiationSlice';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const LINK_TOKEN = 'tok-abc123';

const NEGOTIATION_DATA = {
  contractId: '44444444-4444-4444-4444-444444444444',
  versionNumber: 3,
  documentText: 'Clause 4.2 — Payment Terms. Net 45 days from invoice date.',
  commentBoxEnabled: true,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/negotiation/external/${LINK_TOKEN}`]}>
      <Routes>
        <Route path="/negotiation/external/:linkToken" element={<ExternalReviewPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function enterOtpAndVerify(value = '123456') {
  fireEvent.change(screen.getByLabelText('One-Time Passcode'), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  useNegotiationStore.getState().clear();
});

describe('ExternalReviewPage', () => {
  it('shows the OTP verification form before identity is confirmed', () => {
    renderPage();
    expect(screen.getByText('OTP Verification')).toBeTruthy();
    expect(screen.getByLabelText('One-Time Passcode')).toBeTruthy();
    expect(screen.queryByText('Clauses — Current Version')).toBeNull();
  });

  it('reveals the current version and comment box once OTP verification succeeds', async () => {
    http.post.mockResolvedValueOnce({ verified: true, negotiationData: NEGOTIATION_DATA });
    renderPage();

    enterOtpAndVerify();

    await waitFor(() => expect(screen.getByText('Clauses — Current Version')).toBeTruthy());
    expect(screen.getByText('Verified')).toBeTruthy();
    expect(screen.getByLabelText('Your Comment')).toBeTruthy();
  });

  it('locks the link after three consecutive failed OTP attempts', async () => {
    http.post.mockResolvedValue({ verified: false });
    renderPage();

    for (let i = 0; i < 3; i += 1) {
      enterOtpAndVerify('000000');
      await waitFor(() => expect(http.post).toHaveBeenCalledTimes(i + 1));
    }

    await waitFor(() =>
      expect(screen.getByText('Invalid OTP. Link locked, please request a new link')).toBeTruthy()
    );
    expect(screen.queryByLabelText('One-Time Passcode')).toBeNull();
  });

  it('shows the expired-link message when verification fails as expired', async () => {
    const expiredError = new Error('This review link has expired.');
    expiredError.status = 410;
    http.post.mockRejectedValueOnce(expiredError);
    renderPage();

    enterOtpAndVerify();

    await waitFor(() =>
      expect(
        screen.getByText(/This review link has expired\. Please contact the Contract Owner for a new link/i)
      ).toBeTruthy()
    );
  });

  it('submits external changes via the submit endpoint', async () => {
    http.post.mockResolvedValueOnce({ verified: true, negotiationData: NEGOTIATION_DATA });
    http.post.mockResolvedValueOnce({ versionNumber: 4, negotiationStatus: 'With Internal' });
    renderPage();

    enterOtpAndVerify();
    await waitFor(() => expect(screen.getByLabelText('Your Comment')).toBeTruthy());

    fireEvent.change(screen.getByLabelText('Your Comment'), {
      target: { value: 'Please change to Net 30.' },
    });
    const submitButtons = screen.getAllByRole('button', { name: /Submit Changes/i });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => expect(screen.getByText(/Changes submitted/i)).toBeTruthy());
    expect(http.post).toHaveBeenLastCalledWith(
      expect.stringContaining(`/negotiation/external/${LINK_TOKEN}/submit`),
      expect.objectContaining({ commentText: 'Please change to Net 30.' })
    );
  });
});
