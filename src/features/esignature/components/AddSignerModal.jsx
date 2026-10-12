import { useState } from 'react';

const SIGNER_TYPES = ['Internal', 'External'];
const SIGNATURE_METHODS = ['In-built E-signature', 'DocuSign', 'Adobe Sign', 'Aadhaar eSign'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Add Signer form: Signer Name, Signer Email, Signer Type, Signing Order and
 * Signature Method are all mandatory (UC7-FV-001). Reminder Frequency is
 * tenant-configured (UC7-BR-013) and shown read-only here — AddSignerRequest
 * does not declare a per-signer reminderFrequencyDays field, so it is never
 * submitted (see CLAUDE.md "Request bodies must carry every field the
 * contract declares").
 *
 * Named AddSignerModal per the module contract; rendered inline next to the
 * Signer List to match the target design, not as an overlay.
 */
export default function AddSignerModal({ contractId: _contractId, onAdd, disabled, isSubmitting, error, defaultReminderFrequencyDays }) {
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerType, setSignerType] = useState(SIGNER_TYPES[0]);
  const [signingOrder, setSigningOrder] = useState('');
  const [signatureMethod, setSignatureMethod] = useState(SIGNATURE_METHODS[0]);
  const [formError, setFormError] = useState(null);

  function resetForm() {
    setSignerName('');
    setSignerEmail('');
    setSignerType(SIGNER_TYPES[0]);
    setSigningOrder('');
    setSignatureMethod(SIGNATURE_METHODS[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = signerName.trim();
    const trimmedEmail = signerEmail.trim();
    const order = Number(signingOrder);

    if (!trimmedName || !trimmedEmail || !signerType || !signingOrder.trim() || !signatureMethod) {
      setFormError('Signer Name, Signer Email, Signer Type, Signing Order and Signature Method are all mandatory.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFormError('Enter a valid Signer Email address.');
      return;
    }
    if (!Number.isInteger(order) || order < 1) {
      setFormError('Signing Order must be a whole number starting at 1.');
      return;
    }

    onAdd({
      signerName: trimmedName,
      signerEmail: trimmedEmail,
      signerType,
      signingOrder: order,
      signatureMethod,
    })
      .then(() => resetForm())
      .catch(() => {
        // Surfaced via the `error` prop from the caller's mutation state.
      });
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-sm font-semibold text-neutral-100">Add Signer</h2>
      <p className="mt-1 text-xs text-neutral-500">Step 2 — enter signer details then add to the list</p>

      {disabled && (
        <p role="alert" className="mt-4 rounded-md border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          The Signer List is locked because a signer has already signed. Adding new signers is no longer possible.
        </p>
      )}

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signer-name" className="text-sm font-medium text-neutral-200">
            Signer Name*
          </label>
          <input
            id="signer-name"
            type="text"
            placeholder="e.g. Rohan Mehta"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-neutral-500">Full name of internal or external signer</p>
        </div>

        <div>
          <label htmlFor="signer-email" className="text-sm font-medium text-neutral-200">
            Signer Email*
          </label>
          <input
            id="signer-email"
            type="email"
            placeholder="rohan.mehta@vendorco.com"
            value={signerEmail}
            onChange={(e) => setSignerEmail(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-neutral-500">Valid email address</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="signer-type" className="text-sm font-medium text-neutral-200">
              Signer Type*
            </label>
            <select
              id="signer-type"
              value={signerType}
              onChange={(e) => setSignerType(e.target.value)}
              disabled={disabled}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
            >
              {SIGNER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">Internal, External</p>
          </div>

          <div>
            <label htmlFor="signing-order" className="text-sm font-medium text-neutral-200">
              Signing Order*
            </label>
            <input
              id="signing-order"
              type="number"
              min={1}
              step={1}
              value={signingOrder}
              onChange={(e) => setSigningOrder(e.target.value)}
              disabled={disabled}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-neutral-500">Sequence number starting at 1</p>
          </div>
        </div>

        <div>
          <label htmlFor="signature-method" className="text-sm font-medium text-neutral-200">
            Signature Method*
          </label>
          <select
            id="signature-method"
            value={signatureMethod}
            onChange={(e) => setSignatureMethod(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
          >
            {SIGNATURE_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral-500">In-built E-signature, DocuSign, Adobe Sign, Aadhaar eSign</p>
        </div>

        <div>
          <label htmlFor="reminder-frequency" className="text-sm font-medium text-neutral-200">
            Reminder Frequency (days)
          </label>
          <input
            id="reminder-frequency"
            type="text"
            value={defaultReminderFrequencyDays ?? 3}
            disabled
            readOnly
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-400 opacity-70"
          />
          <p className="mt-1 text-xs text-neutral-500">Set by Tenant Admin, default 3</p>
        </div>

        {formError && (
          <p role="alert" className="text-xs text-red-300">
            {formError}
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Adding…' : 'Add Signer'}
        </button>
      </form>
    </div>
  );
}
