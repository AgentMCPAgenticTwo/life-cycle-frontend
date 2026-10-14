---
type: Module
title: src/features/tracker
description: Reporting screen with four tabs (ownership, cycle-time, bottleneck, turnaround), period/filter controls, export, and estimated-turnaround override.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/tracker
tags: [frontend, tracker, reporting]
generated: { by: sage-maintenance/claude-code, at: 2026-10-14T06:42:15Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 2a331598f5b32710821c162cc01f1bc7c536da11
    title: Codebase knowledge graph
status: stable
---

Flat directory (components directly under `src/features/tracker/`, like
[settings-admin](/modules/settings-admin.md)).

## Components

`TrackerReportControlsPanel.jsx`, `OwnershipTab.jsx`, `CycleTimeTab.jsx`,
`BottleneckTab.jsx`, `TurnaroundTab.jsx`, `TrackerEmptyState.jsx` (+ `.test.jsx`,
a top-10 hotspot with 4 callers), `TrackerExportButton.jsx` (its `FORMATS`
constant fixes the offered export formats to `Excel` and `PDF`, matching the
`format` field of `TrackerExportRequest`).

## Hooks (`hooks/`)

`useOwnershipTab.js`, `useCycleTimeTab.js`, `useBottleneckTab.js`,
`useTurnaroundTab.js`, `useTrackerTabData.js`, `useTrackerExport.js`,
`useTrackerFilterOptions.js`, `useBottleneckThresholds.js`,
`useEstimatedTurnaroundOverride.js`.

Backed by [`trackerService.js`](/modules/services.md)
(`buildTrackerQuery` is a top-10 hotspot, 4 callers) calling
`GET /api/v1/tracker/ownership|cycle-time|bottleneck|turnaround`,
`POST /api/v1/tracker/export`,
`PUT /api/v1/tracker/turnaround/{contractId}/estimated-override`,
`GET`/`PUT /api/v1/tracker/bottleneck-thresholds`.

### Editable stuck-flag thresholds

`useBottleneckThresholds` is Tenant-Admin-gated through `useAuth`: other roles
skip the fetch entirely (the Stuck Flag itself stays server-computed for every
entitled role). For a Tenant Admin it also exposes `canEdit`, `isSaving` and
`saveThresholds`, which `PUT`s the list via `updateBottleneckThresholds` and
stores the saved rows. `BottleneckTab` drives that from a local `draft`:
`startEditing` seeds it from `thresholds`, `handleSaveThresholds` rejects blank
/ non-positive days with `INVALID_THRESHOLD_MESSAGE` and, on success, calls
`onRetry` so the rows re-fetch and the Stuck Flag reflects the new thresholds
immediately.

## State

[`store/trackerFiltersSlice.js`](/modules/store.md) — `setActiveTab` is a
top-10 hotspot (6 callers). Forms a call cluster with `TrackerPage`,
`useTrackerTabData`, `useTrackerExport`, `useBottleneckTab`, `useCycleTimeTab`
(cohesion 0.93).

## Consumed by

`src/pages/TrackerPage.jsx` (`/tracker`) — part of the `lifecycle-uc10-uc11`
generation module (shared with [settings-admin](/modules/settings-admin.md)).
