---
type: Module
title: src/features/settings-admin
description: Tenant-admin screen -- five tabs (users, routing/approval rules, integrations, notifications, audit log) under /settings/admin.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/settings-admin
tags: [frontend, settings, admin]
generated: { by: sage-maintenance/claude-code, at: 2026-10-14T04:55:25Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 2980c74caa4fa3952f31f5cbaeff19b40c6dd55c
    title: Codebase knowledge graph
status: stable
---

Flat directory (components live directly under `src/features/settings-admin/`,
not a `components/` subfolder, unlike other features).

## Components

- Users tab: `UserManagementTab.jsx`, `AddUserForm.jsx`, `UserStatusActionControl.jsx` (+ `.test.jsx`).
- Routing/approval tab: `RoutingApprovalTab.jsx`, `AddRuleForm.jsx`.
- Integrations tab: `IntegrationsTab.jsx`, `IntegrationConnectForm.jsx` (+ `.test.jsx`).
- Notifications tab: `NotificationsTab.jsx`.
- Audit log tab: `AuditLogTab.jsx`, `AuditLogFilterPanel.jsx`.

### Notifications tab error surface

`NotificationsTab` takes four request-state props from `SettingsAdminPage` —
`isLoading` / `error` + `onRetry` for the list fetch, and `updateError` for a
failed toggle write. `handleToggleNotification` swallows the thrown `HttpError`
so the page does not unmount; `useUpdateNotificationEvent` retains it and the
page passes `updateNotificationEvent.error?.message` down as `updateError`,
rendered as a `role="alert"` banner above the event list. `pendingEventName`
disables only the toggles of the event currently being written.

### Audit log tab

`AuditLogTab.jsx` renders the read-only, newest-first table plus a `role="note"`
immutability line ("Audit log entries cannot be modified or deleted.") under the
"Read-only record of system activity" subtitle. The same notice appears in
[clause-analysis](/modules/clause-analysis.md)'s `AuditLogViewer.jsx`, so both
audit surfaces state the guarantee identically.

## Hooks (`hooks/`)

`useTenantUsers.js`, `useCreateUser.js`, `useUpdateUserStatus.js`,
`useApprovalRules.js`, `useCreateApprovalRule.js`, `useIntegrations.js`,
`useConnectIntegration.js`, `useDisconnectIntegration.js`,
`useNotificationEvents.js`, `useUpdateNotificationEvent.js`, `useAuditLog.js`.

Backed by [`settingsUsersService.js`](/modules/services.md),
`settingsApprovalRulesService.js`, `settingsIntegrationsService.js`,
`settingsNotificationsService.js`, `settingsAuditLogService.js` calling the
`/api/v1/settings/users*`, `/api/v1/settings/approval-rules`,
`/api/v1/settings/integrations/{integrationName}/connect|disconnect`,
`/api/v1/settings/notifications/{eventName}`, `/api/v1/settings/audit-log`
endpoints.

## State

[`store/settingsAdminSlice.js`](/modules/store.md) — forms a call cluster with
`SettingsAdminPage`, `useApprovalRules`, `useTenantUsers`, `useCreateUser`,
`useNotificationEvents` (cohesion 0.9).

## Consumed by

`src/pages/SettingsAdminPage.jsx` (`/settings/admin`) — part of the
`lifecycle-uc10-uc11` generation module (shared with [tracker](/modules/tracker.md)).
`UserStatusActionControl` must block deactivating the last active
`TENANT_ADMIN` per the module's acceptance criteria in `CLAUDE.md`.
