import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEsignatureSettings } from '@/features/esignature/hooks/useEsignatureSettings';
import { useUpdateEsignatureSettings } from '@/features/esignature/hooks/useUpdateEsignatureSettings';
import { useAuth } from '@/shared/hooks/useAuth';

// GET/PUT /api/v1/esignature-settings are TENANT_ADMIN-only (see module
// contract); every other role is denied this screen outright.
const ALLOWED_ROLES = ['TENANT_ADMIN'];

const DEFAULT_REMINDER_FREQUENCY_DAYS = 3;

const SIGNATURE_PROVIDERS = ['In-built E-signature', 'DocuSign', 'Adobe Sign', 'Aadhaar eSign'];

export default function EsignatureSettingsPage() {
  const { role } = useAuth();
  const isAllowed = ALLOWED_ROLES.includes(role);

  const { data, isLoading, error, refetch } = useEsignatureSettings();
  const updateSettings = useUpdateEsignatureSettings();

  const [reminderFrequencyDays, setReminderFrequencyDays] = useState('');
  const [defaultSignatureProvider, setDefaultSignatureProvider] = useState(SIGNATURE_PROVIDERS[0]);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (data) {
      setReminderFrequencyDays(String(data.reminderFrequencyDays ?? DEFAULT_REMINDER_FREQUENCY_DAYS));
      setDefaultSignatureProvider(data.defaultSignatureProvider || SIGNATURE_PROVIDERS[0]);
    }
  }, [data]);

  function handleSave() {
    setFormError(null);
    setSuccessMessage(null);

    const trimmed = reminderFrequencyDays.trim();
    let request = { defaultSignatureProvider };

    if (trimmed !== '') {
      const parsed = Number(trimmed);
      if (!Number.isInteger(parsed)) {
        setFormError('Reminder Frequency (days) must be a whole number.');
        return;
      }
      request = { ...request, reminderFrequencyDays: parsed };
    }

    updateSettings
      .mutate(request)
      .then((response) => {
        setReminderFrequencyDays(String(response.reminderFrequencyDays ?? DEFAULT_REMINDER_FREQUENCY_DAYS));
        setDefaultSignatureProvider(response.defaultSignatureProvider || SIGNATURE_PROVIDERS[0]);
        setSuccessMessage('E-signature settings saved successfully');
      })
      .catch((err) => setFormError(err.message || 'Failed to save e-signature settings'));
  }

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
        <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-red-300">Access denied</h1>
          <p className="mt-2 text-sm text-red-200">You do not have permission to access this screen.</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Settings / Admin</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">E-signature Settings</span>
        </nav>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">E-signature Settings</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Configure the tenant-wide reminder frequency and default signature provider applied to every contract's
              signer list
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateSettings.isLoading || isLoading}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateSettings.isLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        {successMessage && (
          <div role="status" className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {formError && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {formError}
          </div>
        )}

        {isLoading && <p className="text-sm text-neutral-500">Loading e-signature settings…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <p>{error.message || 'Failed to load e-signature settings'}</p>
            <button type="button" onClick={refetch} className="mt-2 font-medium text-red-200 underline">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <div className="max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex flex-col gap-6">
              <div>
                <label htmlFor="reminder-frequency" className="block text-sm font-medium text-neutral-200">
                  Reminder Frequency (days)
                </label>
                <input
                  id="reminder-frequency"
                  type="number"
                  step={1}
                  value={reminderFrequencyDays}
                  onChange={(e) => setReminderFrequencyDays(e.target.value)}
                  placeholder={String(DEFAULT_REMINDER_FREQUENCY_DAYS)}
                  className="mt-1.5 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-neutral-500">
                  Optional, whole number. Set by Tenant Admin, default {DEFAULT_REMINDER_FREQUENCY_DAYS}. Signers whose
                  status remains Sent or Viewed beyond this window are sent an automatic reminder email.
                </p>
              </div>

              <div>
                <label htmlFor="default-signature-provider" className="block text-sm font-medium text-neutral-200">
                  Default Signature Provider
                </label>
                <select
                  id="default-signature-provider"
                  value={defaultSignatureProvider}
                  onChange={(e) => setDefaultSignatureProvider(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
                >
                  {SIGNATURE_PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-neutral-500">
                  Applied tenant-wide as the default Signature Method for new signers.
                </p>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-neutral-500">
                These settings are independent of any specific contract's Signer List. Editing an individual
                contract's signers, Signature Pad, or OTP flow is restricted to the Contract Owner and Signer roles.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
