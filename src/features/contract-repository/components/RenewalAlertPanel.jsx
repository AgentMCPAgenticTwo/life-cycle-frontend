import { formatDate } from '@/features/contract-repository/utils/format';
import RenewAmendTerminateButtons from '@/features/contract-repository/components/RenewAmendTerminateButtons';

/**
 * Renewal Alert Banner, Contract End Date, Notice Period, and the
 * Renew/Amend/Terminate buttons (UC9-BR-003, UC9-BR-004, UC9-FV-002,
 * UC9-GC-001).
 */
export default function RenewalAlertPanel({ renewal, onRenew, onAmend, onTerminate }) {
  if (!renewal) return null;

  return (
    <section className="rounded-xl bg-gradient-to-r from-sky-800 via-sky-700 to-sky-600 p-5 text-neutral-50">
      {renewal.renewalAlertBanner && <p className="text-sm font-semibold">{renewal.renewalAlertBanner}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-black/15 px-3 py-1 text-xs font-medium">
          Contract End Date: {formatDate(renewal.contractEndDate)}
        </span>
        <span className="rounded-full bg-black/15 px-3 py-1 text-xs font-medium">
          Notice Period: {renewal.noticePeriod || '—'}
        </span>
      </div>
      <div className="mt-4">
        <RenewAmendTerminateButtons
          renewEnabled={renewal.renewEnabled}
          amendEnabled={renewal.amendEnabled}
          terminateEnabled={renewal.terminateEnabled}
          actionInProgress={renewal.actionInProgress}
          onRenew={onRenew}
          onAmend={onAmend}
          onTerminate={onTerminate}
        />
      </div>
    </section>
  );
}
