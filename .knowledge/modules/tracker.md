---
type: Module
title: src/features/tracker
description: Reporting screen with four tabs (ownership, cycle-time, bottleneck, turnaround), period/filter controls, export, and estimated-turnaround override.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/tracker
tags: [frontend, tracker, reporting]
generated: { by: sage-maintenance/claude-code, at: 2026-10-14T12:33:45Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ f7c53e07c639c02ca5973ae775bd63b8c6ccc08a
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

### Export

`useTrackerExport` treats a `TrackerExportResponse` with no `fileUrl` as a failure
(it returns `{ ...response, success: false }` and sets `failureMessage`), and on
success fetches the file itself through `downloadAndSave` from
[`shared/utils/fileDownload.js`](/modules/shared.md#srcsharedutils) — `fileUrl` is an
authenticated API route, so opening it in a tab lands on a blank SPA page. The saved
name is `tracker-<tab>.<ext>` from `FORMAT_EXTENSIONS` (`Excel` → `xlsx`,
`PDF` → `pdf`), used only when the response carries no `Content-Disposition`.
`TrackerPage.handleExport` awaits it so `isExporting` spans the whole download.

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
