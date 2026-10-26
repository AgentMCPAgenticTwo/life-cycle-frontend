---
type: Module
title: src/features/contract-repository
description: Contract search/repository list, contract detail tabs (details, document, versions, activity log), and obligations/renewal workflows.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/contract-repository
tags: [frontend, contract-repository, obligations]
generated: { by: sage-maintenance/claude-code, at: 2026-10-26T08:50:12Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ e65c8529ee9bb23788b7fb597b34811e58b5019e
    title: Codebase knowledge graph
status: stable
---

Largest feature directory (64 files). Split across three sub-areas:

## Repository search/list (`components/`)

`SearchFilterPanel.jsx`, `ContractListTable.jsx`, `NoResultsMessage.jsx`,
`EmptyRepositoryState.jsx`, `IndexingInProgressBanner.jsx`,
`AccessDeniedView.jsx` (+ `.test.jsx`), `AddFolderTagDialog.jsx`, `StatusBadge.jsx`,
`HighlightedText.jsx`.

`HighlightedText.jsx` exports `HighlightedText` plus a local `escapeRegExp` helper;
it splits a cell value on the active search term and wraps matches in `<mark>`.
Its only caller is `ContractListTable.jsx`, which passes the repository search
query down so matched text is highlighted in the results table.

## Contract detail tabs

`ContractDetailsTab.jsx`, `ContractDocumentTab.jsx` (+ `.test.jsx`),
`ContractVersionsTab.jsx`, `ContractActivityLogTab.jsx`, `DownloadButton.jsx`
(+ `.test.jsx`).

`ContractDetailsTab.jsx` renders `id`, `contractType`, `counterpartyName`,
`status`, `startDate`/`endDate`, `contractValue`/`currency` and
`contractOwnerName` — these field names were corrected to match the
`ContractDetailResponse` DTO exactly (the generated version used
`contractId`/`counterparty`/`value`/`owner`, which left the tab blank against
the real API). `formatCurrency(value, currency = 'USD')` in `utils/format.js`
now takes the row's `currency` instead of hard-coding `'USD'`.

## Obligations & renewal

`ObligationsTable.jsx`, `ObligationRowForm.jsx`, `ManualObligationForm.jsx`,
`ObligationsEmptyState.jsx`, `ObligationsTabBlockedMessage.jsx`,
`ObligationsAccessDeniedView.jsx`, `ObligationBadges.jsx`, `RenewalAlertPanel.jsx`,
`RenewAmendTerminateButtons.jsx`, `TerminationReasonDialog.jsx` (+ `.test.jsx`).

## Utils

`utils/format.js` — `formatDate` is a top-10 hotspot (6 callers across this directory).

## Hooks (`hooks/`)

`useContractSearch.js`, `useContractDetail.js`, `useContractDocument.js`,
`useDocumentDownload.js` (see below), `useContractVersions.js`, `useActivityLog.js`,
`useAssignFolderTag.js`, `useFolderTagOptions.js`, `useObligations.js`,
`useCreateObligation.js` (top hotspot in the whole graph, 11 callers),
`useUpdateObligation.js`, `useAcceptObligation.js`, `useRenewalPanel.js`,
`useRenewContract.js`, `useAmendContract.js`, `useTerminateContract.js`.

### Document download

`useDocumentDownload.js` does not point an `<a href>` at the `fileUrl` returned by
`getDocumentDownload` — that URL is an API route behind the auth header, so the SPA
router answers it and the user sees a blank page. It calls `downloadAndSave` from
[`src/shared/utils/fileDownload.js`](/modules/shared.md#srcsharedutils) instead,
falling back to the last path segment (or `contract-document`) as the file name, and
surfaces `RETRIEVAL_ERROR` on a rejected fetch while `isDownloading` gates the button.

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
