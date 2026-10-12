import { create } from 'zustand';

// Shape matches the settingsAdminSlice contract exactly. The Settings / Admin
// screen resets to its first tab on every open (no persisted navigation
// state), so activeTab is not restored from storage.
export const useSettingsAdminStore = create((set) => ({
  activeTab: 'users',
  users: [],
  approvalRules: [],
  integrations: [],
  notificationEvents: [],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setUsers: (users) => set({ users }),
  setApprovalRules: (approvalRules) => set({ approvalRules }),
  setIntegrations: (integrations) => set({ integrations }),
  setNotificationEvents: (notificationEvents) => set({ notificationEvents }),
}));
