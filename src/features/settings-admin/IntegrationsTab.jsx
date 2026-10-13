import { useState } from 'react';
import IntegrationConnectForm from '@/features/settings-admin/IntegrationConnectForm';

const CONNECTED_STYLE = 'border-emerald-600/40 bg-emerald-500/10 text-emerald-300';
const DISCONNECTED_STYLE = 'border-neutral-700 bg-neutral-800/60 text-neutral-400';

function statusBadgeClass(status) {
  return status === 'Connected' ? CONNECTED_STYLE : DISCONNECTED_STYLE;
}

/**
 * Integration cards with Connect/Disconnect actions (UC11-FV-003 / UC11-BR-016
 * / UC11-BR-017). Credentials are only ever collected through
 * IntegrationConnectForm, which masks input; this component never renders a
 * plain-text credential (UC11-BR-009).
 */
export default function IntegrationsTab({
  integrations,
  isLoading,
  error,
  onRetry,
  onConnect,
  onDisconnect,
  pendingIntegrationName,
  connectError,
}) {
  const [connectTarget, setConnectTarget] = useState(null);

  async function handleSubmitCredentials(credentials) {
    await onConnect(connectTarget, { credentials });
    setConnectTarget(null);
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-100">Integrations</h2>
        <p className="mt-1 text-xs text-neutral-500">Connected systems feeding and receiving contract data</p>
      </div>

      <div className="mt-5">
        {isLoading && <p className="text-sm text-neutral-500">Loading integrations…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error.message || 'Unable to load integrations.'}
            {onRetry && (
              <button type="button" onClick={onRetry} className="ml-3 font-medium text-red-200 underline">
                Retry
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && (!integrations || integrations.length === 0) && (
          <p className="text-sm text-neutral-500">No integrations available.</p>
        )}

        {!isLoading && !error && integrations && integrations.length > 0 && (
          <ul className="divide-y divide-neutral-800/60">
            {integrations.map((integration) => {
              const isConnected = integration.connectionStatus === 'Connected';
              const isPending = pendingIntegrationName === integration.integrationName;
              return (
                <li key={integration.integrationName} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {isConnected ? '✓' : '✕'}
                    </span>
                    <p className="text-sm font-medium text-neutral-100">{integration.integrationName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(integration.connectionStatus)}`}>
                      {integration.connectionStatus}
                    </span>
                    {isConnected ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onDisconnect(integration.integrationName)}
                        className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setConnectTarget(integration.integrationName)}
                        className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {connectTarget && (
        <IntegrationConnectForm
          integrationName={connectTarget}
          onSubmit={handleSubmitCredentials}
          onClose={() => setConnectTarget(null)}
          isSubmitting={pendingIntegrationName === connectTarget}
          error={connectError}
        />
      )}
    </section>
  );
}
