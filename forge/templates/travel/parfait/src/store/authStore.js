import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockBookings } from '../data/bookings'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLogged: false,
      bookings: mockBookings,

      login: (email, password) => {
        // Mock login — accepts any credentials
        const user = {
          id: 1,
          email,
          name: email.split('@')[0].replace(/\./g, ' '),
          firstName: email.split('@')[0].split('.')[0],
          avatar: null,
          memberSince: '2024',
          phone: '+213 555 123 456',
        }
        set({ user, isLogged: true })
        return { success: true }
      },

      register: (data) => {
        const user = {
          id: Date.now(),
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          avatar: null,
          memberSince: new Date().getFullYear().toString(),
          phone: data.phone || '',
        }
        set({ user, isLogged: true })
        return { success: true }
      },

      logout: () => set({ user: null, isLogged: false }),

      addBooking: (booking) =>
        set((state) => ({ bookings: [booking, ...state.bookings] })),
    }),
    {
      name: 'parfait-voyages-auth',
    }
  )
)
