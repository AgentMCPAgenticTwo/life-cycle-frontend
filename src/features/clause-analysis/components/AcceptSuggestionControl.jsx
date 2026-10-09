// One-click Accept Suggestion button that replaces clause text with the AI
// Suggested Text (UC4-BR-014). Disabled when there is no suggestion to accept
// or the clause is Missing (blocked per UC4-BR-017 until replaced with text).
export default function AcceptSuggestionControl({ clauseId, suggestedText, disabled, isLoading, onAccept }) {
  if (!suggestedText) return null;
  return (
    <button
      type="button"
      onClick={() => onAccept(clauseId)}
      disabled={disabled || isLoading}
      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      ✓ {isLoading ? 'Accepting…' : 'Accept Suggestion'}
    </button>
  );
}
