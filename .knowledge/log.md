# Knowledge Update Log

## 2026-10-14

* **Update**: [shared](/modules/shared.md), [services](/modules/services.md),
  [tracker](/modules/tracker.md), [contract-repository](/modules/contract-repository.md),
  [common-tasks](/playbooks/common-tasks.md) —
  documented the authenticated file-download path added by the tracker-export fix: the new
  `src/shared/utils/fileDownload.js` (`saveBlob`, `downloadAndSave`), `downloadFile` and the
  `raw` request option in `src/services/http.js`, `useTrackerExport.js`'s
  `FORMAT_EXTENSIONS` plus its missing-`fileUrl`-is-a-failure rule with
  `TrackerPage.handleExport` awaiting it, and `useDocumentDownload.js` switching from an
  `<a href>` to `downloadAndSave`. The [shared](/modules/shared.md) concept now covers
  `src/shared` rather than only `src/shared/components`, so `modules/index.md` was
  retitled to match. Mode `update`, trace `6cfe1ddf16eb`, commit
  `f7c53e07c639c02ca5973ae775bd63b8c6ccc08a`. No routes or directories beyond
  `src/shared/utils` were added, so overview and architecture were left untouched.

* **Update**: [settings-admin](/modules/settings-admin.md), [tracker](/modules/tracker.md),
  [templates](/modules/templates.md) — documented three new surfaces: editable/deletable
  approval rules (`updateApprovalRule` / `deleteApprovalRule` in
  `src/services/settingsApprovalRulesService.js`, `useUpdateApprovalRule.js` /
  `useDeleteApprovalRule.js`, the `onEditRule` / `onDeleteRule` / `deletingRuleId`
  props on `RoutingApprovalTab.jsx` and `AddRuleForm.jsx`'s `initialRule` edit
  mode wired from `src/pages/SettingsAdminPage.jsx`); Tenant-Admin editing of the
  stuck-flag thresholds (`updateBottleneckThresholds` in
  `src/services/trackerService.js`, `saveThresholds` / `canEdit` / `isSaving` in
  `useBottleneckThresholds.js`, and `BottleneckTab.jsx`'s draft +
  `INVALID_THRESHOLD_MESSAGE` validation); and template file upload in
  `src/features/templates/components/TemplateEditor.jsx`
  (`handleTemplateFileChange`, `EXTENSION_TO_FORMAT`, `MAX_TEMPLATE_FILE_BYTES`,
  `MAX_NAME_LENGTH`). Mode `update`, trace `facb87b33e16`, commit
  `2a331598f5b32710821c162cc01f1bc7c536da11`. No files, directories or routes were
  added, so overview, architecture and the index files were left untouched.

* **Update**: [contract-repository](/modules/contract-repository.md) — recorded the
  new `src/features/contract-repository/components/HighlightedText.jsx`
  (`HighlightedText` + local `escapeRegExp`), which wraps search-term matches in
  `<mark>` and is called only from `ContractListTable.jsx`.
* **Update**: [tracker](/modules/tracker.md) — noted the `FORMATS` constant in
  `src/features/tracker/TrackerExportButton.jsx` fixing export formats to
  `Excel` and `PDF`. Mode `update`, trace `001e8afcd865`, commit
  `27d8f22b89f10e915476e7a907812638a1f1c6bd`.

* **Update**: [negotiation](/modules/negotiation.md) — documented the UC5
  auto-send-to-counterparty surface in `src/pages/NegotiationTrackerPage.jsx`
  (the `'With Counterparty'` → "Sent to counterparty" `STATUS_LABELS` entry and
  the secure-link/OTP header note driven by `externalPartyName` /
  `externalPartyEmail`) and the new `stopped` prop on
  `src/features/negotiation/components/SendReminderButton.jsx`, with the page's
  `remindersStopped` derivation from `negotiationStatus === 'Agreed'` or all
  `internalReviewers` being `Submitted`. Mode `update`, trace `369f75682fd7`,
  commit `924f2b68e7fdf30975f868885890e229379e455d`. No files, directories or
  routes were added, so overview, architecture and the index files were left
  untouched.

* **Update**: [negotiation](/modules/negotiation.md) — documented the new
  `src/features/negotiation/components/RiskRecheckPanel.jsx` (UC5 re-check of
  risk on counterparty redlines: `useCompareVersions` + `useClauseAnalysis` +
  `useRetryExtraction`, its four render states and the retry-on-failed-analysis
  surface) and its conditional mount in `src/pages/NegotiationTrackerPage.jsx`
  when the highest `data.versions` entry has `source === 'External'`.
  [contracts](/modules/contracts.md) — recorded the UC2 document-generation
  confirmation in `src/pages/NewContractPage.jsx`: `handleSave` now keeps the
  user on the form, sets `createdContract` with a template-vs-third-party-paper
  `generatedFrom` message, and defers navigation to a **View Contract** button.
  Mode `update`, trace `e85937886fc6`, commit
  `901976f229bbcc1750ffec78c46e6fc09a4d0882`. The new component sits inside an
  already-documented directory, so overview, architecture and the index files
  were left untouched.

* **Update**: [negotiation](/modules/negotiation.md) — documented the new
  `src/features/negotiation/components/RedlineSubmitPanel.jsx` and the
  concurrent-redline-conflict surface (409 → `conflict` + Refresh, non-409 →
  `error`) it renders from `useSubmitReview`, plus its conditional mount in
  `src/pages/NegotiationTrackerPage.jsx`.
  [clause-analysis](/modules/clause-analysis.md) — recorded the mandatory-clause
  reject guard in `ClauseDetailDrawer.jsx` and the audit-log immutability note in
  `AuditLogViewer.jsx`. [settings-admin](/modules/settings-admin.md) — added the
  Audit log tab section with the matching immutability note in `AuditLogTab.jsx`
  and un-stranded the audit-log component bullet. Mode `update`, trace
  `7b3ca6df5269`, commit `2980c74caa4fa3952f31f5cbaeff19b40c6dd55c`. The new
  component sits inside an already-documented directory, so overview,
  architecture and the index files were left untouched.

* **Update**: [settings-admin](/modules/settings-admin.md) — documented the
  Notifications tab error surface (`updateError` prop, swallowed `HttpError` in
  `handleToggleNotification`, `pendingEventName` scoping) after the UI
  correction in `src/features/settings-admin/NotificationsTab.jsx` and
  `src/pages/SettingsAdminPage.jsx` (mode `update`, trace `6971f6c6c93f`,
  commit `a424f96a19e02af3710ecf5e28aaccb50f90ca52`). No structural change, so
  overview, architecture and the index files were left untouched.

## 2026-10-13

* **Creation**: Built the full `.knowledge/` bundle from scratch (mode `full`,
  trace `04945e96f5bc`, commit `49e9748c4f7780464fab1d3fc10815d84e990e6f`).
  Indexed via `get_architecture(aspects=["all"])`, a `Route` query, and
  `Glob`/`Read` of `src/App.jsx` and `src/shared/components/AppLayout.jsx`.
  Bundle covers: overview, architecture (layers/boundaries/clusters/hotspots),
  conventions, 15 module concepts (one per source directory — routing, pages,
  shared app shell, 10 features, services, store), a common-tasks playbook,
  and reference docs for the generation-module mapping and live graph queries.
  Captured the most recent commit's additions (`LoginPage`, `AppLayout` +
  `SidebarNav` app shell) which predate any generated module's `CLAUDE.md`
  contract.
