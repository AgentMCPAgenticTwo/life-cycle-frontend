// Red 'Mandatory clause missing' badge shown when a mandatory clause category
// is missing from the document (UC4-BR-002 / UC4-BR-005). Deviated or
// Non-standard mandatory clauses are present in the document, so they must
// NOT show this badge (UC4-BR-003, UC4-BR-004).
export default function MandatoryClauseFlagBadge({ isMandatory, status }) {
  if (!isMandatory || status !== 'Missing') return null;
  return (
    <span className="inline-flex items-center rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400">
      Mandatory clause missing
    </span>
  );
}
