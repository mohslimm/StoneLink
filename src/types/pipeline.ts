// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — Types TypeScript Stricts
// Stepping Stones Agency — Mohamed Slimani
// ─────────────────────────────────────────────────────────────────

// ─── Enums & Union Types ──────────────────────────────────────────

export type NicheType =
  | 'dental'
  | 'restaurant'
  | 'travel'
  | 'realestate'
  | 'law'
  | 'clinic'
  | 'salon'
  | 'logistics'
  | 'saas'
  | 'ecommerce'

export type DealStage =
  | 'new'             // Lead importé, pas encore contacté
  | 'to_call'         // À appeler — priorité du jour
  | 'calling'         // En cours d'appel (mode actif)
  | 'called'          // Appelé — en attente de réponse
  | 'interested'      // Intéressé — envoyer le prototype
  | 'prototype_sent'  // Email + prototype envoyé
  | 'follow_up'       // Relance nécessaire
  | 'meeting'         // Rendez-vous booké
  | 'proposal'        // Proposition envoyée
  | 'negotiation'     // En négociation
  | 'closed_won'      // 🏆 Signé
  | 'closed_lost'     // Perdu — raison obligatoire

export type Priority = 'hot' | 'warm' | 'cold'

export type Country = 'FR' | 'CA' | 'BE' | 'CH' | 'MA' | 'DZ' | 'TN'

export type CallOutcome =
  | 'interested'
  | 'not_interested'
  | 'callback'
  | 'no_answer'
  | 'voicemail'

export type ActivityType =
  | 'stage_change'
  | 'note_added'
  | 'email_sent'
  | 'call_made'
  | 'meeting_booked'
  | 'prospect_created'
  | 'prototype_generated'

export type ReminderType =
  | 'follow_up_call'
  | 'prototype_not_opened'
  | 'no_response'
  | 'meeting_tomorrow'

// ─── Event System Types ───────────────────────────────────────────

export interface DomainEvent<T = any> {
  id: string
  type: string
  timestamp: Date
  source: string
  payload: T
  tenantId?: string
}

export type SystemStatus = 'idle' | 'scanning' | 'generating' | 'calling' | 'ready' | 'error';

// ─── Core Interfaces ──────────────────────────────────────────────

export interface CallNote {
  id: string
  timestamp: Date
  content: string
  duration?: number        // Durée en secondes
  outcome: CallOutcome
  aiSummary?: string       // Résumé IA généré post-appel
}

export interface SentEmail {
  id: string
  sentAt: Date
  subject: string
  templateUsed: string
  prototypeUrl?: string
  opened: boolean
  openedAt?: Date
  clicked: boolean
  notifiedOpen?: boolean
}

export interface Activity {
  id: string
  timestamp: Date
  type: ActivityType
  description: string
  metadata?: Record<string, unknown>
}

export interface Prospect {
  id: string                     // ULID généré côté client
  // Identité
  companyName: string
  contactName: string
  email: string
  phone: string
  website?: string
  city: string
  country: Country
  niche: NicheType
  // Pipeline
  stage: DealStage
  priority: Priority
  lighthouseScore?: number       // Score audit (0–100, bas = opportunité)
  estimatedDealValue?: number    // Valeur estimée en €
  estimatedLoss?: number         // Perte mensuelle estimée en €/mois
  // Prototype
  prototypeId?: string
  customizedPrototypeUrl?: string
  mirrorUrl?: string
  logoUrl?: string
  brandColor?: string
  // Historique
  notes: CallNote[]
  emails: SentEmail[]
  activities: Activity[]
  agentHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>
  // AI Analytics
  aiScore?: number               // 0-100 score based on market data
  aiAnalysis?: string            // Detailed analysis summary
  vectorId?: string             // pgvector reference
  // Méta
  createdAt: Date
  lastContactedAt?: Date
  lastReminderAt?: Date
  nextFollowUpAt?: Date
  closedAt?: Date
  lostReason?: string
}

// ─── Prototype System ─────────────────────────────────────────────

export interface Prototype {
  id: string
  niche: NicheType
  name: string
  description: string
  thumbnailUrl: string
  filePath: string
  customizableFields: string[]
  demoUrl: string
  tags: string[]
  recommendedFor: string[]
}

export interface CustomizeRequest {
  prototypeId: string
  prospectId: string
  customizations: {
    companyName: string
    logoUrl?: string
    logoBase64?: string
    primaryColor: string
    phone?: string
    address?: string
    tagline?: string
    email?: string
  }
}

export interface CustomizeResponse {
  previewUrl: string
  generatedAt: Date
}

// ─── Call Script System ───────────────────────────────────────────

export type ScriptPhase =
  | 'opener'
  | 'audit_reveal'
  | 'pitch'
  | 'social_proof'
  | 'transition'
  | 'close'

export interface ScriptStep {
  id: number
  phase: ScriptPhase
  label: string
  script: string         // Variables : {prenom}, {score}, {perte_mensuelle}, {ville}
  tip?: string           // Conseil discret pour le commercial
  durationTarget?: number
}

export interface ObjectionHandler {
  trigger: string        // "prix" | "prestataire" | "pas_maintenant" | etc.
  label: string          // Label affiché sur le bouton
  response: string       // Script de réponse
  pivot: string          // Comment reprendre le fil après l'objection
}

export interface CloseScript {
  id: number
  type: 'soft' | 'assumptive' | 'urgency'
  script: string
}

export interface CallScript {
  niche: NicheType
  prospectName: string
  companyName: string
  lighthouseScore: number
  estimatedLoss: number
  steps: ScriptStep[]
  objections: ObjectionHandler[]
  closes: CloseScript[]
  generatedAt: Date
}

// ─── Email System ─────────────────────────────────────────────────

export interface GeneratedEmail {
  subject: string
  body: string
  previewUrl: string
}

export interface SendEmailRequest {
  prospectId: string
  to: string
  subject: string
  body: string
  prototypeUrl?: string
}

// ─── Reminder System ──────────────────────────────────────────────

export interface Reminder {
  id: string
  prospectId: string
  prospectName: string
  type: ReminderType
  triggerAt: Date
  message: string
  dismissed: boolean
}

// ─── Dashboard Stats ──────────────────────────────────────────────

export interface PipelineStats {
  totalProspects: number
  hotLeads: number
  callsToday: number
  prototypesSent: number
  pipelineValue: number          // CA potentiel total en €
  weightedPipelineValue: number
  closedWonThisMonth: number
  closedWonValueThisMonth: number
  byStage: Record<string, number>
  emailOpenRate: number
  mirrorClickRate: number
}

// ─── CSV Import ───────────────────────────────────────────────────

export interface CsvColumnMapping {
  csvColumn: string
  field: keyof Pick<Prospect, 'companyName' | 'contactName' | 'email' | 'phone' | 'website' | 'city' | 'country' | 'niche'>
}

export interface CsvImportReport {
  imported: number
  duplicates: number
  errors: Array<{ row: number; reason: string }>
}

// ─── UI State Types ───────────────────────────────────────────────

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading'; message?: string }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string; retry?: () => void }
  | { status: 'empty'; cta?: string }

export interface PipelineFilters {
  niche: NicheType | 'all'
  country: Country | 'all'
  priority: Priority | 'all'
  search: string
  stage: DealStage | 'all'
}

export type ViewMode = 'kanban' | 'list' | 'dashboard'
