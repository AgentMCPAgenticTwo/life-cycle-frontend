---
type: Module
title: src/shared/components
description: The app shell (sidebar navigation + responsive layout) that wraps every authenticated route; no shared UI primitives exist yet.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/shared/components
tags: [frontend, shared, layout]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

## Files

- `AppLayout.jsx` — layout shell rendered by the `<Route element={<AppLayout />}>` wrapper group in [app-routing](/modules/app-routing.md). Holds `isSidebarOpen` state, renders `SidebarNav` plus a mobile-only hamburger header, and an `<Outlet />` for the matched page.
- `SidebarNav.jsx` (+ `SidebarNav.test.jsx`) — persistent sidebar on `md+` screens, slide-in drawer below that breakpoint; takes `isOpen`/`onClose` from `AppLayout`.

## No `ui/` primitives

Unlike the layout above `CLAUDE.md` expects (`src/shared/components/ui/`), this
directory has no button/input/dialog/select primitives. Every feature
(`approvals`, `contract-repository`, `contracts`, `esignature`, `negotiation`,
`templates`, `tracker`) implements its own modals, badges and forms directly —
e.g. `StatusBadge.jsx` exists separately in both
`features/contract-repository/components/` and `features/contracts/components/`.
If a module needs a cross-feature primitive, write it here per `CLAUDE.md`
rather than duplicating it again or adding a dependency.

## Added by

Commit `49e9748` ("Add a Login page and responsive Sidebar Navigation") —
the most recent UI correction run, which also added `src/pages/LoginPage.jsx`.
