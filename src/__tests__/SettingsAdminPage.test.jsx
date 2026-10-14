import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsAdminPage from '@/pages/SettingsAdminPage';
import { http } from '@/services/http';

vi.mock('@/services/http', async () => {
  const actual = await vi.importActual('@/services/http');
  return {
    ...actual,
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), del: vi.fn() },
  };
});

const authState = vi.hoisted(() => ({ role: 'TENANT_ADMIN', userId: '00000000-0000-0000-0000-000000000001' }));
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }));

const USER = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Elena Martinez',
  email: 'elena.martinez@acme.com',
  role: 'Tenant Admin',
  status: 'Active',
  lastLogin: '2026-10-07T09:12:00Z',
};

const RULE = {
  id: '22222222-2222-2222-2222-222222222222',
  contractType: 'Product',
  valueThreshold: 10000,
  approverRole: 'Approver',
};

function mockEndpoints({ users = [USER], rules = [RULE], integrations = [], events = [], auditEntries = [] } = {}) {
  http.get.mockImplementation((path) => {
    if (path.startsWith('/api/v1/settings/users')) return Promise.resolve({ items: users, totalCount: users.length, page: 1, pageSize: 20 });
    if (path.startsWith('/api/v1/settings/approval-rules'))
      return Promise.resolve({ items: rules, totalCount: rules.length, page: 1, pageSize: 20 });
    if (path.startsWith('/api/v1/settings/integrations')) return Promise.resolve(integrations);
    if (path.startsWith('/api/v1/settings/notifications')) return Promise.resolve(events);
    if (path.startsWith('/api/v1/settings/audit-log'))
      return Promise.resolve({ items: auditEntries, totalCount: auditEntries.length, page: 1, pageSize: 20 });
    return Promise.reject(new Error(`Unexpected call: ${path}`));
  });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/settings/admin']}>
      <SettingsAdminPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.role = 'TENANT_ADMIN';
});

describe('SettingsAdminPage', () => {
  it('shows the User Management tab by default with its table columns', async () => {
    mockEndpoints();
    renderPage();

    expect(screen.getByRole('heading', { name: 'Settings / Admin' })).toBeTruthy();
    await waitFor(() => screen.getByText('Elena Martinez'));
    expect(screen.getByText('elena.martinez@acme.com')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('redirects a non-Tenant-Admin role to the access-denied screen', async () => {
    authState.role = 'APPROVER';
    mockEndpoints();
    renderPage();

    await waitFor(() => expect(screen.queryByText('Settings / Admin')).toBeFalsy());
  });

  it('blocks adding a user with a duplicate email, surfacing the backend error', async () => {
    mockEndpoints();
    http.post.mockImplementation((path) => {
      if (path === '/api/v1/settings/users')
        return Promise.reject(Object.assign(new Error('A user with this email already exists'), { status: 409 }));
      return Promise.reject(new Error(`Unexpected post: ${path}`));
    });
    renderPage();

    await waitFor(() => screen.getByText('Elena Martinez'));
    fireEvent.click(screen.getByRole('button', { name: '+ Add User' }));

    fireEvent.change(screen.getByLabelText(/User Name/i), { target: { value: 'New Person' } });
    fireEvent.change(screen.getByLabelText(/User Email/i), { target: { value: 'elena.martinez@acme.com' } });
    fireEvent.change(screen.getByLabelText(/User Role/i), { target: { value: 'Approver' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => screen.getByText('A user with this email already exists'));
  });

  it('blocks saving an incomplete approval rule', async () => {
    mockEndpoints();
    renderPage();

    await waitFor(() => screen.getByText('Elena Martinez'));
    fireEvent.click(screen.getByRole('button', { name: 'Routing & Approval' }));
    await waitFor(() => screen.getByText('Product'));
    fireEvent.click(screen.getByRole('button', { name: '+ Add Rule' }));

    fireEvent.click(screen.getByRole('button', { name: 'Save Role' }));

    await waitFor(() => screen.getByText('Please complete all required fields'));
    expect(http.post).not.toHaveBeenCalled();
  });

  it('renders the Audit Log tab as read-only with no edit or delete controls', async () => {
    mockEndpoints({
      auditEntries: [
        { id: 'a1', logDateTime: '2026-10-10T08:00:00Z', logUser: 'Elena Martinez', logAction: 'Created', logEntity: 'User' },
      ],
    });
    renderPage();

    await waitFor(() => screen.getByText('Elena Martinez'));
    fireEvent.click(screen.getByRole('button', { name: 'Audit Log' }));

    await waitFor(() => screen.getByText('Created'));
    expect(screen.queryByRole('button', { name: /edit/i })).toBeFalsy();
    expect(screen.queryByRole('button', { name: /delete/i })).toBeFalsy();
  });
});
