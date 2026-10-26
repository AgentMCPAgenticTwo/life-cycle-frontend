import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import * as authService from '@/services/authService';
import * as http from '@/services/http';

vi.mock('@/services/authService');

describe('useAuth.restoreSession', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({ user: null, accessToken: null, isInitializing: true });
  });

  it('restores from the refresh cookie on a cold load', async () => {
    const refresh = vi.spyOn(http, 'refreshSession').mockResolvedValue('fresh-token');
    authService.getCurrentUser.mockResolvedValue({ id: 'u1', role: 'TENANT_ADMIN' });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.restoreSession();
    });

    expect(refresh).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(useAuthStore.getState().accessToken).toBe('fresh-token');
    expect(result.current.isInitializing).toBe(false);
  });

  it('leaves a session that is already in memory alone', async () => {
    const refresh = vi.spyOn(http, 'refreshSession');
    useAuthStore.setState({ user: { id: 'u1' }, accessToken: 'login-token', isInitializing: true });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.restoreSession();
    });

    expect(refresh).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBe('login-token');
    expect(result.current.isInitializing).toBe(false);
  });

  it('clears the session when there is no valid refresh cookie', async () => {
    vi.spyOn(http, 'refreshSession').mockRejectedValue(new Error('refresh failed'));

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.restoreSession();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isInitializing).toBe(false);
  });
});
