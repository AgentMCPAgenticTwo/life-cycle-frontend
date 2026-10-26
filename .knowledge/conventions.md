---
type: Convention
title: Frontend conventions
description: The non-negotiable rules this repo's generated code follows for API access, auth headers, ids, testing and module isolation.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/CLAUDE.md
tags: [frontend, conventions]
generated: { by: sage-maintenance/claude-code, at: 2026-10-26T08:16:04Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 73f6f7a9b545e029eaee4d442b58026bd50c5c13
    title: Codebase knowledge graph
status: stable
---

Full text lives in the root `CLAUDE.md`; this file is the condensed, graph-checked version.

## API layer

- All network calls go through [`src/services/http.js`](/modules/services.md) — feature code never calls `fetch` directly.
- `VITE_API_BASE_URL` is required; the client throws at startup if missing (no mock fallback). It points at the backend (`http://localhost:8000`), never at the Vite dev-server port.
- Every request carries `X-User-Role` and `X-User-Id`, attached centrally in `http.js`.
- Non-2xx responses throw `HttpError` with `{ error, details }`. A transport failure (server unreachable, CORS, offline) throws the same shape with status `0` instead of a bare `TypeError`, so error states render it unchanged.
- One service module per resource group (see [modules/services.md](/modules/services.md) for the full list) — exactly the paths/fields declared in each module's contract in `CLAUDE.md`.
- Multipart endpoints send `FormData` and never set `Content-Type` manually.

## No mock data

- No dev-fallback branches, fixture modules, or hard-coded sample arrays in feature code.
- Every data-bound screen implements four states: loading, empty (2xx, no rows), error (non-2xx/network, with retry), populated.
- Sample values are allowed only in `*.test.jsx` files.

## Auth & roles

- Roles: `TENANT_ADMIN`, `CONTRACT_OWNER`, `LEGAL_REVIEWER`, `APPROVER`, `SIGNER`. A role outside this set is a 403; a missing `X-User-Role` is a 401 — both must surface in the UI error state.
- `NewContractAccessGuard` ([features/contracts](/modules/contracts.md)) is the one place today that pre-checks a role client-side before even calling the backend.

## Ids

- Every id is a UUID string. Never hand-craft or hard-code one in feature code; ids come from a previous response, route params, or user selection. The backend generates ids on create.

## Request bodies

- POST/PUT bodies must include every field the request DTO declares, with matching names/casing — not just the fields the form renders.

## Testing

- Vitest + Testing Library. Unit tests (`*.test.jsx`) sit next to the unit (e.g. `features/contract-repository/components/DownloadButton.test.jsx`); screen-level tests live in `src/__tests__/` (one per page, e.g. `TrackerPage.test.jsx`, `LoginPage.test.jsx`).
- Mock `src/services/http.js` in tests — the only place fake data is allowed.

## Module isolation

- Each generated module (see `CLAUDE.md` "Modules (generated)") adds files alongside existing ones. Do not rename or delete another module's screens/services/types. Shared code (`src/shared/`, `src/services/http.js`) may be extended but not narrowed in a way that breaks an existing module.

## Visual verification

- Screens are matched against design screenshots at ~80%+ using `npx playwright screenshot` against a pinned dev-server port (`vite --port 5199 --strictPort`), never an unpinned port.
