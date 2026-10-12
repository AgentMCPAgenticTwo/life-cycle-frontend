/**
 * Triggers Send for Signature; disabled until at least one signer exists
 * (UC7-BR-002 / UC7-BR-015). Surfaces the integrated-provider connection
 * failure message verbatim per UC7-AF-005 when sendForSignature responds
 * with contractStatus "SignatureConnectionFailed".
 */
export default function SendForSignatureButton({ enabled, onSend, isLoading, connectionError, variant = 'primary' }) {
  const classes =
    variant === 'compact'
      ? 'rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50'
      : 'rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div>
      <button type="button" onClick={onSend} disabled={!enabled || isLoading} className={classes}>
        {isLoading ? 'Sending…' : 'Send for Signature'}
      </button>
      {!enabled && !connectionError && (
        <p className="mt-1.5 text-xs text-neutral-500">Enabled once at least one signer has been added</p>
      )}
      {connectionError && (
        <p role="alert" className="mt-1.5 max-w-sm text-xs text-red-300">
          {connectionError}
        </p>
      )}
    </div>
  );
}
