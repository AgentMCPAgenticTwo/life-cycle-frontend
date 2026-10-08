import { create } from 'zustand';

// Shape matches the templateLibrarySlice contract exactly: activeTab,
// selectedItemId. selectedItemId doubles as the editor-open flag: 'new'
// opens the editor in create mode, an id opens it in edit mode, null means
// the list grid is showing.
export const useTemplateLibraryStore = create((set) => ({
  activeTab: 'templates',
  selectedItemId: null,

  setActiveTab: (tab) => set({ activeTab: tab, selectedItemId: null }),
  selectItem: (id) => set({ selectedItemId: id }),
  clearSelection: () => set({ selectedItemId: null }),
}));
