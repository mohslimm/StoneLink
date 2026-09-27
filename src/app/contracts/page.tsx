"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, ShieldCheck, Printer, Download, CheckCircle, 
  DollarSign, Globe, Clock, ChevronRight, ChevronLeft, ArrowRight,
  User, Building2, Sparkles, Layers, FileCheck, Copy, Check,
  ExternalLink, Eye, Trash2, Send, MessageSquare, AlertCircle,
  HelpCircle, RefreshCw, X, FileCode, Search, ChevronDown,
  Briefcase, Phone, MapPin, Star, Calendar, Sliders
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { useUIStore } from '@/hooks/useUIStore';
import { mockProspects } from '@/data/prospects';
import pricingConfig from '@/config/pricing-config.json';
import { 
  detectMarketZone, calculatePrice, getCompetitorRange, 
  getProfitabilityEstimate, detectLanguages 
} from '@/services/pricing/PricingEngine';
import { generateContractHTML } from '@/services/contracts/ContractGenerator';

function hasValidWebsite(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean !== '' &&
         clean !== 'pas de site web' &&
         clean !== 'non renseigné' &&
         clean !== 'aucun' &&
         clean.length > 3;
}

function extractArea(p: any): string {
  if (p.notes && p.notes.includes('Zone:')) {
    const match = p.notes.match(/Zone:\s*([^|]+)/);
    if (match) return match[1].trim();
  }
  if (p.city) return p.city.trim();
  return 'Général';
}

