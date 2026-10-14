import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TemplatesTab from '@/features/templates/components/TemplatesTab';
import ClauseLibraryTab from '@/features/templates/components/ClauseLibraryTab';
import TemplateEditor from '@/features/templates/components/TemplateEditor';
import ClauseEditor from '@/features/templates/components/ClauseEditor';
import VersionHistoryModal from '@/features/templates/components/VersionHistoryModal';
import { useTemplates } from '@/features/templates/hooks/useTemplates';
import { useCreateTemplate } from '@/features/templates/hooks/useCreateTemplate';
import { useUpdateTemplate } from '@/features/templates/hooks/useUpdateTemplate';
import { useDeactivateTemplate } from '@/features/templates/hooks/useDeactivateTemplate';
import { useReactivateTemplate } from '@/features/templates/hooks/useReactivateTemplate';
import { useTemplateVersions } from '@/features/templates/hooks/useTemplateVersions';
import { useClauses } from '@/features/templates/hooks/useClauses';
import { useCreateClause } from '@/features/templates/hooks/useCreateClause';
import { useUpdateClause } from '@/features/templates/hooks/useUpdateClause';
import { useDeactivateClause } from '@/features/templates/hooks/useDeactivateClause';
import { useReactivateClause } from '@/features/templates/hooks/useReactivateClause';
import { useClauseVersions } from '@/features/templates/hooks/useClauseVersions';
import { useTemplateLibraryStore } from '@/store/templateLibrarySlice';
import { useAuth } from '@/shared/hooks/useAuth';

// AF-002/BR-004/BR-010: only Tenant Admin and Legal Reviewer may reach this
// screen at all. BR-009 denies Contract Owner direct navigation here even
// though BR-004 separately implies a read-only Contract Owner view; those two
// stories contradict each other (see blockers) — BR-009's explicit "deny
// direct navigation" wins since it names this exact screen.
const ALLOWED_ROLES = ['TENANT_ADMIN', 'LEGAL_REVIEWER'];
// BR-008 says Legal Reviewer cannot deactivate/reactivate; BR-004/BR-012 say
// they can. The endpoint contract settles it: deactivate/reactivate roles
// are TENANT_ADMIN only (see blockers).
const DEACTIVATE_ROLES = ['TENANT_ADMIN'];

