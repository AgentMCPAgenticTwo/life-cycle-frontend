---
type: Module
title: src/features/clause-analysis
description: AI-assisted clause extraction/review screen -- per-clause accept/reject/edit, risk scoring, metadata editing, Ask-AI, and extraction-failure/conflict handling.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/clause-analysis
tags: [frontend, clause-analysis, ai]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

## Components (`components/`)

`ClauseListPanel.jsx`, `ClauseDetailDrawer.jsx`, `ClauseEditBox.jsx`,
`AcceptSuggestionControl.jsx`, `MandatoryClauseFlagBadge.jsx`,
`OverallRiskScoreLabel.jsx`, `ContractMetadataPanel.jsx`, `AskAIBox.jsx`,
`UnsupportedFileBlocker.jsx`, `AIExtractionFailureBanner.jsx`,
`AccessDeniedBanner.jsx`, `ConcurrentEditConflictModal.jsx`,
`ProceedToNegotiationButton.jsx`, `AuditLogViewer.jsx`.

## Hooks (`hooks/`)

`useClauseAnalysis.js`, `useAcceptSuggestion.js`, `useEditClause.js`,
`useRejectClause.js`, `useUpdateMetadata.js`, `useAskAI.js`,
`useProceedToNegotiation.js`, `useRetryExtraction.js`, `useAuditLog.js`.

Backed by [`lifecycleClauseAnalysisService.js`](/modules/services.md) calling
`GET .../clause-analysis`, `POST .../accept-suggestion`, `PUT .../clauses/{clauseId}`,
`POST .../clauses/{clauseId}/reject`, `PUT .../metadata`, `POST .../ask-ai`,
`POST .../proceed-to-negotiation`, `POST .../retry-extraction`,
`GET .../audit-log`.

## State

[`store/clauseAnalysisSlice.js`](/modules/store.md).

Forms a call cluster with [negotiation](/modules/negotiation.md) (`useNegotiationTracker`,
`useAuditLog`, cohesion 0.82) since `ProceedToNegotiationButton` hands off into
the negotiation tracker flow.

## Consumed by

`src/pages/ClauseAnalysisPage.jsx` (route `/contracts/:contractId/clause-analysis`)
— part of the `lifecycle-uc4-uc5` generation module.
