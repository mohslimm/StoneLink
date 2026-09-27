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
    set((state) => {
      // Prevent exact duplicate toast messages
      if (state.toasts.some((t) => t.message === toast.message)) {
        return state;
      }

      // If this is a Copilot suggestion toast, replace any existing Copilot suggestion
      let filtered = state.toasts;
      if (toast.message.startsWith('Suggestion Copilote')) {
        filtered = filtered.filter((t) => !t.message.startsWith('Suggestion Copilote'));
      }

      // Keep maximum 3 toasts visible at a time
      const updated = [...filtered, { ...toast, id }].slice(-3);
      return { toasts: updated };
    });

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4500);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setSettingsTab: (tab) => set({ settingsTab: tab }),
  setCrmView: (view) => set({ crmView: view }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
}));
