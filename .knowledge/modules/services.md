---
type: Module
title: src/services
description: One typed client module per REST resource group, all built on the shared HTTP client (http.js) that attaches auth headers and normalizes errors.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/services
tags: [frontend, services, api]
generated: { by: sage-maintenance/claude-code, at: 2026-10-14T12:33:45Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ f7c53e07c639c02ca5973ae775bd63b8c6ccc08a
    title: Codebase knowledge graph
status: stable
---

## `http.js` — the shared client

Every other service module imports this. `post` (13 callers) and `request` (5
callers, direct) are the single busiest functions in the whole dependency
graph — see [architecture.md](/architecture.md#hotspots). Per `CLAUDE.md`:
reads `VITE_API_BASE_URL` (throws at startup if unset), attaches `X-User-Role`
and `X-User-Id` to every call, and converts non-2xx responses into a thrown
`HttpError` carrying `{ error, details }`.

`request` also handles the 401 → `refreshSession` → retry path, and takes a
`raw` option that returns the `Response` untouched instead of parsing JSON.

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
