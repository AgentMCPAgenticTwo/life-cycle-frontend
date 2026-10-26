// The single place the app talks to the backend.
//
// Every request carries the signed-in user's `Authorization: Bearer <accessToken>`
// header. A 401 means the access token expired — this module refreshes it once
// (via the httpOnly refresh cookie) and retries the original request; if the
// refresh itself fails the session is cleared and the user is sent to /login.
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

const AUTH_PATH_PREFIX = '/auth/';

// Refresh this many ms before the access token's own `exp` claim to leave time
// for the request to complete before the token actually expires.
const REFRESH_SKEW_MS = 60 * 1000;

let refreshPromise = null;
let refreshTimer = null;

/**
 * Reads the `exp` claim (seconds since epoch) out of a JWT without verifying
 * it — verification is the backend's job, this is only used to time the next
 * proactive refresh.
 * @param {string} token
 * @returns {number|null} epoch milliseconds, or null if it can't be read
 */
function readTokenExpiry(token) {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Cancels any pending proactive refresh — called on logout/session clear. */
export function clearScheduledRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Schedules a proactive refresh shortly before the given access token expires,
 * so the session renews automatically in the background instead of waiting
 * for a request to fail with 401 first. Silently does nothing if the token
 * carries no readable `exp` claim — the reactive 401 retry in `request` below
 * still covers that case.
 * @param {string} accessToken
 */
export function scheduleProactiveRefresh(accessToken) {
  clearScheduledRefresh();
  const expiresAt = readTokenExpiry(accessToken);
  if (expiresAt === null) return;
  const delay = Math.max(expiresAt - Date.now() - REFRESH_SKEW_MS, 0);
  refreshTimer = setTimeout(() => {
    refreshSession().catch(() => {
      // A failed proactive refresh is not fatal here: the next API call will
      // hit the reactive 401 path below and send the user to /login.
    });
  }, delay);
}

/**
 * Exchanges the httpOnly refresh cookie for a new access token, rotating the
 * refresh token server-side. Concurrent callers share one in-flight request
 * so a burst of 401s only triggers a single refresh call.
 * @returns {Promise<string>} the new access token
 */
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('refresh failed');
        const body = await response.json();
        useAuthStore.getState().setAccessToken(body.accessToken);
        scheduleProactiveRefresh(body.accessToken);
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

  if (response.status === 401 && !skipAuthRetry && !path.startsWith(AUTH_PATH_PREFIX)) {
    try {
      await refreshSession();
      return await request(path, init, { skipAuthRetry: true, raw });
    } catch {
      clearScheduledRefresh();
      useAuthStore.getState().clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new HttpError(401, { error: 'Your session has expired. Please sign in again.', details: [] });
    }
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
