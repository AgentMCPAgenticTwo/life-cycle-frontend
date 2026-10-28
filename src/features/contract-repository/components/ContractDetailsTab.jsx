import StatusBadge from '@/features/contract-repository/components/StatusBadge';
import { formatCurrency, formatDate } from '@/features/contract-repository/utils/format';

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800/70 py-3 text-sm last:border-b-0">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-100">{value}</span>
    </div>
  );
}

/**
 * Shows core contract metadata (Details tab), read from the contract detail
 * response returned by `GET /api/v1/contracts/{contractId}`.
 */
export default function ContractDetailsTab({ contract }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h2 className="text-sm font-semibold text-neutral-100">Contract Details</h2>
      <p className="mt-0.5 text-xs text-neutral-500">Core metadata for this agreement</p>
      <div className="mt-4">
        <DetailRow label="Contract ID" value={contract.id} />
        <DetailRow label="Contract Type" value={contract.contractType ?? '—'} />
        <DetailRow label="Counterparty" value={contract.counterpartyName ?? '—'} />
        <DetailRow label="Status" value={<StatusBadge status={contract.status} />} />
        <DetailRow label="Effective Date" value={formatDate(contract.startDate)} />
        <DetailRow label="Expiry Date" value={formatDate(contract.endDate)} />
        <DetailRow
          label="Contract Value"
          value={formatCurrency(contract.contractValue, contract.currency)}
        />
        <DetailRow label="Owner" value={contract.contractOwnerName ?? '—'} />
      </div>
    </section>
  );
}
