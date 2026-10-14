# Knowledge Update Log

## 2026-10-14

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
