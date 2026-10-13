---
type: Module
title: src/features/approvals
description: Approvals list/review, delegate flow, approval history, and tenant-wide approval-matrix configuration.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/approvals
tags: [frontend, approvals]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

## Components (`components/`)

`ApprovalActionsPanel.jsx`, `ApprovalMatrixRuleCard.jsx`, `ApprovalHistoryTab.jsx`,
`ApprovalDetailsCard.jsx`, `ApprovalsListTable.jsx`, `DelegateModal.jsx`.

## Hooks (`hooks/`)

`useApprovalDetail.js`, `useApprovalsList.js`, `useSubmitApprovalAction.js`,
`useDelegateApproval.js`, `useUpdateApprovalMatrixConfig.js`,
`useApprovalMatrixConfig.js`, `useApproverUsers.js`, `useApprovalHistory.js`.

Backed by [`approvalsService.js`](/modules/services.md) and
`approvalMatrixConfigService.js` calling `GET /api/v1/approvals`,
`GET /api/v1/approvals/{approvalId}`, `POST .../actions`, `POST .../delegate`,
`GET .../history`, `GET/PUT /api/v1/approval-matrix-config`.

## Consumed by

`src/pages/ApprovalsListPage.jsx` (`/approvals`), `ApprovalReviewPage.jsx`
(`/approvals/:approvalId`), `ApprovalMatrixConfigPage.jsx`
(`/settings/approval-matrix-config`) — part of the `uc6-uc7-combined`
generation module (shared with [esignature](/modules/esignature.md)).
