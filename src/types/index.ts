export interface Prospect {
  id: string;
  name: string;
  company: string;
  url: string;
  phone: string;
  email: string;
  score: number;
  sector: string;
  city?: string;
  campaignId?: string;
  stage: PipelineStage;
  lastContact: string;
  callHistory: CallRecord[];
  notes: string;
  scriptReady: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export type PipelineStage = 'nouveau' | 'contacte' | 'recontacter' | 'prototype' | 'ferme' | 'perdu';

export interface CallRecord {
  id: string;
  date: string;
  duration: string;
  outcome: 'rdv' | 'prototype' | 'rappeler' | 'perdu';
  notes: string;
}

export type CallOutcome = 'rdv' | 'prototype' | 'rappeler' | 'perdu';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ScriptPhase {
  number: number;
  title: string;
  content: string;
  speaker: string;
  keyPoints: string[];
}

export interface ObjectionItem {
  id: string;
  category: string;
  label: string;
  response: string;
  pivot: string;
}

export const STAGE_COLORS: Record<PipelineStage, string> = {
  nouveau: '#60a5fa',
  contacte: '#c5a059',
  recontacter: '#f97316',
  prototype: '#a855f7',
  ferme: '#4ade80',
  perdu: '#f87171',
};

export const STAGE_LABELS: Record<PipelineStage, string> = {
  nouveau: 'Nouveaux',
  contacte: 'Contactés',
  recontacter: 'À recontacter',
  prototype: 'Prototypes envoyés',
  ferme: 'Fermés',
  perdu: 'Perdus',
};

export function mapBackendProspect(doc: any): Prospect {
  const rawStage = doc.stage || doc.PipelineStage || 'nouveau';
  let stage: PipelineStage = 'nouveau';

  if (['nouveau', 'new'].includes(rawStage.toLowerCase())) {
    stage = 'nouveau';
  } else if (['recontacter', 'callback', 'rappeler', 'recontact'].includes(rawStage.toLowerCase())) {
    stage = 'recontacter';
  } else if (['contacte', 'contacted', 'to_call', 'calling', 'called'].includes(rawStage.toLowerCase())) {
    stage = 'contacte';
  } else if (['prototype', 'prototype_sent', 'interested'].includes(rawStage.toLowerCase())) {
    stage = 'prototype';
  } else if (['ferme', 'closed', 'closed_won', 'meeting', 'proposal', 'negotiation'].includes(rawStage.toLowerCase())) {
    stage = 'ferme';
  } else if (['perdu', 'lost', 'closed_lost'].includes(rawStage.toLowerCase())) {
    stage = 'perdu';
  }

  return {
    id: doc._id?.toString() || doc.id || String(Math.random()),
    name: doc.contactName || doc.name || 'Sans contact',
    company: doc.companyName || doc.company || 'Sans entreprise',
    url: doc.website || doc.url || 'Pas de site',
    phone: doc.phone || 'Pas de téléphone',
    email: doc.email || 'Pas d\'email',
    score: typeof doc.score === 'number' ? doc.score : (doc.lighthouseScore || 52),
    sector: doc.niche || doc.sector || 'Général',
    city: doc.city || doc.Wilaya || 'Général',
    stage,
    lastContact: doc.lastContactedAt ? new Date(doc.lastContactedAt).toLocaleDateString('fr-FR') : (doc.lastContact || 'Jamais'),
    callHistory: Array.isArray(doc.callHistory) ? doc.callHistory : [],
    notes: Array.isArray(doc.notes)
      ? doc.notes.map((n: any) => typeof n === 'string' ? n : n.content).join('\n')
      : (typeof doc.notes === 'string' ? doc.notes : ''),
    scriptReady: !!doc.aiAssets?.callScript || !!doc.scriptReady,
    isDeleted: !!doc.isDeleted,
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt).toISOString() : null,
  };
}
