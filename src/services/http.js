// The single place the app talks to the backend.
//
// Every request carries the signed-in user's `Authorization: Bearer <accessToken>`
// header. The access token is renewed two ways, both driven from here:
//
//   * proactively — the token's own `exp` claim schedules a refresh a minute before
//     it lapses, so a session that is simply left open never hits a 401 at all;
//   * reactively — a 401 refreshes once (via the httpOnly refresh cookie) and
//     retries the original request.
//
// If the refresh itself fails the session is cleared and the user is sent to /login.
//
// There is deliberately no mock/dev fallback here: a failed call throws. Returning fake data
// on error hides broken integration until it reaches production.

import { useAuthStore } from '@/store/authStore';

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

// The three calls that must never be retried through a refresh: `/auth/login` and
// `/auth/refresh` are how a session is established in the first place, and
// `/auth/logout` is tearing one down. Everything else — including `/auth/me` and
// `/auth/change-password`, which are ordinary bearer-authenticated calls — goes
// through the same renew-and-retry path as the rest of the API.
const NON_REFRESHABLE_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

// Renew this far ahead of the token's own expiry, so a request issued just before
// the deadline still travels with a token the backend accepts.
const RENEWAL_SKEW_MS = 60_000;
// setTimeout clamps anything above ~24.8 days to a fire-now; never schedule that far out.
const MAX_TIMEOUT_MS = 2_147_483_647;

let refreshPromise = null;
let renewalTimer = null;

function isRefreshable(path) {
  return !NON_REFRESHABLE_PATHS.some((p) => path === p || path.endsWith(p));
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  window.location.href = '/login';
}

/**
 * Reads the `exp` claim (seconds since epoch) out of a JWT without verifying it —
 * the signature is the backend's business; the frontend only needs to know when to
 * ask for a new token.
 * @param {string} token
 * @returns {number|null} expiry in milliseconds since epoch, or null if unreadable
 */
export function accessTokenExpiryMs(token) {
  if (typeof token !== 'string') return null;
  const [, payload] = token.split('.');
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = JSON.parse(json)?.exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    // Not a readable JWT (opaque token, or a stub in a test) — fall back to 401 recovery.
    return null;
  }
}

/** Cancels any pending proactive renewal. */
export function stopTokenRenewal() {
  if (renewalTimer !== null) {
    clearTimeout(renewalTimer);
    renewalTimer = null;
  }
}

/**
 * Arms the proactive renewal for `token`. Called whenever the access token in the
 * store changes (login, refresh, session restore) — see the store subscription at
 * the bottom of this module — so no screen has to remember to do it.
 * @param {string|null} token
 */
export function scheduleTokenRenewal(token) {
  stopTokenRenewal();
  if (typeof setTimeout !== 'function') return;
  const expiresAt = accessTokenExpiryMs(token);
  if (expiresAt === null) return;

  const delay = Math.min(Math.max(expiresAt - Date.now() - RENEWAL_SKEW_MS, 0), MAX_TIMEOUT_MS);
  renewalTimer = setTimeout(() => {
    renewalTimer = null;
    refreshSession().catch(() => {
      useAuthStore.getState().clearSession();
      redirectToLogin();
    });
  }, delay);
  // Node/jsdom only: a pending renewal must not keep the process alive in tests.
  if (typeof renewalTimer?.unref === 'function') renewalTimer.unref();
}

/**
 * Exchanges the httpOnly refresh cookie for a new access token, rotating the
 * refresh token server-side. Concurrent callers share one in-flight request
 * so a burst of 401s only triggers a single refresh call.
 *
 * The POST carries no body, so it must not declare `Content-Type: application/json`:
 * that turns it into a preflighted request whose `OPTIONS` some gateways answer
 * without the `Access-Control-Allow-Credentials` header, and the refresh cookie is
 * then silently dropped while every ordinary bearer call keeps working.
 * @returns {Promise<string>} the new access token
 */
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) throw new HttpError(response.status, { error: 'refresh failed' });
        const body = await response.json();
        if (!body?.accessToken) throw new HttpError(500, { error: 'refresh returned no access token' });
        useAuthStore.getState().setAccessToken(body.accessToken);
        return body.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, init = {}, { skipAuthRetry = false, raw = false } = {}) {
  const isForm = init.body instanceof FormData;
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      // Do not set Content-Type for FormData — the browser adds the multipart boundary.
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers || {}),
    },
  });

  if (response.status === 401 && !skipAuthRetry && isRefreshable(path)) {
    try {
      await refreshSession();
    } catch {
      useAuthStore.getState().clearSession();
      redirectToLogin();
      throw new HttpError(401, { error: 'Your session has expired. Please sign in again.', details: [] });
    }
    return await request(path, init, { skipAuthRetry: true, raw });
  }

  if (!response.ok) {
    let body = { error: `HTTP ${response.status}`, details: [] };
    try {
      body = await response.json();
    } catch {
      // Non-JSON error body (proxy/gateway); keep the status-based message.
    }
    throw new HttpError(response.status, body);
  }

  if (raw) return response;
  if (response.status === 204) return undefined;
  return await response.json();
}

const FILENAME_PATTERN = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;

/**
 * Fetches a file the API serves as bytes (export files, contract documents).
 *
 * These URLs are API routes behind the same `Authorization` header as every other
 * call, so they cannot be handed to `window.open` or an `<a href>`: the browser
 * would request them against the SPA's own origin without a token and land on a
 * blank router miss. We fetch them here instead and hand back a blob.
 *
 * @param {string} url absolute URL, or a path relative to the API base URL
 * @returns {Promise<{ blob: Blob, fileName: string|null }>}
 */
export async function downloadFile(url) {
  const isAbsolute = /^https?:\/\//i.test(url);
  const response = isAbsolute
    ? await fetch(url, { credentials: 'include' })
    : await request(url.startsWith('/') ? url : `/${url}`, {}, { raw: true });

  if (!response.ok) {
    let body = { error: `HTTP ${response.status}`, details: [] };
    try {
      body = await response.json();
    } catch {
      // Non-JSON error body; keep the status-based message.
    }
    throw new HttpError(response.status, body);
  }

  const disposition = response.headers.get('Content-Disposition') || '';
  const match = FILENAME_PATTERN.exec(disposition);
  return { blob: await response.blob(), fileName: match ? decodeURIComponent(match[1]) : null };
}

// Keep the proactive renewal in step with the session: every path that puts a token
// in the store (login, refresh, restore) arms the next renewal, and clearing the
// session disarms it. Doing it here rather than at the call sites means a screen
// cannot forget and leave a session that silently stops renewing.
useAuthStore.subscribe((state, previous) => {
  if (state.accessToken === previous.accessToken) return;
  if (state.accessToken) scheduleTokenRenewal(state.accessToken);
  else stopTokenRenewal();
});

export const http = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  patch: (path, body) =>
    request(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
