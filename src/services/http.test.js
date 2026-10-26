import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { http } from '@/services/http';

describe('http refresh-and-retry', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: 'old-token', isInitializing: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshes the access token and retries an expired request', async () => {
    global.fetch = vi.fn((url, opts) => {
      if (url.includes('/auth/refresh')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ accessToken: 'new-token' }) });
      }
      if (opts.headers.Authorization === 'Bearer old-token') {
        return Promise.resolve({ ok: false, status: 401, json: async () => ({ error: 'expired', details: [] }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ data: 'ok' }) });
    });

    const result = await http.get('/api/v1/contracts');

    expect(result).toEqual({ data: 'ok' });
    expect(useAuthStore.getState().accessToken).toBe('new-token');
  });

  it('also refreshes and retries an expired token on an authenticated /auth/* call', async () => {
    global.fetch = vi.fn((url, opts) => {
      if (url.includes('/auth/refresh')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ accessToken: 'new-token' }) });
      }
      if (url.includes('/auth/me') && opts.headers.Authorization === 'Bearer old-token') {
        return Promise.resolve({ ok: false, status: 401, json: async () => ({ error: 'expired', details: [] }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ id: 'user-1' }) });
    });

    const result = await http.get('/auth/me');

    expect(result).toEqual({ id: 'user-1' });
    expect(useAuthStore.getState().accessToken).toBe('new-token');
  });

  it('does not attempt a refresh-and-retry loop when the refresh call itself 401s', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/auth/refresh')) {
        return Promise.resolve({ ok: false, status: 401, json: async () => ({ error: 'invalid', details: [] }) });
      }
      throw new Error('unexpected call ' + url);
    });

    await expect(http.post('/auth/refresh', {})).rejects.toThrow();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
