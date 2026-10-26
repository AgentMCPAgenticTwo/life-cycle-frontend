---
type: Module
title: src/shared
description: The app shell (sidebar navigation + responsive layout), the shared file-download util, and the useAuth hook every screen reads identity/session actions from; no shared UI primitives exist yet.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/shared
tags: [frontend, shared, layout, auth]
generated: { by: sage-maintenance/claude-code, at: 2026-10-26T11:32:49Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 56a4d78b23d089f6cbac46533abb845483a97044
    title: Codebase knowledge graph
status: stable
---

## Files (`components/`)

- `AppLayout.jsx` — layout shell rendered by the `<Route element={<AppLayout />}>` wrapper group in [app-routing](/modules/app-routing.md). Holds `isSidebarOpen` state, renders `SidebarNav` plus a mobile-only hamburger header, and an `<Outlet />` for the matched page.
- `SidebarNav.jsx` (+ `SidebarNav.test.jsx`) — persistent sidebar on `md+` screens, slide-in drawer below that breakpoint; takes `isOpen`/`onClose` from `AppLayout`.

## `src/shared/utils`

- `fileDownload.js` — the one place the app turns an API-served file into a browser
  download. `saveBlob(blob, fileName)` creates an object URL, clicks a synthetic
  `<a download>` and revokes the URL; `downloadAndSave(url, fallbackName)` wraps
  `downloadFile` from [`services/http.js`](/modules/services.md#file-downloads) and
  prefers the server's `Content-Disposition` name over `fallbackName`.
  Used by [`useTrackerExport`](/modules/tracker.md) and
  [`useDocumentDownload`](/modules/contract-repository.md). Any new "download this
  file" path belongs here rather than in a `window.open` / `<a href>` at the call site.

## `src/shared/hooks`

- `useAuth.js` — single entry point for the signed-in user's identity and
  session actions, reading/writing `useAuthStore` and wrapping
  `authService`/[`services/http.js`](/modules/services.md#session-refresh):
  - `login(email, password)` calls `authService.login`, stores the session,
    and arms `scheduleProactiveRefresh` with the new access token.
  - `logout()` calls `authService.logout`, then always (`finally`) calls
    `clearScheduledRefresh` before clearing the store, so a pending refresh
    timer can't fire after sign-out.
  - `restoreSession()` is the full-page-reload path: calls `refreshSession()`
    against the httpOnly cookie, then `authService.getCurrentUser()`; a
    failure (no valid cookie) just clears the session rather than throwing —
    that's the normal "not signed in" state — and always flips
    `isInitializing` off in a `finally`.
  - `changePassword(current, next)` calls `authService.changePassword` and
    flips `user.mustChangePassword` off.
  - Returns `{ user, role, userId, isAuthenticated, isInitializing, login,
    logout, changePassword, restoreSession }`; `role`/`userId` read off
    `user.role`/`user.id` so callers never touch `useAuthStore` directly for
    those.

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
