// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — StepEmailPreview.tsx
// Wizard Étape 3 : Génération email IA + Envoi
// ─────────────────────────────────────────────────────────────────
'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Send, Loader2, Check, RefreshCw,
  ExternalLink, Edit3, AlertCircle, Mail,
} from 'lucide-react'
import type { Prospect } from '@/types/pipeline'
import { useStoneStore } from '@/stores/useStoneStore'

// ─── Types ────────────────────────────────────────────────────────

type EmailState =
  | { status: 'generating' }
  | { status: 'ready'; subject: string; bodyText: string; bodyHtml: string; generated: boolean }
  | { status: 'editing'; subject: string; bodyText: string; bodyHtml: string }
  | { status: 'sending' }
  | { status: 'sent'; emailId: string; sentAt: string; simulated?: boolean }
  | { status: 'error'; error: string }

interface StepEmailPreviewProps {
  prospect:   Prospect
  previewUrl: string
  onBack:     () => void
  onDone:     () => void
}

// ─── Component ────────────────────────────────────────────────────

export const StepEmailPreview = memo(({
  prospect,
  previewUrl,
  onBack,
  onDone,
}: StepEmailPreviewProps) => {
  const addEmail         = useStoneStore((s) => s.addEmail)
  const moveToStage      = useStoneStore((s) => s.moveProspectToStage)
  const addReminder      = useStoneStore((s) => s.addReminder)
  const addActivity      = useStoneStore((s) => s.addActivity)
  const setCustomizedUrl = useStoneStore((s) => s.setCustomizedPrototypeUrl)

  const [emailState, setEmailState] = useState<EmailState>({ status: 'generating' })
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody]       = useState('')

  const generateEmail = useCallback(async () => {
    setEmailState({ status: 'generating' })

    try {
      const response = await fetch('/api/email/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect, previewUrl }),
      })

      if (!response.ok) {
        const err = await response.json() as { error?: string }
        throw new Error(err.error ?? `Erreur ${response.status}`)
      }

      const data = await response.json() as {
        subject:   string
        bodyText:  string
        bodyHtml:  string
        generated: boolean
      }

      setEmailState({
        status:    'ready',
        subject:   data.subject,
        bodyText:  data.bodyText,
        bodyHtml:  data.bodyHtml,
        generated: data.generated,
      })
      setEditedSubject(data.subject)
      setEditedBody(data.bodyText)
    } catch (err) {
      setEmailState({
        status: 'error',
        error:  err instanceof Error ? err.message : 'Erreur inconnue',
      })
    }
  }, [prospect, previewUrl])

  // Auto-generate on mount
  useEffect(() => {
    generateEmail()
  }, [generateEmail])

  const handleStartEdit = useCallback(() => {
    setEmailState(prev => {
      if (prev.status !== 'ready') return prev;
      return {
        ...prev,
        status: 'editing'
      } as EmailState;
    });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (emailState.status !== 'editing') return
    setEmailState({
      status:    'ready',
      subject:   editedSubject,
      bodyText:  editedBody,
      bodyHtml:  emailState.bodyHtml,
      generated: false,
    })
  }, [emailState, editedSubject, editedBody])

  const handleSend = useCallback(async () => {
    if (emailState.status !== 'ready') return
    const { subject, bodyText, bodyHtml } = emailState

    setEmailState({ status: 'sending' })

    try {
      const response = await fetch('/api/email/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:          prospect.email,
          subject,
          bodyHtml,
          bodyText,
          prospectId:  prospect.id,
          prototypeUrl: previewUrl,
        }),
      })

      if (!response.ok) {
        const err = await response.json() as { error?: string }
        throw new Error(err.error ?? `Erreur ${response.status}`)
      }

      const result = await response.json() as {
        emailId:   string
        sentAt:    string
        simulated: boolean
      }

      // Mettre à jour le store
      setCustomizedUrl(prospect.id, previewUrl)

      addEmail(prospect.id, {
        subject,
        templateUsed: 'prototype-reveal',
        prototypeUrl: previewUrl,
      })

      moveToStage(prospect.id, 'prototype_sent', 'Email prototype envoyé')

      addActivity(prospect.id, {
        type:        'email_sent',
        description: `Email prototype envoyé — "${subject}"`,
        metadata:    { emailId: result.emailId, previewUrl, simulated: result.simulated },
      })

      // Rappel automatique dans 3 jours
      addReminder({
        prospectId:  prospect.id,
        prospectName: prospect.companyName,
        type:        'prototype_not_opened',
        triggerAt:   new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        message:     `${prospect.companyName} n'a pas encore ouvert l'email prototype. Relancer ${prospect.contactName.split(' ')[0]}.`,
      })

      setEmailState({
        status:    'sent',
        emailId:   result.emailId,
        sentAt:    result.sentAt,
        simulated: result.simulated,
      })
    } catch (err) {
      setEmailState({
        status: 'error',
        error:  err instanceof Error ? err.message : 'Envoi échoué',
      })
    }
  }, [emailState, prospect, previewUrl, addEmail, moveToStage, addActivity, addReminder, setCustomizedUrl])

  // ── GENERATING ──────────────────────────────────────────────────
  if (emailState.status === 'generating') {
    return (
      <div className="flex flex-col h-full gap-5">
        <div>
          <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1">Étape 3 sur 3</div>
          <h3 className="font-display text-xl text-[#f0ede8]">Génération de l&apos;email</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(197,160,89,0.15)' }} />
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(197,160,89,0.1)', border: '1px solid rgba(197,160,89,0.3)' }}>
              <Loader2 className="w-7 h-7 text-[#c5a059] animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-[15px] font-semibold text-[#f0ede8] mb-1">Rédaction par Claude IA</div>
            <div className="text-[12px] text-[rgba(240,237,232,0.4)]">
              Personnalisation pour {prospect.contactName.split(' ')[0]} · {prospect.companyName}
            </div>
          </div>
          {/* Animated dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#c5a059' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── ERROR ───────────────────────────────────────────────────────
  if (emailState.status === 'error') {
    return (
      <div className="flex flex-col h-full gap-5">
        <div>
          <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1">Étape 3 sur 3</div>
          <h3 className="font-display text-xl text-[#f0ede8]">Email</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <div>
            <div className="text-[14px] font-semibold text-red-400 mb-1">{emailState.error}</div>
            <div className="text-[11px] text-[rgba(240,237,232,0.3)]">Vérifiez la configuration ANTHROPIC_API_KEY</div>
          </div>
          <button onClick={generateEmail}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(197,160,89,0.1)', border: '1px solid rgba(197,160,89,0.3)', color: '#c5a059' }}>
            <RefreshCw className="w-3.5 h-3.5" />
            Réessayer
          </button>
        </div>
        <div className="flex justify-start pt-3 border-t border-white/6 shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-[rgba(240,237,232,0.4)] hover:text-[rgba(240,237,232,0.7)] transition-colors">
            <ChevronLeft className="w-4 h-4" /> Retour
          </button>
        </div>
      </div>
    )
  }

  // ── SENT ────────────────────────────────────────────────────────
  if (emailState.status === 'sent') {
    return (
      <div className="flex flex-col h-full gap-5">
        <div>
          <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1">Étape 3 sur 3</div>
          <h3 className="font-display text-xl text-[#f0ede8]">Email envoyé</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.35)' }}
          >
            <Check className="w-9 h-9 text-green-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-[18px] font-semibold text-[#f0ede8] mb-1">
              {emailState.simulated ? 'Email simulé avec succès' : 'Email envoyé à ' + prospect.contactName.split(' ')[0]}
            </div>
            <div className="text-[12px] text-[rgba(240,237,232,0.4)] mb-4">
              {new Date(emailState.sentAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
              {emailState.simulated && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                  Mode démo
                </span>
              )}
            </div>

            {/* Status pills */}
            <div className="flex flex-col gap-2 items-center">
              {[
                { icon: Check, label: 'Stage mis à jour → Prototype Envoyé', color: '#22c55e' },
                { icon: Check, label: 'Email ajouté à l\'historique', color: '#22c55e' },
                { icon: Check, label: 'Rappel créé dans 3 jours', color: '#c5a059' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-[12px] text-[rgba(240,237,232,0.6)]">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <a href={previewUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-[11px] font-bold text-[rgba(197,160,89,0.7)] hover:text-[#c5a059] transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Voir le prototype envoyé
          </a>
        </div>

        <div className="flex justify-end pt-3 border-t border-white/6 shrink-0">
          <button onClick={onDone}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider"
            style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)', color: '#1A1200' }}>
            <Check className="w-4 h-4" />
            Fermer le wizard
          </button>
        </div>
      </div>
    )
  }

  // ── READY / EDITING / SENDING ───────────────────────────────────
  // TypeScript narrow: at this point status is ready | editing | sending
  const isEditing = emailState.status === 'editing'
  const isSending = emailState.status === 'sending'
  const currentSubject = isEditing ? editedSubject : (emailState.status === 'ready' ? emailState.subject : '')
  const currentBody    = isEditing ? editedBody    : (emailState.status === 'ready' ? emailState.bodyText : '')

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div>
        <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1">Étape 3 sur 3</div>
        <h3 className="font-display text-xl text-[#f0ede8]">Email commercial</h3>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-[12px] text-[rgba(240,237,232,0.4)]">
            À : {prospect.email}
          </p>
          {emailState.status === 'ready' && emailState.generated && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
              Généré par IA
            </span>
          )}
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto">
        {/* Subject */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-2">Objet</div>
          {isEditing ? (
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[14px] text-[#f0ede8] font-semibold outline-none focus:border-[rgba(197,160,89,0.5)] transition-colors"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              maxLength={200}
            />
          ) : (
            <div className="text-[14px] font-semibold text-[#f0ede8]">{currentSubject}</div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 rounded-xl p-4 min-h-[200px]"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-2">Corps</div>
          {isEditing ? (
            <textarea
              className="w-full h-48 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-[#f0ede8] outline-none focus:border-[rgba(197,160,89,0.5)] transition-colors resize-none leading-relaxed"
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
            />
          ) : (
            <div className="text-[13px] text-[rgba(240,237,232,0.85)] whitespace-pre-line leading-relaxed">
              {currentBody}
            </div>
          )}
        </div>

        {/* Prototype link */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(197,160,89,0.05)', border: '1px solid rgba(197,160,89,0.15)' }}>
          <Mail className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
          <span className="text-[11px] text-[rgba(240,237,232,0.5)] truncate flex-1">Lien prototype : {previewUrl}</span>
          <a href={previewUrl} target="_blank" rel="noreferrer" className="shrink-0">
            <ExternalLink className="w-3.5 h-3.5 text-[rgba(197,160,89,0.6)] hover:text-[#c5a059] transition-colors" />
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {emailState.status === 'ready' && (
            <>
              <button onClick={generateEmail}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,237,232,0.5)' }}>
                <RefreshCw className="w-3 h-3" />
                Regénérer
              </button>
              <button onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,237,232,0.5)' }}>
                <Edit3 className="w-3 h-3" />
                Modifier manuellement
              </button>
            </>
          )}
          {isEditing && (
            <button onClick={handleSaveEdit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-colors"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
              <Check className="w-3 h-3" />
              Valider les modifications
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-3 border-t border-white/6 shrink-0">
        <button
          onClick={onBack}
          disabled={isSending}
          className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-[rgba(240,237,232,0.4)] hover:text-[rgba(240,237,232,0.7)] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>

        <button
          onClick={handleSend}
          disabled={isSending || isEditing || emailState.status !== 'ready'}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isSending ? 'rgba(197,160,89,0.1)' : 'linear-gradient(135deg, #B8924A, #c5a059)',
            color:      isSending ? '#c5a059' : '#1A1200',
            border:     isSending ? '1px solid rgba(197,160,89,0.3)' : 'none',
          }}
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Envoyer maintenant
            </>
          )}
        </button>
      </div>

      {/* Edit warning */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="text-[10px] text-amber-400 text-center"
          >
            ⚠ Validez vos modifications avant d&apos;envoyer l&apos;email
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

StepEmailPreview.displayName = 'StepEmailPreview'
