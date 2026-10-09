import { useState } from 'react';
import { useAskAI } from '@/features/clause-analysis/hooks/useAskAI';

// Free-text question input with Ask button and AI Answer Display carrying the
// verification disclaimer (UC4-BR-008 / UC4-AF-005).
export default function AskAIBox({ contractId, disabled }) {
  const [question, setQuestion] = useState('');
  const [validationError, setValidationError] = useState(null);
  const { ask, answer, isLoading, error } = useAskAI(contractId);

  function handleAsk() {
    if (!question.trim()) {
      setValidationError('Please enter a question before submitting.');
      return;
    }
    setValidationError(null);
    ask(question.trim());
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="text-base font-semibold text-neutral-100">Ask AI about this Contract</h2>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={disabled}
          placeholder="e.g. What happens if Horizon…"
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleAsk}
          disabled={disabled || isLoading}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ➤ {isLoading ? 'Asking…' : 'Ask'}
        </button>
      </div>

      {validationError && <p className="mt-2 text-xs text-red-400">{validationError}</p>}
      {error && <p className="mt-2 text-xs text-red-400">{error.message}</p>}

      {answer && (
        <div className="mt-4 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-3">
          <p className="text-xs font-medium text-neutral-400">AI Answer</p>
          <p className="mt-1 text-sm text-neutral-200">{answer.answer}</p>
          <p className="mt-2 text-xs italic text-amber-400">
            {answer.disclaimer || 'AI suggestion only — verify before relying on this answer.'}
          </p>
        </div>
      )}
    </div>
  );
}
