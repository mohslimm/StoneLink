'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}
import {
  X, ChevronLeft, ChevronRight, User, Phone, Palette,
  ClipboardList, ExternalLink, Save, Check, Loader2, Clock,
  Wand2, Send, Eye, Lock
} from 'lucide-react'
import type { Prospect, DealStage, Priority } from '@/types/pipeline'
import { useStoneStore } from '@/stores/useStoneStore'
import {
  STAGE_CONFIG, NICHE_CONFIG, COUNTRY_CONFIG,
  PRIORITY_CONFIG, ACTIVITY_ICONS, formatTimeAgo, getInitials,
} from '@/lib/pipelineConfig'
import { PrototypeWizard } from './prototype/PrototypeWizard'
import { CallTab } from './call/CallTab'

// ─── Tab Types ────────────────────────────────────────────────────

type DrawerTab = 'profile' | 'call' | 'prototype' | 'history' | 'mirror' | 'vault'

const TABS: { id: DrawerTab; label: string; icon: typeof User }[] = [
  { id: 'profile',   label: 'Profil',     icon: User },
  { id: 'call',      label: 'Appel',      icon: Phone },
  { id: 'prototype', label: 'Prototype',  icon: Palette },
  { id: 'history',   label: 'Historique', icon: ClipboardList },
  { id: 'mirror',    label: 'Mirror',     icon: ExternalLink },
  { id: 'vault',     label: 'Vault',      icon: Lock },
]

// ─── Sub-components ───────────────────────────────────────────────

