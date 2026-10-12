import { Routes, Route } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import ContractRepositoryListPage from '@/pages/ContractRepositoryListPage';
import NewContractPage from '@/pages/NewContractPage';
import TemplateClauseLibraryPage from '@/pages/TemplateClauseLibraryPage';
import ApprovalMatrixConfigPage from '@/pages/ApprovalMatrixConfigPage';
import EsignatureSettingsPage from '@/pages/EsignatureSettingsPage';
import ApprovalsListPage from '@/pages/ApprovalsListPage';
import ApprovalReviewPage from '@/pages/ApprovalReviewPage';
import ClauseAnalysisPage from '@/pages/ClauseAnalysisPage';
import ExternalReviewPage from '@/pages/ExternalReviewPage';
import NegotiationTrackerPage from '@/pages/NegotiationTrackerPage';
import SignerListPage from '@/pages/SignerListPage';
import SigningPortalPage from '@/pages/SigningPortalPage';
import ContractDetailPage from '@/pages/ContractDetailPage';
import ContractRepositoryPage from '@/pages/ContractRepositoryPage';
import ObligationsRenewalPage from '@/pages/ObligationsRenewalPage';
import NewContractAccessGuard from '@/features/contracts/components/NewContractAccessGuard';

const NEW_CONTRACT_ALLOWED_ROLES = ['TENANT_ADMIN', 'CONTRACT_OWNER'];

// Screens are added under src/pages/ as modules are implemented, and routed here.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/contracts" element={<ContractRepositoryListPage />} />
      <Route
        path="/contracts/new"
        element={
          <NewContractAccessGuard allowedRoles={NEW_CONTRACT_ALLOWED_ROLES}>
            <NewContractPage />
          </NewContractAccessGuard>
        }
      />
      <Route path="/settings/template-clause-library" element={<TemplateClauseLibraryPage />} />
      <Route path="/settings/approval-matrix-config" element={<ApprovalMatrixConfigPage />} />
      <Route path="/settings/esignature-settings" element={<EsignatureSettingsPage />} />
      <Route path="/approvals" element={<ApprovalsListPage />} />
      <Route path="/approvals/:approvalId" element={<ApprovalReviewPage />} />
      <Route path="/contracts/:contractId/clause-analysis" element={<ClauseAnalysisPage />} />
      <Route path="/negotiation/external/:linkToken" element={<ExternalReviewPage />} />
      <Route path="/contracts/:contractId/negotiation" element={<NegotiationTrackerPage />} />
      <Route path="/contracts/:contractId/signers" element={<SignerListPage />} />
      <Route path="/sign/:sessionId" element={<SigningPortalPage />} />
      <Route path="/contracts/:contractId" element={<ContractDetailPage />} />
      <Route path="/contracts/:contractId/obligations" element={<ObligationsRenewalPage />} />
      <Route path="/contract-repository" element={<ContractRepositoryPage />} />
    </Routes>
  );
}
