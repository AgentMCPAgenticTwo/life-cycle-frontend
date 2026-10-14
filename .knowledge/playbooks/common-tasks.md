---
type: Playbook
title: Common tasks
description: Where to go to change a given thing in life-cycle-frontend, without re-discovering the directory layout each time.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/
tags: [frontend, playbook]
generated: { by: sage-maintenance/claude-code, at: 2026-10-14T12:33:45Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ f7c53e07c639c02ca5973ae775bd63b8c6ccc08a
    title: Codebase knowledge graph
status: stable
---

| To change... | Go to |
|---|---|
| Add a new route/screen | Add the file under `src/pages/`, add a `<Route>` in `src/App.jsx` — see [app-routing](/modules/app-routing.md). Decide if it needs the sidebar (`AppLayout` wrapper) or is standalone like `/login`. |
| Add a field to an existing API call | The matching service module in [services](/modules/services.md) — match the field name/casing to the DTO in `CLAUDE.md` exactly, don't invent one. |
| Add a new backend-driven screen state (loading/empty/error/populated) | The page component plus its feature hook — no mock fallback per [conventions.md](/conventions.md); error state must come from a thrown `HttpError`. |
| Change the sidebar or app shell | [shared](/modules/shared.md) (`AppLayout.jsx`, `SidebarNav.jsx`). |
| Add a role-gated screen | Follow `NewContractAccessGuard` in [contracts](/modules/contracts.md) as the pattern, but the backend's `X-User-Role` check is still the source of truth (401/403). |
| Add a shared UI primitive (badge, modal, dialog) | There is no `ui/` folder yet — add it under `src/shared/components/` per [shared](/modules/shared.md), don't duplicate another feature's copy (e.g. `StatusBadge` currently exists twice). |
| Download a file the API serves (export, document) | `downloadAndSave` from `src/shared/utils/fileDownload.js`, which fetches through `downloadFile` in [services](/modules/services.md#file-downloads). Never `window.open` or an `<a href>` at a `fileUrl`/`downloadUrl` — those are auth-gated API routes and the SPA router answers them with a blank page. |
| Add/modify a zustand slice | [store](/modules/store.md) — one slice per feature, no outbound HTTP calls from slice code. |
| Find which generation module owns a screen | [reference/generation-modules.md](/reference/generation-modules.md). |
| Re-derive hotspots/clusters/boundaries after a refactor | [reference/graph-queries.md](/reference/graph-queries.md). |
| Add a test | Unit test next to the component/hook (`*.test.jsx`); screen test in `src/__tests__/<Page>.test.jsx`, mocking `src/services/http.js`. |
