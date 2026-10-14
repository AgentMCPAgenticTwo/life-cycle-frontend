---
type: Module
title: src/features/negotiation
description: Negotiation tracker -- reviewer routing, comments, mark-agreed/reminder actions, version comparison, and the OTP-gated external review flow for third-party reviewers.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/negotiation
tags: [frontend, negotiation, external-review]
generated: { by: sage-maintenance/claude-code, at: 2026-10-14T04:55:25Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 2980c74caa4fa3952f31f5cbaeff19b40c6dd55c
    title: Codebase knowledge graph
status: stable
---

## Components (`components/`)

`RoutingPanel.jsx`, `ReviewerList.jsx`, `OverdueFlagBadge.jsx`,
`SendReminderButton.jsx`, `CompareVersionsModal.jsx`, `CommentBoxPanel.jsx`,
`MarkAgreedButton.jsx`, `RedlineSubmitPanel.jsx`, `OtpVerificationForm.jsx`
(the last used by the external, no-sidebar
`/negotiation/external/:linkToken` route).

### Concurrent redline conflict (UC5-AF-005)

`RedlineSubmitPanel.jsx` is the internal reviewer's redline submission form. It
drives `useSubmitReview.js`, which classifies the failure instead of lumping it
into `error`: a **409** sets `conflict`, anything else sets `error`. The panel
renders them as separate surfaces —

| State | Rendered |
|---|---|
| `conflict` | `role="alert"` amber notice "A newer version was submitted while you were editing…" plus a **Refresh** button wired to `clearConflict()` + `onSubmitted()` |
| `error && !conflict` | `role="alert"` red `error.message` |
| `savedVersion != null` | `role="status"` confirmation naming the new `versionNumber` |

Mounted by `NegotiationTrackerPage.jsx` only while
`data.negotiationStatus !== 'Agreed'` and the viewer is a legal reviewer or may
route; `onSubmitted` is the tracker's `refetch`, so a successful submit or a
post-conflict refresh reloads the tracker at the newer version.

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
