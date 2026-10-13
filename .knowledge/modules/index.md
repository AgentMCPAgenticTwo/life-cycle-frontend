# Modules

This bundle groups modules by **source directory** (one concept per package),
which cuts across the generation modules listed in `CLAUDE.md`. See
[reference/generation-modules.md](/reference/generation-modules.md) for the
mapping between the two.

* [App routing](app-routing.md) - Declares every route in the SPA and decides which screens get the sidebar app shell.
* [src/pages](pages.md) - Route-level screens, one file per route, each composing components and hooks from one or more src/features/<feature> directories.
* [src/shared/components](shared.md) - The app shell (sidebar navigation + responsive layout) that wraps every authenticated route; no shared UI primitives exist yet.
* [src/features/dashboard](dashboard.md) - Status summary, my-tasks and high-risk-contracts panels shown on the landing DashboardPage, filterable by owner/counterparty/date range.
* [src/features/contracts](contracts.md) - New-contract drafting flow -- type/industry/template selection, third-party paper upload, counterparty panel, and the role guard on /contracts/new.
* [src/features/contract-repository](contract-repository.md) - Contract search/repository list, contract detail tabs, and obligations/renewal workflows.
* [src/features/clause-analysis](clause-analysis.md) - AI-assisted clause extraction/review screen -- per-clause accept/reject/edit, risk scoring, metadata editing, Ask-AI.
* [src/features/negotiation](negotiation.md) - Negotiation tracker -- routing, comments, mark-agreed/reminder, version comparison, and the OTP-gated external review flow.
* [src/features/approvals](approvals.md) - Approvals list/review, delegate flow, approval history, and tenant-wide approval-matrix configuration.
* [src/features/esignature](esignature.md) - Signer management, send-for-signature, the OTP + signature-pad signing portal, decline flow, audit certificate, and e-signature settings.
* [src/features/templates](templates.md) - Template and clause library -- editing, versioning, activate/deactivate lifecycle.
* [src/features/settings-admin](settings-admin.md) - Tenant-admin screen -- users, routing/approval rules, integrations, notifications, audit log.
* [src/features/tracker](tracker.md) - Reporting screen with ownership/cycle-time/bottleneck/turnaround tabs, export, and estimated-turnaround override.
* [src/services](services.md) - One typed client module per REST resource group, built on the shared HTTP client.
* [src/store](store.md) - Zustand slices, one per feature's UI/filter state.
