---
type: Module
title: src/features/negotiation
description: Negotiation tracker -- reviewer routing, comments, mark-agreed/reminder actions, version comparison, and the OTP-gated external review flow for third-party reviewers.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/negotiation
tags: [frontend, negotiation, external-review]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

## Components (`components/`)

`RoutingPanel.jsx`, `ReviewerList.jsx`, `OverdueFlagBadge.jsx`,
`SendReminderButton.jsx`, `CompareVersionsModal.jsx`, `CommentBoxPanel.jsx`,
`MarkAgreedButton.jsx`, `OtpVerificationForm.jsx` (used by the external,
no-sidebar `/negotiation/external/:linkToken` route).

## Hooks (`hooks/`)

`useNegotiationTracker.js`, `useSubmitRouting.js`, `useSubmitReview.js`,
`useAddComment.js`, `useCompareVersions.js`, `useSendReminder.js`,
`useMarkAgreed.js`, `useGenerateExternalLink.js`, `useVerifyOtp.js`,
`useExternalSubmit.js`.

Backed by [`lifecycleNegotiationService.js`](/modules/services.md) calling the
`.../negotiation/routing`, `.../negotiation` (GET tracker), `.../negotiation/reviews`,
`.../negotiation/external-link`, `/negotiation/external/{linkToken}/verify-otp`,
`/negotiation/external/{linkToken}/submit`, `.../negotiation/compare`,
`.../negotiation/reminder`, `.../negotiation/mark-agreed`,
`.../negotiation/comments` endpoints.

## State

[`store/negotiationSlice.js`](/modules/store.md).

## Consumed by

`src/pages/NegotiationTrackerPage.jsx` (route `/contracts/:contractId/negotiation`)
and `src/pages/ExternalReviewPage.jsx` (standalone route
`/negotiation/external/:linkToken`, no `AppLayout` sidebar — see
[app-routing](/modules/app-routing.md)) — part of the `lifecycle-uc4-uc5`
generation module.
