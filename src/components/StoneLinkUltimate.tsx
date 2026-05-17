'use client';

import React, { useState, useEffect, useCallback, memo, lazy, Suspense } from 'react';

const PipelineBoard = lazy(() =>
  import('./modules/pipeline/PipelineBoard').then((m) => ({ default: m.PipelineBoard }))
)
import { GlobalToasts } from './modules/pipeline/GlobalToasts'
import { NotificationCenter } from './modules/pipeline/NotificationCenter'
import { SalesIntelModule } from './modules/sales-intelligence';
import { StoneTerminal } from './modules/terminal';
import { VaultModule } from './modules/vault';
import { AgentModule } from './modules/agent';
import { useReminderEngine } from '@/hooks/useReminderEngine';
import { useStoneStore } from '@/stores/useStoneStore';
import { 
  Database, 
  Cpu, 
  Terminal as TerminalIcon, 
  Target, 
  Lock, 
  Bot, 
  Sparkles, 
  Monitor, 
  TrendingDown,
  MousePointer2,
  ChevronRight,
  Zap,
  Shield,
  Layers,
  Network,
  Eye,
  ArrowLeft,
  Copy,
  Check,
  Phone,
  Bolt,
  Star,
  HelpCircle,
  MapPin,
  Layout,
  TrendingUp,
  Bell
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- DATA ---
const NICHES = [
  { id: "dental", label: "Clinique Dentaire", icon: "ti-tooth", pain: "Patients perdus faute de visibilité en ligne" },
  { id: "travel", label: "Agence de Voyages", icon: "ti-plane", pain: "Conversions faibles, pas de réservations en ligne" },
  { id: "restaurant", label: "Restaurant", icon: "ti-tools-kitchen-2", pain: "Pas de commande en ligne, mauvais référencement local" },
  { id: "realestate", label: "Immobilier", icon: "ti-building-estate", pain: "Leads non qualifiés, site obsolète" },
  { id: "law", label: "Cabinet d'Avocats", icon: "ti-scale", pain: "Image peu professionnelle, pas de prise de RDV en ligne" },
  { id: "clinic", label: "Clinique Privée", icon: "ti-stethoscope", pain: "Gestion manuelle des RDV, site non conforme" },
  { id: "salon", label: "Salon de Beauté", icon: "ti-scissors", pain: "Aucun système de réservation, mauvaise présentation" },
  { id: "logistics", label: "Logistique & Transport", icon: "ti-truck", pain: "Processus manuels, pas de portail client" },
];

const MODULE_DATA = [
  {
    id: 'pipeline',
    category: 'CRM OPÉRATIONNEL',
    title: '0. Pipeline CRM',
    subtitle: 'Kanban & Gestion des Prospects',
    icon: <Target className="w-5 h-5" />,
    color: 'from-[#B8924A] to-[#c5a059]',
    description: 'Kanban interactif avec 11 stages, fiche prospect complète, historique, reminders et import CSV en masse.',
    features: ['Kanban 11 Stages', 'Fiche Prospect Complète', 'Import CSV Bulk']
  },
  {
    id: 'market-link',
    category: 'INFRASTRUCTURE',
    title: '1. Market Link',
    subtitle: 'Pipeline de Leads & Scoring',
    icon: <Target className="w-5 h-5" />,
    color: 'from-blue-600 to-cyan-500',
    description: 'Acquisition automatisée (n8n/LinkedIn) et audit technique (Lighthouse) pour identifier les failles des prospects.',
    features: ['API /api/market-link', 'Scoring Stratégique', 'Détection de Faiblesses Tech']
  },
  {
    id: 'sales-intel',
    category: 'CORE IA',
    title: '2. Sales Intelligence',
    subtitle: 'Génération d\'Assets Premium',
    icon: <Cpu className="w-5 h-5" />,
    color: 'from-amber-400 to-yellow-600',
    description: 'Transformation par Claude 3.5 Sonnet. Création de sites, logos stratégiques et scripts de Cold Call en 6 phases.',
    features: ['Design Adaptation', 'Psychologie des Couleurs', 'Scripts de Vente']
  },
  {
    id: 'terminal',
    category: 'TACTIQUE',
    title: '3. Terminal StoneLink',
    subtitle: 'Live Intelligence Feed',
    icon: <TerminalIcon className="w-5 h-5" />,
    color: 'from-slate-700 to-slate-900',
    description: 'Interface de commande en temps réel simulant les opérations de l\'agence et la détection d\'opportunités.',
    features: ['Mode Commande', 'Live Operations Feed', 'Antigravity Network']
  },
  {
    id: 'agent',
    category: 'EXÉCUTION',
    title: '4. Autonomous Agent',
    subtitle: 'Outreach & Closing',
    icon: <Bot className="w-5 h-5" />,
    color: 'from-emerald-500 to-teal-600',
    description: 'Agent IA proactif qui engage les prospects, gère les objections et booke les rendez-vous sur le calendrier.',
    features: ['Multi-channel Outreach', 'Objection Handling', 'Prise de RDV Automatisée']
  },
  {
    id: 'mirror',
    category: 'WOW EFFECT',
    title: '5. StoneLink Mirror',
    subtitle: 'Jumeau Numérique / Twin',
    icon: <Monitor className="w-5 h-5" />,
    color: 'from-[#f3e5ab] via-[#c5a059] to-[#8e6d2f]',
    description: 'Portail éphémère montrant au prospect son futur business optimisé et son ROI avant même de signer.',
    features: ['Preview Interactive', 'Coût de l\'Inaction', 'Simulation de Croissance']
  },
  {
    id: 'sovereign',
    category: 'DATA',
    title: '6. Sovereign Data',
    subtitle: 'PostgreSQL & RAG',
    icon: <Database className="w-5 h-5" />,
    color: 'from-indigo-600 to-purple-600',
    description: 'Infrastructure sécurisée avec recherche sémantique vectorielle pour exploiter l\'expertise de l\'agence.',
    features: ['Base PostgreSQL', 'Support Vectoriel', 'Sémantique Avancée']
  },
  {
    id: 'vault',
    category: 'CLIENT',
    title: '7. The Vault',
    subtitle: 'Portail Client Privé',
    icon: <Lock className="w-5 h-5" />,
    color: 'from-rose-600 to-red-600',
    description: 'Espace sécurisé pour les clients signés. Suivi des infrastructures, livrables et rapports de performance.',
    features: ['Espace Souverain', 'Signature de Documents', 'Rapports ROI']
  },
  {
    id: 'shadow',
    category: 'VEILLE',
    title: '8. Shadow Intelligence',
    subtitle: 'Social Listening',
    icon: <Eye className="w-5 h-5" />,
    color: 'from-gray-700 to-black',
    description: 'Scan du web social pour détecter les signaux d\'achat et les changements de postes clés.',
    features: ['Signal Detection', 'Alte-Temps Réel', 'Intent Analysis']
  },
  {
    id: 'analytics',
    category: 'BUSINESS',
    title: '9. Analytics BI',
    subtitle: 'Tableau de Bord KPI',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-fuchsia-600 to-pink-600',
    description: 'Analyse des performances commerciales, taux de conversion et rapports IA hebdomadaires générés par Shadow Intel.',
    features: ['Vue Globale Pipeline', 'Objectifs de CA', 'Rapport IA Hebdo']
  }
];

// --- COMPONENTS ---

const ColorSwatch = ({ hex, label }: { hex: string, label: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-md border border-white/10 shadow-sm" style={{ backgroundColor: hex }} />
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-xs font-mono text-slate-300">{hex}</div>
    </div>
  </div>
);

// --- MAIN APP ---

// --- NEW MODULE IMPORTS ---
import { MarketLinkModule } from './modules/market-link';
import { MirrorModule } from './modules/mirror';
import { SovereignModule } from './modules/sovereign';
import { ShadowModule } from './modules/shadow';
import { AnalyticsModule } from './modules/analytics';

export default function StoneLinkUltimate() {
  const { 
    activeModule: activeModuleId, 
    setActiveModule: setActiveModuleId,
    activeProspect,
    addTerminalEvent,
    openDrawer,
    fetchProspects,
    fetchTerminalEvents
  } = useStoneStore();

  useReminderEngine();

  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'module' | 'pipeline'>('dashboard');

  // Documentation State
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    fetchProspects();
    fetchTerminalEvents();
    setIsLoaded(true);
  }, [fetchProspects, fetchTerminalEvents]);

  const openModule = useCallback((id: string) => {
    setActiveModuleId(id as any);
    if (id === 'pipeline') {
      setViewMode('pipeline');
    } else {
      setViewMode('module');
    }
  }, [setActiveModuleId]);

  const closeModule = useCallback(() => {
    setViewMode('dashboard');
    setActiveModuleId(null);
  }, [setActiveModuleId]);

  const handleAction = useCallback((id: string, tab: any) => {
    setViewMode('pipeline');
    setActiveModuleId('pipeline');
    openDrawer(id, tab);
    addTerminalEvent({ 
      message: `Navigation vers le prospect ID: ${id} (Onglet: ${tab})`, 
      type: 'info',
      module: 'dashboard'
    });
  }, [setActiveModuleId, openDrawer, addTerminalEvent]);

  // --- RENDERING HELPERS ---

  const renderModuleView = () => {
    const module = MODULE_DATA.find(m => m.id === activeModuleId);
    if (!module) return null;

    let moduleContent;
    switch (activeModuleId) {
      case 'pipeline':
        moduleContent = (
          <Suspense fallback={<div className="flex items-center justify-center h-[60vh] text-white/40 italic">Initialisation du Pipeline...</div>}>
            <PipelineBoard />
          </Suspense>
        );
        break;
      case 'market-link':
        moduleContent = <MarketLinkModule />;
        break;
      case 'sales-intel':
        moduleContent = <SalesIntelModule />;
        break;
      case 'terminal':
        moduleContent = <div className="h-[75vh] overflow-hidden rounded-3xl border border-white/10"><StoneTerminal /></div>;
        break;
      case 'agent':
        moduleContent = <AgentModule />;
        break;
      case 'mirror':
        moduleContent = <MirrorModule />;
        break;
      case 'sovereign':
        moduleContent = <SovereignModule />;
        break;
      case 'vault':
        moduleContent = <VaultModule />;
        break;
      case 'shadow':
        moduleContent = <ShadowModule />;
        break;
      case 'analytics':
        moduleContent = <AnalyticsModule />;
        break;
      default:
        moduleContent = (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Zap className="w-6 h-6 text-[#c5a059]" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-4 italic">Module en cours d'optimisation</h3>
            <p className="text-slate-400 max-w-md font-light leading-relaxed">
              Le module <span className="text-[#c5a059] font-medium">{module.title}</span> est actuellement en phase de synchronisation.
            </p>
          </div>
        );
    }

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
        <div className="mb-10 flex items-center justify-between">
          <button 
            onClick={closeModule}
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </button>

          <div className="flex items-center gap-4">
            {activeProspect && (
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20">
                <Target size={14} className="text-[#c5a059]" />
                <span className="text-xs font-bold text-[#c5a059] uppercase tracking-widest">{activeProspect.companyName}</span>
              </div>
            )}
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{module.category}</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {moduleContent}
        </div>
      </div>
    );
  };

  // ── Pipeline fullscreen render (outside container) ────────────────
  if (viewMode === 'pipeline') {
    return (
      <div className="fixed inset-0 z-50" style={{ background: '#060610' }}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin" />
              <p className="text-[12px] text-[rgba(240,237,232,0.4)] uppercase tracking-widest">Chargement du Pipeline...</p>
            </div>
          </div>
        }>
          {/* Back button overlay */}
          <div className="absolute top-4 left-4 z-60">
            <button
              onClick={closeModule}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,237,232,0.5)' }}
              aria-label="Retour au dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </button>
          </div>
          <PipelineBoard />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#EDE9E3] font-sans selection:bg-[#C9A96E] selection:text-black relative overflow-x-hidden">
      {/* Premium Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="bg-blob absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-[#C9A96E]/5 blur-[180px] rounded-full" />
        <div className="bg-blob absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-blue-900/5 blur-[180px] rounded-full" />
      </div>

      <div className={cn(
        "relative z-10 container mx-auto px-6 py-12 transition-all duration-1000",
        isLoaded ? 'opacity-100' : 'opacity-0'
      )}>
        
        {/* Navigation / Meta */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setViewMode('dashboard')}>
            <div className="w-10 h-10 bg-[#C9A96E] rounded-lg flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(201,169,110,0.3)] group-hover:scale-110 transition-transform">SL</div>
            <div className="flex flex-col">
              <span className="text-white font-serif italic text-2xl tracking-tighter leading-none">StoneLink</span>
              <span className="text-[#C9A96E] font-sans font-black text-[9px] uppercase tracking-[0.4em]">Ultimate Ecosystem</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <span className="flex items-center gap-2 text-[#C9A96E]"><Zap className="w-3 h-3 animate-pulse" /> System Active</span>
            <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <Network className="w-3 h-3" /> Antigravity Node 01
            </span>
            <button 
              onClick={() => setIsNotificationOpen(true)}
              className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-300 transition-colors relative"
            >
              <Bell className="w-3 h-3" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-black animate-bounce" />
            </button>
          </div>
        </div>

        {viewMode === 'dashboard' ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Live Intelligence Bar */}
            <div className="mb-12 p-1 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center gap-6 overflow-hidden whitespace-nowrap">
               <div className="bg-[#c5a059] text-black px-4 py-2 font-black text-[10px] uppercase tracking-widest">LIVE FEED</div>
               <div className="flex gap-12 animate-marquee py-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Target size={12} className="text-[#c5a059]" /> 12 Nouveaux Prospects détectés ce matin
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} className="text-emerald-400" /> IA: 3 Réponses autonomes envoyées
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={12} className="text-blue-400" /> 8 Audits Lighthouse terminés
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Target size={12} className="text-[#c5a059]" /> 12 Nouveaux Prospects détectés ce matin
                  </span>
               </div>
            </div>

            {/* Hero Section */}
            <header className="mb-12">
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 max-w-4xl leading-[1.1]">
                L'Écosystème de Croissance <span className="text-[#C9A96E] italic underline decoration-1 underline-offset-[12px]">Souverain</span> pour Agences.
              </h1>
              <p className="text-[#EDE9E3]/45 max-w-2xl text-xl font-light leading-relaxed mb-8">
                De la détection de signaux faibles à l'expérience client immersive, StoneLink automatise chaque étape du cycle de vente premium.
              </p>
              <div className="flex gap-4">
                 <button 
                  onClick={() => openModule('sales-intel')}
                  className="px-8 py-4 bg-[#C9A96E] text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(197,160,89,0.2)]"
                 >
                   Lancer une Campagne
                 </button>
                 <button 
                  onClick={() => setIsDocOpen(true)}
                  className="px-8 py-4 bg-white/5 text-slate-300 border border-white/10 font-bold text-[10px] uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors"
                 >
                   Documentation Tech
                 </button>
              </div>
            </header>

            {/* Modules Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MODULE_DATA.map((module) => (
                <div 
                  key={module.id}
                  onClick={() => openModule(module.id)}
                  className={cn(
                    "group relative p-8 rounded-[2.5rem] border transition-all duration-300 cursor-pointer overflow-hidden",
                    "bg-white/[0.035] border-white/10 hover:border-[#C9A96E]/50 hover:bg-white/[0.05] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                  )}
                >
                  {/* Hover Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#C9A96E]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-3 rounded-xl bg-gradient-to-br shadow-lg text-white group-hover:scale-110 transition-transform", module.color)}>
                      {module.icon}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 group-hover:text-[#C9A96E] uppercase tracking-[0.2em] transition-colors">{module.category}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#C9A96E] transition-colors mb-1">{module.title}</h3>
                  <p className="text-[#C9A96E] text-[9px] font-bold uppercase tracking-widest mb-4 opacity-60">{module.subtitle}</p>
                  
                  <p className="text-slate-500 text-xs leading-relaxed font-light group-hover:text-slate-300 transition-colors">
                    {module.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <ul className="space-y-2">
                      {module.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-[10px] text-slate-500">
                          <ChevronRight className="w-3 h-3 text-[#C9A96E]" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Section */}
            <div className="mt-12 p-12 rounded-[3.5rem] border border-[#C9A96E]/10 bg-gradient-to-r from-white/[0.035] to-transparent flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A96E]/20 to-transparent" />
               <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.035] border border-white/10 flex items-center justify-center group-hover:border-[#c5a059]/30 transition-colors">
                  <Layers className="text-[#C9A96E] w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-white font-bold italic font-serif text-2xl mb-1">Architecture Unifiée Antigravity</h4>
                  <p className="text-[#EDE9E3]/45 text-sm font-light">Tous les modules sont synchronisés via le Terminal StoneLink et la couche RAG.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="px-12 py-5 bg-[#C9A96E] text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:shadow-[0_0_50px_rgba(197,160,89,0.3)] hover:scale-105 transition-all">
                  Déploiement Global V4
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {renderModuleView()}
          </div>
        )}

      </div>

      {/* Documentation Modal */}
      {isDocOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060610]/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0f0f20] border border-white/10 rounded-[3rem] w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-[#0f0f20]/80 backdrop-blur-md p-8 border-b border-white/10 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C9A96E] rounded-xl flex items-center justify-center text-black font-bold">SL</div>
                <div>
                   <h2 className="text-xl font-bold text-white">Documentation Architecture</h2>
                   <p className="text-[10px] text-[#C9A96E] uppercase tracking-widest font-bold">Antigravity V4.0</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDocOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-10 text-slate-300 space-y-10 font-light leading-relaxed">
                <section>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-[#C9A96E]" /> Pipeline & Data Sovereignty</h3>
                  <p>Le système utilise <strong>Zustand</strong> pour la persistance locale. Le module <strong>Sovereign Data</strong> simule une recherche vectorielle sur PostgreSQL/PGVector pour interroger la base de connaissances agence et les archives prospects.</p>
                </section>
                <section>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-[#C9A96E]" /> Sales Intelligence (Resilience)</h3>
                  <p>Orchestré par <strong>Claude 3.7 Sonnet</strong>. Un moteur de résilience (Graceful Fallback) est intégré pour maintenir la fonctionnalité de démonstration même en cas d'indisponibilité des services Anthropic.</p>
                </section>
                <section>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-[#C9A96E]" /> Market Link Audit</h3>
                  <p>L'audit technique utilise une approche déterministe basée sur le hashing d'URL pour garantir la stabilité des scores. Il analyse les performances Lighthouse, la sécurité SSL et l'infrastructure DNS/WAF.</p>
                </section>
                <section>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Eye className="w-5 h-5 text-[#C9A96E]" /> Shadow Intelligence</h3>
                  <p>Algorithme de "Social Listening" qui scanne les réseaux pour détecter des intentions d'achat, des levées de fonds ou des changements de direction chez les prospects cibles.</p>
                </section>
            </div>
            
            <div className="p-8 bg-white/5 border-t border-white/10 text-center">
              <button 
                onClick={() => setIsDocOpen(false)}
                className="px-10 py-4 bg-[#C9A96E] text-black font-bold text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
              >
                Fermer la Documentation
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications & Toasts */}
      <GlobalToasts onAction={handleAction} />
      <NotificationCenter isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} onAction={handleAction} />
      
      {/* Custom Styles for Marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
