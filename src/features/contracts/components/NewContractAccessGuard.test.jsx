import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NewContractAccessGuard from '@/features/contracts/components/NewContractAccessGuard';
import { authHeaders } from '@/services/http';

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
  const originalRole = authHeaders.role;

  beforeEach(() => {
    authHeaders.role = originalRole;
  });

  it('renders the guarded screen for an allowed role', () => {
    authHeaders.role = 'TENANT_ADMIN';
    renderGuard(['TENANT_ADMIN', 'CONTRACT_OWNER']);
    expect(screen.getByText('New Contract Form')).toBeTruthy();
  });

  it('redirects to the Dashboard for a disallowed role', () => {
    authHeaders.role = 'LEGAL_REVIEWER';
    renderGuard(['TENANT_ADMIN', 'CONTRACT_OWNER']);
    expect(screen.queryByText('New Contract Form')).toBeNull();
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });
});
