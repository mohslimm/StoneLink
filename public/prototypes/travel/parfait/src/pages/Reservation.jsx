import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stepper } from '../components/booking/Stepper'
import { BookingSummary } from '../components/booking/BookingSummary'
import { useBookingStore } from '../store/bookingStore'
import { useAuthStore } from '../store/authStore'
import { generateRef } from '../utils/generateRef'
import { fadeInUp } from '../animations/variants'

export default function Reservation() {
  const navigate = useNavigate()
  const store = useBookingStore()
  const addBooking = useAuthStore((s) => s.addBooking)

  const handleComplete = () => {
    // Generate booking and save
    const ref = generateRef()
    const destination = store.destination

    if (destination) {
      const basePrice = destination.price * (store.adults + store.children * 0.5)
      const extrasTotal = store.selectedExtras.reduce((acc, id) => {
        const found = store.extras.find((e) => e.id === id)
        return acc + (found ? found.price : 0)
      }, 0)

      addBooking({
        ref,
        destination: destination.name,
        country: destination.country,
        status: 'confirmé',
        departure: store.departureDate || 'À définir',
        returnDate: store.returnDate || 'À définir',
        travelers: store.adults + store.children,
        totalPrice: basePrice + extrasTotal,
        airline: destination.airline,
        departureCity: store.departureCity,
        createdAt: new Date().toISOString().split('T')[0],
      })
    }

    store.reset()
    navigate(`/confirmation?ref=${ref}&dest=${encodeURIComponent(destination?.name || '')}`)
  }

  return (
    <div className="bg-[#FAF7F2] pt-24 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#006233] to-[#004d27] py-16 mb-12">
        <div className="container-custom text-center">
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest font-body mb-3"
          >
            Réservation
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold text-white"
          >
            Finalisez votre voyage
          </motion.h1>
          {store.destination && (
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="text-white/70 font-body text-lg mt-2"
            >
              {store.destination.name}, {store.destination.country}
            </motion.p>
          )}
        </div>
      </div>

      <div className="container-custom">
        {!store.destination ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">✈️</div>
            <h2 className="font-display text-3xl font-bold text-[#0A0A0F] mb-4">
              Choisissez d'abord votre destination
            </h2>
            <p className="text-[#0A0A0F]/60 font-body mb-8">
              Parcourez nos destinations et cliquez sur "Réserver ce voyage".
            </p>
            <a
              href="/destinations"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#006233] text-white rounded-2xl font-semibold font-body hover:bg-[#007a3f] transition-colors"
            >
              Voir les destinations
            </a>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Stepper */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-card"
            >
              <Stepper onComplete={handleComplete} />
            </motion.div>

            {/* Summary */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.15 }}
              className="lg:col-span-2"
            >
              <BookingSummary />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
