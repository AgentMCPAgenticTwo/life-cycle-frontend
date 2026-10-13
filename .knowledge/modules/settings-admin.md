---
type: Module
title: src/features/settings-admin
description: Tenant-admin screen -- five tabs (users, routing/approval rules, integrations, notifications, audit log) under /settings/admin.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/settings-admin
tags: [frontend, settings, admin]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
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
