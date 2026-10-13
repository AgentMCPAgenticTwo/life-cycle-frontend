---
type: Module
title: src/store
description: Zustand slices, one per feature's UI/filter state -- the core layer with high fan-in and zero outbound calls (no HTTP from store code).
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/store
tags: [frontend, store, zustand]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

10 slices, each owned by one feature:

| Slice | Feature |
|---|---|
| `dashboardFilterSlice.js` | [dashboard](/modules/dashboard.md) |
| `contractDraftSlice.js` | [contracts](/modules/contracts.md) — `setField` is the #2 fan-in hotspot in the app (7 callers) |
| `contractRepositorySlice.js`, `contractDetailSlice.js`, `obligationsSlice.js` | [contract-repository](/modules/contract-repository.md) |
| `clauseAnalysisSlice.js` | [clause-analysis](/modules/clause-analysis.md) |
| `negotiationSlice.js` | [negotiation](/modules/negotiation.md) |
| `templateLibrarySlice.js` | [templates](/modules/templates.md) |
| `settingsAdminSlice.js` | [settings-admin](/modules/settings-admin.md) |
| `trackerFiltersSlice.js` | [tracker](/modules/tracker.md) — `setActiveTab` is a top-10 hotspot (6 callers) |

Per `get_architecture` boundaries, `features -> store` accounts for 9 direct
calls and `pages -> store` for 32 — pages reach into store slices directly for
read/filter state as often as through feature hooks (see
[architecture.md](/architecture.md)).
