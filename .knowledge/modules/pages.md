---
type: Module
title: src/pages
description: Route-level screens, one file per route, each composing components and hooks from one or more src/features/<feature> directories.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/pages
tags: [frontend, pages]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

20 screens, each paired with a test in `src/__tests__/<ScreenName>.test.jsx`
(all 20 pages have a matching test file).

| Page | Primary feature(s) |
|---|---|
| `DashboardPage.jsx` | [dashboard](/modules/dashboard.md) |
| `ContractRepositoryListPage.jsx` | [contracts](/modules/contracts.md) |
| `NewContractPage.jsx` | [contracts](/modules/contracts.md) |
| `TemplateClauseLibraryPage.jsx` | [templates](/modules/templates.md) |
| `ApprovalMatrixConfigPage.jsx` | [approvals](/modules/approvals.md) |
| `EsignatureSettingsPage.jsx` | [esignature](/modules/esignature.md) |
| `ApprovalsListPage.jsx` | [approvals](/modules/approvals.md) |
| `ApprovalReviewPage.jsx` | [approvals](/modules/approvals.md) |
| `ClauseAnalysisPage.jsx` | [clause-analysis](/modules/clause-analysis.md) |
| `ExternalReviewPage.jsx` | [negotiation](/modules/negotiation.md) |
| `NegotiationTrackerPage.jsx` | [negotiation](/modules/negotiation.md) |
| `SignerListPage.jsx` | [esignature](/modules/esignature.md) |
| `SigningPortalPage.jsx` | [esignature](/modules/esignature.md) |
| `ContractDetailPage.jsx` | [contract-repository](/modules/contract-repository.md) |
| `ContractRepositoryPage.jsx` | [contract-repository](/modules/contract-repository.md) |
| `ObligationsRenewalPage.jsx` | [contract-repository](/modules/contract-repository.md) |
| `AccessDeniedPage.jsx` | — standalone, routed after any 403 |
| `SettingsAdminPage.jsx` | [settings-admin](/modules/settings-admin.md) |
| `TrackerPage.jsx` | [tracker](/modules/tracker.md) |
| `LoginPage.jsx` | — standalone auth entry point, added 2026-10-13 alongside the sidebar nav (commit `49e9748`) |

## Conventions

- Pages are thin: they wire route params to feature hooks and lay out feature components, per `CLAUDE.md`'s "one per screen" rule.
- Call graph: `pages -> features` (78 calls) and `pages -> store` (32 calls) dominate; `pages -> services` is only 1 call — pages should keep going through feature hooks rather than calling services directly (see [architecture.md](/architecture.md)).
