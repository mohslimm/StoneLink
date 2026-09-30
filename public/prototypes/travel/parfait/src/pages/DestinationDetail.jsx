import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { destinations } from '../data/destinations'
import { formatDA } from '../utils/formatDA'
import { useBookingStore } from '../store/bookingStore'
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants'
import { Badge } from '../components/ui/Badge'

const TABS = ['Itinéraire', 'Inclus', 'Pratique']

export default function DestinationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const destination = destinations.find((d) => d.id === Number(id))
  const setDestination = useBookingStore((s) => s.setDestination)
  const [activeTab, setActiveTab] = useState(0)

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 120])

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold mb-4">Destination introuvable</h1>
          <Link to="/destinations" className="text-[#006233] hover:underline font-body">
            ← Retour aux destinations
          </Link>
        </div>
      </div>
    )
  }

  const handleBook = () => {
    setDestination(destination)
    navigate('/reservation')
  }

  return (
    <div className="bg-[#FAF7F2]">
      {/* Hero */}
      <div className="relative h-[65vh] min-h-[500px] overflow-hidden bg-[#0A0A0F]">
        <motion.img
          style={{ y: heroY }}
          src={destination.imageLarge}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          data-cursor="image"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/40 via-transparent to-[#0A0A0F]/90" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container-custom">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={staggerItem} className="flex items-center gap-3 mb-4">
                <Link
                  to="/destinations"
                  className="text-white/60 hover:text-white text-sm font-body flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                  Destinations
                </Link>
                <span className="text-white/30">/</span>
                <span className="text-white/60 text-sm font-body">{destination.country}</span>
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-end gap-4 flex-wrap">
                <div>
                  <h1 className="font-display text-5xl md:text-7xl font-bold text-white">
                    {destination.name}
                  </h1>
                  <p className="text-white/70 font-body text-lg mt-1">
                    {destination.country} • {destination.continent}
                  </p>
                </div>
                {destination.badge && (
                  <Badge color={destination.badgeColor}>{destination.badge}</Badge>
                )}
              </motion.div>

              <motion.div variants={staggerItem} className="flex items-center gap-6 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-white">
                  <svg className="w-4 h-4 text-[#C9A96E] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span className="font-mono font-semibold">{destination.rating}</span>
                  <span className="text-white/50 text-sm">({destination.reviews} avis)</span>
                </div>
                <span className="text-white/50">•</span>
                <span className="text-white/70 text-sm font-body">{destination.duration} jours</span>
                <span className="text-white/50">•</span>
                <span className="text-white/70 text-sm font-body">{destination.airline}</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="text-[#0A0A0F]/75 font-body text-lg leading-relaxed">
                {destination.description}
              </p>
            </motion.div>

            {/* Highlights */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="font-display text-2xl font-semibold text-[#0A0A0F] mb-4">
                Points forts du voyage
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {destination.highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-card"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#006233]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#006233]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-sm font-body text-[#0A0A0F]/80">{h}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tabs */}
            <div>
              <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-card mb-6 w-fit">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium font-body transition-all duration-200 relative ${
                      activeTab === i
                        ? 'bg-[#006233] text-white shadow-sm'
                        : 'text-[#0A0A0F]/60 hover:text-[#006233]'
                    }`}
                    data-cursor="pointer"
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 0 && destination.itinerary.length > 0 && (
                <div className="space-y-4">
                  {destination.itinerary.map((day) => (
                    <motion.div
                      key={day.day}
                      variants={staggerItem}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="flex gap-4 bg-white rounded-2xl p-5 shadow-card"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#006233] flex items-center justify-center text-white font-mono font-bold text-sm">
                        {day.day}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0A0A0F] font-body">{day.title}</h4>
                        <p className="text-sm text-[#0A0A0F]/60 font-body mt-1">{day.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 1 && (
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <ul className="space-y-3">
                    {destination.included.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-[#0A0A0F]/80 font-body">
                        <svg className="w-5 h-5 text-[#006233] flex-shrink-0 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 2 && (
                <div className="bg-white rounded-2xl p-6 shadow-card space-y-3">
                  <InfoRow label="Durée" value={`${destination.duration} jours`} />
                  <InfoRow label="Compagnie aérienne" value={destination.airline} />
                  <InfoRow label="Départs disponibles" value={destination.departures.join(', ')} />
                  <InfoRow label="Catégorie" value={destination.category} />
                  <InfoRow label="Prix à partir de" value={formatDA(destination.price)} />
                </div>
              )}
            </div>
          </div>

          {/* Sticky booking sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 shadow-premium sticky top-24"
            >
              <div className="mb-4">
                <p className="text-[#0A0A0F]/50 text-sm font-body">À partir de</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-mono text-3xl font-bold text-[#006233]">
                    {formatDA(destination.price)}
                  </span>
                </div>
                <p className="text-xs text-[#0A0A0F]/40 font-arabic mt-1">
                  {formatDA(destination.price, true)} / personne
                </p>
              </div>

              {/* Price range */}
              <div className="bg-[#FAF7F2] rounded-2xl p-4 mb-6">
                <p className="text-xs font-body text-[#0A0A0F]/60 mb-1">Fourchette de prix</p>
                <p className="font-mono text-sm font-medium text-[#0A0A0F]">
                  {destination.priceRange}
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBook}
                className="w-full py-4 bg-gradient-to-r from-[#006233] to-[#007a3f] text-white rounded-2xl font-bold font-body text-lg hover:opacity-90 transition-opacity shadow-premium mb-3"
                data-cursor="pointer"
              >
                Réserver ce voyage
              </motion.button>

              <a
                href="tel:+213555000000"
                className="flex items-center justify-center gap-2 w-full py-3 border border-[#E8E2D9] rounded-2xl text-sm font-medium text-[#0A0A0F]/70 hover:border-[#006233] hover:text-[#006233] transition-all font-body"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Demander un devis
              </a>

              <p className="text-center text-xs text-[#0A0A0F]/40 font-body mt-3">
                ✓ Annulation gratuite 72h avant le départ
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#E8E2D9] last:border-0">
      <span className="text-sm text-[#0A0A0F]/50 font-body">{label}</span>
      <span className="text-sm font-medium text-[#0A0A0F] font-body">{value}</span>
    </div>
  )
}
