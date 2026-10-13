import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EsignatureSettingsPage from '@/pages/EsignatureSettingsPage';
import { http } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  };
});

const authState = vi.hoisted(() => ({ role: 'TENANT_ADMIN', userId: '00000000-0000-0000-0000-000000000001' }));
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }));

const SETTINGS = { reminderFrequencyDays: 5, defaultSignatureProvider: 'DocuSign' };

function mockEndpoints({ settings = SETTINGS } = {}) {
  http.get.mockImplementation((path) => {
    if (path === '/api/v1/esignature-settings') return Promise.resolve(settings);
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/settings/esignature-settings']}>
      <EsignatureSettingsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.role = 'TENANT_ADMIN';
});

describe('EsignatureSettingsPage', () => {
  it('renders the configured settings', async () => {
    mockEndpoints();
    renderPage();

    expect(screen.getByRole('heading', { name: 'E-signature Settings' })).toBeTruthy();
    await waitFor(() => screen.getByDisplayValue('5'));
    expect(screen.getByDisplayValue('DocuSign')).toBeTruthy();
  });

  it('blocks access for an unauthorized role', () => {
    authState.role = 'CONTRACT_OWNER';
    mockEndpoints();
    renderPage();

    expect(screen.getByText('You do not have permission to access this screen.')).toBeTruthy();
    expect(screen.queryByText('E-signature Settings')).toBeFalsy();
  });

  it('shows an error state with retry on load failure', async () => {
    http.get.mockImplementation(() => Promise.reject(new Error('Network error')));
    renderPage();

    await waitFor(() => screen.getByText('Network error'));
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('saves updated settings via PUT', async () => {
    mockEndpoints();
    http.put.mockImplementation((path, body) => {
      if (path === '/api/v1/esignature-settings') return Promise.resolve({ ...SETTINGS, ...body });
      return Promise.reject(new Error(`Unexpected put: ${path}`));
    });
    renderPage();

    await waitFor(() => screen.getByDisplayValue('5'));
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(http.put).toHaveBeenCalledWith(
        '/api/v1/esignature-settings',
        expect.objectContaining({ reminderFrequencyDays: 7, defaultSignatureProvider: 'DocuSign' })
      )
    );
    await waitFor(() => screen.getByText('E-signature settings saved successfully'));
  });

  it('rejects a non-whole-number reminder frequency', async () => {
    mockEndpoints();
    renderPage();

    await waitFor(() => screen.getByDisplayValue('5'));
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '2.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => screen.getByText('Reminder Frequency (days) must be a whole number.'));
    expect(http.put).not.toHaveBeenCalled();
  });

  it('allows saving with a blank reminder frequency', async () => {
    mockEndpoints();
    http.put.mockImplementation((path, body) => {
      if (path === '/api/v1/esignature-settings') return Promise.resolve({ ...SETTINGS, ...body, reminderFrequencyDays: 3 });
      return Promise.reject(new Error(`Unexpected put: ${path}`));
    });
    renderPage();

    await waitFor(() => screen.getByDisplayValue('5'));
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(http.put).toHaveBeenCalledWith(
        '/api/v1/esignature-settings',
        expect.objectContaining({ defaultSignatureProvider: 'DocuSign' })
      )
    );
    await waitFor(() => screen.getByText('E-signature settings saved successfully'));
  });
});
