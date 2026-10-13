import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Entry point for the real auth flow (POST /auth/login). On success it
 * forwards a user with mustChangePassword to /change-password; ProtectedRoute
 * enforces that redirect for direct navigation too, this just skips the
 * detour through the dashboard.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = location.state?.message || null;
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setFormError('Enter your email and password to continue.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      const redirectTo = location.state?.from?.pathname;
      if (user.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(redirectTo || '/', { replace: true });
      }
    } catch (err) {
      setFormError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900/60 px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">Access your contract lifecycle workspace</p>

        {infoMessage && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300"
          >
            {infoMessage}
          </div>
        )}

        {formError && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-red-600/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
          >
            {formError}
          </div>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="text-xs font-medium text-neutral-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-neutral-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link to="/" className="mt-6 block text-center text-xs text-neutral-500 hover:text-neutral-300">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
