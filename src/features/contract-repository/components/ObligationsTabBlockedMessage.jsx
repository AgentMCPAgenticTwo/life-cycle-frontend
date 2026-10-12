/**
 * Shown instead of the Obligations & Renewal tab for a contract whose Status
 * has not yet reached Executed (UC9-AF-002). None of the obligation, renewal
 * or termination data points are rendered alongside this message.
 */
export default function ObligationsTabBlockedMessage() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
      <div role="status" className="max-w-md rounded-xl border border-neutral-800 bg-neutral-900/60 px-8 py-10 text-center">
        <p className="text-sm font-medium text-neutral-200">
          Obligations are available only after a contract is fully executed
        </p>
      </div>
    </div>
  );
}
