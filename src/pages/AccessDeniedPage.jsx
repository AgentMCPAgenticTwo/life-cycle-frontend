import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const REDIRECT_DELAY_MS = 3000;
const DEFAULT_MESSAGE = 'You do not have permission to view this page.';

/**
 * Standalone screen shown when a user hits a direct link to a screen their
 * role cannot access (UC10-AF-002 Tracker, UC11-AF-001 / UC11-BR-012
 * Settings / Admin). Renders none of the blocked screen's content, then
 * auto-redirects to the Dashboard after a short pause so the message is
 * readable; "Back to Dashboard" lets the user skip the wait.
 */
export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.accessDeniedMessage || DEFAULT_MESSAGE;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Access Denied</span>
        </nav>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Access Denied</h1>
      </header>

      <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
        <div role="alert" className="max-w-md rounded-xl border border-neutral-800 bg-neutral-900/60 px-8 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-600/40 bg-red-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-6 w-6 text-red-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-100">{message}</p>
          <p className="mt-1 text-xs text-neutral-500">Redirecting you to the Dashboard…</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
