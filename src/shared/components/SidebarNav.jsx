import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

const NAV_SECTIONS = [
  {
    title: 'Workspace',
    items: [
      { to: '/', label: 'Dashboard', end: true },
      { to: '/contracts', label: 'Contracts' },
      { to: '/contract-repository', label: 'Contract Repository' },
      { to: '/tracker', label: 'Tracker' },
      { to: '/approvals', label: 'Approvals' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { to: '/settings/template-clause-library', label: 'Templates & Clauses' },
      { to: '/settings/approval-matrix-config', label: 'Approval Matrix' },
      { to: '/settings/esignature-settings', label: 'E-signature Settings' },
      { to: '/settings/admin', label: 'Admin' },
    ],
  },
];

function linkClasses({ isActive }) {
  return [
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-emerald-500/10 text-emerald-400'
      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100',
  ].join(' ');
}

/**
 * Responsive app sidebar: a static column on md+ screens, an off-canvas
 * drawer (controlled by isOpen/onClose) below that breakpoint.
 */
export default function SidebarNav({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleSignOut() {
    await logout();
    onClose?.();
    navigate('/login', { replace: true });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={[
          'fixed inset-y-0 left-0 z-40 w-64 shrink-0 transform overflow-y-auto border-r border-neutral-800 bg-neutral-950 px-4 py-6 transition-transform duration-200 ease-in-out',
          'md:static md:z-auto md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold tracking-tight text-neutral-100">
            Contract Lifecycle
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100 md:hidden"
          >
            ×
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                {section.title}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={linkClasses} onClick={onClose}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {user && (
          <div className="mt-6 border-t border-neutral-800 pt-4">
            <p className="truncate px-3 text-sm font-medium text-neutral-200" title={user.name}>
              {user.name}
            </p>
            <p className="truncate px-3 text-xs text-neutral-500" title={user.email}>
              {user.email}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 w-full rounded-md border border-neutral-700 px-3 py-2 text-left text-sm font-medium text-neutral-300 hover:border-neutral-500 hover:text-neutral-100"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