/* ─── Luxury Custom Input Component ─── */
function LuxuryInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  rightElement,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center gap-1.5 text-[11px] font-body text-[rgba(232,228,220,0.65)] uppercase tracking-[0.08em]">
        {icon && <span className="text-[#c5a059]">{icon}</span>}
        <span>{label}</span>
      </label>
      <div className="relative flex items-center bg-[#0a0a14] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.3)] focus-within:border-[#c5a059] focus-within:ring-2 focus-within:ring-[rgba(197,160,89,0.15)] focus-within:shadow-[0_0_20px_rgba(197,160,89,0.1)] focus-within:bg-[#0f0f1c] rounded-[12px] h-11 px-3.5 transition-all duration-200">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13.5px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] focus:outline-none"
        />
        {rightElement && (
          <div className="flex-shrink-0 ml-2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Quiet Luxury Prospect Selector Dropdown ─── */
function ProspectSelectorDropdown({
  prospects,
  selectedId,
  onSelect,
}: {
  prospects: typeof mockProspects;
  selectedId: string;
  onSelect: (p: typeof mockProspects[0] | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'noweb' | 'web'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedProspect = useMemo(() => {
    return prospects.find(p => p.id === selectedId) || null;
  }, [prospects, selectedId]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filtered = useMemo(() => {
    return prospects.filter(p => {
      const hasWeb = hasValidWebsite(p.url);
      if (filterType === 'noweb' && hasWeb) return false;
      if (filterType === 'web' && !hasWeb) return false;

      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        p.company.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.sector && p.sector.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    });
  }, [prospects, search, filterType]);

  const noWebCount = useMemo(() => prospects.filter(p => !hasValidWebsite(p.url)).length, [prospects]);
  const webCount = prospects.length - noWebCount;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[11px] font-body text-[rgba(232,228,220,0.65)] uppercase tracking-[0.08em] mb-1.5">
        Sélectionner un prospect scrappé
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 rounded-[12px] bg-[#0a0a14] border text-left flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer shadow-lg ${
          isOpen
            ? 'border-[#c5a059] ring-2 ring-[rgba(197,160,89,0.18)] shadow-[0_0_25px_rgba(197,160,89,0.12)] bg-[#0f0f1c]'
            : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.35)]'
        }`}
      >
        <div className="min-w-0 flex-1">
          {selectedProspect ? (
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-body font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059] border border-[rgba(197,160,89,0.25)]">
                  {selectedProspect.sector || 'Secteur'}
                </span>
                <span className="text-[10px] font-body text-[rgba(232,228,220,0.55)] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                  📍 {extractArea(selectedProspect)}
                </span>
                {hasValidWebsite(selectedProspect.url) ? (
                  <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full bg-[rgba(74,222,128,0.12)] text-[#4ade80] border border-[rgba(74,222,128,0.25)]">
                    Score {selectedProspect.score}/100
                  </span>
                ) : (
                  <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.25)]">
                    🚫 Sans site web
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-medium text-[16px] text-[#e8e4dc] truncate">
                  {selectedProspect.company}
                </h3>
                <span className="text-[12px] font-body text-[rgba(232,228,220,0.5)]">
                  &bull; {selectedProspect.name || 'Dirigeant'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 py-1">
              <div className="w-7 h-7 rounded-full bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.25)] flex items-center justify-center text-[#c5a059]">
                <Plus size={14} />
              </div>
              <div>
                <span className="text-[13.5px] font-body text-[#e8e4dc]">
                  Saisie manuelle d&apos;un nouveau client libre...
                </span>
                <span className="text-[11px] font-body text-[rgba(232,228,220,0.4)] block">
                  Cliquez pour sélectionner parmi les leads scrappés ou saisir manuellement
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 text-[rgba(232,228,220,0.5)]">
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#c5a059]' : ''}`}
          />
        </div>
      </button>

      {/* Floating Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-[16px] bg-[#0c0c16]/98 border border-[rgba(197,160,89,0.35)] shadow-[0_16px_50px_rgba(0,0,0,0.85)] backdrop-blur-[24px] overflow-hidden"
          >
            {/* Search Header */}
            <div className="p-3 border-b border-[rgba(255,255,255,0.06)] bg-[#0f0f1c]/70 space-y-2.5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Filtrer par entreprise, dirigeant, ville ou secteur..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 rounded-[9px] bg-[#141424] border border-[rgba(255,255,255,0.08)] pl-9 pr-8 text-[12.5px] text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)] focus:outline-none focus:border-[#c5a059]"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] hover:text-[#e8e4dc]"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Sub-Filter Tabs */}
              <div className="flex items-center gap-1.5 text-[11px] font-body">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-[7px] transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-[rgba(197,160,89,0.2)] text-[#c5a059] font-medium border border-[rgba(197,160,89,0.3)]'
                      : 'text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]'
                  }`}
                >
                  Tous ({prospects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('noweb')}
                  className={`px-2.5 py-1 rounded-[7px] transition-all cursor-pointer ${
                    filterType === 'noweb'
                      ? 'bg-[rgba(239,68,68,0.2)] text-[#f87171] font-medium border border-[rgba(239,68,68,0.3)]'
                      : 'text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]'
                  }`}
                >
                  🚫 Sans site ({noWebCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('web')}
                  className={`px-2.5 py-1 rounded-[7px] transition-all cursor-pointer ${
                    filterType === 'web'
                      ? 'bg-[rgba(74,222,128,0.2)] text-[#4ade80] font-medium border border-[rgba(74,222,128,0.3)]'
                      : 'text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]'
                  }`}
                >
                  🌐 Avec site ({webCount})
                </button>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="max-h-[300px] overflow-y-auto divide-y divide-[rgba(255,255,255,0.04)]">
              {/* Option 0: Saisie manuelle */}
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className={`w-full p-3 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  !selectedId ? 'bg-[rgba(197,160,89,0.12)]' : 'hover:bg-[rgba(255,255,255,0.03)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[rgba(232,228,220,0.6)]">
                    <Plus size={12} />
                  </div>
                  <div>
                    <span className="text-[13px] font-body text-[#e8e4dc] font-medium block">
                      Saisie manuelle d&apos;un nouveau client libre
                    </span>
                    <span className="text-[11px] font-body text-[rgba(232,228,220,0.4)]">
                      Réinitialiser le formulaire pour taper vos données
                    </span>
                  </div>
                </div>
                {!selectedId && <Check size={14} className="text-[#c5a059]" />}
              </button>

              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const isSelected = p.id === selectedId;
                  const hasWeb = hasValidWebsite(p.url);
                  const scoreColor = p.score >= 70 ? '#4ade80' : p.score >= 40 ? '#60a5fa' : '#f87171';

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelect(p);
                        setIsOpen(false);
                      }}
                      className={`w-full p-3 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                        isSelected 
                          ? 'bg-[rgba(197,160,89,0.12)] border-l-2 border-[#c5a059]' 
                          : 'hover:bg-[rgba(197,160,89,0.06)]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[9.5px] font-body font-semibold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.12)] text-[#c5a059]">
                            {p.sector || 'Secteur'}
                          </span>
                          <span className="text-[10px] font-body text-[rgba(232,228,220,0.45)]">
                            📍 {extractArea(p)}
                          </span>
                        </div>
                        <div className="font-display font-medium text-[14px] text-[#e8e4dc] group-hover:text-[#c5a059] transition-colors truncate">
                          {p.company}
                        </div>
                        <div className="text-[11.5px] font-body text-[rgba(232,228,220,0.5)] truncate">
                          {p.name || 'Dirigeant'} &bull; {p.phone || 'Tél non renseigné'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasWeb ? (
                          <span
                            className="text-[10px] font-body font-bold px-2 py-0.5 rounded-full"
                            style={{ color: scoreColor, backgroundColor: `${scoreColor}15` }}
                          >
                            Score {p.score}
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-body font-bold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.25)]">
                            Sans site
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-[#c5a059]" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[12px] font-body text-[rgba(232,228,220,0.4)]">
                  Aucun prospect ne correspond à &ldquo;{search}&rdquo;.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContractsPage() {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'wizard' | 'list'>('wizard');

  // Existing contracts list (persisted in session)
  const [contracts, setContracts] = useState<any[]>([]);

  // Wizard Step
  const [step, setStep] = useState(1);

  // Form State
  const [selectedProspectId, setSelectedProspectId] = useState('');
  const [clientData, setClientData] = useState({
    name: 'Dr. Amrani',
    company: 'Clinique Dentaire Signature',
    phone: '0550 12 34 56',
    country: 'Algeria',
    address: 'Hydra, Alger',
    activity: 'Dentisterie & Esthétique'
  });

  const [zone, setZone] = useState('DZ Local');
  const [baseProject, setBaseProject] = useState('vitrine');
  const [selectedModules, setSelectedModules] = useState<string[]>(['booking', 'multilang']);
  const [estHours, setEstHours] = useState(40);
  const [tranchesSplit, setTranchesSplit] = useState(2);
  const [timeline, setTimeline] = useState('2 semaines');
  const [warrantyDays, setWarrantyDays] = useState(30);

  // Gemini AI State
  const [customInstructions, setCustomInstructions] = useState('');
  const [aiLanguage, setAiLanguage] = useState<'fr' | 'ar' | 'en' | 'bilingual_fr_ar'>('fr');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  // Preview & Modal State
  const [previewContract, setPreviewContract] = useState<any | null>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 1. Auto-fill from URL query parameter (?prospectId=...) on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('prospectId') || params.get('id');
      if (pid) {
        setSelectedProspectId(pid);
        const p = mockProspects.find(mp => mp.id === pid);
        if (p) {
          setClientData({
            name: p.name || 'Responsable',
            company: p.company || 'Entreprise',
            phone: p.phone || '',
            country: p.notes?.includes('Zone:') ? (p.notes.split('Zone:')[1]?.trim() || 'Algeria') : 'Algeria',
            address: '',
            activity: p.sector || ''
          });
          addToast({ type: 'info', message: `Prospect ${p.company} préchargé avec succès.` });
        }
      }
    }
  }, [addToast]);

  // Derived Calculations
  const activeZone = useMemo(() => {
    return pricingConfig.marketZones.find(z => z.zone === zone) || pricingConfig.marketZones[0];
  }, [zone]);

  const pricingResult = useMemo(() => {
    return calculatePrice(baseProject, selectedModules, activeZone, pricingConfig);
  }, [baseProject, selectedModules, activeZone]);

  const profitability = useMemo(() => {
    if (!pricingResult) return null;
    return getProfitabilityEstimate(pricingResult.totalDA, estHours, pricingConfig);
  }, [pricingResult, estHours]);

  const currentSelectedProspect = useMemo(() => {
    return mockProspects.find(p => p.id === selectedProspectId) || null;
  }, [selectedProspectId]);

  const handleSelectProspect = (p: typeof mockProspects[0] | null) => {
    if (!p) {
      setSelectedProspectId('');
      setClientData({
        name: '',
        company: '',
        phone: '',
        country: 'Algeria',
        address: '',
        activity: ''
      });
      setAiData(null);
    } else {
      setSelectedProspectId(p.id);
      setClientData({
        name: p.name || 'Responsable',
        company: p.company || 'Entreprise',
        phone: p.phone || '',
        country: p.notes?.includes('Zone:') ? (p.notes.split('Zone:')[1]?.trim() || 'Algeria') : 'Algeria',
        address: '',
        activity: p.sector || ''
      });
      addToast({ type: 'info', message: `Prospect ${p.company} sélectionné.` });
    }
  };

  // 2. Call Gemini 3.8 Flash AI API for Contract Customization
  const handleGenerateAiContract = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/contract/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: clientData,
          prospect: currentSelectedProspect,
          project: {
            base: baseProject,
            modules: selectedModules,
            timeline,
            warrantyDays
          },
          pricing: {
            totalDA: pricingResult?.totalDA || 150000,
            currency: pricingResult?.currency || 'DA',
            totalForeign: pricingResult?.totalForeign || 0,
            tranchesSplit
          },
          customInstructions,
          language: aiLanguage
        })
      });

      const data = await res.json();
      if (data.success) {
        setAiData(data);
        addToast({ type: 'success', message: 'Cahier des charges et clauses juridiques générés par Gemini !' });
      } else {
        addToast({ type: 'info', message: 'Génération effectuée via le moteur déterministe.' });
      }
    } catch (err) {
      console.error('Erreur génération contrat IA:', err);
      addToast({ type: 'info', message: 'Clauses adaptées automatiquement.' });
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 3. Build Contract Object
  const buildContractData = (extraAiData?: any) => {
    const baseObj = pricingConfig.baseProjects.find(p => p.id === baseProject);
    const chosenAi = extraAiData || aiData;

    return {
      id: `CT-${Date.now()}`,
      ref: `SS-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      date: new Date().toLocaleDateString('fr-FR'),
      client: clientData,
      project: {
        title: chosenAi?.projectTitle || baseObj?.label || 'Plateforme Web & Logicielle',
        base: baseProject,
        modules: selectedModules,
        timeline,
        warrantyDays,
        description: chosenAi?.executiveSummary || ''
      },
      pricing: {
        ...pricingResult,
        tranchesSplit
      },
      languages: aiLanguage === 'bilingual_fr_ar' ? ['FR', 'EN', 'AR'] : [aiLanguage.toUpperCase()],
      timeline,
      hourlyRate: 2500,
      warrantyDays,
      aiData: chosenAi,
      status: 'pending_signature'
    };
  };

  const handleCreateContract = () => {
    const newContract = buildContractData();
    setContracts([newContract, ...contracts]);
    addToast({ type: 'success', message: 'Contrat généré et enregistré ! Prêt pour le client.' });
    setActiveTab('list');
  };

  const handleOpenPreview = (contractObj?: any) => {
    const c = contractObj || buildContractData();
    setPreviewContract(c);
  };

  // Direct Print / Export PDF using native browser print engine
  const handlePrintContract = (contractObj: any) => {
    const htmlContent = generateContractHTML(contractObj, pricingConfig);
    const printWindow = window.open('', '_blank', 'width=1024,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 400);
    } else {
      addToast({ type: 'error', message: 'Veuillez autoriser les fenêtres pop-up pour imprimer le contrat.' });
    }
  };

  const handleCopyPitch = (pitchText: string) => {
    navigator.clipboard.writeText(pitchText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
    addToast({ type: 'success', message: 'Pitch d\'accompagnement copié dans le presse-papier !' });
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] pb-16 pt-6 px-4 sm:px-6 max-w-[1580px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={16} className="text-[#c5a059]" />
            <span className="text-[11px] font-body font-medium uppercase tracking-[0.12em] text-[#c5a059]">
              LEGAL & TARIFICATION &bull; GEMINI 3.8 FLASH INTELLIGENCE
            </span>
          </div>
          <h1 className="font-display font-light text-[clamp(28px,3.5vw,42px)] text-[#e8e4dc] tracking-[-0.01em]">
            Générateur de Contrats & Devis
          </h1>
          <p className="text-[14px] font-body text-[rgba(232,228,220,0.55)] mt-1">
            Générez des accords commerciaux sur-mesure bilingues/trilingues, calculés au taux réel et enrichis par l&apos;IA.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#11111a] rounded-full p-[3px] border border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4 py-1.5 rounded-full text-[12px] font-body font-medium transition-colors cursor-pointer ${
              activeTab === 'wizard' ? 'bg-[#c5a059] text-[#0a0a12]' : 'text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]'
            }`}
          >
            Nouveau Devis / Contrat
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-1.5 rounded-full text-[12px] font-body font-medium transition-colors cursor-pointer ${
              activeTab === 'list' ? 'bg-[#c5a059] text-[#0a0a12]' : 'text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]'
            }`}
          >
            Contrats Actifs ({contracts.length})
          </button>
        </div>
      </div>

      {activeTab === 'wizard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-8">
          {/* Left Form: Steps */}
          <GlassPanel className="p-6 border-[rgba(255,255,255,0.08)]">
            {/* Step Indicators */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-[rgba(255,255,255,0.06)]">
              {[
                { n: 1, label: 'Client & IA' },
                { n: 2, label: 'Périmètre & Modules' },
                { n: 3, label: 'Zone & Tarifs' },
                { n: 4, label: 'Clauses & Clôture' }
              ].map(s => (
                <button
                  key={s.n}
                  onClick={() => setStep(s.n)}
                  className={`flex items-center gap-2 text-[12px] font-body transition-colors cursor-pointer ${
                    step === s.n ? 'text-[#c5a059] font-semibold' : 'text-[rgba(232,228,220,0.4)]'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                    step === s.n ? 'bg-[#c5a059] text-[#0a0a12]' : 'bg-[#141422] text-[rgba(232,228,220,0.5)]'
                  }`}>
                    {s.n}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              ))}
            </div>

            {/* STEP 1: CLIENT & GEMINI AI TRIGGER */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                {/* 1. Bespoke Quiet Luxury Prospect Selector Dropdown */}
                <ProspectSelectorDropdown
                  prospects={mockProspects}
                  selectedId={selectedProspectId}
                  onSelect={handleSelectProspect}
                />

                {/* 2. Bespoke Luxury Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LuxuryInput
                    label="Nom du Signataire"
                    icon={<User size={14} />}
                    value={clientData.name}
                    onChange={(val) => setClientData({ ...clientData, name: val })}
                    placeholder="Ex: Dr. Amrani, M. Benali..."
                  />

                  <LuxuryInput
                    label="Entreprise / Cabinet"
                    icon={<Building2 size={14} />}
                    value={clientData.company}
                    onChange={(val) => setClientData({ ...clientData, company: val })}
                    placeholder="Ex: Clinique Dentaire Signature..."
                  />

                  <LuxuryInput
                    label="Téléphone"
                    icon={<Phone size={14} />}
                    value={clientData.phone}
                    onChange={(val) => setClientData({ ...clientData, phone: val })}
                    placeholder="Ex: 0550 12 34 56 ou +966..."
                  />

                  <LuxuryInput
                    label="Activité / Niche"
                    icon={<Briefcase size={14} />}
                    value={clientData.activity}
                    onChange={(val) => setClientData({ ...clientData, activity: val })}
                    placeholder="Ex: Dentisterie, Logistique, Avocat..."
                  />
                </div>

                {/* 3. Gemini AI Optimization Card */}
                <div className="p-4 sm:p-5 rounded-[14px] bg-[#0c0c18] border border-[rgba(197,160,89,0.3)] shadow-[0_0_25px_rgba(197,160,89,0.08)] space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center text-[#c5a059]">
                        <Sparkles size={15} />
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-display font-medium text-[#e8e4dc]">
                          Assistant Légal & Technique Gemini 3.8 Flash
                        </h4>
                        <p className="text-[11px] font-body text-[rgba(232,228,220,0.5)]">
                          Génère automatiquement le cahier des charges et les clauses adaptées à ce client.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-[#141422] p-1 rounded-full border border-[rgba(255,255,255,0.06)] text-[10.5px] font-body">
                      {(['fr', 'ar', 'en', 'bilingual_fr_ar'] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setAiLanguage(l)}
                          className={`px-2.5 py-0.5 rounded-full uppercase transition-colors cursor-pointer ${
                            aiLanguage === l ? 'bg-[#c5a059] text-[#0a0a12] font-bold' : 'text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]'
                          }`}
                        >
                          {l === 'bilingual_fr_ar' ? 'FR/AR' : l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instructions input with luxury styling */}
                  <LuxuryInput
                    label="Consignes Spéciales pour Gemini (Optionnel)"
                    icon={<Sparkles size={13} />}
                    value={customInstructions}
                    onChange={setCustomInstructions}
                    placeholder="Ex: Paiement 50/50, maintenance mensuelle 15 000 DA, livraison express sous 10j..."
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-body text-[rgba(232,228,220,0.45)]">
                      {currentSelectedProspect ? (
                        hasValidWebsite(currentSelectedProspect.url) ? '🌐 Site web existant détecté (Refonte)' : '🚫 Sans site web (Création clé en main)'
                      ) : 'Mode saisie libre'}
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerateAiContract}
                      disabled={isAiGenerating}
                      className="px-4 py-2 rounded-[10px] bg-[rgba(197,160,89,0.18)] hover:bg-[rgba(197,160,89,0.3)] border border-[rgba(197,160,89,0.4)] text-[12.5px] font-body font-medium text-[#c5a059] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {isAiGenerating ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Génération en cours...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>{aiData ? 'Régénérer via Gemini' : 'Personnaliser avec Gemini'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Results preview banner if present */}
                  {aiData && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3.5 rounded-[10px] bg-[#141424] border border-[rgba(197,160,89,0.25)] text-[12px] font-body space-y-2"
                    >
                      <div className="flex items-center justify-between text-[#c5a059] font-medium">
                        <span className="truncate pr-2">★ {aiData.projectTitle}</span>
                        <span className="text-[10px] text-[#4ade80] uppercase tracking-wider font-mono flex-shrink-0">
                          Prêt pour le contrat
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[rgba(232,228,220,0.7)] line-clamp-2 leading-relaxed">
                        {aiData.executiveSummary}
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <AnimatedButton icon={<ChevronRight size={14} />} onClick={() => setStep(2)}>
                    Suivant : Périmètre & Modules
                  </AnimatedButton>
                </div>
              </motion.div>
            )}

            {/* STEP 2: MODULES */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-body text-[rgba(232,228,220,0.65)] uppercase tracking-[0.08em] mb-2.5">
                    Projet de Base
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {pricingConfig.baseProjects.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setBaseProject(p.id)}
                        className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
                          baseProject === p.id 
                            ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] text-[#e8e4dc] shadow-[0_0_20px_rgba(197,160,89,0.1)]' 
                            : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] text-[rgba(232,228,220,0.6)] hover:border-[rgba(255,255,255,0.15)]'
                        }`}
                      >
                        <div className="font-semibold text-[13px]">{p.label}</div>
                        <div className="text-[11.5px] text-[#c5a059] mt-0.5 font-medium">{p.baseDA.toLocaleString()} DA</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-body text-[rgba(232,228,220,0.65)] uppercase tracking-[0.08em] mb-2.5">
                    Modules Additionnels Spécialisés
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {pricingConfig.modules.map(m => {
                      const isSelected = selectedModules.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedModules(isSelected ? selectedModules.filter(id => id !== m.id) : [...selectedModules, m.id]);
                          }}
                          className={`p-3 rounded-[12px] border text-left text-[11.5px] transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[rgba(74,222,128,0.12)] border-[#4ade80] text-[#e8e4dc] shadow-[0_0_15px_rgba(74,222,128,0.1)]' 
                              : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] text-[rgba(232,228,220,0.55)] hover:border-[rgba(255,255,255,0.15)]'
                          }`}
                        >
                          <div className="font-medium">{m.label}</div>
                          <div className="text-[10px] text-[#c5a059] mt-0.5 font-medium">+{m.baseDA.toLocaleString()} DA</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="text-[12px] text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc] cursor-pointer">
                    Retour
                  </button>
                  <AnimatedButton icon={<ChevronRight size={14} />} onClick={() => setStep(3)}>
                    Suivant : Zone & Marché
                  </AnimatedButton>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ZONE & PRICING */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-body text-[rgba(232,228,220,0.65)] uppercase tracking-[0.08em] mb-2.5">
                    Zone Commerciale & Pouvoir d&apos;Achat
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {pricingConfig.marketZones.map(z => (
                      <button
                        key={z.zone}
                        type="button"
                        onClick={() => setZone(z.zone)}
                        className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
                          zone === z.zone 
                            ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] text-[#e8e4dc] shadow-[0_0_15px_rgba(197,160,89,0.1)]' 
                            : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] text-[rgba(232,228,220,0.6)] hover:border-[rgba(255,255,255,0.15)]'
                        }`}
                      >
                        <div className="font-semibold text-[12.5px]">{z.zone}</div>
                        <div className="text-[10.5px] text-[#c5a059] mt-0.5">Devise : {z.currency} (&times;{z.multiplier})</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  {/* Range Slider for Hours */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-body text-[rgba(232,228,220,0.65)] uppercase tracking-[0.08em]">
                        Heures de Dév Estimées
                      </label>
                      <span className="px-2.5 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059] font-mono text-[12px] font-semibold border border-[rgba(197,160,89,0.25)]">
                        {estHours}h
                      </span>
                    </div>
                    <div className="bg-[#0a0a14] p-3 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                      <input
                        type="range"
                        min={10}
                        max={120}
                        step={5}
                        value={estHours}
                        onChange={(e) => setEstHours(parseInt(e.target.value, 10))}
                        className="w-full accent-[#c5a059] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[rgba(232,228,220,0.35)] mt-1">
                        <span>10h (Sprint)</span>
                        <span>60h (Moyen)</span>
                        <span>120h (Complexe)</span>
                      </div>
                    </div>
                  </div>

                  {/* Bespoke Segmented Cards for Payment Tranches */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-body text-[rgba(232,228,220,0.65)] uppercase tracking-[0.08em] block">
                      Échelonnement du Paiement
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTranchesSplit(2)}
                        className={`p-3 rounded-[12px] border text-left transition-all cursor-pointer ${
                          tranchesSplit === 2
                            ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] text-[#e8e4dc] shadow-[0_0_15px_rgba(197,160,89,0.1)]'
                            : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] text-[rgba(232,228,220,0.55)] hover:border-[rgba(255,255,255,0.15)]'
                        }`}
                      >
                        <div className="font-semibold text-[12px] text-[#e8e4dc]">2 Tranches</div>
                        <div className="text-[10px] text-[#c5a059] mt-0.5">50% &bull; 50%</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTranchesSplit(3)}
                        className={`p-3 rounded-[12px] border text-left transition-all cursor-pointer ${
                          tranchesSplit === 3
                            ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] text-[#e8e4dc] shadow-[0_0_15px_rgba(197,160,89,0.1)]'
                            : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] text-[rgba(232,228,220,0.55)] hover:border-[rgba(255,255,255,0.15)]'
                        }`}
                      >
                        <div className="font-semibold text-[12px] text-[#e8e4dc]">3 Tranches</div>
                        <div className="text-[10px] text-[#c5a059] mt-0.5">40% &bull; 30% &bull; 30%</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(2)} className="text-[12px] text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc] cursor-pointer">
                    Retour
                  </button>
                  <AnimatedButton icon={<ChevronRight size={14} />} onClick={() => setStep(4)}>
                    Suivant : Clauses & Clôture
                  </AnimatedButton>
                </div>
              </motion.div>
            )}

            {/* STEP 4: GUARANTEES & FINALIZE */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Delivery Timeline Input + Quick presets */}
                  <div>
                    <LuxuryInput
                      label="Délai de Livraison Estimé"
                      icon={<Clock size={14} />}
                      value={timeline}
                      onChange={setTimeline}
                      placeholder="Ex: 2 semaines, 1 mois..."
                    />
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {['10j express', '2 semaines', '3 semaines', '1 mois'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTimeline(preset)}
                          className={`text-[10.5px] px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            timeline === preset
                              ? 'bg-[rgba(197,160,89,0.15)] border-[#c5a059] text-[#c5a059]'
                              : 'bg-[#141424] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warranty segmented cards */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-body text-[rgba(232,228,220,0.65)] uppercase tracking-[0.08em]">
                      <ShieldCheck size={14} className="text-[#c5a059]" />
                      <span>Garantie Technique Ponctuelle</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { days: 30, tag: 'Standard' },
                        { days: 60, tag: 'Recommandé' },
                        { days: 90, tag: 'VIP' }
                      ].map((w) => (
                        <button
                          key={w.days}
                          type="button"
                          onClick={() => setWarrantyDays(w.days)}
                          className={`p-2.5 rounded-[12px] border text-center transition-all cursor-pointer ${
                            warrantyDays === w.days
                              ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] text-[#e8e4dc] shadow-[0_0_15px_rgba(197,160,89,0.1)]'
                              : 'bg-[#0a0a14] border-[rgba(255,255,255,0.07)] text-[rgba(232,228,220,0.55)] hover:border-[rgba(255,255,255,0.15)]'
                          }`}
                        >
                          <div className="font-display font-medium text-[15px] text-[#e8e4dc]">{w.days}j</div>
                          <div className="text-[9.5px] uppercase font-bold text-[#c5a059] mt-0.5">{w.tag}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Clauses list if generated */}
                {aiData?.specialClauses?.length ? (
                  <div className="p-4 rounded-[12px] bg-[#0c0c18] border border-[rgba(197,160,89,0.25)] space-y-2.5">
                    <div className="font-semibold text-[#c5a059] text-[12.5px] flex items-center gap-1.5">
                      <Sparkles size={14} /> Clauses Spéciales Générées par Gemini :
                    </div>
                    {aiData.specialClauses.map((sc: any, idx: number) => (
                      <div key={idx} className="text-[12px] font-body text-[rgba(232,228,220,0.7)] border-l-2 border-[#c5a059] pl-3 py-0.5">
                        <strong className="text-[#e8e4dc]">{sc.title} :</strong> {sc.textFr}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-[12px] bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] text-[12px] font-body text-[rgba(232,228,220,0.7)] space-y-2">
                    <div className="font-semibold text-[#c5a059] flex items-center gap-1.5">
                      <FileCheck size={15} /> Clauses Incluses par Stepping Stones Agency :
                    </div>
                    <div>&bull; Transfert complet de propriété du code source après solde.</div>
                    <div>&bull; Optimisation Lighthouse &ge; 90 garantie sur Mobile & Desktop.</div>
                    <div>&bull; Hébergement et nom de domaine configurés clé en main.</div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <button onClick={() => setStep(3)} className="text-[12px] text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc] cursor-pointer">
                    Retour
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview()}
                      className="px-4 py-2 rounded-full border border-[rgba(197,160,89,0.3)] bg-[rgba(197,160,89,0.1)] text-[#c5a059] text-[12px] font-body font-medium hover:bg-[rgba(197,160,89,0.2)] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Visualiser le Contrat</span>
                    </button>
                    <AnimatedButton icon={<CheckCircle size={14} />} onClick={handleCreateContract}>
                      Enregistrer dans les Contrats
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            )}
          </GlassPanel>

          {/* Right Panel: Live Pricing Summary & Closing Pitch */}
          <div className="space-y-5">
            <GlassPanel className="p-6 border-[rgba(197,160,89,0.25)] sticky top-20">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)]">
                <div>
                  <span className="text-[10px] font-body uppercase tracking-wider text-[#c5a059]">PROPOSITION FINANCIÈRE</span>
                  <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">Devis en Temps Réel</h3>
                </div>
                <DollarSign size={20} className="text-[#c5a059]" />
              </div>

              {pricingResult && (
                <div className="mt-4 space-y-4">
                  <div className="bg-[#0a0a14] rounded-[12px] p-4 text-center border border-[rgba(255,255,255,0.07)]">
                    <div className="text-[11px] font-body text-[rgba(232,228,220,0.5)] uppercase tracking-wider">
                      Total Facturé
                    </div>
                    <div className="text-[32px] font-display font-bold text-[#c5a059] mt-1">
                      {pricingResult.totalDA.toLocaleString()} DA
                    </div>
                    {pricingResult.currency !== 'DA' && (
                      <div className="text-[14px] font-body text-[#4ade80] font-medium mt-0.5">
                        &asymp; {pricingResult.totalForeign.toLocaleString()} {pricingResult.currency}
                      </div>
                    )}
                  </div>

                  {/* Profitability */}
                  {profitability && (
                    <div className="p-3 bg-[#0a0a14] rounded-[12px] text-[12px] font-body space-y-1.5 border border-[rgba(255,255,255,0.06)]">
                      <div className="flex justify-between">
                        <span className="text-[rgba(232,228,220,0.55)]">Taux Horaire DZD :</span>
                        <span className="text-[#e8e4dc] font-semibold">{profitability.hourlyRateDA.toLocaleString()} DA/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[rgba(232,228,220,0.55)]">Taux Horaire USD :</span>
                        <span className="text-[#4ade80] font-semibold">{profitability.hourlyRateUSD} USD/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[rgba(232,228,220,0.55)]">Verdict Rentabilité :</span>
                        <span className={`font-semibold ${profitability.verdict === 'Excellent' ? 'text-[#4ade80]' : 'text-[#c5a059]'}`}>
                          {profitability.verdict}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tranches */}
                  <div className="text-[12px] font-body text-[rgba(232,228,220,0.6)] space-y-1 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="font-medium text-[#e8e4dc] mb-1">Échéancier ({tranchesSplit} tranches) :</div>
                    {tranchesSplit === 2 ? (
                      <>
                        <div className="flex justify-between"><span>Acompte à la commande (50%) :</span> <span className="font-semibold text-[#e8e4dc]">{(pricingResult.totalDA * 0.5).toLocaleString()} DA</span></div>
                        <div className="flex justify-between"><span>Solde à la mise en ligne (50%) :</span> <span className="font-semibold text-[#e8e4dc]">{(pricingResult.totalDA * 0.5).toLocaleString()} DA</span></div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between"><span>Acompte initial (40%) :</span> <span className="font-semibold text-[#e8e4dc]">{(pricingResult.totalDA * 0.4).toLocaleString()} DA</span></div>
                        <div className="flex justify-between"><span>Validation maquettes (30%) :</span> <span className="font-semibold text-[#e8e4dc]">{(pricingResult.totalDA * 0.3).toLocaleString()} DA</span></div>
                        <div className="flex justify-between"><span>Livraison finale (30%) :</span> <span className="font-semibold text-[#e8e4dc]">{(pricingResult.totalDA * 0.3).toLocaleString()} DA</span></div>
                      </>
                    )}
                  </div>

                  {/* Closing Pitch Box (Instant WhatsApp/Email copy) */}
                  {aiData?.closingPitch && (
                    <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-body text-[#c5a059] font-medium">
                        <span className="flex items-center gap-1"><MessageSquare size={13} /> Pitch de Closing WhatsApp :</span>
                        <button
                          onClick={() => handleCopyPitch(aiData.closingPitch)}
                          className="hover:underline flex items-center gap-1 text-[10px] text-[#e8e4dc] cursor-pointer"
                        >
                          {copiedPitch ? <Check size={11} className="text-[#4ade80]" /> : <Copy size={11} />}
                          <span>{copiedPitch ? 'Copié' : 'Copier'}</span>
                        </button>
                      </div>
                      <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.65)] bg-[#0a0a14] p-3 rounded-[10px] border border-[rgba(255,255,255,0.06)] leading-relaxed italic">
                        &ldquo;{aiData.closingPitch}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      ) : (
        /* Contracts List */
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <GlassPanel className="p-12 text-center">
              <FileText size={32} className="mx-auto text-[rgba(232,228,220,0.3)] mb-3" />
              <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">Aucun contrat actif</h3>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.5)] mt-1 max-w-[400px] mx-auto">
                Générez votre premier contrat ou devis officiel en utilisant le formulaire assisté par Gemini.
              </p>
              <div className="mt-4">
                <AnimatedButton icon={<Plus size={14} />} onClick={() => setActiveTab('wizard')}>
                  Créer un Devis
                </AnimatedButton>
              </div>
            </GlassPanel>
          ) : (
            contracts.map((c) => (
              <GlassPanel key={c.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-[#c5a059]">{c.ref}</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059] border border-[rgba(197,160,89,0.25)]">
                      Prêt pour signature
                    </span>
                    {c.aiData && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.25)] flex items-center gap-1">
                        <Sparkles size={10} /> Optimisé IA
                      </span>
                    )}
                  </div>
                  <h4 className="font-display text-[18px] text-[#e8e4dc] mt-1.5">{c.client.company} ({c.client.name})</h4>
                  <div className="text-[12px] text-[rgba(232,228,220,0.5)] mt-0.5">
                    Projet : {c.project.title} &bull; Délai : {c.project.timeline} &bull; Garantie : {c.project.warrantyDays} jours
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[20px] font-display font-semibold text-[#c5a059]">
                      {c.pricing.totalDA.toLocaleString()} DA
                    </div>
                    {c.pricing.currency !== 'DA' && (
                      <div className="text-[12px] text-[#4ade80]">
                        &asymp; {c.pricing.totalForeign.toLocaleString()} {c.pricing.currency}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPreview(c)}
                      className="h-9 px-3 rounded-[8px] bg-[#141424] hover:bg-[#1c1c32] border border-[rgba(255,255,255,0.08)] text-[11.5px] font-body text-[#e8e4dc] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Visualiser"
                    >
                      <Eye size={13} className="text-[#60a5fa]" />
                      <span>Visualiser</span>
                    </button>
                    <button
                      onClick={() => handlePrintContract(c)}
                      className="h-9 px-3.5 rounded-[8px] bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] border border-[rgba(197,160,89,0.3)] text-[11.5px] font-body text-[#c5a059] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Imprimer ou enregistrer en PDF"
                    >
                      <Printer size={13} />
                      <span>Imprimer / PDF</span>
                    </button>
                    <button
                      onClick={() => setContracts(contracts.filter(ct => ct.id !== c.id))}
                      className="h-9 w-9 rounded-[8px] bg-[#141424] hover:bg-[rgba(239,68,68,0.2)] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.5)] hover:text-[#f87171] flex items-center justify-center transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </GlassPanel>
            ))
          )}
        </div>
      )}

      {/* Contract HTML Live Preview Modal */}
      <AnimatePresence>
        {previewContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[rgba(5,5,9,0.85)] backdrop-blur-[12px]"
              onClick={() => setPreviewContract(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[1020px] h-[92vh] bg-[#0c0c16] border border-[rgba(197,160,89,0.3)] rounded-[20px] shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              {/* Modal Bar */}
              <div className="p-4 sm:px-6 border-b border-[rgba(255,255,255,0.06)] bg-[#0f0f1c] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center text-[#c5a059]">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-[17px] text-[#e8e4dc]">
                      Aperçu Officiel &bull; {previewContract.client.company}
                    </h3>
                    <p className="text-[11px] font-body text-[rgba(232,228,220,0.5)]">
                      Réf. {previewContract.ref} &bull; {previewContract.pricing.totalDA.toLocaleString()} DA
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {previewContract.aiData?.closingPitch && (
                    <button
                      onClick={() => handleCopyPitch(previewContract.aiData.closingPitch)}
                      className="px-3 py-1.5 rounded-[8px] bg-[#141424] hover:bg-[#1c1c32] border border-[rgba(255,255,255,0.08)] text-[12px] font-body text-[#e8e4dc] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare size={13} className="text-[#c5a059]" />
                      <span>Copier Pitch</span>
                    </button>
                  )}

                  <button
                    onClick={() => handlePrintContract(previewContract)}
                    className="px-3.5 py-1.5 rounded-[8px] bg-[#c5a059] hover:bg-[#d4b16a] text-[#0a0a12] text-[12px] font-body font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
                  >
                    <Printer size={13} />
                    <span>Imprimer / PDF</span>
                  </button>

                  <button
                    onClick={() => setPreviewContract(null)}
                    className="w-8 h-8 rounded-full bg-[#141424] hover:bg-[#202036] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Rendered HTML inside iframe for exact CSS fidelity */}
              <div className="flex-1 bg-[#1a1a24] p-2 overflow-hidden">
                <iframe
                  ref={iframeRef}
                  title="Aperçu Contrat"
                  srcDoc={generateContractHTML(previewContract, pricingConfig)}
                  className="w-full h-full rounded-[12px] bg-white border-none shadow-inner"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
