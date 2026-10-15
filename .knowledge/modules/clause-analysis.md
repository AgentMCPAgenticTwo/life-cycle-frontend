---
type: Module
title: src/features/clause-analysis
description: AI-assisted clause extraction/review screen -- per-clause accept/reject/edit, risk scoring, metadata editing, Ask-AI, and extraction-failure/conflict handling.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/clause-analysis
tags: [frontend, clause-analysis, ai]
generated: { by: sage-maintenance/claude-code, at: 2026-10-15T05:48:30Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 1ac008b0b45597d08aafa01f656559e7bbd5b48c
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

Two guardrails live in the components rather than in a hook:

* `ClauseDetailDrawer.jsx` — the Reject button checks `clause.isMandatory`
  first and sets local `mandatoryBlockMessage` ("This clause is mandatory and
  cannot be removed from the contract.", `role="alert"`) instead of calling
  `onReject`, so a mandatory clause never reaches `POST .../reject`
  (UC3-BR / UC4-BR-006).
* `AuditLogViewer.jsx` — carries a `role="note"` immutability line ("Audit log
  entries cannot be modified or deleted."), matching the same notice in
  [settings-admin](/modules/settings-admin.md)'s `AuditLogTab.jsx`.

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

Header actions in that page gate on role and on `data.proceedToNegotiationEnabled`:

| Condition | Rendered |
|---|---|
| `isTenantAdmin` | neither action (read-only viewer) |
| not admin, no `proceedResult` | `ProceedToNegotiationButton` (`handleProceed`) |
| not admin, `proceedResult` **or** `proceedToNegotiationEnabled` | "Go to Negotiation →" `Link` to the [negotiation](/modules/negotiation.md) tracker |

The two conditions overlap on purpose: the proceed call is idempotent and leaves
no stored flag, so a reviewer who already proceeded and re-enters the screen
still gets a way through to the tracker rather than a dead end.
