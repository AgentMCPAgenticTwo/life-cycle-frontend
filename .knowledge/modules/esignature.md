---
type: Module
title: src/features/esignature
description: Signer management, the send-for-signature action, the OTP + signature-pad signing portal, decline flow, audit certificate download, and e-signature provider settings.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/src/features/esignature
tags: [frontend, esignature, signing]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

## Components (`components/`)

`AddSignerModal.jsx`, `SignerListTable.jsx`, `DeclineToSignModal.jsx`,
`OtpVerificationModal.jsx`, `SendForSignatureButton.jsx`,
`AuditCertificateDownloadButton.jsx`, `SignaturePadModal.jsx`.

## Hooks (`hooks/`)

`useAddSigner.js`, `useUpdateSigner.js`, `useRemoveSigner.js`,
`useSendForSignature.js`, `useSigningSession.js`, `useResendOtp.js`,
`useVerifyOtp.js`, `useApplySignature.js`, `useDeclineSignature.js`,
`useAuditCertificate.js`, `useSignerList.js`, `useEsignatureSettings.js`,
`useUpdateEsignatureSettings.js`.

Backed by [`signersService.js`](/modules/services.md), `signingSessionService.js`,
`esignatureSettingsService.js` calling
`GET/POST/PUT/DELETE /api/v1/contracts/{contractId}/signers*`,
`GET /api/v1/signing-sessions/{sessionId}`, `POST .../otp/verify|resend`,
`POST .../sign`, `POST .../decline`,
`GET /api/v1/contracts/{contractId}/audit-certificate`,
`GET/PUT /api/v1/esignature-settings`.

This feature's call cluster is fully cohesive (1.0): `SignerListPage`,
`useEsignatureSettings`, `EsignatureSettingsPage`, `useSignerList` all sit in
one cluster (see [architecture.md](/architecture.md)).

## Consumed by

`src/pages/SignerListPage.jsx` (`/contracts/:contractId/signers`),
`SigningPortalPage.jsx` (standalone route `/sign/:sessionId`, no sidebar — see
[app-routing](/modules/app-routing.md)), `EsignatureSettingsPage.jsx`
(`/settings/esignature-settings`) — part of the `uc6-uc7-combined` generation
module (shared with [approvals](/modules/approvals.md)).
