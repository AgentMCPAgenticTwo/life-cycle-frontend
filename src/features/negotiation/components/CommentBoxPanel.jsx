import { useState } from 'react';
import { useAddComment } from '@/features/negotiation/hooks/useAddComment';
import { useNegotiationStore } from '@/store/negotiationSlice';

/**
 * Free-text comment entry tied to a clause and the current negotiation version
 * (UC5-BR-011, UC5-BR-014, UC5-BR-015, UC5-FV-001, UC5-FV-003).
 */
export default function CommentBoxPanel({ contractId, clauseId }) {
  const { mutate, isLoading, error } = useAddComment(contractId);
  const addCommentToStore = useNegotiationStore((s) => s.addComment);
  const [commentText, setCommentText] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSaved(false);
    try {
      const comment = await mutate({ clauseId, commentText });
      addCommentToStore(comment);
      setCommentText('');
      setSaved(true);
    } catch {
      // error state rendered below
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-100">Add Comment</h2>
        <span className="text-xs text-neutral-500">Attach a note to the current clause under review</span>
      </div>
      <label htmlFor="comment-box" className="mt-3 block text-xs text-neutral-400">
        Comment Box
      </label>
      <textarea
        id="comment-box"
        rows={4}
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="e.g. Please confirm liability cap aligns with Schedule 3"
        className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
      />
      <p className="mt-1 text-[11px] text-neutral-500">Free text comment per clause</p>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error.message}
        </p>
      )}
      {saved && (
        <p role="status" className="mt-2 text-xs text-emerald-300">
          Comment saved.
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !commentText.trim()}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Saving…' : 'Add Comment'}
        </button>
      </div>
    </form>
  );
}
