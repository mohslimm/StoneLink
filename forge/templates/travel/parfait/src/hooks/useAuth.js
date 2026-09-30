import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const user      = useAuthStore((s) => s.user)
  const isLogged  = useAuthStore((s) => s.isLogged)
  const login     = useAuthStore((s) => s.login)
  const logout    = useAuthStore((s) => s.logout)
  const register  = useAuthStore((s) => s.register)
  const bookings  = useAuthStore((s) => s.bookings)
  const addBooking = useAuthStore((s) => s.addBooking)

  return { user, isLogged, login, logout, register, bookings, addBooking }
}
