import { motion } from 'framer-motion'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { formatDA } from '../utils/formatDA'
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants'
import { getImg } from '../utils/unsplash'

const STATUS_COLORS = {
  confirmé: { bg: '#006233/10', text: '#006233', label: 'Confirmé' },
  terminé:  { bg: '#C9A96E/10', text: '#a8834a', label: 'Terminé' },
  annulé:   { bg: '#D21034/10', text: '#D21034', label: 'Annulé' },
}

export default function Dashboard() {
  const { user, isLogged, bookings, logout } = useAuth()

  if (!isLogged) return <Navigate to="/login" replace />

  const upcoming  = bookings.filter((b) => b.status === 'confirmé')
  const completed = bookings.filter((b) => b.status === 'terminé')

  return (
    <div className="bg-[#FAF7F2] pt-24 pb-20 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#006233] to-[#004d27] py-14 mb-12">
        <div className="container-custom">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            {/* Avatar */}
            <motion.div
              variants={staggerItem}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9A96E] to-[#a8834a] flex items-center justify-center text-white text-3xl font-bold font-display shadow-gold"
            >
              {user?.firstName?.[0]?.toUpperCase() ?? 'V'}
            </motion.div>
            <div>
              <motion.p variants={staggerItem} className="text-[#C9A96E] text-sm font-body tracking-wider uppercase">
                Bienvenue
              </motion.p>
              <motion.h1 variants={staggerItem} className="font-display text-3xl font-bold text-white">
                {user?.name || 'Voyageur'}
              </motion.h1>
              <motion.p variants={staggerItem} className="text-white/60 text-sm font-body mt-1">
                Membre depuis {user?.memberSince} • {bookings.length} voyage{bookings.length > 1 ? 's' : ''}
              </motion.p>
            </div>
            <div className="sm:ml-auto flex items-center gap-3">
              <Link
                to="/destinations"
                className="px-4 py-2 bg-[#C9A96E] text-white rounded-xl text-sm font-medium font-body hover:bg-[#dbbf8a] transition-colors"
              >
                + Nouveau voyage
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 border border-white/20 text-white/70 rounded-xl text-sm font-medium font-body hover:bg-white/10 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom space-y-12">
        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Voyages effectués', value: completed.length, icon: '✈️' },
            { label: 'Voyages à venir',   value: upcoming.length,  icon: '🗓️' },
            { label: 'Pays visités',       value: new Set(bookings.map((b) => b.destination)).size, icon: '🌍' },
            { label: 'Total dépensé',      value: formatDA(bookings.reduce((a, b) => a + b.totalPrice, 0)), icon: '💰', mono: true },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="bg-white rounded-2xl p-5 shadow-card"
            >
              <span className="text-2xl mb-3 block">{stat.icon}</span>
              <p className={`font-bold text-[#0A0A0F] ${stat.mono ? 'font-mono text-sm' : 'font-display text-3xl'}`}>
                {stat.value}
              </p>
              <p className="text-xs text-[#0A0A0F]/50 font-body mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#0A0A0F] mb-5">
              Voyages à venir 🗓️
            </h2>
            <div className="space-y-4">
              {upcoming.map((booking) => (
                <BookingCard key={booking.ref} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#0A0A0F] mb-5">
              Historique ✈️
            </h2>
            <div className="space-y-4">
              {completed.map((booking) => (
                <BookingCard key={booking.ref} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {bookings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="font-display text-2xl font-bold text-[#0A0A0F] mb-2">
              Aucun voyage pour l'instant
            </h3>
            <p className="text-[#0A0A0F]/60 font-body mb-6">
              Découvrez nos destinations et planifiez votre prochain voyage.
            </p>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#006233] text-white rounded-xl font-semibold font-body hover:bg-[#007a3f] transition-colors"
            >
              Explorer les destinations
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking }) {
  const statusConfig = STATUS_COLORS[booking.status] || STATUS_COLORS.confirmé

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-5 flex-wrap"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#006233]/10 to-[#C9A96E]/10 flex items-center justify-center text-2xl flex-shrink-0">
        ✈️
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-[#0A0A0F] font-body">{booking.destination}</h3>
          <span
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `rgba(${statusConfig.text === '#006233' ? '0,98,51' : statusConfig.text === '#a8834a' ? '168,131,74' : '210,16,52'}, 0.1)`,
              color: statusConfig.text,
            }}
          >
            {statusConfig.label}
          </span>
        </div>
        <p className="text-sm text-[#0A0A0F]/50 font-body mt-1">
          {booking.departure} → {booking.returnDate} • {booking.travelers} voyageur{booking.travelers > 1 ? 's' : ''}
        </p>
        <p className="text-xs text-[#0A0A0F]/40 font-mono mt-1">Ref: {booking.ref}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-mono font-bold text-[#006233] text-lg">{formatDA(booking.totalPrice)}</p>
        <p className="text-xs text-[#0A0A0F]/40 font-body">{booking.airline}</p>
      </div>
    </motion.div>
  )
}
