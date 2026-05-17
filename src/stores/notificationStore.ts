import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error' | 'hot_lead';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  prospectId?: string;
  cta?: {
    label: string;
    actionType: 'call' | 'prototype' | 'profile';
  };
  autoDismiss?: number; // ms
}

interface NotificationState {
  notifications: Notification[];
  toasts: Notification[];
  pushNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      toasts: [],
      
      pushNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotif: Notification = {
          ...notification,
          id,
          timestamp: new Date(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 50), // Keep last 50
          toasts: [newNotif, ...state.toasts].slice(0, 4) // Max 4 toasts at once
        }));
      },
      
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
        
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
        
      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
        
      clearAll: () => set({ notifications: [], toasts: [] }),
    }),
    {
      name: 'stonelink-notifications',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
