import { useState } from 'react';

/**
 * Shows a just-issued temporary password exactly once — after create or
 * reset-password, the backend never returns it again, so this is the admin's
 * only chance to copy it before closing.
 */
export default function TemporaryPasswordModal({ userName, temporaryPassword, onClose }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="border-b border-neutral-800 px-6 py-4">
          <h2 className="text-base font-semibold text-neutral-100">Temporary password</h2>
          <p className="mt-1 text-xs text-neutral-500">{userName}</p>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2">
            <code className="flex-1 select-all break-all text-sm text-neutral-100">{temporaryPassword}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-md border border-neutral-700 px-2.5 py-1 text-xs font-medium text-neutral-200 hover:border-neutral-500"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p role="alert" className="rounded-md border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            User must change this password at first login
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
