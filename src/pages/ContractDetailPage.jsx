import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContractDetail } from '@/features/contract-repository/hooks/useContractDetail';
import { useActivityLog } from '@/features/contract-repository/hooks/useActivityLog';
import { useContractVersions } from '@/features/contract-repository/hooks/useContractVersions';
import AccessDeniedView from '@/features/contract-repository/components/AccessDeniedView';
import ContractDetailsTab from '@/features/contract-repository/components/ContractDetailsTab';
import ContractDocumentTab from '@/features/contract-repository/components/ContractDocumentTab';
import ContractVersionsTab from '@/features/contract-repository/components/ContractVersionsTab';
import ContractActivityLogTab from '@/features/contract-repository/components/ContractActivityLogTab';
import AddFolderTagDialog from '@/features/contract-repository/components/AddFolderTagDialog';
import { HttpError } from '@/services/http';
import { useAuth } from '@/shared/hooks/useAuth';
import { formatCurrency, formatDate, formatRelativeTime } from '@/features/contract-repository/utils/format';

const TAB_ORDER = ['Details', 'Document', 'Versions', 'Clauses', 'Approvals', 'Signatures', 'Obligations', 'Activity Log'];

// Only Tenant Admin and Contract Owner may add/remove folders or tags
// (POST /api/v1/contracts/{contractId}/folder-tags roles — UC8-BR-009 / UC8-BR-010
// hide this control for Legal Reviewer and Approver).
const FOLDER_TAG_MANAGER_ROLES = ['TENANT_ADMIN', 'CONTRACT_OWNER'];

/**
 * Links to the other modules' per-contract screens for tabs this task does not
 * own the content of (Clauses / Approvals / Signatures / Obligations) — see
 * task blockers for why these render a link-out instead of inline content.
 */
const EXTERNAL_TAB_LINKS = {
  Clauses: (contractId) => `/contracts/${contractId}/clause-analysis`,
  Signatures: (contractId) => `/contracts/${contractId}/signers`,
  Approvals: () => '/approvals',
  Obligations: (contractId) => `/contracts/${contractId}/obligations`,
};

function ExternalTabPanel({ tab, contractId }) {
  const linkTo = EXTERNAL_TAB_LINKS[tab]?.(contractId);
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 text-sm text-neutral-400">
      <p>
        {tab === 'Obligations'
          ? 'Obligations & Renewal is managed on a dedicated screen.'
          : `${tab} for this contract is managed in its own workspace.`}
      </p>
      {linkTo && (
        <Link to={linkTo} className="mt-3 inline-block text-emerald-400 hover:text-emerald-300">
          Open {tab} →
        </Link>
      )}
    </section>
  );
}

export default function ContractDetailPage() {
  const { contractId } = useParams();
  const { role } = useAuth();
  const { data: contract, isLoading, error, refetch } = useContractDetail(contractId);
  const { data: versions } = useContractVersions(contractId);
  const { data: activity, totalCount: activityCount } = useActivityLog(contractId);
  const [activeTab, setActiveTab] = useState('Details');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const canManageFolderTags = FOLDER_TAG_MANAGER_ROLES.includes(role);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-500">
        Loading contract…
      </div>
    );
  }

  if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <AccessDeniedView />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-100">
        <p className="text-sm text-red-400">Unable to load this contract. Please try again.</p>
        <button
          type="button"
          onClick={refetch}
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-emerald-500 hover:text-emerald-400"
        >
          Retry
        </button>
      </div>
    );
  }

  const tabs = contract.availableTabs?.length
    ? TAB_ORDER.filter((tab) => contract.availableTabs.includes(tab))
    : TAB_ORDER;

  const latestVersion = versions
    .slice()
    .sort((a, b) => b.versionNumber - a.versionNumber)[0];
  const latestActivityAt = activity
    .slice()
    .sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt))[0]?.performedAt;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <span>CLM Hub</span>
          <span className="mx-1.5">/</span>
          <Link to="/contract-repository" className="hover:text-neutral-300">
            Contract Repository
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Contract Detail</span>
        </nav>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{contract.contractName}</h1>
            <p className="mt-1 text-sm text-neutral-500">Counterparty: {contract.counterpartyName}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {canManageFolderTags && (
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="rounded-md border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-neutral-500"
              >
                Add Folder/Tag
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        <section className="mb-6 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 p-5 text-neutral-950">
          <p className="text-sm font-semibold">Status: {contract.status}</p>
          {latestActivityAt && (
            <p className="mt-1 text-xs text-emerald-950/80">Last activity {formatRelativeTime(latestActivityAt)}.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-black/15 px-3 py-1 text-xs font-medium">
              Contract Value: {formatCurrency(contract.contractValue, contract.currency)}
            </span>
            <span className="rounded-full bg-black/15 px-3 py-1 text-xs font-medium">
              Owner: {contract.contractOwnerName}
            </span>
            <span className="rounded-full bg-black/15 px-3 py-1 text-xs font-medium">
              Effective: {formatDate(contract.startDate)}
            </span>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center">
            <p className="text-lg font-semibold text-emerald-400">{latestVersion ? `v${latestVersion.versionNumber}` : '—'}</p>
            <p className="mt-1 text-xs text-neutral-500">Current Version</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center">
            <p className="text-lg font-semibold text-neutral-100">{activityCount}</p>
            <p className="mt-1 text-xs text-neutral-500">Activity Entries</p>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-1 border-b border-neutral-800">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {activeTab === 'Details' && (
            <>
              <ContractDetailsTab contract={contract} />
              <ContractDocumentTab contractId={contractId} />
            </>
          )}
          {activeTab === 'Document' && (
            <div className="lg:col-span-2">
              <ContractDocumentTab contractId={contractId} />
            </div>
          )}
          {activeTab === 'Versions' && (
            <div className="lg:col-span-2">
              <ContractVersionsTab contractId={contractId} />
            </div>
          )}
          {activeTab === 'Activity Log' && (
            <div className="lg:col-span-2">
              <ContractActivityLogTab contractId={contractId} />
            </div>
          )}
          {['Clauses', 'Approvals', 'Signatures', 'Obligations'].includes(activeTab) && (
            <div className="lg:col-span-2">
              <ExternalTabPanel tab={activeTab} contractId={contractId} />
            </div>
          )}
        </div>
      </main>

      {isDialogOpen && (
        <AddFolderTagDialog contractId={contractId} onClose={() => setIsDialogOpen(false)} />
      )}
    </div>
  );
}
