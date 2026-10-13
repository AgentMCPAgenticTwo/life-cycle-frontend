import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContractDetail } from '@/features/contract-repository/hooks/useContractDetail';
import { useObligations } from '@/features/contract-repository/hooks/useObligations';
import { useRenewalPanel } from '@/features/contract-repository/hooks/useRenewalPanel';
import { useRenewContract } from '@/features/contract-repository/hooks/useRenewContract';
import { useAmendContract } from '@/features/contract-repository/hooks/useAmendContract';
import { useObligationsStore } from '@/store/obligationsSlice';
import ObligationsAccessDeniedView from '@/features/contract-repository/components/ObligationsAccessDeniedView';
import ObligationsTabBlockedMessage from '@/features/contract-repository/components/ObligationsTabBlockedMessage';
import ObligationsEmptyState from '@/features/contract-repository/components/ObligationsEmptyState';
import ObligationsTable from '@/features/contract-repository/components/ObligationsTable';
import ManualObligationForm from '@/features/contract-repository/components/ManualObligationForm';
import RenewalAlertPanel from '@/features/contract-repository/components/RenewalAlertPanel';
import RenewAmendTerminateButtons from '@/features/contract-repository/components/RenewAmendTerminateButtons';
import TerminationReasonDialog from '@/features/contract-repository/components/TerminationReasonDialog';
import { HttpError } from '@/services/http';
import { useAuth } from '@/shared/hooks/useAuth';

// GET_contract_obligations / GET_contract_renewal only allow these roles
// (UC9-BR-012 blocks Approver, External Party and Signer outright).
const ALLOWED_ROLES = ['TENANT_ADMIN', 'CONTRACT_OWNER', 'LEGAL_REVIEWER'];
// Only Legal Reviewer views this screen read-only (UC9-BR-011); Tenant Admin
// and Contract Owner may edit, accept and action obligations/renewal (BR-009/010).
const READ_ONLY_ROLES = ['LEGAL_REVIEWER'];
// Obligations/renewal data only exists once the contract has left the pre-signature
// states; the documented status enum also includes 'Active', seen in the design,
// alongside the standard lifecycle states.
const EXECUTED_STATUSES = ['Executed', 'Active', 'Renewed', 'Amended'];

export default function ObligationsRenewalPage() {
  const { contractId } = useParams();
  const { data: contract, isLoading: isContractLoading, error: contractError } = useContractDetail(contractId);
  const { isLoading: isObligationsLoading, error: obligationsError, refetch: refetchObligations } =
    useObligations(contractId);
  const { isLoading: isRenewalLoading, error: renewalError, refetch: refetchRenewal } = useRenewalPanel(contractId);
  const obligations = useObligationsStore((state) => state.obligations);
  const renewal = useObligationsStore((state) => state.renewal);
  const { renew, isSaving: isRenewing } = useRenewContract(contractId);
  const { amend, isSaving: isAmending } = useAmendContract(contractId);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);

  const { role } = useAuth();
  const readOnly = READ_ONLY_ROLES.includes(role);

  if (!ALLOWED_ROLES.includes(role)) {
    return <ObligationsAccessDeniedView />;
  }

  const accessDeniedError = [contractError, obligationsError, renewalError].find(
    (err) => err instanceof HttpError && (err.status === 401 || err.status === 403)
  );
  if (accessDeniedError) {
    return <ObligationsAccessDeniedView />;
  }

  if (isContractLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-500">
        Loading contract…
      </div>
    );
  }

  if (contractError || !contract) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-100">
        <p className="text-sm text-red-400">Unable to load this contract. Please try again.</p>
      </div>
    );
  }

  if (!EXECUTED_STATUSES.includes(contract.status)) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <ObligationsTabBlockedMessage />
      </div>
    );
  }

  const completed = obligations.filter((item) => item.status === 'Completed').length;
  const inProgress = obligations.filter((item) => item.status === 'In Progress').length;
  const overdue = obligations.filter((item) => item.status === 'Overdue').length;

  async function handleRenew() {
    await renew();
    refetchRenewal();
  }

  async function handleAmend() {
    await amend();
    refetchRenewal();
  }

  function handleTerminated() {
    setIsTerminateOpen(false);
    refetchRenewal();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/contract-repository" className="hover:text-neutral-300">
            Contract Repository
          </Link>
          <span className="mx-1.5">/</span>
          <Link to={`/contracts/${contractId}`} className="hover:text-neutral-300">
            Contract Detail
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Obligations &amp; Renewal</span>
        </nav>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Obligations &amp; Renewal</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {contract.contractName} &middot; {contract.counterparty} &middot; Status: {contract.status}
            </p>
          </div>
          {!readOnly && (
            <RenewAmendTerminateButtons
              renewEnabled={Boolean(renewal?.renewEnabled) && !isRenewing}
              amendEnabled={Boolean(renewal?.amendEnabled) && !isAmending}
              terminateEnabled={Boolean(renewal?.terminateEnabled)}
              actionInProgress={Boolean(renewal?.actionInProgress)}
              onRenew={handleRenew}
              onAmend={handleAmend}
              onTerminate={() => setIsTerminateOpen(true)}
            />
          )}
        </div>
      </header>

      <main className="px-8 py-6">
        {!isRenewalLoading && renewal && (
          <div className="mb-6">
            <RenewalAlertPanel
              renewal={
                readOnly
                  ? { ...renewal, renewEnabled: false, amendEnabled: false, terminateEnabled: false }
                  : renewal
              }
              onRenew={readOnly ? undefined : handleRenew}
              onAmend={readOnly ? undefined : handleAmend}
              onTerminate={readOnly ? undefined : () => setIsTerminateOpen(true)}
            />
          </div>
        )}

        <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center">
            <p className="text-lg font-semibold text-neutral-100">{obligations.length}</p>
            <p className="mt-1 text-xs text-neutral-500">Total Obligations</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center">
            <p className="text-lg font-semibold text-emerald-400">{completed}</p>
            <p className="mt-1 text-xs text-neutral-500">Completed</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center">
            <p className="text-lg font-semibold text-cyan-300">{inProgress}</p>
            <p className="mt-1 text-xs text-neutral-500">In Progress</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center">
            <p className="text-lg font-semibold text-red-400">{overdue}</p>
            <p className="mt-1 text-xs text-neutral-500">Overdue</p>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-200">Obligations</h2>
            <p className="text-xs text-neutral-500">Extracted automatically on execution — review Owner and Due Date for each</p>
          </div>

          {isObligationsLoading && <p className="text-sm text-neutral-500">Loading obligations…</p>}

          {!isObligationsLoading && obligations.length === 0 && (
            <div className="space-y-4">
              <ObligationsEmptyState />
              {!readOnly && <ManualObligationForm contractId={contractId} onSave={refetchObligations} />}
            </div>
          )}

          {!isObligationsLoading && obligations.length > 0 && (
            <ObligationsTable obligations={obligations} readOnly={readOnly} />
          )}
        </section>
      </main>

      {isTerminateOpen && (
        <TerminationReasonDialog
          contractId={contractId}
          onClose={() => setIsTerminateOpen(false)}
          onConfirm={handleTerminated}
        />
      )}
    </div>
  );
}
