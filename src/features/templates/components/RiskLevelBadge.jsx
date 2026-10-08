// Colour-codes a clause's Risk Level: green/amber/red for Low/Medium/High
// (UC3-BR-005).
const RISK_STYLES = {
  Low: 'bg-emerald-500/20 text-emerald-400',
  Medium: 'bg-amber-500/20 text-amber-400',
  High: 'bg-red-500/20 text-red-400',
};

export default function RiskLevelBadge({ riskLevel }) {
  const className = RISK_STYLES[riskLevel] ?? 'bg-neutral-700/60 text-neutral-300';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {riskLevel || '—'}
    </span>
  );
}
