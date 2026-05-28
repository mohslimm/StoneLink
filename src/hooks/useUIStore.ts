import { create } from 'zustand';
import type { Toast } from '@/types';

interface UIState {
  toasts: Toast[];
  settingsTab: string;
  crmView: 'kanban' | 'list';
  isMobileNavOpen: boolean;

  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setSettingsTab: (tab: string) => void;
  setCrmView: (view: 'kanban' | 'list') => void;
  setMobileNavOpen: (open: boolean) => void;
}

let toastIdCounter = 0;

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  settingsTab: 'compte',
  crmView: 'kanban',
  isMobileNavOpen: false,

  addToast: (toast) => {
    const id = `toast-${++toastIdCounter}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setSettingsTab: (tab) => set({ settingsTab: tab }),
  setCrmView: (view) => set({ crmView: view }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
}));
