import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NewContractAccessGuard from '@/features/contracts/components/NewContractAccessGuard';

const authState = vi.hoisted(() => ({ role: 'TENANT_ADMIN', userId: '00000000-0000-0000-0000-000000000001' }));
vi.mock('@/shared/hooks/useAuth', () => ({ useAuth: () => authState }));

function renderGuard(allowedRoles) {
  return render(
    <MemoryRouter initialEntries={['/contracts/new']}>
      <Routes>
        <Route path="/" element={<div>Dashboard</div>} />
        <Route
          path="/contracts/new"
          element={
            <NewContractAccessGuard allowedRoles={allowedRoles}>
              <div>New Contract Form</div>
            </NewContractAccessGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('NewContractAccessGuard', () => {
  const originalRole = authState.role;

  beforeEach(() => {
    authState.role = originalRole;
  });

  it('renders the guarded screen for an allowed role', () => {
    authState.role = 'TENANT_ADMIN';
    renderGuard(['TENANT_ADMIN', 'CONTRACT_OWNER']);
    expect(screen.getByText('New Contract Form')).toBeTruthy();
  });

  it('redirects to the Dashboard for a disallowed role', () => {
    authState.role = 'LEGAL_REVIEWER';
    renderGuard(['TENANT_ADMIN', 'CONTRACT_OWNER']);
    expect(screen.queryByText('New Contract Form')).toBeNull();
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });
});
