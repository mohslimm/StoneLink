import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBookingStore } from '../../store/bookingStore'
import { formatDA } from '../../utils/formatDA'
import { stepForward, stepBackward } from '../../animations/variants'

// ─── Animated SVG Checkbox ────────────────────
function AnimatedCheckbox({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors duration-200"
      style={{
        borderColor: checked ? '#006233' : '#C9A96E',
        backgroundColor: checked ? '#006233' : 'transparent',
      }}
      data-cursor="pointer"
    >
      <AnimatePresence>
        {checked && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            viewBox="0 0 12 10"
            fill="none"
            className="w-3 h-2.5"
          >
            <motion.path
              d="M1 5l3.5 3.5L11 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  )
}

// ─── Step 1 ───────────────────────────────────
function Step1({ store }) {
  const cities = [
    { code: 'ALG', label: 'Alger' },
    { code: 'ORN', label: 'Oran' },
    { code: 'CZL', label: 'Constantine' },
    { code: 'AAE', label: 'Annaba' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">
          Ville de départ
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cities.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => store.setField('departureCity', c.code)}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-medium font-mono transition-all ${
                store.departureCity === c.code
                  ? 'border-[#006233] bg-[#006233] text-white'
                  : 'border-[#E8E2D9] text-[#0A0A0F]/60 hover:border-[#006233]'
              }`}
              data-cursor="pointer"
            >
              {c.code}
              <span className="block text-xs opacity-70">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">
            Date de départ
          </label>
          <input
            type="date"
            value={store.departureDate}
            onChange={(e) => store.setField('departureDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm font-body focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">
            Date de retour
          </label>
          <input
            type="date"
            value={store.returnDate}
            onChange={(e) => store.setField('returnDate', e.target.value)}
            min={store.departureDate || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm font-body focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">
            Adultes
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => store.setField('adults', Math.max(1, store.adults - 1))}
              className="w-10 h-10 rounded-xl border border-[#E8E2D9] flex items-center justify-center hover:border-[#006233] transition-colors"
            >–</button>
            <span className="font-mono text-xl font-semibold w-8 text-center">
              {store.adults}
            </span>
            <button
              type="button"
              onClick={() => store.setField('adults', Math.min(10, store.adults + 1))}
              className="w-10 h-10 rounded-xl border border-[#E8E2D9] flex items-center justify-center hover:border-[#006233] transition-colors"
            >+</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">
            Enfants (-12 ans)
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => store.setField('children', Math.max(0, store.children - 1))}
              className="w-10 h-10 rounded-xl border border-[#E8E2D9] flex items-center justify-center hover:border-[#006233] transition-colors"
            >–</button>
            <span className="font-mono text-xl font-semibold w-8 text-center">
              {store.children}
            </span>
            <button
              type="button"
              onClick={() => store.setField('children', Math.min(10, store.children + 1))}
              className="w-10 h-10 rounded-xl border border-[#E8E2D9] flex items-center justify-center hover:border-[#006233] transition-colors"
            >+</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2 ───────────────────────────────────
function Step2({ store }) {
  return (
    <div className="space-y-4">
      <p className="text-[#0A0A0F]/60 text-sm font-body mb-4">
        Personnalisez votre voyage avec nos options exclusives.
      </p>
      {store.extras.map((extra) => {
        const selected = store.selectedExtras.includes(extra.id)
        return (
          <motion.div
            key={extra.id}
            whileTap={{ scale: 0.99 }}
            onClick={() => store.toggleExtra(extra.id)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
              selected
                ? 'border-[#006233] bg-[#006233]/5'
                : 'border-[#E8E2D9] hover:border-[#C9A96E]/50'
            }`}
            data-cursor="pointer"
          >
            <AnimatedCheckbox
              checked={selected}
              onChange={() => store.toggleExtra(extra.id)}
            />
            <div className="flex-1">
              <p className="font-medium text-[#0A0A0F] font-body text-sm">{extra.label}</p>
            </div>
            <span className="font-mono text-sm font-semibold text-[#006233]">
              +{formatDA(extra.price)}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Step 3 ───────────────────────────────────
function Step3({ store }) {
  const fields = [
    { key: 'firstName', label: 'Prénom', placeholder: 'Karim', type: 'text' },
    { key: 'lastName',  label: 'Nom',    placeholder: 'Messaoudi', type: 'text' },
    { key: 'email',     label: 'Email',  placeholder: 'karim@email.com', type: 'email' },
    { key: 'phone',     label: 'Téléphone', placeholder: '+213 555 123 456', type: 'tel' },
    { key: 'address',   label: 'Adresse', placeholder: 'Rue Didouche Mourad, Alger', type: 'text' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.slice(0, 2).map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">{f.label}</label>
            <input
              type={f.type}
              value={store[f.key]}
              onChange={(e) => store.setField(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm font-body focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10"
            />
          </div>
        ))}
      </div>
      {fields.slice(2).map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">{f.label}</label>
          <input
            type={f.type}
            value={store[f.key]}
            onChange={(e) => store.setField(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] bg-white text-sm font-body focus:outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#006233]/10"
          />
        </div>
      ))}
    </div>
  )
}

// ─── Step 4 ───────────────────────────────────
function Step4({ store }) {
  const methods = [
    { id: 'card',     label: 'Carte bancaire', icon: '💳' },
    { id: 'virement', label: 'Virement CCP/BNA', icon: '🏦' },
    { id: 'especes',  label: 'Espèces en agence', icon: '💵' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-[#0A0A0F]/60 text-sm font-body">
        Choisissez votre mode de paiement préféré.
      </p>
      {methods.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => store.setField('paymentMethod', m.id)}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
            store.paymentMethod === m.id
              ? 'border-[#006233] bg-[#006233]/5'
              : 'border-[#E8E2D9] hover:border-[#C9A96E]/50'
          }`}
          data-cursor="pointer"
        >
          <span className="text-2xl">{m.icon}</span>
          <span className="font-medium font-body text-[#0A0A0F]">{m.label}</span>
          {store.paymentMethod === m.id && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto w-5 h-5 rounded-full bg-[#006233] flex items-center justify-center"
            >
              <svg viewBox="0 0 12 10" fill="none" className="w-3 h-2.5">
                <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Main Stepper ─────────────────────────────
const STEPS = [
  { id: 1, label: 'Dates & Voyageurs' },
  { id: 2, label: 'Options' },
  { id: 3, label: 'Coordonnées' },
  { id: 4, label: 'Paiement' },
]

export function Stepper({ onComplete }) {
  const store = useBookingStore()
  const direction = store.stepDirection

  const variants = direction === 'forward' ? stepForward : stepBackward

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <motion.div
                animate={{
                  backgroundColor: store.step >= s.id ? '#006233' : '#E8E2D9',
                  scale: store.step === s.id ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold font-mono flex-shrink-0"
                style={{ color: store.step >= s.id ? 'white' : '#0A0A0F80' }}
              >
                {store.step > s.id ? (
                  <svg viewBox="0 0 12 10" fill="none" className="w-3.5 h-3">
                    <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : s.id}
              </motion.div>
              {i < STEPS.length - 1 && (
                <motion.div
                  className="h-0.5 flex-1 rounded-full"
                  animate={{ backgroundColor: store.step > s.id ? '#006233' : '#E8E2D9' }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-1">
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={`text-xs font-body transition-colors ${
                store.step >= s.id ? 'text-[#006233] font-medium' : 'text-[#0A0A0F]/40'
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* Animated progress bar */}
        <div className="h-1.5 bg-[#E8E2D9] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #006233, #C9A96E)' }}
            animate={{ width: `${(store.step / 4) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={store.step}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {store.step === 1 && <Step1 store={store} />}
          {store.step === 2 && <Step2 store={store} />}
          {store.step === 3 && <Step3 store={store} />}
          {store.step === 4 && <Step4 store={store} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={store.prevStep}
          disabled={store.step === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E2D9] text-sm font-medium font-body text-[#0A0A0F]/60 hover:border-[#006233] hover:text-[#006233] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          data-cursor="pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Retour
        </motion.button>

        {store.step < 4 ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={store.nextStep}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#006233] text-white rounded-xl text-sm font-semibold font-body hover:bg-[#007a3f] transition-colors shadow-premium"
            data-cursor="pointer"
          >
            Continuer
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </motion.button>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#006233] to-[#C9A96E] text-white rounded-xl text-sm font-semibold font-body hover:opacity-90 transition-opacity shadow-gold"
            data-cursor="pointer"
          >
            Confirmer la réservation ✓
          </motion.button>
        )}
      </div>
    </div>
  )
}
