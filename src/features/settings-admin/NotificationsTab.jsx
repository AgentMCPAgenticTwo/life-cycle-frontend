/**
 * Event list with Email/In-App toggles (UC11-FV-004 / UC11-BR-007). Both
 * toggles default On until a Tenant Admin explicitly turns one off; toggling
 * one never affects the other.
 */
export default function NotificationsTab({
  events,
  isLoading,
  error,
  onRetry,
  onToggle,
  pendingEventName,
  updateError,
}) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-100">Notifications</h2>
        <p className="mt-1 text-xs text-neutral-500">Email and in-app alerts for contract status changes</p>
      </div>

      <div className="mt-5">
        {updateError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {updateError}
          </div>
        )}

        {isLoading &&<p className="text-sm text-neutral-500">Loading notification settings…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error.message || 'Unable to load notification settings.'}
            {onRetry && (
              <button type="button" onClick={onRetry} className="ml-3 font-medium text-red-200 underline">
                Retry
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && (!events || events.length === 0) && (
          <p className="text-sm text-neutral-500">No notification events configured.</p>
        )}

        {!isLoading && !error && events && events.length > 0 && (
          <ul className="divide-y divide-neutral-800/60">
            {events.map((event) => {
              const isPending = pendingEventName === event.eventName;
              return (
                <li key={event.eventName} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      🔔
                    </span>
                    <p className="text-sm font-medium text-neutral-100">{event.eventName}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-300">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={event.emailToggle}
                        disabled={isPending}
                        onChange={(e) => onToggle(event.eventName, { emailToggle: e.target.checked })}
                        className="h-4 w-4 rounded border-neutral-600 bg-neutral-950 accent-emerald-500"
                      />
                      Email
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={event.inAppToggle}
                        disabled={isPending}
                        onChange={(e) => onToggle(event.eventName, { inAppToggle: e.target.checked })}
                        className="h-4 w-4 rounded border-neutral-600 bg-neutral-950 accent-emerald-500"
                      />
                      In-App
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
