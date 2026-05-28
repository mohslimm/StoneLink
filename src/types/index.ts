export interface Prospect {
  id: string;
  name: string;
  company: string;
  url: string;
  phone: string;
  email: string;
  score: number;
  sector: string;
  stage: PipelineStage;
  lastContact: string;
  callHistory: CallRecord[];
  notes: string;
  scriptReady: boolean;
}

export type PipelineStage = 'nouveau' | 'contacte' | 'prototype' | 'ferme' | 'perdu';

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
  prototype: '#4ade80',
  ferme: '#4ade80',
  perdu: '#f87171',
};

export const STAGE_LABELS: Record<PipelineStage, string> = {
  nouveau: 'Nouveaux',
  contacte: 'Contactes',
  prototype: 'Prototypes envoyes',
  ferme: 'Fermes',
  perdu: 'Perdus',
};

export function mapBackendProspect(doc: any): Prospect {
  return {
    id: doc._id?.toString() || Math.random().toString(),
    name: doc.contactName || 'Sans contact',
    company: doc.companyName || 'Sans entreprise',
    url: doc.website || 'Pas de site',
    phone: doc.phone || 'Pas de téléphone',
    email: doc.email || 'Pas d\'email',
    score: Math.floor(Math.random() * (95 - 40) + 40), // We simulate a lighthouse score if not present
    sector: doc.niche || 'Général',
    stage: (doc.stage === 'new' ? 'nouveau' : doc.stage === 'contacted' ? 'contacte' : doc.stage === 'closed' ? 'ferme' : 'nouveau') as PipelineStage,
    lastContact: doc.lastContactedAt ? new Date(doc.lastContactedAt).toLocaleDateString() : 'Jamais',
    callHistory: [],
    notes: Array.isArray(doc.notes) ? doc.notes.map((n: any) => n.content).join('\n') : '',
    scriptReady: !!doc.aiAssets?.callScript,
  };
}
