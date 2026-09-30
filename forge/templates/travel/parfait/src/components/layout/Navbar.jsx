import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { drawerVariant, fadeInDown, staggerContainer, staggerItem } from '../../animations/variants'
import { useAuth } from '../../hooks/useAuth'

const navLinks = [
  { label: 'Accueil',       path: '/' },
  { label: 'Destinations',  path: '/destinations' },
  { label: 'Offres',        path: '/destinations?cat=Luxe' },
  { label: 'À propos',      path: '/about' },
  { label: 'Contact',       path: '/contact' },
]

export function Navbar() {
  const { scrollY } = useScroll()
  const navBg = useTransform(scrollY, [0, 80], ['rgba(250,247,242,0.9)', 'rgba(250,247,242,0.98)'])
  const navBlur = useTransform(scrollY, [0, 80], ['blur(10px)', 'blur(20px)'])

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { isLogged, user, logout } = useAuth()

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 60))
    return unsub
  }, [scrollY])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const isHome = location.pathname === '/'

  return (
    <>
      <motion.nav
        style={{
          backgroundColor: isHome ? navBg : 'rgba(250,247,242,0.97)',
          backdropFilter: isHome ? navBlur : 'blur(20px)',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        }}
        className="fixed top-0 left-0 right-0 z-[100] transition-shadow duration-300"
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <motion.div variants={fadeInDown} initial="hidden" animate="visible">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-display font-semibold text-[#0A0A0F] text-lg tracking-wide">Alibi</span>
                  <span className="font-display text-primary text-xs tracking-[0.2em] uppercase">Voyage</span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop links */}
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="hidden md:flex items-center gap-1"
            >
              {navLinks.map((link) => {
                const active = location.pathname === link.path
                return (
                  <motion.li key={link.path} variants={staggerItem}>
                    <Link
                      to={link.path}
                      className="relative px-4 py-2 text-sm font-medium font-body text-[#0A0A0F]/70 hover:text-primary transition-colors rounded-xl"
                      data-cursor="pointer"
                    >
                      {link.label}
                      {active && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 bg-primary rounded-full"
                        />
                      )}
                    </Link>
                  </motion.li>
                )
              })}
            </motion.ul>

            {/* CTA + Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isLogged ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                      {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    {user?.firstName}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors px-2"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-[#0A0A0F]/70 hover:text-primary px-3 py-2 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/reservation"
                    className="pulse-soft inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors shadow-premium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Réserver
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl hover:bg-[#E8E2D9] transition-colors"
              data-cursor="pointer"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <motion.span
                  animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
                  className="block h-0.5 w-full bg-[#0A0A0F] rounded origin-center"
                />
                <motion.span
                  animate={{ opacity: menuOpen ? 0 : 1 }}
                  className="block h-0.5 w-full bg-[#0A0A0F] rounded"
                />
                <motion.span
                  animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
                  className="block h-0.5 w-full bg-[#0A0A0F] rounded origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={drawerVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-16 left-0 right-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-xl border-b border-[#E8E2D9] shadow-xl md:hidden"
          >
            <div className="container-custom py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-3 rounded-xl font-medium text-[#0A0A0F]/80 hover:bg-[#006233]/5 hover:text-[#006233] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-[#E8E2D9] flex flex-col gap-3">
                {isLogged ? (
                  <button
                    onClick={logout}
                    className="text-left px-4 py-3 text-red-500 font-medium"
                  >
                    Déconnexion
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="px-4 py-3 text-[#0A0A0F]/70 font-medium">
                      Connexion
                    </Link>
                    <Link
                      to="/reservation"
                      className="px-6 py-3 bg-[#006233] text-white rounded-xl font-semibold text-center"
                    >
                      Réserver un voyage
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
