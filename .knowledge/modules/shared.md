---
type: Module
title: src/shared
description: The app shell (sidebar navigation + responsive layout) that wraps every authenticated route, plus the shared auth hook and file-download util; no shared UI primitives exist yet.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/shared
tags: [frontend, shared, layout]
generated: { by: sage-maintenance/claude-code, at: 2026-10-26T07:50:32Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 7581a5dfb9310727b699037e534651679b3bb36b
    title: Codebase knowledge graph
status: stable
---

## Files (`components/`)

- `AppLayout.jsx` — layout shell rendered by the `<Route element={<AppLayout />}>` wrapper group in [app-routing](/modules/app-routing.md). Holds `isSidebarOpen` state, renders `SidebarNav` plus a mobile-only hamburger header, and an `<Outlet />` for the matched page.
- `SidebarNav.jsx` (+ `SidebarNav.test.jsx`) — persistent sidebar on `md+` screens, slide-in drawer below that breakpoint; takes `isOpen`/`onClose` from `AppLayout`.

## `src/shared/hooks`

- `useAuth.js` (+ `useAuth.test.jsx`) — the single entry point for the signed-in
  user's identity and session actions, replacing the old dev
  `authHeaders.role` / `authHeaders.userId` constants. Reads `user`,
  `accessToken` and `isInitializing` from [`authStore`](/modules/store.md) and
  exposes `role`, `userId`, `isAuthenticated`, plus four actions:

  | Action | Behaviour |
  |---|---|
  | `login(email, password)` | `authService.login` → `setSession({ user, accessToken })`. |
  | `logout()` | `authService.logout()` in a `try`, `clearSession()` in the `finally`, so a failed call still signs the user out locally. |
  | `changePassword(current, new)` | `authService.changePassword` then `setUser({ mustChangePassword: false })`. |
  | `restoreSession()` | On a full page reload, exchanges the httpOnly cookie via [`refreshSession`](/modules/services.md#access-token-renewal) then `authService.getCurrentUser()`. **Returns early when a token and user are already in memory** — re-rotating the just-issued cookie right after login bought nothing and bounced the user back to `/login` on any hiccup. A failure is `clearSession()`, not a throw ("not signed in yet" is normal); `setInitializing(false)` runs in the `finally` either way. |

  Consumers: `components/ProtectedRoute.jsx` (the route guard used by
  [app-routing](/modules/app-routing.md)), `components/SidebarNav.jsx`, and
  role-gated hooks such as `useBottleneckThresholds` in [tracker](/modules/tracker.md).

## `src/shared/utils`

- `fileDownload.js` — the one place the app turns an API-served file into a browser
  download. `saveBlob(blob, fileName)` creates an object URL, clicks a synthetic
  `<a download>` and revokes the URL; `downloadAndSave(url, fallbackName)` wraps
  `downloadFile` from [`services/http.js`](/modules/services.md#file-downloads) and
  prefers the server's `Content-Disposition` name over `fallbackName`.
  Used by [`useTrackerExport`](/modules/tracker.md) and
  [`useDocumentDownload`](/modules/contract-repository.md). Any new "download this
  file" path belongs here rather than in a `window.open` / `<a href>` at the call site.

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