const LabeledField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1.5">{label}</div>
    {children}
  </div>
)

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-[#f0ede8] outline-none focus:border-[rgba(197,160,89,0.5)] transition-colors'

// ─── Profile Tab ──────────────────────────────────────────────────

const ProfileTab = memo(({ prospect }: { prospect: Prospect }) => {
  const updateProspect = useStoneStore((s) => s.updateProspect)
  const [form, setForm]     = useState({ ...prospect })
  const [saveState, setSave] = useState<'idle' | 'saving' | 'saved'>('idle')

  const set = useCallback(<K extends keyof typeof form>(k: K, v: typeof form[K]) => {
    setForm((p) => ({ ...p, [k]: v }))
  }, [])

  const handleSave = useCallback(async () => {
    setSave('saving')
    updateProspect(prospect.id, form)
    await new Promise<void>((r) => setTimeout(r, 600))
    setSave('saved')
    setTimeout(() => setSave('idle'), 1500)
  }, [form, prospect.id, updateProspect])

  const score = form.lighthouseScore
  const scoreColor = score === undefined ? '#64748b'
    : score < 50 ? '#ef4444' : score < 75 ? '#f59e0b' : '#22c55e'

  return (
    <div className="space-y-5">
      {/* Avatar + name */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/6">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
          style={{ background: 'rgba(197,160,89,0.12)', color: '#c5a059', border: '1px solid rgba(197,160,89,0.2)' }}>
          {getInitials(prospect.companyName)}
        </div>
        <div>
          <div className="font-display text-lg text-[#f0ede8]">{prospect.companyName}</div>
          <div className="text-[12px] text-[rgba(240,237,232,0.4)]">{prospect.contactName}</div>
        </div>
      </div>

      {/* Website + Lighthouse */}
      <div className="grid grid-cols-2 gap-4">
        <LabeledField label="Site web actuel">
          <div className="flex gap-2">
            <input className={inputCls} value={form.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="https://..." />
            {form.website && (
              <a href={form.website} target="_blank" rel="noreferrer" className="flex items-center justify-center w-9 rounded-lg bg-white/5 border border-white/10 text-[rgba(240,237,232,0.4)] hover:text-[#c5a059] transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </LabeledField>
        <LabeledField label="Score Lighthouse">
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-bold font-mono" style={{ color: scoreColor }}>
                {score !== undefined ? `${score}/100` : '—'}
              </span>
              {score !== undefined && score < 50 && (
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Critique</span>
              )}
            </div>
            {score !== undefined && (
              <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${score}%`, background: scoreColor }} />
              </div>
            )}
          </div>
        </LabeledField>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <LabeledField label="Email">
          <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </LabeledField>
        <LabeledField label="Téléphone">
          <input className={inputCls} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </LabeledField>
      </div>

      {/* City + Country */}
      <div className="grid grid-cols-2 gap-4">
        <LabeledField label="Ville">
          <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} />
        </LabeledField>
        <LabeledField label="Pays">
          <select className={inputCls} value={form.country} onChange={(e) => set('country', e.target.value as typeof form.country)}>
            {Object.entries(COUNTRY_CONFIG).map(([code, cfg]) => (
              <option key={code} value={code} style={{ background: '#0f0f20' }}>{cfg.flag} {cfg.label}</option>
            ))}
          </select>
        </LabeledField>
      </div>

      {/* Deal value + Loss */}
      <div className="grid grid-cols-2 gap-4">
        <LabeledField label="Valeur estimée (€)">
          <input className={inputCls} type="number" value={form.estimatedDealValue ?? ''} onChange={(e) => set('estimatedDealValue', e.target.value ? Number(e.target.value) : undefined)} placeholder="5000" />
        </LabeledField>
        <LabeledField label="Manque à gagner (€/mois)">
          <input className={inputCls} type="number" value={form.estimatedLoss ?? ''} onChange={(e) => set('estimatedLoss', e.target.value ? Number(e.target.value) : undefined)} placeholder="3000" />
        </LabeledField>
      </div>

      {/* Brand color */}
      <LabeledField label="Couleur de marque">
        <div className="flex items-center gap-3">
          <input type="color" value={form.brandColor ?? '#c5a059'} onChange={(e) => set('brandColor', e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent" />
          <input className={inputCls} value={form.brandColor ?? ''} onChange={(e) => set('brandColor', e.target.value)} placeholder="#c5a059" />
        </div>
      </LabeledField>

      {/* Save */}
      <button onClick={handleSave} disabled={saveState !== 'idle'}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all disabled:opacity-70"
        style={{
          background: saveState === 'saved' ? 'rgba(22,163,74,0.2)' : 'linear-gradient(135deg, #B8924A, #c5a059)',
          color: saveState === 'saved' ? '#22c55e' : '#1A1200',
        }}>
        {saveState === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
        {saveState === 'saved'  && <Check className="w-4 h-4" />}
        {saveState === 'idle'   && <Save className="w-4 h-4" />}
        {saveState === 'idle' ? 'Sauvegarder' : saveState === 'saving' ? 'Sauvegarde...' : 'Sauvegardé ✓'}
      </button>
    </div>
  )
})
ProfileTab.displayName = 'ProfileTab'

// ─── History Tab ──────────────────────────────────────────────────

const HistoryTab = memo(({ prospect }: { prospect: Prospect }) => {
  const allItems = [
    ...prospect.activities.map((a) => ({ ...a, _type: 'activity' as const })),
    ...prospect.notes.map((n) => ({ id: n.id, timestamp: n.timestamp, type: 'call_made' as const, description: n.content, _type: 'note' as const, outcome: n.outcome, duration: n.duration })),
    ...prospect.emails.map((e) => ({ id: e.id, timestamp: e.sentAt, type: 'email_sent' as const, description: `Email envoyé — ${e.subject}`, _type: 'email' as const, opened: e.opened, clicked: e.clicked })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <Clock className="w-8 h-8 text-[rgba(240,237,232,0.15)] mb-3" />
        <p className="text-[12px] text-[rgba(240,237,232,0.3)]">Aucune activité enregistrée</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {allItems.map((item) => {
        const icon = ACTIVITY_ICONS[item.type] ?? '•'
        return (
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-base shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-[#f0ede8] leading-relaxed">{item.description}</div>
              {'outcome' in item && item.outcome && (
                <div className="text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block"
                  style={{ background: item.outcome === 'interested' ? 'rgba(22,163,74,0.15)' : 'rgba(255,255,255,0.06)', color: item.outcome === 'interested' ? '#22c55e' : 'rgba(240,237,232,0.4)' }}>
                  {item.outcome}
                </div>
              )}
              {'opened' in item && (
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px]" style={{ color: item.opened ? '#22c55e' : 'rgba(240,237,232,0.3)' }}>
                    {item.opened ? '✓ Ouvert' : 'Non ouvert'}
                  </span>
                  <span className="text-[10px]" style={{ color: item.clicked ? '#c5a059' : 'rgba(240,237,232,0.3)' }}>
                    {item.clicked ? '✓ Cliqué' : 'Non cliqué'}
                  </span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-[rgba(240,237,232,0.25)] shrink-0 whitespace-nowrap">
              {formatTimeAgo(item.timestamp)}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
})
HistoryTab.displayName = 'HistoryTab'

// ─── Call Tab — placeholder removed, real component imported above ───

// ─── Prototype Tab ────────────────────────────────────────────────

const PrototypeTab = memo(({ prospect }: { prospect: Prospect }) => {
  const [wizardOpen, setWizardOpen] = useState(false)
  const niche = NICHE_CONFIG[prospect.niche]
  const hasPrototype = !!prospect.customizedPrototypeUrl

  return (
    <div className="space-y-5">
      {/* Status banner */}
      {hasPrototype ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Check className="w-4 h-4 text-green-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-green-400">Prototype personnalisé généré</div>
            <div className="text-[10px] text-[rgba(240,237,232,0.35)] truncate mt-0.5">{prospect.customizedPrototypeUrl}</div>
          </div>
          <a href={prospect.customizedPrototypeUrl} target="_blank" rel="noreferrer"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[rgba(240,237,232,0.4)] hover:text-[#c5a059] transition-colors"
            aria-label="Voir le prototype">
            <Eye className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xl">{niche.icon}</div>
          <div>
            <div className="text-[12px] font-semibold text-[#f0ede8]">Aucun prototype généré</div>
            <div className="text-[11px] text-[rgba(240,237,232,0.35)] mt-0.5">Lancez le wizard pour personnaliser et envoyer</div>
          </div>
        </div>
      )}

      {/* Email history */}
      {prospect.emails.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest">Emails envoyés</div>
          {prospect.emails.map((email) => (
            <div key={email.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Send className="w-3.5 h-3.5 text-[rgba(240,237,232,0.3)] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[#f0ede8] truncate">{email.subject}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px]" style={{ color: email.opened ? '#22c55e' : 'rgba(240,237,232,0.3)' }}>
                    {email.opened ? '✓ Ouvert' : '· Non ouvert'}
                  </span>
                  <span className="text-[10px]" style={{ color: email.clicked ? '#c5a059' : 'rgba(240,237,232,0.3)' }}>
                    {email.clicked ? '✓ Cliqué' : '· Non cliqué'}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-[rgba(240,237,232,0.25)] shrink-0">
                {formatTimeAgo(email.sentAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => setWizardOpen(true)}
        className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)', color: '#1A1200' }}
      >
        <Wand2 className="w-4 h-4" />
        {hasPrototype ? 'Regénérer le prototype' : 'Personnaliser & Envoyer'}
      </button>

      {hasPrototype && (
        <div className="text-center">
          <a href={prospect.customizedPrototypeUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[rgba(197,160,89,0.6)] hover:text-[#c5a059] transition-colors">
            <ExternalLink className="w-3 h-3" />
            Voir le prototype actuel
          </a>
        </div>
      )}

      {/* Wizard */}
      <PrototypeWizard
        prospect={prospect}
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  )
})
PrototypeTab.displayName = 'PrototypeTab'

// ─── Mirror Tab ───────────────────────────────────────────────────

const MirrorTab = memo(({ prospect }: { prospect: Prospect }) => {
  const updateProspect = useStoneStore((s) => s.updateProspect);
  const [copied, setCopied] = useState(false);

  const generateMirrorUrl = () => {
    const url = `${window.location.origin}/mirror/${prospect.id}`;
    updateProspect(prospect.id, { mirrorUrl: url });
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-xl">🔗</div>
        <div>
          <div className="text-[12px] font-semibold text-[#f0ede8]">Lien Mirror (Jumeau Numérique)</div>
          <div className="text-[11px] text-[rgba(240,237,232,0.35)] mt-0.5">La démo émotionnelle avec simulateur de croissance.</div>
        </div>
      </div>

      {prospect.mirrorUrl ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-[rgba(197,160,89,0.3)] bg-[rgba(197,160,89,0.05)]">
            <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-2">URL générée</div>
            <div className="text-[12px] text-white break-all mb-4 bg-black/40 p-2 rounded">{prospect.mirrorUrl}</div>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(prospect.mirrorUrl!); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-[12px] font-bold transition-colors bg-white/10 hover:bg-white/20 text-white">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <ClipboardList className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
              <a href={prospect.mirrorUrl} target="_blank" rel="noreferrer"
                className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-[12px] font-bold transition-colors"
                style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)', color: '#1A1200' }}>
                <Eye className="w-4 h-4" />
                Ouvrir
              </a>
            </div>
          </div>
          {/* Simulation stats here */}
          <div className="text-[10px] text-slate-500 font-medium px-2">
            Astuce : Envoyez ce lien à votre prospect après lui avoir parlé du coût de l'inaction.
          </div>
        </div>
      ) : (
        <button
          onClick={generateMirrorUrl}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)', color: '#1A1200' }}
        >
          <Wand2 className="w-4 h-4" />
          Générer le lien Mirror
        </button>
      )}
    </div>
  );
});
MirrorTab.displayName = 'MirrorTab';

// ─── Vault Tab ────────────────────────────────────────────────────

const VaultTab = memo(({ prospect }: { prospect: Prospect }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-xl">🏦</div>
        <div>
          <div className="text-[12px] font-semibold text-[#f0ede8]">Portail Client (Vault)</div>
          <div className="text-[11px] text-[rgba(240,237,232,0.35)] mt-0.5">Espace sécurisé post-signature.</div>
        </div>
      </div>
      
      <div className="p-6 rounded-3xl border border-[rgba(197,160,89,0.3)] text-center relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(197,160,89,0.1), transparent)' }}>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#c5a059] flex items-center justify-center text-black mb-4 shadow-[0_0_30px_rgba(197,160,89,0.3)]">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-serif text-[#f0ede8] mb-2">Accès au Vault</h3>
        <p className="text-[12px] text-white/50 mb-6 max-w-xs mx-auto">
          Le Vault est le portail sécurisé pour les clients signés. Vous pouvez suivre l'avancement, les livrables et la messagerie projet ici.
        </p>
        <a 
          href={`/vault/${prospect.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)', color: '#1A1200' }}
        >
          Ouvrir le Vault
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
});
VaultTab.displayName = 'VaultTab';

// ─── Main Drawer ──────────────────────────────────────────────────

interface ProspectDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const ProspectDrawer = memo(({ isOpen, onClose }: ProspectDrawerProps) => {
  const selectedProspectId = useStoneStore((s) => s.selectedProspectId)
  const activeDrawerTab    = useStoneStore((s) => s.activeDrawerTab)
  const setDrawerTab       = useStoneStore((s) => s.setDrawerTab)
  const getProspectById    = useStoneStore((s) => s.getProspectById)
  const moveProspectToStage = useStoneStore((s) => s.moveProspectToStage)
  const updatePriority     = useStoneStore((s) => s.updatePriority)
  const getFilteredProspects = useStoneStore((s) => s.getFilteredProspects)

  const prospect = selectedProspectId ? getProspectById(selectedProspectId) : undefined
  const all = getFilteredProspects()
  const idx = prospect ? all.findIndex((p) => p.id === prospect.id) : -1
  const prevId = idx > 0 ? all[idx - 1]?.id : null
  const nextId = idx < all.length - 1 ? all[idx + 1]?.id : null
  const openDrawer = useStoneStore((s) => s.openDrawer)

  const isMobile = useMediaQuery('(max-width: 1024px)')
  
  if (!prospect) return null

  const stageConfig = STAGE_CONFIG[prospect.stage]
  const priorityCfg = PRIORITY_CONFIG[prospect.priority]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />

          {/* Drawer */}
          <motion.div
            className="fixed z-[170] flex flex-col bg-[#0a0a14] border-white/10"
            style={isMobile ? {
              bottom: 0, left: 0, right: 0, height: '90dvh',
              borderRadius: '24px 24px 0 0',
              borderTopWidth: 1,
            } : {
              top: 0, right: 0, bottom: 0, width: 'min(680px, 100vw)',
              borderLeftWidth: 1,
            }}
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (isMobile && info.offset.y > 100) onClose();
            }}
          >
            {isMobile && (
              <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
            )}
            {/* Drawer Header */}
            <div className="shrink-0 px-6 py-4 border-b border-white/6" style={{ background: 'rgba(255,255,255,0.015)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[rgba(240,237,232,0.4)] transition-colors" aria-label="Fermer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => prevId && openDrawer(prevId, activeDrawerTab)}
                      disabled={!prevId} className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-[rgba(240,237,232,0.35)] disabled:opacity-30 transition-colors" aria-label="Prospect précédent">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-[rgba(240,237,232,0.25)]">{idx + 1}/{all.length}</span>
                    <button onClick={() => nextId && openDrawer(nextId, activeDrawerTab)}
                      disabled={!nextId} className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-[rgba(240,237,232,0.35)] disabled:opacity-30 transition-colors" aria-label="Prospect suivant">
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Priority selector */}
                  <div className="flex gap-1">
                    {(['hot', 'warm', 'cold'] as Array<Priority>).map((p) => {
                      const cfg = PRIORITY_CONFIG[p]
                      return (
                        <button key={p} onClick={() => updatePriority(prospect.id, p)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                          style={{
                            background: prospect.priority === p ? cfg.bg : 'rgba(255,255,255,0.04)',
                            color: prospect.priority === p ? cfg.color : 'rgba(240,237,232,0.3)',
                            border: `1px solid ${prospect.priority === p ? cfg.color + '50' : 'rgba(255,255,255,0.07)'}`,
                          }}>
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                  {/* Stage selector */}
                  <select
                    value={prospect.stage}
                    onChange={(e) => moveProspectToStage(prospect.id, e.target.value as DealStage)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg outline-none transition-colors"
                    style={{
                      background: stageConfig.bgColor,
                      color: stageConfig.color,
                      border: `1px solid ${stageConfig.color}40`,
                    }}>
                    {Object.entries(STAGE_CONFIG).map(([s, cfg]) => (
                      <option key={s} value={s} style={{ background: '#0f0f20', color: '#f0ede8' }}>
                        {cfg.icon} {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl text-[#f0ede8] leading-tight">{prospect.companyName}</h2>
                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[rgba(240,237,232,0.4)]">
                  <span>{prospect.contactName}</span>
                  <span>·</span>
                  <span>{NICHE_CONFIG[prospect.niche].icon} {NICHE_CONFIG[prospect.niche].label}</span>
                  <span>·</span>
                  <span>{COUNTRY_CONFIG[prospect.country]?.flag} {prospect.city}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="shrink-0 flex border-b border-white/6 overflow-x-auto scrollbar-hide">
              {TABS.filter(t => t.id !== 'vault' || prospect.stage === 'closed_won').map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setDrawerTab(id)}
                  className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors relative"
                  style={{ color: activeDrawerTab === id ? '#c5a059' : 'rgba(240,237,232,0.35)' }}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {activeDrawerTab === id && (
                    <motion.div layoutId="drawer-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: '#c5a059' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div key={activeDrawerTab}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}>
                  {activeDrawerTab === 'profile'   && <ProfileTab prospect={prospect} />}
                  {activeDrawerTab === 'call'      && <CallTab prospect={prospect} />}
                  {activeDrawerTab === 'prototype' && <PrototypeTab prospect={prospect} />}
                  {activeDrawerTab === 'history'   && <HistoryTab prospect={prospect} />}
                  {activeDrawerTab === 'mirror'    && <MirrorTab prospect={prospect} />}
                  {activeDrawerTab === 'vault'     && prospect.stage === 'closed_won' && <VaultTab prospect={prospect} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

ProspectDrawer.displayName = 'ProspectDrawer'
