import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserStatusActionControl from './UserStatusActionControl';
import { HttpError } from '@/services/http';
import * as settingsUsersService from '@/services/settingsUsersService';

afterEach(() => {
  vi.restoreAllMocks();
});

const soleActiveAdmin = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Elena Martinez',
  email: 'elena.martinez@acme.com',
  role: 'Tenant Admin',
  status: 'Active',
  lastLogin: '2026-10-07T09:12:00Z',
};

const activeContractOwner = {
  id: '00000000-0000-0000-0000-000000000002',
  name: 'Raj Patel',
  email: 'raj.patel@acme.com',
  role: 'Contract Owner',
  status: 'Active',
  lastLogin: '2026-10-06T17:45:00Z',
};

const deactivatedUser = {
  id: '00000000-0000-0000-0000-000000000003',
  name: 'Marcus Chen',
  email: 'marcus.chen@acme.com',
  role: 'Approver',
  status: 'Deactivated',
  lastLogin: '2026-09-02T11:20:00Z',
};

describe('UserStatusActionControl', () => {
  it('renders nothing for an Invited user (auto-activates on acceptance, UC11-BR-013)', () => {
    const { container } = render(
      <UserStatusActionControl user={{ ...activeContractOwner, status: 'Invited' }} users={[]} />
    );
    expect(container.textContent).toBe('');
  });

  it('disables Deactivate and blocks the last active Tenant Admin (UC11-BR-003)', () => {
    render(<UserStatusActionControl user={soleActiveAdmin} users={[soleActiveAdmin, activeContractOwner]} />);

    const button = screen.getByRole('button', { name: /deactivate/i });
    expect(button.disabled).toBe(true);
    expect(button.title).toBe('At least one Tenant Admin must remain active');
  });

  it('allows deactivating a Tenant Admin when another active Tenant Admin remains', () => {
    const secondAdmin = { ...activeContractOwner, id: '00000000-0000-0000-0000-000000000004', role: 'Tenant Admin' };
    render(<UserStatusActionControl user={soleActiveAdmin} users={[soleActiveAdmin, secondAdmin]} />);

    expect(screen.getByRole('button', { name: /deactivate/i }).disabled).toBe(false);
  });

  it('calls the status endpoint and reports success for a non-admin Active user (UC11-BR-014)', async () => {
    const updated = { ...activeContractOwner, status: 'Deactivated' };
    vi.spyOn(settingsUsersService, 'updateUserStatus').mockResolvedValue(updated);
    const onStatusChanged = vi.fn();

    render(
      <UserStatusActionControl user={activeContractOwner} users={[activeContractOwner]} onStatusChanged={onStatusChanged} />
    );
    fireEvent.click(screen.getByRole('button', { name: /deactivate/i }));

    await waitFor(() => expect(onStatusChanged).toHaveBeenCalledWith(updated));
    expect(settingsUsersService.updateUserStatus).toHaveBeenCalledWith(activeContractOwner.id, {
      status: 'Deactivated',
    });
  });

  it('shows Reactivate for a Deactivated user and transitions it to Active (UC11-BR-015)', async () => {
    const updated = { ...deactivatedUser, status: 'Active' };
    vi.spyOn(settingsUsersService, 'updateUserStatus').mockResolvedValue(updated);
    const onStatusChanged = vi.fn();

    render(
      <UserStatusActionControl user={deactivatedUser} users={[deactivatedUser]} onStatusChanged={onStatusChanged} />
    );
    fireEvent.click(screen.getByRole('button', { name: /reactivate/i }));

    await waitFor(() => expect(onStatusChanged).toHaveBeenCalledWith(updated));
    expect(settingsUsersService.updateUserStatus).toHaveBeenCalledWith(deactivatedUser.id, { status: 'Active' });
  });

  it('shows the server-provided block message on a rejected status change (UC11-AF-005)', async () => {
    vi.spyOn(settingsUsersService, 'updateUserStatus').mockRejectedValue(
      new HttpError(409, { error: 'At least one Tenant Admin must remain active', details: [] })
    );
    const otherAdmin = { ...soleActiveAdmin, id: '00000000-0000-0000-0000-000000000005' };
    const secondAdmin = { ...activeContractOwner, id: '00000000-0000-0000-0000-000000000006', role: 'Tenant Admin' };

    render(<UserStatusActionControl user={otherAdmin} users={[otherAdmin, secondAdmin]} />);
    fireEvent.click(screen.getByRole('button', { name: /deactivate/i }));

    expect((await screen.findByRole('alert')).textContent).toBe('At least one Tenant Admin must remain active');
  });
});
