import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import * as authService from '@/services/authService';

vi.mock('@/services/authService');

function renderLogin(initialEntries = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Dashboard Screen</div>} />
        <Route path="/change-password" element={<div>Change Password Screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign-in form', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
  });

  it('shows a validation message when submitted empty', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('alert').textContent).toContain('Enter your email and password');
  });

  it('navigates to the dashboard on successful submit', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'token-123',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Jane Doe',
        email: 'user@example.com',
        role: 'TENANT_ADMIN',
        tenantId: '00000000-0000-0000-0000-000000000099',
        mustChangePassword: false,
      },
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByText('Dashboard Screen')).toBeTruthy());
  });

  it('redirects to change-password when the account must change its password', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'token-123',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Jane Doe',
        email: 'user@example.com',
        role: 'TENANT_ADMIN',
        tenantId: '00000000-0000-0000-0000-000000000099',
        mustChangePassword: true,
      },
    });

    renderLogin();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByText('Change Password Screen')).toBeTruthy());
  });

  it('shows the API error message on invalid credentials', async () => {
    authService.login.mockRejectedValue(new Error('Invalid email or password'));

    renderLogin();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Invalid email or password'));
  });

  it('shows the session-expired message passed via navigation state', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/login', state: { message: 'Your session has expired. Please log in again.' } }]}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Your session has expired. Please log in again.')).toBeTruthy();
  });
});
