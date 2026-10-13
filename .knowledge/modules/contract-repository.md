---
type: Module
title: src/features/contract-repository
description: Contract search/repository list, contract detail tabs (details, document, versions, activity log), and obligations/renewal workflows.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/contract-repository
tags: [frontend, contract-repository, obligations]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

Largest feature directory (64 files). Split across three sub-areas:

## Repository search/list (`components/`)

`SearchFilterPanel.jsx`, `ContractListTable.jsx`, `NoResultsMessage.jsx`,
`EmptyRepositoryState.jsx`, `IndexingInProgressBanner.jsx`,
`AccessDeniedView.jsx` (+ `.test.jsx`), `AddFolderTagDialog.jsx`, `StatusBadge.jsx`.

## Contract detail tabs

`ContractDetailsTab.jsx`, `ContractDocumentTab.jsx` (+ `.test.jsx`),
`ContractVersionsTab.jsx`, `ContractActivityLogTab.jsx`, `DownloadButton.jsx`
(+ `.test.jsx`).

## Obligations & renewal

`ObligationsTable.jsx`, `ObligationRowForm.jsx`, `ManualObligationForm.jsx`,
`ObligationsEmptyState.jsx`, `ObligationsTabBlockedMessage.jsx`,
`ObligationsAccessDeniedView.jsx`, `ObligationBadges.jsx`, `RenewalAlertPanel.jsx`,
`RenewAmendTerminateButtons.jsx`, `TerminationReasonDialog.jsx` (+ `.test.jsx`).

## Utils

`utils/format.js` — `formatDate` is a top-10 hotspot (6 callers across this directory).

## Hooks (`hooks/`)

`useContractSearch.js`, `useContractDetail.js`, `useContractDocument.js`,
`useDocumentDownload.js`, `useContractVersions.js`, `useActivityLog.js`,
`useAssignFolderTag.js`, `useFolderTagOptions.js`, `useObligations.js`,
`useCreateObligation.js` (top hotspot in the whole graph, 11 callers),
`useUpdateObligation.js`, `useAcceptObligation.js`, `useRenewalPanel.js`,
`useRenewContract.js`, `useAmendContract.js`, `useTerminateContract.js`.

Backed by [`contractRepositoryService.js`](/modules/services.md) calling the
`GET /api/v1/contracts`, `GET/PATCH /api/v1/contracts/{contractId}/obligations*`,
`GET /api/v1/contracts/{contractId}/renewal`, `POST .../renew|amend|terminate`
family of endpoints.

## State

[`store/contractRepositorySlice.js`](/modules/store.md) (`setFilters`, fan-in 4),
[`store/contractDetailSlice.js`](/modules/store.md), [`store/obligationsSlice.js`](/modules/store.md).

## Consumed by

`src/pages/ContractRepositoryListPage.jsx`, `ContractDetailPage.jsx`,
`ContractRepositoryPage.jsx`, `ObligationsRenewalPage.jsx` — split across the
`uc123` and `life-cycle-uc8-uc9` generation modules.
