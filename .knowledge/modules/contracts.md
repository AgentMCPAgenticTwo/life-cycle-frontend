---
type: Module
title: src/features/contracts
description: New-contract drafting flow -- type/industry/template selection, third-party paper upload, counterparty panel, and the role guard on /contracts/new.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/contracts
tags: [frontend, contracts, drafting]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
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
