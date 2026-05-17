import React from 'react';
import { 
  Database, 
  Cpu, 
  Terminal as TerminalIcon, 
  Target, 
  Lock, 
  Bot, 
  Monitor, 
  Eye, 
  TrendingUp 
} from 'lucide-react';

export const COLORS = {
  void: '#060610',
  primary: '#0a0a14',
  surface: '#0f0f20',
  elevated: '#14142a',
  gold500: '#c5a059',
  gold400: '#e8c77a',
  goldGlow: 'rgba(197,160,89,0.12)',
  textPrimary: '#f0ede8',
  textMuted: 'rgba(240,237,232,0.45)',
  borderSubtle: 'rgba(255,255,255,0.07)',
  borderGold: 'rgba(197,160,89,0.30)',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const NICHES = [
  { id: "dental", label: "Clinique Dentaire", icon: "ti-tooth", pain: "Patients perdus faute de visibilité en ligne" },
  { id: "travel", label: "Agence de Voyages", icon: "ti-plane", pain: "Conversions faibles, pas de réservations en ligne" },
  { id: "restaurant", label: "Restaurant", icon: "ti-tools-kitchen-2", pain: "Pas de commande en ligne, mauvais référencement local" },
  { id: "realestate", label: "Immobilier", icon: "ti-building-estate", pain: "Leads non qualifiés, site obsolète" },
  { id: "law", label: "Cabinet d'Avocats", icon: "ti-scale", pain: "Image peu professionnelle, pas de prise de RDV en ligne" },
  { id: "clinic", label: "Clinique Privée", icon: "ti-stethoscope", pain: "Gestion manuelle des RDV, site non conforme" },
  { id: "salon", label: "Salon de Beauté", icon: "ti-scissors", pain: "Aucun système de réservation, mauvaise présentation" },
  { id: "logistics", label: "Logistique & Transport", icon: "ti-truck", pain: "Processus manuels, pas de portail client" },
];

export const MODULE_DATA = [
  {
    id: 'pipeline',
    category: 'CRM OPÉRATIONNEL',
    title: '0. Pipeline CRM',
    subtitle: 'Kanban & Gestion des Prospects',
    icon: React.createElement(Target, { className: "w-5 h-5" }),
    color: 'from-[#B8924A] to-[#c5a059]',
    description: 'Kanban interactif avec 11 stages, fiche prospect complète, historique, reminders et import CSV en masse.',
    features: ['Kanban 11 Stages', 'Fiche Prospect Complète', 'Import CSV Bulk']
  },
  {
    id: 'market-link',
    category: 'INFRASTRUCTURE',
    title: '1. Market Link',
    subtitle: 'Pipeline de Leads & Scoring',
    icon: React.createElement(Target, { className: "w-5 h-5" }),
    color: 'from-blue-600 to-cyan-500',
    description: 'Acquisition automatisée (n8n/LinkedIn) et audit technique (Lighthouse) pour identifier les failles des prospects.',
    features: ['API /api/market-link', 'Scoring Stratégique', 'Détection de Faiblesses Tech']
  },
  {
    id: 'sales-intel',
    category: 'CORE IA',
    title: '2. Sales Intelligence',
    subtitle: 'Génération d\'Assets Premium',
    icon: React.createElement(Cpu, { className: "w-5 h-5" }),
    color: 'from-amber-400 to-yellow-600',
    description: 'Transformation par Claude 3.5 Sonnet. Création de sites, logos stratégiques et scripts de Cold Call en 6 phases.',
    features: ['Design Adaptation', 'Psychologie des Couleurs', 'Scripts de Vente']
  },
  {
    id: 'terminal',
    category: 'TACTIQUE',
    title: '3. Terminal StoneLink',
    subtitle: 'Live Intelligence Feed',
    icon: React.createElement(TerminalIcon, { className: "w-5 h-5" }),
    color: 'from-slate-700 to-slate-900',
    description: 'Interface de commande en temps réel simulant les opérations de l\'agence et la détection d\'opportunités.',
    features: ['Mode Commande', 'Live Operations Feed', 'Antigravity Network']
  },
  {
    id: 'agent',
    category: 'EXÉCUTION',
    title: '4. Autonomous Agent',
    subtitle: 'Outreach & Closing',
    icon: React.createElement(Bot, { className: "w-5 h-5" }),
    color: 'from-emerald-500 to-teal-600',
    description: 'Agent IA proactif qui engage les prospects, gère les objections et booke les rendez-vous sur le calendrier.',
    features: ['Multi-channel Outreach', 'Objection Handling', 'Prise de RDV Automatisée']
  },
  {
    id: 'mirror',
    category: 'WOW EFFECT',
    title: '5. StoneLink Mirror',
    subtitle: 'Jumeau Numérique / Twin',
    icon: React.createElement(Monitor, { className: "w-5 h-5" }),
    color: 'from-[#f3e5ab] via-[#c5a059] to-[#8e6d2f]',
    description: 'Portail éphémère montrant au prospect son futur business optimisé et son ROI avant même de signer.',
    features: ['Preview Interactive', 'Coût de l\'Inaction', 'Simulation de Croissance']
  },
  {
    id: 'sovereign',
    category: 'DATA',
    title: '6. Sovereign Data',
    subtitle: 'PostgreSQL & RAG',
    icon: React.createElement(Database, { className: "w-5 h-5" }),
    color: 'from-indigo-600 to-purple-600',
    description: 'Infrastructure sécurisée avec recherche sémantique vectorielle pour exploiter l\'expertise de l\'agence.',
    features: ['Base PostgreSQL', 'Support Vectoriel', 'Sémantique Avancée']
  },
  {
    id: 'vault',
    category: 'CLIENT',
    title: '7. The Vault',
    subtitle: 'Portail Client Privé',
    icon: React.createElement(Lock, { className: "w-5 h-5" }),
    color: 'from-rose-600 to-red-600',
    description: 'Espace sécurisé pour les clients signés. Suivi des infrastructures, livrables et rapports de performance.',
    features: ['Espace Souverain', 'Signature de Documents', 'Rapports ROI']
  },
  {
    id: 'shadow',
    category: 'VEILLE',
    title: '8. Shadow Intelligence',
    subtitle: 'Social Listening',
    icon: React.createElement(Eye, { className: "w-5 h-5" }),
    color: 'from-gray-700 to-black',
    description: 'Scan du web social pour détecter les signaux d\'achat et les changements de postes clés.',
    features: ['Signal Detection', 'Alte-Temps Réel', 'Intent Analysis']
  },
  {
    id: 'analytics',
    category: 'BUSINESS',
    title: '9. Analytics BI',
    subtitle: 'Tableau de Bord KPI',
    icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
    color: 'from-fuchsia-600 to-pink-600',
    description: 'Analyse des performances commerciales, taux de conversion et rapports IA hebdomidaires générés par Shadow Intel.',
    features: ['Vue Globale Pipeline', 'Objectifs de CA', 'Rapport IA Hebdo']
  }
];
