---
type: Module
title: src/features/negotiation
description: Negotiation tracker -- reviewer routing, comments, mark-agreed/reminder actions, version comparison, and the OTP-gated external review flow for third-party reviewers.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/negotiation
tags: [frontend, negotiation, external-review]
generated: { by: sage-maintenance/claude-code, at: 2026-10-14T05:53:34Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 924f2b68e7fdf30975f868885890e229379e455d
    title: Codebase knowledge graph
status: stable
---

## Components (`components/`)

`RoutingPanel.jsx`, `ReviewerList.jsx`, `OverdueFlagBadge.jsx`,
`SendReminderButton.jsx`, `CompareVersionsModal.jsx`, `CommentBoxPanel.jsx`,
`MarkAgreedButton.jsx`, `RedlineSubmitPanel.jsx`, `RiskRecheckPanel.jsx`,
`OtpVerificationForm.jsx` (the last used by the external, no-sidebar
`/negotiation/external/:linkToken` route).

### Risk re-check after an external redline (UC5)

`RiskRecheckPanel.jsx` takes `contractId` + `externalVersion` and re-scores only
the clauses the counterparty touched. It composes three hooks across two
features: `useCompareVersions` (this module) for the diff between
`externalVersion - 1` and `externalVersion`, plus `useClauseAnalysis` and
`useRetryExtraction` from [clause-analysis](/modules/clause-analysis.md).

| State | Rendered |
|---|---|
| comparing / analysing | "Re-checking risk…" |
| `analysis.analysisStatus === 'Failed'` | `role="alert"` amber notice stating the version is still saved and previous scores unchanged, plus a **Retry Risk Analysis** button calling `handleRetry` (`useRetryExtraction` → `setData`) |
| diff has changed clauses | list of re-scored clauses with `riskBadgeClass` severity badges, headed by the refreshed `overallContractRiskScore` |
| diff has no changed clauses | "No clause changes were detected in this version…" |
| `compareError \|\| analysisError` | `role="alert"` red message |

`NegotiationTrackerPage.jsx` mounts it only when the highest-numbered entry in
`data.versions` has `source === 'External'`, passing that entry's
`versionNumber`.

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

### Auto-send to counterparty and reminder stop (UC5)

The handoff to the counterparty is a backend action; the tracker only reflects
it. `NegotiationTrackerPage.jsx` maps `data.negotiationStatus` through
`STATUS_LABELS`, where `'With Counterparty'` reads **"Sent to counterparty"**,
and while that status holds the header adds a note that a secure link and
one-time passcode were emailed to `data.externalPartyName` /
`data.externalPartyEmail` — the passcode itself is never rendered. The
counterparty then enters it on `OtpVerificationForm.jsx`
(`/negotiation/external/:linkToken`).

Reminders stop at the end of the review round. The page computes
`remindersStopped` from `data.negotiationStatus === 'Agreed'` or every
`data.internalReviewers` entry having `reviewStatus === 'Submitted'`, and passes
it to `SendReminderButton.jsx` as the `stopped` prop.

| `SendReminderButton` state | Rendered |
|---|---|
| `stopped` | button disabled; title and helper text both read "Reminders stopped — review submitted or contract agreed" |
| not stopped, `dueDate` in the future | button disabled; title "Enabled only when Due Date has passed", helper text notes the daily automatic reminder to reviewer and owner |
| not stopped, `dueDate` passed | button enabled; `handleClick` calls `useSendReminder` and shows `role="status"` "Reminder sent to {sentTo}" |

The page's own "Reminder enabled only once overdue." hint renders only when
`!dueDatePassed && !remindersStopped`, so it does not contradict the stopped
state.

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
