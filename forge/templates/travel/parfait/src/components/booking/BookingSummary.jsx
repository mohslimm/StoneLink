import { motion, AnimatePresence } from 'framer-motion'
import { useBookingStore } from '../../store/bookingStore'
import { formatDA } from '../../utils/formatDA'

function PriceDigit({ digit }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={digit}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        {digit}
      </motion.span>
    </AnimatePresence>
  )
}

function FlipPrice({ amount }) {
  const str = formatDA(amount)
  return (
    <div className="flex items-center gap-0">
      {str.split('').map((char, i) => (
        <PriceDigit key={`${i}-${char}`} digit={char} />
      ))}
    </div>
  )
}

export function BookingSummary() {
  const store = useBookingStore()
  const { destination, adults, children, selectedExtras, extras } = store

  if (!destination) return null

  const basePrice = destination.price * (adults + children * 0.5)
  const extrasTotal = selectedExtras.reduce((acc, id) => {
    const found = extras.find((e) => e.id === id)
    return acc + (found ? found.price : 0)
  }, 0)
  const total = basePrice + extrasTotal

  return (
    <div className="bg-[#FAF7F2] rounded-3xl p-6 shadow-card sticky top-24">
      <h3 className="font-display text-xl font-semibold text-[#0A0A0F] mb-4">
        Récapitulatif
      </h3>

      {/* Destination */}
      <div className="relative h-36 rounded-2xl overflow-hidden mb-4">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 img-overlay" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-display font-semibold text-lg">{destination.name}</p>
          <p className="text-white/70 text-xs font-body">{destination.country}</p>
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm font-body">
          <span className="text-[#0A0A0F]/60">
            Base ({adults} adulte{adults > 1 ? 's' : ''}{children > 0 ? ` + ${children} enfant${children > 1 ? 's' : ''}` : ''})
          </span>
          <span className="font-mono text-[#0A0A0F]">{formatDA(basePrice)}</span>
        </div>

        {selectedExtras.map((id) => {
          const extra = extras.find((e) => e.id === id)
          if (!extra) return null
          return (
            <div key={id} className="flex justify-between text-sm font-body">
              <span className="text-[#0A0A0F]/60">{extra.label}</span>
              <span className="font-mono text-[#C9A96E]">+{formatDA(extra.price)}</span>
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className="border-t border-[#E8E2D9] pt-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#0A0A0F] font-body">Total</span>
          <div className="font-mono text-xl font-bold text-[#006233]">
            <FlipPrice amount={total} />
          </div>
        </div>
        <p className="text-xs text-[#0A0A0F]/40 font-body mt-1 font-arabic text-right">
          {formatDA(total, true)}
        </p>
      </div>

      {/* Includes */}
      {destination.included && (
        <div className="mt-4 pt-4 border-t border-[#E8E2D9]">
          <p className="text-xs font-semibold text-[#0A0A0F]/40 uppercase tracking-wider mb-2 font-body">
            Inclus dans l'offre
          </p>
          <ul className="space-y-1">
            {destination.included.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-[#0A0A0F]/60 font-body">
                <svg className="w-3.5 h-3.5 text-[#006233] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
