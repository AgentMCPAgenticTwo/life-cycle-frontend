// Renders the dashboard's status cards. Each card is clickable (UC1-BR-007 /
// UC1-FV-001): the group hands the parent a token identifying which card was
// clicked, and the parent (DashboardPage) resolves that into a Contract
// Repository navigation.

const STATUS_CARDS = [
  { token: 'total', label: 'Total Contracts', field: 'totalContractsCount', tone: 'neutral' },
  { token: 'Draft', label: 'In Draft', field: 'inDraftCount', tone: 'neutral' },
  { token: 'In Negotiation', label: 'In Negotiation', field: 'inNegotiationCount', tone: 'neutral' },
  { token: 'Pending Approval', label: 'Pending Approval', field: 'pendingApprovalCount', tone: 'amber' },
  { token: 'Pending Signature', label: 'Pending Signature', field: 'pendingSignatureCount', tone: 'neutral' },
  { token: 'Executed', label: 'Executed', field: 'executedCount', tone: 'emerald' },
];

const EXPIRING_CARDS = [
  { token: 'expiring30', label: 'Expiring in 30 Days', field: 'expiring30DaysCount' },
  { token: 'expiring60', label: 'Expiring in 60 Days', field: 'expiring60DaysCount' },
  { token: 'expiring90', label: 'Expiring in 90 Days', field: 'expiring90DaysCount' },
];

const TONE_STYLES = {
  neutral: 'text-neutral-100',
  amber: 'text-amber-400',
  emerald: 'text-emerald-400',
};

function Card({ label, value, tone, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-1 flex-col items-start rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-4 text-left transition-colors hover:border-neutral-600"
    >
      <span className={`text-2xl font-semibold tabular-nums ${TONE_STYLES[tone] ?? TONE_STYLES.neutral}`}>
        {value ?? 0}
      </span>
      <span className="mt-1 text-xs text-neutral-400">{label}</span>
    </button>
  );
}

export default function StatusCardGroup({ summary, onCardClick }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {STATUS_CARDS.map(({ token, label, field, tone }) => (
          <Card
            key={token}
            label={label}
            value={summary?.[field]}
            tone={tone}
            onClick={() => onCardClick(token)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {EXPIRING_CARDS.map(({ token, label, field }) => (
          <Card key={token} label={label} value={summary?.[field]} tone="neutral" onClick={() => onCardClick(token)} />
        ))}
      </div>
    </div>
  );
}
