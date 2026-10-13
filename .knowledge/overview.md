---
type: Codebase Overview
title: life-cycle-frontend
description: React + Vite frontend implementing a multi-module contract lifecycle management application (dashboard, drafting, negotiation, approvals, e-signature, repository, and tenant admin/tracker).
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/
tags: [frontend, react, vite, overview]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

## Purpose

A contract-lifecycle-management SPA: dashboard/triage, contract drafting and
repository, AI-assisted clause analysis, negotiation/routing, approvals,
e-signature, and a reporting/admin tracker — each generated as a separate
contract module against a shared React scaffold and a FastAPI/PostgreSQL
backend (see root `CLAUDE.md` for the full API contract).

## Stack

- **Framework**: React 18 (JavaScript, not TypeScript — `npm run typecheck` is a no-op), React Router v6, Vite 5.
- **State**: Zustand slices under `src/store/`.
- **Styling**: Tailwind CSS (`tailwind.config.js`, `src/index.css`), `clsx` for conditional classes.
- **Testing**: Vitest + Testing Library, screen tests in `src/__tests__/`.
- **No UI component library** — no `src/shared/components/ui/` primitives exist yet; each feature hand-rolls its own markup (badges, modals, dialogs) directly in its component files.

## Scripts (`package.json`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Dev server |
| `build` | `vite build` | Production build |
| `lint` | `eslint src --max-warnings 0` | Zero-warning lint gate |
| `test` | `vitest run --passWithNoTests` | Unit/component tests |
| `typecheck` | `echo 'no typecheck (javascript)'` | Placeholder — project is plain JS |

## Entry points

- `src/main.jsx` — Vite/React bootstrap.
- `src/App.jsx` — [App router](/modules/app-routing.md): declares every route, wraps authenticated screens in `AppLayout`, keeps `/login`, `/negotiation/external/:linkToken` and `/sign/:sessionId` outside the sidebar shell.
- `src/shared/components/AppLayout.jsx` + `SidebarNav.jsx` — [shared app shell](/modules/shared.md).

## Directory layout

```
src/pages/<ScreenName>.jsx        route-level screens, one per screen
src/features/<feature>/           components + hooks scoped to one feature
src/shared/components/            app-shell components (sidebar, layout)
src/services/                     typed-by-convention API clients over http.js
src/store/                        zustand slices
src/__tests__/                    screen-level tests
```

See [Architecture](/architecture.md) for module boundaries and [Conventions](/conventions.md)
for the API/auth/testing rules every module follows.

## Modules implemented so far

| Module | Status |
|---|---|
| uc123 — ContractLifecycleModule (dashboard, repository list, new contract, templates/clauses) | built |
| lifecycle-uc4-uc5 — LifecycleNegotiationModule (clause analysis, negotiation tracker, external review) | built |
| uc6-uc7-combined — ApprovalsAndEsignatureModule | built |
| life-cycle-uc8-uc9 — ContractRepositoryModule (repository detail, obligations/renewal) | built |
| lifecycle-uc10-uc11 — TrackerAndSettingsModule (tracker tabs, settings/admin) | built |

See [modules/index.md](/modules/index.md) for the per-directory breakdown used by this bundle
(which groups by source package rather than by generation module).
