import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { fadeInUp } from '../animations/variants'

// ─── Animated SVG Checkmark ───────────────────
function AnimatedCheck() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-24 h-24">
      {/* Circle */}
      <motion.circle
        cx="40" cy="40" r="36"
        stroke="#006233"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      {/* Checkmark */}
      <motion.path
        d="M22 40l12 12 24-24"
        stroke="#006233"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.7 }}
      />
    </svg>
  )
}

// ─── Typewriter ───────────────────────────────
function Typewriter({ text }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span className="font-mono text-2xl md:text-3xl font-bold text-[#006233]">
      {displayed}
      <span className="typewriter-cursor">|</span>
    </span>
  )
}

export default function Confirmation() {
  const [params] = useSearchParams()
  const ref  = params.get('ref')  || 'PV-2026-0000'
  const dest = params.get('dest') || 'votre destination'
  const confettiLaunched = useRef(false)

  useEffect(() => {
    if (confettiLaunched.current) return
    confettiLaunched.current = true

    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#006233', '#D21034', '#C9A96E', '#FFFFFF', '#004d27'],
        scalar: 1.1,
      })
    }, 900)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] to-[#f0ebe1] pt-24 pb-20 flex items-center">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          {/* Check animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex justify-center mb-8"
          >
            <div className="w-32 h-32 rounded-full bg-[#006233]/8 flex items-center justify-center">
              <AnimatedCheck />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="font-display text-4xl md:text-5xl font-bold text-[#0A0A0F] mb-3"
          >
            Réservation confirmée !
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-[#0A0A0F]/60 font-body text-lg mb-8"
          >
            Félicitations ! Votre voyage vers{' '}
            <span className="text-[#006233] font-semibold">{dest}</span> est confirmé.
          </motion.p>

          {/* Booking ref — Typewriter */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="inline-flex flex-col items-center gap-2 bg-white rounded-2xl px-8 py-5 shadow-card mb-10"
          >
            <p className="text-sm font-body text-[#0A0A0F]/50 uppercase tracking-wider">
              Numéro de dossier
            </p>
            <Typewriter text={ref} />
          </motion.div>

          {/* Recap card */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.5 }}
            className="bg-white rounded-3xl p-8 shadow-premium text-left mb-10"
          >
            <h2 className="font-display text-2xl font-semibold text-[#0A0A0F] mb-6">
              Prochaines étapes
            </h2>
            <ol className="space-y-5">
              {[
                {
                  icon: '📧',
                  title: 'Email de confirmation',
                  desc: 'Vous recevrez un récapitulatif complet par email dans les 30 minutes.',
                },
                {
                  icon: '📞',
                  title: 'Contact conseiller',
                  desc: 'Un de nos conseillers voyage vous contactera dans les 24h pour finaliser les détails.',
                },
                {
                  icon: '✈️',
                  title: 'Documents de voyage',
                  desc: 'Vos billets, vouchers hôtel et documents seront envoyés 7 jours avant le départ.',
                },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{step.icon}</span>
                  <div>
                    <p className="font-semibold text-[#0A0A0F] font-body">{step.title}</p>
                    <p className="text-sm text-[#0A0A0F]/60 font-body mt-0.5">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#006233] text-white rounded-xl font-semibold font-body hover:bg-[#007a3f] transition-colors"
            >
              Voir mes réservations
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#E8E2D9] text-[#0A0A0F]/70 rounded-xl font-medium font-body hover:border-[#006233] hover:text-[#006233] transition-all"
            >
              Retour à l'accueil
            </Link>
          </motion.div>

          <p className="mt-8 text-[#0A0A0F]/40 text-sm font-arabic">
            شكراً لثقتكم في رحلات مثالية
          </p>
        </div>
      </div>
    </div>
  )
}
