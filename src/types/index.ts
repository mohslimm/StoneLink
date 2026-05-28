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
