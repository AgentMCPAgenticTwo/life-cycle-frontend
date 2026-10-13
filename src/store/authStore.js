import { create } from 'zustand';

/**
 * In-memory session state: the access token and signed-in user never touch
 * localStorage, so a page reload always restores the session through
 * POST /auth/refresh (the httpOnly refresh cookie) rather than trusting a
 * client-readable copy of the token.
 */
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isInitializing: true,

  setSession: ({ user, accessToken }) => set({ user, accessToken, isInitializing: false }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
  clearSession: () => set({ user: null, accessToken: null, isInitializing: false }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));
