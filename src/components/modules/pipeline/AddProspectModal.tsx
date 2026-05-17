'use client'

import { useState, memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2, Check } from 'lucide-react'
import type { Prospect, NicheType, Country, Priority } from '@/types/pipeline'
import { useStoneStore } from '@/stores/useStoneStore'
import { NICHE_CONFIG, COUNTRY_CONFIG, PRIORITY_CONFIG } from '@/lib/pipelineConfig'

interface AddProspectModalProps {
  isOpen: boolean
  onClose: () => void
}

const INITIAL_FORM = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  city: '',
  country: 'FR' as Country,
  niche: 'dental' as NicheType,
  priority: 'cold' as Priority,
  estimatedDealValue: '',
  estimatedLoss: '',
}

type FormState = typeof INITIAL_FORM

export const AddProspectModal = memo(({ isOpen, onClose }: AddProspectModalProps) => {
  const addProspect = useStoneStore((s) => s.addProspect)
  const [form, setForm]   = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.companyName.trim()) next.companyName = 'Champ requis'
    if (!form.contactName.trim()) next.contactName = 'Champ requis'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Email invalide'
    if (!form.phone.trim()) next.phone = 'Champ requis'
    if (!form.city.trim())  next.city  = 'Champ requis'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = useCallback(async () => {
    if (!validate()) return
    setStatus('saving')

    const lighthouseScore = form.website
      ? Math.floor(Math.random() * 45) + 15   // simulation score faible
      : undefined

    addProspect({
      companyName:        form.companyName.trim(),
      contactName:        form.contactName.trim(),
      email:              form.email.trim().toLowerCase(),
      phone:              form.phone.trim(),
      website:            form.website.trim() || undefined,
      city:               form.city.trim(),
      country:            form.country,
      niche:              form.niche,
      stage:              'new',
      priority:           form.priority,
      lighthouseScore,
      estimatedDealValue: form.estimatedDealValue ? Number(form.estimatedDealValue) : undefined,
      estimatedLoss:      form.estimatedLoss ? Number(form.estimatedLoss) : undefined,
    })

    setStatus('saved')
    setTimeout(() => {
      setStatus('idle')
      setForm(INITIAL_FORM)
      onClose()
    }, 1200)
  }, [form, addProspect, onClose])  // eslint-disable-line react-hooks/exhaustive-deps

  const inputCls = (field: keyof FormState) =>
    `w-full bg-white/5 border rounded-lg px-3 py-2.5 text-[13px] text-[#f0ede8] outline-none transition-colors ${
      errors[field]
        ? 'border-red-500/60 focus:border-red-500'
        : 'border-white/10 focus:border-[rgba(197,160,89,0.5)]'
    }`

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2 } }}
          >
            <div
              className="w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{
                background: '#0f0f20',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
                <div>
                  <h2 className="font-display text-xl text-[#f0ede8]">Nouveau Prospect</h2>
                  <p className="text-[11px] text-[rgba(240,237,232,0.4)] mt-0.5">
                    Tous les champs marqués * sont obligatoires
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[rgba(240,237,232,0.5)] transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Niche */}
                <div>
                  <label className="block text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-2">
                    Secteur d'activité *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(NICHE_CONFIG) as [NicheType, { label: string; icon: string }][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => set('niche', key)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                        style={{
                          background: form.niche === key ? 'rgba(197,160,89,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${form.niche === key ? 'rgba(197,160,89,0.4)' : 'rgba(255,255,255,0.07)'}`,
                          color: form.niche === key ? '#c5a059' : 'rgba(240,237,232,0.45)',
                        }}
                      >
                        {cfg.icon} {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entreprise + Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[rgba(240,237,232,0.45)] uppercase tracking-widest mb-1.5">
                      Nom de l'entreprise *
                    </label>
                    <input
                      className={inputCls('companyName')}
                      placeholder="Cabinet Dupont & Associés"
                      value={form.companyName}
                      onChange={(e) => set('companyName', e.target.value)}
                    />
                    {errors.companyName && <p className="text-[10px] text-red-400 mt-1">{errors.companyName}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[rgba(240,237,232,0.45)] uppercase tracking-widest mb-1.5">
                      Prénom + Nom contact *
                    </label>
                    <input
                      className={inputCls('contactName')}
                      placeholder="Dr. Marie Dupont"
                      value={form.contactName}
                      onChange={(e) => set('contactName', e.target.value)}
                    />
                    {errors.contactName && <p className="text-[10px] text-red-400 mt-1">{errors.contactName}</p>}
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[rgba(240,237,232,0.45)] uppercase tracking-widest mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      className={inputCls('email')}
                      placeholder="contact@exemple.fr"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                    />
                    {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[rgba(240,237,232,0.45)] uppercase tracking-widest mb-1.5">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      className={inputCls('phone')}
                      placeholder="+33 1 42 86 ..."
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                    />
                    {errors.phone && <p className="text-[10px] text-red-400 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Website + City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[rgba(240,237,232,0.45)] uppercase tracking-widest mb-1.5">
                      Site web actuel
                    </label>
                    <input
                      className={inputCls('website')}
                      placeholder="https://www.exemple.fr"
                      value={form.website}
                      onChange={(e) => set('website', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[rgba(240,237,232,0.45)] uppercase tracking-widest mb-1.5">
                      Ville *
                    </label>
                    <input
                      className={inputCls('city')}
                      placeholder="Paris, Lyon, Montréal..."
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                    />
                    {errors.city && <p className="text-[10px] text-red-400 mt-1">{errors.city}</p>}
                  </div>
                </div>

                {/* Country + Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[rgba(240,237,232,0.45)] uppercase tracking-widest mb-1.5">
                      Pays
                    </label>
                    <select
                      className={inputCls('country')}
                      value={form.country}
                      onChange={(e) => set('country', e.target.value as Country)}
                    >
                      {(Object.entries(COUNTRY_CONFIG) as [string, { label: string; flag: string }][]).map(([code, cfg]) => (
                        <option key={code} value={code} style={{ background: '#0f0f20' }}>
                          {cfg.flag} {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[rgba(240,237,232,0.45)] uppercase tracking-widest mb-1.5">
                      Priorité
                    </label>
                    <div className="flex gap-2">
                      {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string; color: string; bg: string; pulse: boolean }][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => set('priority', key)}
                          className="flex-1 py-2 rounded-lg text-[11px] font-bold transition-colors"
                          style={{
                            background: form.priority === key ? cfg.bg : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${form.priority === key ? cfg.color + '60' : 'rgba(255,255,255,0.07)'}`,
                            color: form.priority === key ? cfg.color : 'rgba(240,237,232,0.4)',
                          }}
                        >
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Valeur + Perte */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[rgba(240,237,232,0.45)] uppercase tracking-widest mb-1.5">
                      Valeur estimée du deal (€)
                    </label>
                    <input
                      type="number"
                      className={inputCls('estimatedDealValue')}
                      placeholder="5000"
                      value={form.estimatedDealValue}
                      onChange={(e) => set('estimatedDealValue', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1.5">
                      Manque à gagner estimé (€/mois)
                    </label>
                    <input
                      type="number"
                      className={inputCls('estimatedLoss')}
                      placeholder="3000"
                      value={form.estimatedLoss}
                      onChange={(e) => set('estimatedLoss', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider text-[rgba(240,237,232,0.4)] border border-white/10 hover:border-white/20 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={status !== 'idle'}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all disabled:opacity-60"
                  style={{
                    background: status === 'saved'
                      ? 'rgba(22,163,74,0.2)'
                      : 'linear-gradient(135deg, #B8924A, #c5a059, #D4B57A)',
                    color: status === 'saved' ? '#22c55e' : '#1A1200',
                  }}
                  aria-label="Ajouter le prospect"
                >
                  {status === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {status === 'saved'  && <Check className="w-4 h-4" />}
                  {status === 'idle'   && <Save className="w-4 h-4" />}
                  {status === 'idle'   ? 'Ajouter le Prospect'
                  : status === 'saving' ? 'Ajout en cours...'
                  : 'Prospect ajouté ✓'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

AddProspectModal.displayName = 'AddProspectModal'
