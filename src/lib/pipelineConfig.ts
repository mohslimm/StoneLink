import type { DealStage, NicheType, Priority } from '@/types/pipeline'

// ─── Stage Configuration ──────────────────────────────────────────

export const STAGE_CONFIG: Record<DealStage, {
  label: string
  color: string
  bgColor: string
  icon: string
  limit?: number
}> = {
  new:            { label: 'Nouveaux',      color: '#64748b', bgColor: 'rgba(100,116,139,0.12)', icon: '📥' },
  to_call:        { label: 'À Appeler',     color: '#7c3aed', bgColor: 'rgba(124,58,237,0.12)',  icon: '📞', limit: 10 },
  calling:        { label: 'En Appel',      color: '#dc2626', bgColor: 'rgba(220,38,38,0.12)',   icon: '🔴' },
  called:         { label: 'Appelés',       color: '#2563eb', bgColor: 'rgba(37,99,235,0.12)',   icon: '☎️' },
  interested:     { label: 'Intéressés',    color: '#d97706', bgColor: 'rgba(217,119,6,0.12)',   icon: '⚡' },
  prototype_sent: { label: 'Proto Envoyé',  color: '#0891b2', bgColor: 'rgba(8,145,178,0.12)',   icon: '🎯' },
  follow_up:      { label: 'Relance',       color: '#dc2626', bgColor: 'rgba(220,38,38,0.12)',   icon: '🔁' },
  meeting:        { label: 'RDV Booké',     color: '#059669', bgColor: 'rgba(5,150,105,0.12)',   icon: '📅' },
  proposal:       { label: 'Proposition',   color: '#c5a059', bgColor: 'rgba(197,160,89,0.12)',  icon: '📄' },
  negotiation:    { label: 'Négociation',   color: '#ea580c', bgColor: 'rgba(234,88,12,0.12)',   icon: '🤝' },
  closed_won:     { label: 'Signés',        color: '#16a34a', bgColor: 'rgba(22,163,74,0.12)',   icon: '🏆' },
  closed_lost:    { label: 'Perdus',        color: '#374151', bgColor: 'rgba(55,65,81,0.12)',    icon: '💀' },
}

export const KANBAN_STAGES: DealStage[] = [
  'new', 'to_call', 'called', 'interested',
  'prototype_sent', 'follow_up', 'meeting',
  'proposal', 'closed_won', 'closed_lost',
]

// ─── Niche Configuration ──────────────────────────────────────────

export const NICHE_CONFIG: Record<NicheType, { label: string; icon: string }> = {
  dental:     { label: 'Dental',      icon: '🦷' },
  restaurant: { label: 'Restaurant',  icon: '🍽️' },
  travel:     { label: 'Voyages',     icon: '✈️' },
  realestate: { label: 'Immobilier',  icon: '🏠' },
  law:        { label: 'Avocats',     icon: '⚖️' },
  clinic:     { label: 'Clinique',    icon: '🏥' },
  salon:      { label: 'Beauté',      icon: '💅' },
  logistics:  { label: 'Logistique',  icon: '🚚' },
  saas:       { label: 'SaaS',        icon: '💻' },
  ecommerce:  { label: 'E-commerce',  icon: '🛍️' },
}

// ─── Country Configuration ────────────────────────────────────────

export const COUNTRY_CONFIG: Record<string, { label: string; flag: string }> = {
  FR: { label: 'France',   flag: '🇫🇷' },
  CA: { label: 'Canada',   flag: '🇨🇦' },
  BE: { label: 'Belgique', flag: '🇧🇪' },
  CH: { label: 'Suisse',   flag: '🇨🇭' },
  MA: { label: 'Maroc',    flag: '🇲🇦' },
  DZ: { label: 'Algérie',  flag: '🇩🇿' },
  TN: { label: 'Tunisie',  flag: '🇹🇳' },
}

// ─── Priority Configuration ───────────────────────────────────────

export const PRIORITY_CONFIG: Record<Priority, {
  label: string
  color: string
  bg: string
  pulse: boolean
}> = {
  hot:  { label: '🔥 Hot',   color: '#ef4444', bg: 'rgba(239,68,68,0.15)',    pulse: true  },
  warm: { label: '🟡 Warm',  color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',   pulse: false },
  cold: { label: '❄️ Cold',  color: '#64748b', bg: 'rgba(100,116,139,0.15)', pulse: false },
}

// ─── Activity Icons ───────────────────────────────────────────────

export const ACTIVITY_ICONS: Record<string, string> = {
  prospect_created:   '📥',
  call_made:          '📞',
  note_added:         '📝',
  email_sent:         '📧',
  meeting_booked:     '📅',
  stage_change:       '↗️',
  prototype_generated:'🎨',
}

// ─── Utility Helpers ──────────────────────────────────────────────

export function formatTimeAgo(date: Date | string): string {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  <  1) return 'À l\'instant'
  if (mins  < 60) return `Il y a ${mins}min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days  <  7) return `Il y a ${days}j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(amount)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

export function lighthouseColor(score: number): string {
  if (score < 50) return '#ef4444'
  if (score < 75) return '#f59e0b'
  return '#22c55e'
}
