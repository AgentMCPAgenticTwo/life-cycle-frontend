import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserManagementTab from '@/features/settings-admin/UserManagementTab';
import AddUserForm from '@/features/settings-admin/AddUserForm';
import RoutingApprovalTab from '@/features/settings-admin/RoutingApprovalTab';
import AddRuleForm from '@/features/settings-admin/AddRuleForm';
import IntegrationsTab from '@/features/settings-admin/IntegrationsTab';
import NotificationsTab from '@/features/settings-admin/NotificationsTab';
import AuditLogTab from '@/features/settings-admin/AuditLogTab';
import TemporaryPasswordModal from '@/features/settings-admin/TemporaryPasswordModal';
import { useTenantUsers } from '@/features/settings-admin/hooks/useTenantUsers';
import { useCreateUser } from '@/features/settings-admin/hooks/useCreateUser';
import { useResetPassword } from '@/features/settings-admin/hooks/useResetPassword';
import { useApprovalRules } from '@/features/settings-admin/hooks/useApprovalRules';
import { useCreateApprovalRule } from '@/features/settings-admin/hooks/useCreateApprovalRule';
import { useIntegrations } from '@/features/settings-admin/hooks/useIntegrations';
import { useConnectIntegration } from '@/features/settings-admin/hooks/useConnectIntegration';
import { useDisconnectIntegration } from '@/features/settings-admin/hooks/useDisconnectIntegration';
import { useNotificationEvents } from '@/features/settings-admin/hooks/useNotificationEvents';
import { useUpdateNotificationEvent } from '@/features/settings-admin/hooks/useUpdateNotificationEvent';
import { useAuditLog } from '@/features/settings-admin/hooks/useAuditLog';
import { useSettingsAdminStore } from '@/store/settingsAdminSlice';
import { useAuth } from '@/shared/hooks/useAuth';

// UC11-BR-001: only Tenant Admin may access this screen at all.
const ALLOWED_ROLES = ['TENANT_ADMIN'];

const TABS = [
  { key: 'users', label: 'User Management' },
  { key: 'routing', label: 'Routing & Approval' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'audit-log', label: 'Audit Log' },
];

