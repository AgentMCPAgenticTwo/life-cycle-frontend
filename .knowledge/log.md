# Knowledge Update Log

## 2026-10-14

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
