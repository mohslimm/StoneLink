"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, ShieldCheck, Printer, Download, CheckCircle, 
  DollarSign, Globe, Clock, ChevronRight, ChevronLeft, ArrowRight,
  User, Building, Sparkles, Layers, FileCheck
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

export default function ContractsPage() {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'wizard' | 'list'>('wizard');

  // Existing contracts list
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

  // Auto-fill from selected prospect
  useEffect(() => {
    if (selectedProspectId) {
      const p = mockProspects.find(mp => mp.id === selectedProspectId);
      if (p) {
        setClientData({
          name: p.name || 'Responsable',
          company: p.company || 'Entreprise',
          phone: p.phone || '',
          country: p.notes?.includes('Zone:') ? (p.notes.split('Zone:')[1]?.trim() || 'Algeria') : 'Algeria',
          address: '',
          activity: p.sector || ''
        });
      }
    }
  }, [selectedProspectId]);

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

  const handleCreateContract = () => {
    const newContract = {
      id: `CT-${Date.now()}`,
      ref: `SS-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      date: new Date().toLocaleDateString('fr-FR'),
      client: clientData,
      project: {
        base: baseProject,
        modules: selectedModules,
        timeline,
        warrantyDays
      },
      pricing: pricingResult,
      status: 'pending_signature'
    };

    setContracts([newContract, ...contracts]);
    addToast({ type: 'success', message: 'Contrat généré et enregistré ! Prêt pour le Sovereign Vault.' });
    setActiveTab('list');
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] pb-12 pt-6 px-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={16} className="text-[#c5a059]" />
            <span className="text-[11px] font-body font-medium uppercase tracking-[0.1em] text-[#c5a059]">
              LEGAL & TARIFICATION DZD / GLOBAL
            </span>
          </div>
          <h1 className="font-display font-light text-[clamp(32px,4vw,44px)] text-[#e8e4dc] tracking-[-0.01em]">
            Générateur de Contrats & Devis
          </h1>
          <p className="text-[14px] font-body text-[rgba(232,228,220,0.55)] mt-1">
            Calculateur dynamique selon le taux de change du Square Port-Saïd et clauses juridiques de livraison.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#11111a] rounded-full p-[3px] border border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4 py-1.5 rounded-full text-[12px] font-body font-medium transition-colors ${
              activeTab === 'wizard' ? 'bg-[#c5a059] text-[#0a0a12]' : 'text-[rgba(232,228,220,0.6)]'
            }`}
          >
            Nouveau Devis / Contrat
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-1.5 rounded-full text-[12px] font-body font-medium transition-colors ${
              activeTab === 'list' ? 'bg-[#c5a059] text-[#0a0a12]' : 'text-[rgba(232,228,220,0.6)]'
            }`}
          >
            Contrats Actifs ({contracts.length})
          </button>
        </div>
      </div>

      {activeTab === 'wizard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
          {/* Left Form: Steps */}
          <GlassPanel className="p-6">
            {/* Step Indicators */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-[rgba(255,255,255,0.06)]">
              {[
                { n: 1, label: 'Client' },
                { n: 2, label: 'Périmètre & Modules' },
                { n: 3, label: 'Zone & Tarifs' },
                { n: 4, label: 'Garanties & Clôture' }
              ].map(s => (
                <button
                  key={s.n}
                  onClick={() => setStep(s.n)}
                  className={`flex items-center gap-2 text-[12px] font-body transition-colors ${
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

            {/* STEP 1: CLIENT */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-1.5">
                    Sélectionner un prospect existant (Optionnel)
                  </label>
                  <select
                    value={selectedProspectId}
                    onChange={(e) => setSelectedProspectId(e.target.value)}
                    className="w-full h-11 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[13px] text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="">Saisie manuelle d'un nouveau client...</option>
                    {mockProspects.slice(0, 30).map(p => (
                      <option key={p.id} value={p.id}>{p.company} ({p.name})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-1.5">
                      Nom du Signataire
                    </label>
                    <input
                      type="text"
                      value={clientData.name}
                      onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                      className="w-full h-10 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[13px] text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-1.5">
                      Entreprise / Cabinet
                    </label>
                    <input
                      type="text"
                      value={clientData.company}
                      onChange={(e) => setClientData({ ...clientData, company: e.target.value })}
                      className="w-full h-10 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[13px] text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={clientData.phone}
                      onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                      className="w-full h-10 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[13px] text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-1.5">
                      Pays / Région
                    </label>
                    <input
                      type="text"
                      value={clientData.country}
                      onChange={(e) => setClientData({ ...clientData, country: e.target.value })}
                      className="w-full h-10 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[13px] text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
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
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-2">
                    Projet de Base
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pricingConfig.baseProjects.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setBaseProject(p.id)}
                        className={`p-3 rounded-[8px] border text-left transition-all ${
                          baseProject === p.id 
                            ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] text-[#e8e4dc]' 
                            : 'bg-[#11111a] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.6)] hover:border-[rgba(255,255,255,0.15)]'
                        }`}
                      >
                        <div className="font-semibold text-[13px]">{p.label}</div>
                        <div className="text-[11px] text-[#c5a059] mt-0.5">{p.baseDA.toLocaleString()} DA</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-2">
                    Modules Additionnels
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pricingConfig.modules.map(m => {
                      const isSelected = selectedModules.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedModules(isSelected ? selectedModules.filter(id => id !== m.id) : [...selectedModules, m.id]);
                          }}
                          className={`p-2.5 rounded-[8px] border text-left text-[11px] transition-all ${
                            isSelected 
                              ? 'bg-[rgba(74,222,128,0.1)] border-[#4ade80] text-[#e8e4dc]' 
                              : 'bg-[#11111a] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.5)]'
                          }`}
                        >
                          <div className="font-medium">{m.label}</div>
                          <div className="text-[10px] text-[rgba(232,228,220,0.4)] mt-0.5">+{m.baseDA.toLocaleString()} DA</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="text-[12px] text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]">
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
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-2">
                    Zone Commerciale & Pouvoir d'Achat
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pricingConfig.marketZones.map(z => (
                      <button
                        key={z.zone}
                        type="button"
                        onClick={() => setZone(z.zone)}
                        className={`p-3 rounded-[8px] border text-left transition-all ${
                          zone === z.zone 
                            ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] text-[#e8e4dc]' 
                            : 'bg-[#11111a] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.6)]'
                        }`}
                      >
                        <div className="font-semibold text-[12px]">{z.zone}</div>
                        <div className="text-[10px] text-[#c5a059] mt-0.5">Devise: {z.currency} (×{z.multiplier})</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-1.5">
                      Heures de dév estimées ({estHours}h)
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={5}
                      value={estHours}
                      onChange={(e) => setEstHours(parseInt(e.target.value, 10))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-1.5">
                      Échelonnement Paiement
                    </label>
                    <select
                      value={tranchesSplit}
                      onChange={(e) => setTranchesSplit(parseInt(e.target.value, 10))}
                      className="w-full h-10 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[13px] text-[#e8e4dc]"
                    >
                      <option value={2}>50% Acompte / 50% Livraison</option>
                      <option value={3}>40% Acompte / 30% Mi-projet / 30% Clôture</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(2)} className="text-[12px] text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]">
                    Retour
                  </button>
                  <AnimatedButton icon={<ChevronRight size={14} />} onClick={() => setStep(4)}>
                    Suivant : Finalisation
                  </AnimatedButton>
                </div>
              </motion.div>
            )}

            {/* STEP 4: GUARANTEES */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-1.5">
                      Délai de Livraison
                    </label>
                    <input
                      type="text"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full h-10 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[13px] text-[#e8e4dc]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body text-[rgba(232,228,220,0.6)] uppercase tracking-wider mb-1.5">
                      Garantie & Support Gratuit
                    </label>
                    <select
                      value={warrantyDays}
                      onChange={(e) => setWarrantyDays(parseInt(e.target.value, 10))}
                      className="w-full h-10 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[13px] text-[#e8e4dc]"
                    >
                      <option value={30}>30 jours de garantie</option>
                      <option value={60}>60 jours de garantie</option>
                      <option value={90}>90 jours de garantie</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-[10px] bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] text-[12px] font-body text-[rgba(232,228,220,0.7)] space-y-2">
                  <div className="font-semibold text-[#c5a059] flex items-center gap-1.5">
                    <FileCheck size={15} /> Clauses Incluses par Stepping Stones Agency :
                  </div>
                  <div>• Transfert complet de propriété du code source après solde.</div>
                  <div>• Optimisation Lighthouse $\ge 90$ garantie sur Mobile & Desktop.</div>
                  <div>• Hébergement et nom de domaine configurés clé en main.</div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(3)} className="text-[12px] text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]">
                    Retour
                  </button>
                  <AnimatedButton icon={<CheckCircle size={14} />} onClick={handleCreateContract}>
                    Générer le Contrat Officiel
                  </AnimatedButton>
                </div>
              </motion.div>
            )}
          </GlassPanel>

          {/* Right Panel: Live Pricing Summary & Margins */}
          <GlassPanel className="p-6 h-fit sticky top-20 border-[rgba(197,160,89,0.25)]">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)]">
              <div>
                <span className="text-[10px] font-body uppercase tracking-wider text-[#c5a059]">PROPOSITION FINANCIÈRE</span>
                <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">Devis en Temps Réel</h3>
              </div>
              <DollarSign size={20} className="text-[#c5a059]" />
            </div>

            {pricingResult && (
              <div className="mt-4 space-y-4">
                <div className="bg-[#11111a] rounded-[10px] p-4 text-center border border-[rgba(255,255,255,0.06)]">
                  <div className="text-[11px] font-body text-[rgba(232,228,220,0.5)] uppercase tracking-wider">
                    Total Facturé
                  </div>
                  <div className="text-[32px] font-display font-bold text-[#c5a059] mt-1">
                    {pricingResult.totalDA.toLocaleString()} DA
                  </div>
                  {pricingResult.currency !== 'DA' && (
                    <div className="text-[14px] font-body text-[#4ade80] font-medium mt-0.5">
                      ≈ {pricingResult.totalForeign.toLocaleString()} {pricingResult.currency}
                    </div>
                  )}
                </div>

                {/* Profitability */}
                {profitability && (
                  <div className="p-3 bg-[#11111a] rounded-[10px] text-[12px] font-body space-y-1.5 border border-[rgba(255,255,255,0.05)]">
                    <div className="flex justify-between">
                      <span className="text-[rgba(232,228,220,0.55)]">Taux Horaire DZD :</span>
                      <span className="text-[#e8e4dc] font-semibold">{profitability.hourlyRateDA.toLocaleString()} DA/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgba(232,228,220,0.55)]">Taux Horaire USD :</span>
                      <span className="text-[#4ade80] font-semibold">${profitability.hourlyRateUSD}/h</span>
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
              </div>
            )}
          </GlassPanel>
        </div>
      ) : (
        /* Contracts List */
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <GlassPanel className="p-12 text-center">
              <FileText size={32} className="mx-auto text-[rgba(232,228,220,0.3)] mb-3" />
              <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">Aucun contrat actif</h3>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.5)] mt-1 max-w-[400px] mx-auto">
                Générez votre premier devis ou contrat client en utilisant le formulaire ci-dessus.
              </p>
              <div className="mt-4">
                <AnimatedButton icon={<Plus size={14} />} onClick={() => setActiveTab('wizard')}>
                  Créer un Devis
                </AnimatedButton>
              </div>
            </GlassPanel>
          ) : (
            contracts.map(c => (
              <GlassPanel key={c.id} className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#c5a059]">{c.ref}</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059]">
                      En attente de signature
                    </span>
                  </div>
                  <h4 className="font-display text-[18px] text-[#e8e4dc] mt-1">{c.client.company} ({c.client.name})</h4>
                  <div className="text-[12px] text-[rgba(232,228,220,0.5)] mt-0.5">Délai : {c.project.timeline} | Garantie : {c.project.warrantyDays} jours</div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-display font-semibold text-[#c5a059]">{c.pricing.totalDA.toLocaleString()} DA</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="text-[11px] text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] flex items-center gap-1">
                      <Printer size={12} /> Imprimer
                    </button>
                    <button className="text-[11px] text-[#c5a059] hover:underline flex items-center gap-1">
                      <Download size={12} /> Télécharger PDF
                    </button>
                  </div>
                </div>
              </GlassPanel>
            ))
          )}
        </div>
      )}
    </div>
  );
}
