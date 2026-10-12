import { useState } from 'react';
import { useFolderTagOptions } from '@/features/contract-repository/hooks/useFolderTagOptions';
import { useAssignFolderTag } from '@/features/contract-repository/hooks/useAssignFolderTag';

/**
 * Dialog to assign one or more folders/tags to a contract (UC8-FV-004).
 */
export default function AddFolderTagDialog({ contractId, onClose, onConfirm }) {
  const { data: options, isLoading } = useFolderTagOptions();
  const { assign, isSaving, error } = useAssignFolderTag(contractId);
  const [selectedIds, setSelectedIds] = useState([]);

  function toggle(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleConfirm() {
    const folderTags = await assign(selectedIds);
    onConfirm?.(folderTags);
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div role="dialog" aria-modal="true" aria-label="Add Folder/Tag" className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
        <h2 className="text-sm font-semibold text-neutral-100">Add Folder/Tag</h2>
        <p className="mt-0.5 text-xs text-neutral-500">Select folders or tags to assign to this contract.</p>

        <div className="mt-4 max-h-64 space-y-1 overflow-y-auto">
          {isLoading && <p className="text-sm text-neutral-500">Loading options…</p>}
          {!isLoading && options.length === 0 && (
            <p className="text-sm text-neutral-500">No folders or tags are available.</p>
          )}
          {!isLoading &&
            options.map((option) => (
              <label key={option.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800/60">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => toggle(option.id)}
                  className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-emerald-500"
                />
                <span>{option.name}</span>
                <span className="ml-auto text-xs text-neutral-500">{option.kind}</span>
              </label>
            ))}
        </div>

        {error && <p className="mt-3 text-xs text-red-400">Unable to save folder/tag changes. Please try again.</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving || selectedIds.length === 0}
            className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