export default function TemplateClauseLibraryPage() {
  const { role } = useAuth();
  const isAllowed = ALLOWED_ROLES.includes(role);
  const canDeactivate = DEACTIVATE_ROLES.includes(role);

  const activeTab = useTemplateLibraryStore((s) => s.activeTab);
  const selectedItemId = useTemplateLibraryStore((s) => s.selectedItemId);
  const setActiveTab = useTemplateLibraryStore((s) => s.setActiveTab);
  const selectItem = useTemplateLibraryStore((s) => s.selectItem);
  const clearSelection = useTemplateLibraryStore((s) => s.clearSelection);

  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'template'|'clause', mode: 'deactivate'|'reactivate', id, name }
  const [versionHistoryFor, setVersionHistoryFor] = useState(null); // { type, id, title, subtitle }

  const templatesResult = useTemplates();
  const clausesResult = useClauses();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deactivateTemplate = useDeactivateTemplate();
  const reactivateTemplate = useReactivateTemplate();
  const createClause = useCreateClause();
  const updateClause = useUpdateClause();
  const deactivateClause = useDeactivateClause();
  const reactivateClause = useReactivateClause();

  const templateVersions = useTemplateVersions(versionHistoryFor?.type === 'template' ? versionHistoryFor.id : null);
  const clauseVersions = useClauseVersions(versionHistoryFor?.type === 'clause' ? versionHistoryFor.id : null);

  const selectedTemplate = useMemo(
    () =>
      activeTab === 'templates' && selectedItemId && selectedItemId !== 'new'
        ? templatesResult.data?.items?.find((t) => t.id === selectedItemId) || null
        : null,
    [activeTab, selectedItemId, templatesResult.data]
  );

  const selectedClause = useMemo(
    () =>
      activeTab === 'clauses' && selectedItemId && selectedItemId !== 'new'
        ? clausesResult.data?.items?.find((c) => c.id === selectedItemId) || null
        : null,
    [activeTab, selectedItemId, clausesResult.data]
  );

  const existingClausesInCategory = useMemo(() => {
    const category = selectedClause?.clauseCategory;
    if (!category) return [];
    return (clausesResult.data?.items ?? []).filter(
      (c) => c.clauseCategory === category && c.id !== selectedClause?.id
    );
  }, [clausesResult.data, selectedClause]);

  function openNew(tab) {
    setFormError(null);
    setSuccessMessage(null);
    setActiveTab(tab);
    selectItem('new');
  }

  function closeEditor() {
    setFormError(null);
    clearSelection();
  }

  async function handleSaveTemplate(request) {
    setFormError(null);
    try {
      if (selectedItemId && selectedItemId !== 'new') {
        await updateTemplate.mutate(selectedItemId, request);
      } else {
        await createTemplate.mutate(request);
      }
      setSuccessMessage('Template saved successfully');
      await templatesResult.refetch();
      clearSelection();
    } catch (err) {
      setFormError(err.message || 'Unable to save template. Please try again.');
    }
  }

  async function handleSaveClause(request) {
    setFormError(null);
    try {
      if (selectedItemId && selectedItemId !== 'new') {
        await updateClause.mutate(selectedItemId, request);
      } else {
        await createClause.mutate(request);
      }
      setSuccessMessage('Clause saved successfully');
      await clausesResult.refetch();
      clearSelection();
    } catch (err) {
      setFormError(err.message || 'Unable to save clause. Please try again.');
    }
  }

  function requestDeactivate(type, id, name) {
    setConfirmAction({ type, mode: 'deactivate', id, name });
  }

  function requestReactivate(type, id, name) {
    setConfirmAction({ type, mode: 'reactivate', id, name });
  }

  async function confirmPendingAction() {
    if (!confirmAction) return;
    const { type, mode, id } = confirmAction;
    setPendingActionId(id);
    setFormError(null);
    try {
      if (type === 'template') {
        if (mode === 'deactivate') await deactivateTemplate.mutate(id);
        else await reactivateTemplate.mutate(id);
        await templatesResult.refetch();
      } else {
        if (mode === 'deactivate') await deactivateClause.mutate(id);
        else await reactivateClause.mutate(id);
        await clausesResult.refetch();
      }
      setSuccessMessage(mode === 'deactivate' ? 'Deactivated successfully' : 'Reactivated successfully');
    } catch (err) {
      setFormError(err.message || 'Unable to complete this action. Please try again.');
    } finally {
      setPendingActionId(null);
      setConfirmAction(null);
    }
  }

  function openVersionHistory(type, id) {
    const source = type === 'template' ? templatesResult.data : clausesResult.data;
    const item = source?.items?.find((i) => i.id === id);
    const title = type === 'template' ? item?.templateName : item?.clauseName;
    setVersionHistoryFor({ type, id, title: title || '', subtitle: type === 'template' ? 'Template' : 'Clause' });
  }

  const isSaving = createTemplate.isLoading || updateTemplate.isLoading || createClause.isLoading || updateClause.isLoading;

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
        <div role="alert" className="max-w-md rounded-xl border border-red-600/40 bg-red-500/10 px-6 py-8 text-center">
          <h1 className="text-lg font-semibold text-red-300">Access denied</h1>
          <p className="mt-2 text-sm text-red-200">You do not have permission to access this screen.</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const showingEditor = Boolean(selectedItemId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-8 py-6">
        <nav className="text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            Home Page
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Settings / Admin</span>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-400">Template &amp; Clause Library</span>
          {showingEditor && (
            <>
              <span className="mx-1.5">/</span>
              <span className="text-neutral-400">
                {selectedItemId === 'new' ? (activeTab === 'templates' ? 'New Template' : 'New Clause') : 'Edit'}
              </span>
            </>
          )}
        </nav>

        {!showingEditor && (
          <div className="mt-2 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Template &amp; Clause Library</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Create, edit, version and deactivate contract templates and clause library entries
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openNew('clauses')}
                className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-500"
              >
                + New Clause
              </button>
              <button
                type="button"
                onClick={() => openNew('templates')}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
              >
                + New Template
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex flex-col gap-6 px-8 py-6">
        {successMessage && (
          <div role="status" className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {!showingEditor && formError && (
          <div role="alert" className="rounded-lg border border-red-600/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {formError}
          </div>
        )}

        {!showingEditor && (
          <>
            <div className="flex gap-2 border-b border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                  activeTab === 'templates'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Templates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('clauses')}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                  activeTab === 'clauses'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Clause Library
              </button>
            </div>

            {activeTab === 'templates' && (
              <TemplatesTab
                templates={templatesResult.data}
                isLoading={templatesResult.isLoading}
                error={templatesResult.error}
                onRetry={templatesResult.refetch}
                onSelect={(id) => selectItem(id)}
                onVersionHistory={(id) => openVersionHistory('template', id)}
                onDeactivate={(id) => {
                  const t = templatesResult.data?.items?.find((item) => item.id === id);
                  requestDeactivate('template', id, t?.templateName);
                }}
                onReactivate={(id) => {
                  const t = templatesResult.data?.items?.find((item) => item.id === id);
                  requestReactivate('template', id, t?.templateName);
                }}
                canManage={isAllowed}
                canDeactivate={canDeactivate}
                pendingActionId={pendingActionId}
              />
            )}

            {activeTab === 'clauses' && (
              <ClauseLibraryTab
                clauses={clausesResult.data}
                isLoading={clausesResult.isLoading}
                error={clausesResult.error}
                onRetry={clausesResult.refetch}
                onSelect={(id) => selectItem(id)}
              />
            )}
          </>
        )}

        {showingEditor && activeTab === 'templates' && (
          <TemplateEditor
            template={selectedTemplate}
            canManage={isAllowed}
            canDeactivate={canDeactivate}
            isSaving={isSaving}
            formError={formError}
            onSave={handleSaveTemplate}
            onDiscard={closeEditor}
            onVersionHistory={(id) => openVersionHistory('template', id)}
            onDeactivate={(id) => requestDeactivate('template', id, selectedTemplate?.templateName)}
            onReactivate={(id) => requestReactivate('template', id, selectedTemplate?.templateName)}
          />
        )}

        {showingEditor && activeTab === 'clauses' && (
          <ClauseEditor
            clause={selectedClause}
            canManage={isAllowed}
            canDeactivate={canDeactivate}
            isSaving={isSaving}
            formError={formError}
            existingClausesInCategory={existingClausesInCategory}
            onSave={handleSaveClause}
            onDiscard={closeEditor}
            onVersionHistory={(id) => openVersionHistory('clause', id)}
            onDeactivate={(id) => requestDeactivate('clause', id, selectedClause?.clauseName)}
            onReactivate={(id) => requestReactivate('clause', id, selectedClause?.clauseName)}
          />
        )}
      </main>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 px-4">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-base font-semibold text-neutral-100">
              {confirmAction.mode === 'deactivate' ? 'Deactivate' : 'Reactivate'} {confirmAction.name || 'this item'}?
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              {confirmAction.mode === 'deactivate'
                ? 'It will no longer be available for use in new contracts.'
                : 'It will become Active and available for use again.'}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPendingAction}
                disabled={pendingActionId === confirmAction.id}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {versionHistoryFor && (
        <VersionHistoryModal
          title={versionHistoryFor.title}
          subtitle={versionHistoryFor.subtitle}
          versions={versionHistoryFor.type === 'template' ? templateVersions.data : clauseVersions.data}
          isLoading={versionHistoryFor.type === 'template' ? templateVersions.isLoading : clauseVersions.isLoading}
          error={versionHistoryFor.type === 'template' ? templateVersions.error : clauseVersions.error}
          onRetry={versionHistoryFor.type === 'template' ? templateVersions.refetch : clauseVersions.refetch}
          onClose={() => setVersionHistoryFor(null)}
        />
      )}
    </div>
  );
}
