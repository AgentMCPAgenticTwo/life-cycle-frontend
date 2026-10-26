import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { refreshSession, scheduleProactiveRefresh, clearScheduledRefresh } from '@/services/http';
import * as authService from '@/services/authService';

/**
 * Single entry point for the signed-in user's identity and session actions.
 * Replaces the old dev `authHeaders.role` / `authHeaders.userId` constants —
 * every screen that needs the current role or user id reads it from here.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  const login = useCallback(
    async (email, password) => {
      const response = await authService.login({ email, password });
      setSession({ user: response.user, accessToken: response.accessToken });
      scheduleProactiveRefresh(response.accessToken);
      return response.user;
    },
    [setSession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearScheduledRefresh();
      clearSession();
    }
  }, [clearSession]);

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      await authService.changePassword({ currentPassword, newPassword });
      setUser({ mustChangePassword: false });
    },
    [setUser]
  );

  /**
   * Restores a session on initial load (full page refresh) from the httpOnly
   * refresh cookie. Clears the session instead of throwing when there is no
   * valid cookie — that is the normal "not signed in yet" case.
   */
  const restoreSession = useCallback(async () => {
    try {
      await refreshSession();
      const me = await authService.getCurrentUser();
      setSession({ user: me, accessToken: useAuthStore.getState().accessToken });
    } catch {
      clearSession();
    } finally {
      setInitializing(false);
    }
  }, [setSession, clearSession, setInitializing]);

  return {
    user,
    role: user?.role ?? null,
    userId: user?.id ?? null,
    isAuthenticated: Boolean(accessToken && user),
    isInitializing,
    login,
    logout,
    changePassword,
    restoreSession,
  };
}
