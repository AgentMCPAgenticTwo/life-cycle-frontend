import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { isPasswordStrongEnough, PASSWORD_RULE_MESSAGE } from '@/shared/utils/password';

/**
 * Forced interstitial for a user whose account has mustChangePassword set
 * (first login after an admin-assigned temporary password). ProtectedRoute
 * redirects here and will not let the user reach any other page until this
 * succeeds.
 */
export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!currentPassword) nextErrors.currentPassword = 'Enter your current password.';
    if (!isPasswordStrongEnough(newPassword)) nextErrors.newPassword = PASSWORD_RULE_MESSAGE;
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Unable to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900/60 px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Change your password</h1>
        <p className="mt-1 text-sm text-neutral-500">
          You must set a new password before continuing.
        </p>

        {formError && (
          <div role="alert" className="mt-4 rounded-md border border-red-600/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {formError}
          </div>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="current-password" className="text-xs font-medium text-neutral-400">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
            />
            {fieldErrors.currentPassword && (
              <p role="alert" className="mt-1 text-xs text-red-300">
                {fieldErrors.currentPassword}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="new-password" className="text-xs font-medium text-neutral-400">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
            />
            {fieldErrors.newPassword && (
              <p role="alert" className="mt-1 text-xs text-red-300">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-xs font-medium text-neutral-400">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500"
            />
            {fieldErrors.confirmPassword && (
              <p role="alert" className="mt-1 text-xs text-red-300">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}
