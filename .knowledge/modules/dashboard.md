---
type: Module
title: src/features/dashboard
description: Status summary, my-tasks and high-risk-contracts panels shown on the landing DashboardPage, filterable by owner/counterparty/date range.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/dashboard
tags: [frontend, dashboard]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

## Components (`components/`)

`DashboardFiltersBar.jsx`, `HighRiskContractsPanel.jsx`, `MyTasksPanel.jsx`, `StatusCardGroup.jsx`.

## Hooks (`hooks/`)

Backed by [`dashboardService.js`](/modules/services.md), which calls `GET /api/v1/dashboard/summary`,
`GET /api/v1/dashboard/my-tasks`, `GET /api/v1/dashboard/high-risk-contracts`, `GET /api/v1/dashboard/filters`.

## State

[`store/dashboardFilterSlice.js`](/modules/store.md) holds the owner/counterparty/date-range filter state; `buildDashboardQuery`/`validateRange` form a tight call cluster with `DashboardPage` (cohesion 0.94, see [architecture.md](/architecture.md)).

## Consumed by

`src/pages/DashboardPage.jsx` (route `/`) — part of the `uc123` generation module (see [generation-modules reference](/reference/generation-modules.md)).
