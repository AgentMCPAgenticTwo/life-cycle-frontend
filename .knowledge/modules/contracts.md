---
type: Module
title: src/features/contracts
description: New-contract drafting flow -- type/industry/template selection, third-party paper upload, counterparty panel, and the role guard on /contracts/new.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/contracts
tags: [frontend, contracts, drafting]
generated: { by: sage-maintenance/claude-code, at: 2026-10-14T05:27:12Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 901976f229bbcc1750ffec78c46e6fc09a4d0882
    title: Codebase knowledge graph
status: stable
---

## Components (`components/`)

`ContractDetailsForm.jsx`, `CounterpartyPanel.jsx`, `NewContractAccessGuard.jsx` (+ `.test.jsx`),
`UploadThirdPartyPaperControl.jsx`, `ContractTypeIndustryTemplateSelector.jsx`, `StatusBadge.jsx`
(a second, independent copy from the one in [contract-repository](/modules/contract-repository.md)).

## Hooks (`hooks/`)

`useContractDetail.js`, `useCounterpartySearch.js`, `useCreateCounterparty.js`,
`useContractRepository.js`, `useContractOwners.js`, `useUploadThirdPartyPaper.js`,
`useCreateContract.js`, `useTemplates.js`.

Backed by [`contractsService.js`](/modules/services.md), `counterpartiesService.js`,
`templatesService.js`, `usersService.js` calling `POST /api/v1/contracts`,
`POST /api/v1/contracts/third-party-paper`, `GET/POST /api/v1/counterparties`,
`GET /api/v1/templates`, `GET /api/v1/users`.

### Document generation confirmation (UC2)

`handleSave` in `src/pages/NewContractPage.jsx` no longer navigates away on
success. It stores `createdContract` (`{ id, generatedFrom }`) alongside
`successMessage` and renders both in the `role="status"` banner, so the user
sees which source produced Version 1 before leaving the form:

| Draft source | `generatedFrom` text |
|---|---|
| `formData.thirdPartyPaperFileId` set | uploaded third party paper saved as Version 1 **without** merge |
| otherwise | document generated from the selected template with merge fields filled, saved as Version 1 |

A **View Contract** button in the banner performs the deferred
`navigate('/contracts/{id}')`. The template name is resolved from the already
loaded `templates.items`, not re-fetched.

## Access guard

`NewContractAccessGuard` is the one client-side role check in the app: it
restricts `/contracts/new` to `TENANT_ADMIN` and `CONTRACT_OWNER` (see
[app-routing](/modules/app-routing.md)), in addition to whatever the backend
enforces with `X-User-Role`.

## State

`setField` on [`store/contractDraftSlice.js`](/modules/store.md) is one of the
highest fan-in nodes in the whole graph (7 callers) — nearly every drafting
component writes through it. Forms a tight cluster with `NewContractPage`,
`handleSave`, `toIsoDate`, `listTemplates` (cohesion 0.96).

## Consumed by

`src/pages/NewContractPage.jsx` and `src/pages/ContractRepositoryListPage.jsx`
— part of the `uc123` generation module.
