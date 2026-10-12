import { useState } from 'react';
import { useUpdateUserStatus } from './hooks/useUpdateUserStatus';

/**
 * Deactivate/Reactivate controls for a single User Management Tab row,
 * guarding the last active Tenant Admin (UC11-AF-005 / UC11-BR-003).
 *
 * `users` (the full tenant user list) is used only to disable the control
 * client-side when `user` is the last active Tenant Admin, so a Tenant Admin
 * never fires a request that the backend is guaranteed to reject; the
 * backend's PATCH response remains the source of truth and its error message
 * is what renders on failure (BR-003 requires the block and its audit entry
 * to come from the server, not from this heuristic).
 */
export default function UserStatusActionControl({ user, users, onStatusChanged }) {
  const { updateStatus, isLoading } = useUpdateUserStatus();
  const [error, setError] = useState(null);

  // UC11-BR-013: Invited -> Active happens automatically on invite
  // acceptance; there is no manual control for an Invited user here.
  if (!user || user.status === 'Invited') return null;

  const isActive = user.status === 'Active';
  const activeTenantAdminCount = (users || []).filter(
    (u) => u.role === 'Tenant Admin' && u.status === 'Active'
  ).length;
  const isLastActiveTenantAdmin = user.role === 'Tenant Admin' && isActive && activeTenantAdminCount <= 1;

  async function handleClick() {
    setError(null);
    const nextStatus = isActive ? 'Deactivated' : 'Active';
    try {
      const updated = await updateStatus(user.id, { status: nextStatus });
      onStatusChanged?.(updated);
    } catch (err) {
      setError(err.message || 'At least one Tenant Admin must remain active');
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || isLastActiveTenantAdmin}
        title={isLastActiveTenantAdmin ? 'At least one Tenant Admin must remain active' : undefined}
        className={
          isActive
            ? 'rounded-md border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60'
            : 'rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60'
        }
      >
        {isActive ? 'Deactivate' : 'Reactivate'}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
