---
type: Reference
title: Generation-module to source-directory mapping
description: Maps each generated module name tracked in root CLAUDE.md to the source directories it actually touches, for when a task names a module instead of a path.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/CLAUDE.md
tags: [frontend, reference]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

`CLAUDE.md`'s "Modules (generated)" section tracks work by generation run, not
by directory. This table is the cross-reference:

| Generation module (CLAUDE.md) | Source modules in this bundle |
|---|---|
| `uc123` — ContractLifecycleModule | [dashboard](/modules/dashboard.md), [contracts](/modules/contracts.md) (incl. `ContractRepositoryListPage`/`NewContractPage`), [templates](/modules/templates.md) |
| `lifecycle-uc4-uc5` — LifecycleNegotiationModule | [clause-analysis](/modules/clause-analysis.md), [negotiation](/modules/negotiation.md) |
| `uc6-uc7-combined` — ApprovalsAndEsignatureModule | [approvals](/modules/approvals.md), [esignature](/modules/esignature.md) |
| `life-cycle-uc8-uc9` — ContractRepositoryModule | [contract-repository](/modules/contract-repository.md) |
| `lifecycle-uc10-uc11` — TrackerAndSettingsModule | [tracker](/modules/tracker.md), [settings-admin](/modules/settings-admin.md) |
| (not in `CLAUDE.md` modules yet) | [app-routing](/modules/app-routing.md), [pages](/modules/pages.md), [shared](/modules/shared.md) app shell and `LoginPage` — added in the UI-correction commit `49e9748`, outside any generated module's contract |

When `CLAUDE.md` is regenerated with a new module section, add that module's
row here and update the corresponding source-directory concept file rather
than creating a duplicate module concept.
