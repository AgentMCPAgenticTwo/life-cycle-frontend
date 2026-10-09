// The single place the app talks to the backend.
//
// Every request carries the X-User-Role / X-User-Id headers the API's header-auth scheme
// expects; a missing role header is 401 and a disallowed role is 403, and both surface as a
// thrown ApiError for the screen's error state to render.
//
// There is deliberately no mock/dev fallback here: a failed call throws. Returning fake data
// on error hides broken integration until it reaches production.

/**
 * The API's error body shape.
 * @typedef {Object} ApiError
 * @property {string} error
 * @property {string[]} details
 */

export class HttpError extends Error {
  constructor(status, body) {
    super(body.error || `HTTP ${status}`);
    this.status = status;
    this.details = body.details || [];
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Configure it in .env.local — the app does not fall back to mock data.'
  );
}

// Dev-auth identity, derived from THIS project's contract: the role is one the API's
// endpoints actually accept, and the id is in the id format the backend types its id
// columns as. An id in the wrong shape (a string key against a uuid column) is rejected
// by the database rather than by validation, so it surfaces as a 500, not a 400.
// Replace with the signed-in user's role/id once real auth exists: the API has no login
// flow, it trusts these headers (see CLAUDE.md, Authentication).
export const authHeaders = {
  role: 'TENANT_ADMIN',
  userId: '00000000-0000-0000-0000-000000000001',
};

async function request(path, init = {}) {
  const isForm = init.body instanceof FormData;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      // Do not set Content-Type for FormData — the browser adds the multipart boundary.
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      'X-User-Role': authHeaders.role,
      'X-User-Id': authHeaders.userId,
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    let body = { error: `HTTP ${response.status}`, details: [] };
    try {
      body = await response.json();
    } catch {
      // Non-JSON error body (proxy/gateway); keep the status-based message.
    }
    throw new HttpError(response.status, body);
  }

  if (response.status === 204) return undefined;
  return await response.json();
}

export const http = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
