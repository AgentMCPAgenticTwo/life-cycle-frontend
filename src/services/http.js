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

let refreshPromise = null;

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
        return body.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, init = {}, { skipAuthRetry = false } = {}) {
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
      return await request(path, init, { skipAuthRetry: true });
    } catch {
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
  patch: (path, body) =>
    request(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
