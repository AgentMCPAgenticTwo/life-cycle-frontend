import { useState } from 'react';

const GENERIC_FAILURE_MESSAGE = 'Connection failed. Please check your credentials and try again';

/**
 * Credential-entry form for authorizing an integration connection (UC11-AF-004,
 * UC11-AF-007, UC11-BR-009, UC11-BR-016). Credential inputs are masked as they are
 * typed (BR-9) and a failure message is shown inline rather than clearing the form,
 * so the Tenant Admin can correct and retry without re-entering everything.
 *
 * The actual connect call (and any audit-log/status side effects) is owned by the
 * caller — this component only collects and validates credentials and reports the
 * outcome it is given, following the same controlled-modal pattern as
 * DelegateModal/TerminationReasonDialog elsewhere in this app.
 */
export default function IntegrationConnectForm({
  integrationName,
  onSubmit,
  onClose,
  isSubmitting = false,
  error = null,
}) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [fieldError, setFieldError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!apiKey.trim()) {
      setFieldError('API Key is required.');
      return;
    }
    setFieldError(null);
    onSubmit({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() || undefined });
  }

  const failureMessage = error ? error || GENERIC_FAILURE_MESSAGE : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl"
      >
        <div className="border-b border-neutral-800 px-6 py-4">
          <h2 className="text-base font-semibold text-neutral-100">
            Connect {integrationName}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Enter your {integrationName} credentials to authorize this integration.
          </p>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label htmlFor="integration-api-key" className="text-sm font-medium text-neutral-200">
              API Key <span className="text-red-400">*</span>
            </label>
            <input
              id="integration-api-key"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
            />
            <p className="mt-1 text-xs text-neutral-500">Credential is masked and never shown in plain text once saved.</p>
          </div>

          <div>
            <label htmlFor="integration-api-secret" className="text-sm font-medium text-neutral-200">
              API Secret
            </label>
            <input
              id="integration-api-secret"
              type="password"
              autoComplete="off"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
            />
            <p className="mt-1 text-xs text-neutral-500">Leave blank if not required for this integration.</p>
          </div>

          {fieldError && (
            <p role="alert" className="text-xs text-red-300">
              {fieldError}
            </p>
          )}
          {failureMessage && (
            <p role="alert" className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-300">
              {failureMessage}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
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
            {isSubmitting ? 'Connecting…' : 'Connect'}
          </button>
        </div>
      </form>
    </div>
  );
}
