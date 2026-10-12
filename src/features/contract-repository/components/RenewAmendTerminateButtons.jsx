/**
 * Renew, Amend and Terminate action buttons with enablement rules and
 * duplicate-action blocking (UC9-BR-004, UC9-BR-008, UC9-AF-005).
 */
export default function RenewAmendTerminateButtons({
  renewEnabled,
  amendEnabled,
  terminateEnabled,
  actionInProgress,
  onRenew,
  onAmend,
  onTerminate,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {actionInProgress && (
        <p className="w-full text-xs font-medium text-amber-400">
          A renewal action is already in progress for this contract.
        </p>
      )}
      <button
        type="button"
        onClick={onAmend}
        disabled={!amendEnabled || actionInProgress}
        className="rounded-md border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Amend
      </button>
      <button
        type="button"
        onClick={onTerminate}
        disabled={!terminateEnabled || actionInProgress}
        className="rounded-md border border-red-700/60 bg-red-900/20 px-3 py-2 text-xs font-medium text-red-300 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Terminate
      </button>
      <button
        type="button"
        onClick={onRenew}
        disabled={!renewEnabled || actionInProgress}
        className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Renew
      </button>
    </div>
  );
}
