import UserStatusActionControl from './UserStatusActionControl';

const STATUS_STYLES = {
  Active: 'border-emerald-600/40 bg-emerald-500/10 text-emerald-300',
  Invited: 'border-amber-600/40 bg-amber-500/10 text-amber-300',
  Deactivated: 'border-neutral-700 bg-neutral-800/60 text-neutral-400',
};

function formatLastLogin(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/**
 * Users table with Add User action (UC11-GC-001 / UC11-MF-001). Columns are
 * exactly Name, Email, Role, Status, Last Login — no other user-table column
 * is shown, per UC11-GC-001.
 */
export default function UserManagementTab({ users, isLoading, error, onRetry, onAddUser, onStatusChanged, onResetPassword }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-100">User Management</h2>
          <p className="mt-1 text-xs text-neutral-500">Tenant users and their access roles</p>
        </div>
        <button
          type="button"
          onClick={onAddUser}
          className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          + Add User
        </button>
      </div>

      <div className="mt-5">
        {isLoading && <p className="text-sm text-neutral-500">Loading users…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error.message || 'Unable to load users.'}
            {onRetry && (
              <button type="button" onClick={onRetry} className="ml-3 font-medium text-red-200 underline">
                Retry
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && (!users || users.length === 0) && (
          <p className="text-sm text-neutral-500">No tenant users found.</p>
        )}

        {!isLoading && !error && users && users.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Role</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Last Login</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-800/60 last:border-0">
                  <td className="py-3 font-medium text-neutral-100">{user.name}</td>
                  <td className="py-3 text-neutral-400">{user.email}</td>
                  <td className="py-3 text-neutral-400">{user.role}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[user.status] || 'border-neutral-700 bg-neutral-800/60 text-neutral-400'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 text-neutral-400">{formatLastLogin(user.lastLogin)}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status !== 'Invited' && (
                        <button
                          type="button"
                          onClick={() => onResetPassword?.(user)}
                          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-neutral-500"
                        >
                          Reset Password
                        </button>
                      )}
                      <UserStatusActionControl user={user} users={users} onStatusChanged={onStatusChanged} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
