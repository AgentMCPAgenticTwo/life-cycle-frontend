import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SignerListTable from '@/features/esignature/components/SignerListTable';
import AddSignerModal from '@/features/esignature/components/AddSignerModal';
import SendForSignatureButton from '@/features/esignature/components/SendForSignatureButton';
import AuditCertificateDownloadButton from '@/features/esignature/components/AuditCertificateDownloadButton';
import { useSignerList } from '@/features/esignature/hooks/useSignerList';
import { useAddSigner } from '@/features/esignature/hooks/useAddSigner';
import { useSendForSignature } from '@/features/esignature/hooks/useSendForSignature';
import { useEsignatureSettings } from '@/features/esignature/hooks/useEsignatureSettings';
import { getContract } from '@/services/contractsService';
import { useAuth } from '@/shared/hooks/useAuth';

// GET /contracts/{id}/signers is only visible to CONTRACT_OWNER, LEGAL_REVIEWER
// and TENANT_ADMIN (see module contract); Approvers and any External Party
// not yet added as a Signer are denied this screen entirely (UC7-BR-014).
const ALLOWED_ROLES = ['CONTRACT_OWNER', 'LEGAL_REVIEWER', 'TENANT_ADMIN'];
const EXECUTED_STATUS = 'Executed';
const SENT_STATUSES = ['Sent', 'Executed'];

export default function SignerListPage() {
  const { contractId } = useParams();
  const { role } = useAuth();
  const isAllowed = ALLOWED_ROLES.includes(role);
  const canManage = role === 'CONTRACT_OWNER';

  const { data, isLoading, error, refetch } = useSignerList(contractId);
  const addSigner = useAddSigner(contractId);
  const sendForSignature = useSendForSignature(contractId);
  const { data: settings } = useEsignatureSettings();

  const [contract, setContract] = useState(null);
  const [contractError, setContractError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (!contractId || !isAllowed) return;
    getContract(contractId)
      .then(setContract)
      .catch((err) => setContractError(err));
  }, [contractId, isAllowed]);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
        <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-red-300">Access denied</h1>
          <p className="mt-2 text-sm text-red-200">
            Only the Contract Owner, Legal Reviewer or Tenant Admin can view the Signer List for this contract.
          </p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const signers = data?.signers ?? [];
  const sendForSignatureEnabled = canManage && (data?.sendForSignatureEnabled ?? signers.length > 0);
  const signingOrderLocked = data?.signingOrderLocked ?? false;
  const contractStatus = contract?.status;
  const contractSent = SENT_STATUSES.includes(contractStatus);
  const isExecuted = contractStatus === EXECUTED_STATUS;

  function handleAddSigner(request) {
    setActionError(null);
    return addSigner.mutate(request).then((signer) => {
      refetch();
      return signer;
    }).catch((err) => {
      setActionError(err.message || 'Failed to add signer');
      throw err;
    });
  }

  function handleSend() {
    setConnectionError(null);
    setActionError(null);
    sendForSignature
      .mutate({})
      .then((response) => {
        if (response.contractStatus === 'SignatureConnectionFailed') {
          setConnectionError(
            response.errorMessage ||
              'Unable to connect to the selected e-signature provider. Please try again or choose the in-built e-signature option.'
          );
        } else {
          setContract((prev) => (prev ? { ...prev, status: response.contractStatus } : prev));
        }
        refetch();
      })
      .catch((err) => setActionError(err.message || 'Failed to send for signature'));
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/contracts" className="hover:text-neutral-300">
            Contract Repository
          </Link>
          <span className="mx-1.5">/</span>
          <span>Select Contract</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-300">E-signature Tab &gt; Add Signers</span>
        </nav>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{contractSent ? 'Signing Tracker' : 'Add Signers'}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {contractSent
                ? 'Track each signer’s progress through the sequential e-signing workflow'
                : 'Configure the signer list, order and signature method before sending for signature'}
            </p>
          </div>
          {contractSent && (
            <AuditCertificateDownloadButton contractId={contractId} enabled={isExecuted} variant="compact" />
          )}
        </div>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        {contractError && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {contractError.message || 'Failed to load contract details'}
          </div>
        )}

        {contract && (
          <div className="rounded-xl bg-gradient-to-r from-emerald-600/30 via-emerald-700/20 to-neutral-900 px-6 py-5">
            <h2 className="text-lg font-semibold text-neutral-50">{contract.contractName}</h2>
            <p className="mt-1 text-sm text-neutral-200/80">
              {isExecuted
                ? 'All signers have completed signing — contract is Executed'
                : `${contractStatus} and ${contractSent ? 'routed for' : 'ready to route for'} e-signature`}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-neutral-100">
                {signers.length} signer{signers.length === 1 ? '' : 's'} added
              </span>
              <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-neutral-100">
                Status: {contractStatus}
              </span>
            </div>
            {!contractSent && canManage && (
              <div className="mt-4">
                <SendForSignatureButton
                  enabled={sendForSignatureEnabled}
                  onSend={handleSend}
                  isLoading={sendForSignature.isLoading}
                  connectionError={connectionError}
                />
              </div>
            )}
          </div>
        )}

        {actionError && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError}
          </div>
        )}

        {isLoading && <p className="text-sm text-neutral-500">Loading signer list…</p>}

        {!isLoading && error && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <p>{error.message || 'Failed to load the Signer List'}</p>
            <button type="button" onClick={refetch} className="mt-2 font-medium text-red-200 underline">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <div className={canManage && !signingOrderLocked ? 'grid grid-cols-1 gap-6 lg:grid-cols-2' : 'grid grid-cols-1 gap-6'}>
            {canManage && !contractSent && (
              <AddSignerModal
                contractId={contractId}
                onAdd={handleAddSigner}
                disabled={signingOrderLocked}
                isSubmitting={addSigner.isLoading}
                defaultReminderFrequencyDays={settings?.reminderFrequencyDays}
              />
            )}

            <div className="rounded-xl border border-neutral-800 bg-neutral-900">
              <div className="border-b border-neutral-800 px-5 py-4">
                <h2 className="text-sm font-semibold text-neutral-100">Signer List</h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {signingOrderLocked
                    ? 'Locked — a signer has already signed, so the order and roster can no longer change'
                    : 'Order determines the signing sequence'}
                </p>
              </div>

              <SignerListTable signers={signers} contractSent={contractSent} />

              {!contractSent && !canManage && (
                <p className="px-5 py-4 text-xs text-neutral-500">Read-only view — only the Contract Owner can add, remove or send signers.</p>
              )}
            </div>

            {contractSent && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                  <h3 className="text-sm font-semibold text-neutral-100">Sequential Signing</h3>
                  <p className="mt-1.5 text-xs text-neutral-500">
                    Once the current signer signs, the system automatically sends the signing link to the next signer in
                    order.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                  <h3 className="text-sm font-semibold text-neutral-100">On Final Signature</h3>
                  <p className="mt-1.5 text-xs text-neutral-500">
                    When the last signer signs, the final PDF is locked, the audit certificate is generated with every
                    signer's name, email, IP address and timestamp, and the contract status automatically becomes
                    Executed.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
