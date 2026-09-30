import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { fadeInUp } from '../animations/variants'
import { getImg } from '../utils/unsplash'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      login({
        email: formData.email,
        name: formData.name || 'Voyageur Algérien',
        firstName: (formData.name || 'Voyageur').split(' ')[0],
        memberSince: 'Avril 2026',
      })
      setLoading(false)
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div className="min-h-screen flex bg-[#FAF7F2]">
      {/* Left: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 pt-32">
        <motion.div
          key={isRegister ? 'register' : 'login'}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-block mb-8">
              <span className="font-display text-2xl font-bold tracking-tighter">
                PARFAIT <span className="text-[#006233]">VOYAGE</span>
              </span>
            </Link>
            <h1 className="font-display text-4xl font-bold text-[#0A0A0F] mb-3">
              {isRegister ? 'Créer un compte' : 'Bon retour !'}
            </h1>
            <p className="text-[#0A0A0F]/60 font-body">
              {isRegister 
                ? 'Rejoignez la communauté des voyageurs algériens.' 
                : 'Connectez-vous pour gérer vos réservations.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-1.5 font-body">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mohamed Amine"
                  className="w-full px-5 py-4 bg-white border border-[#E8E2D9] rounded-2xl focus:outline-none focus:border-[#006233] focus:ring-1 focus:ring-[#006233] transition-all font-body"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </motion.div>
            )}

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-1.5 font-body">
                Adresse email
              </label>
              <input
                type="email"
                required
                placeholder="votre@email.com"
                className="w-full px-5 py-4 bg-white border border-[#E8E2D9] rounded-2xl focus:outline-none focus:border-[#006233] focus:ring-1 focus:ring-[#006233] transition-all font-body"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </motion.div>

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-1.5 font-body">
                Mot de passe
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-white border border-[#E8E2D9] rounded-2xl focus:outline-none focus:border-[#006233] focus:ring-1 focus:ring-[#006233] transition-all font-body"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </motion.div>

            <div className="flex items-center justify-between text-sm font-body">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#E8E2D9] text-[#006233] focus:ring-[#006233]" />
                <span className="text-[#0A0A0F]/60">Se souvenir de moi</span>
              </label>
              {!isRegister && (
                <button type="button" className="text-[#006233] font-semibold hover:underline">
                  Mot de passe oublié ?
                </button>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 bg-[#0A0A0F] text-white rounded-2xl font-bold font-body text-lg hover:bg-[#1a1a24] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isRegister ? "S'inscrire" : "Se connecter"}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-[#0A0A0F]/60 font-body">
            {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#006233] font-bold hover:underline"
            >
              {isRegister ? 'Se connecter' : 'Créer un compte'}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Right: Image / Branding */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          src={getImg('luxury,travel,algeria', 1200, 1600)}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Voyage Premium"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#006233]/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-16 left-16 right-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl"
          >
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              "Le voyage parfait commence par un seul clic."
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]" />
              <div>
                <p className="text-white font-semibold font-body">L'équipe Parfait Voyage</p>
                <p className="text-white/60 text-xs font-body">Basée à Alger</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
