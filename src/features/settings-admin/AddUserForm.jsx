import { useState } from 'react';
import { generateStrongPassword, isPasswordStrongEnough, PASSWORD_RULE_MESSAGE } from '@/shared/utils/password';

const ROLE_OPTIONS = ['Tenant Admin', 'Legal Reviewer', 'Contract Owner', 'Approver', 'External Party', 'Signer'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MISSING_FIELDS_MESSAGE = 'Please complete all required fields';

/**
 * Add User form (UC11-MF-001 / UC11-FV-001). Validates User Name, User Email
 * (format + mandatory) and User Role client-side before calling onSubmit;
 * server-side duplicate-email rejection (UC11-AF-002 / UC11-BR-002) is
 * surfaced via the `error` prop rather than re-derived here. Initial Password
 * is optional — leaving it empty has the backend auto-generate one.
 */
export default function AddUserForm({ onSubmit, onCancel, isSubmitting = false, error = null }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const nextErrors = {};
    if (!trimmedName) nextErrors.name = true;
    if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) nextErrors.email = true;
    if (!role) nextErrors.role = true;
    if (initialPassword && !isPasswordStrongEnough(initialPassword)) nextErrors.initialPassword = true;

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    onSubmit({
      name: trimmedName,
      email: trimmedEmail,
      role,
      ...(initialPassword ? { initialPassword } : {}),
    });
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-neutral-800 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-100">New user details</h2>
            <p className="mt-1 text-xs text-neutral-500">All fields are required to create the account</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label htmlFor="add-user-name" className="text-sm font-medium text-neutral-200">
              User Name <span className="text-red-400">*</span>
            </label>
            <input
              id="add-user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className={`mt-1 w-full rounded-md border bg-neutral-950 px-3 py-2 text-sm text-neutral-100 ${
                fieldErrors.name ? 'border-red-500' : 'border-neutral-700'
              }`}
            />
            <p className="mt-1 text-xs text-neutral-500">Full name of user</p>
          </div>

          <div>
            <label htmlFor="add-user-email" className="text-sm font-medium text-neutral-200">
              User Email <span className="text-red-400">*</span>
            </label>
            <input
              id="add-user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className={`mt-1 w-full rounded-md border bg-neutral-950 px-3 py-2 text-sm text-neutral-100 ${
                fieldErrors.email ? 'border-red-500' : 'border-neutral-700'
              }`}
            />
            <p className="mt-1 text-xs text-neutral-500">Must be unique within tenant — email format required</p>
          </div>

          <div>
            <label htmlFor="add-user-role" className="text-sm font-medium text-neutral-200">
              User Role <span className="text-red-400">*</span>
            </label>
            <select
              id="add-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSubmitting}
              className={`mt-1 w-full rounded-md border bg-neutral-950 px-3 py-2 text-sm text-neutral-100 ${
                fieldErrors.role ? 'border-red-500' : 'border-neutral-700'
              }`}
            >
              <option value="">Select a role</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">{ROLE_OPTIONS.join(', ')}</p>
          </div>

          <div>
            <label htmlFor="add-user-initial-password" className="text-sm font-medium text-neutral-200">
              Initial Password
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="add-user-initial-password"
                type={showPassword ? 'text' : 'password'}
                value={initialPassword}
                onChange={(e) => setInitialPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="Leave empty to auto-generate"
                className={`w-full rounded-md border bg-neutral-950 px-3 py-2 text-sm text-neutral-100 ${
                  fieldErrors.initialPassword ? 'border-red-500' : 'border-neutral-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isSubmitting}
                className="shrink-0 rounded-md border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-neutral-500"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setInitialPassword(generateStrongPassword());
                  setShowPassword(true);
                }}
                disabled={isSubmitting}
                className="shrink-0 rounded-md border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-neutral-500"
              >
                Generate
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">{PASSWORD_RULE_MESSAGE}</p>
            {fieldErrors.initialPassword && (
              <p role="alert" className="mt-1 text-xs text-red-300">
                {PASSWORD_RULE_MESSAGE}
              </p>
            )}
          </div>

          {hasFieldErrors && (
            <p role="alert" className="text-xs text-red-300">
              {MISSING_FIELDS_MESSAGE}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
