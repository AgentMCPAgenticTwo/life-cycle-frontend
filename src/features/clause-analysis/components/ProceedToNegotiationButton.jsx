// Button enabled only when all mandatory clauses are resolved; routes the
// contract to UC5 (UC4-AF-006 / UC4-BR-005).
export default function ProceedToNegotiationButton({ enabled, isLoading, onProceed }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onProceed}
        disabled={!enabled || isLoading}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/30 disabled:text-neutral-400"
      >
        ➔ {isLoading ? 'Routing…' : 'Proceed to Negotiation'}
      </button>
      {!enabled && (
        <p className="text-[11px] text-neutral-500">
          Resolve all mandatory clauses before proceeding.
        </p>
      )}
    </div>
  );
}
