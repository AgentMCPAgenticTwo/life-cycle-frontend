import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  http,
  HttpError,
  refreshSession,
  accessTokenExpiryMs,
  scheduleTokenRenewal,
  stopTokenRenewal,
} from '@/services/http';
import { useAuthStore } from '@/store/authStore';

function jsonResponse(status, body, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k) => headers[k] ?? null },
    json: async () => body,
  };
}

describe('http refresh flow', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession({ user: { id: 'u1' }, accessToken: 'expired-token' });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    stopTokenRenewal();
    vi.unstubAllGlobals();
  });

  it('refreshes once and retries the original request with the new token', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse(401, { error: 'invalid or expired access token' }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'fresh-token' }))
      .mockResolvedValueOnce(jsonResponse(200, { items: [] }));

    const result = await http.get('/api/v1/contracts');

    expect(result).toEqual({ items: [] });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[1][0]).toContain('/auth/refresh');
    expect(fetch.mock.calls[2][1].headers.Authorization).toBe('Bearer fresh-token');
    expect(useAuthStore.getState().accessToken).toBe('fresh-token');
  });

  it('shares one refresh call across concurrent 401s', async () => {
    fetch.mockImplementation(async (url) => {
      if (String(url).includes('/auth/refresh')) return jsonResponse(200, { accessToken: 'fresh-token' });
      const token = null;
      void token;
      return jsonResponse(200, { ok: true });
    });
    fetch
      .mockResolvedValueOnce(jsonResponse(401, { error: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(401, { error: 'expired' }));

    await Promise.all([http.get('/api/v1/a'), http.get('/api/v1/b')]);

    const refreshCalls = fetch.mock.calls.filter(([url]) => String(url).includes('/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
  });

  it('clears the session when the refresh itself fails', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse(401, { error: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(401, { error: 'invalid or expired refresh token' }));

    await expect(http.get('/api/v1/contracts')).rejects.toBeInstanceOf(HttpError);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('does not retry a request that was already retried', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse(401, { error: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'fresh-token' }))
      .mockResolvedValueOnce(jsonResponse(401, { error: 'still expired' }));

    await expect(http.get('/api/v1/contracts')).rejects.toBeInstanceOf(HttpError);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('surfaces the retried request\'s own error instead of reporting a dead session', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse(401, { error: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'fresh-token' }))
      .mockResolvedValueOnce(jsonResponse(403, { error: 'role APPROVER is not permitted', details: [] }));

    await expect(http.get('/api/v1/contracts')).rejects.toMatchObject({
      status: 403,
      message: 'role APPROVER is not permitted',
    });
    expect(useAuthStore.getState().accessToken).toBe('fresh-token');
  });

  it('renews and retries /auth/me, but never /auth/login or /auth/refresh', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse(401, { error: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'fresh-token' }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 'u1' }));
    await expect(http.get('/auth/me')).resolves.toEqual({ id: 'u1' });

    fetch.mockReset();
    fetch.mockResolvedValueOnce(jsonResponse(401, { error: 'Invalid email or password' }));
    await expect(http.post('/auth/login', { email: 'a@b.c', password: 'x' })).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('refreshSession rejects when the cookie is gone', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(401, { error: 'missing refresh token' }));
    await expect(refreshSession()).rejects.toBeTruthy();
  });

  it('allows a later refresh after an earlier one failed', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(401, { error: 'missing refresh token' }));
    await expect(refreshSession()).rejects.toBeTruthy();
    fetch.mockResolvedValueOnce(jsonResponse(200, { accessToken: 'fresh-token' }));
    await expect(refreshSession()).resolves.toBe('fresh-token');
  });
});

function jwtExpiringIn(seconds) {
  const payload = btoa(JSON.stringify({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + seconds }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${payload}.signature`;
}

describe('proactive access token renewal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    stopTokenRenewal();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reads the exp claim out of a JWT', () => {
    const token = jwtExpiringIn(900);
    expect(accessTokenExpiryMs(token)).toBeGreaterThan(Date.now());
    expect(accessTokenExpiryMs('not-a-jwt')).toBeNull();
    expect(accessTokenExpiryMs(null)).toBeNull();
  });

  it('refreshes a minute before the token expires, without waiting for a 401', async () => {
    fetch.mockResolvedValue(jsonResponse(200, { accessToken: 'renewed-token' }));
    scheduleTokenRenewal(jwtExpiringIn(900));

    await vi.advanceTimersByTimeAsync(838_000);
    expect(fetch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(3_000);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toContain('/auth/refresh');
    expect(useAuthStore.getState().accessToken).toBe('renewed-token');
  });

  it('is armed automatically whenever the store receives a new access token', async () => {
    fetch.mockResolvedValue(jsonResponse(200, { accessToken: 'renewed-token' }));
    useAuthStore.getState().setSession({ user: { id: 'u1' }, accessToken: jwtExpiringIn(900) });

    await vi.advanceTimersByTimeAsync(841_000);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('stops renewing once the session is cleared', async () => {
    fetch.mockResolvedValue(jsonResponse(200, { accessToken: 'renewed-token' }));
    useAuthStore.getState().setSession({ user: { id: 'u1' }, accessToken: jwtExpiringIn(900) });
    useAuthStore.getState().clearSession();

    await vi.advanceTimersByTimeAsync(900_000);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('ignores an opaque token it cannot read an expiry from', async () => {
    scheduleTokenRenewal('opaque-token');
    await vi.advanceTimersByTimeAsync(3_600_000);
    expect(fetch).not.toHaveBeenCalled();
  });
});
