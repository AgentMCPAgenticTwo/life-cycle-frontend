---
type: Module
title: App routing (src/App.jsx, src/main.jsx)
description: Declares every route in the SPA and decides which screens get the sidebar app shell.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/App.jsx
tags: [frontend, routing]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

## Files

- `src/main.jsx` — Vite/React root bootstrap.
- `src/App.jsx` — all `<Route>` declarations.

## Routes

| Path | Page | Shell |
|---|---|---|
| `/login` | `LoginPage` | none |
| `/negotiation/external/:linkToken` | `ExternalReviewPage` | none |
| `/sign/:sessionId` | `SigningPortalPage` | none |
| `/` | `DashboardPage` | `AppLayout` |
| `/contracts` | `ContractRepositoryListPage` | `AppLayout` |
| `/contracts/new` | `NewContractPage` behind `NewContractAccessGuard` (roles `TENANT_ADMIN`, `CONTRACT_OWNER`) | `AppLayout` |
| `/settings/template-clause-library` | `TemplateClauseLibraryPage` | `AppLayout` |
| `/settings/approval-matrix-config` | `ApprovalMatrixConfigPage` | `AppLayout` |
| `/settings/esignature-settings` | `EsignatureSettingsPage` | `AppLayout` |
| `/approvals` | `ApprovalsListPage` | `AppLayout` |
| `/approvals/:approvalId` | `ApprovalReviewPage` | `AppLayout` |
| `/contracts/:contractId/clause-analysis` | `ClauseAnalysisPage` | `AppLayout` |
| `/contracts/:contractId/negotiation` | `NegotiationTrackerPage` | `AppLayout` |
| `/contracts/:contractId/signers` | `SignerListPage` | `AppLayout` |
| `/contracts/:contractId` | `ContractDetailPage` | `AppLayout` |
| `/contracts/:contractId/obligations` | `ObligationsRenewalPage` | `AppLayout` |
| `/contract-repository` | `ContractRepositoryPage` | `AppLayout` |
| `/access-denied` | `AccessDeniedPage` | `AppLayout` |
| `/settings/admin` | `SettingsAdminPage` | `AppLayout` |
| `/tracker` | `TrackerPage` | `AppLayout` |

## Notes

- Route matching order matters: `/contracts/:contractId/clause-analysis` etc. are declared before the bare `/contracts/:contractId` so the more specific paths win.
- Adding a new screen means adding both a file under `src/pages/` and a `<Route>` here — per `CLAUDE.md`, never delete or rename an existing route when adding a new module.
- See [shared](/modules/shared.md) for `AppLayout`/`SidebarNav`, and [modules/index.md](/modules/index.md) for every feature module these pages compose.
