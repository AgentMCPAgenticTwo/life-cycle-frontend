import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/store/authStore', () => {
  let state = { accessToken: null, user: null, isInitializing: true };
  return {
    useAuthStore: {
      getState: () => ({
        ...state,
        setAccessToken: (accessToken) => {
          state = { ...state, accessToken };
        },
        clearSession: () => {
          state = { ...state, accessToken: null, user: null };
        },
      }),
      setState: (partial) => {
        state = { ...state, ...partial };
      },
    },
  };
});

import { useAuthStore } from '@/store/authStore';
import { http, refreshSession, scheduleProactiveRefresh, clearScheduledRefresh } from '@/services/http';

/** Builds an unsigned JWT whose payload carries the given `exp` (seconds). */
function tokenWithExpiry(expSeconds) {
  const header = btoa(JSON.stringify({ alg: 'none' }));
  const payload = btoa(JSON.stringify({ exp: expSeconds }));
  return `${header}.${payload}.`;
}

describe('http refresh flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    useAuthStore.setState({ accessToken: 'old-token' });
  });

  afterEach(() => {
    clearScheduledRefresh();
    vi.useRealTimers();
  });

  it('retries a request once after refreshing an expired access token', async () => {
    global.fetch = vi.fn((url, opts) => {
      if (url.includes('/auth/refresh')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ accessToken: 'new-token' }) });
      }
      if (opts.headers.Authorization === 'Bearer old-token') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'expired', details: [] }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ data: 'ok' }) });
    });

    const result = await http.get('/api/v1/contracts');

    expect(result).toEqual({ data: 'ok' });
    expect(useAuthStore.getState().accessToken).toBe('new-token');
  });

  it('clears the session and does not retry when refresh itself fails', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/auth/refresh')) {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'no cookie', details: [] }) });
      }
      return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'expired', details: [] }) });
    });

    await expect(http.get('/api/v1/contracts')).rejects.toThrow('Your session has expired. Please sign in again.');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('schedules a proactive refresh that fires before the access token expires', async () => {
    const refreshFetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ accessToken: 'renewed-token' }) })
    );
    global.fetch = refreshFetch;

    const token = tokenWithExpiry(Math.floor(Date.now() / 1000) + 120);
    scheduleProactiveRefresh(token);

    expect(refreshFetch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(61 * 1000);

    expect(refreshFetch).toHaveBeenCalledWith(expect.stringContaining('/auth/refresh'), expect.any(Object));
    expect(useAuthStore.getState().accessToken).toBe('renewed-token');
  });

  it('reschedules the next proactive refresh after a successful refresh', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/auth/refresh')) {
        const exp = Math.floor(Date.now() / 1000) + 900;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ accessToken: tokenWithExpiry(exp) }),
        });
      }
      return Promise.reject(new Error('unexpected call'));
    });

    await refreshSession();

    expect(useAuthStore.getState().accessToken).toBe(tokenWithExpiry(Math.floor(Date.now() / 1000) + 900));

    const callsBefore = global.fetch.mock.calls.length;
    await vi.advanceTimersByTimeAsync(800 * 1000);
    expect(global.fetch.mock.calls.length).toBe(callsBefore);

    await vi.advanceTimersByTimeAsync(60 * 1000);
    expect(global.fetch.mock.calls.length).toBeGreaterThan(callsBefore);
  });
});
