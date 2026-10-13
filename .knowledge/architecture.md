---
type: Architecture
title: life-cycle-frontend architecture
description: Layered view of pages -> features -> services/store, module boundaries, and the hand-rolled app shell that wraps every authenticated route.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/
tags: [frontend, architecture]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

## Layers

```
pages/        entry layer — one file per route, composes features
  v
features/     internal layer — components + hooks per feature, highest fan-in/out
  v
services/     core layer — one module per REST resource, all HTTP goes through services/http.js
store/        core layer — zustand slices, no outbound calls (pure state)
```

Call-graph boundaries (fan-out counts from `get_architecture(aspects:[dependencies,boundaries])`):

| From | To | Calls |
|---|---|---|
| features | services | 95 |
| pages | features | 78 |
| pages | store | 32 |
| features | store | 9 |
| pages | services | 1 (should stay rare — pages should go through features/hooks) |

`services/http.js` (`post`, `request`) and `store` slice setters are the busiest
nodes in the graph (see hotspots below) — almost every feature hook ultimately
calls through them.

## Hotspots (highest fan-in)

- `services/http.post`, `services/http.request` — shared HTTP client, called from nearly every hook.
- `features/contract-repository/hooks/useCreateObligation.create`
- `store/contractDraftSlice.setField`
- `store/trackerFiltersSlice.setActiveTab`
- `features/contract-repository/utils/format.formatDate`
- `store/contractRepositorySlice.setFilters`
- `features/tracker/TrackerEmptyState`
- `features/contract-repository/hooks/useContractDetail`
- `services/trackerService.buildTrackerQuery`

## Routing tree (`src/App.jsx`)

Two route groups:

- **Standalone** (no sidebar): `/login` -> `LoginPage`, `/negotiation/external/:linkToken` -> `ExternalReviewPage`, `/sign/:sessionId` -> `SigningPortalPage`.
- **Inside `AppLayout`** (sidebar + responsive drawer, see [shared](/modules/shared.md)): every other route — dashboard (`/`), contracts list/detail/new, template & clause library, approval matrix config, e-signature settings, approvals list/review, clause analysis, negotiation tracker, signer list, contract repository, obligations/renewal, access-denied, settings/admin, tracker.

`/contracts/new` is the only route gated by an in-app guard
(`NewContractAccessGuard`, allowed roles `TENANT_ADMIN`/`CONTRACT_OWNER`) rather
than relying solely on the backend's 403.

## Feature clusters (by call cohesion)

These map roughly 1:1 to the generated modules in `CLAUDE.md`:

- **Dashboard** — `DashboardPage`, `TrackerReportControlsPanel`-style filters, `buildDashboardQuery`/`validateRange` (cohesion 0.94).
- **New contract / drafting** — `NewContractPage`, `setField` (contractDraftSlice), `handleSave`, `toIsoDate`, `listTemplates` (cohesion 0.96).
- **Templates & clause library** — `TemplateClauseLibraryPage`, `useTemplateVersions`, `useUpdateClause`, `TemplateEditor`, `ClauseEditor` (cohesion 0.89 / 1.0).
- **Contract repository + obligations/renewal** — `ContractRepositoryListPage`, `ContractDetailPage`, `ObligationsRenewalPage`, `useContractDetail`, `setFilters` (cohesion 0.88) plus a tighter `formatDate`/`ContractListTable`/`AddFolderTagDialog` cluster (0.89).
- **Negotiation + clause analysis** — `useNegotiationTracker`, `useClauseAnalysis`, `useAuditLog`, `NegotiationTrackerPage` (cohesion 0.82).
- **Settings/admin** — `SettingsAdminPage`, `useApprovalRules`, `useTenantUsers`, `useCreateUser`, `useNotificationEvents` (cohesion 0.9).
- **Tracker reporting** — `TrackerPage`, `useTrackerTabData`, `useTrackerExport`, `useBottleneckTab`, `useCycleTimeTab` (cohesion 0.93).
- **E-signature / signing** — `SignerListPage`, `useEsignatureSettings`, `EsignatureSettingsPage`, `useSignerList` (cohesion 1.0) plus `ExternalReviewPage`/`useVerifyOtp`/`OtpVerificationModal` for the external/OTP flow (0.89).

See [modules/index.md](/modules/index.md) for the directory-level breakdown and
[reference/graph-queries.md](/reference/graph-queries.md) to re-run these
cohesion/boundary queries against the live graph.

## No shared UI primitives yet

`src/shared/components/` only holds app-shell pieces (`AppLayout`, `SidebarNav`).
There is no `src/shared/components/ui/` — every feature writes its own badges,
modals and dialogs (e.g. `StatusBadge` exists independently in both
`features/contract-repository` and `features/contracts`). If a future module
needs a shared primitive, per `CLAUDE.md` it should be written by hand next to
the other shared components, not pulled from a dependency.
