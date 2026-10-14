---
type: Module
title: src/features/templates
description: Template and clause library -- editing, versioning, activate/deactivate lifecycle for both templates and clauses.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/templates
tags: [frontend, templates, clauses]
generated: { by: sage-maintenance/claude-code, at: 2026-10-14T06:42:15Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 2a331598f5b32710821c162cc01f1bc7c536da11
    title: Codebase knowledge graph
status: stable
---

## Components (`components/`)

`TemplatesTab.jsx`, `ClauseLibraryTab.jsx`, `TemplateEditor.jsx`,
`ClauseEditor.jsx`, `VersionHistoryModal.jsx`, `RiskLevelBadge.jsx`,
`LibraryStatusBadge.jsx`.

### Template file upload (UC3)

`TemplateEditor.handleTemplateFileChange` accepts a template document and
derives `documentFormat` from the extension via `EXTENSION_TO_FORMAT`,
rejecting anything else with `UNSUPPORTED_FORMAT_MESSAGE` and anything over
`MAX_TEMPLATE_FILE_BYTES` with `OVERSIZED_FILE_MESSAGE`; both clear the picked
file and surface through local `fileError` state. The input is reset after each
pick so re-selecting the same file re-validates. `validate` additionally caps
`templateName` at `MAX_NAME_LENGTH`. The file itself is metadata-only here —
`handleSave` still submits the four `templateName` / `templateCategory` /
`documentFormat` / `templateBody` fields.

## Hooks (`hooks/`)

`useTemplates.js`, `useCreateTemplate.js`, `useUpdateTemplate.js`,
`useDeactivateTemplate.js`, `useReactivateTemplate.js`, `useTemplateVersions.js`,
`useClauses.js`, `useCreateClause.js`, `useUpdateClause.js`,
`useDeactivateClause.js`, `useReactivateClause.js`, `useClauseVersions.js`.

Backed by [`templatesService.js`](/modules/services.md) and `clausesService.js`
calling `GET/POST /api/v1/templates`, `PUT .../templates/{id}`,
`POST .../templates/{id}/deactivate|reactivate`, `GET .../templates/{id}/versions`,
and the equivalent `/api/v1/clauses*` set.

This is the most cohesive cluster in the app (`TemplateEditor`, `ClauseEditor`,
`LibraryStatusBadge`, `update`, `insertMergeField` — cohesion 1.0; see
[architecture.md](/architecture.md)), plus a second cluster with
`TemplateClauseLibraryPage`/`setActiveTab`/`openNew`/`useTemplateVersions`/`useUpdateClause`
(cohesion 0.89).

## Consumed by

`src/pages/TemplateClauseLibraryPage.jsx` (`/settings/template-clause-library`)
— part of the `uc123` generation module.
