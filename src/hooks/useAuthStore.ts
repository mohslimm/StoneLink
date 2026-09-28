import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USER_PROFILES, UserProfile } from '@/data/profiles';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: 'slim' | 'lpiks' | null;
  userProfile: UserProfile | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (username: 'slim' | 'lpiks') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      userProfile: null,

      login: (username, password) => {
        const cleanUser = username.trim().toLowerCase() as 'slim' | 'lpiks';

        if (cleanUser !== 'slim' && cleanUser !== 'lpiks') {
          return {
            success: false,
            error: 'Identifiant inconnu. Utilisez "slim" ou "lpiks".',
          };
        }

        // Accept "StoneLink2026!" or demo fallback
        if (password !== 'StoneLink2026!' && password !== 'stonelink2026!') {
          return {
            success: false,
            error: 'Mot de passe incorrect pour cet utilisateur.',
          };
        }

        const profile = USER_PROFILES[cleanUser];
        set({
          isAuthenticated: true,
          currentUser: cleanUser,
          userProfile: profile,
        });

        return { success: true };
      },

      logout: () =>
        set({
          isAuthenticated: false,
          currentUser: null,
          userProfile: null,
        }),

      switchUser: (username) => {
        const profile = USER_PROFILES[username];
        set({
          isAuthenticated: true,
          currentUser: username,
          userProfile: profile,
        });
      },
    }),
    {
      name: 'stonelink-auth-store',
    }
  )
);
