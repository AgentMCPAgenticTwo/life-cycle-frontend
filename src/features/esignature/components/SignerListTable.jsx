const STATUS_STYLES = {
  Sent: 'bg-neutral-700/60 text-neutral-200',
  Viewed: 'bg-amber-500/15 text-amber-300',
  Signed: 'bg-emerald-500/15 text-emerald-300',
  Declined: 'bg-red-500/15 text-red-300',
  Expired: 'bg-neutral-700/60 text-neutral-400',
};

function StatusBadge({ status, contractSent }) {
  // A signer whose link has not gone out yet is "Pending" — before Send for
  // Signature, or while waiting for an earlier signer in the order. Show it as
  // "Not Sent"; Sent/Viewed/Signed/Declined are shown per signer as they are.
  const label = status === 'Pending' || (!contractSent && status === 'Sent') ? 'Not Sent' : status;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES.Sent}`}>
      {label}
    </span>
  );
}

function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Grid of a contract's signers: Signer Name, Signer Email, Signer Type,
 * Signing Order, Signature Method, Reminder Frequency and Signer Status for
 * every row (UC7-GC-001 / UC7-BR-012 / UC7-FV-005).
 */
export default function SignerListTable({ signers, contractSent }) {
  if (!signers || signers.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-neutral-500">
        No signers have been added yet. Use Add Signer to start the signing sequence.
      </p>
    );
  }

  const sorted = [...signers].sort((a, b) => a.signingOrder - b.signingOrder);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
            <th className="px-5 py-3 font-medium">Order</th>
            <th className="px-5 py-3 font-medium">Signer Name</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Method</th>
            <th className="px-5 py-3 font-medium">Reminder (days)</th>
            <th className="px-5 py-3 font-medium">Signer Status</th>
            <th className="px-5 py-3 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((signer) => (
            <tr key={signer.id} className="border-b border-neutral-800/60 last:border-0">
              <td className="px-5 py-3 text-neutral-300">{signer.signingOrder}</td>
              <td className="px-5 py-3 font-medium text-neutral-100">{signer.signerName}</td>
              <td className="px-5 py-3 text-neutral-400">{signer.signerEmail}</td>
              <td className="px-5 py-3 text-neutral-400">{signer.signerType}</td>
              <td className="px-5 py-3 text-neutral-400">{signer.signatureMethod}</td>
              <td className="px-5 py-3 text-neutral-400">{signer.reminderFrequencyDays ?? '—'}</td>
              <td className="px-5 py-3">
                <StatusBadge status={signer.signerStatus} contractSent={contractSent} />
              </td>
              <td className="px-5 py-3 text-neutral-500">{formatTimestamp(signer.signedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
