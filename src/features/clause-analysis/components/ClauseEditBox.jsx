import { useState } from 'react';

// Free-text area for manual clause rewrite with Save action (UC4-BR-015 /
// UC4-BR-017). Only rendered for roles allowed to edit (Legal Reviewer).
export default function ClauseEditBox({ clauseId, initialText, version, isSaving, onSave }) {
  const [text, setText] = useState(initialText || '');

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-neutral-400">Clause Edit Box</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onSave({ clauseId, clauseText: text, expectedVersion: version })}
        disabled={isSaving || !text.trim()}
        className="mt-2 rounded-md bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