export default function SettingsAdminPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAllowed = ALLOWED_ROLES.includes(role);

  useEffect(() => {
    if (!isAllowed) {
      navigate('/access-denied', {
        replace: true,
        state: { accessDeniedMessage: 'You do not have permission to view this page.' },
      });
    }
  }, [isAllowed, navigate]);

  const activeTab = useSettingsAdminStore((s) => s.activeTab);
  const setActiveTab = useSettingsAdminStore((s) => s.setActiveTab);

  // UC11-MF-001: the screen always opens on User Management, regardless of
  // which tab was active the last time it was open.
  useEffect(() => {
    setActiveTab('users');
  }, [setActiveTab]);

  const [successMessage, setSuccessMessage] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserError, setAddUserError] = useState(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [addRuleError, setAddRuleError] = useState(null);
  const [auditFilter, setAuditFilter] = useState({});

  const usersResult = useTenantUsers();
  const createUser = useCreateUser();
  const resetPassword = useResetPassword();
  const [temporaryPasswordInfo, setTemporaryPasswordInfo] = useState(null);
  const rulesResult = useApprovalRules();
  const createRule = useCreateApprovalRule();
  const integrationsResult = useIntegrations();
  const connectIntegration = useConnectIntegration();
  const disconnectIntegration = useDisconnectIntegration();
  const notificationsResult = useNotificationEvents();
  const updateNotificationEvent = useUpdateNotificationEvent();
  const auditLogResult = useAuditLog(auditFilter);

  const [pendingIntegrationName, setPendingIntegrationName] = useState(null);
  const [pendingEventName, setPendingEventName] = useState(null);

  if (!isAllowed) return null;

  async function handleUserStatusChanged(updatedUser) {
    setSuccessMessage(
      updatedUser.status === 'Active' ? `${updatedUser.name} reactivated` : `${updatedUser.name} deactivated`
    );
    await usersResult.refetch();
  }

  async function handleAddUser(request) {
    setAddUserError(null);
    try {
      const created = await createUser.createUser(request);
      setShowAddUser(false);
      setSuccessMessage('User invited successfully');
      await usersResult.refetch();
      if (created.temporaryPassword) {
        setTemporaryPasswordInfo({ userName: created.name, temporaryPassword: created.temporaryPassword });
      }
    } catch (err) {
      setAddUserError(err.message || 'Unable to create user. Please try again.');
    }
  }

  async function handleResetPassword(user) {
    try {
      const result = await resetPassword.resetPassword(user.id);
      setTemporaryPasswordInfo({ userName: user.name, temporaryPassword: result.temporaryPassword });
    } catch (err) {
      setSuccessMessage(null);
      setAddUserError(err.message || 'Unable to reset password. Please try again.');
    }
  }

  async function handleAddRule(request) {
    setAddRuleError(null);
    try {
      await createRule.createRule(request);
      setShowAddRule(false);
      setSuccessMessage('Approval rule added successfully');
      await rulesResult.refetch();
    } catch (err) {
      setAddRuleError(err.message || 'Unable to save this rule. Please try again.');
    }
  }

  async function handleConnectIntegration(integrationName, request) {
    setPendingIntegrationName(integrationName);
    try {
      await connectIntegration.connect(integrationName, request);
      setSuccessMessage(`${integrationName} connected successfully`);
      await integrationsResult.refetch();
    } finally {
      setPendingIntegrationName(null);
    }
  }

  async function handleDisconnectIntegration(integrationName) {
    setPendingIntegrationName(integrationName);
    try {
      await disconnectIntegration.disconnect(integrationName);
      setSuccessMessage(`${integrationName} disconnected`);
      await integrationsResult.refetch();
    } finally {
      setPendingIntegrationName(null);
    }
  }

  async function handleToggleNotification(eventName, toggles) {
    setPendingEventName(eventName);
    try {
      await updateNotificationEvent.updateEvent(eventName, toggles);
      setSuccessMessage('Notification settings updated');
      await notificationsResult.refetch();
    } finally {
      setPendingEventName(null);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Settings / Admin</span>
        </nav>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Settings / Admin</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Configure tenant-wide settings and review the complete audit trail for this tenant.
        </p>
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-emerald-500/5 p-6">
          <h2 className="text-lg font-semibold text-neutral-50">Tenant Administration</h2>
          <p className="mt-1 text-sm text-neutral-300">
            Users, approval routing, integrations and notifications are managed here — every change is recorded to
            the audit log automatically.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
              5 configuration areas
            </span>
            <span className="rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1 text-xs font-medium text-neutral-300">
              Tenant Admin access only
            </span>
          </div>
        </div>

        {successMessage && (
          <div role="status" className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        <div className="flex gap-2 border-b border-neutral-800">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <UserManagementTab
            users={usersResult.data}
            isLoading={usersResult.isLoading}
            error={usersResult.error}
            onRetry={usersResult.refetch}
            onAddUser={() => {
              setAddUserError(null);
              setShowAddUser(true);
            }}
            onStatusChanged={handleUserStatusChanged}
            onResetPassword={handleResetPassword}
          />
        )}

        {activeTab === 'routing' && (
          <RoutingApprovalTab
            rules={rulesResult.data}
            isLoading={rulesResult.isLoading}
            error={rulesResult.error}
            onRetry={rulesResult.refetch}
            onAddRule={() => {
              setAddRuleError(null);
              setShowAddRule(true);
            }}
          />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsTab
            integrations={integrationsResult.data}
            isLoading={integrationsResult.isLoading}
            error={integrationsResult.error}
            onRetry={integrationsResult.refetch}
            onConnect={handleConnectIntegration}
            onDisconnect={handleDisconnectIntegration}
            pendingIntegrationName={pendingIntegrationName}
            connectError={connectIntegration.error?.message}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            events={notificationsResult.data}
            isLoading={notificationsResult.isLoading}
            error={notificationsResult.error}
            onRetry={notificationsResult.refetch}
            onToggle={handleToggleNotification}
            pendingEventName={pendingEventName}
          />
        )}

        {activeTab === 'audit-log' && (
          <AuditLogTab
            entries={auditLogResult.data}
            isLoading={auditLogResult.isLoading}
            error={auditLogResult.error}
            onRetry={auditLogResult.refetch}
            onApplyFilter={setAuditFilter}
          />
        )}
      </main>

      {showAddUser && (
        <AddUserForm
          onSubmit={handleAddUser}
          onCancel={() => setShowAddUser(false)}
          isSubmitting={createUser.isLoading}
          error={addUserError}
        />
      )}

      {showAddRule && (
        <AddRuleForm
          onSubmit={handleAddRule}
          onCancel={() => setShowAddRule(false)}
          isSubmitting={createRule.isLoading}
          error={addRuleError}
        />
      )}

      {temporaryPasswordInfo && (
        <TemporaryPasswordModal
          userName={temporaryPasswordInfo.userName}
          temporaryPassword={temporaryPasswordInfo.temporaryPassword}
          onClose={() => setTemporaryPasswordInfo(null)}
        />
      )}
    </div>
  );
}
