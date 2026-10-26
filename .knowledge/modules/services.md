---
type: Module
title: src/services
description: One typed client module per REST resource group, all built on the shared HTTP client (http.js) that attaches the bearer token, renews it, and normalizes errors.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/services
tags: [frontend, services, api]
generated: { by: sage-maintenance/claude-code, at: 2026-10-26T07:50:32Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 7581a5dfb9310727b699037e534651679b3bb36b
    title: Codebase knowledge graph
status: stable
---

## `http.js` — the shared client

Every other service module imports this. `post` (13 callers) and `request` (5
callers, direct) are the single busiest functions in the whole dependency
graph — see [architecture.md](/architecture.md#hotspots). It reads
`VITE_API_BASE_URL` (throws at startup if unset — no mock fallback), sends
`credentials: 'include'`, attaches `Authorization: Bearer <accessToken>` read from
`useAuthStore` (not the old `X-User-Role`/`X-User-Id` dev headers), skips
`Content-Type` for `FormData` bodies, and converts non-2xx responses into a thrown
`HttpError` carrying `{ error, details }`. `request` takes a `raw` option that
returns the `Response` untouched instead of parsing JSON, and maps `204` to
`undefined`.

### Access-token renewal

Both halves of the token lifecycle live in this module, so no screen has to arm
anything itself.

| Symbol | Role |
|---|---|
| `accessTokenExpiryMs(token)` | Base64-decodes the JWT payload and returns `exp * 1000`; `null` for an opaque/unreadable token, which falls back to 401 recovery. |
| `scheduleTokenRenewal(token)` / `stopTokenRenewal()` | Arm/cancel the single `renewalTimer`, firing `RENEWAL_SKEW_MS` (60s) before expiry and clamped to `MAX_TIMEOUT_MS`; the timer is `unref`'d so tests do not hang. |
| `refreshSession()` | POSTs `/auth/refresh` with the httpOnly cookie and **no body or `Content-Type`** (a preflight there can drop the cookie), stores the new token, and shares one in-flight `refreshPromise` across concurrent callers. |
| `useAuthStore.subscribe(...)` | Re-arms renewal on every access-token change and disarms on `clearSession()`. |

Reactive path: a `401` on a refreshable path refreshes once and retries with
`skipAuthRetry: true`. `NON_REFRESHABLE_PATHS` (`/auth/login`, `/auth/refresh`,
`/auth/logout`) are excluded via `isRefreshable`; `/auth/me` and
`/auth/change-password` are ordinary bearer calls and *do* retry. When the refresh
itself fails, the session is cleared and `redirectToLogin()` navigates to `/login`.

`refreshSession` is also called directly by
[`useAuth().restoreSession`](/modules/shared.md#srcsharedhooks).

### File downloads

`downloadFile(url)` is the JSON-free escape hatch built on that `raw` option. It
accepts an absolute URL (plain `fetch` with `credentials: 'include'`) or an
API-relative path (`request(..., { raw: true })`, so the auth header is attached and
the 401 retry still applies), throws the usual `HttpError` on a non-2xx, and returns
`{ blob, fileName }` with `fileName` parsed out of `Content-Disposition` via
`FILENAME_PATTERN`. Callers go through
[`shared/utils/fileDownload.js`](/modules/shared.md#srcsharedutils) rather than
calling this directly.

## Resource modules (21 total)

| Service | Feature(s) it backs |
|---|---|
| `dashboardService.js` | [dashboard](/modules/dashboard.md) |
| `contractsService.js`, `counterpartiesService.js`, `templatesService.js` | [contracts](/modules/contracts.md) |
| `contractRepositoryService.js` | [contract-repository](/modules/contract-repository.md) |
| `lifecycleClauseAnalysisService.js` | [clause-analysis](/modules/clause-analysis.md) |
| `lifecycleNegotiationService.js` | [negotiation](/modules/negotiation.md) |
| `approvalsService.js`, `approvalMatrixConfigService.js` | [approvals](/modules/approvals.md) |
| `signersService.js`, `signingSessionService.js`, `esignatureSettingsService.js` | [esignature](/modules/esignature.md) |
| `clausesService.js` | [templates](/modules/templates.md) (clause library side) |
| `settingsUsersService.js`, `settingsApprovalRulesService.js`, `settingsIntegrationsService.js`, `settingsNotificationsService.js`, `settingsAuditLogService.js` | [settings-admin](/modules/settings-admin.md) |
| `trackerService.js` | [tracker](/modules/tracker.md) |
| `usersService.js` | [contracts](/modules/contracts.md) (owner lookups) |

## Convention

Per `CLAUDE.md`: one service module per resource group, calling exactly the
paths/methods/field names in the module contract — never an invented URL or
renamed field. Multipart endpoints (`contractsService.js`'s third-party-paper
upload) send `FormData` and must not set `Content-Type` by hand.
