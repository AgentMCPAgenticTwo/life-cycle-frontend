import { useAuditCertificate } from '@/features/esignature/hooks/useAuditCertificate';

/**
 * Download Audit Certificate button, enabled only once the contract has
 * reached Executed status (UC7-BR-005 / UC7-BR-009 / UC7-FV-005).
 */
export default function AuditCertificateDownloadButton({ contractId, enabled, variant = 'primary' }) {
  const { mutate, isLoading, error } = useAuditCertificate(contractId);

  function handleDownload() {
    mutate()
      .then((response) => {
        if (response?.downloadUrl) {
          window.open(response.downloadUrl, '_blank', 'noopener,noreferrer');
        }
      })
      .catch(() => {
        // Surfaced below via `error`.
      });
  }

  const classes =
    variant === 'compact'
      ? 'rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-100 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50'
      : 'rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div>
      <button type="button" onClick={handleDownload} disabled={!enabled || isLoading} className={classes}>
        {isLoading ? 'Preparing…' : 'Download Audit Certificate'}
      </button>
      {!enabled && <p className="mt-1.5 text-xs text-neutral-500">Available once the contract is Executed</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-300">
          {error.message || 'Failed to download the audit certificate'}
        </p>
      )}
    </div>
  );
}
