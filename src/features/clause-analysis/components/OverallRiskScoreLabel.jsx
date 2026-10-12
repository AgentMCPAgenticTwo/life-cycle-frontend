// Displays the Overall Contract Risk Score derived from the highest individual
// clause risk score (UC4-BR-001). Rendered as a prominent banner matching the
// target design's blue gradient summary bar.
const RISK_COPY = {
  Low: 'Calculated as the highest individual clause risk score.',
  Medium: 'Calculated as the highest individual clause risk score — one clause is flagged Medium or higher.',
  High: 'Calculated as the highest individual clause risk score — one clause is flagged High.',
};

export default function OverallRiskScoreLabel({ riskScore, flags = [] }) {
  const label = riskScore || 'Low';
  return (
    <div className="rounded-xl bg-gradient-to-r from-sky-900/80 via-sky-800/70 to-indigo-900/70 p-5">
      <h2 className="text-lg font-semibold text-neutral-50">
        Overall Contract Risk Score: <span data-testid="overall-risk-score">{label}</span>
      </h2>
      <p className="mt-1 text-sm text-sky-100/80">{RISK_COPY[label] || RISK_COPY.Low}</p>
      {flags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {flags.map((flag) => (
            <span
              key={flag}
              className="inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-sky-50"
            >
              {flag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
