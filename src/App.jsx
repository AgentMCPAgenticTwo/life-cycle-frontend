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
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import SettingsAdminPage from '@/pages/SettingsAdminPage';
import TrackerPage from '@/pages/TrackerPage';
import LoginPage from '@/pages/LoginPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import NewContractAccessGuard from '@/features/contracts/components/NewContractAccessGuard';
import AppLayout from '@/shared/components/AppLayout';
import ProtectedRoute from '@/shared/components/ProtectedRoute';

const NEW_CONTRACT_ALLOWED_ROLES = ['TENANT_ADMIN', 'CONTRACT_OWNER'];

// Screens are added under src/pages/ as modules are implemented, and routed here.
// Routes nested under AppLayout get the responsive sidebar; standalone/external
// entry points (login, external negotiation review, the signing portal) do not.
// ProtectedRoute restores the session from the refresh cookie, redirects to
// /login when there is none, and forces mustChangePassword users through
// /change-password before anything else.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/negotiation/external/:linkToken" element={<ExternalReviewPage />} />
      <Route path="/sign/:sessionId" element={<SigningPortalPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />

        <Route element={<AppLayout />}>
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
          <Route path="/contracts/:contractId/negotiation" element={<NegotiationTrackerPage />} />
          <Route path="/contracts/:contractId/signers" element={<SignerListPage />} />
          <Route path="/contracts/:contractId" element={<ContractDetailPage />} />
          <Route path="/contracts/:contractId/obligations" element={<ObligationsRenewalPage />} />
          <Route path="/contract-repository" element={<ContractRepositoryPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/settings/admin" element={<SettingsAdminPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
